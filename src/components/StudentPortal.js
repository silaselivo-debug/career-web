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
      background: '#f3f4f6',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      display: 'flex',
      flexDirection: 'column'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      flex: '1'
    },
    header: {
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: '1px solid #e5e7eb'
    },
    headerContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px'
    },
    headerTitle: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: '#2563eb',
      margin: 0
    },
    headerSubtitle: {
      fontSize: '1rem',
      color: '#6b7280',
      margin: 0,
      fontWeight: 500
    },
    nav: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
      flexWrap: 'wrap',
      background: 'white',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    navButton: {
      padding: '10px 20px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 600,
      transition: 'all 0.2s ease',
      background: 'white',
      color: '#374151'
    },
    navButtonActive: {
      background: '#2563eb',
      color: 'white',
      borderColor: '#2563eb'
    },
    logoutButton: {
      padding: '8px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 600,
      background: 'white',
      color: '#374151',
      transition: 'all 0.2s ease'
    },
    card: {
      background: 'white',
      padding: '24px',
      borderRadius: '8px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginTop: '20px'
    },
    formGroup: {
      marginBottom: '16px'
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
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      background: 'white'
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      background: 'white',
      cursor: 'pointer'
    },
    textarea: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      minHeight: '100px',
      resize: 'vertical',
      background: 'white'
    },
    fileInput: {
      width: '100%',
      padding: '10px 12px',
      border: '1px dashed #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      background: '#f9fafb'
    },
    primaryButton: {
      background: '#2563eb',
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    secondaryButton: {
      background: 'white',
      color: '#2563eb',
      border: '1px solid #2563eb',
      padding: '10px 18px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    applicationCard: {
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '12px'
    },
    status: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 600,
      display: 'inline-block',
      marginLeft: '8px'
    },
    statusPending: { background: '#fef3c7', color: '#92400e' },
    statusAdmitted: { background: '#dbeafe', color: '#1e40af' },
    statusRejected: { background: '#fee2e2', color: '#991b1b' },
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      color: '#374151',
      fontSize: '16px',
      fontWeight: 600
    },
    institutionSelector: {
      background: '#f9fafb',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #e5e7eb'
    },
    facultySection: {
      background: 'white',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '16px',
      border: '1px solid #e5e7eb'
    },
    marksForm: {
      background: '#fffbeb',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '16px',
      border: '1px solid #fcd34d'
    },
    websiteLink: {
      color: '#2563eb',
      textDecoration: 'none',
      fontWeight: 600,
      marginRight: '12px',
      padding: '6px 12px',
      background: '#dbeafe',
      borderRadius: '6px',
      fontSize: '12px'
    },
    emailLink: {
      color: '#16a34a',
      textDecoration: 'none',
      fontWeight: 600,
      padding: '6px 12px',
      background: '#dcfce7',
      borderRadius: '6px',
      fontSize: '12px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '16px',
      marginTop: '16px'
    },
    statCard: {
      background: '#2563eb',
      color: 'white',
      padding: '20px',
      borderRadius: '8px',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: 700,
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
      <h3 style={{ color: '#374151', marginBottom: '20px', fontSize: '1.5rem', fontWeight: 700 }}>Student Dashboard</h3>
      
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
        <div style={styles.card}>
          <h4 style={{ marginBottom: '15px', color: '#374151' }}>Application Overview</h4>
          <p style={{ color: '#6b7280', marginBottom: '10px' }}>Track your course applications and their current status</p>
          <button 
            style={styles.primaryButton}
            onClick={() => setActiveTab('applications')}
          >
            View All Applications
          </button>
        </div>
        
        <div style={styles.card}>
          <h4 style={{ marginBottom: '15px', color: '#374151' }}>Recent Updates</h4>
          {notifications.length > 0 ? (
            notifications.slice(0, 3).map((notification, index) => {
              const uniqueKey = `${notification.id}-${index}-${notification.timestamp}`;
              return (
                <div key={uniqueKey} style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', borderRadius: '6px', marginBottom: '6px' }}>
                  <small style={{ color: '#4b5563', fontWeight: 500 }}>{notification.message}</small>
                  <br />
                  <small style={{ color: '#9ca3af' }}>
                    {notification.timestamp.toLocaleDateString()}
                  </small>
                </div>
              );
            })
          ) : (
            <p style={{ color: '#9ca3af' }}>No new notifications</p>
          )}
        </div>
        
        <div style={styles.card}>
          <h4 style={{ marginBottom: '15px', color: '#374151' }}>Career Opportunities</h4>
          <p style={{ color: '#6b7280', marginBottom: '10px' }}>Explore job openings and internship opportunities</p>
          <button 
            style={styles.primaryButton}
            onClick={() => setActiveTab('jobs')}
          >
            Browse Jobs
          </button>
        </div>

        <div style={styles.card}>
          <h4 style={{ marginBottom: '15px', color: '#374151' }}>Continue Learning</h4>
          <p style={{ color: '#6b7280', marginBottom: '10px' }}>Browse and apply for courses from top institutions in Lesotho</p>
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
        <h3 style={{ color: '#374151', marginBottom: '20px', fontSize: '1.5rem', fontWeight: 700 }}>Course Applications</h3>
        
        <div style={styles.institutionSelector}>
          <h4 style={{ marginBottom: '15px', color: '#374151' }}>Select Your Preferred Institution</h4>
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
            <h4 style={{ color: '#374151', marginBottom: '20px', fontSize: '1.2rem' }}>
              Available Programs at {currentInstitution.name}
            </h4>
            
            {currentInstitution.faculties.map((faculty, facultyIndex) => (
              <div key={`${faculty.name}-${facultyIndex}`} style={styles.facultySection}>
                <h5 style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '1.1rem', fontWeight: 600 }}>{faculty.name}</h5>
                <div style={styles.grid}>
                  {faculty.courses.map((course, courseIndex) => {
                    const courseKey = `${currentInstitution.id}-${faculty.name}-${course.name}-${courseIndex}`;
                    
                    return (
                      <div 
                        key={courseKey} 
                        style={styles.card}
                      >
                        <h4 style={{ color: '#374151', marginBottom: '10px' }}>{course.name}</h4>
                        <p style={{ color: '#6b7280', marginBottom: '8px' }}><strong>Duration:</strong> {course.duration}</p>
                        <p style={{ color: '#6b7280', marginBottom: '8px' }}><strong>Requirements:</strong> {course.requirements}</p>
                        <p style={{ color: '#4b5563', marginBottom: '15px', fontStyle: 'italic' }}>{course.description}</p>
                        
                        <div style={styles.marksForm}>
                          <h5 style={{ marginBottom: '15px', color: '#92400e' }}>Enter Your High School Marks (%)</h5>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Mathematics</label>
                              <input
                                type="number"
                                value={studentMarks.mathematics}
                                onChange={(e) => setStudentMarks({...studentMarks, mathematics: e.target.value})}
                                style={styles.input}
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
                                style={styles.input}
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
                                style={styles.input}
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
                                style={styles.input}
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
            <h4 style={{ color: '#374151', marginBottom: '15px' }}>Available Institutions in Lesotho</h4>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>Select an institution to view available courses and programs. Each institution offers unique opportunities for your academic journey.</p>
            <div style={styles.grid}>
              {lesothoInstitutions.map(inst => (
                <div 
                  key={inst.id}
                  style={{
                    ...styles.card,
                    background: '#f9fafb',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedInstitution(inst.id)}
                >
                  <h5 style={{ color: '#374151', marginBottom: '10px' }}>{inst.name}</h5>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Click to view programs and courses</p>
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
      <h3 style={{ color: '#374151', marginBottom: '20px', fontSize: '1.5rem', fontWeight: 700 }}>My Applications</h3>
      {applications.length === 0 ? (
        <div style={styles.card}>
          <h4 style={{ color: '#374151', marginBottom: '15px' }}>No Applications Yet</h4>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>You haven't submitted any course applications yet. Start your academic journey by browsing available programs.</p>
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
              style={styles.applicationCard}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <h4 style={{ color: '#374151', margin: '0 0 8px 0' }}>{application.courseName}</h4>
                  <p style={{ color: '#6b7280', margin: '0 0 5px 0' }}><strong>Institution:</strong> {application.institutionName}</p>
                  <p style={{ color: '#6b7280', margin: '0 0 5px 0' }}><strong>Faculty:</strong> {application.facultyName}</p>
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
                <p style={{ color: '#4b5563', margin: '0 0 8px 0' }}><strong>Program Requirements:</strong> {application.courseRequirements}</p>
                <p style={{ color: '#4b5563', margin: '0 0 8px 0' }}><strong>Your Academic Profile:</strong> Mathematics: {application.studentMarks?.mathematics}%, 
                    English: {application.studentMarks?.english}%, 
                    Science: {application.studentMarks?.science}%, 
                    Overall: {application.studentMarks?.overall}%</p>
                <p style={{ color: '#9ca3af', margin: 0 }}>
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
      <h3 style={{ color: '#374151', marginBottom: '20px', fontSize: '1.5rem', fontWeight: 700 }}>Career Opportunities</h3>
      {jobPostings.length === 0 ? (
        <div style={styles.card}>
          <h4 style={{ color: '#374151', marginBottom: '15px' }}>No Job Postings Available</h4>
          <p style={{ color: '#6b7280' }}>Check back later for new career opportunities and internship positions.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {jobPostings.map((job, index) => {
            const jobKey = `${job.id}-${index}`;
            
            return (
              <div 
                key={jobKey} 
                style={styles.card}
              >
                <h4 style={{ color: '#374151', marginBottom: '15px' }}>{job.title}</h4>
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ color: '#6b7280', margin: '0 0 8px 0' }}><strong>Organization:</strong> {job.companyName}</p>
                  <p style={{ color: '#6b7280', margin: '0 0 8px 0' }}><strong>Location:</strong> {job.location}</p>
                  <p style={{ color: '#6b7280', margin: '0 0 8px 0' }}><strong>Compensation:</strong> {job.salary}</p>
                  <p style={{ color: '#4b5563', margin: '0 0 8px 0' }}><strong>Requirements:</strong> {job.requirements}</p>
                  <p style={{ color: '#4b5563', margin: 0 }}><strong>Qualifications:</strong> {job.qualifications}</p>
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
      <h3 style={{ color: '#374151', marginBottom: '20px', fontSize: '1.5rem', fontWeight: 700 }}>My Profile</h3>
      
      <div style={styles.card}>
        <h4 style={{ color: '#374151', marginBottom: '20px' }}>Personal Information</h4>
        <div style={styles.grid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              style={styles.input}
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
              style={styles.input}
              placeholder="Enter your phone number"
            />
          </div>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Residential Address</label>
          <textarea
            value={profileData.address}
            onChange={(e) => setProfileData({...profileData, address: e.target.value})}
            style={styles.textarea}
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
        <h4 style={{ color: '#374151', marginBottom: '20px' }}>Academic Documents</h4>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>
          Upload your academic documents to complete your profile. Supported file formats include PDF, DOC, and DOCX.
        </p>
        
        <div style={styles.grid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Curriculum Vitae / Resume</label>
            {documents.resume && (
              <p style={{ color: '#16a34a', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
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
              <p style={{ color: '#16a34a', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
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
              <p style={{ color: '#16a34a', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
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
            Dashboard
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
