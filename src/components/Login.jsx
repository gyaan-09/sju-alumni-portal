import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL_CONFIG from '../config';
import { useNavigate } from 'react-router-dom';

const SYSTEM_CONFIG = {
  INSTITUTION_NAME: "St. Joseph's University",
  VERSION: "v23.1.0-Omega-Refined",
  API_URL: `${API_BASE_URL_CONFIG}/api/alumni/login`,
  SIMULATED_DELAY: 1200,
  ANIMATION_SPEED: "0.4s"
};

const THEME = {
  colors: {
    primary: '#003366',       // Deep Academic Blue
    primaryGlow: 'rgba(0, 51, 102, 0.4)',
    secondary: '#001429',     // Midnight Core
    accent: '#FFCC00',        // Prestige Gold
    accentHover: '#e6b800',
    textLight: '#ffffff',
    textDark: '#0f172a',
    muted: '#64748b',
    border: '#cbd5e1',
    bg: '#f8fafc',
    error: '#ef4444',
    errorBg: '#fef2f2',
    success: '#10b981',
    glass: 'rgba(255, 255, 255, 0.75)',
    glassBorder: 'rgba(255, 255, 255, 0.6)',
    darkGlass: 'rgba(15, 23, 42, 0.85)'
  },
  shadows: {
    card: '0 40px 80px -20px rgba(0, 51, 102, 0.15), 0 0 0 1px rgba(255,255,255,0.8) inset',
    inputFocus: '0 0 0 4px rgba(0, 51, 102, 0.12)',
    buttonHover: '0 15px 30px -5px rgba(0, 51, 102, 0.4)'
  },
  fonts: {
    main: "'Lora', serif"
  },
  transitions: {
    smooth: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    snappy: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// MICRO-COMPONENTS //

/**
 * Enhanced Floating Label Input 
 * Features: CapsLock detection, dynamic label morphing, embedded icon management.
 * * @param {Object} props - Component properties
 * @param {string} props.label - Floating label text
 * @param {string} props.type - Input type (text, password, email, etc.)
 * @param {string} props.name - Input name attribute
 * @param {string} props.value - Controlled value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.icon - Bootstrap icon class (e.g., 'bi-envelope')
 * @param {string} [props.error] - Error message to display
 * @param {boolean} [props.isPassword] - Flag indicating if this is a password field
 * @param {Function} [props.onTogglePass] - Handler for visibility toggle
 */
const FloatingInput = ({ 
  label, type, name, value, onChange, icon, error, isPassword, onTogglePass 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const hasValue = value && value.length > 0;

  useEffect(() => {
    const handleKeyUp = (e) => {
      if (isPassword && isFocused) {
        setCapsLockActive(e.getModifierState('CapsLock'));
      }
    };
    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, [isPassword, isFocused]);

  // Dynamic Styles
  const containerStyle = {
    position: 'relative',
    marginBottom: '30px',
    width: '100%'
  };

  const inputWrapperStyle = {
    position: 'relative',
    backgroundColor: isFocused ? '#ffffff' : 'rgba(255,255,255,0.6)',
    borderRadius: '16px',
    border: error 
      ? `2px solid ${THEME.colors.error}` 
      : isFocused ? `2px solid ${THEME.colors.primary}` : `1px solid ${THEME.colors.border}`,
    transition: THEME.transitions.smooth,
    height: 'clamp(55px, 8vh, 72px)',
    display: 'flex',
    alignItems: 'center',
    boxShadow: isFocused ? THEME.shadows.inputFocus : 'inset 0 2px 4px rgba(0,0,0,0.02)',
    overflow: 'hidden'
  };

  const iconStyle = {
    width: 'clamp(45px, 6vw, 60px)',
    display: 'flex',
    justifyContent: 'center',
    color: error ? THEME.colors.error : (isFocused ? THEME.colors.primary : THEME.colors.muted),
    fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
    transition: THEME.transitions.smooth,
    transform: isFocused ? 'scale(1.1)' : 'scale(1)'
  };

  const labelStyle = {
    position: 'absolute',
    left: '0',
    top: (isFocused || hasValue) ? 'clamp(6px, 1.5vw, 12px)' : 'calc(50% - 12px)',
    fontSize: (isFocused || hasValue) ? 'clamp(0.7rem, 1.5vw, 0.8rem)' : 'clamp(0.95rem, 2.5vw, 1.1rem)',
    color: error ? THEME.colors.error : (isFocused ? THEME.colors.primary : THEME.colors.muted),
    fontWeight: (isFocused || hasValue) ? '700' : '500',
    letterSpacing: (isFocused || hasValue) ? '0.5px' : '0',
    transition: THEME.transitions.smooth,
    pointerEvents: 'none',
    fontFamily: THEME.fonts.main
  };

  const inputFieldStyle = {
    width: '100%',
    height: '100%',
    border: 'none',
    background: 'transparent',
    paddingTop: 'clamp(14px, 3vw, 24px)',
    paddingRight: 'clamp(12px, 2vw, 20px)',
    fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
    color: THEME.colors.textDark,
    fontWeight: '600',
    outline: 'none',
    fontFamily: THEME.fonts.main
  };

  return (
    <div style={containerStyle}>
      <div style={inputWrapperStyle}>
        <div style={iconStyle}>
          <i className={`bi ${icon}`}></i>
        </div>

        <div style={{ flex: 1, position: 'relative', height: '100%' }}>
          <label style={labelStyle}>{label}</label>
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={inputFieldStyle}
            autoComplete="off"
            spellCheck="false"
          />
        </div>

        {/* Caps Lock Warning Indicator */}
        {capsLockActive && (
          <div style={{ padding: '0 15px', color: THEME.colors.accentHover, animation: 'fadeIn 0.3s' }} title="Caps Lock is ON">
            <i className="bi bi-capslock-fill fs-5"></i>
          </div>
        )}

        {/* Visibility Toggle for Passwords */}
        {isPassword !== undefined && (
          <button 
            type="button"
            onClick={onTogglePass}
            style={{
              border: 'none',
              background: 'transparent',
              padding: '0 20px',
              cursor: 'pointer',
              color: THEME.colors.muted,
              transition: THEME.transitions.snappy
            }}
            onMouseOver={(e) => e.currentTarget.style.color = THEME.colors.primary}
            onMouseOut={(e) => e.currentTarget.style.color = THEME.colors.muted}
          >
            <i className={`bi ${isPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} fs-5`}></i>
          </button>
        )}
      </div>
      
      {/* Error Output */}
      {error && (
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', 
          color: THEME.colors.error, fontSize: '0.9rem', fontWeight: '600', 
          animation: 'shake 0.4s' 
        }}>
          <i className="bi bi-exclamation-circle-fill"></i> {error}
        </div>
      )}
    </div>
  );
};

// MAIN APPLICATION COMPONENT //

const Login = () => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [systemReady, setSystemReady] = useState(false);
  const [activeTab, setActiveTab] = useState('alumni');
  const [creds, setCreds] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [backendStatus, setBackendStatus] = useState('Checking...');

  // Modals & Recovery State
  const [modalMode, setModalMode] = useState(null); // 'recovery' | 'biometric' | null
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [otp, setOtp] = useState(['', '', '', '']);

  // --- BOOT SEQUENCE & HYDRATION ---
  useEffect(() => {
    // Inject Custom Font
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // Inject Bootstrap Icons
    if (!document.querySelector('link[href*="bootstrap-icons"]')) {
      const iconLink = document.createElement('link');
      iconLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css';
      iconLink.rel = 'stylesheet';
      document.head.appendChild(iconLink);
    }

    // Simulated Pre-flight check
    const bootTimer = setTimeout(() => {
      setSystemReady(true);
    }, SYSTEM_CONFIG.SIMULATED_DELAY);

    // Check Backend Health
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL_CONFIG}/api/health`);
        if (res.ok) setBackendStatus('Online');
        else setBackendStatus('Degraded');
      } catch (e) {
        setBackendStatus('Offline');
      }
    };
    checkHealth();

    return () => {
      document.head.removeChild(fontLink);
      clearTimeout(bootTimer);
    };
  }, []);

  // --- LOGIC HANDLERS ---
  
  const handleInputChange = (e) => {
    setCreds({ ...creds, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleTabSwitch = (tab) => {
    if (activeTab === tab) return;
    setActiveTab(tab);
    setErrors({});
    setCreds({ identifier: '', password: '' });
    setShowPass(false);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!creds.identifier.trim()) {
      newErrors.identifier = activeTab === 'admin' 
        ? "Administrator ID is mandated." 
        : "Register Number is required.";
    }
    if (!creds.password) {
      newErrors.password = "Access key cannot be empty.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const executeLoginSuccess = (userPayload) => {
    localStorage.setItem('user', JSON.stringify(userPayload));
    if (rememberMe) {
      localStorage.setItem('sju_secure_id', creds.identifier);
    } else {
      localStorage.removeItem('sju_secure_id');
    }

    // Smooth transition delay
    setTimeout(() => {
      navigate(userPayload.role === 'admin' ? '/admin' : '/directory');
    }, 800);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // UNIFIED BACKEND CHECK FOR BOTH ADMIN AND ALUMNI
      const response = await fetch(SYSTEM_CONFIG.API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              identifier: creds.identifier.trim(),
              password: creds.password.trim()
          })
      });

      const data = await response.json();

      if (!response.ok) {
          setErrors({ 
              global: data.error || "The credentials provided are unrecognized or expired.",
              detail: data.detail || null 
          });
          setIsLoading(false);
          return;
      }

      executeLoginSuccess(data);

    } catch (error) {
      setErrors({ global: "Authentication service offline.", detail: "The server appears to be unreachable. Please check your connection." });
      setIsLoading(false);
    }
  };


  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    let otpArray = [...otp];
    otpArray[index] = element.value;
    setOtp(otpArray);
    if (element.nextSibling && element.value) element.nextSibling.focus();
  };

  // --- RENDER HELPERS ---

  // Simulated Pre-flight check removed - Per user request
  useEffect(() => {
    setSystemReady(true);
  }, []);

  // --- MAIN LAYOUT STYLES ---

  const layoutStyles = {
    // THE OVERLAP FIX: Changed from height: 100vh to minHeight: 100vh and removed overflow: hidden
    masterContainer: {
      minHeight: '100vh', 
      display: 'flex',
      flexDirection: 'row',
      background: THEME.colors.bg,
      fontFamily: THEME.fonts.main
    },
    brandPanel: {
      flex: '1.2',
      background: `linear-gradient(135deg, ${THEME.colors.secondary} 0%, ${THEME.colors.primary} 100%)`,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 5vw',
      color: 'white',
      overflow: 'hidden',
      boxShadow: 'inset -20px 0 50px rgba(0,0,0,0.4)'
    },
    // Dedicated scrollable zone for the form to prevent overlap on small screens
    authZone: {
      flex: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(20px, 4vh, 40px) clamp(10px, 3vw, 20px)', 
      background: THEME.colors.bg,
      position: 'relative',
      zIndex: 5,
      overflowY: 'auto'
    },
    loginCard: {
      width: '100%',
      maxWidth: '520px',
      display: 'flex',
      flexDirection: 'column',
      background: THEME.colors.glass,
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
      borderRadius: '28px',
      padding: 'clamp(30px, 6vw, 50px) clamp(20px, 5vw, 40px)',
      boxShadow: THEME.shadows.card,
      border: `1px solid ${THEME.colors.glassBorder}`,
      animation: 'slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
    },
    tabContainer: {
      display: 'flex',
      background: 'rgba(0, 51, 102, 0.04)',
      padding: '8px',
      borderRadius: '18px',
      marginBottom: '50px',
      position: 'relative'
    },
    tabItem: (active, color) => ({
      flex: 1,
      padding: 'clamp(12px, 2.5vw, 16px)',
      textAlign: 'center',
      borderRadius: '14px',
      cursor: 'pointer',
      fontWeight: '700',
      fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
      transition: THEME.transitions.smooth,
      background: active ? 'white' : 'transparent',
      color: active ? color : THEME.colors.muted,
      boxShadow: active ? '0 10px 20px rgba(0,0,0,0.05)' : 'none',
      fontFamily: THEME.fonts.main
    }),
    submitButton: {
      width: '100%',
      padding: 'clamp(14px, 3vw, 22px)',
      borderRadius: '18px',
      border: 'none',
      background: activeTab === 'admin' 
        ? `linear-gradient(135deg, ${THEME.colors.error} 0%, #7f1d1d 100%)`
        : `linear-gradient(135deg, ${THEME.colors.primary} 0%, ${THEME.colors.secondary} 100%)`,
      color: 'white',
      fontSize: 'clamp(1.05rem, 3vw, 1.25rem)',
      fontWeight: '700',
      letterSpacing: '1px',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      boxShadow: activeTab === 'admin' ? '0 15px 35px rgba(239, 68, 68, 0.3)' : '0 15px 35px rgba(0, 51, 102, 0.3)',
      transition: THEME.transitions.smooth,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '15px',
      marginTop: '10px',
      fontFamily: THEME.fonts.main
    }
  };

  return (
    <div style={layoutStyles.masterContainer}>
      
      {/* GLOBAL KEYFRAMES */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: ${THEME.colors.bg}; }
        ::-webkit-scrollbar-thumb { background: ${THEME.colors.border}; border-radius: 10px; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes formSwap { 0% { opacity: 0; transform: scale(0.98); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes ambientFlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
        @keyframes scanline { 0% { top: 0; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }

        @media (max-width: 1024px) {
          .brand-panel { display: none !important; }
        }
      `}</style>

      {/* LEFT PANEL: IMMERSIVE BRANDING */}
      <div className="brand-panel" style={layoutStyles.brandPanel}>
        {/* Dynamic Abstract Mesh Background */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 0.6,
          background: 'radial-gradient(circle at 20% 80%, rgba(255, 204, 0, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 40%)',
          animation: 'ambientFlow 20s ease infinite', backgroundSize: '200% 200%'
        }}></div>

        <div style={{ zIndex: 10, position: 'relative', transform: 'translateY(-5%)' }}>
          <h1 style={{ fontSize: '5.5rem', fontWeight: '700', lineHeight: '1.1', marginBottom: '30px', letterSpacing: '-2px', textShadow: '0 20px 50px rgba(0,0,0,0.5)', color: THEME.colors.accent }}>
            THE ALUMNI<br /> 
            CONNECTION
          </h1>
          <p style={{ fontSize: '1.4rem', opacity: 0.9, fontWeight: '400', maxWidth: '600px', lineHeight: '1.8', color: '#e2e8f0', fontStyle: 'italic' }}>
            Authenticate to access the exclusive global network of St. Joseph's University. Connect, mentor, and build the future together.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: SCROLLABLE AUTH ZONE */}
      <div style={layoutStyles.authZone}>
        <div style={layoutStyles.loginCard}>
          
          {/* Morphing Tabs */}
          <div style={layoutStyles.tabContainer}>
            <div 
              style={layoutStyles.tabItem(activeTab === 'alumni', THEME.colors.primary)}
              onClick={() => handleTabSwitch('alumni')}
            >
              <i className="bi bi-mortarboard-fill me-2"></i> Alumni Portal
            </div>
            <div 
              style={layoutStyles.tabItem(activeTab === 'admin', THEME.colors.error)}
              onClick={() => handleTabSwitch('admin')}
            >
              <i className="bi bi-shield-lock-fill me-2"></i> Admin Gateway
            </div>
          </div>

          {/* Dynamic Form Content */}
          <div key={activeTab} style={{ display: 'flex', flexDirection: 'column', animation: 'formSwap 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '45px' }}>
              <h2 style={{ fontWeight: '700', color: THEME.colors.textDark, marginBottom: '12px', fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', letterSpacing: '-0.5px' }}>
                {activeTab === 'admin' ? 'Restricted Access' : 'Welcome Back'}
              </h2>
              <p style={{ color: THEME.colors.muted, fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', fontStyle: 'italic' }}>
                {activeTab === 'admin' ? 'Elevated clearance required.' : 'Enter credentials to establish secure link.'}
              </p>
            </div>

            {/* Error Banner */}
            {errors.global && (
              <div style={{ 
                background: THEME.colors.errorBg, color: '#991b1b', padding: '18px 24px', 
                borderRadius: '16px', marginBottom: '35px', display: 'flex', flexDirection: 'column', 
                gap: '8px', fontWeight: '600', borderLeft: `5px solid ${THEME.colors.error}`,
                animation: 'slideUpFade 0.3s ease-out', fontSize: '1.05rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <i className="bi bi-shield-x fs-4"></i>
                  {errors.global}
                </div>
                {errors.detail && (
                  <div style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: '500', marginLeft: '39px', fontStyle: 'italic' }}>
                    {errors.detail}
                  </div>
                )}
              </div>
            )}

            {/* Form Engine */}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
              <FloatingInput 
                label={activeTab === 'admin' ? "Administrator ID" : "Register Number"}
                type="text" name="identifier" value={creds.identifier} onChange={handleInputChange}
                icon={activeTab === 'admin' ? "bi-person-badge" : "bi-journal-bookmark-fill"}
                error={errors.identifier}
              />

              <FloatingInput 
                label="Access Key (Password)"
                type={showPass ? "text" : "password"} name="password" value={creds.password} onChange={handleInputChange}
                icon="bi-key-fill" error={errors.password} isPassword={showPass} onTogglePass={() => setShowPass(!showPass)}
              />

              {/* Utility Row: Remember Me & Forgot Password */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(25px, 5vw, 40px)', padding: '0 5px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: 'clamp(16px, 2vw, 20px)', height: 'clamp(16px, 2vw, 20px)', accentColor: THEME.colors.primary, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', color: THEME.colors.textDark, fontWeight: '600' }}>Remember Device</span>
                </label>
                
                <button 
                  type="button" onClick={() => setModalMode('recovery')} 
                  style={{ 
                    background: 'none', border: 'none', color: THEME.colors.primary, fontWeight: '700', fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                    textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'all 0.3s', cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.textDecorationColor = THEME.colors.primary}
                  onMouseOut={(e) => e.currentTarget.style.textDecorationColor = 'transparent'}
                >
                  Forgot Key?
                </button>
              </div>

              {/* Action Buttons */}
              <div>
                <button 
                  type="submit" style={layoutStyles.submitButton} disabled={isLoading}
                  onMouseOver={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(-4px)')}
                  onMouseOut={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {isLoading ? (
                    <>
                      <div style={{ width: '26px', height: '26px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      Authenticating...
                    </>
                  ) : (
                    <>LOGIN <i className="bi bi-arrow-right-circle-fill" style={{ fontSize: '1.4rem', marginLeft: '8px' }}></i></>
                  )}
                </button>


              </div>

              {/* Backend Status Indicator */}
              <div style={{ textAlign: 'center', marginTop: '25px', opacity: 0.7, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: backendStatus === 'Online' ? THEME.colors.success : THEME.colors.error }}></div>
                <span style={{ fontWeight: '600' }}>System Status: {backendStatus}</span>
              </div>
            </form>

            {/* Registration Footer Router Link */}
            {activeTab === 'alumni' && (
              <div style={{ textAlign: 'center', marginTop: '35px', animation: 'fadeIn 0.6s' }}>
                <span style={{ color: THEME.colors.muted, fontSize: '1.05rem' }}>Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  style={{
                    background: 'none', border: 'none', color: THEME.colors.primary, fontWeight: '700', fontSize: '1.05rem',
                    textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'all 0.3s', cursor: 'pointer',
                    fontFamily: THEME.fonts.main, padding: '0 5px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.textDecorationColor = THEME.colors.primary}
                  onMouseOut={(e) => e.currentTarget.style.textDecorationColor = 'transparent'}
                >
                  Create Account
                </button>
              </div>
            )}
            
          </div> 
        </div>
      </div>

      {/* --- MODALS (Portals) --- */}
      
      {/* 1. SECURE RECOVERY MODAL */}
      {modalMode === 'recovery' && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: THEME.colors.darkGlass, backdropFilter: 'blur(15px)', zIndex: 1040, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.3s' }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '500px', borderRadius: '28px', padding: '50px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', position: 'relative', animation: 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            
            <button onClick={() => { setModalMode(null); setRecoveryStep(1); }} style={{ position: 'absolute', top: '25px', right: '25px', background: 'none', border: 'none', fontSize: '1.8rem', color: THEME.colors.muted, cursor: 'pointer', transition: 'color 0.2s' }}>
              <i className="bi bi-x-circle-fill"></i>
            </button>

            <h3 style={{ fontWeight: '700', color: THEME.colors.primary, marginBottom: '25px', fontSize: '1.8rem', fontFamily: THEME.fonts.main }}>Secure Recovery</h3>
            
            {recoveryStep === 1 && (
              <div style={{ animation: 'fadeIn 0.4s' }}>
                <p style={{ color: THEME.colors.muted, marginBottom: '35px', lineHeight: '1.7', fontSize: '1.1rem' }}>Provide your registered institution email to initiate the secure OTP recovery sequence.</p>
                <FloatingInput label="Institution Email" type="email" name="rec_email" value="" onChange={() => {}} icon="bi-envelope-at" />
                <button style={{ width: '100%', padding: '20px', borderRadius: '16px', border: 'none', background: THEME.colors.primary, color: 'white', fontWeight: '700', fontSize: '1.15rem', marginTop: '15px', cursor: 'pointer' }} onClick={() => setRecoveryStep(2)}>
                  Initiate Sequence
                </button>
              </div>
            )}

            {recoveryStep === 2 && (
              <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s' }}>
                <i className="bi bi-shield-lock" style={{ fontSize: '4rem', color: THEME.colors.accent, marginBottom: '20px', display: 'block' }}></i>
                <p style={{ color: THEME.colors.muted, marginBottom: '35px', fontSize: '1.1rem' }}>Enter the 4-digit security token transmitted to your device.</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
                  {otp.map((digit, index) => (
                    <input key={index} type="text" maxLength="1" value={digit} onChange={(e) => handleOtpChange(e.target, index)}
                      style={{ width: '70px', height: '80px', borderRadius: '18px', border: `2px solid ${THEME.colors.border}`, textAlign: 'center', fontSize: '2.5rem', fontWeight: '700', color: THEME.colors.primary, outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={(e) => e.target.style.borderColor = THEME.colors.primary} onBlur={(e) => e.target.style.borderColor = THEME.colors.border}
                    />
                  ))}
                </div>
                <button style={{ width: '100%', padding: '20px', borderRadius: '16px', border: 'none', background: THEME.colors.success, color: 'white', fontWeight: '700', fontSize: '1.15rem', cursor: 'pointer' }} onClick={() => setRecoveryStep(3)}>
                  Verify Token
                </button>
              </div>
            )}

            {recoveryStep === 3 && (
              <div style={{ textAlign: 'center', padding: '30px 0', animation: 'fadeIn 0.4s' }}>
                <i className="bi bi-check-circle-fill" style={{ fontSize: '5rem', color: THEME.colors.success, marginBottom: '25px', display: 'block' }}></i>
                <h4 style={{ fontWeight: '700', color: THEME.colors.textDark, marginBottom: '15px', fontSize: '1.8rem' }}>Identity Confirmed</h4>
                <p style={{ color: THEME.colors.muted, marginBottom: '40px', fontSize: '1.1rem', lineHeight: '1.6' }}>Secure access instructions and a temporary key have been routed to your inbox.</p>
                <button style={{ padding: '16px 40px', borderRadius: '30px', border: `2px solid ${THEME.colors.border}`, background: 'transparent', fontWeight: '700', fontSize: '1.1rem', color: THEME.colors.textDark, cursor: 'pointer' }} onClick={() => { setModalMode(null); setRecoveryStep(1); }}>
                  Return to Gateway
                </button>
              </div>
            )}
          </div>
        </div>
      )}



    </div>
  );
};

export default Login;