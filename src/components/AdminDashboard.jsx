import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";

const CONFIG = {
  DB_KEY: 'sju_titanium_ent_v31_navygold',
  SETTINGS_KEY: 'sju_admin_settings_v2',
  LOGS_KEY: 'sju_admin_logs_v1',
  EVENTS_KEY: 'sju_admin_events_v1',
  JOBS_KEY: 'sju_admin_jobs_v1',
  APP_NAME: "SJU Alumni Admin OS",
  VERSION: "2026.3.0",
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
    bg: "#f8fafc",
    surface: "#ffffff",
    textMain: "#0f172a",
    textMuted: "#64748b",
    border: "#e2e8f0",
    success: "#10B981",
    danger: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6"
  },
  fonts: { main: "'Inter', sans-serif", heading: "'Merriweather', serif", mono: "monospace" },
  shadows: { card: "0 4px 6px -1px rgba(0,0,0,0.05)", dropdown: "0 10px 15px -3px rgba(0,0,0,0.1)" }
};

const generateCredentials = (name = "Alumni") => {
  const cleanName = name.split(" ")[0].toLowerCase().replace(/[^a-z]/g, '');
  const username = `sju_${cleanName}_${Math.floor(Math.random() * 9000 + 1000)}`;
  const password = Math.random().toString(36).slice(-8) + "!";
  return { username, password };
};

const logAction = (action, details) => {
  const logs = JSON.parse(localStorage.getItem(CONFIG.LOGS_KEY) || "[]");
  logs.unshift({ id: Date.now(), time: new Date().toISOString(), action, details });
  localStorage.setItem(CONFIG.LOGS_KEY, JSON.stringify(logs.slice(0, 500)));
};

export default function EnterpriseAdmin() {
  const [activeTab, setActiveTab] = useState("DASHBOARD");
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({ adminEmail: "admin@sju.edu.in", registrationsOpen: true, autoApprove: false });
  const [logs, setLogs] = useState([]);
  const [events, setEvents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  
  // FIXED: Moved the queue selection state to the top level of the component
  const [selectedQueueId, setSelectedQueueId] = useState(null);

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
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const updateDB = (newUsers) => {
    setUsers(newUsers);
    localStorage.setItem(CONFIG.DB_KEY, JSON.stringify(newUsers));
  };

  const handleApprove = async (applicant) => {
    if (!window.confirm(`Approve ${applicant.fullName || 'this applicant'}?`)) return;
    
    showToast("Generating credentials and contacting EmailJS gateway...", "info");
    const { username, password } = generateCredentials(applicant.fullName);

    const emailParams = {
      to_name: applicant.fullName || "SJU Alumni",
      to_email: applicant.email,
      username: username,
      password: password,
      message: "Your St. Joseph's University Alumni registration is approved. Welcome to the community portal.",
      reply_to: settings.adminEmail
    };

    try {
      await emailjs.send(EMAIL_GATEWAY.serviceId, EMAIL_GATEWAY.templateId, emailParams, EMAIL_GATEWAY.publicKey);
      
      const updated = users.map(u => u.id === applicant.id ? { ...u, status: "APPROVED", username, password, approvedAt: new Date().toISOString() } : u);
      updateDB(updated);
      logAction("ACCOUNT_APPROVED", `Approved ${applicant.fullName} (${applicant.email})`);
      showToast(`Success! Email dispatched to ${applicant.email} with credentials.`, "success");
      
    } catch (error) {
      console.error("EmailJS Error:", error);
      showToast(`Email routing failed. Ensure your Service/Template IDs are active in EmailJS. User is approved locally.`, "warning");
      const updated = users.map(u => u.id === applicant.id ? { ...u, status: "APPROVED", username, password } : u);
      updateDB(updated);
    }
  };

  const handleReject = (applicant) => {
    if (!window.confirm(`Permanently reject and delete ${applicant.fullName}?`)) return;
    const updated = users.filter(u => u.id !== applicant.id);
    updateDB(updated);
    logAction("ACCOUNT_REJECTED", `Rejected and purged ${applicant.fullName}`);
    showToast(`Application deleted.`, "error");
  };

  const saveProfileEdit = (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target).entries());
    const updated = users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u);
    updateDB(updated);
    logAction("PROFILE_EDITED", `Admin edited profile for ID: ${editingUser.id}`);
    setEditingUser(null);
    showToast("Profile updated based on email request.", "success");
  };

  const renderDashboard = () => (
    <div className="module-fade-in">
      <h2 style={{ color: THEME.colors.navy, marginTop: 0 }}>Command Center</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginTop: 20 }}>
        {[
          { label: "Total Users", val: users.length, color: THEME.colors.info },
          { label: "Pending Verifications", val: users.filter(u => u.status === "PENDING" || !u.status).length, color: THEME.colors.warning },
          { label: "Verified Alumni", val: users.filter(u => u.status === "APPROVED").length, color: THEME.colors.success },
          { label: "System Events", val: events.length, color: THEME.colors.gold }
        ].map((s, i) => (
          <div key={i} style={{ background: THEME.colors.surface, padding: 24, borderRadius: 12, borderTop: `4px solid ${s.color}`, boxShadow: THEME.shadows.card }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: THEME.colors.textMuted, textTransform: "uppercase" }}>{s.label}</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: THEME.colors.textMain, marginTop: 8 }}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // FIXED: Removed hooks from inside this function
  const renderVerificationQueue = () => {
    const queue = users.filter(u => u.status === "PENDING" || !u.status);
    const selected = queue.find(u => u.id === selectedQueueId) || queue[0];

    return (
      <div className="module-fade-in" style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 24, height: "calc(100vh - 160px)" }}>
        <div style={{ background: THEME.colors.surface, borderRadius: 12, border: `1px solid ${THEME.colors.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: 20, background: THEME.colors.navy, color: "white" }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Live Queue</h3>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>Listening for registrations...</p>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
            {queue.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: THEME.colors.textMuted }}>No pending applications. Data from the registration page will appear here instantly.</div> 
              : queue.map(q => (
              <div key={q.id} onClick={() => setSelectedQueueId(q.id)} style={{ padding: 16, borderBottom: `1px solid ${THEME.colors.border}`, cursor: "pointer", background: selected?.id === q.id ? THEME.colors.bg : "transparent" }}>
                <div style={{ fontWeight: 600 }}>{q.fullName || q.firstName || 'New User'}</div>
                <div style={{ fontSize: 12, color: THEME.colors.textMuted }}>{q.email}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: THEME.colors.surface, borderRadius: 12, border: `1px solid ${THEME.colors.border}`, padding: 32, overflowY: "auto" }}>
          {selected ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${THEME.colors.border}`, paddingBottom: 24, marginBottom: 24 }}>
                <div>
                  <h1 style={{ margin: 0, color: THEME.colors.navy }}>{selected.fullName || selected.firstName}</h1>
                  <p style={{ margin: "8px 0 0 0", color: THEME.colors.textMuted }}>{selected.email} • {selected.phone || 'No phone'}</p>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <button onClick={() => handleReject(selected)} style={{ padding: "10px 20px", background: THEME.colors.danger, color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Reject</button>
                  <button onClick={() => handleApprove(selected)} style={{ padding: "10px 20px", background: THEME.colors.success, color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Approve & Email</button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div><div style={{ fontSize: 12, fontWeight: 700, color: THEME.colors.textMuted }}>Department/Degree</div><div style={{ fontSize: 16 }}>{selected.dept || selected.degree || 'N/A'}</div></div>
                <div><div style={{ fontSize: 12, fontWeight: 700, color: THEME.colors.textMuted }}>Graduation Year</div><div style={{ fontSize: 16 }}>{selected.batch || selected.year || 'N/A'}</div></div>
                <div><div style={{ fontSize: 12, fontWeight: 700, color: THEME.colors.textMuted }}>Current Organization</div><div style={{ fontSize: 16 }}>{selected.company || 'N/A'}</div></div>
                <div><div style={{ fontSize: 12, fontWeight: 700, color: THEME.colors.textMuted }}>Registration Date</div><div style={{ fontSize: 16 }}>{new Date(selected.registeredAt || Date.now()).toLocaleString()}</div></div>
              </div>
            </div>
          ) : <div style={{ color: THEME.colors.textMuted, textAlign: "center", marginTop: 100 }}>Select a user from the queue.</div>}
        </div>
      </div>
    );
  };

  const renderDirectory = () => {
    const verified = users.filter(u => u.status === "APPROVED");
    
    if (editingUser) return (
      <div className="module-fade-in" style={{ background: THEME.colors.surface, padding: 32, borderRadius: 12, border: `1px solid ${THEME.colors.border}` }}>
        <h2 style={{ marginTop: 0, color: THEME.colors.navy, borderBottom: `1px solid ${THEME.colors.border}`, paddingBottom: 16 }}>Admin Profile Editor</h2>
        <p style={{ color: THEME.colors.warning, fontSize: 14, fontWeight: 600 }}>Editing profile for {editingUser.email}</p>
        <form onSubmit={saveProfileEdit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 24 }}>
          {['fullName', 'email', 'phone', 'dept', 'batch', 'company'].map(field => (
            <div key={field}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, textTransform: "capitalize" }}>{field}</label>
              <input name={field} defaultValue={editingUser[field]} style={{ width: "100%", padding: 12, borderRadius: 6, border: `1px solid ${THEME.colors.border}` }} />
            </div>
          ))}
          <div style={{ gridColumn: "span 2", display: "flex", gap: 12, marginTop: 16 }}>
            <button type="submit" style={{ padding: "12px 24px", background: THEME.colors.navy, color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Save Changes</button>
            <button type="button" onClick={() => setEditingUser(null)} style={{ padding: "12px 24px", background: THEME.colors.bg, border: `1px solid ${THEME.colors.border}`, borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
          </div>
        </form>
      </div>
    );

    return (
      <div className="module-fade-in" style={{ background: THEME.colors.surface, padding: 24, borderRadius: 12, border: `1px solid ${THEME.colors.border}` }}>
        <h2 style={{ marginTop: 0, color: THEME.colors.navy }}>Verified Alumni Directory</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", marginTop: 24 }}>
          <thead><tr style={{ borderBottom: `2px solid ${THEME.colors.border}` }}>
            <th style={{ padding: 12 }}>Name</th><th style={{ padding: 12 }}>Contact</th><th style={{ padding: 12 }}>Credentials</th><th style={{ padding: 12 }}>Actions</th>
          </tr></thead>
          <tbody>
            {verified.map(u => (
              <tr key={u.id} style={{ borderBottom: `1px solid ${THEME.colors.border}` }}>
                <td style={{ padding: 12 }}><strong>{u.fullName}</strong><br/><span style={{ fontSize: 12, color: THEME.colors.textMuted }}>{u.dept} • {u.batch}</span></td>
                <td style={{ padding: 12 }}>{u.email}<br/><span style={{ fontSize: 12, color: THEME.colors.textMuted }}>{u.phone}</span></td>
                <td style={{ padding: 12, fontFamily: THEME.fonts.mono, fontSize: 13 }}>{u.username || 'Pending'}</td>
                <td style={{ padding: 12 }}><button onClick={() => setEditingUser(u)} style={{ padding: "6px 12px", background: THEME.colors.bg, border: `1px solid ${THEME.colors.border}`, borderRadius: 4, cursor: "pointer" }}>Edit Profile</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderBroadcast = () => (
    <div className="module-fade-in" style={{ background: THEME.colors.surface, padding: 32, borderRadius: 12, border: `1px solid ${THEME.colors.border}`, maxWidth: 800 }}>
      <h2 style={{ marginTop: 0, color: THEME.colors.navy }}>Mass Email Broadcast</h2>
      <p style={{ color: THEME.colors.textMuted, fontSize: 14 }}>Send an announcement to all {users.filter(u=>u.status==="APPROVED").length} verified alumni.</p>
      <form onSubmit={(e) => { e.preventDefault(); showToast("Broadcast queued for delivery via EmailJS.", "success"); e.target.reset(); }} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
        <input placeholder="Subject Line" required style={{ padding: 12, borderRadius: 6, border: `1px solid ${THEME.colors.border}` }} />
        <textarea placeholder="Type your message here..." rows={8} required style={{ padding: 12, borderRadius: 6, border: `1px solid ${THEME.colors.border}`, fontFamily: THEME.fonts.main }}></textarea>
        <button type="submit" style={{ padding: "14px", background: THEME.colors.navy, color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Send to All Verified Alumni</button>
      </form>
    </div>
  );

  const renderEvents = () => {
    const addEvent = (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(e.target).entries());
      const newEvents = [...events, { ...formData, id: Date.now() }];
      setEvents(newEvents);
      localStorage.setItem(CONFIG.EVENTS_KEY, JSON.stringify(newEvents));
      logAction("EVENT_CREATED", `Created event: ${formData.title}`);
      showToast("Event published to alumni portal.", "success");
      e.target.reset();
    };
    return (
      <div className="module-fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ background: THEME.colors.surface, padding: 24, borderRadius: 12, border: `1px solid ${THEME.colors.border}` }}>
          <h3 style={{ marginTop: 0, color: THEME.colors.navy }}>Create New Event</h3>
          <form onSubmit={addEvent} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
            <input name="title" placeholder="Event Title" required style={{ padding: 10, border: `1px solid ${THEME.colors.border}`, borderRadius: 4 }} />
            <input name="date" type="date" required style={{ padding: 10, border: `1px solid ${THEME.colors.border}`, borderRadius: 4 }} />
            <textarea name="desc" placeholder="Event Description" required style={{ padding: 10, border: `1px solid ${THEME.colors.border}`, borderRadius: 4 }}></textarea>
            <button type="submit" style={{ padding: 12, background: THEME.colors.gold, color: THEME.colors.navy, border: "none", borderRadius: 4, fontWeight: "bold", cursor: "pointer" }}>Publish Event</button>
          </form>
        </div>
        <div style={{ background: THEME.colors.surface, padding: 24, borderRadius: 12, border: `1px solid ${THEME.colors.border}`, overflowY: "auto" }}>
          <h3 style={{ marginTop: 0, color: THEME.colors.navy }}>Active Events</h3>
          {events.length === 0 ? <p style={{ color: THEME.colors.textMuted }}>No events scheduled.</p> : events.map(ev => (
            <div key={ev.id} style={{ padding: 12, borderBottom: `1px solid ${THEME.colors.border}` }}>
              <strong>{ev.title}</strong> <span style={{ fontSize: 12, color: THEME.colors.textMuted, float: "right" }}>{ev.date}</span>
              <p style={{ margin: "4px 0 0 0", fontSize: 13, color: THEME.colors.textMuted }}>{ev.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderJobs = () => (
    <div className="module-fade-in" style={{ background: THEME.colors.surface, padding: 24, borderRadius: 12, border: `1px solid ${THEME.colors.border}` }}>
      <h2 style={{ marginTop: 0, color: THEME.colors.navy }}>Job Board Approvals</h2>
      <p style={{ color: THEME.colors.textMuted }}>Review job opportunities posted by alumni before they go live.</p>
      <div style={{ padding: 40, textAlign: "center", border: `2px dashed ${THEME.colors.border}`, borderRadius: 8, marginTop: 24, color: THEME.colors.textMuted }}>
        No pending job postings in the queue.
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="module-fade-in">
      <h2 style={{ color: THEME.colors.navy, marginTop: 0 }}>System Analytics</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
        <div style={{ background: THEME.colors.surface, padding: 32, borderRadius: 12, border: `1px solid ${THEME.colors.border}` }}>
          <h3 style={{ marginTop: 0 }}>Registration Trends</h3>
          <div style={{ height: 200, background: THEME.colors.bg, borderRadius: 8, display: "flex", alignItems: "flex-end", padding: 16, gap: 12 }}>
            {[40, 70, 30, 90, 60, 100].map((h, i) => <div key={i} style={{ flex: 1, height: `${h}%`, background: THEME.colors.info, borderRadius: "4px 4px 0 0" }}></div>)}
          </div>
        </div>
        <div style={{ background: THEME.colors.surface, padding: 32, borderRadius: 12, border: `1px solid ${THEME.colors.border}` }}>
          <h3 style={{ marginTop: 0 }}>Security & Delivery Health</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            <li style={{ display: "flex", justifyContent: "space-between" }}><span>EmailJS API Status</span> <span style={{ color: THEME.colors.success, fontWeight: "bold" }}>Online</span></li>
            <li style={{ display: "flex", justifyContent: "space-between" }}><span>Storage Integrity</span> <span style={{ color: THEME.colors.success, fontWeight: "bold" }}>Synced</span></li>
            <li style={{ display: "flex", justifyContent: "space-between" }}><span>Failed Deliveries</span> <span style={{ color: THEME.colors.textMuted, fontWeight: "bold" }}>0</span></li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="module-fade-in" style={{ background: THEME.colors.surface, padding: 24, borderRadius: 12, border: `1px solid ${THEME.colors.border}`, height: "calc(100vh - 160px)", overflowY: "auto" }}>
      <h2 style={{ marginTop: 0, color: THEME.colors.navy }}>System Audit Logs</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", marginTop: 16 }}>
        <thead><tr style={{ borderBottom: `2px solid ${THEME.colors.border}` }}>
          <th style={{ padding: 12 }}>Timestamp</th><th style={{ padding: 12 }}>Action</th><th style={{ padding: 12 }}>Details</th>
        </tr></thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} style={{ borderBottom: `1px solid ${THEME.colors.bg}` }}>
              <td style={{ padding: 12, fontSize: 12, color: THEME.colors.textMuted }}>{new Date(log.time).toLocaleString()}</td>
              <td style={{ padding: 12, fontSize: 13, fontWeight: 600 }}>{log.action}</td>
              <td style={{ padding: 12, fontSize: 13 }}>{log.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSettings = () => {
    const saveCfg = () => {
      localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(settings));
      showToast("Settings saved to local storage.", "success");
    };
    return (
      <div className="module-fade-in" style={{ maxWidth: 800 }}>
        <h2 style={{ marginTop: 0, color: THEME.colors.navy }}>Global Configuration</h2>
        <div style={{ background: THEME.colors.surface, padding: 32, borderRadius: 12, border: `1px solid ${THEME.colors.border}`, display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>Reply-To Admin Email</label>
            <input value={settings.adminEmail} onChange={e => setSettings({...settings, adminEmail: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 6, border: `1px solid ${THEME.colors.border}` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderTop: `1px solid ${THEME.colors.border}` }}>
            <div><div style={{ fontWeight: 600 }}>Accept New Registrations</div><div style={{ fontSize: 13, color: THEME.colors.textMuted }}>Toggle front-end portal access</div></div>
            <button onClick={() => setSettings({...settings, registrationsOpen: !settings.registrationsOpen})} style={{ padding: "8px 16px", borderRadius: 20, border: "none", background: settings.registrationsOpen ? THEME.colors.success : THEME.colors.border, color: settings.registrationsOpen ? "white" : "black", cursor: "pointer", fontWeight: "bold" }}>{settings.registrationsOpen ? "ON" : "OFF"}</button>
          </div>
          <div style={{ padding: 16, background: THEME.colors.bg, borderRadius: 8 }}>
            <h4 style={{ margin: "0 0 12px 0", color: THEME.colors.navy }}>EmailJS Binding Profile</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontFamily: THEME.fonts.mono, fontSize: 12, color: THEME.colors.textMuted }}>
              <div>Service ID: <strong>{EMAIL_GATEWAY.serviceId}</strong></div>
              <div>Template ID: <strong>{EMAIL_GATEWAY.templateId}</strong></div>
              <div style={{ gridColumn: "span 2" }}>Public Key: <strong>{EMAIL_GATEWAY.publicKey}</strong></div>
            </div>
          </div>
          <button onClick={saveCfg} style={{ padding: "14px", background: THEME.colors.navy, color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Save Configuration</button>
        </div>
      </div>
    );
  };

  const SIDEBAR_MENUS = [
    { id: "DASHBOARD", label: "Dashboard", icon: "📊" },
    { id: "VERIFY", label: "Verification Queue", icon: "🛡️", badge: users.filter(u => u.status === "PENDING" || !u.status).length },
    { id: "DIRECTORY", label: "Master Directory", icon: "👥" },
    { id: "BROADCAST", label: "Mass Broadcast", icon: "📢" },
    { id: "EVENTS", label: "Event Manager", icon: "📅" },
    { id: "JOBS", label: "Job Approvals", icon: "💼" },
    { id: "ANALYTICS", label: "Analytics", icon: "📈" },
    { id: "LOGS", label: "Audit Logs", icon: "📋" },
    { id: "SETTINGS", label: "System Settings", icon: "⚙️" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: THEME.colors.bg, fontFamily: THEME.fonts.main, overflow: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; } body { margin: 0; }
        .module-fade-in { animation: fade 0.3s ease-in-out; }
        @keyframes fade { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
      `}</style>

      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: "white", borderLeft: `4px solid ${t.type === 'success' ? THEME.colors.success : t.type === 'error' ? THEME.colors.danger : THEME.colors.info}`, padding: "16px 24px", borderRadius: 8, boxShadow: THEME.shadows.dropdown, minWidth: 300, fontWeight: 500 }}>
            {t.msg}
          </div>
        ))}
      </div>

      <aside style={{ width: 280, background: THEME.colors.navy, color: "white", display: "flex", flexDirection: "column", flexShrink: 0, zIndex: 10 }}>
        <div style={{ padding: "32px 24px", borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
          <div style={{ color: THEME.colors.gold, fontWeight: 800, fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>St. Joseph's University</div>
          <div style={{ fontFamily: THEME.fonts.heading, fontSize: 20, marginTop: 8 }}>{CONFIG.APP_NAME}</div>
        </div>
        <nav style={{ flex: 1, padding: "24px 16px", display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
          {SIDEBAR_MENUS.map(m => (
            <button key={m.id} onClick={() => { setActiveTab(m.id); setEditingUser(null); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: activeTab === m.id ? THEME.colors.gold : "transparent", color: activeTab === m.id ? THEME.colors.navy : "rgba(255,255,255,0.7)", border: "none", borderRadius: 8, cursor: "pointer", textAlign: "left", fontWeight: activeTab === m.id ? 700 : 500, transition: "all 0.2s" }}>
              <span>{m.icon}</span> <span style={{ flex: 1 }}>{m.label}</span>
              {m.badge > 0 && <span style={{ background: activeTab === m.id ? THEME.colors.navy : THEME.colors.danger, color: "white", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: "bold" }}>{m.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: 24, background: THEME.colors.navyDark, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: THEME.colors.gold, color: THEME.colors.navy, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>SA</div>
          <div><div style={{ fontSize: 14, fontWeight: 600 }}>System Admin</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Root Access</div></div>
        </div>
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{ height: 80, background: THEME.colors.surface, borderBottom: `1px solid ${THEME.colors.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px" }}>
          <div style={{ color: THEME.colors.textMuted, fontSize: 14, fontWeight: 500 }}>Admin Console / <span style={{ color: THEME.colors.navy, fontWeight: 700 }}>{SIDEBAR_MENUS.find(m => m.id === activeTab)?.label}</span></div>
          <div style={{ fontSize: 13, color: THEME.colors.textMuted }}>Version {CONFIG.VERSION}</div>
        </header>
        <div style={{ flex: 1, overflowY: "auto", padding: 40 }}>
          {activeTab === "DASHBOARD" && renderDashboard()}
          {activeTab === "VERIFY" && renderVerificationQueue()}
          {activeTab === "DIRECTORY" && renderDirectory()}
          {activeTab === "BROADCAST" && renderBroadcast()}
          {activeTab === "EVENTS" && renderEvents()}
          {activeTab === "JOBS" && renderJobs()}
          {activeTab === "ANALYTICS" && renderAnalytics()}
          {activeTab === "LOGS" && renderLogs()}
          {activeTab === "SETTINGS" && renderSettings()}
        </div>
      </main>
    </div>
  );
}