import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // -- STATE MANAGEMENT --
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  
  // Real-time Settings State
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const dropdownRef = useRef(null);

  // --- 1. AUTH LOGIC ---
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // Fallback for demonstration if no user is logged in
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

  // --- 2. SCROLL & RESIZE EFFECTS ---
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onResize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992) setMobileMenuOpen(false);
    };
    
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- 3. CORE TABS (No extra role-based tabs) ---
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Directory', path: '/directory' },
    { name: 'Mentorship', path: '/mentorship' },
    { name: 'Jobs', path: '/jobs' }
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to securely log out?")) {
      localStorage.removeItem('user');
      setUser(null);
      setDropdownOpen(false);
      navigate('/login');
    }
  };

  // --- STYLES SYSTEM (Dynamic based on settings) ---
  const theme = {
    bg: highContrast ? '#001a33' : '#003366',
    accent: highContrast ? '#FFD700' : '#FFCC00',
    padding: compactMode ? '0.4rem 2rem' : '0.8rem 2rem',
  };

  const styles = {
    nav: {
      backgroundColor: theme.bg,
      borderBottom: `4px solid ${theme.accent}`,
      padding: scrolled ? '0.5rem 2rem' : theme.padding,
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 1050,
      transition: 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
      boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.3)' : '0 4px 25px rgba(0,0,0,0.2)',
      fontFamily: "'Lora', serif",
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    brandTitle: {
      color: '#ffffff',
      fontSize: '1.6rem',
      fontWeight: '700',
      letterSpacing: '1.5px',
      textTransform: 'uppercase',
      fontFamily: "'Lora', serif",
    },
    brandSubtitle: {
      color: theme.accent,
      fontSize: '0.75rem',
      fontWeight: '600',
      letterSpacing: '3px',
      textTransform: 'uppercase',
      marginTop: '2px',
      fontFamily: "'Lora', serif",
    },
    logoBox: {
      backgroundColor: '#ffffff',
      color: theme.bg,
      width: '48px',
      height: '48px',
      borderRadius: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.8rem',
      fontWeight: '700',
      fontFamily: "'Lora', serif",
      boxShadow: `0 0 20px rgba(255, 204, 0, 0.4)`,
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    }
  };

  return (
    <>
      {/* LORA FONT IMPORT */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
          
          /* Nav Link Hover Underline Animation */
          .ultra-link {
            color: rgba(255, 255, 255, 0.85);
            text-decoration: none;
            font-size: 0.95rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 8px 15px;
            position: relative;
            transition: color 0.3s ease;
            font-family: 'Lora', serif;
          }
          .ultra-link::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: 0;
            left: 50%;
            background-color: #FFCC00;
            transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
            transform: translateX(-50%);
          }
          .ultra-link:hover {
            color: #ffffff;
          }
          .ultra-link:hover::after, .ultra-link.active::after {
            width: 80%;
          }
          .ultra-link.active {
            color: #FFCC00;
            font-weight: 700;
          }

          /* Dropdown Animations */
          .dropdown-menu {
            position: absolute;
            top: 130%;
            right: 0;
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            min-width: 260px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px) scale(0.95);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 2000;
            border: 1px solid rgba(0,0,0,0.08);
          }
          .dropdown-menu.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0) scale(1);
          }
          .dropdown-item {
            padding: 16px 25px;
            color: #334155;
            text-decoration: none;
            font-size: 1rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 15px;
            transition: all 0.2s ease;
            border-bottom: 1px solid #f1f5f9;
            font-family: 'Lora', serif;
            cursor: pointer;
            background: transparent;
            border-left: 0px solid transparent;
            text-align: left;
            width: 100%;
          }
          .dropdown-item:hover {
            background-color: #f8fafc;
            color: #003366;
            padding-left: 30px;
            border-left: 4px solid #FFCC00;
          }
          
          /* Settings Modal Overlay */
          .modal-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 20, 40, 0.7);
            backdrop-filter: blur(8px);
            z-index: 3000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
          }
          .modal-content {
            background: #fff;
            padding: 30px;
            border-radius: 20px;
            width: 90%;
            max-width: 400px;
            font-family: 'Lora', serif;
            box-shadow: 0 25px 50px rgba(0,0,0,0.3);
            transform: scale(0.95);
            animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
          
          /* Toggle Switch CSS */
          .toggle-switch {
            position: relative;
            width: 50px;
            height: 26px;
            appearance: none;
            background: #cbd5e1;
            border-radius: 50px;
            outline: none;
            cursor: pointer;
            transition: background 0.3s;
          }
          .toggle-switch:checked {
            background: #003366;
          }
          .toggle-switch::after {
            content: '';
            position: absolute;
            top: 3px;
            left: 3px;
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          }
          .toggle-switch:checked::after {
            transform: translateX(24px);
          }

          /* Global Mobile Overrides to prevent overflow */
          @media (max-width: 600px) {
            .dropdown-menu {
              min-width: unset;
              width: 260px;
              right: 0; 
            }
            .modal-content {
              width: 95%;
              padding: 20px;
            }
          }

          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes popIn { to { transform: scale(1); } }
          .logo-hover:hover { transform: rotate(-5deg) scale(1.05); }
        `}
      </style>

      <nav style={styles.nav}>
        <div style={styles.container}>
          
          {/* BRANDING */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '18px', textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>
            <div style={styles.logoBox} className="logo-hover">S</div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
              <span style={styles.brandTitle}>SJU ALUMNI</span>
              <span style={styles.brandSubtitle}>Connect & Grow</span>
            </div>
          </Link>

          {/* DESKTOP MENU */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ul style={{ display: 'flex', gap: '20px', alignItems: 'center', margin: 0, padding: 0, listStyle: 'none' }}>
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link 
                      to={item.path} 
                      className={`ultra-link ${location.pathname === item.path ? 'active' : ''}`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* AUTH & USER */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: '35px', paddingLeft: '35px', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
                {user ? (
                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', position: 'relative' }} 
                    ref={dropdownRef}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', fontFamily: "'Lora', serif" }}>
                      <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '1rem' }}>{user.full_name || user.name}</span>
                      <span style={{ color: theme.accent, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px' }}>{user.role || "Alumni"}</span>
                    </div>
                    <div style={{ width: '45px', height: '45px', backgroundColor: theme.accent, color: theme.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.3rem', border: '2px solid rgba(255,255,255,0.3)' }}>
                      {(user.full_name || user.name || "U").charAt(0).toUpperCase()}
                    </div>
                    
                    {/* DROPDOWN MENU */}
                    <div className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
                      <div style={{ padding: '20px 25px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontFamily: "'Lora', serif" }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', marginBottom: '8px', letterSpacing: '1px' }}>SIGNED IN AS</div>
                        <div style={{ fontWeight: '700', color: '#003366', fontSize: '1.1rem' }}>{user.full_name || user.name}</div>
                      </div>
                      
                      {user.role === 'admin' && (
                        <Link to="/admin" className="dropdown-item" style={{ color: '#003366', fontWeight: '700' }}>
                          <i className="bi bi-shield-lock-fill"></i> Admin Console
                        </Link>
                      )}

                      {/* REAL-TIME SETTINGS BUTTON (Opens internal modal, avoids 404) */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSettingsOpen(true); setDropdownOpen(false); }} 
                        className="dropdown-item"
                        style={{ border: 'none' }}
                      >
                        <i className="bi bi-sliders"></i> Preferences
                      </button>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleLogout(); }} 
                        className="dropdown-item"
                        style={{ color: '#ef4444', fontWeight: '700', justifyContent: 'center', background: '#fef2f2', borderTop: '1px solid #fee2e2', marginTop: '10px' }}
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link 
                    to="/login" 
                    style={{ background: 'transparent', color: '#ffffff', border: `2px solid ${theme.accent}`, padding: '10px 30px', borderRadius: '50px', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem', transition: 'all 0.3s ease', fontFamily: "'Lora', serif" }}
                    onMouseOver={(e) => { e.target.style.background = theme.accent; e.target.style.color = '#003366'; }}
                    onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#ffffff'; }}
                  >
                    Login / Join
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* MOBILE TOGGLE */}
          <button 
            style={{ display: isMobile ? 'block' : 'none', background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      {isMobile && mobileMenuOpen && (
        <div style={{ position: 'fixed', top: '75px', left: 0, width: '100%', height: 'calc(100vh - 75px)', backgroundColor: 'rgba(0, 30, 60, 0.98)', backdropFilter: 'blur(15px)', zIndex: 1040, padding: '2rem', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s ease' }}>
          
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '15px', marginBottom: '25px', border: `1px solid rgba(255,255,255,0.15)` }}>
              <div style={{ width: '50px', height: '50px', backgroundColor: theme.accent, color: theme.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.5rem', flexShrink: 0 }}>
                {(user.full_name || user.name || "U").charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.full_name || user.name}</span>
                <span style={{ color: theme.accent, fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '1px' }}>{user.role || "Alumni"}</span>
              </div>
            </div>
          )}

          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: "'Lora', serif", flex: 1, overflowY: 'auto' }}>
            {navItems.map(item => (
              <li key={item.name}>
                <Link to={item.path} style={{ color: 'white', textDecoration: 'none', fontSize: '1.2rem', fontWeight: '500', display: 'flex', alignItems: 'center', padding: '14px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', transition: 'background 0.2s' }} onClick={() => setMobileMenuOpen(false)}>
                  {item.name}
                </Link>
              </li>
            ))}
             <li>
                <button onClick={() => {setSettingsOpen(true); setMobileMenuOpen(false);}} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#FFF', fontSize: '1.2rem', fontWeight: '500', padding: '14px 20px', width: '100%', textAlign: 'left', borderRadius: '12px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  Preferences
                </button>
             </li>
             {user && user.role === 'admin' && (
               <li>
                 <Link to="/admin" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '1.2rem', fontWeight: '500', display: 'flex', padding: '14px 20px', background: 'rgba(96, 165, 250, 0.1)', borderRadius: '12px', border: '1px solid rgba(96, 165, 250, 0.3)' }} onClick={() => setMobileMenuOpen(false)}>
                   Admin Console
                 </Link>
               </li>
             )}
          </ul>

          <div style={{ marginTop: '20px', paddingBottom: '20px' }}>
            {user ? (
               <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} style={{ background: '#ef4444', color: 'white', border: 'none', fontSize: '1.2rem', fontWeight: '600', padding: '15px 0', width: '100%', textAlign: 'center', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}>
                 Sign Out
               </button>
            ) : (
               <Link to="/login" style={{ color: '#003366', backgroundColor: theme.accent, textDecoration: 'none', fontSize: '1.2rem', fontWeight: '700', display: 'block', padding: '15px 0', textAlign: 'center', borderRadius: '50px', boxShadow: `0 4px 15px ${theme.accent}66` }} onClick={() => setMobileMenuOpen(false)}>
                 Login / Join
               </Link>
            )}
          </div>
        </div>
      )}

      {/* REAL-TIME SETTINGS MODAL (No 404 Routing Needed!) */}
      {settingsOpen && (
        <div className="modal-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#003366', fontWeight: '700' }}>UI Preferences</h3>
              <button onClick={() => setSettingsOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#334155', fontSize: '1.1rem' }}>Compact Navigation</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Reduces the height of the top bar</div>
              </div>
              <input type="checkbox" className="toggle-switch" checked={compactMode} onChange={() => setCompactMode(!compactMode)} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#334155', fontSize: '1.1rem' }}>High Contrast Theme</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Deepens the blues and brightens golds</div>
              </div>
              <input type="checkbox" className="toggle-switch" checked={highContrast} onChange={() => setHighContrast(!highContrast)} />
            </div>
            
            <button 
              onClick={() => setSettingsOpen(false)}
              style={{ width: '100%', padding: '12px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', marginTop: '10px' }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;