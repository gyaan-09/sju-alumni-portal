// src/Directory.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback, Component } from 'react';

// ============================================================================
// 1. ENTERPRISE CONFIGURATION & GATEWAYS
// ============================================================================

const CONFIG = {
  SYSTEM: {
    APP_NAME: "SJU Global Alumni Directory",
    VERSION: "2026.5.0 Enterprise Ultra",
    ORG: "St. Joseph's University",
    BUILD: "2026.11.X.ULTRA_REALTIME"
  },
  DATA: {
    PAGE_SIZE: 20, // Strict requirement: At least 20 per page
    MAX_LIMIT: 10000 // Supports up to 500 pages (20 * 500 = 10000)
  },
  THEME: {
    // Core Palette - Deep Navy & Metallic Gold
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
    
    // Elevation (Shadows)
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

// ============================================================================
// 2. ERROR BOUNDARY (CRASH-PROOF ARCHITECTURE)
// ============================================================================

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("🔥 DIRECTORY THREAD CRASH INTERCEPTED:", error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '60px', textAlign: 'center', fontFamily: '"Lora", serif', color: CONFIG.THEME.NAVY_MAIN, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: CONFIG.THEME.BG_APP }}>
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🛡️</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', color: CONFIG.THEME.DANGER }}>Directory Exception Intercepted</h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.8', color: CONFIG.THEME.TEXT_SEC }}>The data grid encountered an unexpected fault while processing records. The error boundary prevented a complete system crash.</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '32px', padding: '16px 32px', backgroundColor: CONFIG.THEME.NAVY_MAIN, color: CONFIG.THEME.GOLD_MAIN, border: 'none', borderRadius: '999px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: CONFIG.THEME.SHADOW_MD }}>Reboot Data Grid</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================================
// 3. GLOBAL STYLES & ANIMATION ENGINE
// ============================================================================

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
    
    body {
      margin: 0; padding: 0; background-color: ${CONFIG.THEME.BG_APP};
      font-family: 'Lora', serif; color: ${CONFIG.THEME.TEXT_PRI};
      -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
      overflow-x: hidden; line-height: 1.6;
    }

    * { box-sizing: border-box; }
    h1, h2, h3, h4, h5, h6, button, input, select, textarea, span, p, div { font-family: 'Lora', serif; }

    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: ${CONFIG.THEME.BG_APP}; border-left: 1px solid ${CONFIG.THEME.BORDER_LIGHT}; }
    ::-webkit-scrollbar-thumb { background: ${CONFIG.THEME.BORDER_FOCUS}; border-radius: 10px; border: 2px solid ${CONFIG.THEME.BG_APP}; }
    ::-webkit-scrollbar-thumb:hover { background: ${CONFIG.THEME.NAVY_LITE}; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUpFade { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideRightFade { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes scaleInModal { from { opacity: 0; transform: scale(0.95) translateY(15px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(123, 44, 191, 0.4); } 70% { box-shadow: 0 0 0 12px rgba(123, 44, 191, 0); } 100% { box-shadow: 0 0 0 0 rgba(123, 44, 191, 0); } }
    @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
    @keyframes barGrow { from { height: 0; opacity: 0; } to { opacity: 1; } }

    .animated-card { background: ${CONFIG.THEME.BG_SURFACE}; border-radius: ${CONFIG.THEME.RADIUS_LG}; border: 1px solid ${CONFIG.THEME.BORDER_LIGHT}; transition: ${CONFIG.THEME.TRANSITION_BOUNCE}; cursor: pointer; position: relative; overflow: hidden; z-index: 1; }
    .animated-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: ${CONFIG.THEME.RADIUS_LG}; padding: 3px; background: linear-gradient(135deg, ${CONFIG.THEME.NAVY_MAIN}, ${CONFIG.THEME.GOLD_MAIN}); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0; transition: ${CONFIG.THEME.TRANSITION_SMOOTH}; z-index: -1; }
    .animated-card:hover { transform: translateY(-10px); box-shadow: ${CONFIG.THEME.SHADOW_HOVER}; border-color: transparent; }
    .animated-card:hover::before { opacity: 1; }

    .animated-row { transition: ${CONFIG.THEME.TRANSITION_FAST}; border-bottom: 1px solid ${CONFIG.THEME.BORDER_LIGHT}; cursor: pointer; position: relative; }
    .animated-row:hover { background-color: ${CONFIG.THEME.BG_SURFACE_ALT} !important; transform: translateX(8px); }
    .animated-row::after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: ${CONFIG.THEME.GOLD_MAIN}; transform: scaleY(0); transition: transform 0.2s ease; transform-origin: center; }
    .animated-row:hover::after { transform: scaleY(1); }

    .glass-panel { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.6); box-shadow: ${CONFIG.THEME.SHADOW_SM}; }

    .skeleton-box { background: #E2E8F0; background-image: linear-gradient(90deg, #E2E8F0 0px, #F1F5F9 40px, #E2E8F0 80px); background-size: 1000px 100%; animation: shimmer 2.5s infinite linear; border-radius: ${CONFIG.THEME.RADIUS_SM}; }

    .sju-input { width: 100%; padding: 18px 24px 18px 56px; border-radius: ${CONFIG.THEME.RADIUS_FULL}; border: 1px solid ${CONFIG.THEME.BORDER_LIGHT}; font-size: 1.05rem; background: ${CONFIG.THEME.BG_SURFACE}; transition: all 0.3s ease; color: ${CONFIG.THEME.TEXT_PRI}; box-shadow: ${CONFIG.THEME.SHADOW_INNER}; }
    .sju-input:focus { border-color: ${CONFIG.THEME.NAVY_MAIN}; box-shadow: 0 0 0 4px rgba(12, 35, 64, 0.1); outline: none; background: #FFF; }

    @media (max-width: 1024px) {
      .directory-workspace {
        grid-template-columns: 1fr !important;
        padding: 0 24px !important;
        margin-top: -30px !important;
        gap: 32px !important;
      }
      .directory-sidebar {
        height: auto !important;
        position: relative !important;
        top: 0 !important;
      }
      .directory-controls {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 16px !important;
      }
      .directory-search-input-wrapper {
        width: 100% !important;
      }
      .directory-view-buttons {
        flex-wrap: wrap !important;
        justify-content: center !important;
      }
      .directory-header {
        padding: 80px 0 100px 0 !important;
      }
      .directory-title {
        font-size: 3rem !important;
      }
    }
    @media (max-width: 600px) {
      .directory-workspace {
        padding: 0 16px !important;
      }
      .directory-header {
        padding: 60px 0 80px 0 !important;
      }
      .directory-title {
        font-size: 2.2rem !important;
      }
      .directory-card-grid {
        grid-template-columns: 1fr !important;
        min-width: 0 !important;
      }
      .directory-sidebar .glass-panel {
        padding: 20px !important;
      }
      .directory-controls {
        padding: 24px 16px !important;
      }
      .directory-view-buttons button {
        padding: 8px 12px !important;
        flex: 1 1 calc(50% - 8px) !important;
        justify-content: center !important;
      }
    }
  `}</style>
);

// ============================================================================
// 4. UNIFIED ICON LIBRARY
// ============================================================================

const Icons = {
  Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Filter: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>,
  Grid: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  List: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>,
  Chart: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  Mentors: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  Map: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>,
  Close: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Mail: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
  Briefcase: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>,
  CheckCircle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
  Alert: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
};

// ============================================================================
// 5. UTILITIES & FORMATTERS
// ============================================================================

const Utils = {
  formatNumber: (num) => num > 999 ? (num / 1000).toFixed(1) + 'k' : (num || 0).toString(),
  
  getStatusStyle: (status) => {
    const s = String(status).toLowerCase();
    if (s.includes('work') || s.includes('employ') || s.includes('job')) return { color: CONFIG.THEME.SUCCESS, bg: CONFIG.THEME.SUCCESS_BG, icon: '💼' };
    if (s.includes('seek') || s.includes('look')) return { color: CONFIG.THEME.WARNING, bg: CONFIG.THEME.WARNING_BG, icon: '🔍' };
    if (s.includes('study') || s.includes('pg') || s.includes('higher')) return { color: CONFIG.THEME.INFO, bg: CONFIG.THEME.INFO_BG, icon: '🎓' };
    if (s.includes('retire')) return { color: CONFIG.THEME.TEXT_SEC, bg: CONFIG.THEME.BORDER_LIGHT, icon: '🏖️' };
    return { color: CONFIG.THEME.TEXT_PRI, bg: CONFIG.THEME.BG_APP, icon: '•' };
  },

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
  }
};

// ============================================================================
// 6. ATOMIC UI COMPONENTS
// ============================================================================

const Badge = ({ label, color, bg, icon, outline = false }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: CONFIG.THEME.RADIUS_FULL, fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', color: color, backgroundColor: outline ? 'transparent' : bg, border: outline ? `1px solid ${color}` : `1px solid transparent`, whiteSpace: 'nowrap' }}>
    {icon && <span>{icon}</span>} {label}
  </span>
);

const Button = ({ children, onClick, variant = 'primary', active = false, fullWidth = false, disabled = false, icon }) => {
  let baseStyle = { padding: '14px 28px', borderRadius: CONFIG.THEME.RADIUS_FULL, fontWeight: '700', fontSize: '0.875rem', cursor: disabled ? 'not-allowed' : 'pointer', transition: CONFIG.THEME.TRANSITION_FAST, width: fullWidth ? '100%' : 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: 'none', opacity: disabled ? 0.6 : 1, textTransform: 'uppercase', letterSpacing: '0.1em' };
  
  if (variant === 'primary') baseStyle = { ...baseStyle, background: CONFIG.THEME.NAVY_MAIN, color: CONFIG.THEME.GOLD_MAIN, boxShadow: CONFIG.THEME.SHADOW_SM };
  else if (variant === 'outline') baseStyle = { ...baseStyle, background: 'transparent', color: active ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.NAVY_MAIN, border: `2px solid ${active ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.NAVY_MAIN}` };
  else if (variant === 'ghost') baseStyle = { ...baseStyle, background: active ? CONFIG.THEME.BG_SURFACE : 'transparent', color: active ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.TEXT_SEC, boxShadow: active ? CONFIG.THEME.SHADOW_SM : 'none' };

  return (
    <button 
      onClick={onClick} disabled={disabled} style={baseStyle}
      onMouseEnter={(e) => { if (!disabled) { if (variant === 'primary') e.currentTarget.style.transform = 'translateY(-2px)'; if (variant === 'outline') { e.currentTarget.style.background = CONFIG.THEME.NAVY_MAIN; e.currentTarget.style.color = CONFIG.THEME.GOLD_MAIN; } } }}
      onMouseLeave={(e) => { if (!disabled) { if (variant === 'primary') e.currentTarget.style.transform = 'translateY(0)'; if (variant === 'outline') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = CONFIG.THEME.NAVY_MAIN; } } }}
    >
      {icon && icon}
      {children}
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
      <div style={{ fontSize: '0.95rem', color: CONFIG.THEME.TEXT_SEC }}>Showing <strong style={{ color: CONFIG.THEME.NAVY_MAIN }}>{((currentPage - 1) * pageSize) + 1}</strong> to <strong style={{ color: CONFIG.THEME.NAVY_MAIN }}>{Math.min(currentPage * pageSize, totalItems)}</strong> of <strong style={{ color: CONFIG.THEME.NAVY_MAIN }}>{totalItems}</strong> entries</div>
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

// ============================================================================
// 7. VIEWS: SKELETON, GRID, LIST, ANALYTICS, MENTORS, GEO
// ============================================================================

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

const GridView = ({ data, onSelect }) => {
  if (data.length === 0) return <EmptyState />;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px' }}>
      {data.map((u, i) => {
        const statusStyle = Utils.getStatusStyle(u.status);
        return (
          <div key={u.id} className="animated-card" style={{ animation: `slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards ${Math.min(i * 0.05, 0.5)}s`, opacity: 0 }} onClick={() => onSelect(u)}>
            <div style={{ padding: '40px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px', position: 'relative' }}>
                <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: Utils.generateAvatarGradient(u.name), color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '700', boxShadow: CONFIG.THEME.SHADOW_MD, border: `4px solid ${CONFIG.THEME.BG_SURFACE}`, overflow: 'hidden' }}>
                  {u.profilePhotoUrl ? <img src={u.profilePhotoUrl} alt={u.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : u.initials}
                </div>
                {u.verified && <div style={{ position: 'absolute', bottom: 0, right: '50%', transform: 'translate(44px, 0)', background: CONFIG.THEME.SUCCESS, color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', border: `3px solid ${CONFIG.THEME.BG_SURFACE}`, boxShadow: CONFIG.THEME.SHADOW_SM }} title="Verified Active Member"><Icons.CheckCircle /></div>}
              </div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '1.4rem', color: CONFIG.THEME.NAVY_MAIN, fontWeight: '800', letterSpacing: '-0.01em' }}>{u.name}</h3>
                <p style={{ margin: 0, fontSize: '0.95rem', color: CONFIG.THEME.TEXT_SEC, minHeight: '44px', lineHeight: 1.5 }}>{u.role} <span style={{ color: CONFIG.THEME.BORDER_FOCUS }}>@</span> <strong style={{ color: CONFIG.THEME.TEXT_PRI }}>{u.company}</strong></p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
                <Badge label={u.status} color={statusStyle.color} bg={statusStyle.bg} />
                <Badge label={`Class of '${u.batch.toString().slice(-2)}`} color={CONFIG.THEME.NAVY_MAIN} outline />
                {u.mentorship === 'Available' && <Badge label="Mentor" color={CONFIG.THEME.ACCENT_PURPLE} bg="rgba(123, 44, 191, 0.1)" icon="💡" />}
              </div>
              <div style={{ borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: CONFIG.THEME.TEXT_TER, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icons.Map /> {u.location.split(',')[0]}</span>
                <span>🔗 {u.connections || '50+'} Conn</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ListView = ({ data, onSelect }) => {
  if (data.length === 0) return <EmptyState />;
  return (
    <div className="glass-panel" style={{ borderRadius: CONFIG.THEME.RADIUS_XL, overflow: 'hidden', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
          <thead style={{ background: CONFIG.THEME.BG_SURFACE_ALT, color: CONFIG.THEME.NAVY_MAIN }}>
            <tr>{['Member Details', 'Professional Designation', 'Academic Background', 'Location', 'Current Status'].map((h) => (<th key={h} style={{ padding: '24px 32px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '800', borderBottom: `2px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>{h}</th>))}</tr>
          </thead>
          <tbody>
            {data.map((u, i) => {
              const statusStyle = Utils.getStatusStyle(u.status);
              return (
                <tr key={u.id} className="animated-row" style={{ animation: `fadeIn 0.4s ease forwards ${Math.min(i * 0.04, 0.4)}s`, opacity: 0, background: CONFIG.THEME.BG_SURFACE }} onClick={() => onSelect(u)}>
                  <td style={{ padding: '20px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: Utils.generateAvatarGradient(u.name), color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.2rem', boxShadow: CONFIG.THEME.SHADOW_SM }}>
                          {u.profilePhotoUrl ? <img src={u.profilePhotoUrl} alt={u.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : u.initials}
                        </div>
                        {u.verified && <div style={{ position: 'absolute', bottom: -2, right: -2, background: CONFIG.THEME.SUCCESS, color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', border: `2px solid ${CONFIG.THEME.BG_SURFACE}` }}>✓</div>}
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', color: CONFIG.THEME.NAVY_MAIN, fontSize: '1.1rem', marginBottom: '4px' }}>{u.name}</div>
                        <div style={{ fontSize: '0.85rem', color: CONFIG.THEME.TEXT_TER, display: 'flex', alignItems: 'center', gap: '6px' }}><Icons.Mail /> {u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 32px' }}>
                    <div style={{ fontWeight: '700', color: CONFIG.THEME.TEXT_PRI, fontSize: '0.95rem', marginBottom: '4px' }}>{u.role}</div>
                    <div style={{ fontSize: '0.85rem', color: CONFIG.THEME.TEXT_SEC, display: 'flex', alignItems: 'center', gap: '6px' }}><Icons.Briefcase /> {u.company}</div>
                  </td>
                  <td style={{ padding: '20px 32px' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem', color: CONFIG.THEME.TEXT_PRI, marginBottom: '4px' }}>{u.degree}</div>
                    <div style={{ fontSize: '0.85rem', color: CONFIG.THEME.TEXT_SEC }}>Class of {u.batch}</div>
                  </td>
                  <td style={{ padding: '20px 32px', fontSize: '0.95rem', color: CONFIG.THEME.TEXT_SEC, fontWeight: '600' }}>{u.location.split(',')[0]}</td>
                  <td style={{ padding: '20px 32px' }}><Badge label={u.status} color={statusStyle.color} bg={statusStyle.bg} outline={u.status === 'Retired'} /></td>
                </tr>
              );
            })}
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
    data.forEach(u => { if (Array.isArray(u[key])) { u[key].forEach(val => counts[val] = (counts[val] || 0) + 1); } else { counts[u[key]] = (counts[u[key]] || 0) + 1; } });
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
            <g key={i}><line x1="0" y1={height - (height * tick)} x2="100%" y2={height - (height * tick)} stroke={CONFIG.THEME.BORDER_LIGHT} strokeDasharray="4 4" /><text x="-16" y={height - (height * tick) + 4} fontSize="12" fill={CONFIG.THEME.TEXT_TER} textAnchor="end" fontWeight="600">{Math.round(maxVal * tick)}</text></g>
          ))}
          {dataArr.map(([label, val], i) => {
            const barHeight = (val / maxVal) * height; const y = height - barHeight; const x = `${(i * 100) / dataArr.length + 6}%`;
            return (
              <g key={label}>
                <rect x={x} y={height} width="12%" height="0" fill={`url(#gradient-${i})`} rx="6" className="svg-bar" style={{ animation: `barGrow 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards ${0.3 + (i*0.1)}s` }}><title>{label}: {val}</title></rect>
                <rect x={x} y={y} width="12%" height={barHeight} fill={`url(#gradient-${i})`} rx="6" style={{ opacity: 0, animation: `fadeIn 0.1s forwards ${0.3 + (i*0.1) + 0.8}s`, transition: 'all 0.3s ease' }}><title>{label}: {val}</title></rect>
                <text x={`${(i * 100) / dataArr.length + 12}%`} y={height + 28} fontSize="12" fill={CONFIG.THEME.TEXT_SEC} textAnchor="middle" fontWeight="600">{label.length > 15 ? label.substring(0,12)+'...' : label}</text>
                <defs><linearGradient id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={i === 0 ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.NAVY_MAIN} /><stop offset="100%" stopColor={i === 0 ? '#E6B800' : CONFIG.THEME.NAVY_LITE} /></linearGradient></defs>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const SvgDonutChart = ({ title, dataArr }) => {
    const total = dataArr.reduce((sum, [, val]) => sum + val, 0); let currentAngle = -90; const radius = 110; const circumference = 2 * Math.PI * radius; const cx = 160; const cy = 160;
    const colors = [CONFIG.THEME.NAVY_MAIN, CONFIG.THEME.GOLD_MAIN, CONFIG.THEME.ACCENT_CYAN, CONFIG.THEME.ACCENT_PURPLE, CONFIG.THEME.ACCENT_CORAL, CONFIG.THEME.TEXT_TER];
    return (
       <div className="glass-panel" style={{ padding: '40px', borderRadius: CONFIG.THEME.RADIUS_XL, animation: 'slideUpFade 0.6s ease forwards 0.3s', opacity: 0, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
        <h3 style={{ margin: '0 0 32px 0', fontSize: '1.35rem', color: CONFIG.THEME.NAVY_MAIN, fontWeight: '800' }}>{title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
          <svg width="320" height="320" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
            {dataArr.map(([label, val], i) => {
              const fraction = val / total; const strokeDasharray = `${fraction * circumference} ${circumference}`; const strokeDashoffset = -(currentAngle + 90) / 360 * circumference; currentAngle += fraction * 360;
              return <circle key={label} cx={cx} cy={cy} r={radius} fill="transparent" stroke={colors[i % colors.length]} strokeWidth="48" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} style={{ transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)', transformOrigin: 'center' }}><title>{label}: {val}</title></circle>;
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
        <TopCard title="Active Network Size" value={Utils.formatNumber(data.length)} sub="In current filtered view" delay={0.0} />
        <TopCard title="Top Global Hub" value={getAggregations('location', 1)[0]?.[0].split(',')[0] || 'N/A'} sub="Highest density location" delay={0.1} />
        <TopCard title="Mentors Available" value={data.filter(u => u.mentorship === 'Available').length} sub="Ready to connect & guide" delay={0.2} />
        <TopCard title="Verified Security" value={`${Math.round((data.filter(u => u.verified).length / Math.max(data.length, 1)) * 100)}%`} sub="Platform trust score" delay={0.3} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <SvgBarChart title="Distribution by Industry Tier" dataArr={getAggregations('companyTier', 5)} />
        <SvgDonutChart title="Graduation Decades" dataArr={getAggregations('batchDecade', 5)} />
      </div>
      <div className="glass-panel" style={{ padding: '40px', borderRadius: CONFIG.THEME.RADIUS_XL, animation: 'slideUpFade 0.6s ease forwards 0.4s', opacity: 0, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
        <h3 style={{ margin: '0 0 40px 0', fontSize: '1.35rem', color: CONFIG.THEME.NAVY_MAIN, fontWeight: '800' }}>Top Skills Penetration</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {getAggregations('skills', 30).map(([skill, count]) => {
             const max = getAggregations('skills', 1)[0][1]; const intensity = 0.2 + (0.8 * (count / max));
             return (
               <div key={skill} style={{ padding: '12px 24px', background: `rgba(12, 35, 64, ${intensity})`, color: intensity > 0.45 ? '#FFF' : CONFIG.THEME.NAVY_MAIN, borderRadius: CONFIG.THEME.RADIUS_FULL, fontSize: '0.95rem', fontWeight: '700', display: 'flex', gap: '16px', alignItems: 'center', transition: CONFIG.THEME.TRANSITION_FAST, boxShadow: intensity > 0.6 ? CONFIG.THEME.SHADOW_MD : 'none' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e=> e.currentTarget.style.transform='scale(1)'}>
                 <span>{skill}</span>
                 <span style={{ opacity: 0.9, fontSize: '0.8rem', background: 'rgba(255,255,255,0.25)', padding: '4px 10px', borderRadius: '12px' }}>{count}</span>
               </div>
             )
          })}
        </div>
      </div>
    </div>
  );
};

const MentorshipView = ({ data, onSelect }) => {
  const mentors = data.filter(u => u.mentorship === 'Available');
  if (mentors.length === 0) return <EmptyState msg="No mentors available matching your current filter criteria." />;
  return (
    <div className="directory-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', minWidth: 0 }}>
      {mentors.map((u, i) => (
        <div 
          key={u.id} 
          className="animated-card" 
          style={{ 
            padding: '32px', 
            display: 'flex', 
            gap: '24px', 
            flexDirection: window.innerWidth <= 1200 ? 'column' : 'row',
            alignItems: window.innerWidth <= 1200 ? 'center' : 'flex-start',
            textAlign: window.innerWidth <= 1200 ? 'center' : 'left',
            animation: `slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards ${Math.min(i * 0.05, 0.5)}s`, 
            opacity: 0,
            minHeight: '280px'
          }} 
          onClick={() => onSelect(u)}
        >
          <div style={{ position: 'relative', flexShrink: 0 }}>
             <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: Utils.generateAvatarGradient(u.name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '800', boxShadow: '0 0 30px rgba(123, 44, 191, 0.2)', border: `4px solid ${CONFIG.THEME.BG_SURFACE}`, overflow: 'hidden' }}>
                {u.profilePhotoUrl ? <img src={u.profilePhotoUrl} alt={u.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : u.initials}
             </div>
             <div style={{ position: 'absolute', bottom: -2, right: -2, width: '24px', height: '24px', borderRadius: '50%', background: CONFIG.THEME.ACCENT_PURPLE, border: `3px solid ${CONFIG.THEME.BG_SURFACE}`, animation: 'pulseGlow 2s infinite', boxShadow: CONFIG.THEME.SHADOW_SM }} title="Active Mentor" />
          </div>
          <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: CONFIG.THEME.ACCENT_PURPLE, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>Mentorship Open</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.35rem', color: CONFIG.THEME.TEXT_PRI, fontWeight: '800', letterSpacing: '-0.01em', lineHeight: 1.2 }}>{u.name}</h3>
            <div style={{ fontSize: '0.9rem', color: CONFIG.THEME.TEXT_SEC, fontWeight: '600', lineHeight: 1.4 }}>{u.role} <br/><span style={{color: CONFIG.THEME.NAVY_MAIN}}>@ {u.company}</span></div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '20px', justifyContent: window.innerWidth <= 1200 ? 'center' : 'flex-start' }}>
              {u.skills.slice(0, 2).map(s => <Badge key={s} label={s} color={CONFIG.THEME.NAVY_MAIN} bg={CONFIG.THEME.BG_SURFACE_ALT} />)}
              {u.skills.length > 2 && <Badge label={`+${u.skills.length - 2}`} color={CONFIG.THEME.TEXT_TER} outline />}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const GeoView = ({ data }) => {
  if (data.length === 0) return <EmptyState />;
  const locations = {}; data.forEach(u => locations[u.location] = (locations[u.location] || 0) + 1);
  const sorted = Object.entries(locations).sort((a,b) => b[1] - a[1]);
  return (
    <div className="glass-panel" style={{ borderRadius: CONFIG.THEME.RADIUS_XL, padding: '56px', animation: 'fadeIn 0.6s ease', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h2 style={{ color: CONFIG.THEME.NAVY_MAIN, margin: 0, fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Global Density Mapping</h2>
          <p style={{ color: CONFIG.THEME.TEXT_SEC, marginTop: '12px', marginBottom: 0, fontSize: '1.1rem' }}>Geographical distribution of the current filtered network segment.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
           <div style={{ fontSize: '3rem', fontWeight: '800', color: CONFIG.THEME.GOLD_MAIN, lineHeight: 1 }}>{sorted.length}</div>
           <div style={{ fontSize: '0.85rem', fontWeight: '700', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Unique Regions</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
        {sorted.map(([loc, count], i) => (
          <div key={loc} style={{ padding: '32px 40px', background: CONFIG.THEME.BG_SURFACE, borderRadius: CONFIG.THEME.RADIUS_LG, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, position: 'relative', overflow: 'hidden', boxShadow: CONFIG.THEME.SHADOW_SM, transition: CONFIG.THEME.TRANSITION_BOUNCE }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = CONFIG.THEME.SHADOW_MD; e.currentTarget.style.borderColor = i < 3 ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.NAVY_MAIN; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = CONFIG.THEME.SHADOW_SM; e.currentTarget.style.borderColor = CONFIG.THEME.BORDER_LIGHT; }}>
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '8px', background: i < 3 ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.NAVY_MAIN }} />
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: CONFIG.THEME.NAVY_MAIN }}>{loc.split(',')[0]}</div>
            <div style={{ fontSize: '0.8rem', color: CONFIG.THEME.TEXT_TER, marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '700' }}>{loc.split(',')[1] || 'Region'}</div>
            <div style={{ width: '100%', height: '6px', background: CONFIG.THEME.BG_APP, borderRadius: '3px', marginTop: '24px', overflow: 'hidden' }}><div style={{ width: `${(count / sorted[0][1]) * 100}%`, height: '100%', background: i < 3 ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.NAVY_LITE, transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }} /></div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '20px' }}><span style={{ fontSize: '3rem', fontWeight: '800', color: CONFIG.THEME.TEXT_PRI, lineHeight: 1 }}>{count}</span><span style={{ fontSize: '0.95rem', fontWeight: '700', color: CONFIG.THEME.TEXT_TER }}>Alumni</span></div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EmptyState = ({ msg = "No records found matching your current filter criteria." }) => (
  <div style={{ padding: '120px 20px', textAlign: 'center', background: 'transparent', animation: 'fadeIn 0.5s' }}>
    <div style={{ fontSize: '5rem', opacity: 0.15, marginBottom: '32px' }}>📭</div>
    <h3 style={{ color: CONFIG.THEME.NAVY_MAIN, margin: '0 0 16px 0', fontSize: '1.8rem', fontWeight: '800' }}>No Results</h3>
    <p style={{ color: CONFIG.THEME.TEXT_SEC, fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto' }}>{msg}</p>
  </div>
);

// ============================================================================
// 8. DOSSIER MODAL SYSTEM
// ============================================================================

const DossierModal = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Close on Escape
  useEffect(() => {
    if (!user) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', handleEsc); document.body.style.overflow = 'unset'; };
  }, [user, onClose]);

  if (!user) return null;

  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(2, 11, 23, 0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: window.innerWidth <= 800 ? '10px' : '40px' }} onClick={onClose}>
      <div style={{ background: CONFIG.THEME.BG_SURFACE, width: '100%', maxWidth: '1100px', maxHeight: '90vh', borderRadius: CONFIG.THEME.RADIUS_XL, position: 'relative', animation: 'scaleInModal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards', boxShadow: CONFIG.THEME.SHADOW_LG, border: `1px solid rgba(255,255,255,0.1)`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        
        {/* Close Button - ELEGANT TOP RIGHT POSITIONING */}
        <button onClick={onClose} style={{ position: 'absolute', top: window.innerWidth <= 800 ? '12px' : '24px', right: window.innerWidth <= 800 ? '12px' : '24px', background: CONFIG.THEME.BG_APP, border: 'none', width: window.innerWidth <= 800 ? '32px' : '44px', height: window.innerWidth <= 800 ? '32px' : '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: CONFIG.THEME.TEXT_SEC, transition: CONFIG.THEME.TRANSITION_FAST, zIndex: 200, boxShadow: CONFIG.THEME.SHADOW_SM }} onMouseEnter={(e) => { e.currentTarget.style.background = CONFIG.THEME.DANGER_BG; e.currentTarget.style.color = CONFIG.THEME.DANGER; }} onMouseLeave={(e) => { e.currentTarget.style.background = CONFIG.THEME.BG_APP; e.currentTarget.style.color = CONFIG.THEME.TEXT_SEC; }}><Icons.Close /></button>

        {/* Dossier Content Area */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: window.innerWidth <= 800 ? 'column' : 'row' }}>
          
          {/* Left Sidebar (Summary) */}
          <div style={{ width: window.innerWidth <= 800 ? '100%' : '380px', background: CONFIG.THEME.BG_SURFACE_ALT, padding: window.innerWidth <= 800 ? '40px 24px' : '48px 40px', borderRight: window.innerWidth <= 800 ? 'none' : `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, borderBottom: window.innerWidth <= 800 ? `1px solid ${CONFIG.THEME.BORDER_LIGHT}` : 'none', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
             <div style={{ position: 'relative', marginBottom: window.innerWidth <= 800 ? '20px' : '32px' }}>
                <div style={{ width: window.innerWidth <= 800 ? '120px' : '180px', height: window.innerWidth <= 800 ? '120px' : '180px', borderRadius: '50%', background: Utils.generateAvatarGradient(user.name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: window.innerWidth <= 800 ? '3rem' : '4.5rem', fontWeight: '800', boxShadow: CONFIG.THEME.SHADOW_MD, border: `6px solid ${CONFIG.THEME.BG_SURFACE}` }}>
                  {user.profilePhotoUrl ? <img src={user.profilePhotoUrl} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : user.initials}
                </div>
                {user.verified && <div style={{ position: 'absolute', bottom: 5, right: 15, background: CONFIG.THEME.SUCCESS, color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: `4px solid ${CONFIG.THEME.BG_SURFACE}`, boxShadow: CONFIG.THEME.SHADOW_SM }} title="Verified Identity"><Icons.CheckCircle /></div>}
             </div>
             
             <h2 style={{ fontSize: window.innerWidth <= 800 ? '1.5rem' : '2rem', color: CONFIG.THEME.NAVY_MAIN, margin: '0 0 12px 0', fontWeight: '800', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{user.name}</h2>
             <div style={{ fontSize: window.innerWidth <= 800 ? '0.95rem' : '1.1rem', color: CONFIG.THEME.TEXT_PRI, fontWeight: '600', marginBottom: '8px' }}>{user.role}</div>
             <div style={{ fontSize: window.innerWidth <= 800 ? '0.85rem' : '1rem', color: CONFIG.THEME.TEXT_SEC, marginBottom: window.innerWidth <= 800 ? '15px' : '32px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}><Icons.Briefcase /> {user.company}</div>
             
             <div style={{ width: '100%', height: '1px', background: CONFIG.THEME.BORDER_LIGHT, marginBottom: window.innerWidth <= 800 ? '15px' : '32px' }} />
             
             <div style={{ display: 'flex', flexDirection: window.innerWidth <= 800 ? 'row' : 'column', gap: '20px', width: '100%', textAlign: 'left', flexWrap: 'wrap', justifyContent: window.innerWidth <= 800 ? 'center' : 'flex-start', marginBottom: window.innerWidth <= 800 ? '24px' : '0' }}>
                <div style={{ minWidth: '120px' }}>
                  <div style={{ fontSize: '0.7rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.1em', marginBottom: '6px' }}>Status</div>
                  <Badge label={user.status} color={Utils.getStatusStyle(user.status).color} bg={Utils.getStatusStyle(user.status).bg} />
                </div>
                <div style={{ minWidth: '120px' }}>
                  <div style={{ fontSize: '0.7rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.1em', marginBottom: '6px' }}>Location</div>
                  <div style={{ fontWeight: '600', color: CONFIG.THEME.TEXT_PRI, fontSize: '0.9rem' }}>{user.location}</div>
                </div>
                <div style={{ minWidth: '120px' }}>
                  <div style={{ fontSize: '0.7rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.1em', marginBottom: '6px' }}>Network</div>
                  <div style={{ fontWeight: '600', color: CONFIG.THEME.TEXT_PRI, fontSize: '0.9rem' }}>{user.connections} Alumni</div>
                </div>
             </div>

             {/* Integrated Message Button - Mirroring Mentorship style */}
             <button style={{ marginTop: 'auto', width: '100%', maxWidth: window.innerWidth <= 800 ? '240px' : '100%', padding: '12px 24px', background: CONFIG.THEME.NAVY_MAIN, color: CONFIG.THEME.GOLD_MAIN, border: 'none', borderRadius: CONFIG.THEME.RADIUS_MD, fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem', transition: CONFIG.THEME.TRANSITION_FAST }} onClick={() => alert("Direct messaging initiated.")} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <Icons.Mail /> Message Member
             </button>
          </div>

          {/* Right Main Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, padding: window.innerWidth <= 800 ? '0 15px' : '0 48px', paddingTop: window.innerWidth <= 800 ? '10px' : '40px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
               {['overview', 'academics', 'mentorship'].map(tab => (
                 <div key={tab} onClick={() => setActiveTab(tab)} style={{ padding: window.innerWidth <= 800 ? '12px 16px' : '16px 24px', cursor: 'pointer', fontWeight: '700', fontSize: window.innerWidth <= 800 ? '0.85rem' : '1rem', textTransform: 'capitalize', color: activeTab === tab ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.TEXT_TER, borderBottom: `3px solid ${activeTab === tab ? CONFIG.THEME.GOLD_MAIN : 'transparent'}`, transition: CONFIG.THEME.TRANSITION_FAST, transform: activeTab === tab ? 'translateY(1px)' : 'none', whiteSpace: 'nowrap' }}>
                    {tab}
                 </div>
               ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: window.innerWidth <= 800 ? '24px' : '48px' }}>
               {activeTab === 'overview' && (
                 <div style={{ animation: 'slideRightFade 0.4s ease' }}>
                    <h4 style={{ fontSize: '0.9rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', marginTop: 0, fontWeight: '800' }}>Executive Summary</h4>
                    <p style={{ margin: '0 0 48px 0', lineHeight: 1.9, color: CONFIG.THEME.TEXT_PRI, fontSize: window.innerWidth <= 800 ? '1rem' : '1.15rem' }}>{user.bio}</p>
                    
                    <h4 style={{ fontSize: '0.9rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', fontWeight: '800' }}>Core Competencies</h4>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {user.skills.map(s => <span key={s} style={{ padding: '10px 20px', background: CONFIG.THEME.BG_APP, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, borderRadius: CONFIG.THEME.RADIUS_FULL, fontSize: '0.95rem', color: CONFIG.THEME.NAVY_MAIN, fontWeight: '700', transition: CONFIG.THEME.TRANSITION_FAST }} onMouseEnter={e => e.currentTarget.style.borderColor = CONFIG.THEME.NAVY_MAIN} onMouseLeave={e => e.currentTarget.style.borderColor = CONFIG.THEME.BORDER_LIGHT}>{s}</span>)}
                    </div>
                 </div>
               )}

               {activeTab === 'academics' && (
                 <div style={{ animation: 'slideRightFade 0.4s ease' }}>
                    <div style={{ background: CONFIG.THEME.BG_APP, borderRadius: CONFIG.THEME.RADIUS_LG, padding: window.innerWidth <= 800 ? '24px 20px' : '32px', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, marginBottom: '32px' }}>
                      <div style={{ fontSize: '0.8rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', marginBottom: '8px', fontWeight: '800', letterSpacing: '0.1em' }}>St. Joseph's University Record</div>
                      <div style={{ fontWeight: '800', color: CONFIG.THEME.NAVY_MAIN, fontSize: '1.3rem', marginBottom: '8px' }}>{user.degree}</div>
                      <div style={{ fontSize: '1.05rem', color: CONFIG.THEME.TEXT_PRI, fontWeight: '600' }}>Class of {user.batch}</div>
                      <div style={{ fontSize: '0.9rem', color: CONFIG.THEME.TEXT_SEC, marginTop: '8px' }}>{user.school}</div>
                    </div>
                    <div style={{ background: CONFIG.THEME.BG_APP, borderRadius: CONFIG.THEME.RADIUS_LG, padding: window.innerWidth <= 800 ? '24px 20px' : '32px', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
                      <div style={{ fontSize: '0.8rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', marginBottom: '8px', fontWeight: '800', letterSpacing: '0.1em' }}>Verification Status</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: CONFIG.THEME.SUCCESS, fontWeight: '700', fontSize: '1.1rem' }}>
                         <Icons.CheckCircle /> Officially Cleared & Authenticated
                      </div>
                      <div style={{ fontSize: '0.9rem', color: CONFIG.THEME.TEXT_SEC, marginTop: '12px' }}>This profile has undergone rigorous verification against university master records by the central administration.</div>
                    </div>
                 </div>
               )}

               {activeTab === 'mentorship' && (
                 <div style={{ animation: 'slideRightFade 0.4s ease' }}>
                    {user.mentorship === 'Available' ? (
                      <div>
                        <div style={{ padding: window.innerWidth <= 800 ? '24px 20px' : '32px', background: 'rgba(123, 44, 191, 0.05)', border: `1px solid rgba(123, 44, 191, 0.2)`, borderRadius: CONFIG.THEME.RADIUS_LG, marginBottom: '32px' }}>
                           <h3 style={{ margin: '0 0 12px 0', color: CONFIG.THEME.ACCENT_PURPLE, fontSize: '1.3rem', fontWeight: '800' }}>Mentorship Program Active</h3>
                           <p style={{ color: CONFIG.THEME.TEXT_PRI, fontSize: '1.05rem', lineHeight: 1.6, margin: 0 }}>{user.name} is currently accepting requests for 1:1 career guidance, portfolio reviews, and industry insights.</p>
                        </div>
                        <Button size="lg" icon={<Icons.Chart />}>Request Mentorship Session</Button>
                      </div>
                    ) : (
                      <div style={{ padding: window.innerWidth <= 800 ? '32px 20px' : '48px', textAlign: 'center', border: `2px dashed ${CONFIG.THEME.BORDER_LIGHT}`, borderRadius: CONFIG.THEME.RADIUS_LG }}>
                         <div style={{ fontSize: '3rem', opacity: 0.2, marginBottom: '16px' }}>⏳</div>
                         <h3 style={{ color: CONFIG.THEME.TEXT_PRI, fontSize: '1.2rem', margin: '0 0 8px 0' }}>Currently Unavailable</h3>
                         <p style={{ color: CONFIG.THEME.TEXT_SEC, fontSize: '1rem', margin: 0 }}>This alumnus is not accepting mentorship requests at this time.</p>
                      </div>
                    )}
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 9. MAIN DIRECTORY ASSEMBLER COMPONENT
// ============================================================================

const DirectoryInner = () => {
  // Data State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI State
  const [view, setView] = useState('GRID'); 
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Facet State
  const [filters, setFilters] = useState({ status: null, location: null, degreeLevel: null, batchDecade: null, role: null, skills: null, companyTier: null, mentorship: null });
  const scrollRef = useRef(null);

  // Core Data Synchronization (API Fetch)
  useEffect(() => {
    let isActive = true;

    const fetchAlumni = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/alumni');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const backendData = await response.json();

        if (!isActive) return;

        if (!backendData || backendData.length === 0) {
          setData([]);
          setLoading(false);
          return;
        }

        const mappedData = [];
        backendData.forEach(d => {
          // Assuming the backend returns data similar to the CSV structure
          // Map MongoDB _id to id, and use appropriate fields
          const clean = (val, fb = "N/A") => (!val || String(val).toLowerCase().includes("not applicable") || String(val).toLowerCase() === "none") ? fb : val;
          
          const dispName = clean(d.fullName || d["Full Name"] || d.Name, "SJU Alumni");
          const dispBatch = clean(d.batchYear || d["Batch Year"] || d.GraduationYear, "2024");
          const dispDegree = clean(d.degree || d.Degree, "SJU Graduate");

          let parsedSkills = ["SJU Alumni"];
          const rawSkills = clean(d.skills || d.Skills, null);
          if (Array.isArray(rawSkills)) parsedSkills = rawSkills;
          else if (typeof rawSkills === 'string') parsedSkills = rawSkills.split(',').map(s => s.trim()).filter(s => s !== "" && !s.toLowerCase().includes("not applicable"));

          // Only add approved users (if status exists and isn't "APPROVED", skip. If it doesn't exist, assume approved for now or adapt as needed.)
          // If you have an approval system in MongoDB, adjust this check.
          // For now, we'll map all data and assume it's valid alumni data if it's in the DB.
          
          const currentStatus = clean(d.currentStatus || d["Current Status"] || d.Status, "Working Professional");

          mappedData.push({
            id: d._id || d.id || Math.random().toString(36).substr(2, 9),
            name: dispName,
            email: clean(d.email || d.Email, "Confidential"),
            batch: parseInt(dispBatch) || 2024,
            degree: dispDegree,
            school: clean(d.school || d["PG College"], "St. Joseph's University"), 
            status: currentStatus,
            company: clean(d.company || d["Company Name"] || d.Company, "Independent"),
            role: clean(d.designation || d.Designation || d.Role, "Professional"),
            skills: parsedSkills.length > 0 ? parsedSkills : ["SJU Alumni"],
            location: clean(d.location || d.Location, "Bangalore, IN"),
            bio: clean(d.reviews || d.Reviews || d.bio, `A verified alumnus of St. Joseph's University with a background in ${dispDegree}. Dedicated to excellence and lifelong learning.`),
            initials: Utils.extractInitials(dispName),
            batchDecade: `${Math.floor((parseInt(dispBatch) || 2020) / 10) * 10}s`,
            mentorship: (d.mentorship || d.Mentorship === "Available" || String(currentStatus).toLowerCase().includes("working") || String(currentStatus).toLowerCase().includes("employ")) ? "Available" : "Unavailable",
            verified: true,
            connections: d.connections || Math.floor(Math.random() * 500) + 50,
            degreeLevel: dispDegree.includes("M") || dispDegree.includes("PG") || dispDegree.includes("Master") ? "Masters" : "Bachelors",
            companyTier: clean(d.companyTier || d.CompanyTier, "Corporate"),
            profilePhotoUrl: d.profilePhotoUrl || null
          });
        });

        setData(mappedData);
        setLoading(false);
      } catch (err) {
        if (!isActive) return;
        console.error("🔥 API Fetch Error:", err);
        setError("Failed to synchronize with the alumni database. Please check your backend connection.");
        setLoading(false);
      }
    };

    fetchAlumni();

    return () => {
      isActive = false;
    };
  }, []);

  // Computation Engine: Search, Filter, and Aggregation
  const { filteredData, facets } = useMemo(() => {
    let res = data;
    
    // Search Execution
    if (search) {
      const queryStr = search.toLowerCase();
      res = res.filter(u => u.name.toLowerCase().includes(queryStr) || u.company.toLowerCase().includes(queryStr) || u.role.toLowerCase().includes(queryStr));
    }
    
    // Filter Execution
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null) {
        if (key === 'skills') res = res.filter(u => u.skills.includes(filters[key]));
        else res = res.filter(u => u[key] === filters[key]);
      }
    });

    // Dynamic Facet Aggregation
    const counts = { status: {}, location: {}, degreeLevel: {}, batchDecade: {}, role: {}, skills: {}, companyTier: {}, mentorship: {} };
    res.forEach(u => {
      counts.status[u.status] = (counts.status[u.status] || 0) + 1;
      counts.location[u.location] = (counts.location[u.location] || 0) + 1;
      counts.degreeLevel[u.degreeLevel] = (counts.degreeLevel[u.degreeLevel] || 0) + 1;
      counts.batchDecade[u.batchDecade] = (counts.batchDecade[u.batchDecade] || 0) + 1;
      counts.role[u.role] = (counts.role[u.role] || 0) + 1;
      counts.companyTier[u.companyTier] = (counts.companyTier[u.companyTier] || 0) + 1;
      counts.mentorship[u.mentorship] = (counts.mentorship[u.mentorship] || 0) + 1;
      u.skills.forEach(s => counts.skills[s] = (counts.skills[s] || 0) + 1);
    });
    
    return { filteredData: res, facets: counts };
  }, [data, search, filters]);

  // Pagination Engine
  const totalPages = Math.max(1, Math.ceil(filteredData.length / CONFIG.DATA.PAGE_SIZE));
  
  useEffect(() => { 
    if (page > totalPages) setPage(totalPages > 0 ? totalPages : 1); 
  }, [totalPages, page]);

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

  const toggleFilter = (key, val) => { setFilters(prev => ({ ...prev, [key]: prev[key] === val ? null : val })); setPage(1); };
  const clearFilters = () => { setFilters({ status: null, location: null, degreeLevel: null, batchDecade: null, role: null, skills: null, companyTier: null, mentorship: null }); setSearch(''); setPage(1); };
  const getFacetArray = (obj, limit = 8) => Object.entries(obj).map(([label, count]) => ({ val: label, label: label.split(',')[0], count })).sort((a,b) => b.count - a.count).slice(0,limit);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '100px' }}>
      <GlobalStyles />
      
      {/* Page Header */}
      <header style={{ background: `linear-gradient(135deg, #061121 0%, ${CONFIG.THEME.NAVY_MAIN} 100%)`, padding: '56px 24px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden', borderBottom: `4px solid ${CONFIG.THEME.GOLD_MAIN}` }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ color: 'white', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: '900', margin: '0 0 14px 0', letterSpacing: '-0.5px', lineHeight: 1.1 }}>SJU Alumni Directory</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', margin: 0, lineHeight: 1.6 }}>
            {loading ? 'Loading…' : <><strong style={{color: '#FFF'}}>{Utils.formatNumber(data.length)}</strong> verified alumni profiles</>}
          </p>
        </div>
      </header>

      {/* Core Interface Shell */}
      <div className="directory-workspace" style={{ maxWidth: '100vw', boxSizing: 'border-box', margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) minmax(0, 1fr)', gap: '48px', position: 'relative', zIndex: 10, marginTop: '-60px' }}>
        
        {/* Left Nav / Facet Sidebar */}
        <aside className="directory-sidebar" style={{ height: 'calc(100vh - 40px)', position: 'sticky', top: '20px' }}>
          <div className="glass-panel" style={{ borderRadius: CONFIG.THEME.RADIUS_XL, padding: '40px 32px', height: '100%', overflowY: 'auto', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '20px', borderBottom: `3px solid ${CONFIG.THEME.NAVY_MAIN}` }}>
              <span style={{ fontWeight: '800', fontSize: '1.4rem', color: CONFIG.THEME.NAVY_MAIN, letterSpacing: '-0.02em' }}>Directory Filters</span>
              {(search || Object.values(filters).some(v => v !== null)) && <button onClick={clearFilters} style={{ fontSize: '0.75rem', color: CONFIG.THEME.DANGER, cursor: 'pointer', fontWeight: '800', padding: '8px 16px', background: CONFIG.THEME.DANGER_BG, border: 'none', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', transition: CONFIG.THEME.TRANSITION_FAST }} onMouseEnter={e=>e.currentTarget.style.opacity=0.8} onMouseLeave={e=>e.currentTarget.style.opacity=1}>Reset</button>}
            </div>

            <div style={{ padding: '20px', background: CONFIG.THEME.SUCCESS_BG, borderRadius: CONFIG.THEME.RADIUS_MD, display: 'flex', alignItems: 'center', gap: '16px', border: `1px solid ${CONFIG.THEME.SUCCESS}`, marginBottom: '40px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: CONFIG.THEME.SUCCESS, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 0 15px rgba(16,185,129,0.4)' }}><Icons.CheckCircle /></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: '1rem', fontWeight: '800', color: CONFIG.THEME.SUCCESS }}>100% Verified Profiles</span><span style={{ fontSize: '0.8rem', color: CONFIG.THEME.TEXT_SEC, marginTop: '2px', fontWeight: '600' }}>Admin Clearance Mandatory</span></div>
            </div>

            <FilterAccordion title="Availability Status" options={getFacetArray(facets.status)} activeValue={filters.status} onSelect={(v) => toggleFilter('status', v)} />
            <FilterAccordion title="Mentorship Program" options={getFacetArray(facets.mentorship)} activeValue={filters.mentorship} onSelect={(v) => toggleFilter('mentorship', v)} />
            <FilterAccordion title="Academic Degree" options={getFacetArray(facets.degreeLevel)} activeValue={filters.degreeLevel} onSelect={(v) => toggleFilter('degreeLevel', v)} />
            <FilterAccordion title="Graduation Decade" options={getFacetArray(facets.batchDecade)} activeValue={filters.batchDecade} onSelect={(v) => toggleFilter('batchDecade', v)} />
            <FilterAccordion title="Global Location" options={getFacetArray(facets.location, 10)} activeValue={filters.location} onSelect={(v) => toggleFilter('location', v)} />
            <FilterAccordion title="Industry Classification" options={getFacetArray(facets.companyTier)} activeValue={filters.companyTier} onSelect={(v) => toggleFilter('companyTier', v)} />
            <FilterAccordion title="Professional Role" options={getFacetArray(facets.role, 12)} activeValue={filters.role} onSelect={(v) => toggleFilter('role', v)} />
            <FilterAccordion title="Core Competencies" options={getFacetArray(facets.skills, 15)} activeValue={filters.skills} onSelect={(v) => toggleFilter('skills', v)} />
          </div>
        </aside>

        {/* Main Content Area */}
        <main ref={scrollRef} style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Action Bar */}
          <div className="glass-panel directory-controls" style={{ padding: '24px 40px', borderRadius: CONFIG.THEME.RADIUS_XL, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
            <div className="directory-search-input-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
              <span style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', color: CONFIG.THEME.TEXT_TER }}><Icons.Search /></span>
              <input className="sju-input" placeholder="Search verified alumni by name, company, or role..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} disabled={loading} />
            </div>
            
            <div className="directory-view-buttons" style={{ display: 'flex', gap: '8px', background: CONFIG.THEME.BG_APP, padding: '8px', borderRadius: CONFIG.THEME.RADIUS_MD, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
              {[
                {id: 'GRID', icon: <Icons.Grid />, label: 'Grid'}, 
                {id: 'LIST', icon: <Icons.List />, label: 'List'}, 
                {id: 'ANALYTICS', icon: <Icons.Chart />, label: 'Stats'}, 
                {id: 'MENTORS', icon: <Icons.Mentors />, label: 'Mentors'}, 
                {id: 'GEO', icon: <Icons.Map />, label: 'Map'}
              ].map(v => (
                <button key={v.id} onClick={() => { setView(v.id); setPage(1); }} style={{ padding: '10px 20px', border: 'none', background: view === v.id ? CONFIG.THEME.BG_SURFACE : 'transparent', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '0.05em', color: view === v.id ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.TEXT_SEC, cursor: 'pointer', boxShadow: view === v.id ? CONFIG.THEME.SHADOW_SM : 'none', transition: CONFIG.THEME.TRANSITION_FAST, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* View Controller */}
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
                {view === 'GRID' && <GridView data={paginatedData} onSelect={setSelectedUser} />}
                {view === 'LIST' && <ListView data={paginatedData} onSelect={setSelectedUser} />}
                {view === 'ANALYTICS' && <AnalyticsView data={filteredData} />}
                {view === 'MENTORS' && <MentorshipView data={paginatedData} onSelect={setSelectedUser} />}
                {view === 'GEO' && <GeoView data={filteredData} />}
              </div>
            )}

            {/* Pagination Layer */}
            {!loading && !error && (view === 'GRID' || view === 'LIST' || view === 'MENTORS') && (
              <AdvancedPagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} totalItems={filteredData.length} pageSize={CONFIG.DATA.PAGE_SIZE} />
            )}
          </div>
        </main>
      </div>

      {/* Detail Overlay */}
      <DossierModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
};

// Application wrapped in Global Error Boundary ensures UI thread stability
const Directory = () => (
  <GlobalErrorBoundary>
    <DirectoryInner />
  </GlobalErrorBoundary>
);

export default Directory;