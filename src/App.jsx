import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';

// ============================================================================
// COMPONENT IMPORTS (Map these to your React + Vite project structure)
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
// CONFIGURATION & CREDENTIALS
// ============================================================================
const EMAIL_GATEWAY = {
  serviceId: "service_gyaan",
  templateId: "template_1jmzaa9",
  publicKey: "MgWnLyUUS3faeP6W5",
};

// ============================================================================
// ULTRA-DETAILED POLICY CONTENT 
// ============================================================================
const POLICY_CONTENT = {
  PRIVACY: {
    title: "Comprehensive Privacy Policy",
    content: `Last Updated: March 2026

1. INTRODUCTION & SCOPE
St. Joseph's University ("SJU", "we", "us", or "our") is committed to protecting the privacy of our alumni, final-year students, and faculty. This Privacy Policy details how we collect, use, store, and share your personal data when you interact with the SJU Alumni Portal.

2. INFORMATION WE COLLECT
a) Information You Provide:
- Identity Data: Full name, registration number, date of birth, and graduation year.
- Contact Data: Personal and professional email addresses, phone numbers, and physical addresses.
- Professional Data: Current employer, job title, industry, and LinkedIn profile URLs.
- Mentorship Data: Skills offered, areas of expertise, and mentorship availability.

b) Automatically Collected Data:
- Technical Data: IP addresses, browser types, operating systems, and device identifiers.
- Usage Data: Login timestamps, page views, search queries within the directory, and interaction metrics.

3. HOW WE USE YOUR INFORMATION
Your data is strictly utilized for the following university-sanctioned purposes:
- Verification: Authenticating your identity to prevent unauthorized access to the alumni network.
- Networking: Populating the searchable Alumni Directory (you control the visibility of specific fields).
- Mentorship Matching: Connecting current students and recent graduates with established alumni.
- Communications: Distributing the official SJU Alumni Newsletter, event invitations, and fundraising campaigns.
- Accreditation & Analytics: Generating anonymized, aggregated demographic reports for NAAC, NIRF, and internal strategic planning.

4. DATA SHARING & DISCLOSURE
SJU strictly prohibits the monetization, sale, or unauthorized trading of your personal information. We only share data under the following circumstances:
- Service Providers: Trusted third-party vendors (e.g., EmailJS, Firebase database hosting) who operate under strict confidentiality agreements.
- Legal Compliance: When required by law, subpoena, or to protect the vital interests of the University and its community members.

5. DATA RETENTION & SECURITY
We employ industry-standard cryptographic protocols (SSL/TLS) for data in transit and robust access controls for data at rest. Your profile data is retained indefinitely to maintain the historical alumni archive, unless you explicitly request deletion.

6. YOUR PRIVACY RIGHTS
Depending on your jurisdiction, you possess the right to:
- Access a copy of your personal data.
- Rectify inaccuracies in your profile.
- Restrict the processing of your data.
- Request the erasure of your digital footprint on this portal (Right to be Forgotten).

To exercise these rights, please contact the IT Administrator or Alumni Office directly.`
  },
  TERMS: {
    title: "Terms of Service & Code of Conduct",
    content: `Last Updated: March 2026

1. ACCEPTANCE OF TERMS
By registering, accessing, or utilizing the SJU Alumni Portal, you formally agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must immediately cease using the platform.

2. ELIGIBILITY
Access to this platform is restricted exclusively to:
- Verified alumni of St. Joseph's University.
- Currently enrolled final-year undergraduate (e.g., B.Sc.) and postgraduate students.
- Current and former faculty members.
Unauthorized account creation constitutes a breach of these terms.

3. USER RESPONSIBILITIES & CODE OF CONDUCT
The SJU Alumni Portal is a professional networking environment. You agree to:
- Provide accurate, current, and truthful information during registration.
- Maintain the confidentiality of your account credentials.
- Treat all community members with respect and professionalism.

You explicitly agree NOT to engage in:
- Harassment, discrimination, hate speech, or targeted bullying.
- The mass distribution of unsolicited promotional materials, spam, or multi-level marketing (MLM) schemes.
- Data scraping, harvesting, or utilizing automated bots to extract alumni contact information for commercial purposes.
- Impersonating university officials, administration, or other alumni.

4. INTELLECTUAL PROPERTY RIGHTS
All portal designs, graphics, text, logos, underlying code (React/Vite architecture), and databases are the exclusive property of St. Joseph's University. You may not reproduce, distribute, or create derivative works without explicit written permission.

5. USER-GENERATED CONTENT
By posting content (e.g., job listings, mentorship offers, forum posts), you grant SJU a non-exclusive, royalty-free license to display, modify, and distribute said content within the portal ecosystem.

6. LIMITATION OF LIABILITY
SJU provides this portal on an "AS IS" and "AS AVAILABLE" basis. We do not warrant that the service will be uninterrupted, error-free, or entirely secure. SJU shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.

7. ACCOUNT TERMINATION
The University reserves the unilateral right to suspend, restrict, or permanently terminate any account that violates this Code of Conduct, with or without prior notice.`
  },
  COOKIE: {
    title: "Detailed Cookie Policy",
    content: `Last Updated: March 2026

1. UNDERSTANDING COOKIES
Cookies are micro-data files transferred to your device's browser when you visit the SJU Alumni Portal. They act as a memory for the website, allowing it to recognize your device upon subsequent visits.

2. CLASSIFICATION OF COOKIES WE USE
a) Strictly Necessary Cookies:
These are fundamental to the operation of the portal. They facilitate secure logins, maintain your session state, and ensure the routing architecture functions correctly. The portal cannot operate without these, and they do not require user consent.

b) Functional & Preference Cookies:
These allow the platform to remember choices you make (such as language preferences, theme settings, or customized dashboard layouts) to provide a highly personalized experience.

c) Analytical & Performance Cookies:
We utilize these to collect aggregated, anonymous data on how users interact with the portal. This helps us understand metrics like page load times, popular job board sections, and error rates, allowing us to continuously optimize the user experience.

3. THIRD-PARTY TRACKING
Certain embedded features (such as Google Maps for alumni chapter events or YouTube embeds for university updates) may deploy their own cookies. SJU does not control these third-party trackers, and their usage is governed by the respective providers' privacy policies.

4. MANAGING YOUR COOKIE PREFERENCES
You maintain full control over your cookie environment. Most modern browsers allow you to:
- View all active cookies.
- Delete specific cookies or clear them entirely.
- Block third-party cookies globally.

Please note that disabling strictly necessary cookies will prevent you from authenticating and accessing secure areas of the SJU Alumni Portal.`
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
    marginTop: '80px', 
    width: '100%',
    position: 'relative',
  },
  
  // --- FOOTER STYLES ---
  footer: {
    flexShrink: 0,
    backgroundColor: '#060e1a', 
    color: '#e2e8f0',
    paddingTop: '80px',
    paddingBottom: '30px',
    borderTop: '4px solid #FFCC00', 
    fontFamily: "'Lora', serif", 
    position: 'relative',
    overflow: 'hidden',
  },
  footerOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255, 204, 0, 0.04) 0%, transparent 60%)',
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
    borderRadius: '12px', 
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
    fontWeight: '500',
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
  backToTopBtn: {
    position: 'absolute',
    right: '20px',
    top: '-20px',
    width: '40px',
    height: '40px',
    backgroundColor: '#FFCC00',
    color: '#060e1a',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
    border: 'none',
    transition: 'transform 0.3s ease',
  },

  // --- MODAL STYLES ---
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
    maxWidth: '700px',
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
    fontFamily: "'Segoe UI', Roboto, sans-serif",
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
    document.body.style.overflow = 'hidden'; 
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
// DYNAMIC MEGA FOOTER 
// ============================================================================
const MegaFooter = () => {
  const location = useLocation();
  const [hoverLink, setHoverLink] = useState(null);
  const [activePolicy, setActivePolicy] = useState(null);
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState('idle'); 

  // --- HIDE FOOTER LOGIC ---
  // The footer will NOT render if the current URL exactly matches or starts with these routes.
  const hiddenRoutes = ['/login', '/register', '/admin'];
  const shouldHideFooter = hiddenRoutes.some(route => location.pathname.startsWith(route));

  if (shouldHideFooter) {
    return null; // Render absolutely nothing on these pages.
  }

  // --- ROBUST EMAILJS HANDLER ---
  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    // Basic Regex Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setSubStatus('error');
      setTimeout(() => setSubStatus('idle'), 3000);
      return;
    }
    
    setSubStatus('loading');
    
    try {
      // Corrected payload mapping
      await emailjs.send(
        EMAIL_GATEWAY.serviceId,
        EMAIL_GATEWAY.templateId,
        {
          to_email: email, // Maps to your EmailJS template variable
          to_name: "SJU Alumni Member", 
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
      case 'loading': return <span style={{ color: '#FFCC00' }}><i className="bi bi-hourglass-split spin"></i> Verifying...</span>;
      case 'success': return <span style={{ color: '#10B981' }}><i className="bi bi-check-circle-fill"></i> Welcome to the list!</span>;
      case 'error': return <span style={{ color: '#EF4444' }}><i className="bi bi-exclamation-triangle-fill"></i> Invalid email or server error.</span>;
      default: return <span style={{ color: '#64748B', opacity: 0 }}>Placeholder</span>;
    }
  };

  const linkStyle = (name) => ({
    ...styles.footerLink,
    color: hoverLink === name ? '#FFCC00' : '#cbd5e1',
    transform: hoverLink === name ? 'translateX(6px)' : 'translateX(0)',
  });

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

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
            
            <form onSubmit={handleSubscribe} className="newsletter-form" style={{...styles.newsletterBox, borderColor: subStatus === 'loading' ? '#FFCC00' : subStatus === 'error' ? '#EF4444' : 'rgba(255,255,255,0.1)'}}>
              <input 
                type="text" // Changed from email to allow regex check before native browser validation
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
              <a href="https://www.youtube.com/@StJosephsUniversityBengaluru" target="_blank" rel="noreferrer" className="social-glowing" style={styles.socialIcon} aria-label="YouTube">
                <i className="bi bi-youtube"></i>
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR WITH POLICY TRIGGERS */}
        <div style={styles.footerBottom}>
          <button onClick={scrollToTop} style={styles.backToTopBtn} className="back-to-top-hover" aria-label="Back to top">
            <i className="bi bi-arrow-up-short" style={{fontSize: '1.5rem'}}></i>
          </button>
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

          /* Bottom Links & Buttons */
          .legal-link-hover::after {
            content: ''; position: absolute; width: 100%; transform: scaleX(0);
            height: 1px; bottom: -2px; left: 0; background-color: #FFCC00;
            transform-origin: bottom right; transition: transform 0.25s ease-out;
          }
          .legal-link-hover:hover { color: #FFCC00 !important; }
          .legal-link-hover:hover::after { transform: scaleX(1); transform-origin: bottom left; }
          
          .back-to-top-hover:hover { transform: translateY(-5px) !important; background-color: #fff !important; }

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
            .footerBottom { flex-direction: column; text-align: center; padding-top: 50px; }
            .backToTopBtn { top: -20px; right: 50%; transform: translateX(50%); }
            .back-to-top-hover:hover { transform: translate(50%, -5px) !important; }
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
            
            {/* ROUTES WHERE FOOTER IS HIDDEN (Handled inside MegaFooter) */}
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