import React, { useState, useEffect, useReducer, useRef, useMemo } from 'react';

/**
 * ===================================================================================================
 * SJU ALUMNI REQUESTS SYSTEM - ENTERPRISE EDITION (v26.0)
 * ===================================================================================================
 * * [[ LOGIC UPDATE ]]
 * * 1. REQUEST FLOW:
 * - User clicks "Connect" -> Status: PENDING_OUTGOING
 * - Simulated User B sees "Accept" -> Status: PENDING_INCOMING
 * - User B Accepts -> Status: CONNECTED
 * * 2. PRIVACY UNLOCK:
 * - Email/Phone/LinkedIn hidden by default (SecurityLayer).
 * - Revealed ONLY when status === 'CONNECTED'.
 * * 3. TABS:
 * - "My Network": Connected users (Details Visible).
 * - "Requests": Incoming invitations (Action: Accept/Ignore).
 * - "Grow Network": New people (Action: Connect).
 * * ===================================================================================================
 */

// --- 1. GLOBAL CONFIGURATION & THEME ---

const CONFIG = {
  THEME: {
    ROYAL: '#003366',    // SJU Primary
    ROYAL_DARK: '#002244',
    ROYAL_LIGHT: '#e6efff',
    GOLD: '#FFCC00',     // SJU Accent
    GOLD_HOVER: '#e6b800',
    SLATE_900: '#0f172a',
    SLATE_700: '#334155',
    SLATE_500: '#64748b',
    SLATE_200: '#e2e8f0',
    BG_MAIN: '#f8fafc',
    WHITE: '#ffffff',
    SUCCESS: '#10b981',  // Emerald
    DANGER: '#ef4444',   // Red
    INFO: '#3b82f6',     // Blue
    GLASS: 'rgba(255, 255, 255, 0.85)'
  },
  ANIMATION: {
    FAST: '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    SLOW: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  CONSTANTS: {
    MAX_TOASTS: 5,
    CHAT_LATENCY: 1500, // ms
    AUTO_ACCEPT_DELAY: 4000 // ms (Simulation of Student B accepting)
  }
};

// --- 2. ENTERPRISE DATA LAKE (MOCK DB) ---

const DB = {
  ACCEPTED_DATABASE: [
    {
      id: "db-conn-001",
      name: "Rahul Dravid",
      role: "Senior Engineer",
      company: "Google",
      location: "Bengaluru",
      batch: 2018,
      department: "Computer Science",
      email: "rahul.dravid.2018@alumni.sju.edu",
      phone: "+91 98765 43210",
      linkedin: "linkedin.com/in/rahuldravid",
      status: "CONNECTED",
      mutual: 45,
      skills: ["System Design", "Java", "Cloud"],
      avatar: "https://ui-avatars.com/api/?name=Rahul+Dravid&background=003366&color=fff",
      isOnline: true
    }
  ]
};

// --- 3. VIRTUAL SYNTHESIS ENGINE (VSE GEN-7) ---

class VSE {
  static firstNames = ["Aditya", "Rohan", "Anjali", "Vikram", "Sneha", "Kavita", "Arjun", "Zara", "Ishaan", "Diya"];
  static lastNames = ["Sharma", "Reddy", "Iyer", "Patel", "Singh", "Nair", "Gowda", "Verma", "Rao", "Kumar"];
  static roles = ["Software Engineer", "Product Manager", "Data Scientist", "UX Designer", "Marketing Head"];
  static companies = ["Google", "Microsoft", "Amazon", "SJU Inc", "Tesla", "Infosys", "Wipro"];
  
  static pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  
  static generateAvatar(seed) {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=003366&textColor=FFCC00`;
  }

  static generateUser(id, status) {
    const fname = this.pick(this.firstNames);
    const lname = this.pick(this.lastNames);
    const batch = 2010 + Math.floor(Math.random() * 15);
    
    return {
      id: id,
      name: `${fname} ${lname}`,
      role: this.pick(this.roles),
      company: this.pick(this.companies),
      batch: batch,
      email: `${fname.toLowerCase()}.${lname.toLowerCase()}.${batch}@alumni.sju.edu`,
      phone: `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)}`,
      linkedin: `linkedin.com/in/${fname}${lname}${batch}`,
      status: status,
      mutual: Math.floor(Math.random() * 50) + 1,
      avatar: this.generateAvatar(`${fname}${lname}`),
      isOnline: Math.random() > 0.7
    };
  }

  static generateNetwork() {
    const network = [];
    DB.ACCEPTED_DATABASE.forEach(user => network.push(user)); // Database (Connected)
    for (let i = 0; i < 5; i++) network.push(this.generateUser(`inc-${i}`, 'PENDING_INCOMING')); // Requests received
    for (let i = 0; i < 15; i++) network.push(this.generateUser(`rec-${i}`, 'NONE')); // Discover
    return network;
  }
}

// --- 4. STYLES ENGINE ---

const styles = {
  wrapper: { backgroundColor: CONFIG.THEME.BG_MAIN, minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: CONFIG.THEME.SLATE_900 },
  header: { background: `linear-gradient(135deg, ${CONFIG.THEME.ROYAL} 0%, ${CONFIG.THEME.ROYAL_DARK} 100%)`, padding: '60px 0 100px 0', color: CONFIG.THEME.WHITE },
  container: { maxWidth: '1440px', margin: '0 auto', padding: '0 30px', position: 'relative', zIndex: 10 },
  mainGrid: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px', marginTop: '-60px', alignItems: 'start' },
  
  sidebar: { backgroundColor: CONFIG.THEME.WHITE, borderRadius: '16px', boxShadow: '0 20px 40px -5px rgba(0,0,0,0.1)', position: 'sticky', top: '20px', border: `1px solid ${CONFIG.THEME.SLATE_200}`, overflow: 'hidden' },
  navItem: (active) => ({ padding: '16px 25px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: active ? CONFIG.THEME.ROYAL_LIGHT : 'transparent', color: active ? CONFIG.THEME.ROYAL : CONFIG.THEME.SLATE_500, borderLeft: active ? `4px solid ${CONFIG.THEME.ROYAL}` : '4px solid transparent', fontWeight: active ? '700' : '500', fontSize: '0.95rem' }),
  
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '25px' },
  card: { backgroundColor: CONFIG.THEME.WHITE, borderRadius: '16px', border: `1px solid ${CONFIG.THEME.SLATE_200}`, overflow: 'hidden', transition: 'all 0.3s', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  cardHeader: { padding: '25px', borderBottom: `1px solid ${CONFIG.THEME.BG_MAIN}`, position: 'relative', background: 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)' },
  
  avatarRing: { width: '70px', height: '70px', borderRadius: '50%', padding: '3px', background: `linear-gradient(135deg, ${CONFIG.THEME.GOLD} 0%, ${CONFIG.THEME.ROYAL} 100%)`, marginBottom: '15px' },
  avatar: { width: '100%', height: '100%', borderRadius: '50%', border: '3px solid white', backgroundColor: 'white', objectFit: 'cover' },
  
  // Security Layer Styles
  privateSection: { padding: '20px 25px', backgroundColor: '#ffffff', flex: 1 },
  dataRow: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', fontSize: '0.9rem', color: CONFIG.THEME.SLATE_500 },
  blurContainer: { position: 'relative', display: 'inline-block', userSelect: 'none' },
  blurredText: { filter: 'blur(6px)', opacity: 0.6, pointerEvents: 'none' },
  lockOverlay: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', gap: '6px', color: CONFIG.THEME.SLATE_700, fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', whiteSpace: 'nowrap', textShadow: '0 0 10px white' },
  
  actionFooter: { padding: '20px 25px', borderTop: `1px solid ${CONFIG.THEME.SLATE_200}`, display: 'flex', gap: '12px', backgroundColor: '#f8fafc' },
  btnPrimary: { flex: 1, backgroundColor: CONFIG.THEME.ROYAL, color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem' },
  btnSecondary: { flex: 1, backgroundColor: 'white', color: CONFIG.THEME.ROYAL, border: `2px solid ${CONFIG.THEME.SLATE_200}`, padding: '12px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' },
  
  toastContainer: { position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 2000, display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' },
  toast: (type) => ({ backgroundColor: '#1e293b', color: 'white', padding: '12px 25px', borderRadius: '50px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '12px', animation: 'fadeInUp 0.3s ease-out', borderLeft: `4px solid ${type === 'success' ? CONFIG.THEME.SUCCESS : type === 'info' ? CONFIG.THEME.INFO : CONFIG.THEME.DANGER}`, minWidth: '300px' })
};

// --- 5. ATOMIC COMPONENTS ---

const SecurityLayer = ({ children, isLocked, placeholder }) => {
  if (!isLocked) return <>{children}</>;
  return (
    <div style={styles.blurContainer}>
      <span style={styles.blurredText}>{placeholder || 'Sensitive Info'}</span>
      <div style={styles.lockOverlay}><i className="bi bi-lock-fill"></i> Connect to View</div>
    </div>
  );
};

const SidebarTab = ({ icon, label, active, badge, onClick }) => (
  <div style={styles.navItem(active)} onClick={onClick}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      <i className={`bi ${icon}`} style={{ fontSize: '1.2rem' }}></i> {label}
    </div>
    {badge > 0 && <span style={{ backgroundColor: CONFIG.THEME.DANGER, color: 'white', borderRadius: '50px', padding: '2px 8px', fontSize: '0.7rem', fontWeight: '800' }}>{badge}</span>}
  </div>
);

const ConnectionCard = ({ user, onAction }) => {
  const isConnected = user.status === 'CONNECTED';
  const isIncoming = user.status === 'PENDING_INCOMING';
  const isOutgoing = user.status === 'PENDING_OUTGOING';

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.avatarRing}><img src={user.avatar} alt={user.name} style={styles.avatar} /></div>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.15rem', color: CONFIG.THEME.ROYAL }}>{user.name}</h3>
        <p style={{ margin: 0, fontSize: '0.85rem', color: CONFIG.THEME.SLATE_500 }}>{user.role} at {user.company}</p>
        <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#94a3b8' }}><i className="bi bi-people-fill"></i> {user.mutual} Mutuals</div>
      </div>

      <div style={styles.privateSection}>
        <div style={styles.dataRow}>
          <i className="bi bi-envelope-fill" style={{ color: CONFIG.THEME.SLATE_500 }}></i>
          <SecurityLayer isLocked={!isConnected} placeholder="hidden.email@sju.edu">
            <span style={{ fontWeight: '600', color: CONFIG.THEME.SLATE_900 }}>{user.email}</span>
          </SecurityLayer>
        </div>
        <div style={styles.dataRow}>
          <i className="bi bi-telephone-fill" style={{ color: CONFIG.THEME.SLATE_500 }}></i>
          <SecurityLayer isLocked={!isConnected} placeholder="+91 99999 99999">
            <span style={{ fontWeight: '600', color: CONFIG.THEME.SLATE_900 }}>{user.phone}</span>
          </SecurityLayer>
        </div>
      </div>

      <div style={styles.actionFooter}>
        {isConnected ? (
          <button style={styles.btnPrimary}><i className="bi bi-chat-dots-fill"></i> Message</button>
        ) : isIncoming ? (
          <>
            <button style={styles.btnSecondary} onClick={() => onAction(user.id, 'IGNORE')}>Ignore</button>
            <button style={styles.btnPrimary} onClick={() => onAction(user.id, 'ACCEPT')}>Accept</button>
          </>
        ) : isOutgoing ? (
          <button style={{ ...styles.btnSecondary, cursor: 'default', backgroundColor: '#f1f5f9', color: '#94a3b8' }} disabled>Pending</button>
        ) : (
          <button style={styles.btnSecondary} onClick={() => onAction(user.id, 'CONNECT')}>Connect</button>
        )}
      </div>
    </div>
  );
};

const Toast = ({ notifications, close }) => (
  <div style={styles.toastContainer}>
    {notifications.map(n => (
      <div key={n.id} style={styles.toast(n.type)}>
        <i className={`bi ${n.type === 'error' ? 'bi-x-circle-fill' : 'bi-check-circle-fill'}`} style={{fontSize: '1.4rem', color: n.type === 'error' ? CONFIG.THEME.DANGER : CONFIG.THEME.SUCCESS}}></i>
        <span>{n.message}</span>
        <button onClick={() => close(n.id)} style={{background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer', color:'#cbd5e1'}}>&times;</button>
      </div>
    ))}
  </div>
);

// --- 6. MAIN CONTROLLER ---

const Requests = () => {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('grow');
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    setUsers(VSE.generateNetwork());
  }, []);

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message: msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleAction = (id, type) => {
    const user = users.find(u => u.id === id);
    
    if (type === 'CONNECT') {
      setUsers(users.map(u => u.id === id ? { ...u, status: 'PENDING_OUTGOING' } : u));
      addToast(`Request sent to ${user.name}`);
      
      // SIMULATION: Student B accepts after delay
      setTimeout(() => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'CONNECTED' } : u));
        addToast(`${user.name} accepted your request!`, 'info');
      }, CONFIG.CONSTANTS.AUTO_ACCEPT_DELAY);
    } 
    else if (type === 'ACCEPT') {
      setUsers(users.map(u => u.id === id ? { ...u, status: 'CONNECTED' } : u));
      addToast(`Connected with ${user.name}`);
    } 
    else if (type === 'IGNORE') {
      setUsers(users.map(u => u.id === id ? { ...u, status: 'NONE' } : u));
    }
  };

  const filteredUsers = useMemo(() => {
    if (activeTab === 'network') return users.filter(u => u.status === 'CONNECTED');
    if (activeTab === 'requests') return users.filter(u => u.status === 'PENDING_INCOMING');
    return users.filter(u => u.status === 'NONE');
  }, [users, activeTab]);

  return (
    <div style={styles.wrapper}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .hover-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-color: ${CONFIG.THEME.ROYAL}; }
      `}</style>
      
      <div style={styles.header}>
        <div style={styles.container}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '16px', backdropFilter: 'blur(5px)' }}>
              <i className="bi bi-diagram-3-fill" style={{ fontSize: '2.5rem', color: CONFIG.THEME.GOLD }}></i>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800' }}>Network & Requests</h1>
              <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontSize: '1.1rem' }}>Manage connections and view incoming requests.</p>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.mainGrid}>
          <div style={styles.sidebar}>
            <div style={styles.sidebarHeader}><h4 style={{ margin: 0, color: CONFIG.THEME.ROYAL, fontWeight: '800' }}>MENU</h4></div>
            <div style={styles.sidebarMenu}>
              <SidebarTab icon="bi-people-fill" label="My Network" active={activeTab === 'network'} badge={users.filter(u => u.status === 'CONNECTED').length} onClick={() => setActiveTab('network')} />
              <SidebarTab icon="bi-person-plus-fill" label="Requests" active={activeTab === 'requests'} badge={users.filter(u => u.status === 'PENDING_INCOMING').length} onClick={() => setActiveTab('requests')} />
              <SidebarTab icon="bi-globe" label="Grow Network" active={activeTab === 'grow'} badge={0} onClick={() => setActiveTab('grow')} />
            </div>
          </div>

          <div style={styles.contentArea}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: CONFIG.THEME.ROYAL }}>
                {activeTab === 'network' && 'Your Connections'}
                {activeTab === 'requests' && 'Pending Invitations'}
                {activeTab === 'grow' && 'People You May Know'}
              </h2>
            </div>

            {filteredUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px', backgroundColor: 'white', borderRadius: '16px', border: `1px solid ${CONFIG.THEME.SLATE_200}` }}>
                <i className="bi bi-inbox" style={{ fontSize: '4rem', color: '#cbd5e1' }}></i>
                <h3 style={{ marginTop: '20px', color: '#64748b' }}>No items found</h3>
              </div>
            ) : (
              <div style={styles.cardGrid}>
                {filteredUsers.map(user => (
                  <ConnectionCard key={user.id} user={user} onAction={handleAction} onMessage={() => addToast('Chat opening... (Simulated)', 'info')} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {toasts.length > 0 && <Toast notifications={toasts} close={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />}
    </div>
  );
};

export default Requests;