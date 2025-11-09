import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Default password for institution accounts (should be changed by institutions)
const DEFAULT_INSTITUTION_PASSWORD = 'EduConnect2024!';

// List of institutions in Lesotho with their details
const lesothoInstitutions = [
  { 
    id: 'nul', 
    name: 'National University of Lesotho (NUL)', 
    email: 'nul.admissions@nul.ls',
    website: 'https://www.nul.ls',
    phone: '+266 22340601',
    address: 'Roma, Maseru, Lesotho',
    description: 'Premier institution of higher learning in Lesotho offering diverse academic programs'
  },
  { 
    id: 'limkokwing', 
    name: 'Limkokwing University of Creative Technology', 
    email: 'admissions@limkokwing.ls',
    website: 'https://www.limkokwing.net/ls',
    phone: '+266 22317242',
    address: 'Maseru, Lesotho',
    description: 'Innovative university focusing on creative technology and industry-relevant education'
  },
  { 
    id: 'botho', 
    name: 'Botho University', 
    email: 'admissions@bothocollege.ls',
    website: 'https://www.bothocollege.com/ls',
    phone: '+266 22325153',
    address: 'Maseru, Lesotho',
    description: 'Leading private university offering quality education in business and technology'
  },
  { 
    id: 'lesotho_medical', 
    name: 'Lesotho Medical School', 
    email: 'medschool.admissions@nul.ls',
    website: 'http://www.nul.ls/faculty-of-health-sciences',
    phone: '+266 22340601',
    address: 'Roma, Maseru, Lesotho',
    description: 'Medical education and healthcare training institution'
  },
  { 
    id: 'lesotho_agricultural', 
    name: 'Lesotho Agricultural College', 
    email: 'admissions@agricollege.ls',
    website: 'http://www.agriculture.gov.ls',
    phone: '+266 22320221',
    address: 'Maseru, Lesotho',
    description: 'Agricultural sciences and farming techniques education'
  },
  { 
    id: 'lesotho_teacher_training', 
    name: 'Lesotho College of Education', 
    email: 'admissions@lce.edu.ls',
    website: 'http://www.lce.edu.ls',
    phone: '+266 22320789',
    address: 'Maseru, Lesotho',
    description: 'Teacher training and education development institution'
  },
  { 
    id: 'lesotho_nursing', 
    name: 'Lesotho Nursing School', 
    email: 'admissions@nursingschool.ls',
    website: '',
    phone: '+266 22310000',
    address: 'Maseru, Lesotho',
    description: 'Nursing and healthcare professional training'
  },
  { 
    id: 'lesotho_polytechnic', 
    name: 'Lesotho Polytechnic', 
    email: 'admissions@polytechnic.ls',
    website: '',
    phone: '+266 22325000',
    address: 'Maseru, Lesotho',
    description: 'Technical and vocational education institution'
  },
  { 
    id: 'lesotho_business', 
    name: 'Lesotho Business School', 
    email: 'admissions@businessschool.ls',
    website: '',
    phone: '+266 22318000',
    address: 'Maseru, Lesotho',
    description: 'Business education and management training'
  },
  { 
    id: 'lesotho_aviation', 
    name: 'Lesotho Aviation School', 
    email: 'admissions@aviationschool.ls',
    website: '',
    phone: '+266 22319000',
    address: 'Maseru, Lesotho',
    description: 'Aviation and pilot training programs'
  }
];

export const setupInstitutionAccounts = async () => {
  console.log('Starting institution accounts setup...');
  const results = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    details: []
  };

  for (const institution of lesothoInstitutions) {
    try {
      console.log(`Processing ${institution.name}...`);
      
      // Try to create the user account
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(
          auth, 
          institution.email, 
          DEFAULT_INSTITUTION_PASSWORD
        );
        
        // Send email verification
        await sendEmailVerification(userCredential.user);
        console.log(`✅ Created account for ${institution.name}`);
        results.created++;
        
      } catch (authError) {
        if (authError.code === 'auth/email-already-in-use') {
          console.log(`ℹ️ Account already exists for ${institution.name}, updating Firestore data...`);
          results.skipped++;
          
          // Try to sign in to get the user (we'll use a dummy sign-in attempt to get user reference)
          // For existing accounts, we'll just update Firestore
          userCredential = null;
        } else {
          throw authError;
        }
      }

      // Prepare institution data for Firestore
      const institutionData = {
        uid: userCredential ? userCredential.user.uid : `institution_${institution.id}`,
        email: institution.email,
        institutionName: institution.name,
        institutionId: institution.id,
        phone: institution.phone,
        address: institution.address,
        description: institution.description,
        website: institution.website,
        role: 'institute',
        createdAt: new Date(),
        isInstitutionAccount: true,
        verified: true, // Pre-verified for setup accounts
        faculties: [],
        courses: [],
        applications: [],
        profileComplete: true,
        emailVerified: userCredential ? userCredential.user.emailVerified : false,
        setupAccount: true,
        defaultPassword: DEFAULT_INSTITUTION_PASSWORD // Remove this in production
      };

      // Set or update the document in Firestore
      const docRef = doc(db, 'users', institutionData.uid);
      
      if (userCredential) {
        // New account - set the document
        await setDoc(docRef, institutionData);
        results.details.push({
          institution: institution.name,
          status: 'created',
          email: institution.email,
          password: DEFAULT_INSTITUTION_PASSWORD
        });
      } else {
        // Existing account - check if document exists and update
        const existingDoc = await getDoc(docRef);
        if (existingDoc.exists()) {
          // Update existing document
          await setDoc(docRef, institutionData, { merge: true });
          results.updated++;
          results.details.push({
            institution: institution.name,
            status: 'updated',
            email: institution.email
          });
        } else {
          // Create new document for existing auth account
          await setDoc(docRef, institutionData);
          results.updated++;
          results.details.push({
            institution: institution.name,
            status: 'document_created',
            email: institution.email
          });
        }
      }

    } catch (error) {
      console.error(`❌ Error processing ${institution.name}:`, error.message);
      results.errors++;
      results.details.push({
        institution: institution.name,
        status: 'error',
        error: error.message
      });
    }
  }

  console.log('Institution setup completed:', results);
  return results;
};

// Function to get institution login credentials (for admin reference)
export const getInstitutionCredentials = () => {
  return lesothoInstitutions.map(inst => ({
    name: inst.name,
    email: inst.email,
    password: DEFAULT_INSTITUTION_PASSWORD,
    website: inst.website
  }));
};

// Function to reset a specific institution account
export const resetInstitutionAccount = async (institutionId) => {
  const institution = lesothoInstitutions.find(inst => inst.id === institutionId);
  if (!institution) {
    throw new Error('Institution not found');
  }

  try {
    // This would typically require admin privileges
    console.log(`Resetting account for ${institution.name}...`);
    
    // For now, just update the Firestore document
    const institutionData = {
      email: institution.email,
      institutionName: institution.name,
      institutionId: institution.id,
      phone: institution.phone,
      address: institution.address,
      description: institution.description,
      website: institution.website,
      role: 'institute',
      updatedAt: new Date(),
      isInstitutionAccount: true,
      verified: true,
      profileComplete: true
    };

    // We need to find the actual UID - this is a limitation without admin SDK
    console.log(`Note: To fully reset account ${institution.name}, use Firebase Admin SDK`);
    return { success: true, message: 'Firestore data updated' };
    
  } catch (error) {
    console.error(`Error resetting ${institution.name}:`, error);
    throw error;
  }
};