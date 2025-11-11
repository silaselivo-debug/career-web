import React from 'react';

const Dashboard = ({ userRole, onNavigate, onLogout }) => {
  const dashboardStyle = {
    minHeight: '100vh',
    background: '#f3f4f6',
    padding: '20px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  };

  const headerStyle = {
    textAlign: 'center',
    color: '#374151',
    marginBottom: '40px'
  };

  const cardContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '8px',
    padding: '30px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const cardHoverStyle = {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  };

  const [hoveredCard, setHoveredCard] = React.useState(null);

  const renderCards = () => {
    const cards = [];

    if (userRole === 'student' || userRole === 'all') {
      cards.push({
        title: 'Student Portal',
        description: 'Apply for courses, view admissions, upload documents, and apply for jobs',
        role: 'student',
        color: '#2563eb'
      });
    }

    if (userRole === 'institute' || userRole === 'all') {
      cards.push({
        title: 'Institute Portal',
        description: 'Manage faculties, courses, view applications, and publish admissions',
        role: 'institute',
        color: '#2563eb'
      });
    }

    if (userRole === 'admin' || userRole === 'all') {
      cards.push({
        title: 'Admin Portal',
        description: 'Manage institutions, companies, and view system reports',
        role: 'admin',
        color: '#2563eb'
      });
    }

    if (userRole === 'company' || userRole === 'all') {
      cards.push({
        title: 'Company Portal',
        description: 'Post job opportunities and view qualified applicants',
        role: 'company',
        color: '#2563eb'
      });
    }

    return cards.map((card, index) => (
      <div
        key={index}
        style={{
          ...cardStyle,
          borderTop: `4px solid ${card.color}`,
          ...(hoveredCard === index && cardHoverStyle)
        }}
        onMouseEnter={() => setHoveredCard(index)}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={() => onNavigate(card.role)}
      >
        <h3 style={{ color: '#374151', marginBottom: '15px', fontSize: '1.25rem', fontWeight: '600' }}>{card.title}</h3>
        <p style={{ color: '#6b7280', lineHeight: '1.5', marginBottom: '20px' }}>{card.description}</p>
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
        >
          Enter Portal
        </button>
      </div>
    ));
  };

  return (
    <div style={dashboardStyle}>
      <header style={headerStyle}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '10px' }}>Career Guidance Platform</h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '20px' }}>Welcome to your dashboard</p>
        <button
          onClick={onLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: 'transparent',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f3f4f6';
            e.target.style.borderColor = '#9ca3af';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.borderColor = '#d1d5db';
          }}
        >
          Logout
        </button>
      </header>
      <div style={cardContainerStyle}>
        {renderCards()}
      </div>
    </div>
  );
};

export default Dashboard;
