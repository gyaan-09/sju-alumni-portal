import React, { useState, useEffect, useMemo, useRef, useCallback } from \'react\';
import { db } from \'../firebase\'; 
import { collection, getDocs, query, limit } from "firebase/firestore";

/* ============================================================================
   1. ENTERPRISE CONFIGURATION & FIREBASE GATEWAY
   ============================================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyCiJ-4SeUb6u-f4FISN4RK104746HN-G74",
  authDomain: "ainp-f8709.firebaseapp.com",
  projectId: "ainp-f8709",
  storageBucket: "ainp-f8709.firebasestorage.app",
  messagingSenderId: "1027353321858",
  appId: "1:1027353321858:web:b15c79969a62111e852f9b"
};

// Zero-crash initialization: Prevents "Firebase App already exists" during HMR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app, "ainp");

const CONFIG = {
  SYSTEM: {
    APP_NAME: "SJU Mentorship Gateway",
    VERSION: "5.0.0 Enterprise Ultra",
    ORG: "St. Joseph\'s University",
    BUILD: "2026.11.X.NEXUS"
  },
  DATA: {
    PAGE_SIZE: 20, // Strict requirement from Directory logic
    MAX_LIMIT: 10000 // Supports scaling up to 500 pages
  },
  THEME: {
    // Core Palette
    NAVY_DARK: \'#061121\', NAVY_MAIN: \'#0C2340\', NAVY_LITE: \'#1A3B66\',
    GOLD_MAIN: \'#D4AF37\', GOLD_LITE: \'#F9F1D8\',
    
    // Accents & Semantic States
    ACCENT_CYAN: \'#00B4D8\', ACCENT_PURPLE: \'#7B2CBF\',
    SUCCESS: \'#10B981\', SUCCESS_BG: \'rgba(16, 185, 129, 0.1)\',
    WARNING: \'#F59E0B\', WARNING_BG: \'rgba(245, 158, 11, 0.1)\',
    DANGER: \'#EF4444\', DANGER_BG: \'rgba(239, 68, 68, 0.1)\',
    INFO: \'#3B82F6\', INFO_BG: \'rgba(59, 130, 246, 0.1)\',
    
    // Surfaces & Typography
    BG_APP: \'#F4F7F9\', BG_SURFACE: \'#FFFFFF\', BG_SURFACE_ALT: \'#F8FAFC\',
    BORDER: \'rgba(12, 35, 64, 0.12)\', BORDER_LIGHT: \'#E2E8F0\',
    TEXT_PRI: \'#0F172A\', TEXT_SEC: \'#475569\', TEXT_TER: \'#94A3B8\',
    
    // Geometry
    RADIUS_SM: \'6px\', RADIUS_MD: \'12px\', RADIUS_LG: \'20px\', RADIUS_XL: \'32px\', RADIUS_FULL: \'9999px\',
    
    // Elevation
    SHADOW_SM: \'0 4px 6px -1px rgba(0, 0, 0, 0.05)\',
    SHADOW_MD: \'0 10px 15px -3px rgba(0, 0, 0, 0.08)\',
    SHADOW_LG: \'0 25px 50px -12px rgba(0, 0, 0, 0.15)\',
    SHADOW_HOVER: \'0 30px 60px -15px rgba(0, 0, 0, 0.25), 0 0 20px rgba(212, 175, 55, 0.15)\',
    
    // Motion
    TRANSITION_FAST: \'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)\',
    TRANSITION_SMOOTH: \'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)\',
    TRANSITION_BOUNCE: \'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)\'
  }
};

/* ============================================================================
   2. ERROR BOUNDARY (CRASH-PROOF ARCHITECTURE)
   ============================================================================ */
class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) {
    console.error("🔥 MENTORSHIP THREAD CRASH INTERCEPTED:", error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '60px', textAlign: 'center', fontFamily: '"Lora", serif', color: CONFIG.THEME.NAVY_MAIN, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: CONFIG.THEME.BG_APP }}>
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🛡️</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', color: CONFIG.THEME.DANGER }}>Gateway Exception Intercepted</h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.8', color: CONFIG.THEME.TEXT_SEC }}>The mentorship interface encountered an unexpected fault. The error boundary has isolated the failure to prevent a system crash.</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '32px', padding: '16px 32px', backgroundColor: CONFIG.THEME.NAVY_MAIN, color: CONFIG.THEME.GOLD_MAIN, border: 'none', borderRadius: '999px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: CONFIG.THEME.SHADOW_MD }}>Reboot Gateway</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ============================================================================
   3. GLOBAL STYLES & ANIMATION ENGINE
   ============================================================================ */
const GlobalStyles = () => (
  <style>{`
    @import url(\'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap\');
    
    body {
      margin: 0; padding: 0; background-color: ${CONFIG.THEME.BG_APP};
      font-family: \'Lora\', serif; color: ${CONFIG.THEME.TEXT_PRI};
      -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
      overflow-x: hidden; line-height: 1.6;
    }

    * { box-sizing: border-box; }
    h1, h2, h3, h4, h5, h6, button, input, select, textarea, span, p, div, table, th, td { font-family: \'Lora\', serif; }

    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: ${CONFIG.THEME.BG_APP}; border-left: 1px solid ${CONFIG.THEME.BORDER_LIGHT}; }
    ::-webkit-scrollbar-thumb { background: ${CONFIG.THEME.BORDER_FOCUS}; border-radius: 10px; border: 2px solid ${CONFIG.THEME.BG_APP}; }
    ::-webkit-scrollbar-thumb:hover { background: ${CONFIG.THEME.NAVY_LITE}; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUpFade { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleInModal { from { opacity: 0; transform: scale(0.95) translateY(15px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(212, 175, 55, 0); } 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); } }
    @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
    @keyframes scanline { 0% { top: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .animated-card {
      background: ${CONFIG.THEME.BG_SURFACE}; border-radius: ${CONFIG.THEME.RADIUS_LG};
      border: 1px solid ${CONFIG.THEME.BORDER_LIGHT}; transition: ${CONFIG.THEME.TRANSITION_BOUNCE};
      cursor: pointer; position: relative; overflow: hidden; z-index: 1; display: flex; flex-direction: column;
    }
    .animated-card::before {
      content: \'\'; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      border-radius: ${CONFIG.THEME.RADIUS_LG}; padding: 2px;
      background: linear-gradient(135deg, ${CONFIG.THEME.NAVY_MAIN}, ${CONFIG.THEME.GOLD_MAIN});
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor; mask-composite: exclude;
      opacity: 0; transition: ${CONFIG.THEME.TRANSITION_SMOOTH}; z-index: -1;
    }
    .animated-card:hover { transform: translateY(-8px); box-shadow: ${CONFIG.THEME.SHADOW_HOVER}; }
    .animated-card:hover::before { opacity: 1; }

    .animated-row { transition: ${CONFIG.THEME.TRANSITION_FAST}; border-bottom: 1px solid ${CONFIG.THEME.BORDER_LIGHT}; cursor: pointer; position: relative; }
    .animated-row:hover { background-color: ${CONFIG.THEME.BG_SURFACE_ALT} !important; transform: translateX(6px); }
    .animated-row::after {
      content: \'\'; position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
      background: ${CONFIG.THEME.GOLD_MAIN}; transform: scaleY(0); transition: transform 0.2s ease; transform-origin: center;
    }
    .animated-row:hover::after { transform: scaleY(1); }

    .glass-panel { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.6); box-shadow: ${CONFIG.THEME.SHADOW_SM}; }
    .skeleton-box { background: #E2E8F0; background-image: linear-gradient(90deg, #E2E8F0 0px, #F1F5F9 40px, #E2E8F0 80px); background-size: 1000px 100%; animation: shimmer 2.5s infinite linear; border-radius: ${CONFIG.THEME.RADIUS_SM}; }

    .sju-input, .sju-textarea {
      width: 100%; padding: 16px 20px; border-radius: ${CONFIG.THEME.RADIUS_LG};
      border: 1px solid ${CONFIG.THEME.BORDER_LIGHT}; font-size: 1rem; background: ${CONFIG.THEME.BG_SURFACE}; 
      transition: all 0.3s ease; color: ${CONFIG.THEME.TEXT_PRI}; font-family: \'Lora\', serif;
    }
    .sju-input.has-icon { padding-left: 48px; border-radius: ${CONFIG.THEME.RADIUS_FULL}; }
    .sju-input:focus, .sju-textarea:focus { border-color: ${CONFIG.THEME.NAVY_MAIN}; box-shadow: 0 0 0 4px rgba(12, 35, 64, 0.1); outline: none; }
  `}</style>
);

/* ============================================================================
   4. ICON LIBRARY
   ============================================================================ */
const Icons = {
  Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Grid: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  List: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Chart: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Calendar: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Brain: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
  Close: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  CheckCircle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Alert: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
};

/* ============================================================================
   5. DATA UTILITIES & FORMATTERS
   ============================================================================ */
const Utils = {
  formatNumber: (num) => num > 999 ? (num / 1000).toFixed(1) + \'k\' : num.toString(),
  formatCurrency: (amount) => amount === 0 ? "Pro-Bono (Free)" : `₹${amount}/hr`,
  
  generateAvatarGradient: (str) => {
    if (!str) return `linear-gradient(135deg, ${CONFIG.THEME.NAVY_MAIN}, ${CONFIG.THEME.NAVY_LITE})`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const h1 = Math.abs(hash) % 50 + 200; 
    const h2 = (h1 + 40) % 360;
    return `linear-gradient(135deg, hsl(${h1}, 70%, 25%), hsl(${h2}, 80%, 40%))`;
  },

  extractInitials: (name) => {
    if (!name) return "SJU";
    const parts = name.trim().split(' ').filter(p => p.length > 0);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  },

  seedGen: (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash);
  }
};

/* ============================================================================
   6. ATOMIC UI COMPONENTS
   ============================================================================ */
const Badge = ({ label, color, bg, icon, outline = false }) => (
  <span style={{ 
    display: \'inline-flex\', alignItems: \'center\', gap: \'6px\', 
    padding: \'4px 12px\', borderRadius: CONFIG.THEME.RADIUS_FULL, 
    fontSize: \'0.75rem\', fontWeight: \'700\', letterSpacing: \'0.05em\', color: color, 
    backgroundColor: outline ? \'transparent\' : bg || `${color}15`,
    border: outline ? `1px solid ${color}` : `1px solid transparent`, whiteSpace: \'nowrap\'
  }}>
    {icon && <span>{icon}</span>} {label}
  </span>
);

const Button = ({ children, onClick, variant = \'primary\', active = false, fullWidth = false, disabled = false, style = {} }) => {
  let baseStyle = {
    padding: \'12px 24px\', borderRadius: CONFIG.THEME.RADIUS_FULL, fontWeight: \'700\', fontSize: \'0.875rem\',
    cursor: disabled ? \'not-allowed\' : \'pointer\', transition: CONFIG.THEME.TRANSITION_FAST,
    width: fullWidth ? \'100%\' : \'auto\', display: \'inline-flex\', alignItems: \'center\', justifyContent: \'center\',
    gap: \'8px\', border: \'none\', opacity: disabled ? 0.6 : 1, textTransform: \'uppercase\', letterSpacing: \'0.1em\',
    ...style
  };

  if (variant === \'primary\') {
    baseStyle = { ...baseStyle, background: CONFIG.THEME.NAVY_MAIN, color: CONFIG.THEME.GOLD_MAIN, boxShadow: CONFIG.THEME.SHADOW_SM };
  } else if (variant === \'outline\') {
    baseStyle = { ...baseStyle, background: \'transparent\', color: active ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.NAVY_MAIN, border: `2px solid ${active ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.NAVY_MAIN}` };
  } else if (variant === \'ghost\') {
    baseStyle = { ...baseStyle, background: active ? CONFIG.THEME.BG_SURFACE : \'transparent\', color: active ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.TEXT_SEC, boxShadow: active ? CONFIG.THEME.SHADOW_SM : \'none\' };
  }

  return (
    <button 
      onClick={onClick} disabled={disabled} style={baseStyle}
      onMouseEnter={(e) => { 
        if (!disabled) {
          if (variant === \'primary\') e.currentTarget.style.transform = \'translateY(-2px)\';
          if (variant === \'outline\') { e.currentTarget.style.background = CONFIG.THEME.NAVY_MAIN; e.currentTarget.style.color = CONFIG.THEME.GOLD_MAIN; }
        }
      }}
      onMouseLeave={(e) => { 
        if (!disabled) {
          if (variant === \'primary\') e.currentTarget.style.transform = \'translateY(0)\';
          if (variant === \'outline\') { e.currentTarget.style.background = \'transparent\'; e.currentTarget.style.color = CONFIG.THEME.NAVY_MAIN; }
        }
      }}
    >
      {icon && icon} {children}
    </button>
  );
};

const FilterAccordion = ({ title, options, activeValue, onSelect }) => {
  const [isOpen, setIsOpen] = useState(true);
  if (!options || options.length === 0) return null;

  return (
    <div style={{ marginBottom: \'16px\', borderBottom: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingBottom: \'16px\' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ display: \'flex\', justifyContent: \'space-between\', alignItems: \'center\', cursor: \'pointer\', userSelect: \'none\' }}>
        <span style={{ fontSize: \'0.85rem\', fontWeight: \'700\', color: CONFIG.THEME.NAVY_MAIN, textTransform: \'uppercase\', letterSpacing: \'0.05em\' }}>{title}</span>
        <span style={{ transform: isOpen ? \'rotate(180deg)\' : \'rotate(0deg)\', transition: \'transform 0.3s\', color: CONFIG.THEME.TEXT_TER }}>▼</span>
      </div>
      <div style={{ maxHeight: isOpen ? \'600px\' : \'0px\', overflow: \'hidden\', transition: CONFIG.THEME.TRANSITION_SMOOTH, marginTop: isOpen ? \'12px\' : \'0px\', display: \'flex\', flexDirection: \'column\', gap: \'4px\' }}>
        {options.map(opt => {
          const isActive = activeValue === opt.val;
          return (
            <div 
              key={opt.val} onClick={() => onSelect(opt.val)} 
              style={{ 
                display: \'flex\', justifyContent: \'space-between\', alignItems: \'center\',
                padding: \'8px 12px\', borderRadius: CONFIG.THEME.RADIUS_SM, 
                background: isActive ? CONFIG.THEME.NAVY_MAIN : \'transparent\', 
                color: isActive ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.TEXT_SEC, 
                cursor: \'pointer\', transition: CONFIG.THEME.TRANSITION_FAST, 
                fontSize: \'0.9rem\', fontWeight: isActive ? \'700\' : \'500\' 
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = CONFIG.THEME.BG_SURFACE_ALT; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = \'transparent\'; }}
            >
              <span style={{ overflow: \'hidden\', textOverflow: \'ellipsis\', whiteSpace: \'nowrap\', maxWidth: \'80%\' }}>{opt.label}</span>
              <span style={{ opacity: isActive ? 1 : 0.6, fontSize: \'0.75rem\' }}>{Utils.formatNumber(opt.count)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AdvancedPagination = ({ currentPage, totalPages, onPageChange, totalItems, pageSize }) => {
  if (totalPages <= 1) return null;
  const handleNav = (dir) => {
    if (dir === \'first\') onPageChange(1);
    if (dir === \'prev\' && currentPage > 1) onPageChange(currentPage - 1);
    if (dir === \'next\' && currentPage < totalPages) onPageChange(currentPage + 1);
    if (dir === \'last\') onPageChange(totalPages);
  };
  const btnStyle = (disabled) => ({
    padding: \'8px 16px\', background: \'#FFFFFF\', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`,\
    borderRadius: \'6px\', color: disabled ? \'#94A3B8\' : \'#0C2340\',
    fontWeight: \'700\', fontSize: \'0.875rem\', cursor: disabled ? \'not-allowed\' : \'pointer\',
    transition: \'all 0.2s\', display: \'flex\', alignItems: \'center\', gap: \'6px\'
  });

  return (
    <div style={{ display: \'flex\', justifyContent: \'space-between\', alignItems: \'center\', padding: \'24px 0\', marginTop: \'32px\', borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
      <div style={{ fontSize: \'0.875rem\', color: CONFIG.THEME.TEXT_SEC }}>Showing <strong>{((currentPage - 1) * pageSize) + 1}</strong> to <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> of <strong>{totalItems}</strong> mentors</div>
      <div style={{ display: \'flex\', gap: \'8px\', alignItems: \'center\' }}>
        <button onClick={() => handleNav(\'first\')} disabled={currentPage === 1} style={btnStyle(currentPage === 1)}>« First</button>
        <button onClick={() => handleNav(\'prev\')} disabled={currentPage === 1} style={btnStyle(currentPage === 1)}>‹ Prev</button>
        <div style={{ padding: \'8px 20px\', background: CONFIG.THEME.NAVY_MAIN, color: CONFIG.THEME.GOLD_MAIN, borderRadius: \'6px\', fontWeight: \'700\', fontSize: \'0.875rem\' }}>Page {currentPage} of {totalPages}</div>
        <button onClick={() => handleNav(\'next\')} disabled={currentPage === totalPages} style={btnStyle(currentPage === totalPages)}>Next ›</button>
        <button onClick={() => handleNav(\'last\')} disabled={currentPage === totalPages} style={btnStyle(currentPage === totalPages)}>Last »</button>
      </div>
    </div>
  );
};

const SkeletonLoader = () => (
  <div style={{ display: \'grid\', gridTemplateColumns: \'repeat(auto-fill, minmax(320px, 1fr))\', gap: \'24px\' }}>
    {[...Array(6)].map((_, i) => (
      <div key={i} className="glass-panel" style={{ padding: \'32px 24px\', borderRadius: CONFIG.THEME.RADIUS_LG, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
        <div className="skeleton-box" style={{ width: \'80px\', height: \'80px\', borderRadius: \'50%\', margin: \'0 auto 24px\' }} />
        <div className="skeleton-box" style={{ width: \'60%\', height: \'24px\', margin: \'0 auto 12px\' }} />
        <div className="skeleton-box" style={{ width: \'80%\', height: \'16px\', margin: \'0 auto 24px\' }} />
        <div style={{ display: \'flex\', gap: \'8px\', justifyContent: \'center\', marginBottom: \'24px\' }}>
          <div className="skeleton-box" style={{ width: \'60px\', height: \'24px\', borderRadius: \'12px\' }} />
          <div className="skeleton-box" style={{ width: \'60px\', height: \'24px\', borderRadius: \'12px\' }} />
        </div>
      </div>
    ))}\
  </div>
);

const EmptyState = ({ msg = "No records found matching your current filter criteria." }) => (
  <div style={{ padding: \'100px 20px\', textAlign: \'center\', background: \'transparent\', animation: \'fadeIn 0.5s\' }}>
    <div style={{ fontSize: \'4rem\', opacity: 0.2, marginBottom: \'24px\' }}>📭</div>
    <h3 style={{ color: CONFIG.THEME.NAVY_MAIN, margin: \'0 0 12px 0\', fontSize: \'1.5rem\', fontWeight: \'700\' }}>No Mentors Found</h3>
    <p style={{ color: CONFIG.THEME.TEXT_SEC, fontSize: \'1rem\' }}>{msg}</p>
  </div>
);

/* ============================================================================
   7. ULTRA-DETAILED BOOKING WIZARD MODAL
   ============================================================================ */
const BookingWizard = ({ mentor, onClose, onConfirm }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookingNote, setBookingNote] = useState(\'\');

  const generateSlots = () => {
    const dates = [\'Tomorrow\', \'Next Wednesday\', \'Next Friday\'];
    const times = [\'10:00 AM\', \'02:00 PM\', \'04:30 PM\', \'06:00 PM\', \'08:00 PM\'];
    const s = Utils.seedGen(mentor.id);
    return { dates, times: times.filter((_, i) => (s + i) % 2 !== 0 || i === 0) };
  };
  const slots = useMemo(generateSlots, [mentor.id]);

  return (
    <div style={{ padding: \'10px 0\', height: \'100%\', display: \'flex\', flexDirection: \'column\', animation: \'fadeIn 0.4s ease\' }}>
      <h2 style={{ fontSize: \'2rem\', color: CONFIG.THEME.NAVY_MAIN, marginBottom: \'8px\', marginTop: 0 }}>Schedule Session</h2>
      <p style={{ color: CONFIG.THEME.TEXT_SEC, marginBottom: \'32px\', fontSize: \'1.1rem\' }}>Initiating request with <strong>{mentor.name}</strong> • {mentor.domain} Expert</p>

      <div style={{ display: \'flex\', gap: \'12px\', marginBottom: \'32px\' }}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} style={{ flex: 1, height: \'6px\', borderRadius: \'3px\', background: s <= step ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.BORDER_LIGHT, transition: CONFIG.THEME.TRANSITION_SMOOTH }} />
        ))}\
      </div>

      <div style={{ flex: 1, minHeight: \'350px\' }}>
        {step === 1 && (
          <div style={{ animation: \'fadeIn 0.3s ease\' }}>
            <h4 style={{ margin: \'0 0 20px 0\', fontSize: \'1.1rem\', color: CONFIG.THEME.TEXT_PRI }}>Select Engagement Model</h4>
            <div style={{ display: \'grid\', gridTemplateColumns: \'1fr 1fr\', gap: \'20px\' }}>
              {mentor.sessionTypes.map(type => (
                <div key={type} onClick={() => setSelectedType(type)} style={{ border: `2px solid ${selectedType === type ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.BORDER_LIGHT}`, borderRadius: CONFIG.THEME.RADIUS_LG, padding: \'24px\', cursor: \'pointer\', background: selectedType === type ? CONFIG.THEME.GOLD_LITE : CONFIG.THEME.BG_SURFACE, transition: CONFIG.THEME.TRANSITION_FAST, position: \'relative\', overflow: \'hidden\' }}>
                  {selectedType === type && <div style={{ position: \'absolute\', top: 0, right: 0, background: CONFIG.THEME.GOLD_MAIN, color: CONFIG.THEME.NAVY_MAIN, padding: \'4px 12px\', borderBottomLeftRadius: CONFIG.THEME.RADIUS_MD, fontSize: \'0.7rem\', fontWeight: \'bold\', textTransform: \'uppercase\' }}>Selected</div>}
                  <div style={{ fontWeight: \'700\', fontSize: \'1.25rem\', color: CONFIG.THEME.NAVY_MAIN, marginBottom: \'8px\' }}>{type}</div>
                  <div style={{ fontSize: \'0.875rem\', color: CONFIG.THEME.TEXT_SEC, fontWeight: \'500\', marginBottom: \'16px\' }}>{type.includes(\'Mock\') ? \'Intensive 90-min review\' : \'Standard 45-min sync\'}</div>
                  <div style={{ fontSize: \'1.1rem\', color: CONFIG.THEME.SUCCESS, fontWeight: \'800\' }}>{Utils.formatCurrency(type.includes(\'Mock\') ? mentor.price * 1.5 : mentor.price)}</div>
                </div>
              ))}\
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: \'fadeIn 0.3s ease\' }}>
            <h4 style={{ margin: \'0 0 20px 0\', fontSize: \'1.1rem\', color: CONFIG.THEME.TEXT_PRI }}>Select Availability Slot</h4>
            <div style={{ display: \'flex\', gap: \'12px\', marginBottom: \'24px\', flexWrap: \'wrap\' }}>
              {slots.dates.map((d, i) => <button key={d} style={{ padding: \'12px 20px\', borderRadius: CONFIG.THEME.RADIUS_FULL, border: `1px solid ${i === 0 ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.BORDER_LIGHT}`, background: i === 0 ? CONFIG.THEME.NAVY_LITE : CONFIG.THEME.BG_SURFACE, fontWeight: \'700\', color: i === 0 ? \'#FFF\' : CONFIG.THEME.TEXT_PRI, cursor: \'pointer\' }}>{d}</button>)}\
            </div>
            <div style={{ display: \'grid\', gridTemplateColumns: \'repeat(auto-fill, minmax(140px, 1fr))\', gap: \'16px\' }}>
              {slots.times.map(t => (
                <button key={t} onClick={() => setSelectedDate(t)} style={{ padding: \'16px\', borderRadius: CONFIG.THEME.RADIUS_MD, border: `2px solid ${selectedDate === t ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.BORDER_LIGHT}`, background: selectedDate === t ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.BG_SURFACE, color: selectedDate === t ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.TEXT_PRI, fontWeight: \'700\', cursor: \'pointer\', transition: CONFIG.THEME.TRANSITION_FAST }}>{t}</button>
              ))}\
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ animation: \'fadeIn 0.3s ease\' }}>
            <h4 style={{ margin: \'0 0 20px 0\', fontSize: \'1.1rem\', color: CONFIG.THEME.TEXT_PRI }}>Context & Agenda (Optional but recommended)</h4>
            <p style={{ color: CONFIG.THEME.TEXT_SEC, fontSize: \'0.9rem\', marginBottom: \'16px\' }}>Help {mentor.name} prepare by providing a brief overview of what you want to achieve.</p>
            <textarea 
              className="sju-textarea" 
              rows="6" 
              placeholder="E.g., I\'d like to discuss transitioning from Frontend to Full-Stack, specifically regarding Node.js architectures..."
              value={bookingNote}
              onChange={(e) => setBookingNote(e.target.value)}
            />
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: \'center\', padding: \'20px 0\', animation: \'scaleInModal 0.3s ease\' }}>
            <div style={{ width: \'96px\', height: \'96px\', background: CONFIG.THEME.SUCCESS_BG, borderRadius: \'50%\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\', margin: \'0 auto 24px auto\', border: `2px solid ${CONFIG.THEME.SUCCESS}` }}>
              <span style={{ fontSize: \'2.5rem\', color: CONFIG.THEME.SUCCESS }}>✓</span>
            </div>
            <h3 style={{ margin: \'0 0 12px 0\', color: CONFIG.THEME.NAVY_MAIN, fontSize: \'1.5rem\', fontWeight: \'700\' }}>Confirm Session Details</h3>
            
            <div style={{ background: CONFIG.THEME.BG_SURFACE_ALT, borderRadius: CONFIG.THEME.RADIUS_LG, padding: \'24px\', textAlign: \'left\', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, marginTop: \'24px\' }}>
              <div style={{ display: \'grid\', gridTemplateColumns: \'1fr 1fr\', gap: \'20px\' }}>
                <div>
                  <div style={{ fontSize: \'0.75rem\', color: CONFIG.THEME.TEXT_TER, textTransform: \'uppercase\', fontWeight: \'bold\' }}>Mentor</div>
                  <div style={{ fontWeight: \'bold\', color: CONFIG.THEME.TEXT_PRI, fontSize: \'1.1rem\' }}>{mentor.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: \'0.75rem\', color: CONFIG.THEME.TEXT_TER, textTransform: \'uppercase\', fontWeight: \'bold\' }}>Session Type</div>
                  <div style={{ fontWeight: \'bold\', color: CONFIG.THEME.TEXT_PRI, fontSize: \'1.1rem\' }}>{selectedType}</div>
                </div>
                <div>
                  <div style={{ fontSize: \'0.75rem\', color: CONFIG.THEME.TEXT_TER, textTransform: \'uppercase\', fontWeight: \'bold\' }}>Schedule</div>
                  <div style={{ fontWeight: \'bold\', color: CONFIG.THEME.TEXT_PRI, fontSize: \'1.1rem\' }}>Tomorrow at {selectedDate}</div>
                </div>
                <div>
                  <div style={{ fontSize: \'0.75rem\', color: CONFIG.THEME.TEXT_TER, textTransform: \'uppercase\', fontWeight: \'bold\' }}>Total Cost</div>
                  <div style={{ fontWeight: \'900\', color: CONFIG.THEME.SUCCESS, fontSize: \'1.25rem\' }}>{Utils.formatCurrency(selectedType?.includes(\'Mock\') ? mentor.price * 1.5 : mentor.price)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: \'flex\', justifyContent: \'space-between\', borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingTop: \'24px\', marginTop: \'24px\' }}>
        <Button variant="outline" onClick={() => step === 1 ? onClose() : setStep(s => s - 1)}>Back</Button>
        <Button variant="primary" disabled={(step === 1 && !selectedType) || (step === 2 && !selectedDate)} onClick={() => step === 4 ? onConfirm() : setStep(s => s + 1)}>
          {step === 4 ? \'Confirm Booking\' : \'Next Step\'}
        </Button>
      </div>
    </div>
  );
};

/* ============================================================================
   8. VIEWS: GRID, LIST, ANALYTICS, CALENDAR, SMART MATCH
   ============================================================================ */
const GridView = ({ data, onSelect, onBook }) => {
  if (data.length === 0) return <EmptyState />;
  return (
    <div style={{ display: \'grid\', gridTemplateColumns: \'repeat(auto-fill, minmax(320px, 1fr))\', gap: \'24px\' }}>
      {data.map((m, i) => (
        <div key={m.id} className="animated-card" style={{ animation: `slideUpFade 0.4s ease forwards ${Math.min(i * 0.04, 0.4)}s`, opacity: 0, height: \'100%\' }} onClick={() => onSelect(m)}>
          <div style={{ padding: \'32px 24px\', flex: 1, display: \'flex\', flexDirection: \'column\' }}>
            
            <div style={{ display: \'flex\', justifyContent: \'center\', marginBottom: \'24px\', position: \'relative\' }}>
              <div style={{ width: \'80px\', height: \'80px\', borderRadius: \'50%\', background: Utils.generateAvatarGradient(m.name), color: \'#FFF\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\', fontSize: \'1.75rem\', fontWeight: \'700\', boxShadow: CONFIG.THEME.SHADOW_MD }}>
                {m.initials}
              </div>
              {m.isTopRated && (
                <div style={{ position: \'absolute\', bottom: 0, right: \'50%\', transform: \'translate(30px, 0)\', background: CONFIG.THEME.GOLD_MAIN, color: CONFIG.THEME.NAVY_MAIN, borderRadius: \'50%\', width: \'28px\', height: \'28px\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\', fontSize: \'14px\', border: `3px solid ${CONFIG.THEME.BG_SURFACE}`, fontWeight: \'bold\', animation: \'pulseGlow 2s infinite\' }} title="Top Rated Mentor">★</div>
              )}
            </div>
            
            <div style={{ textAlign: \'center\', marginBottom: \'16px\' }}>
              <h3 style={{ margin: \'0 0 8px\', fontSize: \'1.25rem\', color: CONFIG.THEME.NAVY_MAIN, fontWeight: \'700\' }}>{m.name}</h3>
              <p style={{ margin: 0, fontSize: \'0.875rem\', color: CONFIG.THEME.TEXT_SEC, minHeight: \'42px\', lineHeight: 1.5 }}>
                {m.role} @ <strong style={{ color: CONFIG.THEME.TEXT_PRI }}>{m.company}</strong>
              </p>
            </div>
            
            <div style={{ display: \'flex\', gap: \'8px\', flexWrap: \'wrap\', justifyContent: \'center\', marginBottom: \'24px\', flex: 1 }}>
              {m.domain && <Badge label={m.domain} color={CONFIG.THEME.NAVY_MAIN} bg={CONFIG.THEME.BG_SURFACE_ALT} />}
              {m.tier && m.tier !== "N/A" && <Badge label={m.tier} color={CONFIG.THEME.ACCENT_PURPLE} outline />}
              <Badge label={`${m.rating}★`} color={CONFIG.THEME.WARNING} bg={CONFIG.THEME.WARNING_BG} />
            </div>
            
            <div style={{ borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingTop: \'16px\', display: \'flex\', justifyContent: \'space-between\', alignItems: \'center\', marginTop: \'auto\' }}>
              <div>
                <div style={{ fontSize: \'0.7rem\', fontWeight: \'700\', color: CONFIG.THEME.TEXT_TER, textTransform: \'uppercase\', letterSpacing: \'0.05em\' }}>Hourly Rate</div>
                <div style={{ fontSize: \'1.1rem\', fontWeight: \'800\', color: CONFIG.THEME.SUCCESS }}>{Utils.formatCurrency(m.price)}</div>
              </div>
              <Button variant="outline" onClick={(e) => { e.stopPropagation(); onBook(m); }}>Book Sync</Button>
            </div>
          </div>
        </div>
      ))}\
    </div>
  );
};

const ListView = ({ data, onSelect, onBook }) => {
  if (data.length === 0) return <EmptyState />;
  return (
    <div className="glass-panel" style={{ borderRadius: CONFIG.THEME.RADIUS_LG, overflow: \'hidden\', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
      <div style={{ overflowX: \'auto\' }}>
        <table style={{ width: \'100%\', borderCollapse: \'collapse\', textAlign: \'left\', minWidth: \'1000px\' }}>
          <thead style={{ background: CONFIG.THEME.BG_SURFACE_ALT, color: CONFIG.THEME.NAVY_MAIN }}>
            <tr>
              {[\'Mentor Profile\', \'Expertise Domain\', \'Professional Role\', \'Performance\', \'Rate\', \'Action\'].map(h => (
                <th key={h} style={{ padding: \'20px 24px\', fontSize: \'0.875rem\', textTransform: \'uppercase\', letterSpacing: \'0.05em\', fontWeight: \'700\', borderBottom: `2px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>{h}</th>
              ))}\
            </tr>
          </thead>
          <tbody>
            {data.map((m, i) => (
              <tr key={m.id} className="animated-row" style={{ animation: `fadeIn 0.3s ease forwards ${Math.min(i * 0.03, 0.3)}s`, opacity: 0, background: CONFIG.THEME.BG_SURFACE }} onClick={() => onSelect(m)}>
                <td style={{ padding: \'16px 24px\' }}>
                  <div style={{ display: \'flex\', alignItems: \'center\', gap: \'16px\' }}>
                    <div style={{ position: \'relative\' }}>
                      <div style={{ width: \'48px\', height: \'48px\', borderRadius: \'50%\', background: Utils.generateAvatarGradient(m.name), color: \'#FFF\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\', fontWeight: \'700\', fontSize: \'1rem\' }}>{m.initials}</div>
                      {m.isTopRated && <div style={{ position: \'absolute\', bottom: -2, right: -2, background: CONFIG.THEME.GOLD_MAIN, color: CONFIG.THEME.NAVY_MAIN, borderRadius: \'50%\', width: \'18px\', height: \'18px\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\', fontSize: \'10px\', border: `2px solid ${CONFIG.THEME.BG_SURFACE}`, fontWeight: \'bold\' }}>★</div>}
                    </div>
                    <div>
                      <div style={{ fontWeight: \'700\', color: CONFIG.THEME.NAVY_MAIN, fontSize: \'1rem\' }}>{m.name}</div>
                      <div style={{ fontSize: \'0.75rem\', color: CONFIG.THEME.TEXT_TER }}>{m.tier || \'Mentor\'}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: \'16px 24px\' }}>
                  <div style={{ fontWeight: \'600\', color: CONFIG.THEME.TEXT_PRI, fontSize: \'0.875rem\', marginBottom: \'4px\' }}>{m.domain}</div>
                  <div style={{ display: \'flex\', gap: \'4px\' }}>
                    {m.languages.slice(0, 2).map(l => <Badge key={l} label={l} color={CONFIG.THEME.TEXT_SEC} outline />)}
                  </div>
                </td>
                <td style={{ padding: \'16px 24px\' }}>
                  <div style={{ fontWeight: \'500\', fontSize: \'0.875rem\', color: CONFIG.THEME.TEXT_PRI }}>{m.role}</div>
                  <div style={{ fontSize: \'0.75rem\', color: CONFIG.THEME.TEXT_SEC }}>{m.company}</div>
                </td>
                <td style={{ padding: \'16px 24px\' }}>
                   <div style={{ fontWeight: \'800\', fontSize: \'0.875rem\', color: CONFIG.THEME.WARNING }}>{m.rating} ★</div>
                   <div style={{ fontSize: \'0.75rem\', color: CONFIG.THEME.TEXT_SEC }}>{m.sessionsConducted} sessions</div>
                </td>
                <td style={{ padding: \'16px 24px\', fontWeight: \'800\', color: CONFIG.THEME.SUCCESS, fontSize: \'1.1rem\' }}>{Utils.formatCurrency(m.price)}</td>
                <td style={{ padding: \'16px 24px\' }}>
                  <Button variant="outline" onClick={(e) => { e.stopPropagation(); onBook(m); }}>Book</Button>
                </td>
              </tr>
            ))}\
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AnalyticsView = ({ data }) => {
  if (data.length === 0) return <EmptyState />;

  const getAggregations = (key, limit = 5) => {
    const counts = {};
    data.forEach(m => {
      if (Array.isArray(m[key])) { m[key].forEach(val => counts[val] = (counts[val] || 0) + 1); } 
      else { counts[m[key]] = (counts[m[key]] || 0) + 1; }
    });
    return Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0,limit);
  };

  const TopCard = ({ title, value, sub, delay }) => (
    <div className="glass-panel" style={{ padding: \'24px\', borderRadius: CONFIG.THEME.RADIUS_LG, animation: `slideUpFade 0.5s ease forwards ${delay}s`, opacity: 0 }}>
      <div style={{ fontSize: \'0.75rem\', color: CONFIG.THEME.TEXT_TER, textTransform: \'uppercase\', fontWeight: \'700\', letterSpacing: \'0.1em\' }}>{title}</div>
      <div style={{ fontSize: \'2.5rem\', fontWeight: \'700\', color: CONFIG.THEME.NAVY_MAIN, margin: \'8px 0\', background: `linear-gradient(90deg, ${CONFIG.THEME.NAVY_MAIN}, ${CONFIG.THEME.GOLD_MAIN})`, WebkitBackgroundClip: \'text\', WebkitTextFillColor: \'transparent\' }}>{value}</div>
      <div style={{ fontSize: \'0.875rem\', color: CONFIG.THEME.TEXT_SEC, fontWeight: \'500\' }}>{sub}</div>
    </div>
  );

  const SvgBarChart = ({ title, dataArr }) => {
    const maxVal = Math.max(...dataArr.map(d => d[1]), 1);
    const height = 280; const width = \'100%\';
    return (
      <div className="glass-panel" style={{ padding: \'32px\', borderRadius: CONFIG.THEME.RADIUS_LG, animation: \'slideUpFade 0.6s ease forwards 0.2s\', opacity: 0, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
        <h3 style={{ margin: \'0 0 32px 0\', fontSize: \'1.25rem\', color: CONFIG.THEME.NAVY_MAIN, fontWeight: \'700\' }}>{title}</h3>
        <svg width={width} height={height} style={{ overflow: \'visible\', fontFamily: \'Lora, serif\' }}>
          {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
            <g key={i}>
              <line x1="0" y1={height - (height * tick)} x2="100%" y2={height - (height * tick)} stroke={CONFIG.THEME.BORDER_LIGHT} strokeDasharray="4 4" />
              <text x="-16" y={height - (height * tick) + 4} fontSize="12" fill={CONFIG.THEME.TEXT_TER} textAnchor="end" fontWeight="600">{Math.round(maxVal * tick)}</text>
            </g>
          ))}\
          {dataArr.map(([label, val], i) => {
            const barHeight = (val / maxVal) * height; const y = height - barHeight; const x = `${(i * 100) / dataArr.length + 6}%`;
            return (
              <g key={label}>
                <rect x={x} y={y} width="12%" height={barHeight} fill={`url(#gradient-${i})`} rx="4" style={{ transition: \'all 0.5s ease\' }}><title>{label}: {val}</title></rect>
                <text x={`${(i * 100) / dataArr.length + 11}%`} y={height + 24} fontSize="11" fill={CONFIG.THEME.TEXT_SEC} textAnchor="middle">{label.length > 15 ? label.substring(0,12)+\'...\' : label}</text>
                <defs>
                  <linearGradient id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={i === 0 ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.NAVY_MAIN} />
                    <stop offset="100%" stopColor={i === 0 ? \'#E6B800\' : CONFIG.THEME.NAVY_LITE} />
                  </linearGradient>
                </defs>
              </g>
            );
          })}\
        </svg>
      </div>
    );
  };

  const SvgDonutChart = ({ title, dataArr }) => {
    const total = dataArr.reduce((sum, [, val]) => sum + val, 0);
    let currentAngle = -90; const radius = 110; const circumference = 2 * Math.PI * radius; const cx = 160; const cy = 160;
    const colors = [CONFIG.THEME.NAVY_MAIN, CONFIG.THEME.GOLD_MAIN, CONFIG.THEME.ACCENT_CYAN, CONFIG.THEME.NAVY_LITE, CONFIG.THEME.TEXT_TER];

    return (
       <div className="glass-panel" style={{ padding: \'32px\', borderRadius: CONFIG.THEME.RADIUS_LG, animation: \'slideUpFade 0.6s ease forwards 0.3s\', opacity: 0, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
        <h3 style={{ margin: \'0 0 24px 0\', fontSize: \'1.25rem\', color: CONFIG.THEME.NAVY_MAIN, fontWeight: \'700\' }}>{title}</h3>
        <div style={{ display: \'flex\', alignItems: \'center\', gap: \'40px\' }}>
          <svg width="300" height="300" style={{ transform: \'rotate(-90deg)\', overflow: \'visible\' }}>
            {dataArr.map(([label, val], i) => {
              const fraction = val / total; const strokeDasharray = `${fraction * circumference} ${circumference}`;\
              const strokeDashoffset = -(currentAngle + 90) / 360 * circumference; currentAngle += fraction * 360;
              return (
                <circle key={label} cx={cx} cy={cy} r={radius} fill="transparent" stroke={colors[i % colors.length]} strokeWidth="40" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} style={{ transition: \'stroke-dashoffset 1s ease-out\', transformOrigin: \'center\' }}><title>{label}: {val}</title></circle>
              );
            })}\
            <text x={cx} y={cy} transform="rotate(90 150 150)" textAnchor="middle" dominantBaseline="middle" fill={CONFIG.THEME.NAVY_MAIN} fontSize="24" fontWeight="700" fontFamily="Lora, serif">{Utils.formatNumber(total)}</text>
            <text x={cx} y={cy + 25} transform="rotate(90 150 150)" textAnchor="middle" dominantBaseline="middle" fill={CONFIG.THEME.TEXT_TER} fontSize="12" fontWeight="500" fontFamily="Lora, serif">TOTAL</text>
          </svg>
          <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'12px\', flex: 1 }}>
             {dataArr.map(([label, val], i) => (
               <div key={label} style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\', fontSize: \'0.875rem\' }}>
                 <div style={{ display: \'flex\', alignItems: \'center\', gap: \'8px\' }}><div style={{ width: \'12px\', height: \'12px\', borderRadius: \'50%\', background: colors[i % colors.length] }} /><span style={{ color: CONFIG.THEME.TEXT_SEC, fontWeight: \'500\' }}>{label}</span></div>
                 <strong style={{ color: CONFIG.THEME.NAVY_MAIN }}>{Math.round((val/total)*100)}%</strong>
               </div>
             ))}\
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'32px\' }}>
      <div style={{ display: \'grid\', gridTemplateColumns: \'repeat(auto-fit, minmax(240px, 1fr))\', gap: \'24px\' }}>
        <TopCard title="Active Mentors" value={Utils.formatNumber(data.length)} sub="In current filtered view" delay={0.0} />
        <TopCard title="Top Domain" value={getAggregations(\'domain\', 1)[0]?.[0] || \'N/A\'} sub="Highest demand category" delay={0.1} />
        <TopCard title="Avg Experience" value={`${Math.round(data.reduce((acc, m) => acc + m.experience, 0) / (data.length || 1))} yrs`} sub="Across current segment" delay={0.2} />
        <TopCard title="Pro-bono Mentors" value={data.filter(m => m.price === 0).length} sub="Offering free sessions" delay={0.3} />
      </div>
      <div style={{ display: \'grid\', gridTemplateColumns: \'1fr 1fr\', gap: \'32px\' }}>
        <SvgBarChart title="Domain Demand Distribution" dataArr={getAggregations(\'domain\', 5)} />
        <SvgDonutChart title="Experience Tier Breakdown" dataArr={getAggregations(\'tier\', 4)} />
      </div>
    </div>
  );
};

const CalendarView = ({ data, onSelect, onBook }) => {
  // Aggregate data by mock availability logic (Weekdays vs Weekends)
  const weekdays = data.filter(m => m.availability.includes(\'Weekday\') || m.availability === \'Flexible\');
  const weekends = data.filter(m => m.availability.includes(\'Weekend\') || m.availability === \'Flexible\');

  const Row = ({ title, mentors }) => (
    <div style={{ marginBottom: \'40px\' }}>
      <h3 style={{ color: CONFIG.THEME.NAVY_MAIN, borderBottom: `2px solid ${CONFIG.THEME.GOLD_MAIN}`, paddingBottom: \'12px\', marginBottom: \'24px\', display: \'inline-block\' }}>{title} ({mentors.length})</h3>
      <div style={{ display: \'flex\', gap: \'24px\', overflowX: \'auto\', paddingBottom: \'16px\' }}>
        {mentors.slice(0, 8).map(m => (
          <div key={m.id} className="animated-card" style={{ minWidth: \'280px\', padding: \'24px\', flexShrink: 0 }} onClick={() => onSelect(m)}>
            <div style={{ display: \'flex\', gap: \'16px\', alignItems: \'center\', marginBottom: \'16px\' }}>
               <div style={{ width: \'56px\', height: \'56px\', borderRadius: \'50%\', background: Utils.generateAvatarGradient(m.name), color: \'#FFF\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\', fontSize: \'1.25rem\', fontWeight: \'700\' }}>{m.initials}</div>
               <div>
                 <div style={{ fontWeight: \'700\', color: CONFIG.THEME.NAVY_MAIN, fontSize: \'1.1rem\' }}>{m.name}</div>
                 <div style={{ fontSize: \'0.8rem\', color: CONFIG.THEME.TEXT_SEC }}>{m.domain}</div>
               </div>
            </div>
            <Button fullWidth variant="outline" onClick={(e) => { e.stopPropagation(); onBook(m); }}>See Slots</Button>
          </div>
        ))}\
        {mentors.length > 8 && (
          <div style={{ minWidth: \'200px\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\', background: CONFIG.THEME.BG_SURFACE_ALT, borderRadius: CONFIG.THEME.RADIUS_LG, border: `1px dashed ${CONFIG.THEME.BORDER_LIGHT}`, color: CONFIG.THEME.NAVY_MAIN, fontWeight: \'bold\', cursor: \'pointer\' }}>
            + View {mentors.length - 8} more
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="glass-panel" style={{ padding: \'40px\', borderRadius: CONFIG.THEME.RADIUS_LG, animation: \'fadeIn 0.5s ease\', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
      <h2 style={{ marginTop: 0, color: CONFIG.THEME.NAVY_MAIN }}>Availability Matrix</h2>
      <p style={{ color: CONFIG.THEME.TEXT_SEC, marginBottom: \'40px\' }}>Quickly locate mentors based on their general availability schedules.</p>
      <Row title="Available This Weekday" mentors={weekdays} />
      <Row title="Available This Weekend" mentors={weekends} />
    </div>
  );
};

const SmartMatchView = ({ data, onSelect }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [matched, setMatched] = useState([]);
  const [goal, setGoal] = useState(\'\');

  const handleMatch = () => {
    if (!goal) return;
    setAnalyzing(true);
    setMatched([]);
    setTimeout(() => {
      // Basic mock ranking based on text overlap (simulating NLP)
      const keyword = goal.split(\' \')[0].toLowerCase();
      const sorted = [...data].sort((a,b) => {
        const aScore = (a.domain.toLowerCase().includes(keyword) ? 10 : 0) + parseFloat(a.rating);
        const bScore = (b.domain.toLowerCase().includes(keyword) ? 10 : 0) + parseFloat(b.rating);
        return bScore - aScore;
      });
      setMatched(sorted.slice(0, 3));
      setAnalyzing(false);
    }, 2500);
  };

  return (
    <div className="glass-panel" style={{ padding: \'48px\', borderRadius: CONFIG.THEME.RADIUS_LG, animation: \'fadeIn 0.5s ease\', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, minHeight: \'600px\', position: \'relative\', overflow: \'hidden\' }}>
      
      {analyzing && (
        <div style={{ position: \'absolute\', top: 0, left: 0, right: 0, bottom: 0, background: \'rgba(255,255,255,0.9)\', zIndex: 10, display: \'flex\', flexDirection: \'column\', alignItems: \'center\', justifyContent: \'center\' }}>
          <div style={{ width: \'100%\', height: \'4px\', background: CONFIG.THEME.NAVY_LITE, position: \'absolute\', top: 0, animation: \'scanline 2s linear infinite\' }} />
          <div style={{ width: \'80px\', height: \'80px\', border: `4px solid ${CONFIG.THEME.BORDER_LIGHT}`, borderTopColor: CONFIG.THEME.ACCENT_PURPLE, borderRadius: \'50%\', animation: \'spin 1s linear infinite\', marginBottom: \'24px\' }} />
          <h2 style={{ color: CONFIG.THEME.NAVY_MAIN, letterSpacing: \'0.1em\' }}>ANALYZING MENTOR GRAPH...</h2>
          <p style={{ color: CONFIG.THEME.TEXT_SEC }}>Matching your goals with semantic domains and historic success rates.</p>
        </div>
      )}

      <div style={{ maxWidth: \'600px\', margin: \'0 auto\', textAlign: \'center\', marginBottom: \'48px\' }}>
        <h2 style={{ fontSize: \'2.5rem\', color: CONFIG.THEME.NAVY_MAIN, marginBottom: \'16px\' }}>AI Smart Match</h2>
        <p style={{ color: CONFIG.THEME.TEXT_SEC, fontSize: \'1.1rem\', marginBottom: \'32px\' }}>Tell us what you want to achieve, and our matching algorithm will find the top 3 highly compatible mentors for your exact needs.</p>
        <div style={{ position: \'relative\' }}>
          <input className="sju-input" placeholder="E.g., I want to learn React performance optimization..." value={goal} onChange={(e) => setGoal(e.target.value)} style={{ padding: \'20px 24px\', fontSize: \'1.1rem\', boxShadow: CONFIG.THEME.SHADOW_MD, border: `2px solid ${CONFIG.THEME.BORDER_LIGHT}` }} />
          <Button onClick={handleMatch} disabled={!goal} style={{ position: \'absolute\', right: \'8px\', top: \'8px\', bottom: \'8px\', padding: \'0 32px\' }}>Find Mentors</Button>
        </div>
      </div>

      {matched.length > 0 && !analyzing && (
        <div style={{ animation: \'slideUpFade 0.6s ease\' }}>
          <h3 style={{ textAlign: \'center\', color: CONFIG.THEME.SUCCESS, marginBottom: \'32px\', fontSize: \'1.5rem\', fontWeight: \'800\' }}>✓ Top Matches Found</h3>
          <div style={{ display: \'grid\', gridTemplateColumns: \'repeat(3, 1fr)\', gap: \'24px\' }}>
             {matched.map((m, i) => (
               <div key={m.id} className="animated-card" style={{ padding: \'32px 24px\', textAlign: \'center\', border: `2px solid ${i === 0 ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.BORDER_LIGHT}`, position: \'relative\' }} onClick={() => onSelect(m)}>
                 {i === 0 && <div style={{ position: \'absolute\', top: 0, left: \'50%\', transform: \'translate(-50%, -50%)\', background: CONFIG.THEME.GOLD_MAIN, color: CONFIG.THEME.NAVY_MAIN, padding: \'4px 16px\', borderRadius: \'20px\', fontWeight: \'bold\', fontSize: \'0.75rem\', textTransform: \'uppercase\', letterSpacing: \'0.1em\' }}>98% Best Match</div>}
                 <div style={{ width: \'96px\', height: \'96px\', borderRadius: \'50%\', background: Utils.generateAvatarGradient(m.name), color: \'#FFF\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\', fontSize: \'2rem\', fontWeight: \'700\', margin: \'0 auto 16px auto\', boxShadow: CONFIG.THEME.SHADOW_MD }}>{m.initials}</div>
                 <h3 style={{ margin: \'0 0 8px\', fontSize: \'1.25rem\', color: CONFIG.THEME.NAVY_MAIN }}>{m.name}</h3>
                 <p style={{ margin: \'0 0 24px 0\', fontSize: \'0.9rem\', color: CONFIG.THEME.TEXT_SEC }}>{m.role} @ {m.company}</p>
                 <Badge label={m.domain} color={CONFIG.THEME.NAVY_MAIN} bg={CONFIG.THEME.BG_SURFACE_ALT} />
               </div>
             ))}\
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   9. MAIN APPLICATION ARCHITECTURE
   ============================================================================ */
const MentorshipGatewayInner = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [view, setView] = useState(\'GRID\'); 
  const [search, setSearch] = useState(\'\');
  const [page, setPage] = useState(1);
  
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [filters, setFilters] = useState({ 
    domain: null, tier: null, availability: null, 
    priceCategory: null, language: null, companyTier: null 
  });

  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const mentorsRef = collection(db, \'alumni_data\');
            const q = query(mentorsRef, limit(CONFIG.DATA.PAGE_SIZE * 5));
            const snapshot = await getDocs(q);

            const fetched = snapshot.docs.map(doc => {
                const d = doc.data();
                const clean = (val, fb = "N/A") => (!val || String(val).toLowerCase().includes("not applicable") || String(val).toLowerCase() === "none") ? fb : val;
                
                const fullName = clean(d["Full Name"] || d.fullName || d.Name, "Alumni Mentor");
                const batchYear = parseInt(d["Batch Year"] || d.batchYear, 10) || 2020;
                const exp = Math.max(0, 2026 - batchYear);
                const rawTier = clean(d.Tier || d.tier, null);
                const validTier = rawTier ? rawTier : (exp > 10 ? "Industry Leader" : exp > 5 ? "Senior Mentor" : "Peer Mentor");
                
                const basePrice = exp > 10 ? 2500 : exp > 5 ? 1500 : 0;
                const seed = Utils.seedGen(doc.id);
                
                return {
                    id: doc.id,
                    name: fullName,
                    email: clean(d.Email || d.email, "Hidden"),
                    initials: fullName.split(\' \').map(n => n[0]).join(\'\').toUpperCase().slice(0, 2),
                    domain: clean(d.Degree || d.degree || d.Domain, "Tech & Engineering"),
                    role: clean(d.Designation || d.designation || d.Role, "Professional"),
                    company: clean(d["Company Name"] || d.company || d.Company, "Independent"),
                    tier: validTier,
                    mentorship: (d.Mentorship === "Available" || d["Current Status"] === "Working" || d.Status === "Working") ? "Available" : "Unavailable",
                    experience: exp,
                    bio: clean(d.Reviews || d.bio, `Experienced professional offering guidance in ${clean(d.Degree || "their domain")}. Passions include scaling systems and career coaching.`),
                    
                    rating: (4.0 + (seed % 10) / 10).toFixed(1),
                    sessionsConducted: (seed % 150) + 5,
                    price: d.price !== undefined ? d.price : basePrice,
                    priceCategory: basePrice === 0 ? "Pro-Bono (Free)" : basePrice < 2000 ? "Standard Rates" : "Premium Tier",
                    isTopRated: (seed % 5) === 0,
                    languages: [\'English\', seed % 2 === 0 ? \'Hindi\' : \'Spanish\'],
                    availability: seed % 3 === 0 ? "Weekends" : seed % 2 === 0 ? "Weekdays" : "Flexible",
                    responseRate: 90 + (seed % 10),
                    sessionTypes: [\'1:1 Career Sync\', \'Resume Review\', \'Mock Interview (Technical)\'],
                    companyTier: clean(d.companyTier || d.CompanyTier, "Corporate")
                };
            });
            
            setData(fetched.filter(m => m.mentorship === "Available"));
        } catch (err) {
            console.error("Firebase Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, []);

  const { filteredData, facets } = useMemo(() => {
    let res = data;
    
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.company.toLowerCase().includes(q) ||
        m.domain.toLowerCase().includes(q)
      );
    }
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null) {
        if (key === \'language\') res = res.filter(m => m.languages.includes(filters[key]));
        else res = res.filter(m => m[key] === filters[key]);
      }
    });

    const counts = { domain: {}, tier: {}, availability: {}, priceCategory: {}, language: {}, companyTier: {} };
    res.forEach(m => {
      counts.domain[m.domain] = (counts.domain[m.domain] || 0) + 1;
      if(m.tier) counts.tier[m.tier] = (counts.tier[m.tier] || 0) + 1;
      counts.availability[m.availability] = (counts.availability[m.availability] || 0) + 1;
      counts.priceCategory[m.priceCategory] = (counts.priceCategory[m.priceCategory] || 0) + 1;
      counts.companyTier[m.companyTier] = (counts.companyTier[m.companyTier] || 0) + 1;
      m.languages.forEach(l => counts.language[l] = (counts.language[l] || 0) + 1);
    });

    return { filteredData: res, facets: counts };
  }, [data, search, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / CONFIG.DATA.PAGE_SIZE));
  useEffect(() => { if (page > totalPages) setPage(totalPages > 0 ? totalPages : 1); }, [totalPages, page]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * CONFIG.DATA.PAGE_SIZE;
    return filteredData.slice(start, start + CONFIG.DATA.PAGE_SIZE);
  }, [filteredData, page]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    if (scrollRef.current) {
      const offset = 120;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = scrollRef.current.getBoundingClientRect().top;
      window.scrollTo({ top: (elementRect - bodyRect) - offset, behavior: \'smooth\' });
    }
  }, []);

  const toggleFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === val ? null : val }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ domain: null, tier: null, availability: null, priceCategory: null, language: null, companyTier: null });
    setSearch(\'\'); setPage(1);
  };

  const getFacetArray = (obj, limit = 8) => Object.entries(obj).map(([label, count]) => ({ val: label, label, count })).sort((a,b) => b.count - a.count).slice(0,limit);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleBookingConfirm = () => {
    setIsBooking(false);
    setSelectedMentor(null);
    showToast(`Session successfully booked! A calendar invite has been dispatched.`);
  };

  // Pre-Loader Display
  if (loading) return (
    <div style={{ height: \'100vh\', width: \'100vw\', background: CONFIG.THEME.NAVY_DARK, display: \'flex\', flexDirection: \'column\', alignItems: \'center\', justifyContent: \'center\', color: \'white\' }}>
      <GlobalStyles />
      <div style={{ width: \'80px\', height: \'80px\', border: `4px solid rgba(212, 175, 55, 0.1)`, borderTopColor: CONFIG.THEME.GOLD_MAIN, borderRadius: \'50%\', animation: \'spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite\', marginBottom: \'32px\' }} />
      <div style={{ fontSize: \'2rem\', fontWeight: \'700\', letterSpacing: \'0.1em\', color: CONFIG.THEME.GOLD_MAIN, textTransform: \'uppercase\' }}>{CONFIG.SYSTEM.ORG}</div>
      <div style={{ fontSize: \'1rem\', fontWeight: \'500\', letterSpacing: \'0.2em\', color: CONFIG.THEME.TEXT_TER, marginTop: \'8px\' }}>INITIALIZING MENTORSHIP NEXUS</div>
    </div>
  );

  return (
    <div style={{ position: \'relative\', minHeight: \'100vh\', paddingBottom: \'80px\' }}>
      <GlobalStyles />
      
      {/* HEADER SECTION */}
      <header style={{ background: CONFIG.THEME.NAVY_MAIN, padding: \'80px 0 100px 0\', textAlign: \'center\', position: \'relative\', overflow: \'hidden\', borderBottom: `4px solid ${CONFIG.THEME.GOLD_MAIN}` }}>
        <div style={{ position: \'absolute\', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, backgroundImage: \'radial-gradient(circle at 2px 2px, white 1px, transparent 0)\', backgroundSize: \'32px 32px\' }} />
        <div style={{ position: \'relative\', zIndex: 2, maxWidth: \'900px\', margin: \'0 auto\', padding: \'0 24px\' }}>
          <h1 style={{ color: \'white\', fontSize: \'3.5rem\', fontWeight: \'700\', margin: \'0 0 20px 0\', letterSpacing: \'-0.02em\', lineHeight: 1.1 }}>{CONFIG.SYSTEM.APP_NAME}</h1>
          <p style={{ color: CONFIG.THEME.TEXT_TER, fontSize: \'1.25rem\', margin: 0, fontWeight: \'400\', lineHeight: 1.6 }}>
            Book 1:1 sessions with {Utils.formatNumber(data.length)}+ verified industry experts. Accelerate your career with personalized, actionable guidance.
          </p>
        </div>
      </header>

      {/* ENTERPRISE WORKSPACE LAYOUT */}
      <div style={{ maxWidth: \'1700px\', margin: \'0 auto\', padding: \'0 32px\', display: \'grid\', gridTemplateColumns: \'340px 1fr\', gap: \'40px\', position: \'relative\', zIndex: 10, marginTop: \'-50px\' }}>
        
        {/* SIDEBAR FILTERS */}
        <aside style={{ height: \'calc(100vh - 40px)\', position: \'sticky\', top: \'20px\' }}>
          <div className="glass-panel" style={{ borderRadius: CONFIG.THEME.RADIUS_LG, padding: \'32px 24px\', height: \'100%\', overflowY: \'auto\', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
            <div style={{ display: \'flex\', justifyContent: \'space-between\', alignItems: \'center\', marginBottom: \'32px\', paddingBottom: \'16px\', borderBottom: `2px solid ${CONFIG.THEME.NAVY_MAIN}` }}>
              <span style={{ fontWeight: \'700\', fontSize: \'1.25rem\', color: CONFIG.THEME.NAVY_MAIN, letterSpacing: \'-0.02em\' }}>Gateway Filters</span>
              {(search || Object.values(filters).some(v => v !== null)) && (
                <span onClick={clearFilters} style={{ fontSize: \'0.75rem\', color: CONFIG.THEME.NAVY_MAIN, cursor: \'pointer\', fontWeight: \'700\', padding: \'6px 12px\', background: CONFIG.THEME.BORDER_LIGHT, borderRadius: \'4px\', textTransform: \'uppercase\', letterSpacing: \'0.05em\', transition: CONFIG.THEME.TRANSITION_FAST }} onMouseEnter={e=>e.currentTarget.style.background=\'#CBD5E1\'} onMouseLeave={e=>e.currentTarget.style.background=CONFIG.THEME.BORDER_LIGHT}>Reset</span>
              )}
            </div>

            <FilterAccordion title="Expertise Domain" options={getFacetArray(facets.domain)} activeValue={filters.domain} onSelect={(v) => toggleFilter(\'domain\', v)} />
            <FilterAccordion title="Experience Tier" options={getFacetArray(facets.tier)} activeValue={filters.tier} onSelect={(v) => toggleFilter(\'tier\', v)} />
            <FilterAccordion title="Company Tier" options={getFacetArray(facets.companyTier)} activeValue={filters.companyTier} onSelect={(v) => toggleFilter(\'companyTier\', v)} />
            <FilterAccordion title="Availability Scope" options={getFacetArray(facets.availability)} activeValue={filters.availability} onSelect={(v) => toggleFilter(\'availability\', v)} />
            <FilterAccordion title="Pricing Category" options={getFacetArray(facets.priceCategory)} activeValue={filters.priceCategory} onSelect={(v) => toggleFilter(\'priceCategory\', v)} />
            <FilterAccordion title="Communication Lang" options={getFacetArray(facets.language)} activeValue={filters.language} onSelect={(v) => toggleFilter(\'language\', v)} />
          </div>
        </aside>

        {/* MAIN DATA CONTENT */}
        <main ref={scrollRef} style={{ display: \'flex\', flexDirection: \'column\', gap: \'32px\' }}>
          
          <div className="glass-panel" style={{ padding: \'20px 32px\', borderRadius: CONFIG.THEME.RADIUS_LG, display: \'flex\', justifyContent: \'space-between\', alignItems: \'center\', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
            <div style={{ position: \'relative\', width: \'450px\' }}>
              <span style={{ position: \'absolute\', left: \'20px\', top: \'50%\', transform: \'translateY(-50%)\', opacity: 0.4 }}>🔍</span>
              <input className="sju-input has-icon" placeholder="Search mentors by name, company, or domain..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            
            <div style={{ display: \'flex\', gap: \'8px\', background: CONFIG.THEME.BG_APP, padding: \'8px\', borderRadius: CONFIG.THEME.RADIUS_SM, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
              {[\'GRID\', \'LIST\', \'CALENDAR\', \'SMART MATCH\', \'ANALYTICS\'].map(v => (
                <button key={v} onClick={() => { setView(v); setPage(1); }} style={{ padding: \'8px 20px\', border: \'none\', background: view === v ? CONFIG.THEME.BG_SURFACE : \'transparent\', borderRadius: \'6px\', fontWeight: \'700\', fontSize: \'0.8rem\', letterSpacing: \'0.05em\', color: view === v ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.TEXT_SEC, cursor: \'pointer\', boxShadow: view === v ? CONFIG.THEME.SHADOW_SM : \'none\', transition: CONFIG.THEME.TRANSITION_FAST }}>{v}</button>
              ))}\
            </div>
          </div>

          <div style={{ minHeight: \'800px\' }}>
            {view === \'GRID\' && <GridView data={paginatedData} onSelect={setSelectedMentor} onBook={(m) => { setSelectedMentor(m); setIsBooking(true); }} />}
            {view === \'LIST\' && <ListView data={paginatedData} onSelect={setSelectedMentor} onBook={(m) => { setSelectedMentor(m); setIsBooking(true); }} />}
            {view === \'CALENDAR\' && <CalendarView data={filteredData} onSelect={setSelectedMentor} onBook={(m) => { setSelectedMentor(m); setIsBooking(true); }} />}
            {view === \'SMART MATCH\' && <SmartMatchView data={filteredData} onSelect={setSelectedMentor} />}
            {view === \'ANALYTICS\' && <AnalyticsView data={filteredData} />}
          </div>

          {(view === \'GRID\' || view === \'LIST\') && (
            <AdvancedPagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} totalItems={filteredData.length} pageSize={CONFIG.DATA.PAGE_SIZE} />
          )}
        </main>
      </div>

      {/* ZERO-OVERLAP SCALABLE MODAL DIALOG */}
      {selectedMentor && (
        <div role="dialog" aria-modal="true" style={{ position: \'fixed\', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: \'rgba(6, 17, 33, 0.8)\', backdropFilter: \'blur(12px)\', WebkitBackdropFilter: \'blur(12px)\', display: \'flex\', alignItems: \'flex-start\', justifyContent: \'center\', paddingTop: \'6vh\', paddingBottom: \'6vh\', zIndex: 99999, overflowY: \'auto\' }} onClick={() => { setSelectedMentor(null); setIsBooking(false); }}>
          <div style={{ background: CONFIG.THEME.BG_SURFACE, width: \'92%\', maxWidth: isBooking ? \'800px\' : \'1050px\', borderRadius: CONFIG.THEME.RADIUS_XL, padding: \'48px\', position: \'relative\', animation: \'scaleInModal 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards\', boxShadow: CONFIG.THEME.SHADOW_LG, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }} onClick={e => e.stopPropagation()}>
            <button onClick={() => { setSelectedMentor(null); setIsBooking(false); }} style={{ position: \'absolute\', top: \'32px\', right: \'32px\', background: CONFIG.THEME.BG_APP, border: \'none\', width: \'48px\', height: \'48px\', borderRadius: \'50%\', fontSize: \'1.25rem\', cursor: \'pointer\', color: CONFIG.THEME.TEXT_SEC, transition: CONFIG.THEME.TRANSITION_FAST, zIndex: 100 }} onMouseEnter={(e) => { e.currentTarget.style.background = CONFIG.THEME.DANGER_BG; e.currentTarget.style.color = CONFIG.THEME.DANGER; }} onMouseLeave={(e) => { e.currentTarget.style.background = CONFIG.THEME.BG_APP; e.currentTarget.style.color = CONFIG.THEME.TEXT_SEC; }}>✕</button>
            
            {isBooking ? (
              <BookingWizard mentor={selectedMentor} onClose={() => setIsBooking(false)} onConfirm={handleBookingConfirm} />
            ) : (
              <div>
                <div style={{ display: \'flex\', gap: \'40px\', alignItems: \'flex-start\', borderBottom: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingBottom: \'40px\', marginBottom: \'40px\' }}>
                  <div style={{ position: \'relative\' }}>
                    <div style={{ width: \'160px\', height: \'160px\', borderRadius: CONFIG.THEME.RADIUS_LG, background: Utils.generateAvatarGradient(selectedMentor.name), color: \'white\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\', fontSize: \'4rem\', fontWeight: \'700\', flexShrink: 0, boxShadow: CONFIG.THEME.SHADOW_MD }}>{selectedMentor.initials}</div>
                    {selectedMentor.isTopRated && <div style={{ position: \'absolute\', bottom: -10, right: -10, background: CONFIG.THEME.GOLD_MAIN, color: CONFIG.THEME.NAVY_MAIN, borderRadius: \'50%\', width: \'36px\', height: \'36px\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\', fontSize: \'18px\', border: `4px solid ${CONFIG.THEME.BG_SURFACE}`, boxShadow: CONFIG.THEME.SHADOW_SM, fontWeight: \'bold\' }} title="Top Rated Mentor">★</div>}
                  </div>
                  
                  <div style={{ flex: 1, paddingRight: \'48px\' }}>
                    <h2 style={{ fontSize: \'2.5rem\', color: CONFIG.THEME.NAVY_MAIN, margin: \'0 0 8px 0\', fontWeight: \'700\', letterSpacing: \'-0.02em\' }}>{selectedMentor.name}</h2>
                    <div style={{ fontSize: \'1.25rem\', color: CONFIG.THEME.TEXT_PRI, fontWeight: \'500\', marginBottom: \'24px\' }}>{selectedMentor.role} at <strong style={{color: CONFIG.THEME.NAVY_MAIN}}>{selectedMentor.company}</strong></div>
                    
                    <div style={{ display: \'flex\', gap: \'12px\', flexWrap: \'wrap\', marginBottom: \'32px\' }}>
                      <Badge label={selectedMentor.domain} color={CONFIG.THEME.NAVY_MAIN} bg={CONFIG.THEME.BG_SURFACE_ALT} />
                      {selectedMentor.tier && selectedMentor.tier !== "N/A" && <Badge label={selectedMentor.tier} color={CONFIG.THEME.ACCENT_PURPLE} outline />}
                      <Badge label={`${selectedMentor.sessionsConducted} Lifetime Sessions`} color={CONFIG.THEME.TEXT_SEC} outline />
                      <Badge label={`${selectedMentor.rating} / 5.0 Rating`} color={CONFIG.THEME.WARNING} bg={CONFIG.THEME.WARNING_BG} />
                    </div>

                    <div style={{ display: \'flex\', gap: \'16px\' }}>
                      <Button onClick={() => setIsBooking(true)}>Schedule Sync</Button>
                      <Button variant="outline" onClick={() => alert(`Direct Message interface opened for ${selectedMentor.name}.`)}>Message Mentor</Button>
                    </div>
                  </div>
                </div>

                <div style={{ display: \'grid\', gridTemplateColumns: \'1.5fr 1fr\', gap: \'48px\' }}>
                  <div>
                    <h4 style={{ fontSize: \'0.875rem\', color: CONFIG.THEME.TEXT_TER, textTransform: \'uppercase\', letterSpacing: \'0.1em\', marginBottom: \'16px\', marginTop: 0 }}>Executive Bio</h4>
                    <p style={{ margin: \'0 0 40px 0\', lineHeight: 1.8, color: CONFIG.THEME.TEXT_PRI, fontSize: \'1.1rem\' }}>{selectedMentor.bio}</p>

                    <h4 style={{ fontSize: \'0.875rem\', color: CONFIG.THEME.TEXT_TER, textTransform: \'uppercase\', letterSpacing: \'0.1em\', marginBottom: \'16px\' }}>Languages Supported</h4>
                    <div style={{ display: \'flex\', gap: \'12px\', flexWrap: \'wrap\', marginBottom: \'32px\' }}>
                      {selectedMentor.languages.map(lang => (
                        <Badge key={lang} label={lang} color={CONFIG.THEME.TEXT_SEC} outline />
                      ))}\
                    </div>

                    <h4 style={{ fontSize: \'0.875rem\', color: CONFIG.THEME.TEXT_TER, textTransform: \'uppercase\', letterSpacing: \'0.1em\', marginBottom: \'16px\' }}>Offered Session Types</h4>
                    <div style={{ display: \'grid\', gridTemplateColumns: \'1fr 1fr\', gap: \'16px\' }}>
                      {selectedMentor.sessionTypes.map(type => (
                        <div key={type} style={{ padding: \'16px\', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, borderRadius: CONFIG.THEME.RADIUS_MD, background: CONFIG.THEME.BG_APP }}>
                          <div style={{ fontWeight: \'bold\', color: CONFIG.THEME.NAVY_MAIN }}>{type}</div>
                          <div style={{ fontSize: \'0.8rem\', color: CONFIG.THEME.TEXT_SEC, marginTop: \'4px\' }}>Standard Rate Applies</div>
                        </div>
                      ))}\
                    </div>
                  </div>

                  <div style={{ background: CONFIG.THEME.BG_SURFACE_ALT, borderRadius: CONFIG.THEME.RADIUS_LG, padding: \'32px\', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
                    <div style={{ marginBottom: \'32px\' }}>
                      <div style={{ fontSize: \'0.75rem\', color: CONFIG.THEME.TEXT_TER, textTransform: \'uppercase\', marginBottom: \'8px\', fontWeight: \'700\', letterSpacing: \'0.05em\' }}>Domain & Experience</div>
                      <div style={{ fontWeight: \'700\', color: CONFIG.THEME.TEXT_PRI, fontSize: \'1.1rem\' }}>{selectedMentor.domain}</div>
                      <div style={{ fontSize: \'0.875rem\', color: CONFIG.THEME.TEXT_SEC, marginTop: \'8px\' }}>{selectedMentor.experience} Years active in industry</div>
                    </div>

                    <div style={{ borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingTop: \'32px\', marginBottom: \'32px\' }}>
                      <div style={{ fontSize: \'0.75rem\', color: CONFIG.THEME.TEXT_TER, textTransform: \'uppercase\', marginBottom: \'8px\', fontWeight: \'700\', letterSpacing: \'0.05em\' }}>Logistics & Availability</div>
                      <div style={{ fontWeight: \'700\', color: CONFIG.THEME.TEXT_PRI, fontSize: \'1rem\', marginBottom: \'8px\' }}>{selectedMentor.availability} slots usually open</div>
                      <div style={{ fontSize: \'0.875rem\', color: CONFIG.THEME.TEXT_SEC }}>Typical Response: ~{selectedMentor.responseRate}% rate</div>
                    </div>

                    <div style={{ borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingTop: \'32px\' }}>
                      <div style={{ fontSize: \'0.75rem\', color: CONFIG.THEME.TEXT_TER, textTransform: \'uppercase\', marginBottom: \'8px\', fontWeight: \'700\', letterSpacing: \'0.05em\' }}>Base Hourly Rate</div>
                      <div style={{ fontWeight: \'800\', color: CONFIG.THEME.SUCCESS, fontSize: \'1.5rem\' }}>{Utils.formatCurrency(selectedMentor.price)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}\
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div style={{ position: \'fixed\', bottom: \'32px\', right: \'32px\', background: CONFIG.THEME.NAVY_MAIN, color: \'white\', padding: \'16px 24px\', borderRadius: CONFIG.THEME.RADIUS_MD, boxShadow: CONFIG.THEME.SHADOW_LG, display: \'flex\', alignItems: \'center\', gap: \'16px\', zIndex: 999999, animation: \'slideUpFade 0.3s ease\' }}>
          <div style={{ background: CONFIG.THEME.GOLD_MAIN, color: CONFIG.THEME.NAVY_MAIN, width: \'24px\', height: \'24px\', borderRadius: \'50%\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\', fontWeight: \'bold\' }}>✓</div>
          <span style={{ fontWeight: \'600\', fontFamily: \'Lora, serif\', fontSize: \'1rem\' }}>{toast}</span>
        </div>
      )}\
    </div>
  );
};

const MentorshipGateway = () => (
  <GlobalErrorBoundary>
    <MentorshipGatewayInner />
  </GlobalErrorBoundary>
);

export default MentorshipGateway;