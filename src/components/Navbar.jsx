import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

/**
 * ==================================================================================
 * SJU GLOBAL NAVIGATION - ENTERPRISE EDITION (v6.0 - Dynamic Logic)
 * ==================================================================================
 * FEATURES:
 * 1. Role-Based Navigation:
 * - Admin: Home, Directory, Mentorship, Jobs (4 Tabs).
 * - Alumni: Home, Directory, Mentorship, Jobs, Connections, Requests (6 Tabs).
 * 2. Animations: Enhanced spring transitions for dropdowns and tab underlines.
 */

// --- STYLES SYSTEM ---
const styles = {
  nav: {
    backgroundColor: '#003366', // Royal Blue
    borderBottom: '4px solid #FFCC00', // Gold Band
    padding: '0.8rem 2rem',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 1050,
    transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
    boxShadow: '0 4px 25px rgba(0,0,0,0.2)',
  },
  navScrolled: {
    padding: '0.6rem 2rem',
    backgroundColor: 'rgba(0, 51, 102, 0.95)',
    backdropFilter: 'blur(12px)',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // -- BRANDING --
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    textDecoration: 'none',
  },
  logoBox: {
    backgroundColor: '#ffffff',
    color: '#003366',
    width: '45px',
    height: '45px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.6rem',
    fontWeight: '900',
    boxShadow: '0 0 15px rgba(255, 204, 0, 0.5)', // Gold Glow
    transition: 'transform 0.3s ease',
  },
  titleBox: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '1',
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: '1.5rem',
    fontWeight: '800',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    fontFamily: "'Segoe UI', sans-serif",
  },
  brandSubtitle: {
    color: '#FFCC00',
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginTop: '4px',
  },

  // -- DYNAMIC MENU --
  menu: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  link: {
    color: 'rgba(255, 255, 255, 0.8)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '10px 18px',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  linkActive: {
    color: '#FFCC00',
    fontWeight: '800',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  // -- AUTH SECTION --
  authGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginLeft: '30px',
    paddingLeft: '30px',
    borderLeft: '1px solid rgba(255,255,255,0.15)',
  },
  btnLogin: {
    background: 'transparent',
    color: '#ffffff',
    border: '2px solid rgba(255,255,255,0.4)',
    padding: '8px 28px',
    borderRadius: '50px',
    fontWeight: '700',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
  },
  userBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    position: 'relative',
  },
  userInfo: {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '0.95rem',
  },
  userRole: {
    color: '#FFCC00',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  avatar: {
    width: '42px',
    height: '42px',
    backgroundColor: '#FFCC00',
    color: '#003366',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '1.2rem',
    border: '2px solid rgba(255,255,255,0.2)',
    transition: 'transform 0.2s',
  },
  
  // -- DROPDOWN --
  dropdownMenu: {
    position: 'absolute',
    top: '140%',
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    minWidth: '240px',
    overflow: 'hidden',
    display: 'none',
    flexDirection: 'column',
    animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    zIndex: 2000,
    border: '1px solid rgba(0,0,0,0.05)',
  },
  dropdownItem: {
    padding: '14px 25px',
    color: '#334155',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'background 0.2s',
    borderBottom: '1px solid #f1f5f9',
  },
  dropdownItemDanger: {
    color: '#ef4444',
    fontWeight: '700',
  },
  
  // Mobile
  mobileToggle: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '2rem',
    cursor: 'pointer',
  }
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  const dropdownRef = useRef(null);

  // --- 1. AUTH & LOGIC ---
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("Auth Error", e);
        setUser(null);
      }
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [location]);

  // --- 2. SCROLL EFFECT ---
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // --- 3. RESIZE & CLICK OUTSIDE ---
  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- 4. DYNAMIC TABS GENERATOR ---
  const getNavItems = () => {
    // Default Base Tabs
    const tabs = [
      { name: 'Home', path: '/' },
      { name: 'Directory', path: '/directory' },
      { name: 'Mentorship', path: '/mentorship' },
      { name: 'Jobs', path: '/jobs' }
    ];

    // INJECT LOGIC: If User is logged in AND Role is ALUMNI -> Add Extra Tabs
    if (user && user.role === 'alumni') {
      tabs.push({ name: 'Connections', path: '/connections' });
      tabs.push({ name: 'Requests', path: '/requests' });
    }

    return tabs;
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
      setDropdownOpen(false);
    }
  };

  return (
    <>
      <nav style={{ ...styles.nav, ...(scrolled ? styles.navScrolled : {}) }}>
        <div style={styles.container}>
          
          {/* LOGO */}
          <Link to="/" style={styles.brandGroup} onClick={() => setMobileMenuOpen(false)}>
            <div style={styles.logoBox} className="hover-scale">S</div>
            <div style={styles.titleBox}>
              <span style={styles.brandTitle}>SJU ALUMNI</span>
              <span style={styles.brandSubtitle}>CONNECT & GROW</span>
            </div>
          </Link>

          {/* DESKTOP MENU (DYNAMIC) */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              
              {/* RENDER TABS BASED ON LOGIC */}
              <ul style={styles.menu}>
                {getNavItems().map((item) => (
                  <li key={item.name}>
                    <Link 
                      to={item.path} 
                      style={{
                        ...styles.link,
                        ...(location.pathname === item.path ? styles.linkActive : {})
                      }}
                      className="nav-link-hover"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* AUTH USER PROFILE */}
              <div style={styles.authGroup}>
                {user ? (
                  <div 
                    style={styles.userBox} 
                    ref={dropdownRef}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <div style={styles.userInfo}>
                      <span style={styles.userName}>{user.full_name || user.name}</span>
                      <span style={styles.userRole}>{user.role || "Alumni"}</span>
                    </div>
                    <div style={styles.avatar}>
                      {(user.full_name || user.name || "U").charAt(0).toUpperCase()}
                    </div>
                    
                    {/* DROPDOWN */}
                    <div style={{...styles.dropdownMenu, display: dropdownOpen ? 'flex' : 'none'}}>
                      <div style={{padding:'15px 25px', background:'#f8fafc', borderBottom:'1px solid #e2e8f0'}}>
                        <div style={{fontSize:'0.75rem', fontWeight:'700', color:'#94a3b8', marginBottom:'5px'}}>SIGNED IN AS</div>
                        <div style={{fontWeight:'800', color:'#003366'}}>{user.full_name}</div>
                      </div>
                      
                      {user.role === 'admin' && (
                        <Link to="/admin" style={{...styles.dropdownItem, color: '#003366'}}>
                          <i className="bi bi-shield-lock-fill"></i> Admin Console
                        </Link>
                      )}
                      
                      <Link to="/profile" style={styles.dropdownItem}>
                        <i className="bi bi-person-badge"></i> Public Profile
                      </Link>
                      <Link to="/settings" style={styles.dropdownItem}>
                        <i className="bi bi-gear-wide-connected"></i> Settings
                      </Link>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleLogout(); }} 
                        style={{...styles.dropdownItem, ...styles.dropdownItemDanger, justifyContent:'center', marginTop:'10px', background:'#fef2f2', borderTop:'1px solid #fee2e2', width:'100%', cursor:'pointer'}}
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link 
                    to="/login" 
                    style={styles.btnLogin}
                    className="login-btn-hover"
                  >
                    Login / Join
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* MOBILE TOGGLE */}
          <button 
            style={{...styles.mobileToggle, display: isMobile ? 'block' : 'none'}}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
          </button>

        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      {isMobile && mobileMenuOpen && (
        <div style={{
          position: 'fixed', top: '80px', left: 0, width: '100%', height: 'calc(100vh - 80px)',
          backgroundColor: 'rgba(0, 51, 102, 0.98)', backdropFilter: 'blur(15px)', zIndex: 1040,
          padding: '2rem', animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '20px'}}>
            {getNavItems().map(item => (
              <li key={item.name}>
                <Link 
                  to={item.path} 
                  style={{...styles.link, fontSize: '1.4rem', padding:'15px 0', borderBottom:'1px solid rgba(255,255,255,0.1)', width:'100%'}} 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            {!user && (
              <li style={{marginTop:'30px'}}>
                <Link to="/login" style={{...styles.btnLogin, width:'100%', textAlign:'center', display:'block', fontSize:'1.2rem', padding:'15px'}} onClick={() => setMobileMenuOpen(false)}>Login Now</Link>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* CSS ANIMATIONS */}
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        .hover-scale:hover { transform: scale(1.1); }
        .nav-link-hover:hover { background-color: rgba(255,255,255,0.15); color: #fff; }
        .login-btn-hover:hover { background-color: #ffffff; color: #003366 !important; }
        .dropdown-item:hover { background-color: #f8fafc; color: #003366; }
      `}</style>
    </>
  );
};

export default Navbar;