import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, query, where, getDocs, addDoc, updateDoc, doc, 
  deleteDoc, getDoc
} from 'firebase/firestore';

const CompanyPortal = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [companyData, setCompanyData] = useState(null);
  const [jobPostings, setJobPostings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [qualifiedApplicants, setQualifiedApplicants] = useState([]);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    requirements: '',
    qualifications: '',
    location: '',
    salary: '',
    type: 'full-time'
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    qualifiedCandidates: 0
  });

  const styles = {
    portal: {
      minHeight: '100vh',
      background: '#f3f4f6',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
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
    select: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      background: 'white',
      cursor: 'pointer'
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
    dangerButton: {
      background: '#dc2626',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: 600,
      cursor: 'pointer'
    },
    applicantCard: {
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '12px'
    },
    jobCard: {
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '16px'
    },
    statusButton: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 600,
      marginRight: '8px',
      transition: 'all 0.2s ease'
    },
    reviewButton: { 
      background: '#16a34a', 
      color: 'white'
    },
    contactButton: { 
      background: '#0891b2', 
      color: 'white'
    },
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      color: '#374151',
      fontSize: '16px',
      fontWeight: 600
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
      textAlign: 'center',
      boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
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
    },
    score: {
      display: 'inline-block',
      padding: '6px 12px',
      background: '#16a34a',
      color: 'white',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: 600
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 600,
      display: 'inline-block',
      marginLeft: '8px'
    },
    statusPending: { background: '#fef3c7', color: '#92400e' },
    statusReviewed: { background: '#dbeafe', color: '#1e40af' },
    statusActive: { background: '#dbeafe', color: '#1e40af' },
    statusInactive: { background: '#fee2e2', color: '#991b1b' },
    qualificationSection: {
      background: '#fffbeb',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '16px',
      border: '1px solid '#fcd34d'
    },
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      marginTop: '8px'
    },
    skillTag: {
      background: '#dbeafe',
      color: '#1e40af',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 500
    }
  };

  // Rest of the component logic remains exactly the same...
  // Only CSS styles have been simplified

  useEffect(() => {
    if (user) {
      fetchCompanyData();
      fetchJobPostings();
      fetchApplications();
      fetchQualifiedApplicants();
    }
  }, [user]);

  useEffect(() => {
    setStats({
      totalJobs: jobPostings.length,
      activeJobs: jobPostings.filter(job => job.active).length,
      totalApplications: applications.length,
      qualifiedCandidates: qualifiedApplicants.length
    });
  }, [jobPostings, applications, qualifiedApplicants]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const companyDoc = await getDoc(doc(db, 'users', user.uid));
      if (companyDoc.exists()) {
        setCompanyData(companyDoc.data());
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobPostings = async () => {
    try {
      const jobSnapshot = await getDocs(
        query(collection(db, 'jobPostings'), where('companyId', '==', user.uid))
      );
      const jobData = jobSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobPostings(jobData);
    } catch (error) {
      console.error('Error fetching job postings:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const applicationsSnapshot = await getDocs(
        query(collection(db, 'jobApplications'), where('companyId', '==', user.uid))
      );
      const applicationsData = applicationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchQualifiedApplicants = async () => {
    try {
      const studentsSnapshot = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'student'))
      );
      const studentsData = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        qualificationScore: Math.floor(Math.random() * 100) + 1,
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS', 'Docker'].slice(0, Math.floor(Math.random() * 5) + 2),
        experience: Math.floor(Math.random() * 5),
        education: ['High School', 'Bachelor\'s', 'Master\'s', 'PhD'][Math.floor(Math.random() * 3)]
      }));
      
      const qualified = studentsData
        .sort((a, b) => b.qualificationScore - a.qualificationScore)
        .slice(0, 10);
      
      setQualifiedApplicants(qualified);
    } catch (error) {
      console.error('Error fetching qualified applicants:', error);
    }
  };

  const handlePostJob = async () => {
    if (!newJob.title.trim() || !newJob.description.trim()) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'jobPostings'), {
        title: newJob.title,
        description: newJob.description,
        requirements: newJob.requirements,
        qualifications: newJob.qualifications,
        location: newJob.location,
        salary: newJob.salary,
        type: newJob.type,
        companyId: user.uid,
        companyName: companyData?.companyName,
        postedAt: new Date(),
        active: true
      });
      setNewJob({
        title: '',
        description: '',
        requirements: '',
        qualifications: '',
        location: '',
        salary: '',
        type: 'full-time'
      });
      fetchJobPostings();
      alert('Job posted successfully!');
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Error posting job');
    } finally {
      setLoading(false);
    }
  };

  const toggleJobStatus = async (jobId, currentStatus) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'jobPostings', jobId), {
        active: !currentStatus
      });
      fetchJobPostings();
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Error updating job status');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId, jobTitle) => {
    if (!window.confirm(`Are you sure you want to delete the job "${jobTitle}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'jobPostings', jobId));
      fetchJobPostings();
      alert('Job deleted successfully!');
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Error deleting job');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'jobApplications', applicationId), {
        status: status,
        reviewedAt: new Date()
      });
      fetchApplications();
      alert(`Application marked as ${status}`);
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Error updating application');
    } finally {
      setLoading(false);
    }
  };

  // Render methods remain exactly the same...
  const renderDashboard = () => (
    <div>
      <h3 style={{ color: '#374151', marginBottom: '20px', fontSize: '1.5rem', fontWeight: 700 }}>Company Dashboard</h3>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{companyData?.companyName ? '✓' : 'N/A'}</div>
          <div style={styles.statLabel}>Company Profile</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.totalJobs}</div>
          <div style={styles.statLabel}>Total Jobs Posted</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.totalApplications}</div>
          <div style={styles.statLabel}>Applications Received</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.qualifiedCandidates}</div>
          <div style={styles.statLabel}>Top Candidates</div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h4 style={{ marginBottom: '15px', color: '#374151' }}>Job Analytics</h4>
          <div style={{ marginBottom: '15px' }}>
            <p style={{ color: '#6b7280', marginBottom: '8px' }}><strong>Active Jobs:</strong> {stats.activeJobs}</p>
            <p style={{ color: '#6b7280', marginBottom: '8px' }}><strong>Inactive Jobs:</strong> {stats.totalJobs - stats.activeJobs}</p>
            <p style={{ color: '#6b7280', marginBottom: '8px' }}><strong>Total Applications:</strong> {stats.totalApplications}</p>
          </div>
          {stats.totalApplications > 0 && (
            <button 
              style={styles.primaryButton}
              onClick={() => setActiveTab('applications')}
            >
              Review Applications
            </button>
          )}
        </div>
        
        <div style={styles.card}>
          <h4 style={{ marginBottom: '15px', color: '#374151' }}>Quick Actions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              style={styles.primaryButton}
              onClick={() => setActiveTab('postJob')}
            >
              Post New Job
            </button>
            <button 
              style={styles.primaryButton}
              onClick={() => setActiveTab('applicants')}
            >
              View Top Talent
            </button>
            <button 
              style={styles.secondaryButton}
              onClick={() => setActiveTab('jobs')}
            >
              Manage Jobs
            </button>
          </div>
        </div>
        
        <div style={styles.card}>
          <h4 style={{ marginBottom: '15px', color: '#374151' }}>Recent Activity</h4>
          {applications.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>No recent applications</p>
          ) : (
            applications.slice(0, 5).map(application => (
              <div key={application.id} style={{ 
                padding: '10px', 
                borderBottom: '1px solid #e5e7eb', 
                background: '#f9fafb',
                borderRadius: '6px',
                marginBottom: '6px'
              }}>
                <strong style={{ color: '#374151' }}>{application.studentName}</strong> applied to <strong>{application.jobTitle}</strong>
                <br />
                <small style={{ color: '#9ca3af' }}>
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

  // Other render methods (renderPostJob, renderJobPostings, renderApplicants, renderJobApplications) 
  // remain exactly the same as your original code, just with the simplified CSS...

  if (loading && !companyData) {
    return (
      <div style={styles.portal}>
        <div style={styles.container}>
          <div style={styles.loading}>Loading Company Portal...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.portal}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.headerTitle}>Company Portal</h1>
            <p style={styles.headerSubtitle}>
              Welcome, {companyData?.companyName || 'Company'}!
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
            Dashboard
          </button>
          <button 
            style={{
              ...styles.navButton,
              ...(activeTab === 'postJob' && styles.navButtonActive)
            }}
            onClick={() => setActiveTab('postJob')}
          >
            Post Job
          </button>
          <button 
            style={{
              ...styles.navButton,
              ...(activeTab === 'jobs' && styles.navButtonActive)
            }}
            onClick={() => setActiveTab('jobs')}
          >
            Manage Jobs
          </button>
          <button 
            style={{
              ...styles.navButton,
              ...(activeTab === 'applicants' && styles.navButtonActive)
            }}
            onClick={() => setActiveTab('applicants')}
          >
            Top Talent
          </button>
          <button 
            style={{
              ...styles.navButton,
              ...(activeTab === 'applications' && styles.navButtonActive)
            }}
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </button>
        </div>

        {loading && (
          <div style={styles.loading}>Processing...</div>
        )}

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'postJob' && renderPostJob()}
        {activeTab === 'jobs' && renderJobPostings()}
        {activeTab === 'applicants' && renderApplicants()}
        {activeTab === 'applications' && renderJobApplications()}
      </div>
    </div>
  );
};

export default CompanyPortal;
