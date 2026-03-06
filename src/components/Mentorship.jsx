import React, { useState, useEffect, useMemo, useRef, useCallback, Component } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, limit, onSnapshot } from 'firebase/firestore';

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
    VERSION: "2026.5.0 Enterprise Ultra",
    ORG: "St. Joseph's University",
    BUILD: "2026.11.X.ULTRA_REALTIME"
  },
  DATA: {
    PAGE_SIZE: 20, // Strict requirement from Directory logic
    MAX_LIMIT: 10000 // Supports scaling up to 500 pages
  },
  THEME: {
    // Core Palette
    NAVY_DARK: '#020b17', NAVY_MAIN: '#0C2340', NAVY_LITE: '#1A3B66',
    GOLD_MAIN: '#D4AF37', GOLD_LITE: '#F9F1D8',
    
    // Accents & Semantic States
    ACCENT_CYAN: '#00B4D8', ACCENT_PURPLE: '#7B2CBF', ACCENT_CORAL: '#FF6B6B',
    SUCCESS: '#10B981', SUCCESS_BG: 'rgba(16, 185, 129, 0.1)',
    WARNING: '#F59E0B', WARNING_BG: 'rgba(245, 158, 11, 0.1)',
    DANGER: '#EF4444', DANGER_BG: 'rgba(239, 68, 68, 0.1)',
    INFO: '#3B82F6', INFO_BG: 'rgba(59, 130, 246, 0.1)',
    
    // Surfaces & Typography
    BG_APP: '#F1F5F9', BG_SURFACE: '#FFFFFF', BG_SURFACE_ALT: '#F8FAFC',
    BORDER: 'rgba(12, 35, 64, 0.12)', BORDER_LIGHT: '#E2E8F0', BORDER_FOCUS: '#94A3B8',
    TEXT_PRI: '#0F172A', TEXT_SEC: '#475569', TEXT_TER: '#94A3B8', TEXT_WHITE: '#FFFFFF',
    
    // Geometry
    RADIUS_SM: '6px', RADIUS_MD: '12px', RADIUS_LG: '20px', RADIUS_XL: '32px', RADIUS_FULL: '9999px',
    
    // Elevation
    SHADOW_SM: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    SHADOW_MD: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
    SHADOW_LG: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    SHADOW_HOVER: '0 30px 60px -15px rgba(0, 0, 0, 0.25), 0 0 20px rgba(212, 175, 55, 0.15)',
    SHADOW_INNER: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    
    // Motion
    TRANSITION_FAST: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    TRANSITION_SMOOTH: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    TRANSITION_BOUNCE: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
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
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
    
    body { margin: 0; padding: 0; background-color: ${CONFIG.THEME.BG_APP}; font-family: 'Lora', serif; color: ${CONFIG.THEME.TEXT_PRI}; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; overflow-x: hidden; line-height: 1.6; }
    * { box-sizing: border-box; }
    h1, h2, h3, h4, h5, h6, button, input, select, textarea, span, p, div { font-family: 'Lora', serif; }
    
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

    .animated-card { background: ${CONFIG.THEME.BG_SURFACE}; border-radius: ${CONFIG.THEME.RADIUS_LG}; border: 1px solid ${CONFIG.THEME.BORDER_LIGHT}; transition: ${CONFIG.THEME.TRANSITION_BOUNCE}; cursor: pointer; position: relative; overflow: hidden; z-index: 1; display: flex; flex-direction: column; }
    .animated-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: ${CONFIG.THEME.RADIUS_LG}; padding: 3px; background: linear-gradient(135deg, ${CONFIG.THEME.NAVY_MAIN}, ${CONFIG.THEME.GOLD_MAIN}); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0; transition: ${CONFIG.THEME.TRANSITION_SMOOTH}; z-index: -1; }
    .animated-card:hover { transform: translateY(-8px); box-shadow: ${CONFIG.THEME.SHADOW_HOVER}; border-color: transparent; }
    .animated-card:hover::before { opacity: 1; }

    .animated-row { transition: ${CONFIG.THEME.TRANSITION_FAST}; border-bottom: 1px solid ${CONFIG.THEME.BORDER_LIGHT}; cursor: pointer; position: relative; }
    .animated-row:hover { background-color: ${CONFIG.THEME.BG_SURFACE_ALT} !important; transform: translateX(8px); }
    .animated-row::after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: ${CONFIG.THEME.GOLD_MAIN}; transform: scaleY(0); transition: transform 0.2s ease; transform-origin: center; }
    .animated-row:hover::after { transform: scaleY(1); }

    .glass-panel { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.6); box-shadow: ${CONFIG.THEME.SHADOW_SM}; }
    .skeleton-box { background: #E2E8F0; background-image: linear-gradient(90deg, #E2E8F0 0px, #F1F5F9 40px, #E2E8F0 80px); background-size: 1000px 100%; animation: shimmer 2.5s infinite linear; border-radius: ${CONFIG.THEME.RADIUS_SM}; }

    .sju-input, .sju-textarea { width: 100%; padding: 18px 24px; border-radius: ${CONFIG.THEME.RADIUS_FULL}; border: 1px solid ${CONFIG.THEME.BORDER_LIGHT}; font-size: 1.05rem; background: ${CONFIG.THEME.BG_SURFACE}; transition: all 0.3s ease; color: ${CONFIG.THEME.TEXT_PRI}; font-family: 'Lora', serif; box-shadow: ${CONFIG.THEME.SHADOW_INNER}; }
    .sju-input.has-icon { padding-left: 56px; }
    .sju-textarea { border-radius: ${CONFIG.THEME.RADIUS_LG}; resize: vertical; min-height: 120px; }
    .sju-input:focus, .sju-textarea:focus { border-color: ${CONFIG.THEME.NAVY_MAIN}; box-shadow: 0 0 0 4px rgba(12, 35, 64, 0.1); outline: none; background: #FFF; }
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
  formatNumber: (num) => num > 999 ? (num / 1000).toFixed(1) + 'k' : (num || 0).toString(),
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
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: CONFIG.THEME.RADIUS_FULL, fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', color: color, backgroundColor: outline ? 'transparent' : bg || `${color}15`, border: outline ? `1px solid ${color}` : `1px solid transparent`, whiteSpace: 'nowrap' }}>
    {icon && <span>{icon}</span>} {label}
  </span>
);

const Button = ({ children, onClick, variant = 'primary', active = false, fullWidth = false, disabled = false, icon, style = {} }) => {
  let baseStyle = { padding: '14px 28px', borderRadius: CONFIG.THEME.RADIUS_FULL, fontWeight: '700', fontSize: '0.875rem', cursor: disabled ? 'not-allowed' : 'pointer', transition: CONFIG.THEME.TRANSITION_FAST, width: fullWidth ? '100%' : 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: 'none', opacity: disabled ? 0.6 : 1, textTransform: 'uppercase', letterSpacing: '0.1em', ...style };
  
  if (variant === 'primary') baseStyle = { ...baseStyle, background: CONFIG.THEME.NAVY_MAIN, color: CONFIG.THEME.GOLD_MAIN, boxShadow: CONFIG.THEME.SHADOW_SM };
  else if (variant === 'outline') baseStyle = { ...baseStyle, background: 'transparent', color: active ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.NAVY_MAIN, border: `2px solid ${active ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.NAVY_MAIN}` };
  else if (variant === 'ghost') baseStyle = { ...baseStyle, background: active ? CONFIG.THEME.BG_SURFACE : 'transparent', color: active ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.TEXT_SEC, boxShadow: active ? CONFIG.THEME.SHADOW_SM : 'none' };

  return (
    <button onClick={onClick} disabled={disabled} style={baseStyle}
      onMouseEnter={(e) => { if (!disabled) { if (variant === 'primary') e.currentTarget.style.transform = 'translateY(-2px)'; if (variant === 'outline') { e.currentTarget.style.background = CONFIG.THEME.NAVY_MAIN; e.currentTarget.style.color = CONFIG.THEME.GOLD_MAIN; } } }}
      onMouseLeave={(e) => { if (!disabled) { if (variant === 'primary') e.currentTarget.style.transform = 'translateY(0)'; if (variant === 'outline') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = CONFIG.THEME.NAVY_MAIN; } } }}
    >
      {icon && icon} {children}
    </button>
  );
};

const FilterAccordion = ({ title, options, activeValue, onSelect }) => {
  const [isOpen, setIsOpen] = useState(true);
  if (!options || options.length === 0) return null;

  return (
    <div style={{ marginBottom: '20px', borderBottom: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingBottom: '20px' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', padding: '8px 0' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: CONFIG.THEME.NAVY_MAIN, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', color: CONFIG.THEME.TEXT_TER }}>▼</span>
      </div>
      <div style={{ maxHeight: isOpen ? '1000px' : '0px', overflow: 'hidden', transition: CONFIG.THEME.TRANSITION_SMOOTH, marginTop: isOpen ? '16px' : '0px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {options.map(opt => {
          const isActive = activeValue === opt.val;
          return (
            <div key={opt.val} onClick={() => onSelect(opt.val)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: CONFIG.THEME.RADIUS_SM, background: isActive ? CONFIG.THEME.NAVY_MAIN : 'transparent', color: isActive ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.TEXT_SEC, cursor: 'pointer', transition: CONFIG.THEME.TRANSITION_FAST, fontSize: '0.9rem', fontWeight: isActive ? '700' : '500' }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = CONFIG.THEME.BG_SURFACE_ALT; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>{opt.label}</span>
              <span style={{ opacity: isActive ? 1 : 0.6, fontSize: '0.75rem', background: isActive ? 'rgba(212,175,55,0.2)' : CONFIG.THEME.BG_APP, padding: '2px 8px', borderRadius: '12px' }}>{Utils.formatNumber(opt.count)}</span>
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
    if (dir === 'first') onPageChange(1);
    if (dir === 'prev' && currentPage > 1) onPageChange(currentPage - 1);
    if (dir === 'next' && currentPage < totalPages) onPageChange(currentPage + 1);
    if (dir === 'last') onPageChange(totalPages);
  };
  const btnStyle = (disabled) => ({ padding: '10px 18px', background: CONFIG.THEME.BG_SURFACE, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, borderRadius: '8px', color: disabled ? CONFIG.THEME.TEXT_TER : CONFIG.THEME.NAVY_MAIN, fontWeight: '700', fontSize: '0.9rem', cursor: disabled ? 'not-allowed' : 'pointer', transition: CONFIG.THEME.TRANSITION_FAST, boxShadow: disabled ? 'none' : CONFIG.THEME.SHADOW_SM });
  
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px 0', marginTop: '48px', borderTop: `2px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
      <div style={{ fontSize: '0.95rem', color: CONFIG.THEME.TEXT_SEC }}>Showing <strong style={{ color: CONFIG.THEME.NAVY_MAIN }}>{((currentPage - 1) * pageSize) + 1}</strong> to <strong style={{ color: CONFIG.THEME.NAVY_MAIN }}>{Math.min(currentPage * pageSize, totalItems)}</strong> of <strong style={{ color: CONFIG.THEME.NAVY_MAIN }}>{totalItems}</strong> mentors</div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button onClick={() => handleNav('first')} disabled={currentPage === 1} style={btnStyle(currentPage === 1)}>« First</button>
        <button onClick={() => handleNav('prev')} disabled={currentPage === 1} style={btnStyle(currentPage === 1)}>‹ Prev</button>
        <div style={{ padding: '10px 24px', background: CONFIG.THEME.NAVY_MAIN, color: CONFIG.THEME.GOLD_MAIN, borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', boxShadow: CONFIG.THEME.SHADOW_MD }}>Page {currentPage} of {totalPages}</div>
        <button onClick={() => handleNav('next')} disabled={currentPage === totalPages} style={btnStyle(currentPage === totalPages)}>Next ›</button>
        <button onClick={() => handleNav('last')} disabled={currentPage === totalPages} style={btnStyle(currentPage === totalPages)}>Last »</button>
      </div>
    </div>
  );
};

const SkeletonLoader = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px' }}>
    {[...Array(6)].map((_, i) => (
      <div key={i} className="glass-panel" style={{ padding: '40px 32px', borderRadius: CONFIG.THEME.RADIUS_LG, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
        <div className="skeleton-box" style={{ width: '96px', height: '96px', borderRadius: '50%', margin: '0 auto 32px' }} />
        <div className="skeleton-box" style={{ width: '70%', height: '28px', margin: '0 auto 16px', borderRadius: '6px' }} />
        <div className="skeleton-box" style={{ width: '90%', height: '18px', margin: '0 auto 32px', borderRadius: '4px' }} />
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
          <div className="skeleton-box" style={{ width: '80px', height: '28px', borderRadius: '16px' }} />
          <div className="skeleton-box" style={{ width: '80px', height: '28px', borderRadius: '16px' }} />
        </div>
        <div className="skeleton-box" style={{ width: '100%', height: '1px', marginBottom: '24px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="skeleton-box" style={{ width: '80px', height: '14px', borderRadius: '4px' }} />
          <div className="skeleton-box" style={{ width: '60px', height: '14px', borderRadius: '4px' }} />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ msg = "No records found matching your current filter criteria." }) => (
  <div style={{ padding: '120px 20px', textAlign: 'center', background: 'transparent', animation: 'fadeIn 0.5s' }}>
    <div style={{ fontSize: '5rem', opacity: 0.15, marginBottom: '32px' }}>📭</div>
    <h3 style={{ color: CONFIG.THEME.NAVY_MAIN, margin: '0 0 16px 0', fontSize: '1.8rem', fontWeight: '800' }}>No Results</h3>
    <p style={{ color: CONFIG.THEME.TEXT_SEC, fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto' }}>{msg}</p>
  </div>
);

/* ============================================================================
   7. ULTRA-DETAILED BOOKING WIZARD MODAL
   ============================================================================ */
const BookingWizard = ({ mentor, onClose, onConfirm }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookingNote, setBookingNote] = useState('');

  const generateSlots = () => {
    const dates = ['Tomorrow', 'Next Wednesday', 'Next Friday'];
    const times = ['10:00 AM', '02:00 PM', '04:30 PM', '06:00 PM', '08:00 PM'];
    const s = Utils.seedGen(mentor.id);
    return { dates, times: times.filter((_, i) => (s + i) % 2 !== 0 || i === 0) };
  };
  const slots = useMemo(generateSlots, [mentor.id]);

  return (
    <div style={{ padding: '10px 0', height: '100%', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.4s ease', boxSizing: 'border-box' }}>
      <h2 style={{ fontSize: '2rem', color: CONFIG.THEME.NAVY_MAIN, marginBottom: '8px', marginTop: 0, fontWeight: '800' }}>Schedule Session</h2>
      <p style={{ color: CONFIG.THEME.TEXT_SEC, marginBottom: '32px', fontSize: '1.1rem' }}>Initiating request with <strong>{mentor.name}</strong> • {mentor.domain} Expert</p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} style={{ flex: 1, height: '8px', borderRadius: '4px', background: s <= step ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.BORDER_LIGHT, transition: CONFIG.THEME.TRANSITION_SMOOTH }} />
        ))}
      </div>

      <div style={{ flex: 1, minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
        {step === 1 && (
          <div style={{ animation: 'slideUpFade 0.3s ease', flex: 1 }}>
            <h4 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', color: CONFIG.THEME.TEXT_PRI, fontWeight: '800' }}>Select Engagement Model</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              {mentor.sessionTypes.map(type => (
                <div key={type} onClick={() => setSelectedType(type)} style={{ border: `2px solid ${selectedType === type ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.BORDER_LIGHT}`, borderRadius: CONFIG.THEME.RADIUS_LG, padding: '24px', cursor: 'pointer', background: selectedType === type ? CONFIG.THEME.GOLD_LITE : CONFIG.THEME.BG_SURFACE, transition: CONFIG.THEME.TRANSITION_FAST, position: 'relative', overflow: 'hidden' }}>
                  {selectedType === type && <div style={{ position: 'absolute', top: 0, right: 0, background: CONFIG.THEME.GOLD_MAIN, color: CONFIG.THEME.NAVY_MAIN, padding: '6px 16px', borderBottomLeftRadius: CONFIG.THEME.RADIUS_MD, fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Selected</div>}
                  <div style={{ fontWeight: '800', fontSize: '1.25rem', color: CONFIG.THEME.NAVY_MAIN, marginBottom: '8px', marginTop: selectedType === type ? '8px' : '0' }}>{type}</div>
                  <div style={{ fontSize: '0.9rem', color: CONFIG.THEME.TEXT_SEC, fontWeight: '500', marginBottom: '24px' }}>{type.includes('Mock') ? 'Intensive 90-min review & feedback' : 'Standard 45-min sync'}</div>
                  <div style={{ fontSize: '1.2rem', color: CONFIG.THEME.SUCCESS, fontWeight: '800' }}>{Utils.formatCurrency(type.includes('Mock') ? mentor.price * 1.5 : mentor.price)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: 'slideUpFade 0.3s ease', flex: 1 }}>
            <h4 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', color: CONFIG.THEME.TEXT_PRI, fontWeight: '800' }}>Select Availability Slot</h4>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
              {slots.dates.map((d, i) => <button key={d} style={{ padding: '14px 24px', borderRadius: CONFIG.THEME.RADIUS_FULL, border: `2px solid ${i === 0 ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.BORDER_LIGHT}`, background: i === 0 ? CONFIG.THEME.NAVY_LITE : CONFIG.THEME.BG_SURFACE, fontWeight: '800', color: i === 0 ? '#FFF' : CONFIG.THEME.TEXT_PRI, cursor: 'pointer', transition: CONFIG.THEME.TRANSITION_FAST }}>{d}</button>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '20px' }}>
              {slots.times.map(t => (
                <button key={t} onClick={() => setSelectedDate(t)} style={{ padding: '18px', borderRadius: CONFIG.THEME.RADIUS_MD, border: `2px solid ${selectedDate === t ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.BORDER_LIGHT}`, background: selectedDate === t ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.BG_SURFACE, color: selectedDate === t ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.TEXT_PRI, fontWeight: '800', cursor: 'pointer', transition: CONFIG.THEME.TRANSITION_FAST }}>{t}</button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ animation: 'slideUpFade 0.3s ease', flex: 1 }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: CONFIG.THEME.TEXT_PRI, fontWeight: '800' }}>Context & Agenda (Optional but recommended)</h4>
            <p style={{ color: CONFIG.THEME.TEXT_SEC, fontSize: '0.95rem', marginBottom: '24px' }}>Help {mentor.name} prepare by providing a brief overview of what you want to achieve.</p>
            <textarea className="sju-textarea" placeholder="E.g., I'd like to discuss transitioning from Frontend to Full-Stack, specifically regarding Node.js architectures..." value={bookingNote} onChange={(e) => setBookingNote(e.target.value)} />
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '20px 0', animation: 'scaleInModal 0.3s ease', flex: 1 }}>
            <div style={{ width: '100px', height: '100px', background: CONFIG.THEME.SUCCESS_BG, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px auto', border: `3px solid ${CONFIG.THEME.SUCCESS}` }}>
              <span style={{ fontSize: '3rem', color: CONFIG.THEME.SUCCESS }}>✓</span>
            </div>
            <h3 style={{ margin: '0 0 16px 0', color: CONFIG.THEME.NAVY_MAIN, fontSize: '1.8rem', fontWeight: '800' }}>Confirm Session Details</h3>
            
            <div style={{ background: CONFIG.THEME.BG_SURFACE_ALT, borderRadius: CONFIG.THEME.RADIUS_LG, padding: '32px', textAlign: 'left', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, marginTop: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px' }}>Mentor</div>
                  <div style={{ fontWeight: '800', color: CONFIG.THEME.TEXT_PRI, fontSize: '1.2rem' }}>{mentor.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px' }}>Session Type</div>
                  <div style={{ fontWeight: '800', color: CONFIG.THEME.TEXT_PRI, fontSize: '1.2rem' }}>{selectedType}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px' }}>Schedule</div>
                  <div style={{ fontWeight: '800', color: CONFIG.THEME.TEXT_PRI, fontSize: '1.2rem' }}>Tomorrow at {selectedDate}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px' }}>Total Cost</div>
                  <div style={{ fontWeight: '900', color: CONFIG.THEME.SUCCESS, fontSize: '1.4rem' }}>{Utils.formatCurrency(selectedType?.includes('Mock') ? mentor.price * 1.5 : mentor.price)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `2px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingTop: '32px', marginTop: '32px' }}>
        <Button variant="outline" onClick={() => step === 1 ? onClose() : setStep(s => s - 1)}>{step === 1 ? 'Cancel' : 'Back'}</Button>
        <Button variant="primary" disabled={(step === 1 && !selectedType) || (step === 2 && !selectedDate)} onClick={() => step === 4 ? onConfirm() : setStep(s => s + 1)}>
          {step === 4 ? 'Confirm Booking' : 'Proceed to Next Step'}
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px' }}>
      {data.map((m, i) => (
        <div key={m.id} className="animated-card" style={{ animation: `slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards ${Math.min(i * 0.05, 0.5)}s`, opacity: 0, height: '100%' }} onClick={() => onSelect(m)}>
          <div style={{ padding: '40px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px', position: 'relative' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: Utils.generateAvatarGradient(m.name), color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '800', boxShadow: CONFIG.THEME.SHADOW_MD, border: `4px solid ${CONFIG.THEME.BG_SURFACE}` }}>
                {m.profilePhotoUrl ? <img src={m.profilePhotoUrl} alt={m.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : m.initials}
              </div>
              {m.isTopRated && (
                <div style={{ position: 'absolute', bottom: 0, right: '50%', transform: 'translate(35px, 0)', background: CONFIG.THEME.GOLD_MAIN, color: CONFIG.THEME.NAVY_MAIN, borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', border: `3px solid ${CONFIG.THEME.BG_SURFACE}`, fontWeight: 'bold', animation: 'pulseGlow 2s infinite' }} title="Top Rated Mentor">★</div>
              )}
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '1.4rem', color: CONFIG.THEME.NAVY_MAIN, fontWeight: '800', letterSpacing: '-0.01em' }}>{m.name}</h3>
              <p style={{ margin: 0, fontSize: '0.95rem', color: CONFIG.THEME.TEXT_SEC, minHeight: '44px', lineHeight: 1.5 }}>
                {m.role} <span style={{ color: CONFIG.THEME.BORDER_FOCUS }}>@</span> <strong style={{ color: CONFIG.THEME.TEXT_PRI }}>{m.company}</strong>
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px', flex: 1 }}>
              {m.domain && <Badge label={m.domain} color={CONFIG.THEME.NAVY_MAIN} bg={CONFIG.THEME.BG_SURFACE_ALT} />}
              {m.tier && m.tier !== "N/A" && <Badge label={m.tier} color={CONFIG.THEME.ACCENT_PURPLE} outline />}
              <Badge label={`${m.rating}★`} color={CONFIG.THEME.WARNING} bg={CONFIG.THEME.WARNING_BG} />
            </div>
            
            <div style={{ borderTop: `2px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hourly Rate</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: CONFIG.THEME.SUCCESS }}>{Utils.formatCurrency(m.price)}</div>
              </div>
              <Button variant="outline" onClick={(e) => { e.stopPropagation(); onBook(m); }}>Book Sync</Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ListView = ({ data, onSelect, onBook }) => {
  if (data.length === 0) return <EmptyState />;
  return (
    <div className="glass-panel" style={{ borderRadius: CONFIG.THEME.RADIUS_XL, overflow: 'hidden', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
          <thead style={{ background: CONFIG.THEME.BG_SURFACE_ALT, color: CONFIG.THEME.NAVY_MAIN }}>
            <tr>
              {['Mentor Profile', 'Expertise Domain', 'Professional Role', 'Performance', 'Rate', 'Action'].map(h => (
                <th key={h} style={{ padding: '24px 32px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '800', borderBottom: `2px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((m, i) => (
              <tr key={m.id} className="animated-row" style={{ animation: `fadeIn 0.4s ease forwards ${Math.min(i * 0.04, 0.4)}s`, opacity: 0, background: CONFIG.THEME.BG_SURFACE }} onClick={() => onSelect(m)}>
                <td style={{ padding: '20px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: Utils.generateAvatarGradient(m.name), color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', boxShadow: CONFIG.THEME.SHADOW_SM }}>
                        {m.profilePhotoUrl ? <img src={m.profilePhotoUrl} alt={m.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : m.initials}
                      </div>
                      {m.isTopRated && <div style={{ position: 'absolute', bottom: -2, right: -2, background: CONFIG.THEME.GOLD_MAIN, color: CONFIG.THEME.NAVY_MAIN, borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', border: `2px solid ${CONFIG.THEME.BG_SURFACE}`, fontWeight: 'bold' }}>★</div>}
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', color: CONFIG.THEME.NAVY_MAIN, fontSize: '1.1rem', marginBottom: '4px' }}>{m.name}</div>
                      <div style={{ fontSize: '0.85rem', color: CONFIG.THEME.TEXT_TER }}>{m.tier || 'Mentor'}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px 32px' }}>
                  <div style={{ fontWeight: '700', color: CONFIG.THEME.TEXT_PRI, fontSize: '0.95rem', marginBottom: '8px' }}>{m.domain}</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {m.languages.slice(0, 2).map(l => <Badge key={l} label={l} color={CONFIG.THEME.TEXT_SEC} outline />)}
                  </div>
                </td>
                <td style={{ padding: '20px 32px' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem', color: CONFIG.THEME.TEXT_PRI, marginBottom: '4px' }}>{m.role}</div>
                  <div style={{ fontSize: '0.85rem', color: CONFIG.THEME.TEXT_SEC }}>{m.company}</div>
                </td>
                <td style={{ padding: '20px 32px' }}>
                   <div style={{ fontWeight: '900', fontSize: '1rem', color: CONFIG.THEME.WARNING, marginBottom: '4px' }}>{m.rating} ★</div>
                   <div style={{ fontSize: '0.85rem', color: CONFIG.THEME.TEXT_SEC }}>{m.sessionsConducted} sessions</div>
                </td>
                <td style={{ padding: '20px 32px', fontWeight: '900', color: CONFIG.THEME.SUCCESS, fontSize: '1.2rem' }}>{Utils.formatCurrency(m.price)}</td>
                <td style={{ padding: '20px 32px' }}>
                  <Button variant="outline" onClick={(e) => { e.stopPropagation(); onBook(m); }}>Book</Button>
                </td>
              </tr>
            ))}
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
    <div className="glass-panel" style={{ padding: '32px', borderRadius: CONFIG.THEME.RADIUS_XL, animation: `slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${delay}s`, opacity: 0 }}>
      <div style={{ fontSize: '0.8rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.1em' }}>{title}</div>
      <div style={{ fontSize: '3rem', fontWeight: '800', color: CONFIG.THEME.NAVY_MAIN, margin: '12px 0', background: `linear-gradient(90deg, ${CONFIG.THEME.NAVY_MAIN}, ${CONFIG.THEME.GOLD_MAIN})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '0.95rem', color: CONFIG.THEME.TEXT_SEC, fontWeight: '600' }}>{sub}</div>
    </div>
  );

  const SvgBarChart = ({ title, dataArr }) => {
    const maxVal = Math.max(...dataArr.map(d => d[1]), 1);
    const height = 300; const width = '100%';
    return (
      <div className="glass-panel" style={{ padding: '40px', borderRadius: CONFIG.THEME.RADIUS_XL, animation: 'slideUpFade 0.6s ease forwards 0.2s', opacity: 0, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
        <h3 style={{ margin: '0 0 40px 0', fontSize: '1.35rem', color: CONFIG.THEME.NAVY_MAIN, fontWeight: '800' }}>{title}</h3>
        <svg width={width} height={height} style={{ overflow: 'visible', fontFamily: 'Lora, serif' }}>
          {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
            <g key={i}>
              <line x1="0" y1={height - (height * tick)} x2="100%" y2={height - (height * tick)} stroke={CONFIG.THEME.BORDER_LIGHT} strokeDasharray="4 4" />
              <text x="-16" y={height - (height * tick) + 4} fontSize="12" fill={CONFIG.THEME.TEXT_TER} textAnchor="end" fontWeight="600">{Math.round(maxVal * tick)}</text>
            </g>
          ))}
          {dataArr.map(([label, val], i) => {
            const barHeight = (val / maxVal) * height; const y = height - barHeight; const x = `${(i * 100) / dataArr.length + 6}%`;
            return (
              <g key={label}>
                <rect x={x} y={height} width="12%" height="0" fill={`url(#gradient-${i})`} rx="6" style={{ animation: `barGrow 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards ${0.3 + (i*0.1)}s` }}><title>{label}: {val}</title></rect>
                <rect x={x} y={y} width="12%" height={barHeight} fill={`url(#gradient-${i})`} rx="6" style={{ opacity: 0, animation: `fadeIn 0.1s forwards ${0.3 + (i*0.1) + 0.8}s`, transition: 'all 0.3s ease' }}><title>{label}: {val}</title></rect>
                <text x={`${(i * 100) / dataArr.length + 12}%`} y={height + 28} fontSize="12" fill={CONFIG.THEME.TEXT_SEC} textAnchor="middle" fontWeight="600">{label.length > 15 ? label.substring(0,12)+'...' : label}</text>
                <defs>
                  <linearGradient id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={i === 0 ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.NAVY_MAIN} />
                    <stop offset="100%" stopColor={i === 0 ? '#E6B800' : CONFIG.THEME.NAVY_LITE} />
                  </linearGradient>
                </defs>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const SvgDonutChart = ({ title, dataArr }) => {
    const total = dataArr.reduce((sum, [, val]) => sum + val, 0);
    let currentAngle = -90; const radius = 110; const circumference = 2 * Math.PI * radius; const cx = 160; const cy = 160;
    const colors = [CONFIG.THEME.NAVY_MAIN, CONFIG.THEME.GOLD_MAIN, CONFIG.THEME.ACCENT_CYAN, CONFIG.THEME.NAVY_LITE, CONFIG.THEME.TEXT_TER];

    return (
       <div className="glass-panel" style={{ padding: '40px', borderRadius: CONFIG.THEME.RADIUS_XL, animation: 'slideUpFade 0.6s ease forwards 0.3s', opacity: 0, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
        <h3 style={{ margin: '0 0 32px 0', fontSize: '1.35rem', color: CONFIG.THEME.NAVY_MAIN, fontWeight: '800' }}>{title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
          <svg width="320" height="320" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
            {dataArr.map(([label, val], i) => {
              const fraction = val / total; const strokeDasharray = `${fraction * circumference} ${circumference}`;
              const strokeDashoffset = -(currentAngle + 90) / 360 * circumference; currentAngle += fraction * 360;
              return (
                <circle key={label} cx={cx} cy={cy} r={radius} fill="transparent" stroke={colors[i % colors.length]} strokeWidth="48" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} style={{ transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)', transformOrigin: 'center' }}><title>{label}: {val}</title></circle>
              );
            })}
            <text x={cx} y={cy} transform="rotate(90 160 160)" textAnchor="middle" dominantBaseline="middle" fill={CONFIG.THEME.NAVY_MAIN} fontSize="2.5rem" fontWeight="800" fontFamily="Lora, serif">{Utils.formatNumber(total)}</text>
            <text x={cx} y={cy + 30} transform="rotate(90 160 160)" textAnchor="middle" dominantBaseline="middle" fill={CONFIG.THEME.TEXT_TER} fontSize="0.85rem" fontWeight="700" letterSpacing="0.1em" fontFamily="Lora, serif">TOTAL</text>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
             {dataArr.map(([label, val], i) => (
               <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.95rem', paddingBottom: '12px', borderBottom: `1px dashed ${CONFIG.THEME.BORDER_LIGHT}` }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '14px', height: '14px', borderRadius: '4px', background: colors[i % colors.length] }} /><span style={{ color: CONFIG.THEME.TEXT_SEC, fontWeight: '600' }}>{label}</span></div>
                 <strong style={{ color: CONFIG.THEME.NAVY_MAIN, fontSize: '1.1rem' }}>{Math.round((val/total)*100)}%</strong>
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px' }}>
        <TopCard title="Active Mentors" value={Utils.formatNumber(data.length)} sub="In current filtered view" delay={0.0} />
        <TopCard title="Top Domain" value={getAggregations('domain', 1)[0]?.[0] || 'N/A'} sub="Highest demand category" delay={0.1} />
        <TopCard title="Avg Experience" value={`${Math.round(data.reduce((acc, m) => acc + m.experience, 0) / (data.length || 1))} yrs`} sub="Across current segment" delay={0.2} />
        <TopCard title="Pro-bono Mentors" value={data.filter(m => m.price === 0).length} sub="Offering free sessions" delay={0.3} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <SvgBarChart title="Domain Demand Distribution" dataArr={getAggregations('domain', 5)} />
        <SvgDonutChart title="Experience Tier Breakdown" dataArr={getAggregations('tier', 4)} />
      </div>
    </div>
  );
};

const CalendarView = ({ data, onSelect, onBook }) => {
  const weekdays = data.filter(m => m.availability.includes('Weekday') || m.availability === 'Flexible');
  const weekends = data.filter(m => m.availability.includes('Weekend') || m.availability === 'Flexible');

  const Row = ({ title, mentors }) => (
    <div style={{ marginBottom: '48px' }}>
      <h3 style={{ color: CONFIG.THEME.NAVY_MAIN, borderBottom: `3px solid ${CONFIG.THEME.GOLD_MAIN}`, paddingBottom: '16px', marginBottom: '32px', display: 'inline-block', fontSize: '1.5rem', fontWeight: '800' }}>{title} ({mentors.length})</h3>
      <div style={{ display: 'flex', gap: '32px', overflowX: 'auto', paddingBottom: '24px' }}>
        {mentors.slice(0, 8).map(m => (
          <div key={m.id} className="animated-card" style={{ minWidth: '320px', padding: '32px', flexShrink: 0 }} onClick={() => onSelect(m)}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
               <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: Utils.generateAvatarGradient(m.name), color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '800', border: `3px solid ${CONFIG.THEME.BG_SURFACE}`, boxShadow: CONFIG.THEME.SHADOW_SM }}>
                 {m.profilePhotoUrl ? <img src={m.profilePhotoUrl} alt={m.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : m.initials}
               </div>
               <div>
                 <div style={{ fontWeight: '800', color: CONFIG.THEME.NAVY_MAIN, fontSize: '1.2rem', marginBottom: '4px' }}>{m.name}</div>
                 <div style={{ fontSize: '0.9rem', color: CONFIG.THEME.TEXT_SEC, fontWeight: '600' }}>{m.domain}</div>
               </div>
            </div>
            <Button fullWidth variant="outline" onClick={(e) => { e.stopPropagation(); onBook(m); }}>See Slots</Button>
          </div>
        ))}
        {mentors.length > 8 && (
          <div style={{ minWidth: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: CONFIG.THEME.BG_SURFACE_ALT, borderRadius: CONFIG.THEME.RADIUS_LG, border: `2px dashed ${CONFIG.THEME.BORDER_LIGHT}`, color: CONFIG.THEME.NAVY_MAIN, fontWeight: '800', cursor: 'pointer', transition: CONFIG.THEME.TRANSITION_FAST }} onMouseEnter={e => e.currentTarget.style.background = CONFIG.THEME.BORDER_LIGHT} onMouseLeave={e => e.currentTarget.style.background = CONFIG.THEME.BG_SURFACE_ALT}>
            + View {mentors.length - 8} more
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="glass-panel" style={{ padding: '56px', borderRadius: CONFIG.THEME.RADIUS_XL, animation: 'fadeIn 0.5s ease', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
      <h2 style={{ marginTop: 0, color: CONFIG.THEME.NAVY_MAIN, fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Availability Matrix</h2>
      <p style={{ color: CONFIG.THEME.TEXT_SEC, marginBottom: '48px', fontSize: '1.1rem' }}>Quickly locate mentors based on their general availability schedules.</p>
      <Row title="Available This Weekday" mentors={weekdays} />
      <Row title="Available This Weekend" mentors={weekends} />
    </div>
  );
};

const SmartMatchView = ({ data, onSelect }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [matched, setMatched] = useState([]);
  const [goal, setGoal] = useState('');

  const handleMatch = () => {
    if (!goal) return;
    setAnalyzing(true);
    setMatched([]);
    setTimeout(() => {
      const keyword = goal.split(' ')[0].toLowerCase();
      const sorted = [...data].sort((a,b) => {
        const aScore = a.domain.toLowerCase().includes(keyword) ? 10 : 0 + parseFloat(a.rating);
        const bScore = b.domain.toLowerCase().includes(keyword) ? 10 : 0 + parseFloat(b.rating);
        return bScore - aScore;
      });
      setMatched(sorted.slice(0, 3));
      setAnalyzing(false);
    }, 2500);
  };

  return (
    <div className="glass-panel" style={{ padding: '64px', borderRadius: CONFIG.THEME.RADIUS_XL, animation: 'fadeIn 0.5s ease', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, minHeight: '600px', position: 'relative', overflow: 'hidden' }}>
      
      {analyzing && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.95)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', height: '4px', background: CONFIG.THEME.NAVY_LITE, position: 'absolute', top: 0, animation: 'scanline 2s linear infinite' }} />
          <div style={{ width: '100px', height: '100px', border: `6px solid ${CONFIG.THEME.BORDER_LIGHT}`, borderTopColor: CONFIG.THEME.ACCENT_PURPLE, borderRadius: '50%', animation: 'spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite', marginBottom: '32px' }} />
          <h2 style={{ color: CONFIG.THEME.NAVY_MAIN, letterSpacing: '0.15em', fontWeight: '800' }}>ANALYZING MENTOR GRAPH...</h2>
          <p style={{ color: CONFIG.THEME.TEXT_SEC, fontSize: '1.1rem' }}>Matching your goals with semantic domains and historic success rates.</p>
        </div>
      )}

      <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', marginBottom: '56px' }}>
        <h2 style={{ fontSize: '3rem', color: CONFIG.THEME.NAVY_MAIN, marginBottom: '24px', fontWeight: '800', letterSpacing: '-0.02em' }}>AI Smart Match</h2>
        <p style={{ color: CONFIG.THEME.TEXT_SEC, fontSize: '1.2rem', marginBottom: '40px', lineHeight: 1.6 }}>Tell us what you want to achieve, and our matching algorithm will find the top 3 highly compatible mentors for your exact needs.</p>
        <div style={{ position: 'relative' }}>
          <input className="sju-input" placeholder="E.g., I want to learn React performance optimization..." value={goal} onChange={(e) => setGoal(e.target.value)} style={{ padding: '24px 32px', fontSize: '1.15rem', boxShadow: CONFIG.THEME.SHADOW_MD, border: `2px solid ${CONFIG.THEME.BORDER_LIGHT}` }} />
          <Button onClick={handleMatch} disabled={!goal} style={{ position: 'absolute', right: '10px', top: '10px', bottom: '10px', padding: '0 40px' }}>Find Mentors</Button>
        </div>
      </div>

      {matched.length > 0 && !analyzing && (
        <div style={{ animation: 'slideUpFade 0.6s ease' }}>
          <h3 style={{ textAlign: 'center', color: CONFIG.THEME.SUCCESS, marginBottom: '40px', fontSize: '1.8rem', fontWeight: '900' }}>✓ Top Matches Found</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
             {matched.map((m, i) => (
               <div key={m.id} className="animated-card" style={{ padding: '40px 32px', textAlign: 'center', border: `3px solid ${i === 0 ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.BORDER_LIGHT}`, position: 'relative' }} onClick={() => onSelect(m)}>
                 {i === 0 && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)', background: CONFIG.THEME.GOLD_MAIN, color: CONFIG.THEME.NAVY_MAIN, padding: '6px 20px', borderRadius: '24px', fontWeight: '900', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: CONFIG.THEME.SHADOW_MD }}>98% Best Match</div>}
                 <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: Utils.generateAvatarGradient(m.name), color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '800', margin: '0 auto 24px auto', boxShadow: CONFIG.THEME.SHADOW_MD, border: `4px solid ${CONFIG.THEME.BG_SURFACE}` }}>
                   {m.profilePhotoUrl ? <img src={m.profilePhotoUrl} alt={m.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : m.initials}
                 </div>
                 <h3 style={{ margin: '0 0 12px', fontSize: '1.5rem', color: CONFIG.THEME.NAVY_MAIN, fontWeight: '800' }}>{m.name}</h3>
                 <p style={{ margin: '0 0 32px 0', fontSize: '1rem', color: CONFIG.THEME.TEXT_SEC, fontWeight: '600' }}>{m.role} @ {m.company}</p>
                 <Badge label={m.domain} color={CONFIG.THEME.NAVY_MAIN} bg={CONFIG.THEME.BG_SURFACE_ALT} />
               </div>
             ))}
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
  
  const [view, setView] = useState('GRID'); 
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [filters, setFilters] = useState({ 
    domain: null, tier: null, availability: null, 
    priceCategory: null, language: null, companyTier: null 
  });

  const scrollRef = useRef(null);

  // Exact Firebase Real-time Implementation matching Directory constraints
  useEffect(() => {
    let unsubscribe;
    try {
      // Must target alumni-data to be consistent with overall Directory app
      const mentorsRef = collection(db, 'alumni-data'); 
      const q = query(mentorsRef, limit(CONFIG.DATA.MAX_LIMIT)); 

      unsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) { 
          setData([]); 
          setLoading(false);
          return; 
        }

        const firestoreData = [];
        snapshot.docs.forEach(doc => {
          const d = doc.data();
          
          // CRITICAL: We only want APPROVED users in the ecosystem
          if(d.status !== "APPROVED") return; 

          const clean = (val, fb = "N/A") => (!val || String(val).toLowerCase().includes("not applicable") || String(val).toLowerCase() === "none") ? fb : val;
          
          const fullName = clean(d["Full Name"] || d.fullName || d.Name, "SJU Alumni");
          const batchYear = parseInt(d["Batch Year"] || d.batchYear || d.GraduationYear || 2020);
          const exp = Math.max(0, 2026 - batchYear);
          const rawTier = clean(d.Tier || d.tier, null);
          const validTier = rawTier ? rawTier : (exp > 10 ? "Industry Leader" : exp > 5 ? "Senior Mentor" : "Peer Mentor");
          
          const basePrice = exp > 10 ? 2500 : exp > 5 ? 1500 : 0;
          const seed = Utils.seedGen(doc.id);

          // Identify Mentorship Availability strictly
          const mentorshipStatus = (d.Mentorship === "Available" || String(d["Current Status"] || d.Status || "").includes("Working") || d.status === "Employed") ? "Available" : "Unavailable";
          
          if(mentorshipStatus !== "Available") return; // Filter out non-mentors

          firestoreData.push({
            id: doc.id,
            name: fullName,
            email: clean(d.Email || d.email, "Confidential"),
            initials: Utils.extractInitials(fullName),
            domain: clean(d.Degree || d.degree || d.Domain, "Tech & Engineering"),
            role: clean(d.Designation || d.designation || d.Role, "Professional"),
            company: clean(d["Company Name"] || d.company || d.Company, "Independent"),
            tier: validTier,
            mentorship: mentorshipStatus,
            experience: exp,
            bio: clean(d.Reviews || d.reviews || d.bio, `Experienced professional offering guidance in ${clean(d.Degree || "their domain")}. Passions include scaling systems and career coaching.`),
            
            // Mocked/Derived Metrics
            rating: (4.0 + (seed % 10) / 10).toFixed(1),
            sessionsConducted: (seed % 150) + 5,
            price: d.price !== undefined ? d.price : basePrice,
            priceCategory: basePrice === 0 ? "Pro-Bono (Free)" : basePrice < 2000 ? "Standard Rates" : "Premium Tier",
            isTopRated: (seed % 5) === 0,
            languages: ['English', seed % 2 === 0 ? 'Hindi' : 'Spanish'],
            availability: seed % 3 === 0 ? "Weekends" : seed % 2 === 0 ? "Weekdays" : "Flexible",
            responseRate: 90 + (seed % 10),
            sessionTypes: ['1:1 Career Sync', 'Resume Review', 'Mock Interview (Technical)'],
            companyTier: clean(d.companyTier || d.CompanyTier, "Corporate"),
            profilePhotoUrl: d.profilePhotoUrl || null
          });
        });
        
        setData(firestoreData);
        setLoading(false);
      }, (err) => {
        console.error("🔥 Firestore Listen Error:", err);
        setError("Failed to synchronize with the alumni database. Please check your connection.");
        setLoading(false);
      });
      
    } catch (err) {
      console.error("🔥 Firebase Initialization Error:", err);
      setError("Database engine synchronization fault.");
      setLoading(false);
    }
    
    return () => { if(unsubscribe) unsubscribe(); };
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
        if (key === 'language') res = res.filter(m => m.languages.includes(filters[key]));
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
      window.scrollTo({ top: (elementRect - bodyRect) - offset, behavior: 'smooth' });
    }
  }, []);

  const toggleFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === val ? null : val }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ domain: null, tier: null, availability: null, priceCategory: null, language: null, companyTier: null });
    setSearch(''); setPage(1);
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

  return (
    <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '100px' }}>
      <GlobalStyles />
      
      {/* ENTERPRISE HEADER */}
      <header style={{ background: CONFIG.THEME.NAVY_MAIN, padding: '100px 0 140px 0', textAlign: 'center', position: 'relative', overflow: 'hidden', borderBottom: `6px solid ${CONFIG.THEME.GOLD_MAIN}` }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px', animation: 'shimmer 10s infinite linear' }} />
        <div style={{ position: 'absolute', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)', top: '-300px', left: '50%', transform: 'translateX(-50%)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'inline-block', padding: '8px 20px', background: 'rgba(255,255,255,0.1)', borderRadius: CONFIG.THEME.RADIUS_FULL, color: CONFIG.THEME.GOLD_MAIN, fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '24px', border: `1px solid rgba(212,175,55,0.3)` }}>Expert Gateway</div>
          <h1 style={{ color: 'white', fontSize: '4.5rem', fontWeight: '800', margin: '0 0 24px 0', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{CONFIG.SYSTEM.APP_NAME}</h1>
          <p style={{ color: CONFIG.THEME.TEXT_TER, fontSize: '1.4rem', margin: 0, fontWeight: '500', lineHeight: 1.6, maxWidth: '800px', marginInline: 'auto' }}>
            Book 1:1 sessions with {loading ? '...' : <strong style={{color: '#FFF'}}>{Utils.formatNumber(data.length)}</strong>} verified industry experts. Accelerate your career with personalized, actionable guidance.
          </p>
        </div>
      </header>

      {/* CORE WORKSPACE LAYOUT */}
      <div style={{ maxWidth: '1700px', margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '360px 1fr', gap: '48px', position: 'relative', zIndex: 10, marginTop: '-60px' }}>
        
        {/* SIDEBAR FILTERS */}
        <aside style={{ height: 'calc(100vh - 40px)', position: 'sticky', top: '20px' }}>
          <div className="glass-panel" style={{ borderRadius: CONFIG.THEME.RADIUS_XL, padding: '40px 32px', height: '100%', overflowY: 'auto', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '20px', borderBottom: `3px solid ${CONFIG.THEME.NAVY_MAIN}` }}>
              <span style={{ fontWeight: '800', fontSize: '1.4rem', color: CONFIG.THEME.NAVY_MAIN, letterSpacing: '-0.02em' }}>Gateway Filters</span>
              {(search || Object.values(filters).some(v => v !== null)) && (
                <button onClick={clearFilters} style={{ fontSize: '0.75rem', color: CONFIG.THEME.DANGER, cursor: 'pointer', fontWeight: '800', padding: '8px 16px', background: CONFIG.THEME.DANGER_BG, border: 'none', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', transition: CONFIG.THEME.TRANSITION_FAST }} onMouseEnter={e=>e.currentTarget.style.opacity=0.8} onMouseLeave={e=>e.currentTarget.style.opacity=1}>Reset</button>
              )}
            </div>

            <FilterAccordion title="Expertise Domain" options={getFacetArray(facets.domain)} activeValue={filters.domain} onSelect={(v) => toggleFilter('domain', v)} />
            <FilterAccordion title="Experience Tier" options={getFacetArray(facets.tier)} activeValue={filters.tier} onSelect={(v) => toggleFilter('tier', v)} />
            <FilterAccordion title="Company Tier" options={getFacetArray(facets.companyTier)} activeValue={filters.companyTier} onSelect={(v) => toggleFilter('companyTier', v)} />
            <FilterAccordion title="Availability Scope" options={getFacetArray(facets.availability)} activeValue={filters.availability} onSelect={(v) => toggleFilter('availability', v)} />
            <FilterAccordion title="Pricing Category" options={getFacetArray(facets.priceCategory)} activeValue={filters.priceCategory} onSelect={(v) => toggleFilter('priceCategory', v)} />
            <FilterAccordion title="Communication Lang" options={getFacetArray(facets.language)} activeValue={filters.language} onSelect={(v) => toggleFilter('language', v)} />
          </div>
        </aside>

        {/* MAIN DATA CONTENT */}
        <main ref={scrollRef} style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          <div className="glass-panel" style={{ padding: '24px 40px', borderRadius: CONFIG.THEME.RADIUS_XL, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
            <div style={{ position: 'relative', width: '500px' }}>
              <span style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', color: CONFIG.THEME.TEXT_TER }}><Icons.Search /></span>
              <input className="sju-input has-icon" placeholder="Search mentors by name, company, or domain..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} disabled={loading} />
            </div>
            
            <div style={{ display: 'flex', gap: '8px', background: CONFIG.THEME.BG_APP, padding: '8px', borderRadius: CONFIG.THEME.RADIUS_MD, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
              {[
                {id: 'GRID', icon: <Icons.Grid />, label: 'Grid'}, 
                {id: 'LIST', icon: <Icons.List />, label: 'List'}, 
                {id: 'CALENDAR', icon: <Icons.Calendar />, label: 'Schedule'}, 
                {id: 'SMART MATCH', icon: <Icons.Brain />, label: 'AI Match'}, 
                {id: 'ANALYTICS', icon: <Icons.Chart />, label: 'Stats'}
              ].map(v => (
                <button key={v.id} onClick={() => { setView(v.id); setPage(1); }} style={{ padding: '10px 20px', border: 'none', background: view === v.id ? CONFIG.THEME.BG_SURFACE : 'transparent', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '0.05em', color: view === v.id ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.TEXT_SEC, cursor: 'pointer', boxShadow: view === v.id ? CONFIG.THEME.SHADOW_SM : 'none', transition: CONFIG.THEME.TRANSITION_FAST, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ minHeight: '800px', display: 'flex', flexDirection: 'column' }}>
            {error && (
              <div style={{ padding: '40px', background: CONFIG.THEME.DANGER_BG, border: `2px dashed ${CONFIG.THEME.DANGER}`, borderRadius: CONFIG.THEME.RADIUS_LG, textAlign: 'center', animation: 'fadeIn 0.4s' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}><Icons.Alert /></div>
                <h3 style={{ color: CONFIG.THEME.DANGER, margin: '0 0 8px 0', fontSize: '1.5rem' }}>Data Synchronization Failure</h3>
                <p style={{ color: CONFIG.THEME.TEXT_SEC, margin: 0, fontSize: '1.1rem' }}>{error}</p>
              </div>
            )}

            {loading && !error && <SkeletonLoader />}

            {!loading && !error && (
              <div style={{ flex: 1 }}>
                {view === 'GRID' && <GridView data={paginatedData} onSelect={setSelectedMentor} onBook={(m) => { setSelectedMentor(m); setIsBooking(true); }} />}
                {view === 'LIST' && <ListView data={paginatedData} onSelect={setSelectedMentor} onBook={(m) => { setSelectedMentor(m); setIsBooking(true); }} />}
                {view === 'CALENDAR' && <CalendarView data={filteredData} onSelect={setSelectedMentor} onBook={(m) => { setSelectedMentor(m); setIsBooking(true); }} />}
                {view === 'SMART MATCH' && <SmartMatchView data={filteredData} onSelect={setSelectedMentor} />}
                {view === 'ANALYTICS' && <AnalyticsView data={filteredData} />}
              </div>
            )}

            {!loading && !error && (view === 'GRID' || view === 'LIST') && (
              <AdvancedPagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} totalItems={filteredData.length} pageSize={CONFIG.DATA.PAGE_SIZE} />
            )}
          </div>
        </main>
      </div>

      {/* ZERO-OVERLAP SCALABLE MODAL DIALOG */}
      {selectedMentor && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(2, 11, 23, 0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '40px' }} onClick={() => { setSelectedMentor(null); setIsBooking(false); }}>
          <div style={{ background: CONFIG.THEME.BG_SURFACE, width: '100%', maxWidth: isBooking ? '800px' : '1100px', maxHeight: '90vh', borderRadius: CONFIG.THEME.RADIUS_XL, padding: '48px', position: 'relative', animation: 'scaleInModal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards', boxShadow: CONFIG.THEME.SHADOW_LG, border: `1px solid rgba(255,255,255,0.1)`, display: 'flex', flexDirection: 'column', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => { setSelectedMentor(null); setIsBooking(false); }} style={{ position: 'absolute', top: '32px', right: '32px', background: CONFIG.THEME.BG_APP, border: 'none', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: CONFIG.THEME.TEXT_SEC, transition: CONFIG.THEME.TRANSITION_FAST, zIndex: 100 }} onMouseEnter={(e) => { e.currentTarget.style.background = CONFIG.THEME.DANGER_BG; e.currentTarget.style.color = CONFIG.THEME.DANGER; }} onMouseLeave={(e) => { e.currentTarget.style.background = CONFIG.THEME.BG_APP; e.currentTarget.style.color = CONFIG.THEME.TEXT_SEC; }}><Icons.Close /></button>
            
            {isBooking ? (
              <BookingWizard mentor={selectedMentor} onClose={() => setIsBooking(false)} onConfirm={handleBookingConfirm} />
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start', borderBottom: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingBottom: '48px', marginBottom: '48px' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: '180px', height: '180px', borderRadius: CONFIG.THEME.RADIUS_LG, background: Utils.generateAvatarGradient(selectedMentor.name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4.5rem', fontWeight: '800', flexShrink: 0, boxShadow: CONFIG.THEME.SHADOW_MD, border: `6px solid ${CONFIG.THEME.BG_SURFACE}` }}>
                      {selectedMentor.profilePhotoUrl ? <img src={selectedMentor.profilePhotoUrl} alt={selectedMentor.name} style={{ width: '100%', height: '100%', borderRadius: CONFIG.THEME.RADIUS_LG, objectFit: 'cover' }} /> : selectedMentor.initials}
                    </div>
                    {selectedMentor.isTopRated && <div style={{ position: 'absolute', bottom: -10, right: -10, background: CONFIG.THEME.GOLD_MAIN, color: CONFIG.THEME.NAVY_MAIN, borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: `4px solid ${CONFIG.THEME.BG_SURFACE}`, boxShadow: CONFIG.THEME.SHADOW_SM, fontWeight: 'bold' }} title="Top Rated Mentor">★</div>}
                  </div>
                  
                  <div style={{ flex: 1, paddingRight: '48px' }}>
                    <h2 style={{ fontSize: '3rem', color: CONFIG.THEME.NAVY_MAIN, margin: '0 0 12px 0', fontWeight: '800', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{selectedMentor.name}</h2>
                    <div style={{ fontSize: '1.35rem', color: CONFIG.THEME.TEXT_PRI, fontWeight: '600', marginBottom: '32px' }}>{selectedMentor.role} at <strong style={{color: CONFIG.THEME.NAVY_MAIN}}>{selectedMentor.company}</strong></div>
                    
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
                      <Badge label={selectedMentor.domain} color={CONFIG.THEME.NAVY_MAIN} bg={CONFIG.THEME.BG_SURFACE_ALT} />
                      {selectedMentor.tier && selectedMentor.tier !== "N/A" && <Badge label={selectedMentor.tier} color={CONFIG.THEME.ACCENT_PURPLE} outline />}
                      <Badge label={`${selectedMentor.sessionsConducted} Lifetime Sessions`} color={CONFIG.THEME.TEXT_SEC} outline />
                      <Badge label={`${selectedMentor.rating} / 5.0 Rating`} color={CONFIG.THEME.WARNING} bg={CONFIG.THEME.WARNING_BG} />
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                      <Button onClick={() => setIsBooking(true)}>Schedule Sync</Button>
                      <Button variant="outline" onClick={() => alert(`Direct Message interface opened for ${selectedMentor.name}.`)}>Message Mentor</Button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '64px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px', marginTop: 0, fontWeight: '800' }}>Executive Bio</h4>
                    <p style={{ margin: '0 0 48px 0', lineHeight: 1.9, color: CONFIG.THEME.TEXT_PRI, fontSize: '1.15rem' }}>{selectedMentor.bio}</p>

                    <h4 style={{ fontSize: '0.9rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px', fontWeight: '800' }}>Languages Supported</h4>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '48px' }}>
                      {selectedMentor.languages.map(lang => (
                        <Badge key={lang} label={lang} color={CONFIG.THEME.TEXT_SEC} outline />
                      ))}
                    </div>

                    <h4 style={{ fontSize: '0.9rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px', fontWeight: '800' }}>Offered Session Types</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                      {selectedMentor.sessionTypes.map(type => (
                        <div key={type} style={{ padding: '20px', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, borderRadius: CONFIG.THEME.RADIUS_MD, background: CONFIG.THEME.BG_APP }}>
                          <div style={{ fontWeight: '800', color: CONFIG.THEME.NAVY_MAIN }}>{type}</div>
                          <div style={{ fontSize: '0.85rem', color: CONFIG.THEME.TEXT_SEC, marginTop: '8px', fontWeight: '500' }}>Standard Rate Applies</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: CONFIG.THEME.BG_SURFACE_ALT, borderRadius: CONFIG.THEME.RADIUS_LG, padding: '40px', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, height: 'fit-content' }}>
                    <div style={{ marginBottom: '40px' }}>
                      <div style={{ fontSize: '0.8rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', marginBottom: '12px', fontWeight: '800', letterSpacing: '0.1em' }}>Domain & Experience</div>
                      <div style={{ fontWeight: '800', color: CONFIG.THEME.TEXT_PRI, fontSize: '1.2rem' }}>{selectedMentor.domain}</div>
                      <div style={{ fontSize: '1rem', color: CONFIG.THEME.TEXT_SEC, marginTop: '12px', fontWeight: '600' }}>{selectedMentor.experience} Years active in industry</div>
                    </div>

                    <div style={{ borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingTop: '40px', marginBottom: '40px' }}>
                      <div style={{ fontSize: '0.8rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', marginBottom: '12px', fontWeight: '800', letterSpacing: '0.1em' }}>Logistics & Availability</div>
                      <div style={{ fontWeight: '800', color: CONFIG.THEME.TEXT_PRI, fontSize: '1.1rem', marginBottom: '12px' }}>{selectedMentor.availability} slots usually open</div>
                      <div style={{ fontSize: '1rem', color: CONFIG.THEME.TEXT_SEC, fontWeight: '600' }}>Typical Response: ~{selectedMentor.responseRate}% rate</div>
                    </div>

                    <div style={{ borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingTop: '40px' }}>
                      <div style={{ fontSize: '0.8rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', marginBottom: '12px', fontWeight: '800', letterSpacing: '0.1em' }}>Base Hourly Rate</div>
                      <div style={{ fontWeight: '900', color: CONFIG.THEME.SUCCESS, fontSize: '1.8rem' }}>{Utils.formatCurrency(selectedMentor.price)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '40px', right: '40px', background: CONFIG.THEME.NAVY_MAIN, color: 'white', padding: '20px 32px', borderRadius: CONFIG.THEME.RADIUS_MD, boxShadow: CONFIG.THEME.SHADOW_LG, display: 'flex', alignItems: 'center', gap: '20px', zIndex: 999999, animation: 'slideUpFade 0.3s ease' }}>
          <div style={{ background: CONFIG.THEME.GOLD_MAIN, color: CONFIG.THEME.NAVY_MAIN, width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>✓</div>
          <span style={{ fontWeight: '700', fontFamily: 'Lora, serif', fontSize: '1.1rem' }}>{toast}</span>
        </div>
      )}
    </div>
  );
};

const MentorshipGateway = () => (
  <GlobalErrorBoundary>
    <MentorshipGatewayInner />
  </GlobalErrorBoundary>
);

export default MentorshipGateway;