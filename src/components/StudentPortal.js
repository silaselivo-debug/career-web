import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { 
  collection, query, where, getDocs, addDoc, updateDoc, doc, 
  onSnapshot, orderBy, getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const StudentPortal = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [studentData, setStudentData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [jobPostings, setJobPostings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [documents, setDocuments] = useState({
    resume: null,
    transcripts: null,
    certificates: null
  });
  const [loading, setLoading] = useState(false);
  const [studentMarks, setStudentMarks] = useState({
    mathematics: '',
    english: '',
    science: '',
    overall: ''
  });

  // Enhanced list of institutions in Lesotho with faculties, websites, and emails
  const lesothoInstitutions = [
    { 
      id: 'nul', 
      name: 'National University of Lesotho (NUL)', 
      website: 'https://www.nul.ls',
      email: 'nul.admissions@nul.ls',
      faculties: [
        {
          name: 'Faculty of Humanities',
          courses: [
            { 
              name: 'Bachelor of Arts in Development Studies', 
              requirements: 'Mathematics: 50%, English: 60%, Overall: 60%',
              duration: '4 years',
              description: 'Focus on community development and social change'
            },
            { 
              name: 'Bachelor of Arts in Political Science', 
              requirements: 'Mathematics: 50%, English: 65%, Overall: 65%',
              duration: '4 years',
              description: 'Study of political systems and governance'
            }
          ]
        },
        {
          name: 'Faculty of Science & Technology',
          courses: [
            { 
              name: 'Bachelor of Science in Computer Science', 
              requirements: 'Mathematics: 70%, Science: 60%, English: 50%, Overall: 65%',
              duration: '4 years',
              description: 'Software development and computer systems'
            },
            { 
              name: 'Bachelor of Science in Mathematics', 
              requirements: 'Mathematics: 75%, English: 50%, Overall: 70%',
              duration: '4 years',
              description: 'Advanced mathematical theory and applications'
            }
          ]
        },
        {
          name: 'Faculty of Health Sciences',
          courses: [
            { 
              name: 'Bachelor of Medicine and Bachelor of Surgery', 
              requirements: 'Mathematics: 70%, Science: 75%, English: 65%, Overall: 75%',
              duration: '6 years',
              description: 'Medical doctor training program'
            }
          ]
        }
      ]
    },
    { 
      id: 'limkokwing', 
      name: 'Limkokwing University of Creative Technology', 
      website: 'https://www.limkokwing.net/ls',
      email: 'admissions@limkokwing.ls',
      faculties: [
        {
          name: 'Faculty of Design & Innovation',
          courses: [
            { 
              name: 'Bachelor of Design in Graphic Design', 
              requirements: 'English: 60%, Overall: 55%',
              duration: '3 years',
              description: 'Creative design and visual communication'
            },
            { 
              name: 'Bachelor of Multimedia Design', 
              requirements: 'English: 60%, Mathematics: 50%, Overall: 55%',
              duration: '3 years',
              description: 'Digital media and interactive design'
            }
          ]
        },
        {
          name: 'Faculty of Business & Management',
          courses: [
            { 
              name: 'Bachelor of Business Administration', 
              requirements: 'Mathematics: 55%, English: 60%, Overall: 60%',
              duration: '3 years',
              description: 'Business management and administration'
            }
          ]
        },
        {
          name: 'Faculty of Information Technology',
          courses: [
            { 
              name: 'Bachelor of Information Technology', 
              requirements: 'Mathematics: 60%, English: 55%, Overall: 60%',
              duration: '3 years',
              description: 'IT systems and network management'
            }
          ]
        }
      ]
    },
    { 
      id: 'botho', 
      name: 'Botho University', 
      website: 'https://www.bothocollege.com/ls',
      email: 'admissions@bothocollege.ls',
      faculties: [
        {
          name: 'Faculty of Business & Accounting',
          courses: [
            { 
              name: 'Bachelor of Accounting', 
              requirements: 'Mathematics: 65%, English: 55%, Overall: 60%',
              duration: '4 years',
              description: 'Professional accounting and finance'
            }
          ]
        },
        {
          name: 'Faculty of Computing',
          courses: [
            { 
              name: 'Bachelor of Science in Software Engineering', 
              requirements: 'Mathematics: 65%, English: 50%, Overall: 60%',
              duration: '4 years',
              description: 'Software development and engineering'
            }
          ]
        }
      ]
    },
    { 
      id: 'lesotho_medical', 
      name: 'Lesotho Medical School', 
      website: 'http://www.nul.ls/faculty-of-health-sciences',
      email: 'medschool.admissions@nul.ls',
      faculties: [
        {
          name: 'Faculty of Medicine',
          courses: [
            { 
              name: 'Bachelor of Pharmacy', 
              requirements: 'Mathematics: 65%, Science: 70%, English: 60%, Overall: 70%',
              duration: '4 years',
              description: 'Pharmaceutical sciences and medicine'
            },
            { 
              name: 'Bachelor of Nursing', 
              requirements: 'Science: 60%, English: 55%, Overall: 60%',
              duration: '4 years',
              description: 'Nursing and patient care'
            }
          ]
        }
      ]
    },
    { 
      id: 'lesotho_agricultural', 
      name: 'Lesotho Agricultural College', 
      website: 'http://www.agriculture.gov.ls',
      email: 'admissions@agricollege.ls',
      faculties: [
        {
          name: 'Faculty of Agriculture',
          courses: [
            { 
              name: 'Diploma in General Agriculture', 
              requirements: 'Science: 55%, Mathematics: 50%, English: 50%, Overall: 55%',
              duration: '3 years',
              description: 'Agricultural science and farming techniques'
            }
          ]
        }
      ]
    },
    { 
      id: 'lesotho_teacher_training', 
      name: 'Lesotho College of Education', 
      website: 'http://www.lce.edu.ls',
      email: 'admissions@lce.edu.ls',
      faculties: [
        {
          name: 'Faculty of Education',
          courses: [
            { 
              name: 'Diploma in Primary Education', 
              requirements: 'English: 60%, Overall: 55%',
              duration: '3 years',
              description: 'Primary school teacher training'
            },
            { 
              name: 'Diploma in Secondary Education', 
              requirements: 'English: 60%, Subject-specific: 55%, Overall: 60%',
              duration: '3 years',
              description: 'Secondary school teacher training'
            }
          ]
        }
      ]
    }
  ];

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
    select: {
      width: '100%',
      padding: '12px 15px',
      border: '2px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '14px',
      background: 'white',
      transition: 'all 0.3s ease'
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
    fileInput: {
      width: '100%',
      padding: '12px 15px',
      border: '2px dashed #cbd5e0',
      borderRadius: '10px',
      fontSize: '14px',
      background: '#f7fafc',
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
    applicationCard: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
      border: '1px solid #e2e8f0',
      padding: '20px',
      borderRadius: '15px',
      marginBottom: '15px',
      transition: 'all 0.3s ease'
    },
    status: {
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
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      color: 'white',
      fontSize: '18px',
      fontWeight: 600
    },
    institutionSelector: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
      padding: '25px',
      borderRadius: '15px',
      marginBottom: '25px',
      border: '2px solid #e2e8f0'
    },
    facultySection: {
      background: 'rgba(255, 255, 255, 0.8)',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '20px',
      border: '1px solid #e2e8f0'
    },
    marksForm: {
      background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '20px',
      border: '1px solid #fdcb6e'
    },
    websiteLink: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: 600,
      marginRight: '15px',
      padding: '8px 15px',
      background: 'rgba(102, 126, 234, 0.1)',
      borderRadius: '8px',
      transition: 'all 0.3s ease'
    },
    emailLink: {
      color: '#28a745',
      textDecoration: 'none',
      fontWeight: 600,
      padding: '8px 15px',
      background: 'rgba(40, 167, 69, 0.1)',
      borderRadius: '8px',
      transition: 'all 0.3s ease'
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
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
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
    }
  };

  // Hover states
  const [hoveredCard, setHoveredCard] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);

  useEffect(() => {
    if (user) {
      fetchStudentData();
      fetchApplications();
      fetchJobPostings();
      setupNotifications();
    }
  }, [user]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const studentDoc = await getDoc(doc(db, 'users', user.uid));
      if (studentDoc.exists()) {
        const data = studentDoc.data();
        setStudentData(data);
        setProfileData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || ''
        });
        
        if (data.documents) {
          setDocuments(data.documents);
        }
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const applicationsSnapshot = await getDocs(
        query(collection(db, 'applications'), 
        where('studentId', '==', user.uid),
        orderBy('appliedAt', 'desc')
      ));
      const applicationsData = applicationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchJobPostings = async () => {
    try {
      const jobSnapshot = await getDocs(collection(db, 'jobPostings'));
      const jobData = jobSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobPostings(jobData);
    } catch (error) {
      console.error('Error fetching job postings:', error);
    }
  };

  const setupNotifications = () => {
    try {
      const unsubscribe = onSnapshot(
        query(collection(db, 'jobPostings'), orderBy('postedAt', 'desc')),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const job = change.doc.data();
              setNotifications(prev => [...prev, {
                id: change.doc.id,
                type: 'new_job',
                message: `New job posting: ${job.title}`,
                timestamp: new Date()
              }]);
            }
          });
        }
      );
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const handleCourseApplication = async (course, faculty, institution) => {
    // Check if student has already applied to 2 courses in this institution
    const institutionApplications = applications.filter(app => 
      app.institutionId === institution.id
    );
    
    if (institutionApplications.length >= 2) {
      alert('You can only apply for maximum 2 courses per institution');
      return;
    }

    // Check if already applied to this course
    const alreadyApplied = applications.find(app => 
      app.courseName === course.name && app.institutionId === institution.id
    );
    
    if (alreadyApplied) {
      alert('You have already applied to this course');
      return;
    }

    // Validate marks
    if (!validateMarksForCourse(course, studentMarks)) {
      alert('Your marks do not meet the minimum requirements for this course. Please check the requirements and try again.');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'applications'), {
        studentId: user.uid,
        studentName: studentData?.name || profileData.name,
        studentEmail: studentData?.email || user.email,
        institutionId: institution.id,
        institutionName: institution.name,
        institutionWebsite: institution.website,
        institutionEmail: institution.email,
        facultyName: faculty.name,
        courseName: course.name,
        courseRequirements: course.requirements,
        studentMarks: studentMarks,
        status: 'pending',
        appliedAt: new Date()
      });
      alert('Application submitted successfully!');
      fetchApplications();
      setStudentMarks({ mathematics: '', english: '', science: '', overall: '' });
    } catch (error) {
      console.error('Error applying for course:', error);
      alert('Error submitting application');
    } finally {
      setLoading(false);
    }
  };

  const validateMarksForCourse = (course, marks) => {
    const overallMark = parseInt(marks.overall) || 0;
    if (overallMark < 50) return false;
    return true;
  };

  const handleJobApplication = async (job) => {
    try {
      setLoading(true);
      await addDoc(collection(db, 'jobApplications'), {
        studentId: user.uid,
        studentName: studentData?.name || profileData.name,
        jobId: job.id,
        jobTitle: job.title,
        companyId: job.companyId,
        companyName: job.companyName,
        status: 'pending',
        appliedAt: new Date()
      });
      alert('Job application submitted successfully!');
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('Error submitting job application');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (fileType, file) => {
    if (!file) return;
    
    try {
      setLoading(true);
      const fileRef = ref(storage, `students/${user.uid}/${fileType}/${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      
      await updateDoc(doc(db, 'users', user.uid), {
        [`documents.${fileType}`]: downloadURL,
        [`documents.${fileType}UploadedAt`]: new Date(),
        [`documents.${fileType}Name`]: file.name
      });
      
      alert(`${fileType} uploaded successfully!`);
      fetchStudentData();
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error uploading document');
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
      fetchStudentData();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 700 }}>Student Dashboard</h3>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{applications.length}</div>
          <div style={styles.statLabel}>Total Applications</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{applications.filter(app => app.status === 'pending').length}</div>
          <div style={styles.statLabel}>Pending Review</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{applications.filter(app => app.status === 'admitted').length}</div>
          <div style={styles.statLabel}>Admitted</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{jobPostings.length}</div>
          <div style={styles.statLabel}>Available Jobs</div>
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
          <p style={{ color: '#718096', marginBottom: '10px' }}>Track your course applications and their current status</p>
          <button 
            style={styles.primaryButton}
            onClick={() => setActiveTab('applications')}
          >
            View All Applications
          </button>
        </div>
        
        <div 
          style={{
            ...styles.card,
            ...(hoveredCard === 'notifications' && styles.cardHover)
          }}
          onMouseEnter={() => setHoveredCard('notifications')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h4 style={{ marginBottom: '15px', color: '#2d3748' }}>Recent Updates</h4>
          {notifications.length > 0 ? (
            notifications.slice(0, 3).map((notification, index) => {
              const uniqueKey = `${notification.id}-${index}-${notification.timestamp}`;
              return (
                <div key={uniqueKey} style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', background: '#f7fafc', borderRadius: '8px', marginBottom: '8px' }}>
                  <small style={{ color: '#4a5568', fontWeight: 500 }}>{notification.message}</small>
                  <br />
                  <small style={{ color: '#a0aec0' }}>
                    {notification.timestamp.toLocaleDateString()}
                  </small>
                </div>
              );
            })
          ) : (
            <p style={{ color: '#a0aec0' }}>No new notifications</p>
          )}
        </div>
        
        <div 
          style={{
            ...styles.card,
            ...(hoveredCard === 'jobs' && styles.cardHover)
          }}
          onMouseEnter={() => setHoveredCard('jobs')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h4 style={{ marginBottom: '15px', color: '#2d3748' }}>Career Opportunities</h4>
          <p style={{ color: '#718096', marginBottom: '10px' }}>Explore job openings and internship opportunities</p>
          <button 
            style={styles.primaryButton}
            onClick={() => setActiveTab('jobs')}
          >
            Browse Jobs
          </button>
        </div>

        <div 
          style={{
            ...styles.card,
            ...(hoveredCard === 'courses' && styles.cardHover)
          }}
          onMouseEnter={() => setHoveredCard('courses')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h4 style={{ marginBottom: '15px', color: '#2d3748' }}>Continue Learning</h4>
          <p style={{ color: '#718096', marginBottom: '10px' }}>Browse and apply for courses from top institutions in Lesotho</p>
          <button 
            style={styles.primaryButton}
            onClick={() => setActiveTab('apply')}
          >
            Find Courses
          </button>
        </div>
      </div>
    </div>
  );

  const renderCourseApplication = () => {
    const currentInstitution = lesothoInstitutions.find(inst => inst.id === selectedInstitution);
    
    return (
      <div>
        <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 700 }}>Course Applications</h3>
        
        <div style={styles.institutionSelector}>
          <h4 style={{ marginBottom: '15px', color: '#2d3748' }}>Select Your Preferred Institution</h4>
          <div style={styles.formGroup}>
            <label style={styles.label}>Choose an institution in Lesotho:</label>
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              style={styles.select}
            >
              <option value="">Select an institution</option>
              {lesothoInstitutions.map(institution => (
                <option key={institution.id} value={institution.id}>
                  {institution.name}
                </option>
              ))}
            </select>
          </div>
          {selectedInstitution && currentInstitution && (
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                style={styles.secondaryButton}
                onClick={() => {
                  setSelectedInstitution('');
                  setStudentMarks({ mathematics: '', english: '', science: '', overall: '' });
                }}
              >
                Change Institution
              </button>
              {currentInstitution.website && (
                <a 
                  href={currentInstitution.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.websiteLink}
                >
                  Visit Website
                </a>
              )}
              {currentInstitution.email && (
                <a 
                  href={`mailto:${currentInstitution.email}`}
                  style={styles.emailLink}
                >
                  Email Admissions
                </a>
              )}
            </div>
          )}
        </div>

        {selectedInstitution && currentInstitution ? (
          <div>
            <h4 style={{ color: 'white', marginBottom: '20px', fontSize: '1.4rem' }}>
              Available Programs at {currentInstitution.name}
            </h4>
            
            {currentInstitution.faculties.map((faculty, facultyIndex) => (
              <div key={`${faculty.name}-${facultyIndex}`} style={styles.facultySection}>
                <h5 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '1.2rem', fontWeight: 600 }}>{faculty.name}</h5>
                <div style={styles.grid}>
                  {faculty.courses.map((course, courseIndex) => {
                    const courseKey = `${currentInstitution.id}-${faculty.name}-${course.name}-${courseIndex}`;
                    
                    return (
                      <div 
                        key={courseKey} 
                        style={{
                          ...styles.card,
                          ...(hoveredCard === courseKey && styles.cardHover)
                        }}
                        onMouseEnter={() => setHoveredCard(courseKey)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <h4 style={{ color: '#2d3748', marginBottom: '10px' }}>{course.name}</h4>
                        <p style={{ color: '#718096', marginBottom: '8px' }}><strong>Duration:</strong> {course.duration}</p>
                        <p style={{ color: '#718096', marginBottom: '8px' }}><strong>Requirements:</strong> {course.requirements}</p>
                        <p style={{ color: '#4a5568', marginBottom: '15px', fontStyle: 'italic' }}>{course.description}</p>
                        
                        <div style={styles.marksForm}>
                          <h5 style={{ marginBottom: '15px', color: '#856404' }}>Enter Your High School Marks (%)</h5>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Mathematics</label>
                              <input
                                type="number"
                                value={studentMarks.mathematics}
                                onChange={(e) => setStudentMarks({...studentMarks, mathematics: e.target.value})}
                                style={{
                                  ...styles.input,
                                  ...(focusedInput === 'math' && styles.inputFocus)
                                }}
                                onFocus={() => setFocusedInput('math')}
                                onBlur={() => setFocusedInput(null)}
                                placeholder="Math %"
                                min="0"
                                max="100"
                              />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>English</label>
                              <input
                                type="number"
                                value={studentMarks.english}
                                onChange={(e) => setStudentMarks({...studentMarks, english: e.target.value})}
                                style={{
                                  ...styles.input,
                                  ...(focusedInput === 'english' && styles.inputFocus)
                                }}
                                onFocus={() => setFocusedInput('english')}
                                onBlur={() => setFocusedInput(null)}
                                placeholder="English %"
                                min="0"
                                max="100"
                              />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Science</label>
                              <input
                                type="number"
                                value={studentMarks.science}
                                onChange={(e) => setStudentMarks({...studentMarks, science: e.target.value})}
                                style={{
                                  ...styles.input,
                                  ...(focusedInput === 'science' && styles.inputFocus)
                                }}
                                onFocus={() => setFocusedInput('science')}
                                onBlur={() => setFocusedInput(null)}
                                placeholder="Science %"
                                min="0"
                                max="100"
                              />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Overall Average</label>
                              <input
                                type="number"
                                value={studentMarks.overall}
                                onChange={(e) => setStudentMarks({...studentMarks, overall: e.target.value})}
                                style={{
                                  ...styles.input,
                                  ...(focusedInput === 'overall' && styles.inputFocus)
                                }}
                                onFocus={() => setFocusedInput('overall')}
                                onBlur={() => setFocusedInput(null)}
                                placeholder="Overall %"
                                min="0"
                                max="100"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <button 
                          style={styles.primaryButton}
                          onClick={() => handleCourseApplication(course, faculty, currentInstitution)}
                          disabled={loading}
                        >
                          {loading ? 'Submitting Application...' : 'Apply for This Program'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.card}>
            <h4 style={{ color: '#2d3748', marginBottom: '15px' }}>Available Institutions in Lesotho</h4>
            <p style={{ color: '#718096', marginBottom: '20px' }}>Select an institution to view available courses and programs. Each institution offers unique opportunities for your academic journey.</p>
            <div style={styles.grid}>
              {lesothoInstitutions.map(inst => (
                <div 
                  key={inst.id}
                  style={{
                    ...styles.card,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedInstitution(inst.id)}
                >
                  <h5 style={{ color: '#2d3748', marginBottom: '10px' }}>{inst.name}</h5>
                  <p style={{ color: '#718096', fontSize: '0.9rem' }}>Click to view programs and courses</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderApplications = () => (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 700 }}>My Applications</h3>
      {applications.length === 0 ? (
        <div style={styles.card}>
          <h4 style={{ color: '#2d3748', marginBottom: '15px' }}>No Applications Yet</h4>
          <p style={{ color: '#718096', marginBottom: '20px' }}>You haven't submitted any course applications yet. Start your academic journey by browsing available programs.</p>
          <button 
            style={styles.primaryButton}
            onClick={() => setActiveTab('apply')}
          >
            Browse Courses
          </button>
        </div>
      ) : (
        applications.map(application => {
          const uniqueKey = `${application.id}-${application.appliedAt}`;
          
          return (
            <div 
              key={uniqueKey} 
              style={{
                ...styles.applicationCard,
                ...(hoveredCard === uniqueKey && styles.cardHover)
              }}
              onMouseEnter={() => setHoveredCard(uniqueKey)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <h4 style={{ color: '#2d3748', margin: '0 0 8px 0' }}>{application.courseName}</h4>
                  <p style={{ color: '#718096', margin: '0 0 5px 0' }}><strong>Institution:</strong> {application.institutionName}</p>
                  <p style={{ color: '#718096', margin: '0 0 5px 0' }}><strong>Faculty:</strong> {application.facultyName}</p>
                </div>
                <div>
                  <span style={{
                    ...styles.status,
                    ...(application.status === 'pending' ? styles.statusPending :
                        application.status === 'admitted' ? styles.statusAdmitted : 
                        styles.statusRejected)
                  }}>
                    {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                  </span>
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <p style={{ color: '#4a5568', margin: '0 0 8px 0' }}><strong>Program Requirements:</strong> {application.courseRequirements}</p>
                <p style={{ color: '#4a5568', margin: '0 0 8px 0' }}><strong>Your Academic Profile:</strong> Mathematics: {application.studentMarks?.mathematics}%, 
                    English: {application.studentMarks?.english}%, 
                    Science: {application.studentMarks?.science}%, 
                    Overall: {application.studentMarks?.overall}%</p>
                <p style={{ color: '#a0aec0', margin: 0 }}>
                  <strong>Applied:</strong> {
                    application.appliedAt?.toDate ? 
                    application.appliedAt.toDate().toLocaleDateString() : 
                    new Date(application.appliedAt).toLocaleDateString()
                  }
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {application.institutionWebsite && (
                  <a 
                    href={application.institutionWebsite} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.websiteLink}
                  >
                    Visit Institution
                  </a>
                )}
                {application.institutionEmail && (
                  <a 
                    href={`mailto:${application.institutionEmail}`}
                    style={styles.emailLink}
                  >
                    Contact Admissions
                  </a>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const renderJobPortal = () => (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 700 }}>Career Opportunities</h3>
      {jobPostings.length === 0 ? (
        <div style={styles.card}>
          <h4 style={{ color: '#2d3748', marginBottom: '15px' }}>No Job Postings Available</h4>
          <p style={{ color: '#718096' }}>Check back later for new career opportunities and internship positions.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {jobPostings.map((job, index) => {
            const jobKey = `${job.id}-${index}`;
            
            return (
              <div 
                key={jobKey} 
                style={{
                  ...styles.card,
                  ...(hoveredCard === jobKey && styles.cardHover)
                }}
                onMouseEnter={() => setHoveredCard(jobKey)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <h4 style={{ color: '#2d3748', marginBottom: '15px' }}>{job.title}</h4>
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ color: '#718096', margin: '0 0 8px 0' }}><strong>Organization:</strong> {job.companyName}</p>
                  <p style={{ color: '#718096', margin: '0 0 8px 0' }}><strong>Location:</strong> {job.location}</p>
                  <p style={{ color: '#718096', margin: '0 0 8px 0' }}><strong>Compensation:</strong> {job.salary}</p>
                  <p style={{ color: '#4a5568', margin: '0 0 8px 0' }}><strong>Requirements:</strong> {job.requirements}</p>
                  <p style={{ color: '#4a5568', margin: 0 }}><strong>Qualifications:</strong> {job.qualifications}</p>
                </div>
                <button 
                  style={styles.primaryButton}
                  onClick={() => handleJobApplication(job)}
                  disabled={loading}
                >
                  {loading ? 'Applying...' : 'Apply for Position'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 700 }}>My Profile</h3>
      
      <div style={styles.card}>
        <h4 style={{ color: '#2d3748', marginBottom: '20px' }}>Personal Information</h4>
        <div style={styles.grid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              style={{
                ...styles.input,
                ...(focusedInput === 'name' && styles.inputFocus)
              }}
              onFocus={() => setFocusedInput('name')}
              onBlur={() => setFocusedInput(null)}
              placeholder="Enter your full name"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={profileData.email}
              style={styles.input}
              disabled
            />
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
              placeholder="Enter your phone number"
            />
          </div>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Residential Address</label>
          <textarea
            value={profileData.address}
            onChange={(e) => setProfileData({...profileData, address: e.target.value})}
            style={{
              ...styles.textarea,
              ...(focusedInput === 'address' && styles.inputFocus)
            }}
            onFocus={() => setFocusedInput('address')}
            onBlur={() => setFocusedInput(null)}
            placeholder="Enter your complete address"
          />
        </div>
        
        <button 
          style={styles.primaryButton}
          onClick={updateProfile}
          disabled={loading}
        >
          {loading ? 'Updating Profile...' : 'Save Profile Information'}
        </button>
      </div>

      <div style={styles.card}>
        <h4 style={{ color: '#2d3748', marginBottom: '20px' }}>Academic Documents</h4>
        <p style={{ color: '#718096', marginBottom: '20px' }}>
          Upload your academic documents to complete your profile. Supported file formats include PDF, DOC, and DOCX.
        </p>
        
        <div style={styles.grid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Curriculum Vitae / Resume</label>
            {documents.resume && (
              <p style={{ color: 'green', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                ✓ Document uploaded: {documents.resumeName || 'resume'}
              </p>
            )}
            <input
              type="file"
              onChange={(e) => handleDocumentUpload('resume', e.target.files[0])}
              style={styles.fileInput}
              accept=".pdf,.doc,.docx"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Academic Transcripts</label>
            {documents.transcripts && (
              <p style={{ color: 'green', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                ✓ Document uploaded: {documents.transcriptsName || 'transcripts'}
              </p>
            )}
            <input
              type="file"
              onChange={(e) => handleDocumentUpload('transcripts', e.target.files[0])}
              style={styles.fileInput}
              accept=".pdf,.doc,.docx"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Additional Certificates</label>
            {documents.certificates && (
              <p style={{ color: 'green', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                ✓ Document uploaded: {documents.certificatesName || 'certificates'}
              </p>
            )}
            <input
              type="file"
              onChange={(e) => handleDocumentUpload('certificates', e.target.files[0])}
              style={styles.fileInput}
              accept=".pdf,.doc,.docx"
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && !studentData) {
    return (
      <div style={styles.portal}>
        <div style={styles.container}>
          <div style={styles.loading}>Loading Student Portal...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.portal}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.headerTitle}>Student Portal</h1>
            <p style={styles.headerSubtitle}>Welcome back, {studentData?.name || user.email}!</p>
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
              ...(activeTab === 'apply' && styles.navButtonActive)
            }}
            onClick={() => setActiveTab('apply')}
          >
            Course Applications
          </button>
          <button 
            style={{
              ...styles.navButton,
              ...(activeTab === 'applications' && styles.navButtonActive)
            }}
            onClick={() => setActiveTab('applications')}
          >
            My Applications
          </button>
          <button 
            style={{
              ...styles.navButton,
              ...(activeTab === 'jobs' && styles.navButtonActive)
            }}
            onClick={() => setActiveTab('jobs')}
          >
            Career Portal
          </button>
          <button 
            style={{
              ...styles.navButton,
              ...(activeTab === 'profile' && styles.navButtonActive)
            }}
            onClick={() => setActiveTab('profile')}
          >
            Profile Settings
          </button>
        </div>

        {loading && (
          <div style={styles.loading}>Processing your request...</div>
        )}

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'apply' && renderCourseApplication()}
        {activeTab === 'applications' && renderApplications()}
        {activeTab === 'jobs' && renderJobPortal()}
        {activeTab === 'profile' && renderProfile()}
      </div>
    </div>
  );
};

export default StudentPortal;