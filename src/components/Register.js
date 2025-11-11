import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const Register = ({ onSwitchToLogin, onLogin }) => {
  // List of major institutions in Lesotho
  const lesothoInstitutions = [
    { id: 'nul', name: 'National University of Lesotho (NUL)' },
    { id: 'limkokwing', name: 'Limkokwing University of Creative Technology' },
    { id: 'botho', name: 'Botho University' },
    { id: 'lesotho_medical', name: 'Lesotho Medical School' },
    { id: 'lesotho_agricultural', name: 'Lesotho Agricultural College' },
    { id: 'lesotho_teacher_training', name: 'Lesotho College of Education' },
    { id: 'lesotho_nursing', name: 'Lesotho Nursing School' },
    { id: 'lesotho_polytechnic', name: 'Lesotho Polytechnic' },
    { id: 'lesotho_business', name: 'Lesotho Business School' },
    { id: 'lesotho_aviation', name: 'Lesotho Aviation School' },
    { id: 'lesotho_hospitality', name: 'Lesotho Hospitality Training Institute' },
    { id: 'lesotho_technical', name: 'Lesotho Technical College' },
    { id: 'lesotho_computer', name: 'Lesotho Computer College' },
    { id: 'lesotho_development', name: 'Lesotho Development College' },
    { id: 'other', name: 'Other Institution' }
  ];

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    name: '',
    institutionName: '',
    companyName: '',
    selectedInstitution: '',
    phone: '',
    address: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Add the missing storeUserData function
  const storeUserData = (userId, userData) => {
    // Store user role in localStorage
    localStorage.setItem(`userRole_${userId}`, userData.role);
    
    // For institutions, store additional info
    if (userData.role === 'institute') {
      localStorage.setItem(`instituteData_${userId}`, JSON.stringify({
        name: userData.institutionName,
        email: userData.email,
        id: userId
      }));
    }
    
    // For students, store student data
    if (userData.role === 'student') {
      localStorage.setItem(`studentData_${userId}`, JSON.stringify({
        name: userData.name,
        email: userData.email,
        id: userId
      }));
    }
    
    // For companies, store company data
    if (userData.role === 'company') {
      localStorage.setItem(`companyData_${userId}`, JSON.stringify({
        name: userData.companyName,
        email: userData.email,
        id: userId
      }));
    }
    
    // Store basic user info in localStorage for quick access
    localStorage.setItem('currentUser', JSON.stringify({
      uid: userId,
      email: userData.email,
      role: userData.role,
      name: userData.name || userData.institutionName || userData.companyName || 'User'
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // If institution is selected from dropdown, auto-fill the institution name
    if (name === 'selectedInstitution' && value !== 'other') {
      const selectedInst = lesothoInstitutions.find(inst => inst.id === value);
      if (selectedInst) {
        setFormData(prev => ({
          ...prev,
          institutionName: selectedInst.name,
          selectedInstitution: value
        }));
      }
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user already exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        // User already exists, redirect to login
        setError('An account with this Google email already exists. Please login instead.');
        return;
      }

      // Create user profile based on selected role
      await createGoogleUserProfile(user);

    } catch (error) {
      console.error('Google Sign-Up error:', error);
      handleGoogleError(error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const createGoogleUserProfile = async (user) => {
    let userData = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || 'Google User',
      role: formData.role,
      createdAt: new Date(),
      profileComplete: false,
      emailVerified: user.emailVerified,
      isGoogleAccount: true,
      applications: []
    };

    // Add role-specific fields
    switch (formData.role) {
      case 'student':
        userData = {
          ...userData,
          phone: formData.phone || '',
          address: formData.address || '',
          documents: {
            resume: null,
            transcripts: null,
            certificates: null
          },
          studentMarks: {
            mathematics: '',
            english: '',
            science: '',
            overall: ''
          }
        };
        break;
      case 'institute':
        userData = {
          ...userData,
          institutionName: formData.institutionName || user.displayName || 'Educational Institution',
          institutionId: formData.selectedInstitution || 'custom',
          phone: formData.phone || '',
          address: formData.address || '',
          description: formData.description || '',
          isInstitutionAccount: true,
          faculties: [],
          courses: [],
          verified: false,
          profileComplete: false
        };
        break;
      case 'company':
        userData = {
          ...userData,
          companyName: formData.companyName || user.displayName || 'Company',
          phone: formData.phone || '',
          address: formData.address || '',
          description: formData.description || '',
          jobPostings: [],
          approved: false,
          profileComplete: false
        };
        break;
      case 'admin':
        userData = {
          ...userData,
          name: formData.name || user.displayName || 'Administrator',
          permissions: ['all']
        };
        break;
    }

    await setDoc(doc(db, 'users', user.uid), userData);
    
    // Store user data in localStorage
    storeUserData(user.uid, userData);
    
    setSuccess(`Google account registration successful! Welcome ${userData.name || user.displayName}.`);
    
    if (onLogin) {
      setTimeout(() => {
        onLogin(formData.role);
      }, 2000);
    }
  };

  const handleGoogleError = (error) => {
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        setError('Google sign-up was cancelled.');
        break;
      case 'auth/popup-blocked':
        setError('Popup was blocked by your browser. Please allow popups for this site.');
        break;
      case 'auth/unauthorized-domain':
        setError('This domain is not authorized for Google sign-in.');
        break;
      case 'auth/network-request-failed':
        setError('Network error. Please check your internet connection.');
        break;
      default:
        setError('Google sign-up failed. Please try again.');
    }
  };

  // Enhanced institution registration function
  const registerInstitution = async (institutionData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        institutionData.email, 
        institutionData.password
      );
      
      const userData = {
        uid: userCredential.user.uid,
        email: institutionData.email,
        institutionName: institutionData.institutionName,
        institutionId: institutionData.selectedInstitution || 'custom',
        phone: institutionData.phone,
        address: institutionData.address,
        description: institutionData.description,
        role: 'institute',
        createdAt: new Date(),
        isInstitutionAccount: true,
        faculties: [],
        courses: [],
        applications: [],
        profileComplete: false,
        verified: false,
        emailVerified: false
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      
      // Store user data
      storeUserData(userCredential.user.uid, userData);
      
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // Enhanced student registration function
  const registerStudent = async (studentData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        studentData.email, 
        studentData.password
      );
      
      const userData = {
        uid: userCredential.user.uid,
        email: studentData.email,
        name: studentData.name,
        phone: studentData.phone,
        address: studentData.address,
        role: 'student',
        createdAt: new Date(),
        applications: [],
        documents: {
          resume: null,
          transcripts: null,
          certificates: null
        },
        profileComplete: false,
        emailVerified: false,
        studentMarks: {
          mathematics: '',
          english: '',
          science: '',
          overall: ''
        }
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      
      // Store user data
      storeUserData(userCredential.user.uid, userData);
      
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // Enhanced company registration function
  const registerCompany = async (companyData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        companyData.email, 
        companyData.password
      );
      
      const userData = {
        uid: userCredential.user.uid,
        email: companyData.email,
        companyName: companyData.companyName,
        phone: companyData.phone,
        address: companyData.address,
        description: companyData.description,
        role: 'company',
        createdAt: new Date(),
        jobPostings: [],
        approved: false,
        emailVerified: false
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      
      // Store user data
      storeUserData(userCredential.user.uid, userData);
      
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // Enhanced admin registration function
  const registerAdmin = async (adminData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        adminData.email, 
        adminData.password
      );
      
      const userData = {
        uid: userCredential.user.uid,
        email: adminData.email,
        name: adminData.name,
        role: 'admin',
        createdAt: new Date(),
        permissions: ['all'],
        emailVerified: false
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      
      // Store user data
      storeUserData(userCredential.user.uid, userData);
      
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password should be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.role === 'institute' && !formData.institutionName.trim()) {
      setError('Please select or enter an institution name');
      setLoading(false);
      return;
    }

    if (formData.role === 'student' && !formData.name.trim()) {
      setError('Please enter your full name');
      setLoading(false);
      return;
    }

    if (formData.role === 'company' && !formData.companyName.trim()) {
      setError('Please enter your company name');
      setLoading(false);
      return;
    }

    if (formData.role === 'admin' && !formData.name.trim()) {
      setError('Please enter administrator name');
      setLoading(false);
      return;
    }

    try {
      let user;

      // Use specialized registration functions based on role
      switch (formData.role) {
        case 'institute':
          user = await registerInstitution(formData);
          break;
        case 'student':
          user = await registerStudent(formData);
          break;
        case 'company':
          user = await registerCompany(formData);
          break;
        case 'admin':
          user = await registerAdmin(formData);
          break;
        default:
          throw new Error('Invalid role selected');
      }

      // Send email verification
      await sendEmailVerification(user);

      setSuccess(`Registration successful! A verification email has been sent to ${formData.email}. Please verify your email before logging in.`);
      
      // Auto-login after successful registration (optional)
      if (onLogin) {
        setTimeout(() => {
          onLogin(formData.role);
        }, 3000);
      }

      // Clear form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        name: '',
        institutionName: '',
        companyName: '',
        selectedInstitution: '',
        phone: '',
        address: '',
        description: ''
      });

    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please use a different email or login.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters long.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
        default:
          errorMessage = error.message || 'Registration failed. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case 'student':
        return (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.3s ease'
                }}
                placeholder="Enter your full name"
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
                placeholder="Enter your phone number"
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                placeholder="Enter your address"
              />
            </div>
          </>
        );
      case 'institute':
        return (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Select Institution *
              </label>
              <select
                name="selectedInstitution"
                value={formData.selectedInstitution}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  background: 'white',
                  marginBottom: '10px'
                }}
                required
              >
                <option value="">Choose your institution</option>
                {lesothoInstitutions.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>
            
            {(formData.selectedInstitution === 'other' || !formData.selectedInstitution) && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Institution Name *
                </label>
                <input
                  type="text"
                  name="institutionName"
                  value={formData.institutionName}
                  onChange={handleChange}
                  required={formData.selectedInstitution === 'other' || !formData.selectedInstitution}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  placeholder="Enter your institution name"
                />
              </div>
            )}
            
            {formData.selectedInstitution && formData.selectedInstitution !== 'other' && (
              <div style={{
                background: '#f0f8ff',
                padding: '10px',
                borderRadius: '6px',
                marginBottom: '20px',
                border: '1px solid #b3d9ff'
              }}>
                <strong>Selected Institution:</strong> {formData.institutionName}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Contact Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
                placeholder="Enter institution phone number"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Institution Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                placeholder="Enter institution address"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Institution Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                placeholder="Describe your institution, programs, and specialties"
              />
            </div>
          </>
        );
      case 'company':
        return (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
                placeholder="Enter your company name"
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Contact Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
                placeholder="Enter company phone number"
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Company Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                placeholder="Enter company address"
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Company Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                placeholder="Describe your company and what you do"
              />
            </div>
          </>
        );
      case 'admin':
        return (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              Admin Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
              placeholder="Enter administrator name"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    },
    formContainer: {
      background: 'white',
      padding: '40px',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '520px',
      border: '1px solid rgba(255,255,255,0.2)',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    title: {
      textAlign: 'center',
      marginBottom: '30px',
      color: '#333',
      fontSize: '28px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    errorAlert: {
      background: '#fee',
      color: '#c53030',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
      textAlign: 'center',
      border: '1px solid #fed7d7'
    },
    successAlert: {
      background: '#f0fff4',
      color: '#2d774d',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
      textAlign: 'center',
      border: '1px solid #9ae6b4'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      color: '#333',
      fontSize: '14px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'all 0.3s ease',
      background: 'white',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '16px',
      background: 'white',
      boxSizing: 'border-box',
      minHeight: '80px',
      resize: 'vertical',
      fontFamily: 'inherit'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '16px',
      background: 'white',
      cursor: 'pointer',
      boxSizing: 'border-box'
    },
    submitButton: {
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginBottom: '20px'
    },
    googleButton: {
      width: '100%',
      padding: '12px',
      background: 'white',
      color: '#333',
      border: '2px solid #ddd',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      marginBottom: '25px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    switchText: {
      textAlign: 'center',
      color: '#666',
      fontSize: '14px'
    },
    switchButton: {
      background: 'none',
      border: 'none',
      color: '#667eea',
      cursor: 'pointer',
      textDecoration: 'underline',
      fontWeight: '600',
      fontSize: '14px'
    },
    roleDescription: {
      fontSize: '12px',
      color: '#666',
      marginTop: '4px',
      fontStyle: 'italic'
    },
    requiredNote: {
      fontSize: '12px',
      color: '#666',
      marginTop: '10px',
      textAlign: 'center'
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '25px'
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      background: '#e1e5e9'
    },
    dividerText: {
      padding: '0 15px',
      color: '#666',
      fontSize: '14px',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Create Account</h2>
        
        {error && (
          <div style={styles.errorAlert}>
            {error}
          </div>
        )}

        {success && (
          <div style={styles.successAlert}>
            {success}
          </div>
        )}

        {/* Google Sign-Up Button */}
        <button
          onClick={handleGoogleSignUp}
          disabled={googleLoading}
          style={{
            ...styles.googleButton,
            opacity: googleLoading ? 0.7 : 1,
            cursor: googleLoading ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!googleLoading) {
              e.target.style.borderColor = '#4285f4';
              e.target.style.boxShadow = '0 4px 8px rgba(66, 133, 244, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (!googleLoading) {
              e.target.style.borderColor = '#ddd';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }
          }}
        >
          {googleLoading ? (
            <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
          ) : (
            <img 
              src="https://developers.google.com/identity/images/g-logo.png" 
              alt="Google" 
              style={{ width: '20px', height: '20px' }}
            />
          )}
          {googleLoading ? 'Creating Account...' : 'Sign up with Google'}
        </button>

        <div style={styles.divider}>
          <div style={styles.dividerLine}></div>
          <span style={styles.dividerText}>OR</span>
          <div style={styles.dividerLine}></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Account Type *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="student">🎓 Student</option>
              <option value="institute">🏫 Educational Institute</option>
              <option value="company">💼 Company/Employer</option>
              <option value="admin">⚙️ Administrator</option>
            </select>
            <div style={styles.roleDescription}>
              {formData.role === 'student' && 'Apply for courses and track your career progress'}
              {formData.role === 'institute' && 'Manage courses, students, and admissions'}
              {formData.role === 'company' && 'Post jobs and find qualified candidates'}
              {formData.role === 'admin' && 'Manage platform operations and users'}
            </div>
          </div>

          {renderRoleSpecificFields()}

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter your email address"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Create a strong password (min. 6 characters)"
              minLength="6"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Re-enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.7 : 1,
              transform: loading ? 'scale(0.98)' : 'scale(1)',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onMouseOver={(e) => {
              if (!loading) e.target.style.transform = 'scale(1.02)';
            }}
            onMouseOut={(e) => {
              if (!loading) e.target.style.transform = 'scale(1)';
            }}
          >
            {loading ? (
              <>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '8px' }}>
                  ⏳
                </span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p style={styles.requiredNote}>
          * Required fields
        </p>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            style={styles.switchButton}
          >
            Sign in here
          </button>
        </p>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            input:focus, select:focus, textarea:focus {
              outline: none;
              border-color: #667eea;
              box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default Register;
