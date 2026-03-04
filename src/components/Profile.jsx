import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 1. Logic to determine role (Priority: Router State -> LocalStorage -> Guest)
  const [user, setUser] = useState(null);
  const role = location.state?.role || JSON.parse(localStorage.getItem('user'))?.role || 'guest';

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      // If no user is found at all, kick them to login
      navigate('/login');
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  if (!user) return null; // Loading state

  // --- STYLES ---
  const styles = {
    page: {
      paddingTop: '120px', // Space for the fixed Navbar
      minHeight: '100vh',
      backgroundColor: '#f4f7f9',
      fontFamily: "'Lora', serif",
      display: 'flex',
      justifyContent: 'center',
    },
    card: {
      backgroundColor: '#fff',
      width: '90%',
      maxWidth: '900px',
      borderRadius: '24px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
    },
    header: {
      height: '180px',
      background: 'linear-gradient(135deg, #003366 0%, #001a33 100%)',
      position: 'relative',
    },
    avatarWrapper: {
      position: 'absolute',
      bottom: '-50px',
      left: '50px',
      padding: '5px',
      background: '#fff',
      borderRadius: '25px',
    },
    avatar: {
      width: '120px',
      height: '120px',
      borderRadius: '20px',
      backgroundColor: '#FFCC00',
      color: '#003366',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem',
      fontWeight: '800',
      boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
    },
    content: {
      padding: '70px 50px 50px 50px',
    },
    name: {
      fontSize: '2.2rem',
      color: '#003366',
      fontWeight: '700',
      margin: 0,
    },
    badge: {
      display: 'inline-block',
      padding: '5px 15px',
      borderRadius: '50px',
      fontSize: '0.85rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      marginTop: '10px',
      letterSpacing: '1px',
    },
    sectionTitle: {
      borderBottom: '2px solid #FFCC00',
      display: 'inline-block',
      paddingBottom: '5px',
      marginBottom: '20px',
      color: '#003366',
      fontSize: '1.2rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginTop: '20px',
    },
    infoBox: {
      padding: '20px',
      background: '#f8fafc',
      borderRadius: '12px',
      border: '1px solid #edf2f7',
    }
  };

  // --- COMPONENT PARTS ---

  const AdminView = () => (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <h3 style={styles.sectionTitle}>System Administrative Overview</h3>
      <div style={styles.grid}>
        <div style={styles.infoBox}>
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Admin Level</div>
          <div style={{ fontWeight: '700', color: '#003366' }}>Superuser / Root</div>
        </div>
        <div style={styles.infoBox}>
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>System Access</div>
          <div style={{ fontWeight: '700', color: '#003366' }}>Full Directory & Jobs API</div>
        </div>
        <div style={styles.infoBox}>
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Active Sessions</div>
          <div style={{ fontWeight: '700', color: '#003366' }}>14 Servers Healthy</div>
        </div>
      </div>
      <div style={{ ...styles.infoBox, marginTop: '20px', borderLeft: '5px solid #003366' }}>
        <p style={{ margin: 0, fontStyle: 'italic' }}>
          "As an administrator, you have the power to manage mentorship pairings, job postings, and user verification. Use your dashboard to monitor platform growth."
        </p>
      </div>
    </div>
  );

  const AlumniView = () => (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <h3 style={styles.sectionTitle}>Alumni Professional Profile</h3>
      <div style={styles.grid}>
        <div style={styles.infoBox}>
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Graduation Year</div>
          <div style={{ fontWeight: '700', color: '#003366' }}>{user.gradYear || "Class of 2024"}</div>
        </div>
        <div style={styles.infoBox}>
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Major</div>
          <div style={{ fontWeight: '700', color: '#003366' }}>{user.major || "Computer Science"}</div>
        </div>
        <div style={styles.infoBox}>
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Current Company</div>
          <div style={{ fontWeight: '700', color: '#003366' }}>{user.company || "Pending Update"}</div>
        </div>
      </div>
      <div style={{ marginTop: '30px' }}>
        <h4 style={{ color: '#003366' }}>Bio</h4>
        <p style={{ lineHeight: '1.6', color: '#475569' }}>
          {user.bio || "Sharing my journey from SJU to the professional world. Open to mentoring students and networking with fellow alumni."}
        </p>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.avatarWrapper}>
            <div style={styles.avatar}>
              {user.full_name.charAt(0)}
            </div>
          </div>
        </div>

        <div style={styles.content}>
          <h1 style={styles.name}>{user.full_name}</h1>
          <div style={{
            ...styles.badge,
            backgroundColor: role === 'admin' ? '#003366' : '#FFCC00',
            color: role === 'admin' ? '#fff' : '#003366'
          }}>
            {role === 'admin' ? '🛡️ System Administrator' : '🎓 SJU Alumni'}
          </div>

          <p style={{ color: '#64748b', marginTop: '10px' }}>
            <i className="bi bi-envelope-at"></i> {user.email || "user@sju.edu"}
          </p>

          <hr style={{ margin: '40px 0', border: 0, borderTop: '1px solid #e2e8f0' }} />

          {/* DYNAMIC VIEW SWITCHING */}
          {role === 'admin' ? <AdminView /> : <AlumniView />}
          
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Profile;