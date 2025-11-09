import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, query, where, getDocs, addDoc, updateDoc, doc, 
  deleteDoc, getDoc
} from 'firebase/firestore';

const InstitutePortal = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [instituteData, setInstituteData] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [newFaculty, setNewFaculty] = useState({ name: '', description: '' });
  const [newCourse, setNewCourse] = useState({ 
    name: '', description: '', faculty: '', requirements: '', duration: '' 
  });
  const [profileData, setProfileData] = useState({
    institutionName: '',
    email: '',
    phone: '',
    address: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    admittedApplications: 0,
    rejectedApplications: 0
  });

  const styles = {
    portal: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      padding: '25px 30px',
      borderRadius: '20px',
      marginBottom: '25px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    headerContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px'
    },
    headerTitle: {
      fontSize: '2rem',
      fontWeight: 800,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      margin: 0
    },
    headerSubtitle: {
      fontSize: '1rem',
      color: '#666',
      margin: 0,
      fontWeight: 500
    },
    headerInfo: {
      fontSize: '0.85rem',
      color: '#888',
      margin: '5px 0 0 0'
    },
    nav: {
      display: 'flex',
      gap: '10px',
      marginBottom: '30px',
      flexWrap: 'wrap',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      padding: '15px',
      borderRadius: '15px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    navButton: {
      padding: '12px 25px',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 600,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)'
    },
    navButtonActive: {
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 5px 15px rgba(255, 107, 107, 0.3)'
    },
    logoutButton: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 600,
      background: 'rgba(255, 255, 255, 0.9)',
      color: '#667eea',
      transition: 'all 0.3s ease',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      padding: '30px',
      borderRadius: '20px',
      marginBottom: '25px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'all 0.3s ease'
    },
    cardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '25px',
      marginTop: '25px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: 600,
      color: '#2d3748',
      fontSize: '14px'
    },
    input: {
      width: '100%',
      padding: '12px 15px',
      border: '2px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '14px',
      transition: 'all 0.3s ease',
      background: 'white'
    },
    inputFocus: {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
    },
    textarea: {
      width: '100%',
      padding: '12px 15px',
      border: '2px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '14px',
      minHeight: '120px',
      resize: 'vertical',
      transition: 'all 0.3s ease',
      background: 'white'
    },
    select: {
      width: '100%',
      padding: '12px 15px',
      border: '2px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '14px',
      background: 'white',
      transition: 'all 0.3s ease'
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      padding: '14px 28px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 5px 15px rgba(102, 126, 234, 0.3)'
    },
    secondaryButton: {
      background: 'rgba(255, 255, 255, 0.9)',
      color: '#667eea',
      border: '2px solid #667eea',
      padding: '12px 25px',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    dangerButton: {
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    applicationCard: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
      border: '1px solid #e2e8f0',
      padding: '20px',
      borderRadius: '15px',
      marginBottom: '15px',
      transition: 'all 0.3s ease'
    },
    statusButton: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 600,
      marginRight: '10px',
      transition: 'all 0.3s ease'
    },
    admitButton: { 
      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', 
      color: 'white',
      boxShadow: '0 3px 10px rgba(40, 167, 69, 0.3)'
    },
    rejectButton: { 
      background: 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)', 
      color: 'white',
      boxShadow: '0 3px 10px rgba(220, 53, 69, 0.3)'
    },
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      color: 'white',
      fontSize: '18px',
      fontWeight: 600
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginTop: '20px'
    },
    statCard: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '25px',
      borderRadius: '15px',
      textAlign: 'center',
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
      transition: 'all 0.3s ease'
    },
    statNumber: {
      fontSize: '2.5rem',
      fontWeight: 800,
      marginBottom: '5px'
    },
    statLabel: {
      fontSize: '0.9rem',
      opacity: 0.9,
      fontWeight: 500
    },
    emailLink: {
      color: '#28a745',
      textDecoration: 'none',
      fontWeight: 600,
      padding: '6px 12px',
      background: 'rgba(40, 167, 69, 0.1)',
      borderRadius: '6px',
      transition: 'all 0.3s ease'
    },
    marksSection: {
      background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
      padding: '15px',
      borderRadius: '10px',
      margin: '15px 0',
      border: '1px solid #fdcb6e'
    },
    statusBadge: {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 700,
      display: 'inline-block',
      marginLeft: '10px'
    },
    statusPending: { background: '#fff3cd', color: '#856404' },
    statusAdmitted: { background: '#d1edff', color: '#004085' },
    statusRejected: { background: '#f8d7da', color: '#721c24' },
    facultyItem: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '15px',
      border: '1px solid #e2e8f0',
      transition: 'all 0.3s ease'
    },
    courseItem: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '15px',
      border: '1px solid #e2e8f0',
      transition: 'all 0.3s ease'
    }
  };

  // Hover states
  const [hoveredCard, setHoveredCard] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);

  useEffect(() => {
    if (user) {
      fetchInstituteData();
      fetchFaculties();
      fetchCourses();
      fetchApplications();
    }
  }, [user]);

  useEffect(() => {
    setStats({
      totalApplications: applications.length,
      pendingApplications: applications.filter(app => app.status === 'pending').length,
      admittedApplications: applications.filter(app => app.status === 'admitted').length,
      rejectedApplications: applications.filter(app => app.status === 'rejected').length
    });
  }, [applications]);

  const fetchInstituteData = async () => {
    try {
      setLoading(true);
      const instituteDoc = await getDoc(doc(db, 'users', user.uid));
      if (instituteDoc.exists()) {
        const data = instituteDoc.data();
        setInstituteData(data);
        setProfileData({
          institutionName: data.institutionName || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          description: data.description || ''
        });
      }
    } catch (error) {
      console.error('Error fetching institute data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const facultiesSnapshot = await getDocs(
        query(collection(db, 'faculties'), where('instituteId', '==', user.uid))
      );
      const facultiesData = facultiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFaculties(facultiesData);
    } catch (error) {
      console.error('Error fetching faculties:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const coursesSnapshot = await getDocs(
        query(collection(db, 'courses'), where('instituteId', '==', user.uid))
      );
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      let applicationsSnapshot;
      try {
        applicationsSnapshot = await getDocs(
          query(
            collection(db, 'applications'), 
            where('institutionEmail', '==', user.email)
          )
        );
      } catch (error) {
        console.log('Falling back to institutionId filter:', error);
        applicationsSnapshot = await getDocs(
          query(collection(db, 'applications'), where('institutionId', '==', user.uid))
        );
      }
      
      const applicationsData = applicationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleAddFaculty = async () => {
    if (!newFaculty.name.trim()) {
      alert('Please enter faculty name');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'faculties'), {
        name: newFaculty.name,
        description: newFaculty.description,
        instituteId: user.uid,
        instituteName: instituteData?.institutionName || profileData.institutionName,
        instituteEmail: user.email,
        createdAt: new Date()
      });
      setNewFaculty({ name: '', description: '' });
      fetchFaculties();
      alert('Faculty added successfully!');
    } catch (error) {
      console.error('Error adding faculty:', error);
      alert('Error adding faculty');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async () => {
    if (!newCourse.name.trim() || !newCourse.faculty.trim()) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'courses'), {
        name: newCourse.name,
        description: newCourse.description,
        faculty: newCourse.faculty,
        requirements: newCourse.requirements,
        duration: newCourse.duration,
        instituteId: user.uid,
        instituteName: instituteData?.institutionName || profileData.institutionName,
        instituteEmail: user.email,
        createdAt: new Date()
      });
      setNewCourse({ name: '', description: '', faculty: '', requirements: '', duration: '' });
      fetchCourses();
      alert('Course added successfully!');
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Error adding course');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationStatus = async (applicationId, status) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'applications', applicationId), {
        status: status,
        reviewedAt: new Date(),
        reviewedBy: user.uid,
        reviewedByName: instituteData?.institutionName || profileData.institutionName
      });
      fetchApplications();
      alert(`Application ${status} successfully!`);
      
      if (status === 'admitted') {
        const application = applications.find(app => app.id === applicationId);
        if (application) {
          alert(`Student ${application.studentName} has been admitted to ${application.courseName}. They will be notified and can contact you at ${user.email}`);
        }
      }
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Error updating application');
    } finally {
      setLoading(false);
    }
  };

  const deleteFaculty = async (facultyId) => {
    try {
      setLoading(true);
      const coursesInFaculty = courses.filter(course => course.faculty === faculties.find(f => f.id === facultyId)?.name);
      
      if (coursesInFaculty.length > 0) {
        alert(`Cannot delete faculty. There are ${coursesInFaculty.length} courses associated with this faculty. Please delete or reassign those courses first.`);
        return;
      }

      await deleteDoc(doc(db, 'faculties', facultyId));
      fetchFaculties();
      alert('Faculty deleted successfully!');
    } catch (error) {
      console.error('Error deleting faculty:', error);
      alert('Error deleting faculty');
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'courses', courseId));
      fetchCourses();
      alert('Course deleted successfully!');
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Error deleting course');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'users', user.uid), {
        ...profileData,
        updatedAt: new Date()
      });
      alert('Profile updated successfully!');
      fetchInstituteData();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const sendEmailToStudent = (studentEmail, studentName, courseName, status) => {
    const subject = `Application Update - ${courseName}`;
    const body = `Dear ${studentName},\n\nYour application for ${courseName} has been ${status}.\n\nBest regards,\n${instituteData?.institutionName || profileData.institutionName}`;
    
    window.open(`mailto:${studentEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const renderDashboard = () => (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 700 }}>Institute Dashboard</h3>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{instituteData?.institutionName ? '✓' : 'N/A'}</div>
          <div style={styles.statLabel}>Institute Profile</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{faculties.length}</div>
          <div style={styles.statLabel}>Total Faculties</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{courses.length}</div>
          <div style={styles.statLabel}>Available Courses</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.totalApplications}</div>
          <div style={styles.statLabel}>Total Applications</div>
        </div>
      </div>

      <div style={styles.grid}>
        <div 
          style={{
            ...styles.card,
            ...(hoveredCard === 'applications' && styles.cardHover)
          }}
          onMouseEnter={() => setHoveredCard('applications')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h4 style={{ marginBottom: '15px', color: '#2d3748' }}>Application Overview</h4>
          <div style={{ marginBottom: '15px' }}>
            <p style={{ color: '#718096', marginBottom: '5px' }}><strong>Total:</strong> {stats.totalApplications}</p>
            <p style={{ color: '#718096', marginBottom: '5px' }}><strong>Pending Review:</strong> {stats.pendingApplications}</p>
            <p style={{ color: '#718096', marginBottom: '5px' }}><strong>Admitted:</strong> {stats.admittedApplications}</p>
            <p style={{ color: '#718096', marginBottom: '15px' }}><strong>Rejected:</strong> {stats.rejectedApplications}</p>
          </div>
          {stats.pendingApplications > 0 && (
            <button 
              style={styles.primaryButton}
              onClick={() => setActiveTab('applications')}
            >
              Review Pending Applications
            </button>
          )}
        </div>
        
        <div 
          style={{
            ...styles.card,
            ...(hoveredCard === 'quickActions' && styles.cardHover)
          }}
          onMouseEnter={() => setHoveredCard('quickActions')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h4 style={{ marginBottom: '15px', color: '#2d3748' }}>Quick Actions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              style={styles.primaryButton}
              onClick={() => setActiveTab('faculties')}
            >
              Add New Faculty
            </button>
            <button 
              style={styles.primaryButton}
              onClick={() => setActiveTab('courses')}
            >
              Add New Course
            </button>
            <button 
              style={styles.secondaryButton}
              onClick={() => setActiveTab('applications')}
            >
              Manage Applications
            </button>
          </div>
        </div>
        
        <div 
          style={{
            ...styles.card,
            ...(hoveredCard === 'activity' && styles.cardHover)
          }}
          onMouseEnter={() => setHoveredCard('activity')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h4 style={{ marginBottom: '15px', color: '#2d3748' }}>Recent Activity</h4>
          {applications.length === 0 ? (
            <p style={{ color: '#a0aec0', textAlign: 'center', padding: '20px' }}>No recent activity</p>
          ) : (
            applications.slice(0, 5).map(application => (
              <div key={application.id} style={{ 
                padding: '12px', 
                borderBottom: '1px solid #e2e8f0', 
                background: '#f7fafc',
                borderRadius: '8px',
                marginBottom: '8px'
              }}>
                <strong style={{ color: '#2d3748' }}>{application.studentName}</strong> applied to <strong>{application.courseName}</strong>
                <br />
                <small style={{ color: '#a0aec0' }}>
                  {application.appliedAt?.toDate ? 
                    application.appliedAt.toDate().toLocaleDateString() : 
                    new Date(application.appliedAt).toLocaleDateString()}
                </small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderFaculties = () => (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 700 }}>Academic Faculties Management</h3>
      
      <div style={styles.card}>
        <h4 style={{ marginBottom: '20px', color: '#2d3748' }}>Create New Faculty</h4>
        <div style={styles.formGroup}>
          <label style={styles.label}>Faculty Name *</label>
          <input
            type="text"
            value={newFaculty.name}
            onChange={(e) => setNewFaculty({...newFaculty, name: e.target.value})}
            style={{
              ...styles.input,
              ...(focusedInput === 'facultyName' && styles.inputFocus)
            }}
            onFocus={() => setFocusedInput('facultyName')}
            onBlur={() => setFocusedInput(null)}
            placeholder="Enter faculty name"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea
            value={newFaculty.description}
            onChange={(e) => setNewFaculty({...newFaculty, description: e.target.value})}
            style={{
              ...styles.textarea,
              ...(focusedInput === 'facultyDesc' && styles.inputFocus)
            }}
            onFocus={() => setFocusedInput('facultyDesc')}
            onBlur={() => setFocusedInput(null)}
            placeholder="Enter faculty description and focus areas"
          />
        </div>
        <button 
          style={styles.primaryButton}
          onClick={handleAddFaculty}
          disabled={loading}
        >
          {loading ? 'Creating Faculty...' : 'Create Faculty'}
        </button>
      </div>

      <div style={styles.card}>
        <h4 style={{ marginBottom: '20px', color: '#2d3748' }}>Existing Faculties ({faculties.length})</h4>
        {faculties.length === 0 ? (
          <p style={{ color: '#a0aec0', textAlign: 'center', padding: '30px' }}>No faculties created yet. Start by creating your first faculty above.</p>
        ) : (
          faculties.map(faculty => (
            <div 
              key={faculty.id} 
              style={{
                ...styles.facultyItem,
                ...(hoveredCard === faculty.id && styles.cardHover)
              }}
              onMouseEnter={() => setHoveredCard(faculty.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h5 style={{ margin: '0 0 8px 0', color: '#2d3748', fontSize: '1.1rem' }}>{faculty.name}</h5>
                  <p style={{ margin: '0 0 10px 0', color: '#718096' }}>{faculty.description}</p>
                  <small style={{ color: '#a0aec0' }}>
                    Created: {faculty.createdAt?.toDate ? 
                      faculty.createdAt.toDate().toLocaleDateString() : 
                      new Date(faculty.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <button 
                  style={styles.dangerButton}
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete the faculty "${faculty.name}"?`)) {
                      deleteFaculty(faculty.id);
                    }
                  }}
                  disabled={loading}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderCourses = () => (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 700 }}>Academic Programs Management</h3>
      
      <div style={styles.card}>
        <h4 style={{ marginBottom: '20px', color: '#2d3748' }}>Create New Program</h4>
        <div style={styles.formGroup}>
          <label style={styles.label}>Program Name *</label>
          <input
            type="text"
            value={newCourse.name}
            onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
            style={{
              ...styles.input,
              ...(focusedInput === 'courseName' && styles.inputFocus)
            }}
            onFocus={() => setFocusedInput('courseName')}
            onBlur={() => setFocusedInput(null)}
            placeholder="Enter program name"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Faculty Department *</label>
          <select
            value={newCourse.faculty}
            onChange={(e) => setNewCourse({...newCourse, faculty: e.target.value})}
            style={styles.select}
          >
            <option value="">Select Faculty Department</option>
            {faculties.map(faculty => (
              <option key={faculty.id} value={faculty.name}>
                {faculty.name}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Program Duration</label>
          <input
            type="text"
            value={newCourse.duration}
            onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
            style={{
              ...styles.input,
              ...(focusedInput === 'duration' && styles.inputFocus)
            }}
            onFocus={() => setFocusedInput('duration')}
            onBlur={() => setFocusedInput(null)}
            placeholder="e.g., 4 years, 2 semesters"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Admission Requirements</label>
          <textarea
            value={newCourse.requirements}
            onChange={(e) => setNewCourse({...newCourse, requirements: e.target.value})}
            style={{
              ...styles.textarea,
              ...(focusedInput === 'requirements' && styles.inputFocus)
            }}
            onFocus={() => setFocusedInput('requirements')}
            onBlur={() => setFocusedInput(null)}
            placeholder="Enter admission requirements and prerequisites"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Program Description</label>
          <textarea
            value={newCourse.description}
            onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
            style={{
              ...styles.textarea,
              ...(focusedInput === 'description' && styles.inputFocus)
            }}
            onFocus={() => setFocusedInput('description')}
            onBlur={() => setFocusedInput(null)}
            placeholder="Enter detailed program description and learning outcomes"
            rows={4}
          />
        </div>
        <button 
          style={styles.primaryButton}
          onClick={handleAddCourse}
          disabled={loading}
        >
          {loading ? 'Creating Program...' : 'Create Academic Program'}
        </button>
      </div>

      <div style={styles.card}>
        <h4 style={{ marginBottom: '20px', color: '#2d3748' }}>Existing Programs ({courses.length})</h4>
        {courses.length === 0 ? (
          <p style={{ color: '#a0aec0', textAlign: 'center', padding: '30px' }}>No programs created yet. Start by creating your first academic program above.</p>
        ) : (
          courses.map(course => (
            <div 
              key={course.id} 
              style={{
                ...styles.courseItem,
                ...(hoveredCard === course.id && styles.cardHover)
              }}
              onMouseEnter={() => setHoveredCard(course.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h5 style={{ margin: '0 0 8px 0', color: '#2d3748', fontSize: '1.1rem' }}>{course.name}</h5>
                  <p style={{ margin: '5px 0', color: '#718096' }}>
                    <strong>Faculty:</strong> {course.faculty} | 
                    <strong> Duration:</strong> {course.duration}
                  </p>
                  <p style={{ margin: '5px 0', color: '#4a5568' }}>
                    <strong>Requirements:</strong> {course.requirements}
                  </p>
                  <p style={{ margin: '5px 0 10px 0', color: '#4a5568' }}>{course.description}</p>
                  <small style={{ color: '#a0aec0' }}>
                    Created: {course.createdAt?.toDate ? 
                      course.createdAt.toDate().toLocaleDateString() : 
                      new Date(course.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <button 
                  style={styles.dangerButton}
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete the program "${course.name}"?`)) {
                      deleteCourse(course.id);
                    }
                  }}
                  disabled={loading}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderApplications = () => (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 700 }}>Student Applications Management</h3>
      {applications.length === 0 ? (
        <div style={styles.card}>
          <h4 style={{ color: '#2d3748', marginBottom: '15px' }}>No Applications Received</h4>
          <p style={{ color: '#718096', marginBottom: '20px' }}>Student applications will appear here when they apply to your academic programs.</p>
          <p style={{ color: '#a0aec0', fontSize: '14px' }}>Ensure your programs are properly listed and students can find your institution in the course catalog.</p>
        </div>
      ) : (
        <div>
          <div style={{...styles.card, marginBottom: '25px'}}>
            <h4 style={{ marginBottom: '15px', color: '#2d3748' }}>Application Summary</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              <div style={{ textAlign: 'center', padding: '15px', background: '#f7fafc', borderRadius: '10px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#667eea' }}>{stats.totalApplications}</div>
                <div style={{ fontSize: '0.9rem', color: '#718096' }}>Total</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: '#fff3cd', borderRadius: '10px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#856404' }}>{stats.pendingApplications}</div>
                <div style={{ fontSize: '0.9rem', color: '#856404' }}>Pending</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: '#d1edff', borderRadius: '10px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#004085' }}>{stats.admittedApplications}</div>
                <div style={{ fontSize: '0.9rem', color: '#004085' }}>Admitted</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: '#f8d7da', borderRadius: '10px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#721c24' }}>{stats.rejectedApplications}</div>
                <div style={{ fontSize: '0.9rem', color: '#721c24' }}>Rejected</div>
              </div>
            </div>
          </div>
          
          {applications.map(application => (
            <div 
              key={application.id} 
              style={{
                ...styles.applicationCard,
                ...(hoveredCard === application.id && styles.cardHover)
              }}
              onMouseEnter={() => setHoveredCard(application.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#2d3748' }}>{application.courseName}</h4>
                  <p style={{ margin: '0 0 5px 0', color: '#718096' }}><strong>Applicant:</strong> {application.studentName}</p>
                  <p style={{ margin: '0 0 5px 0', color: '#718096' }}><strong>Faculty:</strong> {application.facultyName}</p>
                </div>
                <div>
                  <span style={{
                    ...styles.statusBadge,
                    ...(application.status === 'pending' ? styles.statusPending :
                        application.status === 'admitted' ? styles.statusAdmitted : 
                        styles.statusRejected)
                  }}>
                    {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                  </span>
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: '0 0 8px 0', color: '#4a5568' }}>
                  <strong>Contact:</strong> 
                  <a 
                    href={`mailto:${application.studentEmail}`} 
                    style={styles.emailLink}
                    onClick={(e) => {
                      e.preventDefault();
                      sendEmailToStudent(application.studentEmail, application.studentName, application.courseName, application.status);
                    }}
                  >
                    {application.studentEmail}
                  </a>
                </p>
                
                {application.studentMarks && (
                  <div style={styles.marksSection}>
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#856404' }}>Academic Performance:</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <p style={{ margin: '2px 0', fontSize: '13px' }}>
                        <strong>Mathematics:</strong> {application.studentMarks.mathematics || 'N/A'}%
                      </p>
                      <p style={{ margin: '2px 0', fontSize: '13px' }}>
                        <strong>English:</strong> {application.studentMarks.english || 'N/A'}%
                      </p>
                      <p style={{ margin: '2px 0', fontSize: '13px' }}>
                        <strong>Science:</strong> {application.studentMarks.science || 'N/A'}%
                      </p>
                      <p style={{ margin: '2px 0', fontSize: '13px' }}>
                        <strong>Overall:</strong> {application.studentMarks.overall || 'N/A'}%
                      </p>
                    </div>
                  </div>
                )}
                
                <p style={{ margin: '10px 0 5px 0', color: '#4a5568' }}>
                  <strong>Program Requirements:</strong> {application.courseRequirements}
                </p>
                <p style={{ margin: '0', color: '#a0aec0' }}>
                  <strong>Applied:</strong> {
                    application.appliedAt?.toDate ? 
                    application.appliedAt.toDate().toLocaleDateString() : 
                    new Date(application.appliedAt).toLocaleDateString()
                  }
                </p>
              </div>
              
              {application.status === 'pending' && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    style={{...styles.statusButton, ...styles.admitButton}}
                    onClick={() => handleApplicationStatus(application.id, 'admitted')}
                    disabled={loading}
                  >
                    Admit Student
                  </button>
                  <button 
                    style={{...styles.statusButton, ...styles.rejectButton}}
                    onClick={() => handleApplicationStatus(application.id, 'rejected')}
                    disabled={loading}
                  >
                    Reject Application
                  </button>
                </div>
              )}
              
              {application.status !== 'pending' && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    style={styles.secondaryButton}
                    onClick={() => sendEmailToStudent(application.studentEmail, application.studentName, application.courseName, application.status)}
                  >
                    Send Update Email
                  </button>
                </div>
              )}
              
              {application.reviewedAt && (
                <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#a0aec0' }}>
                  <strong>Decision Date:</strong> {
                    application.reviewedAt?.toDate ? 
                    application.reviewedAt.toDate().toLocaleDateString() : 
                    new Date(application.reviewedAt).toLocaleDateString()
                  }
                  {application.reviewedByName && ` by ${application.reviewedByName}`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 700 }}>Institute Profile Settings</h3>
      
      <div style={styles.card}>
        <h4 style={{ marginBottom: '20px', color: '#2d3748' }}>Institution Information</h4>
        <div style={styles.grid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Institution Name *</label>
            <input
              type="text"
              value={profileData.institutionName}
              onChange={(e) => setProfileData({...profileData, institutionName: e.target.value})}
              style={{
                ...styles.input,
                ...(focusedInput === 'institutionName' && styles.inputFocus)
              }}
              onFocus={() => setFocusedInput('institutionName')}
              onBlur={() => setFocusedInput(null)}
              placeholder="Enter your institution name"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Contact Email</label>
            <input
              type="email"
              value={profileData.email}
              style={styles.input}
              disabled
            />
            <small style={{ color: '#718096', fontSize: '12px', marginTop: '5px', display: 'block' }}>
              This email is used to receive student applications and communications.
            </small>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              style={{
                ...styles.input,
                ...(focusedInput === 'phone' && styles.inputFocus)
              }}
              onFocus={() => setFocusedInput('phone')}
              onBlur={() => setFocusedInput(null)}
              placeholder="Enter contact phone number"
            />
          </div>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Institution Address</label>
          <textarea
            value={profileData.address}
            onChange={(e) => setProfileData({...profileData, address: e.target.value})}
            style={{
              ...styles.textarea,
              ...(focusedInput === 'address' && styles.inputFocus)
            }}
            onFocus={() => setFocusedInput('address')}
            onBlur={() => setFocusedInput(null)}
            placeholder="Enter complete institution address"
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Institution Description</label>
          <textarea
            value={profileData.description}
            onChange={(e) => setProfileData({...profileData, description: e.target.value})}
            style={{
              ...styles.textarea,
              ...(focusedInput === 'description' && styles.inputFocus)
            }}
            onFocus={() => setFocusedInput('description')}
            onBlur={() => setFocusedInput(null)}
            placeholder="Describe your institution's mission, vision, and academic focus"
            rows={5}
          />
          <small style={{ color: '#718096', fontSize: '12px', marginTop: '5px', display: 'block' }}>
            This description helps students understand your institution's values and academic offerings.
          </small>
        </div>
        
        <button 
          style={styles.primaryButton}
          onClick={updateProfile}
          disabled={loading}
        >
          {loading ? 'Updating Profile...' : 'Save Institution Profile'}
        </button>
      </div>
    </div>
  );

  if (loading && !instituteData) {
    return (
      <div style={styles.portal}>
        <div style={styles.container}>
          <div style={styles.loading}>Loading Institute Portal...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.portal}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.headerTitle}>Institute Portal</h1>
            <p style={styles.headerSubtitle}>
              Welcome, {instituteData?.institutionName || profileData.institutionName || 'Administrator'}!
            </p>
            <p style={styles.headerInfo}>
              Applications are linked to your institution email: {user.email}
            </p>
          </div>
          <button 
            style={styles.logoutButton}
            onClick={onLogout}
          >
            Sign Out
          </button>
        </div>

        <div style={styles.nav}>
          <button 
            style={{
              ...styles.navButton,
              ...(activeTab === 'dashboard' && styles.navButtonActive)
            }}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard Overview
          </button>
          <button 
            style={{
              ...styles.navButton,
              ...(activeTab === 'faculties' && styles.navButtonActive)
            }}
            onClick={() => setActiveTab('faculties')}
          >
            Faculty Management
          </button>
          <button 
            style={{
              ...styles.navButton,
              ...(activeTab === 'courses' && styles.navButtonActive)
            }}
            onClick={() => setActiveTab('courses')}
          >
            Program Management
          </button>
          <button 
            style={{
              ...styles.navButton,
              ...(activeTab === 'applications' && styles.navButtonActive)
            }}
            onClick={() => setActiveTab('applications')}
          >
            Applications {stats.pendingApplications > 0 && `(${stats.pendingApplications})`}
          </button>
          <button 
            style={{
              ...styles.navButton,
              ...(activeTab === 'profile' && styles.navButtonActive)
            }}
            onClick={() => setActiveTab('profile')}
          >
            Institution Profile
          </button>
        </div>

        {loading && (
          <div style={styles.loading}>Processing your request...</div>
        )}

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'faculties' && renderFaculties()}
        {activeTab === 'courses' && renderCourses()}
        {activeTab === 'applications' && renderApplications()}
        {activeTab === 'profile' && renderProfile()}
      </div>
    </div>
  );
};

export default InstitutePortal;