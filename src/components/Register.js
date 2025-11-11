import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

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
  const [success, setSuccess] = useState('');

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

  // Enhanced institution registration function
  const registerInstitution = async (institutionData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        institutionData.email, 
        institutionData.password
      );
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
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
        verified: false, // Admin verification needed
        emailVerified: false
      });
      
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
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
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
      });
      
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
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: companyData.email,
        companyName: companyData.companyName,
        phone: companyData.phone,
        address: companyData.address,
        description: companyData.description,
        role: 'company',
        createdAt: new Date(),
        jobPostings: [],
        approved: false, // Admin approval needed
        emailVerified: false
      });
      
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
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: adminData.email,
        name: adminData.name,
        role: 'admin',
        createdAt: new Date(),
        permissions: ['all'],
        emailVerified: false
      });
      
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

      // Store user data in localStorage for immediate access
      const userData = {
        uid: user.uid,
        email: user.email,
        role: formData.role,
        name: formData.name || formData.institutionName || formData.companyName || 'User'
      };

      // Role-specific localStorage data
      if (formData.role === 'institute') {
        localStorage.setItem(`instituteData_${user.uid}`, JSON.stringify({
          name: formData.institutionName,
          email: formData.email,
          id: user.uid
        }));
      } else if (formData.role === 'student') {
        localStorage.setItem(`studentData_${user.uid}`, JSON.stringify({
          name: formData.name,
          email: formData.email,
          id: user.uid
        }));
      } else if (formData.role === 'company') {
        localStorage.setItem(`companyData_${user.uid}`, JSON.stringify({
          name: formData.companyName,
          email: formData.email,
          id: user.uid
        }));
      }

      // Store basic user info
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem(`userRole_${user.uid}`, formData.role);

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
              <option value="student"> Student</option>
              <option value="institute"> Educational Institute</option>
              <option value="company"> Company/Employer</option>
              <option value="admin"> Administrator</option>
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
