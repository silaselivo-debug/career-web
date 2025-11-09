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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    container: {
      maxWidth: '440px',
      width: '100%',
      margin: '0 auto'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      padding: '40px',
      borderRadius: '24px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    },
    cardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 30px 80px rgba(0,0,0,0.2)'
    },
    header: {
      textAlign: 'center',
      marginBottom: '35px'
    },
    title: {
      fontSize: '2.2rem',
      fontWeight: 800,
      margin: '0 0 12px 0',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    subtitle: {
      fontSize: '1.1rem',
      color: '#718096',
      margin: 0,
      fontWeight: 400,
      lineHeight: 1.5
    },
    errorCard: {
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      color: 'white',
      padding: '16px 20px',
      borderRadius: '12px',
      marginBottom: '28px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: 600,
      boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    formGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      marginBottom: '10px',
      fontWeight: 600,
      color: '#2d3748',
      fontSize: '14px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    input: {
      width: '100%',
      padding: '16px 20px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '16px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      background: 'white',
      boxSizing: 'border-box',
      outline: 'none'
    },
    inputFocus: {
      borderColor: '#667eea',
      boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.15)',
      transform: 'scale(1.02)'
    },
    select: {
      width: '100%',
      padding: '16px 20px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '16px',
      background: 'white',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxSizing: 'border-box',
      outline: 'none'
    },
    helperText: {
      display: 'block',
      marginTop: '8px',
      color: '#a0aec0',
      fontSize: '12px',
      fontWeight: 500
    },
    primaryButton: {
      width: '100%',
      padding: '18px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: 700,
      cursor: 'pointer',
      marginBottom: '24px',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
      position: 'relative',
      overflow: 'hidden'
    },
    primaryButtonHover: {
      transform: 'translateY(-3px) scale(1.02)',
      boxShadow: '0 15px 40px rgba(102, 126, 234, 0.5)'
    },
    primaryButtonDisabled: {
      background: '#cbd5e0',
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none'
    },
    secondaryButton: {
      width: '100%',
      padding: '16px',
      background: 'transparent',
      border: '2px solid #667eea',
      color: '#667eea',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      marginBottom: '8px'
    },
    secondaryButtonHover: {
      background: '#667eea',
      color: 'white',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
    },
    divider: {
      textAlign: 'center',
      padding: '25px 0',
      borderTop: '1px solid #e2e8f0',
      marginTop: '25px'
    },
    dividerText: {
      color: '#718096',
      margin: '0 0 20px 0',
      fontSize: '15px',
      fontWeight: 500
    },
    infoCard: {
      background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      marginTop: '25px'
    },
    infoTitle: {
      margin: '0 0 10px 0',
      fontSize: '13px',
      fontWeight: 700,
      color: '#4a5568',
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    infoText: {
      margin: 0,
      fontSize: '12px',
      color: '#718096',
      textAlign: 'center',
      lineHeight: 1.5,
      fontWeight: 500
    },
    loadingSpinner: {
      display: 'inline-block',
      width: '20px',
      height: '20px',
      border: '3px solid rgba(255,255,255,0.3)',
      borderRadius: '50%',
      borderTopColor: 'white',
      animation: 'spin 1s ease-in-out infinite',
      marginRight: '10px'
    }
  };

  const [cardHover, setCardHover] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);

  return (
    <div style={styles.portal}>
      <div style={styles.container}>
        <div 
          style={{
            ...styles.card,
            ...(cardHover && styles.cardHover)
          }}
          onMouseEnter={() => setCardHover(true)}
          onMouseLeave={() => setCardHover(false)}
        >
          <div style={styles.header}>
            <h1 style={styles.title}>Welcome Back</h1>
            <p style={styles.subtitle}>
              Sign in to access your personalized education portal
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
                placeholder="Enter your registered email"
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
                placeholder="Enter your secure password"
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
                  Authenticating Access...
                </span>
              ) : (
                'Access Your Portal'
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <p style={styles.dividerText}>
              New to the platform?
            </p>
            <button
              onClick={handleSwitchToRegister}
              style={styles.secondaryButton}
              onMouseEnter={(e) => {
                e.target.style.background = '#667eea';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#667eea';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Create New Account
            </button>
          </div>

          <div style={styles.infoCard}>
            <p style={styles.infoTitle}>Platform Access</p>
            <p style={styles.infoText}>
              Ensure you select the correct account type that matches your registration. 
              Each account type provides access to specialized features and tools.
            </p>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .login-container {
            animation: fadeIn 0.8s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default Login;