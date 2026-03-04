import React, { useState, useEffect, useReducer, useRef, useMemo } from 'react';

/**
 * ===================================================================================================
 * SJU ALUMNI CONNECTIONS - ENTERPRISE SOCIAL GRAPH (v25.1 - INTEGRATED DB)
 * ===================================================================================================
 * * [[ UPDATES IN v25.1 ]]
 * * 1. DATABASE INTEGRATION: Added `DB.ACCEPTED_DATABASE`.
 * * 2. SYNC ENGINE: VSE now merges "Database" connections with simulated nodes.
 * * 3. LOGIC: "My Network" tab now pulls verified accepted connections first.
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
    BOUNCE: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },
  CONSTANTS: {
    MAX_TOASTS: 5,
    CHAT_LATENCY: 1500, // ms
    AUTO_ACCEPT_DELAY: 3000 // ms (Simulation)
  }
};

// --- 2. ENTERPRISE DATA LAKE (MOCK DB) ---

const DB = {
  // *** NEW: DATABASE OF ACCEPTED CONNECTIONS ***
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
    },
    {
      id: "db-conn-002",
      name: "Priya Menon",
      role: "Data Scientist",
      company: "Amazon",
      location: "Hyderabad",
      batch: 2020,
      department: "Science",
      email: "priya.m.2020@alumni.sju.edu",
      phone: "+91 99887 77665",
      linkedin: "linkedin.com/in/priyamenon",
      status: "CONNECTED",
      mutual: 32,
      skills: ["Python", "TensorFlow", "AWS"],
      avatar: "https://ui-avatars.com/api/?name=Priya+M&background=003366&color=fff",
      isOnline: false
    },
    {
      id: "db-conn-003",
      name: "Amit Verma",
      role: "Founder",
      company: "TechStart",
      location: "Mumbai",
      batch: 2015,
      department: "Management",
      email: "amit.v.2015@alumni.sju.edu",
      phone: "+91 88888 11111",
      linkedin: "linkedin.com/in/amitverma",
      status: "CONNECTED",
      mutual: 12,
      skills: ["Leadership", "Strategy", "Sales"],
      avatar: "https://ui-avatars.com/api/?name=Amit+V&background=003366&color=fff",
      isOnline: true
    }
  ]
};

// --- 3. VIRTUAL SYNTHESIS ENGINE (VSE GEN-6) ---

class VSE {
  static firstNames = ["Aditya", "Rohan", "Anjali", "Vikram", "Sneha", "Kavita", "Arjun", "Zara", "Ishaan", "Diya", "Suresh", "Meera", "Zain", "Fatima", "David", "Sarah", "Emily", "Michael", "Jessica", "Daniel"];
  static lastNames = ["Sharma", "Reddy", "Iyer", "Patel", "Singh", "Nair", "Gowda", "Verma", "Rao", "Kumar", "Das", "Fernandes", "Khan", "Ahmed", "Wilson", "Taylor"];
  static roles = ["Software Engineer", "Product Manager", "Data Scientist", "UX Designer", "Marketing Head", "Founder", "Consultant", "HR Manager", "Financial Analyst", "DevOps Engineer"];
  static companies = ["Google", "Microsoft", "Amazon", "SJU Inc", "Tesla", "Infosys", "Wipro", "Zerodha", "Cred", "Swiggy", "Zomato", "Goldman Sachs", "McKinsey", "Deloitte"];
  static locations = ["Bengaluru", "Mumbai", "New York", "London", "Dubai", "Singapore", "San Francisco", "Delhi", "Pune", "Hyderabad"];
  static skills = ["React", "Node.js", "Python", "Java", "AWS", "Machine Learning", "Data Analysis", "Project Management", "Leadership", "Marketing", "Finance"];

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
      location: this.pick(this.locations),
      batch: batch,
      department: this.pick(["Computer Science", "Commerce", "Arts", "Management", "Science"]),
      email: `${fname.toLowerCase()}.${lname.toLowerCase()}.${batch}@alumni.sju.edu`,
      phone: `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)}`,
      linkedin: `linkedin.com/in/${fname}${lname}${batch}`,
      status: status,
      mutual: Math.floor(Math.random() * 50) + 1,
      skills: [this.pick(this.skills), this.pick(this.skills)],
      avatar: this.generateAvatar(`${fname}${lname}`),
      timestamp: Date.now() - Math.floor(Math.random() * 1000000000),
      isOnline: Math.random() > 0.7
    };
  }

  static generateNetwork() {
    const network = [];
    
    // 1. INJECT DATABASE CONNECTIONS (Accepted Users)
    // This pulls from the DB object to ensure specific people are always connected
    DB.ACCEPTED_DATABASE.forEach(user => {
        network.push(user);
    });

    // 2. Simulated Established Connections (Random)
    for (let i = 0; i < 12; i++) network.push(this.generateUser(`conn-${i}`, 'CONNECTED'));
    
    // 3. Incoming Requests
    for (let i = 0; i < 6; i++) network.push(this.generateUser(`inc-${i}`, 'PENDING_INCOMING'));
    
    // 4. Recommendations
    for (let i = 0; i < 20; i++) network.push(this.generateUser(`rec-${i}`, 'NONE'));
    
    return network;
  }
}

// --- 4. ENTERPRISE STYLING ENGINE ---

const styles = {
  // ... (Keeping the exact same styling as requested)
  wrapper: {
    backgroundColor: CONFIG.THEME.BG_MAIN,
    minHeight: '100vh',
    fontFamily: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    color: CONFIG.THEME.SLATE_900,
    overflowX: 'hidden',
  },
  header: {
    background: `linear-gradient(135deg, ${CONFIG.THEME.ROYAL} 0%, ${CONFIG.THEME.ROYAL_DARK} 100%)`,
    padding: '80px 0 140px 0',
    color: CONFIG.THEME.WHITE,
    position: 'relative',
    overflow: 'hidden',
  },
  headerPattern: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    opacity: 0.3,
  },
  container: {
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '0 30px',
    position: 'relative',
    zIndex: 10,
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '30px',
    marginTop: '-80px',
    alignItems: 'start',
  },
  sidebar: {
    backgroundColor: CONFIG.THEME.WHITE,
    borderRadius: '16px',
    boxShadow: '0 20px 40px -5px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: '20px',
    border: `1px solid ${CONFIG.THEME.SLATE_200}`,
    overflow: 'hidden',
  },
  sidebarHeader: {
    padding: '25px',
    borderBottom: `1px solid ${CONFIG.THEME.SLATE_200}`,
    backgroundColor: '#fafafa',
  },
  sidebarMenu: {
    padding: '10px 0',
  },
  navItem: (active) => ({
    padding: '16px 25px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: active ? CONFIG.THEME.ROYAL_LIGHT : 'transparent',
    color: active ? CONFIG.THEME.ROYAL : CONFIG.THEME.SLATE_500,
    borderLeft: active ? `4px solid ${CONFIG.THEME.ROYAL}` : '4px solid transparent',
    transition: CONFIG.ANIMATION.FAST,
    fontWeight: active ? '700' : '500',
    fontSize: '0.95rem',
  }),
  contentArea: {
    minHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '25px',
  },
  card: {
    backgroundColor: CONFIG.THEME.WHITE,
    borderRadius: '16px',
    border: `1px solid ${CONFIG.THEME.SLATE_200}`,
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  },
  cardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 20px 40px -10px rgba(0, 51, 102, 0.15)',
    borderColor: CONFIG.THEME.ROYAL,
  },
  cardHeader: {
    padding: '25px',
    borderBottom: `1px solid ${CONFIG.THEME.BG_MAIN}`,
    position: 'relative',
    background: 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)',
  },
  avatarRing: {
    width: '78px',
    height: '78px',
    borderRadius: '50%',
    padding: '3px',
    background: `linear-gradient(135deg, ${CONFIG.THEME.GOLD} 0%, ${CONFIG.THEME.ROYAL} 100%)`,
    marginBottom: '15px',
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '3px solid white',
    backgroundColor: 'white',
    objectFit: 'cover',
  },
  onlineDot: {
    position: 'absolute',
    bottom: '5px',
    right: '5px',
    width: '14px',
    height: '14px',
    backgroundColor: CONFIG.THEME.SUCCESS,
    border: '2px solid white',
    borderRadius: '50%',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  connectBadge: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    backgroundColor: '#ecfdf5',
    color: CONFIG.THEME.SUCCESS,
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: '1px solid #d1fae5',
  },
  privateSection: {
    padding: '20px 25px',
    backgroundColor: '#ffffff',
    flex: 1,
  },
  dataRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '15px',
    fontSize: '0.9rem',
    color: CONFIG.THEME.SLATE_500,
  },
  iconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    backgroundColor: '#f1f5f9',
    color: CONFIG.THEME.SLATE_500,
  },
  iconBoxActive: {
    backgroundColor: CONFIG.THEME.ROYAL_LIGHT,
    color: CONFIG.THEME.ROYAL,
  },
  blurContainer: {
    position: 'relative',
    display: 'inline-block',
    userSelect: 'none',
  },
  blurredText: {
    filter: 'blur(6px)',
    opacity: 0.6,
    pointerEvents: 'none',
  },
  lockOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: CONFIG.THEME.SLATE_700,
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    textShadow: '0 0 10px white',
  },
  actionFooter: {
    padding: '20px 25px',
    borderTop: `1px solid ${CONFIG.THEME.SLATE_200}`,
    display: 'flex',
    gap: '12px',
    backgroundColor: '#f8fafc',
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: CONFIG.THEME.ROYAL,
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: CONFIG.ANIMATION.FAST,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    boxShadow: '0 4px 6px rgba(0, 51, 102, 0.2)',
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: 'white',
    color: CONFIG.THEME.ROYAL,
    border: `2px solid ${CONFIG.THEME.SLATE_200}`,
    padding: '12px',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: CONFIG.ANIMATION.FAST,
    fontSize: '0.9rem',
  },
  chatWidget: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '380px',
    height: '520px',
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 25px 100px -20px rgba(0,0,0,0.4)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    border: `1px solid ${CONFIG.THEME.SLATE_200}`,
    overflow: 'hidden',
  },
  chatHeader: {
    padding: '20px',
    background: CONFIG.THEME.ROYAL,
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
  },
  chatBody: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  msgBubble: (isMe) => ({
    maxWidth: '85%',
    padding: '12px 16px',
    borderRadius: isMe ? '18px 18px 0 18px' : '18px 18px 18px 0',
    backgroundColor: isMe ? CONFIG.THEME.ROYAL : 'white',
    color: isMe ? 'white' : CONFIG.THEME.SLATE_900,
    alignSelf: isMe ? 'flex-end' : 'flex-start',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    fontSize: '0.9rem',
    lineHeight: '1.5',
    position: 'relative',
  }),
  chatInputArea: {
    padding: '15px',
    borderTop: `1px solid ${CONFIG.THEME.SLATE_200}`,
    display: 'flex',
    gap: '10px',
    backgroundColor: 'white',
  },
  typingIndicator: {
    fontSize: '0.7rem',
    color: '#94a3b8',
    marginBottom: '5px',
    marginLeft: '10px',
    fontStyle: 'italic',
  },
  toolbar: {
    backgroundColor: CONFIG.THEME.WHITE,
    padding: '20px',
    borderRadius: '16px',
    border: `1px solid ${CONFIG.THEME.SLATE_200}`,
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
  },
  toastContainer: {
    position: 'fixed',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 2000,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'center',
  },
  toast: (type) => ({
    backgroundColor: '#1e293b',
    color: 'white',
    padding: '12px 25px',
    borderRadius: '50px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    animation: 'fadeInUp 0.3s ease-out',
    borderLeft: `4px solid ${type === 'success' ? CONFIG.THEME.SUCCESS : type === 'info' ? CONFIG.THEME.INFO : CONFIG.THEME.DANGER}`,
    minWidth: '300px',
  }),
};

// --- 5. ATOMIC COMPONENTS ---

const SecurityLayer = ({ children, isLocked, placeholder }) => {
  if (!isLocked) return <>{children}</>;
  return (
    <div style={styles.blurContainer}>
      <span style={styles.blurredText}>{placeholder || 'Sensitive Information Hidden'}</span>
      <div style={styles.lockOverlay}>
        <i className="bi bi-lock-fill"></i> Connect to View
      </div>
    </div>
  );
};

const SidebarTab = ({ icon, label, active, badge, onClick }) => (
  <div style={styles.navItem(active)} onClick={onClick}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      <i className={`bi ${icon}`} style={{ fontSize: '1.2rem' }}></i>
      {label}
    </div>
    {badge > 0 && <span style={styles.badge}>{badge}</span>}
  </div>
);

const ConnectionCard = ({ user, onAction, onMessage }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const isConnected = user.status === 'CONNECTED';
  const isIncoming = user.status === 'PENDING_INCOMING';
  const isOutgoing = user.status === 'PENDING_OUTGOING';

  const cardStyle = { ...styles.card, ...(isHovered ? styles.cardHover : {}) };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.cardHeader}>
        {isConnected && (
          <div style={styles.connectBadge}>
            <i className="bi bi-shield-fill-check"></i> Connected
          </div>
        )}
        <div style={styles.avatarRing}>
          <img src={user.avatar} alt={user.name} style={styles.avatar} />
          {user.isOnline && <div style={styles.onlineDot} title="Online Now"></div>}
        </div>
        
        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.15rem', color: CONFIG.THEME.ROYAL }}>{user.name}</h3>
        <p style={{ margin: 0, fontSize: '0.85rem', color: CONFIG.THEME.SLATE_500, fontWeight: '500' }}>{user.role}</p>
        <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', fontWeight: '700', color: CONFIG.THEME.SLATE_900 }}>at {user.company}</p>
        
        <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <i className="bi bi-mortarboard-fill"></i> Batch of {user.batch}
          <span>•</span>
          <i className="bi bi-people-fill"></i> {user.mutual} Mutuals
        </div>
      </div>

      <div style={styles.privateSection}>
        <div style={styles.dataRow}>
          <div style={{ ...styles.iconBox, ...(isConnected ? styles.iconBoxActive : {}) }}>
            <i className="bi bi-envelope-fill"></i>
          </div>
          <SecurityLayer isLocked={!isConnected} placeholder="hidden.email@sju.edu">
            <span style={{ fontWeight: '600', color: CONFIG.THEME.SLATE_900 }}>{user.email}</span>
          </SecurityLayer>
        </div>

        <div style={styles.dataRow}>
          <div style={{ ...styles.iconBox, ...(isConnected ? styles.iconBoxActive : {}) }}>
            <i className="bi bi-telephone-fill"></i>
          </div>
          <SecurityLayer isLocked={!isConnected} placeholder="+91 99999 99999">
            <span style={{ fontWeight: '600', color: CONFIG.THEME.SLATE_900 }}>{user.phone}</span>
          </SecurityLayer>
        </div>

        <div style={styles.dataRow}>
          <div style={{ ...styles.iconBox, ...(isConnected ? { backgroundColor: '#0077b5', color: 'white' } : {}) }}>
            <i className="bi bi-linkedin"></i>
          </div>
          <SecurityLayer isLocked={!isConnected} placeholder="linkedin.com/in/user">
            <a href={`https://${user.linkedin}`} target="_blank" rel="noreferrer" style={{ color: CONFIG.THEME.ROYAL, textDecoration: 'none', fontWeight: '700' }}>View Profile</a>
          </SecurityLayer>
        </div>
      </div>

      <div style={styles.actionFooter}>
        {isConnected ? (
          <button style={styles.btnPrimary} onClick={() => onMessage(user)}>
            <i className="bi bi-chat-dots-fill"></i> Message
          </button>
        ) : isIncoming ? (
          <>
            <button style={{ ...styles.btnSecondary, color: CONFIG.THEME.SLATE_500, borderColor: CONFIG.THEME.SLATE_200 }} onClick={() => onAction(user.id, 'IGNORE')}>
              Ignore
            </button>
            <button style={styles.btnPrimary} onClick={() => onAction(user.id, 'ACCEPT')}>
              Accept Request
            </button>
          </>
        ) : isOutgoing ? (
          <button style={{ ...styles.btnSecondary, cursor: 'default', backgroundColor: '#f1f5f9', color: '#94a3b8' }} disabled>
            <i className="bi bi-clock-history me-2"></i> Pending
          </button>
        ) : (
          <button style={styles.btnSecondary} onClick={() => onAction(user.id, 'CONNECT')}>
            <i className="bi bi-person-plus-fill me-2"></i> Connect
          </button>
        )}
      </div>
    </div>
  );
};

const ChatWindow = ({ user, onClose }) => {
  const [msg, setMsg] = useState('');
  const [history, setHistory] = useState([
    { id: 1, text: `Hi ${user.name.split(' ')[0]}! I noticed we're both alumni of the ${user.batch} batch.`, isMe: true, time: '10:00 AM' },
    { id: 2, text: "Hey! Yes, great to connect. I was in the Commerce department. How about you?", isMe: false, time: '10:05 AM' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, isTyping]);

  const send = (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    
    const newMsg = { 
      id: Date.now(), 
      text: msg, 
      isMe: true, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setHistory(prev => [...prev, newMsg]);
    setMsg('');
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setHistory(prev => [...prev, { 
        id: Date.now(), 
        text: "That's interesting! Would love to hear more about your work at " + user.company + ".", 
        isMe: false, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    }, CONFIG.CONSTANTS.CHAT_LATENCY);
  };

  return (
    <div style={styles.chatWidget}>
      <div style={styles.chatHeader} onClick={() => {}}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <img src={user.avatar} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid white' }} alt="" />
            <div style={{ ...styles.onlineDot, width: '10px', height: '10px' }}></div>
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{user.name}</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{isTyping ? 'Typing...' : 'Active Now'}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', padding: '5px' }}>
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
      
      <div style={styles.chatBody} ref={scrollRef}>
        <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#94a3b8', margin: '10px 0', fontWeight: '600' }}>TODAY</div>
        {history.map(h => (
          <div key={h.id} style={styles.msgBubble(h.isMe)}>
            {h.text}
            <div style={{ fontSize: '0.65rem', marginTop: '4px', opacity: 0.7, textAlign: 'right' }}>{h.time}</div>
          </div>
        ))}
        {isTyping && (
          <div style={{...styles.msgBubble(false), fontStyle: 'italic', color: '#94a3b8'}}>
            <span className="typing-dots">Typing...</span>
          </div>
        )}
      </div>
      
      <form style={styles.chatInputArea} onSubmit={send}>
        <input 
          style={{ flex: 1, padding: '12px 18px', borderRadius: '25px', border: `1px solid ${CONFIG.THEME.SLATE_200}`, outline: 'none', backgroundColor: '#f8fafc' }} 
          placeholder="Type a message..."
          value={msg}
          onChange={e => setMsg(e.target.value)}
          autoFocus
        />
        <button type="submit" style={{ backgroundColor: CONFIG.THEME.ROYAL, color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <i className="bi bi-send-fill" style={{ marginLeft: '2px' }}></i>
        </button>
      </form>
    </div>
  );
};

// --- 6. MAIN COMPONENT (LOGIC CORE) ---

const Connections = () => {
  const initialState = {
    users: [],
    loading: true,
    activeTab: 'network', 
    searchQuery: '',
    activeChat: null,
    toasts: []
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case 'INIT_DATA':
        return { ...state, users: action.payload, loading: false };
      case 'SET_TAB':
        return { ...state, activeTab: action.payload, searchQuery: '' };
      case 'UPDATE_USER_STATUS':
        return {
          ...state,
          users: state.users.map(u => u.id === action.payload.id ? { ...u, status: action.payload.status } : u)
        };
      case 'SET_SEARCH':
        return { ...state, searchQuery: action.payload };
      case 'OPEN_CHAT':
        return { ...state, activeChat: action.payload };
      case 'CLOSE_CHAT':
        return { ...state, activeChat: null };
      case 'ADD_TOAST':
        return { ...state, toasts: [...state.toasts, { id: Date.now(), ...action.payload }] };
      case 'REMOVE_TOAST':
        return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const savedData = localStorage.getItem('sju_connections_v1');
    if (savedData) {
      // Refresh with DB connected users in case DB updated
      const loadedData = JSON.parse(savedData);
      // Merge DB accepted list if not present
      const existingIds = new Set(loadedData.map(u => u.id));
      const newFromDB = DB.ACCEPTED_DATABASE.filter(dbUser => !existingIds.has(dbUser.id));
      const mergedData = [...newFromDB, ...loadedData];
      dispatch({ type: 'INIT_DATA', payload: mergedData });
    } else {
      const data = VSE.generateNetwork();
      dispatch({ type: 'INIT_DATA', payload: data });
      localStorage.setItem('sju_connections_v1', JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    if (state.users.length > 0) {
      localStorage.setItem('sju_connections_v1', JSON.stringify(state.users));
    }
  }, [state.users]);

  useEffect(() => {
    if (state.toasts.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: state.toasts[0].id });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.toasts]);

  const filteredUsers = useMemo(() => {
    let list = [];
    // Sort logic: Accepted from DB first, then others
    const sortFn = (a, b) => {
        // Prioritize DB users in sorting
        const aIsDB = a.id.startsWith('db-conn');
        const bIsDB = b.id.startsWith('db-conn');
        if (aIsDB && !bIsDB) return -1;
        if (!aIsDB && bIsDB) return 1;
        return 0;
    };

    if (state.activeTab === 'network') list = state.users.filter(u => u.status === 'CONNECTED').sort(sortFn);
    else if (state.activeTab === 'requests') list = state.users.filter(u => u.status === 'PENDING_INCOMING');
    else if (state.activeTab === 'grow') list = state.users.filter(u => u.status === 'NONE');

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      return list.filter(u => u.name.toLowerCase().includes(q) || u.company.toLowerCase().includes(q));
    }
    return list;
  }, [state.users, state.activeTab, state.searchQuery]);

  const handleAction = (id, type) => {
    const user = state.users.find(u => u.id === id);
    
    if (type === 'CONNECT') {
      dispatch({ type: 'UPDATE_USER_STATUS', payload: { id, status: 'PENDING_OUTGOING' } });
      dispatch({ type: 'ADD_TOAST', payload: { msg: `Request sent to ${user.name}`, type: 'success' } });
      
      setTimeout(() => {
        dispatch({ type: 'UPDATE_USER_STATUS', payload: { id, status: 'CONNECTED' } });
        dispatch({ type: 'ADD_TOAST', payload: { msg: `${user.name} accepted your request!`, type: 'info' } });
      }, CONFIG.CONSTANTS.AUTO_ACCEPT_DELAY);
    } 
    else if (type === 'ACCEPT') {
      dispatch({ type: 'UPDATE_USER_STATUS', payload: { id, status: 'CONNECTED' } });
      dispatch({ type: 'ADD_TOAST', payload: { msg: `You are now connected with ${user.name}`, type: 'success' } });
    } 
    else if (type === 'IGNORE') {
      dispatch({ type: 'UPDATE_USER_STATUS', payload: { id, status: 'NONE' } });
      dispatch({ type: 'ADD_TOAST', payload: { msg: `Request ignored`, type: 'info' } });
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* 1. HEADER */}
      <div style={styles.header}>
        <div style={styles.headerPattern}></div>
        <div style={styles.container}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '16px', backdropFilter: 'blur(5px)' }}>
              <i className="bi bi-diagram-3-fill" style={{ fontSize: '2.5rem', color: CONFIG.THEME.GOLD }}></i>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px' }}>Connections Hub</h1>
              <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontSize: '1.1rem' }}>Manage your professional social graph and networking requests.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN LAYOUT */}
      <div style={styles.container}>
        <div style={styles.mainGrid}>
          
          {/* SIDEBAR NAVIGATION */}
          <div style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <h4 style={{ margin: 0, color: CONFIG.THEME.ROYAL, fontWeight: '800', fontSize: '0.9rem', letterSpacing: '1px' }}>MENU</h4>
            </div>
            <div style={styles.sidebarMenu}>
              <SidebarTab 
                icon="bi-people-fill" label="My Network" 
                active={state.activeTab === 'network'} 
                badge={state.users.filter(u => u.status === 'CONNECTED').length}
                onClick={() => dispatch({ type: 'SET_TAB', payload: 'network' })} 
              />
              <SidebarTab 
                icon="bi-person-plus-fill" label="Invitations" 
                active={state.activeTab === 'requests'} 
                badge={state.users.filter(u => u.status === 'PENDING_INCOMING').length}
                onClick={() => dispatch({ type: 'SET_TAB', payload: 'requests' })} 
              />
              <SidebarTab 
                icon="bi-globe" label="Grow Network" 
                active={state.activeTab === 'grow'} 
                badge={0}
                onClick={() => dispatch({ type: 'SET_TAB', payload: 'grow' })} 
              />
            </div>
            <div style={{ padding: '25px', backgroundColor: '#f8fafc', borderTop: `1px solid ${CONFIG.THEME.SLATE_200}` }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '10px', fontWeight: '600' }}>PROFILE COMPLETION</div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', backgroundColor: CONFIG.THEME.SUCCESS }}></div>
              </div>
              <div style={{ marginTop: '5px', fontSize: '0.75rem', color: CONFIG.THEME.SLATE_900, textAlign: 'right', fontWeight: '700' }}>85%</div>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div style={styles.contentArea}>
            
            {/* Toolbar */}
            <div style={{ backgroundColor: CONFIG.THEME.WHITE, padding: '20px', borderRadius: '16px', border: `1px solid ${CONFIG.THEME.SLATE_200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <div style={{ position: 'relative', width: '350px' }}>
                <i className="bi bi-search" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                <input 
                  style={{ width: '100%', padding: '12px 20px 12px 45px', borderRadius: '10px', border: `2px solid ${CONFIG.THEME.SLATE_200}`, outline: 'none', backgroundColor: '#f8fafc' }}
                  placeholder="Search by name, company, or batch..."
                  value={state.searchQuery}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
                />
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>
                {filteredUsers.length} Results Found
              </div>
            </div>

            {/* List Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: CONFIG.THEME.ROYAL }}>
                {state.activeTab === 'network' && 'Your Connections'}
                {state.activeTab === 'requests' && 'Pending Requests'}
                {state.activeTab === 'grow' && 'Recommended for You'}
              </div>
              {state.activeTab === 'requests' && filteredUsers.length > 0 && (
                <span style={{ fontSize: '0.8rem', color: CONFIG.THEME.INFO, cursor: 'pointer', fontWeight: '600' }} onClick={() => filteredUsers.forEach(u => handleAction(u.id, 'ACCEPT'))}>Accept All</span>
              )}
            </div>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px', backgroundColor: 'white', borderRadius: '16px', border: `1px solid ${CONFIG.THEME.SLATE_200}` }}>
                <i className="bi bi-people" style={{ fontSize: '4rem', color: '#cbd5e1' }}></i>
                <h3 style={{ marginTop: '20px', color: '#64748b' }}>No connections found</h3>
                <p style={{ color: '#94a3b8' }}>Try adjusting your search filters or explore the "Grow Network" tab.</p>
              </div>
            )}

            {/* Cards Grid */}
            <div style={styles.cardGrid}>
              {filteredUsers.map(user => (
                <ConnectionCard 
                  key={user.id} 
                  user={user} 
                  onAction={handleAction} 
                  onMessage={(u) => dispatch({ type: 'OPEN_CHAT', payload: u })} 
                />
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE OVERLAYS */}
      
      {/* Toast Notifications */}
      {state.toasts.length > 0 && (
        <div style={styles.toastContainer}>
          {state.toasts.map(t => (
            <div key={t.id} style={styles.toast(t.type)}>
              <i className={`bi ${t.type === 'success' ? 'bi-check-circle-fill' : 'bi-info-circle-fill'}`} style={{ color: t.type === 'success' ? CONFIG.THEME.SUCCESS : CONFIG.THEME.INFO }}></i>
              <span>{t.msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* Chat Window */}
      {state.activeChat && (
        <ChatWindow 
          user={state.activeChat} 
          onClose={() => dispatch({ type: 'CLOSE_CHAT' })} 
        />
      )}

      {/* GLOBAL CSS */}
      <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; borderRadius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        .typing-dots:after {
          content: ' .';
          animation: dots 1s steps(5, end) infinite;
        }
        @keyframes dots {
          0%, 20% { content: ' .'; }
          40% { content: ' ..'; }
          60% { content: ' ...'; }
          100% { content: ''; }
        }
      `}</style>
    </div>
  );
};

export default Connections;