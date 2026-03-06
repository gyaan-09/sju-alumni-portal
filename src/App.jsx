import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';

// ============================================================================
// COMPONENT IMPORTS (Placeholders mapping to your project structure)
// ============================================================================
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Directory from './components/Directory';
import Jobs from './components/Jobs';
import Mentorship from './components/Mentorship';
import AdminDashboard from './components/AdminDashboard';

// ============================================================================
// CONFIGURATION & DATA (Policies & EmailJS Constants)
// ============================================================================
const EMAIL_GATEWAY = {
  serviceId: "service_gyaan",
  templateId: "template_1jmzaa9", // Reusing the template ID from the admin portal
  publicKey: "MgWnLyUUS3faeP6W5",
};

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

// ============================================================================
// MASTER INLINE STYLES SYSTEM
// ============================================================================
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
  
  // --- ENHANCED FOOTER STYLES ---
  footer: {
    flexShrink: 0,
    backgroundColor: '#060e1a', // Deep Navy
    color: '#e2e8f0',
    paddingTop: '80px',
    paddingBottom: '30px',
    borderTop: '4px solid #FFCC00', // SJU Gold accent border
    fontFamily: "'Lora', serif", // Updated to Lora
    position: 'relative',
    overflow: 'hidden',
  },
  footerOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255, 204, 0, 0.03) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  footerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)', 
    gap: '50px',
    position: 'relative',
    zIndex: 2,
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
    gap: '16px',
    cursor: 'default',
  },
  logoIcon: {
    fontSize: '1.8rem',
    backgroundColor: '#fff',
    color: '#060e1a',
    borderRadius: '12px', // Slightly squared off for a modern crest look
    width: '50px', 
    height: '50px',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(255, 204, 0, 0.2)',
    transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  brandText: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#FFCC00', 
    textTransform: 'uppercase',
    lineHeight: '1',
    letterSpacing: '0.05em',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },
  brandSub: {
    color: '#fff',
    fontSize: '0.8rem',
    fontWeight: '500',
    letterSpacing: '2px',
    marginTop: '6px',
    opacity: 0.8,
  },
  footerDesc: {
    color: '#94a3b8',
    fontSize: '0.95rem',
    lineHeight: '1.8',
    maxWidth: '280px',
    fontWeight: '400',
  },
  // Headings
  footerTitle: {
    color: '#ffffff',
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '25px',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    position: 'relative',
    paddingBottom: '10px',
  },
  // Links
  linkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  footerLink: {
    color: '#cbd5e1', 
    textDecoration: 'none',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: '500',
  },
  // Contact Items
  contactItem: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '20px',
    color: '#cbd5e1',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    transition: 'color 0.3s ease',
  },
  contactIcon: {
    color: '#FFCC00',
    marginRight: '14px',
    fontSize: '1.1rem',
    marginTop: '3px',
    filter: 'drop-shadow(0 0 4px rgba(255, 204, 0, 0.4))',
  },
  // Newsletter
  newsletterBox: {
    display: 'flex',
    gap: '0',
    marginTop: '15px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    borderRadius: '6px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'border-color 0.3s ease',
  },
  input: {
    padding: '14px 18px',
    border: 'none',
    width: '100%',
    outline: 'none',
    fontSize: '0.95rem',
    fontFamily: "'Lora', serif",
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    transition: 'background-color 0.3s ease',
  },
  btnGo: {
    backgroundColor: '#FFCC00',
    color: '#060e1a',
    fontWeight: '800',
    border: 'none',
    padding: '0 25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: "'Lora', serif",
    fontSize: '1rem',
    letterSpacing: '1px',
  },
  btnGoDisabled: {
    backgroundColor: '#64748b',
    color: '#cbd5e1',
    cursor: 'not-allowed',
  },
  statusText: {
    fontSize: '0.85rem',
    marginTop: '8px',
    display: 'block',
    minHeight: '20px',
    transition: 'opacity 0.3s ease',
  },
  socialGroup: {
    marginTop: '30px',
    display: 'flex',
    gap: '15px'
  },
  socialIcon: {
    width: '38px', 
    height: '38px', 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    color: '#fff',
    fontSize: '1.2rem',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    cursor: 'pointer',
    textDecoration: 'none'
  },
  // Bottom Bar
  footerBottom: {
    marginTop: '70px',
    paddingTop: '30px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.9rem',
    color: '#64748B',
    maxWidth: '1200px',
    margin: '70px auto 0 auto',
    paddingLeft: '20px',
    paddingRight: '20px',
    position: 'relative',
    zIndex: 2,
  },
  legalLinks: {
    display: 'flex',
    gap: '24px'
  },
  legalLink: {
    color: '#64748B',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    background: 'none',
    padding: 0,
    fontFamily: "'Lora', serif",
    fontSize: 'inherit',
    position: 'relative',
  },

  // --- ULTRA-ENHANCED MODAL STYLES ---
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(6, 14, 26, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px',
    animation: 'overlayFade 0.3s ease',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '650px',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1) inset',
    animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '24px 30px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#060e1a',
    fontFamily: "'Lora', serif",
  },
  closeBtn: {
    background: '#e2e8f0',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: '#475569',
    transition: 'all 0.2s',
  },
  modalBody: {
    padding: '30px',
    overflowY: 'auto',
    fontSize: '1rem',
    lineHeight: '1.8',
    color: '#334155',
    whiteSpace: 'pre-wrap',
    fontFamily: "'Segoe UI', Roboto, sans-serif", // Keep body text readable
  },

  // --- ERROR PAGES ---
  errorPage: {
    minHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#fff',
  },
  errorCode: {
    fontSize: '8rem',
    fontWeight: '900',
    color: '#060e1a',
    lineHeight: '1',
    marginBottom: '10px',
    textShadow: '4px 4px 0px rgba(255, 204, 0, 0.3)',
  },
  errorMsg: {
    fontSize: '1.2rem',
    color: '#64748b',
    marginBottom: '40px',
    maxWidth: '500px',
    lineHeight: '1.6',
  },
  btnHome: {
    backgroundColor: '#060e1a',
    color: '#FFCC00',
    padding: '14px 36px',
    borderRadius: '999px',
    textDecoration: 'none',
    fontWeight: '700',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 14px rgba(6, 14, 26, 0.2)',
  }
};

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

// --- POLICY MODAL ---
const PolicyModal = ({ policy, onClose }) => {
  if (!policy) return null;

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>{policy.title}</h3>
          <button style={styles.closeBtn} onClick={onClose} className="modal-close-hover">
            <i className="bi bi-x-lg" style={{ fontSize: '0.9rem' }}></i>
          </button>
        </div>
        <div style={styles.modalBody}>
          {policy.content}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ROUTE GUARDS
// ============================================================================
const Unauthorized = () => (
  <div style={styles.errorPage}>
    <div style={styles.errorCode}>403</div>
    <h2 style={{color: '#060e1a', fontWeight: '800', fontFamily: "'Lora', serif", fontSize: '2.5rem'}}>Access Restricted</h2>
    <p style={styles.errorMsg}>You do not have permission to view this directory.<br/>This area requires elevated administrative credentials.</p>
    <Link to="/" style={styles.btnHome} className="btn-lift">Return to Safety</Link>
  </div>
);

const NotFound = () => (
  <div style={styles.errorPage}>
    <div style={styles.errorCode}><span style={{color:'#FFCC00'}}>4</span>04</div>
    <h2 style={{color: '#060e1a', fontWeight: '800', fontFamily: "'Lora', serif", fontSize: '2.5rem'}}>Page Not Found</h2>
    <p style={styles.errorMsg}>The coordinates you entered don't map to any sector in our alumni network. The page may have been moved.</p>
    <Link to="/" style={styles.btnHome} className="btn-lift">Go Back Home</Link>
  </div>
);

const ProtectedRoute = ({ children }) => {
  let isAuthenticated = false;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) isAuthenticated = true;
  } catch { isAuthenticated = false; }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  let isAdmin = false;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role === 'admin') isAdmin = true;
  } catch { isAdmin = false; }
  return isAdmin ? children : <Unauthorized />;
};

// ============================================================================
// MEGA FOOTER (ULTRA ENHANCED w/ EMAILJS)
// ============================================================================
const MegaFooter = () => {
  const [hoverLink, setHoverLink] = useState(null);
  const [activePolicy, setActivePolicy] = useState(null);
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    
    setSubStatus('loading');
    
    try {
      await emailjs.send(
        EMAIL_GATEWAY.serviceId,
        EMAIL_GATEWAY.templateId,
        {
          to_email: email,
          to_name: "SJU Community Member",
          message: "Thank you for subscribing to the official SJU Alumni Newsletter! You will now receive updates on events, mentorship programs, and university news.",
          reply_to: "alumni.sju.ainp@gmail.com",
          account_credentials:""
        },
        EMAIL_GATEWAY.publicKey
      );
      
      setSubStatus('success');
      setEmail('');
      setTimeout(() => setSubStatus('idle'), 5000);
    } catch (error) {
      console.error("EmailJS Subscription Error:", error);
      setSubStatus('error');
      setTimeout(() => setSubStatus('idle'), 5000);
    }
  };

  const getStatusMessage = () => {
    switch (subStatus) {
      case 'loading': return <span style={{ color: '#FFCC00' }}><i className="bi bi-hourglass-split spin"></i> Processing...</span>;
      case 'success': return <span style={{ color: '#10B981' }}><i className="bi bi-check-circle-fill"></i> Successfully subscribed!</span>;
      case 'error': return <span style={{ color: '#EF4444' }}><i className="bi bi-exclamation-triangle-fill"></i> Subscription failed. Please try again.</span>;
      default: return <span style={{ color: '#64748B', opacity: 0 }}>Placeholder</span>;
    }
  };

  const linkStyle = (name) => ({
    ...styles.footerLink,
    color: hoverLink === name ? '#FFCC00' : '#cbd5e1',
    transform: hoverLink === name ? 'translateX(6px)' : 'translateX(0)',
  });

  return (
    <>
      <footer style={styles.footer}>
        <div style={styles.footerOverlay}></div>
        <div style={styles.footerContainer}>
          
          {/* COLUMN 1: BRAND */}
          <div style={styles.footerCol}>
            <div style={styles.logoGroup} className="logo-hover-group">
              <div style={styles.logoIcon} className="logo-spin-target">
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
            <h4 style={styles.footerTitle} className="title-underline">Quick Links</h4>
            <div style={styles.linkList}>
              <Link to="/" style={linkStyle('Home')} onMouseEnter={() => setHoverLink('Home')} onMouseLeave={() => setHoverLink(null)}>
                <i className="bi bi-chevron-right" style={{ fontSize: '0.7rem', marginRight: hoverLink==='Home'?'8px':'4px', transition: 'all 0.2s', opacity: hoverLink==='Home'?1:0.5 }}></i> Home
              </Link>
              <Link to="/directory" style={linkStyle('Dir')} onMouseEnter={() => setHoverLink('Dir')} onMouseLeave={() => setHoverLink(null)}>
                <i className="bi bi-chevron-right" style={{ fontSize: '0.7rem', marginRight: hoverLink==='Dir'?'8px':'4px', transition: 'all 0.2s', opacity: hoverLink==='Dir'?1:0.5 }}></i> Alumni Directory
              </Link>
              <Link to="/jobs" style={linkStyle('Jobs')} onMouseEnter={() => setHoverLink('Jobs')} onMouseLeave={() => setHoverLink(null)}>
                <i className="bi bi-chevron-right" style={{ fontSize: '0.7rem', marginRight: hoverLink==='Jobs'?'8px':'4px', transition: 'all 0.2s', opacity: hoverLink==='Jobs'?1:0.5 }}></i> Career Board
              </Link>
              <Link to="/mentorship" style={linkStyle('Ment')} onMouseEnter={() => setHoverLink('Ment')} onMouseLeave={() => setHoverLink(null)}>
                <i className="bi bi-chevron-right" style={{ fontSize: '0.7rem', marginRight: hoverLink==='Ment'?'8px':'4px', transition: 'all 0.2s', opacity: hoverLink==='Ment'?1:0.5 }}></i> Find a Mentor
              </Link>
            </div>
          </div>

          {/* COLUMN 3: CONTACT */}
          <div style={styles.footerCol}>
            <h4 style={styles.footerTitle} className="title-underline">Contact Us</h4>
            <div style={styles.contactItem} className="contact-hover">
              <i className="bi bi-geo-alt-fill" style={styles.contactIcon}></i>
              <div>36, Langford Rd, Langford Gardens,<br/>Bengaluru, Karnataka 560027</div>
            </div>
            <a href="mailto:alumni.sju.ainp@gmail.com" style={{...styles.contactItem, textDecoration:'none'}} className="contact-hover">
              <i className="bi bi-envelope-fill" style={styles.contactIcon}></i>
              <span>alumni.sju.ainp@gmail.com</span>
            </a>
            <a href="tel:+918022211429" style={{...styles.contactItem, textDecoration:'none'}} className="contact-hover">
              <i className="bi bi-telephone-fill" style={styles.contactIcon}></i>
              <span>+91 80 2221 1429</span>
            </a>
          </div>

          {/* COLUMN 4: UPDATES & INTEGRATION */}
          <div style={styles.footerCol}>
            <h4 style={styles.footerTitle} className="title-underline">Stay Updated</h4>
            <p style={{...styles.footerDesc, marginBottom: '10px'}}>Subscribe to get the latest news and event invites directly to your inbox.</p>
            
            <form onSubmit={handleSubscribe} className="newsletter-form" style={{...styles.newsletterBox, borderColor: subStatus === 'loading' ? '#FFCC00' : 'rgba(255,255,255,0.1)'}}>
              <input 
                type="email" 
                placeholder="Your Email Address" 
                style={styles.input} 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={subStatus === 'loading'}
                className="input-focus-glow"
              />
              <button 
                type="submit" 
                style={{...styles.btnGo, ...(subStatus === 'loading' ? styles.btnGoDisabled : {})}}
                disabled={subStatus === 'loading'}
                className={subStatus === 'loading' ? '' : 'btn-pulse-hover'}
              >
                {subStatus === 'loading' ? <i className="bi bi-send-fill" style={{opacity: 0.5}}></i> : "GO"}
              </button>
            </form>
            <div style={styles.statusText}>{getStatusMessage()}</div>
            
            {/* SOCIAL MEDIA LINKS (Official SJU Accounts + YouTube) */}
            <div style={styles.socialGroup}>
              <a href="https://www.linkedin.com/school/st-joseph's-university-bengaluru/" target="_blank" rel="noreferrer" className="social-glowing" style={styles.socialIcon} aria-label="LinkedIn">
                <i className="bi bi-linkedin"></i>
              </a>
              <a href="https://twitter.com/sjubengaluru" target="_blank" rel="noreferrer" className="social-glowing" style={styles.socialIcon} aria-label="Twitter">
                <i className="bi bi-twitter-x"></i>
              </a>
              <a href="https://www.instagram.com/stjosephsuniversity/" target="_blank" rel="noreferrer" className="social-glowing" style={styles.socialIcon} aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="https://www.facebook.com/sjubengaluru/" target="_blank" rel="noreferrer" className="social-glowing" style={styles.socialIcon} aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="https://www.youtube.com/@StJosephsUniversityBengaluru" target="_blank" rel="noreferrer" className="social-glowing" style={styles.socialIcon} aria-label="YouTube">
                <i className="bi bi-youtube"></i>
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR WITH POLICY TRIGGERS */}
        <div style={styles.footerBottom}>
          <div>© {new Date().getFullYear()} St. Joseph's University Alumni Portal. All Rights Reserved.</div>
          <div style={styles.legalLinks}>
            <button onClick={() => setActivePolicy('PRIVACY')} style={styles.legalLink} className="legal-link-hover">Privacy Policy</button>
            <button onClick={() => setActivePolicy('TERMS')} style={styles.legalLink} className="legal-link-hover">Terms of Service</button>
            <button onClick={() => setActivePolicy('COOKIE')} style={styles.legalLink} className="legal-link-hover">Cookie Policy</button>
          </div>
        </div>
        
        {/* ULTRA-ENHANCED CSS INJECTION */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
          
          /* Keyframes */
          @keyframes overlayFade { from { opacity: 0; } to { opacity: 1; } }
          @keyframes modalSlideUp { from { opacity: 0; transform: translateY(40px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
          @keyframes spin { 100% { transform: rotate(360deg); } }
          
          .spin { display: inline-block; animation: spin 1.5s linear infinite; }

          /* Interactive Hovers */
          .logo-hover-group:hover .logo-spin-target { transform: rotate(-10deg) scale(1.05); color: #FFCC00; }
          
          .title-underline::after {
            content: ''; position: absolute; left: 0; bottom: 0;
            width: 30px; height: 3px; background-color: #FFCC00;
            transition: width 0.3s ease; border-radius: 2px;
          }
          .footerCol:hover .title-underline::after { width: 60px; }

          .contact-hover:hover { color: #FFCC00 !important; transform: translateX(4px); }
          .contact-hover:hover .bi { transform: scale(1.1); }

          /* Form Enhancements */
          .input-focus-glow:focus { background-color: rgba(255, 255, 255, 0.1) !important; }
          .btn-pulse-hover:hover { background-color: #ffd633 !important; transform: scale(1.02); }
          .btn-pulse-hover:active { transform: scale(0.98); }

          /* Social Glowing Icons */
          .social-glowing:hover {
            background-color: #FFCC00 !important;
            color: #060e1a !important;
            border-color: #FFCC00 !important;
            transform: translateY(-5px);
            box-shadow: 0 10px 20px -5px rgba(255, 204, 0, 0.5);
          }

          /* Bottom Links */
          .legal-link-hover::after {
            content: ''; position: absolute; width: 100%; transform: scaleX(0);
            height: 1px; bottom: -2px; left: 0; background-color: #FFCC00;
            transform-origin: bottom right; transition: transform 0.25s ease-out;
          }
          .legal-link-hover:hover { color: #FFCC00 !important; }
          .legal-link-hover:hover::after { transform: scaleX(1); transform-origin: bottom left; }

          /* Modal Close button */
          .modal-close-hover:hover { background: #cbd5e1 !important; color: #ef4444 !important; transform: rotate(90deg); }

          /* Generic Button Lift for error pages */
          .btn-lift:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(6, 14, 26, 0.3) !important; background-color: #0a172a !important; }

          /* Responsive Breakpoints */
          @media (max-width: 1024px) { 
            footer > div.footerContainer { grid-template-columns: repeat(2, 1fr); gap: 40px; } 
          }
          @media (max-width: 650px) { 
            footer > div.footerContainer { grid-template-columns: 1fr; gap: 40px; } 
            .legalLinks { display: flex; flex-direction: column; align-items: center; gap: 15px; margin-top: 20px; }
            .footerBottom { flex-direction: column; text-align: center; }
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

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================
function App() {
  return (
    <Router>
      <div style={styles.appWrapper}>
        <ScrollToTop />
        <Navbar />
        <main style={styles.mainContent}>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Home />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* SECURE ROUTES */}
            <Route path="/directory" element={ <ProtectedRoute><Directory /></ProtectedRoute> } />
            <Route path="/jobs" element={ <ProtectedRoute><Jobs /></ProtectedRoute> } />
            <Route path="/mentorship" element={ <ProtectedRoute><Mentorship /></ProtectedRoute> } />
            
            {/* ADMIN ROUTE */}
            <Route path="/admin" element={ <AdminRoute><AdminDashboard /></AdminRoute> } />
            
            {/* ERROR ROUTES */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        {/* GLOBAL ULTRA-ENHANCED FOOTER */}
        <MegaFooter />
      </div>
    </Router>
  );
}

export default App;