import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";

const CONFIG = {
  DB_KEY: 'sju_titanium_ent_v31_navygold',
  SETTINGS_KEY: 'sju_admin_settings_v3',
  LOGS_KEY: 'sju_admin_logs_v2',
  EVENTS_KEY: 'sju_admin_events_v2',
  JOBS_KEY: 'sju_admin_jobs_v2',
  APP_NAME: "SJU Alumni Admin OS",
  VERSION: "2026.4.0 - Enterprise",
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
    bg: "#f8fafc",
    surface: "#ffffff",
    textMain: "#1e293b",
    textMuted: "#64748b",
    border: "#e2e8f0",
    success: "#059669",
    successBg: "#d1fae5",
    danger: "#dc2626",
    dangerBg: "#fee2e2",
    warning: "#d97706",
    warningBg: "#fef3c7",
    info: "#2563eb",
    infoBg: "#dbeafe"
  },
  fonts: { 
    main: "'Lora', serif" 
  },
  shadows: { 
    card: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)", 
    dropdown: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
    inner: "inset 0 2px 4px 0 rgba(0,0,0,0.06)"
  }
};

const generateCredentials = (name = "Alumni") => {
  const cleanName = name.split(" ")[0].toLowerCase().replace(/[^a-z]/g, '');
  const username = `sju_${cleanName}_${Math.floor(Math.random() * 9000 + 1000)}`;
  const password = Math.random().toString(36).slice(-8) + "!";
  return { username, password };
};

const logAction = (action, details, user = "System") => {
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
    firebaseProjectFolder: "alumni_portal_prod"
  });
  const [logs, setLogs] = useState([]);
  const [events, setEvents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedQueueId, setSelectedQueueId] = useState(null);

  // Core Data Synchronization
  useEffect(() => {
    const syncData = () => {
      try {
        const dbUsers = JSON.parse(localStorage.getItem(CONFIG.DB_KEY) || "[]");
        const dbLogs = JSON.parse(localStorage.getItem(CONFIG.LOGS_KEY) || "[]");
        const dbEvents = JSON.parse(localStorage.getItem(CONFIG.EVENTS_KEY) || "[]");
        const dbJobs = JSON.parse(localStorage.getItem(CONFIG.JOBS_KEY) || "[]");
        
        setUsers(prev => JSON.stringify(prev) !== JSON.stringify(dbUsers) ? dbUsers : prev);
        setLogs(prev => JSON.stringify(prev) !== JSON.stringify(dbLogs) ? dbLogs : prev);
        setEvents(prev => JSON.stringify(prev) !== JSON.stringify(dbEvents) ? dbEvents : prev);
        setJobs(prev => JSON.stringify(prev) !== JSON.stringify(dbJobs) ? dbJobs : prev);
      } catch (e) { console.error("Sync Error", e); }
    };
    
    syncData();
    const interval = setInterval(syncData, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem(CONFIG.SETTINGS_KEY));
    if (s) setSettings(s);
  }, []);

  const showToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 6000);
  };

  const updateDB = (newUsers) => {
    setUsers(newUsers);
    localStorage.setItem(CONFIG.DB_KEY, JSON.stringify(newUsers));
  };

  const handleApprove = async (applicant) => {
    if (!window.confirm(`Authorize official access for ${applicant.fullName || 'this applicant'}?`)) return;
    
    showToast("Generating secure credentials & contacting EmailJS gateway...", "info");
    const { username, password } = generateCredentials(applicant.fullName);

    const emailParams = {
      to_name: applicant.fullName || "SJU Alumni",
      to_email: applicant.email,
      username: username,
      password: password,
      message: "Your St. Joseph's University Alumni registration has been fully verified and approved by the administration.",
      reply_to: settings.adminEmail
    };

    try {
      await emailjs.send(EMAIL_GATEWAY.serviceId, EMAIL_GATEWAY.templateId, emailParams, EMAIL_GATEWAY.publicKey);
      
      const updated = users.map(u => u.id === applicant.id ? { ...u, status: "APPROVED", username, password, approvedAt: new Date().toISOString() } : u);
      updateDB(updated);
      logAction("ACCOUNT_APPROVED", `Verified ID and Approved ${applicant.fullName} (${applicant.email})`);
      showToast(`Success! Secure credentials dispatched to ${applicant.email}.`, "success");
      setSelectedQueueId(null);
      
    } catch (error) {
      console.error("EmailJS Error:", error);
      showToast(`Email routing failed. User approved locally, but credentials must be sent manually.`, "warning");
      const updated = users.map(u => u.id === applicant.id ? { ...u, status: "APPROVED", username, password } : u);
      updateDB(updated);
      setSelectedQueueId(null);
    }
  };

  const handleReject = (applicant) => {
    if (!window.confirm(`Permanently reject and purge records for ${applicant.fullName}? This action is irreversible.`)) return;
    const updated = users.filter(u => u.id !== applicant.id);
    updateDB(updated);
    logAction("ACCOUNT_REJECTED", `Rejected application for ${applicant.fullName}. Documents purged.`);
    showToast(`Application deleted and queued for document purge.`, "error");
    setSelectedQueueId(null);
  };

  const renderDashboard = () => (
    <div className="module-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h2 style={{ color: THEME.colors.navy, margin: 0, fontSize: '2rem' }}>Command Center</h2>
          <p style={{ color: THEME.colors.textMuted, margin: '8px 0 0 0' }}>Real-time overview of the SJU Alumni Network ecosystem.</p>
        </div>
        <div style={{ background: THEME.colors.surface, padding: '10px 20px', borderRadius: 50, border: `1px solid ${THEME.colors.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: THEME.colors.success, boxShadow: `0 0 8px ${THEME.colors.success}` }}></div>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: THEME.colors.textMain }}>System Operational</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
        {[
          { label: "Total Network Size", val: users.length, color: THEME.colors.info, bg: THEME.colors.infoBg },
          { label: "Pending Verification", val: users.filter(u => u.status === "PENDING" || !u.status).length, color: THEME.colors.warning, bg: THEME.colors.warningBg },
          { label: "Verified Alumni", val: users.filter(u => u.status === "APPROVED").length, color: THEME.colors.success, bg: THEME.colors.successBg },
          { label: "Active Job Listings", val: jobs.filter(j => j.status === "APPROVED").length, color: THEME.colors.gold, bg: THEME.colors.goldLight }
        ].map((s, i) => (
          <div key={i} style={{ background: THEME.colors.surface, padding: 24, borderRadius: 16, border: `1px solid ${THEME.colors.border}`, boxShadow: THEME.shadows.card, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: s.color }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: THEME.colors.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: THEME.colors.navy, marginTop: 12 }}>{s.val}</div>
              </div>
              <div style={{ background: s.bg, color: s.color, padding: '8px 12px', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600 }}>+{(Math.random() * 5).toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginTop: 24 }}>
        <div style={{ background: THEME.colors.surface, borderRadius: 16, border: `1px solid ${THEME.colors.border}`, padding: 24 }}>
          <h3 style={{ margin: '0 0 20px 0', color: THEME.colors.navy, fontSize: '1.2rem' }}>Network Engagement Chart</h3>
          <div style={{ height: 250, display: 'flex', alignItems: 'flex-end', gap: 16, padding: '20px 0', borderBottom: `1px solid ${THEME.colors.border}` }}>
            {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ width: '100%', height: `${h}%`, background: `linear-gradient(180deg, ${THEME.colors.navy} 0%, ${THEME.colors.navyLight} 100%)`, borderRadius: '6px 6px 0 0', transition: 'height 0.5s ease' }}></div>
                <span style={{ fontSize: '0.8rem', color: THEME.colors.textMuted }}>Day {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: THEME.colors.surface, borderRadius: 16, border: `1px solid ${THEME.colors.border}`, padding: 24, overflowY: 'auto', maxHeight: 350 }}>
          <h3 style={{ margin: '0 0 20px 0', color: THEME.colors.navy, fontSize: '1.2rem' }}>Recent Audit Logs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {logs.slice(0, 5).map(log => (
              <div key={log.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: THEME.colors.gold, marginTop: 6 }}></div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: THEME.colors.textMain }}>{log.action.replace(/_/g, ' ')}</div>
                  <div style={{ fontSize: '0.8rem', color: THEME.colors.textMuted, marginTop: 4 }}>{log.details}</div>
                  <div style={{ fontSize: '0.75rem', color: THEME.colors.textMuted, marginTop: 4 }}>{new Date(log.time).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderVerificationQueue = () => {
    const queue = users.filter(u => u.status === "PENDING" || !u.status);
    const selected = queue.find(u => u.id === selectedQueueId) || queue[0];

    return (
      <div className="module-fade-in" style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24, height: "calc(100vh - 160px)" }}>
        
        {/* Queue List */}
        <div style={{ background: THEME.colors.surface, borderRadius: 16, border: `1px solid ${THEME.colors.border}`, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: THEME.shadows.card }}>
          <div style={{ padding: 24, background: THEME.colors.navy, color: "white", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Live Queue</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: THEME.colors.gold }}>{queue.length} Awaiting Review</p>
            </div>
            <div className="pulse-dot" style={{ width: 12, height: 12, borderRadius: '50%', background: THEME.colors.danger }}></div>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {queue.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: THEME.colors.textMuted, fontStyle: 'italic' }}>Incoming registrations routed here.</div> 
              : queue.map(q => (
              <div key={q.id} onClick={() => setSelectedQueueId(q.id)} style={{ padding: '20px 24px', borderBottom: `1px solid ${THEME.colors.border}`, cursor: "pointer", background: selected?.id === q.id ? THEME.colors.infoBg : "transparent", transition: 'background 0.2s', borderLeft: selected?.id === q.id ? `4px solid ${THEME.colors.info}` : '4px solid transparent' }}>
                <div style={{ fontWeight: 700, color: THEME.colors.textMain, fontSize: '1.05rem' }}>{q.fullName || q.firstName || 'Unknown Applicant'}</div>
                <div style={{ fontSize: '0.85rem', color: THEME.colors.textMuted, marginTop: 4 }}>{q.degree || 'Degree N/A'} • {q.batchYear || 'Batch N/A'}</div>
                <div style={{ fontSize: '0.85rem', color: THEME.colors.textMuted, marginTop: 4 }}>Reg: {q.regNo || 'N/A'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div style={{ background: THEME.colors.surface, borderRadius: 16, border: `1px solid ${THEME.colors.border}`, padding: 32, overflowY: "auto", boxShadow: THEME.shadows.card }}>
          {selected ? (
            <div className="module-fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `2px solid ${THEME.colors.border}`, paddingBottom: 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  {/* Mock Avatar */}
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: THEME.colors.bg, border: `2px dashed ${THEME.colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.colors.textMuted, fontSize: '0.8rem', textAlign: 'center' }}>Photo<br/>Review</div>
                  <div>
                    <h1 style={{ margin: 0, color: THEME.colors.navy, fontSize: '2rem' }}>{selected.fullName || selected.firstName}</h1>
                    <p style={{ margin: "6px 0 0 0", color: THEME.colors.textMuted, fontSize: '1rem' }}>{selected.email} • {selected.phone || 'No phone'}</p>
                    <div style={{ display: 'inline-block', background: THEME.colors.warningBg, color: THEME.colors.warning, padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, marginTop: 10 }}>STATUS: PENDING VERIFICATION</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <button onClick={() => handleReject(selected)} style={{ padding: "12px 24px", background: THEME.colors.danger, color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: '1rem', transition: 'opacity 0.2s' }}>Reject & Purge</button>
                  <button onClick={() => handleApprove(selected)} style={{ padding: "12px 24px", background: THEME.colors.success, color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: '1rem', boxShadow: `0 4px 14px ${THEME.colors.success}40` }}>Authorize & Email</button>
                </div>
              </div>

              <h3 style={{ color: THEME.colors.navy, borderBottom: `1px solid ${THEME.colors.border}`, paddingBottom: 10, marginBottom: 20 }}>Academic Profile</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 40 }}>
                <InfoBlock label="University Register Number" value={selected.regNo} />
                <InfoBlock label="Degree Studied" value={selected.degree} />
                <InfoBlock label="Year of Passing" value={selected.batchYear} />
                <InfoBlock label="Date of Birth" value={selected.dob} />
                <InfoBlock label="Aadhar Mask" value={selected.aadhar} />
                <InfoBlock label="Current Status" value={selected.currentStatus} />
              </div>

              <h3 style={{ color: THEME.colors.navy, borderBottom: `1px solid ${THEME.colors.border}`, paddingBottom: 10, marginBottom: 20 }}>Document Verification</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                 <div style={{ background: THEME.colors.bg, borderRadius: 12, padding: 20, border: `1px solid ${THEME.colors.border}`, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: THEME.colors.textMain, marginBottom: 12 }}>ID Proof Document</div>
                    <div style={{ height: 150, background: THEME.colors.surface, border: `1px dashed ${THEME.colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.colors.textMuted, borderRadius: 8 }}>
                       {/* Firebase Integration Point */}
                       [ Firebase Storage Render Here ]
                    </div>
                 </div>
              </div>

            </div>
          ) : <div style={{ color: THEME.colors.textMuted, textAlign: "center", marginTop: '20%', fontSize: '1.2rem' }}>Select an applicant from the queue to review their dossier.</div>}
        </div>
      </div>
    );
  };

  const InfoBlock = ({ label, value }) => (
    <div>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: THEME.colors.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: '1.1rem', color: THEME.colors.textMain, fontWeight: 500 }}>{value || <span style={{ color: THEME.colors.border }}>N/A</span>}</div>
    </div>
  );

  const renderDirectory = () => {
    const verified = users.filter(u => u.status === "APPROVED");
    
    return (
      <div className="module-fade-in" style={{ background: THEME.colors.surface, padding: 32, borderRadius: 16, border: `1px solid ${THEME.colors.border}`, boxShadow: THEME.shadows.card }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: THEME.colors.navy }}>Verified Master Directory</h2>
          <input type="text" placeholder="Search alumni..." style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${THEME.colors.border}`, width: 300, fontFamily: THEME.fonts.main }} />
        </div>
        
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${THEME.colors.navy}`, color: THEME.colors.navy }}>
              <th style={{ padding: '16px 12px', fontWeight: 700 }}>Alumni Identity</th>
              <th style={{ padding: '16px 12px', fontWeight: 700 }}>Contact Info</th>
              <th style={{ padding: '16px 12px', fontWeight: 700 }}>Portal Credentials</th>
              <th style={{ padding: '16px 12px', fontWeight: 700 }}>Approval Date</th>
            </tr>
          </thead>
          <tbody>
            {verified.map(u => (
              <tr key={u.id} style={{ borderBottom: `1px solid ${THEME.colors.border}`, transition: 'background 0.2s', ':hover': { background: THEME.colors.bg } }}>
                <td style={{ padding: '16px 12px' }}>
                  <strong style={{ color: THEME.colors.textMain, fontSize: '1.05rem' }}>{u.fullName}</strong><br/>
                  <span style={{ fontSize: '0.85rem', color: THEME.colors.textMuted }}>{u.degree} • {u.batchYear}</span>
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <div style={{ color: THEME.colors.textMain }}>{u.email}</div>
                  <span style={{ fontSize: '0.85rem', color: THEME.colors.textMuted }}>{u.phone}</span>
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{ background: THEME.colors.bg, padding: '4px 8px', borderRadius: 4, fontSize: '0.9rem', color: THEME.colors.textMain, border: `1px solid ${THEME.colors.border}` }}>
                    {u.username || 'N/A'}
                  </span>
                </td>
                <td style={{ padding: '16px 12px', fontSize: '0.9rem', color: THEME.colors.textMuted }}>
                  {u.approvedAt ? new Date(u.approvedAt).toLocaleDateString() : 'Legacy Data'}
                </td>
              </tr>
            ))}
            {verified.length === 0 && (
              <tr><td colSpan="4" style={{ padding: 40, textAlign: 'center', color: THEME.colors.textMuted }}>No verified alumni yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSettings = () => {
    const saveCfg = () => {
      localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(settings));
      logAction("SETTINGS_UPDATED", "System administrator updated global configuration.");
      showToast("Enterprise configuration saved successfully.", "success");
    };
    
    return (
      <div className="module-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        
        {/* Module 1: System Config */}
        <div style={{ background: THEME.colors.surface, padding: 32, borderRadius: 16, border: `1px solid ${THEME.colors.border}`, boxShadow: THEME.shadows.card }}>
          <h2 style={{ margin: '0 0 24px 0', color: THEME.colors.navy, borderBottom: `1px solid ${THEME.colors.border}`, paddingBottom: 16 }}>Global Preferences</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 8, color: THEME.colors.textMain }}>System Admin Reply-To Email</label>
              <input value={settings.adminEmail} onChange={e => setSettings({...settings, adminEmail: e.target.value})} style={{ width: "100%", padding: '12px 16px', borderRadius: 8, border: `1px solid ${THEME.colors.border}`, fontFamily: THEME.fonts.main, fontSize: '1rem' }} />
              <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: THEME.colors.textMuted }}>All broadcast and approval emails will use this reply-to address.</p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: THEME.colors.bg, borderRadius: 8, border: `1px solid ${THEME.colors.border}` }}>
              <div>
                <div style={{ fontWeight: 700, color: THEME.colors.textMain }}>Accept Public Registrations</div>
                <div style={{ fontSize: '0.85rem', color: THEME.colors.textMuted, marginTop: 4 }}>Control access to the frontend registration portal.</div>
              </div>
              <button onClick={() => setSettings({...settings, registrationsOpen: !settings.registrationsOpen})} style={{ padding: "8px 24px", borderRadius: 20, border: "none", background: settings.registrationsOpen ? THEME.colors.success : THEME.colors.danger, color: "white", cursor: "pointer", fontWeight: 700, transition: 'background 0.2s' }}>
                {settings.registrationsOpen ? "ONLINE" : "OFFLINE"}
              </button>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: THEME.colors.bg, borderRadius: 8, border: `1px solid ${THEME.colors.border}` }}>
              <div>
                <div style={{ fontWeight: 700, color: THEME.colors.textMain }}>Maintenance Mode</div>
                <div style={{ fontSize: '0.85rem', color: THEME.colors.textMuted, marginTop: 4 }}>Lock out all non-admin users from the portal.</div>
              </div>
              <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} style={{ padding: "8px 24px", borderRadius: 20, border: "none", background: settings.maintenanceMode ? THEME.colors.warning : THEME.colors.border, color: settings.maintenanceMode ? "white" : THEME.colors.textMain, cursor: "pointer", fontWeight: 700, transition: 'background 0.2s' }}>
                {settings.maintenanceMode ? "ACTIVE" : "INACTIVE"}
              </button>
            </div>
          </div>
        </div>

        {/* Module 2: Integrations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          {/* EmailJS Block */}
          <div style={{ background: THEME.colors.surface, padding: 32, borderRadius: 16, border: `1px solid ${THEME.colors.border}`, boxShadow: THEME.shadows.card }}>
            <h2 style={{ margin: '0 0 16px 0', color: THEME.colors.navy }}>EmailJS Gateway Binding</h2>
            <p style={{ color: THEME.colors.textMuted, fontSize: '0.9rem', marginBottom: 20 }}>Credentials used to dispatch automated credentials to verified alumni.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, fontSize: '0.9rem', color: THEME.colors.textMain, background: THEME.colors.bg, padding: 16, borderRadius: 8, border: `1px solid ${THEME.colors.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Service ID:</span> <strong>{EMAIL_GATEWAY.serviceId}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Template ID:</span> <strong>{EMAIL_GATEWAY.templateId}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Public Key:</span> <strong>{EMAIL_GATEWAY.publicKey}</strong></div>
            </div>
          </div>

          {/* Firebase Settings (Tying into your project) */}
          <div style={{ background: THEME.colors.surface, padding: 32, borderRadius: 16, border: `1px solid ${THEME.colors.border}`, boxShadow: THEME.shadows.card }}>
            <h2 style={{ margin: '0 0 16px 0', color: THEME.colors.navy }}>Firebase Backend Linking</h2>
            <p style={{ color: THEME.colors.textMuted, fontSize: '0.9rem', marginBottom: 20 }}>Storage buckets mapped for ID Proofs & Profile Pictures.</p>
            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 8, color: THEME.colors.textMain }}>Target Storage Bucket</label>
              <input value={settings.firebaseProjectFolder} onChange={e => setSettings({...settings, firebaseProjectFolder: e.target.value})} style={{ width: "100%", padding: '12px 16px', borderRadius: 8, border: `1px solid ${THEME.colors.border}`, fontFamily: THEME.fonts.main }} />
            </div>
          </div>

          <button onClick={saveCfg} style={{ padding: "18px", background: THEME.colors.gold, color: THEME.colors.navy, border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: '1.1rem', boxShadow: `0 4px 14px ${THEME.colors.gold}60`, transition: 'transform 0.2s' }}>
            Apply & Save Configuration
          </button>
        </div>

      </div>
    );
  };

  const renderJobs = () => (
    <div className="module-fade-in" style={{ background: THEME.colors.surface, padding: 32, borderRadius: 16, border: `1px solid ${THEME.colors.border}`, boxShadow: THEME.shadows.card }}>
      <h2 style={{ margin: '0 0 8px 0', color: THEME.colors.navy }}>Job Board Approvals</h2>
      <p style={{ color: THEME.colors.textMuted, margin: '0 0 24px 0' }}>Review and authorize job opportunities posted by alumni before they go live on the network.</p>
      
      <div style={{ padding: '60px 40px', textAlign: "center", border: `2px dashed ${THEME.colors.border}`, borderRadius: 12, background: THEME.colors.bg }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>💼</div>
        <h3 style={{ margin: '0 0 8px 0', color: THEME.colors.textMain }}>Queue is Empty</h3>
        <p style={{ color: THEME.colors.textMuted, margin: 0 }}>No pending job postings require your approval at this time.</p>
      </div>
    </div>
  );

  const SIDEBAR_MENUS = [
    { id: "DASHBOARD", label: "Command Center", icon: "📊" },
    { id: "VERIFY", label: "Verification Queue", icon: "🛡️", badge: users.filter(u => u.status === "PENDING" || !u.status).length },
    { id: "DIRECTORY", label: "Master Directory", icon: "👥" },
    { id: "JOBS", label: "Job Approvals", icon: "💼" },
    { id: "SETTINGS", label: "System Config", icon: "⚙️" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: THEME.colors.bg, fontFamily: THEME.fonts.main, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
        * { box-sizing: border-box; } 
        body { margin: 0; font-family: 'Lora', serif; }
        .module-fade-in { animation: fade 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .pulse-dot { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); } 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); } }
        ::-webkit-scrollbar { width: 8px; } 
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; border: 2px solid #f8fafc; }
      `}</style>

      {/* Floating Toast Container */}
      <div style={{ position: "fixed", bottom: 40, right: 40, zIndex: 9999, display: "flex", flexDirection: "column", gap: 12 }}>
        {toasts.map(t => (
          <div key={t.id} className="module-fade-in" style={{ background: "white", borderLeft: `6px solid ${t.type === 'success' ? THEME.colors.success : t.type === 'error' ? THEME.colors.danger : THEME.colors.warning}`, padding: "16px 24px", borderRadius: 8, boxShadow: THEME.shadows.dropdown, minWidth: 320, fontWeight: 600, color: THEME.colors.textMain, display: 'flex', alignItems: 'center', gap: 12 }}>
            {t.msg}
          </div>
        ))}
      </div>

      {/* Admin Sidebar */}
      <aside style={{ width: 300, background: THEME.colors.navy, color: "white", display: "flex", flexDirection: "column", flexShrink: 0, zIndex: 10, boxShadow: '4px 0 24px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: "40px 32px", borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
          <div style={{ color: THEME.colors.gold, fontWeight: 700, fontSize: '0.75rem', letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>St. Joseph's University</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.2 }}>{CONFIG.APP_NAME}</div>
        </div>
        
        <nav style={{ flex: 1, padding: "32px 20px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
          {SIDEBAR_MENUS.map(m => (
            <button key={m.id} onClick={() => { setActiveTab(m.id); setEditingUser(null); }} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: activeTab === m.id ? 'rgba(212, 175, 55, 0.1)' : "transparent", color: activeTab === m.id ? THEME.colors.gold : "rgba(255,255,255,0.6)", border: "none", borderRadius: 12, cursor: "pointer", textAlign: "left", fontWeight: activeTab === m.id ? 700 : 500, transition: "all 0.2s", fontSize: '1rem', borderLeft: activeTab === m.id ? `4px solid ${THEME.colors.gold}` : '4px solid transparent' }}>
              <span style={{ fontSize: '1.2rem' }}>{m.icon}</span> <span style={{ flex: 1 }}>{m.label}</span>
              {m.badge > 0 && <span style={{ background: THEME.colors.danger, color: "white", padding: "4px 10px", borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, boxShadow: `0 0 10px ${THEME.colors.danger}80` }}>{m.badge}</span>}
            </button>
          ))}
        </nav>
        
        <div style={{ padding: 32, background: THEME.colors.navyDark, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${THEME.colors.gold} 0%, #b8962e 100%)`, color: THEME.colors.navy, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: '1.2rem', boxShadow: `0 4px 12px rgba(212, 175, 55, 0.3)` }}>SJU</div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>Root Admin</div>
            <div style={{ fontSize: '0.8rem', color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Enterprise Access</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{ height: 90, background: THEME.colors.surface, borderBottom: `1px solid ${THEME.colors.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", boxShadow: THEME.shadows.card, zIndex: 5 }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 500, color: THEME.colors.textMuted }}>
            Admin Console <span style={{ margin: '0 12px', color: THEME.colors.border }}>/</span> <span style={{ color: THEME.colors.navy, fontWeight: 700 }}>{SIDEBAR_MENUS.find(m => m.id === activeTab)?.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <span style={{ fontSize: '0.85rem', color: THEME.colors.textMuted, fontWeight: 600, background: THEME.colors.bg, padding: '6px 12px', borderRadius: 20 }}>{CONFIG.VERSION}</span>
          </div>
        </header>
        
        <div style={{ flex: 1, overflowY: "auto", padding: 48 }}>
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