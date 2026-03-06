// src/AppUnifiedHome.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import emailjs from '@emailjs/browser';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';

// ============================================================================
// FIREBASE & EMAILJS CONFIGURATION
// ============================================================================

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "sju-alumni-portal.firebaseapp.com",
  projectId: "sju-alumni-portal",
  storageBucket: "sju-alumni-portal.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ainp");

const EMAIL_GATEWAY = {
  serviceId: "service_gyaan",
  templateId: "template_1jmzaa9",
  publicKey: "MgWnLyUUS3faeP6W5", 
};

// ============================================================================
// THEME & CONFIGURATION SYSTEM
// ============================================================================

const THEME = {
  colors: {
    brandPrimary: '#0C2340',
    brandSecondary: '#D4AF37',
    bgPage: '#FFFFFF',
    bgSurface: '#F8FAFC',
    bgSurfaceAlt: '#F1F5F9',
    textMain: '#0F172A',
    textMuted: '#475569',
    textLight: '#94A3B8',
    textWhite: '#FFFFFF',
    borderLight: '#E2E8F0',
    borderMedium: '#CBD5E1',
    success: '#10B981',
    danger: '#EF4444',
  },
  typography: {
    fontFamily: {
      unified: '"Lora", serif',
    },
    sizes: {
      xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem',
      '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem', '5xl': '3rem', '6xl': '4rem',
    }
  },
  shadows: {
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    card: '0 12px 40px rgba(0,0,0,0.08)',
  },
  radii: { sm: '4px', md: '8px', lg: '16px', xl: '24px', full: '9999px' },
};

// ============================================================================
// COMPREHENSIVE DATA STORE (DATABASE)
// ============================================================================

const DataFactory = {
  categories: ['All', 'Public Service', 'Arts & Media', 'Sports', 'Science & Tech', 'Business'],

  // 12 Full Alumni Profiles
  alumni: [
    { id: 1, name: 'Dr Prateep V. Philip', title: 'Director General of Police, Tamil Nadu', category: 'Public Service', image: '/images/2039778319_2024-10-15_04-48-13.jpg', bio: 'Dr. Prateep V. Philip served as the Director General of Police in Tamil Nadu. Known for his visionary leadership, he introduced the "Friends of Police" movement, which radically transformed police-public relations in India. His foundation at St. Joseph’s instilled a deep sense of social responsibility.' },
    { id: 2, name: 'Mr Mahesh Dattani', title: 'Indian director, actor, playwright', category: 'Arts & Media', image: '/images/498459653_2024-10-15_04-48-29.jpg', bio: 'Mahesh Dattani is a universally acclaimed Indian director, actor, and playwright. He is the first playwright in English to be awarded the Sahitya Akademi award. His profound narratives often explore complex social issues.' },
    { id: 3, name: 'Mr Roger Michael Humphrey Binny', title: 'Cricket-All Rounder, BCCI President', category: 'Sports', image: '/images/182990876_2024-10-15_04-48-59.jpg', bio: 'A legendary sports figure, Roger Binny was a key architect of India’s historic 1983 World Cup victory. Beyond his stellar playing career, he has served as the President of the Board of Control for Cricket in India (BCCI).' },
    { id: 4, name: 'Mr Sri. Sunil Prabhu', title: 'TV Journalist', category: 'Arts & Media', image: '/images/419053755_2024-10-15_04-49-19.jpg', bio: 'An intrepid TV Journalist, Sunil Prabhu has been at the forefront of national news reporting for decades. His incisive political reporting and dedication to journalistic integrity make him a standout alumnus.' },
    { id: 5, name: 'Ms Sunitha Krishnan', title: 'Indian social activist, Padma Shri awardee', category: 'Public Service', image: '/images/438923300_2024-10-15_04-46-23.jpg', bio: 'Sunitha Krishnan is an indomitable social activist and the founder of Prajwala, an NGO dedicated to eradicating sex trafficking. Her fearless advocacy earned her the prestigious Padma Shri.' },
    { id: 6, name: 'T. V. Padma', title: 'Indian American author', category: 'Arts & Media', image: '/images/89332794_2024-10-15_04-47-06.jpg', bio: 'T.V. Padma is a renowned Indian-American author and science journalist. Her writings bridge the gap between complex scientific discoveries and the general public, contributing significantly to global science communication.' },
    { id: 7, name: 'Mr D. V. Swamy', title: 'IAS Officer', category: 'Public Service', image: '/images/1968172350_2024-10-15_04-47-27.jpg', bio: 'Serving the nation as an Indian Administrative Service (IAS) Officer, Mr. D. V. Swamy has spearheaded numerous developmental initiatives at the grassroots level.' },
    { id: 8, name: 'Adv. N. Santhosh Hegde', title: 'Advocate General of Karnataka', category: 'Public Service', image: '/images/404307408_2024-10-15_04-47-47.jpg', bio: 'A titan of the Indian judiciary, Adv. N. Santhosh Hegde has served as a judge of the Supreme Court of India, the Solicitor General of India, and the Lokayukta for Karnataka state.' },
    { id: 9, name: 'Mr M Lakshminarayana', title: 'Indian Administrative Service (IAS)', category: 'Public Service', image: '/images/1173804293_2024-10-15_04-41-44.jpg', bio: 'As a distinguished IAS officer, Mr. M Lakshminarayana has played a crucial role in shaping public policy and infrastructure development across the state.' },
    { id: 10, name: 'Cap Pradeep Shoury Arya', title: 'IRS Officer & Addl. Commissioner of Income Tax', category: 'Public Service', image: '/images/1672506218_2024-10-15_04-42-21.jpg', bio: 'Captain Pradeep Shoury Arya balances his rigorous duties as an Indian Revenue Service Officer with his profound commitment to the nation, previously serving in the armed forces.' },
    { id: 11, name: 'Mr Frank Noronha', title: 'IIS Officer', category: 'Public Service', image: '/images/1346377777_2024-10-15_04-42-47.jpg', bio: 'A senior officer of the Indian Information Service (IIS), Mr. Frank Noronha served as the Principal Spokesperson of the Government of India. His expertise has guided the nation through critical campaigns.' },
    { id: 12, name: 'Ms Nabila Jamal', title: 'Journalist Anchor, India Today', category: 'Arts & Media', image: '/images/1879600367_2024-10-15_04-45-32.jpg', bio: 'Nabila Jamal is a prominent face in Indian television journalism. As an anchor for India Today, her articulate, hard-hitting reporting style makes her a trusted voice in news broadcasting.' },
  ],

  // 6 Internal & Global Metrics (Removed Scholarships & Countries)
  metrics: [
    { value: "45,000+", label: "GLOBAL ALUMNI", icon: "globe" },
    { value: "10,385", label: "CURRENT STUDENTS", icon: "students" },
    { value: "340", label: "ACADEMIC STAFF", icon: "academic" },
    { value: "204", label: "FACULTY WITH PHD", icon: "books" },
    { value: "39", label: "UG PROGRAMMES", icon: "ug" },
    { value: "23", label: "PG PROGRAMMES", icon: "pg" }
  ],

  // Interactive Calendar Events (Internal)
  calendarEvents: [
    { day: 2, title: "Cultural Committee Meet", type: "internal", desc: "Monthly internal planning for campus activities." },
    { day: 3, title: "Science Symposium Prep", type: "academic", desc: "Faculty review of undergraduate thesis papers." },
    { day: 6, title: "Guest Lecture: Tech", type: "event", desc: "Invited alumni speaking on the future of AI." },
    { day: 16, title: "Mid-Term Evaluations", type: "academic", desc: "Examination coordination meeting." },
    { day: 19, title: "Sports Week Inauguration", type: "sports", desc: "Opening ceremony at the main grounds." },
    { day: 24, title: "Visages 2026", type: "major", highlight: true, desc: "Annual inter-collegiate cultural festival day 1." },
    { day: 25, title: "Visages 2026", type: "major", desc: "Annual inter-collegiate cultural festival day 2." },
    { day: 27, title: "Alumni Chapter Meet", type: "alumni", desc: "Networking session for the Bengaluru chapter." }
  ],

  // 6 Public Registrable Events (Enhanced)
  publicEvents: [
    { id: 1, date: "MAR 15", title: "Annual Alumni Grand Reunion", loc: "SJU Main Auditorium", time: "5:00 PM IST", desc: "Join the administration, faculty, and your fellow batchmates for an evening of networking, a formal gala dinner, and a reflection on the university's ongoing legacy." },
    { id: 2, date: "APR 02", title: "SJU Professional Symposium", loc: "Loyola Hall, Campus", time: "10:00 AM IST", desc: "An exclusive, high-level networking event for St. Joseph's University graduates and students, featuring keynote speeches from prominent alumni." },
    { id: 3, date: "MAY 18", title: "Global Chapter Meet: Europe", loc: "Virtual / Hybrid", time: "2:00 PM GMT", desc: "Connecting our vast network of European-based alumni to share opportunities and build a localized support system." },
    { id: 4, date: "JUN 10", title: "Start-up Incubation Pitch Day", loc: "SJU Innovation Lab", time: "9:00 AM IST", desc: "Recent graduates and current seniors pitch their startup ideas to a panel of alumni angel investors and venture capitalists." },
    { id: 5, date: "JUL 22", title: "Tech Innovation Hackathon 2026", loc: "Computer Science Block", time: "8:00 AM IST", desc: "A 48-hour coding marathon where students and tech alumni collaborate to solve real-world civic problems." },
    { id: 6, date: "AUG 14", title: "Visages Inter-Collegiate Fest", loc: "SJU Main Grounds", time: "9:00 AM IST", desc: "The biggest cultural extravaganza of the year. Alumni are invited to judge events and mentor participating students." }
  ],

  // 5 Detailed News & Announcements
  announcements: [
    { id: 101, title: 'St. Joseph\'s Secures Major Research Grant', preview: 'The university\'s science department has been awarded a prestigious multi-million rupee grant to develop new sustainable energy solutions...', tag: 'Academic Excellence', date: 'February 20, 2026', body: 'St. Joseph\'s University is proud to announce that our Department of Environmental Sciences has been awarded a prestigious multi-million rupee grant by the National Research Council. This monumental funding will be directed toward the development of next-generation sustainable energy solutions and urban eco-infrastructure.\n\nOver the next three years, faculty members and graduate students will collaborate with international research bodies. The Vice-Chancellor noted, "This grant is a testament to the rigorous academic environment and the innovative spirit that defines SJU."' },
    { id: 102, title: 'Inauguration of the New SJU Advanced Learning Library Block', preview: 'Following months of construction and generous contributions from our alumni network, the new state-of-the-art library is officially open...', tag: 'Infrastructure', date: 'February 15, 2026', body: 'Following months of rigorous construction and fueled by the generous contributions from our global alumni network, the new state-of-the-art Advanced Learning Library Block has officially opened its doors on the SJU campus.\n\nThe new facility boasts over 50,000 square feet of study space, fully digitized archival sections, and collaborative smart-rooms for group projects.' },
    { id: 103, title: 'SJU Humanities Department Launches Global Exchange Program', preview: 'In an effort to foster global citizenship, the Humanities department has partnered with five leading European universities...', tag: 'Global Initiatives', date: 'February 05, 2026', body: 'The Department of Humanities at St. Joseph’s University is thrilled to announce the launch of a comprehensive Global Exchange Program, established in partnership with five premier universities across Europe and North America.\n\nThis initiative allows undergraduate and postgraduate students to spend a semester abroad, immersing themselves in diverse cultural environments.' },
    { id: 104, title: 'SJU Awarded the "Green Campus Sustainability Trophy"', preview: 'Recognizing our efforts in zero-waste management and solar power integration across the university grounds...', tag: 'Sustainability', date: 'January 28, 2026', body: 'The Ministry of Environment has officially awarded St. Joseph\'s University the Green Campus Sustainability Trophy for the year 2026. This award recognizes the tireless efforts of the student body and administration in achieving a near zero-waste campus.\n\nKey initiatives included the installation of solar panels on all major administrative buildings and the implementation of a comprehensive rainwater harvesting system.' },
    { id: 105, title: 'Launch of the AI & Machine Learning Research Hub', preview: 'A dedicated laboratory equipped with supercomputers has been established to push the boundaries of AI research at SJU...', tag: 'Technology', date: 'January 12, 2026', body: 'Keeping pace with the rapid technological advancements of the 21st century, St. Joseph\'s University has officially opened its Artificial Intelligence and Machine Learning Research Hub.\n\nFunded partially by tech-industry alumni, the lab provides undergraduate and postgraduate students with access to high-performance computing clusters and industry-standard AI development tools.' }
  ],

  // 12 FAQs
  faqs: [
    { question: "How do I access the official Alumni Directory?", answer: "The directory is available exclusively to registered and verified alumni. Please contact the administration or sign up through the portal." },
    { question: "How can I contribute to the SJU Scholarship Fund?", answer: "Contributions can be made directly through the 'Giving' section of the dashboard once logged in. We accept one-time endowments as well as recurring contributions." },
    { question: "Are there opportunities to mentor current students?", answer: "Absolutely. We run a biannual 'Titanium Mentorship Cohort'. Alumni with over 5 years of industry experience can register to be paired with final-year students." },
    { question: "Can alumni participate in University Fests like Visages?", answer: "Yes, special seating, networking lounges, and judging opportunities are arranged for alumni during major college festivals." },
    { question: "How do I request an official academic transcript?", answer: "Transcripts can be requested through the university's primary examination portal. Alumni accounts have a dedicated fast-track request button." },
    { question: "Does the university offer career services for alumni?", answer: "Yes, our placement cell maintains an active job board exclusively for alumni, featuring mid-to-senior level opportunities." },
    { question: "Can alumni access the campus library?", answer: "Verified alumni can apply for a specialized 'Alumni Library Pass' which grants access to physical archives and selected digital journals." },
    { question: "How do I book a campus tour for a reunion?", answer: "Groups of 10 or more alumni can coordinate with the Alumni Relations Office to schedule a guided heritage walk and high tea." },
    { question: "How can I update my contact information in the database?", answer: "Log in to the Alumni Portal and navigate to 'Edit Profile'. Changes will reflect immediately in the secure directory." },
    { question: "Is there an official Alumni ID card?", answer: "Yes. Upon verification, a digital Alumni ID is generated in your portal. A physical card can be printed on campus for a nominal fee." },
    { question: "Does SJU provide accommodation for visiting alumni?", answer: "While we do not have dedicated alumni guest houses on campus, we have partnered with several nearby hotels offering discounted rates." },
    { question: "How can I pitch my startup to the alumni investor network?", answer: "Register for the annual 'Start-up Incubation Pitch Day' detailed in our events section to present to our network of venture capitalists." }
  ]
};

// ============================================================================
// UNIFIED ICON LIBRARY (INLINE SVGs)
// ============================================================================

const Icons = {
  quote: (props) => <svg width="32" height="32" viewBox="0 0 24 24" fill={THEME.colors.brandSecondary} opacity="0.6" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>,
  location: (props) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  clock: (props) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  chevronRight: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="9 18 15 12 9 6"></polyline></svg>,
  chevronLeft: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="15 18 9 12 15 6"></polyline></svg>,
  search: (props) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  globe: (props) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
  books: (props) => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z" /></svg>,
  ug: (props) => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" /></svg>,
  students: (props) => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>,
  academic: (props) => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>,
  pg: (props) => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
};

// ============================================================================
// GLOBAL STYLES & ENHANCED ANIMATIONS (Unified Font Enforcement)
// ============================================================================

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; outline: none; }
    html { scroll-behavior: smooth; }

    /* UNIFIED FONT FOR ENTIRE PAGE */
    body {
      font-family: ${THEME.typography.fontFamily.unified};
      background-color: ${THEME.colors.bgPage};
      color: ${THEME.colors.textMain};
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      line-height: 1.7;
    }
    
    h1, h2, h3, h4, h5, h6 { 
      font-family: ${THEME.typography.fontFamily.unified}; 
      font-weight: 700; 
      margin: 0; 
      color: ${THEME.colors.brandPrimary}; 
    }
    
    a { text-decoration: none; color: inherit; }
    button, input, textarea { font-family: ${THEME.typography.fontFamily.unified}; }
    
    /* Enhanced Ultra Animations */
    .fade-in-up { 
      animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
      opacity: 0; 
      transform: translateY(40px); 
    }
    
    .delay-1 { animation-delay: 0.15s; }
    .delay-2 { animation-delay: 0.3s; }
    .delay-3 { animation-delay: 0.45s; }
    .delay-4 { animation-delay: 0.6s; }
    
    @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
    
    /* Interactive Card Overhaul */
    .interactive-card { 
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
      background: ${THEME.colors.bgPage};
    }
    .interactive-card:hover { 
      transform: translateY(-8px); 
      box-shadow: ${THEME.shadows.card}; 
      border-color: ${THEME.colors.brandSecondary};
    }
    
    .image-zoom-container { overflow: hidden; }
    .image-zoom-target { transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
    .interactive-card:hover .image-zoom-target { transform: scale(1.08); }

    /* Calendar Grid Specifics - FIXED LAYOUT */
    .calendar-grid {
      display: grid; 
      grid-template-columns: repeat(7, 1fr); 
      gap: 12px; 
      text-align: center;
      margin-top: 20px;
    }
    .calendar-day-header {
      font-size: 0.9rem; 
      font-weight: 700; 
      color: ${THEME.colors.textMuted}; 
      padding-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .calendar-day {
      aspect-ratio: 1; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      font-size: 1.1rem; 
      font-weight: 500; 
      border-radius: 50%; 
      cursor: pointer;
      transition: all 0.3s ease; 
      position: relative;
      border: 1px solid transparent;
    }
    .calendar-day:hover:not(.empty):not(.selected) { 
      background-color: ${THEME.colors.bgSurfaceAlt}; 
      border-color: ${THEME.colors.borderMedium};
    }
    .calendar-day.selected {
      background-color: ${THEME.colors.brandSecondary}; 
      color: ${THEME.colors.textWhite};
      font-weight: 700; 
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.5);
      transform: scale(1.1);
    }
    .calendar-day.has-event::after {
      content: ''; 
      position: absolute; 
      bottom: 8px; 
      width: 6px; 
      height: 6px;
      border-radius: 50%; 
      background-color: ${THEME.colors.brandSecondary};
    }
    .calendar-day.selected.has-event::after { 
      background-color: ${THEME.colors.textWhite}; 
    }

    /* Form & Input Styles */
    .sju-input {
      width: 100%; 
      padding: 16px 20px; 
      border-radius: ${THEME.radii.md};
      border: 1px solid ${THEME.colors.borderMedium};
      font-size: 1rem;
      background: ${THEME.colors.bgSurface}; 
      transition: all 0.3s ease;
      color: ${THEME.colors.textMain};
    }
    .sju-input:focus {
      border-color: ${THEME.colors.brandSecondary}; 
      box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.2);
      background: ${THEME.colors.bgPage};
    }
    .sju-label {
      display: block; 
      margin-bottom: 8px; 
      font-weight: 600; 
      font-size: 0.85rem;
      color: ${THEME.colors.textMuted}; 
      text-transform: uppercase; 
      letter-spacing: 0.05em;
    }

    /* Accordion / FAQ */
    .sju-faq-summary { 
      cursor: pointer; 
      padding: 24px 0; 
      font-weight: 600; 
      font-size: ${THEME.typography.sizes.xl}; 
      list-style: none; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      border-bottom: 1px solid ${THEME.colors.borderLight}; 
      transition: color 0.3s; 
    }
    .sju-faq-summary::-webkit-details-marker { display: none; }
    .sju-faq-summary:hover { color: ${THEME.colors.brandSecondary}; }
    .sju-faq-content { 
      padding: 24px 0 40px 0; 
      color: ${THEME.colors.textMuted}; 
      line-height: 1.8; 
      font-size: ${THEME.typography.sizes.lg}; 
    }
    details[open] .sju-faq-summary { border-bottom-color: transparent; color: ${THEME.colors.brandPrimary}; }
    
    ::-webkit-scrollbar { width: 10px; }
    ::-webkit-scrollbar-track { background: ${THEME.colors.bgSurface}; }
    ::-webkit-scrollbar-thumb { background: ${THEME.colors.brandSecondary}; border-radius: 5px; }
  `}</style>
);

// ============================================================================
// CORE UI COMPONENT SYSTEM
// ============================================================================

const Box = ({ children, style, className, onClick, id, ...props }) => (
  <div id={id} style={{ ...style }} className={className} onClick={onClick} {...props}>{children}</div>
);

const Flex = ({ children, direction = 'row', align = 'stretch', justify = 'flex-start', wrap = 'nowrap', gap = 0, style, className, ...props }) => (
  <Box style={{ display: 'flex', flexDirection: direction, alignItems: align, justifyContent: justify, flexWrap: wrap, gap, ...style }} className={className} {...props}>
    {children}
  </Box>
);

const Grid = ({ children, columns = '1fr', gap = '24px', style, className, ...props }) => (
  <Box style={{ display: 'grid', gridTemplateColumns: columns, gap, ...style }} className={className} {...props}>
    {children}
  </Box>
);

const Text = ({ children, size = 'md', weight = 'regular', color = 'textMain', align = 'left', transform = 'none', tracking = 'normal', style, className }) => {
  const isHeading = ['3xl', '4xl', '5xl', '6xl'].includes(size);
  const Tag = isHeading ? 'h2' : 'p';
  const baseStyle = {
    fontSize: THEME.typography.sizes[size] || size,
    fontWeight: weight === 'bold' ? 700 : weight === 'semibold' ? 600 : weight === 'medium' ? 500 : 400,
    color: THEME.colors[color] || color,
    textAlign: align, textTransform: transform, letterSpacing: tracking, margin: 0, ...style
  };
  return <Tag style={baseStyle} className={className}>{children}</Tag>;
};

const Container = ({ children, maxWidth = '1280px', style, className }) => (
  <Box style={{ width: '100%', maxWidth, margin: '0 auto', padding: '0 5%', position: 'relative', ...style }} className={className}>{children}</Box>
);

const Section = ({ children, bg = 'bgPage', style, className, id }) => (
  <Box id={id} style={{ padding: '120px 0', backgroundColor: THEME.colors[bg] || bg, ...style }} className={className}>{children}</Box>
);

const Button = ({ children, variant = 'primary', size = 'md', fullWidth = false, onClick, type = 'button', icon, style, disabled }) => {
  const vStyles = variant === 'primary'
    ? { bg: THEME.colors.brandSecondary, color: THEME.colors.brandPrimary, border: 'none' }
    : variant === 'outline'
      ? { bg: 'transparent', color: THEME.colors.brandPrimary, border: `2px solid ${THEME.colors.brandSecondary}` }
      : { bg: 'transparent', color: THEME.colors.textMuted, border: 'none' };

  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        backgroundColor: vStyles.bg, color: vStyles.color, border: vStyles.border,
        padding: size === 'lg' ? '18px 40px' : '14px 28px',
        fontSize: size === 'lg' ? THEME.typography.sizes.lg : THEME.typography.sizes.md,
        fontWeight: 700, borderRadius: THEME.radii.full,
        cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease',
        textTransform: 'uppercase', letterSpacing: '0.1em', width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.7 : 1, ...style
      }}
      onMouseOver={(e) => {
        if (disabled) return;
        if (variant === 'primary') { e.currentTarget.style.backgroundColor = THEME.colors.brandPrimary; e.currentTarget.style.color = THEME.colors.brandSecondary; }
        if (variant === 'outline') { e.currentTarget.style.backgroundColor = THEME.colors.brandSecondary; e.currentTarget.style.color = THEME.colors.brandPrimary; }
      }}
      onMouseOut={(e) => {
        if (disabled) return;
        e.currentTarget.style.backgroundColor = vStyles.bg;
        e.currentTarget.style.color = vStyles.color;
      }}
    >
      {children}
      {icon && icon}
    </button>
  );
};

const SectionHeader = ({ title, subtitle, align = 'center', overline }) => (
  <Box className="fade-in-up" style={{ marginBottom: '80px', textAlign: align }}>
    {overline && (
      <Text size="sm" weight="bold" transform="uppercase" tracking="0.2em" color="brandSecondary" style={{ marginBottom: '16px' }}>
        {overline}
      </Text>
    )}
    <Text size="5xl" weight="bold" color="brandPrimary" style={{ marginBottom: '24px', lineHeight: 1.1 }}>{title}</Text>
    {subtitle && <Text size="xl" color="textMuted" style={{ maxWidth: '800px', margin: align === 'center' ? '0 auto' : '0', lineHeight: 1.7 }}>{subtitle}</Text>}
    <Box style={{ width: '80px', height: '4px', background: THEME.colors.brandSecondary, margin: align === 'center' ? '32px auto 0' : '32px 0 0' }} />
  </Box>
);

// ============================================================================
// DOMAIN SPECIFIC SECTIONS
// ============================================================================

const HeroSection = () => (
  <Box style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: '40px 24px', backgroundColor: THEME.colors.bgSurfaceAlt }}>
    <Box style={{ position: 'absolute', right: '-10%', top: '-10%', opacity: 0.03, pointerEvents: 'none' }}>
      <svg width="1000" height="1000" viewBox="0 0 100 100" fill="none" stroke={THEME.colors.brandPrimary} xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="30" strokeWidth="0.5" strokeDasharray="1 3" />
      </svg>
    </Box>

    <Flex direction="column" align="center" style={{ position: 'relative', zIndex: 10, maxWidth: '1000px', textAlign: 'center' }}>
      <Text className="fade-in-up" size="sm" weight="bold" transform="uppercase" tracking="0.25em" color="brandSecondary" style={{ marginBottom: '24px' }}>
        Official University Portal
      </Text>
      <Text className="fade-in-up delay-1" size="6xl" color="brandPrimary" style={{ lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '32px' }}>
        St. Joseph's University
      </Text>
      <Text className="fade-in-up delay-2" size="3xl" color="textMain" style={{ fontStyle: 'italic', marginBottom: '40px', fontWeight: 500 }}>
        "Fide et Labore" — Faith and Toil
      </Text>
      <Text className="fade-in-up delay-3" size="xl" color="textMuted" style={{ maxWidth: '800px', margin: '0 auto 56px auto', lineHeight: 1.8 }}>
        A legacy of excellence continues. Whether you are a current student forging your path in academics and research, or an esteemed alumnus reconnecting with your graduating class, this unified portal is your gateway to lifelong learning and the ongoing story of our institution.
      </Text>
      <Flex className="fade-in-up delay-4" gap="24px" justify="center" wrap="wrap">
        <Button size="lg" onClick={() => document.getElementById('hall-of-fame').scrollIntoView()}>Explore Alumni Network</Button>
        <Button variant="outline" size="lg" onClick={() => document.getElementById('campus-calendar').scrollIntoView()}>View Campus Events</Button>
      </Flex>
    </Flex>
  </Box>
);

const HistorySection = () => (
  <Section bg="bgPage">
    <Container maxWidth="1000px">
      <SectionHeader title="Our Heritage & Academic Excellence" />
      <Box className="fade-in-up delay-1" style={{ color: THEME.colors.textMuted, fontSize: THEME.typography.sizes.lg, lineHeight: '2', textAlign: 'justify' }}>
        <p style={{ marginBottom: '32px' }}>
          St Joseph's University is a Jesuit university at the heart of Bengaluru, the silicon city of India. Established in 1882 by Paris Foreign Mission Fathers, the management of the college was handed over to the Jesuit order (Society of Jesus) in 1937. The college was first affiliated with the University of Madras and later with the Mysore and Bangalore universities. In 1986, St Joseph's College became the first affiliated college in Karnataka to offer postgraduate programmes. In 1988, it became the first college in Karnataka to get a Research Centre, and in 2005, it was one of five colleges in Karnataka that was awarded academic autonomy. In February 2021, St Joseph's University Bill was presented in the Karnataka Legislative Assembly and was subsequently passed. The college received its University status on 2 July 2022 and was <strong>inaugurated as India's first Public-Private-Partnership University</strong> by the Honourable President of India, Smt. Droupadi Murmu on 27 September 2022.
        </p>
        <p>
          As a university, we are dedicated to excellence in education. Over the years, our students have been ranked among the finest in the country, as attested by our illustrious alumni. With an accomplished faculty both in teaching and research, the university is home to leading centres of excellence on campus. Here we try to create leaders for a better world, leaders deeply rooted in our philosophy who commit themselves to excel in the fields they choose. We make every effort to be relevant, innovative, and creative. Join us and be part of this glorious enterprise!
        </p>
      </Box>
    </Container>
  </Section>
);

const UnifiedStatsSection = () => (
  <Section bg="bgSurfaceAlt" style={{ paddingTop: '80px', paddingBottom: '120px' }}>
    <Container maxWidth="1200px">
      <SectionHeader overline="At A Glance" title="University & Alumni by the Numbers" align="center" />
      <Grid columns="repeat(auto-fit, minmax(300px, 1fr))" gap="40px">
        {DataFactory.metrics.map((metric, idx) => {
          const IconComponent = Icons[metric.icon];
          return (
            <Flex
              key={idx} direction="column" align="center" justify="center"
              className="fade-in-up interactive-card"
              style={{
                animationDelay: `${(idx % 3) * 0.1}s`, padding: '56px 32px',
                backgroundColor: THEME.colors.bgPage, border: `1px solid ${THEME.colors.borderLight}`,
                borderRadius: THEME.radii.lg, textAlign: 'center', position: 'relative', marginTop: '32px'
              }}
            >
              <Box style={{
                position: 'absolute', top: '-32px', left: '50%', transform: 'translateX(-50%)',
                width: '64px', height: '64px', borderRadius: '50%', background: THEME.colors.brandPrimary,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.colors.brandSecondary,
                boxShadow: THEME.shadows.md, border: `4px solid ${THEME.colors.bgPage}`
              }}>
                {IconComponent && <IconComponent />}
              </Box>
              <Text size="5xl" weight="bold" color="brandPrimary" style={{ marginBottom: '16px' }}>
                {metric.value}
              </Text>
              <Text size="sm" weight="bold" color="textMuted" transform="uppercase" tracking="0.15em">
                {metric.label}
              </Text>
            </Flex>
          );
        })}
      </Grid>
    </Container>
  </Section>
);

const AlumniDirectory = ({ onOpenAlumni }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredAlumni = useMemo(() => {
    return DataFactory.alumni.filter(alum => {
      const matchesSearch = alum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alum.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || alum.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <Section id="hall-of-fame" bg="bgPage">
      <Container>
        <SectionHeader overline="Community" title="Distinguished Alumni Hall of Fame" subtitle="Honoring the individuals whose contributions to society reflect the core values and educational excellence of our institution." />

        <Flex direction="column" gap="32px" align="center" style={{ marginBottom: '80px' }}>
          <Box style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
            <Box style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', color: THEME.colors.textLight }}>
              <Icons.search />
            </Box>
            <input type="text" placeholder="Search alumni by name or profession..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="sju-input" style={{ paddingLeft: '64px', fontSize: '1.1rem' }} />
          </Box>

          <Flex wrap="wrap" justify="center" gap="16px">
            {DataFactory.categories.map(cat => (
              <button
                key={cat} onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '12px 24px', borderRadius: THEME.radii.full,
                  border: `2px solid ${activeCategory === cat ? THEME.colors.brandPrimary : THEME.colors.borderMedium}`,
                  background: activeCategory === cat ? THEME.colors.brandPrimary : THEME.colors.bgPage,
                  color: activeCategory === cat ? THEME.colors.brandSecondary : THEME.colors.textMuted,
                  fontSize: THEME.typography.sizes.sm, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.3s', textTransform: 'uppercase', letterSpacing: '0.1em'
                }}
              >
                {cat}
              </button>
            ))}
          </Flex>
        </Flex>

        {filteredAlumni.length > 0 ? (
          <Grid columns="repeat(auto-fill, minmax(320px, 1fr))" gap="40px">
            {filteredAlumni.map((alum, index) => (
              <Box
                key={alum.id} className="interactive-card fade-in-up image-zoom-container"
                onClick={() => onOpenAlumni(alum)}
                style={{ cursor: 'pointer', borderRadius: THEME.radii.lg, border: `1px solid ${THEME.colors.borderLight}`, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
              >
                <Box style={{ width: '100%', paddingTop: '110%', position: 'relative', background: THEME.colors.bgSurface }}>
                  <img src={alum.image} alt={alum.name} className="image-zoom-target" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 10%' }} loading="lazy" />
                </Box>
                <Flex direction="column" justify="center" style={{ padding: '40px 32px', flex: 1, textAlign: 'center' }}>
                  <Text size="xs" weight="bold" color="brandSecondary" transform="uppercase" tracking="0.1em" style={{ marginBottom: '12px' }}>{alum.category}</Text>
                  <Text size="2xl" color="brandPrimary" style={{ marginBottom: '16px', fontWeight: 700 }}>{alum.name}</Text>
                  <Text size="md" weight="medium" color="textMuted" style={{ lineHeight: 1.6 }}>{alum.title}</Text>
                </Flex>
              </Box>
            ))}
          </Grid>
        ) : (
          <Flex justify="center" align="center" style={{ padding: '80px 0' }}>
            <Text size="xl" color="textMuted">No alumni found matching your criteria.</Text>
          </Flex>
        )}
      </Container>
    </Section>
  );
};

const CampusCalendar = () => {
  const [selectedDay, setSelectedDay] = useState(24);
  const selectedEvent = DataFactory.calendarEvents.find(e => e.day === selectedDay) || { title: "No events scheduled", desc: "The campus is open for regular academic schedules." };

  const daysInMonth = 28; // Feb 2026
  const startingDayOfWeek = 6;

  const renderDays = () => {
    let cells = [];
    const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    dayHeaders.forEach(day => cells.push(<div key={`h-${day}`} className="calendar-day-header">{day}</div>));
    for (let i = 0; i < startingDayOfWeek; i++) cells.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    for (let d = 1; d <= daysInMonth; d++) {
      const hasEvent = DataFactory.calendarEvents.some(e => e.day === d);
      cells.push(
        <div key={d} onClick={() => setSelectedDay(d)} className={`calendar-day ${d === selectedDay ? 'selected' : ''} ${hasEvent ? 'has-event' : ''}`}>
          {d}
        </div>
      );
    }
    return cells;
  };

  return (
    <Section id="campus-calendar" bg="bgSurfaceAlt">
      <Container maxWidth="1100px">
        <SectionHeader overline="Schedules" title="University Academic Calendar" align="center" />
        <Flex style={{ background: THEME.colors.bgPage, boxShadow: THEME.shadows.xl, borderRadius: THEME.radii.xl, overflow: 'hidden', border: `1px solid ${THEME.colors.borderLight}` }} direction="row" align="stretch" className="fade-in-up" wrap="wrap">
          
          {/* Left Panel - Dark Navy (Event details strictly bound here based on calendar click) */}
          <Box style={{ background: THEME.colors.brandPrimary, color: THEME.colors.textWhite, padding: '80px 48px', width: '40%', minWidth: '350px', display: 'flex', flexDirection: 'column' }}>
            <Text size="6xl" weight="bold" color="brandSecondary" style={{ marginBottom: '8px' }}>{selectedDay}</Text>
            <Text size="2xl" weight="medium" style={{ marginBottom: '48px', color: THEME.colors.textWhite }}>February 2026</Text>
            <Box style={{ borderTop: `1px solid rgba(255,255,255,0.1)`, paddingTop: '32px', flex: 1 }}>
              {selectedEvent.title !== "No events scheduled" ? (
                <Box className="fade-in-up">
                  <Text size="sm" weight="bold" transform="uppercase" tracking="0.1em" color="brandSecondary" style={{ marginBottom: '12px' }}>{selectedEvent.type} Event</Text>
                  <Text size="3xl" weight="bold" color="textWhite" style={{ marginBottom: '24px', lineHeight: 1.3 }}>{selectedEvent.title}</Text>
                  <Text size="lg" style={{ opacity: 0.8, lineHeight: 1.7 }}>{selectedEvent.desc}</Text>
                </Box>
              ) : (
                <Box className="fade-in-up">
                  <Text size="xl" weight="bold" color="textWhite" style={{ marginBottom: '16px' }}>No events scheduled</Text>
                  <Text size="md" style={{ opacity: 0.6, lineHeight: 1.7 }}>{selectedEvent.desc}</Text>
                </Box>
              )}
            </Box>
          </Box>
          
          {/* Right Panel - Calendar Grid (Fixed Layout) */}
          <Box style={{ padding: '60px', width: '60%', minWidth: '400px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Flex justify="space-between" align="center" style={{ marginBottom: '40px' }}>
              <Icons.chevronLeft style={{ cursor: 'pointer', color: THEME.colors.textMuted, width: '24px', height: '24px' }} />
              <Text size="3xl" weight="bold" color="brandPrimary">February 2026</Text>
              <Icons.chevronRight style={{ cursor: 'pointer', color: THEME.colors.textMuted, width: '24px', height: '24px' }} />
            </Flex>
            <div className="calendar-grid">{renderDays()}</div>
          </Box>
        </Flex>
      </Container>
    </Section>
  );
};

const UpcomingEvents = ({ onOpenEvent }) => (
  <Section bg="bgPage">
    <Container maxWidth="1100px">
      <SectionHeader overline="Networking" title="Official Public Gatherings" subtitle="Join networking summits, reunions, and academic symposiums tailored for our community. Registration is required for entry." align="center" />
      <Box>
        {DataFactory.publicEvents.map((ev, idx) => (
          <Flex key={ev.id} className="interactive-card fade-in-up" align="stretch" wrap="wrap" style={{ borderRadius: THEME.radii.lg, border: `1px solid ${THEME.colors.borderLight}`, marginBottom: '32px', overflow: 'hidden' }}>
            <Flex direction="column" justify="center" align="center" style={{ width: '220px', borderRight: `1px solid ${THEME.colors.borderLight}`, background: THEME.colors.bgSurfaceAlt, padding: '40px' }}>
              <Text size="sm" weight="bold" color="brandSecondary" transform="uppercase" tracking="0.15em" style={{ marginBottom: '12px' }}>{ev.date.split(' ')[0]}</Text>
              <Text size="6xl" weight="bold" color="brandPrimary" style={{ lineHeight: 1 }}>{ev.date.split(' ')[1]}</Text>
            </Flex>
            <Flex direction="column" justify="center" style={{ padding: '40px 48px', flex: 1, minWidth: '350px' }}>
              <Text size="3xl" color="brandPrimary" style={{ marginBottom: '24px', fontWeight: 700 }}>{ev.title}</Text>
              <Flex wrap="wrap" gap="32px">
                <Flex align="center" gap="12px"><Icons.location style={{ color: THEME.colors.brandSecondary }} /><Text size="md" color="textMuted" weight="medium">{ev.loc}</Text></Flex>
                <Flex align="center" gap="12px"><Icons.clock style={{ color: THEME.colors.brandSecondary }} /><Text size="md" color="textMuted" weight="medium">{ev.time}</Text></Flex>
              </Flex>
            </Flex>
            <Flex align="center" justify="center" style={{ padding: '40px 48px' }}>
              <Button variant="outline" size="lg" onClick={() => onOpenEvent(ev)}>Register Now</Button>
            </Flex>
          </Flex>
        ))}
      </Box>
    </Container>
  </Section>
);

const NewsSection = ({ onOpenNews }) => (
  <Section bg="bgSurfaceAlt">
    <Container>
      <SectionHeader overline="Publications" title="Campus News & Stories" align="left" />
      <Grid columns="repeat(auto-fit, minmax(400px, 1fr))" gap="48px">
        {DataFactory.announcements.map((news, idx) => (
          <Flex key={news.id} direction="column" justify="space-between" className="interactive-card fade-in-up" style={{ borderRadius: THEME.radii.lg, border: `1px solid ${THEME.colors.borderLight}`, padding: '48px', height: '100%', animationDelay: `${idx * 0.15}s` }}>
            <Box>
              <Flex justify="space-between" align="center" style={{ marginBottom: '32px' }}>
                <Box style={{ padding: '8px 20px', background: THEME.colors.brandPrimary, borderRadius: THEME.radii.full }}>
                  <Text size="xs" weight="bold" color="brandSecondary" transform="uppercase" tracking="0.1em">{news.tag}</Text>
                </Box>
                <Text size="sm" color="textMuted" weight="bold">{news.date}</Text>
              </Flex>
              <Text size="3xl" color="brandPrimary" style={{ marginBottom: '24px', lineHeight: 1.4, fontWeight: 700 }}>{news.title}</Text>
              <Text size="lg" color="textMuted" style={{ marginBottom: '40px', lineHeight: 1.8 }}>{news.preview}</Text>
            </Box>
            <Box><Button variant="ghost" icon={<Icons.chevronRight />} onClick={() => onOpenNews(news)} style={{ padding: 0, fontSize: THEME.typography.sizes.lg, color: THEME.colors.brandSecondary }}>Read Full Story</Button></Box>
          </Flex>
        ))}
      </Grid>
    </Container>
  </Section>
);

// Firebase Simulated Reviews Section
const ReviewsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulated Firebase Fetch
  // Active Firebase Fetch
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        // Fetch up to 20 records to ensure we find enough people who actually wrote a review/bio
        const q = query(collection(db, "alumni_data"), limit(20));
        const querySnapshot = await getDocs(q);
        
        const fetchedData = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Check for 'Reviews' field, fallback to 'Bio' if that's what your CSV uses
          const reviewText = data.Reviews || data.Bio || ""; 
          
          if(reviewText.trim() !== "") {
            fetchedData.push({
              id: doc.id,
              text: reviewText,
              // Map to your CSV's exact headers
              author: data.Name || "SJU Alumni",
              batch: data.GraduationYear ? `Batch of ${data.GraduationYear}` : "Alumni Batch"
            });
          }
        });

        // Limit the final output to 6 to keep your grid layout perfectly balanced
        setReviews(fetchedData.slice(0, 6));
        setLoading(false);

      } catch (error) {
        console.error("Error fetching reviews from Firebase: ", error);
        setLoading(false);
      }
    };
    
    fetchVoices();
  }, []);

  return (
    <Section bg="brandPrimary">
      <Container>
        <SectionHeader overline="Voices" title={<span style={{ color: THEME.colors.textWhite }}>Alumni Reflections</span>} subtitle={<span style={{ color: THEME.colors.borderMedium }}>Hear directly from our verified database of distinguished alumni who have walked our halls and shaped the world.</span>} align="center" />
        
        {loading ? (
          <Text align="center" color="textWhite" size="xl">Loading database records...</Text>
        ) : (
          <Grid columns="repeat(auto-fill, minmax(350px, 1fr))" gap="32px">
            {reviews.map((rev, idx) => (
              <Flex key={rev.id} direction="column" className="interactive-card fade-in-up" style={{ padding: '48px', borderRadius: THEME.radii.lg, backgroundColor: THEME.colors.bgPage, animationDelay: `${(idx % 3) * 0.15}s` }}>
                <Icons.quote style={{ marginBottom: '32px' }} />
                <Text size="xl" color="textMain" style={{ fontStyle: 'italic', marginBottom: '40px', lineHeight: 1.8, flex: 1 }}>"{rev.text}"</Text>
                <Flex align="center" gap="16px">
                  <Box style={{ width: '30px', height: '3px', background: THEME.colors.brandSecondary }} />
                  <Box>
                    <Text size="sm" weight="bold" color="brandPrimary" transform="uppercase" tracking="0.1em">{rev.author}</Text>
                    <Text size="xs" color="textMuted">{rev.batch}</Text>
                  </Box>
                </Flex>
              </Flex>
            ))}
          </Grid>
        )}
      </Container>
    </Section>
  );
};

const FaqSection = () => (
  <Section bg="bgSurfaceAlt">
    <Container maxWidth="900px">
      <SectionHeader title="Frequently Asked Questions" align="center" />
      <Box style={{ borderTop: `2px solid ${THEME.colors.borderLight}` }}>
        {DataFactory.faqs.map((faq, index) => (
          <details key={index} style={{ borderBottom: `1px solid ${THEME.colors.borderMedium}` }}>
            <summary className="sju-faq-summary">
              {faq.question}
              <Box as="span" style={{ color: THEME.colors.brandSecondary, fontWeight: 300, fontSize: '2rem' }}>+</Box>
            </summary>
            <Box className="sju-faq-content">{faq.answer}</Box>
          </details>
        ))}
      </Box>
    </Container>
  </Section>
);

// ============================================================================
// MODAL OVERLAY SYSTEM (With EmailJS Integration)
// ============================================================================

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <Box style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(12, 35, 64, 0.8)', backdropFilter: 'blur(8px)' }} />
      <Box className="fade-in-up" style={{ position: 'relative', width: '100%', maxWidth: '900px', background: THEME.colors.bgPage, borderRadius: THEME.radii.xl, padding: '64px', boxShadow: THEME.shadows.xl, maxHeight: '90vh', overflowY: 'auto', margin: '24px' }}>
        <Flex justify="space-between" align="flex-start" style={{ marginBottom: '48px' }}>
          <Text size="4xl" weight="bold" color="brandPrimary" style={{ lineHeight: 1.2 }}>{title}</Text>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '3rem', cursor: 'pointer', color: THEME.colors.textLight, lineHeight: 1, padding: '0 0 0 32px', transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = THEME.colors.brandSecondary} onMouseOut={(e) => e.target.style.color = THEME.colors.textLight}>&times;</button>
        </Flex>
        <Box>{children}</Box>
      </Box>
    </Box>
  );
};

// ============================================================================
// MAIN ASSEMBLER COMPONENT
// ============================================================================

const AppUnifiedHome = () => {
  const [modal, setModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openNews = useCallback((news) => setModal({ type: 'NEWS', data: news }), []);
  const openEvent = useCallback((event) => setModal({ type: 'EVENT', data: event }), []);
  const openAlumni = useCallback((alum) => setModal({ type: 'ALUMNI', data: alum }), []);
  const closeModal = useCallback(() => setModal(null), []);

  useEffect(() => {
    document.body.style.overflow = modal ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [modal]);

  // Enhanced Event Registration via EmailJS
  const handleEventRegistration = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const applicantName = formData.get('fullName');
    const applicantEmail = formData.get('email');
    const eventDetails = modal.data;

    const emailParams = {
      to_name: applicantName,
      to_email: applicantEmail,
      event_title: eventDetails.title,
      event_date: eventDetails.date,
      event_time: eventDetails.time,
      event_loc: eventDetails.loc,
      message: `You have successfully registered for ${eventDetails.title}. Please arrive 15 minutes prior to the scheduled start time at ${eventDetails.loc}. Your official confirmation ID will be verified at the entrance.`,
      reply_to: "events@sju.edu.in",
      account_credentials: ""
    };

    try {
      await emailjs.send(EMAIL_GATEWAY.serviceId, EMAIL_GATEWAY.templateId, emailParams, EMAIL_GATEWAY.publicKey);
      alert(`Registration Successful! An official confirmation email with event instructions has been sent to ${applicantEmail}.`);
      closeModal();
    } catch (error) {
      console.error("EmailJS Error:", error);
      alert("Registration recorded, but we failed to dispatch the confirmation email. Please verify your EmailJS keys and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GlobalStyles />

      {/* STRICT NARRATIVE FLOW (NO HEADER/FOOTER) */}
      <HeroSection />
      <HistorySection />
      <UnifiedStatsSection />
      <AlumniDirectory onOpenAlumni={openAlumni} />
      <CampusCalendar />
      <UpcomingEvents onOpenEvent={openEvent} />
      <NewsSection onOpenNews={openNews} />
      <ReviewsSection />
      <FaqSection />

      {/* Structural Bottom Padding Instead of Footer */}
      <Box style={{ height: '160px', background: THEME.colors.bgPage }} />

      {/* Global Modals */}
      <Modal isOpen={!!modal} onClose={closeModal} title={modal?.type === 'ALUMNI' ? 'Distinguished Alumnus' : modal?.type === 'NEWS' ? 'University Bulletin' : modal?.type === 'EVENT' ? 'Event Registration Portal' : ''}>
        
        {modal?.type === 'ALUMNI' && (
          <Flex wrap="wrap" gap="56px" align="flex-start">
            <Box style={{ flex: '1 1 300px', maxWidth: '350px', borderRadius: THEME.radii.lg, overflow: 'hidden', border: `1px solid ${THEME.colors.borderMedium}` }}>
              <img src={modal.data.image} alt={modal.data.name} style={{ width: '100%', display: 'block' }} />
            </Box>
            <Box style={{ flex: '2 1 400px' }}>
              <Text size="5xl" weight="bold" color="brandPrimary" style={{ marginBottom: '16px' }}>{modal.data.name}</Text>
              <Text size="md" weight="bold" color="brandSecondary" transform="uppercase" tracking="0.15em" style={{ marginBottom: '32px' }}>{modal.data.title}</Text>
              <Box style={{ width: '80px', height: '4px', background: THEME.colors.borderMedium, marginBottom: '32px' }} />
              <Text size="xl" color="textMuted" style={{ lineHeight: 1.9 }}>{modal.data.bio}</Text>
            </Box>
          </Flex>
        )}

        {modal?.type === 'NEWS' && (
          <Box>
            <Text size="5xl" weight="bold" color="brandPrimary" style={{ marginBottom: '32px', lineHeight: 1.3 }}>{modal.data.title}</Text>
            <Flex align="center" gap="24px" style={{ marginBottom: '56px', borderBottom: `2px solid ${THEME.colors.borderLight}`, paddingBottom: '32px' }}>
              <Box style={{ background: THEME.colors.brandPrimary, padding: '10px 24px', borderRadius: THEME.radii.full }}>
                <Text size="sm" weight="bold" color="brandSecondary" transform="uppercase" tracking="0.1em">{modal.data.tag}</Text>
              </Box>
              <Text size="md" color="textLight">•</Text>
              <Text size="md" color="textMuted" weight="bold">{modal.data.date}</Text>
            </Flex>
            <Box>
              {modal.data.body.split('\n').map((paragraph, i) => (
                paragraph.trim() && <Text key={i} size="xl" style={{ marginBottom: '32px', lineHeight: 2 }}>{paragraph}</Text>
              ))}
            </Box>
          </Box>
        )}

        {modal?.type === 'EVENT' && (
          <Box>
            <Text size="4xl" weight="bold" color="brandPrimary" style={{ marginBottom: '32px' }}>{modal.data.title}</Text>
            <Box style={{ background: THEME.colors.bgSurfaceAlt, padding: '40px', borderRadius: THEME.radii.lg, marginBottom: '48px', border: `1px solid ${THEME.colors.borderMedium}` }}>
              <Grid columns="1fr 1fr" gap="24px">
                <Text size="lg" color="textMain"><strong>Date & Time:</strong> {modal.data.date} | {modal.data.time}</Text>
                <Text size="lg" color="textMain"><strong>Venue:</strong> {modal.data.loc}</Text>
              </Grid>
            </Box>
            <Text size="xl" color="textMuted" style={{ marginBottom: '56px', lineHeight: 1.9 }}>{modal.data.desc}</Text>

            <Text size="2xl" weight="bold" color="brandPrimary" style={{ marginBottom: '32px', borderBottom: `3px solid ${THEME.colors.borderLight}`, paddingBottom: '16px' }}>
              Official Attendee Registration
            </Text>

            <form onSubmit={handleEventRegistration}>
              <Grid columns="1fr 1fr" gap="32px">
                <Box style={{ gridColumn: '1 / -1' }}>
                  <label className="sju-label">Full Legal Name</label>
                  <input name="fullName" required type="text" className="sju-input" placeholder="e.g. Jane Doe" />
                </Box>
                <Box>
                  <label className="sju-label">Official Email Address</label>
                  <input name="email" required type="email" className="sju-input" placeholder="e.g. jane@example.com" />
                </Box>
                <Box>
                  <label className="sju-label">Contact Number</label>
                  <input name="phone" required type="tel" className="sju-input" placeholder="+91 98765 43210" />
                </Box>
                <Box style={{ gridColumn: '1 / -1' }}>
                  <label className="sju-label">Affiliation (Current Student / Alumni Batch)</label>
                  <input name="affiliation" required type="text" className="sju-input" placeholder="e.g. Current B.Sc Student, or Batch of 2018" />
                </Box>
                <Box style={{ gridColumn: '1 / -1', marginTop: '32px' }}>
                  <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Transmitting to Server...' : 'Confirm Attendance & Register'}
                  </Button>
                  <Text size="sm" color="textLight" align="center" style={{ marginTop: '16px' }}>
                    Upon successful registration, an email containing event guidelines and gate passes will be sent to your provided email address via our EmailJS Gateway.
                  </Text>
                </Box>
              </Grid>
            </form>
          </Box>
        )}
      </Modal>
    </Box>
  );
};

export default AppUnifiedHome;