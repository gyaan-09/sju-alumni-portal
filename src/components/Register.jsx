import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * =================================================================================================
 * SJU ALUMNI PORTAL - REGISTRATION SUITE (Real-Time Sync with Admin Portal)
 * =================================================================================================
 */

// --- 1. CONFIGURATION & CONSTANTS ---

const CONFIG = {
  // CRITICAL: This MUST match the Admin Panel's storage key to sync data in real-time
  DB_KEY: 'sju_titanium_ent_v31_navygold', 
};

const COUNTRIES = {
  INDIA: { code: '+91', label: 'IN 🇮🇳 (+91)', limit: 10 },
  USA:   { code: '+1',  label: 'US 🇺🇸 (+1)',  limit: 10 },
  UAE:   { code: '+971', label: 'AE 🇦🇪 (+971)', limit: 9 },
  UK:    { code: '+44', label: 'UK 🇬🇧 (+44)', limit: 10 }
};

const REGEX = {
  NAME: /^[a-zA-Z\s.]+$/, 
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  AADHAR: /^\d{4}-\d{4}-\d{4}$/, 
  DOB: /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/ 
};

// --- 2. PREMIUM THEME ENGINE (SJU NAVY & GOLD) ---

const THEME = {
  colors: {
    primary: '#02112b',       // SJU Navy
    primaryLight: '#071733',
    gold: '#D4AF37',          // SJU Gold
    bg: '#f4f7f6',            
    surface: '#ffffff', 
    textMain: '#1a1a1a',
    textLight: '#6b7280',
    error: '#EF4444',
    success: '#10B981',
    border: '#e5e7eb'
  },
  radius: { card: '24px', input: '12px' },
  shadows: { 
    card: '0 20px 40px rgba(2, 17, 43, 0.08)',
    input: '0 4px 6px rgba(0,0,0,0.02)'
  } 
};

// --- 3. TOAST NOTIFICATION COMPONENT ---
const ToastContainer = ({ toasts }) => (
  <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
    {toasts.map((t) => (
      <div key={t.id} className="toast-enter" style={{
        background: THEME.colors.surface,
        borderLeft: `4px solid ${t.type === 'success' ? THEME.colors.success : THEME.colors.gold}`,
        boxShadow: THEME.shadows.card, padding: "16px 20px", borderRadius: "8px",
        display: "flex", alignItems: "center", gap: 12, minWidth: "320px"
      }}>
        <div style={{ fontSize: 20, color: t.type === 'success' ? THEME.colors.success : THEME.colors.gold }}>
          {t.type === 'success' ? <i className="bi bi-check-circle-fill"></i> : <i className="bi bi-info-circle-fill"></i>}
        </div>
        <div style={{ flex: 1, color: THEME.colors.textMain, fontWeight: 500, fontSize: '0.95rem' }}>{t.msg}</div>
      </div>
    ))}
  </div>
);

// --- 4. KERNEL LOGIC & DATA SYNC ---

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
  validate: (name, value, context = {}) => {
    let error = null;
    switch (name) {
      case 'fullName':
        if (!value) error = 'Required field';
        else if (!REGEX.NAME.test(value)) error = 'Only letters allowed';
        break;
      case 'dob':
        if (!REGEX.DOB.test(value)) error = 'Format: DD-MM-YYYY';
        break;
      case 'email':
        if (!REGEX.EMAIL.test(value)) error = 'Invalid email format';
        break;
      case 'phone':
        if (value.length !== context.limit) error = `Must be ${context.limit} digits`;
        break;
      case 'aadhar':
        if (!REGEX.AADHAR.test(value)) error = 'Must be 12 digits';
        break;
      default: break;
    }
    return error;
  },

  // DATA MAPPER: Formats form data to strictly match the Admin Panel's expected schema
  saveToLedger: (data) => {
    try {
        const currentLedger = JSON.parse(localStorage.getItem(CONFIG.DB_KEY) || '[]');
        
        const names = data.fullName.split(' ');
        const firstName = names[0];
        const lastName = names.slice(1).join(' ') || '';

        const newEntry = {
            id: `SJU-${Date.now().toString().slice(-6)}`,
            firstName: firstName,
            lastName: lastName,
            fullName: data.fullName,
            email: data.email,
            dept: data.degree,
            batch: data.yearPassing,
            company: data.currentStatus === 'Job' ? data.companyName : (data.currentStatus === 'PG' ? data.pgCollege : 'Not Working'),
            status: 'PENDING',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName)}&background=02112b&color=D4AF37&bold=true`,
            securityChecks: {
              riskScore: Math.floor(Math.random() * 15 + 5), // Simulated risk score
              ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
              deviceMatch: true,
            },
            registeredAt: new Date().toISOString()
        };

        localStorage.setItem(CONFIG.DB_KEY, JSON.stringify([newEntry, ...currentLedger]));
        return { success: true, id: newEntry.id };
    } catch (e) {
        console.error("Save Error:", e);
        return { success: false };
    }
  }
};

// --- 5. UI COMPONENTS ---

const Input = ({ label, value, onChange, error, placeholder, width = 6, type = "text", maxLength, maskFn, required = true }) => {
  const [focused, setFocused] = useState(false);
  const handleChange = (e) => {
    let val = e.target.value;
    if (maskFn) val = maskFn(val);
    onChange(val);
  };
  return (
    <div style={{ gridColumn: `span ${width}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '0.85rem', fontWeight: '700', color: THEME.colors.primary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label} {required && <span style={{color: THEME.colors.error}}>*</span>}
      </label>
      <div style={{
        display: 'flex', alignItems: 'center', height: '54px',
        background: focused ? '#fff' : '#f9fafb',
        border: `2px solid ${error ? THEME.colors.error : focused ? THEME.colors.primary : THEME.colors.border}`,
        borderRadius: THEME.radius.input, transition: 'all 0.2s ease',
        boxShadow: focused ? THEME.shadows.input : 'none'
      }}>
        <input
          style={{ width: '100%', padding: '0 16px', fontSize: '1rem', border: 'none', background: 'transparent', outline: 'none', color: THEME.colors.textMain, fontWeight: '500' }}
          type={type} value={value} onChange={handleChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={placeholder} maxLength={maxLength}
        />
      </div>
      {error && <div style={{ color: THEME.colors.error, fontSize: '0.8rem', fontWeight: '600' }}>{error}</div>}
    </div>
  );
};

// --- 6. MAIN APPLICATION ---

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [form, setForm] = useState({
    fullName: '', fatherName: '', dob: '', gender: 'Male',
    email: '', countryCode: '+91', phone: '', aadhar: '',
    regNo: '', degree: 'BCA', yearPassing: '', 
    currentStatus: 'None', companyName: '', jobPosition: '', pgCourse: '', pgCollege: ''
  });

  const [files, setFiles] = useState({ profile: null, idProof: null });
  const [errors, setErrors] = useState({});

  const addToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const update = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleNext = () => {
    let newErrors = {};
    let isValid = true;

    if (step === 1) {
      if (Kernel.validate('fullName', form.fullName)) newErrors.fullName = Kernel.validate('fullName', form.fullName);
      if (Kernel.validate('dob', form.dob)) newErrors.dob = Kernel.validate('dob', form.dob);
    }
    if (step === 2) {
      if (Kernel.validate('email', form.email)) newErrors.email = Kernel.validate('email', form.email);
      const country = Object.values(COUNTRIES).find(c => c.code === form.countryCode);
      if (Kernel.validate('phone', form.phone, { limit: country.limit })) newErrors.phone = Kernel.validate('phone', form.phone, { limit: country.limit });
      if (Kernel.validate('aadhar', form.aadhar)) newErrors.aadhar = Kernel.validate('aadhar', form.aadhar);
    }
    if (step === 3) {
      if (!form.regNo) newErrors.regNo = "Required";
      if (!form.yearPassing) newErrors.yearPassing = "Required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); isValid = false;
      addToast("Please fix the errors before proceeding.", "error");
    }

    if (isValid) { 
      setStep(prev => prev + 1); 
      window.scrollTo(0, 0); 
    }
  };

  const handleSubmit = () => {
    if (!files.profile || !files.idProof) { 
      addToast("Profile Photo and ID Proof are required.", "error"); 
      return; 
    }

    setIsSubmitting(true);
    addToast("Encrypting and sending details to Admin...", "info");

    setTimeout(() => {
      const result = Kernel.saveToLedger(form);
      if (result.success) {
        setSuccessData(result.id);
        setIsSubmitting(false);
        addToast("Registration Submitted Successfully!", "success");
      }
    }, 2500); // Simulate network delay
  };

  // --- SUCCESS SCREEN ---
  if (successData) {
    return (
      <div style={{ minHeight: '100vh', background: THEME.colors.primary, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: "'Inter', sans-serif" }}>
        <ToastContainer toasts={toasts} />
        <div className="card-enter" style={{ background: THEME.colors.surface, maxWidth: '600px', width: '100%', borderRadius: THEME.radius.card, padding: '50px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <div style={{ width: '80px', height: '80px', background: THEME.colors.gold, borderRadius: '50%', color: THEME.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 24px auto', animation: 'pulse 2s infinite' }}>
            <i className="bi bi-shield-lock-fill"></i>
          </div>
          <h2 style={{ color: THEME.colors.primary, fontSize: '2rem', fontWeight: '800', margin: '0 0 16px 0' }}>Registration Successful</h2>
          <p style={{ color: THEME.colors.textLight, fontSize: '1.1rem', marginBottom: '32px' }}>Tracking ID: <strong>{successData}</strong></p>
          
          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: `1px solid ${THEME.colors.border}`, textAlign: 'left', marginBottom: '32px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: THEME.colors.primary, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="bi bi-clock-history"></i> What happens next?
            </h4>
            <p style={{ margin: 0, color: THEME.colors.textMain, lineHeight: '1.6', fontSize: '0.95rem' }}>
              Your application has been securely routed to the <strong>Admin Verification Queue</strong>. 
              Please wait until the university administration verifies your academic records and uploaded ID proof. 
              <br/><br/>
              Upon successful verification, an automated email containing your <strong>Login Credentials</strong> will be sent to <b>{form.email}</b>.
            </p>
          </div>

          <button style={{ background: THEME.colors.primary, color: 'white', padding: '16px 32px', borderRadius: '50px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', width: '100%' }} onClick={() => navigate('/login')}>
            Return to Login Portal
          </button>
        </div>

        <style>{`
          @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); } 70% { box-shadow: 0 0 0 20px rgba(212, 175, 55, 0); } 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); } }
          .card-enter { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
          @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    );
  }

  // --- REGISTRATION FORM ---
  return (
    <div style={{ minHeight: '100vh', background: THEME.colors.bg, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
      <ToastContainer toasts={toasts} />
      
      <div className="card-enter" style={{ width: '100%', maxWidth: '900px', background: THEME.colors.surface, borderRadius: THEME.radius.card, boxShadow: THEME.shadows.card, overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ background: THEME.colors.primary, padding: '40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: THEME.colors.surface }}>Alumni Registration</h1>
            <p style={{ color: THEME.colors.gold, fontSize: '0.9rem', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '8px' }}>St. Joseph's University Verification System</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', height: '6px', background: '#e2e8f0' }}>
          <div style={{ width: `${(step / 4) * 100}%`, background: THEME.colors.gold, transition: 'width 0.5s ease' }}></div>
        </div>

        {/* Form Body */}
        <div style={{ padding: '40px 50px' }}>
          
          {/* STEP 1 */}
          {step === 1 && (
            <div className="fade-enter">
              <h3 style={{ color: THEME.colors.primary, marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="bi bi-person-lines-fill"></i> Personal Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
                <Input label="Full Name (As per records)" width={12} value={form.fullName} error={errors.fullName} onChange={(v) => update('fullName', Kernel.toTitleCase(v))} placeholder="John Doe" />
                <Input label="Date of Birth" width={6} value={form.dob} error={errors.dob} onChange={(v) => update('dob', v)} maskFn={Kernel.maskDate} placeholder="DD-MM-YYYY" maxLength={10} />
                <div style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: THEME.colors.primary, textTransform: 'uppercase' }}>Gender *</label>
                  <select style={{ height: '54px', padding: '0 16px', borderRadius: THEME.radius.input, border: `2px solid ${THEME.colors.border}`, background: '#f9fafb', fontSize: '1rem', outline: 'none' }} value={form.gender} onChange={(e) => update('gender', e.target.value)}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="fade-enter">
              <h3 style={{ color: THEME.colors.primary, marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="bi bi-envelope-at-fill"></i> Contact Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
                <Input label="Primary Email (For Login Credentials)" width={12} value={form.email} error={errors.email} onChange={(v) => update('email', v)} placeholder="you@domain.com" />
                <div style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: THEME.colors.primary, textTransform: 'uppercase' }}>Phone Number *</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select style={{ width: '100px', height: '54px', padding: '0 10px', borderRadius: THEME.radius.input, border: `2px solid ${THEME.colors.border}`, background: '#f9fafb', outline: 'none' }} value={form.countryCode} onChange={(e) => update('countryCode', e.target.value)}>
                      {Object.values(COUNTRIES).map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                    </select>
                    <div style={{ flex: 1 }}><Input label="" width={12} value={form.phone} error={errors.phone} required={false} onChange={(v) => update('phone', v.replace(/\D/g,''))} placeholder="Digits Only" maxLength={12} /></div>
                  </div>
                </div>
                <Input label="Aadhar / SSN Number" width={6} value={form.aadhar} error={errors.aadhar} onChange={(v) => update('aadhar', v)} maskFn={Kernel.maskAadhar} placeholder="XXXX-XXXX-XXXX" maxLength={14} />
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="fade-enter">
              <h3 style={{ color: THEME.colors.primary, marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="bi bi-mortarboard-fill"></i> Academic Records</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
                <div style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: THEME.colors.primary, textTransform: 'uppercase' }}>Degree Graduated *</label>
                  <select style={{ height: '54px', padding: '0 16px', borderRadius: THEME.radius.input, border: `2px solid ${THEME.colors.border}`, background: '#f9fafb', fontSize: '1rem', outline: 'none' }} value={form.degree} onChange={(e) => update('degree', e.target.value)}>
                    <option>B.Sc Computer Science</option><option>BCA</option><option>B.Com</option><option>MBA</option>
                  </select>
                </div>
                <Input label="University Register No." width={6} value={form.regNo} error={errors.regNo} onChange={(v) => update('regNo', v.toUpperCase())} />
                
                <div style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: THEME.colors.primary, textTransform: 'uppercase' }}>Year of Passing *</label>
                  <select style={{ height: '54px', padding: '0 16px', borderRadius: THEME.radius.input, border: `2px solid ${errors.yearPassing ? THEME.colors.error : THEME.colors.border}`, background: '#f9fafb', fontSize: '1rem', outline: 'none' }} value={form.yearPassing} onChange={(e) => update('yearPassing', e.target.value)}>
                    <option value="">Select Year</option>
                    {Array.from({length: 15}, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  {errors.yearPassing && <div style={{ color: THEME.colors.error, fontSize: '0.8rem', fontWeight: '600' }}>{errors.yearPassing}</div>}
                </div>
                <div style={{ gridColumn: 'span 6' }}></div> {/* Spacer */}

                <div style={{ gridColumn: 'span 12', padding: '20px', background: '#f0f4f8', borderRadius: '12px', marginTop: '10px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '700', color: THEME.colors.primary, textTransform: 'uppercase' }}>Current Employment Status</label>
                  <div style={{ display: 'flex', gap: '30px', marginTop: '16px' }}>
                    {['None', 'Job', 'PG'].map(s => (
                      <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: form.currentStatus === s ? 'bold' : 'normal', color: THEME.colors.primary }}>
                        <input type="radio" checked={form.currentStatus === s} onChange={() => update('currentStatus', s)} style={{ accentColor: THEME.colors.primary, width: '18px', height: '18px' }} />
                        {s === 'None' ? 'Not Working' : (s === 'Job' ? 'Employed' : 'Higher Studies')}
                      </label>
                    ))}
                  </div>
                </div>

                {form.currentStatus === 'Job' && (
                  <>
                    <Input label="Company Name" width={6} value={form.companyName} onChange={(v) => update('companyName', v)} />
                    <Input label="Job Position" width={6} value={form.jobPosition} onChange={(v) => update('jobPosition', v)} />
                  </>
                )}
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="fade-enter">
              <h3 style={{ color: THEME.colors.primary, marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="bi bi-cloud-arrow-up-fill"></i> Document Verification</h3>
              <p style={{ color: THEME.colors.textLight, fontSize: '0.9rem', marginBottom: '24px' }}>Please upload clear images. These are strictly required for administrative verification.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
                {/* Profile Photo Upload */}
                <div style={{ gridColumn: 'span 6' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: THEME.colors.primary, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Profile Photo *</label>
                  <div onClick={() => document.getElementById('up1').click()} style={{ border: `2px dashed ${files.profile ? THEME.colors.success : THEME.colors.border}`, borderRadius: '16px', padding: '40px 20px', textAlign: 'center', background: files.profile ? '#f0fdf4' : '#f9fafb', cursor: 'pointer', transition: 'all 0.2s' }}>
                    {files.profile ? 
                      <><i className="bi bi-check-circle-fill" style={{ fontSize: '2.5rem', color: THEME.colors.success }}></i><div style={{ color: THEME.colors.success, fontWeight: '600', marginTop: '10px' }}>{files.profile.name}</div></> : 
                      <><i className="bi bi-camera-fill" style={{ fontSize: '2.5rem', color: THEME.colors.textLight }}></i><div style={{ color: THEME.colors.textLight, fontWeight: '500', marginTop: '10px' }}>Click to upload JPG/PNG</div></>
                    }
                    <input id="up1" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setFiles({...files, profile: e.target.files[0]})} />
                  </div>
                </div>

                {/* ID Proof Upload */}
                <div style={{ gridColumn: 'span 6' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: THEME.colors.primary, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Govt / Student ID *</label>
                  <div onClick={() => document.getElementById('up2').click()} style={{ border: `2px dashed ${files.idProof ? THEME.colors.success : THEME.colors.border}`, borderRadius: '16px', padding: '40px 20px', textAlign: 'center', background: files.idProof ? '#f0fdf4' : '#f9fafb', cursor: 'pointer', transition: 'all 0.2s' }}>
                    {files.idProof ? 
                      <><i className="bi bi-check-circle-fill" style={{ fontSize: '2.5rem', color: THEME.colors.success }}></i><div style={{ color: THEME.colors.success, fontWeight: '600', marginTop: '10px' }}>{files.idProof.name}</div></> : 
                      <><i className="bi bi-file-earmark-person-fill" style={{ fontSize: '2.5rem', color: THEME.colors.textLight }}></i><div style={{ color: THEME.colors.textLight, fontWeight: '500', marginTop: '10px' }}>Click to upload PDF/JPG</div></>
                    }
                    <input id="up2" type="file" accept=".pdf,image/*" style={{ display: 'none' }} onChange={e => setFiles({...files, idProof: e.target.files[0]})} />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div style={{ padding: '24px 50px', borderTop: `1px solid ${THEME.colors.border}`, background: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} style={{ padding: '12px 24px', background: 'transparent', border: `1px solid ${THEME.colors.border}`, borderRadius: '50px', fontWeight: '600', color: THEME.colors.textLight, cursor: 'pointer' }}>
              Back
            </button>
          ) : (
            <button onClick={() => navigate('/login')} style={{ padding: '12px 24px', background: 'transparent', border: `1px solid transparent`, borderRadius: '50px', fontWeight: '600', color: THEME.colors.textLight, cursor: 'pointer' }}>
              Cancel
            </button>
          )}
          
          {step < 4 ? (
            <button onClick={handleNext} style={{ padding: '14px 32px', background: THEME.colors.primary, color: THEME.colors.gold, border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(2, 17, 43, 0.2)' }}>
              Next Step <i className="bi bi-arrow-right"></i>
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting} style={{ padding: '14px 32px', background: isSubmitting ? THEME.colors.textLight : THEME.colors.gold, color: THEME.colors.primary, border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '1rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: isSubmitting ? 'none' : '0 4px 12px rgba(212, 175, 55, 0.3)' }}>
              {isSubmitting ? 'Encrypting...' : 'Submit Registration'} <i className="bi bi-shield-check"></i>
            </button>
          )}
        </div>
      </div>

      <style>{`
        .fade-enter { animation: fade 0.4s ease-out forwards; }
        .toast-enter { animation: slideLeft 0.3s ease-out forwards; }
        @keyframes fade { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideLeft { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
};

export default Register;