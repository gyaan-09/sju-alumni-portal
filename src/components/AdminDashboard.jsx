// src/AdminDashboard.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import emailjs from "@emailjs/browser";
import { db } from '../firebase'; 
import { collection, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

/**
 * ============================================================================
 * SJU ALUMNI OS - ENTERPRISE ADMIN COMMAND CENTER
 * Build: 2026.11.X.ULTRA_REALTIME (Crash-Proof Edition)
 * ============================================================================
 */

const CONFIG = {
  SYSTEM: {
    APP_NAME: "SJU Alumni OS",
    VERSION: "2026.5.0 Enterprise Ultra",
    COLLECTION_NAME: "alumni_data", // FIXED: Matches Register.jsx perfectly
    ADMIN_NAME: "Gyaan N Luthria",
    ADMIN_ROLE: "System Administrator - Level 5 Clearance"
  },
  KEYS: {
    SETTINGS: 'sju_admin_settings_v4',
    LOGS: 'sju_admin_logs_v3',
  },
  EMAIL_GATEWAY: {
    serviceId: "service_gyaan",
    templateId: "template_1jmzaa9",
    publicKey: "MgWnLyUUS3faeP6W5",
  },
  THEME: {
    NAVY_DARK: '#020b17', NAVY_MAIN: '#0C2340', NAVY_LITE: '#1A3B66',
    GOLD_MAIN: '#D4AF37', GOLD_LITE: '#F9F1D8', GOLD_DARK: '#AA8A2E',
    SUCCESS: '#10B981', SUCCESS_BG: 'rgba(16, 185, 129, 0.1)',
    WARNING: '#F59E0B', WARNING_BG: 'rgba(245, 158, 11, 0.1)',
    DANGER: '#EF4444', DANGER_BG: 'rgba(239, 68, 68, 0.1)',
    INFO: '#3B82F6', INFO_BG: 'rgba(59, 130, 246, 0.1)',
    BG_APP: '#F1F5F9', BG_SURFACE: '#FFFFFF', BG_SURFACE_ALT: '#F8FAFC',
    BORDER: 'rgba(12, 35, 64, 0.12)', BORDER_FOCUS: '#94A3B8',
    TEXT_PRI: '#0F172A', TEXT_SEC: '#475569', TEXT_TER: '#94A3B8',
    RADIUS_MD: '12px', RADIUS_LG: '20px', RADIUS_XL: '32px', RADIUS_FULL: '9999px',
    SHADOW_SM: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    SHADOW_MD: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
    SHADOW_LG: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    TRANSITION: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  }
};

// ============================================================================
// UTILITIES & KERNEL LOGIC
// ============================================================================

const Kernel = {
  generateCredentials: (name = "Alumni") => {
    const cleanName = String(name).split(" ")[0].toLowerCase().replace(/[^a-z]/g, '');
    const username = `sju_${cleanName}_${Math.floor(Math.random() * 9000 + 1000)}`;
    const password = Math.random().toString(36).slice(-8) + "!";
    return { username, password };
  },
  formatDate: (timestamp) => {
    if (!timestamp) return 'Pending';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
};

// ============================================================================
// ICONS (SVG Library)
// ============================================================================
const Icons = {
  Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
  Shield: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Check: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  X: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
};

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================

export default function EnterpriseAdmin() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState("VERIFY");
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [settings, setSettings] = useState({ 
    adminEmail: "admin@sju.edu.in", 
    registrationsOpen: true, 
    maintenanceMode: false
  });

  // --- CORE SYSTEM SYNC ---
  useEffect(() => {
    // FIXED: Now accurately targeting "alumni_data"
    const alumniRef = collection(db, CONFIG.SYSTEM.COLLECTION_NAME);
    
    const unsubscribe = onSnapshot(alumniRef, (snapshot) => {
      const firestoreUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort: Newest registrations first
      setUsers(firestoreUsers.sort((a, b) => (b.registeredAt?.seconds || 0) - (a.registeredAt?.seconds || 0)));
    }, (error) => {
      console.error("Firestore Sync Error:", error);
      showToast("Database connection lost. Retrying...", "error");
    });

    // Load Local Data
    const savedLogs = JSON.parse(localStorage.getItem(CONFIG.KEYS.LOGS) || "[]");
    setLogs(savedLogs);
    const savedSettings = JSON.parse(localStorage.getItem(CONFIG.KEYS.SETTINGS));
    if (savedSettings) setSettings(savedSettings);

    return () => unsubscribe();
  }, []);

  // --- HELPER FUNCTIONS ---
  const showToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const systemLog = (action, details) => {
    const newLog = { id: Date.now(), time: new Date().toISOString(), action, details, user: CONFIG.SYSTEM.ADMIN_NAME };
    setLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 500);
      localStorage.setItem(CONFIG.KEYS.LOGS, JSON.stringify(updated));
      return updated;
    });
  };

  // --- CRITICAL PIPELINES ---
  const handleApprove = async (applicant) => {
    const name = applicant["Full Name"] || applicant.fullName || 'Applicant';
    const email = applicant.Email || applicant.email;

    if (!window.confirm(`AUTHORIZATION REQUIRED\n\nGrant official network access and generate credentials for ${name}?`)) return;
    
    setIsProcessing(true);
    showToast("Authenticating & Generating secure credentials...", "info");
    const { username, password } = Kernel.generateCredentials(name);

    try {
      // 1. Database Update (Permanent)
      const userDocRef = doc(db, CONFIG.SYSTEM.COLLECTION_NAME, applicant.id);
      await updateDoc(userDocRef, {
        status: "APPROVED",
        verificationQueue: false,
        username: username,
        password: password, 
        approvedAt: serverTimestamp(),
        approvedBy: CONFIG.SYSTEM.ADMIN_NAME
      });

      systemLog("IDENTITY_VERIFIED", `System approved network access for ${name}`);
      
      // 2. EmailJS Dispatch
      if (email) {
        const emailParams = {
          to_name: name,
          to_email: email,
          reply_to: settings.adminEmail,
          username: username,
          password: password,
          message: "Your St. Joseph's University Alumni identity has been successfully verified. Welcome to the exclusive global directory."
        };
        
        await emailjs.send(
          CONFIG.EMAIL_GATEWAY.serviceId, 
          CONFIG.EMAIL_GATEWAY.templateId, 
          emailParams, 
          CONFIG.EMAIL_GATEWAY.publicKey
        );
        systemLog("CREDENTIALS_DISPATCHED", `Encrypted payload sent to ${email}`);
        showToast(`Success! Account approved & Email dispatched.`, "success");
      } else {
        showToast(`Account approved, but no email was found for dispatch.`, "warning");
      }

      setSelectedApplicant(null);
    } catch (error) {
      console.error("Pipeline Error:", error);
      showToast(`Pipeline Failed: ${error.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (applicant) => {
    const name = applicant["Full Name"] || applicant.fullName || 'Applicant';
    
    if (!window.confirm(`CRITICAL WARNING\n\nPermanently reject and purge all records for ${name}? This action is irreversible.`)) return;
    
    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, CONFIG.SYSTEM.COLLECTION_NAME, applicant.id));
      systemLog("RECORD_PURGED", `Application rejected and wiped for ${name}.`);
      showToast(`Record permanently wiped from database.`, "error");
      setSelectedApplicant(null);
    } catch (error) {
      console.error("Purge Error: ", error);
      showToast("Purge protocol failed.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- COMPUTED DATA ---
  const pendingQueue = users.filter(u => u.status === "PENDING" || !u.status);
  const verifiedDirectory = users.filter(u => u.status === "APPROVED");

  // ============================================================================
  // UI RENDERERS
  // ============================================================================

  const renderVerificationQueue = () => (
    <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "24px", height: "100%", overflow: "hidden" }}>
      
      {/* LEFT: Live Intake Queue */}
      <div style={{ background: CONFIG.THEME.BG_SURFACE, borderRadius: CONFIG.THEME.RADIUS_LG, border: `1px solid ${CONFIG.THEME.BORDER}`, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: CONFIG.THEME.SHADOW_SM }}>
        <div style={{ padding: '24px', background: CONFIG.THEME.NAVY_MAIN, color: "white" }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Intake Queue</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: CONFIG.THEME.GOLD_LITE, opacity: 0.9 }}>{pendingQueue.length} Profiles Awaiting Clearance</p>
        </div>
        
        <div style={{ padding: '16px', borderBottom: `1px solid ${CONFIG.THEME.BORDER}`, background: CONFIG.THEME.BG_SURFACE_ALT }}>
           <input type="text" placeholder="Filter queue..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: `1px solid ${CONFIG.THEME.BORDER_FOCUS}`, outline: 'none' }} />
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {pendingQueue.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: CONFIG.THEME.TEXT_TER }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
              <div>Queue is completely clear.</div>
            </div>
          ) : pendingQueue.filter(q => {
             const str = `${q["Full Name"]} ${q.fullName} ${q.regNo}`.toLowerCase();
             return str.includes(searchTerm.toLowerCase());
          }).map(q => {
            const isSelected = selectedApplicant?.id === q.id;
            const name = q["Full Name"] || q.fullName || 'Unknown Applicant';
            
            return (
              <div key={q.id} onClick={() => setSelectedApplicant(q)} style={{ padding: '20px', borderBottom: `1px solid ${CONFIG.THEME.BORDER}`, cursor: "pointer", background: isSelected ? CONFIG.THEME.INFO_BG : "transparent", borderLeft: isSelected ? `4px solid ${CONFIG.THEME.INFO}` : '4px solid transparent', transition: CONFIG.THEME.TRANSITION }}>
                <div style={{ fontWeight: 700, color: CONFIG.THEME.TEXT_PRI, fontSize: '1.05rem' }}>{name}</div>
                <div style={{ fontSize: '0.85rem', color: CONFIG.THEME.TEXT_SEC, marginTop: 6 }}>🎓 {q.Degree || q.degree || 'N/A'} | {q.regNo || 'No Reg No'}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* RIGHT: Master Dossier */}
      <div style={{ background: CONFIG.THEME.BG_SURFACE, borderRadius: CONFIG.THEME.RADIUS_LG, border: `1px solid ${CONFIG.THEME.BORDER}`, display: 'flex', flexDirection: 'column', overflow: "hidden", boxShadow: CONFIG.THEME.SHADOW_SM }}>
        {selectedApplicant ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            
            {/* Dossier Header */}
            <div style={{ padding: '40px', background: CONFIG.THEME.BG_SURFACE_ALT, borderBottom: `1px solid ${CONFIG.THEME.BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: CONFIG.THEME.BG_APP, border: `3px solid ${CONFIG.THEME.BG_SURFACE}`, boxShadow: CONFIG.THEME.SHADOW_MD, overflow: 'hidden', display: 'flex', alignItems:'center', justifyContent:'center' }}>
                  {selectedApplicant.profilePhotoUrl ? <img src={selectedApplicant.profilePhotoUrl} alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}}/> : <span style={{fontSize: '2rem'}}>👤</span>}
                </div>
                <div>
                  <h1 style={{ margin: 0, color: CONFIG.THEME.NAVY_MAIN, fontSize: '2rem', fontWeight: 800 }}>{selectedApplicant["Full Name"] || selectedApplicant.fullName}</h1>
                  <p style={{ margin: "8px 0 0 0", color: CONFIG.THEME.TEXT_SEC, fontSize: '1rem' }}>{selectedApplicant.Email || selectedApplicant.email} • {selectedApplicant["Phone Number"] || selectedApplicant.phone}</p>
                  <div style={{ display: 'inline-block', background: CONFIG.THEME.WARNING_BG, color: CONFIG.THEME.WARNING, padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, marginTop: '12px' }}>PENDING SECURITY CLEARANCE</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ padding: '24px 40px', display: "flex", gap: "16px", background: CONFIG.THEME.BG_SURFACE, borderBottom: `1px solid ${CONFIG.THEME.BORDER}` }}>
              <button disabled={isProcessing} onClick={() => handleApprove(selectedApplicant)} style={{ flex: 1, padding: "16px", background: CONFIG.THEME.SUCCESS, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: isProcessing ? 0.7 : 1 }}>
                <Icons.Check /> AUTHORIZE & DISPATCH CREDENTIALS
              </button>
              <button disabled={isProcessing} onClick={() => handleReject(selectedApplicant)} style={{ flex: 1, padding: "16px", background: CONFIG.THEME.BG_SURFACE, color: CONFIG.THEME.DANGER, border: `2px solid ${CONFIG.THEME.DANGER}`, borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: isProcessing ? 0.7 : 1 }}>
                <Icons.X /> REJECT & PURGE RECORD
              </button>
            </div>

            {/* Dossier Data */}
            <div style={{ padding: '40px', flex: 1 }}>
              <h3 style={{ color: CONFIG.THEME.NAVY_MAIN, borderBottom: `2px solid ${CONFIG.THEME.BORDER}`, paddingBottom: '12px', marginBottom: '24px', textTransform: 'uppercase' }}>Academic Records</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "40px" }}>
                <InfoBlock label="Register Number" value={selectedApplicant.regNo} />
                <InfoBlock label="Degree & Batch" value={`${selectedApplicant.Degree || selectedApplicant.degree} ('${selectedApplicant["Batch Year"] || selectedApplicant.batchYear})`} />
                <InfoBlock label="Date of Birth" value={selectedApplicant.dob} />
                <InfoBlock label="Gender" value={selectedApplicant.gender} />
              </div>

              <h3 style={{ color: CONFIG.THEME.NAVY_MAIN, borderBottom: `2px solid ${CONFIG.THEME.BORDER}`, paddingBottom: '12px', marginBottom: '24px', textTransform: 'uppercase' }}>Professional Status</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "40px" }}>
                <InfoBlock label="Current Path" value={selectedApplicant["Current Status"] || selectedApplicant.currentStatus} />
                <InfoBlock label="Company / College" value={selectedApplicant["Company Name"] || selectedApplicant.company || selectedApplicant.pgCollege} />
                <InfoBlock label="Designation / Course" value={selectedApplicant.Designation || selectedApplicant.designation || selectedApplicant.pgCourse} />
                <InfoBlock label="Core Skills" value={Array.isArray(selectedApplicant.Skills) ? selectedApplicant.Skills.join(', ') : selectedApplicant.skills} />
              </div>

              <h3 style={{ color: CONFIG.THEME.NAVY_MAIN, borderBottom: `2px solid ${CONFIG.THEME.BORDER}`, paddingBottom: '12px', marginBottom: '24px', textTransform: 'uppercase' }}>Identity Document</h3>
              <div style={{ background: CONFIG.THEME.BG_APP, borderRadius: CONFIG.THEME.RADIUS_LG, padding: '24px', border: `1px solid ${CONFIG.THEME.BORDER_FOCUS}` }}>
                {selectedApplicant.idProofUrl ? (
                  <div>
                    <img src={selectedApplicant.idProofUrl} alt="ID Proof" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', background: '#000', borderRadius: '8px' }} />
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                      <a href={selectedApplicant.idProofUrl} target="_blank" rel="noreferrer" style={{ color: CONFIG.THEME.NAVY_MAIN, fontWeight: 700, textDecoration: 'none' }}>Open Document in New Tab ↗</a>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: CONFIG.THEME.TEXT_TER, padding: '40px 0' }}>No Document Provided</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: CONFIG.THEME.TEXT_TER }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛡️</div>
            <h2 style={{ margin: 0 }}>No Applicant Selected</h2>
            <p>Select a profile from the queue to review.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDirectory = () => (
    <div style={{ background: CONFIG.THEME.BG_SURFACE, padding: '40px', borderRadius: CONFIG.THEME.RADIUS_LG, border: `1px solid ${CONFIG.THEME.BORDER}`, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: CONFIG.THEME.SHADOW_SM }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ margin: 0, color: CONFIG.THEME.NAVY_MAIN, fontSize: '2rem' }}>Master Directory</h2>
          <p style={{ margin: '8px 0 0 0', color: CONFIG.THEME.TEXT_SEC }}>All cleared and verified alumni.</p>
        </div>
        <input type="text" placeholder="Search verified records..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ padding: '12px 20px', borderRadius: '8px', border: `1px solid ${CONFIG.THEME.BORDER_FOCUS}`, width: '300px', outline: 'none' }} />
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', border: `1px solid ${CONFIG.THEME.BORDER}`, borderRadius: '12px' }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ position: 'sticky', top: 0, background: CONFIG.THEME.BG_SURFACE_ALT, zIndex: 1 }}>
            <tr style={{ borderBottom: `2px solid ${CONFIG.THEME.BORDER_FOCUS}`, color: CONFIG.THEME.TEXT_SEC, fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '20px 24px' }}>Alumni Identity</th>
              <th style={{ padding: '20px 24px' }}>Contact</th>
              <th style={{ padding: '20px 24px' }}>System Username</th>
              <th style={{ padding: '20px 24px' }}>Clearance Date</th>
            </tr>
          </thead>
          <tbody>
            {verifiedDirectory.filter(u => {
               const str = `${u["Full Name"]} ${u.fullName} ${u.username}`.toLowerCase();
               return str.includes(searchTerm.toLowerCase());
            }).map(u => (
              <tr key={u.id} style={{ borderBottom: `1px solid ${CONFIG.THEME.BORDER}` }}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ fontWeight: 700, color: CONFIG.THEME.NAVY_MAIN }}>{u["Full Name"] || u.fullName}</div>
                  <div style={{ fontSize: '0.85rem', color: CONFIG.THEME.TEXT_SEC }}>{u.Degree || u.degree} • {u["Batch Year"] || u.batchYear}</div>
                </td>
                <td style={{ padding: '20px 24px', color: CONFIG.THEME.TEXT_PRI }}>{u.Email || u.email}</td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{ background: CONFIG.THEME.BG_APP, padding: '6px 12px', borderRadius: '6px', fontFamily: 'monospace', fontWeight: 700 }}>{u.username || 'Legacy/Pending'}</span>
                </td>
                <td style={{ padding: '20px 24px', color: CONFIG.THEME.TEXT_SEC }}>{Kernel.formatDate(u.approvedAt)}</td>
              </tr>
            ))}
            {verifiedDirectory.length === 0 && <tr><td colSpan="4" style={{ padding: 40, textAlign: 'center', color: CONFIG.THEME.TEXT_TER }}>No verified alumni found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', height: '100%' }}>
      <h1 style={{ color: CONFIG.THEME.NAVY_MAIN, margin: 0, fontSize: '2.5rem' }}>Command Center</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
        <StatCard title="Total Network" value={users.length} color={CONFIG.THEME.INFO} bg={CONFIG.THEME.INFO_BG} />
        <StatCard title="Pending Clearance" value={pendingQueue.length} color={CONFIG.THEME.WARNING} bg={CONFIG.THEME.WARNING_BG} />
        <StatCard title="Verified Directory" value={verifiedDirectory.length} color={CONFIG.THEME.SUCCESS} bg={CONFIG.THEME.SUCCESS_BG} />
      </div>

      <div style={{ background: CONFIG.THEME.BG_SURFACE, borderRadius: CONFIG.THEME.RADIUS_LG, border: `1px solid ${CONFIG.THEME.BORDER}`, padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <h3 style={{ margin: '0 0 24px 0', color: CONFIG.THEME.NAVY_MAIN }}>Live System Audit Logs</h3>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {logs.map(log => (
            <div key={log.id} style={{ display: 'flex', gap: '16px', borderBottom: `1px solid ${CONFIG.THEME.BORDER}`, paddingBottom: '16px' }}>
              <div style={{ fontWeight: 700, color: log.action.includes('REJECT') ? CONFIG.THEME.DANGER : CONFIG.THEME.NAVY_MAIN, minWidth: '180px' }}>{log.action}</div>
              <div style={{ flex: 1, color: CONFIG.THEME.TEXT_PRI }}>{log.details}</div>
              <div style={{ color: CONFIG.THEME.TEXT_TER, fontSize: '0.85rem' }}>{Kernel.formatDate(log.time)}</div>
            </div>
          ))}
          {logs.length === 0 && <div style={{ color: CONFIG.THEME.TEXT_TER }}>No system events recorded.</div>}
        </div>
      </div>
    </div>
  );

  // --- SUB-COMPONENTS ---
  const InfoBlock = ({ label, value }) => (
    <div>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '1.1rem', color: CONFIG.THEME.TEXT_PRI, fontWeight: 500 }}>{value || <span style={{ color: CONFIG.THEME.BORDER_FOCUS, fontStyle: 'italic' }}>N/A</span>}</div>
    </div>
  );

  const StatCard = ({ title, value, color, bg }) => (
    <div style={{ background: CONFIG.THEME.BG_SURFACE, padding: '32px', borderRadius: CONFIG.THEME.RADIUS_LG, border: `1px solid ${CONFIG.THEME.BORDER}`, display: 'flex', alignItems: 'center', gap: '20px', borderLeft: `6px solid ${color}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: CONFIG.THEME.TEXT_SEC, textTransform: "uppercase" }}>{title}</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: CONFIG.THEME.NAVY_MAIN }}>{value}</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: CONFIG.THEME.BG_APP, fontFamily: "'Lora', serif", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
        * { box-sizing: border-box; } 
        ::-webkit-scrollbar { width: 8px; height: 8px; } 
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>

      {/* Floating Toasts */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: "12px" }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: CONFIG.THEME.BG_SURFACE, borderLeft: `6px solid ${t.type === 'success' ? CONFIG.THEME.SUCCESS : t.type === 'error' ? CONFIG.THEME.DANGER : CONFIG.THEME.INFO}`, padding: "16px 24px", borderRadius: "8px", boxShadow: CONFIG.THEME.SHADOW_MD, minWidth: "300px", fontWeight: 600, color: CONFIG.THEME.TEXT_PRI }}>
            {t.msg}
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <aside style={{ width: "300px", background: CONFIG.THEME.NAVY_DARK, color: "white", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "40px 24px", borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
          <div style={{ color: CONFIG.THEME.GOLD_MAIN, fontWeight: 700, fontSize: '0.8rem', letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>St. Joseph's University</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{CONFIG.SYSTEM.APP_NAME}</div>
        </div>
        
        <nav style={{ flex: 1, padding: "32px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { id: "DASHBOARD", label: "Command Center", icon: <Icons.Dashboard /> },
            { id: "VERIFY", label: "Security Clearance", icon: <Icons.Shield />, badge: pendingQueue.length },
            { id: "DIRECTORY", label: "Master Directory", icon: <Icons.Users /> }
          ].map(m => (
            <button key={m.id} onClick={() => { setActiveTab(m.id); setSelectedApplicant(null); setSearchTerm(''); }} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: activeTab === m.id ? 'rgba(212, 175, 55, 0.1)' : "transparent", color: activeTab === m.id ? CONFIG.THEME.GOLD_MAIN : "rgba(255,255,255,0.6)", border: "none", borderRadius: "12px", cursor: "pointer", textAlign: "left", fontWeight: activeTab === m.id ? 700 : 500, transition: CONFIG.THEME.TRANSITION }}>
              {m.icon} <span style={{ flex: 1 }}>{m.label}</span>
              {m.badge > 0 && <span style={{ background: CONFIG.THEME.DANGER, color: "white", padding: "4px 10px", borderRadius: "20px", fontSize: '0.8rem', fontWeight: 700 }}>{m.badge}</span>}
            </button>
          ))}
        </nav>
        
        {/* Admin Profile utilizing User Corrections Override */}
        <div style={{ padding: '24px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: "white" }}>{CONFIG.SYSTEM.ADMIN_NAME}</div>
          <div style={{ fontSize: '0.8rem', color: CONFIG.THEME.GOLD_MAIN, marginTop: '4px' }}>{CONFIG.SYSTEM.ADMIN_ROLE}</div>
        </div>
      </aside>

      {/* Main Area */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: '100vh' }}>
        <header style={{ height: "80px", background: CONFIG.THEME.BG_SURFACE, borderBottom: `1px solid ${CONFIG.THEME.BORDER}`, display: "flex", alignItems: "center", padding: "0 40px", flexShrink: 0 }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: CONFIG.THEME.NAVY_MAIN }}>{activeTab.replace('_', ' ')}</div>
        </header>
        
        <div style={{ flex: 1, overflowY: "hidden", padding: "40px", boxSizing: 'border-box' }}>
          {activeTab === "DASHBOARD" && renderDashboard()}
          {activeTab === "VERIFY" && renderVerificationQueue()}
          {activeTab === "DIRECTORY" && renderDirectory()}
        </div>
      </main>
    </div>
  );
}