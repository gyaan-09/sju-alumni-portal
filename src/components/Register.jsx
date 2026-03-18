import React, { useState, useRef } from 'react';
import API_BASE_URL from '../config';

/* ────────────────────────────────────────────────────────── */
/* CONFIG                                                      */
/* ────────────────────────────────────────────────────────── */
const API_BASE  = `${API_BASE_URL}/api/alumni`;
const API_EMAIL = `${API_BASE_URL}/api/send-email`;

const T = {
  NAVY: '#0C2340', NAVY_DARK: '#061121', NAVY_LITE: '#1A3B66',
  GOLD: '#D4AF37', GOLD_LITE: '#FDF6DC',
  SUCCESS: '#10B981', DANGER: '#EF4444',
  BG: '#F0F4F8', SURFACE: '#FFFFFF', BORDER: '#E2E8F0',
  TEXT: '#0F172A', TEXT2: '#475569', TEXT3: '#94A3B8',
};

/* ────────────────────────────────────────────────────────── */
/* STEPS DEFINITION                                            */
/* ────────────────────────────────────────────────────────── */
const STEPS = [
  { id: 0, label: 'Personal Info',  icon: 'bi-person-fill' },
  { id: 1, label: 'Academic',       icon: 'bi-mortarboard-fill' },
  { id: 2, label: 'Career',         icon: 'bi-briefcase-fill' },
  { id: 3, label: 'Identity Docs',  icon: 'bi-shield-check-fill' },
  { id: 4, label: 'Review & Submit',icon: 'bi-check-circle-fill' },
];

const COUNTRY_CODES = [
  { code: '+91', country: 'India' },
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+971', country: 'UAE' },
  { code: '+61', country: 'Australia' },
  { code: '+65', country: 'Singapore' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' },
  { code: '+966', country: 'Saudi Arabia' },
];

/* ────────────────────────────────────────────────────────── */
/* HELPERS                                                     */
/* ────────────────────────────────────────────────────────── */
const fileToBase64 = (file) => new Promise((res, rej) => {
  const reader = new FileReader();
  reader.onload  = () => res(reader.result);
  reader.onerror = rej;
  reader.readAsDataURL(file);
});

const toTitleCase = (str) => {
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const formatDOB = (val) => {
  let cleaned = val.replace(/\D/g, '').substring(0, 8);
  let formatted = '';
  if (cleaned.length > 0) {
    formatted += cleaned.substring(0, 2);
    if (cleaned.length > 2) {
      formatted += '-' + cleaned.substring(2, 4);
      if (cleaned.length > 4) {
        formatted += '-' + cleaned.substring(4, 8);
      }
    }
  }
  return formatted;
};

const formatAadhar = (val) => {
  let cleaned = val.replace(/\D/g, '').substring(0, 12);
  let formatted = '';
  if (cleaned.length > 0) formatted += cleaned.substring(0, 4);
  if (cleaned.length > 4) formatted += '-' + cleaned.substring(4, 8);
  if (cleaned.length > 8) formatted += '-' + cleaned.substring(8, 12);
  return formatted;
};

/* ────────────────────────────────────────────────────────── */
/* FORM FIELD COMPONENT                                        */
/* ────────────────────────────────────────────────────────── */
const Field = ({ label, name, type = 'text', value, onChange, required, options, placeholder, error, maxLength }) => {
  const [focused, setFocused] = useState(false);
  const base = {
    width: '100%', padding: '12px 14px', borderRadius: '10px',
    border: `1.5px solid ${error ? T.DANGER : focused ? T.NAVY : T.BORDER}`,
    fontSize: '0.95rem', background: '#FFF', color: T.TEXT,
    outline: 'none', transition: 'border 0.2s', fontFamily: 'inherit',
    boxSizing: 'border-box',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '0.82rem', fontWeight: '700', color: T.TEXT2 }}>
        {label}{required && <span style={{ color: T.DANGER }}> *</span>}
      </label>
      {options ? (
        <select name={name} value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={base}>
          <option value="">Select…</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea name={name} value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder={placeholder} rows={3} style={{ ...base, resize: 'vertical' }} />
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder={placeholder} required={required} maxLength={maxLength} style={base} />
      )}
      {error && <span style={{ color: T.DANGER, fontSize: '0.75rem', fontWeight: '600' }}>{error}</span>}
    </div>
  );
};

const FileField = ({ label, name, onChange, required, accept, preview }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '0.82rem', fontWeight: '700', color: T.TEXT2 }}>
      {label}{required && <span style={{ color: T.DANGER }}> *</span>}
    </label>
    <label style={{ border: `1.5px dashed ${T.BORDER}`, borderRadius: '10px', padding: '20px', textAlign: 'center', cursor: 'pointer', background: T.BG }}>
      <input type="file" name={name} onChange={onChange} accept={accept} style={{ display: 'none' }} />
      {preview ? (
        <img src={preview} alt="preview" style={{ maxHeight: '120px', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px' }} />
      ) : (
        <div style={{ color: T.TEXT3, fontSize: '0.9rem' }}>
          <i className="bi bi-upload" style={{ fontSize: '1.5rem', display: 'block', marginBottom: '8px' }} />
          Click to upload
        </div>
      )}
    </label>
  </div>
);

/* ────────────────────────────────────────────────────────── */
/* PROGRESS BAR                                               */
/* ────────────────────────────────────────────────────────── */
const ProgressBar = ({ currentStep }) => (
  <div style={{ padding: '28px 32px 0', borderBottom: `1px solid ${T.BORDER}`, background: '#FFF' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', paddingBottom: '16px' }}>
      <div style={{ position: 'absolute', top: '18px', left: '0', right: '0', height: '2px', background: T.BORDER, zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '18px', left: '0', height: '2px', background: T.NAVY, zIndex: 0, transition: 'width 0.4s ease', width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} />
      {STEPS.map(step => (
        <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1, cursor: 'default' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: currentStep > step.id ? T.SUCCESS : currentStep === step.id ? T.NAVY : '#FFF',
            border: `2px solid ${currentStep >= step.id ? (currentStep > step.id ? T.SUCCESS : T.NAVY) : T.BORDER}`,
            color: currentStep >= step.id ? '#FFF' : T.TEXT3, transition: 'all 0.3s ease', fontSize: currentStep > step.id ? '1.1rem' : '0.85rem'
          }}>
            {currentStep > step.id ? <i className="bi bi-check-lg" /> : <i className={`bi ${step.icon}`} />}
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: currentStep === step.id ? '800' : '500', color: currentStep === step.id ? T.NAVY : T.TEXT3, whiteSpace: 'nowrap' }}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  </div>
);

/* ────────────────────────────────────────────────────────── */
/* MAIN REGISTER COMPONENT                                    */
/* ────────────────────────────────────────────────────────── */
const Register = () => {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [idPreview, setIdPreview] = useState(null);

  const [form, setForm] = useState({
    // Step 0: Personal
    fullName: '', fathersName: '', mothersName: '', email: '',
    countryCode: '+91', phoneNumber: '', dateOfBirth: '', gender: '', aadhar: '', age: '',
    // Step 1: Academic
    registerNumber: '', degree: '', batchYear: '', pgCollege: '', pgCourse: '',
    // Step 2: Career
    currentStatus: '', companyName: '', designation: '', linkedInProfile: '', skills: '',
    // Step 3: Documents
    profilePhotoUrl: '', idProofUrl: '',
  });

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Auto-formatting logic
    if (['fullName', 'fathersName', 'mothersName'].includes(name)) {
      value = toTitleCase(value);
    } else if (name === 'dateOfBirth') {
      value = formatDOB(value);
    } else if (name === 'aadhar') {
      value = formatAadhar(value);
    } else if (['registerNumber', 'username', 'email'].includes(name)) {
       value = value.trim();
    }
    
    setForm(p => ({ ...p, [name]: value }));
    setError('');
  };

  const handleFile = async (e, previewSetter, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      previewSetter(base64);
      setForm(p => ({ ...p, [fieldName]: base64 }));
    } catch {
      setError('File upload failed. Try again.');
    }
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.fullName.trim()) return 'Full Name is required.';
      if (form.fullName.split(' ').length < 2) return 'Full Name should contain at least two words (e.g., Ram Kumar).';
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) return 'Invalid Email Format. Please use you@domain.com';
      
      const phoneClean = form.phoneNumber.replace(/\D/g, '');
      if (form.countryCode === '+91') {
          if (phoneClean.length !== 10) return 'India phone numbers must have exactly 10 digits.';
      } else {
          if (phoneClean.length < 7 || phoneClean.length > 15) return 'Invalid international phone number length.';
      }
      
      const dobRegex = /^\d{2}-\d{2}-\d{4}$/;
      if (!dobRegex.test(form.dateOfBirth)) return 'Date Of Birth must be in dd-mm-yyyy format.';
      
      const ageNum = parseInt(form.age);
      if (isNaN(ageNum) || ageNum <= 0 || ageNum >= 100) return 'Age Error: It should be greater than 0 and less than 100.';
      
      const aadharRegex = /^\d{4}-\d{4}-\d{4}$/;
      if (!aadharRegex.test(form.aadhar)) return 'Aadhar Card Number must be exactly 12 digits (xxxx-xxxx-xxxx).';
      
      if (!form.gender) return 'Gender selection is required.';
    }
    if (step === 1) {
      if (!form.registerNumber.trim()) return 'Register Number is required.';
      if (!form.degree) return 'Degree is required.';
      if (!form.batchYear) return 'Batch Year is required.';
    }
    if (step === 3) {
      if (!form.profilePhotoUrl) return 'Profile photo is required.';
      if (!form.idProofUrl) return 'Identity document is required.';
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => { setError(''); setStep(s => Math.max(s - 1, 0)); };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      // Convert dateOfBirth from dd-mm-yyyy to ISO format for backend
      const payload = { 
          ...form,
          phoneNumber: `${form.countryCode} ${form.phoneNumber}`
      };
      if (payload.dateOfBirth) {
        const parts = payload.dateOfBirth.split('-');
        if (parts.length === 3) {
          // Construct yyyy-mm-dd for standard Date parsing
          const isoCompat = `${parts[2]}-${parts[1]}-${parts[0]}`;
          payload.dateOfBirth = new Date(isoCompat).toISOString();
        }
      }
      if (payload.batchYear) payload.batchYear = parseInt(payload.batchYear);
      if (payload.age) payload.age = parseInt(payload.age);
      if (payload.skills) payload.skills = payload.skills.split(',').map(s => s.trim()).filter(Boolean);

      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Submission failed.');

      // Send confirmation email via Nodemailer backend (non-critical)
      try {
        await fetch(API_EMAIL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'registration_submitted',
            to_name: form.fullName,
            to_email: form.email,
            message: 'Your registration has been received and is pending admin verification.',
          }),
        });
      } catch { /* email failure is non-critical */ }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── REVIEW SUMMARY ─────────────────────────────────── */
  const ReviewItem = ({ label, value }) => (
    value ? (
      <div style={{ display: 'flex', gap: '8px', padding: '6px 0', borderBottom: `1px solid ${T.BORDER}` }}>
        <span style={{ width: '160px', flexShrink: 0, fontSize: '0.82rem', color: T.TEXT3, fontWeight: '600' }}>{label}</span>
        <span style={{ fontSize: '0.9rem', color: T.TEXT, fontWeight: '600', wordBreak: 'break-all' }}>{value}</span>
      </div>
    ) : null
  );

  /* ── PAGE WRAPPERS ───────────────────────────────────── */
  const gridTwo = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: T.BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ background: '#FFF', borderRadius: '20px', padding: '60px 48px', maxWidth: '560px', width: '100%', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.08)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <i className="bi bi-check-lg" style={{ fontSize: '2.5rem', color: T.SUCCESS }} />
          </div>
          <h2 style={{ color: T.NAVY, margin: '0 0 12px', fontSize: '1.8rem', fontWeight: '800' }}>Application Submitted!</h2>
          <p style={{ color: T.TEXT2, lineHeight: '1.7', margin: '0 0 32px' }}>
            Your registration has been received and is pending verification by the SJU Admin team. You'll receive your login credentials via email once approved.
          </p>
          <a href="/login" style={{ display: 'inline-block', padding: '14px 32px', background: T.NAVY, color: T.GOLD, borderRadius: '999px', fontWeight: '700', textDecoration: 'none', fontSize: '0.95rem' }}>
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: T.BG, fontFamily: "'Lora', Georgia, serif", paddingBottom: '60px' }}>
      {/* Page Header */}
      <div style={{ background: `linear-gradient(135deg, ${T.NAVY_DARK}, ${T.NAVY})`, padding: '40px 24px 60px', textAlign: 'center' }}>
        <h1 style={{ color: '#FFF', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: '900', margin: 0 }}>
          Alumni Registration
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', margin: '10px 0 0', fontSize: '1rem' }}>
          Join the SJU Alumni Network — St. Joseph's University, Bengaluru
        </p>
      </div>

      {/* Card */}
      <div style={{ maxWidth: '1000px', margin: '-36px auto 0', padding: '0 20px' }}>
        <div style={{ background: '#FFF', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <ProgressBar currentStep={step} />

          <div style={{ padding: '36px 36px 28px' }}>

            {/* ── STEP 0: Personal ── */}
            {step === 0 && (
              <div>
                <h3 style={{ color: T.NAVY, margin: '0 0 6px', fontSize: '1.3rem', fontWeight: '800' }}>Personal Information</h3>
                <p style={{ color: T.TEXT3, margin: '0 0 28px', fontSize: '0.9rem' }}>Tell us about yourself.</p>
                <div className="reg-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <Field label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required placeholder="e.g. Ram Kumar" />
                  <Field label="Primary Email Id" name="email" value={form.email} onChange={handleChange} required placeholder="you@domain.com" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '700', color: T.TEXT2 }}>
                      Contact Number<span style={{ color: T.DANGER }}> *</span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select name="countryCode" value={form.countryCode} onChange={handleChange} style={{ padding: '12px 10px', borderRadius: '10px', border: `1.5px solid ${T.BORDER}`, fontSize: '0.9rem', width: '90px', background: '#FFF' }}>
                        {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.country})</option>)}
                      </select>
                      <input type="text" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="9XXXXXXXXX" maxLength={15} style={{ flex: 1, padding: '12px 14px', borderRadius: '10px', border: `1.5px solid ${T.BORDER}`, fontSize: '0.95rem', background: '#FFF' }} />
                    </div>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Field label="Date of Birth" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} placeholder="dd-mm-yyyy" maxLength={10} />
                    <input type="date" style={{ position: 'absolute', top: '30px', right: '10px', width: '24px', height: '24px', opacity: 0, cursor: 'pointer' }} onChange={(e) => {
                      if (e.target.value) {
                        const d = e.target.value.split('-');
                        setForm(p => ({ ...p, dateOfBirth: `${d[2]}-${d[1]}-${d[0]}` }));
                      }
                    }} />
                  </div>
                  <Field label="Gender" name="gender" value={form.gender} onChange={handleChange} required options={['Male', 'Female', 'Other', 'Prefer not to say']} />
                  <Field label="Age" name="age" type="text" value={form.age} onChange={handleChange} placeholder="e.g. 25" maxLength={2} />
                  <Field label="Father's Name" name="fathersName" value={form.fathersName} onChange={handleChange} placeholder="First Last" />
                  <Field label="Mother's Name" name="mothersName" value={form.mothersName} onChange={handleChange} placeholder="First Last" />
                  <div style={{ gridColumn: 'span 2' }}>
                    <Field label="Aadhar Card Number" name="aadhar" value={form.aadhar} onChange={handleChange} placeholder="xxxx-xxxx-xxxx" maxLength={14} />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 1: Academic ── */}
            {step === 1 && (
              <div>
                <h3 style={{ color: T.NAVY, margin: '0 0 6px', fontSize: '1.3rem', fontWeight: '800' }}>Academic Details</h3>
                <p style={{ color: T.TEXT3, margin: '0 0 28px', fontSize: '0.9rem' }}>Your SJU academic history.</p>
                <div className="reg-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <Field label="Register Number" name="registerNumber" value={form.registerNumber} onChange={handleChange} required placeholder="e.g. 232BCAA14" />
                  <Field label="Degree / Programme" name="degree" value={form.degree} onChange={handleChange} required options={['B.Com', 'MBA', 'BCA', 'MCA', 'MSW', 'M.A.', 'B.A.', 'B.Sc.', 'M.Sc.', 'LLB', 'Ph.D', 'Other']} />
                  <Field label="Year Of Passing" name="batchYear" value={form.batchYear} onChange={handleChange} required options={Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() + 1 - i))} />
                  <Field label="PG College (if applicable)" name="pgCollege" value={form.pgCollege} onChange={handleChange} placeholder="Post-grad institution" />
                  <div style={{ gridColumn: 'span 2' }}>
                    <Field label="PG Course / Specialisation" name="pgCourse" value={form.pgCourse} onChange={handleChange} placeholder="e.g. MBA in Finance" />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Career ── */}
            {step === 2 && (
              <div>
                <h3 style={{ color: T.NAVY, margin: '0 0 6px', fontSize: '1.3rem', fontWeight: '800' }}>Career & Professional</h3>
                <p style={{ color: T.TEXT3, margin: '0 0 28px', fontSize: '0.9rem' }}>Your current professional status.</p>
                <div style={gridTwo}>
                  <Field label="Current Status" name="currentStatus" value={form.currentStatus} onChange={handleChange} options={['Employed', 'Self-Employed', 'Higher Studies', 'Freelancer', 'Seeking Opportunities', 'Other']} />
                  <Field label="Company / Organisation" name="companyName" value={form.companyName} onChange={handleChange} placeholder="e.g. Infosys" />
                  <Field label="Designation / Role" name="designation" value={form.designation} onChange={handleChange} placeholder="e.g. Software Engineer" />
                  <Field label="LinkedIn Profile URL" name="linkedInProfile" value={form.linkedInProfile} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Field label="Skills (comma-separated)" name="skills" type="textarea" value={form.skills} onChange={handleChange} placeholder="e.g. Python, React, Data Analysis, Leadership" />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Documents ── */}
            {step === 3 && (
              <div>
                <h3 style={{ color: T.NAVY, margin: '0 0 6px', fontSize: '1.3rem', fontWeight: '800' }}>Identity Documents</h3>
                <p style={{ color: T.TEXT3, margin: '0 0 28px', fontSize: '0.9rem' }}>Upload your profile photo and a government/university ID for verification.</p>
                <div style={gridTwo}>
                  <FileField label="Profile Photo" name="profilePhoto" accept="image/*" onChange={e => handleFile(e, setPhotoPreview, 'profilePhotoUrl')} preview={photoPreview} required />
                  <FileField label="Identity Document (Aadhar / College ID)" name="idProof" accept="image/*,application/pdf" onChange={e => handleFile(e, setIdPreview, 'idProofUrl')} preview={idPreview} required />
                </div>
                <p style={{ margin: '20px 0 0', fontSize: '0.82rem', color: T.TEXT3 }}>
                  <i className="bi bi-info-circle" /> Accepted formats: JPG, PNG, PDF. Your documents are encrypted and used only for verification.
                </p>
              </div>
            )}

            {/* ── STEP 4: Review ── */}
            {step === 4 && (
              <div>
                <h3 style={{ color: T.NAVY, margin: '0 0 6px', fontSize: '1.3rem', fontWeight: '800' }}>Review Your Application</h3>
                <p style={{ color: T.TEXT3, margin: '0 0 24px', fontSize: '0.9rem' }}>Please confirm all details before submitting.</p>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {/* Left column: photo */}
                  {photoPreview && (
                    <div style={{ flexShrink: 0 }}>
                      <img src={photoPreview} alt="Profile" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${T.GOLD}` }} />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <ReviewItem label="Full Name" value={form.fullName} />
                    <ReviewItem label="Email" value={form.email} />
                    <ReviewItem label="Phone" value={`${form.countryCode} ${form.phoneNumber}`} />
                    <ReviewItem label="Gender" value={form.gender} />
                    <ReviewItem label="Date of Birth" value={form.dateOfBirth} />
                    <ReviewItem label="Register No." value={form.registerNumber} />
                    <ReviewItem label="Degree" value={form.degree} />
                    <ReviewItem label="Batch Year" value={form.batchYear} />
                    <ReviewItem label="Current Status" value={form.currentStatus} />
                    <ReviewItem label="Company" value={form.companyName} />
                    <ReviewItem label="Designation" value={form.designation} />
                    <ReviewItem label="Skills" value={form.skills} />
                    <ReviewItem label="LinkedIn" value={form.linkedInProfile} />
                  </div>
                </div>
                <div style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${T.GOLD}`, borderRadius: '10px', padding: '14px 18px', marginTop: '24px', fontSize: '0.85rem', color: T.TEXT2 }}>
                  <i className="bi bi-info-circle-fill" style={{ color: T.GOLD, marginRight: '8px' }} />
                  By submitting, you agree that your information will be reviewed by the SJU Admin team. You'll receive login credentials by email after approval.
                </div>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div style={{ marginTop: '20px', padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: `1px solid ${T.DANGER}`, borderRadius: '10px', color: T.DANGER, fontSize: '0.875rem', fontWeight: '600' }}>
                <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: '8px' }} />
                {error}
              </div>
            )}
          </div>

          {/* FOOTER NAV */}
          <div style={{ padding: '0 36px 32px', display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={back} disabled={step === 0 || submitting} style={{
              padding: '12px 28px', borderRadius: '999px', border: `2px solid ${T.BORDER}`,
              background: 'transparent', color: step === 0 ? T.TEXT3 : T.TEXT, fontWeight: '700',
              cursor: step === 0 ? 'not-allowed' : 'pointer', fontSize: '0.95rem', fontFamily: 'inherit'
            }}>
              ← Back
            </button>

            {step < STEPS.length - 1 ? (
              <button onClick={next} style={{
                padding: '12px 32px', borderRadius: '999px', border: 'none',
                background: `linear-gradient(135deg, ${T.NAVY}, ${T.NAVY_LITE})`, color: T.GOLD,
                fontWeight: '800', cursor: 'pointer', fontSize: '0.95rem', fontFamily: 'inherit'
              }}>
                Continue →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} style={{
                padding: '12px 36px', borderRadius: '999px', border: 'none',
                background: submitting ? T.BORDER : `linear-gradient(135deg, ${T.SUCCESS}, #059669)`,
                color: '#FFF', fontWeight: '800', cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                {submitting && <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#FFF', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />}
                {submitting ? 'Submitting…' : '✓ Submit Application'}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; font-family: 'Lora', serif !important; }
        @media (max-width: 768px) {
          .reg-container { padding: 12px 16px !important; }
          .reg-card { padding: 24px !important; }
          .reg-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          div[style*="gridTemplateColumns: '1fr 1fr'"] { grid-template-columns: 1fr !important; }
          .progress-steps { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Register;