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
    applicantCard: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
      border: '1px solid #e2e8f0',
      padding: '20px',
      borderRadius: '15px',
      marginBottom: '15px',
      transition: 'all 0.3s ease'
    },
    jobCard: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
      border: '1px solid #e2e8f0',
      padding: '25px',
      borderRadius: '15px',
      marginBottom: '20px',
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
    reviewButton: { 
      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', 
      color: 'white',
      boxShadow: '0 3px 10px rgba(40, 167, 69, 0.3)'
    },
    contactButton: { 
      background: 'linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%)', 
      color: 'white',
      boxShadow: '0 3px 10px rgba(23, 162, 184, 0.3)'
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
    score: {
      display: 'inline-block',
      padding: '8px 15px',
      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
      color: 'white',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: 700,
      boxShadow: '0 3px 10px rgba(40, 167, 69, 0.3)'
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
    statusReviewed: { background: '#d1edff', color: '#004085' },
    statusActive: { background: '#d1edff', color: '#004085' },
    statusInactive: { background: '#f8d7da', color: '#721c24' },
    qualificationSection: {
      background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '20px',
      border: '1px solid #fdcb6e'
    },
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '10px'
    },
    skillTag: {
      background: 'rgba(102, 126, 234, 0.1)',
      color: '#667eea',
      padding: '4px 12px',
      borderRadius: '15px',
      fontSize: '12px',
      fontWeight: 600,
      border: '1px solid rgba(102, 126, 234, 0.2)'
    }
  };

  // Hover states
  const [hoveredCard, setHoveredCard] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);

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

  const renderDashboard = () => (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 700 }}>Talent Acquisition Dashboard</h3>
      
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
        <div 
          style={{
            ...styles.card,
            ...(hoveredCard === 'jobStats' && styles.cardHover)
          }}
          onMouseEnter={() => setHoveredCard('jobStats')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h4 style={{ marginBottom: '15px', color: '#2d3748' }}>Employment Analytics</h4>
          <div style={{ marginBottom: '15px' }}>
            <p style={{ color: '#718096', marginBottom: '8px' }}><strong>Active Opportunities:</strong> {stats.activeJobs}</p>
            <p style={{ color: '#718096', marginBottom: '8px' }}><strong>Inactive Listings:</strong> {stats.totalJobs - stats.activeJobs}</p>
            <p style={{ color: '#718096', marginBottom: '8px' }}><strong>Total Applications:</strong> {stats.totalApplications}</p>
            {stats.totalApplications > 0 && (
              <p style={{ color: '#718096', marginBottom: '15px' }}>
                <strong>Average per Position:</strong> {(stats.totalApplications / stats.totalJobs).toFixed(1)} applications
              </p>
            )}
          </div>
          {stats.totalApplications > 0 && (
            <button 
              style={styles.primaryButton}
              onClick={() => setActiveTab('applications')}
            >
              Review All Applications
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
          <h4 style={{ marginBottom: '15px', color: '#2d3748' }}>Recruitment Actions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              style={styles.primaryButton}
              onClick={() => setActiveTab('postJob')}
            >
              Create New Position
            </button>
            <button 
              style={styles.primaryButton}
              onClick={() => setActiveTab('applicants')}
            >
              Discover Top Talent
            </button>
            <button 
              style={styles.secondaryButton}
              onClick={() => setActiveTab('jobs')}
            >
              Manage Job Listings
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
          <h4 style={{ marginBottom: '15px', color: '#2d3748' }}>Recent Candidate Activity</h4>
          {applications.length === 0 ? (
            <p style={{ color: '#a0aec0', textAlign: 'center', padding: '20px' }}>No recent applications</p>
          ) : (
            applications.slice(0, 5).map(application => (
              <div key={application.id} style={{ 
                padding: '12px', 
                borderBottom: '1px solid #e2e8f0', 
                background: '#f7fafc',
                borderRadius: '8px',
                marginBottom: '8px'
              }}>
                <strong style={{ color: '#2d3748' }}>{application.studentName}</strong> applied to <strong>{application.jobTitle}</strong>
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

  const renderPostJob = () => (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 700 }}>Create Employment Opportunity</h3>
      <div style={styles.card}>
        <h4 style={{ marginBottom: '20px', color: '#2d3748' }}>Position Details</h4>
        <div style={styles.grid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Position Title *</label>
            <input
              type="text"
              value={newJob.title}
              onChange={(e) => setNewJob({...newJob, title: e.target.value})}
              style={{
                ...styles.input,
                ...(focusedInput === 'jobTitle' && styles.inputFocus)
              }}
              onFocus={() => setFocusedInput('jobTitle')}
              onBlur={() => setFocusedInput(null)}
              placeholder="e.g., Senior Software Engineer"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Employment Type</label>
            <select
              value={newJob.type}
              onChange={(e) => setNewJob({...newJob, type: e.target.value})}
              style={styles.select}
            >
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Work Location</label>
            <input
              type="text"
              value={newJob.location}
              onChange={(e) => setNewJob({...newJob, location: e.target.value})}
              style={{
                ...styles.input,
                ...(focusedInput === 'location' && styles.inputFocus)
              }}
              onFocus={() => setFocusedInput('location')}
              onBlur={() => setFocusedInput(null)}
              placeholder="e.g., New York, NY or Remote"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Compensation Range</label>
            <input
              type="text"
              value={newJob.salary}
              onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
              style={{
                ...styles.input,
                ...(focusedInput === 'salary' && styles.inputFocus)
              }}
              onFocus={() => setFocusedInput('salary')}
              onBlur={() => setFocusedInput(null)}
              placeholder="e.g., $80,000 - $100,000"
            />
          </div>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Position Description *</label>
          <textarea
            value={newJob.description}
            onChange={(e) => setNewJob({...newJob, description: e.target.value})}
            style={{
              ...styles.textarea,
              ...(focusedInput === 'description' && styles.inputFocus)
            }}
            onFocus={() => setFocusedInput('description')}
            onBlur={() => setFocusedInput(null)}
            placeholder="Describe the role responsibilities, team environment, and impact..."
            rows={5}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Required Qualifications *</label>
          <textarea
            value={newJob.requirements}
            onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
            style={{
              ...styles.textarea,
              ...(focusedInput === 'requirements' && styles.inputFocus)
            }}
            onFocus={() => setFocusedInput('requirements')}
            onBlur={() => setFocusedInput(null)}
            placeholder="List essential skills, experience, and mandatory requirements..."
            rows={4}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Preferred Qualifications</label>
          <textarea
            value={newJob.qualifications}
            onChange={(e) => setNewJob({...newJob, qualifications: e.target.value})}
            style={{
              ...styles.textarea,
              ...(focusedInput === 'qualifications' && styles.inputFocus)
            }}
            onFocus={() => setFocusedInput('qualifications')}
            onBlur={() => setFocusedInput(null)}
            placeholder="List additional skills, certifications, and educational background that would be beneficial..."
            rows={4}
          />
        </div>
        
        <button 
          style={styles.primaryButton}
          onClick={handlePostJob}
          disabled={loading}
        >
          {loading ? 'Publishing Opportunity...' : 'Publish Position'}
        </button>
      </div>
    </div>
  );

  const renderJobPostings = () => (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 700 }}>Career Opportunities Management</h3>
      {jobPostings.length === 0 ? (
        <div style={styles.card}>
          <h4 style={{ color: '#2d3748', marginBottom: '15px' }}>No Positions Listed</h4>
          <p style={{ color: '#718096', marginBottom: '20px' }}>Create your first job posting to start attracting talented candidates to your organization.</p>
          <button 
            style={styles.primaryButton}
            onClick={() => setActiveTab('postJob')}
          >
            Create First Position
          </button>
        </div>
      ) : (
        <div>
          {jobPostings.map(job => (
            <div 
              key={job.id} 
              style={{
                ...styles.jobCard,
                ...(hoveredCard === job.id && styles.cardHover)
              }}
              onMouseEnter={() => setHoveredCard(job.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>{job.title}</h4>
                  <p style={{ margin: '5px 0', color: '#718096' }}>
                    <strong>Employment Type:</strong> {job.type?.charAt(0).toUpperCase() + job.type?.slice(1)} | 
                    <strong> Location:</strong> {job.location}
                  </p>
                  <p style={{ margin: '5px 0', color: '#718096' }}>
                    <strong>Compensation:</strong> {job.salary}
                  </p>
                  <p style={{ margin: '5px 0', color: '#4a5568' }}>{job.description?.substring(0, 150)}...</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    ...styles.statusBadge,
                    ...(job.active ? styles.statusActive : styles.statusInactive)
                  }}>
                    {job.active ? 'Active' : 'Inactive'}
                  </span>
                  <p style={{ margin: '10px 0 5px 0', color: '#a0aec0', fontSize: '13px' }}>
                    <strong>Applications:</strong> {applications.filter(app => app.jobId === job.id).length}
                  </p>
                  <p style={{ margin: '0', color: '#a0aec0', fontSize: '12px' }}>
                    Posted: {job.postedAt?.toDate ? 
                      job.postedAt.toDate().toLocaleDateString() : 
                      new Date(job.postedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  style={styles.primaryButton}
                  onClick={() => toggleJobStatus(job.id, job.active)}
                  disabled={loading}
                >
                  {job.active ? 'Deactivate Listing' : 'Activate Listing'}
                </button>
                <button 
                  style={styles.secondaryButton}
                  onClick={() => {
                    const jobApplications = applications.filter(app => app.jobId === job.id);
                    if (jobApplications.length > 0) {
                      setActiveTab('applications');
                    } else {
                      alert('No applications received for this position yet.');
                    }
                  }}
                >
                  View Applications ({applications.filter(app => app.jobId === job.id).length})
                </button>
                <button 
                  style={styles.dangerButton}
                  onClick={() => handleDeleteJob(job.id, job.title)}
                  disabled={loading}
                >
                  Remove Position
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderApplicants = () => (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 700 }}>Top Talent Discovery</h3>
      
      <div style={styles.qualificationSection}>
        <h4 style={{ marginBottom: '15px', color: '#856404' }}>Candidate Qualification System</h4>
        <p style={{ color: '#856404', marginBottom: '10px' }}>
          Our system evaluates candidates based on multiple factors to identify the best matches for your opportunities:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <strong>Academic Performance</strong>
            <p style={{ margin: '5px 0', fontSize: '13px' }}>GPA, transcripts, and academic achievements</p>
          </div>
          <div>
            <strong>Technical Skills</strong>
            <p style={{ margin: '5px 0', fontSize: '13px' }}>Relevant technologies and programming languages</p>
          </div>
          <div>
            <strong>Professional Experience</strong>
            <p style={{ margin: '5px 0', fontSize: '13px' }}>Work history, internships, and projects</p>
          </div>
          <div>
            <strong>Certifications</strong>
            <p style={{ margin: '5px 0', fontSize: '13px' }}>Industry-recognized qualifications and badges</p>
          </div>
        </div>
        <p style={{ color: '#856404', marginTop: '15px', fontSize: '14px', fontStyle: 'italic' }}>
          Showing top {qualifiedApplicants.length} candidates based on comprehensive qualification scoring
        </p>
      </div>
      
      {qualifiedApplicants.length === 0 ? (
        <div style={styles.card}>
          <h4 style={{ color: '#2d3748', marginBottom: '15px' }}>No Qualified Candidates Available</h4>
          <p style={{ color: '#718096' }}>Check back later as new candidates join the platform and complete their profiles.</p>
        </div>
      ) : (
        qualifiedApplicants.map(applicant => (
          <div 
            key={applicant.id} 
            style={{
              ...styles.applicantCard,
              ...(hoveredCard === applicant.id && styles.cardHover)
            }}
            onMouseEnter={() => setHoveredCard(applicant.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#2d3748' }}>{applicant.name || 'Student Candidate'}</h4>
                <p style={{ margin: '5px 0', color: '#718096' }}>{applicant.email}</p>
                <p style={{ margin: '5px 0', color: '#4a5568' }}>
                  <strong>Education Level:</strong> {applicant.education} | 
                  <strong> Professional Experience:</strong> {applicant.experience} years
                </p>
                
                <div style={styles.skillsList}>
                  {applicant.skills?.map((skill, index) => (
                    <span key={index} style={styles.skillTag}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={styles.score}>{applicant.qualificationScore}/100</div>
                <p style={{ margin: '8px 0 0 0', color: '#a0aec0', fontSize: '12px' }}>Match Score</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                style={{...styles.statusButton, ...styles.reviewButton}}
                onClick={() => {
                  alert(`Candidate Profile: ${applicant.name}\n\nEmail: ${applicant.email}\nEducation: ${applicant.education}\nExperience: ${applicant.experience} years\nSkills: ${applicant.skills?.join(', ')}\nQualification Score: ${applicant.qualificationScore}/100`);
                }}
              >
                View Complete Profile
              </button>
              <button 
                style={{...styles.statusButton, ...styles.contactButton}}
                onClick={() => {
                  alert(`Accessing documents for ${applicant.name}\n\nResume, academic transcripts, and professional certificates would be available here.`);
                }}
              >
                Review Documents
              </button>
              <button 
                style={styles.primaryButton}
                onClick={() => {
                  alert(`Initiating contact with ${applicant.name} at ${applicant.email}\n\nDirect messaging and email integration would be available.`);
                }}
              >
                Initiate Contact
              </button>
              <button 
                style={styles.secondaryButton}
                onClick={() => {
                  alert(`Scheduling interview with ${applicant.name}\n\nCalendar integration and meeting coordination tools would appear here.`);
                }}
              >
                Schedule Interview
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderJobApplications = () => (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 700 }}>Candidate Applications Management</h3>
      {applications.length === 0 ? (
        <div style={styles.card}>
          <h4 style={{ color: '#2d3748', marginBottom: '15px' }}>No Applications Received</h4>
          <p style={{ color: '#718096', marginBottom: '20px' }}>Candidate applications will appear here once they start applying to your published positions.</p>
          <p style={{ color: '#a0aec0', fontSize: '14px' }}>Ensure your job listings are active and properly promoted to attract qualified candidates.</p>
        </div>
      ) : (
        <div>
          <div style={{...styles.card, marginBottom: '25px'}}>
            <h4 style={{ marginBottom: '15px', color: '#2d3748' }}>Application Pipeline Overview</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              <div style={{ textAlign: 'center', padding: '15px', background: '#f7fafc', borderRadius: '10px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#667eea' }}>{applications.length}</div>
                <div style={{ fontSize: '0.9rem', color: '#718096' }}>Total</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: '#fff3cd', borderRadius: '10px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#856404' }}>{applications.filter(app => app.status === 'pending').length}</div>
                <div style={{ fontSize: '0.9rem', color: '#856404' }}>Pending</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: '#d1edff', borderRadius: '10px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#004085' }}>{applications.filter(app => app.status === 'reviewed').length}</div>
                <div style={{ fontSize: '0.9rem', color: '#004085' }}>Reviewed</div>
              </div>
            </div>
          </div>
          
          {applications.map(application => (
            <div 
              key={application.id} 
              style={{
                ...styles.applicantCard,
                ...(hoveredCard === application.id && styles.cardHover)
              }}
              onMouseEnter={() => setHoveredCard(application.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#2d3748' }}>{application.jobTitle}</h4>
                  <p style={{ margin: '0 0 5px 0', color: '#718096' }}><strong>Candidate:</strong> {application.studentName}</p>
                  <p style={{ margin: '0 0 5px 0', color: '#718096' }}><strong>Contact:</strong> {application.studentEmail}</p>
                </div>
                <div>
                  <span style={{ 
                    ...styles.statusBadge,
                    ...(application.status === 'pending' ? styles.statusPending : styles.statusReviewed)
                  }}>
                    {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                  </span>
                  <p style={{ margin: '8px 0 0 0', color: '#a0aec0', fontSize: '12px' }}>
                    Applied: {application.appliedAt?.toDate ? 
                      application.appliedAt.toDate().toLocaleDateString() : 
                      new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {application.status === 'pending' && (
                  <button 
                    style={{...styles.statusButton, ...styles.reviewButton}}
                    onClick={() => updateApplicationStatus(application.id, 'reviewed')}
                    disabled={loading}
                  >
                    Mark as Reviewed
                  </button>
                )}
                <button 
                  style={styles.secondaryButton}
                  onClick={() => {
                    alert(`Application Details:\n\nCandidate: ${application.studentName}\nPosition: ${application.jobTitle}\nStatus: ${application.status}\nApplied: ${application.appliedAt?.toDate ? application.appliedAt.toDate().toLocaleDateString() : new Date(application.appliedAt).toLocaleDateString()}\nContact: ${application.studentEmail}`);
                  }}
                >
                  View Application Details
                </button>
                <button 
                  style={styles.primaryButton}
                  onClick={() => {
                    alert(`Contacting ${application.studentName} regarding their application for ${application.jobTitle}\n\nCommunication tools and templates would be available here.`);
                  }}
                >
                  Contact Candidate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

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
            <h1 style={styles.headerTitle}>Talent Acquisition Portal</h1>
            <p style={styles.headerSubtitle}>
              Welcome, {companyData?.companyName || 'Corporate Partner'}!
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
              ...(activeTab === 'postJob' && styles.navButtonActive)
            }}
            onClick={() => setActiveTab('postJob')}
          >
            Create Position
          </button>
          <button 
            style={{
              ...styles.navButton,
              ...(activeTab === 'jobs' && styles.navButtonActive)
            }}
            onClick={() => setActiveTab('jobs')}
          >
            Manage Opportunities
          </button>
          <button 
            style={{
              ...styles.navButton,
              ...(activeTab === 'applicants' && styles.navButtonActive)
            }}
            onClick={() => setActiveTab('applicants')}
          >
            Top Talent Pool
          </button>
          <button 
            style={{
              ...styles.navButton,
              ...(activeTab === 'applications' && styles.navButtonActive)
            }}
            onClick={() => setActiveTab('applications')}
          >
            Candidate Applications
          </button>
        </div>

        {loading && (
          <div style={styles.loading}>Processing your request...</div>
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