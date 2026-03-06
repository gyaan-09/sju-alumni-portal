import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// FIREBASE INTEGRATION
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * ============================================================================
 * SJU ALUMNI PORTAL - ENTERPRISE REGISTRATION SUITE (FULL-PAGE OS)
 * Build: 2026.10.X.ULTRA (Crash-Proof Edition)
 * ============================================================================
 */

/* =========================================================
   1) CONFIGURATION & THEME
   ========================================================= */
const CONFIG = {
  THEME: {
    NAVY_DARK: '#020a17', NAVY_MAIN: '#0C2340', NAVY_LITE: '#1A3B66',
    GOLD_MAIN: '#D4AF37', GOLD_LITE: '#F9F1D8', GOLD_DARK: '#AA8A2E',
    ACCENT_CYAN: '#00B4D8', ACCENT_PURPLE: '#7B2CBF',
    SUCCESS: '#10B981', SUCCESS_BG: 'rgba(16, 185, 129, 0.08)',
    WARNING: '#F59E0B', WARNING_BG: 'rgba(245, 158, 11, 0.08)',
    DANGER: '#EF4444', DANGER_BG: 'rgba(239, 68, 68, 0.08)',
    BG_APP: '#F4F7F9', BG_SURFACE: '#FFFFFF', BG_SURFACE_ALT: '#F8FAFC',
    BORDER: 'rgba(12, 35, 64, 0.12)', BORDER_LIGHT: '#E2E8F0', BORDER_FOCUS: '#94A3B8',
    TEXT_PRI: '#0F172A', TEXT_SEC: '#475569', TEXT_TER: '#94A3B8',
    RADIUS_SM: '6px', RADIUS_MD: '12px', RADIUS_LG: '20px', RADIUS_XL: '32px', RADIUS_FULL: '9999px',
    SHADOW_SM: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    SHADOW_MD: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
    SHADOW_LG: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    SHADOW_INNER: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
    TRANSITION_FAST: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    TRANSITION_BOUNCE: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
  },
  MAX_FILE_SIZE_MB: 5,
  COLLECTION_NAME: 'alumni_data' // Aligned with Admin Dashboard requirements
};

const COUNTRIES = {
  INDIA: { code: '+91', label: 'IN (+91)', limit: 10, placeholder: '98765 43210' },
  USA:   { code: '+1',  label: 'US (+1)',  limit: 10, placeholder: '555 123 4567' },
  UAE:   { code: '+971', label: 'AE (+971)', limit: 9, placeholder: '50 123 4567' },
  UK:    { code: '+44', label: 'UK (+44)', limit: 10, placeholder: '7700 900077' }
};

/* =========================================================
   2) GLOBAL STYLES
   ========================================================= */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
    
    html, body, #root {
      margin: 0; padding: 0; height: 100vh; width: 100vw;
      background-color: ${CONFIG.THEME.BG_APP};
      font-family: 'Lora', serif; color: ${CONFIG.THEME.TEXT_PRI};
      -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
      overflow: hidden; box-sizing: border-box;
    }

    *, *:before, *:after { box-sizing: inherit; }
    h1, h2, h3, h4, h5, h6, button, input, select, textarea, span, p, div { font-family: 'Lora', serif; }

    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${CONFIG.THEME.BORDER_FOCUS}; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: ${CONFIG.THEME.TEXT_SEC}; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideRightFade { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes checkmark { 0% { stroke-dashoffset: 50; } 100% { stroke-dashoffset: 0; } }
    @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    input:-webkit-autofill {
      -webkit-box-shadow: 0 0 0 30px ${CONFIG.THEME.BG_SURFACE} inset !important;
      -webkit-text-fill-color: ${CONFIG.THEME.TEXT_PRI} !important;
      transition: background-color 5000s ease-in-out 0s;
    }
    textarea { resize: vertical; }
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
  <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', gap: '16px', animation: 'slideUpFade 0.6s ease forwards' }}>
    <div style={{ width: '40px', height: '40px', borderRadius: CONFIG.THEME.RADIUS_LG, background: CONFIG.THEME.NAVY_MAIN, color: CONFIG.THEME.GOLD_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: '700', flexShrink: 0, boxShadow: CONFIG.THEME.SHADOW_MD }}>
      {step}
    </div>
    <div style={{ paddingTop: '2px' }}>
      <h2 style={{ color: CONFIG.THEME.NAVY_MAIN, fontSize: '1.5rem', margin: '0 0 4px 0', fontWeight: '700' }}>{title}</h2>
      <p style={{ margin: 0, color: CONFIG.THEME.TEXT_SEC, fontSize: '0.95rem', lineHeight: '1.5' }}>{subtitle}</p>
    </div>
  </div>
);

const InputWrapper = ({ label, error, required, children, width = '100%', helpText }) => (
  <div className="form-group" style={{ width, display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
    <label style={{ fontSize: '0.9rem', fontWeight: '600', color: error ? CONFIG.THEME.DANGER : CONFIG.THEME.TEXT_PRI, display: 'flex', justifyContent: 'space-between' }}>
      <span>{label} {required && <span style={{ color: CONFIG.THEME.DANGER }}>*</span>}</span>
      {error && <span style={{ color: CONFIG.THEME.DANGER, fontSize: '0.8rem', fontWeight: '500', animation: 'shake 0.4s ease' }}>{error}</span>}
    </label>
    {children}
    {helpText && !error && <span style={{ fontSize: '0.8rem', color: CONFIG.THEME.TEXT_TER }}>{helpText}</span>}
  </div>
);

const baseInputStyles = (error) => ({
  width: '100%', padding: '14px 18px', fontSize: '1rem', fontFamily: 'Lora, serif',
  border: `1px solid ${error ? CONFIG.THEME.DANGER : CONFIG.THEME.BORDER_LIGHT}`, 
  borderRadius: CONFIG.THEME.RADIUS_MD, color: CONFIG.THEME.TEXT_PRI, 
  backgroundColor: CONFIG.THEME.BG_SURFACE, outline: 'none', 
  transition: CONFIG.THEME.TRANSITION_FAST,
  boxShadow: error ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : CONFIG.THEME.SHADOW_INNER
});

const FileDropzone = ({ label, file, error, onChange, accept, helpText }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(e.type === "dragenter" || e.type === "dragover"); };
  const handleDrop = (e) => { 
    e.preventDefault(); e.stopPropagation(); setIsDragging(false); 
    if (e.dataTransfer.files && e.dataTransfer.files[0]) validateAndSetFile(e.dataTransfer.files[0]); 
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > CONFIG.MAX_FILE_SIZE_MB) {
      onChange(null, `File exceeds ${CONFIG.MAX_FILE_SIZE_MB}MB limit.`);
      return;
    }
    onChange(selectedFile, null);
  };

  return (
    <div style={{ width: '100%', marginBottom: '20px' }}>
      <label style={{ fontSize: '0.9rem', fontWeight: '600', color: error ? CONFIG.THEME.DANGER : CONFIG.THEME.TEXT_PRI, display: 'block', marginBottom: '8px' }}>{label} <span style={{ color: CONFIG.THEME.DANGER }}>*</span></label>
      <div 
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        style={{ 
          border: `2px dashed ${error ? CONFIG.THEME.DANGER : isDragging ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.BORDER_LIGHT}`, 
          borderRadius: CONFIG.THEME.RADIUS_LG, padding: '32px 20px', textAlign: 'center', 
          background: isDragging ? CONFIG.THEME.BG_SURFACE_ALT : CONFIG.THEME.BG_SURFACE, 
          transition: CONFIG.THEME.TRANSITION_FAST, cursor: 'pointer', position: 'relative'
        }}
      >
        <input type="file" accept={accept} onChange={e => validateAndSetFile(e.target.files[0])} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
        {file ? (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: CONFIG.THEME.SUCCESS_BG, color: CONFIG.THEME.SUCCESS, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.2rem' }}>✓</div>
            <div style={{ fontWeight: '600', color: CONFIG.THEME.NAVY_MAIN, fontSize: '0.95rem', wordBreak: 'break-all' }}>{file.name}</div>
            <div style={{ color: CONFIG.THEME.TEXT_SEC, fontSize: '0.8rem', marginTop: '4px' }}>{(file.size / (1024*1024)).toFixed(2)} MB • Click to replace</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📄</div>
            <div style={{ fontWeight: '600', color: CONFIG.THEME.TEXT_PRI, fontSize: '0.95rem', marginBottom: '4px' }}>Drag & Drop or Click to Upload</div>
            <div style={{ color: CONFIG.THEME.TEXT_TER, fontSize: '0.8rem' }}>Max size: {CONFIG.MAX_FILE_SIZE_MB}MB</div>
          </div>
        )}
      </div>
      {(error || helpText) && <div style={{ fontSize: '0.8rem', color: error ? CONFIG.THEME.DANGER : CONFIG.THEME.TEXT_TER, marginTop: '8px' }}>{error || helpText}</div>}
    </div>
  );
};

/* =========================================================
   5) MAIN REGISTRATION COMPONENT
   ========================================================= */
const Register = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [uiState, setUiState] = useState({ isSubmitting: false, success: false, submitError: null });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  
  const [form, setForm] = useState({
    regNo: '', fullName: '', fatherName: '', motherName: '', dob: '', age: '', gender: '',
    email: '', countryCode: '+91', phone: '', aadhar: '',
    batchYear: '', degree: '', currentStatus: 'None',
    designation: '', company: '', pgCourse: '', pgCollege: '',
    description: '', skills: '', achievements: '', linkedin: '', reviews: ''
  });

  const [files, setFiles] = useState({ profile: null, idProof: null });

  // Handlers
  const handleUpdate = (field, value) => {
    let finalValue = value;
    if (['fullName', 'fatherName', 'motherName'].includes(field)) finalValue = Kernel.toTitleCase(value);
    if (field === 'dob') {
      finalValue = Kernel.maskDate(value);
      const calculatedAge = Kernel.calculateAge(finalValue);
      setForm(prev => ({ ...prev, age: calculatedAge !== null ? calculatedAge : '' }));
    }
    if (field === 'aadhar') finalValue = Kernel.maskAadhar(value);
    if (field === 'phone') finalValue = value.replace(/\D/g, '');

    setForm(prev => ({ ...prev, [field]: finalValue }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleBlur = (field) => { setTouched(prev => ({ ...prev, [field]: true })); validateField(field); };

  const handleFileChange = (type, file, errorMsg) => {
    if (errorMsg) {
      setErrors(prev => ({ ...prev, [type]: errorMsg }));
      setFiles(prev => ({ ...prev, [type]: null }));
    } else {
      setFiles(prev => ({ ...prev, [type]: file }));
      setErrors(prev => { const newErr = {...prev}; delete newErr[type]; return newErr; });
    }
  };

  const validateField = (field) => {
    let err = null;
    switch (field) {
      case 'fullName': case 'fatherName': case 'motherName': case 'regNo': case 'gender': case 'degree': case 'batchYear':
        if (!form[field]) err = "Required"; break;
      case 'email':
        if (!form.email) err = "Required"; else if (!Kernel.validateEmail(form.email)) err = "Invalid email format"; break;
      case 'phone':
        const limit = Object.values(COUNTRIES).find(c => c.code === form.countryCode)?.limit || 10;
        if (!form.phone) err = "Required"; else if (form.phone.length !== limit) err = `Must be ${limit} digits`; break;
      case 'aadhar':
        if (form.aadhar && form.aadhar.length !== 14) err = "Must be exactly 12 digits"; break;
      case 'dob':
        if (!form.dob) err = "Required"; else if (form.dob.length !== 10) err = "Format: DD-MM-YYYY"; break;
      case 'linkedin':
        if (form.linkedin && !Kernel.validateURL(form.linkedin)) err = "Invalid URL"; break;
      default: break;
    }
    if (err) setErrors(prev => ({ ...prev, [field]: err }));
    return !err;
  };

  const validateAll = () => {
    const fieldsToValidate = ['fullName', 'fatherName', 'motherName', 'regNo', 'email', 'phone', 'dob', 'gender', 'degree', 'batchYear', 'linkedin'];
    let isValid = true;
    let newErrors = {};
    
    fieldsToValidate.forEach(f => { if (!validateField(f) || errors[f]) isValid = false; });
    if (!files.profile) { newErrors.profile = "Profile photo is mandatory"; isValid = false; }
    if (!files.idProof) { newErrors.idProof = "Government/University ID is mandatory"; isValid = false; }
    
    if (Object.keys(newErrors).length > 0) setErrors(prev => ({ ...prev, ...newErrors }));
    
    if (!isValid && formRef.current) {
      const firstError = formRef.current.querySelector('.form-group:has(span[style*="color: rgb(239, 68, 68)"])');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return isValid;
  };

  // Ultra-Robust Submission Protocol
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUiState({ ...uiState, submitError: null });
    setTouched(Object.keys(form).reduce((acc, curr) => ({ ...acc, [curr]: true }), {}));
    
    if (!validateAll()) return;
    setUiState(prev => ({ ...prev, isSubmitting: true }));

    try {
      let profileUrl = '';
      let idProofUrl = '';

      // 1. Upload Assets securely
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

      // 2. Structured Payload matching the Admin Dashboard expectations
      const dbPayload = {
        ...form,
        "Full Name": form.fullName,
        "Batch Year": form.batchYear,
        "Company Name": form.company,
        "Designation": form.designation,
        "Current Status": form.currentStatus === 'Job' ? 'Employed Full-Time' : (form.currentStatus === 'PG' ? 'Higher Studies' : form.currentStatus),
        "Email": form.email,
        "Degree": form.degree,
        "Skills": form.skills ? form.skills.split(',').map(s => s.trim()) : [],
        "Location": "Pending Admin Verification", 
        
        // Critical System Flags
        profilePhotoUrl: profileUrl,
        idProofUrl: idProofUrl,
        status: 'PENDING', // Puts it directly in Admin Dashboard verification queue
        verificationQueue: true,
        registeredAt: serverTimestamp(),
      };

      // 3. Database Push to precise collection
      await addDoc(collection(db, CONFIG.COLLECTION_NAME), dbPayload);
      setUiState({ isSubmitting: false, success: true, submitError: null });

    } catch (error) {
      console.error("Submission Failure Pipeline:", error);
      setUiState({ 
        isSubmitting: false, 
        success: false, 
        submitError: `Transmission Failed: ${error.message}. Please check your connection and try again.` 
      });
    }
  };

  // --- SUCCESS SCREEN ---
  if (uiState.success) {
    return (
      <div style={{ height: '100vh', width: '100vw', background: CONFIG.THEME.NAVY_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <GlobalStyles />
        <div style={{ background: CONFIG.THEME.BG_SURFACE, padding: '60px 50px', borderRadius: CONFIG.THEME.RADIUS_XL, maxWidth: '600px', width: '90%', textAlign: 'center', boxShadow: CONFIG.THEME.SHADOW_LG, animation: 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: CONFIG.THEME.SUCCESS_BG, border: `4px solid ${CONFIG.THEME.SUCCESS}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="40" height="40" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 27L22 35L38 15" stroke={CONFIG.THEME.SUCCESS} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 50, strokeDashoffset: 50, animation: 'checkmark 0.6s ease forwards 0.3s' }} />
            </svg>
          </div>
          <h1 style={{ color: CONFIG.THEME.NAVY_MAIN, fontSize: '2rem', marginBottom: '16px', fontWeight: '700' }}>Application Secured</h1>
          <p style={{ color: CONFIG.THEME.TEXT_SEC, fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '32px' }}>
            Your details are now in the Admin Verification Queue. Upon compliance approval, directory credentials will be dispatched to <strong>{form.email}</strong>.
          </p>
          <button onClick={() => navigate('/')} style={{ padding: '14px 40px', background: CONFIG.THEME.NAVY_MAIN, color: CONFIG.THEME.GOLD_MAIN, borderRadius: CONFIG.THEME.RADIUS_FULL, fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: 'pointer', transition: CONFIG.THEME.TRANSITION_BOUNCE }}>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // --- SPLIT SCREEN REGISTRATION FORM ---
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: CONFIG.THEME.BG_APP, overflow: 'hidden' }}>
      <GlobalStyles />
      
      {/* LEFT PANEL - BRANDING */}
      <div style={{ flex: '0 0 40%', background: CONFIG.THEME.NAVY_DARK, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', zIndex: 10, boxShadow: '10px 0 30px rgba(0,0,0,0.15)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: 'linear-gradient(45deg, #020a17 25%, transparent 25%, transparent 75%, #020a17 75%, #020a17)', backgroundSize: '60px 60px', backgroundColor: CONFIG.THEME.NAVY_MAIN }} />
        <div style={{ position: 'relative', zIndex: 2, animation: 'slideRightFade 0.8s ease' }}>
          <div style={{ display: 'inline-block', padding: '10px 20px', background: 'rgba(212, 175, 55, 0.1)', border: `1px solid ${CONFIG.THEME.GOLD_DARK}`, borderRadius: CONFIG.THEME.RADIUS_FULL, color: CONFIG.THEME.GOLD_MAIN, fontWeight: '700', letterSpacing: '0.1em', fontSize: '0.8rem', marginBottom: '24px' }}>
            ALUMNI NETWORK PORTAL
          </div>
          <h1 style={{ color: CONFIG.THEME.BG_SURFACE, fontSize: '3.5rem', fontWeight: '700', margin: '0 0 20px 0', lineHeight: '1.1' }}>
            Reignite <br/>Your Legacy.
          </h1>
          <p style={{ color: CONFIG.THEME.TEXT_TER, fontSize: '1.1rem', lineHeight: '1.7', margin: '0 0 40px 0', maxWidth: '90%' }}>
            Join the exclusive global directory of St. Joseph's University. Reconnect with peers, unlock mentorships, and expand your horizons.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - SCROLLABLE FORM */}
      <div style={{ flex: '1 1 60%', height: '100%', overflowY: 'auto', padding: '0', position: 'relative' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 40px 100px 40px' }}>
          
          <div style={{ marginBottom: '40px', animation: 'fadeIn 0.6s ease' }}>
            <h2 style={{ fontSize: '2.2rem', color: CONFIG.THEME.NAVY_MAIN, margin: 0, fontWeight: '700' }}>Complete Your Profile</h2>
            <div style={{ fontSize: '0.9rem', color: CONFIG.THEME.TEXT_TER, marginTop: '8px' }}>Fields marked with * are mandatory for compliance verification.</div>
          </div>

          {uiState.submitError && (
            <div style={{ background: CONFIG.THEME.DANGER_BG, borderLeft: `4px solid ${CONFIG.THEME.DANGER}`, padding: '16px 20px', borderRadius: CONFIG.THEME.RADIUS_SM, marginBottom: '32px', color: CONFIG.THEME.DANGER, fontWeight: '600', animation: 'shake 0.4s ease' }}>
              {uiState.submitError}
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit}>
            
            {/* SECTION 1: ACADEMIC */}
            <div style={{ marginBottom: '60px' }}>
              <SectionHeader step="1" title="Academic Identification" subtitle="Details used to retrieve your official university records." />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <InputWrapper label="Register Number" error={touched.regNo && errors.regNo} required>
                  <input style={baseInputStyles(touched.regNo && errors.regNo)} value={form.regNo} onChange={e => handleUpdate('regNo', e.target.value.toUpperCase())} onBlur={() => handleBlur('regNo')} placeholder="e.g., 20SJU1234" />
                </InputWrapper>
                <InputWrapper label="Degree Studied" error={touched.degree && errors.degree} required>
                  <select style={baseInputStyles(touched.degree && errors.degree)} value={form.degree} onChange={e => handleUpdate('degree', e.target.value)} onBlur={() => handleBlur('degree')}>
                    <option value="" disabled>Select Degree...</option>
                    <option value="B.Sc">B.Sc</option><option value="BCA">BCA</option><option value="B.Com">B.Com</option><option value="BA">BA</option><option value="M.Sc">M.Sc</option><option value="MBA">MBA</option>
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

            {/* SECTION 2: BIODATA */}
            <div style={{ marginBottom: '60px' }}>
              <SectionHeader step="2" title="Personal Biodata" subtitle="Ensure details match your official government ID." />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <InputWrapper label="Full Name" error={touched.fullName && errors.fullName} required width="100%">
                  <input style={baseInputStyles(touched.fullName && errors.fullName)} value={form.fullName} onChange={e => handleUpdate('fullName', e.target.value)} onBlur={() => handleBlur('fullName')} placeholder="e.g., Jane Doe" />
                </InputWrapper>
                <InputWrapper label="Aadhar Number" error={touched.aadhar && errors.aadhar}>
                  <input style={baseInputStyles(touched.aadhar && errors.aadhar)} value={form.aadhar} onChange={e => handleUpdate('aadhar', e.target.value)} onBlur={() => handleBlur('aadhar')} placeholder="XXXX-XXXX-XXXX" maxLength={14} />
                </InputWrapper>

                <InputWrapper label="Date of Birth" error={touched.dob && errors.dob} required>
                  <input style={baseInputStyles(touched.dob && errors.dob)} value={form.dob} onChange={e => handleUpdate('dob', e.target.value)} onBlur={() => handleBlur('dob')} placeholder="DD-MM-YYYY" maxLength={10} />
                </InputWrapper>
                <InputWrapper label="Gender" error={touched.gender && errors.gender} required>
                  <select style={baseInputStyles(touched.gender && errors.gender)} value={form.gender} onChange={e => handleUpdate('gender', e.target.value)} onBlur={() => handleBlur('gender')}>
                    <option value="" disabled>Select Gender...</option>
                    <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                  </select>
                </InputWrapper>
                
                <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <InputWrapper label="Father's Name" error={touched.fatherName && errors.fatherName} required>
                    <input style={baseInputStyles(touched.fatherName && errors.fatherName)} value={form.fatherName} onChange={e => handleUpdate('fatherName', e.target.value)} onBlur={() => handleBlur('fatherName')} />
                  </InputWrapper>
                  <InputWrapper label="Mother's Name" error={touched.motherName && errors.motherName} required>
                    <input style={baseInputStyles(touched.motherName && errors.motherName)} value={form.motherName} onChange={e => handleUpdate('motherName', e.target.value)} onBlur={() => handleBlur('motherName')} />
                  </InputWrapper>
                </div>
              </div>
            </div>

            {/* SECTION 3: CONTACT */}
            <div style={{ marginBottom: '60px' }}>
              <SectionHeader step="3" title="Contact Details" subtitle="Portal login credentials will be dispatched here." />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <InputWrapper label="Primary Email" error={touched.email && errors.email} required>
                  <input type="email" style={baseInputStyles(touched.email && errors.email)} value={form.email} onChange={e => handleUpdate('email', e.target.value)} onBlur={() => handleBlur('email')} placeholder="you@domain.com" />
                </InputWrapper>
                <InputWrapper label="Phone Number" error={touched.phone && errors.phone} required>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select style={{...baseInputStyles(false), width: '120px', flexShrink: 0, padding: '14px 10px'}} value={form.countryCode} onChange={e => handleUpdate('countryCode', e.target.value)}>
                      {Object.values(COUNTRIES).map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                    </select>
                    <input style={baseInputStyles(touched.phone && errors.phone)} value={form.phone} onChange={e => handleUpdate('phone', e.target.value)} onBlur={() => handleBlur('phone')} placeholder={Object.values(COUNTRIES).find(c => c.code === form.countryCode)?.placeholder} />
                  </div>
                </InputWrapper>
              </div>
            </div>

            {/* SECTION 4: STATUS */}
            <div style={{ marginBottom: '60px' }}>
              <SectionHeader step="4" title="Professional Status" subtitle="Help the network categorize your current career phase." />
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {[ {id:'None', label:'Open to Work', icon:'🚀'}, {id:'Job', label:'Employed', icon:'💼'}, {id:'PG', label:'Higher Studies', icon:'🎓'} ].map(status => (
                  <label key={status.id} style={{ flex: 1, minWidth: '180px', padding: '16px', border: `2px solid ${form.currentStatus === status.id ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.BORDER_LIGHT}`, borderRadius: CONFIG.THEME.RADIUS_MD, background: form.currentStatus === status.id ? CONFIG.THEME.BG_SURFACE_ALT : CONFIG.THEME.BG_SURFACE, cursor: 'pointer', transition: CONFIG.THEME.TRANSITION_FAST, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <input type="radio" name="status" value={status.id} checked={form.currentStatus === status.id} onChange={() => handleUpdate('currentStatus', status.id)} style={{ display: 'none' }} />
                    <span style={{ fontSize: '1.5rem' }}>{status.icon}</span>
                    <span style={{ fontWeight: '600', color: form.currentStatus === status.id ? CONFIG.THEME.NAVY_MAIN : CONFIG.THEME.TEXT_SEC }}>{status.label}</span>
                  </label>
                ))}
              </div>

              <div style={{ overflow: 'hidden', transition: 'max-height 0.4s ease', maxHeight: form.currentStatus === 'Job' ? '300px' : '0' }}>
                <div style={{ background: CONFIG.THEME.BG_SURFACE_ALT, padding: '24px', borderRadius: CONFIG.THEME.RADIUS_MD, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
                  <InputWrapper label="Company Name"><input style={baseInputStyles(false)} value={form.company} onChange={e => handleUpdate('company', e.target.value)} placeholder="e.g., Google, Infosys" /></InputWrapper>
                  <InputWrapper label="Designation"><input style={baseInputStyles(false)} value={form.designation} onChange={e => handleUpdate('designation', e.target.value)} placeholder="e.g., Software Engineer" /></InputWrapper>
                </div>
              </div>

              <div style={{ overflow: 'hidden', transition: 'max-height 0.4s ease', maxHeight: form.currentStatus === 'PG' ? '300px' : '0' }}>
                <div style={{ background: CONFIG.THEME.BG_SURFACE_ALT, padding: '24px', borderRadius: CONFIG.THEME.RADIUS_MD, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}` }}>
                  <InputWrapper label="PG Course Name"><input style={baseInputStyles(false)} value={form.pgCourse} onChange={e => handleUpdate('pgCourse', e.target.value)} placeholder="e.g., M.Tech in Data Science" /></InputWrapper>
                  <InputWrapper label="University/College"><input style={baseInputStyles(false)} value={form.pgCollege} onChange={e => handleUpdate('pgCollege', e.target.value)} placeholder="e.g., IIT Bombay" /></InputWrapper>
                </div>
              </div>
            </div>

            {/* SECTION 5: PROFILE */}
            <div style={{ marginBottom: '60px' }}>
              <SectionHeader step="5" title="Profile & Networking" subtitle="Rich data makes you discoverable in the directory." />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                <InputWrapper label="Short Professional Bio">
                  <textarea style={{...baseInputStyles(false), minHeight: '100px'}} value={form.description} onChange={e => handleUpdate('description', e.target.value)} placeholder="Summarize your career goals..." />
                </InputWrapper>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <InputWrapper label="Core Skills (Comma separated)"><input style={baseInputStyles(false)} value={form.skills} onChange={e => handleUpdate('skills', e.target.value)} placeholder="React, Data Analysis..." /></InputWrapper>
                  <InputWrapper label="LinkedIn Profile" error={touched.linkedin && errors.linkedin}>
                    <input style={baseInputStyles(touched.linkedin && errors.linkedin)} value={form.linkedin} onChange={e => handleUpdate('linkedin', e.target.value)} onBlur={() => handleBlur('linkedin')} placeholder="https://linkedin.com/in/..." />
                  </InputWrapper>
                </div>
              </div>
            </div>

            {/* SECTION 6: VERIFICATION */}
            <div style={{ marginBottom: '60px' }}>
              <SectionHeader step="6" title="Identity Verification" subtitle={`Mandatory proof for portal authorization. Max size ${CONFIG.MAX_FILE_SIZE_MB}MB.`} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <FileDropzone 
                  label="Profile Photograph" 
                  accept="image/jpeg, image/png, image/webp" 
                  file={files.profile} 
                  error={errors.profile} 
                  onChange={(f, err) => handleFileChange('profile', f, err)} 
                  helpText="Professional headshot. Formats: JPG, PNG, WEBP."
                />
                <FileDropzone 
                  label="Official ID Proof" 
                  accept="image/jpeg, image/png, application/pdf" 
                  file={files.idProof} 
                  error={errors.idProof} 
                  onChange={(f, err) => handleFileChange('idProof', f, err)} 
                  helpText="Aadhar, Passport, or College ID. Formats: PDF, JPG, PNG."
                />
              </div>
            </div>

            {/* SUBMISSION FOOTER */}
            <div style={{ background: CONFIG.THEME.BG_SURFACE_ALT, padding: '32px', borderRadius: CONFIG.THEME.RADIUS_LG, border: `1px solid ${CONFIG.THEME.BORDER_LIGHT}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: '60%' }}>
                <h4 style={{ margin: '0 0 6px 0', color: CONFIG.THEME.NAVY_MAIN, fontSize: '1.05rem', fontWeight: '700' }}>Ready to submit?</h4>
                <p style={{ margin: 0, color: CONFIG.THEME.TEXT_SEC, fontSize: '0.85rem', lineHeight: 1.5 }}>By submitting, you consent to secure data processing.</p>
              </div>
              <button 
                type="submit" disabled={uiState.isSubmitting}
                style={{ 
                  padding: '16px 32px', background: uiState.isSubmitting ? CONFIG.THEME.TEXT_TER : CONFIG.THEME.NAVY_MAIN, color: CONFIG.THEME.GOLD_MAIN, 
                  fontSize: '1rem', fontWeight: '700', border: 'none', borderRadius: CONFIG.THEME.RADIUS_FULL,
                  cursor: uiState.isSubmitting ? 'not-allowed' : 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: '10px', transition: CONFIG.THEME.TRANSITION_BOUNCE
                }}
              >
                {uiState.isSubmitting ? (
                  <>
                    <span style={{ display: 'inline-block', width: '16px', height: '16px', border: `3px solid ${CONFIG.THEME.BG_SURFACE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    Verifying...
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