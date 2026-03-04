//// src/MentorshipGateway.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";

/**
 * =================================================================================
 * SJU MENTORSHIP GATEWAY: UNIFIED ENHANCED ENTERPRISE BUILD (MERGED)
 * =================================================================================
 * Architecture & Features Preserved:
 * - Typography: Strictly enforces "Lora" serif font.
 * - Views: Seamless Views (Grid, List, Analytics).
 * - Filtering: Dynamic Faceted Filters with smooth accordion animations.
 * - Booking: Integrated multi-step Booking Wizard.
 * - Analytics: Custom React-SVG PowerBI-Style visualizations.
 * - Firebase: Production-ready Firestore integration with SAFE dynamic fallback.
 * =================================================================================
 */

/* =========================================================
   1) CONFIGURATION & THEME
   ========================================================= */
const CONFIG = {
  SYSTEM: {
    APP_NAME: "SJU Mentorship Connect",
    VERSION: "3.0.0 Enterprise",
    ORG: "St. Joseph's University"
  },
  DATA: {
    TOTAL_RECORDS: 1500, // Balanced from both versions
    PAGE_SIZE: 12
  },
  THEME: {
    NAVY_DARK: '#061121',
    NAVY_MAIN: '#0C2340',
    NAVY_LITE: '#1A3B66',
    GOLD_MAIN: '#D4AF37', 
    GOLD_LITE: '#F9F1D8',
    ACCENT_CYAN: '#00B4D8',
    ACCENT_PURPLE: '#7B2CBF',
    SUCCESS: '#10B981',
    SUCCESS_BG: 'rgba(16, 185, 129, 0.1)',
    WARNING: '#F59E0B',
    WARNING_BG: 'rgba(245, 158, 11, 0.1)',
    DANGER: '#EF4444',
    DANGER_BG: 'rgba(239, 68, 68, 0.1)',
    INFO: '#3B82F6',
    INFO_BG: 'rgba(59, 130, 246, 0.1)',
    BG_APP: '#F4F7F9',
    BG_SURFACE: '#FFFFFF',
    BG_SURFACE_ALT: '#F8FAFC',
    BORDER: 'rgba(12, 35, 64, 0.12)',
    BORDER_LIGHT: '#E2E8F0',
    TEXT_PRI: '#0F172A',
    TEXT_SEC: '#475569',
    TEXT_TER: '#94A3B8',
    RADIUS_SM: '6px',
    RADIUS_MD: '12px',
    RADIUS_LG: '20px',
    RADIUS_XL: '32px',
    RADIUS_FULL: '9999px',
    SHADOW_SM: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    SHADOW_MD: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
    SHADOW_LG: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    SHADOW_HOVER: '0 30px 60px -15px rgba(0, 0, 0, 0.25), 0 0 20px rgba(212, 175, 55, 0.15)',
    TRANSITION_FAST: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    TRANSITION_SMOOTH: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    TRANSITION_BOUNCE: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
  }
};

/* =========================================================
   2) EXPANDED ENTERPRISE MOCK DATABASE
   ========================================================= */
const MockDB = {
  firstNames: ["Aarav", "Diya", "David", "Sarah", "Yusuf", "Aisha", "Wei", "Priya", "Rohan", "Emma", "Kavya", "Arjun", "Sanya", "Liam", "Olivia"],
  lastNames: ["Sharma", "Patel", "Smith", "Jones", "Khan", "Martinez", "Chen", "Reddy", "Gowda", "Williams", "Verma", "Iyer", "Nair", "Brown", "Taylor"],
  domains: ["Product Management", "Data Science", "Investment Banking", "Software Engineering", "Corporate Law", "Digital Marketing", "Civil Services", "Entrepreneurship", "Biotech Research"],
  companies: [
    { name: "Google", tier: "MNC" }, { name: "Microsoft", tier: "MNC" }, { name: "Amazon", tier: "MNC" },
    { name: "Goldman Sachs", tier: "Finance" }, { name: "McKinsey", tier: "Consulting" },
    { name: "Tesla", tier: "Auto" }, { name: "SJU Research", tier: "Academic" }, 
    { name: "Deloitte", tier: "Consulting" }, { name: "Zerodha", tier: "Fintech" }, { name: "Swiggy", tier: "Startup" }
  ],
  languages: ["English", "Hindi", "Kannada", "Tamil", "Telugu", "Spanish", "French", "German"],
  sessionTypes: ["1:1 Call", "Mock Interview", "Resume Review", "Long-term Mentorship"],

  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],

  generate: (count = CONFIG.DATA.TOTAL_RECORDS) => {
    const data = [];
    for (let i = 1; i <= count; i++) {
      const domain = MockDB.pick(MockDB.domains);
      const comp = MockDB.pick(MockDB.companies);
      const fname = MockDB.pick(MockDB.firstNames);
      const lname = MockDB.pick(MockDB.lastNames);
      const experience = Math.floor(Math.random() * 25) + 2;

      let tier = "Peer Mentor";
      if (experience > 10) tier = "Industry Leader";
      else if (experience > 5) tier = "Senior Mentor";

      const price = experience > 10 ? 2000 : (experience > 5 ? 1000 : 0);

      data.push({
        id: `MENTOR-${20000 + i}`,
        name: `${fname} ${lname}`,
        email: `${fname.toLowerCase()}.${lname.toLowerCase()}@alumni.sju.edu`,
        domain: domain,
        company: comp.name,
        companyTier: comp.tier,
        role: i % 3 === 0 ? "Director" : (i % 2 === 0 ? "Senior Manager" : "Associate"),
        tier: tier,
        experience: experience,
        languages: [...new Set(["English", MockDB.pick(MockDB.languages)])],
        sessionTypes: [...new Set([MockDB.sessionTypes[0], MockDB.pick(MockDB.sessionTypes)])],
        availability: i % 5 === 0 ? "Weekends Only" : (i % 3 === 0 ? "Evenings" : "Flexible"),
        rating: (4.0 + Math.random()).toFixed(1),
        sessionsConducted: Math.floor(Math.random() * 200),
        responseRate: Math.floor(Math.random() * (100 - 80) + 80),
        initials: `${fname[0]}${lname[0]}`,
        isTopRated: Math.random() > 0.85,
        price: price,
        priceCategory: price === 0 ? 'Free' : 'Paid',
        bio: `Driven ${domain} professional with ${experience} years of experience at top-tier firms like ${comp.name}. Passionate about guiding the next generation of SJU leaders through focused mentoring and actionable insights.`
      });
    }
    return data;
  }
};

/* =========================================================
   3) GLOBAL STYLES & ANIMATION ENGINE
   ========================================================= */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
    
    body {
      margin: 0; padding: 0;
      background-color: ${CONFIG.THEME.BG_APP};
      font-family: 'Lora', serif;
      color: ${CONFIG.THEME.TEXT_PRI};
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow-x: hidden; line-height: 1.6;
    }

    * { box-sizing: border-box; }
    h1, h2, h3, h4, h5, h6, button, input, select, textarea, span, p, div, table, th, td { font-family: 'Lora', serif; }

    ::-webkit-scrollbar { width: 12px; height: 12px; }
    ::-webkit-scrollbar-track { background: ${CONFIG.THEME.BG_APP}; border-left: 1px solid ${CONFIG.THEME.BORDER_LIGHT}; }
    ::-webkit-scrollbar-thumb { background: ${CONFIG.THEME.BORDER}; border-radius: 10px; border: 3px solid ${CONFIG.THEME.BG_APP}; }
    ::-webkit-scrollbar-thumb:hover { background: ${CONFIG.THEME.TEXT_TER}; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUpFade { from { opacity: 0; transform: translateY(25px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleInModal { from { opacity: 0; transform: scale(0.97) translateY(15px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes slideLeft { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }

    .animated-card {
      background: ${CONFIG.THEME.BG_SURFACE}; border-radius: ${CONFIG.THEME.RADIUS_LG};
      border: 1px solid ${CONFIG.THEME.BORDER_LIGHT}; transition: ${CONFIG.THEME.TRANSITION_BOUNCE};
      cursor: pointer; position: relative; overflow: hidden; z-index: 1;
    }
    .animated-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
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
      content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
      background: ${CONFIG.THEME.GOLD_MAIN}; transform: scaleY(0); transition: transform 0.2s ease; transform-origin: center;
    }
    .animated-row:hover::after { transform: scaleY(1); }

    .glass-panel {
      background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: ${CONFIG.THEME.SHADOW_SM};
    }

    .sju-input {
      width: 100%; padding: 16px 20px 16px 48px; border-radius: ${CONFIG.THEME.RADIUS_FULL};
      border: 1px solid ${CONFIG.THEME.BORDER_LIGHT}; font-size: 1rem; background: ${CONFIG.THEME.BG_SURFACE}; 
      transition: all 0.3s ease; color: ${CONFIG.THEME.TEXT_PRI};
    }
    .sju-input:focus { border-color: ${CONFIG.THEME.NAVY_MAIN}; box-shadow: 0 0 0 4px rgba(12, 35, 64, 0.1); outline: none; }
  `}</style>
);

/* =========================================================
   4) UTILITIES & FORMATTERS
   ========================================================= */
const Utils = {
  formatNumber: (num) => num > 999 ? (num / 1000).toFixed(1) + 'k' : num.toString(),
  formatCurrency: (amount) => amount === 0 ? "Free" : `₹${amount}/hr`,
  
  generateAvatarGradient: (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const h1 = Math.abs(hash) % 50 + 200; 
    const h2 = (h1 + 40) % 360;
    return `linear-gradient(135deg, hsl(${h1}, 70%, 25%), hsl(${h2}, 80%, 40%))`;
  }
};

/* =========================================================
   5) ATOMIC UI COMPONENTS
   ========================================================= */
const Badge = ({ label, color, bg, icon, outline = false }) => (
  <span style={{ 
    display: 'inline-flex', alignItems: 'center', gap: '6px', 
    padding: '4px 12px', borderRadius: CONFIG.THEME.RADIUS_FULL, 
    fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', color: color, 
    backgroundColor: outline ? 'transparent' : bg || `${color}15`,
    border: outline ? `1px solid ${color}` : `1px solid transparent`, whiteSpace: 'nowrap'
  }}>
    {icon && <span>{icon}</span>} {label}
  </span>
);

const Button = ({ children, onClick, variant = 'primary', active = false, fullWidth = false, disabled = false }) => {
  let baseStyle = {
    padding: '12px 24px', borderRadius: CONFIG.THEME.RADIUS_FULL, fontWeight: '700', fontSize: '0.875rem',
    cursor: disabled ? 'not-allowed' : 'pointer', transition: CONFIG.THEME.TRANSITION_FAST,
    width: fullWidth ? '100%' : 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', border: 'none', opacity: disabled ? 0.6 : 1, textTransform: 'uppercase', letterSpacing: '0.1em'
  };

  if (variant === 'primary') {
    baseStyle = { ...baseStyle, background: CONFIG.THEME.NAVY_MAIN, color: CONFIG.THEME.GOLD_MAIN, boxShadow: CONFIG.THEME.SHADOW_SM };
  } else if (variant === 'outline') {
    baseStyle = { ...baseStyle, background: 'transparent', color: active ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.NAVY_MAIN, border: `2px solid ${active ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.NAVY_MAIN}` };
  } else if (variant === 'ghost') {
    baseStyle = { ...baseStyle, background: active ? CONFIG.THEME.BG_SURFACE : 'transparent', color: active ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.TEXT_SEC, boxShadow: active ? CONFIG.THEME.SHADOW_SM : 'none' };
  }

  return (
    <button 
      onClick={onClick} disabled={disabled} style={baseStyle}
      onMouseEnter={(e) => { 
        if (!disabled) {
          if (variant === 'primary') e.currentTarget.style.transform = 'translateY(-2px)';
          if (variant === 'outline') { e.currentTarget.style.background = CONFIG.THEME.NAVY_MAIN; e.currentTarget.style.color = CONFIG.THEME.GOLD_MAIN; }
        }
      }}
      onMouseLeave={(e) => { 
        if (!disabled) {
          if (variant === 'primary') e.currentTarget.style.transform = 'translateY(0)';
          if (variant === 'outline') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = CONFIG.THEME.NAVY_MAIN; }
        }
      }}
    >
      {children}
    </button>
  );
};

const FilterAccordion = ({ title, options, activeValue, onSelect }) => {
  const [isOpen, setIsOpen] = useState(true);
  if (!options || options.length === 0) return null;

  return (
    <div style={{ marginBottom: '16px', borderBottom: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingBottom: '16px' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: CONFIG.THEME.NAVY_MAIN, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', color: CONFIG.THEME.TEXT_TER }}>▼</span>
      </div>
      
      <div style={{ 
        maxHeight: isOpen ? '600px' : '0px', overflow: 'hidden', transition: CONFIG.THEME.TRANSITION_SMOOTH,
        marginTop: isOpen ? '12px' : '0px', display: 'flex', flexDirection: 'column', gap: '4px'
      }}>
        {options.map(opt => {
          const isActive = activeValue === opt.val;
          return (
            <div 
              key={opt.val} onClick={() => onSelect(opt.val)} 
              style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', borderRadius: CONFIG.THEME.RADIUS_SM, 
                background: isActive ? CONFIG.THEME.NAVY_MAIN : 'transparent', 
                color: isActive ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.TEXT_SEC, 
                cursor: 'pointer', transition: CONFIG.THEME.TRANSITION_FAST, 
                fontSize: '0.9rem', fontWeight: isActive ? '700' : '500' 
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = CONFIG.THEME.BG_SURFACE_ALT; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{opt.label}</span>
              <span style={{ opacity: isActive ? 1 : 0.6, fontSize: '0.75rem' }}>{Utils.formatNumber(opt.count)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AdvancedPagination = ({ currentPage, totalPages, onPageChange, totalItems }) => {
  if (totalPages <= 1) return null;

  const handleNav = (dir) => {
    if (dir === 'first') onPageChange(1);
    if (dir === 'prev' && currentPage > 1) onPageChange(currentPage - 1);
    if (dir === 'next' && currentPage < totalPages) onPageChange(currentPage + 1);
    if (dir === 'last') onPageChange(totalPages);
  };

  const btnStyle = (disabled) => ({
    padding: '8px 16px', background: CONFIG.THEME.BG_SURFACE, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`,
    borderRadius: CONFIG.THEME.RADIUS_SM, color: disabled ? CONFIG.THEME.TEXT_TER : CONFIG.THEME.NAVY_MAIN,
    fontWeight: '700', fontSize: '0.875rem', cursor: disabled ? 'not-allowed' : 'pointer',
    transition: CONFIG.THEME.TRANSITION_FAST, display: 'flex', alignItems: 'center', gap: '6px'
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0', marginTop: '32px', borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
      <div style={{ fontSize: '0.875rem', color: CONFIG.THEME.TEXT_SEC }}>
        Showing <strong>{((currentPage - 1) * CONFIG.DATA.PAGE_SIZE) + 1}</strong> to <strong>{Math.min(currentPage * CONFIG.DATA.PAGE_SIZE, totalItems)}</strong> of <strong>{totalItems}</strong> entries
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button onClick={() => handleNav('first')} disabled={currentPage === 1} style={btnStyle(currentPage === 1)}><span>«</span> First</button>
        <button onClick={() => handleNav('prev')} disabled={currentPage === 1} style={btnStyle(currentPage === 1)}><span>‹</span> Prev</button>
        <div style={{ padding: '8px 20px', background: CONFIG.THEME.NAVY_MAIN, color: CONFIG.THEME.GOLD_MAIN, borderRadius: CONFIG.THEME.RADIUS_SM, fontWeight: '700', fontSize: '0.875rem', boxShadow: CONFIG.THEME.SHADOW_SM }}>Page {currentPage} of {totalPages}</div>
        <button onClick={() => handleNav('next')} disabled={currentPage === totalPages} style={btnStyle(currentPage === totalPages)}>Next <span>›</span></button>
        <button onClick={() => handleNav('last')} disabled={currentPage === totalPages} style={btnStyle(currentPage === totalPages)}>Last <span>»</span></button>
      </div>
    </div>
  );
};

/* =========================================================
   6) BOOKING WIZARD COMPONENT
   ========================================================= */
const BookingWizard = ({ mentor, onClose, onConfirm }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const dates = ['Mon, 12th', 'Tue, 13th', 'Wed, 14th'];
  const times = ['10:00 AM', '02:00 PM', '04:30 PM'];

  return (
    <div style={{ padding: '10px 0', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '2rem', color: CONFIG.THEME.NAVY_MAIN, marginBottom: '8px', marginTop: 0 }}>Book Session</h2>
      <p style={{ color: CONFIG.THEME.TEXT_SEC, marginBottom: '32px', fontSize: '1.1rem' }}>Initiating request with <strong>{mentor.name}</strong></p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ flex: 1, height: '6px', borderRadius: '3px', background: s <= step ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.BORDER_LIGHT, transition: CONFIG.THEME.TRANSITION_SMOOTH }} />
        ))}
      </div>

      <div style={{ flex: 1, minHeight: '300px' }}>
        {step === 1 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h4 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: CONFIG.THEME.TEXT_PRI }}>Select Session Type</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {mentor.sessionTypes.map(type => (
                <div key={type} onClick={() => setSelectedType(type)} style={{ border: `2px solid ${selectedType === type ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.BORDER_LIGHT}`, borderRadius: CONFIG.THEME.RADIUS_LG, padding: '24px', cursor: 'pointer', background: selectedType === type ? CONFIG.THEME.GOLD_LITE : CONFIG.THEME.BG_SURFACE, transition: CONFIG.THEME.TRANSITION_FAST }}>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem', color: CONFIG.THEME.NAVY_MAIN, marginBottom: '8px' }}>{type}</div>
                  <div style={{ fontSize: '0.875rem', color: CONFIG.THEME.TEXT_SEC, fontWeight: '500' }}>60 Minutes • {Utils.formatCurrency(mentor.price)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h4 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: CONFIG.THEME.TEXT_PRI }}>Select Availability Slot</h4>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              {dates.map(d => <button key={d} style={{ padding: '12px 20px', borderRadius: CONFIG.THEME.RADIUS_FULL, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, background: CONFIG.THEME.BG_SURFACE, fontWeight: '700', color: CONFIG.THEME.TEXT_PRI, cursor: 'pointer' }}>{d}</button>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {times.map(t => (
                <button key={t} onClick={() => setSelectedDate(t)} style={{ padding: '16px', borderRadius: CONFIG.THEME.RADIUS_MD, border: `2px solid ${selectedDate === t ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.BORDER_LIGHT}`, background: selectedDate === t ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.BG_SURFACE, color: selectedDate === t ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.TEXT_PRI, fontWeight: '700', cursor: 'pointer', transition: CONFIG.THEME.TRANSITION_FAST }}>{t}</button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '40px 0', animation: 'scaleInModal 0.3s ease' }}>
            <div style={{ width: '96px', height: '96px', background: CONFIG.THEME.SUCCESS_BG, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', border: `2px solid ${CONFIG.THEME.SUCCESS}` }}>
              <span style={{ fontSize: '2.5rem', color: CONFIG.THEME.SUCCESS }}>✓</span>
            </div>
            <h3 style={{ margin: '0 0 12px 0', color: CONFIG.THEME.NAVY_MAIN, fontSize: '1.5rem', fontWeight: '700' }}>Ready to Confirm?</h3>
            <p style={{ color: CONFIG.THEME.TEXT_SEC, fontSize: '1.1rem', margin: 0 }}>{selectedType} on <strong>Tue, 13th at {selectedDate}</strong></p>
            <p style={{ color: CONFIG.THEME.TEXT_TER, fontSize: '0.875rem', marginTop: '16px' }}>Total Cost: {Utils.formatCurrency(mentor.price)}</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingTop: '24px', marginTop: '24px' }}>
        <Button variant="outline" onClick={() => step === 1 ? onClose() : setStep(s => s - 1)}>Back</Button>
        <Button variant="primary" disabled={(step === 1 && !selectedType) || (step === 2 && !selectedDate)} onClick={() => step === 3 ? onConfirm() : setStep(s => s + 1)}>{step === 3 ? 'Confirm Booking' : 'Next Step'}</Button>
      </div>
    </div>
  );
};

/* =========================================================
   7) VIEWS: GRID, LIST, ANALYTICS
   ========================================================= */

const GridView = ({ data, onSelect, onBook }) => {
  if (data.length === 0) return <EmptyState />;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
      {data.map((m, i) => (
        <div key={m.id} className="animated-card" style={{ animation: `slideUpFade 0.4s ease forwards ${Math.min(i * 0.04, 0.4)}s`, opacity: 0 }} onClick={() => onSelect(m)}>
          <div style={{ padding: '32px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', position: 'relative' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: Utils.generateAvatarGradient(m.name), color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: '700', boxShadow: CONFIG.THEME.SHADOW_MD }}>
                {m.initials}
              </div>
              {m.isTopRated && (
                <div style={{ position: 'absolute', bottom: 0, right: '50%', transform: 'translate(35px, 0)', background: CONFIG.THEME.GOLD_MAIN, color: CONFIG.THEME.NAVY_MAIN, borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', border: `2px solid ${CONFIG.THEME.BG_SURFACE}`, fontWeight: 'bold' }} title="Top Rated">★</div>
              )}
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', color: CONFIG.THEME.NAVY_MAIN, fontWeight: '700' }}>{m.name}</h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: CONFIG.THEME.TEXT_SEC, minHeight: '42px', lineHeight: 1.5 }}>
                {m.role} @ <strong style={{ color: CONFIG.THEME.TEXT_PRI }}>{m.company}</strong>
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px' }}>
              <Badge label={m.domain} color={CONFIG.THEME.NAVY_MAIN} bg={CONFIG.THEME.BG_SURFACE_ALT} />
              <Badge label={m.tier} color={CONFIG.THEME.ACCENT_PURPLE} outline />
            </div>
            
            <div style={{ borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hourly Rate</div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: CONFIG.THEME.SUCCESS }}>{Utils.formatCurrency(m.price)}</div>
              </div>
              <Button variant="outline" onClick={(e) => { e.stopPropagation(); onBook(m); }}>Book</Button>
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
    <div className="glass-panel" style={{ borderRadius: CONFIG.THEME.RADIUS_LG, overflow: 'hidden', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
          <thead style={{ background: CONFIG.THEME.BG_SURFACE_ALT, color: CONFIG.THEME.NAVY_MAIN }}>
            <tr>
              {['Mentor Profile', 'Expertise Domain', 'Professional Role', 'Availability', 'Rate', 'Action'].map(h => (
                <th key={h} style={{ padding: '20px 24px', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', borderBottom: `2px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((m, i) => (
              <tr key={m.id} className="animated-row" style={{ animation: `fadeIn 0.3s ease forwards ${Math.min(i * 0.03, 0.3)}s`, opacity: 0, background: CONFIG.THEME.BG_SURFACE }} onClick={() => onSelect(m)}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: Utils.generateAvatarGradient(m.name), color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1rem' }}>{m.initials}</div>
                      {m.isTopRated && <div style={{ position: 'absolute', bottom: -2, right: -2, background: CONFIG.THEME.GOLD_MAIN, color: CONFIG.THEME.NAVY_MAIN, borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', border: `1px solid ${CONFIG.THEME.BG_SURFACE}`, fontWeight: 'bold' }}>★</div>}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: CONFIG.THEME.NAVY_MAIN, fontSize: '1rem' }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER }}>{m.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: '600', color: CONFIG.THEME.TEXT_PRI, fontSize: '0.875rem' }}>{m.domain}</div>
                  <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_SEC }}>{m.rating}/5.0 • {m.sessionsConducted} sessions</div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: '500', fontSize: '0.875rem', color: CONFIG.THEME.TEXT_PRI }}>{m.role}</div>
                  <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_SEC }}>{m.company}</div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: CONFIG.THEME.TEXT_SEC, fontWeight: '500' }}>{m.availability}</td>
                <td style={{ padding: '16px 24px', fontWeight: '800', color: CONFIG.THEME.SUCCESS }}>{Utils.formatCurrency(m.price)}</td>
                <td style={{ padding: '16px 24px' }}>
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
    <div className="glass-panel" style={{ padding: '24px', borderRadius: CONFIG.THEME.RADIUS_LG, animation: `slideUpFade 0.5s ease forwards ${delay}s`, opacity: 0 }}>
      <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.1em' }}>{title}</div>
      <div style={{ fontSize: '2.5rem', fontWeight: '700', color: CONFIG.THEME.NAVY_MAIN, margin: '8px 0', background: `linear-gradient(90deg, ${CONFIG.THEME.NAVY_MAIN}, ${CONFIG.THEME.GOLD_MAIN})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</div>
      <div style={{ fontSize: '0.875rem', color: CONFIG.THEME.TEXT_SEC, fontWeight: '500' }}>{sub}</div>
    </div>
  );

  const SvgBarChart = ({ title, dataArr }) => {
    const maxVal = Math.max(...dataArr.map(d => d[1]), 1);
    const height = 280; const width = '100%';
    return (
      <div className="glass-panel" style={{ padding: '32px', borderRadius: CONFIG.THEME.RADIUS_LG, animation: 'slideUpFade 0.6s ease forwards 0.2s', opacity: 0, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
        <h3 style={{ margin: '0 0 32px 0', fontSize: '1.25rem', color: CONFIG.THEME.NAVY_MAIN, fontWeight: '700' }}>{title}</h3>
        <svg width={width} height={height} style={{ overflow: 'visible', fontFamily: 'Lora, serif' }}>
          {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
            <g key={i}>
              <line x1="0" y1={height - (height * tick)} x2="100%" y2={height - (height * tick)} stroke={CONFIG.THEME.BORDER_LIGHT} strokeDasharray="4 4" />
              <text x="-10" y={height - (height * tick) + 4} fontSize="11" fill={CONFIG.THEME.TEXT_TER} textAnchor="end">{Math.round(maxVal * tick)}</text>
            </g>
          ))}
          {dataArr.map(([label, val], i) => {
            const barHeight = (val / maxVal) * height; const y = height - barHeight; const x = `${(i * 100) / dataArr.length + 5}%`;
            return (
              <g key={label}>
                <rect x={x} y={y} width="12%" height={barHeight} fill={`url(#gradient-${i})`} rx="4" style={{ transition: 'all 0.5s ease' }}><title>{label}: {val}</title></rect>
                <text x={`${(i * 100) / dataArr.length + 11}%`} y={height + 24} fontSize="11" fill={CONFIG.THEME.TEXT_SEC} textAnchor="middle">{label.length > 15 ? label.substring(0,12)+'...' : label}</text>
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
    let currentAngle = -90; const radius = 100; const circumference = 2 * Math.PI * radius; const cx = 150; const cy = 150;
    const colors = [CONFIG.THEME.NAVY_MAIN, CONFIG.THEME.GOLD_MAIN, CONFIG.THEME.ACCENT_CYAN, CONFIG.THEME.NAVY_LITE, CONFIG.THEME.TEXT_TER];

    return (
       <div className="glass-panel" style={{ padding: '32px', borderRadius: CONFIG.THEME.RADIUS_LG, animation: 'slideUpFade 0.6s ease forwards 0.3s', opacity: 0, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', color: CONFIG.THEME.NAVY_MAIN, fontWeight: '700' }}>{title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <svg width="300" height="300" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
            {dataArr.map(([label, val], i) => {
              const fraction = val / total; const strokeDasharray = `${fraction * circumference} ${circumference}`;
              const strokeDashoffset = -(currentAngle + 90) / 360 * circumference; currentAngle += fraction * 360;
              return (
                <circle key={label} cx={cx} cy={cy} r={radius} fill="transparent" stroke={colors[i % colors.length]} strokeWidth="40" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} style={{ transition: 'stroke-dashoffset 1s ease-out', transformOrigin: 'center' }}><title>{label}: {val}</title></circle>
              );
            })}
            <text x={cx} y={cy} transform="rotate(90 150 150)" textAnchor="middle" dominantBaseline="middle" fill={CONFIG.THEME.NAVY_MAIN} fontSize="24" fontWeight="700" fontFamily="Lora, serif">{Utils.formatNumber(total)}</text>
            <text x={cx} y={cy + 25} transform="rotate(90 150 150)" textAnchor="middle" dominantBaseline="middle" fill={CONFIG.THEME.TEXT_TER} fontSize="12" fontWeight="500" fontFamily="Lora, serif">TOTAL</text>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
             {dataArr.map(([label, val], i) => (
               <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: colors[i % colors.length] }} /><span style={{ color: CONFIG.THEME.TEXT_SEC, fontWeight: '500' }}>{label}</span></div>
                 <strong style={{ color: CONFIG.THEME.NAVY_MAIN }}>{Math.round((val/total)*100)}%</strong>
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <TopCard title="Active Mentors" value={Utils.formatNumber(data.length)} sub="In current filtered view" delay={0.0} />
        <TopCard title="Top Domain" value={getAggregations('domain', 1)[0]?.[0] || 'N/A'} sub="Highest demand category" delay={0.1} />
        <TopCard title="Avg Experience" value={`${Math.round(data.reduce((acc, m) => acc + m.experience, 0) / (data.length || 1))} yrs`} sub="Across current segment" delay={0.2} />
        <TopCard title="Pro-bono Mentors" value={data.filter(m => m.price === 0).length} sub="Offering free sessions" delay={0.3} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <SvgBarChart title="Domain Demand Distribution" dataArr={getAggregations('domain', 5)} />
        <SvgDonutChart title="Experience Tier Breakdown" dataArr={getAggregations('tier', 4)} />
      </div>
    </div>
  );
};

const EmptyState = ({ msg = "No records found matching your current filter criteria." }) => (
  <div style={{ padding: '100px 20px', textAlign: 'center', background: 'transparent' }}>
    <div style={{ fontSize: '4rem', opacity: 0.2, marginBottom: '24px' }}>📭</div>
    <h3 style={{ color: CONFIG.THEME.NAVY_MAIN, margin: '0 0 12px 0', fontSize: '1.5rem', fontWeight: '700' }}>No Results</h3>
    <p style={{ color: CONFIG.THEME.TEXT_SEC, fontSize: '1rem' }}>{msg}</p>
  </div>
);

/* =========================================================
   8) FIREBASE CONFIG (SAFE WRAPPER TO PREVENT WHITE SCREEN)
   ========================================================= */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "sju-alumni-portal.firebaseapp.com",
  projectId: "sju-alumni-portal",
  storageBucket: "sju-alumni-portal.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

let db = null;
try {
  // If API keys are dummy values, this might throw an error depending on the environment.
  // We catch it so the app doesn't white-screen and can use MockDB.
  const firebaseApp = initializeApp(firebaseConfig);
  db = getFirestore(firebaseApp);
} catch (error) {
  console.warn("Firebase initialization skipped/failed. Falling back to Mock DB safely.");
}

/* =========================================================
   9) MAIN APPLICATION (INTEGRATED LOGIC)
   ========================================================= */
const MentorshipGateway = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  useEffect(() => {
    const loadMentorsData = async () => {
      setLoading(true);
      try {
        if (db && firebaseConfig.apiKey !== "YOUR_API_KEY") {
          const mentorsRef = collection(db, 'mentors'); 
          const q = query(mentorsRef, orderBy('name', 'asc')); 
          const querySnapshot = await getDocs(q);
          const firestoreData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          if (firestoreData.length > 0) {
            setData(firestoreData);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error("Firestore Error, falling back to MockDB:", error);
      } 
      
      // Fallback: Using MockDB with a simulated network delay
      setTimeout(() => {
        setData(MockDB.generate(CONFIG.DATA.TOTAL_RECORDS)); 
        setLoading(false);
      }, 1000);
    };
    
    loadMentorsData();
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
      counts.tier[m.tier] = (counts.tier[m.tier] || 0) + 1;
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
      const offset = 80;
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
    setTimeout(() => setToast(null), 3000);
  };

  const handleBookingConfirm = () => {
    setIsBooking(false);
    setSelectedMentor(null);
    showToast(`Session successfully booked!`);
  };

  if (loading) return (
    <div style={{ height: '100vh', width: '100vw', background: CONFIG.THEME.NAVY_DARK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <GlobalStyles />
      <div style={{ width: '80px', height: '80px', border: `4px solid rgba(212, 175, 55, 0.1)`, borderTopColor: CONFIG.THEME.GOLD_MAIN, borderRadius: '50%', animation: 'spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite', marginBottom: '32px' }} />
      <div style={{ fontSize: '2rem', fontWeight: '700', letterSpacing: '0.1em', color: CONFIG.THEME.GOLD_MAIN, textTransform: 'uppercase' }}>{CONFIG.SYSTEM.ORG}</div>
      <div style={{ fontSize: '1rem', fontWeight: '500', letterSpacing: '0.2em', color: CONFIG.THEME.TEXT_TER, marginTop: '8px' }}>INITIALIZING MENTORSHIP GATEWAY</div>
    </div>
  );

  return (
    <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '80px' }}>
      <GlobalStyles />
      
      {/* HEADER SECTION */}
      <header style={{ background: CONFIG.THEME.NAVY_MAIN, padding: '80px 0 100px 0', textAlign: 'center', position: 'relative', overflow: 'hidden', borderBottom: `4px solid ${CONFIG.THEME.GOLD_MAIN}` }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ color: 'white', fontSize: '3.5rem', fontWeight: '700', margin: '0 0 20px 0', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{CONFIG.SYSTEM.APP_NAME}</h1>
          <p style={{ color: CONFIG.THEME.TEXT_TER, fontSize: '1.25rem', margin: 0, fontWeight: '400', lineHeight: 1.6 }}>
            Book 1:1 sessions with {Utils.formatNumber(data.length)}+ industry experts. Accelerate your career with personalized, actionable guidance.
          </p>
        </div>
      </header>

      {/* ENTERPRISE WORKSPACE LAYOUT */}
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 32px', display: 'grid', gridTemplateColumns: '320px 1fr', gap: '40px', position: 'relative', zIndex: 10, marginTop: '-50px' }}>
        
        {/* SIDEBAR FILTERS */}
        <aside style={{ height: 'calc(100vh - 40px)', position: 'sticky', top: '20px' }}>
          <div className="glass-panel" style={{ borderRadius: CONFIG.THEME.RADIUS_LG, padding: '32px 24px', height: '100%', overflowY: 'auto', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '16px', borderBottom: `2px solid ${CONFIG.THEME.NAVY_MAIN}` }}>
              <span style={{ fontWeight: '700', fontSize: '1.25rem', color: CONFIG.THEME.NAVY_MAIN, letterSpacing: '-0.02em' }}>Gateway Filters</span>
              {(search || Object.values(filters).some(v => v !== null)) && (
                <span onClick={clearFilters} style={{ fontSize: '0.75rem', color: CONFIG.THEME.NAVY_MAIN, cursor: 'pointer', fontWeight: '700', padding: '6px 12px', background: CONFIG.THEME.BORDER_LIGHT, borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', transition: CONFIG.THEME.TRANSITION_FAST }} onMouseEnter={e=>e.currentTarget.style.background='#CBD5E1'} onMouseLeave={e=>e.currentTarget.style.background=CONFIG.THEME.BORDER_LIGHT}>Reset</span>
              )}
            </div>

            <FilterAccordion title="Expertise Domain" options={getFacetArray(facets.domain)} activeValue={filters.domain} onSelect={(v) => toggleFilter('domain', v)} />
            <FilterAccordion title="Experience Tier" options={getFacetArray(facets.tier)} activeValue={filters.tier} onSelect={(v) => toggleFilter('tier', v)} />
            <FilterAccordion title="Company Tier" options={getFacetArray(facets.companyTier)} activeValue={filters.companyTier} onSelect={(v) => toggleFilter('companyTier', v)} />
            <FilterAccordion title="Availability" options={getFacetArray(facets.availability)} activeValue={filters.availability} onSelect={(v) => toggleFilter('availability', v)} />
            <FilterAccordion title="Pricing Type" options={getFacetArray(facets.priceCategory)} activeValue={filters.priceCategory} onSelect={(v) => toggleFilter('priceCategory', v)} />
            <FilterAccordion title="Languages" options={getFacetArray(facets.language)} activeValue={filters.language} onSelect={(v) => toggleFilter('language', v)} />
          </div>
        </aside>

        {/* MAIN DATA CONTENT */}
        <main ref={scrollRef} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div className="glass-panel" style={{ padding: '20px 32px', borderRadius: CONFIG.THEME.RADIUS_LG, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
            <div style={{ position: 'relative', width: '450px' }}>
              <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
              <input className="sju-input" placeholder="Search mentors by name, company, or domain..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            
            <div style={{ display: 'flex', gap: '8px', background: CONFIG.THEME.BG_APP, padding: '8px', borderRadius: CONFIG.THEME.RADIUS_SM, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
              {['GRID', 'LIST', 'ANALYTICS'].map(v => (
                <button key={v} onClick={() => { setView(v); setPage(1); }} style={{ padding: '8px 20px', border: 'none', background: view === v ? CONFIG.THEME.BG_SURFACE : 'transparent', borderRadius: '6px', fontWeight: '700', fontSize: '0.8rem', letterSpacing: '0.05em', color: view === v ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.TEXT_SEC, cursor: 'pointer', boxShadow: view === v ? CONFIG.THEME.SHADOW_SM : 'none', transition: CONFIG.THEME.TRANSITION_FAST }}>{v}</button>
              ))}
            </div>
          </div>

          <div style={{ minHeight: '800px' }}>
            {view === 'GRID' && <GridView data={paginatedData} onSelect={setSelectedMentor} onBook={(m) => { setSelectedMentor(m); setIsBooking(true); }} />}
            {view === 'LIST' && <ListView data={paginatedData} onSelect={setSelectedMentor} onBook={(m) => { setSelectedMentor(m); setIsBooking(true); }} />}
            {view === 'ANALYTICS' && <AnalyticsView data={filteredData} />}
          </div>

          {view !== 'ANALYTICS' && (
            <AdvancedPagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} totalItems={filteredData.length} />
          )}
        </main>
      </div>

      {/* ZERO-OVERLAP, SCALABLE MODAL DIALOG */}
      {selectedMentor && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(6, 17, 33, 0.8)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '6vh', paddingBottom: '6vh', zIndex: 99999, overflowY: 'auto' }} onClick={() => { setSelectedMentor(null); setIsBooking(false); }}>
          <div style={{ background: CONFIG.THEME.BG_SURFACE, width: '92%', maxWidth: isBooking ? '700px' : '950px', borderRadius: CONFIG.THEME.RADIUS_XL, padding: '48px', position: 'relative', animation: 'scaleInModal 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards', boxShadow: CONFIG.THEME.SHADOW_LG, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }} onClick={e => e.stopPropagation()}>
            <button onClick={() => { setSelectedMentor(null); setIsBooking(false); }} style={{ position: 'absolute', top: '32px', right: '32px', background: CONFIG.THEME.BG_APP, border: 'none', width: '48px', height: '48px', borderRadius: '50%', fontSize: '1.25rem', cursor: 'pointer', color: CONFIG.THEME.TEXT_SEC, transition: CONFIG.THEME.TRANSITION_FAST, zIndex: 100 }} onMouseEnter={(e) => { e.currentTarget.style.background = CONFIG.THEME.DANGER_BG; e.currentTarget.style.color = CONFIG.THEME.DANGER; }} onMouseLeave={(e) => { e.currentTarget.style.background = CONFIG.THEME.BG_APP; e.currentTarget.style.color = CONFIG.THEME.TEXT_SEC; }}>✕</button>
            
            {isBooking ? (
              <BookingWizard mentor={selectedMentor} onClose={() => setIsBooking(false)} onConfirm={handleBookingConfirm} />
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', borderBottom: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingBottom: '40px', marginBottom: '40px' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: '160px', height: '160px', borderRadius: CONFIG.THEME.RADIUS_LG, background: Utils.generateAvatarGradient(selectedMentor.name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', fontWeight: '700', flexShrink: 0, boxShadow: CONFIG.THEME.SHADOW_MD }}>{selectedMentor.initials}</div>
                    {selectedMentor.isTopRated && <div style={{ position: 'absolute', bottom: -10, right: -10, background: CONFIG.THEME.GOLD_MAIN, color: CONFIG.THEME.NAVY_MAIN, borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: `4px solid ${CONFIG.THEME.BG_SURFACE}`, boxShadow: CONFIG.THEME.SHADOW_SM, fontWeight: 'bold' }} title="Top Rated Mentor">★</div>}
                  </div>
                  
                  <div style={{ flex: 1, paddingRight: '48px' }}>
                    <h2 style={{ fontSize: '2.5rem', color: CONFIG.THEME.NAVY_MAIN, margin: '0 0 8px 0', fontWeight: '700', letterSpacing: '-0.02em' }}>{selectedMentor.name}</h2>
                    <div style={{ fontSize: '1.25rem', color: CONFIG.THEME.TEXT_PRI, fontWeight: '500', marginBottom: '24px' }}>{selectedMentor.role} at <strong style={{color: CONFIG.THEME.NAVY_MAIN}}>{selectedMentor.company}</strong></div>
                    
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
                      <Badge label={selectedMentor.domain} color={CONFIG.THEME.NAVY_MAIN} bg={CONFIG.THEME.BG_SURFACE_ALT} />
                      <Badge label={selectedMentor.tier} color={CONFIG.THEME.ACCENT_PURPLE} outline />
                      <Badge label={`${selectedMentor.sessionsConducted} Sessions`} color={CONFIG.THEME.TEXT_SEC} outline />
                      <Badge label={`${selectedMentor.rating} / 5.0 Rating`} color={CONFIG.THEME.SUCCESS} bg={CONFIG.THEME.SUCCESS_BG} />
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                      <Button onClick={() => setIsBooking(true)}>Book Session</Button>
                      <Button variant="outline" onClick={() => alert(`Message interface opened.`)}>Send Message</Button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '48px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', marginTop: 0 }}>Executive Summary</h4>
                    <p style={{ margin: '0 0 40px 0', lineHeight: 1.8, color: CONFIG.THEME.TEXT_PRI, fontSize: '1.1rem' }}>{selectedMentor.bio}</p>

                    <h4 style={{ fontSize: '0.875rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Languages & Support</h4>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {selectedMentor.languages.map(l => (
                        <span key={l} style={{ padding: '8px 16px', background: CONFIG.THEME.BG_APP, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, borderRadius: CONFIG.THEME.RADIUS_FULL, fontSize: '0.875rem', color: CONFIG.THEME.NAVY_MAIN, fontWeight: '600', transition: CONFIG.THEME.TRANSITION_FAST }}>{l}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: CONFIG.THEME.BG_SURFACE_ALT, borderRadius: CONFIG.THEME.RADIUS_LG, padding: '32px', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
                    <div style={{ marginBottom: '32px' }}>
                      <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '0.05em' }}>Experience & Domain</div>
                      <div style={{ fontWeight: '700', color: CONFIG.THEME.TEXT_PRI, fontSize: '1.1rem' }}>{selectedMentor.domain}</div>
                      <div style={{ fontSize: '0.875rem', color: CONFIG.THEME.TEXT_SEC, marginTop: '8px' }}>{selectedMentor.experience} Years of Expertise</div>
                    </div>

                    <div style={{ borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingTop: '32px', marginBottom: '32px' }}>
                      <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '0.05em' }}>Availability</div>
                      <div style={{ fontWeight: '700', color: CONFIG.THEME.TEXT_PRI, fontSize: '1rem', marginBottom: '8px' }}>{selectedMentor.availability}</div>
                      <div style={{ fontSize: '0.875rem', color: CONFIG.THEME.TEXT_SEC }}>Response Rate: {selectedMentor.responseRate}%</div>
                    </div>

                    <div style={{ borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingTop: '32px' }}>
                      <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '0.05em' }}>Session Rate</div>
                      <div style={{ fontWeight: '800', color: CONFIG.THEME.SUCCESS, fontSize: '1.25rem' }}>{Utils.formatCurrency(selectedMentor.price)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', background: CONFIG.THEME.NAVY_MAIN, color: 'white', padding: '16px 24px', borderRadius: CONFIG.THEME.RADIUS_MD, boxShadow: CONFIG.THEME.SHADOW_LG, display: 'flex', alignItems: 'center', gap: '16px', zIndex: 999999, animation: 'slideLeft 0.3s ease' }}>
          <div style={{ background: CONFIG.THEME.GOLD_MAIN, color: CONFIG.THEME.NAVY_MAIN, width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✓</div>
          <span style={{ fontWeight: '600', fontFamily: 'Lora, serif', fontSize: '0.9rem' }}>{toast}</span>
        </div>
      )}
    </div>
  );
};

export default MentorshipGateway;