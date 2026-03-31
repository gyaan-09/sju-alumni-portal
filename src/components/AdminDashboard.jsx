import React, { useState, useEffect, useMemo, useCallback } from 'react';
import emailjs from '@emailjs/browser';
import API_BASE_CONFIG from '../config';


// CONFIGURATION //

const API_BASE_URL = `${API_BASE_CONFIG}/api/alumni`;

// EmailJS Credentials
const EMAILJS_PUBLIC_KEY = 'MgWnLyUUS3faeP6W5';
const EMAILJS_SERVICE_ID = 'service_gyaan';
const EMAILJS_TEMPLATE_ID = 'template_1jmzaa9';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

const T = {
  NAVY_DARK: '#061121', NAVY_MAIN: '#0C2340', NAVY_LITE: '#1A3B66',
  GOLD_MAIN: '#D4AF37', GOLD_LITE: '#FDF6DC',
  SUCCESS: '#10B981', DANGER: '#EF4444', WARNING: '#F59E0B', INFO: '#3B82F6',
  BG_APP: '#F0F4F8', BG_SURFACE: '#FFFFFF', BG_ALT: '#F8FAFC',
  BORDER: '#E2E8F0', TEXT: '#0F172A', TEXT2: '#475569', TEXT3: '#94A3B8',
  SH_SM: '0 2px 8px rgba(0,0,0,0.06)', SH_MD: '0 8px 24px rgba(0,0,0,0.08)',
  R_SM: '8px', R_MD: '12px', R_LG: '18px', R_XL: '24px',
  TR: 'all 0.25s ease'
};

// ATOMIC COMPONENTS //

const Badge = ({ label, type = 'info' }) => {
  const colors = {
    success: { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
    warning: { bg: 'rgba(245,158,11,0.12)', color: '#D97706' },
    danger:  { bg: 'rgba(239,68,68,0.12)',  color: '#DC2626' },
    info:    { bg: 'rgba(59,130,246,0.12)', color: '#2563EB' },
    navy:    { bg: T.NAVY_LITE, color: '#FFF' }
  };
  const c = colors[type] || colors.info;
  return (
    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700',
      background: c.bg, color: c.color, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
};

const Btn = ({ children, variant = 'primary', onClick, disabled, fullWidth }) => {
  const base = {
    padding: '10px 22px', borderRadius: T.R_XL, fontWeight: '700', fontSize: '0.875rem',
    cursor: disabled ? 'not-allowed' : 'pointer', transition: T.TR, border: 'none',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    opacity: disabled ? 0.55 : 1, width: fullWidth ? '100%' : 'auto', fontFamily: 'inherit'
  };
  const vars = {
    primary: { background: T.NAVY_MAIN, color: T.GOLD_MAIN },
    success: { background: T.SUCCESS, color: '#FFF' },
    danger:  { background: T.DANGER, color: '#FFF' },
    outline: { background: 'transparent', color: T.NAVY_MAIN, border: `2px solid ${T.NAVY_MAIN}` },
    ghost:   { background: T.BG_ALT, color: T.TEXT2, border: `1px solid ${T.BORDER}` }
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...(vars[variant] || vars.primary) }}>{children}</button>;
};

const StatCard = ({ label, value, icon, gradient, light, action, onAction }) => (
  <div style={{
    padding: '32px', borderRadius: T.R_LG, position: 'relative', overflow: 'hidden',
    background: gradient || '#FFF',
    boxShadow: gradient ? '0 10px 30px rgba(12, 35, 64, 0.18)' : T.SH_SM,
    border: gradient ? 'none' : `1px solid ${T.BORDER}`
  }}>
    <i className={`bi ${icon}`} style={{
      position: 'absolute', right: '-10px', bottom: '-20px',
      fontSize: '9rem', opacity: 0.06, color: gradient ? '#FFF' : T.NAVY_MAIN
    }} />
    <div style={{ fontSize: '0.8rem', color: gradient ? 'rgba(255,255,255,0.7)' : T.TEXT3, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px', fontWeight: '600' }}>{label}</div>
    <div style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', fontWeight: '900', color: gradient ? T.GOLD_MAIN : (light ? T.WARNING : T.NAVY_MAIN), lineHeight: '1' }}>{value}</div>
    {action && <button onClick={onAction} style={{ marginTop: '18px', padding: '8px 18px', background: 'rgba(255,255,255,0.15)', color: '#FFF', borderRadius: T.R_SM, border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>{action} →</button>}
  </div>
);

// REVIEW MODAL //
const ReviewModal = ({ user, onClose, onApprove, onReject }) => {
  const [loading, setLoading] = useState(false);
  const [genUser, setGenUser] = useState(user.registerNumber || user.regNo || '');
  const [genPass, setGenPass] = useState('');

  // Auto-generate password on mount
  useEffect(() => {
    const pass = Math.random().toString(36).substring(2, 10).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    setGenPass(pass);
  }, []);

  const regeneratePassword = () => {
    const pass = Math.random().toString(36).substring(2, 10).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    setGenPass(pass);
  };

  if (!user) return null;

  const handleAction = async (action) => {
    setLoading(true);
    if (action === 'approve') {
      await onApprove(user, genUser, genPass);
    }
    if (action === 'reject') await onReject(user);
    setLoading(false);
  };

  const name = user.fullName || user["Full Name"] || 'Unknown';
  const regNo = user.registerNumber || user.regNo || '—';
  const email = user.email || user.Email || '—';
  const phone = user.phoneNumber || user.phone || '—';
  const degree = user.degree || user.Degree || '—';
  const batch = user.batchYear || user["Batch Year"] || '—';
  const status = user.currentStatus || user["Current Status"] || 'N/A';
  const company = user.companyName || user["Company Name"] || user.pgCollege || 'N/A';
  const dob = user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-IN') : (user.dob || 'N/A');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,17,33,0.82)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
      <div style={{ background: T.BG_SURFACE, width: '100%', maxWidth: '1100px', maxHeight: '90vh', borderRadius: T.R_XL, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.3)', animation: 'slideUp 0.35s ease' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '20px 28px', background: `linear-gradient(135deg, ${T.NAVY_DARK}, ${T.NAVY_MAIN})`, color: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>Application Review</h2>
            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '4px' }}>Reg No: {regNo} | ID: {String(user._id || '').slice(-8)}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFF', width: '36px', height: '36px', borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Body */}
        <div className="admin-modal-body" style={{ display: 'flex', flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {/* Left */}
          <div className="admin-modal-left" style={{ flex: '1.2', padding: '28px', borderRight: `1px solid ${T.BORDER}` }}>
            {/* Applicant Summary */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '28px', paddingBottom: '20px', borderBottom: `1px solid ${T.BORDER}` }}>
              <div style={{
                width: '90px', height: '90px', borderRadius: '50%', flexShrink: 0,
                backgroundImage: `url(${user.profilePhotoUrl || ''})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                background: user.profilePhotoUrl ? undefined : `linear-gradient(135deg, ${T.NAVY_MAIN}, ${T.NAVY_LITE})`,
                border: `3px solid ${T.GOLD_MAIN}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: T.GOLD_MAIN, fontSize: '2rem', fontWeight: '700'
              }}>
                {!user.profilePhotoUrl && name.charAt(0)}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.6rem', color: T.NAVY_MAIN, fontWeight: '800' }}>{name}</h3>
                <div style={{ marginTop: '6px' }}><Badge label="Pending Verification" type="warning" /></div>
                <div style={{ fontSize: '0.82rem', color: T.TEXT3, marginTop: '6px' }}>{email}</div>
              </div>
            </div>

            {/* Credential Preview Section */}
            <div style={{ marginBottom: '28px', padding: '20px', background: T.GOLD_LITE, borderRadius: T.R_MD, border: `1px solid ${T.GOLD_MAIN}33` }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: T.NAVY_MAIN, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
                Portal Credentials Preview
                <span style={{ color: T.SUCCESS, fontSize: '0.65rem' }}>Auto-Generated</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: T.TEXT3, fontWeight: '600', marginBottom: '4px' }}>Generated Username</div>
                  <input value={genUser} onChange={e => setGenUser(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: `1px solid ${T.BORDER}`, fontWeight: '700', fontSize: '0.9rem' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: T.TEXT3, fontWeight: '600', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    Generated Password
                    <i className="bi bi-arrow-clockwise" style={{ cursor: 'pointer', color: T.NAVY_MAIN }} onClick={regeneratePassword} title="Regenerate" />
                  </div>
                  <input value={genPass} readOnly style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: `1px solid ${T.BORDER}`, fontWeight: '700', fontSize: '0.9rem', background: '#F1F5F9' }} />
                </div>
              </div>
              <p style={{ margin: '10px 0 0', fontSize: '0.7rem', color: T.TEXT2, fontStyle: 'italic' }}>These will be emailed to the alumnus upon approval.</p>
            </div>

            {/* Academic Details */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: T.TEXT3, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px' }}>Academic & Career</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                {[
                  { label: 'Degree', value: degree },
                  { label: 'Batch Year', value: `Class of ${batch}` },
                  { label: 'Current Status', value: status },
                  { label: 'Company / Institution', value: company },
                ].map(item => (
                  <div key={item.label} style={{ background: T.BG_ALT, padding: '14px 16px', borderRadius: T.R_MD }}>
                    <div style={{ fontSize: '0.72rem', color: T.TEXT3, fontWeight: '600', marginBottom: '4px' }}>{item.label}</div>
                    <div style={{ fontWeight: '700', color: T.TEXT, fontSize: '0.95rem' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Details */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: T.TEXT3, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px' }}>Personal Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                {[
                  { label: 'Email', value: email },
                  { label: 'Phone', value: phone },
                  { label: 'Date of Birth', value: dob },
                  { label: 'Aadhar', value: user.aadhar || 'Not Provided' },
                ].map(item => (
                  <div key={item.label} style={{ background: T.BG_ALT, padding: '14px 16px', borderRadius: T.R_MD }}>
                    <div style={{ fontSize: '0.72rem', color: T.TEXT3, fontWeight: '600', marginBottom: '4px' }}>{item.label}</div>
                    <div style={{ fontWeight: '700', color: T.TEXT, fontSize: '0.95rem', wordBreak: 'break-all' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Right - ID Document */}
          <div className="admin-modal-right" style={{ flex: '1', padding: '28px', background: T.BG_ALT, display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: T.TEXT3, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px' }}>Submitted Identity Document</div>
            <div style={{ flex: 1, border: `2px dashed ${T.BORDER}`, borderRadius: T.R_MD, background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', minHeight: '300px' }}>
              {user.idProofUrl ? (
                <img src={user.idProofUrl} alt="ID Proof" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ textAlign: 'center', color: T.TEXT3 }}>
                  <i className="bi bi-file-earmark-x" style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }} />
                  <p>No document submitted</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 28px', borderTop: `1px solid ${T.BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFF' }}>
          <Btn variant="ghost" onClick={onClose} disabled={loading}>Cancel</Btn>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Btn variant="danger" onClick={() => handleAction('reject')} disabled={loading}>
              <i className="bi bi-x-circle" /> {loading ? 'Processing…' : 'Reject'}
            </Btn>
            <Btn variant="success" onClick={() => handleAction('approve')} disabled={loading}>
              <i className="bi bi-check-circle" /> {loading ? 'Processing…' : 'Approve & Activate'}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

// MAIN DASHBOARD //
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [alumniData, setAlumniData] = useState([]);
  const [stats, setStats] = useState({ totalAlumni: 0, pendingCount: 0, degreesRepresented: 0, batchYears: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState({
    animations: true,
    autoRefresh: 30,
    soundEnabled: false,
    exportFormat: 'csv',
  });

  // ---- DATA SYNC ----
  const fetchData = useCallback(async () => {
    try {
      const [pRes, aRes, stRes] = await Promise.all([
        fetch(`${API_BASE_URL}/pending`),
        fetch(API_BASE_URL),
        fetch(`${API_BASE_URL}/stats`)
      ]);
      const pending = await pRes.json();
      const approved = await aRes.json();
      const statsData = stRes.ok ? await stRes.json() : null;

      setAlumniData([...(Array.isArray(pending) ? pending : []), ...(Array.isArray(approved) ? approved : [])]);

      if (statsData) {
        setStats(statsData);
      } else {
        // Fallback: compute from fetched data (less accurate but still works)
        const approvedArr = Array.isArray(approved) ? approved : [];
        const pendingArr = Array.isArray(pending) ? pending : [];
        setStats({
          totalAlumni: approvedArr.length,
          pendingCount: pendingArr.length,
          degreesRepresented: [...new Set(approvedArr.map(u => u.degree).filter(Boolean))].length,
          batchYears: [...new Set(approvedArr.map(u => u.batchYear).filter(Boolean))].length
        });
      }
      setLoading(false);
    } catch {
      showToast('Data sync failed. Check backend connection.', 'danger');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, settings.autoRefresh * 1000);
    return () => clearInterval(id);
  }, [fetchData, settings.autoRefresh]);

  const pendingQueue = useMemo(() => alumniData.filter(u => u.status === 'PENDING'), [alumniData]);
  const approvedAlumni = useMemo(() => alumniData.filter(u => !u.status || u.status !== 'PENDING'), [alumniData]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // ---- APPROVE ----
  const handleApprove = async (user, genUser, genPass) => {
    try {
      const res = await fetch(`${API_BASE_URL}/approve/${user._id || user.id}`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: genUser, password: genPass })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.details || 'Approval failed');
      }
      
      // Send approval email via EmailJS (Triggered only after successful backend approval)
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          to_name: user.fullName || user['Full Name'] || 'Alumni',
          to_email: user.email || user.Email || '',
          username: genUser,
          password: genPass,
          message: 'Your SJU Alumni Portal account has been approved and activated.',
          reply_to: 'alumni.sju.ainp@gmail.com'
        });
      } catch (emailErr) {
        console.warn('Approval email failed:', emailErr);
      }

      showToast(`${user.fullName || user['Full Name']} approved — credentials emailed.`);
      setSelectedUser(null);
      fetchData();
    } catch (err) {
      console.error('Approve error:', err);
      showToast(`Approval failed: ${err.message}`, 'danger');
    }
  };

  // ---- REJECT ----
  const handleReject = async (user) => {
    try {
      const res = await fetch(`${API_BASE_URL}/reject/${user._id || user.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Rejection failed');

      // Send rejection notification via EmailJS
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          to_name: user.fullName || user['Full Name'] || 'Alumni',
          to_email: user.email || user.Email || '',
          message: 'Unfortunately, your registration application could not be verified at this time. Please contact the alumni office for clarification.',
          username: 'N/A', // Using N/A for rejected entries
          password: 'N/A',
          reply_to: 'alumni.sju.ainp@gmail.com'
        });
      } catch (emailErr) {
        console.warn('Rejection email failed:', emailErr);
      }

      showToast(`Application for ${user.fullName || user['Full Name']} rejected.`, 'warning');
      setSelectedUser(null);
      fetchData();
    } catch (err) {
      showToast(`Rejection failed: ${err.message}`, 'danger');
    }
  };

  // ---- EXPORT ----
  const handleExport = () => {
    const rows = [
      ['Register No', 'Full Name', 'Email', 'Phone', 'Degree', 'Batch', 'Status'],
      ...approvedAlumni.map(u => [
        u.registerNumber || '', u.fullName || '', u.email || '',
        u.phoneNumber || '', u.degree || '', u.batchYear || '', u.currentStatus || ''
      ])
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `sju_alumni_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast('Alumni directory exported successfully.');
  };

  // ---- FILTERED DIRECTORY ----
  const filteredAlumni = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return approvedAlumni;
    return approvedAlumni.filter(u =>
      (u.fullName || '').toLowerCase().includes(q) ||
      (u.registerNumber || '').toLowerCase().includes(q) ||
      (u.degree || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  }, [approvedAlumni, searchQuery]);

  // ---- NAV TABS ----
  const navTabs = [
    { id: 'OVERVIEW',   label: 'Overview',          icon: 'bi-grid-1x2-fill' },
    { id: 'QUEUE',      label: `Pending (${pendingQueue.length})`, icon: 'bi-person-plus-fill' },
    { id: 'DIRECTORY',  label: 'Alumni Directory',   icon: 'bi-people-fill' },
    { id: 'ANALYTICS',  label: 'Analytics',          icon: 'bi-bar-chart-fill' },
    { id: 'EXPORT',     label: 'Export Data',        icon: 'bi-download' },
    { id: 'SETTINGS',   label: 'Settings',           icon: 'bi-gear-fill' },
  ];

  const tabTitle = navTabs.find(t => t.id === activeTab)?.label || 'Dashboard';

  // ---- PAGE RENDERERS ----
  const renderOverview = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="admin-overview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <StatCard label="Total Alumni" value={stats.totalAlumni} icon="bi-people-fill" gradient={`linear-gradient(135deg, ${T.NAVY_DARK}, ${T.NAVY_MAIN})`} />
        <StatCard label="Pending Approvals" value={stats.pendingCount} icon="bi-person-lines-fill" light={stats.pendingCount > 0} action={stats.pendingCount > 0 ? 'Review Now' : null} onAction={() => setActiveTab('QUEUE')} />
        <StatCard label="Degrees Represented" value={stats.degreesRepresented} icon="bi-mortarboard-fill" />
        <StatCard label="Batch Years" value={stats.batchYears} icon="bi-calendar-fill" />
      </div>

      {/* Quick Actions */}
      <div style={{ background: '#FFF', borderRadius: T.R_LG, padding: '24px', border: `1px solid ${T.BORDER}` }}>
        <div style={{ fontSize: '0.72rem', fontWeight: '800', color: T.TEXT3, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '18px' }}>Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
          {[
            { label: 'Review Pending', icon: 'bi-person-check', tab: 'QUEUE', color: T.NAVY_LITE },
            { label: 'Search Directory', icon: 'bi-search', tab: 'DIRECTORY', color: T.INFO },
            { label: 'Export Data', icon: 'bi-file-earmark-spreadsheet', tab: 'EXPORT', color: T.SUCCESS },
            { label: 'Settings', icon: 'bi-sliders', tab: 'SETTINGS', color: T.WARNING },
          ].map(a => (
            <button key={a.tab} onClick={() => setActiveTab(a.tab)} style={{
              padding: '18px 16px', background: T.BG_APP, border: `1px solid ${T.BORDER}`,
              borderRadius: T.R_MD, textAlign: 'center', cursor: 'pointer', transition: T.TR,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
            }}
            onMouseOver={e => e.currentTarget.style.boxShadow = T.SH_MD}
            onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <i className={`bi ${a.icon}`} style={{ fontSize: '1.8rem', color: a.color }} />
              <span style={{ fontWeight: '700', fontSize: '0.875rem', color: T.TEXT }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {pendingQueue.length > 0 && (
        <div style={{ background: '#FFF', borderRadius: T.R_LG, padding: '24px', border: `1px solid ${T.BORDER}` }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: T.TEXT3, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '18px' }}>Needs Attention</div>
          {pendingQueue.slice(0, 3).map(u => (
            <div key={u._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${T.BORDER}` }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg, ${T.NAVY_MAIN}, ${T.NAVY_LITE})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.GOLD_MAIN, fontWeight: '700' }}>
                  {(u.fullName || '?').charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: T.TEXT }}>{u.fullName || '—'}</div>
                  <div style={{ fontSize: '0.8rem', color: T.TEXT3 }}>{u.registerNumber} · {u.degree || '—'}</div>
                </div>
              </div>
              <Btn variant="primary" onClick={() => { setSelectedUser(u); setActiveTab('QUEUE'); }}>Review</Btn>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderQueue = () => (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: T.NAVY_MAIN, fontSize: '1.4rem' }}>Pending Verifications</h2>
          <p style={{ margin: '4px 0 0 0', color: T.TEXT3, fontSize: '0.85rem' }}>{pendingQueue.length} application(s) awaiting review</p>
        </div>
      </div>
      {pendingQueue.length === 0 ? (
        <div style={{ padding: '80px 40px', textAlign: 'center', background: '#FFF', borderRadius: T.R_LG, border: `1px solid ${T.BORDER}` }}>
          <i className="bi bi-check-circle-fill" style={{ fontSize: '4rem', color: T.SUCCESS, display: 'block', marginBottom: '18px' }} />
          <h3 style={{ color: T.TEXT2, marginBottom: '8px' }}>All caught up!</h3>
          <p style={{ color: T.TEXT3 }}>No pending applications at the moment.</p>
        </div>
      ) : (
        <div className="admin-table-container" style={{ background: '#FFF', borderRadius: T.R_LG, overflow: 'auto', border: `1px solid ${T.BORDER}`, boxShadow: T.SH_SM, maxHeight: '60vh' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: '900px' }}>
            <thead>
              <tr style={{ background: `linear-gradient(135deg, ${T.NAVY_DARK}, ${T.NAVY_MAIN})`, color: '#FFF', position: 'sticky', top: 0, zIndex: 10 }}>
                {['Applicant', 'Reg Number', 'Degree & Batch', 'Email', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', background: 'inherit' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pendingQueue.map((u, i) => (
                <tr key={u._id || u.id} style={{ background: i % 2 === 0 ? '#FFF' : T.BG_ALT, borderBottom: `1px solid ${T.BORDER}` }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${T.NAVY_MAIN}, ${T.NAVY_LITE})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.GOLD_MAIN, fontWeight: '700', fontSize: '0.9rem', flexShrink: 0 }}>
                        {(u.fullName || u["Full Name"] || '?').charAt(0)}
                      </div>
                      <span style={{ fontWeight: '700', color: T.TEXT }}>{u.fullName || u["Full Name"] || '—'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', color: T.TEXT2, fontSize: '0.9rem' }}>{u.registerNumber || u.regNo || '—'}</td>
                  <td style={{ padding: '14px 20px', color: T.TEXT2, fontSize: '0.9rem' }}>{u.degree || u.Degree || '—'} · {u.batchYear || u["Batch Year"] || '—'}</td>
                  <td style={{ padding: '14px 20px', color: T.TEXT2, fontSize: '0.9rem' }}>{u.email || u.Email || '—'}</td>
                  <td style={{ padding: '14px 20px' }}><Badge label="Pending" type="warning" /></td>
                  <td style={{ padding: '14px 20px' }}>
                    <Btn variant="primary" onClick={() => setSelectedUser(u)}>Review</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderDirectory = () => (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, color: T.NAVY_MAIN, fontSize: '1.4rem' }}>Alumni Directory</h2>
          <p style={{ margin: '4px 0 0 0', color: T.TEXT3, fontSize: '0.85rem' }}>{filteredAlumni.length} alumni found</p>
        </div>
        <input
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="🔍  Search by name, reg no, degree, email…"
          style={{ padding: '12px 18px', borderRadius: T.R_XL, border: `1px solid ${T.BORDER}`, fontSize: '0.9rem', minWidth: '280px', background: '#FFF', outline: 'none' }}
        />
      </div>
      <div className="admin-table-container" style={{ background: '#FFF', borderRadius: T.R_LG, overflow: 'auto', border: `1px solid ${T.BORDER}`, maxHeight: '65vh' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: '1000px' }}>
          <thead>
            <tr style={{ background: `linear-gradient(135deg, ${T.NAVY_DARK}, ${T.NAVY_MAIN})`, color: '#FFF', position: 'sticky', top: 0, zIndex: 10 }}>
                {['Name', 'Register No', 'Username', 'Password', 'Degree', 'Batch', 'Email', 'Status'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', background: 'inherit', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {filteredAlumni.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: T.TEXT3 }}>No alumni found</td></tr>
            ) : filteredAlumni.map((u, i) => (
              <tr key={u._id || i} style={{ background: i % 2 === 0 ? '#FFF' : T.BG_ALT, borderBottom: `1px solid ${T.BORDER}` }}>
                <td style={{ padding: '12px 20px', fontWeight: '700', color: T.TEXT, whiteSpace: 'nowrap' }}>{u.fullName || u["Full Name"] || '—'}</td>
                <td style={{ padding: '12px 20px', color: T.TEXT2, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{u.registerNumber || '—'}</td>
                 <td style={{ padding: '12px 20px', color: T.INFO, fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap' }}>{u.registerNumber || u.username || '—'}</td>
                 <td style={{ padding: '12px 20px', color: T.SUCCESS, fontSize: '0.9rem', fontWeight: '600', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{u.password || (u.username && u.username.length > 8 ? u.username : '—') || '—'}</td>
                
                <td style={{ padding: '12px 20px', color: T.TEXT2, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{u.degree || '—'}</td>
                <td style={{ padding: '12px 20px', color: T.TEXT2, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{u.batchYear || '—'}</td>
                <td style={{ padding: '12px 20px', color: T.TEXT2, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.email || '—'}</td>
                <td style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}><Badge label={u.currentStatus || 'Alumni'} type="info" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnalytics = () => {
    const degreeCount = {};
    const batchCount = {};
    const statusCount = {};
    approvedAlumni.forEach(u => {
      if (u.degree) degreeCount[u.degree] = (degreeCount[u.degree] || 0) + 1;
      if (u.batchYear) batchCount[u.batchYear] = (batchCount[u.batchYear] || 0) + 1;
      if (u.currentStatus) statusCount[u.currentStatus] = (statusCount[u.currentStatus] || 0) + 1;
    });

    const BarChart = ({ data, label, color }) => {
      const max = Math.max(...Object.values(data), 1);
      return (
        <div style={{ background: '#FFF', borderRadius: T.R_LG, padding: '24px', border: `1px solid ${T.BORDER}` }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: T.TEXT3, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '18px' }}>{label}</div>
          {Object.entries(data).sort((a,b) => b[1] - a[1]).slice(0, 8).map(([key, val]) => (
            <div key={key} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: '600', color: T.TEXT }}>{key}</span>
                <span style={{ color: T.TEXT3, fontWeight: '700' }}>{val}</span>
              </div>
              <div style={{ background: T.BG_APP, borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${(val / max) * 100}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 1s ease' }} />
              </div>
            </div>
          ))}
          {Object.keys(data).length === 0 && <p style={{ color: T.TEXT3, textAlign: 'center' }}>No data yet</p>}
        </div>
      );
    };

    return (
      <div>
        <h2 style={{ margin: '0 0 24px 0', color: T.NAVY_MAIN }}>Analytics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <BarChart data={degreeCount} label="Alumni by Degree" color={T.NAVY_LITE} />
          <BarChart data={batchCount} label="Alumni by Batch Year" color={T.GOLD_MAIN} />
          <BarChart data={statusCount} label="Alumni by Current Status" color={T.SUCCESS} />
        </div>
      </div>
    );
  };

  const renderExport = () => (
    <div style={{ maxWidth: '600px' }}>
      <h2 style={{ margin: '0 0 8px 0', color: T.NAVY_MAIN }}>Export Data</h2>
      <p style={{ color: T.TEXT3, marginBottom: '28px' }}>Download the full alumni directory as a CSV file.</p>
      <div style={{ background: '#FFF', borderRadius: T.R_LG, padding: '28px', border: `1px solid ${T.BORDER}`, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, background: T.BG_ALT, borderRadius: T.R_MD, padding: '20px', textAlign: 'center' }}>
            <i className="bi bi-people-fill" style={{ fontSize: '2rem', color: T.NAVY_MAIN, display: 'block', marginBottom: '8px' }} />
            <div style={{ fontSize: '2rem', fontWeight: '900', color: T.NAVY_MAIN }}>{approvedAlumni.length}</div>
            <div style={{ fontSize: '0.85rem', color: T.TEXT3 }}>Total Records</div>
          </div>
          <div style={{ flex: 1, background: T.BG_ALT, borderRadius: T.R_MD, padding: '20px', textAlign: 'center' }}>
            <i className="bi bi-file-earmark-spreadsheet" style={{ fontSize: '2rem', color: T.SUCCESS, display: 'block', marginBottom: '8px' }} />
            <div style={{ fontSize: '2rem', fontWeight: '900', color: T.SUCCESS }}>CSV</div>
            <div style={{ fontSize: '0.85rem', color: T.TEXT3 }}>Export Format</div>
          </div>
        </div>
        <div style={{ fontSize: '0.85rem', color: T.TEXT3, background: T.BG_ALT, borderRadius: T.R_SM, padding: '14px 16px' }}>
          Includes: Register No, Full Name, Email, Phone, Degree, Batch Year, Current Status
        </div>
        <Btn variant="success" onClick={handleExport} fullWidth>
          <i className="bi bi-download" /> Export Alumni Directory
        </Btn>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div style={{ maxWidth: '700px' }}>
      <h2 style={{ margin: '0 0 8px 0', color: T.NAVY_MAIN }}>Settings</h2>
      <p style={{ color: T.TEXT3, marginBottom: '24px' }}>Customize the admin dashboard behaviour.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {[
          { key: 'animations', label: 'UI Animations', desc: 'Enable transition effects', type: 'toggle' },
          { key: 'soundEnabled', label: 'Audio Feedback', desc: 'Sound on approve / reject', type: 'toggle' },
          { key: 'autoRefresh', label: 'Auto-refresh Interval', desc: 'How often data syncs from the server', type: 'select', opts: [10, 30, 60, 300], fmt: v => `${v}s` },
          { key: 'exportFormat', label: 'Default Export Format', desc: 'Format for data downloads', type: 'select', opts: ['csv', 'json'], fmt: v => v.toUpperCase() },
        ].map(s => (
          <div key={s.key} style={{ background: '#FFF', padding: '20px 24px', borderRadius: T.R_MD, border: `1px solid ${T.BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <div>
              <div style={{ fontWeight: '700', color: T.TEXT }}>{s.label}</div>
              <div style={{ fontSize: '0.82rem', color: T.TEXT3, marginTop: '2px' }}>{s.desc}</div>
            </div>
            {s.type === 'toggle' ? (
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <div style={{ position: 'relative', width: '44px', height: '24px' }}>
                  <input type="checkbox" checked={settings[s.key]} onChange={e => setSettings(p => ({ ...p, [s.key]: e.target.checked }))} style={{ opacity: 0, width: 0, height: 0 }} />
                  <div style={{ position: 'absolute', inset: 0, background: settings[s.key] ? T.SUCCESS : T.BORDER, borderRadius: '12px', transition: T.TR, cursor: 'pointer' }} onClick={() => setSettings(p => ({ ...p, [s.key]: !p[s.key] }))} />
                  <div style={{ position: 'absolute', top: '3px', left: settings[s.key] ? '23px' : '3px', width: '18px', height: '18px', background: '#FFF', borderRadius: '50%', transition: T.TR, boxShadow: '0 1px 4px rgba(0,0,0,0.3)', pointerEvents: 'none' }} />
                </div>
              </label>
            ) : (
              <select value={settings[s.key]} onChange={e => setSettings(p => ({ ...p, [s.key]: isNaN(e.target.value) ? e.target.value : Number(e.target.value) }))}
                style={{ padding: '8px 14px', borderRadius: T.R_SM, border: `1px solid ${T.BORDER}`, fontSize: '0.9rem', background: T.BG_ALT, cursor: 'pointer', outline: 'none' }}>
                {s.opts.map(o => <option key={o} value={o}>{s.fmt ? s.fmt(o) : o}</option>)}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // ---- LAYOUT ----
  return (
    <div className="admin-layout" style={{ display: 'flex', height: '100vh', width: '100%', background: T.BG_APP, fontFamily: "'Lora', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700&display=swap');
        @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css');

        .admin-layout { display: flex; flex-direction: row; }
        .admin-sidebar { width: 260px; flex-shrink: 0; }
        .admin-main { flex: 1; overflow-y: auto; }
        .admin-table-container { overflow-x: auto !important; -webkit-overflow-scrolling: touch; }

        @media (max-width: 900px) {
          .admin-layout { flex-direction: column !important; height: auto !important; min-height: 100vh; }
          .admin-sidebar {
            width: 100% !important; flex-direction: column !important; height: auto !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important;
            z-index: 50; position: relative;
          }
          .admin-sidebar nav {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            padding: 12px !important; gap: 8px !important;
            overflow: hidden !important; white-space: normal !important;
          }
          .admin-sidebar-header { padding: 16px 20px !important; border-bottom: 1px solid rgba(255,255,255,0.08) !important; border-right: none !important; }
          .admin-sidebar-footer { display: none !important; }
          .admin-sidebar nav button {
            padding: 12px !important; font-size: 0.85rem !important; flex-shrink: 0;
            border-left: none !important; border-bottom: 3px solid transparent !important;
            border-radius: 8px !important; text-align: center !important;
            display: flex !important; flex-direction: column !important; gap: 6px !important;
            justify-content: center !important; height: auto !important;
          }
          .admin-sidebar nav button i { font-size: 1.2rem !important; margin: 0 auto !important; }
          .admin-main { height: auto; min-height: 100vh; overflow-y: visible; }
        }

        @media (max-width: 600px) {
          .admin-overview-grid { grid-template-columns: 1fr 1fr !important; }
          .admin-queue-grid { grid-template-columns: 1fr !important; }
          .admin-modal { padding: 12px !important; }
          .admin-modal > div { max-width: 100% !important; max-height: 95vh !important; overflow-y: auto; }
        }

        @media (max-width: 480px) {
          .admin-overview-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>


      {/* SIDEBAR */}
      <div className="admin-sidebar" style={{ width: '260px', flexShrink: 0, background: `linear-gradient(180deg, ${T.NAVY_DARK} 0%, ${T.NAVY_MAIN} 100%)`, color: '#FFF', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 20px rgba(0,0,0,0.15)' }}>
        <div className="admin-sidebar-header" style={{ padding: '28px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: T.GOLD_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: T.NAVY_DARK, fontSize: '1rem' }}>S</div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1rem', color: T.GOLD_MAIN }}>SJU Admin</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '1px' }}>PORTAL MANAGEMENT</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {navTabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '13px 16px', textAlign: 'left', border: 'none', borderRadius: T.R_MD, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', fontWeight: activeTab === tab.id ? '700' : '500',
              background: activeTab === tab.id ? 'rgba(212,175,55,0.15)' : 'transparent',
              color: activeTab === tab.id ? T.GOLD_MAIN : 'rgba(255,255,255,0.6)',
              borderLeft: activeTab === tab.id ? `3px solid ${T.GOLD_MAIN}` : '3px solid transparent',
              transition: T.TR, fontFamily: 'inherit'
            }}>
              <i className={`bi ${tab.icon}`} style={{ fontSize: '1rem', flexShrink: 0 }} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer" style={{ padding: '16px 22px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
          St. Joseph's University · Admin Portal
        </div>
      </div>

      {/* MAIN */}
      <div className="admin-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* TOPBAR */}
        <header className="admin-topbar" style={{ background: '#FFF', borderBottom: `1px solid ${T.BORDER}`, padding: '0 32px', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: T.NAVY_MAIN }}>{tabTitle}</h2>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {pendingQueue.length > 0 && (
              <button onClick={() => setActiveTab('QUEUE')} style={{ padding: '8px 16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: T.R_XL, color: '#D97706', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="bi bi-bell-fill" />
                {pendingQueue.length} Pending
              </button>
            )}
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg, ${T.NAVY_MAIN}, ${T.NAVY_LITE})`, color: T.GOLD_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem' }}>AD</div>
          </div>
        </header>

        {/* WORKSPACE */}
        <main className="admin-workspace" style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px', color: T.TEXT3 }}>
              <div style={{ width: '50px', height: '50px', border: `4px solid ${T.BORDER}`, borderTopColor: T.NAVY_MAIN, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontWeight: '600' }}>Loading dashboard data…</p>
            </div>
          ) : (
            <>
              {activeTab === 'OVERVIEW'   && renderOverview()}
              {activeTab === 'QUEUE'      && renderQueue()}
              {activeTab === 'DIRECTORY'  && renderDirectory()}
              {activeTab === 'ANALYTICS'  && renderAnalytics()}
              {activeTab === 'EXPORT'     && renderExport()}
              {activeTab === 'SETTINGS'   && renderSettings()}
            </>
          )}
        </main>
      </div>

      {/* MODALS */}
      {selectedUser && <ReviewModal user={selectedUser} onClose={() => setSelectedUser(null)} onApprove={handleApprove} onReject={handleReject} />}

      {/* TOAST */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
          padding: '14px 22px', borderRadius: T.R_MD, fontWeight: '700', fontSize: '0.9rem',
          background: toast.type === 'danger' ? T.DANGER : toast.type === 'warning' ? T.WARNING : T.SUCCESS,
          color: '#FFF', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', animation: 'slideUp 0.3s ease',
          maxWidth: '380px', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <i className={`bi ${toast.type === 'danger' ? 'bi-x-circle-fill' : toast.type === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'}`} />
          {toast.message}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        .admin-workspace::-webkit-scrollbar { width: 6px; }
        .admin-workspace::-webkit-scrollbar-thumb { background: ${T.BORDER}; border-radius: 4px; }

        @media (max-width: 992px) {
          .admin-layout { flex-direction: column !important; }
          .admin-sidebar { width: 100% !important; height: auto !important; }
          .admin-sidebar nav { flex-direction: row !important; flex-wrap: wrap !important; }
          .admin-sidebar nav button { flex: 1 1 40%; padding: 10px 8px !important; font-size: 0.8rem !important; }
          .admin-topbar { padding: 12px 16px !important; height: auto !important; }
          .admin-workspace { padding: 16px !important; }
          .admin-modal-body { flex-direction: column !important; overflow-y: auto !important; }
          .admin-modal-left { border-right: none !important; border-bottom: 1px solid ${T.BORDER} !important; }
          .admin-table-container { overflow-x: auto !important; -webkit-overflow-scrolling: touch; }
          .admin-overview-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .admin-overview-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
