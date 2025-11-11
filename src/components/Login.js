import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Get user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Store user role in localStorage
        localStorage.setItem(`userRole_${user.uid}`, userData.role);
        
        // For institutions, store additional info
        if (userData.role === 'institute') {
          localStorage.setItem(`instituteData_${user.uid}`, JSON.stringify({
            name: userData.institutionName,
            email: userData.email,
            id: user.uid
          }));
        }
        
        // For students, store student data
        if (userData.role === 'student') {
          localStorage.setItem(`studentData_${user.uid}`, JSON.stringify({
            name: userData.name,
            email: userData.email,
            id: user.uid
          }));
        }
        
        // For companies, store company data
        if (userData.role === 'company') {
          localStorage.setItem(`companyData_${user.uid}`, JSON.stringify({
            name: userData.companyName,
            email: userData.email,
            id: user.uid
          }));
        }
        
        // Store basic user info in localStorage for quick access
        localStorage.setItem('currentUser', JSON.stringify({
          uid: user.uid,
          email: user.email,
          role: userData.role,
          name: userData.name || userData.institutionName || userData.companyName || 'User'
        }));
        
        onLogin(userData.role);
      } else {
        setError('User data not found. Please complete your registration.');
      }
    } catch (error) {
      console.error('Login error:', error);
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email address format.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled.');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed login attempts. Please try again later.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection.');
          break;
        default:
          setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToRegister = () => {
    setFormData({
      email: '',
      password: '',
      role: 'student'
    });
    setError('');
    onSwitchToRegister();
  };

  const styles = {
    portal: {
      minHeight: '100vh',
      background: '#f3f4f6',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    container: {
      maxWidth: '400px',
      width: '100%',
      margin: '0 auto'
    },
    card: {
      background: '#ffffff',
      padding: '32px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: 700,
      margin: '0 0 8px 0',
      color: '#2563eb'
    },
    subtitle: {
      fontSize: '1rem',
      color: '#6b7280',
      margin: 0,
      fontWeight: 400,
      lineHeight: 1.5
    },
    errorCard: {
      background: '#fee2e2',
      color: '#991b1b',
      padding: '12px 16px',
      borderRadius: '6px',
      marginBottom: '24px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: 500,
      border: '1px solid #fecaca'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: 600,
      color: '#374151',
      fontSize: '14px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      background: 'white',
      boxSizing: 'border-box',
      outline: 'none'
    },
    inputFocus: {
      borderColor: '#2563eb',
      boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      background: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
      outline: 'none'
    },
    helperText: {
      display: 'block',
      marginTop: '6px',
      color: '#9ca3af',
      fontSize: '12px',
      fontWeight: 400
    },
    primaryButton: {
      width: '100%',
      padding: '14px',
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      marginBottom: '20px',
      transition: 'all 0.2s ease',
      position: 'relative',
      overflow: 'hidden'
    },
    primaryButtonHover: {
      background: '#1d4ed8'
    },
    primaryButtonDisabled: {
      background: '#9ca3af',
      cursor: 'not-allowed'
    },
    secondaryButton: {
      width: '100%',
      padding: '12px',
      background: 'transparent',
      border: '1px solid #2563eb',
      color: '#2563eb',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginBottom: '8px'
    },
    secondaryButtonHover: {
      background: '#2563eb',
      color: 'white'
    },
    divider: {
      textAlign: 'center',
      padding: '20px 0',
      borderTop: '1px solid #e5e7eb',
      marginTop: '20px'
    },
    dividerText: {
      color: '#6b7280',
      margin: '0 0 16px 0',
      fontSize: '14px',
      fontWeight: 400
    },
    infoCard: {
      background: '#f9fafb',
      padding: '16px',
      borderRadius: '6px',
      border: '1px solid #e5e7eb',
      marginTop: '20px'
    },
    infoTitle: {
      margin: '0 0 8px 0',
      fontSize: '12px',
      fontWeight: 600,
      color: '#4b5563',
      textAlign: 'center'
    },
    infoText: {
      margin: 0,
      fontSize: '12px',
      color: '#6b7280',
      textAlign: 'center',
      lineHeight: 1.4
    },
    loadingSpinner: {
      display: 'inline-block',
      width: '16px',
      height: '16px',
      border: '2px solid rgba(255,255,255,0.3)',
      borderRadius: '50%',
      borderTopColor: 'white',
      animation: 'spin 1s ease-in-out infinite',
      marginRight: '8px'
    }
  };

  const [buttonHover, setButtonHover] = useState(false);

  return (
    <div style={styles.portal}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>Welcome Back</h1>
            <p style={styles.subtitle}>
              Sign in to access your account
            </p>
          </div>
          
          {error && (
            <div style={styles.errorCard}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                style={{
                  ...styles.input,
                  ...(focusedField === 'email' && styles.inputFocus)
                }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                style={{
                  ...styles.input,
                  ...(focusedField === 'password' && styles.inputFocus)
                }}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Account Type</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{
                  ...styles.select,
                  ...(focusedField === 'role' && styles.inputFocus)
                }}
                onFocus={() => setFocusedField('role')}
                onBlur={() => setFocusedField('')}
              >
                <option value="student">Student Account</option>
                <option value="institute">Educational Institute</option>
                <option value="company">Corporate Partner</option>
                <option value="admin">System Administrator</option>
              </select>
              <span style={styles.helperText}>
                Select the account type you registered with
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.primaryButton,
                ...(buttonHover && !loading && styles.primaryButtonHover),
                ...(loading && styles.primaryButtonDisabled)
              }}
              onMouseEnter={() => setButtonHover(true)}
              onMouseLeave={() => setButtonHover(false)}
            >
              {loading ? (
                <span>
                  <span style={styles.loadingSpinner}></span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <p style={styles.dividerText}>
              Don't have an account?
            </p>
            <button
              onClick={handleSwitchToRegister}
              style={styles.secondaryButton}
              onMouseEnter={(e) => {
                e.target.style.background = '#2563eb';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#2563eb';
              }}
            >
              Create Account
            </button>
          </div>

          <div style={styles.infoCard}>
            <p style={styles.infoTitle}>Need Help?</p>
            <p style={styles.infoText}>
              Select the account type that matches your registration to access the correct features.
            </p>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Login;