import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';

const AdminPortal = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [institutions, setInstitutions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState({});
  const [institutionStats, setInstitutionStats] = useState({});
  const [allApplications, setAllApplications] = useState([]);
  const [loading, setLoading] = useState(false);

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
    actionButton: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 600,
      marginRight: '10px',
      marginBottom: '5px',
      transition: 'all 0.3s ease'
    },
    approveButton: { 
      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', 
      color: 'white',
      boxShadow: '0 3px 10px rgba(40, 167, 69, 0.3)'
    },
    suspendButton: { 
      background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)', 
      color: 'black',
      boxShadow: '0 3px 10px rgba(255, 193, 7, 0.3)'
    },
    deleteButton: { 
      background: 'linear-gradient(135deg, #dc3545 0%, #e83e8c 100%)', 
      color: 'white',
      boxShadow: '0 3px 10px rgba(220, 53, 69, 0.3)'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '15px',
      background: 'white',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    tableHeader: {
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      padding: '15px',
      textAlign: 'left',
      borderBottom: '2px solid #dee2e6',
      fontWeight: 700,
      color: '#2d3748',
      fontSize: '14px'
    },
    tableCell: {
      padding: '15px',
      borderBottom: '1px solid #e2e8f0',
      color: '#4a5568',
      fontSize: '14px'
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
    statusApproved: { background: '#d1edff', color: '#004085' },
    statusSuspended: { background: '#fff3cd', color: '#856404' },
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      color: 'white',
      fontSize: '18px',
      fontWeight: 600
    },
    refreshButton: {
      background: 'linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 600,
      marginBottom: '20px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(23, 162, 184, 0.3)'
    },
    institutionCard: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
      border: '1px solid #e2e8f0',
      padding: '20px',
      borderRadius: '15px',
      marginBottom: '15px',
      transition: 'all 0.3s ease'
    },
    companyCard: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
      border: '1px solid #e2e8f0',
      padding: '25px',
      borderRadius: '15px',
      marginBottom: '20px',
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
    marksSection: {
      background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
      padding: '12px',
      borderRadius: '8px',
      margin: '10px 0',
      border: '1px solid #fdcb6e'
    }
  };

  // Hover states
  const [hoveredCard, setHoveredCard] = useState(null);

  // Refresh data when activeTab changes to ensure latest data
  useEffect(() => {
    if (activeTab === 'institutions' || activeTab === 'applications') {
      refreshData();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      await fetchAllApplications();
      await fetchInstitutions();
      generateReports();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchInstitutions(),
        fetchCompanies(),
        fetchUsers(),
        fetchAllApplications()
      ]);
      generateReports();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitutions = async () => {
    try {
      const institutionsSnapshot = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'institute'))
      );
      const institutionsData = institutionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInstitutions(institutionsData);
      return institutionsData;
    } catch (error) {
      console.error('Error fetching institutions:', error);
      return [];
    }
  };

  const fetchCompanies = async () => {
    try {
      const companiesSnapshot = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'company'))
      );
      const companiesData = companiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCompanies(companiesData);
      return companiesData;
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  };

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
      return usersData;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  const fetchAllApplications = async () => {
    try {
      const applicationsSnapshot = await getDocs(collection(db, 'applications'));
      const applicationsData = applicationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllApplications(applicationsData);
      return applicationsData;
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  };

  const generateReports = () => {
    // Calculate institution-specific statistics
    const institutionStatsData = {};
    
    institutions.forEach(institution => {
      // Match applications by institution ID or email
      const institutionApplications = allApplications.filter(app => 
        app.institutionId === institution.id || 
        app.institutionEmail === institution.email ||
        app.institutionName === institution.institutionName
      );

      const admittedCount = institutionApplications.filter(app => app.status === 'admitted').length;
      const totalCount = institutionApplications.length;

      institutionStatsData[institution.id] = {
        name: institution.institutionName,
        email: institution.email,
        totalApplications: totalCount,
        pending: institutionApplications.filter(app => app.status === 'pending').length,
        admitted: admittedCount,
        rejected: institutionApplications.filter(app => app.status === 'rejected').length,
        admissionRate: totalCount > 0 ? Math.round((admittedCount / totalCount) * 100) : 0,
        applications: institutionApplications // Store applications for detailed view
      };
    });

    setInstitutionStats(institutionStatsData);

    // Overall system reports
    const reportsData = {
      totalUsers: users.length,
      students: users.filter(u => u.role === 'student').length,
      institutions: institutions.length,
      companies: companies.length,
      totalApplications: allApplications.length,
      pendingApplications: allApplications.filter(doc => doc.status === 'pending').length,
      admittedApplications: allApplications.filter(doc => doc.status === 'admitted').length,
      rejectedApplications: allApplications.filter(doc => doc.status === 'rejected').length,
      institutionStats: institutionStatsData
    };

    setReports(reportsData);
  };

  const handleCompanyStatus = async (companyId, status) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'users', companyId), {
        approved: status === 'approved',
        suspended: status === 'suspended'
      });
      await fetchCompanies();
      alert(`Company ${status} successfully!`);
    } catch (error) {
      console.error('Error updating company status:', error);
      alert('Error updating company status');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationStatusUpdate = async (applicationId, newStatus) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'applications', applicationId), {
        status: newStatus,
        reviewedAt: new Date(),
        reviewedBy: user.uid,
        reviewedByName: 'Admin'
      });
      
      // Refresh data to get updated statistics
      await refreshData();
      alert(`Application ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Error updating application status');
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 700 }}>System Administration Dashboard</h3>
      
      <button 
        style={styles.refreshButton}
        onClick={refreshData}
        disabled={loading}
      >
        {loading ? 'Refreshing Data...' : 'Refresh System Data'}
      </button>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{reports.totalUsers || 0}</div>
          <div style={styles.statLabel}>Total Platform Users</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{reports.students || 0}</div>
          <div style={styles.statLabel}>Student Accounts</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{reports.institutions || 0}</div>
          <div style={styles.statLabel}>Educational Institutions</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{reports.companies || 0}</div>
          <div style={styles.statLabel}>Corporate Partners</div>
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
          <h4 style={{ marginBottom: '15px', color: '#2d3748' }}>Academic Applications Overview</h4>
          <div style={{ marginBottom: '15px' }}>
            <p style={{ color: '#718096', marginBottom: '8px' }}><strong>Total Submissions:</strong> {reports.totalApplications || 0}</p>
            <p style={{ color: '#718096', marginBottom: '8px' }}><strong>Under Review:</strong> {reports.pendingApplications || 0}</p>
            <p style={{ color: '#718096', marginBottom: '8px' }}><strong>Admitted Students:</strong> {reports.admittedApplications || 0}</p>
            <p style={{ color: '#718096', marginBottom: '15px' }}><strong>Not Accepted:</strong> {reports.rejectedApplications || 0}</p>
            <p style={{ color: '#2d3748', fontWeight: 600 }}>
              System Admission Rate: {reports.totalApplications ? 
                Math.round((reports.admittedApplications / reports.totalApplications) * 100) : 0}%
            </p>
          </div>
          {reports.totalApplications > 0 && (
            <button 
              style={styles.primaryButton}
              onClick={() => setActiveTab('applications')}
            >
              Manage All Applications
            </button>
          )}
        </div>
        
        <div 
          style={{
            ...styles.card,
            ...(hoveredCard === 'performance' && styles.cardHover)
          }}
          onMouseEnter={() => setHoveredCard('performance')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h4 style={{ marginBottom: '15px', color: '#2d3748' }}>Top Performing Institutions</h4>
          {Object.values(institutionStats)
            .sort((a, b) => b.totalApplications - a.totalApplications)
            .slice(0, 4)
            .map((stats, index) => (
            <div key={index} style={{ 
              marginBottom: '12px', 
              padding: '12px', 
              background: '#f7fafc', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <strong style={{ color: '#2d3748', fontSize: '14px' }}>{stats.name}</strong>
              <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>
                Applications: {stats.totalApplications} | Admitted: {stats.admitted} | Success Rate: {stats.admissionRate}%
              </div>
            </div>
          ))}
          <button 
            style={styles.primaryButton}
            onClick={() => setActiveTab('institutions')}
          >
            View Institutional Analytics
          </button>
        </div>
        
        <div 
          style={{
            ...styles.card,
            ...(hoveredCard === 'actions' && styles.cardHover)
          }}
          onMouseEnter={() => setHoveredCard('actions')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h4 style={{ marginBottom: '15px', color: '#2d3748' }}>Administrative Controls</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              style={styles.primaryButton}
              onClick={() => setActiveTab('institutions')}
            >
              Institutional Management
            </button>
            <button 
              style={styles.primaryButton}
              onClick={() => setActiveTab('companies')}
            >
              Corporate Partner Oversight
            </button>
            <button 
              style={styles.secondaryButton}
              onClick={() => setActiveTab('applications')}
            >
              Application Administration
            </button>
            <button 
              style={styles.secondaryButton}
              onClick={() => setActiveTab('reports')}
            >
              System Analytics & Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInstitutions = () => (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 700 }}>Institutional Performance Analytics</h3>
      
      <button 
        style={styles.refreshButton}
        onClick={refreshData}
        disabled={loading}
      >
        {loading ? 'Refreshing Analytics...' : 'Refresh Institutional Data'}
      </button>
      
      <div style={styles.card}>
        <h4 style={{ marginBottom: '20px', color: '#2d3748' }}>Institutional Performance Metrics</h4>
        {institutions.length === 0 ? (
          <p style={{ color: '#a0aec0', textAlign: 'center', padding: '30px' }}>No institutions registered in the system.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Educational Institution</th>
                <th style={styles.tableHeader}>Contact</th>
                <th style={styles.tableHeader}>Total Applications</th>
                <th style={styles.tableHeader}>Pending Review</th>
                <th style={styles.tableHeader}>Admitted</th>
                <th style={styles.tableHeader}>Not Accepted</th>
                <th style={styles.tableHeader}>Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {institutions.map(institution => {
                const stats = institutionStats[institution.id] || {
                  totalApplications: 0,
                  pending: 0,
                  admitted: 0,
                  rejected: 0,
                  admissionRate: 0
                };
                
                return (
                  <tr key={institution.id}>
                    <td style={styles.tableCell}>
                      <strong style={{ color: '#2d3748' }}>{institution.institutionName}</strong>
                      <br />
                      <small style={{ color: '#718096' }}>{institution.description}</small>
                    </td>
                    <td style={styles.tableCell}>{institution.email}</td>
                    <td style={styles.tableCell}>
                      <strong style={{ color: '#667eea' }}>{stats.totalApplications}</strong>
                    </td>
                    <td style={styles.tableCell}>{stats.pending}</td>
                    <td style={styles.tableCell}>
                      <span style={{...styles.statusBadge, ...styles.statusAdmitted}}>
                        {stats.admitted}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{...styles.statusBadge, ...styles.statusRejected}}>
                        {stats.rejected}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <strong style={{ 
                        color: stats.admissionRate >= 50 ? '#28a745' : 
                               stats.admissionRate >= 25 ? '#ffc107' : '#dc3545'
                      }}>
                        {stats.admissionRate}%
                      </strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div style={styles.card}>
        <h4 style={{ marginBottom: '20px', color: '#2d3748' }}>Detailed Institutional Analytics</h4>
        {Object.values(institutionStats).length === 0 ? (
          <p style={{ color: '#a0aec0', textAlign: 'center', padding: '30px' }}>No application data available for analysis.</p>
        ) : (
          Object.values(institutionStats).map((stats, index) => (
            <div 
              key={index} 
              style={{
                ...styles.institutionCard,
                ...(hoveredCard === stats.name && styles.cardHover)
              }}
              onMouseEnter={() => setHoveredCard(stats.name)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <h5 style={{ margin: '0 0 15px 0', color: '#2d3748', fontSize: '1.1rem' }}>
                {stats.name} - {stats.totalApplications} Total Applications
              </h5>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>{stats.pending}</div>
                  <div style={styles.statLabel}>Pending Review</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>{stats.admitted}</div>
                  <div style={styles.statLabel}>Admitted Students</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>{stats.rejected}</div>
                  <div style={styles.statLabel}>Not Accepted</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>{stats.admissionRate}%</div>
                  <div style={styles.statLabel}>Admission Rate</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderApplications = () => (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 700 }}>Application Management Center</h3>
      
      <button 
        style={styles.refreshButton}
        onClick={refreshData}
        disabled={loading}
      >
        {loading ? 'Refreshing Applications...' : 'Refresh Application Data'}
      </button>
      
      <div style={styles.card}>
        <h4 style={{ marginBottom: '20px', color: '#2d3748' }}>Application Pipeline Overview</h4>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{allApplications.length}</div>
            <div style={styles.statLabel}>Total Applications</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {allApplications.filter(app => app.status === 'pending').length}
            </div>
            <div style={styles.statLabel}>Under Review</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {allApplications.filter(app => app.status === 'admitted').length}
            </div>
            <div style={styles.statLabel}>Admitted</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {allApplications.filter(app => app.status === 'rejected').length}
            </div>
            <div style={styles.statLabel}>Not Accepted</div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h4 style={{ marginBottom: '20px', color: '#2d3748' }}>Application Review Dashboard</h4>
        {allApplications.length === 0 ? (
          <p style={{ color: '#a0aec0', textAlign: 'center', padding: '30px' }}>No applications submitted in the system yet.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Student Applicant</th>
                <th style={styles.tableHeader}>Educational Institution</th>
                <th style={styles.tableHeader}>Academic Program</th>
                <th style={styles.tableHeader}>Submission Date</th>
                <th style={styles.tableHeader}>Application Status</th>
                <th style={styles.tableHeader}>Academic Performance</th>
                <th style={styles.tableHeader}>Administrative Actions</th>
              </tr>
            </thead>
            <tbody>
              {allApplications.map(application => (
                <tr key={application.id}>
                  <td style={styles.tableCell}>
                    <strong style={{ color: '#2d3748' }}>{application.studentName}</strong>
                    <br />
                    <small style={{ color: '#718096' }}>{application.studentEmail}</small>
                  </td>
                  <td style={styles.tableCell}>{application.institutionName}</td>
                  <td style={styles.tableCell}>{application.courseName}</td>
                  <td style={styles.tableCell}>
                    {application.appliedAt?.toDate ? 
                      application.appliedAt.toDate().toLocaleDateString() : 
                      new Date(application.appliedAt).toLocaleDateString()}
                  </td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.statusBadge,
                      ...(application.status === 'pending' ? styles.statusPending :
                          application.status === 'admitted' ? styles.statusAdmitted : 
                          styles.statusRejected)
                    }}>
                      {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    {application.studentMarks ? (
                      <div style={styles.marksSection}>
                        <div style={{ fontSize: '12px', color: '#856404' }}>
                          <strong>Mathematics:</strong> {application.studentMarks.mathematics || 'N/A'}%
                        </div>
                        <div style={{ fontSize: '12px', color: '#856404' }}>
                          <strong>English:</strong> {application.studentMarks.english || 'N/A'}%
                        </div>
                        <div style={{ fontSize: '12px', color: '#856404' }}>
                          <strong>Overall Average:</strong> {application.studentMarks.overall || 'N/A'}%
                        </div>
                      </div>
                    ) : 'Academic data not available'}
                  </td>
                  <td style={styles.tableCell}>
                    {application.status === 'pending' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button 
                          style={{...styles.actionButton, ...styles.approveButton}}
                          onClick={() => handleApplicationStatusUpdate(application.id, 'admitted')}
                          disabled={loading}
                        >
                          Approve Admission
                        </button>
                        <button 
                          style={{...styles.actionButton, ...styles.deleteButton}}
                          onClick={() => handleApplicationStatusUpdate(application.id, 'rejected')}
                          disabled={loading}
                        >
                          Decline Application
                        </button>
                      </div>
                    )}
                    {application.status !== 'pending' && (
                      <small style={{ color: '#a0aec0' }}>Decision finalized</small>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const renderCompanies = () => (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 700 }}>Corporate Partner Management</h3>
      {companies.length === 0 ? (
        <div style={styles.card}>
          <h4 style={{ color: '#2d3748', marginBottom: '15px' }}>No Corporate Partners</h4>
          <p style={{ color: '#718096' }}>No companies have registered as corporate partners yet.</p>
        </div>
      ) : (
        companies.map(company => (
          <div 
            key={company.id} 
            style={{
              ...styles.companyCard,
              ...(hoveredCard === company.id && styles.cardHover)
            }}
            onMouseEnter={() => setHoveredCard(company.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>{company.companyName}</h4>
                <p style={{ margin: '5px 0', color: '#718096' }}>
                  <strong>Contact Email:</strong> {company.email}
                </p>
                <p style={{ margin: '5px 0', color: '#718096' }}>
                  <strong>Phone:</strong> {company.phone || 'Not provided'}
                </p>
                <p style={{ margin: '5px 0', color: '#4a5568' }}>
                  <strong>Account Status:</strong> 
                  <span style={{ 
                    ...styles.statusBadge,
                    ...(company.approved ? styles.statusApproved : 
                         company.suspended ? styles.statusSuspended : styles.statusPending)
                  }}>
                    {company.approved ? 'Verified Partner' : company.suspended ? 'Suspended' : 'Pending Approval'}
                  </span>
                </p>
                <p style={{ margin: '5px 0 0 0', color: '#a0aec0', fontSize: '13px' }}>
                  <strong>Registration Date:</strong> {company.createdAt?.toDate?.().toLocaleDateString() || 'Unknown'}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  style={{...styles.actionButton, ...styles.approveButton}}
                  onClick={() => handleCompanyStatus(company.id, 'approved')}
                  disabled={company.approved || loading}
                >
                  {company.approved ? '✓ Verified' : 'Verify Partner'}
                </button>
                <button 
                  style={{...styles.actionButton, ...styles.suspendButton}}
                  onClick={() => handleCompanyStatus(company.id, 'suspended')}
                  disabled={company.suspended || loading}
                >
                  {company.suspended ? '⚠ Suspended' : 'Suspend Account'}
                </button>
                <button 
                  style={{...styles.actionButton, ...styles.deleteButton}}
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to permanently delete ${company.companyName}?`)) {
                      deleteDoc(doc(db, 'users', company.id));
                      fetchCompanies();
                    }
                  }}
                  disabled={loading}
                >
                  Remove Partner
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderReports = () => (
    <div>
      <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 700 }}>System Analytics & Performance Reports</h3>
      
      <div style={styles.grid}>
        <div style={styles.card}>
          <h4 style={{ marginBottom: '15px', color: '#2d3748' }}>Platform User Analytics</h4>
          <div style={{ marginBottom: '15px' }}>
            <p style={{ color: '#718096', marginBottom: '8px' }}><strong>Total Platform Users:</strong> {reports.totalUsers || 0}</p>
            <p style={{ color: '#718096', marginBottom: '8px' }}><strong>Student Accounts:</strong> {reports.students || 0}</p>
            <p style={{ color: '#718096', marginBottom: '8px' }}><strong>Educational Institutions:</strong> {reports.institutions || 0}</p>
            <p style={{ color: '#718096', marginBottom: '15px' }}><strong>Corporate Partners:</strong> {reports.companies || 0}</p>
          </div>
        </div>

        <div style={styles.card}>
          <h4 style={{ marginBottom: '15px', color: '#2d3748' }}>Education System Metrics</h4>
          <div style={{ marginBottom: '15px' }}>
            <p style={{ color: '#718096', marginBottom: '8px' }}><strong>Registered Institutions:</strong> {institutions.length}</p>
            <p style={{ color: '#718096', marginBottom: '8px' }}><strong>Course Applications:</strong> {reports.totalApplications || 0}</p>
            <p style={{ color: '#718096', marginBottom: '8px' }}><strong>System Admission Rate:</strong> {reports.totalApplications ? 
              Math.round((reports.admittedApplications / reports.totalApplications) * 100) : 0}%</p>
            <p style={{ color: '#718096', marginBottom: '15px' }}><strong>Pending Decisions:</strong> {reports.pendingApplications || 0}</p>
          </div>
        </div>

        <div style={styles.card}>
          <h4 style={{ marginBottom: '15px', color: '#2d3748' }}>Employment Ecosystem</h4>
          <div style={{ marginBottom: '15px' }}>
            <p style={{ color: '#718096', marginBottom: '8px' }}><strong>Verified Companies:</strong> {reports.companies || 0}</p>
            <p style={{ color: '#718096', marginBottom: '8px' }}><strong>Active Job Postings:</strong> {reports.totalJobPostings || 0}</p>
            <p style={{ color: '#718096', marginBottom: '8px' }}><strong>Job Applications:</strong> {reports.totalJobApplications || 0}</p>
            <p style={{ color: '#718096', marginBottom: '15px' }}><strong>Placement Rate:</strong> Calculating...</p>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h4 style={{ marginBottom: '20px', color: '#2d3748' }}>Institutional Performance Ranking</h4>
        {Object.values(institutionStats).length === 0 ? (
          <p style={{ color: '#a0aec0', textAlign: 'center', padding: '30px' }}>No institutional performance data available for reporting.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Rank</th>
                <th style={styles.tableHeader}>Institution</th>
                <th style={styles.tableHeader}>Applications</th>
                <th style={styles.tableHeader}>Admitted</th>
                <th style={styles.tableHeader}>Not Accepted</th>
                <th style={styles.tableHeader}>Success Rate</th>
                <th style={styles.tableHeader}>Performance Tier</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(institutionStats)
                .sort((a, b) => b.admissionRate - a.admissionRate)
                .map((stats, index) => (
                <tr key={index}>
                  <td style={styles.tableCell}>
                    <strong style={{ 
                      color: index === 0 ? '#ffd700' : 
                             index === 1 ? '#c0c0c0' : 
                             index === 2 ? '#cd7f32' : '#667eea'
                    }}>
                      #{index + 1}
                    </strong>
                  </td>
                  <td style={styles.tableCell}>{stats.name}</td>
                  <td style={styles.tableCell}>{stats.totalApplications}</td>
                  <td style={styles.tableCell}>{stats.admitted}</td>
                  <td style={styles.tableCell}>{stats.rejected}</td>
                  <td style={styles.tableCell}>
                    <strong style={{ 
                      color: stats.admissionRate >= 50 ? '#28a745' : 
                             stats.admissionRate >= 25 ? '#ffc107' : '#dc3545'
                    }}>
                      {stats.admissionRate}%
                    </strong>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.statusBadge,
                      background: stats.admissionRate >= 50 ? '#d1edff' : 
                                 stats.admissionRate >= 25 ? '#fff3cd' : '#f8d7da',
                      color: stats.admissionRate >= 50 ? '#004085' : 
                             stats.admissionRate >= 25 ? '#856404' : '#721c24'
                    }}>
                      {stats.admissionRate >= 50 ? 'High Performance' : 
                       stats.admissionRate >= 25 ? 'Moderate Performance' : 'Needs Improvement'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  if (loading && !reports.totalUsers) {
    return (
      <div style={styles.portal}>
        <div style={styles.container}>
          <div style={styles.loading}>Loading Administration Portal...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.portal}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.headerTitle}>System Administration</h1>
            <p style={styles.headerSubtitle}>Platform Management & Analytics Dashboard</p>
            <p style={styles.headerInfo}>
              Monitoring {institutions.length} institutions, {reports.students || 0} students, and {reports.totalApplications || 0} applications
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
              ...(activeTab === 'institutions' && styles.navButtonActive)
            }}
            onClick={() => setActiveTab('institutions')}
          >
            Institutional Analytics
          </button>
          <button 
            style={{
              ...styles.navButton,
              ...(activeTab === 'applications' && styles.navButtonActive)
            }}
            onClick={() => setActiveTab('applications')}
          >
            Application Management
          </button>
          <button 
            style={{
              ...styles.navButton,
              ...(activeTab === 'companies' && styles.navButtonActive)
            }}
            onClick={() => setActiveTab('companies')}
          >
            Corporate Partners
          </button>
          <button 
            style={{
              ...styles.navButton,
              ...(activeTab === 'reports' && styles.navButtonActive)
            }}
            onClick={() => setActiveTab('reports')}
          >
            System Reports
          </button>
        </div>

        {loading && (
          <div style={styles.loading}>Processing administrative request...</div>
        )}

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'institutions' && renderInstitutions()}
        {activeTab === 'applications' && renderApplications()}
        {activeTab === 'companies' && renderCompanies()}
        {activeTab === 'reports' && renderReports()}
      </div>
    </div>
  );
};

export default AdminPortal;