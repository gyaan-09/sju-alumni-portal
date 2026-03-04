import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, getDocs, addDoc, query, orderBy, 
  serverTimestamp, onSnapshot, Timestamp 
} from "firebase/firestore";

/**
 * =================================================================================
 * SJU CAREER GATEWAY: UNIFIED ENHANCED ENTERPRISE BUILD (v3.0)
 * =================================================================================
 * Inherits full design language from SJU Mentorship Gateway.
 * Features:
 * - Firebase Real-time Database Integration (Persistent Job Posting)
 * - 4-Step Ultra-Enhanced Job Posting Wizard
 * - Views: Grid, List, Kanban, Analytics
 * - Custom SVG Data Visualizations
 * - 'Lora' Typography & Navy/Gold Corporate Palette
 * =================================================================================
 */

/* =========================================================
   1) CONFIGURATION & THEME
   ========================================================= */
const CONFIG = {
  SYSTEM: {
    APP_NAME: "SJU Career Gateway",
    VERSION: "3.0.0 Enterprise",
    ORG: "St. Joseph's University"
  },
  DATA: {
    PAGE_SIZE: 12,
    TOTAL_MOCK: 150
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
   2) FIREBASE CONFIGURATION (SAFE WRAPPER)
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
  const firebaseApp = initializeApp(firebaseConfig);
  db = getFirestore(firebaseApp);
} catch (error) {
  console.warn("Firebase skipped. Using MockDB fallback.");
}

/* =========================================================
   3) ENTERPRISE MOCK DATABASE (FALLBACK)
   ========================================================= */
const MockDB = {
  roles: ["Senior Software Engineer", "Product Manager", "Data Scientist", "UX/UI Designer", "Investment Analyst", "HR Business Partner", "Marketing Director", "Operations Lead"],
  companies: ["Google", "Microsoft", "Goldman Sachs", "McKinsey", "Tesla", "Zerodha", "Swiggy", "Deloitte", "Amazon", "Apple"],
  locations: ["Bengaluru", "Mumbai", "Remote", "London", "New York", "Singapore", "Pune", "Hyderabad"],
  types: ["Full-time", "Internship", "Contract", "Freelance"],
  modes: ["Onsite", "Remote", "Hybrid"],
  industries: ["Technology", "Finance", "Consulting", "FMCG", "Automotive", "E-commerce"],
  
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
  generate: (count = CONFIG.DATA.TOTAL_MOCK) => {
    return Array.from({ length: count }, (_, i) => {
      const role = MockDB.pick(MockDB.roles);
      const company = MockDB.pick(MockDB.companies);
      const isHot = Math.random() > 0.8;
      return {
        id: `JOB-MOCK-${10000 + i}`,
        title: role,
        company: company,
        location: MockDB.pick(MockDB.locations),
        type: MockDB.pick(MockDB.types),
        workMode: MockDB.pick(MockDB.modes),
        industry: MockDB.pick(MockDB.industries),
        experience: Math.random() > 0.5 ? "Mid-Level" : (Math.random() > 0.5 ? "Senior" : "Entry-Level"),
        salary: `₹${Math.floor(Math.random() * 20) + 8}L - ₹${Math.floor(Math.random() * 20) + 28}L`,
        description: `We are looking for a visionary ${role} to drive innovation at ${company}. You will work with cross-functional teams to build scalable solutions.`,
        responsibilities: "Lead project development\nMentorship of junior staff\nStrategic planning",
        skills: ["Strategy", "Leadership", "Analysis", "Agile"].sort(() => 0.5 - Math.random()).slice(0, 3),
        perks: "Health Insurance, Stock Options, Flexible Hours",
        deadline: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        applyUrl: `https://${company.toLowerCase()}.com/careers`,
        isHot: isHot,
        postedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
        stage: "Sourcing"
      };
    });
  }
};

/* =========================================================
   4) GLOBAL STYLES & ANIMATIONS
   ========================================================= */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
    
    body {
      margin: 0; padding: 0; background-color: ${CONFIG.THEME.BG_APP};
      font-family: 'Lora', serif; color: ${CONFIG.THEME.TEXT_PRI};
      -webkit-font-smoothing: antialiased; overflow-x: hidden; line-height: 1.6;
    }
    * { box-sizing: border-box; }
    h1, h2, h3, h4, h5, h6, button, input, select, textarea, span, p, div { font-family: 'Lora', serif; }

    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: ${CONFIG.THEME.BG_APP}; border-left: 1px solid ${CONFIG.THEME.BORDER_LIGHT}; }
    ::-webkit-scrollbar-thumb { background: ${CONFIG.THEME.BORDER}; border-radius: 10px; border: 2px solid ${CONFIG.THEME.BG_APP}; }
    ::-webkit-scrollbar-thumb:hover { background: ${CONFIG.THEME.TEXT_TER}; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUpFade { from { opacity: 0; transform: translateY(25px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleInModal { from { opacity: 0; transform: scale(0.97) translateY(15px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes slideLeft { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }

    .animated-card {
      background: ${CONFIG.THEME.BG_SURFACE}; border-radius: ${CONFIG.THEME.RADIUS_LG};
      border: 1px solid ${CONFIG.THEME.BORDER_LIGHT}; transition: ${CONFIG.THEME.TRANSITION_BOUNCE};
      cursor: pointer; position: relative; overflow: hidden; z-index: 1; height: 100%; display: flex; flex-direction: column;
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
      background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: ${CONFIG.THEME.SHADOW_SM};
    }
    .sju-input {
      width: 100%; padding: 12px 16px; border-radius: ${CONFIG.THEME.RADIUS_MD};
      border: 1px solid ${CONFIG.THEME.BORDER_LIGHT}; font-size: 1rem; background: ${CONFIG.THEME.BG_SURFACE}; 
      transition: all 0.3s ease; color: ${CONFIG.THEME.TEXT_PRI};
    }
    .sju-input:focus { border-color: ${CONFIG.THEME.NAVY_MAIN}; box-shadow: 0 0 0 4px rgba(12, 35, 64, 0.1); outline: none; }
  `}</style>
);

/* =========================================================
   5) UTILITIES
   ========================================================= */
const Utils = {
  formatNumber: (num) => num > 999 ? (num / 1000).toFixed(1) + 'k' : num.toString(),
  generateAvatarGradient: (str) => {
    if (!str) return '#ccc';
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const h1 = Math.abs(hash) % 50 + 200; 
    const h2 = (h1 + 40) % 360;
    return `linear-gradient(135deg, hsl(${h1}, 70%, 25%), hsl(${h2}, 80%, 40%))`;
  },
  timeAgo: (dateStr) => {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    return "Just now";
  }
};

/* =========================================================
   6) ATOMIC UI COMPONENTS
   ========================================================= */
const Badge = ({ label, color, bg, outline = false }) => (
  <span style={{ 
    display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: CONFIG.THEME.RADIUS_FULL, 
    fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', color: color, 
    backgroundColor: outline ? 'transparent' : bg || `${color}15`,
    border: outline ? `1px solid ${color}` : `1px solid transparent`, whiteSpace: 'nowrap'
  }}>{label}</span>
);

const Button = ({ children, onClick, variant = 'primary', disabled = false, fullWidth = false }) => {
  let style = {
    padding: '12px 24px', borderRadius: CONFIG.THEME.RADIUS_FULL, fontWeight: '700', fontSize: '0.875rem',
    cursor: disabled ? 'not-allowed' : 'pointer', transition: CONFIG.THEME.TRANSITION_FAST, width: fullWidth ? '100%' : 'auto',
    border: 'none', opacity: disabled ? 0.6 : 1, textTransform: 'uppercase', letterSpacing: '0.1em'
  };
  if (variant === 'primary') style = { ...style, background: CONFIG.THEME.NAVY_MAIN, color: CONFIG.THEME.GOLD_MAIN, boxShadow: CONFIG.THEME.SHADOW_SM };
  if (variant === 'outline') style = { ...style, background: 'transparent', color: CONFIG.THEME.NAVY_MAIN, border: `2px solid ${CONFIG.THEME.NAVY_MAIN}` };
  if (variant === 'danger') style = { ...style, background: CONFIG.THEME.DANGER_BG, color: CONFIG.THEME.DANGER };
  
  return <button onClick={onClick} disabled={disabled} style={style}
    onMouseEnter={e => !disabled && variant === 'primary' && (e.currentTarget.style.transform = 'translateY(-2px)')}
    onMouseLeave={e => !disabled && variant === 'primary' && (e.currentTarget.style.transform = 'translateY(0)')}
  >{children}</button>;
};

const FilterAccordion = ({ title, options, activeValue, onSelect }) => {
  const [isOpen, setIsOpen] = useState(true);
  if (!options || options.length === 0) return null;
  return (
    <div style={{ marginBottom: '16px', borderBottom: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingBottom: '16px' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: CONFIG.THEME.NAVY_MAIN, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', color: CONFIG.THEME.TEXT_TER }}>▼</span>
      </div>
      <div style={{ maxHeight: isOpen ? '600px' : '0px', overflow: 'hidden', transition: CONFIG.THEME.TRANSITION_SMOOTH, marginTop: isOpen ? '12px' : '0px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {options.map(opt => {
          const isActive = activeValue === opt.val;
          return (
            <div key={opt.val} onClick={() => onSelect(opt.val)} style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: CONFIG.THEME.RADIUS_SM, 
              background: isActive ? CONFIG.THEME.NAVY_MAIN : 'transparent', color: isActive ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.TEXT_SEC, 
              cursor: 'pointer', fontSize: '0.9rem', fontWeight: isActive ? '700' : '500', transition: CONFIG.THEME.TRANSITION_FAST
            }}>
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
   7) POST JOB WIZARD (ULTRA-ENHANCED)
   ========================================================= */
const PostJobWizard = ({ onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '', company: '', location: '', type: 'Full-time', workMode: 'Onsite', industry: '',
    experience: 'Mid-Level', salary: '', description: '', responsibilities: '', skills: '', perks: '', deadline: '', applyUrl: ''
  });

  const canContinue = () => {
    if (step === 1) return form.title.trim() && form.company.trim() && form.location.trim();
    if (step === 2) return form.description.trim() && form.skills.trim();
    if (step === 3) return form.salary.trim() && form.deadline.trim();
    return true;
  };

  const steps = ['Core Details', 'Requirements', 'Compensation', 'Publish'];

  return (
    <div style={{ padding: '10px 0', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '2rem', color: CONFIG.THEME.NAVY_MAIN, marginBottom: '8px', marginTop: 0 }}>Create Opportunity</h2>
      <p style={{ color: CONFIG.THEME.TEXT_SEC, marginBottom: '24px', fontSize: '1.1rem' }}>Expand your team with SJU top talent.</p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        {steps.map((label, i) => (
          <div key={i} style={{ flex: 1 }}>
             <div style={{ height: '6px', borderRadius: '3px', background: i + 1 <= step ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.BORDER_LIGHT, transition: CONFIG.THEME.TRANSITION_SMOOTH, marginBottom: '8px' }} />
             <div style={{ fontSize: '0.75rem', fontWeight: '700', color: i + 1 <= step ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.TEXT_TER, textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '12px' }}>
        {step === 1 && (
          <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><label style={{ fontWeight: '700', marginBottom: '8px', display: 'block' }}>Job Title *</label><input className="sju-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Senior Product Designer" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><label style={{ fontWeight: '700', marginBottom: '8px', display: 'block' }}>Company *</label><input className="sju-input" value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="e.g. Acme Corp" /></div>
              <div><label style={{ fontWeight: '700', marginBottom: '8px', display: 'block' }}>Industry</label><input className="sju-input" value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} placeholder="e.g. FinTech" /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
               <div><label style={{ fontWeight: '700', marginBottom: '8px', display: 'block' }}>Location *</label><input className="sju-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="City, Country" /></div>
               <div><label style={{ fontWeight: '700', marginBottom: '8px', display: 'block' }}>Work Mode</label><select className="sju-input" value={form.workMode} onChange={e => setForm({...form, workMode: e.target.value})}><option>Onsite</option><option>Remote</option><option>Hybrid</option></select></div>
            </div>
            <div><label style={{ fontWeight: '700', marginBottom: '8px', display: 'block' }}>Employment Type</label><select className="sju-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option>Full-time</option><option>Contract</option><option>Internship</option><option>Freelance</option></select></div>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><label style={{ fontWeight: '700', marginBottom: '8px', display: 'block' }}>Job Description *</label><textarea className="sju-input" style={{ minHeight: '120px' }} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Overview of the role..." /></div>
            <div><label style={{ fontWeight: '700', marginBottom: '8px', display: 'block' }}>Key Responsibilities</label><textarea className="sju-input" style={{ minHeight: '100px' }} value={form.responsibilities} onChange={e => setForm({...form, responsibilities: e.target.value})} placeholder="Bullet points of daily tasks..." /></div>
            <div><label style={{ fontWeight: '700', marginBottom: '8px', display: 'block' }}>Required Skills * (Comma separated)</label><input className="sju-input" value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} placeholder="e.g. React, Node.js, Leadership" /></div>
            <div><label style={{ fontWeight: '700', marginBottom: '8px', display: 'block' }}>Experience Level</label><select className="sju-input" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})}><option>Entry-Level</option><option>Mid-Level</option><option>Senior</option><option>Executive</option></select></div>
          </div>
        )}

        {step === 3 && (
          <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><label style={{ fontWeight: '700', marginBottom: '8px', display: 'block' }}>Salary Range *</label><input className="sju-input" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} placeholder="e.g. ₹15L - ₹20L or $100k-$120k" /></div>
            <div><label style={{ fontWeight: '700', marginBottom: '8px', display: 'block' }}>Perks & Benefits</label><input className="sju-input" value={form.perks} onChange={e => setForm({...form, perks: e.target.value})} placeholder="Health Insurance, 401k, Gym..." /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><label style={{ fontWeight: '700', marginBottom: '8px', display: 'block' }}>Application Deadline *</label><input type="date" className="sju-input" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} /></div>
              <div><label style={{ fontWeight: '700', marginBottom: '8px', display: 'block' }}>External Apply URL (Optional)</label><input type="url" className="sju-input" value={form.applyUrl} onChange={e => setForm({...form, applyUrl: e.target.value})} placeholder="https://..." /></div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ animation: 'scaleInModal 0.3s ease', background: CONFIG.THEME.BG_SURFACE_ALT, padding: '32px', borderRadius: CONFIG.THEME.RADIUS_LG, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
             <h3 style={{ margin: '0 0 8px 0', color: CONFIG.THEME.NAVY_MAIN, fontSize: '1.75rem' }}>{form.title}</h3>
             <div style={{ fontSize: '1.1rem', color: CONFIG.THEME.TEXT_SEC, marginBottom: '24px' }}>{form.company} • {form.location} ({form.workMode})</div>
             
             <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <Badge label={form.type} color={CONFIG.THEME.NAVY_MAIN} bg={CONFIG.THEME.GOLD_LITE} />
                <Badge label={form.experience} color={CONFIG.THEME.ACCENT_PURPLE} outline />
                <Badge label={form.salary} color={CONFIG.THEME.SUCCESS} bg={CONFIG.THEME.SUCCESS_BG} />
             </div>
             
             <h4 style={{ fontSize: '0.85rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Description</h4>
             <p style={{ color: CONFIG.THEME.TEXT_PRI }}>{form.description}</p>
             
             <h4 style={{ fontSize: '0.85rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '24px' }}>Skills</h4>
             <div style={{ color: CONFIG.THEME.TEXT_PRI, fontWeight: '600' }}>{form.skills}</div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingTop: '24px', marginTop: '24px' }}>
        <Button variant="outline" onClick={() => step === 1 ? onClose() : setStep(s => s - 1)}>{step === 1 ? 'Cancel' : 'Back'}</Button>
        <Button variant="primary" disabled={!canContinue()} onClick={() => step === 4 ? onSubmit(form) : setStep(s => s + 1)}>{step === 4 ? 'Publish Job' : 'Next Step'}</Button>
      </div>
    </div>
  );
};

/* =========================================================
   8) VIEWS: GRID, LIST, ANALYTICS, KANBAN
   ========================================================= */
const GridView = ({ data, onSelect }) => {
  if (data.length === 0) return <EmptyState />;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
      {data.map((job, i) => (
        <div key={job.id} className="animated-card" style={{ animation: `slideUpFade 0.4s ease forwards ${Math.min(i * 0.04, 0.4)}s`, opacity: 0 }} onClick={() => onSelect(job)}>
          <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: CONFIG.THEME.RADIUS_MD, background: Utils.generateAvatarGradient(job.company), color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '800', boxShadow: CONFIG.THEME.SHADOW_MD }}>
                {job.company.charAt(0)}
              </div>
              {job.isHot && <Badge label="Hot" color={CONFIG.THEME.DANGER} bg={CONFIG.THEME.DANGER_BG} />}
            </div>
            
            <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', color: CONFIG.THEME.NAVY_MAIN, fontWeight: '700', lineHeight: 1.3 }}>{job.title}</h3>
            <div style={{ fontSize: '0.9rem', color: CONFIG.THEME.TEXT_SEC, fontWeight: '500', marginBottom: '16px' }}>{job.company} • {job.location}</div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
               <Badge label={job.workMode} color={CONFIG.THEME.TEXT_SEC} outline />
               <Badge label={job.type} color={CONFIG.THEME.TEXT_SEC} outline />
            </div>
            
            <div style={{ marginTop: 'auto', borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Compensation</div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: CONFIG.THEME.SUCCESS }}>{job.salary}</div>
              </div>
              <div style={{ fontSize: '0.8rem', color: CONFIG.THEME.TEXT_TER, fontWeight: '500' }}>{Utils.timeAgo(job.postedAt)}</div>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
};

const ListView = ({ data, onSelect }) => {
  if (data.length === 0) return <EmptyState />;
  return (
    <div className="glass-panel" style={{ borderRadius: CONFIG.THEME.RADIUS_LG, overflow: 'hidden', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
          <thead style={{ background: CONFIG.THEME.BG_SURFACE_ALT, color: CONFIG.THEME.NAVY_MAIN }}>
            <tr>
              {['Role & Company', 'Location & Mode', 'Experience', 'Compensation', 'Action'].map(h => (
                <th key={h} style={{ padding: '20px 24px', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', borderBottom: `2px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((job, i) => (
              <tr key={job.id} className="animated-row" style={{ animation: `fadeIn 0.3s ease forwards ${Math.min(i * 0.03, 0.3)}s`, opacity: 0, background: CONFIG.THEME.BG_SURFACE }} onClick={() => onSelect(job)}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: CONFIG.THEME.RADIUS_MD, background: Utils.generateAvatarGradient(job.company), color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', flexShrink: 0 }}>{job.company.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: '700', color: CONFIG.THEME.NAVY_MAIN, fontSize: '1rem' }}>{job.title} {job.isHot && <span style={{color: CONFIG.THEME.DANGER, fontSize: '0.8rem'}}>🔥</span>}</div>
                      <div style={{ fontSize: '0.85rem', color: CONFIG.THEME.TEXT_SEC }}>{job.company} • {job.industry}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: '600', color: CONFIG.THEME.TEXT_PRI, fontSize: '0.875rem' }}>{job.location}</div>
                  <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_SEC }}>{job.workMode} • {job.type}</div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: CONFIG.THEME.TEXT_PRI, fontWeight: '500' }}>{job.experience}</td>
                <td style={{ padding: '16px 24px', fontWeight: '800', color: CONFIG.THEME.SUCCESS }}>{job.salary}</td>
                <td style={{ padding: '16px 24px' }}>
                  <Button variant="outline" onClick={(e) => { e.stopPropagation(); onSelect(job); }}>View</Button>
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
  const getAgg = (key, limit=5) => {
    const counts = {};
    data.forEach(d => counts[d[key]] = (counts[d[key]] || 0) + 1);
    return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,limit);
  };

  const TopCard = ({ title, value, sub }) => (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: CONFIG.THEME.RADIUS_LG, animation: `slideUpFade 0.5s ease forwards` }}>
      <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.1em' }}>{title}</div>
      <div style={{ fontSize: '2.5rem', fontWeight: '700', color: CONFIG.THEME.NAVY_MAIN, margin: '8px 0', background: `linear-gradient(90deg, ${CONFIG.THEME.NAVY_MAIN}, ${CONFIG.THEME.GOLD_MAIN})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</div>
      <div style={{ fontSize: '0.875rem', color: CONFIG.THEME.TEXT_SEC, fontWeight: '500' }}>{sub}</div>
    </div>
  );

  const SvgDonutChart = ({ title, dataArr }) => {
    const total = dataArr.reduce((sum, [, val]) => sum + val, 0);
    let currentAngle = -90; const radius = 100; const circumference = 2 * Math.PI * radius; const cx = 150; const cy = 150;
    const colors = [CONFIG.THEME.NAVY_MAIN, CONFIG.THEME.GOLD_MAIN, CONFIG.THEME.ACCENT_CYAN, CONFIG.THEME.NAVY_LITE, CONFIG.THEME.TEXT_TER];

    return (
       <div className="glass-panel" style={{ padding: '32px', borderRadius: CONFIG.THEME.RADIUS_LG, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', color: CONFIG.THEME.NAVY_MAIN, fontWeight: '700' }}>{title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <svg width="300" height="300" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
            {dataArr.map(([label, val], i) => {
              const fraction = val / total; const strokeDasharray = `${fraction * circumference} ${circumference}`;
              const strokeDashoffset = -(currentAngle + 90) / 360 * circumference; currentAngle += fraction * 360;
              return <circle key={label} cx={cx} cy={cy} r={radius} fill="transparent" stroke={colors[i % colors.length]} strokeWidth="40" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} style={{ transition: 'stroke-dashoffset 1s ease-out' }}><title>{label}: {val}</title></circle>;
            })}
            <text x={cx} y={cy} transform="rotate(90 150 150)" textAnchor="middle" dominantBaseline="middle" fill={CONFIG.THEME.NAVY_MAIN} fontSize="24" fontWeight="700">{Utils.formatNumber(total)}</text>
            <text x={cx} y={cy + 25} transform="rotate(90 150 150)" textAnchor="middle" dominantBaseline="middle" fill={CONFIG.THEME.TEXT_TER} fontSize="12" fontWeight="500">TOTAL</text>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
             {dataArr.map(([label, val], i) => (
               <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
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
        <TopCard title="Active Listings" value={Utils.formatNumber(data.length)} sub="In current filtered view" />
        <TopCard title="Top Location" value={getAgg('location', 1)[0]?.[0] || 'N/A'} sub="Highest volume city" />
        <TopCard title="Top Industry" value={getAgg('industry', 1)[0]?.[0] || 'N/A'} sub="Leading hiring sector" />
        <TopCard title="Remote Roles" value={data.filter(j => j.workMode === 'Remote').length} sub="Work from anywhere" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <SvgDonutChart title="Jobs by Experience Level" dataArr={getAgg('experience', 4)} />
        <SvgDonutChart title="Jobs by Work Mode" dataArr={getAgg('workMode', 3)} />
      </div>
    </div>
  );
};

const KanbanView = ({ data, onSelect }) => {
  const stages = ["Entry-Level", "Mid-Level", "Senior", "Executive"];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', overflowX: 'auto', paddingBottom: '20px' }}>
      {stages.map(stage => {
        const stageData = data.filter(d => d.experience === stage);
        return (
          <div key={stage} className="glass-panel" style={{ borderRadius: CONFIG.THEME.RADIUS_LG, padding: '20px', display: 'flex', flexDirection: 'column', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, background: CONFIG.THEME.BG_SURFACE_ALT }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: `2px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingBottom: '12px' }}>
               <h4 style={{ margin: 0, color: CONFIG.THEME.NAVY_MAIN, fontSize: '1.1rem' }}>{stage}</h4>
               <Badge label={stageData.length} color={CONFIG.THEME.TEXT_SEC} bg={CONFIG.THEME.BORDER_LIGHT} />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '600px', paddingRight: '8px' }}>
               {stageData.map((job, i) => (
                 <div key={job.id} onClick={() => onSelect(job)} className="animated-card" style={{ padding: '16px', animation: `slideUpFade 0.3s ease forwards ${i * 0.05}s`, opacity: 0 }}>
                    <div style={{ fontWeight: '700', color: CONFIG.THEME.NAVY_MAIN, marginBottom: '4px', fontSize: '0.95rem' }}>{job.title}</div>
                    <div style={{ fontSize: '0.8rem', color: CONFIG.THEME.TEXT_SEC, marginBottom: '8px' }}>{job.company}</div>
                    <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.SUCCESS, fontWeight: '700' }}>{job.salary}</div>
                 </div>
               ))}
             </div>
          </div>
        )
      })}
    </div>
  );
};

const EmptyState = ({ msg = "No jobs found matching your criteria." }) => (
  <div style={{ padding: '100px 20px', textAlign: 'center' }}>
    <div style={{ fontSize: '4rem', opacity: 0.2, marginBottom: '24px' }}>🏢</div>
    <h3 style={{ color: CONFIG.THEME.NAVY_MAIN, margin: '0 0 12px 0', fontSize: '1.5rem', fontWeight: '700' }}>No Results</h3>
    <p style={{ color: CONFIG.THEME.TEXT_SEC, fontSize: '1rem' }}>{msg}</p>
  </div>
);

/* =========================================================
   9) MAIN APPLICATION (CAREER GATEWAY)
   ========================================================= */
const CareerGateway = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [view, setView] = useState('GRID'); 
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  
  const [selectedJob, setSelectedJob] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [filters, setFilters] = useState({ industry: null, workMode: null, experience: null, type: null, location: null });
  const scrollRef = useRef(null);

  useEffect(() => {
    let unsubscribe = () => {};
    const fetchJobs = async () => {
      setLoading(true);
      if (db && firebaseConfig.apiKey !== "YOUR_API_KEY") {
        try {
          const q = query(collection(db, 'jobs'), orderBy('postedAt', 'desc'));
          // Real-time listener for permanently displaying newly posted jobs immediately
          unsubscribe = onSnapshot(q, (snapshot) => {
             const firestoreData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
             if(firestoreData.length > 0) {
               setData(firestoreData);
               setLoading(false);
             } else {
               setData(MockDB.generate());
               setLoading(false);
             }
          });
          return;
        } catch (error) {
          console.error("Firestore Error, falling back to MockDB:", error);
        }
      }
      // Fallback
      setTimeout(() => { setData(MockDB.generate()); setLoading(false); }, 800);
    };
    fetchJobs();
    return () => unsubscribe();
  }, []);

  const { filteredData, facets } = useMemo(() => {
    let res = data;
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(j => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || (j.skills && j.skills.some(s=>s.toLowerCase().includes(q))));
    }
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null) res = res.filter(j => j[key] === filters[key]);
    });

    const counts = { industry: {}, workMode: {}, experience: {}, type: {}, location: {} };
    res.forEach(j => {
      counts.industry[j.industry] = (counts.industry[j.industry] || 0) + 1;
      counts.workMode[j.workMode] = (counts.workMode[j.workMode] || 0) + 1;
      counts.experience[j.experience] = (counts.experience[j.experience] || 0) + 1;
      counts.type[j.type] = (counts.type[j.type] || 0) + 1;
      counts.location[j.location] = (counts.location[j.location] || 0) + 1;
    });
    return { filteredData: res, facets: counts };
  }, [data, search, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / CONFIG.DATA.PAGE_SIZE));
  useEffect(() => { if (page > totalPages) setPage(totalPages > 0 ? totalPages : 1); }, [totalPages, page]);
  const paginatedData = useMemo(() => filteredData.slice((page - 1) * CONFIG.DATA.PAGE_SIZE, page * CONFIG.DATA.PAGE_SIZE), [filteredData, page]);

  const handlePageChange = useCallback((dir) => {
    if(dir === 'prev' && page > 1) setPage(p => p-1);
    if(dir === 'next' && page < totalPages) setPage(p => p+1);
    if (scrollRef.current) window.scrollTo({ top: scrollRef.current.offsetTop - 100, behavior: 'smooth' });
  }, [page, totalPages]);

  const toggleFilter = (key, val) => { setFilters(prev => ({ ...prev, [key]: prev[key] === val ? null : val })); setPage(1); };
  const clearFilters = () => { setFilters({ industry: null, workMode: null, experience: null, type: null, location: null }); setSearch(''); setPage(1); };
  const getFacetArray = (obj, limit = 6) => Object.entries(obj).map(([label, count]) => ({ val: label, label, count })).sort((a,b) => b.count - a.count).slice(0,limit);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleJobSubmit = async (jobData) => {
    const finalJob = {
      ...jobData,
      postedAt: new Date().toISOString(),
      skills: jobData.skills.split(',').map(s => s.trim()).filter(Boolean),
      isHot: true,
      stage: 'New'
    };

    if (db && firebaseConfig.apiKey !== "YOUR_API_KEY") {
      try {
        await addDoc(collection(db, 'jobs'), finalJob);
        showToast("Opportunity permanently published to database!");
      } catch (e) {
        console.error(e);
        showToast("Error saving to database. Falling back to local state.");
        setData([finalJob, ...data]);
      }
    } else {
      finalJob.id = `JOB-LOCAL-${Date.now()}`;
      setData([finalJob, ...data]);
      showToast("Opportunity published locally (Mock Mode).");
    }
    setIsPosting(false);
  };

  if (loading) return (
    <div style={{ height: '100vh', width: '100vw', background: CONFIG.THEME.NAVY_DARK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <GlobalStyles />
      <div style={{ width: '80px', height: '80px', border: `4px solid rgba(212, 175, 55, 0.1)`, borderTopColor: CONFIG.THEME.GOLD_MAIN, borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '32px' }} />
      <div style={{ fontSize: '2rem', fontWeight: '700', letterSpacing: '0.1em', color: CONFIG.THEME.GOLD_MAIN, textTransform: 'uppercase' }}>{CONFIG.SYSTEM.ORG}</div>
      <div style={{ fontSize: '1rem', fontWeight: '500', letterSpacing: '0.2em', color: CONFIG.THEME.TEXT_TER, marginTop: '8px' }}>INITIALIZING CAREER GATEWAY</div>
    </div>
  );

  return (
    <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '80px' }}>
      <GlobalStyles />
      
      {/* HEADER SECTION (CLEANED AS REQUESTED) */}
      <header style={{ background: CONFIG.THEME.NAVY_MAIN, padding: '80px 0 100px 0', textAlign: 'center', position: 'relative', overflow: 'hidden', borderBottom: `4px solid ${CONFIG.THEME.GOLD_MAIN}` }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ color: 'white', fontSize: '3.5rem', fontWeight: '700', margin: '0 0 20px 0', letterSpacing: '-0.02em', lineHeight: 1.1 }}>CAREER GATEWAY</h1>
          <p style={{ color: CONFIG.THEME.TEXT_TER, fontSize: '1.25rem', margin: '0 0 32px 0', fontWeight: '400', lineHeight: 1.6 }}>
            Unlock exclusive opportunities from top-tier partners. Leveraging AI matching to find your perfect fit.
          </p>
          <Button onClick={() => setIsPosting(true)}>Post Opportunity</Button>
        </div>
      </header>

      {/* ENTERPRISE WORKSPACE */}
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 32px', display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px', position: 'relative', zIndex: 10, marginTop: '-50px' }}>
        
        {/* SIDEBAR */}
        <aside style={{ height: 'calc(100vh - 40px)', position: 'sticky', top: '20px' }}>
          <div className="glass-panel" style={{ borderRadius: CONFIG.THEME.RADIUS_LG, padding: '32px 24px', height: '100%', overflowY: 'auto', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '16px', borderBottom: `2px solid ${CONFIG.THEME.NAVY_MAIN}` }}>
              <span style={{ fontWeight: '700', fontSize: '1.25rem', color: CONFIG.THEME.NAVY_MAIN }}>Filters</span>
              {(search || Object.values(filters).some(v => v !== null)) && <span onClick={clearFilters} style={{ fontSize: '0.75rem', color: CONFIG.THEME.DANGER, cursor: 'pointer', fontWeight: '700', textTransform: 'uppercase' }}>Reset</span>}
            </div>
            <FilterAccordion title="Experience" options={getFacetArray(facets.experience)} activeValue={filters.experience} onSelect={(v) => toggleFilter('experience', v)} />
            <FilterAccordion title="Work Mode" options={getFacetArray(facets.workMode)} activeValue={filters.workMode} onSelect={(v) => toggleFilter('workMode', v)} />
            <FilterAccordion title="Industry" options={getFacetArray(facets.industry)} activeValue={filters.industry} onSelect={(v) => toggleFilter('industry', v)} />
            <FilterAccordion title="Job Type" options={getFacetArray(facets.type)} activeValue={filters.type} onSelect={(v) => toggleFilter('type', v)} />
            <FilterAccordion title="Location" options={getFacetArray(facets.location)} activeValue={filters.location} onSelect={(v) => toggleFilter('location', v)} />
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main ref={scrollRef} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="glass-panel" style={{ padding: '20px 32px', borderRadius: CONFIG.THEME.RADIUS_LG, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
            <div style={{ position: 'relative', width: '450px' }}>
              <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
              <input className="sju-input" style={{ paddingLeft: '48px', borderRadius: CONFIG.THEME.RADIUS_FULL }} placeholder="Search roles, companies, skills..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div style={{ display: 'flex', gap: '8px', background: CONFIG.THEME.BG_APP, padding: '8px', borderRadius: CONFIG.THEME.RADIUS_SM, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
              {['GRID', 'LIST', 'KANBAN', 'ANALYTICS'].map(v => (
                <button key={v} onClick={() => { setView(v); setPage(1); }} style={{ padding: '8px 20px', border: 'none', background: view === v ? CONFIG.THEME.BG_SURFACE : 'transparent', borderRadius: '6px', fontWeight: '700', fontSize: '0.8rem', color: view === v ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.TEXT_SEC, cursor: 'pointer', boxShadow: view === v ? CONFIG.THEME.SHADOW_SM : 'none', transition: CONFIG.THEME.TRANSITION_FAST }}>{v}</button>
              ))}
            </div>
          </div>

          <div style={{ minHeight: '800px' }}>
            {view === 'GRID' && <GridView data={paginatedData} onSelect={setSelectedJob} />}
            {view === 'LIST' && <ListView data={paginatedData} onSelect={setSelectedJob} />}
            {view === 'KANBAN' && <KanbanView data={filteredData} onSelect={setSelectedJob} />}
            {view === 'ANALYTICS' && <AnalyticsView data={filteredData} />}
          </div>

          {(view === 'GRID' || view === 'LIST') && totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0', borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
               <div style={{ fontSize: '0.875rem', color: CONFIG.THEME.TEXT_SEC }}>Showing {((page - 1) * CONFIG.DATA.PAGE_SIZE) + 1} to {Math.min(page * CONFIG.DATA.PAGE_SIZE, filteredData.length)} of {filteredData.length}</div>
               <div style={{ display: 'flex', gap: '8px' }}>
                 <Button variant="outline" onClick={() => handlePageChange('prev')} disabled={page === 1}>Prev</Button>
                 <div style={{ padding: '12px 24px', background: CONFIG.THEME.NAVY_MAIN, color: CONFIG.THEME.GOLD_MAIN, borderRadius: CONFIG.THEME.RADIUS_FULL, fontWeight: '700', fontSize: '0.875rem' }}>Page {page} of {totalPages}</div>
                 <Button variant="outline" onClick={() => handlePageChange('next')} disabled={page === totalPages}>Next</Button>
               </div>
            </div>
          )}
        </main>
      </div>

      {/* OVERLAYS & MODALS */}
      {(selectedJob || isPosting) && (
        <div role="dialog" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(6, 17, 33, 0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '6vh', paddingBottom: '6vh', zIndex: 99999, overflowY: 'auto' }} onClick={() => { setSelectedJob(null); setIsPosting(false); }}>
          <div style={{ background: CONFIG.THEME.BG_SURFACE, width: '92%', maxWidth: isPosting ? '800px' : '950px', borderRadius: CONFIG.THEME.RADIUS_XL, padding: '48px', position: 'relative', animation: 'scaleInModal 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards', boxShadow: CONFIG.THEME.SHADOW_LG, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }} onClick={e => e.stopPropagation()}>
            <button onClick={() => { setSelectedJob(null); setIsPosting(false); }} style={{ position: 'absolute', top: '32px', right: '32px', background: CONFIG.THEME.BG_APP, border: 'none', width: '48px', height: '48px', borderRadius: '50%', fontSize: '1.25rem', cursor: 'pointer', color: CONFIG.THEME.TEXT_SEC }}>✕</button>
            
            {isPosting ? (
              <PostJobWizard onClose={() => setIsPosting(false)} onSubmit={handleJobSubmit} />
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '32px', borderBottom: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingBottom: '32px', marginBottom: '32px' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: CONFIG.THEME.RADIUS_LG, background: Utils.generateAvatarGradient(selectedJob.company), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: '700', flexShrink: 0 }}>{selectedJob.company.charAt(0)}</div>
                  <div>
                    <h2 style={{ fontSize: '2.5rem', color: CONFIG.THEME.NAVY_MAIN, margin: '0 0 8px 0', fontWeight: '700' }}>{selectedJob.title}</h2>
                    <div style={{ fontSize: '1.25rem', color: CONFIG.THEME.TEXT_PRI, fontWeight: '500', marginBottom: '16px' }}>{selectedJob.company} • {selectedJob.location}</div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
                       <Badge label={selectedJob.workMode} color={CONFIG.THEME.NAVY_MAIN} bg={CONFIG.THEME.BG_SURFACE_ALT} />
                       <Badge label={selectedJob.experience} color={CONFIG.THEME.ACCENT_PURPLE} outline />
                       <Badge label={selectedJob.type} color={CONFIG.THEME.TEXT_SEC} outline />
                       {selectedJob.isHot && <Badge label="Actively Hiring" color={CONFIG.THEME.DANGER} bg={CONFIG.THEME.DANGER_BG} />}
                    </div>
                    <Button onClick={() => { window.open(selectedJob.applyUrl || '#', '_blank'); showToast('Application process started!'); }}>Apply Now</Button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '48px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', marginTop: 0 }}>Role Description</h4>
                    <p style={{ margin: '0 0 32px 0', lineHeight: 1.8, color: CONFIG.THEME.TEXT_PRI, fontSize: '1.1rem' }}>{selectedJob.description}</p>
                    
                    {selectedJob.responsibilities && (
                      <>
                        <h4 style={{ fontSize: '0.875rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Responsibilities</h4>
                        <ul style={{ margin: '0 0 32px 0', paddingLeft: '20px', lineHeight: 1.8, color: CONFIG.THEME.TEXT_PRI, fontSize: '1.1rem' }}>
                          {selectedJob.responsibilities.split('\n').map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </>
                    )}

                    <h4 style={{ fontSize: '0.875rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Required Skills</h4>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {(selectedJob.skills || []).map(s => <span key={s} style={{ padding: '8px 16px', background: CONFIG.THEME.BG_APP, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, borderRadius: CONFIG.THEME.RADIUS_FULL, fontSize: '0.875rem', color: CONFIG.THEME.NAVY_MAIN, fontWeight: '600' }}>{s}</span>)}
                    </div>
                  </div>

                  <div style={{ background: CONFIG.THEME.BG_SURFACE_ALT, borderRadius: CONFIG.THEME.RADIUS_LG, padding: '32px', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, height: 'fit-content' }}>
                     <div style={{ marginBottom: '24px' }}>
                        <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700' }}>Compensation</div>
                        <div style={{ fontWeight: '800', color: CONFIG.THEME.SUCCESS, fontSize: '1.5rem' }}>{selectedJob.salary}</div>
                     </div>
                     {selectedJob.perks && (
                       <div style={{ borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingTop: '24px', marginBottom: '24px' }}>
                          <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700' }}>Perks & Benefits</div>
                          <div style={{ color: CONFIG.THEME.TEXT_PRI, fontSize: '0.9rem', lineHeight: 1.6 }}>{selectedJob.perks}</div>
                       </div>
                     )}
                     <div style={{ borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingTop: '24px' }}>
                        <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700' }}>Logistics</div>
                        <div style={{ fontSize: '0.9rem', color: CONFIG.THEME.TEXT_SEC, marginBottom: '8px' }}>Posted: {Utils.timeAgo(selectedJob.postedAt)}</div>
                        <div style={{ fontSize: '0.9rem', color: CONFIG.THEME.TEXT_SEC }}>Deadline: {selectedJob.deadline || 'Rolling basis'}</div>
                     </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', background: CONFIG.THEME.NAVY_MAIN, color: 'white', padding: '16px 24px', borderRadius: CONFIG.THEME.RADIUS_MD, boxShadow: CONFIG.THEME.SHADOW_LG, display: 'flex', alignItems: 'center', gap: '16px', zIndex: 999999, animation: 'slideLeft 0.3s ease' }}>
          <div style={{ background: CONFIG.THEME.GOLD_MAIN, color: CONFIG.THEME.NAVY_MAIN, width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✓</div>
          <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{toast}</span>
        </div>
      )}
    </div>
  );
};

export default CareerGateway;