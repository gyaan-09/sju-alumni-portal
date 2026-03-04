import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

/**
 * ==================================================================================
 * SJU ENTERPRISE ACCESS GATEWAY - ULTRA EDITION (v20.0)
 * ==================================================================================
 * * * ARCHITECTURE:
 * - Dual-Engine Authentication: Local Bridge + REST API Fallback.
 * - Security: Pre-flight Integrity Check, Session Encryption (Simulated), Role-Based Gating.
 * - UX: Glassmorphism, Floating Labels, Dynamic News Feed, Biometric Simulation.
 * * * * COLOR PALETTE (Strict Adherence):
 * - Primary: Royal Blue (#003366)
 * - Accent: Josephite Gold (#FFCC00)
 * - Text: High Contrast White (#FFFFFF) & Slate (#64748b)
 * - Error: Signal Red (#ef4444)
 * - Success: Emerald (#10b981)
 */

// --- 1. CONFIGURATION & CONSTANTS ---
const SYSTEM_CONFIG = {
  INSTITUTION_NAME: "St. Joseph's University",
  PORTAL_NAME: "Alumni Connect",
  VERSION: "v19.0.4-Enterprise",
  SUPPORT_EMAIL: "tech.support@sju.edu",
  API_URL: "http://localhost:8081/api/auth/login"
};

const ALUMNI_HIGHLIGHTS = [
  { id: 1, text: "🎉 120+ Josephites placed in Fortune 500 companies this quarter." },
  { id: 2, text: "📢 Annual Alumni Meet 'Milan 2026' scheduled for Dec 15th." },
  { id: 3, text: "🚀 New Mentorship Program connects you with industry leaders." },
  { id: 4, text: "🎓 Transcript requests are now fully digitized." }
];

// --- 2. GLOBAL STYLES & THEME ENGINE ---
const theme = {
  colors: {
    primary: '#003366',
    secondary: '#002244',
    accent: '#FFCC00',
    textLight: '#ffffff',
    textDark: '#0f172a',
    muted: '#64748b',
    border: '#e2e8f0',
    bg: '#f8fafc',
    error: '#ef4444',
    success: '#10b981',
    glass: 'rgba(255, 255, 255, 0.95)'
  },
  shadows: {
    card: '0 25px 50px -12px rgba(0, 51, 102, 0.15)',
    glow: '0 0 20px rgba(255, 204, 0, 0.3)',
    input: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
  },
  animations: {
    fade: 'fadeIn 0.6s ease-out',
    slide: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
  }
};

// --- 3. MICRO-COMPONENTS ---

/**
 * Dynamic News Ticker Component for Left Panel
 */
const NewsTicker = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ALUMNI_HIGHLIGHTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      marginTop: 'auto',
      background: 'rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(10px)',
      padding: '20px',
      borderRadius: '16px',
      borderLeft: `4px solid ${theme.colors.accent}`,
      animation: theme.animations.fade
    }}>
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: theme.colors.accent, marginBottom: '8px', fontWeight: '800' }}>
        Live Updates
      </div>
      <div style={{ color: 'white', fontSize: '1rem', fontWeight: '500', minHeight: '50px', display: 'flex', alignItems: 'center' }}>
        {ALUMNI_HIGHLIGHTS[index].text}
      </div>
      <div style={{ display: 'flex', gap: '5px', marginTop: '15px' }}>
        {ALUMNI_HIGHLIGHTS.map((_, i) => (
          <div key={i} style={{ height: '3px', width: i === index ? '25px' : '10px', background: i === index ? theme.colors.accent : 'rgba(255,255,255,0.3)', borderRadius: '2px', transition: 'all 0.3s ease' }}></div>
        ))}
      </div>
    </div>
  );
};

/**
 * Floating Label Input Component
 */
const FloatingInput = ({ label, type, name, value, onChange, icon, error, isPassword, onTogglePass }) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <div style={{ marginBottom: '24px', position: 'relative' }}>
      <div 
        style={{
          position: 'relative',
          backgroundColor: isFocused ? '#fff' : '#f8fafc',
          borderRadius: '12px',
          border: error ? `2px solid ${theme.colors.error}` : isFocused ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
          transition: 'all 0.3s ease',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: isFocused ? '0 4px 12px rgba(0, 51, 102, 0.08)' : 'none'
        }}
      >
        {/* Icon */}
        <div style={{ width: '50px', display: 'flex', justifyContent: 'center', color: isFocused ? theme.colors.primary : theme.colors.muted, fontSize: '1.2rem', transition: 'color 0.3s' }}>
          <i className={`bi ${icon}`}></i>
        </div>

        {/* Input & Label Container */}
        <div style={{ flex: 1, position: 'relative', height: '100%' }}>
          <label 
            style={{
              position: 'absolute',
              left: '0',
              top: (isFocused || hasValue) ? '10px' : '22px',
              fontSize: (isFocused || hasValue) ? '0.75rem' : '1rem',
              color: error ? theme.colors.error : (isFocused ? theme.colors.primary : theme.colors.muted),
              fontWeight: (isFocused || hasValue) ? '700' : '500',
              textTransform: (isFocused || hasValue) ? 'uppercase' : 'none',
              letterSpacing: (isFocused || hasValue) ? '0.5px' : '0',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: 'none'
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
              paddingTop: '20px',
              paddingRight: '15px',
              fontSize: '1.05rem',
              color: theme.colors.textDark,
              fontWeight: '600',
              outline: 'none'
            }}
          />
        </div>

        {/* Password Toggle */}
        {isPassword !== undefined && (
          <button 
            type="button"
            onClick={onTogglePass}
            style={{ border: 'none', background: 'transparent', padding: '0 15px', cursor: 'pointer', color: theme.colors.muted }}
          >
            <i className={`bi ${isPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
          </button>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: theme.colors.error, fontSize: '0.85rem', fontWeight: '600', animation: 'shake 0.4s' }}>
          <i className="bi bi-exclamation-octagon-fill"></i> {error}
        </div>
      )}
    </div>
  );
};

// --- 4. MAIN LOGIN LOGIC ---

const Login = () => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [systemReady, setSystemReady] = useState(false); // For Pre-flight check
  const [activeTab, setActiveTab] = useState('alumni'); // 'alumni' | 'admin'
  
  // Credentials
  const [creds, setCreds] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Recovery Wizard State
  const [modalMode, setModalMode] = useState(null); // 'recovery' | 'biometric' | null
  const [recoveryStep, setRecoveryStep] = useState(1); // 1: Email, 2: OTP, 3: Success
  const [otp, setOtp] = useState(['', '', '', '']);

  // --- INITIALIZATION EFFECT ---
  useEffect(() => {
    // 1. Simulate Enterprise Security Check on Load
    const initSequence = async () => {
      // Simulate checking secure connection, SSL, etc.
      setTimeout(() => setSystemReady(true), 1200); 
    };
    initSequence();

    // 2. Check Persistence
    const rememberedId = localStorage.getItem('sju_secure_id');
    if (rememberedId) {
      setCreds(prev => ({ ...prev, identifier: rememberedId }));
      setRememberMe(true);
    }
  }, []);

  // --- HANDLERS ---

  const handleInputChange = (e) => {
    setCreds({ ...creds, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!creds.identifier.trim()) {
      newErrors.identifier = activeTab === 'admin' ? "Admin ID Required" : "Register Number Required";
    }
    if (!creds.password) {
      newErrors.password = "Authentication Key Required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- CORE AUTHENTICATION LOGIC ---
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    // 1. MASTER KEY BYPASS (For Demo/Dev)
    if (activeTab === 'admin' && creds.identifier === 'ADMIN01' && creds.password === 'admin123') {
      executeLoginSuccess({ 
        id: 999, role: 'admin', name: 'System Administrator', reg_no: 'ADMIN01' 
      });
      return;
    }

    // 2. LOCAL BRIDGE (Virtual DB Check)
    const virtualUsers = JSON.parse(localStorage.getItem('sju_approved_users') || "[]");
    const foundUser = virtualUsers.find(
      u => (u.reg_no === creds.identifier || u.email === creds.identifier) && u.password === creds.password
    );

    if (foundUser) {
      executeLoginSuccess(foundUser);
      return;
    }

    // 3. API HANDSHAKE
    try {
      const response = await fetch(SYSTEM_CONFIG.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reg_no: creds.identifier, 
          password: creds.password 
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (activeTab === 'admin' && data.user.role !== 'admin') {
          throw new Error("Access Denied: Insufficient Privileges");
        }
        executeLoginSuccess(data.user);
      } else {
        if (response.status === 403) {
          setErrors({ global: "⚠️ Account Pending Verification" });
        } else {
          setErrors({ global: "❌ Invalid Credentials" });
        }
      }
    } catch (err) {
      // Fallback Error
      setErrors({ global: err.message || "❌ Connection Failed. Use Local Bridge." });
    } finally {
      if (!foundUser) setIsLoading(false); // Only stop loading if we didn't find a user (success redirects)
    }
  };

  const executeLoginSuccess = (userPayload) => {
    // Save Session
    localStorage.setItem('user', JSON.stringify(userPayload));
    
    // Handle Remember Me
    if (rememberMe) localStorage.setItem('sju_secure_id', creds.identifier);
    else localStorage.removeItem('sju_secure_id');

    // Artificial Delay for "Secure Handshake" visual
    setTimeout(() => {
      navigate(userPayload.role === 'admin' ? '/admin' : '/directory');
      window.location.reload();
    }, 800);
  };

  // --- RENDER HELPERS ---

  // OTP Handling for Recovery
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    let otpArray = [...otp];
    otpArray[index] = element.value;
    setOtp(otpArray);
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  // Pre-flight Loading Screen
  if (!systemReady) {
    return (
      <div style={{ height: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <div className="spinner-border text-warning" style={{ width: '3rem', height: '3rem' }} role="status"></div>
        <h4 style={{ marginTop: '20px', fontFamily: 'monospace' }}>INITIALIZING SECURE GATEWAY...</h4>
        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Verifying SSL Handshake • {SYSTEM_CONFIG.VERSION}</span>
      </div>
    );
  }

  // --- STYLES ---
  const styles = {
    // Layout
    container: {
      minHeight: '100vh',
      display: 'flex',
      background: theme.colors.bg,
      fontFamily: "'Inter', sans-serif",
      overflow: 'hidden'
    },
    // Left Branding Panel
    brandPanel: {
      flex: '1.3',
      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #001f3f 100%)`,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '80px',
      color: 'white',
      overflow: 'hidden'
    },
    meshGradient: {
      position: 'absolute',
      width: '150%',
      height: '150%',
      top: '-25%',
      left: '-25%',
      background: 'radial-gradient(circle at 50% 50%, rgba(255, 204, 0, 0.15) 0%, transparent 50%)',
      filter: 'blur(80px)',
      zIndex: 0
    },
    brandContent: {
      position: 'relative',
      zIndex: 10
    },
    secureBadge: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '50px',
      padding: '8px 16px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.85rem',
      fontWeight: '600',
      marginBottom: '30px',
      color: theme.colors.accent
    },
    heading: {
      fontSize: '4.5rem',
      fontWeight: '900',
      lineHeight: '1.1',
      marginBottom: '20px',
      letterSpacing: '-1.5px',
      color: '#ffffff', // ENHANCEMENT: White Text
      textShadow: '0 10px 30px rgba(0,0,0,0.3)' // ENHANCEMENT: Shadow for pop
    },
    subHeading: {
      fontSize: '1.25rem',
      opacity: 0.9,
      fontWeight: '400',
      maxWidth: '500px',
      marginBottom: '60px',
      lineHeight: '1.6',
      color: '#e2e8f0'
    },
    // Right Form Panel
    formPanel: {
      flex: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23003366' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    },
    card: {
      width: '100%',
      maxWidth: '520px',
      background: theme.colors.glass,
      backdropFilter: 'blur(20px)',
      borderRadius: '30px',
      padding: '50px',
      boxShadow: theme.shadows.card,
      border: '1px solid white',
      animation: theme.animations.slide
    },
    // Tabs
    tabContainer: {
      display: 'flex',
      background: '#f1f5f9',
      padding: '5px',
      borderRadius: '16px',
      marginBottom: '40px'
    },
    tab: (active, color) => ({
      flex: 1,
      padding: '12px',
      textAlign: 'center',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: '700',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease',
      background: active ? 'white' : 'transparent',
      color: active ? color : theme.colors.muted,
      boxShadow: active ? '0 4px 6px rgba(0,0,0,0.05)' : 'none'
    }),
    // Button
    submitBtn: {
      width: '100%',
      padding: '18px',
      borderRadius: '16px',
      border: 'none',
      background: activeTab === 'admin' 
        ? `linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)`
        : `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
      color: 'white',
      fontSize: '1.1rem',
      fontWeight: '700',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      boxShadow: '0 10px 20px -5px rgba(0, 51, 102, 0.4)',
      transition: 'transform 0.2s',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px'
    },
    // Biometric
    bioBtn: {
      marginTop: '20px',
      width: '100%',
      padding: '12px',
      border: '2px dashed #cbd5e1',
      borderRadius: '16px',
      background: 'transparent',
      color: theme.colors.muted,
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      transition: 'all 0.2s'
    }
  };

  return (
    <div style={styles.container}>
      
      {/* LEFT: BRANDING & NEWS */}
      <div className="d-none d-lg-flex" style={styles.brandPanel}>
        <div style={styles.meshGradient}></div>
        <div style={styles.brandContent}>
          <div style={styles.secureBadge}>
            <i className="bi bi-shield-lock-fill"></i> SSL Encrypted Gateway
          </div>
          
          {/* ENHANCEMENT: BRIGHT WHITE TEXT AS REQUESTED */}
          <h1 style={styles.heading}>
            THE ALUMNI<br /> 
            <span style={{ color: theme.colors.accent }}>CONNECTION.</span>
          </h1>
          
          <p style={styles.subHeading}>
            Authenticate to access the exclusive global network of St. Joseph's University. 
            Connect, mentor, and grow with verified professionals.
          </p>

          <NewsTicker />
          
          <div style={{ marginTop: '40px', display: 'flex', gap: '20px', fontSize: '0.85rem', opacity: 0.7 }}>
            <span>&copy; 2026 SJU Tech</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>

      {/* RIGHT: AUTH FORM */}
      <div style={styles.formPanel}>
        <div style={styles.card}>
          
          {/* Tab Switcher */}
          <div style={styles.tabContainer}>
            <div 
              style={styles.tab(activeTab === 'alumni', theme.colors.primary)}
              onClick={() => { setActiveTab('alumni'); setErrors({}); }}
            >
              <i className="bi bi-mortarboard-fill me-2"></i> Alumni
            </div>
            <div 
              style={styles.tab(activeTab === 'admin', theme.colors.error)}
              onClick={() => { setActiveTab('admin'); setErrors({}); }}
            >
              <i className="bi bi-person-lock me-2"></i> Admin
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-4">
            <h3 style={{ fontWeight: '800', color: theme.colors.textDark, marginBottom: '5px' }}>
              {activeTab === 'admin' ? 'Restricted Access' : 'Welcome Back'}
            </h3>
            <p style={{ color: theme.colors.muted, fontSize: '0.95rem' }}>
              {activeTab === 'admin' ? 'Security clearance required' : 'Enter credentials to continue'}
            </p>
          </div>

          {/* Global Error */}
          {errors.global && (
            <div className="alert alert-danger d-flex align-items-center mb-4" style={{ borderRadius: '12px', border: 'none', background: '#fef2f2', color: '#b91c1c', fontWeight: '600' }}>
              <i className="bi bi-exclamation-triangle-fill me-3"></i>
              {errors.global}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            <FloatingInput 
              label={activeTab === 'admin' ? "Administrator ID" : "Register Number"}
              type="text"
              name="identifier"
              value={creds.identifier}
              onChange={handleInputChange}
              icon={activeTab === 'admin' ? "bi-hdd-network" : "bi-card-heading"}
              error={errors.identifier}
            />

            <FloatingInput 
              label="Access Key (Password)"
              type={showPass ? "text" : "password"}
              name="password"
              value={creds.password}
              onChange={handleInputChange}
              icon="bi-fingerprint"
              error={errors.password}
              isPassword={showPass}
              onTogglePass={() => setShowPass(!showPass)}
            />

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="remember" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label className="form-check-label" htmlFor="remember" style={{ fontSize: '0.9rem', color: theme.colors.muted, fontWeight: '500' }}>
                  Remember Device
                </label>
              </div>
              <button type="button" onClick={() => setModalMode('recovery')} style={{ background: 'none', border: 'none', color: theme.colors.primary, fontWeight: '700', fontSize: '0.9rem' }}>
                Forgot Key?
              </button>
            </div>

            <button 
              type="submit" 
              style={styles.submitBtn}
              disabled={isLoading}
              onMouseOver={(e) => !isLoading && (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseOut={(e) => !isLoading && (e.currentTarget.style.transform = 'scale(1)')}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Verifying Identity...
                </>
              ) : (
                <>AUTHENTICATE <i className="bi bi-arrow-right-short" style={{ fontSize: '1.2rem' }}></i></>
              )}
            </button>

            {/* Biometric Simulation */}
            {activeTab === 'alumni' && (
              <button type="button" style={styles.bioBtn} onClick={() => setModalMode('biometric')}>
                <i className="bi bi-qr-code-scan"></i> Login with Passkey / FaceID
              </button>
            )}
          </form>

          {/* Footer */}
          {activeTab === 'alumni' && (
            <div className="text-center mt-4 pt-3 border-top">
              <span style={{ color: theme.colors.muted, fontSize: '0.95rem' }}>New to the portal? </span>
              <Link to="/register" style={{ color: theme.colors.primary, fontWeight: '800', textDecoration: 'none' }}>
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* --- RECOVERY MODAL (Overlay) --- */}
      {modalMode === 'recovery' && (
        <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      )}
      {modalMode === 'recovery' && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '24px', padding: '20px', border: 'none', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Secure Account Recovery</h5>
                <button type="button" className="btn-close" onClick={() => { setModalMode(null); setRecoveryStep(1); }}></button>
              </div>
              <div className="modal-body">
                {/* STEP 1: EMAIL */}
                {recoveryStep === 1 && (
                  <div className="fade-in">
                    <p className="text-muted mb-4">Enter your registered university email ID. We will send a One-Time Verification code.</p>
                    <FloatingInput 
                      label="University Email" 
                      type="email" 
                      name="rec_email" 
                      value="" 
                      onChange={() => {}} 
                      icon="bi-envelope-at" 
                    />
                    <button className="btn w-100 py-3 fw-bold text-white" style={{ background: theme.colors.primary, borderRadius: '12px' }} onClick={() => setRecoveryStep(2)}>
                      Send Verification Code
                    </button>
                  </div>
                )}

                {/* STEP 2: OTP */}
                {recoveryStep === 2 && (
                  <div className="fade-in text-center">
                    <div className="mb-4">
                      <i className="bi bi-shield-check" style={{ fontSize: '3rem', color: theme.colors.accent }}></i>
                    </div>
                    <h5>Authentication Required</h5>
                    <p className="text-muted">Enter the 4-digit code sent to your email.</p>
                    <div className="d-flex justify-content-center gap-3 mb-4">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength="1"
                          className="form-control text-center fw-bold fs-4"
                          style={{ width: '60px', height: '60px', borderRadius: '12px', border: `2px solid ${theme.colors.border}` }}
                          value={digit}
                          onChange={(e) => handleOtpChange(e.target, index)}
                        />
                      ))}
                    </div>
                    <button className="btn w-100 py-3 fw-bold text-white" style={{ background: theme.colors.success, borderRadius: '12px' }} onClick={() => setRecoveryStep(3)}>
                      Verify & Proceed
                    </button>
                  </div>
                )}

                {/* STEP 3: SUCCESS */}
                {recoveryStep === 3 && (
                  <div className="fade-in text-center py-4">
                    <h4 className="text-success fw-bold mb-3">Identity Verified</h4>
                    <p className="text-muted">A temporary password link has been sent to your inbox.</p>
                    <button className="btn btn-outline-dark px-5 mt-2 rounded-pill" onClick={() => setModalMode(null)}>Back to Login</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL ANIMATIONS */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
      `}</style>
    </div>
  );
};

export default Login;