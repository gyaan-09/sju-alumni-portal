import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { db } from '../firebase'; 
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

const CONFIG = {
  DB_KEY: 'sju_titanium_ent_v31_navygold',
  SETTINGS_KEY: 'sju_admin_settings_v3',
  LOGS_KEY: 'sju_admin_logs_v2',
  APP_NAME: "SJU Alumni OS",
  VERSION: "2026.4.0 - Enterprise Ultra",
};

const EMAIL_GATEWAY = {
  serviceId: "service_gyaan",
  templateId: "template_1jmzaa9",
  publicKey: "MgWnLyUUS3faeP6W5",
};

const THEME = {
  colors: {
    navy: "#02112b",
    navyDark: "#010a1a",
    navyLight: "#0f254e",
    gold: "#D4AF37",
    goldLight: "#f9f1d8",
    bg: "#f4f7f9",
    surface: "#ffffff",
    surfaceAlt: "#f8fafc",
    textMain: "#0f172a",
    textMuted: "#64748b",
    border: "#e2e8f0",
    borderFocus: "#94a3b8",
    success: "#10b981",
    successBg: "rgba(16, 185, 129, 0.1)",
    danger: "#ef4444",
    dangerBg: "rgba(239, 68, 68, 0.1)",
    warning: "#f59e0b",
    warningBg: "rgba(245, 158, 11, 0.1)",
    info: "#0ea5e9",
    infoBg: "rgba(14, 165, 233, 0.1)"
  },
  fonts: { 
    main: "'Lora', serif" 
  },
  shadows: { 
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    card: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)", 
    dropdown: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
    glow: "0 0 15px rgba(212, 175, 55, 0.3)"
  },
  radius: {
    sm: "6px", md: "12px", lg: "16px", xl: "24px", full: "9999px"
  }
};

const generateCredentials = (name = "Alumni") => {
  const cleanName = name.split(" ")[0].toLowerCase().replace(/[^a-z]/g, '');
  const username = `sju_${cleanName}_${Math.floor(Math.random() * 9000 + 1000)}`;
  const password = Math.random().toString(36).slice(-8) + "!";
  return { username, password };
};

const logAction = (action, details, user = "System Root") => {
  const logs = JSON.parse(localStorage.getItem(CONFIG.LOGS_KEY) || "[]");
  logs.unshift({ id: Date.now(), time: new Date().toISOString(), action, details, user });
  localStorage.setItem(CONFIG.LOGS_KEY, JSON.stringify(logs.slice(0, 1000)));
};

export default function EnterpriseAdmin() {
  const [activeTab, setActiveTab] = useState("DASHBOARD");
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({ 
    adminEmail: "admin@sju.edu.in", 
    registrationsOpen: true, 
    autoApprove: false,
    requireIdVerification: true,
    maintenanceMode: false,
    firebaseProjectFolder: "alumni_portal_prod",
    twoFactorAuth: true,
    dataRetentionDays: 365
  });
  const [logs, setLogs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [selectedQueueId, setSelectedQueueId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Core Data Synchronization (Firebase Real-time)
  useEffect(() => {
    // FIXED: Mapped to "alumni-data" exactly as written in your Register.jsx
    const alumniRef = collection(db, 'alumni-data');
    
    const unsubscribe = onSnapshot(alumniRef, (snapshot) => {
      const firestoreUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort to show newest first
      setUsers(firestoreUsers.sort((a, b) => (b.registeredAt?.seconds || 0) - (a.registeredAt?.seconds || 0)));
    });

    const savedLogs = JSON.parse(localStorage.getItem(CONFIG.LOGS_KEY) || "[]");
    setLogs(savedLogs);

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem(CONFIG.SETTINGS_KEY));
    if (s) setSettings(s);
  }, []);

  const showToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const handleApprove = async (applicant) => {
    const applicantName = applicant["Full Name"] || applicant.fullName || applicant.Name || 'Applicant';
    const applicantEmail = applicant.Email || applicant.email;

    if (!window.confirm(`AUTHORIZATION REQUIRED\n\nGrant official network access and generate credentials for ${applicantName}?`)) return;
    
    showToast("Authenticating & Generating secure credentials...", "info");
    const { username, password } = generateCredentials(applicantName);

    try {
      const userDocRef = doc(db, "alumni-data", applicant.id);
      await updateDoc(userDocRef, {
        status: "APPROVED",
        username: username,
        password: password, 
        approvedAt: new Date().toISOString()
      });

      logAction("IDENTITY_VERIFIED", `System approved network access for ${applicantName}`);
      setLogs(JSON.parse(localStorage.getItem(CONFIG.LOGS_KEY) || "[]"));
      showToast(`Success! Account approved. Email dispatching...`, "success");
      setSelectedQueueId(null);
      
    } catch (dbError) {
      console.error("Database Update Error:", dbError);
      showToast(`Database transaction failed. Check Firebase rules.`, "error");
      return; 
    }

    // EmailJS Dispatch
    try {
      if (applicantEmail) {
        const emailParams = {
          to_name: applicantName,
          to_email: applicantEmail,
          message: "Your St. Joseph's University Alumni identity has been successfully verified. Welcome to the exclusive global directory.",
          reply_to: settings.adminEmail,
          account_credentials: `Username: ${username}\nPassword: ${password}`
        };
        await emailjs.send(EMAIL_GATEWAY.serviceId, EMAIL_GATEWAY.templateId, emailParams, EMAIL_GATEWAY.publicKey);
        logAction("CREDENTIALS_DISPATCHED", `Encrypted payload sent to ${applicantEmail}`);
      }
    } catch (emailError) {
      console.error("Email failed:", emailError);
      showToast(`Warning: User approved, but gateway failed to deliver email.`, "warning");
    }
  };

  const handleReject = async (applicant) => {
    const applicantName = applicant["Full Name"] || applicant.fullName || applicant.Name || 'Applicant';
    
    if (!window.confirm(`CRITICAL WARNING\n\nPermanently reject and purge all records for ${applicantName}? This action is irreversible.`)) return;
    
    try {
      await deleteDoc(doc(db, "alumni-data", applicant.id));
      logAction("RECORD_PURGED", `Application rejected and wiped for ${applicantName}.`);
      setLogs(JSON.parse(localStorage.getItem(CONFIG.LOGS_KEY) || "[]"));
      showToast(`Record permanently wiped from database.`, "error");
      setSelectedQueueId(null);
    } catch (error) {
      console.error("Error deleting document: ", error);
      showToast("Purge protocol failed.", "error");
    }
  };

  // --- SUB-COMPONENTS ---
  const ToggleSwitch = ({ checked, onChange }) => (
    <div onClick={onChange} style={{ width: 44, height: 24, background: checked ? THEME.colors.success : THEME.colors.borderFocus, borderRadius: 20, position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
      <div style={{ width: 18, height: 18, background: 'white', borderRadius: '50%', position: 'absolute', top: 3, left: checked ? 23 : 3, transition: 'left 0.3s', boxShadow: THEME.shadows.sm }}></div>
    </div>
  );

  const StatCard = ({ title, value, icon, color, bg }) => (
    <div style={{ background: THEME.colors.surface, padding: '24px', borderRadius: THEME.radius.xl, border: `1px solid ${THEME.colors.border}`, boxShadow: THEME.shadows.card, display: 'flex', alignItems: 'center', gap: 20, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: color }}></div>
      <div style={{ width: '60px', height: '60px', borderRadius: THEME.radius.lg, background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: THEME.colors.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: '2.2rem', fontWeight: 700, color: THEME.colors.navy, lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  );

  // --- VIEWS ---
  const renderDashboard = () => (
    <div className="module-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 32, height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ color: THEME.colors.navy, margin: 0, fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Command Center</h1>
          <p style={{ color: THEME.colors.textMuted, margin: '8px 0 0 0', fontSize: '1.1rem' }}>Enterprise overview of the SJU Alumni Data Ecosystem.</p>
        </div>
        <div style={{ background: THEME.colors.surface, padding: '12px 24px', borderRadius: THEME.radius.full, border: `1px solid ${THEME.colors.border}`, display: 'flex', alignItems: 'center', gap: 12, boxShadow: THEME.shadows.sm }}>
          <div className="pulse-dot" style={{ width: 10, height: 10, borderRadius: '50%', background: THEME.colors.success }}></div>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: THEME.colors.textMain, letterSpacing: '0.05em', textTransform: 'uppercase' }}>All Systems Nominal</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
        <StatCard title="Total Network" value={users.length} icon="🌐" color={THEME.colors.info} bg={THEME.colors.infoBg} />
        <StatCard title="Pending Review" value={users.filter(u => u.status === "PENDING" || !u.status).length} icon="🛡️" color={THEME.colors.warning} bg={THEME.colors.warningBg} />
        <StatCard title="Verified Directory" value={users.filter(u => u.status === "APPROVED").length} icon="✓" color={THEME.colors.success} bg={THEME.colors.successBg} />
        <StatCard title="Live Server" value="99.9%" icon="⚡" color={THEME.colors.gold} bg={THEME.colors.goldLight} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, flex: 1, minHeight: 0 }}>
        {/* Network Trajectory Mock Chart */}
        <div style={{ background: THEME.colors.surface, borderRadius: THEME.radius.xl, border: `1px solid ${THEME.colors.border}`, padding: 32, display: 'flex', flexDirection: 'column', boxShadow: THEME.shadows.card }}>
          <h3 style={{ margin: '0 0 24px 0', color: THEME.colors.navy, fontSize: '1.25rem' }}>Network Growth Trajectory (7 Days)</h3>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 16, paddingBottom: 20, borderBottom: `1px solid ${THEME.colors.border}`, position: 'relative' }}>
            {/* Chart Grid Lines */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 0, opacity: 0.5 }}>
              {[1,2,3,4].map(i => <div key={i} style={{ borderBottom: `1px dashed ${THEME.colors.borderFocus}`, width: '100%' }}></div>)}
            </div>
            {/* Chart Bars */}
            {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, zIndex: 1, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', maxWidth: '60px', height: `${h}%`, background: `linear-gradient(180deg, ${THEME.colors.navy} 0%, ${THEME.colors.navyLight} 100%)`, borderRadius: '8px 8px 0 0', transition: 'height 0.8s cubic-bezier(0.16, 1, 0.3, 1)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: THEME.colors.gold }}></div>
                </div>
                <span style={{ fontSize: '0.85rem', color: THEME.colors.textMuted, fontWeight: 600 }}>Day {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Logs */}
        <div style={{ background: THEME.colors.surface, borderRadius: THEME.radius.xl, border: `1px solid ${THEME.colors.border}`, padding: 32, display: 'flex', flexDirection: 'column', boxShadow: THEME.shadows.card, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ margin: 0, color: THEME.colors.navy, fontSize: '1.25rem' }}>System Audit Logs</h3>
            <span style={{ fontSize: '0.8rem', color: THEME.colors.textMuted, background: THEME.colors.bg, padding: '4px 8px', borderRadius: 6 }}>Live</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20, paddingRight: 10 }}>
            {logs.slice(0, 15).map(log => (
              <div key={log.id} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: log.action.includes('REJECT') ? THEME.colors.danger : THEME.colors.gold, marginTop: 6, flexShrink: 0, boxShadow: `0 0 8px ${log.action.includes('REJECT') ? THEME.colors.danger : THEME.colors.gold}80` }}></div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: THEME.colors.textMain }}>{log.action.replace(/_/g, ' ')}</div>
                  <div style={{ fontSize: '0.85rem', color: THEME.colors.textMuted, marginTop: 4, lineHeight: 1.4 }}>{log.details}</div>
                  <div style={{ fontSize: '0.75rem', color: THEME.colors.borderFocus, marginTop: 6, fontWeight: 600 }}>{new Date(log.time).toLocaleString()} • {log.user}</div>
                </div>
              </div>
            ))}
            {logs.length === 0 && <div style={{ color: THEME.colors.textMuted, fontStyle: 'italic', textAlign: 'center', marginTop: 40 }}>No system events recorded.</div>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderVerificationQueue = () => {
    const queue = users.filter(u => u.status === "PENDING" || !u.status);
    const selected = queue.find(u => u.id === selectedQueueId) || (queue.length > 0 ? queue[0] : null);

    return (
      <div className="module-fade-in" style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 24, height: "100%" }}>
        
        {/* LEFT: Live Queue */}
        <div style={{ background: THEME.colors.surface, borderRadius: THEME.radius.xl, border: `1px solid ${THEME.colors.border}`, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: THEME.shadows.card }}>
          <div style={{ padding: '24px 32px', background: THEME.colors.navy, color: "white", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Intake Queue</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: THEME.colors.goldLight, opacity: 0.8 }}>{queue.length} Profiles Awaiting Clearance</p>
            </div>
            {queue.length > 0 && <div className="pulse-dot" style={{ width: 12, height: 12, borderRadius: '50%', background: THEME.colors.danger }}></div>}
          </div>
          
          <div style={{ padding: '16px', borderBottom: `1px solid ${THEME.colors.border}`, background: THEME.colors.surfaceAlt }}>
             <input type="text" placeholder="Filter queue by name or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: THEME.radius.md, border: `1px solid ${THEME.colors.borderFocus}`, outline: 'none', fontFamily: THEME.fonts.main }} />
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {queue.length === 0 ? (
              <div style={{ padding: 60, textAlign: "center" }}>
                <div style={{ fontSize: '3rem', opacity: 0.2, marginBottom: 16 }}>📭</div>
                <div style={{ color: THEME.colors.textMuted, fontWeight: 600 }}>Queue is completely clear.</div>
              </div>
            ) : queue.filter(q => {
               const searchStr = `${q["Full Name"]} ${q.fullName} ${q.regNo}`.toLowerCase();
               return searchStr.includes(searchTerm.toLowerCase());
            }).map(q => {
              const dispName = q["Full Name"] || q.fullName || q.Name || 'Unknown Applicant';
              const dispDegree = q.Degree || q.degree || 'Degree N/A';
              const dispBatch = q["Batch Year"] || q.batchYear || 'Batch N/A';
              const dispRegNo = q.regNo || q["Register number"] || 'N/A';
              const isSelected = selected?.id === q.id;

              return (
                <div key={q.id} onClick={() => setSelectedQueueId(q.id)} style={{ padding: '20px 24px', borderBottom: `1px solid ${THEME.colors.border}`, cursor: "pointer", background: isSelected ? THEME.colors.infoBg : "transparent", transition: 'all 0.2s', borderLeft: isSelected ? `4px solid ${THEME.colors.info}` : '4px solid transparent' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 700, color: THEME.colors.textMain, fontSize: '1.1rem' }}>{dispName}</div>
                    <span style={{ fontSize: '0.75rem', background: THEME.colors.warningBg, color: THEME.colors.warning, padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>NEW</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: THEME.colors.textMuted, marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                     <span>🎓 {dispDegree} '{dispBatch.toString().slice(-2)}</span>
                     <span style={{ color: THEME.colors.border }}>|</span>
                     <span style={{ fontFamily: 'monospace' }}>{dispRegNo}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT: Master Dossier */}
        <div style={{ background: THEME.colors.surface, borderRadius: THEME.radius.xl, border: `1px solid ${THEME.colors.border}`, display: 'flex', flexDirection: 'column', overflow: "hidden", boxShadow: THEME.shadows.card }}>
          {selected ? (
            <div className="module-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              
              {/* Header Profile Area */}
              <div style={{ padding: 40, background: `linear-gradient(to bottom, ${THEME.colors.surfaceAlt}, ${THEME.colors.surface})`, borderBottom: `1px solid ${THEME.colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                  <div style={{ width: 100, height: 100, borderRadius: THEME.radius.full, background: THEME.colors.bg, border: `3px solid ${THEME.colors.surface}`, boxShadow: THEME.shadows.md, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {selected.profilePhotoUrl ? <img src={selected.profilePhotoUrl} alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}}/> : <span style={{fontSize: '2rem'}}>👤</span>}
                  </div>
                  <div>
                    <h1 style={{ margin: 0, color: THEME.colors.navy, fontSize: '2.2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{selected["Full Name"] || selected.fullName}</h1>
                    <p style={{ margin: "8px 0 0 0", color: THEME.colors.textMuted, fontSize: '1.1rem' }}>{selected.Email || selected.email} • {selected["Phone Number"] || selected.phone}</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: THEME.colors.warningBg, color: THEME.colors.warning, padding: '6px 16px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 700, marginTop: 16, border: `1px solid rgba(245, 158, 11, 0.2)` }}>
                      <span className="pulse-dot" style={{width: 8, height: 8, background: THEME.colors.warning, borderRadius: '50%'}}></span>
                      PENDING SECURITY CLEARANCE
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <button onClick={() => handleReject(selected)} style={{ padding: "14px 28px", background: THEME.colors.surface, color: THEME.colors.danger, border: `2px solid ${THEME.colors.dangerBg}`, borderRadius: THEME.radius.full, cursor: "pointer", fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.2s', letterSpacing: '0.05em' }} onMouseOver={e => e.currentTarget.style.background = THEME.colors.dangerBg} onMouseOut={e => e.currentTarget.style.background = THEME.colors.surface}>
                    REJECT & PURGE
                  </button>
                  <button onClick={() => handleApprove(selected)} style={{ padding: "14px 32px", background: THEME.colors.navy, color: THEME.colors.gold, border: "none", borderRadius: THEME.radius.full, cursor: "pointer", fontWeight: 700, fontSize: '0.95rem', boxShadow: THEME.shadows.md, transition: 'all 0.2s', letterSpacing: '0.05em' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    AUTHORIZE ACCESS
                  </button>
                </div>
              </div>

              {/* Data Grid */}
              <div style={{ padding: 40, flex: 1 }}>
                
                <h3 style={{ color: THEME.colors.navy, borderBottom: `2px solid ${THEME.colors.border}`, paddingBottom: 12, marginBottom: 24, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: 1 }}>Official Academic Records</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, marginBottom: 48, background: THEME.colors.surfaceAlt, padding: 32, borderRadius: THEME.radius.lg, border: `1px solid ${THEME.colors.border}` }}>
                  <InfoBlock label="University Register Number" value={selected.regNo} highlight />
                  <InfoBlock label="Degree Program" value={selected.Degree || selected.degree} />
                  <InfoBlock label="Batch Year" value={selected["Batch Year"] || selected.batchYear} />
                  <InfoBlock label="Date of Birth" value={selected.dob || selected.age ? `${selected.dob} (Age: ${selected.age})` : 'N/A'} />
                  <InfoBlock label="Gender" value={selected.gender} />
                  <InfoBlock label="Gov Aadhar (Masked)" value={selected.aadhar} />
                </div>

                <h3 style={{ color: THEME.colors.navy, borderBottom: `2px solid ${THEME.colors.border}`, paddingBottom: 12, marginBottom: 24, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: 1 }}>Professional Status & Details</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 32, marginBottom: 48 }}>
                  <InfoBlock label="Current Path" value={selected["Current Status"] || selected.currentStatus} />
                  <InfoBlock label="Company / University" value={selected["Company Name"] || selected.company || selected.pgCollege} />
                  <InfoBlock label="Designation / Course" value={selected.Designation || selected.designation || selected.pgCourse} />
                  <InfoBlock label="Core Skills" value={Array.isArray(selected.Skills) ? selected.Skills.join(', ') : selected.skills} />
                </div>

                <h3 style={{ color: THEME.colors.navy, borderBottom: `2px solid ${THEME.colors.border}`, paddingBottom: 12, marginBottom: 24, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: 1 }}>Mandatory ID Verification</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, paddingBottom: 40 }}>
                   {/* ID Document Preview */}
                   <div style={{ background: THEME.colors.bg, borderRadius: THEME.radius.lg, padding: 24, border: `1px solid ${THEME.colors.borderFocus}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: THEME.colors.textMain }}>Official Government/College ID</div>
                        <div style={{ fontSize: '0.8rem', color: THEME.colors.success, background: THEME.colors.successBg, padding: '4px 8px', borderRadius: 4, fontWeight: 700 }}>System Match: 98%</div>
                      </div>
                      <div style={{ height: 250, background: THEME.colors.surface, border: `2px dashed ${THEME.colors.borderFocus}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.colors.textMuted, borderRadius: THEME.radius.md, overflow: 'hidden' }}>
                         {selected.idProofUrl ? (
                             <img src={selected.idProofUrl} alt="ID Proof" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
                         ) : "No Identity Document Provided"}
                      </div>
                      {selected.idProofUrl && (
                        <div style={{ marginTop: 16, textAlign: 'center' }}>
                          <a href={selected.idProofUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '10px 24px', background: THEME.colors.surface, color: THEME.colors.navy, border: `1px solid ${THEME.colors.border}`, textDecoration: 'none', borderRadius: THEME.radius.full, fontWeight: 700, fontSize: '0.9rem', boxShadow: THEME.shadows.sm }}>Expand Document ↗</a>
                        </div>
                      )}
                   </div>
                   
                   <div style={{ background: THEME.colors.surfaceAlt, borderRadius: THEME.radius.lg, padding: 24, border: `1px solid ${THEME.colors.border}` }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: THEME.colors.textMain, marginBottom: 16 }}>Verification Checklist</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {['Face matches ID photograph', 'Name perfectly matches University Records', 'Date of Birth aligns with Government ID', 'No duplicate register numbers found'].map((check, i) => (
                          <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                            <input type="checkbox" style={{ marginTop: 4, width: 16, height: 16, accentColor: THEME.colors.navy }} />
                            <span style={{ fontSize: '0.95rem', color: THEME.colors.textMain }}>{check}</span>
                          </label>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: THEME.colors.borderFocus }}>
               <div style={{ fontSize: '4rem', marginBottom: 20 }}>🛡️</div>
               <h2 style={{ color: THEME.colors.textMuted, margin: 0 }}>No Applicant Selected</h2>
               <p>Select a profile from the intake queue to begin security clearance.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const InfoBlock = ({ label, value, highlight }) => (
    <div>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: THEME.colors.textMuted, textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: '1.15rem', color: highlight ? THEME.colors.navy : THEME.colors.textMain, fontWeight: highlight ? 700 : 500, fontFamily: highlight ? 'monospace' : THEME.fonts.main }}>{value || <span style={{ color: THEME.colors.borderFocus, fontStyle: 'italic' }}>Pending Update</span>}</div>
    </div>
  );

  const renderDirectory = () => {
    const verified = users.filter(u => u.status === "APPROVED");
    
    return (
      <div className="module-fade-in" style={{ background: THEME.colors.surface, padding: 40, borderRadius: THEME.radius.xl, border: `1px solid ${THEME.colors.border}`, boxShadow: THEME.shadows.card, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h2 style={{ margin: 0, color: THEME.colors.navy, fontSize: '2rem' }}>Master Directory</h2>
            <p style={{ margin: '8px 0 0 0', color: THEME.colors.textMuted }}>Secure database of all verified university alumni.</p>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <button style={{ padding: '10px 20px', background: THEME.colors.surfaceAlt, border: `1px solid ${THEME.colors.border}`, borderRadius: THEME.radius.md, fontWeight: 600, color: THEME.colors.textMain, cursor: 'pointer' }}>Export CSV ⬇</button>
            <input type="text" placeholder="Search records..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ padding: '12px 20px', borderRadius: THEME.radius.full, border: `1px solid ${THEME.colors.borderFocus}`, width: 350, outline: 'none', fontFamily: THEME.fonts.main }} />
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', border: `1px solid ${THEME.colors.border}`, borderRadius: THEME.radius.lg }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ position: 'sticky', top: 0, background: THEME.colors.surfaceAlt, zIndex: 1 }}>
              <tr style={{ borderBottom: `2px solid ${THEME.colors.borderFocus}`, color: THEME.colors.textMuted, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                <th style={{ padding: '20px 24px', fontWeight: 700 }}>Alumni Identity</th>
                <th style={{ padding: '20px 24px', fontWeight: 700 }}>Contact Route</th>
                <th style={{ padding: '20px 24px', fontWeight: 700 }}>System Credentials</th>
                <th style={{ padding: '20px 24px', fontWeight: 700 }}>Clearance Date</th>
                <th style={{ padding: '20px 24px', fontWeight: 700 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {verified.filter(u => {
                 const str = `${u["Full Name"]} ${u.fullName} ${u.Email} ${u.regNo}`.toLowerCase();
                 return str.includes(searchTerm.toLowerCase());
              }).map(u => {
                const dirName = u["Full Name"] || u.fullName || u.Name || 'Unknown';
                const dirDegree = u.Degree || u.degree || 'N/A';
                const dirBatch = u["Batch Year"] || u.batchYear || 'N/A';
                
                return (
                <tr key={u.id} style={{ borderBottom: `1px solid ${THEME.colors.border}`, transition: 'background 0.2s', ':hover': { background: THEME.colors.bg } }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: THEME.colors.bg, border: `1px solid ${THEME.colors.border}`, overflow: 'hidden' }}>
                        {u.profilePhotoUrl ? <img src={u.profilePhotoUrl} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:THEME.colors.textMuted}}>👤</div>}
                      </div>
                      <div>
                        <strong style={{ color: THEME.colors.navy, fontSize: '1.1rem', display: 'block' }}>{dirName}</strong>
                        <span style={{ fontSize: '0.85rem', color: THEME.colors.textMuted, fontWeight: 600 }}>{dirDegree} • Class of {dirBatch}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ color: THEME.colors.textMain, fontWeight: 500 }}>{u.Email || u.email || 'N/A'}</div>
                    <span style={{ fontSize: '0.85rem', color: THEME.colors.textMuted }}>{u["Phone Number"] || u.phone || 'N/A'}</span>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ background: THEME.colors.surfaceAlt, display: 'inline-flex', padding: '6px 12px', borderRadius: 6, fontSize: '0.9rem', color: THEME.colors.navy, border: `1px solid ${THEME.colors.border}`, fontFamily: 'monospace', fontWeight: 700 }}>
                      {u.username || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', fontSize: '0.95rem', color: THEME.colors.textMuted, fontWeight: 500 }}>
                    {u.approvedAt ? new Date(u.approvedAt).toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'}) : 'Legacy'}
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <button style={{ padding: '6px 16px', borderRadius: THEME.radius.full, border: `1px solid ${THEME.colors.borderFocus}`, background: 'transparent', color: THEME.colors.textMain, cursor: 'pointer', fontWeight: 600 }}>View</button>
                  </td>
                </tr>
              )})}
              {verified.length === 0 && (
                <tr><td colSpan="5" style={{ padding: 60, textAlign: 'center', color: THEME.colors.textMuted, fontSize: '1.1rem' }}>No verified alumni in database.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    const saveCfg = () => {
      localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(settings));
      logAction("SYS_CONFIG_UPDATE", "Root admin modified global operational parameters.");
      setLogs(JSON.parse(localStorage.getItem(CONFIG.LOGS_KEY) || "[]"));
      showToast("Enterprise configuration fully synchronized.", "success");
    };
    
    return (
      <div className="module-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, height: '100%', overflowY: 'auto', paddingBottom: 40 }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Module 1: System Config */}
          <div style={{ background: THEME.colors.surface, padding: 40, borderRadius: THEME.radius.xl, border: `1px solid ${THEME.colors.border}`, boxShadow: THEME.shadows.card }}>
            <h2 style={{ margin: '0 0 24px 0', color: THEME.colors.navy, borderBottom: `1px solid ${THEME.colors.border}`, paddingBottom: 16 }}>Global Operations</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 8, color: THEME.colors.textMain, fontSize: '0.95rem' }}>Master Reply-To Email</label>
                <input value={settings.adminEmail} onChange={e => setSettings({...settings, adminEmail: e.target.value})} style={{ width: "100%", padding: '14px 16px', borderRadius: THEME.radius.md, border: `1px solid ${THEME.colors.borderFocus}`, fontFamily: THEME.fonts.main, fontSize: '1rem', outlineColor: THEME.colors.navy }} />
                <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: THEME.colors.textMuted }}>Origin address for all automated system dispatches.</p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: THEME.colors.surfaceAlt, borderRadius: THEME.radius.lg, border: `1px solid ${THEME.colors.border}` }}>
                <div>
                  <div style={{ fontWeight: 700, color: THEME.colors.textMain, fontSize: '1rem' }}>Public Intake Portal</div>
                  <div style={{ fontSize: '0.85rem', color: THEME.colors.textMuted, marginTop: 4 }}>Accept new registrations from external clients.</div>
                </div>
                <ToggleSwitch checked={settings.registrationsOpen} onChange={() => setSettings({...settings, registrationsOpen: !settings.registrationsOpen})} />
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: settings.maintenanceMode ? THEME.colors.warningBg : THEME.colors.surfaceAlt, borderRadius: THEME.radius.lg, border: `1px solid ${settings.maintenanceMode ? THEME.colors.warning : THEME.colors.border}`, transition: 'all 0.3s' }}>
                <div>
                  <div style={{ fontWeight: 700, color: settings.maintenanceMode ? THEME.colors.warning : THEME.colors.textMain, fontSize: '1rem' }}>Emergency Maintenance Lock</div>
                  <div style={{ fontSize: '0.85rem', color: settings.maintenanceMode ? '#b45309' : THEME.colors.textMuted, marginTop: 4 }}>Sever access to the frontend network completely.</div>
                </div>
                <ToggleSwitch checked={settings.maintenanceMode} onChange={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} />
              </div>
            </div>
          </div>

          {/* Module 3: Security */}
          <div style={{ background: THEME.colors.surface, padding: 40, borderRadius: THEME.radius.xl, border: `1px solid ${THEME.colors.border}`, boxShadow: THEME.shadows.card }}>
            <h2 style={{ margin: '0 0 24px 0', color: THEME.colors.navy, borderBottom: `1px solid ${THEME.colors.border}`, paddingBottom: 16 }}>Security & Compliance</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, color: THEME.colors.textMain }}>Force Mandatory ID Proof</div>
                  <div style={{ fontSize: '0.85rem', color: THEME.colors.textMuted, marginTop: 4 }}>Reject forms missing valid document uploads.</div>
                </div>
                <ToggleSwitch checked={settings.requireIdVerification} onChange={() => setSettings({...settings, requireIdVerification: !settings.requireIdVerification})} />
              </div>
              <div style={{ height: 1, background: THEME.colors.border }}></div>
              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 8, color: THEME.colors.textMain }}>Rejected Data Retention (Days)</label>
                <input type="number" value={settings.dataRetentionDays} onChange={e => setSettings({...settings, dataRetentionDays: e.target.value})} style={{ width: "100%", padding: '12px 16px', borderRadius: THEME.radius.md, border: `1px solid ${THEME.colors.borderFocus}`, fontFamily: THEME.fonts.main }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* EmailJS Block */}
          <div style={{ background: THEME.colors.surface, padding: 40, borderRadius: THEME.radius.xl, border: `1px solid ${THEME.colors.border}`, boxShadow: THEME.shadows.card }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: `1px solid ${THEME.colors.border}`, paddingBottom: 16 }}>
              <h2 style={{ margin: 0, color: THEME.colors.navy }}>EmailJS Gateway Pipeline</h2>
              <span style={{ fontSize: '0.8rem', background: THEME.colors.successBg, color: THEME.colors.success, padding: '4px 8px', borderRadius: 4, fontWeight: 700 }}>CONNECTED</span>
            </div>
            <p style={{ color: THEME.colors.textMuted, fontSize: '0.95rem', marginBottom: 24, lineHeight: 1.5 }}>API Credentials utilized to map dynamically generated network passwords to verified applicant endpoints.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, fontSize: '0.95rem', color: THEME.colors.textMain, background: THEME.colors.navy, padding: 24, borderRadius: THEME.radius.lg, border: `1px solid ${THEME.colors.navyDark}`, boxShadow: THEME.shadows.inner }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)' }}><span>Service Route ID:</span> <strong style={{color: THEME.colors.gold}}>{EMAIL_GATEWAY.serviceId}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)' }}><span>Payload Template:</span> <strong style={{color: THEME.colors.gold}}>{EMAIL_GATEWAY.templateId}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)' }}><span>Auth Public Key:</span> <strong style={{color: THEME.colors.gold}}>{EMAIL_GATEWAY.publicKey.replace(/./g, '*').slice(0, 12)}...</strong></div>
            </div>
          </div>

          {/* Firebase Settings */}
          <div style={{ background: THEME.colors.surface, padding: 40, borderRadius: THEME.radius.xl, border: `1px solid ${THEME.colors.border}`, boxShadow: THEME.shadows.card }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: `1px solid ${THEME.colors.border}`, paddingBottom: 16 }}>
               <h2 style={{ margin: 0, color: THEME.colors.navy }}>Backend Storage Links</h2>
               <span style={{ fontSize: '0.8rem', background: THEME.colors.infoBg, color: THEME.colors.info, padding: '4px 8px', borderRadius: 4, fontWeight: 700 }}>FIREBASE</span>
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 8, color: THEME.colors.textMain }}>Media Bucket Target</label>
              <input value={settings.firebaseProjectFolder} onChange={e => setSettings({...settings, firebaseProjectFolder: e.target.value})} style={{ width: "100%", padding: '14px 16px', borderRadius: THEME.radius.md, border: `1px solid ${THEME.colors.borderFocus}`, fontFamily: THEME.fonts.main, fontSize: '1rem', background: THEME.colors.surfaceAlt }} />
            </div>
          </div>

          <button onClick={saveCfg} style={{ padding: "24px", background: `linear-gradient(135deg, ${THEME.colors.gold} 0%, #b8962e 100%)`, color: THEME.colors.navy, border: "none", borderRadius: THEME.radius.xl, cursor: "pointer", fontWeight: 700, fontSize: '1.2rem', boxShadow: THEME.shadows.glow, transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: 1 }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            Synchronize Architecture
          </button>
        </div>

      </div>
    );
  };

  const renderJobs = () => (
    <div className="module-fade-in" style={{ background: THEME.colors.surface, padding: 40, borderRadius: THEME.radius.xl, border: `1px solid ${THEME.colors.border}`, boxShadow: THEME.shadows.card, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ margin: '0 0 8px 0', color: THEME.colors.navy, fontSize: '2rem' }}>Job Board Approvals</h2>
      <p style={{ color: THEME.colors.textMuted, margin: '0 0 40px 0', fontSize: '1.1rem' }}>Review and authorize corporate opportunities posted by network members.</p>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `2px dashed ${THEME.colors.borderFocus}`, borderRadius: THEME.radius.lg, background: THEME.colors.surfaceAlt }}>
        <div style={{ fontSize: '4rem', marginBottom: 20, opacity: 0.5 }}>💼</div>
        <h3 style={{ margin: '0 0 12px 0', color: THEME.colors.textMain, fontSize: '1.5rem' }}>Listing Queue Empty</h3>
        <p style={{ color: THEME.colors.textMuted, margin: 0, fontSize: '1.1rem' }}>No pending career postings require administrative oversight at this time.</p>
      </div>
    </div>
  );

  const SIDEBAR_MENUS = [
    { id: "DASHBOARD", label: "Command Center", icon: "📊" },
    { id: "VERIFY", label: "Security Clearance", icon: "🛡️", badge: users.filter(u => u.status === "PENDING" || !u.status).length },
    { id: "DIRECTORY", label: "Master Directory", icon: "👥" },
    { id: "JOBS", label: "Opportunity Queue", icon: "💼" },
    { id: "SETTINGS", label: "System Config", icon: "⚙️" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: THEME.colors.bg, fontFamily: THEME.fonts.main, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
        * { box-sizing: border-box; } 
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
        .module-fade-in { animation: fade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(15px); }
        @keyframes fade { to { opacity: 1; transform: translateY(0); } }
        .pulse-dot { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
        ::-webkit-scrollbar { width: 10px; height: 10px; } 
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; border: 3px solid #f8fafc; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        /* Smooth Selection overrides */
        ::selection { background: ${THEME.colors.gold}; color: ${THEME.colors.navy}; }
      `}</style>

      {/* Floating System Toasts */}
      <div style={{ position: "fixed", bottom: 40, right: 40, zIndex: 9999, display: "flex", flexDirection: "column", gap: 16 }}>
        {toasts.map(t => (
          <div key={t.id} className="module-fade-in" style={{ background: THEME.colors.surface, borderLeft: `6px solid ${t.type === 'success' ? THEME.colors.success : t.type === 'error' ? THEME.colors.danger : t.type === 'warning' ? THEME.colors.warning : THEME.colors.info}`, padding: "20px 24px", borderRadius: THEME.radius.md, boxShadow: THEME.shadows.dropdown, minWidth: 350, fontWeight: 600, color: THEME.colors.textMain, display: 'flex', alignItems: 'center', gap: 16, border: `1px solid ${THEME.colors.border}` }}>
            <span style={{fontSize: '1.2rem'}}>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
            <span style={{ flex: 1, lineHeight: 1.4 }}>{t.msg}</span>
          </div>
        ))}
      </div>

      {/* Sidebar UI */}
      <aside style={{ width: 320, background: `linear-gradient(180deg, ${THEME.colors.navyDark} 0%, ${THEME.colors.navy} 100%)`, color: "white", display: "flex", flexDirection: "column", flexShrink: 0, zIndex: 10, boxShadow: '4px 0 24px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: "48px 32px", borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
          <div style={{ color: THEME.colors.gold, fontWeight: 700, fontSize: '0.8rem', letterSpacing: 4, textTransform: "uppercase", marginBottom: 12 }}>St. Joseph's University</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' }}>{CONFIG.APP_NAME}</div>
        </div>
        
        <nav style={{ flex: 1, padding: "40px 24px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
          {SIDEBAR_MENUS.map(m => (
            <button key={m.id} onClick={() => { setActiveTab(m.id); setSelectedQueueId(null); setSearchTerm(''); }} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px", background: activeTab === m.id ? 'rgba(212, 175, 55, 0.1)' : "transparent", color: activeTab === m.id ? THEME.colors.gold : "rgba(255,255,255,0.5)", border: "none", borderRadius: THEME.radius.lg, cursor: "pointer", textAlign: "left", fontWeight: activeTab === m.id ? 700 : 500, transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)", fontSize: '1.05rem', borderLeft: activeTab === m.id ? `4px solid ${THEME.colors.gold}` : '4px solid transparent' }} onMouseOver={e => { if(activeTab !== m.id) e.currentTarget.style.color = "white"; }} onMouseOut={e => { if(activeTab !== m.id) e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
              <span style={{ fontSize: '1.4rem' }}>{m.icon}</span> <span style={{ flex: 1 }}>{m.label}</span>
              {m.badge > 0 && <span style={{ background: THEME.colors.danger, color: "white", padding: "4px 12px", borderRadius: 20, fontSize: '0.85rem', fontWeight: 700, boxShadow: `0 0 12px rgba(239, 68, 68, 0.5)` }}>{m.badge}</span>}
            </button>
          ))}
        </nav>
        
        <div style={{ padding: '32px 24px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${THEME.colors.gold} 0%, #b8962e 100%)`, color: THEME.colors.navy, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: '1.2rem', boxShadow: THEME.shadows.glow }}>Root</div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: THEME.colors.surface }}>System Administrator</div>
            <div style={{ fontSize: '0.85rem', color: THEME.colors.gold, marginTop: 4, fontWeight: 600, letterSpacing: 1 }}>LEVEL 5 CLEARANCE</div>
          </div>
        </div>
      </aside>

      {/* Main Operating Area */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: '100vh', background: THEME.colors.bg }}>
        
        {/* Top App Bar */}
        <header style={{ height: 100, background: THEME.colors.surface, borderBottom: `1px solid ${THEME.colors.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", boxShadow: THEME.shadows.sm, zIndex: 5, flexShrink: 0 }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: THEME.colors.textMuted }}>
            Secure Terminal <span style={{ margin: '0 16px', color: THEME.colors.border }}>/</span> <span style={{ color: THEME.colors.navy, fontWeight: 700 }}>{SIDEBAR_MENUS.find(m => m.id === activeTab)?.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <span style={{ fontSize: '0.85rem', color: THEME.colors.textMuted, fontWeight: 700, background: THEME.colors.surfaceAlt, padding: '8px 16px', borderRadius: THEME.radius.full, border: `1px solid ${THEME.colors.border}`, letterSpacing: 1 }}>{CONFIG.VERSION}</span>
          </div>
        </header>
        
        {/* Dynamic View Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: 48, boxSizing: 'border-box' }}>
          {activeTab === "DASHBOARD" && renderDashboard()}
          {activeTab === "VERIFY" && renderVerificationQueue()}
          {activeTab === "DIRECTORY" && renderDirectory()}
          {activeTab === "JOBS" && renderJobs()}
          {activeTab === "SETTINGS" && renderSettings()}
        </div>

      </main>
    </div>
  );
}