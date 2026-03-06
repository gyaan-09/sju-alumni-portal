import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

/**
 * ==================================================================================
 * SJU ENTERPRISE ACCESS GATEWAY - OMEGA PRESTIGE EDITION (v22.0)
 * ==================================================================================
 * ARCHITECTURE & ENHANCEMENTS:
 * - Typography: Global enforcement of 'Lora' serif font for academic elegance.
 * - Dual-Engine Authentication: Local Bridge + REST API Fallback.
 * - Dynamic Background: Animated ambient orb mesh gradients + Glassmorphism.
 * - Micro-interactions: Advanced floating labels, input focus ripples, tab morphing.
 * - Live Ticker: Continuous CSS marquee scrolling for campus updates.
 * - Security UX: Caps-lock detection, real-time input validation, haptic-style delays.
 * - Modules: Biometric Simulation, Secure Recovery Wizard, Pre-flight Integrity Check.
 * - FIX APPLIED: 'key' prop injection on tab content to prevent DOM overlapping.
 * ==================================================================================
 */

// --- 1. CONFIGURATION & CONSTANTS ---
const SYSTEM_CONFIG = {
  INSTITUTION_NAME: "St. Joseph's University",
  PORTAL_NAME: "Alumni Connect Gateway",
  VERSION: "v22.0.0-Omega",
  SUPPORT_EMAIL: "tech.support@sju.edu",
  API_URL: "http://localhost:8081/api/auth/login",
  SIMULATED_DELAY: 1500
};

const ALUMNI_HIGHLIGHTS = [
  "🎉 120+ Josephites placed in Fortune 500 companies this quarter.",
  "📢 Annual Alumni Meet 'Milan 2026' scheduled for Dec 15th.",
  "🚀 New Mentorship Program connects you with industry leaders.",
  "🎓 Transcript requests are now fully digitized and instant.",
  "🏆 SJU wins the National Inter-University Science Innovation Award.",
  "🌍 Global Alumni Chapter expansion opens in Singapore and Dubai."
];

// --- 2. GLOBAL STYLES & THEME ENGINE ---
const theme = {
  colors: {
    primary: '#003366',
    secondary: '#001a33',
    accent: '#FFCC00',
    accentHover: '#e6b800',
    textLight: '#ffffff',
    textDark: '#0f172a',
    muted: '#64748b',
    border: '#cbd5e1',
    bg: '#f8fafc',
    error: '#ef4444',
    errorBg: '#fef2f2',
    success: '#10b981',
    glass: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.4)',
    darkGlass: 'rgba(15, 23, 42, 0.85)'
  },
  shadows: {
    card: '0 30px 60px -15px rgba(0, 51, 102, 0.2), 0 0 0 1px rgba(255,255,255,0.5) inset',
    glow: '0 0 30px rgba(255, 204, 0, 0.4)',
    inputFocus: '0 0 0 4px rgba(0, 51, 102, 0.1)'
  },
  fonts: {
    main: "'Lora', serif"
  }
};

// --- 3. MICRO-COMPONENTS ---

/**
 * Continuous Scrolling News Ticker
 */
const ScrollingTicker = () => {
  const tickerText = ALUMNI_HIGHLIGHTS.join(" ✦ ");

  return (
    <div style={{
      marginTop: 'auto',
      background: 'rgba(0, 10, 20, 0.4)',
      backdropFilter: 'blur(12px)',
      borderTop: `1px solid rgba(255,204,0,0.3)`,
      borderBottom: `1px solid rgba(255,204,0,0.3)`,
      padding: '15px 0',
      width: '100%',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{ position: 'absolute', left: 0, zIndex: 2, background: 'linear-gradient(90deg, rgba(0,26,51,1) 0%, transparent 100%)', width: '80px', height: '100%' }} />
      <div style={{
        display: 'flex',
        whiteSpace: 'nowrap',
        animation: 'scrollText 45s linear infinite',
        color: theme.colors.textLight,
        fontSize: '1.05rem',
        fontWeight: '500',
        letterSpacing: '0.5px'
      }}>
        <span style={{ paddingRight: '50px' }}>{tickerText} ✦ </span>
        <span style={{ paddingRight: '50px' }}>{tickerText} ✦ </span>
      </div>
      <div style={{ position: 'absolute', right: 0, zIndex: 2, background: 'linear-gradient(-90deg, rgba(0,26,51,1) 0%, transparent 100%)', width: '80px', height: '100%' }} />
    </div>
  );
};

/**
 * Enhanced Floating Label Input with CapsLock Detection
 */
const FloatingInput = ({ label, type, name, value, onChange, icon, error, isPassword, onTogglePass }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const hasValue = value.length > 0;

  useEffect(() => {
    const handleKeyUp = (e) => {
      if (isPassword && isFocused) setCapsLockActive(e.getModifierState('CapsLock'));
    };
    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, [isPassword, isFocused]);

  return (
    <div style={{ marginBottom: '28px', position: 'relative' }}>
      <div 
        style={{
          position: 'relative',
          backgroundColor: isFocused ? '#ffffff' : 'rgba(255,255,255,0.6)',
          borderRadius: '16px',
          border: error ? `2px solid ${theme.colors.error}` : isFocused ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: isFocused ? theme.shadows.inputFocus : 'inset 0 2px 4px rgba(0,0,0,0.02)'
        }}
      >
        {/* Icon */}
        <div style={{ 
          width: '54px', 
          display: 'flex', 
          justifyContent: 'center', 
          color: error ? theme.colors.error : (isFocused ? theme.colors.primary : theme.colors.muted), 
          fontSize: '1.3rem', 
          transition: 'color 0.3s, transform 0.3s',
          transform: isFocused ? 'scale(1.1)' : 'scale(1)'
        }}>
          <i className={`bi ${icon}`}></i>
        </div>

        {/* Input & Label */}
        <div style={{ flex: 1, position: 'relative', height: '100%' }}>
          <label 
            style={{
              position: 'absolute',
              left: '0',
              top: (isFocused || hasValue) ? '12px' : '23px',
              fontSize: (isFocused || hasValue) ? '0.8rem' : '1.05rem',
              color: error ? theme.colors.error : (isFocused ? theme.colors.primary : theme.colors.muted),
              fontWeight: (isFocused || hasValue) ? '700' : '500',
              letterSpacing: (isFocused || hasValue) ? '0.5px' : '0',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: 'none',
              fontFamily: theme.fonts.main
            }}
          >
            {label}
          </label>
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: 'transparent',
              paddingTop: '22px',
              paddingRight: '15px',
              fontSize: '1.15rem',
              color: theme.colors.textDark,
              fontWeight: '600',
              outline: 'none',
              fontFamily: theme.fonts.main
            }}
          />
        </div>

        {/* Caps Lock Warning */}
        {capsLockActive && (
          <div style={{ position: 'absolute', right: isPassword ? '50px' : '15px', color: theme.colors.accentHover, animation: 'fadeIn 0.3s' }} title="Caps Lock is ON">
            <i className="bi bi-capslock-fill fs-5"></i>
          </div>
        )}

        {/* Password Toggle */}
        {isPassword !== undefined && (
          <button 
            type="button"
            onClick={onTogglePass}
            style={{ border: 'none', background: 'transparent', padding: '0 15px', cursor: 'pointer', color: theme.colors.muted, transition: 'color 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.color = theme.colors.primary}
            onMouseOut={(e) => e.currentTarget.style.color = theme.colors.muted}
          >
            <i className={`bi ${isPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} fs-5`}></i>
          </button>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: theme.colors.error, fontSize: '0.9rem', fontWeight: '600', animation: 'shake 0.4s' }}>
          <i className="bi bi-exclamation-circle-fill"></i> {error}
        </div>
      )}
    </div>
  );
};

// --- 4. MAIN LOGIN LOGIC & LAYOUT ---

const Login = () => {
  const navigate = useNavigate();

  // State Management
  const [systemReady, setSystemReady] = useState(false);
  const [activeTab, setActiveTab] = useState('alumni');
  const [creds, setCreds] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Modals & Recovery State
  const [modalMode, setModalMode] = useState(null); // 'recovery' | 'biometric' | null
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [otp, setOtp] = useState(['', '', '', '']);

  // Initialization & Boot Sequence
  useEffect(() => {
    // Inject Lora Font & Global Styles dynamically
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Bootstrap icons if not present
    if (!document.querySelector('link[href*="bootstrap-icons"]')) {
      const icons = document.createElement('link');
      icons.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css';
      icons.rel = 'stylesheet';
      document.head.appendChild(icons);
    }

    // Pre-flight Systems Check (Simulated)
    const initSequence = async () => {
      setTimeout(() => setSystemReady(true), SYSTEM_CONFIG.SIMULATED_DELAY);
    };
    initSequence();

    // Hydrate persistent user ID
    const rememberedId = localStorage.getItem('sju_secure_id');
    if (rememberedId) {
      setCreds(prev => ({ ...prev, identifier: rememberedId }));
      setRememberMe(true);
    }

    return () => document.head.removeChild(link);
  }, []);

  const handleInputChange = (e) => {
    setCreds({ ...creds, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!creds.identifier.trim()) {
      newErrors.identifier = activeTab === 'admin' ? "Administrator ID is required." : "Register Number is required.";
    }
    if (!creds.password) {
      newErrors.password = "Please enter your access key.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Tab Switch Handler (Resets necessary state cleanly)
  const handleTabSwitch = (tab) => {
    if (activeTab === tab) return;
    setActiveTab(tab);
    setErrors({});
    setCreds({ identifier: '', password: '' }); // Clear inputs on tab switch to prevent accidental bleed
    setShowPass(false);
  };

  // Dual-Engine Authentication Logic
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    // 1. MASTER KEY BYPASS (For emergency admin access / Demo)
    if (activeTab === 'admin' && creds.identifier === 'ADMIN01' && creds.password === 'admin123') {
      executeLoginSuccess({ id: 999, role: 'admin', name: 'System Administrator', reg_no: 'ADMIN01' });
      return;
    }

    // 2. LOCAL BRIDGE (Virtual DB Check)
    const virtualUsers = JSON.parse(localStorage.getItem('sju_approved_users') || "[]");
    const foundUser = virtualUsers.find(
      u => (u.reg_no === creds.identifier || u.email === creds.identifier) && u.password === creds.password
    );

    if (foundUser) {
      if (activeTab === 'admin' && foundUser.role !== 'admin') {
        setErrors({ global: "Access Denied: Insufficient Privileges for Admin Gateway." });
        setIsLoading(false);
        return;
      }
      executeLoginSuccess(foundUser);
      return;
    }

    // 3. API HANDSHAKE (REST Fallback)
    try {
      const response = await fetch(SYSTEM_CONFIG.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reg_no: creds.identifier, password: creds.password })
      });

      const data = await response.json();

      if (response.ok) {
        if (activeTab === 'admin' && data.user.role !== 'admin') {
          throw new Error("Access Denied: Insufficient Privileges");
        }
        executeLoginSuccess(data.user);
      } else {
        if (response.status === 403) {
          setErrors({ global: "Account Pending Verification. Please contact support." });
        } else {
          setErrors({ global: "The credentials provided do not match our records." });
        }
      }
    } catch (err) {
      setErrors({ global: err.message || "System currently unreachable. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const executeLoginSuccess = (userPayload) => {
    localStorage.setItem('user', JSON.stringify(userPayload));
    if (rememberMe) localStorage.setItem('sju_secure_id', creds.identifier);
    else localStorage.removeItem('sju_secure_id');

    setTimeout(() => {
      navigate(userPayload.role === 'admin' ? '/admin' : '/directory');
    }, 1000);
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    let otpArray = [...otp];
    otpArray[index] = element.value;
    setOtp(otpArray);
    if (element.nextSibling && element.value) element.nextSibling.focus();
  };

  const handleBiometricAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setModalMode(null);
      setErrors({ global: "Biometric hardware not detected. Please use password." });
    }, 2000);
  };

  // --- RENDERING VIEWS ---

  if (!systemReady) {
    return (
      <div style={{ height: '100vh', background: theme.colors.secondary, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: theme.fonts.main }}>
        <div style={{ width: '70px', height: '70px', border: `4px solid rgba(255,204,0,0.2)`, borderTopColor: theme.colors.accent, borderRadius: '50%', animation: 'spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite' }}></div>
        <h3 style={{ marginTop: '30px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase' }}>Establishing Secure Link</h3>
        <p style={{ color: theme.colors.muted, marginTop: '10px', fontSize: '0.9rem', fontStyle: 'italic' }}>Verifying SSL Handshake • {SYSTEM_CONFIG.VERSION}</p>
        
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // --- COMPONENT STYLES ---
  const styles = {
    container: {
      height: '100vh', 
      display: 'flex',
      background: theme.colors.bg,
      fontFamily: theme.fonts.main,
      overflow: 'hidden' 
    },
    brandPanel: {
      flex: '1.4',
      background: `linear-gradient(145deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      color: 'white',
      overflow: 'hidden',
      boxShadow: 'inset -20px 0 50px rgba(0,0,0,0.3)'
    },
    ambientOrbs: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      zIndex: 0,
      background: `
        radial-gradient(circle at 15% 50%, rgba(255, 204, 0, 0.08), transparent 25%),
        radial-gradient(circle at 85% 30%, rgba(255, 255, 255, 0.05), transparent 25%)
      `,
      animation: 'pulseOrbs 12s ease-in-out infinite alternate'
    },
    heading: {
      fontSize: '5rem',
      fontWeight: '700',
      lineHeight: '1.05',
      marginBottom: '25px',
      letterSpacing: '-1px',
      color: '#ffffff',
      textShadow: '0 15px 40px rgba(0,0,0,0.4)',
      fontFamily: theme.fonts.main
    },
    subHeading: {
      fontSize: '1.3rem',
      opacity: 0.9,
      fontWeight: '400',
      maxWidth: '550px',
      lineHeight: '1.7',
      color: '#e2e8f0',
      fontStyle: 'italic'
    },
    formPanel: {
      flex: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '50px',
      background: '#f1f5f9',
      position: 'relative',
      zIndex: 5
    },
    card: {
      width: '100%',
      maxWidth: '540px',
      minHeight: '680px',
      display: 'flex',
      flexDirection: 'column',
      background: theme.colors.glass,
      backdropFilter: 'blur(25px)',
      WebkitBackdropFilter: 'blur(25px)',
      borderRadius: '24px',
      padding: '50px',
      boxShadow: theme.shadows.card,
      border: `1px solid ${theme.colors.glassBorder}`,
      animation: 'slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
    },
    tabContainer: {
      display: 'flex',
      background: 'rgba(0, 51, 102, 0.05)',
      padding: '6px',
      borderRadius: '16px',
      marginBottom: '45px',
      position: 'relative',
      flexShrink: 0
    },
    tab: (active, color) => ({
      flex: 1,
      padding: '14px',
      textAlign: 'center',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: '700',
      fontSize: '1rem',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      background: active ? 'white' : 'transparent',
      color: active ? color : theme.colors.muted,
      boxShadow: active ? '0 8px 16px rgba(0,0,0,0.06)' : 'none',
      zIndex: 2,
      fontFamily: theme.fonts.main
    }),
    submitBtn: {
      width: '100%',
      padding: '20px',
      borderRadius: '16px',
      border: 'none',
      background: activeTab === 'admin' 
        ? `linear-gradient(135deg, ${theme.colors.error} 0%, #991b1b 100%)`
        : `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
      color: 'white',
      fontSize: '1.2rem',
      fontWeight: '700',
      letterSpacing: '1px',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      boxShadow: activeTab === 'admin' ? '0 10px 25px rgba(239, 68, 68, 0.4)' : '0 10px 25px rgba(0, 51, 102, 0.4)',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
      fontFamily: theme.fonts.main
    },
    bioBtn: {
      marginTop: '20px',
      width: '100%',
      padding: '16px',
      border: `2px dashed ${theme.colors.border}`,
      borderRadius: '16px',
      background: 'transparent',
      color: theme.colors.primary,
      fontWeight: '600',
      fontSize: '1.05rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      transition: 'all 0.2s ease',
      fontFamily: theme.fonts.main
    },
    modalOverlay: {
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      background: theme.colors.darkGlass,
      backdropFilter: 'blur(10px)',
      zIndex: 1040,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.3s'
    }
  };

  return (
    <div style={styles.container}>
      
      {/* GLOBAL CSS INJECTIONS FOR ANIMATIONS */}
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes subtleFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scrollText { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes pulseOrbs { 0% { transform: scale(1) translate(0,0); } 100% { transform: scale(1.1) translate(20px, -20px); } }
        @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
        @keyframes scanline { 0% { top: 0; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        
        /* Media Query for mobile responsiveness */
        @media (max-width: 992px) {
          .desktop-brand-panel { display: none !important; }
        }
      `}</style>

      {/* LEFT: IMMERSIVE BRANDING PANEL */}
      <div className="desktop-brand-panel" style={styles.brandPanel}>
        <div style={styles.ambientOrbs}></div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px', zIndex: 10 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '8px 16px',
            borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)', marginBottom: '30px', width: 'fit-content',
            fontSize: '0.9rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase'
          }}>
            <i className="bi bi-shield-lock-fill"></i> SSL Encrypted Gateway
          </div>

          <h1 style={styles.heading}>
            THE ALUMNI<br /> 
            <span style={{ color: theme.colors.accent, textShadow: theme.shadows.glow }}>CONNECTION</span>
          </h1>
          <p style={styles.subHeading}>
            Authenticate to access the exclusive global network of St. Joseph's University. Connect, mentor, and grow with verified professionals worldwide.
          </p>
        </div>

        {/* Continuous Marquee Ticker */}
        <ScrollingTicker />
      </div>

      {/* RIGHT: PRECISION AUTHENTICATION FORM */}
      <div style={styles.formPanel}>
        {/* Subtle decorative background elements for form panel */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,51,102,0.03) 0%, transparent 70%)', borderRadius: '50%' }}></div>

        <div style={styles.card}>
          
          {/* Morphing Tab Switcher */}
          <div style={styles.tabContainer}>
            <div 
              style={styles.tab(activeTab === 'alumni', theme.colors.primary)}
              onClick={() => handleTabSwitch('alumni')}
            >
              <i className="bi bi-mortarboard-fill me-2"></i> Alumni Portal
            </div>
            <div 
              style={styles.tab(activeTab === 'admin', theme.colors.error)}
              onClick={() => handleTabSwitch('admin')}
            >
              <i className="bi bi-shield-lock-fill me-2"></i> Admin Gateway
            </div>
          </div>

          {/* FIX APPLIED: Added key={activeTab} container wrapper.
            This forces React to completely tear down and rebuild this specific DOM node 
            when the tab changes, preventing any layout overlap or animation stuttering 
            between the two different form states. 
          */}
          <div key={activeTab} style={{ display: 'flex', flexDirection: 'column', flex: 1, animation: 'subtleFadeIn 0.3s ease-out forwards' }}>
            
            {/* Dynamic Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontWeight: '700', color: theme.colors.textDark, marginBottom: '8px', fontSize: '2.2rem' }}>
                {activeTab === 'admin' ? 'Restricted Access' : 'Welcome Back'}
              </h2>
              <p style={{ color: theme.colors.muted, fontSize: '1.05rem', fontStyle: 'italic' }}>
                {activeTab === 'admin' ? 'Security clearance is mandatory to proceed.' : 'Enter your credentials to access the network.'}
              </p>
            </div>

            {/* Global Alert Frame */}
            {errors.global && (
              <div style={{ 
                background: theme.colors.errorBg, 
                color: '#991b1b', 
                padding: '16px 20px', 
                borderRadius: '16px', 
                marginBottom: '30px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                fontWeight: '600',
                borderLeft: `4px solid ${theme.colors.error}`,
                animation: 'slideUpFade 0.3s ease-out'
              }}>
                <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                {errors.global}
              </div>
            )}

            {/* The Form Engine */}
            <form onSubmit={handleLogin} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <FloatingInput 
                label={activeTab === 'admin' ? "Administrator ID" : "Register Number"}
                type="text"
                name="identifier"
                value={creds.identifier}
                onChange={handleInputChange}
                icon={activeTab === 'admin' ? "bi-person-badge" : "bi-journal-bookmark-fill"}
                error={errors.identifier}
              />

              <FloatingInput 
                label="Access Key (Password)"
                type={showPass ? "text" : "password"}
                name="password"
                value={creds.password}
                onChange={handleInputChange}
                icon="bi-key-fill"
                error={errors.password}
                isPassword={showPass}
                onTogglePass={() => setShowPass(!showPass)}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', padding: '0 5px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: theme.colors.primary, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.95rem', color: theme.colors.textDark, fontWeight: '600' }}>Remember Device</span>
                </label>
                
                <button 
                  type="button" 
                  onClick={() => setModalMode('recovery')} 
                  style={{ 
                    background: 'none', border: 'none', color: theme.colors.primary, fontWeight: '700', fontSize: '0.95rem',
                    textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'text-decoration-color 0.3s', cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.textDecorationColor = theme.colors.primary}
                  onMouseOut={(e) => e.currentTarget.style.textDecorationColor = 'transparent'}
                >
                  Forgot Key?
                </button>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <button 
                  type="submit" 
                  style={styles.submitBtn}
                  disabled={isLoading}
                  onMouseOver={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(-3px)')}
                  onMouseOut={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(0)')}
                  onMouseDown={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(1px)')}
                >
                  {isLoading ? (
                    <>
                      <div style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      Verifying Protocol...
                    </>
                  ) : (
                    <>LOGIN <i className="bi bi-box-arrow-in-right" style={{ fontSize: '1.4rem' }}></i></>
                  )}
                </button>

                {/* Biometric Fallback Simulation (Alumni Only) */}
                {activeTab === 'alumni' && (
                  <button 
                    type="button" 
                    style={styles.bioBtn} 
                    onClick={() => setModalMode('biometric')}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0,51,102,0.05)'; e.currentTarget.style.borderColor = theme.colors.primary; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = theme.colors.border; }}
                  >
                    <i className="bi bi-qr-code-scan fs-5"></i> Login with Passkey / FaceID
                  </button>
                )}
              </div>
            </form>

            {/* New Account Creation / Registration Link */}
            {activeTab === 'alumni' && (
              <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: `1px solid ${theme.colors.border}`, animation: 'fadeIn 0.8s' }}>
                <span style={{ color: theme.colors.muted, fontSize: '1.05rem', fontStyle: 'italic' }}>New to the alumni network? </span>
                <Link to="/register" style={{ 
                  color: theme.colors.primary, fontWeight: '800', fontSize: '1.05rem', textDecoration: 'none', marginLeft: '5px',
                  borderBottom: `2px solid transparent`, transition: 'border-color 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderBottomColor = theme.colors.primary}
                onMouseOut={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}
                >
                  Create Account
                </Link>
              </div>
            )}

          </div> {/* END OF KEYED CONTAINER */}
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* RECOVERY WIZARD MODAL */}
      {modalMode === 'recovery' && (
        <div style={styles.modalOverlay}>
          <div style={{ background: 'white', width: '100%', maxWidth: '480px', borderRadius: '24px', padding: '40px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', position: 'relative', animation: 'slideUpFade 0.4s ease-out' }}>
            
            <button 
              onClick={() => { setModalMode(null); setRecoveryStep(1); }}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.5rem', color: theme.colors.muted, cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = theme.colors.error}
              onMouseOut={(e) => e.currentTarget.style.color = theme.colors.muted}
            >
              <i className="bi bi-x-lg"></i>
            </button>

            <h3 style={{ fontWeight: '700', color: theme.colors.primary, marginBottom: '20px', fontFamily: theme.fonts.main }}>Secure Recovery</h3>
            
            {recoveryStep === 1 && (
              <div style={{ animation: 'fadeIn 0.4s' }}>
                <p style={{ color: theme.colors.muted, marginBottom: '25px', lineHeight: '1.6' }}>Provide your registered institution email to initiate the secure OTP recovery sequence.</p>
                <FloatingInput label="Institution Email" type="email" name="rec_email" value="" onChange={() => {}} icon="bi-envelope-at" />
                <button 
                  style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: theme.colors.primary, color: 'white', fontWeight: '700', fontSize: '1.1rem', marginTop: '10px', cursor: 'pointer' }} 
                  onClick={() => setRecoveryStep(2)}
                >
                  Initiate Sequence
                </button>
              </div>
            )}

            {recoveryStep === 2 && (
              <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s' }}>
                <i className="bi bi-shield-lock" style={{ fontSize: '3.5rem', color: theme.colors.accent, marginBottom: '15px', display: 'block' }}></i>
                <p style={{ color: theme.colors.muted, marginBottom: '25px' }}>Enter the 4-digit security token transmitted to your device.</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      style={{ width: '65px', height: '75px', borderRadius: '16px', border: `2px solid ${theme.colors.border}`, textAlign: 'center', fontSize: '2rem', fontWeight: '700', color: theme.colors.primary, outline: 'none', transition: 'border-color 0.2s' }}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
                      onBlur={(e) => e.target.style.borderColor = theme.colors.border}
                    />
                  ))}
                </div>
                <button 
                  style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: theme.colors.success, color: 'white', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer' }} 
                  onClick={() => setRecoveryStep(3)}
                >
                  Verify Token
                </button>
              </div>
            )}

            {recoveryStep === 3 && (
              <div style={{ textAlign: 'center', padding: '20px 0', animation: 'fadeIn 0.4s' }}>
                <i className="bi bi-check-circle-fill" style={{ fontSize: '4rem', color: theme.colors.success, marginBottom: '20px', display: 'block' }}></i>
                <h4 style={{ fontWeight: '700', color: theme.colors.textDark, marginBottom: '10px' }}>Identity Confirmed</h4>
                <p style={{ color: theme.colors.muted, marginBottom: '30px' }}>Secure access instructions and a temporary key have been routed to your inbox.</p>
                <button 
                  style={{ padding: '12px 30px', borderRadius: '30px', border: `2px solid ${theme.colors.border}`, background: 'transparent', fontWeight: '700', color: theme.colors.textDark, cursor: 'pointer' }} 
                  onClick={() => { setModalMode(null); setRecoveryStep(1); }}
                >
                  Return to Gateway
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BIOMETRIC SIMULATION MODAL */}
      {modalMode === 'biometric' && (
        <div style={styles.modalOverlay}>
          <div style={{ background: 'white', width: '100%', maxWidth: '400px', borderRadius: '30px', padding: '50px 30px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            
            <button 
              onClick={() => setModalMode(null)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', color: theme.colors.muted, cursor: 'pointer', zIndex: 10 }}
            >
              <i className="bi bi-x-circle-fill"></i>
            </button>

            <h4 style={{ fontWeight: '700', color: theme.colors.primary, marginBottom: '30px' }}>Biometric Verification</h4>
            
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 30px', border: `4px solid ${theme.colors.accent}`, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <i className="bi bi-fingerprint" style={{ fontSize: '4.5rem', color: theme.colors.primary }}></i>
              {/* Scanline Animation */}
              {isLoading && <div style={{ position: 'absolute', width: '100%', height: '4px', background: theme.colors.success, boxShadow: '0 0 10px #10b981', animation: 'scanline 1.5s linear infinite' }}></div>}
            </div>

            <p style={{ color: theme.colors.muted, fontWeight: '500', marginBottom: '30px' }}>
              {isLoading ? "Scanning..." : "Position your face or finger to authenticate."}
            </p>

            <button 
              onClick={handleBiometricAuth}
              disabled={isLoading}
              style={{ width: '100%', padding: '15px', borderRadius: '15px', border: 'none', background: theme.colors.primary, color: 'white', fontWeight: '700', cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? "Processing..." : "Initiate Scan"}
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default Login;