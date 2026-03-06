import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// FIREBASE INTEGRATION
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * ============================================================================
 * SJU ALUMNI PORTAL - ENTERPRISE REGISTRATION SUITE (FULL-PAGE OS)
 * Build: 2026.10.X.ULTRA
 * ============================================================================
 */

/* =========================================================
   1) CONFIGURATION & THEME (ENTERPRISE GRADE)
   ========================================================= */
const CONFIG = {
  THEME: {
    // Core Palette - Deep Navy & Metallic Gold
    NAVY_DARK: '#020a17', NAVY_MAIN: '#0C2340', NAVY_LITE: '#1A3B66',
    GOLD_MAIN: '#D4AF37', GOLD_LITE: '#F9F1D8', GOLD_DARK: '#AA8A2E',
    
    // Accents & Semantic States
    ACCENT_CYAN: '#00B4D8', ACCENT_PURPLE: '#7B2CBF',
    SUCCESS: '#10B981', SUCCESS_BG: 'rgba(16, 185, 129, 0.08)',
    WARNING: '#F59E0B', WARNING_BG: 'rgba(245, 158, 11, 0.08)',
    DANGER: '#EF4444', DANGER_BG: 'rgba(239, 68, 68, 0.08)',
    
    // Surfaces & Typography
    BG_APP: '#F4F7F9', BG_SURFACE: '#FFFFFF', BG_SURFACE_ALT: '#F8FAFC',
    BORDER: 'rgba(12, 35, 64, 0.12)', BORDER_LIGHT: '#E2E8F0', BORDER_FOCUS: '#94A3B8',
    TEXT_PRI: '#0F172A', TEXT_SEC: '#475569', TEXT_TER: '#94A3B8',
    
    // Geometry
    RADIUS_SM: '6px', RADIUS_MD: '12px', RADIUS_LG: '20px', RADIUS_XL: '32px', RADIUS_FULL: '9999px',
    
    // Elevation (Shadows)
    SHADOW_SM: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    SHADOW_MD: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
    SHADOW_LG: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    SHADOW_INNER: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
    SHADOW_FOCUS: '0 0 0 4px rgba(212, 175, 55, 0.15)',
    
    // Motion
    TRANSITION_FAST: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    TRANSITION_SMOOTH: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    TRANSITION_BOUNCE: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
  }
};

const COUNTRIES = {
  INDIA: { code: '+91', label: 'IN (+91)', limit: 10, placeholder: '98765 43210' },
  USA:   { code: '+1',  label: 'US (+1)',  limit: 10, placeholder: '555 123 4567' },
  UAE:   { code: '+971', label: 'AE (+971)', limit: 9, placeholder: '50 123 4567' },
  UK:    { code: '+44', label: 'UK (+44)', limit: 10, placeholder: '7700 900077' }
};

/* =========================================================
   2) GLOBAL STYLES & ANIMATION ENGINE
   ========================================================= */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
    
    html, body {
      margin: 0; padding: 0; height: 100%; width: 100%;
      background-color: ${CONFIG.THEME.BG_APP};
      font-family: 'Lora', serif; color: ${CONFIG.THEME.TEXT_PRI};
      -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
      overflow: hidden; /* Prevent body scroll, handle scroll in right panel */
    }

    * { box-sizing: border-box; }
    h1, h2, h3, h4, h5, h6, button, input, select, textarea, span, p, div { font-family: 'Lora', serif; }

    /* Custom Scrollbars for the form panel */
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: ${CONFIG.THEME.BG_SURFACE_ALT}; }
    ::-webkit-scrollbar-thumb { background: ${CONFIG.THEME.BORDER_LIGHT}; border-radius: 10px; border: 2px solid ${CONFIG.THEME.BG_SURFACE_ALT}; }
    ::-webkit-scrollbar-thumb:hover { background: ${CONFIG.THEME.TEXT_TER}; }

    /* Animations */
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUpFade { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideRightFade { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes checkmark { 0% { stroke-dashoffset: 50; } 100% { stroke-dashoffset: 0; } }
    @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }

    /* Input Autofill override */
    input:-webkit-autofill,
    input:-webkit-autofill:hover, 
    input:-webkit-autofill:focus, 
    input:-webkit-autofill:active{
      -webkit-box-shadow: 0 0 0 30px ${CONFIG.THEME.BG_SURFACE} inset !important;
      -webkit-text-fill-color: ${CONFIG.THEME.TEXT_PRI} !important;
      transition: background-color 5000s ease-in-out 0s;
    }

    .form-group:focus-within label { color: ${CONFIG.THEME.NAVY_MAIN}; }
    .glass-hero { background: rgba(12, 35, 64, 0.85); backdrop-filter: blur(20px); border-right: 1px solid rgba(212, 175, 55, 0.2); }
  `}</style>
);

/* =========================================================
   3) KERNEL LOGIC & VALIDATION
   ========================================================= */
const Kernel = {
  toTitleCase: (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
  
  maskDate: (val) => {
    const v = val.replace(/\D/g, '').slice(0, 8);
    if (v.length >= 5) return `${v.slice(0, 2)}-${v.slice(2, 4)}-${v.slice(4)}`;
    if (v.length >= 3) return `${v.slice(0, 2)}-${v.slice(2)}`;
    return v;
  },
  
  maskAadhar: (val) => {
    const v = val.replace(/\D/g, '').slice(0, 12);
    if (v.length >= 9) return `${v.slice(0, 4)}-${v.slice(4, 8)}-${v.slice(8)}`;
    if (v.length >= 5) return `${v.slice(0, 4)}-${v.slice(4)}`;
    return v;
  },

  calculateAge: (dobString) => {
    if (dobString.length !== 10) return null;
    const [day, month, year] = dobString.split('-');
    const birthDate = new Date(`${year}-${month}-${day}`);
    if (isNaN(birthDate)) return null;
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  },

  validateEmail: (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email),
  validateURL: (url) => url === '' || /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(url)
};

/* =========================================================
   4) ATOMIC UI COMPONENTS
   ========================================================= */
const SectionHeader = ({ step, title, subtitle }) => (
  <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'flex-start', gap: '20px', animation: 'slideUpFade 0.6s ease forwards' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: CONFIG.THEME.RADIUS_LG, background: CONFIG.THEME.NAVY_MAIN, color: CONFIG.THEME.GOLD_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: '700', flexShrink: 0, boxShadow: CONFIG.THEME.SHADOW_MD }}>
      {step}
    </div>
    <div style={{ paddingTop: '4px' }}>
      <h2 style={{ color: CONFIG.THEME.NAVY_MAIN, fontSize: '1.75rem', margin: '0 0 8px 0', fontWeight: '700', letterSpacing: '-0.02em' }}>{title}</h2>
      <p style={{ margin: 0, color: CONFIG.THEME.TEXT_SEC, fontSize: '1rem', lineHeight: '1.5' }}>{subtitle}</p>
    </div>
  </div>
);

const InputWrapper = ({ label, error, required, children, width = '100%', helpText }) => {
  const isError = Boolean(error);
  return (
    <div className="form-group" style={{ width, display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', position: 'relative' }}>
      <label style={{ fontSize: '0.9rem', fontWeight: '600', color: isError ? CONFIG.THEME.DANGER : CONFIG.THEME.TEXT_PRI, transition: CONFIG.THEME.TRANSITION_FAST, display: 'flex', justifyContent: 'space-between' }}>
        <span>{label} {required && <span style={{ color: CONFIG.THEME.DANGER }}>*</span>}</span>
        {isError && <span style={{ color: CONFIG.THEME.DANGER, fontSize: '0.8rem', fontWeight: '500', animation: 'shake 0.4s ease' }}>{error}</span>}
      </label>
      <div style={{ position: 'relative' }}>
        {children}
      </div>
      {helpText && !isError && <span style={{ fontSize: '0.8rem', color: CONFIG.THEME.TEXT_TER }}>{helpText}</span>}
    </div>
  );
};

const baseInputStyles = (error) => ({
  width: '100%', padding: '16px 20px', fontSize: '1rem', fontFamily: 'Lora, serif',
  border: `1px solid ${error ? CONFIG.THEME.DANGER : CONFIG.THEME.BORDER_LIGHT}`, 
  borderRadius: CONFIG.THEME.RADIUS_MD, color: CONFIG.THEME.TEXT_PRI, 
  backgroundColor: CONFIG.THEME.BG_SURFACE, outline: 'none', 
  transition: CONFIG.THEME.TRANSITION_FAST,
  boxShadow: error ? '0 0 0 4px rgba(239, 68, 68, 0.1)' : CONFIG.THEME.SHADOW_INNER
});

const FileDropzone = ({ label, file, error, onChange, accept, helpText }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true); else if (e.type === "dragleave") setIsDragging(false); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) onChange(e.dataTransfer.files[0]); };

  return (
    <div className="form-group" style={{ width: '100%', marginBottom: '24px' }}>
      <label style={{ fontSize: '0.9rem', fontWeight: '600', color: error ? CONFIG.THEME.DANGER : CONFIG.THEME.TEXT_PRI, display: 'block', marginBottom: '8px' }}>{label} <span style={{ color: CONFIG.THEME.DANGER }}>*</span></label>
      <div 
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        style={{ 
          border: `2px dashed ${error ? CONFIG.THEME.DANGER : isDragging ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.BORDER_LIGHT}`, 
          borderRadius: CONFIG.THEME.RADIUS_LG, padding: '40px 24px', textAlign: 'center', 
          background: isDragging ? CONFIG.THEME.BG_SURFACE_ALT : CONFIG.THEME.BG_SURFACE, 
          transition: CONFIG.THEME.TRANSITION_FAST, cursor: 'pointer', position: 'relative'
        }}
      >
        <input type="file" accept={accept} onChange={e => e.target.files[0] && onChange(e.target.files[0])} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
        
        {file ? (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: CONFIG.THEME.SUCCESS_BG, color: CONFIG.THEME.SUCCESS, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem' }}>✓</div>
            <div style={{ fontWeight: '600', color: CONFIG.THEME.NAVY_MAIN, fontSize: '1rem', wordBreak: 'break-all' }}>{file.name}</div>
            <div style={{ color: CONFIG.THEME.TEXT_SEC, fontSize: '0.85rem', marginTop: '4px' }}>{(file.size / (1024*1024)).toFixed(2)} MB • Click to replace</div>
          </div>
        ) : (
          <div>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: CONFIG.THEME.BG_APP, color: CONFIG.THEME.NAVY_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '2rem' }}>📄</div>
            <div style={{ fontWeight: '600', color: CONFIG.THEME.TEXT_PRI, fontSize: '1rem', marginBottom: '8px' }}>Drag & drop your file here</div>
            <div style={{ color: CONFIG.THEME.TEXT_SEC, fontSize: '0.85rem', marginBottom: '16px' }}>or browse from your computer</div>
            <div style={{ display: 'inline-block', padding: '8px 24px', background: CONFIG.THEME.NAVY_MAIN, color: CONFIG.THEME.GOLD_MAIN, borderRadius: CONFIG.THEME.RADIUS_FULL, fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', pointerEvents: 'none' }}>Choose File</div>
          </div>
        )}
      </div>
      {(error || helpText) && <div style={{ fontSize: '0.8rem', color: error ? CONFIG.THEME.DANGER : CONFIG.THEME.TEXT_TER, marginTop: '8px', animation: error ? 'shake 0.4s ease' : 'none' }}>{error || helpText}</div>}
    </div>
  );
};


/* =========================================================
   5) MAIN REGISTRATION COMPONENT (SPLIT SCREEN)
   ========================================================= */
const Register = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({});
  const formRef = useRef(null);

  // State Models
  const [form, setForm] = useState({
    regNo: '', fullName: '', fatherName: '', motherName: '', dob: '', age: '', gender: '',
    email: '', countryCode: '+91', phone: '', aadhar: '',
    batchYear: '', degree: '', currentStatus: 'None',
    designation: '', company: '', pgCourse: '', pgCollege: '',
    description: '', skills: '', achievements: '', linkedin: '',
    reviews: '', stories: '', events: ''
  });

  const [files, setFiles] = useState({ profile: null, idProof: null });
  const [errors, setErrors] = useState({});

  // Handlers
  const handleUpdate = (field, value) => {
    let finalValue = value;
    
    // Applying Constraints & Masks
    if (['fullName', 'fatherName', 'motherName'].includes(field)) finalValue = Kernel.toTitleCase(value);
    if (field === 'dob') {
      finalValue = Kernel.maskDate(value);
      const calculatedAge = Kernel.calculateAge(finalValue);
      setForm(prev => ({ ...prev, age: calculatedAge !== null ? calculatedAge : '' }));
    }
    if (field === 'aadhar') finalValue = Kernel.maskAadhar(value);
    if (field === 'phone') finalValue = value.replace(/\D/g, '');

    setForm(prev => ({ ...prev, [field]: finalValue }));
    
    // Clear error immediately on change if resolved
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleBlur = (field) => { setTouched(prev => ({ ...prev, [field]: true })); validateField(field); };

  // Validation Logic
  const validateField = (field) => {
    let err = null;
    switch (field) {
      case 'fullName': case 'fatherName': case 'motherName': case 'regNo': case 'gender': case 'degree': case 'batchYear':
        if (!form[field]) err = "This field is required"; break;
      case 'email':
        if (!form.email) err = "Email is required"; else if (!Kernel.validateEmail(form.email)) err = "Invalid email format"; break;
      case 'phone':
        const limit = Object.values(COUNTRIES).find(c => c.code === form.countryCode)?.limit || 10;
        if (!form.phone) err = "Phone number is required"; else if (form.phone.length !== limit) err = `Must be exactly ${limit} digits`; break;
      case 'aadhar':
        if (form.aadhar && form.aadhar.length !== 14) err = "Must be exactly 12 digits"; break; // Optional but validated if entered
      case 'dob':
        if (!form.dob) err = "Date of Birth is required"; else if (form.dob.length !== 10) err = "Required format: DD-MM-YYYY"; break;
      case 'linkedin':
        if (form.linkedin && !Kernel.validateURL(form.linkedin)) err = "Please enter a valid URL"; break;
      default: break;
    }
    if (err) setErrors(prev => ({ ...prev, [field]: err }));
    return !err;
  };

  const validateAll = () => {
    const fieldsToValidate = ['fullName', 'fatherName', 'motherName', 'regNo', 'email', 'phone', 'dob', 'gender', 'degree', 'batchYear', 'linkedin'];
    let isValid = true;
    let newErrors = {};
    
    fieldsToValidate.forEach(f => {
      validateField(f);
      if (errors[f] || !validateField(f)) isValid = false;
    });

    if (!files.profile) { newErrors.profile = "Profile photo is required for the directory"; isValid = false; }
    if (!files.idProof) { newErrors.idProof = "ID proof is mandatory for admin verification"; isValid = false; }
    
    if (Object.keys(newErrors).length > 0) setErrors(prev => ({ ...prev, ...newErrors }));
    
    if (!isValid && formRef.current) {
      // Smooth scroll to top-most error
      const firstErrorElement = formRef.current.querySelector('.form-group:has(span[style*="color: rgb(239, 68, 68)"])');
      if (firstErrorElement) firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(Object.keys(form).reduce((acc, curr) => ({ ...acc, [curr]: true }), {}));
    
    if (!validateAll()) return;
    setIsSubmitting(true);

    try {
      // 1. Upload Documents to Storage
      let profileUrl = '';
      let idProofUrl = '';

      try {
        if (files.profile) {
          const profileRef = ref(storage, `alumni_profiles/${form.regNo}_${Date.now()}_${files.profile.name}`);
          await uploadBytes(profileRef, files.profile);
          profileUrl = await getDownloadURL(profileRef);
        }
        if (files.idProof) {
          const idRef = ref(storage, `alumni_id_proofs/${form.regNo}_${Date.now()}_${files.idProof.name}`);
          await uploadBytes(idRef, files.idProof);
          idProofUrl = await getDownloadURL(idRef);
        }
      } catch (storageError) {
        console.error("Storage Error:", storageError);
        alert("Warning: Could not upload media files. Please try again or contact support.");
        setIsSubmitting(false);
        return; // Abort if docs fail, as they are mandatory
      }

      // 2. Compile DB Payload
      const dbPayload = {
        ...form,
        // Aliases for the complex directory components
        "Full Name": form.fullName,
        "Batch Year": form.batchYear,
        "Company Name": form.company,
        "Designation": form.designation,
        "Current Status": form.currentStatus === 'Job' ? 'Employed Full-Time' : (form.currentStatus === 'PG' ? 'Higher Studies' : form.currentStatus),
        "Email": form.email,
        "Degree": form.degree,
        "Skills": form.skills ? form.skills.split(',').map(s => s.trim()) : [],
        "Location": "Pending Update", // Default or you can add location to form
        
        // Admin System Requirements
        profilePhotoUrl: profileUrl,
        idProofUrl: idProofUrl,
        status: 'PENDING',
        registeredAt: serverTimestamp(),
      };

      // 3. Save to Firebase (Collection: alumni-data as requested)
      await addDoc(collection(db, "alumni-data"), dbPayload);

      // 4. Trigger Success
      setSuccess(true);
    } catch (error) {
      console.error("Submission Error:", error);
      alert(`Registration failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  // --- SUCCESS SCREEN (FULL PAGE INTERSTITIAL) ---
  if (success) {
    return (
      <div style={{ height: '100vh', width: '100vw', background: CONFIG.THEME.NAVY_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <GlobalStyles />
        {/* Background Graphic */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%', opacity: 0.05, backgroundImage: `radial-gradient(circle at 2px 2px, ${CONFIG.THEME.GOLD_MAIN} 2px, transparent 0)`, backgroundSize: '40px 40px', animation: 'fadeIn 2s ease' }} />
        
        <div style={{ background: CONFIG.THEME.BG_SURFACE, padding: '80px 60px', borderRadius: CONFIG.THEME.RADIUS_XL, maxWidth: '750px', width: '90%', textAlign: 'center', zIndex: 10, boxShadow: CONFIG.THEME.SHADOW_LG, animation: 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: CONFIG.THEME.SUCCESS_BG, border: `4px solid ${CONFIG.THEME.SUCCESS}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 27L22 35L38 15" stroke={CONFIG.THEME.SUCCESS} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 50, strokeDashoffset: 50, animation: 'checkmark 0.6s ease forwards 0.3s' }} />
            </svg>
          </div>
          <h1 style={{ color: CONFIG.THEME.NAVY_MAIN, fontSize: '2.5rem', marginBottom: '16px', fontWeight: '700', letterSpacing: '-0.02em' }}>Application Secured</h1>
          <p style={{ color: CONFIG.THEME.TEXT_SEC, fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '40px' }}>
            Your details have been securely transmitted to the St. Joseph's University Administration. 
            <br/><br/>
            The compliance team will verify your credentials against university records. Upon approval, your unique directory access credentials will be delivered to <strong>{form.email}</strong>.
          </p>
          <button 
            onClick={() => navigate('/')} 
            style={{ padding: '16px 48px', background: CONFIG.THEME.NAVY_MAIN, color: CONFIG.THEME.GOLD_MAIN, borderRadius: CONFIG.THEME.RADIUS_FULL, fontSize: '1.1rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: 'pointer', transition: CONFIG.THEME.TRANSITION_BOUNCE, boxShadow: CONFIG.THEME.SHADOW_MD }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Return to Directory
          </button>
        </div>
      </div>
    );
  }

  // --- REGISTRATION FORM (SPLIT SCREEN LAYOUT) ---
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: CONFIG.THEME.BG_APP, overflow: 'hidden' }}>
      <GlobalStyles />
      
      {/* LEFT PANEL - BRANDING HERO (Fixed) */}
      <div style={{ width: '38%', minWidth: '400px', background: CONFIG.THEME.NAVY_DARK, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', zIndex: 10, boxShadow: '10px 0 30px rgba(0,0,0,0.15)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: 'linear-gradient(45deg, #020a17 25%, transparent 25%, transparent 75%, #020a17 75%, #020a17), linear-gradient(45deg, #020a17 25%, transparent 25%, transparent 75%, #020a17 75%, #020a17)', backgroundSize: '60px 60px', backgroundPosition: '0 0, 30px 30px', backgroundColor: CONFIG.THEME.NAVY_MAIN }} />
        
        <div style={{ position: 'relative', zIndex: 2, animation: 'slideRightFade 0.8s ease' }}>
          <div style={{ display: 'inline-block', padding: '12px 24px', background: 'rgba(212, 175, 55, 0.1)', border: `1px solid ${CONFIG.THEME.GOLD_DARK}`, borderRadius: CONFIG.THEME.RADIUS_FULL, color: CONFIG.THEME.GOLD_MAIN, fontWeight: '700', letterSpacing: '0.1em', fontSize: '0.85rem', marginBottom: '32px' }}>
            ALUMNI NETWORK PORTAL
          </div>
          <h1 style={{ color: CONFIG.THEME.BG_SURFACE, fontSize: '4rem', fontWeight: '700', margin: '0 0 24px 0', lineHeight: '1.1', letterSpacing: '-0.03em' }}>
            Reignite <br/>Your Legacy.
          </h1>
          <p style={{ color: CONFIG.THEME.TEXT_TER, fontSize: '1.25rem', lineHeight: '1.8', margin: '0 0 48px 0', maxWidth: '90%' }}>
            Join the exclusive global directory of St. Joseph's University. Reconnect with peers, unlock exclusive mentorships, and expand your professional horizons.
          </p>
          
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ borderLeft: `3px solid ${CONFIG.THEME.GOLD_MAIN}`, paddingLeft: '16px' }}>
              <div style={{ color: CONFIG.THEME.BG_SURFACE, fontSize: '1.5rem', fontWeight: '700' }}>20,000+</div>
              <div style={{ color: CONFIG.THEME.TEXT_TER, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verified Alumni</div>
            </div>
            <div style={{ borderLeft: `3px solid ${CONFIG.THEME.ACCENT_CYAN}`, paddingLeft: '16px' }}>
              <div style={{ color: CONFIG.THEME.BG_SURFACE, fontSize: '1.5rem', fontWeight: '700' }}>Global</div>
              <div style={{ color: CONFIG.THEME.TEXT_TER, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Networking Hub</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - SCROLLABLE FORM */}
      <div style={{ flex: 1, height: '100%', overflowY: 'auto', padding: '0', scrollBehavior: 'smooth' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 60px' }}>
          
          <div style={{ marginBottom: '60px', animation: 'fadeIn 0.6s ease' }}>
            <div style={{ fontSize: '0.85rem', color: CONFIG.THEME.TEXT_TER, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', marginBottom: '12px' }}>Step-by-Step Registration</div>
            <h2 style={{ fontSize: '2.5rem', color: CONFIG.THEME.NAVY_MAIN, margin: 0, fontWeight: '700', letterSpacing: '-0.02em' }}>Complete Your Profile</h2>
          </div>

          <form ref={formRef} onSubmit={handleSubmit}>
            
            {/* --- SECTION 1: ACADEMIC IDENTIFICATION --- */}
            <div style={{ marginBottom: '80px' }}>
              <SectionHeader step="1" title="Academic Identification" subtitle="Details used to retrieve your official university records." />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <InputWrapper label="University Register Number" error={touched.regNo && errors.regNo} required>
                  <input style={baseInputStyles(touched.regNo && errors.regNo)} value={form.regNo} onChange={e => handleUpdate('regNo', e.target.value.toUpperCase())} onBlur={() => handleBlur('regNo')} placeholder="e.g., 20SJU1234" />
                </InputWrapper>
                <InputWrapper label="Degree Studied" error={touched.degree && errors.degree} required>
                  <select style={baseInputStyles(touched.degree && errors.degree)} value={form.degree} onChange={e => handleUpdate('degree', e.target.value)} onBlur={() => handleBlur('degree')}>
                    <option value="" disabled>Select Degree...</option>
                    <option value="B.Sc">B.Sc</option><option value="BCA">BCA</option><option value="B.Com">B.Com</option><option value="BA">BA</option><option value="M.Sc">M.Sc</option><option value="MA">MA</option><option value="MBA">MBA</option>
                  </select>
                </InputWrapper>
                <InputWrapper label="Year of Passing" error={touched.batchYear && errors.batchYear} required>
                  <select style={baseInputStyles(touched.batchYear && errors.batchYear)} value={form.batchYear} onChange={e => handleUpdate('batchYear', e.target.value)} onBlur={() => handleBlur('batchYear')}>
                    <option value="" disabled>Select Year...</option>
                    {Array.from({length: 40}, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </InputWrapper>
              </div>
            </div>

            {/* --- SECTION 2: PERSONAL BIODATA --- */}
            <div style={{ marginBottom: '80px' }}>
              <SectionHeader step="2" title="Personal Biodata" subtitle="Ensure details match your official government ID." />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <InputWrapper label="Full Name" error={touched.fullName && errors.fullName} required width="100%" helpText="As per university records">
                  <input style={baseInputStyles(touched.fullName && errors.fullName)} value={form.fullName} onChange={e => handleUpdate('fullName', e.target.value)} onBlur={() => handleBlur('fullName')} placeholder="e.g., John Doe" />
                </InputWrapper>
                <InputWrapper label="Aadhar Number" error={touched.aadhar && errors.aadhar} helpText="Optional, speeds up verification">
                  <input style={baseInputStyles(touched.aadhar && errors.aadhar)} value={form.aadhar} onChange={e => handleUpdate('aadhar', e.target.value)} onBlur={() => handleBlur('aadhar')} placeholder="XXXX-XXXX-XXXX" maxLength={14} />
                </InputWrapper>

                <InputWrapper label="Date of Birth" error={touched.dob && errors.dob} required>
                  <input style={baseInputStyles(touched.dob && errors.dob)} value={form.dob} onChange={e => handleUpdate('dob', e.target.value)} onBlur={() => handleBlur('dob')} placeholder="DD-MM-YYYY" maxLength={10} />
                </InputWrapper>
                <InputWrapper label="Age (Auto-calculated)">
                  <input style={{...baseInputStyles(false), background: CONFIG.THEME.BG_APP, color: CONFIG.THEME.TEXT_TER}} value={form.age} readOnly placeholder="0" tabIndex="-1" />
                </InputWrapper>

                <InputWrapper label="Gender" error={touched.gender && errors.gender} required>
                  <select style={baseInputStyles(touched.gender && errors.gender)} value={form.gender} onChange={e => handleUpdate('gender', e.target.value)} onBlur={() => handleBlur('gender')}>
                    <option value="" disabled>Select Gender...</option>
                    <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option><option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </InputWrapper>
                <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <InputWrapper label="Father's Name" error={touched.fatherName && errors.fatherName} required>
                    <input style={baseInputStyles(touched.fatherName && errors.fatherName)} value={form.fatherName} onChange={e => handleUpdate('fatherName', e.target.value)} onBlur={() => handleBlur('fatherName')} />
                  </InputWrapper>
                  <InputWrapper label="Mother's Name" error={touched.motherName && errors.motherName} required>
                    <input style={baseInputStyles(touched.motherName && errors.motherName)} value={form.motherName} onChange={e => handleUpdate('motherName', e.target.value)} onBlur={() => handleBlur('motherName')} />
                  </InputWrapper>
                </div>
              </div>
            </div>

            {/* --- SECTION 3: CONTACT INFORMATION --- */}
            <div style={{ marginBottom: '80px' }}>
              <SectionHeader step="3" title="Contact Details" subtitle="Your portal login credentials will be sent here." />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <InputWrapper label="Primary Email Id" error={touched.email && errors.email} required>
                  <input type="email" style={baseInputStyles(touched.email && errors.email)} value={form.email} onChange={e => handleUpdate('email', e.target.value)} onBlur={() => handleBlur('email')} placeholder="you@domain.com" />
                </InputWrapper>
                
                <InputWrapper label="Phone Number" error={touched.phone && errors.phone} required>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <select style={{...baseInputStyles(false), width: '130px', flexShrink: 0}} value={form.countryCode} onChange={e => handleUpdate('countryCode', e.target.value)}>
                      {Object.values(COUNTRIES).map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                    </select>
                    <input style={baseInputStyles(touched.phone && errors.phone)} value={form.phone} onChange={e => handleUpdate('phone', e.target.value)} onBlur={() => handleBlur('phone')} placeholder={Object.values(COUNTRIES).find(c => c.code === form.countryCode)?.placeholder} />
                  </div>
                </InputWrapper>
              </div>
            </div>

            {/* --- SECTION 4: PROFESSIONAL STATUS --- */}
            <div style={{ marginBottom: '80px' }}>
              <SectionHeader step="4" title="Current Status" subtitle="Help the network understand your current career phase." />
              
              <div style={{ display: 'flex', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
                {[ {id:'None', label:'Open to Work / None', icon:'🚀'}, {id:'Job', label:'Employed Professional', icon:'💼'}, {id:'PG', label:'Pursuing Higher Studies', icon:'🎓'} ].map(status => (
                  <label key={status.id} style={{ flex: 1, minWidth: '200px', padding: '24px', border: `2px solid ${form.currentStatus === status.id ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.BORDER_LIGHT}`, borderRadius: CONFIG.THEME.RADIUS_LG, background: form.currentStatus === status.id ? CONFIG.THEME.BG_SURFACE_ALT : CONFIG.THEME.BG_SURFACE, cursor: 'pointer', transition: CONFIG.THEME.TRANSITION_FAST, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', boxShadow: form.currentStatus === status.id ? CONFIG.THEME.SHADOW_MD : 'none' }}>
                    <input type="radio" name="status" value={status.id} checked={form.currentStatus === status.id} onChange={() => handleUpdate('currentStatus', status.id)} style={{ display: 'none' }} />
                    <span style={{ fontSize: '2rem' }}>{status.icon}</span>
                    <span style={{ fontWeight: '700', color: form.currentStatus === status.id ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.TEXT_SEC, textAlign: 'center' }}>{status.label}</span>
                  </label>
                ))}
              </div>

              {/* Dynamic Expandable Sections */}
              <div style={{ overflow: 'hidden', transition: 'max-height 0.5s ease', maxHeight: form.currentStatus === 'Job' ? '500px' : '0' }}>
                <div style={{ background: CONFIG.THEME.BG_SURFACE_ALT, padding: '32px', borderRadius: CONFIG.THEME.RADIUS_LG, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
                  <InputWrapper label="Company Name">
                    <input style={baseInputStyles(false)} value={form.company} onChange={e => handleUpdate('company', e.target.value)} placeholder="e.g., Google, Infosys" />
                  </InputWrapper>
                  <InputWrapper label="Designation / Role">
                    <input style={baseInputStyles(false)} value={form.designation} onChange={e => handleUpdate('designation', e.target.value)} placeholder="e.g., Software Engineer" />
                  </InputWrapper>
                </div>
              </div>

              <div style={{ overflow: 'hidden', transition: 'max-height 0.5s ease', maxHeight: form.currentStatus === 'PG' ? '500px' : '0' }}>
                <div style={{ background: CONFIG.THEME.BG_SURFACE_ALT, padding: '32px', borderRadius: CONFIG.THEME.RADIUS_LG, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
                  <InputWrapper label="PG Course Name">
                    <input style={baseInputStyles(false)} value={form.pgCourse} onChange={e => handleUpdate('pgCourse', e.target.value)} placeholder="e.g., M.Tech in Data Science" />
                  </InputWrapper>
                  <InputWrapper label="University/College Name">
                    <input style={baseInputStyles(false)} value={form.pgCollege} onChange={e => handleUpdate('pgCollege', e.target.value)} placeholder="e.g., IIT Bombay" />
                  </InputWrapper>
                </div>
              </div>
            </div>

            {/* --- SECTION 5: PROFILE & COMMUNITY --- */}
            <div style={{ marginBottom: '80px' }}>
              <SectionHeader step="5" title="Profile & Networking" subtitle="Rich data makes you discoverable in the directory." />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                <InputWrapper label="Short Professional Bio">
                  <textarea style={{...baseInputStyles(false), minHeight: '120px', resize: 'vertical'}} value={form.description} onChange={e => handleUpdate('description', e.target.value)} placeholder="Summarize your career, interests, and goals..." />
                </InputWrapper>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <InputWrapper label="Core Skills (Comma separated)" helpText="e.g., React, Data Analysis, Marketing">
                    <input style={baseInputStyles(false)} value={form.skills} onChange={e => handleUpdate('skills', e.target.value)} placeholder="Skill 1, Skill 2, Skill 3..." />
                  </InputWrapper>
                  <InputWrapper label="LinkedIn Profile" error={touched.linkedin && errors.linkedin}>
                    <input style={baseInputStyles(touched.linkedin && errors.linkedin)} value={form.linkedin} onChange={e => handleUpdate('linkedin', e.target.value)} onBlur={() => handleBlur('linkedin')} placeholder="https://linkedin.com/in/username" />
                  </InputWrapper>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <InputWrapper label="Special Achievements">
                    <textarea style={{...baseInputStyles(false), minHeight: '100px'}} value={form.achievements} onChange={e => handleUpdate('achievements', e.target.value)} placeholder="Awards, Publications, Leadership roles..." />
                  </InputWrapper>
                  <InputWrapper label="SJU Memories / Reviews">
                    <textarea style={{...baseInputStyles(false), minHeight: '100px'}} value={form.reviews} onChange={e => handleUpdate('reviews', e.target.value)} placeholder="Share a brief testimonial about your time at SJU..." />
                  </InputWrapper>
                </div>
              </div>
            </div>

            {/* --- SECTION 6: VERIFICATION DOCUMENTS --- */}
            <div style={{ marginBottom: '60px' }}>
              <SectionHeader step="6" title="Identity Verification" subtitle="Mandatory documents required to authorize your secure portal access." />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <FileDropzone 
                  label="Profile Photograph" 
                  accept="image/jpeg, image/png, image/webp" 
                  file={files.profile} 
                  error={errors.profile} 
                  onChange={(f) => { setFiles(prev => ({...prev, profile: f})); if(errors.profile) setErrors(e => ({...e, profile: null})); }} 
                  helpText="Professional headshot recommended. Visible to other alumni."
                />
                <FileDropzone 
                  label="Official ID Proof" 
                  accept="image/jpeg, image/png, application/pdf" 
                  file={files.idProof} 
                  error={errors.idProof} 
                  onChange={(f) => { setFiles(prev => ({...prev, idProof: f})); if(errors.idProof) setErrors(e => ({...e, idProof: null})); }} 
                  helpText="Aadhar, Passport, or Valid PG College ID. Private to Admins."
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div style={{ background: CONFIG.THEME.BG_SURFACE_ALT, padding: '40px', borderRadius: CONFIG.THEME.RADIUS_LG, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: CONFIG.THEME.SHADOW_SM }}>
              <div style={{ width: '60%' }}>
                <h4 style={{ margin: '0 0 8px 0', color: CONFIG.THEME.NAVY_MAIN, fontSize: '1.1rem', fontWeight: '700' }}>Ready to submit?</h4>
                <p style={{ margin: 0, color: CONFIG.THEME.TEXT_SEC, fontSize: '0.9rem', lineHeight: 1.5 }}>By submitting this application, you agree to the university's data processing terms. Ensure all mandatory fields are accurate to prevent rejection.</p>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ 
                  padding: '20px 48px', 
                  background: isSubmitting ? CONFIG.THEME.TEXT_TER : CONFIG.THEME.NAVY_MAIN, 
                  color: CONFIG.THEME.GOLD_MAIN, 
                  fontSize: '1.1rem', 
                  fontFamily: 'Lora, serif', 
                  fontWeight: '700', 
                  border: 'none', 
                  borderRadius: CONFIG.THEME.RADIUS_FULL,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  boxShadow: isSubmitting ? 'none' : CONFIG.THEME.SHADOW_LG,
                  transition: CONFIG.THEME.TRANSITION_BOUNCE,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={e => { if(!isSubmitting) e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { if(!isSubmitting) e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {isSubmitting ? (
                  <>
                    <span style={{ display: 'inline-block', width: '20px', height: '20px', border: `3px solid ${CONFIG.THEME.BG_SURFACE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    Encrypting...
                    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                  </>
                ) : 'Submit Application'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;