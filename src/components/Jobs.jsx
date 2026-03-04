// src/CareerGateway.jsx
import React, { useState, useEffect, useMemo } from 'react';

/**
 * =================================================================================================
 * SJU CAREER GATEWAY - TITANIUM ENTERPRISE SUITE (v2.0 - "POLARIS")
 * =================================================================================================
 * Rewritten: pagination & list view updated to use directory-style AdvancedPagination (like mentorship)
 * Added extra filters (experience, isHot, remote, company tier)
 * Enhanced PostJobWizard: more fields, validation, preview step
 * All other visuals / structure preserved.
 * =================================================================================================
 */

// --- 1. CONFIGURATION & THEME TOKENS ---

const CONFIG = {
  APP_NAME: "SJU CAREER CONNECT",
  VERSION: "2.8.0-Polaris",
  RECORDS: 5500,
  PAGE_SIZE: 12,
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
  roles: [
    "Senior Software Engineer", "Product Manager", "Data Scientist", "UX/UI Designer",
    "Full Stack Developer", "Marketing Lead", "Financial Analyst", "DevOps Specialist",
    "Solutions Architect", "HR Business Partner", "Content Strategist", "Sales Director",
    "Blockchain Developer", "AI Research Scientist", "Cybersecurity Analyst", "Legal Counsel",
    "Operations Manager", "Supply Chain Analyst", "Chief of Staff"
  ],
  companies: [
    { name: "Google", tier: "Tech Giant", logo: "G", color: "#DB4437" },
    { name: "Microsoft", tier: "Tech Giant", logo: "M", color: "#F25022" },
    { name: "Amazon", tier: "Tech Giant", logo: "A", color: "#FF9900" },
    { name: "Goldman Sachs", tier: "Finance", logo: "GS", color: "#7399C6" },
    { name: "McKinsey", tier: "Consulting", logo: "MC", color: "#051C2C" },
    { name: "Tesla", tier: "Automotive", logo: "T", color: "#CC0000" },
    { name: "Zerodha", tier: "Fintech", logo: "Z", color: "#387ED1" },
    { name: "Swiggy", tier: "Consumer", logo: "S", color: "#FC8019" },
    { name: "Infosys", tier: "IT Services", logo: "IN", color: "#007CC3" },
    { name: "Unilever", tier: "FMCG", logo: "U", color: "#1F36C7" }
  ],
  locations: ["Bangalore", "Mumbai", "Remote", "Hyderabad", "London", "New York", "Singapore", "Gurgaon", "Pune", "Dubai", "San Francisco", "Berlin"],
  types: ["Full-time", "Internship", "Contract", "Remote", "Freelance"],
  salaries: [12, 18, 24, 35, 42, 55, 8, 60], // in Lakhs

  // Generator
  generate: () => {
    const data = [];
    for (let i = 1; i <= CONFIG.RECORDS; i++) {
      const role = MockDB.roles[i % MockDB.roles.length];
      const comp = MockDB.companies[i % MockDB.companies.length];
      const loc = MockDB.locations[i % MockDB.locations.length];
      const type = MockDB.types[i % MockDB.types.length];
      const baseSalary = MockDB.salaries[i % MockDB.salaries.length];

      let stage = "New";
      if (i % 20 === 0) stage = "Applied";
      if (i % 50 === 0) stage = "Interviewing";
      if (i % 200 === 0) stage = "Offer";

      data.push({
        id: `JOB-${5000 + i}`,
        title: role,
        company: comp.name,
        industry: comp.tier,
        companyTier: comp.tier,
        logo: comp.logo,
        logoColor: comp.color,
        location: loc,
        type,
        salary: `₹${baseSalary}L - ₹${baseSalary + 5}L`,
        experience: baseSalary > 30 ? "Executive" : (baseSalary > 15 ? "Senior" : "Mid-Level"),
        posted: i % 30, // days ago
        applicants: Math.floor(Math.random() * 200) + 10,
        matchScore: Math.floor(Math.random() * (99 - 60) + 60),
        stage,
        description: `We are looking for a visionary ${role} to drive innovation at ${comp.name}. You will work with cross-functional teams to build scalable solutions impacting millions of users.`,
        skills: ["React", "Strategy", "Analysis", "Leadership", "Python", "AWS"].sort(() => 0.5 - Math.random()).slice(0, 3),
        isHot: i % 15 === 0,
        isNew: i < 50,
        remote: loc === "Remote"
      });
    }
    return data;
  }
};

// --- 3. UTILITIES ---

const Formatters = {
  date: (days) => days === 0 ? "Just Now" : `${days}d ago`,
  number: (num) => num >= 1000 ? (num/1000).toFixed(1) + 'k' : num
};

// --- 4. STYLE SYSTEM (CSS-IN-JS) ---
// (kept same look & tokens as original; styles trimmed for brevity but remain functional)

const styles = {
  wrapper: { minHeight: '100vh', backgroundColor: CONFIG.THEME.BG_APP, fontFamily: "'Inter', 'Segoe UI', sans-serif", color: CONFIG.THEME.TEXT_PRI, overflowX: 'hidden', paddingBottom: '50px' },
  container: { maxWidth: '1600px', margin: '0 auto', padding: '0 30px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px', position: 'relative', zIndex: 10 },
  hero: { background: `linear-gradient(135deg, ${CONFIG.THEME.NAVY_MAIN} 0%, #000000 100%)`, padding: '80px 0 120px 0', color: 'white', position: 'relative', marginBottom: '-60px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)', overflow: 'hidden' },
  heroContent: { maxWidth: '1600px', margin: '0 auto', padding: '0 30px', position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
  heroTitle: { fontSize: '3.5rem', fontWeight: '900', lineHeight: 1, letterSpacing: '-1px', marginBottom: '15px', background: `linear-gradient(to right, #ffffff, ${CONFIG.THEME.GOLD_MAIN})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textTransform: 'uppercase' },

  sidebar: { backgroundColor: 'white', borderRadius: '20px', padding: '30px', border: `1px solid ${CONFIG.THEME.BORDER}`, boxShadow: '0 10px 30px rgba(0,0,0,0.03)', position: 'sticky', top: '30px', height: 'calc(100vh - 60px)', overflowY: 'auto' },
  filterSection: { marginBottom: '30px' },
  filterHeader: { fontSize: '0.8rem', fontWeight: '800', color: CONFIG.THEME.NAVY_MAIN, textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '0.5px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' },
  checkbox: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', cursor: 'pointer', padding: '8px 10px', borderRadius: '8px', transition: 'all 0.2s' },

  controlBar: { backgroundColor: 'white', borderRadius: '16px', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: `1px solid ${CONFIG.THEME.BORDER}`, marginBottom: '30px' },
  searchWrapper: { position: 'relative', width: '450px' },
  searchInput: { width: '100%', padding: '12px 15px 12px 45px', borderRadius: '10px', border: `2px solid ${CONFIG.THEME.BORDER}`, fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s', color: CONFIG.THEME.NAVY_MAIN },

  card: { backgroundColor: 'white', borderRadius: '20px', border: `1px solid ${CONFIG.THEME.BORDER}`, padding: '25px', position: 'relative', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)', overflow: 'hidden' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' },
  logoBox: (color) => ({ width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'white', fontSize: '1.5rem', background: color || CONFIG.THEME.NAVY_MAIN, boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)' }),
  matchScore: { background: '#DCFCE7', color: '#166534', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #BBF7D0' },

  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 21, 41, 0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' },
  modalContent: { backgroundColor: 'white', width: '100%', maxWidth: '900px', maxHeight: '90vh', borderRadius: '24px', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)', overflow: 'hidden', animation: 'slideUp 0.3s ease-out', display: 'flex', flexDirection: 'column' },

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
    .hover-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1); border-color: ${CONFIG.THEME.GOLD_MAIN}; }
  `}</style>
);

// --- Small reusable atoms ---

const Badge = ({ icon, text, color, bg }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: '700', color: color, backgroundColor: bg || `${color}15`, padding: '6px 10px', borderRadius: '8px', border: `1px solid ${bg ? 'transparent' : color + '30'}` }}>
    <i className={`bi ${icon}`}></i> {text}
  </span>
);

// --- AdvancedPagination (directory-style) ---

const pageBtnStyles = (active, disabled) => ({
  minWidth: '44px', height: '36px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px',
  border: active ? 'none' : `1px solid ${CONFIG.THEME.BORDER}`,
  backgroundColor: active ? CONFIG.THEME.NAVY_MAIN : 'white',
  color: active ? 'white' : (disabled ? CONFIG.THEME.TEXT_TER : CONFIG.THEME.TEXT_PRI),
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.15s', opacity: disabled ? 0.5 : 1, padding: '0 12px'
});

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

// --- FilterGroup (reusable) ---

const FilterGroup = ({ title, options = [], counts = {}, active, onSelect }) => {
  const [expanded, setExpanded] = useState(true);
  const opts = Array.isArray(options) ? options : Object.keys(options || {});
  return (
    <div style={styles.filterSection}>
      <div style={styles.filterHeader} onClick={() => setExpanded(!expanded)}>
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

// --- PostJobWizard (enhanced) ---

const PostJobWizard = ({ onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '', company: '', location: '', type: 'Full-time', salary: '', desc: '',
    experience: 'Mid-Level', skills: '', industry: '', applyUrl: ''
  });

  const canContinue = () => {
    if (step === 1) return form.title.trim() && form.company.trim();
    if (step === 2) return form.desc.trim() && form.salary.trim();
    return true;
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: `1px solid ${CONFIG.THEME.BORDER}`, paddingBottom: '12px' }}>
        <h2 style={{ margin: 0, color: CONFIG.THEME.NAVY_MAIN }}>Create Opportunity</h2>
        <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '1.6rem', cursor: 'pointer' }}>✕</button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {[1, 2, 3].map(n => (
          <div key={n} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', margin: '0 auto 8px auto', background: step >= n ? CONFIG.THEME.NAVY_MAIN : '#E6E9EF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{n}</div>
            <div style={{ fontSize: '0.8rem', color: step >= n ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.TEXT_SEC, fontWeight: 700 }}>{n === 1 ? 'Details' : n === 2 ? 'Requirements' : 'Preview'}</div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '6px' }}>
        {step === 1 && (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Job Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior Product Designer" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${CONFIG.THEME.BORDER}` }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Company</label>
                <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${CONFIG.THEME.BORDER}` }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Location</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${CONFIG.THEME.BORDER}` }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${CONFIG.THEME.BORDER}` }}>
                  {["Full-time", "Internship", "Contract", "Remote", "Freelance"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Experience Level</label>
                <select value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${CONFIG.THEME.BORDER}` }}>
                  {["Mid-Level", "Senior", "Executive"].map(x => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Job Description</label>
              <textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Describe the role responsibilities..." style={{ width: '100%', minHeight: 140, padding: '12px', borderRadius: '8px', border: `1px solid ${CONFIG.THEME.BORDER}` }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Estimated Salary Range</label>
                <input value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="e.g. ₹18L - ₹25L" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${CONFIG.THEME.BORDER}` }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Industry</label>
                <input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} placeholder="e.g. Tech, Finance" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${CONFIG.THEME.BORDER}` }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Skills (comma separated)</label>
              <input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="React, Node.js, Leadership" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${CONFIG.THEME.BORDER}` }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Application Link (optional)</label>
              <input value={form.applyUrl} onChange={e => setForm({ ...form, applyUrl: e.target.value })} placeholder="https://apply.example.com" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${CONFIG.THEME.BORDER}` }} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ background: CONFIG.THEME.BG_APP, padding: '20px', borderRadius: '12px', border: `1px solid ${CONFIG.THEME.BORDER}` }}>
            <h3 style={{ marginTop: 0, color: CONFIG.THEME.NAVY_MAIN }}>{form.title || '(No title)'}</h3>
            <div style={{ color: CONFIG.THEME.TEXT_SEC, marginBottom: 12 }}>{form.company} • {form.location} • {form.type}</div>
            <div style={{ marginBottom: 12 }}>
              <strong>Experience:</strong> {form.experience} • <strong>Salary:</strong> {form.salary || 'TBD'}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>Industry:</strong> {form.industry || 'General'}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>Skills:</strong> {(form.skills || '').split(',').map(s => s.trim()).filter(Boolean).join(', ') || '—'}
            </div>
            <div style={{ marginTop: 12, lineHeight: 1.6, color: CONFIG.THEME.TEXT_PRI }}>{form.desc || 'No description added.'}</div>
            {form.applyUrl && <div style={{ marginTop: 12 }}><a href={form.applyUrl} target="_blank" rel="noreferrer" style={{ color: CONFIG.THEME.NAVY_MAIN }}>{form.applyUrl}</a></div>}
          </div>
        )}
      </div>

      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          {step > 1 && <button onClick={() => setStep(s => s - 1)} style={{ padding: '10px 18px', borderRadius: 8, border: `1px solid ${CONFIG.THEME.BORDER}`, background: 'white', cursor: 'pointer', fontWeight: 700 }}>Back</button>}
        </div>
        <div>
          <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 8, border: `1px solid ${CONFIG.THEME.BORDER}`, background: 'white', cursor: 'pointer', fontWeight: 700, marginRight: 8 }}>Cancel</button>
          <button
            onClick={() => {
              if (!canContinue()) return;
              if (step === 3) {
                // final submit
                const payload = {
                  title: form.title,
                  company: form.company,
                  location: form.location,
                  type: form.type,
                  salary: form.salary,
                  description: form.desc,
                  experience: form.experience,
                  skills: (form.skills || '').split(',').map(s => s.trim()).filter(Boolean),
                  industry: form.industry || 'General',
                  applyUrl: form.applyUrl
                };
                onSubmit(payload);
              } else {
                setStep(s => s + 1);
              }
            }}
            style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: CONFIG.THEME.NAVY_MAIN, color: 'white', cursor: 'pointer', fontWeight: 800 }}
          >
            {step === 3 ? 'Publish Now' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- JobDetailsModal (kept but safe-guarded) ---

const JobDetailsModal = ({ job, onClose, onApply, applied }) => {
  if (!job) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ height: '140px', background: `linear-gradient(135deg, ${CONFIG.THEME.NAVY_MAIN}, ${CONFIG.THEME.NAVY_DARK})`, padding: '30px', position: 'relative', flexShrink: 0 }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', position: 'absolute', bottom: '-30px', left: '40px' }}>
          <div style={{ ...styles.logoBox(job.logoColor), width: '80px', height: '80px', fontSize: '2rem', border: '4px solid white' }}>{job.logo}</div>
          <div style={{ marginBottom: '10px' }}>
            <h2 style={{ margin: 0, color: 'white', fontSize: '1.8rem' }}>{job.title}</h2>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem' }}>{job.company} • {job.location}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '50px 40px 40px 40px', overflowY: 'auto', flex: 1 }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <Badge icon="bi-briefcase" text={job.type} color={CONFIG.THEME.NAVY_MAIN} />
          <Badge icon="bi-cash" text={job.salary} color={CONFIG.THEME.SUCCESS} />
          <Badge icon="bi-clock" text={`${job.posted}d ago`} color={CONFIG.THEME.TEXT_SEC} />
          {job.isHot && <Badge icon="bi-fire" text="Actively Hiring" bg="#FEF3C7" color={CONFIG.THEME.WARNING} />}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
          <div>
            <h4 style={{ textTransform: 'uppercase', color: CONFIG.THEME.TEXT_SEC, fontSize: '0.85rem', letterSpacing: '1px' }}>About the Role</h4>
            <p style={{ lineHeight: '1.6', color: CONFIG.THEME.TEXT_PRI }}>{job.description}</p>
            <p style={{ lineHeight: '1.6', color: CONFIG.THEME.TEXT_PRI }}>
              You will be responsible for architecting scalable solutions and leading a team of engineers.
              Requires strong proficiency in modern frameworks and cloud infrastructure.
            </p>

            <h4 style={{ textTransform: 'uppercase', color: CONFIG.THEME.TEXT_SEC, fontSize: '0.85rem', letterSpacing: '1px', marginTop: '30px' }}>Required Skills</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
              {job.skills.map(s => <span key={s} style={{ background: CONFIG.THEME.BG_APP, padding: '8px 16px', borderRadius: '20px', fontWeight: '600', fontSize: '0.9rem', color: CONFIG.THEME.NAVY_MAIN }}>{s}</span>)}
            </div>
          </div>

          <div style={{ background: CONFIG.THEME.BG_APP, padding: '25px', borderRadius: '16px', height: 'fit-content' }}>
            <div style={{ textAlign: 'center', paddingBottom: '20px', borderBottom: `1px solid ${CONFIG.THEME.BORDER}` }}>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: CONFIG.THEME.NAVY_MAIN }}>{job.matchScore}%</div>
              <div style={{ fontSize: '0.9rem', color: CONFIG.THEME.TEXT_SEC, fontWeight: '600' }}>Profile Match</div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                <span>Applicants</span>
                <strong>{job.applicants}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                <span>Experience</span>
                <strong>{job.experience}</strong>
              </div>
            </div>

            <button onClick={() => onApply(job.id)} disabled={applied} style={{ width: '100%', marginTop: '20px', padding: '14px', borderRadius: '10px', border: 'none', background: applied ? CONFIG.THEME.SUCCESS : CONFIG.THEME.NAVY_MAIN, color: 'white', fontWeight: '700', cursor: applied ? 'default' : 'pointer', fontSize: '1rem' }}>{applied ? 'Application Sent' : 'Apply Now'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App (CareerGateway) ---

const CareerGateway = () => {
  // state
  const [data, setData] = useState([]);
  const [viewMode, setViewMode] = useState('GRID'); // GRID | LIST | KANBAN | ANALYTICS
  const [filters, setFilters] = useState({ type: null, location: null, industry: null, experience: null, isHot: null, remote: null, companyTier: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [modalMode, setModalMode] = useState(null); // 'DETAILS' | 'POST'
  const [selectedJob, setSelectedJob] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState({});
  const [toast, setToast] = useState(null);

  // init
  useEffect(() => {
    setData(MockDB.generate());
  }, []);

  // derived: filteredData + facets (facets built from full dataset for stable counts)
  const { filteredData, facets } = useMemo(() => {
    let result = data.slice();

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(j => (j.title || '').toLowerCase().includes(q) || (j.company || '').toLowerCase().includes(q) || (j.skills || []).join(' ').toLowerCase().includes(q));
    }

    // apply filters
    Object.keys(filters).forEach(key => {
      const val = filters[key];
      if (!val) return;
      if (key === 'isHot') {
        result = result.filter(j => j.isHot === (val === 'Yes'));
      } else if (key === 'remote') {
        result = result.filter(j => j.remote === (val === 'Yes'));
      } else {
        result = result.filter(j => j[key] === val);
      }
    });

    // build facets from full data (so users see whole-set counts)
    const counts = { type: {}, location: {}, industry: {}, experience: {}, isHot: {}, remote: {}, companyTier: {} };
    data.forEach(j => {
      counts.type[j.type] = (counts.type[j.type] || 0) + 1;
      counts.location[j.location] = (counts.location[j.location] || 0) + 1;
      counts.industry[j.industry] = (counts.industry[j.industry] || 0) + 1;
      counts.experience[j.experience] = (counts.experience[j.experience] || 0) + 1;
      counts.isHot[j.isHot ? 'Yes' : 'No'] = (counts.isHot[j.isHot ? 'Yes' : 'No'] || 0) + 1;
      counts.remote[j.remote ? 'Yes' : 'No'] = (counts.remote[j.remote ? 'Yes' : 'No'] || 0) + 1;
      counts.companyTier[j.companyTier || 'Other'] = (counts.companyTier[j.companyTier || 'Other'] || 0) + 1;
    });

    return { filteredData: result, facets: counts };
  }, [data, searchQuery, filters]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / CONFIG.PAGE_SIZE));
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

  const currentItems = useMemo(() => {
    const start = (page - 1) * CONFIG.PAGE_SIZE;
    return filteredData.slice(start, start + CONFIG.PAGE_SIZE);
  }, [filteredData, page]);

  // handlers
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleApply = (id) => {
    setAppliedJobs(prev => ({ ...prev, [id]: true }));
    showToast("Application submitted successfully!");
    setModalMode(null);
  };

  const handlePostJob = (jobData) => {
    const newJob = {
      id: `JOB-${Date.now()}`,
      title: jobData.title,
      company: jobData.company,
      location: jobData.location || 'Remote',
      type: jobData.type || 'Full-time',
      salary: jobData.salary || 'TBD',
      description: jobData.description || jobData.desc || '',
      experience: jobData.experience || 'Mid-Level',
      posted: 0,
      applicants: 0,
      matchScore: 100,
      skills: jobData.skills || [],
      isHot: false,
      isNew: true,
      industry: jobData.industry || 'General',
      logo: (jobData.company || 'C')[0].toUpperCase(),
      logoColor: CONFIG.THEME.NAVY_MAIN,
      companyTier: jobData.companyTier || 'General',
      remote: jobData.location === 'Remote' || (jobData.type === 'Remote')
    };
    setData(prev => [newJob, ...prev]);
    setModalMode(null);
    showToast("Job posted successfully!");
  };

  const toggleFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === val ? null : val }));
    setPage(1);
  };

  // RENDERS
  const renderGrid = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px', paddingBottom: '40px' }}>
      {currentItems.map((job, i) => (
        <div key={job.id} className="hover-card" style={{ ...styles.card, animationDelay: `${i * 0.05}s`, borderTop: appliedJobs[job.id] ? `4px solid ${CONFIG.THEME.SUCCESS}` : `1px solid ${CONFIG.THEME.BORDER}` }} onClick={() => { setSelectedJob(job); setModalMode('DETAILS'); }}>
          <div style={styles.cardHeader}>
            <div style={styles.logoBox(job.logoColor)}>{job.logo}</div>
            <div style={styles.matchScore}>{job.matchScore}% Match</div>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 6px 0', color: CONFIG.THEME.NAVY_MAIN }}>{job.title}</h3>
          <div style={{ color: CONFIG.THEME.TEXT_SEC, marginBottom: 12 }}>{job.company} • {job.industry}</div>

          <div style={{ margin: '10px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {job.skills.map(s => <span key={s} style={{ fontSize: '0.75rem', background: CONFIG.THEME.BG_APP, padding: '6px 10px', borderRadius: 8, color: CONFIG.THEME.TEXT_SEC }}>{s}</span>)}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: `1px dashed ${CONFIG.THEME.BORDER}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', color: CONFIG.THEME.TEXT_SEC }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><i className="bi bi-geo-alt-fill" style={{ color: CONFIG.THEME.GOLD_DIM }}></i> {job.location}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><i className="bi bi-briefcase-fill" style={{ color: CONFIG.THEME.ACCENT_CYAN }}></i> {job.type}</div>
            <div style={{ gridColumn: '1 / span 2', marginTop: 8, fontWeight: 700, color: CONFIG.THEME.NAVY_MAIN }}><i className="bi bi-cash" /> {job.salary}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderList = () => (
    <div style={{ backgroundColor: 'white', borderRadius: 12, border: `1px solid ${CONFIG.THEME.BORDER}`, overflow: 'hidden', marginBottom: 24 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }} role="table" aria-label="Job list">
        <thead>
          <tr style={{ backgroundColor: CONFIG.THEME.BG_APP, borderBottom: `1px solid ${CONFIG.THEME.BORDER}`, textAlign: 'left' }}>
            {['Role & Company', 'Location', 'Type', 'Experience', 'Match', 'Applicants', 'Action'].map(h => <th key={h} style={{ padding: '12px 16px', fontSize: '0.8rem', color: CONFIG.THEME.TEXT_SEC, textTransform: 'uppercase' }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {currentItems.map(job => (
            <tr key={job.id} onClick={() => { setSelectedJob(job); setModalMode('DETAILS'); }} style={{ borderBottom: `1px solid ${CONFIG.THEME.BORDER}`, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'} role="row" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') { setSelectedJob(job); setModalMode('DETAILS'); } }}>
              <td style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: job.logoColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{job.logo}</div>
                  <div>
                    <div style={{ fontWeight: 800, color: CONFIG.THEME.NAVY_MAIN }}>{job.title}</div>
                    <div style={{ fontSize: '0.85rem', color: CONFIG.THEME.TEXT_SEC }}>{job.company} • {job.industry}</div>
                  </div>
                </div>
              </td>

              <td style={{ padding: '12px 16px', color: CONFIG.THEME.TEXT_SEC }}>{job.location}</td>
              <td style={{ padding: '12px 16px' }}>{job.type}</td>
              <td style={{ padding: '12px 16px' }}>{job.experience}</td>
              <td style={{ padding: '12px 16px', fontWeight: 800, color: CONFIG.THEME.NAVY_MAIN }}>{job.matchScore}%</td>
              <td style={{ padding: '12px 16px' }}>{job.applicants}</td>

              <td style={{ padding: '12px 16px' }}>
                {/* stopPropagation so clicking a button doesn't open the row */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedJob(job); setModalMode('DETAILS'); }} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${CONFIG.THEME.BORDER}`, background: 'white', cursor: 'pointer', fontWeight: 700 }}>View</button>
                  <button onClick={(e) => { e.stopPropagation(); handleApply(job.id); }} disabled={!!appliedJobs[job.id]} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: CONFIG.THEME.NAVY_MAIN, color: 'white', cursor: appliedJobs[job.id] ? 'default' : 'pointer', fontWeight: 700 }}>{appliedJobs[job.id] ? 'Applied' : 'Apply'}</button>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
        {[ { label: 'Active Jobs', val: Formatters.number(filteredData.length), icon: 'bi-briefcase', color: CONFIG.THEME.NAVY_MAIN },
           { label: 'New This Week', val: '245', icon: 'bi-lightning-fill', color: CONFIG.THEME.GOLD_MAIN },
           { label: 'Avg Salary', val: '₹18.5L', icon: 'bi-cash-coin', color: CONFIG.THEME.SUCCESS },
           { label: 'Your Applications', val: Object.keys(appliedJobs).length, icon: 'bi-send-fill', color: CONFIG.THEME.ACCENT_CYAN } ].map((s,i) => (
          <div key={i} style={{ background: 'white', padding: 25, borderRadius: 16, border: `1px solid ${CONFIG.THEME.BORDER}`, boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: CONFIG.THEME.NAVY_MAIN }}>{s.val}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', marginTop: 5, textTransform: 'uppercase' }}>{s.label}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}20`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}><i className={`bi ${s.icon}`}></i></div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', padding: 30, borderRadius: 20, border: `1px solid ${CONFIG.THEME.BORDER}` }}>
        <h3 style={{ color: CONFIG.THEME.NAVY_MAIN, margin: '0 0 20px 0' }}>Market Demand by Role</h3>
        <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 20 }}>
          {[65, 80, 45, 90, 70, 50, 85, 95].map((h, i) => <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 7 ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.NAVY_LITE, borderRadius: '4px 4px 0 0' }} />)}
        </div>
      </div>
    </div>
  );

  const renderKanban = () => {
    const stages = ["New", "Applied", "Interviewing", "Offer"];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 25, height: 'calc(100vh - 200px)', overflowX: 'auto' }}>
        {stages.map(stage => (
          <div key={stage} style={{ backgroundColor: '#F8FAFC', borderRadius: 16, padding: 12, border: `1px solid ${CONFIG.THEME.BORDER}`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: CONFIG.THEME.NAVY_MAIN, marginBottom: 12, display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: `2px solid ${CONFIG.THEME.BORDER}` }}>
              <span>{stage}</span>
              <span style={{ background: 'white', padding: '2px 8px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700 }}>{data.filter(j => j.stage === stage).length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15, overflowY: 'auto' }}>
              {data.filter(j => j.stage === stage).slice(0, 8).map(job => (
                <div key={job.id} style={{ background: 'white', padding: 12, borderRadius: 10, boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: `1px solid ${CONFIG.THEME.BORDER}` }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: CONFIG.THEME.NAVY_MAIN }}>{job.title}</div>
                  <div style={{ fontSize: '0.8rem', color: CONFIG.THEME.TEXT_SEC }}>{job.company}</div>
                  <div style={{ marginTop: 10, fontSize: '0.75rem', fontWeight: 700, color: CONFIG.THEME.GOLD_DIM }}>{job.matchScore}% Match</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.wrapper}>
      <GlobalStyles />

      <header style={styles.hero}>
        <div style={styles.heroContent}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
              <span style={{ background: CONFIG.THEME.GOLD_MAIN, padding: '6px 16px', borderRadius: 30, color: CONFIG.THEME.NAVY_MAIN, fontWeight: 800, fontSize: '0.75rem', letterSpacing: 1 }}>TITANIUM CAREERS</span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}><i className="bi bi-circle-fill" style={{ fontSize: 8, color: CONFIG.THEME.SUCCESS, marginRight: 8 }} />Live Market Feed</span>
            </div>
            <h1 style={styles.heroTitle}>Career Gateway</h1>
            <p style={{ color: CONFIG.THEME.TEXT_TER, fontSize: '1.1rem', maxWidth: 600 }}>Unlock exclusive opportunities from 500+ top-tier partners. Leveraging AI matching to find your perfect fit.</p>
            <button onClick={() => setModalMode('POST')} style={{ marginTop: 20, padding: '12px 20px', borderRadius: 12, background: CONFIG.THEME.GOLD_MAIN, color: CONFIG.THEME.NAVY_MAIN, border: 'none', fontWeight: 800, cursor: 'pointer' }}><i className="bi bi-plus-lg" /> Post Opportunity</button>
          </div>
        </div>
      </header>

      <div style={styles.container}>
        {/* SIDEBAR */}
        <aside style={styles.sidebar}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${CONFIG.THEME.BORDER}` }}>
            <span style={{ fontWeight: 800, color: CONFIG.THEME.NAVY_MAIN }}>FILTERS</span>
            <button onClick={() => { setFilters({ type: null, location: null, industry: null, experience: null, isHot: null, remote: null, companyTier: null }); setSearchQuery(''); setPage(1); }} style={{ background: 'none', border: 'none', color: CONFIG.THEME.DANGER, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>RESET</button>
          </div>

          <FilterGroup title="Job Type" options={Object.keys(facets.type)} counts={facets.type} active={filters.type} onSelect={v => toggleFilter('type', v)} />
          <FilterGroup title="Location" options={Object.keys(facets.location)} counts={facets.location} active={filters.location} onSelect={v => toggleFilter('location', v)} />
          <FilterGroup title="Industry" options={Object.keys(facets.industry)} counts={facets.industry} active={filters.industry} onSelect={v => toggleFilter('industry', v)} />
          <FilterGroup title="Experience" options={Object.keys(facets.experience)} counts={facets.experience} active={filters.experience} onSelect={v => toggleFilter('experience', v)} />
          <FilterGroup title="Company Tier" options={Object.keys(facets.companyTier)} counts={facets.companyTier} active={filters.companyTier} onSelect={v => toggleFilter('companyTier', v)} />
          <FilterGroup title="Actively Hiring" options={['Yes', 'No']} counts={facets.isHot} active={filters.isHot} onSelect={v => toggleFilter('isHot', v)} />
          <FilterGroup title="Remote" options={['Yes', 'No']} counts={facets.remote} active={filters.remote} onSelect={v => toggleFilter('remote', v)} />
        </aside>

        {/* MAIN */}
        <main>
          <div style={styles.controlBar}>
            <div style={styles.searchWrapper}>
              <i className="bi bi-search" style={{ position: 'absolute', left: 15, top: 12, color: CONFIG.THEME.TEXT_SEC }} />
              <input style={styles.searchInput} placeholder="Search jobs, companies, skills..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }} />
            </div>

            <div style={{ display: 'flex', gap: 8, background: CONFIG.THEME.BG_APP, padding: 6, borderRadius: 10 }}>
              {['GRID', 'LIST', 'KANBAN', 'ANALYTICS'].map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', background: viewMode === mode ? 'white' : 'transparent', color: viewMode === mode ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.TEXT_SEC, boxShadow: viewMode === mode ? '0 2px 5px rgba(0,0,0,0.05)' : 'none' }}>{mode}</button>
              ))}
            </div>
          </div>

          {viewMode === 'GRID' && renderGrid()}
          {viewMode === 'LIST' && renderList()}
          {viewMode === 'ANALYTICS' && renderAnalytics()}
          {viewMode === 'KANBAN' && renderKanban()}

          {/* AdvancedPagination used for GRID & LIST */}
          {(viewMode === 'GRID' || viewMode === 'LIST') && (
            <AdvancedPagination currentPage={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 400, behavior: 'smooth' }); }} windowSize={2} />
          )}
        </main>
      </div>

      {/* Overlays */}
      {(modalMode === 'DETAILS' && selectedJob) && (
        <div style={styles.modalOverlay} onClick={() => { setModalMode(null); setSelectedJob(null); }}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <JobDetailsModal job={selectedJob} onClose={() => { setModalMode(null); setSelectedJob(null); }} onApply={handleApply} applied={!!appliedJobs[selectedJob.id]} />
          </div>
        </div>
      )}

      {modalMode === 'POST' && (
        <div style={styles.modalOverlay} onClick={() => setModalMode(null)}>
          <div style={{ ...styles.modalContent, height: '700px' }} onClick={e => e.stopPropagation()}>
            <PostJobWizard onClose={() => setModalMode(null)} onSubmit={handlePostJob} />
          </div>
        </div>
      )}

      {toast && (
        <div style={styles.toast}>
          <i className="bi bi-check-circle-fill" style={{ color: CONFIG.THEME.GOLD_MAIN, fontSize: '1.2rem' }} />
          <span style={{ fontWeight: 600 }}>{toast}</span>
        </div>
      )}
    </div>
  );
};

export default CareerGateway;