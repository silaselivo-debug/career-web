import React from 'react';

const HomePage = ({ onNavigate }) => {
  const portals = [
    {
      title: 'Student Portal',
      description: 'Access courses, track your progress, and connect with top companies for career opportunities. Build your future with comprehensive learning tools.',
      color: '#667eea',
      route: 'student'
    },
    {
      title: 'Institute Dashboard',
      description: 'Manage courses, monitor student progress, and build partnerships with leading companies. Streamline your educational operations.',
      color: '#f5576c',
      route: 'institute'
    },
    {
      title: 'Company Portal',
      description: 'Discover talented students, post internships, and collaborate with educational institutes. Build your future workforce today.',
      color: '#4facfe',
      route: 'company'
    },
    {
      title: 'Admin Console',
      description: 'Comprehensive administration tools to manage platform operations, users, and system performance. Ensure smooth platform functioning.',
      color: '#43e97b',
      route: 'admin'
    }
  ];

  const stats = [
    { number: '', label: 'Active Students' },
    { number: '', label: 'Partner Institutes' },
    { number: '', label: 'Corporate Partners' },
    { number: '', label: 'Success Rate' }
  ];

  const footerLinks = {
    'Students': ['Browse Courses', 'Career Support', 'Job Portal', 'Resources'],
    'Institutes': ['Dashboard', 'Analytics', 'Partnerships', 'Settings'],
    'Companies': ['Talent Search', 'Post Jobs', 'Campus Connect', 'Analytics'],
    'Support': ['Help Center', 'Contact', 'Documentation', 'Status']
  };

  const styles = {
    homePage: {
      minHeight: '100vh',
      fontFamily: "'Poppins', 'Segoe UI', sans-serif",
      background: 'blue',
      overflowX: 'hidden'
    },
    
    // Navigation
    navigation: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '1rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logo: {
      fontSize: '1.8rem',
      fontWeight: 700,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    navButtons: {
      display: 'flex',
      gap: '1rem'
    },
    navButton: {
      padding: '0.8rem 1.5rem',
      borderRadius: '25px',
      border: 'none',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '0.9rem'
    },
    
    // Hero Section
    heroSection: {
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      position: 'relative'
    },
    heroContent: {
      textAlign: 'center',
      maxWidth: '800px'
    },
    heroTitle: {
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      fontWeight: 800,
      marginBottom: '1.5rem',
      background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: 1.2
    },
    heroSubtitle: {
      fontSize: '1.3rem',
      color: '#5a6c7d',
      marginBottom: '3rem',
      lineHeight: 1.6,
      fontWeight: 300
    },
    
    // Portals Section
    portalsSection: {
      padding: '5rem 2rem',
      background: 'white'
    },
    sectionTitle: {
      textAlign: 'center',
      fontSize: '2.5rem',
      fontWeight: 700,
      marginBottom: '1rem',
      color: '#2c3e50'
    },
    sectionSubtitle: {
      textAlign: 'center',
      fontSize: '1.1rem',
      color: '#7f8c8d',
      marginBottom: '4rem',
      maxWidth: '600px',
      margin: '0 auto 4rem auto'
    },
    portalsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    portalCard: {
      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
      borderRadius: '20px',
      padding: '2.5rem 2rem',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255,255,255,0.5)',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    },
    portalCardHover: {
      transform: 'translateY(-10px)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
    },
    portalIcon: {
      width: '60px',
      height: '60px',
      borderRadius: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.5rem',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: 'white'
    },
    portalTitle: {
      fontSize: '1.5rem',
      fontWeight: 700,
      marginBottom: '1rem',
      color: '#2c3e50'
    },
    portalDescription: {
      color: '#7f8c8d',
      lineHeight: 1.6,
      marginBottom: '2rem'
    },
    portalButton: {
      padding: '0.8rem 1.5rem',
      borderRadius: '25px',
      border: 'none',
      background: 'rgba(0,0,0,0.05)',
      color: '#2c3e50',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    
    // Stats Section
    statsSection: {
      padding: '5rem 2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '2rem',
      maxWidth: '1000px',
      margin: '0 auto',
      textAlign: 'center'
    },
    statItem: {
      padding: '2rem 1rem'
    },
    statNumber: {
      fontSize: '3rem',
      fontWeight: 800,
      marginBottom: '0.5rem',
      background: 'linear-gradient(135deg, #fff 0%, #e3f2fd 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    statLabel: {
      fontSize: '1.1rem',
      opacity: 0.9,
      fontWeight: 500
    },
    
    // CTA Section
    ctaSection: {
      padding: '5rem 2rem',
      background: 'white',
      textAlign: 'center'
    },
    ctaTitle: {
      fontSize: '2.2rem',
      fontWeight: 700,
      marginBottom: '1.5rem',
      color: '#2c3e50'
    },
    ctaSubtitle: {
      fontSize: '1.2rem',
      color: '#7f8c8d',
      marginBottom: '3rem',
      maxWidth: '600px',
      margin: '0 auto'
    },
    ctaButton: {
      padding: '1.2rem 3rem',
      fontSize: '1.1rem',
      fontWeight: 600,
      border: 'none',
      borderRadius: '30px',
      cursor: 'pointer',
      background: 'e',
      color: 'white',
      transition: 'all 0.3s ease',
      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
    },
    ctaButtonHover: {
      transform: 'scale(1.05)',
      boxShadow: '0 15px 40px rgba(102, 126, 234, 0.4)'
    },
    
    // Footer
    footer: {
      background: '#2c3e50',
      color: 'white',
      padding: '4rem 2rem 2rem'
    },
    footerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '3rem',
      marginBottom: '3rem'
    },
    footerColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    footerTitle: {
      fontSize: '1.2rem',
      fontWeight: 700,
      marginBottom: '1rem',
      color: '#ecf0f1'
    },
    footerLink: {
      color: '#bdc3c7',
      textDecoration: 'none',
      transition: 'all 0.3s ease',
      padding: '0.3rem 0'
    },
    footerLinkHover: {
      color: 'white',
      transform: 'translateX(5px)'
    },
    footerBottom: {
      maxWidth: '1200px',
      margin: '0 auto',
      paddingTop: '2rem',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      textAlign: 'center',
      color: '#95a5a6'
    }
  };

  // Hover states
  const [hoveredPortal, setHoveredPortal] = React.useState(null);
  const [ctaHover, setCtaHover] = React.useState(false);
  const [hoveredFooterLink, setHoveredFooterLink] = React.useState(null);

  return (
    <div style={styles.homePage}>
      {/* Navigation */}
      <nav style={styles.navigation}>
        <div style={styles.logo}>LearnBridge</div>
        <div style={styles.navButtons}>
          <button
            style={{
              ...styles.navButton,
              background: 'transparent',
              color: '#2c3e50'
            }}
            onClick={() => onNavigate('login')}
          >
            Sign In
          </button>
          <button
            style={{
              ...styles.navButton,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
            onClick={() => onNavigate('register')}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Your Gateway to Educational Excellence
          </h1>
          <p style={styles.heroSubtitle}>
            Connect, learn, and grow with our comprehensive educational platform. 
            Bridging the gap between students, institutions, and industry leaders 
            for a brighter future.
          </p>
          <button
            style={{
              ...styles.ctaButton,
              ...(ctaHover && styles.ctaButtonHover)
            }}
            onMouseEnter={() => setCtaHover(true)}
            onMouseLeave={() => setCtaHover(false)}
            onClick={() => onNavigate('register')}
          >
            Start Your Journey
          </button>
        </div>
      </section>

      {/* Portals Section */}
      <section style={styles.portalsSection}>
        <h2 style={styles.sectionTitle}>Access Your Portal</h2>
        <p style={styles.sectionSubtitle}>
          Choose your entry point to access specialized features and tools designed for your needs
        </p>
        <div style={styles.portalsGrid}>
          {portals.map((portal, index) => (
            <div
              key={index}
              style={{
                ...styles.portalCard,
                ...(hoveredPortal === index && styles.portalCardHover)
              }}
              onMouseEnter={() => setHoveredPortal(index)}
              onMouseLeave={() => setHoveredPortal(null)}
              onClick={() => onNavigate(portal.route)}
            >
              <div 
                style={{
                  ...styles.portalIcon,
                  background: `linear-gradient(135deg, ${portal.color} 0%, ${portal.color}99 100%)`
                }}
              >
                {portal.title.charAt(0)}
              </div>
              <h3 style={styles.portalTitle}>{portal.title}</h3>
              <p style={styles.portalDescription}>{portal.description}</p>
              <button style={styles.portalButton}>
                Enter Portal →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section style={styles.statsSection}>
        <div style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} style={styles.statItem}>
              <div style={styles.statNumber}>{stat.number}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to Get Started?</h2>
        <p style={styles.ctaSubtitle}>
          Join thousands of students, educators, and industry professionals 
          who are already transforming education with LearnBridge
        </p>
        <button
          style={{
            ...styles.ctaButton,
            ...(ctaHover && styles.ctaButtonHover)
          }}
          onMouseEnter={() => setCtaHover(true)}
          onMouseLeave={() => setCtaHover(false)}
          onClick={() => onNavigate('register')}
        >
          Create Your Account
        </button>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} style={styles.footerColumn}>
              <h4 style={styles.footerTitle}>{category}</h4>
              {links.map((link, index) => (
                <a
                  key={index}
                  href="#"
                  style={{
                    ...styles.footerLink,
                    ...(hoveredFooterLink === `${category}-${index}` && styles.footerLinkHover)
                  }}
                  onMouseEnter={() => setHoveredFooterLink(`${category}-${index}`)}
                  onMouseLeave={() => setHoveredFooterLink(null)}
                >
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div style={styles.footerBottom}>
          <p>&copy; 2024 LearnBridge. Empowering education through technology and innovation.</p>
        </div>
      </footer>

      {/* Global Styles */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Poppins', sans-serif;
          }
          
          button {
            font-family: inherit;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          section {
            animation: fadeIn 0.8s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default HomePage;
