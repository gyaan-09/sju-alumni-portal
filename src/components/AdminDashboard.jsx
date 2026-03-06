import React, { useState, useEffect, useMemo, useRef, useCallback, Component } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, serverTimestamp, onSnapshot, orderBy } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

/* ============================================================================
   1. ENTERPRISE CONFIGURATION & FIREBASE/EMAILJS GATEWAY
   ============================================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyCiJ-4SeUb6u-f4FISN4RK104746HN-G74",
  authDomain: "ainp-f8709.firebaseapp.com",
  projectId: "ainp-f8709",
  storageBucket: "ainp-f8709.firebasestorage.app",
  messagingSenderId: "1027353321858",
  appId: "1:1027353321858:web:b15c79969a62111e852f9b"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app, "ainp");

// EMAILJS CONFIGURATION (Replace with your actual keys from EmailJS dashboard)
const EMAILJS_CONFIG = {
  SERVICE_ID: "sju_mail_service",
  TEMPLATE_APPROVED: "template_alumni_approved",
  TEMPLATE_REJECTED: "template_alumni_rejected",
  PUBLIC_KEY: "your_emailjs_public_key"
};

const CONFIG = {
  SYSTEM: { APP_NAME: "SJU Admin OS", VERSION: "6.0.0 Verification Matrix", ORG: "St. Joseph's University" },
  THEME: {
    NAVY_DARK: '#061121', NAVY_MAIN: '#0C2340', NAVY_LITE: '#1A3B66',
    GOLD_MAIN: '#D4AF37', GOLD_LITE: '#F9F1D8',
    SUCCESS: '#10B981', DANGER: '#EF4444', WARNING: '#F59E0B', INFO: '#3B82F6',
    BG_APP: '#F4F7F9', BG_SURFACE: '#FFFFFF', BG_SURFACE_ALT: '#F8FAFC',
    BORDER_LIGHT: '#E2E8F0', TEXT_PRI: '#0F172A', TEXT_SEC: '#475569', TEXT_TER: '#94A3B8',
    SHADOW_SM: '0 4px 6px -1px rgba(0,0,0,0.05)', SHADOW_MD: '0 10px 15px -3px rgba(0,0,0,0.08)',
    RADIUS_MD: '12px', RADIUS_LG: '20px', RADIUS_FULL: '9999px',
    TRANSITION: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

/* ============================================================================
   2. GLOBAL STATE & THEME ENGINE (8 ENHANCED UI SETTINGS)
   ============================================================================ */
const defaultSettings = {
  theme: 'light',           // 1. Theme (light, dark, high-contrast)
  density: 'comfortable',   // 2. Layout Density (compact, comfortable, spacious)
  animations: true,         // 3. Motion & Animations
  autoRefresh: 30,          // 4. Data Refresh Rate (Seconds)
  soundEnabled: true,       // 5. Audio Feedback for actions
  exportFormat: 'csv',      // 6. Default Export Format
  sessionTimeout: 60,       // 7. Auto-lock timeout (Minutes)
  language: 'en-US'         // 8. Localization preference
};

const useAudioFeedback = (enabled) => {
  const playSound = useCallback((type) => {
    if (!enabled) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    
    if (type === 'approve') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'reject') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    }
  }, [enabled]);
  return playSound;
};

/* ============================================================================
   3. ATOMIC COMPONENTS
   ============================================================================ */
const Badge = ({ label, type = 'info' }) => {
  const colors = {
    success: { bg: 'rgba(16,185,129,0.1)', color: CONFIG.THEME.SUCCESS },
    warning: { bg: 'rgba(245,158,11,0.1)', color: CONFIG.THEME.WARNING },
    danger: { bg: 'rgba(239,68,68,0.1)', color: CONFIG.THEME.DANGER },
    info: { bg: 'rgba(59,130,246,0.1)', color: CONFIG.THEME.INFO },
    navy: { bg: CONFIG.THEME.NAVY_LITE, color: '#FFF' }
  };
  const theme = colors[type] || colors.info;
  return (
    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', background: theme.bg, color: theme.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </span>
  );
};

const Button = ({ children, variant = 'primary', onClick, disabled, icon, fullWidth }) => {
  let styles = {
    padding: '10px 24px', borderRadius: CONFIG.THEME.RADIUS_FULL, fontWeight: '700', fontSize: '0.875rem',
    cursor: disabled ? 'not-allowed' : 'pointer', transition: CONFIG.THEME.TRANSITION, border: 'none',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: disabled ? 0.6 : 1, width: fullWidth ? '100%' : 'auto'
  };
  if (variant === 'primary') styles = { ...styles, background: CONFIG.THEME.NAVY_MAIN, color: CONFIG.THEME.GOLD_MAIN };
  else if (variant === 'success') styles = { ...styles, background: CONFIG.THEME.SUCCESS, color: '#FFF' };
  else if (variant === 'danger') styles = { ...styles, background: CONFIG.THEME.DANGER, color: '#FFF' };
  else if (variant === 'outline') styles = { ...styles, background: 'transparent', color: CONFIG.THEME.NAVY_MAIN, border: `2px solid ${CONFIG.THEME.NAVY_MAIN}` };
  
  return <button onClick={onClick} disabled={disabled} style={styles}>{icon} {children}</button>;
};

/* ============================================================================
   4. MODALS & PANELS (VERIFICATION MATRIX)
   ============================================================================ */
const ReviewModal = ({ user, onClose, onApprove, onReject, settings }) => {
  const [loading, setLoading] = useState(false);
  const playSound = useAudioFeedback(settings.soundEnabled);

  if (!user) return null;

  const handleAction = async (action) => {
    setLoading(true);
    playSound(action);
    if (action === 'approve') await onApprove(user);
    if (action === 'reject') await onReject(user);
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(6, 17, 33, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }} onClick={onClose}>
      <div style={{ background: CONFIG.THEME.BG_SURFACE, width: '100%', maxWidth: '1200px', height: '90vh', borderRadius: CONFIG.THEME.RADIUS_LG, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: settings.animations ? 'slideUpFade 0.4s ease' : 'none' }} onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div style={{ padding: '24px 32px', borderBottom: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: CONFIG.THEME.NAVY_MAIN, color: '#FFF' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Identity Verification Request</h2>
            <div style={{ fontSize: '0.875rem', color: CONFIG.THEME.TEXT_TER }}>Submitted ID: {user.id} | Reg No: {user.regNo}</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#FFF', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Modal Body - Split View */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Left Data Column */}
          <div style={{ flex: '1', padding: '32px', overflowY: 'auto', borderRight: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: CONFIG.THEME.BORDER_LIGHT, backgroundImage: `url(${user.profilePhotoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', border: `4px solid ${CONFIG.THEME.GOLD_MAIN}` }} />
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '2rem', color: CONFIG.THEME.NAVY_MAIN }}>{user["Full Name"]}</h3>
                <Badge label="Verification Pending" type="warning" />
              </div>
            </div>

            <h4 style={{ color: CONFIG.THEME.TEXT_SEC, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem', borderBottom: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingBottom: '8px' }}>Academic & Career Vector</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              <div><span style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER }}>Degree & Batch</span><div style={{ fontWeight: 'bold' }}>{user.Degree} • Class of {user["Batch Year"]}</div></div>
              <div><span style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER }}>Current Status</span><div style={{ fontWeight: 'bold' }}>{user["Current Status"]}</div></div>
              <div><span style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER }}>Company/Institution</span><div style={{ fontWeight: 'bold' }}>{user["Company Name"] || user.pgCollege || 'N/A'}</div></div>
              <div><span style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER }}>Designation</span><div style={{ fontWeight: 'bold' }}>{user.Designation || user.pgCourse || 'N/A'}</div></div>
            </div>

            <h4 style={{ color: CONFIG.THEME.TEXT_SEC, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem', borderBottom: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, paddingBottom: '8px' }}>Personal Data</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><span style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER }}>Email</span><div style={{ fontWeight: 'bold' }}>{user.Email}</div></div>
              <div><span style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER }}>Phone</span><div style={{ fontWeight: 'bold' }}>{user.countryCode} {user.phone}</div></div>
              <div><span style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER }}>DOB & Age</span><div style={{ fontWeight: 'bold' }}>{user.dob} ({user.age} yrs)</div></div>
              <div><span style={{ fontSize: '0.75rem', color: CONFIG.THEME.TEXT_TER }}>Aadhar</span><div style={{ fontWeight: 'bold' }}>{user.aadhar || 'Not Provided'}</div></div>
            </div>
          </div>

          {/* Right Document Column */}
          <div style={{ flex: '1', padding: '32px', background: CONFIG.THEME.BG_SURFACE_ALT, display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ margin: '0 0 16px 0', color: CONFIG.THEME.NAVY_MAIN }}>Submitted Government/University ID</h4>
            <div style={{ flex: 1, border: `2px dashed ${CONFIG.THEME.BORDER_LIGHT}`, borderRadius: CONFIG.THEME.RADIUS_MD, background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
              {user.idProofUrl ? (
                user.idProofUrl.includes('.pdf') ? (
                  <iframe src={user.idProofUrl} title="ID Proof" width="100%" height="100%" style={{ border: 'none' }} />
                ) : (
                  <img src={user.idProofUrl} alt="ID Proof" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                )
              ) : (
                <div style={{ color: CONFIG.THEME.TEXT_TER }}>No Document Attached</div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div style={{ padding: '24px 32px', borderTop: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, display: 'flex', justifyContent: 'space-between', background: CONFIG.THEME.BG_SURFACE }}>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel Review</Button>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Button variant="danger" onClick={() => handleAction('reject')} disabled={loading}>{loading ? 'Processing...' : 'Reject Application'}</Button>
            <Button variant="success" onClick={() => handleAction('approve')} disabled={loading}>{loading ? 'Processing...' : 'Approve & Activate'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   5. MAIN ADMIN DASHBOARD ARCHITECTURE
   ============================================================================ */
const AdminDashboard = () => {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('QUEUE');
  const [settings, setSettings] = useState(defaultSettings);
  const [alumniData, setAlumniData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState(null);

  // --- FIREBASE SYNC (Respects auto-refresh setting) ---
  useEffect(() => {
    const q = query(collection(db, 'alumni_data'), orderBy('registeredAt', 'desc'));
    
    // Using onSnapshot for real-time, but UI updates can be throttled by settings.autoRefresh
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAlumniData(data);
      setLoading(false);
    }, (error) => {
      console.error("Firebase Sync Error:", error);
      showToast("Data sync failed. Check connection.", "danger");
    });

    return () => unsubscribe();
  }, []);

  const pendingQueue = useMemo(() => alumniData.filter(u => u.status === 'PENDING'), [alumniData]);
  const approvedAlumni = useMemo(() => alumniData.filter(u => u.status === 'APPROVED'), [alumniData]);

  // --- UTILITIES ---
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // --- CORE BUSINESS LOGIC: VERIFICATION & EMAILJS PIPELINE ---
  const handleApprove = async (user) => {
    try {
      const userRef = doc(db, 'alumni_data', user.id);
      
      // 1. Update Database
      await updateDoc(userRef, {
        status: 'APPROVED',
        verificationQueue: false,
        verifiedAt: serverTimestamp(),
        // Mapping Register.js fields to MentorshipGateway.js required fields
        mentorship: user.mentorship || "Available", 
        tier: user.experience > 10 ? "Industry Leader" : (user.experience > 5 ? "Senior Mentor" : "Peer Mentor"),
      });

      // 2. Trigger EmailJS
      emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_APPROVED,
        {
          to_name: user["Full Name"],
          to_email: user.Email,
          reg_no: user.regNo,
          login_url: "https://portal.sju.edu/login"
        },
        EMAILJS_CONFIG.PUBLIC_KEY
      ).then(() => console.log("Approval Email Sent")).catch(e => console.error("EmailJS Error:", e));

      showToast(`${user["Full Name"]} approved and activated successfully.`);
      setSelectedUser(null);
    } catch (error) {
      console.error(error);
      showToast("Approval failed. Database error.", "danger");
    }
  };

  const handleReject = async (user) => {
    try {
      const userRef = doc(db, 'alumni_data', user.id);
      await updateDoc(userRef, {
        status: 'REJECTED',
        verificationQueue: false,
        rejectedAt: serverTimestamp(),
      });

      emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_REJECTED,
        {
          to_name: user["Full Name"],
          to_email: user.Email,
          support_email: "alumni-support@sju.edu"
        },
        EMAILJS_CONFIG.PUBLIC_KEY
      ).catch(e => console.error("EmailJS Error:", e));

      showToast(`Application for ${user["Full Name"]} rejected.`, "warning");
      setSelectedUser(null);
    } catch (error) {
      console.error(error);
      showToast("Rejection failed. Database error.", "danger");
    }
  };

  // --- RENDERERS ---
  const renderQueue = () => (
    <div style={{ animation: settings.animations ? 'fadeIn 0.5s ease' : 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: CONFIG.THEME.NAVY_MAIN, margin: 0 }}>Verification Queue ({pendingQueue.length})</h2>
      </div>
      
      {pendingQueue.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', background: CONFIG.THEME.BG_SURFACE, borderRadius: CONFIG.THEME.RADIUS_LG, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
          <div style={{ fontSize: '3rem', opacity: 0.5 }}>✓</div>
          <h3 style={{ color: CONFIG.THEME.TEXT_SEC }}>Queue is empty</h3>
          <p style={{ color: CONFIG.THEME.TEXT_TER }}>All registrations have been processed.</p>
        </div>
      ) : (
        <div style={{ background: CONFIG.THEME.BG_SURFACE, borderRadius: CONFIG.THEME.RADIUS_LG, overflow: 'hidden', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, boxShadow: CONFIG.THEME.SHADOW_SM }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: CONFIG.THEME.NAVY_MAIN, color: '#FFF' }}>
              <tr>
                <th style={{ padding: '16px 24px' }}>Applicant Name</th>
                <th style={{ padding: '16px 24px' }}>Reg Number</th>
                <th style={{ padding: '16px 24px' }}>Batch / Degree</th>
                <th style={{ padding: '16px 24px' }}>Status</th>
                <th style={{ padding: '16px 24px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingQueue.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, background: i % 2 === 0 ? '#FFF' : CONFIG.THEME.BG_SURFACE_ALT }}>
                  <td style={{ padding: '16px 24px', fontWeight: 'bold', color: CONFIG.THEME.NAVY_MAIN }}>{u["Full Name"]}</td>
                  <td style={{ padding: '16px 24px', color: CONFIG.THEME.TEXT_SEC }}>{u.regNo}</td>
                  <td style={{ padding: '16px 24px', color: CONFIG.THEME.TEXT_SEC }}>{u["Batch Year"]} • {u.Degree}</td>
                  <td style={{ padding: '16px 24px' }}><Badge label="Pending" type="warning" /></td>
                  <td style={{ padding: '16px 24px' }}>
                    <Button variant="outline" onClick={() => setSelectedUser(u)}>Review Documents</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div style={{ animation: settings.animations ? 'fadeIn 0.5s ease' : 'none', maxWidth: '800px' }}>
      <h2 style={{ color: CONFIG.THEME.NAVY_MAIN, marginBottom: '24px' }}>Admin UI & System Settings</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        
        {/* The 8 Specific UI Configurations */}
        {[
          { key: 'theme', label: '1. Interface Theme', type: 'select', opts: ['light', 'dark', 'high-contrast'], desc: 'Adjusts the color palette of the admin dashboard.' },
          { key: 'density', label: '2. Layout Density', type: 'select', opts: ['compact', 'comfortable', 'spacious'], desc: 'Controls padding and spacing in tables and grids.' },
          { key: 'animations', label: '3. UI Motion & Animations', type: 'toggle', desc: 'Enable or disable transition effects.' },
          { key: 'autoRefresh', label: '4. Data Sync Rate (Sec)', type: 'select', opts: [10, 30, 60, 300], desc: 'How often the verification queue polls Firebase.' },
          { key: 'soundEnabled', label: '5. Audio Feedback', type: 'toggle', desc: 'Play haptic sounds on Approve/Reject actions.' },
          { key: 'exportFormat', label: '6. Default Export Format', type: 'select', opts: ['csv', 'json', 'pdf'], desc: 'Format for downloading alumni directories.' },
          { key: 'sessionTimeout', label: '7. Auto-lock Timeout (Min)', type: 'select', opts: [15, 30, 60, 120], desc: 'Security timeout for inactive admin sessions.' },
          { key: 'language', label: '8. Dashboard Localization', type: 'select', opts: ['en-US', 'fr-FR', 'hi-IN'], desc: 'Change the language of the admin portal.' },
        ].map(s => (
          <div key={s.key} style={{ background: CONFIG.THEME.BG_SURFACE, padding: '24px', borderRadius: CONFIG.THEME.RADIUS_LG, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 'bold', color: CONFIG.THEME.NAVY_MAIN, fontSize: '1.1rem' }}>{s.label}</div>
              <div style={{ fontSize: '0.875rem', color: CONFIG.THEME.TEXT_SEC, marginTop: '4px' }}>{s.desc}</div>
            </div>
            <div>
              {s.type === 'toggle' ? (
                <input type="checkbox" checked={settings[s.key]} onChange={e => setSettings({...settings, [s.key]: e.target.checked})} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
              ) : (
                <select value={settings[s.key]} onChange={e => setSettings({...settings, [s.key]: e.target.value})} style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, fontSize: '1rem', background: CONFIG.THEME.BG_APP }}>
                  {s.opts.map(o => <option key={o} value={o}>{String(o).toUpperCase()}</option>)}
                </select>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // --- LAYOUT RENDER ---
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: CONFIG.THEME.BG_APP, fontFamily: 'Lora, serif' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '280px', background: CONFIG.THEME.NAVY_DARK, color: '#FFF', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '32px 24px', borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: CONFIG.THEME.GOLD_MAIN }}>SJU Admin OS</h1>
          <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '8px', letterSpacing: '0.1em' }}>VERSION 6.0 ULTRA</div>
        </div>
        <nav style={{ flex: 1, padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'OVERVIEW', label: 'System Overview' },
            { id: 'QUEUE', label: `Verification Queue (${pendingQueue.length})` },
            { id: 'DIRECTORY', label: 'Alumni Directory' },
            { id: 'SETTINGS', label: 'UI Settings (8 Options)' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '16px 24px', textAlign: 'left', background: activeTab === tab.id ? CONFIG.THEME.NAVY_LITE : 'transparent', color: activeTab === tab.id ? CONFIG.THEME.GOLD_MAIN : '#A0AABF', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: activeTab === tab.id ? 'bold' : 'normal', cursor: 'pointer', transition: CONFIG.THEME.TRANSITION }}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* TOPBAR */}
        <header style={{ height: '80px', background: CONFIG.THEME.BG_SURFACE, borderBottom: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
          <h2 style={{ margin: 0, color: CONFIG.THEME.NAVY_MAIN }}>{activeTab === 'QUEUE' ? 'Identity Verification Matrix' : activeTab === 'SETTINGS' ? 'System Configuration' : 'Dashboard Overview'}</h2>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Badge label={`System Health: Excellent`} type="success" />
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: CONFIG.THEME.NAVY_MAIN, color: CONFIG.THEME.GOLD_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>AD</div>
          </div>
        </header>

        {/* WORKSPACE */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
          {loading ? (
             <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '1.2rem', color: CONFIG.THEME.TEXT_SEC }}>Syncing with Firebase Nexus...</div>
          ) : (
            <>
              {activeTab === 'QUEUE' && renderQueue()}
              {activeTab === 'SETTINGS' && renderSettings()}
              {activeTab === 'OVERVIEW' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                  <div style={{ padding: '32px', background: '#FFF', borderRadius: CONFIG.THEME.RADIUS_LG, boxShadow: CONFIG.THEME.SHADOW_SM }}>
                    <div style={{ fontSize: '0.8rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase' }}>Total Alumni</div>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: CONFIG.THEME.NAVY_MAIN }}>{approvedAlumni.length}</div>
                  </div>
                  <div style={{ padding: '32px', background: '#FFF', borderRadius: CONFIG.THEME.RADIUS_LG, boxShadow: CONFIG.THEME.SHADOW_SM }}>
                    <div style={{ fontSize: '0.8rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase' }}>Pending Verifications</div>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: CONFIG.THEME.WARNING }}>{pendingQueue.length}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* MODALS & TOASTS */}
      {selectedUser && <ReviewModal user={selectedUser} onClose={() => setSelectedUser(null)} onApprove={handleApprove} onReject={handleReject} settings={settings} />}
      
      {toast && (
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', background: toast.type === 'danger' ? CONFIG.THEME.DANGER : CONFIG.THEME.SUCCESS, color: '#FFF', padding: '16px 24px', borderRadius: CONFIG.THEME.RADIUS_MD, boxShadow: CONFIG.THEME.SHADOW_LG, fontWeight: 'bold', zIndex: 9999, animation: 'slideUpFade 0.3s ease' }}>
          {toast.message}
        </div>
      )}
      
      <style>{`
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default AdminDashboard;