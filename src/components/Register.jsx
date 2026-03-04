import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// FIREBASE INTEGRATION (Concept)
// import { db, storage } from '../firebaseConfig'; 
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * ============================================================================
 * SJU ALUMNI PORTAL - PROFESSIONAL REGISTRATION SUITE
 * Integrated with Firebase & Admin OS Routing
 * ============================================================================
 */

const THEME = {
  font: "'Lora', serif",
  colors: {
    primary: '#02112b',       // SJU Navy
    gold: '#D4AF37',          // SJU Gold
    bg: '#f8fafc',
    surface: '#ffffff',
    textMain: '#1e293b',
    textLight: '#64748b',
    error: '#dc2626',
    border: '#cbd5e1',
    sectionBg: '#f1f5f9'
  }
};

const COUNTRIES = {
  INDIA: { code: '+91', label: 'IN (+91)', limit: 10 },
  USA:   { code: '+1',  label: 'US (+1)',  limit: 10 },
  UAE:   { code: '+971', label: 'AE (+971)', limit: 9 },
  UK:    { code: '+44', label: 'UK (+44)', limit: 10 }
};

// --- KERNEL LOGIC & VALIDATION ---
const Kernel = {
  toTitleCase: (str) => {
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },
  
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

  validateEmail: (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
};

// --- REUSABLE UI COMPONENTS ---
const SectionHeader = ({ title, subtitle }) => (
  <div style={{ marginBottom: '24px', paddingBottom: '12px', borderBottom: `2px solid ${THEME.colors.gold}` }}>
    <h2 style={{ fontFamily: THEME.font, color: THEME.colors.primary, fontSize: '1.75rem', margin: '0 0 8px 0', fontWeight: '700' }}>
      {title}
    </h2>
    {subtitle && <p style={{ margin: 0, color: THEME.colors.textLight, fontSize: '0.95rem' }}>{subtitle}</p>}
  </div>
);

const InputGroup = ({ label, error, children, width = '100%' }) => (
  <div style={{ width, display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
    <label style={{ fontFamily: THEME.font, fontSize: '0.9rem', fontWeight: '600', color: THEME.colors.primary }}>
      {label} {error && <span style={{ color: THEME.colors.error, fontSize: '0.8rem', fontWeight: 'normal', marginLeft: '8px' }}>- {error}</span>}
    </label>
    {children}
  </div>
);

const BaseInputStyle = {
  width: '100%', padding: '12px 16px', fontSize: '1rem', fontFamily: THEME.font,
  border: `1px solid ${THEME.colors.border}`, borderRadius: '4px',
  color: THEME.colors.textMain, backgroundColor: THEME.colors.surface,
  outline: 'none', transition: 'border-color 0.2s ease'
};

// --- MAIN REGISTRATION COMPONENT ---
const Register = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
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
    
    // Applying Constraints
    if (['fullName', 'fatherName', 'motherName'].includes(field)) {
      finalValue = Kernel.toTitleCase(value);
    }
    if (field === 'dob') {
      finalValue = Kernel.maskDate(value);
      const calculatedAge = Kernel.calculateAge(finalValue);
      setForm(prev => ({ ...prev, age: calculatedAge !== null ? calculatedAge : '' }));
    }
    if (field === 'aadhar') finalValue = Kernel.maskAadhar(value);
    if (field === 'phone') finalValue = value.replace(/\D/g, '');

    setForm(prev => ({ ...prev, [field]: finalValue }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleFileChange = (field, file) => {
    setFiles(prev => ({ ...prev, [field]: file }));
  };

  const validateForm = () => {
    let newErrors = {};
    
    if (!form.fullName) newErrors.fullName = "Required";
    if (!form.fatherName) newErrors.fatherName = "Required";
    if (!form.motherName) newErrors.motherName = "Required";
    if (!form.regNo) newErrors.regNo = "Required";
    
    if (!Kernel.validateEmail(form.email)) newErrors.email = "Invalid email format (e.g., you@domain.com)";
    
    const country = Object.values(COUNTRIES).find(c => c.code === form.countryCode);
    if (form.phone.length !== country.limit) newErrors.phone = `Must be exactly ${country.limit} digits`;
    
    if (form.aadhar.length !== 14) newErrors.aadhar = "Must be exactly 12 digits";
    
    if (form.dob.length !== 10) newErrors.dob = "Required format: DD-MM-YYYY";
    if (form.age && (form.age <= 0 || form.age >= 100)) newErrors.age = "Age must be between 1 and 99";
    
    if (!form.gender) newErrors.gender = "Required";
    if (!form.degree) newErrors.degree = "Required";
    if (!form.batchYear) newErrors.batchYear = "Required";

    if (!files.profile) newErrors.profile = "Profile photo is required";
    if (!files.idProof) newErrors.idProof = "ID proof is required for verification";

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      /* // ==========================================
      // FIREBASE INTEGRATION LOGIC (For Admin OS)
      // ==========================================
      
      // 1. Upload Documents to Storage
      let profileUrl = '';
      let idProofUrl = '';

      if (files.profile) {
        const profileRef = ref(storage, `alumni_profiles/${form.regNo}_${files.profile.name}`);
        await uploadBytes(profileRef, files.profile);
        profileUrl = await getDownloadURL(profileRef);
      }

      if (files.idProof) {
        const idRef = ref(storage, `alumni_id_proofs/${form.regNo}_${files.idProof.name}`);
        await uploadBytes(idRef, files.idProof);
        idProofUrl = await getDownloadURL(idRef);
      }

      // 2. Compile Data Payload
      const dbPayload = {
        ...form,
        profilePhotoUrl: profileUrl,
        idProofUrl: idProofUrl,
        status: 'PENDING_VERIFICATION', // Flags it for your Admin OS to review
        registeredAt: serverTimestamp(),
      };

      // 3. Save to Firestore
      await addDoc(collection(db, "pending_alumni"), dbPayload);
      */

      // Simulated network request
      await new Promise(res => setTimeout(res, 2500));
      setSuccess(true);
      window.scrollTo(0, 0);

    } catch (error) {
      console.error("Error submitting registration:", error);
      alert("Registration failed. Please check your network or try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- SUCCESS SCREEN ---
  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: THEME.colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: THEME.font }}>
        <div style={{ background: THEME.colors.surface, padding: '60px 40px', maxWidth: '700px', width: '100%', borderTop: `8px solid ${THEME.colors.gold}`, boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
          <h1 style={{ color: THEME.colors.primary, fontSize: '2.5rem', marginBottom: '24px', textAlign: 'center' }}>Application Received</h1>
          <p style={{ color: THEME.colors.textMain, fontSize: '1.2rem', lineHeight: '1.8', textAlign: 'center', marginBottom: '40px' }}>
            Your details have been securely transmitted to the St. Joseph's University Administration. 
            <br/><br/>
            <strong>The admin will verify your ID proof and academic records. Upon approval, your unique username and password will be sent shortly to your registered email address.</strong>
          </p>
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => navigate('/')} style={{ padding: '16px 40px', background: THEME.colors.primary, color: THEME.colors.surface, fontFamily: THEME.font, fontSize: '1.1rem', border: 'none', cursor: 'pointer', transition: 'background 0.3s' }}>
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- REGISTRATION FORM ---
  return (
    <div style={{ minHeight: '100vh', background: THEME.colors.bg, fontFamily: THEME.font, padding: '60px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', background: THEME.colors.surface, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: `1px solid ${THEME.colors.border}` }}>
        
        {/* Header Block */}
        <div style={{ background: THEME.colors.primary, padding: '50px', textAlign: 'center', borderBottom: `4px solid ${THEME.colors.gold}` }}>
          <h1 style={{ color: THEME.colors.surface, fontSize: '2.8rem', margin: '0 0 10px 0', letterSpacing: '1px' }}>Alumni Registration Portal</h1>
          <p style={{ color: THEME.colors.gold, fontSize: '1.1rem', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>St. Joseph's University</p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '50px' }}>
          
          {/* 1. ACADEMIC IDENTIFICATION */}
          <SectionHeader title="1. Academic Identification" subtitle="Official university records" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <InputGroup label="University Register Number" error={errors.regNo}>
              <input style={BaseInputStyle} value={form.regNo} onChange={e => handleUpdate('regNo', e.target.value.toUpperCase())} placeholder="e.g., 20SJU1234" />
            </InputGroup>
            <InputGroup label="Degree Studied" error={errors.degree}>
              <select style={BaseInputStyle} value={form.degree} onChange={e => handleUpdate('degree', e.target.value)}>
                <option value="">Select Degree...</option>
                <option value="B.Sc">B.Sc</option>
                <option value="BCA">BCA</option>
                <option value="B.Com">B.Com</option>
                <option value="BA">BA</option>
                <option value="M.Sc">M.Sc</option>
              </select>
            </InputGroup>
            <InputGroup label="Year of Passing" error={errors.batchYear}>
              <select style={BaseInputStyle} value={form.batchYear} onChange={e => handleUpdate('batchYear', e.target.value)}>
                <option value="">Select Year...</option>
                {Array.from({length: 30}, (_, i) => new Date().getFullYear() - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </InputGroup>
          </div>

          {/* 2. PERSONAL BIODATA */}
          <div style={{ marginTop: '40px' }}>
            <SectionHeader title="2. Personal Biodata" subtitle="As per your official ID documents" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <InputGroup label="Full Name" error={errors.fullName} width="grid-column: span 2">
                <input style={BaseInputStyle} value={form.fullName} onChange={e => handleUpdate('fullName', e.target.value)} placeholder="e.g., Ram Kumar" />
              </InputGroup>
              
              <InputGroup label="Date of Birth" error={errors.dob}>
                <input style={BaseInputStyle} value={form.dob} onChange={e => handleUpdate('dob', e.target.value)} placeholder="DD-MM-YYYY" maxLength={10} />
              </InputGroup>
              <InputGroup label="Age (Auto-calculated)" error={errors.age}>
                <input style={{...BaseInputStyle, background: THEME.colors.sectionBg}} value={form.age} readOnly placeholder="0" />
              </InputGroup>
              
              <InputGroup label="Gender" error={errors.gender}>
                <select style={BaseInputStyle} value={form.gender} onChange={e => handleUpdate('gender', e.target.value)}>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </InputGroup>
              <InputGroup label="Aadhar Card Number" error={errors.aadhar}>
                <input style={BaseInputStyle} value={form.aadhar} onChange={e => handleUpdate('aadhar', e.target.value)} placeholder="XXXX-XXXX-XXXX" maxLength={14} />
              </InputGroup>

              <InputGroup label="Father's Name" error={errors.fatherName}>
                <input style={BaseInputStyle} value={form.fatherName} onChange={e => handleUpdate('fatherName', e.target.value)} />
              </InputGroup>
              <InputGroup label="Mother's Name" error={errors.motherName}>
                <input style={BaseInputStyle} value={form.motherName} onChange={e => handleUpdate('motherName', e.target.value)} />
              </InputGroup>
            </div>
          </div>

          {/* 3. CONTACT INFORMATION */}
          <div style={{ marginTop: '40px' }}>
            <SectionHeader title="3. Contact Details" subtitle="Required for login credentials" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <InputGroup label="Primary Email Id" error={errors.email}>
                <input type="email" style={BaseInputStyle} value={form.email} onChange={e => handleUpdate('email', e.target.value)} placeholder="you@domain.com" />
              </InputGroup>
              
              <InputGroup label="Phone Number" error={errors.phone}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select style={{...BaseInputStyle, width: '120px'}} value={form.countryCode} onChange={e => handleUpdate('countryCode', e.target.value)}>
                    {Object.values(COUNTRIES).map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </select>
                  <input style={{...BaseInputStyle, flex: 1}} value={form.phone} onChange={e => handleUpdate('phone', e.target.value)} placeholder="Digits Only" />
                </div>
              </InputGroup>
            </div>
          </div>

          {/* 4. PROFESSIONAL STATUS */}
          <div style={{ marginTop: '40px' }}>
            <SectionHeader title="4. Current Status" subtitle="Your current career or academic phase" />
            <div style={{ display: 'flex', gap: '30px', marginBottom: '24px' }}>
              {['None', 'Job', 'PG'].map(status => (
                <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '1.1rem', color: THEME.colors.textMain }}>
                  <input type="radio" checked={form.currentStatus === status} onChange={() => handleUpdate('currentStatus', status)} style={{ width: '20px', height: '20px', accentColor: THEME.colors.primary }} />
                  {status === 'None' ? 'Not Currently Employed/Studying' : (status === 'Job' ? 'Working in a Company' : 'Pursuing Higher Studies (PG)')}
                </label>
              ))}
            </div>

            {form.currentStatus === 'Job' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: THEME.colors.sectionBg, padding: '24px', borderRadius: '4px' }}>
                <InputGroup label="Company Name">
                  <input style={BaseInputStyle} value={form.company} onChange={e => handleUpdate('company', e.target.value)} />
                </InputGroup>
                <InputGroup label="Designation / Position">
                  <input style={BaseInputStyle} value={form.designation} onChange={e => handleUpdate('designation', e.target.value)} />
                </InputGroup>
              </div>
            )}

            {form.currentStatus === 'PG' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: THEME.colors.sectionBg, padding: '24px', borderRadius: '4px' }}>
                <InputGroup label="PG Course Name">
                  <input style={BaseInputStyle} value={form.pgCourse} onChange={e => handleUpdate('pgCourse', e.target.value)} />
                </InputGroup>
                <InputGroup label="PG College/University Name">
                  <input style={BaseInputStyle} value={form.pgCollege} onChange={e => handleUpdate('pgCollege', e.target.value)} />
                </InputGroup>
              </div>
            )}
          </div>

          {/* 5. PROFILE & ACHIEVEMENTS */}
          <div style={{ marginTop: '40px' }}>
            <SectionHeader title="5. Profile & Community" subtitle="Share your journey with the SJU network" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              <InputGroup label="Short Description of Yourself">
                <textarea style={{...BaseInputStyle, minHeight: '100px', resize: 'vertical'}} value={form.description} onChange={e => handleUpdate('description', e.target.value)} placeholder="Tell us a bit about yourself..." />
              </InputGroup>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <InputGroup label="List of Skills">
                  <textarea style={{...BaseInputStyle, minHeight: '80px'}} value={form.skills} onChange={e => handleUpdate('skills', e.target.value)} placeholder="E.g., Organic Synthesis, React.js, Public Speaking..." />
                </InputGroup>
                <InputGroup label="Special Achievements">
                  <textarea style={{...BaseInputStyle, minHeight: '80px'}} value={form.achievements} onChange={e => handleUpdate('achievements', e.target.value)} placeholder="Awards, Publications, Leadership roles..." />
                </InputGroup>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <InputGroup label="LinkedIn Profile URL">
                  <input style={BaseInputStyle} value={form.linkedin} onChange={e => handleUpdate('linkedin', e.target.value)} placeholder="https://linkedin.com/in/yourprofile" />
                </InputGroup>
                <InputGroup label="Stories / Events Participated">
                  <input style={BaseInputStyle} value={form.events} onChange={e => handleUpdate('events', e.target.value)} placeholder="Briefly mention SJU events you were part of" />
                </InputGroup>
              </div>
              
              <InputGroup label="Reviews / Testimonials about SJU">
                <textarea style={{...BaseInputStyle, minHeight: '80px'}} value={form.reviews} onChange={e => handleUpdate('reviews', e.target.value)} placeholder="Share a quick review of your time at the university..." />
              </InputGroup>
            </div>
          </div>

          {/* 6. VERIFICATION DOCUMENTS */}
          <div style={{ marginTop: '40px' }}>
            <SectionHeader title="6. Verification Documents" subtitle="Required by admin to authorize your account" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div style={{ border: `2px dashed ${errors.profile ? THEME.colors.error : THEME.colors.border}`, padding: '40px 20px', textAlign: 'center', background: THEME.colors.sectionBg }}>
                <label style={{ cursor: 'pointer', display: 'block' }}>
                  <div style={{ fontWeight: 'bold', color: THEME.colors.primary, marginBottom: '10px' }}>Upload Profile Photo</div>
                  <div style={{ color: THEME.colors.textLight, fontSize: '0.9rem', marginBottom: '16px' }}>This will be visible to other students in the portal.</div>
                  <input type="file" accept="image/*" onChange={e => handleFileChange('profile', e.target.files[0])} style={{ display: 'none' }} />
                  <div style={{ display: 'inline-block', padding: '10px 24px', background: THEME.colors.surface, border: `1px solid ${THEME.colors.border}`, color: THEME.colors.primary, fontWeight: '600' }}>
                    {files.profile ? files.profile.name : 'Choose Image'}
                  </div>
                </label>
                {errors.profile && <div style={{ color: THEME.colors.error, fontSize: '0.85rem', marginTop: '10px' }}>{errors.profile}</div>}
              </div>

              <div style={{ border: `2px dashed ${errors.idProof ? THEME.colors.error : THEME.colors.border}`, padding: '40px 20px', textAlign: 'center', background: THEME.colors.sectionBg }}>
                <label style={{ cursor: 'pointer', display: 'block' }}>
                  <div style={{ fontWeight: 'bold', color: THEME.colors.primary, marginBottom: '10px' }}>Upload ID Card / Proof</div>
                  <div style={{ color: THEME.colors.textLight, fontSize: '0.9rem', marginBottom: '16px' }}>Required for Admin verification (If PG, upload PG College ID).</div>
                  <input type="file" accept="image/*,.pdf" onChange={e => handleFileChange('idProof', e.target.files[0])} style={{ display: 'none' }} />
                  <div style={{ display: 'inline-block', padding: '10px 24px', background: THEME.colors.surface, border: `1px solid ${THEME.colors.border}`, color: THEME.colors.primary, fontWeight: '600' }}>
                    {files.idProof ? files.idProof.name : 'Choose File'}
                  </div>
                </label>
                {errors.idProof && <div style={{ color: THEME.colors.error, fontSize: '0.85rem', marginTop: '10px' }}>{errors.idProof}</div>}
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div style={{ marginTop: '50px', borderTop: `1px solid ${THEME.colors.border}`, paddingTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ 
                padding: '18px 48px', background: isSubmitting ? THEME.colors.textLight : THEME.colors.primary, 
                color: THEME.colors.surface, fontSize: '1.2rem', fontFamily: THEME.font, fontWeight: '700', 
                border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', letterSpacing: '1px',
                boxShadow: '0 4px 12px rgba(2, 17, 43, 0.2)'
              }}
            >
              {isSubmitting ? 'Submitting to Admin Queue...' : 'Sign Up / Create Account'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Register;