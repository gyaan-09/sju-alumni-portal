//// src/App.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";

/**
 * =================================================================================
 * SJU ALUMNI DIRECTORY: UNIFIED ENHANCED ENTERPRISE BUILD
 * =================================================================================
 * Architecture & Features:
 * - Typography: Strictly enforces "Lora" serif font across all components for a unified, academic aesthetic.
 * - Views: 5 Seamless Views (Grid, List, Analytics, Mentors, Geo) with state preservation.
 * - Filtering: 11 Dynamic Faceted Filters with smooth accordion animations and a dedicated "Verified" toggle.
 * - Analytics: Custom React-SVG PowerBI-Style data visualizations (Bar charts, distribution bars).
 * - UX/UI: Zero-Color Selection Paradigm, glassmorphism panels, complex CSS keyframe animations.
 * - Pagination: Advanced "Page X of Y" logic with smooth scrolling synchronization.
 * - Performance: Heavy use of useMemo and useCallback for large-dataset (3500+ records) handling.
 * - Branding: Cleaned titles, removed internal codenames (Titanium/Omega) from user-facing text, removed match scores.
 * =================================================================================
 */

/* =========================================================
   1) CONFIGURATION & THEME
   ========================================================= */
const CONFIG = {
  SYSTEM: {
    APP_NAME: "SJU Alumni Directory",
    VERSION: "5.0.0 Enterprise",
    ORG: "St. Joseph's University",
    BUILD: "2026.10.X.ULTRA"
  },
  DATA: {
    TOTAL_RECORDS: 3500,
    PAGE_SIZE: 16,
    PAGINATION_WINDOW: 2
  },
  THEME: {
    // Core Palette - Deep Navy & Metallic Gold
    NAVY_DARK: '#061121',
    NAVY_MAIN: '#0C2340',
    NAVY_LITE: '#1A3B66',
    GOLD_MAIN: '#D4AF37', 
    GOLD_LITE: '#F9F1D8',
    
    // Accents & States
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
    
    // Surfaces & Typography
    BG_APP: '#F4F7F9',
    BG_SURFACE: '#FFFFFF',
    BG_SURFACE_ALT: '#F8FAFC',
    BORDER: 'rgba(12, 35, 64, 0.12)',
    BORDER_LIGHT: '#E2E8F0',
    TEXT_PRI: '#0F172A',
    TEXT_SEC: '#475569',
    TEXT_TER: '#94A3B8',
    
    // Geometry
    RADIUS_SM: '6px',
    RADIUS_MD: '12px',
    RADIUS_LG: '20px',
    RADIUS_XL: '32px',
    RADIUS_FULL: '9999px',
    
    // Elevation (Shadows)
    SHADOW_SM: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    SHADOW_MD: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
    SHADOW_LG: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    SHADOW_HOVER: '0 30px 60px -15px rgba(0, 0, 0, 0.25), 0 0 20px rgba(212, 175, 55, 0.15)',
    
    // Motion
    TRANSITION_FAST: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    TRANSITION_SMOOTH: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    TRANSITION_BOUNCE: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
  }
};

/* =========================================================
   2) EXPANDED ENTERPRISE MOCK DATABASE
   ========================================================= */
const MockDB = {
  firstNames: [
    "Aarav", "Diya", "David", "Sarah", "Yusuf", "Aisha", "Wei", "Priya", "Rohan", "Emma",
    "Kavya", "Arjun", "Sanya", "Liam", "Olivia", "Hiroshi", "Isabella", "Mateo", "Zoe", "Omar",
    "Elena", "Jackson", "Sophia", "Lucas", "Mia", "Ethan", "Charlotte", "Amelia", "Harper", "Evelyn",
    "Abigail", "Emily", "Elizabeth", "Mila", "Ella", "Avery", "Sofia", "Camila", "Aria", "Scarlett",
    "Vikram", "Anjali", "Ravi", "Neha", "Karthik", "Sneha", "Rahul", "Pooja", "Amit", "Meera"
  ],
  lastNames: [
    "Sharma", "Patel", "Smith", "Jones", "Khan", "Martinez", "Chen", "Reddy", "Gowda", "Williams",
    "Verma", "Iyer", "Nair", "Brown", "Taylor", "Anderson", "Thomas", "Moore", "Martin", "Lee",
    "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
    "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green",
    "Menon", "Krishnan", "Rao", "Das", "Mukherjee", "Bose", "Gupta", "Jain", "Desai", "Shah"
  ],
  degrees: [
    { name: "B.Tech Computer Science", type: "Bachelors", school: "School of Engineering" },
    { name: "B.Sc Advanced Chemistry", type: "Bachelors", school: "School of Sciences" },
    { name: "B.Sc Chemistry (Synthesis)", type: "Bachelors", school: "School of Sciences" },
    { name: "B.Com Hons.", type: "Bachelors", school: "School of Commerce" },
    { name: "MBA Strategic Finance", type: "Masters", school: "School of Business" },
    { name: "M.Sc Data Analytics", type: "Masters", school: "School of Sciences" },
    { name: "Ph.D. Applied Physics", type: "Doctorate", school: "School of Sciences" },
    { name: "Ph.D. Organic Chemistry", type: "Doctorate", school: "School of Sciences" },
    { name: "B.A. Economics", type: "Bachelors", school: "School of Humanities" },
    { name: "M.Tech Artificial Intelligence", type: "Masters", school: "School of Engineering" },
    { name: "M.Sc SuCat Program", type: "Masters", school: "School of Sciences" }
  ],
  companies: [
    { name: "Google", tier: "MNC" }, { name: "Microsoft", tier: "MNC" }, { name: "Amazon", tier: "MNC" },
    { name: "Apple", tier: "MNC" }, { name: "Meta", tier: "MNC" }, { name: "Netflix", tier: "MNC" },
    { name: "JP Morgan Chase", tier: "Finance" }, { name: "Goldman Sachs", tier: "Finance" },
    { name: "Morgan Stanley", tier: "Finance" }, { name: "Citibank", tier: "Finance" },
    { name: "McKinsey & Co.", tier: "Consulting" }, { name: "BCG", tier: "Consulting" },
    { name: "Bain & Company", tier: "Consulting" }, { name: "Deloitte", tier: "Consulting" },
    { name: "SJU Research Labs", tier: "Academic" }, { name: "Stanford Research", tier: "Academic" },
    { name: "Banaras Hindu University Labs", tier: "Academic" }, { name: "Max Planck Institute", tier: "Academic" },
    { name: "Stripe", tier: "Fintech" }, { name: "Plaid", tier: "Fintech" }, { name: "Square", tier: "Fintech" },
    { name: "Freelance Consultant", tier: "Independent" }, { name: "Self-Employed", tier: "Independent" }
  ],
  locations: [
    "Bangalore, IN", "Mumbai, IN", "Delhi, IN", "Hyderabad, IN", "Pune, IN", "Chennai, IN",
    "New York, USA", "San Francisco, USA", "Seattle, USA", "Austin, USA", "Boston, USA",
    "London, UK", "Manchester, UK", "Dubai, UAE", "Abu Dhabi, UAE", "Singapore, SG",
    "Toronto, CA", "Vancouver, CA", "Sydney, AU", "Melbourne, AU", "Berlin, DE", "Munich, DE",
    "Zurich, CH", "Paris, FR", "Tokyo, JP"
  ],
  skills: [
    "React.js", "Firebase", "Node.js", "Python", "Java", "C++", "AWS", "Azure", "GCP", "Docker", "Kubernetes",
    "Organic Synthesis", "Radical Chemistry", "Spectroscopy", "Raman Spectroscopy", "Nanoremediation", 
    "Wet Lab Techniques", "Urea Hydrogen Peroxide Transformations", "Data Analysis", "Machine Learning",
    "Deep Learning", "Natural Language Processing", "Finance", "Investment Banking", "Venture Capital",
    "Strategy", "Operations", "Supply Chain", "Marketing", "SEO", "Product Management", "Agile",
    "Scrum", "Figma", "UI/UX Design", "Power BI", "Tableau", "SQL", "NoSQL", "Blockchain", "Cybersecurity"
  ],
  roles: [
    "Analyst", "Associate", "Consultant", "Senior Consultant", "Manager", "Senior Manager",
    "Director", "Senior Director", "Vice President", "Senior Vice President", "C-Level Executive",
    "Founder", "Co-Founder", "Research Fellow", "Postdoctoral Researcher", "Professor",
    "Software Engineer", "Senior Software Engineer", "Staff Software Engineer", "Principal Engineer",
    "Laboratory Head", "Clinical Researcher", "Data Scientist", "Quantitative Analyst"
  ],

  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
  pickMultiple: (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  },

  generate: (count = CONFIG.DATA.TOTAL_RECORDS) => {
    const data = [];
    const currentYear = new Date().getFullYear();

    for (let i = 1; i <= count; i++) {
      const batch = 2000 + Math.floor(Math.random() * 27); // 2000 to 2026
      const rand = Math.random();
      
      let status = "Working";
      if (batch >= currentYear) status = rand > 0.4 ? "Job Seeking" : "Higher Studies";
      else if (batch >= currentYear - 2) status = rand > 0.6 ? "Job Seeking" : "Working";
      else if (batch < currentYear - 15) status = rand > 0.8 ? "Retired" : "Working";
      
      const isMentor = batch < currentYear - 5 && rand > 0.4;
      const verified = rand > 0.15; // 85% verification rate
      const degreeObj = MockDB.pick(MockDB.degrees);
      const companyObj = MockDB.pick(MockDB.companies);
      const fname = MockDB.pick(MockDB.firstNames);
      const lname = MockDB.pick(MockDB.lastNames);
      const connections = Math.floor(Math.random() * 950) + 50;

      data.push({
        id: `SJU${100000 + i}`,
        name: `${fname} ${lname}`,
        email: `${fname.toLowerCase()}.${lname.toLowerCase()}${batch}@alumni.sju.edu`,
        degree: degreeObj.name,
        degreeLevel: degreeObj.type,
        school: degreeObj.school,
        batch,
        batchDecade: `${Math.floor(batch / 10) * 10}s`,
        status,
        company: companyObj.name,
        companyTier: companyObj.tier,
        role: MockDB.pick(MockDB.roles),
        location: MockDB.pick(MockDB.locations),
        skills: MockDB.pickMultiple(MockDB.skills, Math.floor(Math.random() * 4) + 3), // 3 to 6 skills
        initials: `${fname[0]}${lname[0]}`,
        connections,
        connRange: connections > 500 ? '500+' : connections > 200 ? '200-500' : '0-200',
        mentorship: isMentor ? 'Available' : 'Unavailable',
        verified,
        bio: `Driven professional with a robust background in ${degreeObj.school}. Demonstrates a proven track record at ${companyObj.name} delivering high-impact, measurable results. Deeply passionate about continuous learning, advancing industry standards, and contributing back to the global SJU alumni network.`
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
      margin: 0;
      padding: 0;
      background-color: ${CONFIG.THEME.BG_APP};
      font-family: 'Lora', serif;
      color: ${CONFIG.THEME.TEXT_PRI};
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow-x: hidden;
      line-height: 1.6;
    }

    * { box-sizing: border-box; }

    /* Enforce Lora universally */
    h1, h2, h3, h4, h5, h6, button, input, select, textarea, span, p, div {
      font-family: 'Lora', serif;
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 12px; height: 12px; }
    ::-webkit-scrollbar-track { background: ${CONFIG.THEME.BG_APP}; border-left: 1px solid ${CONFIG.THEME.BORDER_LIGHT}; }
    ::-webkit-scrollbar-thumb { background: ${CONFIG.THEME.BORDER}; border-radius: 10px; border: 3px solid ${CONFIG.THEME.BG_APP}; }
    ::-webkit-scrollbar-thumb:hover { background: ${CONFIG.THEME.TEXT_TER}; }

    /* Keyframe Animations */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUpFade {
      from { opacity: 0; transform: translateY(25px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes scaleInModal {
      from { opacity: 0; transform: scale(0.97) translateY(15px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    @keyframes pulseGlow {
      0% { box-shadow: 0 0 0 0 rgba(123, 44, 191, 0.4); }
      70% { box-shadow: 0 0 0 12px rgba(123, 44, 191, 0); }
      100% { box-shadow: 0 0 0 0 rgba(123, 44, 191, 0); }
    }

    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes dash {
      to { stroke-dashoffset: 0; }
    }

    /* Interactive Elements & Zero-Color Paradigm */
    .animated-card {
      background: ${CONFIG.THEME.BG_SURFACE};
      border-radius: ${CONFIG.THEME.RADIUS_LG};
      border: 1px solid ${CONFIG.THEME.BORDER_LIGHT};
      transition: ${CONFIG.THEME.TRANSITION_BOUNCE};
      cursor: pointer;
      position: relative;
      overflow: hidden;
      z-index: 1;
    }

    .animated-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      border-radius: ${CONFIG.THEME.RADIUS_LG};
      padding: 2px;
      background: linear-gradient(135deg, ${CONFIG.THEME.NAVY_MAIN}, ${CONFIG.THEME.GOLD_MAIN});
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: ${CONFIG.THEME.TRANSITION_SMOOTH};
      z-index: -1;
    }

    .animated-card:hover {
      transform: translateY(-8px);
      box-shadow: ${CONFIG.THEME.SHADOW_HOVER};
    }

    .animated-card:hover::before {
      opacity: 1;
    }

    /* List Row Animations */
    .animated-row {
      transition: ${CONFIG.THEME.TRANSITION_FAST};
      border-bottom: 1px solid ${CONFIG.THEME.BORDER_LIGHT};
      cursor: pointer;
      position: relative;
    }
    
    .animated-row:hover {
      background-color: ${CONFIG.THEME.BG_SURFACE_ALT} !important;
      transform: translateX(6px);
    }
    
    .animated-row::after {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 4px;
      background: ${CONFIG.THEME.GOLD_MAIN};
      transform: scaleY(0);
      transition: transform 0.2s ease;
      transform-origin: center;
    }

    .animated-row:hover::after {
      transform: scaleY(1);
    }

    /* Glass Panels */
    .glass-panel {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.4);
      box-shadow: ${CONFIG.THEME.SHADOW_SM};
    }

    /* Loading Skeletons */
    .skeleton-box {
      background: #E2E8F0;
      background-image: linear-gradient(90deg, #E2E8F0 0px, #F1F5F9 40px, #E2E8F0 80px);
      background-size: 1000px 100%;
      animation: shimmer 2.5s infinite linear;
      border-radius: ${CONFIG.THEME.RADIUS_SM};
    }

    /* Input Enhancements */
    .sju-input {
      width: 100%; 
      padding: 16px 20px 16px 48px; 
      border-radius: ${CONFIG.THEME.RADIUS_FULL};
      border: 1px solid ${CONFIG.THEME.BORDER_LIGHT};
      font-size: 1rem;
      background: ${CONFIG.THEME.BG_SURFACE}; 
      transition: all 0.3s ease;
      color: ${CONFIG.THEME.TEXT_PRI};
    }
    .sju-input:focus {
      border-color: ${CONFIG.THEME.NAVY_MAIN}; 
      box-shadow: 0 0 0 4px rgba(12, 35, 64, 0.1);
      outline: none;
    }
  `}</style>
);

/* =========================================================
   4) UTILITIES & FORMATTERS
   ========================================================= */
const Utils = {
  formatNumber: (num) => num > 999 ? (num / 1000).toFixed(1) + 'k' : num.toString(),
  
  getStatusStyle: (status) => {
    switch (status) {
      case 'Working': return { color: CONFIG.THEME.SUCCESS, bg: CONFIG.THEME.SUCCESS_BG, icon: '💼' };
      case 'Job Seeking': return { color: CONFIG.THEME.WARNING, bg: CONFIG.THEME.WARNING_BG, icon: '🔍' };
      case 'Higher Studies': return { color: CONFIG.THEME.INFO, bg: CONFIG.THEME.INFO_BG, icon: '🎓' };
      case 'Retired': return { color: CONFIG.THEME.TEXT_SEC, bg: CONFIG.THEME.BORDER_LIGHT, icon: '🏖️' };
      default: return { color: CONFIG.THEME.TEXT_PRI, bg: CONFIG.THEME.BG_APP, icon: '•' };
    }
  },

  getVerificationStyle: (isVerified) => isVerified 
    ? { color: CONFIG.THEME.SUCCESS, bg: CONFIG.THEME.SUCCESS_BG, icon: '✓', text: 'Verified' }
    : { color: CONFIG.THEME.TEXT_TER, bg: CONFIG.THEME.BG_APP, icon: '?', text: 'Unverified' },
    
  generateAvatarGradient: (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    // Adjusted to map towards brand colors (Navy to Gold spectrum loosely)
    const h1 = Math.abs(hash) % 50 + 200; // Blue spectrum
    const h2 = (h1 + 40) % 360;
    return `linear-gradient(135deg, hsl(${h1}, 70%, 25%), hsl(${h2}, 80%, 40%))`;
  }
};

/* =========================================================
   5) ATOMIC UI COMPONENTS
   ========================================================= */

/**
 * Reusable Badge Component
 */
const Badge = ({ label, color, bg, icon, outline = false }) => (
  <span style={{ 
    display: 'inline-flex', alignItems: 'center', gap: '6px', 
    padding: '4px 12px', borderRadius: CONFIG.THEME.RADIUS_FULL, 
    fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em',
    color: color, 
    backgroundColor: outline ? 'transparent' : bg,
    border: outline ? `1px solid ${color}` : `1px solid transparent`,
    whiteSpace: 'nowrap'
  }}>
    {icon && <span>{icon}</span>} {label}
  </span>
);

/**
 * Reusable Button Component
 */
const Button = ({ children, onClick, variant = 'primary', active = false, fullWidth = false, disabled = false }) => {
  let baseStyle = {
    padding: '12px 24px',
    borderRadius: CONFIG.THEME.RADIUS_FULL,
    fontWeight: '700',
    fontSize: '0.875rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: CONFIG.THEME.TRANSITION_FAST,
    width: fullWidth ? '100%' : 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    opacity: disabled ? 0.6 : 1,
    textTransform: 'uppercase',
    letterSpacing: '0.1em'
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
      onClick={onClick} 
      disabled={disabled} 
      style={baseStyle}
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

/* =========================================================
   6) ACCORDION FILTER SYSTEM
   ========================================================= */

/**
 * FilterAccordion: Renders an expandable list of faceted filter options.
 */
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
        maxHeight: isOpen ? '600px' : '0px', 
        overflow: 'hidden', 
        transition: CONFIG.THEME.TRANSITION_SMOOTH,
        marginTop: isOpen ? '12px' : '0px',
        display: 'flex', flexDirection: 'column', gap: '4px'
      }}>
        {options.map(opt => {
          const isActive = activeValue === opt.val;
          return (
            <div 
              key={opt.val} 
              onClick={() => onSelect(opt.val)} 
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

/* =========================================================
   7) ADVANCED PAGINATION
   ========================================================= */

/**
 * AdvancedPagination: First, Prev, Page X of Y, Next, Last
 */
const AdvancedPagination = ({ currentPage, totalPages, onPageChange, totalItems }) => {
  if (totalPages <= 1) return null;

  const handleNav = (dir) => {
    if (dir === 'first') onPageChange(1);
    if (dir === 'prev' && currentPage > 1) onPageChange(currentPage - 1);
    if (dir === 'next' && currentPage < totalPages) onPageChange(currentPage + 1);
    if (dir === 'last') onPageChange(totalPages);
  };

  const btnStyle = (disabled) => ({
    padding: '8px 16px',
    background: CONFIG.THEME.BG_SURFACE,
    border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`,
    borderRadius: CONFIG.THEME.RADIUS_SM,
    color: disabled ? CONFIG.THEME.TEXT_TER : CONFIG.THEME.NAVY_MAIN,
    fontWeight: '700',
    fontSize: '0.875rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: CONFIG.THEME.TRANSITION_FAST,
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  });

  return (
    <div style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
      padding: '24px 0', marginTop: '32px', borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` 
    }}>
      <div style={{ fontSize: '0.875rem', color: CONFIG.THEME.TEXT_SEC }}>
        Showing <strong>{((currentPage - 1) * CONFIG.DATA.PAGE_SIZE) + 1}</strong> to <strong>{Math.min(currentPage * CONFIG.DATA.PAGE_SIZE, totalItems)}</strong> of <strong>{totalItems}</strong> entries
      </div>
      
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button onClick={() => handleNav('first')} disabled={currentPage === 1} style={btnStyle(currentPage === 1)} onMouseEnter={e=>!e.currentTarget.disabled && (e.currentTarget.style.borderColor=CONFIG.THEME.NAVY_MAIN)} onMouseLeave={e=>!e.currentTarget.disabled && (e.currentTarget.style.borderColor=CONFIG.THEME.BORDER_LIGHT)}>
          <span>«</span> First
        </button>
        <button onClick={() => handleNav('prev')} disabled={currentPage === 1} style={btnStyle(currentPage === 1)} onMouseEnter={e=>!e.currentTarget.disabled && (e.currentTarget.style.borderColor=CONFIG.THEME.NAVY_MAIN)} onMouseLeave={e=>!e.currentTarget.disabled && (e.currentTarget.style.borderColor=CONFIG.THEME.BORDER_LIGHT)}>
          <span>‹</span> Prev
        </button>
        
        <div style={{ 
          padding: '8px 20px', 
          background: CONFIG.THEME.NAVY_MAIN, 
          color: CONFIG.THEME.GOLD_MAIN, 
          borderRadius: CONFIG.THEME.RADIUS_SM,
          fontWeight: '700',
          fontSize: '0.875rem',
          boxShadow: CONFIG.THEME.SHADOW_SM
        }}>
          Page {currentPage} of {totalPages}
        </div>
        
        <button onClick={() => handleNav('next')} disabled={currentPage === totalPages} style={btnStyle(currentPage === totalPages)} onMouseEnter={e=>!e.currentTarget.disabled && (e.currentTarget.style.borderColor=CONFIG.THEME.NAVY_MAIN)} onMouseLeave={e=>!e.currentTarget.disabled && (e.currentTarget.style.borderColor=CONFIG.THEME.BORDER_LIGHT)}>
          Next <span>›</span>
        </button>
        <button onClick={() => handleNav('last')} disabled={currentPage === totalPages} style={btnStyle(currentPage === totalPages)} onMouseEnter={e=>!e.currentTarget.disabled && (e.currentTarget.style.borderColor=CONFIG.THEME.NAVY_MAIN)} onMouseLeave={e=>!e.currentTarget.disabled && (e.currentTarget.style.borderColor=CONFIG.THEME.BORDER_LIGHT)}>
          Last <span>»</span>
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   8) VIEWS: GRID, LIST, ANALYTICS, MENTORS, GEO
   ========================================================= */

// 8.1 GRID VIEW
const GridView = ({ data, onSelect }) => {
  if (data.length === 0) return <EmptyState />;
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
      {data.map((u, i) => {
        const statusStyle = Utils.getStatusStyle(u.status);
        
        return (
          <div 
            key={u.id} 
            className="animated-card"
            style={{ animation: `slideUpFade 0.4s ease forwards ${Math.min(i * 0.04, 0.4)}s`, opacity: 0 }} 
            onClick={() => onSelect(u)}
          >
            <div style={{ padding: '32px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', position: 'relative' }}>
                <div style={{ 
                  width: '80px', height: '80px', borderRadius: '50%', 
                  background: Utils.generateAvatarGradient(u.name), color: '#FFF', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '1.75rem', fontWeight: '700', boxShadow: CONFIG.THEME.SHADOW_MD 
                }}>
                  {u.initials}
                </div>
                {u.verified && (
                  <div style={{ position: 'absolute', bottom: 0, right: '50%', transform: 'translate(35px, 0)', background: CONFIG.THEME.SUCCESS, color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', border: `2px solid ${CONFIG.THEME.BG_SURFACE}` }}>✓</div>
                )}
              </div>
              
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', color: CONFIG.THEME.NAVY_MAIN, fontWeight: '700' }}>{u.name}</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: CONFIG.THEME.TEXT_SEC, minHeight: '42px', lineHeight: 1.5 }}>
                  {u.role} @ <strong style={{ color: CONFIG.THEME.TEXT_PRI }}>{u.company}</strong>
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px' }}>
                <Badge label={u.status} color={statusStyle.color} bg={statusStyle.bg} />
                <Badge label={`'${u.batch.toString().slice(-2)}`} color={CONFIG.THEME.NAVY_MAIN} outline />
                {u.mentorship === 'Available' && <Badge label="Mentor" color={CONFIG.THEME.ACCENT_PURPLE} outline />}
              </div>
              
              <div style={{ borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span>📍 {u.location.split(',')[0]}</span>
                <span>🔗 {u.connections} Conn</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 8.2 LIST VIEW
const ListView = ({ data, onSelect }) => {
  if (data.length === 0) return <EmptyState />;

  return (
    <div className="glass-panel" style={{ borderRadius: CONFIG.THEME.RADIUS_LG, overflow: 'hidden', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
          <thead style={{ background: CONFIG.THEME.BG_SURFACE_ALT, color: CONFIG.THEME.NAVY_MAIN }}>
            <tr>
              {['Alumni Profile', 'Professional Role', 'Academic Background', 'Location', 'Status'].map((h, i) => (
                <th key={h} style={{ padding: '20px 24px', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', borderBottom: `2px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((u, i) => {
              const statusStyle = Utils.getStatusStyle(u.status);
              return (
                <tr 
                  key={u.id} 
                  className="animated-row"
                  style={{ animation: `fadeIn 0.3s ease forwards ${Math.min(i * 0.03, 0.3)}s`, opacity: 0, background: CONFIG.THEME.BG_SURFACE }}
                  onClick={() => onSelect(u)}
                >
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: Utils.generateAvatarGradient(u.name), color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1rem' }}>
                          {u.initials}
                        </div>
                        {u.verified && <div style={{ position: 'absolute', bottom: -2, right: -2, background: CONFIG.THEME.SUCCESS, color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', border: `1px solid ${CONFIG.THEME.BG_SURFACE}` }}>✓</div>}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: CONFIG.THEME.NAVY_MAIN, fontSize: '1rem' }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '600', color: CONFIG.THEME.TEXT_PRI, fontSize: '0.875rem' }}>{u.role}</div>
                    <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_SEC }}>{u.company}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '500', fontSize: '0.875rem', color: CONFIG.THEME.TEXT_PRI }}>{u.degree}</div>
                    <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_SEC }}>Batch of {u.batch}</div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: CONFIG.THEME.TEXT_SEC, fontWeight: '500' }}>
                    {u.location.split(',')[0]}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <Badge label={u.status} color={statusStyle.color} bg={statusStyle.bg} outline={u.status === 'Retired'} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 8.3 ANALYTICS VIEW (Custom PowerBI Style Renderings)
const AnalyticsView = ({ data }) => {
  if (data.length === 0) return <EmptyState />;

  const getAggregations = (key, limit = 5) => {
    const counts = {};
    data.forEach(u => {
      if (Array.isArray(u[key])) { u[key].forEach(val => counts[val] = (counts[val] || 0) + 1); } 
      else { counts[u[key]] = (counts[u[key]] || 0) + 1; }
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

  // Custom Power BI Style Bar Chart SVG
  const SvgBarChart = ({ title, dataArr }) => {
    const maxVal = Math.max(...dataArr.map(d => d[1]), 1);
    const height = 280;
    const width = '100%';
    
    return (
      <div className="glass-panel" style={{ padding: '32px', borderRadius: CONFIG.THEME.RADIUS_LG, animation: 'slideUpFade 0.6s ease forwards 0.2s', opacity: 0, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
        <h3 style={{ margin: '0 0 32px 0', fontSize: '1.25rem', color: CONFIG.THEME.NAVY_MAIN, fontWeight: '700' }}>{title}</h3>
        <svg width={width} height={height} style={{ overflow: 'visible', fontFamily: 'Lora, serif' }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
            <g key={i}>
              <line x1="0" y1={height - (height * tick)} x2="100%" y2={height - (height * tick)} stroke={CONFIG.THEME.BORDER_LIGHT} strokeDasharray="4 4" />
              <text x="-10" y={height - (height * tick) + 4} fontSize="11" fill={CONFIG.THEME.TEXT_TER} textAnchor="end">{Math.round(maxVal * tick)}</text>
            </g>
          ))}
          {/* Bars */}
          {dataArr.map(([label, val], i) => {
            const barHeight = (val / maxVal) * height;
            const y = height - barHeight;
            const x = `${(i * 100) / dataArr.length + 5}%`;
            return (
              <g key={label}>
                <rect x={x} y={y} width="12%" height={barHeight} fill={`url(#gradient-${i})`} rx="4" className="svg-bar" style={{ transition: 'all 0.5s ease' }}>
                  <title>{label}: {val}</title>
                </rect>
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

  // Custom Svg Donut Chart for Distribution visualization
  const SvgDonutChart = ({ title, dataArr }) => {
    const total = dataArr.reduce((sum, [, val]) => sum + val, 0);
    let currentAngle = -90; // Start at top
    const radius = 100;
    const circumference = 2 * Math.PI * radius;
    const cx = 150;
    const cy = 150;

    const colors = [CONFIG.THEME.NAVY_MAIN, CONFIG.THEME.GOLD_MAIN, CONFIG.THEME.ACCENT_CYAN, CONFIG.THEME.NAVY_LITE, CONFIG.THEME.TEXT_TER];

    return (
       <div className="glass-panel" style={{ padding: '32px', borderRadius: CONFIG.THEME.RADIUS_LG, animation: 'slideUpFade 0.6s ease forwards 0.3s', opacity: 0, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', color: CONFIG.THEME.NAVY_MAIN, fontWeight: '700' }}>{title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <svg width="300" height="300" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
            {dataArr.map(([label, val], i) => {
              const fraction = val / total;
              const strokeDasharray = `${fraction * circumference} ${circumference}`;
              const strokeDashoffset = -(currentAngle + 90) / 360 * circumference; // adjust offset
              currentAngle += fraction * 360;

              return (
                <circle
                  key={label}
                  cx={cx} cy={cy} r={radius}
                  fill="transparent"
                  stroke={colors[i % colors.length]}
                  strokeWidth="40"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 1s ease-out', transformOrigin: 'center' }}
                >
                  <title>{label}: {val}</title>
                </circle>
              );
            })}
            {/* Center Text */}
            <text x={cx} y={cy} transform="rotate(90 150 150)" textAnchor="middle" dominantBaseline="middle" fill={CONFIG.THEME.NAVY_MAIN} fontSize="24" fontWeight="700" fontFamily="Lora, serif">
              {Utils.formatNumber(total)}
            </text>
            <text x={cx} y={cy + 25} transform="rotate(90 150 150)" textAnchor="middle" dominantBaseline="middle" fill={CONFIG.THEME.TEXT_TER} fontSize="12" fontWeight="500" fontFamily="Lora, serif">
              TOTAL
            </text>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
             {dataArr.map(([label, val], i) => (
               <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: colors[i % colors.length] }} />
                   <span style={{ color: CONFIG.THEME.TEXT_SEC, fontWeight: '500' }}>{label}</span>
                 </div>
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
        <TopCard title="Active Network Size" value={Utils.formatNumber(data.length)} sub="In current filtered view" delay={0.0} />
        <TopCard title="Top Global Hub" value={getAggregations('location', 1)[0]?.[0].split(',')[0] || 'N/A'} sub="Highest density location" delay={0.1} />
        <TopCard title="Mentors Available" value={data.filter(u => u.mentorship === 'Available').length} sub="Ready to connect & guide" delay={0.2} />
        <TopCard title="Verified Alumni" value={`${Math.round((data.filter(u => u.verified).length / data.length) * 100) || 0}%`} sub="Platform trust score" delay={0.3} />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <SvgBarChart title="Distribution by Industry Tier" dataArr={getAggregations('companyTier', 5)} />
        <SvgDonutChart title="Graduation Decades" dataArr={getAggregations('batchDecade', 5)} />
      </div>

      <div className="glass-panel" style={{ padding: '32px', borderRadius: CONFIG.THEME.RADIUS_LG, animation: 'slideUpFade 0.6s ease forwards 0.4s', opacity: 0, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
        <h3 style={{ margin: '0 0 32px 0', fontSize: '1.25rem', color: CONFIG.THEME.NAVY_MAIN, fontWeight: '700' }}>Top Skills Penetration</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {getAggregations('skills', 24).map(([skill, count], i) => {
             const max = getAggregations('skills', 1)[0][1];
             const intensity = 0.15 + (0.85 * (count / max));
             return (
               <div key={skill} style={{ padding: '10px 20px', background: `rgba(12, 35, 64, ${intensity})`, color: intensity > 0.4 ? '#FFF' : CONFIG.THEME.NAVY_MAIN, borderRadius: CONFIG.THEME.RADIUS_FULL, fontSize: '0.875rem', fontWeight: '600', display: 'flex', gap: '12px', alignItems: 'center', transition: CONFIG.THEME.TRANSITION_FAST }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e=> e.currentTarget.style.transform='scale(1)'}>
                 <span>{skill}</span>
                 <span style={{ opacity: 0.8, fontSize: '0.75rem', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '10px' }}>{count}</span>
               </div>
             )
          })}
        </div>
      </div>
    </div>
  );
};

// 8.4 MENTORSHIP VIEW
const MentorshipView = ({ data, onSelect }) => {
  const mentors = data.filter(u => u.mentorship === 'Available');
  if (mentors.length === 0) return <EmptyState msg="No mentors available matching your current filter criteria." />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '32px' }}>
      {mentors.map((u, i) => (
        <div 
          key={u.id} 
          className="animated-card"
          style={{ padding: '32px', display: 'flex', gap: '24px', alignItems: 'center', animation: `slideUpFade 0.4s ease forwards ${Math.min(i * 0.05, 0.5)}s`, opacity: 0 }} 
          onClick={() => onSelect(u)}
        >
          <div style={{ position: 'relative' }}>
             <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: Utils.generateAvatarGradient(u.name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '700', flexShrink: 0, boxShadow: '0 0 25px rgba(123, 44, 191, 0.2)' }}>
               {u.initials}
             </div>
             <div style={{ position: 'absolute', bottom: 2, right: 2, width: '20px', height: '20px', borderRadius: '50%', background: CONFIG.THEME.ACCENT_PURPLE, border: `3px solid ${CONFIG.THEME.BG_SURFACE}`, animation: 'pulseGlow 2s infinite' }} title="Active Mentor" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: CONFIG.THEME.ACCENT_PURPLE, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
              Mentorship Open
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: CONFIG.THEME.TEXT_PRI, fontWeight: '700' }}>{u.name}</h3>
            <div style={{ fontSize: '0.875rem', color: CONFIG.THEME.TEXT_SEC, fontWeight: '500', lineHeight: 1.4 }}>{u.role} @ <strong style={{color: CONFIG.THEME.NAVY_MAIN}}>{u.company}</strong></div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
              {u.skills.slice(0, 3).map(s => <Badge key={s} label={s} color={CONFIG.THEME.NAVY_MAIN} bg={CONFIG.THEME.BG_SURFACE_ALT} />)}
              {u.skills.length > 3 && <Badge label={`+${u.skills.length - 3}`} color={CONFIG.THEME.TEXT_TER} outline />}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// 8.5 GEO VIEW
const GeoView = ({ data }) => {
  if (data.length === 0) return <EmptyState />;
  
  const locations = {};
  data.forEach(u => locations[u.location] = (locations[u.location] || 0) + 1);
  const sorted = Object.entries(locations).sort((a,b) => b[1] - a[1]);
  
  return (
    <div className="glass-panel" style={{ borderRadius: CONFIG.THEME.RADIUS_LG, padding: '48px', animation: 'fadeIn 0.5s ease', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
      <h2 style={{ color: CONFIG.THEME.NAVY_MAIN, marginTop: 0, fontSize: '1.75rem', fontWeight: '700', letterSpacing: '-0.02em' }}>Global Density Mapping</h2>
      <p style={{ color: CONFIG.THEME.TEXT_SEC, marginBottom: '40px', fontSize: '1rem' }}>Geographical distribution of the current filtered network segment.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {sorted.map(([loc, count], i) => (
          <div key={loc} style={{ 
            padding: '24px 32px', background: CONFIG.THEME.BG_SURFACE, borderRadius: CONFIG.THEME.RADIUS_LG, 
            border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, position: 'relative', overflow: 'hidden',
            boxShadow: CONFIG.THEME.SHADOW_SM, transition: CONFIG.THEME.TRANSITION_BOUNCE
          }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = CONFIG.THEME.SHADOW_MD; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = CONFIG.THEME.SHADOW_SM; }}>
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '6px', background: i < 3 ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.NAVY_MAIN }} />
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: CONFIG.THEME.NAVY_MAIN }}>{loc.split(',')[0]}</div>
            <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700' }}>{loc.split(',')[1]}</div>
            
            {/* Animated Progress Bar */}
            <div style={{ width: '100%', height: '4px', background: CONFIG.THEME.BG_APP, borderRadius: '2px', marginTop: '16px', overflow: 'hidden' }}>
               <div style={{ width: `${(count / sorted[0][1]) * 100}%`, height: '100%', background: i < 3 ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.NAVY_LITE, transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '16px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: '700', color: CONFIG.THEME.TEXT_PRI }}>{count}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: CONFIG.THEME.TEXT_TER }}>Alumni</span>
            </div>
          </div>
        ))}
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

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "sju-alumni-portal.firebaseapp.com",
  projectId: "sju-alumni-portal",
  storageBucket: "sju-alumni-portal.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

/* =========================================================
   9) MAIN APPLICATION (INTEGRATED LOGIC)
   ========================================================= */
const App = () => {
  // Global State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [view, setView] = useState('GRID'); // GRID | LIST | ANALYTICS | MENTORS | GEO
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // 11 Integrated Filters
  const [filters, setFilters] = useState({ 
    status: null, 
    industry: null, 
    location: null, 
    degreeLevel: null, 
    batchDecade: null, 
    role: null, 
    skills: null, 
    companyTier: null, 
    connRange: null, 
    mentorship: null,
    verified: null 
  });

  const scrollRef = useRef(null);

  // Initialization (Simulate heavy network load for realism)
  useEffect(() => {
  const loadAlumniData = async () => {
    setLoading(true);
    try {
      const alumniRef = collection(db, 'alumni'); // Make sure your collection is named 'alumni'
      const q = query(alumniRef, orderBy('name', 'asc')); 
      const querySnapshot = await getDocs(q);
      
      const firestoreData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setData(firestoreData);
    } catch (error) {
      console.error("Firestore Error:", error);
      setData(MockDB.generate(50)); // Fallback if database is empty
    } finally {
      setLoading(false);
    }
  };

  loadAlumniData();
}, []);

  // Core Filtering & Facet Generation Engine (Memoized for performance)
  const { filteredData, facets } = useMemo(() => {
    let res = data;
    
    // Search Processing
    if (search) {
      const query = search.toLowerCase();
      res = res.filter(u => 
        u.name.toLowerCase().includes(query) || 
        u.company.toLowerCase().includes(query) ||
        u.role.toLowerCase().includes(query)
      );
    }
    
    // Multi-faceted Filter Application
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null) {
        if (key === 'skills') res = res.filter(u => u.skills.includes(filters[key]));
        else res = res.filter(u => u[key] === filters[key]);
      }
    });

    // Dynamic Facet Building (for sidebar accordions)
    const counts = { status: {}, industry: {}, location: {}, degreeLevel: {}, batchDecade: {}, role: {}, skills: {}, companyTier: {}, connRange: {}, mentorship: {}, verified: { 'Verified Only': 0 } };
    
    res.forEach(u => {
      counts.status[u.status] = (counts.status[u.status] || 0) + 1;
      counts.location[u.location] = (counts.location[u.location] || 0) + 1;
      counts.degreeLevel[u.degreeLevel] = (counts.degreeLevel[u.degreeLevel] || 0) + 1;
      counts.batchDecade[u.batchDecade] = (counts.batchDecade[u.batchDecade] || 0) + 1;
      counts.role[u.role] = (counts.role[u.role] || 0) + 1;
      counts.companyTier[u.companyTier] = (counts.companyTier[u.companyTier] || 0) + 1;
      counts.connRange[u.connRange] = (counts.connRange[u.connRange] || 0) + 1;
      counts.mentorship[u.mentorship] = (counts.mentorship[u.mentorship] || 0) + 1;
      if (u.verified) counts.verified['Verified Only'] += 1;
      u.skills.forEach(s => counts.skills[s] = (counts.skills[s] || 0) + 1);
    });

    return { filteredData: res, facets: counts };
  }, [data, search, filters]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredData.length / CONFIG.DATA.PAGE_SIZE));
  useEffect(() => { if (page > totalPages) setPage(totalPages > 0 ? totalPages : 1); }, [totalPages, page]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * CONFIG.DATA.PAGE_SIZE;
    return filteredData.slice(start, start + CONFIG.DATA.PAGE_SIZE);
  }, [filteredData, page]);

  // Handlers
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    if (scrollRef.current) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = scrollRef.current.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  const toggleFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === val ? null : val }));
    setPage(1); // Reset to page 1 on filter change
  };

  const clearFilters = () => {
    setFilters({ status: null, industry: null, location: null, degreeLevel: null, batchDecade: null, role: null, skills: null, companyTier: null, connRange: null, mentorship: null, verified: null });
    setSearch('');
    setPage(1);
  };

  const getFacetArray = (obj, limit = 8) => Object.entries(obj).map(([label, count]) => ({ val: label, label: label.split(',')[0], count })).sort((a,b) => b.count - a.count).slice(0,limit);

  // Loading Screen (Professional and branded)
  if (loading) return (
    <div style={{ height: '100vh', width: '100vw', background: CONFIG.THEME.NAVY_DARK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <GlobalStyles />
      <div style={{ width: '80px', height: '80px', border: `4px solid rgba(212, 175, 55, 0.1)`, borderTopColor: CONFIG.THEME.GOLD_MAIN, borderRadius: '50%', animation: 'spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite', marginBottom: '32px' }} />
      <div style={{ fontSize: '2rem', fontWeight: '700', letterSpacing: '0.1em', color: CONFIG.THEME.GOLD_MAIN, textTransform: 'uppercase' }}>{CONFIG.SYSTEM.ORG}</div>
      <div style={{ fontSize: '1rem', fontWeight: '500', letterSpacing: '0.2em', color: CONFIG.THEME.TEXT_TER, marginTop: '8px' }}>INITIALIZING DIRECTORY</div>
      
      {/* Skeleton loader hint below text */}
      <div style={{ display: 'flex', gap: '24px', marginTop: '60px' }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton-box" style={{ width: '100px', height: '140px', opacity: 0.05 }} />)}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '80px' }}>
      <GlobalStyles />
      
      {/* HEADER SECTION - Simplified and Unified Title (No Omega) */}
      <header style={{ 
        background: CONFIG.THEME.NAVY_MAIN, 
        padding: '80px 0 100px 0', 
        textAlign: 'center', 
        position: 'relative',
        overflow: 'hidden',
        borderBottom: `4px solid ${CONFIG.THEME.GOLD_MAIN}`
      }}>
        {/* Subtle background pattern */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ color: 'white', fontSize: '3.5rem', fontWeight: '700', margin: '0 0 20px 0', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {CONFIG.SYSTEM.APP_NAME}
          </h1>
          <p style={{ color: CONFIG.THEME.TEXT_TER, fontSize: '1.25rem', margin: 0, fontWeight: '400', lineHeight: 1.6 }}>
            Explore, analyze, and connect with {Utils.formatNumber(CONFIG.DATA.TOTAL_RECORDS)} verified professionals across {Object.keys(facets.location).length} global hubs.
          </p>
        </div>
      </header>

      {/* ENTERPRISE WORKSPACE LAYOUT */}
      <div style={{ 
        maxWidth: '1600px', margin: '0 auto', padding: '0 32px', 
        display: 'grid', gridTemplateColumns: '320px 1fr', gap: '40px', 
        position: 'relative', zIndex: 10, marginTop: '-50px' 
      }}>
        
        {/* SIDEBAR (11 INTEGRATED FILTERS) */}
        <aside style={{ height: 'calc(100vh - 40px)', position: 'sticky', top: '20px' }}>
          <div className="glass-panel" style={{ borderRadius: CONFIG.THEME.RADIUS_LG, padding: '32px 24px', height: '100%', overflowY: 'auto', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '16px', borderBottom: `2px solid ${CONFIG.THEME.NAVY_MAIN}` }}>
              <span style={{ fontWeight: '700', fontSize: '1.25rem', color: CONFIG.THEME.NAVY_MAIN, letterSpacing: '-0.02em' }}>Directory Filters</span>
              {(search || Object.values(filters).some(v => v !== null)) && (
                <span onClick={clearFilters} style={{ fontSize: '0.75rem', color: CONFIG.THEME.NAVY_MAIN, cursor: 'pointer', fontWeight: '700', padding: '6px 12px', background: CONFIG.THEME.BORDER_LIGHT, borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', transition: CONFIG.THEME.TRANSITION_FAST }} onMouseEnter={e=>e.currentTarget.style.background='#CBD5E1'} onMouseLeave={e=>e.currentTarget.style.background=CONFIG.THEME.BORDER_LIGHT}>Reset All</span>
              )}
            </div>

            {/* Special Verified Toggle */}
            <div 
              onClick={() => toggleFilter('verified', true)} 
              style={{ 
                padding: '16px', background: filters.verified ? CONFIG.THEME.SUCCESS_BG : CONFIG.THEME.BG_SURFACE_ALT, 
                borderRadius: CONFIG.THEME.RADIUS_SM, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px',
                border: `1px solid ${filters.verified ? CONFIG.THEME.SUCCESS : CONFIG.THEME.BORDER_LIGHT}`,
                marginBottom: '32px', transition: CONFIG.THEME.TRANSITION_FAST
              }}
            >
              <div style={{ width: '24px', height: '24px', borderRadius: '4px', border: `2px solid ${filters.verified ? CONFIG.THEME.SUCCESS : CONFIG.THEME.TEXT_TER}`, background: filters.verified ? CONFIG.THEME.SUCCESS : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                {filters.verified && '✓'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: filters.verified ? CONFIG.THEME.SUCCESS : CONFIG.THEME.TEXT_PRI }}>Verified Profiles Only</span>
                <span style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_SEC, marginTop: '2px' }}>Trust-secured connections</span>
              </div>
            </div>

            {/* Dynamic Accordions */}
            <FilterAccordion title="Availability Status" options={getFacetArray(facets.status)} activeValue={filters.status} onSelect={(v) => toggleFilter('status', v)} />
            <FilterAccordion title="Mentorship Program" options={getFacetArray(facets.mentorship)} activeValue={filters.mentorship} onSelect={(v) => toggleFilter('mentorship', v)} />
            <FilterAccordion title="Academic Degree" options={getFacetArray(facets.degreeLevel)} activeValue={filters.degreeLevel} onSelect={(v) => toggleFilter('degreeLevel', v)} />
            <FilterAccordion title="Graduation Decade" options={getFacetArray(facets.batchDecade)} activeValue={filters.batchDecade} onSelect={(v) => toggleFilter('batchDecade', v)} />
            <FilterAccordion title="Global Location" options={getFacetArray(facets.location, 10)} activeValue={filters.location} onSelect={(v) => toggleFilter('location', v)} />
            <FilterAccordion title="Industry Classification" options={getFacetArray(facets.companyTier)} activeValue={filters.companyTier} onSelect={(v) => toggleFilter('companyTier', v)} />
            <FilterAccordion title="Professional Role" options={getFacetArray(facets.role, 10)} activeValue={filters.role} onSelect={(v) => toggleFilter('role', v)} />
            <FilterAccordion title="Core Competencies" options={getFacetArray(facets.skills, 12)} activeValue={filters.skills} onSelect={(v) => toggleFilter('skills', v)} />
            <FilterAccordion title="Network Strength" options={getFacetArray(facets.connRange)} activeValue={filters.connRange} onSelect={(v) => toggleFilter('connRange', v)} />
          </div>
        </aside>

        {/* MAIN DATA CONTENT */}
        <main ref={scrollRef} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* CONTROL TOP BAR */}
          <div className="glass-panel" style={{ padding: '20px 32px', borderRadius: CONFIG.THEME.RADIUS_LG, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', width: '450px' }}>
              <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
              <input 
                className="sju-input"
                placeholder="Search alumni by name, company, or role..." 
                value={search} 
                onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
              />
            </div>
            
            {/* View Selectors */}
            <div style={{ display: 'flex', gap: '8px', background: CONFIG.THEME.BG_APP, padding: '8px', borderRadius: CONFIG.THEME.RADIUS_SM, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
              {['GRID', 'LIST', 'ANALYTICS', 'MENTORS', 'GEO'].map(v => (
                <button 
                  key={v} 
                  onClick={() => { setView(v); setPage(1); }} 
                  style={{ 
                    padding: '8px 20px', border: 'none', 
                    background: view === v ? CONFIG.THEME.BG_SURFACE : 'transparent', 
                    borderRadius: '6px', fontWeight: '700', fontSize: '0.8rem', letterSpacing: '0.05em',
                    color: view === v ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.TEXT_SEC, 
                    cursor: 'pointer', boxShadow: view === v ? CONFIG.THEME.SHADOW_SM : 'none', 
                    transition: CONFIG.THEME.TRANSITION_FAST 
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* DYNAMIC VIEWS ROUTING */}
          <div style={{ minHeight: '800px' }}>
            {view === 'GRID' && <GridView data={paginatedData} onSelect={setSelectedUser} />}
            {view === 'LIST' && <ListView data={paginatedData} onSelect={setSelectedUser} />}
            {view === 'ANALYTICS' && <AnalyticsView data={filteredData} />}
            {view === 'MENTORS' && <MentorshipView data={paginatedData} onSelect={setSelectedUser} />}
            {view === 'GEO' && <GeoView data={filteredData} />}
          </div>

          {/* ADVANCED PAGINATION COMPONENT (Hidden for Analytics/Geo views) */}
          {(view === 'GRID' || view === 'LIST' || view === 'MENTORS') && (
            <AdvancedPagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
              totalItems={filteredData.length}
            />
          )}

        </main>
      </div>

      {/* ZERO-OVERLAP, SCALABLE MODAL DIALOG */}
      {selectedUser && (
        <div 
          role="dialog" 
          aria-modal="true"
          style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(6, 17, 33, 0.8)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center', 
            paddingTop: '6vh', paddingBottom: '6vh', zIndex: 99999, overflowY: 'auto'
          }} 
          onClick={() => setSelectedUser(null)}
        >
          {/* Modal Content - Pure White Surface, animated scaling */}
          <div 
            style={{ 
              background: CONFIG.THEME.BG_SURFACE, width: '92%', maxWidth: '950px', 
              borderRadius: CONFIG.THEME.RADIUS_XL, padding: '48px', position: 'relative', 
              animation: 'scaleInModal 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards', 
              boxShadow: CONFIG.THEME.SHADOW_LG, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`
            }} 
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button - Absolutely positioned to prevent overlap */}
            <button 
              onClick={() => setSelectedUser(null)} 
              style={{ position: 'absolute', top: '32px', right: '32px', background: CONFIG.THEME.BG_APP, border: 'none', width: '48px', height: '48px', borderRadius: '50%', fontSize: '1.25rem', cursor: 'pointer', color: CONFIG.THEME.TEXT_SEC, transition: CONFIG.THEME.TRANSITION_FAST, zIndex: 100 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = CONFIG.THEME.DANGER_BG; e.currentTarget.style.color = CONFIG.THEME.DANGER; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = CONFIG.THEME.BG_APP; e.currentTarget.style.color = CONFIG.THEME.TEXT_SEC; }}
            >✕</button>
            
            {/* Top Profile Header */}
            <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', borderBottom: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingBottom: '40px', marginBottom: '40px' }}>
              <div style={{ position: 'relative' }}>
                 <div style={{ width: '160px', height: '160px', borderRadius: CONFIG.THEME.RADIUS_LG, background: Utils.generateAvatarGradient(selectedUser.name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', fontWeight: '700', flexShrink: 0, boxShadow: CONFIG.THEME.SHADOW_MD }}>
                   {selectedUser.initials}
                 </div>
                 {selectedUser.verified && (
                   <div style={{ position: 'absolute', bottom: -10, right: -10, background: CONFIG.THEME.SUCCESS, color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: `4px solid ${CONFIG.THEME.BG_SURFACE}`, boxShadow: CONFIG.THEME.SHADOW_SM }} title="Verified Profile">✓</div>
                 )}
              </div>
              
              <div style={{ flex: 1, paddingRight: '48px' }}>
                <h2 style={{ fontSize: '2.5rem', color: CONFIG.THEME.NAVY_MAIN, margin: '0 0 8px 0', fontWeight: '700', letterSpacing: '-0.02em' }}>{selectedUser.name}</h2>
                <div style={{ fontSize: '1.25rem', color: CONFIG.THEME.TEXT_PRI, fontWeight: '500', marginBottom: '24px' }}>{selectedUser.role} at <strong style={{color: CONFIG.THEME.NAVY_MAIN}}>{selectedUser.company}</strong></div>
                
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
                  <Badge label={selectedUser.status} color={Utils.getStatusStyle(selectedUser.status).color} bg={Utils.getStatusStyle(selectedUser.status).bg} />
                  <Badge label={selectedUser.mentorship === 'Available' ? 'Open to Mentoring' : 'Mentorship Unavailable'} color={selectedUser.mentorship === 'Available' ? CONFIG.THEME.ACCENT_PURPLE : CONFIG.THEME.TEXT_SEC} bg={selectedUser.mentorship === 'Available' ? '#F3E8FF' : CONFIG.THEME.BG_APP} />
                  <Badge label={`${selectedUser.connections} Connections`} color={CONFIG.THEME.TEXT_SEC} outline />
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <Button onClick={() => alert(`Connect request initialized for ${selectedUser.name}.`)}>Connect via Network</Button>
                  <Button variant="outline" onClick={() => alert(`Message interface opened.`)}>Send Direct Message</Button>
                </div>
              </div>
            </div>

            {/* Detailed Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '48px' }}>
              
              {/* Left Column: Bio & Skills */}
              <div>
                <h4 style={{ fontSize: '0.875rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', marginTop: 0 }}>Executive Summary</h4>
                <p style={{ margin: '0 0 40px 0', lineHeight: 1.8, color: CONFIG.THEME.TEXT_PRI, fontSize: '1.1rem' }}>{selectedUser.bio}</p>

                <h4 style={{ fontSize: '0.875rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Core Competencies</h4>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {selectedUser.skills.map(s => (
                    <span key={s} style={{ padding: '8px 16px', background: CONFIG.THEME.BG_APP, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, borderRadius: CONFIG.THEME.RADIUS_FULL, fontSize: '0.875rem', color: CONFIG.THEME.NAVY_MAIN, fontWeight: '600', transition: CONFIG.THEME.TRANSITION_FAST }} onMouseEnter={e => e.currentTarget.style.borderColor = CONFIG.THEME.NAVY_MAIN} onMouseLeave={e => e.currentTarget.style.borderColor = CONFIG.THEME.BORDER_LIGHT}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Column: Structured Data */}
              <div style={{ background: CONFIG.THEME.BG_SURFACE_ALT, borderRadius: CONFIG.THEME.RADIUS_LG, padding: '32px', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '0.05em' }}>Academic Background</div>
                  <div style={{ fontWeight: '700', color: CONFIG.THEME.TEXT_PRI, fontSize: '1.1rem' }}>{selectedUser.degree}</div>
                  <div style={{ fontSize: '0.875rem', color: CONFIG.THEME.TEXT_SEC, marginTop: '8px' }}>{selectedUser.school}</div>
                  <div style={{ fontSize: '0.875rem', color: CONFIG.THEME.TEXT_SEC, marginTop: '4px' }}>Class of {selectedUser.batch}</div>
                </div>

                <div style={{ borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingTop: '32px' }}>
                  <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '0.05em' }}>Contact & Location</div>
                  <div style={{ fontWeight: '700', color: CONFIG.THEME.TEXT_PRI, fontSize: '1rem', wordBreak: 'break-all', marginBottom: '8px' }}>{selectedUser.email}</div>
                  <div style={{ fontSize: '0.875rem', color: CONFIG.THEME.TEXT_SEC }}>{selectedUser.location}</div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;