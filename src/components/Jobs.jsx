import React, { useState, useEffect, useMemo, useRef, useCallback, Component } from 'react';
import API_BASE_URL from '../config';

/* ============================================================================
   1. ENTERPRISE CONFIGURATION & GATEWAY
   ============================================================================ */

const CONFIG = {
  SYSTEM: {
    APP_NAME: "SJU Career Gateway",
    VERSION: "2.0.0 Ultra",
    ORG: "St. Joseph's University",
    BUILD: "2026.11.X.JOBS"
  },
  DATA: {
    PAGE_SIZE: 20, 
    MAX_LIMIT: 5000 
  },
  THEME: {
    NAVY_DARK: '#020b17', NAVY_MAIN: '#0C2340', NAVY_LITE: '#1A3B66',
    GOLD_MAIN: '#D4AF37', GOLD_LITE: '#F9F1D8',
    SUCCESS: '#10B981', SUCCESS_BG: 'rgba(16, 185, 129, 0.1)',
    WARNING: '#F59E0B', WARNING_BG: 'rgba(245, 158, 11, 0.1)',
    DANGER: '#EF4444', DANGER_BG: 'rgba(239, 68, 68, 0.1)',
    INFO: '#3B82F6', INFO_BG: 'rgba(59, 130, 246, 0.1)',
    BG_APP: '#F1F5F9', BG_SURFACE: '#FFFFFF', BG_SURFACE_ALT: '#F8FAFC',
    BORDER: 'rgba(12, 35, 64, 0.12)', BORDER_LIGHT: '#E2E8F0', BORDER_FOCUS: '#94A3B8',
    TEXT_PRI: '#0F172A', TEXT_SEC: '#475569', TEXT_TER: '#94A3B8',
    RADIUS_LG: '20px', RADIUS_XL: '32px', RADIUS_FULL: '9999px',
    SHADOW_SM: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    SHADOW_MD: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
    SHADOW_LG: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    SHADOW_HOVER: '0 30px 60px -15px rgba(0, 0, 0, 0.25)',
    TRANSITION_SMOOTH: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    TRANSITION_BOUNCE: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
  }
};

const API_BASE = `${API_BASE_URL}/api/jobs`;

/* ============================================================================
   2. ERROR BOUNDARY
   ============================================================================ */

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'Lora, serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: CONFIG.THEME.BG_APP }}>
          <h1 style={{ color: CONFIG.THEME.DANGER }}>Jobs Portal Exception</h1>
          <button onClick={() => window.location.reload()} style={{ padding: '16px 32px', backgroundColor: CONFIG.THEME.NAVY_MAIN, color: CONFIG.THEME.GOLD_MAIN, borderRadius: '999px', border: 'none', cursor: 'pointer' }}>Reload Portal</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ============================================================================
   3. GLOBAL STYLES & ASSETS
   ============================================================================ */

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700&display=swap');
    
    .jobs-workspace {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 40px;
      max-width: 1440px;
      margin: -60px auto 100px;
      padding: 0 40px;
      position: relative;
      z-index: 10;
    }

    .jobs-sidebar {
      position: sticky;
      top: 100px;
      height: fit-content;
    }

    .glass-panel {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.6);
      box-shadow: ${CONFIG.THEME.SHADOW_MD};
    }

    .animated-card {
      background: #FFF;
      border-radius: ${CONFIG.THEME.RADIUS_LG};
      border: 1px solid ${CONFIG.THEME.BORDER_LIGHT};
      transition: ${CONFIG.THEME.TRANSITION_BOUNCE};
      cursor: pointer;
    }
    .animated-card:hover {
      transform: translateY(-8px);
      box-shadow: ${CONFIG.THEME.SHADOW_HOVER};
      border-color: ${CONFIG.THEME.GOLD_MAIN};
    }

    .sju-input {
      width: 100%;
      padding: 16px 20px 16px 50px;
      border-radius: ${CONFIG.THEME.RADIUS_FULL};
      border: 1px solid ${CONFIG.THEME.BORDER_LIGHT};
      font-size: 1rem;
      outline: none;
      transition: all 0.3s;
    }
    .sju-input:focus { border-color: ${CONFIG.THEME.NAVY_MAIN}; box-shadow: 0 0 0 4px rgba(12, 35, 64, 0.1); }

    @media (max-width: 1100px) {
      .jobs-workspace { grid-template-columns: 1fr; margin-top: -40px; padding: 0 24px; gap: 24px; }
      .jobs-sidebar { position: relative; top: 0; }
    }

    @media (max-width: 768px) {
      .jobs-workspace { padding: 0 16px; margin-top: -30px; }
      .jobs-post-grid { grid-template-columns: 1fr !important; }
      .jobs-detail-header { padding: 24px 20px !important; }
      .jobs-detail-body { padding: 24px 20px !important; max-height: 50vh !important; }
      .jobs-detail-footer { padding: 16px 20px !important; flex-direction: column !important; gap: 12px !important; align-items: stretch !important; }
      .jobs-detail-footer button { width: 100% !important; text-align: center !important; }
    }

    @media (max-width: 480px) {
      .jobs-workspace { padding: 0 12px; margin-top: -20px; }
      .jobs-search-bar { flex-direction: column !important; }
    }

    @keyframes slideUpFade {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `}</style>
);

const Icons = {
  Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Map: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Briefcase: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
};

/* ============================================================================
   4. DATA & MOCK
   ============================================================================ */

const MOCK_JOBS = [
  { _id: 'm1', title: 'Senior AI Engineer', company: 'Google India', location: 'Bengaluru', type: 'Full-Time', domain: 'Technology', salary: '45–60 LPA', createdAt: new Date().toISOString(), description: 'Join Google India as a Senior AI Engineer to build and deploy large-scale machine learning models. You will work on Google Search, Assistant, and Cloud AI products, collaborating with world-class researchers and engineers.', requirements: 'B.Tech/M.Tech in CS or related field. 5+ years of ML/AI experience. Proficiency in Python, TensorFlow or PyTorch. Experience with distributed systems and large-scale data pipelines.', applicationLink: 'https://careers.google.com' },
  { _id: 'm2', title: 'UX/UI Specialist', company: 'Flipkart', location: 'Remote', type: 'Contract', domain: 'Design', salary: '15–20 LPA', createdAt: new Date().toISOString(), description: 'Design intuitive, beautiful user experiences for Flipkart\'s e-commerce platform used by millions of customers across India. You will own end-to-end design for key product areas including checkout, discovery, and personalization.', requirements: '3+ years in UX/UI design. Proficiency in Figma and Adobe XD. Strong portfolio demonstrating mobile-first design. Experience with user research and usability testing.', applicationLink: 'https://www.flipkartcareers.com' },
  { _id: 'm3', title: 'Financial Analyst', company: 'Goldman Sachs', location: 'Mumbai', type: 'Full-Time', domain: 'Finance', salary: '20–30 LPA', createdAt: new Date().toISOString(), description: 'Analyze market trends, prepare financial models, and support investment banking transactions at Goldman Sachs Mumbai. You will work directly with senior bankers on mergers, acquisitions, and capital markets deals.', requirements: 'MBA Finance or CA/CFA. 2–4 years of financial modeling experience. Strong Excel and PowerPoint skills. Knowledge of Indian capital markets and regulatory framework.', applicationLink: 'https://www.goldmansachs.com/careers' },
  { _id: 'm4', title: 'Data Science Intern', company: 'Microsoft', location: 'Hyderabad', type: 'Internship', domain: 'Technology', salary: '50k/mo', createdAt: new Date().toISOString(), description: 'A 6-month internship opportunity at Microsoft Hyderabad\'s Azure Data & AI team. You will work on real customer projects involving big data analytics, predictive modeling, and business intelligence dashboards.', requirements: 'Final year B.Tech/M.Tech students in CS, Statistics, or related field. Knowledge of Python, SQL, and at least one ML library (scikit-learn, XGBoost). Good communication skills.', applicationLink: 'https://careers.microsoft.com' },
  { _id: 'm5', title: 'Marketing Lead', company: 'Zomato', location: 'Gurgaon', type: 'Full-Time', domain: 'Marketing', salary: '25–40 LPA', createdAt: new Date().toISOString(), description: 'Lead marketing campaigns for Zomato\'s food delivery and dining-out products across multiple Indian cities. You will own brand strategy, digital marketing, and growth experiments to drive customer acquisition and retention.', requirements: '5+ years in digital or growth marketing. Experience managing ₹1Cr+ budgets. Proficiency in Google Ads, Meta Ads, and analytics tools. Strong data-driven mindset with creative instincts.', applicationLink: 'https://www.zomato.com/careers' },
];

/* ============================================================================
   5. COMPONENTS
   ============================================================================ */

const JobCard = ({ job, onClick }) => (
  <div className="animated-card" onClick={onClick} style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: CONFIG.THEME.NAVY_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CONFIG.THEME.GOLD_MAIN, fontWeight: '900', fontSize: '1.2rem' }}>
        {job.company?.charAt(0) || 'J'}
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: CONFIG.THEME.TEXT_PRI }}>{job.title}</h3>
        <p style={{ margin: '4px 0 0', color: CONFIG.THEME.TEXT_SEC, fontSize: '0.9rem' }}>{job.company}</p>
      </div>
    </div>
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
      <span style={{ fontSize: '0.8rem', color: CONFIG.THEME.TEXT_SEC, display: 'flex', alignItems: 'center', gap: '4px' }}><Icons.Map/> {job.location}</span>
      <span style={{ fontSize: '0.8rem', color: CONFIG.THEME.SUCCESS, fontWeight: '700' }}>₹ {job.salary || 'Competitive'}</span>
    </div>
    <div style={{ display: 'flex', gap: '8px' }}>
      <span style={{ padding: '4px 12px', borderRadius: '999px', background: CONFIG.THEME.BG_APP, fontSize: '0.75rem', fontWeight: '700', color: CONFIG.THEME.NAVY_LITE }}>{job.type}</span>
      <span style={{ padding: '4px 12px', borderRadius: '999px', background: CONFIG.THEME.INFO_BG, fontSize: '0.75rem', fontWeight: '700', color: CONFIG.THEME.INFO }}>{job.domain}</span>
    </div>
  </div>
);

const Button = ({ children, onClick, variant = 'primary', active = false, style = {} }) => {
  const isPrimary = variant === 'primary';
  return (
    <button onClick={onClick} style={{
      padding: '12px 24px', borderRadius: '999px', border: isPrimary ? 'none' : `2px solid ${CONFIG.THEME.NAVY_MAIN}`,
      background: isPrimary ? (active ? CONFIG.THEME.NAVY_LITE : CONFIG.THEME.NAVY_MAIN) : (active ? CONFIG.THEME.NAVY_MAIN : 'transparent'),
      color: isPrimary ? CONFIG.THEME.GOLD_MAIN : (active ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.NAVY_MAIN),
      fontWeight: '700', cursor: 'pointer', transition: '0.2s', fontSize: '0.9rem',
      ...style
    }}>
      {children}
    </button>
  );
};

const JobDetail = ({ job, onClose }) => {
  const handleApply = () => {
    const link = job.applicationLink;
    if (link && link.trim() !== '') {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback: open company careers page via Google search
      const query = encodeURIComponent(`${job.company} careers jobs`);
      window.open(`https://www.google.com/search?q=${query}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(6,17,33,0.85)', backdropFilter:'blur(12px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
      <div onClick={e => e.stopPropagation()} className="glass-panel" style={{ width:'100%', maxWidth:'700px', borderRadius:CONFIG.THEME.RADIUS_XL, overflow:'hidden', animation:'slideUpFade 0.4s', maxHeight:'90vh', display:'flex', flexDirection:'column' }}>
        <div className="jobs-detail-header" style={{ background:CONFIG.THEME.NAVY_MAIN, padding:'36px 40px', color:'#FFF', position:'relative', flexShrink:0 }}>
          <button onClick={onClose} style={{ position:'absolute', top:'20px', right:'20px', background:'rgba(255,255,255,0.1)', border:'none', color:'#FFF', width:'38px', height:'38px', borderRadius:'50%', cursor:'pointer', fontSize:'1rem' }}>✕</button>
          <h2 style={{ fontSize:'clamp(1.3rem, 4vw, 1.8rem)', color:CONFIG.THEME.GOLD_MAIN, margin:'0 0 8px', paddingRight:'50px' }}>{job.title}</h2>
          <p style={{ margin:0, opacity:0.8, fontSize:'clamp(0.85rem, 2.5vw, 1rem)' }}>{job.company} · {job.location}</p>
          {job.salary && <p style={{ margin:'8px 0 0', color:CONFIG.THEME.GOLD_MAIN, fontWeight:'700', fontSize:'0.9rem' }}>₹ {job.salary}</p>}
        </div>
        <div className="jobs-detail-body" style={{ padding:'32px 40px', overflowY:'auto', flex:1 }}>
          <div style={{ marginBottom:'28px' }}>
            <h4 style={{ textTransform:'uppercase', letterSpacing:'1px', fontSize:'0.78rem', color:CONFIG.THEME.NAVY_MAIN, marginBottom:'12px' }}>About the Role</h4>
            <p style={{ lineHeight:'1.8', color:CONFIG.THEME.TEXT_SEC, fontSize:'clamp(0.9rem, 2.5vw, 1rem)' }}>{job.description || 'No description provided. Please contact the alumni who posted this role for more details.'}</p>
          </div>
          <div>
            <h4 style={{ textTransform:'uppercase', letterSpacing:'1px', fontSize:'0.78rem', color:CONFIG.THEME.NAVY_MAIN, marginBottom:'12px' }}>Requirements</h4>
            <p style={{ lineHeight:'1.8', color:CONFIG.THEME.TEXT_SEC, fontSize:'clamp(0.9rem, 2.5vw, 1rem)' }}>{job.requirements || 'Kindly reach out to the posting alumni member for requirement details.'}</p>
          </div>
        </div>
        <div className="jobs-detail-footer" style={{ padding:'20px 40px', borderTop:`1px solid ${CONFIG.THEME.BORDER_LIGHT}`, background:CONFIG.THEME.BG_SURFACE_ALT, display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <span style={{ fontSize:'0.8rem', color:CONFIG.THEME.TEXT_TER }}>Posted by {job.postedByName || 'Alumni Member'}</span>
          <Button onClick={handleApply}>Apply Opportunity →</Button>
        </div>
      </div>
    </div>
  );
};

const PostJobModal = ({ onClose, onPosted, user }) => {
  const [form, setForm] = useState({ title: '', company: '', location: '', type: 'Full-Time', domain: 'Technology', salary: '', applicationLink: '', description: '', requirements: '' });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, postedBy: user.reg_no || user.id || 'anonymous', postedByName: user.name || user.full_name || 'Alumni' })
      });
      const data = await res.json();
      onPosted(data.job);
      onClose();
    } catch { alert('Failed to post. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(6,17,33,0.85)', backdropFilter:'blur(12px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div onClick={e => e.stopPropagation()} className="glass-panel" style={{ width:'100%', maxWidth:'600px', borderRadius:CONFIG.THEME.RADIUS_XL, overflow:'hidden' }}>
        <div style={{ background:CONFIG.THEME.NAVY_MAIN, padding:'24px 32px', color:CONFIG.THEME.GOLD_MAIN }}>
          <h3 style={{ margin:0, color:CONFIG.THEME.GOLD_MAIN }}>Post elitist opportunity</h3>
        </div>
        <div style={{ padding:'32px', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'20px', maxHeight:'70vh', overflowY:'auto' }} className="jobs-post-grid">
          <div style={{ gridColumn:'1/-1' }}><label className="sju-label">Job Title</label><input className="sju-input" onChange={e => setForm({...form, title:e.target.value})} /></div>
          <div><label className="sju-label">Company</label><input className="sju-input" onChange={e => setForm({...form, company:e.target.value})} /></div>
          <div><label className="sju-label">Location</label><input className="sju-input" onChange={e => setForm({...form, location:e.target.value})} /></div>
          <div>
            <label className="sju-label">Job Type</label>
            <select className="sju-input" onChange={e => setForm({...form, type:e.target.value})} style={{ paddingLeft:'20px' }}>
              <option>Full-Time</option><option>Part-Time</option><option>Contract</option><option>Internship</option>
            </select>
          </div>
          <div>
            <label className="sju-label">Domain</label>
            <select className="sju-input" onChange={e => setForm({...form, domain:e.target.value})} style={{ paddingLeft:'20px' }}>
              <option>Technology</option><option>Finance</option><option>Marketing</option><option>Design</option><option>Other</option>
            </select>
          </div>
          <div style={{ gridColumn:'1/-1' }}><label className="sju-label">Application Link (Optional)</label><input className="sju-input" onChange={e => setForm({...form, applicationLink:e.target.value})} /></div>
          <div style={{ gridColumn:'1/-1' }}><label className="sju-label">Short Description</label><textarea className="sju-input" rows={3} style={{ borderRadius:'12px', paddingLeft:'20px' }} onChange={e => setForm({...form, description:e.target.value})} /></div>
        </div>
        <div style={{ padding:'24px 32px', background:CONFIG.THEME.BG_SURFACE_ALT, display:'flex', justifyContent:'flex-end', gap:'12px' }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={loading}>{loading ? 'Posting...' : 'Confirm Post'}</Button>
        </div>
      </div>
    </div>
  );
};

const Jobs = () => {
  const [view, setView] = useState('OVERVIEW'); 
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setCurrentUser(JSON.parse(stored));
    
    // Initial fetch
    const fetchJobs = async () => {
      try {
        const res = await fetch(API_BASE);
        const data = await res.json();
        setJobs([...(Array.isArray(data) ? data : []), ...MOCK_JOBS]);
      } catch {
        setJobs(MOCK_JOBS);
      } finally { setLoading(false); }
    };
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase());
      const matchView = 
        view === 'OVERVIEW' ? true :
        view === 'FULL_TIME' ? j.type === 'Full-Time' :
        view === 'INTERNSHIPS' ? j.type === 'Internship' :
        view === 'REMOTE' ? (j.location.toLowerCase().includes('remote') || j.type === 'Contract') :
        view === 'MY_POSTS' ? (j.postedBy === currentUser?.username) : true;
      return matchSearch && matchView;
    });
  }, [jobs, search, view, currentUser]);

  const totalPages = Math.ceil(filteredJobs.length / CONFIG.DATA.PAGE_SIZE);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * CONFIG.DATA.PAGE_SIZE, currentPage * CONFIG.DATA.PAGE_SIZE);

  return (
    <GlobalErrorBoundary>
      <div style={{ minHeight: '100vh', background: CONFIG.THEME.BG_APP, fontFamily: 'Lora, serif' }}>
        <GlobalStyles />
        
        {/* HEADER */}
        <div style={{ background: `linear-gradient(135deg, ${CONFIG.THEME.NAVY_DARK}, ${CONFIG.THEME.NAVY_MAIN})`, padding: '80px 24px 120px', textAlign: 'center', borderBottom: `4px solid ${CONFIG.THEME.GOLD_MAIN}` }}>
          <h1 style={{ color: '#FFF', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '900', margin: 0 }}>Career Gateway</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', marginTop: '10px' }}>Connecting SJU Alumni with Elite Opportunities</p>
        </div>

        {/* WORKSPACE */}
        <div className="jobs-workspace">
          {/* SIDEBAR */}
          <aside className="jobs-sidebar">
            <div className="glass-panel" style={{ padding: '32px', borderRadius: CONFIG.THEME.RADIUS_LG }}>
              <h4 style={{ margin: '0 0 20px', fontSize: '0.9rem', color: CONFIG.THEME.NAVY_MAIN, fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Filter by Stream</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 'OVERVIEW', label: 'All Openings', icon: '🌍' },
                  { id: 'FULL_TIME', label: 'Full-Time Roles', icon: '💼' },
                  { id: 'INTERNSHIPS', label: 'Internships', icon: '🎓' },
                  { id: 'REMOTE', label: 'Remote & Freelance', icon: '🏠' },
                  { id: 'MY_POSTS', label: 'Your Job Posts', icon: '👤' },
                ].map(v => (
                  <div key={v.id} onClick={() => { setView(v.id); setCurrentPage(1); }} style={{ 
                    padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', transition: '0.2s',
                    background: view === v.id ? CONFIG.THEME.NAVY_MAIN : 'transparent',
                    color: view === v.id ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.TEXT_SEC,
                    fontWeight: view === v.id ? '700' : '500', display: 'flex', alignItems: 'center', gap: '12px'
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>{v.icon}</span> {v.label}
                  </div>
                ))}
              </div>
              
              <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
                <p style={{ fontSize: '0.8rem', color: CONFIG.THEME.TEXT_SEC, lineHeight: '1.6' }}>
                  Approved alumni can post job opportunities directly. All posts remain active for 60 days.
                </p>
                {currentUser?.role === 'alumni' && (
                  <Button onClick={() => setShowPostModal(true)} style={{ marginTop: '16px', width: '100%' }}>+ Post Opportunity</Button>
                )}
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main style={{ flex: 1 }}>
            {/* SEARCH & CONTROLS */}
            <div className="glass-panel jobs-search-bar" style={{ padding: '20px 24px', borderRadius: CONFIG.THEME.RADIUS_LG, marginBottom: '28px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                <input value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search companies, roles, or skills..." className="sju-input" />
                <span style={{ position: 'absolute', left: '20px', top: '18px', color: CONFIG.THEME.TEXT_TER }}><Icons.Search/></span>
              </div>
              <div style={{ fontSize: '0.9rem', color: CONFIG.THEME.TEXT_SEC, fontWeight: '600', whiteSpace: 'nowrap' }}>
                Showing {filteredJobs.length} Positions
              </div>
            </div>

            {/* GRID */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '100px' }}>Loading elite opportunities...</div>
            ) : filteredJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '100px', background: '#FFF', borderRadius: '24px', color: CONFIG.THEME.TEXT_SEC }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🕵️</div>
                <h3>No roles found matching your criteria</h3>
                <p>Try broadening your search or switching views.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {paginatedJobs.map(job => (
                  <JobCard key={job._id} job={job} onClick={() => setSelectedJob(job)} />
                ))}
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} style={{
                    width: '40px', height: '40px', borderRadius: '50%', border: 'none',
                    background: currentPage === i + 1 ? CONFIG.THEME.NAVY_MAIN : '#FFF',
                    color: currentPage === i + 1 ? CONFIG.THEME.GOLD_MAIN : CONFIG.THEME.TEXT_PRI,
                    fontWeight: '700', cursor: 'pointer', transition: '0.2s', boxShadow: CONFIG.THEME.SHADOW_SM
                  }}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>

        {selectedJob && <JobDetail job={selectedJob} onClose={() => setSelectedJob(null)} />}
        {showPostModal && <PostJobModal onClose={() => setShowPostModal(false)} onPosted={(n) => setJobs([n, ...jobs])} user={currentUser} />}
      </div>
    </GlobalErrorBoundary>
  );
};

export default Jobs;