import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';

// --- COMPONENT IMPORTS ---
// (Placeholders as per original structure)
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Directory from './components/Directory';
import Jobs from './components/Jobs';
import Mentorship from './components/Mentorship';
import AdminDashboard from './components/AdminDashboard';

// --- DATA: DETAILED POLICY CONTENT ---
const POLICY_CONTENT = {
  PRIVACY: {
    title: "Privacy Policy",
    content: `**1. Data Collection**
St. Joseph's University (SJU) collects personal information including your name, graduation year, degree details, email address, and professional employment history. This data is sourced from university records and information you voluntarily provide during registration.

**2. Usage of Information**
Your data is strictly used for:
- Facilitating alumni networking and mentorship matching.
- Verifying your identity as a legitimate alumnus.
- Communicating university updates, event invitations, and fundraising initiatives.
- Generating aggregated, anonymous statistics for accreditation (NAAC/NIRF).

**3. Data Protection**
We employ industry-standard encryption (SSL/TLS) to protect your data during transmission. Access to sensitive personal records is restricted to authorized university administrative staff only.

**4. Third-Party Sharing**
SJU does NOT sell, rent, or trade your personal information to commercial third parties. Data may be shared with trusted vendors solely for the purpose of executing university services (e.g., email distribution systems) under strict confidentiality agreements.

**5. User Rights**
You retain the right to access, correct, or request the deletion of your digital profile at any time by contacting the Alumni Office.`
  },
  TERMS: {
    title: "Terms of Service",
    content: `**1. Acceptance of Terms**
By accessing the SJU Alumni Portal, you agree to be bound by these terms. This portal is exclusively for the use of SJU alumni, current students (final year), and faculty.

**2. Code of Conduct**
Users agree to maintain a professional standard of behavior. Prohibited activities include:
- Harassment, hate speech, or bullying of any kind.
- Posting spam, unauthorized advertising, or MLM schemes.
- Scraping data for commercial use.
- Impersonating other alumni or university officials.

**3. Account Security**
You are responsible for maintaining the confidentiality of your login credentials. You agree to notify the IT department immediately of any unauthorized use of your account.

**4. Intellectual Property**
All content, logos, and software associated with this portal are the property of St. Joseph's University.

**5. Termination**
The University reserves the right to suspend or terminate accounts that violate these terms without prior notice.`
  },
  COOKIE: {
    title: "Cookie Policy",
    content: `**1. What Are Cookies?**
Cookies are small text files stored on your device to help the website function efficiently and recognize you on subsequent visits.

**2. How We Use Cookies**
- **Essential Cookies:** These are necessary for the portal to function (e.g., keeping you logged in securely). You cannot opt-out of these.
- **Analytics Cookies:** We use anonymous trackers to understand which pages are most popular and improve user experience.
- **Preference Cookies:** These remember your settings, such as language preferences or display modes.

**3. Third-Party Cookies**
Embedded content from other websites (e.g., YouTube videos of convocation, Google Maps for event locations) may behave in the exact same way as if the visitor has visited the other website.

**4. Managing Cookies**
Most browsers allow you to refuse to accept cookies and to delete cookies. The methods for doing so vary from browser to browser, and from version to version.`
  }
};

// --- INLINE STYLES SYSTEM ---
const styles = {
  appWrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  mainContent: {
    flex: '1 0 auto',
    marginTop: '80px', // Offset for Fixed Navbar
    width: '100%',
    position: 'relative',
  },
  
  // --- FOOTER STYLES ---
  footer: {
    flexShrink: 0,
    backgroundColor: '#060e1a', // Deep Navy
    color: '#e2e8f0',
    paddingTop: '70px',
    paddingBottom: '30px',
    borderTop: 'none', 
    fontFamily: "'Inter', sans-serif",
  },
  footerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)', 
    gap: '40px',
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  // Brand Section
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '25px',
    gap: '12px'
  },
  logoIcon: {
    fontSize: '1.8rem',
    backgroundColor: '#fff',
    color: '#060e1a',
    borderRadius: '50%',
    width: '45px', 
    height: '45px',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  brandText: {
    fontSize: '1.3rem',
    fontWeight: '800',
    color: '#FFCC00', 
    textTransform: 'uppercase',
    lineHeight: '1',
    letterSpacing: '0.5px'
  },
  brandSub: {
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: '400',
    letterSpacing: '1px',
    marginTop: '4px'
  },
  footerDesc: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    lineHeight: '1.6',
    maxWidth: '280px'
  },
  // Headings
  footerTitle: {
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: '700',
    marginBottom: '25px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  // Links
  linkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  footerLink: {
    color: '#cbd5e1', 
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'color 0.2s, padding-left 0.2s',
    cursor: 'pointer',
    display: 'inline-block',
  },
  // Contact Items
  contactItem: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '18px',
    color: '#cbd5e1',
    fontSize: '0.9rem',
    lineHeight: '1.5'
  },
  contactIcon: {
    color: '#FFCC00',
    marginRight: '12px',
    fontSize: '1rem',
    marginTop: '2px'
  },
  // Newsletter
  newsletterBox: {
    display: 'flex',
    gap: '0',
    marginTop: '10px'
  },
  input: {
    padding: '12px 15px',
    borderRadius: '4px 0 0 4px',
    border: 'none',
    width: '100%',
    outline: 'none',
    fontSize: '0.9rem',
    fontFamily: 'inherit'
  },
  btnGo: {
    backgroundColor: '#FFCC00',
    color: '#000',
    fontWeight: '800',
    border: 'none',
    padding: '0 20px',
    borderRadius: '0 4px 4px 0',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  socialGroup: {
    marginTop: '25px',
    display: 'flex',
    gap: '15px'
  },
  socialIcon: {
    width: '32px', 
    height: '32px', 
    backgroundColor: '#fff', 
    borderRadius: '4px',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    color: '#060e1a',
    fontSize: '1.1rem',
    transition: 'transform 0.2s, background-color 0.2s',
    cursor: 'pointer',
    textDecoration: 'none'
  },
  // Bottom Bar
  footerBottom: {
    marginTop: '60px',
    paddingTop: '25px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem',
    color: '#64748B',
    maxWidth: '1200px',
    margin: '60px auto 0 auto',
    paddingLeft: '20px',
    paddingRight: '20px'
  },
  legalLinks: {
    display: 'flex',
    gap: '20px'
  },
  legalLink: {
    color: '#64748B',
    textDecoration: 'underline',
    cursor: 'pointer',
    transition: 'color 0.2s',
    border: 'none',
    background: 'none',
    padding: 0,
    fontFamily: 'inherit',
    fontSize: 'inherit'
  },

  // --- MODAL STYLES ---
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    animation: 'fadeIn 0.2s ease-out'
  },
  modalHeader: {
    padding: '20px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#060e1a' // Deep Navy
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#64748b'
  },
  modalBody: {
    padding: '25px',
    overflowY: 'auto',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    color: '#334155',
    whiteSpace: 'pre-wrap' // Preserves the line breaks in POLICY_CONTENT
  },

  // Error Pages
  errorPage: {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '20px',
  },
  errorCode: {
    fontSize: '6rem',
    fontWeight: '800',
    color: '#003366',
    lineHeight: '1',
    marginBottom: '10px',
  },
  errorMsg: {
    fontSize: '1.5rem',
    color: '#6c757d',
    marginBottom: '30px',
  },
  btnHome: {
    backgroundColor: '#003366',
    color: 'white',
    padding: '12px 30px',
    borderRadius: '50px',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'transform 0.2s',
  }
};

// --- UTILITY: SCROLL TO TOP ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- INTERNAL COMPONENT: POLICY MODAL ---
const PolicyModal = ({ policy, onClose }) => {
  if (!policy) return null;

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>{policy.title}</h3>
          <button style={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <div style={styles.modalBody}>
          {policy.content}
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

// --- ROUTE GUARDS (Unchanged) ---
const Unauthorized = () => (
  <div style={styles.errorPage}>
    <div style={styles.errorCode}>403</div>
    <h2 style={{color: '#000', fontWeight: 'bold'}}>Access Restricted</h2>
    <p style={styles.errorMsg}>You do not have permission to view this page.<br/>This area is restricted to Administrators only.</p>
    <Link to="/" style={styles.btnHome}>Return Home</Link>
  </div>
);

const NotFound = () => (
  <div style={styles.errorPage}>
    <div style={styles.errorCode}><span style={{color:'#FFCC00'}}>4</span>04</div>
    <h2 style={{color: '#000', fontWeight: 'bold'}}>Page Not Found</h2>
    <p style={styles.errorMsg}>The resource you are looking for has been moved or does not exist.</p>
    <Link to="/" style={styles.btnHome}>Go Back Home</Link>
  </div>
);

const ProtectedRoute = ({ children }) => {
  let isAuthenticated = false;
  try {
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);
    if (user && user.id) isAuthenticated = true;
  } catch { isAuthenticated = false; }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  let isAdmin = false;
  let isLoggedIn = false;
  try {
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);
    if (user) {
      isLoggedIn = true;
      if (user.role === 'admin') isAdmin = true;
    }
  } catch { isLoggedIn = false; }
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Unauthorized />;
  return children;
};

// --- MEGA FOOTER COMPONENT ---
const MegaFooter = () => {
  const [hoverLink, setHoverLink] = useState(null);
  const [activePolicy, setActivePolicy] = useState(null); // 'PRIVACY', 'TERMS', 'COOKIE', or null
  
  const handleMouseEnter = (link) => setHoverLink(link);
  const handleMouseLeave = () => setHoverLink(null);
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    alert("Thank you for subscribing! Check your inbox shortly.");
  };

  const linkStyle = (name) => ({
    ...styles.footerLink,
    color: hoverLink === name ? '#FFCC00' : '#cbd5e1',
    paddingLeft: hoverLink === name ? '5px' : '0px',
  });

  return (
    <>
      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          
          {/* COLUMN 1: BRAND */}
          <div style={styles.footerCol}>
            <div style={styles.logoGroup}>
              <div style={styles.logoIcon}>
                <i className="bi bi-mortarboard-fill"></i>
              </div>
              <div>
                <div style={styles.brandText}>SJU ALUMNI</div>
                <div style={styles.brandSub}>CONNECT & GROW</div>
              </div>
            </div>
            <p style={styles.footerDesc}>
              The official digital bridge connecting thousands of students and alumni. 
              Fostering mentorship, career growth, and lifelong relationships within the Josephite family.
            </p>
          </div>

          {/* COLUMN 2: QUICK LINKS */}
          <div style={styles.footerCol}>
            <h4 style={styles.footerTitle}>Quick Links</h4>
            <div style={styles.linkList}>
              <Link to="/" style={linkStyle('Home')} onMouseEnter={() => handleMouseEnter('Home')} onMouseLeave={handleMouseLeave}>Home</Link>
              <Link to="/directory" style={linkStyle('Dir')} onMouseEnter={() => handleMouseEnter('Dir')} onMouseLeave={handleMouseLeave}>Alumni Directory</Link>
              <Link to="/jobs" style={linkStyle('Jobs')} onMouseEnter={() => handleMouseEnter('Jobs')} onMouseLeave={handleMouseLeave}>Career Opportunities</Link>
              <Link to="/mentorship" style={linkStyle('Ment')} onMouseEnter={() => handleMouseEnter('Ment')} onMouseLeave={handleMouseLeave}>Find a Mentor</Link>
            </div>
          </div>

          {/* COLUMN 3: CONTACT */}
          <div style={styles.footerCol}>
            <h4 style={styles.footerTitle}>Contact Us</h4>
            <div style={styles.contactItem}>
              <i className="bi bi-geo-alt-fill" style={styles.contactIcon}></i>
              <div>36, Langford Rd, Langford Gardens,<br/>Bengaluru, Karnataka 560027</div>
            </div>
            <a href="mailto:alumni.sju.ainp@gmail.com" style={{...styles.contactItem, textDecoration:'none', cursor:'pointer'}}>
              <i className="bi bi-envelope-fill" style={styles.contactIcon}></i>
              <span>alumni.sju.ainp@gmail.com</span>
            </a>
            <a href="tel:+918022211429" style={{...styles.contactItem, textDecoration:'none', cursor:'pointer'}}>
              <i className="bi bi-telephone-fill" style={styles.contactIcon}></i>
              <span>+91 80 2221 1429</span>
            </a>
          </div>

          {/* COLUMN 4: UPDATES */}
          <div style={styles.footerCol}>
            <h4 style={styles.footerTitle}>Stay Updated</h4>
            <p style={{...styles.footerDesc, marginBottom: '15px'}}>Subscribe to get the latest news and event invites directly to your inbox.</p>
            <form onSubmit={handleSubscribe} style={styles.newsletterBox}>
              <input type="email" placeholder="Your Email Address" style={styles.input} required />
              <button type="submit" style={styles.btnGo}>GO</button>
            </form>
            
            {/* SOCIAL MEDIA LINKS (Official SJU Accounts) */}
            <div style={styles.socialGroup}>
              <a href="https://www.linkedin.com/school/st-joseph's-university-bengaluru/" target="_blank" rel="noreferrer" className="hover-lift" style={styles.socialIcon}>
                <i className="bi bi-linkedin"></i>
              </a>
              <a href="https://twitter.com/sjubengaluru" target="_blank" rel="noreferrer" className="hover-lift" style={styles.socialIcon}>
                <i className="bi bi-twitter-x"></i>
              </a>
              <a href="https://www.instagram.com/stjosephsuniversity/" target="_blank" rel="noreferrer" className="hover-lift" style={styles.socialIcon}>
                <i className="bi bi-instagram"></i>
              </a>
              <a href="https://www.facebook.com/sjubengaluru/" target="_blank" rel="noreferrer" className="hover-lift" style={styles.socialIcon}>
                <i className="bi bi-facebook"></i>
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR WITH POLICY TRIGGERS */}
        <div style={styles.footerBottom}>
          <div>© 2026 St. Joseph's University Alumni Portal. All Rights Reserved.</div>
          <div style={styles.legalLinks}>
            <button onClick={() => setActivePolicy('PRIVACY')} style={styles.legalLink} className="hover-text">Privacy Policy</button>
            <button onClick={() => setActivePolicy('TERMS')} style={styles.legalLink} className="hover-text">Terms of Service</button>
            <button onClick={() => setActivePolicy('COOKIE')} style={styles.legalLink} className="hover-text">Cookie Policy</button>
          </div>
        </div>
        
        <style>{`
          .hover-lift:hover { transform: translateY(-3px); background-color: #FFCC00 !important; }
          .hover-text:hover { color: #FFCC00 !important; text-decoration: none; }
          @media (max-width: 900px) { footer > div { grid-template-columns: 1fr 1fr; } }
          @media (max-width: 600px) { 
            footer > div { grid-template-columns: 1fr; } 
            .legalLinks { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
          }
        `}</style>
      </footer>

      {/* POLICY POPUP WINDOW */}
      <PolicyModal 
        policy={activePolicy ? POLICY_CONTENT[activePolicy] : null} 
        onClose={() => setActivePolicy(null)} 
      />
    </>
  );
};

// --- MAIN APP COMPONENT ---
function App() {
  return (
    <Router>
      <div style={styles.appWrapper}>
        <ScrollToTop />
        <Navbar />
        <main style={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/directory" element={ <ProtectedRoute><Directory /></ProtectedRoute> } />
            <Route path="/jobs" element={ <ProtectedRoute><Jobs /></ProtectedRoute> } />
            <Route path="/mentorship" element={ <ProtectedRoute><Mentorship /></ProtectedRoute> } />
            <Route path="/admin" element={ <AdminRoute><AdminDashboard /></AdminRoute> } />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <MegaFooter />
      </div>
    </Router>
  );
}

export default App;