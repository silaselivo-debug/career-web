import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import StudentPortal from './components/StudentPortal';
import InstitutePortal from './components/InstitutePortal';
import AdminPortal from './components/AdminPortal';
import CompanyPortal from './components/CompanyPortal';
import HomePage from './components/HomePage';
import { setupInstitutionAccounts } from './setupInstitutions';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [appInitialized, setAppInitialized] = useState(false);

  // Initialize app (optionally run institution setup based on env flag)
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const enableAutoSetup = process.env.REACT_APP_ENABLE_SETUP === 'true';
        if (enableAutoSetup) {
          const institutionsSetup = localStorage.getItem('institutions_setup_complete');
          if (!institutionsSetup) {
            await setupInstitutionAccounts();
            localStorage.setItem('institutions_setup_complete', 'true');
          }
        }
        setAppInitialized(true);
      } catch (error) {
        setAppInitialized(true);
      }
    };
    initializeApp();
  }, []);

  // Auth state listener
  useEffect(() => {
    if (!appInitialized) return;

    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      setLoading(true);
      console.log('Auth state changed:', authUser ? 'User logged in' : 'No user');
      
      if (authUser) {
        setUser(authUser);
        await fetchUserRole(authUser);
      } else {
        setUser(null);
        setUserRole('');
        setCurrentView('home');
        // Clear all role-related localStorage
        clearUserLocalStorage();
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [appInitialized]);

  const clearUserLocalStorage = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('userRole_') || 
          key.startsWith('instituteData_') || 
          key.startsWith('studentData_') || 
          key.startsWith('companyData_') ||
          key === 'currentUser') {
        localStorage.removeItem(key);
      }
    });
  };

  const fetchUserRole = async (authUser) => {
    // Add comprehensive null checking
    if (!authUser || typeof authUser !== 'object') {
      console.error('Invalid auth user provided to fetchUserRole:', authUser);
      setCurrentView('home');
      setUserRole('');
      clearUserLocalStorage();
      return;
    }

    try {
      console.log('Fetching user role for UID:', authUser.uid);
      const userDoc = await getDoc(doc(db, 'users', authUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data found:', { 
          role: userData.role, 
          name: userData.name || userData.institutionName || userData.companyName 
        });
        
        setUserRole(userData.role);
        localStorage.setItem(`userRole_${authUser.uid}`, userData.role);
        
        // Store comprehensive user data in localStorage with safe property access
        const userLocalData = {
          uid: authUser.uid,
          email: userData.email || authUser.email || '',
          role: userData.role,
          name: userData.name || userData.institutionName || userData.companyName || 'User',
          profileComplete: userData.profileComplete || false,
          emailVerified: authUser.emailVerified || false // Safe access to authUser properties
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userLocalData));
        
        // Store role-specific data with safe property access
        if (userData.role === 'institute') {
          localStorage.setItem(`instituteData_${authUser.uid}`, JSON.stringify({
            name: userData.institutionName || '',
            email: userData.email || authUser.email || '',
            id: authUser.uid,
            verified: userData.verified || false
          }));
        } else if (userData.role === 'student') {
          localStorage.setItem(`studentData_${authUser.uid}`, JSON.stringify({
            name: userData.name || '',
            email: userData.email || authUser.email || '',
            id: authUser.uid,
            profileComplete: userData.profileComplete || false
          }));
        } else if (userData.role === 'company') {
          localStorage.setItem(`companyData_${authUser.uid}`, JSON.stringify({
            name: userData.companyName || '',
            email: userData.email || authUser.email || '',
            id: authUser.uid,
            approved: userData.approved || false
          }));
        }
        
        // Redirect to respective portal based on role
        redirectToPortal(userData.role);
      } else {
        console.log('No user document found for UID:', authUser.uid);
        // If no user document found, redirect to home
        setCurrentView('home');
        setUserRole('');
        
        // Clear any existing localStorage data
        clearUserLocalStorage();
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setCurrentView('home');
      setUserRole('');
      
      // Clear localStorage on error
      clearUserLocalStorage();
    }
  };

  const redirectToPortal = (role) => {
    if (!role) {
      console.warn('No role provided to redirectToPortal');
      setCurrentView('home');
      return;
    }

    switch (role) {
      case 'student':
        setCurrentView('student');
        break;
      case 'institute':
        setCurrentView('institute');
        break;
      case 'admin':
        setCurrentView('admin');
        break;
      case 'company':
        setCurrentView('company');
        break;
      default:
        console.warn('Unknown role, redirecting to home:', role);
        setCurrentView('home');
    }
  };

  const handleLogin = (role) => {
    console.log('Login successful with role:', role);
    
    if (!user) {
      console.error('No user available during handleLogin');
      return;
    }

    setUserRole(role);
    
    // Store role in localStorage for current user
    localStorage.setItem(`userRole_${user.uid}`, role);
    
    // Update current user data safely
    try {
      const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      localStorage.setItem('currentUser', JSON.stringify({
        ...currentUserData,
        role: role,
        uid: user.uid,
        email: user.email || currentUserData.email || ''
      }));
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
    
    // Redirect to respective portal
    redirectToPortal(role);
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out user...');
      await auth.signOut();
      setUser(null);
      setUserRole('');
      setCurrentView('home');
      
      // Clear user data from localStorage
      clearUserLocalStorage();
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigation = (view) => {
    console.log('Navigating to:', view);
    setCurrentView(view);
  };

  const handleResetInstitutions = async () => {
    if (window.confirm('Are you sure you want to reset institution accounts? This will recreate all institution accounts.')) {
      try {
        setLoading(true);
        await setupInstitutionAccounts();
        localStorage.setItem('institutions_setup_complete', 'true');
        alert('Institution accounts reset successfully!');
      } catch (error) {
        console.error('Error resetting institutions:', error);
        alert('Error resetting institution accounts');
      } finally {
        setLoading(false);
      }
    }
  };

  // Enhanced loading component
  if (loading || !appInitialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        flexDirection: 'column',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ 
          fontSize: '32px', 
          marginBottom: '20px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
           EduConnect Lesotho
        </div>
        <div style={{ 
          fontSize: '18px',
          marginBottom: '30px',
          textAlign: 'center',
          opacity: 0.9
        }}>
          {!appInitialized ? 'Initializing Application...' : 'Loading Your Portal...'}
        </div>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        
        {!appInitialized && (
          <div style={{
            marginTop: '30px',
            padding: '15px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '10px',
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
              <strong>Setting up institution accounts...</strong>
            </p>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>
              This may take a few moments. Please wait.
            </p>
          </div>
        )}
        
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  const renderCurrentView = () => {
    // User is not logged in
    if (!user) {
      switch (currentView) {
        case 'register':
          return (
            <Register 
              onSwitchToLogin={() => setCurrentView('login')} 
              onLogin={handleLogin} 
            />
          );
        case 'login':
          return (
            <Login 
              onLogin={handleLogin} 
              onSwitchToRegister={() => setCurrentView('register')} 
            />
          );
        case 'home':
        default:
          return (
            <HomePage 
              onNavigate={handleNavigation} 
              onResetInstitutions={handleResetInstitutions}
            />
          );
      }
    }

    // User is logged in - show respective portal based on role
    switch (userRole) {
      case 'student':
        return <StudentPortal user={user} onLogout={handleLogout} />;
      case 'institute':
        return <InstitutePortal user={user} onLogout={handleLogout} />;
      case 'admin':
        return (
          <AdminPortal 
            user={user} 
            onLogout={handleLogout} 
            onResetInstitutions={handleResetInstitutions}
          />
        );
      case 'company':
        return <CompanyPortal user={user} onLogout={handleLogout} />;
      default:
        // Fallback to home if role is not recognized
        console.warn('Unknown user role, showing home:', userRole);
        return (
          <HomePage 
            onNavigate={handleNavigation} 
            onResetInstitutions={handleResetInstitutions}
          />
        );
    }
  };

  return (
    <div className="App" style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--background)'
    }}>
      {renderCurrentView()}
      
      {/* Debug info - only show in development */}
      {process.env.NODE_ENV === 'development' && user && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          zIndex: 1000,
          maxWidth: '300px'
        }}>
          <div><strong>Debug Info:</strong></div>
          <div>User: {user?.email || 'No email'}</div>
          <div>Role: {userRole || 'No role'}</div>
          <div>View: {currentView}</div>
          <div>Email Verified: {user?.emailVerified ? 'Yes' : 'No'}</div>
          <button 
            onClick={handleResetInstitutions}
            style={{
          background: 'linear-gradient(135deg, #dc3545, #ff4d6d)',
          color: 'white',
          border: 'none',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          marginTop: '5px',
          cursor: 'pointer'
        }}
      >
        Reset Institutions
      </button>
        </div>
      )}
    </div>
  );
}

export default App;
