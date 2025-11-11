import React from 'react';

const Dashboard = ({ userRole, onNavigate, onLogout }) => {
  const dashboardStyle = {
    minHeight: '100vh',
    background: 'blue',
    padding: '20px'
  };

  const headerStyle = {
    textAlign: 'center',
    color: 'white',
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
    borderRadius: '10px',
    padding: '30px',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    transition: 'transform 0.3s, box-shadow 0.3s'
  };

  const cardHoverStyle = {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 40px rgba(0,0,0,0.3)'
  };

  const [hoveredCard, setHoveredCard] = React.useState(null);

  const renderCards = () => {
    const cards = [];

    if (userRole === 'student' || userRole === 'all') {
      cards.push({
        title: 'Student Portal',
        description: 'Apply for courses, view admissions, upload documents, and apply for jobs',
        role: 'student',
        color: '#4CAF50'
      });
    }

    if (userRole === 'institute' || userRole === 'all') {
      cards.push({
        title: 'Institute Portal',
        description: 'Manage faculties, courses, view applications, and publish admissions',
        role: 'institute',
        color: '#2196F3'
      });
    }

    if (userRole === 'admin' || userRole === 'all') {
      cards.push({
        title: 'Admin Portal',
        description: 'Manage institutions, companies, and view system reports',
        role: 'admin',
        color: '#FF9800'
      });
    }

    if (userRole === 'company' || userRole === 'all') {
      cards.push({
        title: 'Company Portal',
        description: 'Post job opportunities and view qualified applicants',
        role: 'company',
        color: '#9C27B0'
      });
    }

    return cards.map((card, index) => (
      <div
        key={index}
        style={{
          ...cardStyle,
          borderTop: `5px solid ${card.color}`,
          ...(hoveredCard === index && cardHoverStyle)
        }}
        onMouseEnter={() => setHoveredCard(index)}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={() => onNavigate(card.role)}
      >
        <h3 style={{ color: card.color, marginBottom: '15px' }}>{card.title}</h3>
        <p style={{ color: '#666', lineHeight: '1.5' }}>{card.description}</p>
        <button
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: card.color,
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Enter Portal
        </button>
      </div>
    ));
  };

  return (
    <div style={dashboardStyle}>
      <header style={headerStyle}>
        <h1>Career Guidance & Employment Integration Platform</h1>
        <p>Welcome to your dashboard</p>
        <button
          onClick={onLogout}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: 'transparent',
            color: 'white',
            border: '2px solid white',
            borderRadius: '5px',
            cursor: 'pointer'
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
