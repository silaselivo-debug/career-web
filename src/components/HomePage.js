import React from 'react';

const HomePage = ({ onNavigate }) => {
  const portals = [
    {
      title: 'Student Portal',
      description: 'Access courses, track your progress, and connect with top companies for career opportunities. Build your future with comprehensive learning tools.',
      route: 'student'
    },
    {
      title: 'Institute Dashboard',
      description: 'Manage courses, monitor student progress, and build partnerships with leading companies. Streamline your educational operations.',
      route: 'institute'
    },
    {
      title: 'Company Portal',
      description: 'Discover talented students, post internships, and collaborate with educational institutes. Build your future workforce today.',
      route: 'company'
    },
    {
      title: 'Admin Console',
      description: 'Comprehensive administration tools to manage platform operations, users, and system performance. Ensure smooth platform functioning.',
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
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      background: 'var(--background)',
      overflowX: 'hidden'
    },
    
    // Navigation
    navigation: {
      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
      borderBottom: '1px solid #2A2D3A',
      padding: '1rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: 'var(--text-heading)'
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
      transition: 'all 0.2s ease',
      fontSize: '0.9rem'
    },
    
    // Hero Section
    heroSection: {
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      background: 'var(--background)'
    },
    heroContent: {
      textAlign: 'center',
      maxWidth: '800px',
      color: 'var(--text-heading)'
    },
    heroTitle: {
      fontSize: 'clamp(2rem, 5vw, 3rem)',
      fontWeight: 700,
      marginBottom: '1.5rem',
      lineHeight: 1.2,
      backgroundImage: 'linear-gradient(135deg, var(--text-heading), var(--secondary))',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    heroSubtitle: {
      fontSize: '1.1rem',
      opacity: 0.9,
      marginBottom: '3rem',
      lineHeight: 1.6,
      fontWeight: 400,
      color: 'var(--text-body)'
    },
    
    // Portals Section
    portalsSection: {
      padding: '4rem 2rem',
      background: 'var(--background)'
    },
    sectionTitle: {
      textAlign: 'center',
      fontSize: '2rem',
      fontWeight: 700,
      marginBottom: '1rem',
      color: 'var(--text-heading)'
    },
    sectionSubtitle: {
      textAlign: 'center',
      fontSize: '1rem',
      color: 'var(--text-body)',
      marginBottom: '3rem',
      maxWidth: '600px',
      margin: '0 auto 3rem auto'
    },
    portalsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    portalCard: {
      background: 'var(--card-bg)',
      borderRadius: '8px',
      padding: '2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      border: '1px solid #2A2D3A',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    portalCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    },
    portalIcon: {
      width: '50px',
      height: '50px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.5rem',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: 'white',
      background: 'linear-gradient(135deg, var(--primary), var(--secondary))'
    },
    portalTitle: {
      fontSize: '1.25rem',
      fontWeight: 600,
      marginBottom: '1rem',
      color: 'var(--text-heading)'
    },
    portalDescription: {
      color: 'var(--text-body)',
      lineHeight: 1.6,
      marginBottom: '2rem'
    },
    portalButton: {
      padding: '0.8rem 1.5rem',
      borderRadius: '25px',
      border: 'none',
      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
      color: 'white',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    
    // Stats Section
    statsSection: {
      padding: '4rem 2rem',
      background: 'var(--card-bg)',
      color: 'var(--text-heading)'
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
      fontSize: '2.5rem',
      fontWeight: 700,
      marginBottom: '0.5rem'
    },
    statLabel: {
      fontSize: '1rem',
      opacity: 0.9,
      fontWeight: 500
    },
    
    // CTA Section
    ctaSection: {
      padding: '4rem 2rem',
      background: 'var(--card-bg)',
      textAlign: 'center'
    },
    ctaTitle: {
      fontSize: '1.75rem',
      fontWeight: 700,
      marginBottom: '1rem',
      color: 'var(--text-heading)'
    },
    ctaSubtitle: {
      fontSize: '1rem',
      color: 'var(--text-body)',
      marginBottom: '2rem',
      maxWidth: '600px',
      margin: '0 auto'
    },
    ctaButton: {
      padding: '1rem 2rem',
      fontSize: '1rem',
      fontWeight: 600,
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
      color: 'white',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    
    // Footer
    footer: {
      background: 'var(--card-bg)',
      color: 'var(--text-heading)',
      padding: '3rem 2rem 2rem'
    },
    footerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '2rem',
      marginBottom: '2rem'
    },
    footerColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.8rem'
    },
    footerTitle: {
      fontSize: '1.1rem',
      fontWeight: 600,
      marginBottom: '0.5rem',
      color: 'var(--text-heading)'
    },
    footerLink: {
      color: 'var(--text-body)',
      textDecoration: 'none',
      transition: 'color 0.2s ease',
      padding: '0.2rem 0'
    },
    footerBottom: {
      maxWidth: '1200px',
      margin: '0 auto',
      paddingTop: '2rem',
      borderTop: '1px solid #2A2D3A',
      textAlign: 'center',
      color: 'var(--text-body)'
    }
  };

  // Hover states
  const [hoveredPortal, setHoveredPortal] = React.useState(null);
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
              color: 'var(--text-heading)',
              border: '1px solid #2A2D3A'
            }}
            onClick={() => onNavigate('login')}
          >
            Sign In
          </button>
          <button
            style={{
              ...styles.navButton,
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: 'white',
              border: 'none'
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
            style={styles.ctaButton}
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
              <div style={styles.portalIcon}>
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
          style={styles.ctaButton}
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
                    ...(hoveredFooterLink === `${category}-${index}` && { color: 'white' })
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
    </div>
  );
};

export default HomePage;
