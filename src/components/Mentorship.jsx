// src/MentorshipGateway.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

/**
 * =================================================================================================
 * SJU MENTORSHIP GATEWAY - TITANIUM ENTERPRISE SUITE (v2.0 - "ORION")
 * =================================================================================================
 * (Same as your provided file, rewritten with:
 *  - AdvancedPagination component (directory-like pagination)
 *  - Full List view implementation (table + "View" button that stops propagation)
 *  - Additional filters: Price (Free / Paid), Languages, Company Tier
 *  - small generation tweak: mentors now include companyTier so we can facet by it
 * Everything else preserved as requested.
 * =================================================================================================
 */

// --- 1. CONFIGURATION & THEME TOKENS ---

const CONFIG = {
  APP_NAME: "SJU MENTORSHIP CONNECT",
  VERSION: "2.5.0-Orion",
  RECORDS: 10500,
  PAGE_SIZE: 15,
  THEME: {
    NAVY_DARK: '#001529',
    NAVY_MAIN: '#002244',
    NAVY_LITE: '#003366',
    GOLD_MAIN: '#FFCC00',
    GOLD_DIM:  '#E6B800',
    ACCENT_CYAN: '#06b6d4',
    SUCCESS:     '#10B981',
    WARNING:     '#F59E0B',
    DANGER:      '#EF4444',
    PURPLE:      '#8B5CF6',
    BG_APP:      '#F8FAFC',
    BG_SURFACE:  '#FFFFFF',
    BORDER:      '#E2E8F0',
    TEXT_PRI:    '#0F172A',
    TEXT_SEC:    '#64748B',
    TEXT_TER:    '#94A3B8',
  }
};

// --- 2. ADVANCED DATA SYNTHESIS ENGINE ---

const MockDB = {
  firstNames: ["Aarav", "Vihaan", "Aditya", "Sai", "Arjun", "Rohan", "Ishaan", "Vivaan", "Ananya", "Diya", "Sana", "Kiara", "Priya", "Nisha", "Riya", "Kavya", "Meera", "Sanya", "Kabir", "Zara", "David", "John", "Sarah", "Michael", "Emma", "Liam", "Noah"],
  lastNames: ["Sharma", "Verma", "Patel", "Reddy", "Nair", "Iyer", "Gowda", "Menon", "Singh", "Kapoor", "Khan", "Das", "Bose", "Joshi", "Mehta", "Chopra", "Malhotra", "Rao", "Saxena", "Fernandes", "Smith", "Johnson"],

  domains: [
    { name: "Product Management", icon: "bi-kanban", color: "#ec4899" },
    { name: "Data Science", icon: "bi-database", color: "#3b82f6" },
    { name: "Investment Banking", icon: "bi-graph-up-arrow", color: "#10b981" },
    { name: "Software Engineering", icon: "bi-laptop", color: "#6366f1" },
    { name: "Corporate Law", icon: "bi-briefcase", color: "#8b5cf6" },
    { name: "Digital Marketing", icon: "bi-megaphone", color: "#f59e0b" },
    { name: "Civil Services", icon: "bi-bank", color: "#ef4444" },
    { name: "Entrepreneurship", icon: "bi-rocket", color: "#14b8a6" },
    { name: "Biotech Research", icon: "bi-virus", color: "#84cc16" }
  ],

  companies: [
    { name: "Google", tier: "MNC" }, { name: "Microsoft", tier: "MNC" },
    { name: "Amazon", tier: "MNC" }, { name: "Goldman Sachs", tier: "Finance" },
    { name: "McKinsey", tier: "Consulting" }, { name: "Tesla", tier: "Auto" },
    { name: "SJU Research", tier: "Academic" }, { name: "Deloitte", tier: "Consulting" },
    { name: "Zerodha", tier: "Fintech" }, { name: "Swiggy", tier: "Startup" }
  ],

  languages: ["English", "Hindi", "Kannada", "Tamil", "Telugu", "Spanish", "French", "German"],

  sessionTypes: ["1:1 Call", "Mock Interview", "Resume Review", "Long-term Mentorship"],

  // Generator (note: now includes companyTier to support faceting)
  generate: () => {
    let data = [];
    for (let i = 1; i <= CONFIG.RECORDS; i++) {
      const domainObj = MockDB.domains[i % MockDB.domains.length];
      const comp = MockDB.companies[i % MockDB.companies.length];
      const fname = MockDB.firstNames[i % MockDB.firstNames.length];
      const lname = MockDB.lastNames[i % MockDB.lastNames.length];
      const experience = Math.floor(Math.random() * 25) + 2;

      let tier = "Peer Mentor";
      if (experience > 8) tier = "Industry Leader";
      else if (experience > 4) tier = "Senior Mentor";

      data.push({
        id: `MENTOR-${20000 + i}`,
        name: `${fname} ${lname}`,
        email: `${fname.toLowerCase()}.${lname.toLowerCase()}@sju.edu`,
        domain: domainObj.name,
        domainIcon: domainObj.icon,
        domainColor: domainObj.color,
        company: comp.name,
        companyTier: comp.tier,                      // <-- added for faceting
        role: i % 3 === 0 ? "Director" : (i % 2 === 0 ? "Senior Manager" : "Associate"),
        tier: tier,
        experience: experience,
        languages: [MockDB.languages[i % MockDB.languages.length], "English"],
        sessionTypes: [MockDB.sessionTypes[0], MockDB.sessionTypes[i % 4]],
        availability: i % 5 === 0 ? "Weekends Only" : (i % 3 === 0 ? "Evenings" : "Flexible"),
        rating: (4.0 + Math.random()).toFixed(1),
        sessionsConducted: Math.floor(Math.random() * 200),
        responseRate: Math.floor(Math.random() * (100 - 80) + 80),
        initials: `${fname[0]}${lname[0]}`,
        colorId: i % 6,
        isTopRated: Math.random() > 0.8,
        bio: `Driven ${domainObj.name} professional with ${experience} years of experience at top-tier firms like ${comp.name}. Passionate about guiding the next generation of leaders.`,
        price: experience > 10 ? 2000 : (experience > 5 ? 1000 : 0) // 0 is free
      });
    }
    return data;
  }
};

// --- 3. UTILITIES & FORMATTERS ---

const Formatters = {
  number: (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K+';
    return num.toString();
  },

  currency: (amount) => {
    if (amount === 0) return "Free";
    return `₹${amount}/hr`;
  }
};

// --- 4. STYLE SYSTEM (CSS-IN-JS) ---
// (kept mostly the same; omitted here for brevity in comments — full styles used below)

const styles = {
  wrapper: { minHeight: '100vh', backgroundColor: CONFIG.THEME.BG_APP, fontFamily: "'Inter', 'Segoe UI', sans-serif", color: CONFIG.THEME.TEXT_PRI, overflowX: 'hidden', paddingBottom: '50px' },
  container: { maxWidth: '1600px', margin: '0 auto', padding: '0 30px', display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px', position: 'relative', zIndex: 10 },
  hero: { background: `linear-gradient(135deg, ${CONFIG.THEME.NAVY_MAIN} 0%, #000000 100%)`, padding: '80px 0 120px 0', color: 'white', position: 'relative', marginBottom: '-60px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)', overflow: 'hidden' },
  heroContent: { maxWidth: '1600px', margin: '0 auto', padding: '0 30px', position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
  heroTitle: { fontSize: '3.5rem', fontWeight: '900', lineHeight: 1, letterSpacing: '-1px', marginBottom: '15px', background: `linear-gradient(to right, #ffffff, ${CONFIG.THEME.GOLD_MAIN})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textTransform: 'uppercase' },
  heroStats: { display: 'flex', gap: '50px' },
  statBlock: { borderLeft: `4px solid ${CONFIG.THEME.GOLD_MAIN}`, paddingLeft: '20px' },
  statVal: { fontSize: '2.5rem', fontWeight: '800', lineHeight: 1, color: 'white' },
  statLabel: { fontSize: '0.85rem', color: CONFIG.THEME.GOLD_MAIN, textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px', marginTop:'5px' },

  sidebar: { backgroundColor: 'white', borderRadius: '20px', padding: '30px', border: `1px solid ${CONFIG.THEME.BORDER}`, boxShadow: '0 10px 30px rgba(0,0,0,0.03)', position: 'sticky', top: '30px', height: 'calc(100vh - 60px)', overflowY: 'auto' },
  filterSection: { marginBottom: '30px' },
  filterHeader: { fontSize: '0.8rem', fontWeight: '800', color: CONFIG.THEME.NAVY_MAIN, textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '0.5px', display: 'flex', justifyContent: 'space-between' },
  checkbox: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', cursor: 'pointer', padding: '8px 10px', borderRadius: '8px', transition: 'all 0.2s' },

  controlBar: { backgroundColor: 'white', borderRadius: '16px', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: `1px solid ${CONFIG.THEME.BORDER}`, marginBottom: '30px' },
  searchWrapper: { position: 'relative', width: '450px' },
  searchInput: { width: '100%', padding: '12px 15px 12px 45px', borderRadius: '10px', border: `2px solid ${CONFIG.THEME.BORDER}`, fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s', color: CONFIG.THEME.NAVY_MAIN },

  card: { backgroundColor: 'white', borderRadius: '20px', border: `1px solid ${CONFIG.THEME.BORDER}`, padding: '25px', position: 'relative', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)', overflow: 'hidden' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  avatar: { width: '72px', height: '72px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '800', color: 'white', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.2)' },
  verifiedBadge: { position: 'absolute', top: '20px', right: '20px', color: CONFIG.THEME.ACCENT_CYAN, fontSize: '1.2rem' },

  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 21, 41, 0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' },
  modalContent: { backgroundColor: 'white', width: '100%', maxWidth: '900px', height: '90vh', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden', animation: 'slideUp 0.3s ease-out', display: 'flex', flexDirection: 'column' },

  chartContainer: { height: '250px', display: 'flex', alignItems: 'flex-end', gap: '10px', paddingBottom: '20px' },

  toast: { position: 'fixed', bottom: '30px', right: '30px', backgroundColor: CONFIG.THEME.NAVY_MAIN, color: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '15px', zIndex: 9999, animation: 'slideLeft 0.3s' }
};

// --- Global styles injected as a component ---
const GlobalStyles = () => (
  <style>{`
    @import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css");
    * { box-sizing: border-box; } body { margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; } ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideLeft { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .hover-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1); border-color: ${CONFIG.THEME.GOLD_MAIN}; }
    .btn-gold { background: linear-gradient(135deg, ${CONFIG.THEME.GOLD_MAIN}, ${CONFIG.THEME.GOLD_DIM}); color: ${CONFIG.THEME.NAVY_MAIN}; border: none; font-weight: 700; transition: transform 0.1s; } .btn-gold:active { transform: scale(0.98); }
    .btn-navy { background: ${CONFIG.THEME.NAVY_MAIN}; color: white; border: none; font-weight: 600; } .btn-navy:hover { background: ${CONFIG.THEME.NAVY_LITE}; }
  `}</style>
);

// --- ATOMS & MOLECULES ---

const Badge = ({ icon, text, color, bg }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: '700', color: color, backgroundColor: bg || `${color}15`, padding: '6px 10px', borderRadius: '8px', border: `1px solid ${bg ? 'transparent' : color + '30'}` }}>
    <i className={`bi ${icon}`} /> {text}
  </span>
);

const Button = ({ children, onClick, variant = 'navy', style, icon, disabled }) => (
  <button onClick={onClick} disabled={disabled} className={`btn-${variant}`} style={{ padding: '12px 20px', borderRadius: '10px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', ...style }}>
    {icon && <i className={`bi ${icon}`}></i>}
    {children}
  </button>
);

const ChartBar = ({ height, label, active }) => (
  <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
    <div style={{ width: '100%', height: `${height}%`, backgroundColor: active ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.NAVY_LITE, borderRadius: '6px 6px 0 0', transition: 'height 1s ease', opacity: active ? 1 : 0.6, position: 'relative' }}>
      {active && <div style={{ position: 'absolute', top: '-25px', width: '100%', textAlign: 'center', fontWeight: '700', fontSize: '0.8rem', color: CONFIG.THEME.NAVY_MAIN }}>{height}%</div>}
    </div>
    <span style={{ fontSize: '0.7rem', color: CONFIG.THEME.TEXT_SEC, marginTop: '8px', fontWeight: '600' }}>{label}</span>
  </div>
);

// --- FilterGroup (re-used) ---
const FilterGroup = ({ title, options, counts = {}, active, onSelect }) => {
  const [expanded, setExpanded] = useState(true);

  const opts = Array.isArray(options) ? options : Object.keys(options || {});
  return (
    <div style={styles.filterSection}>
      <div style={{ ...styles.filterHeader, cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <span>{title}</span>
        <i className={`bi bi-chevron-${expanded ? 'up' : 'down'}`}></i>
      </div>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {opts.slice(0, 12).map(opt => {
            const isActive = active === opt;
            const count = counts[opt] || 0;
            return (
              <div key={opt} style={{ ...styles.checkbox, backgroundColor: isActive ? CONFIG.THEME.NAVY_MAIN : 'transparent', color: isActive ? 'white' : CONFIG.THEME.TEXT_PRI }} onClick={() => onSelect(opt)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isActive ? <i className="bi bi-check-circle-fill" style={{ color: CONFIG.THEME.GOLD_MAIN }}></i> : <i className="bi bi-circle" style={{ color: '#CBD5E1' }}></i>}
                  <span style={{ fontSize: '0.9rem', fontWeight: isActive ? '600' : '400' }}>{opt}</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', opacity: 0.7 }}>{Formatters.number(count)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// --- BookingWizard (kept same) ---
const BookingWizard = ({ mentor, onClose, onConfirm }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const dates = ['Mon, 12th', 'Tue, 13th', 'Wed, 14th'];
  const times = ['10:00 AM', '02:00 PM', '04:30 PM'];

  return (
    <div style={{ padding: '30px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ color: CONFIG.THEME.NAVY_MAIN, marginBottom: '5px' }}>Book a Session</h2>
      <p style={{ color: CONFIG.THEME.TEXT_SEC, marginBottom: '30px' }}>with {mentor.name}</p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: s <= step ? CONFIG.THEME.NAVY_MAIN : '#E2E8F0' }} />
        ))}
      </div>

      <div style={{ flex: 1 }}>
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {mentor.sessionTypes.map(type => (
              <div key={type} onClick={() => setSelectedType(type)} style={{ border: `2px solid ${selectedType === type ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.BORDER}`, borderRadius: '12px', padding: '20px', cursor: 'pointer', background: selectedType === type ? '#FFFBEB' : 'white', transition: 'all 0.2s' }}>
                <div style={{ fontWeight: '700', color: CONFIG.THEME.NAVY_MAIN, marginBottom: '5px' }}>{type}</div>
                <div style={{ fontSize: '0.85rem', color: CONFIG.THEME.TEXT_SEC }}>{`60 Minutes • ${Formatters.currency(mentor.price)}`}</div>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div>
            <h4 style={{ margin: '0 0 15px 0' }}>Select a Slot</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {dates.map(d => <button key={d} style={{ padding: '10px 15px', borderRadius: '8px', border: `1px solid ${CONFIG.THEME.BORDER}`, background: 'white', fontWeight: '600' }}>{d}</button>)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              {times.map(t => (
                <button key={t} onClick={() => setSelectedDate(t)} style={{ padding: '15px', borderRadius: '10px', border: `1px solid ${selectedDate === t ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.BORDER}`, background: selectedDate === t ? CONFIG.THEME.GOLD_MAIN : 'white', color: selectedDate === t ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.TEXT_PRI, fontWeight: '700', cursor: 'pointer' }}>{t}</button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: '80px', height: '80px', background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <i className="bi bi-calendar-check" style={{ fontSize: '2rem', color: '#166534' }} />
            </div>
            <h3 style={{ margin: '0 0 10px 0', color: CONFIG.THEME.NAVY_MAIN }}>Ready to Book?</h3>
            <p style={{ color: CONFIG.THEME.TEXT_SEC }}>{selectedType} on <strong>Tue, 13th at {selectedDate}</strong></p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${CONFIG.THEME.BORDER}`, paddingTop: '20px' }}>
        <Button variant="secondary" onClick={() => step === 1 ? onClose() : setStep(s => s - 1)}>Back</Button>
        <Button variant={step === 3 ? 'gold' : 'navy'} disabled={step === 1 && !selectedType || step === 2 && !selectedDate} onClick={() => step === 3 ? onConfirm() : setStep(s => s + 1)}>{step === 3 ? 'Confirm Booking' : 'Next Step'}</Button>
      </div>
    </div>
  );
};

// --- AdvancedPagination (directory-style) ---
const AdvancedPagination = ({ currentPage, totalPages, onPageChange, windowSize = 2 }) => {
  const delta = Math.max(1, windowSize);

  const getRange = () => {
    const range = [];
    const rangeWithDots = [];
    let l;
    const total = Math.max(1, totalPages);

    range.push(1);
    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i > 1 && i < total) range.push(i);
    }
    if (total > 1) range.push(total);

    for (let i of range) {
      if (l) {
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l !== 1) rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  const pages = getRange();

  const safeChange = (p) => {
    if (typeof p === 'number') {
      const next = Math.max(1, Math.min(totalPages, p));
      if (next !== currentPage) onPageChange(next);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: `1px solid ${CONFIG.THEME.BORDER}`, marginTop: '20px' }} aria-label="Pagination">
      <div style={{ fontSize: '0.9rem', color: CONFIG.THEME.TEXT_SEC }}>Page <strong style={{ color: CONFIG.THEME.NAVY_MAIN }}>{currentPage}</strong> of <strong>{totalPages || 1}</strong></div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button aria-label="First page" onClick={() => safeChange(1)} style={pageBtnStyles(false, currentPage === 1)} disabled={currentPage === 1}>« First</button>
        <button aria-label="Previous page" onClick={() => safeChange(currentPage - 1)} style={pageBtnStyles(false, currentPage === 1)} disabled={currentPage === 1}>‹ Prev</button>

        {pages.map((p, idx) => (
          <button key={idx} aria-label={p === '...' ? 'gap' : `Page ${p}`} onClick={() => typeof p === 'number' && safeChange(p)} style={pageBtnStyles(p === currentPage, p === '...')} disabled={p === '...'}>{p}</button>
        ))}

        <button aria-label="Next page" onClick={() => safeChange(currentPage + 1)} style={pageBtnStyles(false, currentPage === totalPages)} disabled={currentPage === totalPages}>Next ›</button>
        <button aria-label="Last page" onClick={() => safeChange(totalPages)} style={pageBtnStyles(false, currentPage === totalPages)} disabled={currentPage === totalPages}>Last »</button>
      </div>
    </div>
  );
};

// small helper for pagination button styles
const pageBtnStyles = (active, disabled) => ({
  minWidth: '44px', height: '36px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px',
  border: active ? 'none' : `1px solid ${CONFIG.THEME.BORDER}`,
  backgroundColor: active ? CONFIG.THEME.NAVY_MAIN : 'white',
  color: active ? 'white' : (disabled ? CONFIG.THEME.TEXT_TER : CONFIG.THEME.TEXT_PRI),
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.15s', opacity: disabled ? 0.5 : 1, padding: '0 12px'
});

// --- MAIN CONTROLLER ---
// MentorshipGateway (rewritten with list view and advanced pagination + extra filters)
const MentorshipGateway = () => {
  const [data, setData] = useState([]);
  const [viewMode, setViewMode] = useState('GRID'); // GRID, LIST, ANALYTICS
  const [filters, setFilters] = useState({ domain: null, tier: null, availability: null, price: null, language: null, companyTier: null });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setData(MockDB.generate());
  }, []);

  // MEMOIZED FILTERING + FACETS (now includes price, language, companyTier)
  const { filteredData, facets } = useMemo(() => {
    let result = data.slice();

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.company || '').toLowerCase().includes(q) ||
        (m.domain || '').toLowerCase().includes(q)
      );
    }

    // apply filters
    Object.keys(filters).forEach(key => {
      if (!filters[key]) return;
      if (key === 'language') {
        result = result.filter(m => Array.isArray(m.languages) && m.languages.includes(filters.language));
      } else if (key === 'price') {
        if (filters.price === 'Free') result = result.filter(m => m.price === 0);
        else if (filters.price === 'Paid') result = result.filter(m => m.price > 0);
      } else {
        result = result.filter(m => m[key] === filters[key]);
      }
    });

    // build facets from entire data (so filters show counts relative to full set or you can use result to show remaining)
    const newCounts = { domain: {}, tier: {}, availability: {}, language: {}, price: {}, companyTier: {} };
    data.forEach(m => {
      newCounts.domain[m.domain] = (newCounts.domain[m.domain] || 0) + 1;
      newCounts.tier[m.tier] = (newCounts.tier[m.tier] || 0) + 1;
      newCounts.availability[m.availability] = (newCounts.availability[m.availability] || 0) + 1;
      (m.languages || []).forEach(lang => newCounts.language[lang] = (newCounts.language[lang] || 0) + 1);
      const priceKey = m.price === 0 ? 'Free' : 'Paid';
      newCounts.price[priceKey] = (newCounts.price[priceKey] || 0) + 1;
      newCounts.companyTier[m.companyTier || 'Other'] = (newCounts.companyTier[m.companyTier || 'Other'] || 0) + 1;
    });

    return { filteredData: result, facets: newCounts };
  }, [data, search, filters]);

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(filteredData.length / CONFIG.PAGE_SIZE));
  // Ensure page within bounds
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const currentItems = useMemo(() => {
    const start = (page - 1) * CONFIG.PAGE_SIZE;
    return filteredData.slice(start, start + CONFIG.PAGE_SIZE);
  }, [filteredData, page]);

  // ACTIONS
  const handleFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === val ? null : val }));
    setPage(1);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleBookingConfirm = () => {
    setIsBooking(false);
    setSelectedMentor(null);
    showToast(`Session successfully booked!`);
  };

  // RENDER: GRID (same as provided)
  const renderGrid = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px', paddingBottom: '40px' }}>
      {currentItems.map((m, i) => (
        <div key={m.id} style={{ ...styles.card, animationDelay: `${i * 0.05}s` }} className="hover-card" onClick={() => setSelectedMentor(m)}>
          <div style={styles.cardTop}>
            <div style={{ ...styles.avatar, background: `linear-gradient(135deg, ${CONFIG.THEME.NAVY_MAIN}, ${m.colorId % 2 ? CONFIG.THEME.ACCENT_CYAN : CONFIG.THEME.PURPLE})` }}>{m.initials}</div>
            {m.isTopRated && <div style={{ background: '#FFFBEB', color: CONFIG.THEME.GOLD_DIM, padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', border: `1px solid ${CONFIG.THEME.GOLD_MAIN}` }}><i className="bi bi-star-fill" /> TOP RATED</div>}
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 5px 0', color: CONFIG.THEME.NAVY_MAIN }}>{m.name}</h3>
          <div style={{ fontSize: '0.9rem', color: CONFIG.THEME.TEXT_SEC, fontWeight: '500', marginBottom: '15px' }}>{m.role} @ <span style={{ color: CONFIG.THEME.NAVY_MAIN, fontWeight: '700' }}>{m.company}</span></div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <Badge icon="bi-briefcase" text={m.tier} color={CONFIG.THEME.NAVY_MAIN} />
            <Badge icon="bi-clock" text={m.availability} color={CONFIG.THEME.TEXT_SEC} />
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: `1px solid ${CONFIG.THEME.BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94A3B8' }}>HOURLY RATE</div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: CONFIG.THEME.SUCCESS }}>{Formatters.currency(m.price)}</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="navy" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={(e) => { e.stopPropagation(); setSelectedMentor(m); setIsBooking(true); }}>Book</Button>
              <Button variant="secondary" style={{ padding: '8px 12px', fontSize: '0.85rem' }} onClick={(e) => { e.stopPropagation(); setSelectedMentor(m); setIsBooking(false); }}>View</Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // RENDER: LIST view (new / directory-like)
  const renderList = () => (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: `1px solid ${CONFIG.THEME.BORDER}`, overflow: 'hidden', marginBottom: '24px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }} role="table" aria-label="Mentor list">
        <thead>
          <tr style={{ backgroundColor: CONFIG.THEME.BG_APP, borderBottom: `1px solid ${CONFIG.THEME.BORDER}`, textAlign: 'left' }}>
            {['Name', 'Domain', 'Role & Company', 'Tier', 'Availability', 'Rate', 'Action'].map(h => <th key={h} style={{ padding: '12px 16px', fontSize: '0.8rem', color: CONFIG.THEME.TEXT_SEC, textTransform: 'uppercase' }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {currentItems.map(m => (
            <tr key={m.id} onClick={() => setSelectedMentor(m)} style={{ borderBottom: `1px solid ${CONFIG.THEME.BORDER}`, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'} role="row" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setSelectedMentor(m); }}>
              <td style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: CONFIG.THEME.NAVY_MAIN, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>{m.initials}</div>
                  <div>
                    <div style={{ fontWeight: '800', color: CONFIG.THEME.NAVY_MAIN }}>{m.name}</div>
                    <div style={{ fontSize: '0.85rem', color: CONFIG.THEME.TEXT_SEC }}>{m.email}</div>
                  </div>
                </div>
              </td>

              <td style={{ padding: '12px 16px' }}>
                <div style={{ fontWeight: '700' }}>{m.domain}</div>
                <div style={{ fontSize: '0.85rem', color: CONFIG.THEME.TEXT_SEC }}>{m.rating} • {m.sessionsConducted} sessions</div>
              </td>

              <td style={{ padding: '12px 16px' }}>
                <div style={{ fontWeight: '700' }}>{m.role}</div>
                <div style={{ fontSize: '0.85rem', color: CONFIG.THEME.TEXT_SEC }}>{m.company}</div>
              </td>

              <td style={{ padding: '12px 16px' }}><Badge icon="bi-award" text={m.tier} color={CONFIG.THEME.NAVY_MAIN} /></td>

              <td style={{ padding: '12px 16px', color: CONFIG.THEME.TEXT_SEC }}>{m.availability}</td>

              <td style={{ padding: '12px 16px', fontWeight: '800', color: CONFIG.THEME.SUCCESS }}>{Formatters.currency(m.price)}</td>

              <td style={{ padding: '12px 16px' }}>
                {/* stopPropagation so clicking the button does not trigger the row's onClick */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedMentor(m); setIsBooking(false); }} style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${CONFIG.THEME.BORDER}`, background: 'white', cursor: 'pointer', fontWeight: 700 }}>View</button>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedMentor(m); setIsBooking(true); }} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: CONFIG.THEME.NAVY_MAIN, color: 'white', cursor: 'pointer', fontWeight: 700 }}>Book</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAnalytics = () => (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        {
        map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '25px', border: `1px solid ${CONFIG.THEME.BORDER}`, boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: CONFIG.THEME.NAVY_MAIN }}>{s.val}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94A3B8', marginTop: '5px', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
              <i className={`bi ${s.icon}`} style={{ fontSize: '1.5rem', color: s.color, opacity: 0.8 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '20px', border: `1px solid ${CONFIG.THEME.BORDER}` }}>
          <h3 style={{ color: CONFIG.THEME.NAVY_MAIN, margin: '0 0 20px 0' }}>Domain Demand</h3>
          <div style={styles.chartContainer}>
            {Object.keys(facets.domain).slice(0, 8).map((d, i) => <ChartBar key={d} label={d.split(' ')[0]} height={Math.floor(Math.random() * (100 - 30) + 30)} active={i === 2} />)}
          </div>
        </div>

        <div style={{ background: CONFIG.THEME.NAVY_MAIN, padding: '30px', borderRadius: '20px', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>Top Company Mentors</h3>
          <p style={{ color: CONFIG.THEME.TEXT_TER, fontSize: '0.9rem', marginBottom: '30px' }}>Where our mentors work</p>
          {['Google', 'Microsoft', 'Goldman Sachs', 'Amazon'].map((c, i) => (
            <div key={c} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                <span style={{ fontWeight: '600' }}>{c}</span>
                <span style={{ color: CONFIG.THEME.GOLD_MAIN }}>{Formatters.number(1200 - (i * 200))}</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                <div style={{ width: `${90 - (i * 15)}%`, height: '100%', background: CONFIG.THEME.GOLD_MAIN, borderRadius: '3px' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.wrapper}>
      <GlobalStyles />

      {/* HERO */}
      <header style={styles.hero}>
        <div style={styles.heroContent}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}><i className="bi bi-circle-fill" style={{ fontSize: '8px', color: CONFIG.THEME.SUCCESS, marginRight: '8px' }} />System Operational</span>
            </div>
            <h1 style={styles.heroTitle}>Mentorship Connect</h1>
            <p style={{ color: CONFIG.THEME.TEXT_TER, fontSize: '1.1rem', maxWidth: '600px' }}>Book 1:1 sessions with 10,500+ industry experts from top global firms. Accelerate your career with personalized guidance.</p>
          </div>

          <div style={styles.heroStats}>
            <div style={styles.statBlock}><div style={styles.statVal}>10.5K+</div><div style={styles.statLabel}>Mentors</div></div>
            <div style={styles.statBlock}><div style={styles.statVal}>4.8/5</div><div style={styles.statLabel}>Avg Rating</div></div>
            <div style={styles.statBlock}><div style={styles.statVal}>24h</div><div style={styles.statLabel}>Response</div></div>
          </div>
        </div>
      </header>

      <div style={styles.container}>
        {/* SIDEBAR */}
        <aside style={styles.sidebar}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: `1px solid ${CONFIG.THEME.BORDER}` }}>
            <span style={{ fontWeight: '800', color: CONFIG.THEME.NAVY_MAIN }}>FILTERS</span>
            <button onClick={() => { setFilters({ domain: null, tier: null, availability: null, price: null, language: null, companyTier: null }); setSearch(''); }} style={{ background: 'none', border: 'none', color: CONFIG.THEME.DANGER, fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>RESET</button>
          </div>

          <FilterGroup title="Domain" options={Object.keys(facets.domain)} counts={facets.domain} active={filters.domain} onSelect={v => handleFilter('domain', v)} />
          <FilterGroup title="Experience Tier" options={Object.keys(facets.tier)} counts={facets.tier} active={filters.tier} onSelect={v => handleFilter('tier', v)} />
          <FilterGroup title="Availability" options={Object.keys(facets.availability)} counts={facets.availability} active={filters.availability} onSelect={v => handleFilter('availability', v)} />
          <FilterGroup title="Price" options={Object.keys(facets.price)} counts={facets.price} active={filters.price} onSelect={v => handleFilter('price', v)} />
          <FilterGroup title="Languages" options={Object.keys(facets.language)} counts={facets.language} active={filters.language} onSelect={v => handleFilter('language', v)} />
          <FilterGroup title="Company Tier" options={Object.keys(facets.companyTier)} counts={facets.companyTier} active={filters.companyTier} onSelect={v => handleFilter('companyTier', v)} />
        </aside>

        {/* MAIN CONTENT */}
        <main>
          <div style={styles.controlBar}>
            <div style={styles.searchWrapper}>
              <i className="bi bi-search" style={{ position: 'absolute', left: '15px', top: '12px', color: CONFIG.THEME.TEXT_SEC }} />
              <input style={styles.searchInput} placeholder="Search by name, company, or domain..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>

            <div style={{ display: 'flex', gap: '5px', background: CONFIG.THEME.BG_APP, padding: '5px', borderRadius: '10px' }}>
              {['GRID', 'LIST', 'ANALYTICS'].map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem', background: viewMode === mode ? 'white' : 'transparent', color: viewMode === mode ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.TEXT_SEC, boxShadow: viewMode === mode ? '0 2px 5px rgba(0,0,0,0.05)' : 'none' }}>{mode}</button>
              ))}
            </div>
          </div>

          {viewMode === 'GRID' && renderGrid()}
          {viewMode === 'LIST' && renderList()}
          {viewMode === 'ANALYTICS' && renderAnalytics()}

          {/* Advanced pagination (directory-like) */}
          {viewMode !== 'ANALYTICS' && (
            <AdvancedPagination currentPage={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 400, behavior: 'smooth' }); }} windowSize={2} />
          )}
        </main>
      </div>

      {/* MODAL: Booking (when selectedMentor & isBooking) */}
      {(selectedMentor && isBooking) && (
        <div style={styles.modalOverlay} onClick={() => { setIsBooking(false); setSelectedMentor(null); }}>
          <div style={{ ...styles.modalContent, height: 'auto', maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <BookingWizard mentor={selectedMentor} onClose={() => { setIsBooking(false); setSelectedMentor(null); }} onConfirm={handleBookingConfirm} />
          </div>
        </div>
      )}

      {/* MODAL: Details (when selectedMentor & not booking) */}
      {(selectedMentor && !isBooking) && (
        <div style={styles.modalOverlay} onClick={() => setSelectedMentor(null)}>
          <div style={{ ...styles.modalContent, maxWidth: '820px', padding: '22px', height: 'auto', maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '96px', height: '96px', background: CONFIG.THEME.NAVY_MAIN, color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', fontWeight: '800' }}>{selectedMentor.initials}</div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', color: CONFIG.THEME.NAVY_MAIN }}>{selectedMentor.name}</h2>
                  <p style={{ margin: '6px 0 0 0', color: CONFIG.THEME.TEXT_SEC }}>{selectedMentor.role} at <strong style={{ color: CONFIG.THEME.NAVY_MAIN }}>{selectedMentor.company}</strong></p>
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Badge icon="bi-briefcase" text={selectedMentor.tier} color={CONFIG.THEME.NAVY_MAIN} />
                    <Badge icon="bi-clock" text={selectedMentor.availability} color={CONFIG.THEME.TEXT_SEC} />
                    <Badge icon="bi-people" text={`${selectedMentor.sessionsConducted} sessions`} color={CONFIG.THEME.TEXT_SEC} />
                  </div>
                </div>
              </div>

              <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                <Button variant="navy" onClick={() => { setIsBooking(true); }}>Book</Button>
                <Button variant="secondary" onClick={() => setSelectedMentor(null)}>Close</Button>
              </div>
            </div>

            <div style={{ marginTop: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              <div style={{ background: CONFIG.THEME.BG_APP, padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER }}>Email</div>
                <div style={{ fontWeight: '700', color: CONFIG.THEME.TEXT_PRI }}>{selectedMentor.email}</div>
              </div>

              <div style={{ background: CONFIG.THEME.BG_APP, padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER }}>Domain</div>
                <div style={{ fontWeight: '700', color: CONFIG.THEME.TEXT_PRI }}>{selectedMentor.domain}</div>
                <div style={{ fontSize: '0.8rem', color: CONFIG.THEME.TEXT_SEC }}>{selectedMentor.experience} yrs • {selectedMentor.rating} / 5</div>
              </div>

              <div style={{ background: CONFIG.THEME.BG_APP, padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER }}>Batch</div>
                <div style={{ fontWeight: '700', color: CONFIG.THEME.TEXT_PRI }}>{selectedMentor.tier}</div>
              </div>

              <div style={{ background: CONFIG.THEME.BG_APP, padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER }}>Rate</div>
                <div style={{ fontWeight: '700', color: CONFIG.THEME.SUCCESS }}>{Formatters.currency(selectedMentor.price)}</div>
              </div>
            </div>

            <div style={{ marginTop: '14px', padding: '14px', background: CONFIG.THEME.BG_APP, borderRadius: '12px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase' }}>About</h4>
              <p style={{ margin: 0, lineHeight: '1.6', color: CONFIG.THEME.TEXT_PRI }}>{selectedMentor.bio}</p>

              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(selectedMentor.languages || []).map((l, idx) => <Badge key={idx} icon="bi-chat-dots" text={l} color={CONFIG.THEME.NAVY_MAIN} />)}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={styles.toast}>
          <i className="bi bi-check-circle-fill" style={{ color: CONFIG.THEME.GOLD_MAIN, fontSize: '1.2rem' }} />
          <span style={{ fontWeight: '600' }}>{toast}</span>
        </div>
      )}
    </div>
  );
};

export default MentorshipGateway;
