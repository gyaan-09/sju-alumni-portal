// src/AppUnifiedHome.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * =================================================================================================
 * ST. JOSEPH'S UNIVERSITY - UNIFIED OFFICIAL & ALUMNI PORTAL (JUMBO EDITION)
 * =================================================================================================
 * MODULE DESCRIPTION:
 * This comprehensive module merges the University's official introductory portal with the 
 * interactive Alumni Network dashboard. It is designed to cater to both current students forging 
 * their paths and esteemed alumni continuing the legacy.
 * * ARCHITECTURAL DECISIONS & FEATURES:
 * 1. Strictly No Header & No Footer (per design constraints).
 * 2. Removed SJU Logo to favor a purely typographic, ultra-clean aesthetic.
 * 3. Unified Theme System: Blending deep navy, gold, and pristine whites with a unique 
 * tri-font typographic scale (Lora for serif accents, Montserrat for primary headings, 
 * Inter for highly legible body copy).
 * 4. Jumbo Data Store: All 12 Alumni, 12 Reviews, Full Calendar, News, Events, and 12 Metrics.
 * 5. Interactive UI: Features filtering, search, interactive calendar, modals, and smooth 
 * scroll-triggered animations (.fade-in-up, smooth scaling).
 * 6. Completely self-contained: Zero external dependencies. All SVGs and CSS are inline.
 * =================================================================================================
 */

// ============================================================================
// MODULE 1: UNIFIED THEME & CONFIGURATION SYSTEM
// ============================================================================

const THEME = {
  colors: {
    // SJU Unified Palette
    brandPrimary: '#0C2340', // Deep SJU Navy
    brandSecondary: '#D4AF37', // Refined SJU Gold/Orange mix
    brandAccent: '#1D3B5C',

    // Backgrounds
    bgPage: '#FFFFFF',
    bgSurface: '#F8FAFC',
    bgSurfaceAlt: '#F1F5F9',
    bgCalendarDark: '#0B1A2E',

    // Typography
    textMain: '#0F172A',
    textMuted: '#475569',
    textLight: '#94A3B8',
    textWhite: '#FFFFFF',

    // Borders & UI Elements
    borderLight: '#E2E8F0',
    borderMedium: '#CBD5E1',
    borderDark: '#94A3B8',

    // States & Utilities
    transparent: 'transparent',
    white: '#FFFFFF',
    black: '#000000',
    success: '#10B981',
  },
  typography: {
    fontFamily: {
      serif: '"Lora", serif',
      heading: '"Montserrat", sans-serif',
      body: '"Inter", "Segoe UI", sans-serif',
    },
    weights: { light: 300, regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 },
    sizes: {
      xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem',
      '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem', '5xl': '3rem', '6xl': '4rem',
    }
  },
  spacing: {
    0: '0px', 1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '20px', 6: '24px',
    8: '32px', 10: '40px', 12: '48px', 16: '64px', 20: '80px', 24: '96px', 32: '128px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    card: '0 8px 30px rgba(0,0,0,0.06)',
    focus: '0 0 0 3px rgba(212, 175, 55, 0.3)',
  },
  radii: { none: '0px', sm: '2px', md: '6px', lg: '12px', xl: '16px', full: '9999px' },
  transitions: {
    default: 'all 0.3s ease',
    fast: 'all 0.15s ease-in-out',
    slow: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
  }
};

const CONFIG = {
  IMAGES: {
    FALLBACK_AVATAR: 'https://via.placeholder.com/400x500/F8FAFC/94A3B8?text=SJU'
  }
};

// ============================================================================
// MODULE 2: COMPREHENSIVE DATA STORE (DATABASE)
// Combines Alumni, Reviews, Events, Calendar, FAQs, and Metrics.
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

  // 12 Internal & Global Metrics Combined
  metrics: [
    { value: "45,000+", label: "GLOBAL ALUMNI", icon: "globe" },
    { value: "10,385", label: "CURRENT STUDENTS", icon: "students" },
    { value: "340", label: "ACADEMIC STAFF", icon: "academic" },
    { value: "204", label: "FACULTY WITH PHD", icon: "books" },
    { value: "120+", label: "COUNTRIES REPRESENTED", icon: "map" },
    { value: "39", label: "UG PROGRAMMES", icon: "ug" },
    { value: "23", label: "PG PROGRAMMES", icon: "pg" },
    { value: "₹50M+", label: "SCHOLARSHIPS FUNDED", icon: "award" }
  ],

  // Interactive Calendar Events
  calendarEvents: [
    { day: 2, title: "Cultural Committee Meet", type: "internal" },
    { day: 3, title: "Science Symposium Prep", type: "academic" },
    { day: 6, title: "Guest Lecture: Tech", type: "event" },
    { day: 16, title: "Mid-Term Evaluations", type: "academic" },
    { day: 17, title: "Mid-Term Evaluations", type: "academic" },
    { day: 19, title: "Sports Week Inauguration", type: "sports" },
    { day: 20, title: "Inter-Collegiate Sports", type: "sports" },
    { day: 21, title: "Inter-Collegiate Sports", type: "sports" },
    { day: 22, title: "Sports Week Finale", type: "sports" },
    { day: 24, title: "Visages 2026", type: "major", highlight: true },
    { day: 25, title: "Visages 2026", type: "major" },
    { day: 27, title: "Alumni Chapter Meet", type: "alumni" }
  ],

  // Public Registrable Events
  publicEvents: [
    { id: 1, date: "MAR 15", title: "Annual Alumni Grand Reunion", loc: "SJU Main Auditorium, Bengaluru", time: "5:00 PM IST", desc: "Join the administration, faculty, and your fellow batchmates for an evening of networking, a formal gala dinner, and a reflection on the university's ongoing legacy." },
    { id: 2, date: "APR 02", title: "SJU Professional Symposium & Leadership Summit", loc: "Loyola Hall, SJU Campus", time: "10:00 AM IST", desc: "An exclusive, high-level networking event for St. Joseph's University graduates and students, featuring keynote speeches from prominent alumni." },
    { id: 3, date: "MAY 18", title: "Global Chapter Meet: SJU Alumni in Europe", loc: "Virtual / Hybrid (Hosted in London)", time: "2:00 PM GMT", desc: "Connecting our vast network of European-based alumni to share opportunities and build a localized support system." },
    { id: 4, date: "JUN 10", title: "Start-up Incubation Pitch Day", loc: "SJU Innovation Lab", time: "9:00 AM IST", desc: "Recent graduates and current seniors pitch their startup ideas to a panel of alumni angel investors and venture capitalists." }
  ],

  // Detailed News & Announcements
  announcements: [
    { id: 101, title: 'St. Joseph\'s University Secures Major Research Grant', preview: 'The university\'s science department has been awarded a prestigious multi-million rupee grant to develop new sustainable energy solutions...', tag: 'Academic Excellence', date: 'February 20, 2026', body: 'St. Joseph\'s University is proud to announce that our Department of Environmental Sciences has been awarded a prestigious multi-million rupee grant by the National Research Council. This monumental funding will be directed toward the development of next-generation sustainable energy solutions and urban eco-infrastructure.\n\nOver the next three years, faculty members and graduate students will collaborate with international research bodies. The Vice-Chancellor noted, "This grant is a testament to the rigorous academic environment and the innovative spirit that defines SJU."' },
    { id: 102, title: 'Inauguration of the New SJU Advanced Learning Library Block', preview: 'Following months of construction and generous contributions from our alumni network, the new state-of-the-art library is officially open...', tag: 'Infrastructure', date: 'February 15, 2026', body: 'Following months of rigorous construction and fueled by the generous contributions from our global alumni network, the new state-of-the-art Advanced Learning Library Block has officially opened its doors on the SJU campus.\n\nThe new facility boasts over 50,000 square feet of study space, fully digitized archival sections, and collaborative smart-rooms for group projects.' },
    { id: 103, title: 'SJU Humanities Department Launches Global Exchange Program', preview: 'In an effort to foster global citizenship, the Humanities department has partnered with five leading European universities...', tag: 'Global Initiatives', date: 'February 05, 2026', body: 'The Department of Humanities at St. Joseph’s University is thrilled to announce the launch of a comprehensive Global Exchange Program, established in partnership with five premier universities across Europe and North America.\n\nThis initiative allows undergraduate and postgraduate students to spend a semester abroad, immersing themselves in diverse cultural environments.' }
  ],

  // 12 Curated Alumni Reviews
  reviews: [
    { id: 1, text: "The foundation of discipline and knowledge I received at SJU was the cornerstone of my career in public service. It taught me that education is a tool for societal transformation.", author: "Batch of 1995" },
    { id: 2, text: "Connecting with the global SJU network has opened doors for international research collaborations I never thought possible.", author: "Batch of 2012" },
    { id: 3, text: "Returning to campus to mentor final-year students has been profoundly fulfilling. The caliber of students remains exceptional.", author: "Batch of 2008" },
    { id: 4, text: "The alumni association provides a seamless bridge between academic life and professional excellence. Proud to be a Josephite forever.", author: "Batch of 2019" },
    { id: 5, text: "Fide et Labore isn't just a motto; it's a way of life that St. Joseph's instills in every student that walks its corridors.", author: "Batch of 2001" },
    { id: 6, text: "The transition from a college to a full-fledged university has only amplified the academic rigor and opportunities available.", author: "Batch of 2023" },
    { id: 7, text: "My years at SJU gave me the technical skills and the ethical grounding needed to navigate the complex corporate world.", author: "Batch of 2015" },
    { id: 8, text: "The faculty's dedication to holistic education shaped not just my career, but my entire worldview.", author: "Batch of 1988" },
    { id: 9, text: "Participating in Visages and other fests built my leadership skills more than any textbook ever could.", author: "Batch of 2010" },
    { id: 10, text: "It's incredible to see the university's infrastructure evolve while maintaining its rich, historical heritage in Bengaluru.", author: "Batch of 2005" },
    { id: 11, text: "The global reach of Josephites is astounding. No matter which country I travel to, I find a supportive alumni network.", author: "Batch of 2017" },
    { id: 12, text: "St. Joseph's provided a perfectly balanced ecosystem of rigorous academics and vibrant extracurriculars.", author: "Batch of 2021" }
  ],

  // Combined FAQs
  faqs: [
    { question: "How do I access the official Alumni Directory?", answer: "The directory is available exclusively to registered alumni. Please contact the administration." },
    { question: "How can I contribute to the SJU Scholarship Fund?", answer: "Contributions can be made directly through the 'Giving' section of the dashboard. We accept one-time endowments as well as recurring monthly contributions." },
    { question: "Are there opportunities to mentor current students?", answer: "Absolutely. We run a biannual 'Titanium Mentorship Cohort'. Alumni with over 5 years of industry experience can register to be paired with final-year students." },
    { question: "Can alumni participate in University Fests like Visages?", answer: "Yes, special seating and networking lounges are arranged for alumni during major college festivals." }
  ]
};

// ============================================================================
// MODULE 3: UNIFIED ICON LIBRARY (INLINE SVGs)
// ============================================================================

const Icons = {
  quote: (props) => <svg width="32" height="32" viewBox="0 0 24 24" fill={THEME.colors.brandSecondary} opacity="0.4" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>,
  location: (props) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  clock: (props) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  chevronRight: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="9 18 15 12 9 6"></polyline></svg>,
  chevronLeft: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="15 18 9 12 15 6"></polyline></svg>,
  search: (props) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  globe: (props) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
  map: (props) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>,
  award: (props) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>,
  staff: (props) => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>,
  books: (props) => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z" /></svg>,
  ug: (props) => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" /></svg>,
  students: (props) => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>,
  academic: (props) => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>,
  pg: (props) => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
};

// ============================================================================
// MODULE 4: GLOBAL STYLES & ENHANCED ANIMATIONS
// ============================================================================

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; outline: none; }
    
    html { scroll-behavior: smooth; }

    body {
      font-family: ${THEME.typography.fontFamily.body};
      background-color: ${THEME.colors.bgPage};
      color: ${THEME.colors.textMain};
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      line-height: 1.6;
    }
    
    h1, h2, h3, h4, h5, h6 { font-family: ${THEME.typography.fontFamily.heading}; margin: 0; color: ${THEME.colors.brandPrimary}; }
    .serif-text { font-family: ${THEME.typography.fontFamily.serif}; }
    
    a { text-decoration: none; color: inherit; }
    button { font-family: inherit; }
    
    /* Ultra Enhanced Animations */
    .fade-in-up { 
      animation: fadeInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
      opacity: 0; 
      transform: translateY(30px); 
    }
    
    .delay-1 { animation-delay: 0.15s; }
    .delay-2 { animation-delay: 0.3s; }
    .delay-3 { animation-delay: 0.45s; }
    .delay-4 { animation-delay: 0.6s; }
    
    @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
    @keyframes subtleZoom { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
    
    /* Interactive Card Overhaul */
    .interactive-card { 
      transition: ${THEME.transitions.slow}; 
      background: ${THEME.colors.white};
    }
    .interactive-card:hover { 
      transform: translateY(-6px); 
      box-shadow: ${THEME.shadows.card}; 
      border-color: ${THEME.colors.borderMedium};
    }
    
    .image-zoom-container { overflow: hidden; }
    .image-zoom-target { transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
    .interactive-card:hover .image-zoom-target { transform: scale(1.08); }

    /* Calendar Grid Specifics */
    .calendar-grid {
      display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; text-align: center;
    }
    .calendar-day-header {
      font-size: 0.8rem; font-weight: 600; color: ${THEME.colors.textMuted}; padding-bottom: 12px;
    }
    .calendar-day {
      aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem; font-weight: 500; border-radius: 50%; cursor: pointer;
      transition: ${THEME.transitions.fast}; position: relative;
    }
    .calendar-day:hover:not(.empty):not(.selected) { background-color: ${THEME.colors.bgSurfaceAlt}; }
    .calendar-day.selected {
      background-color: ${THEME.colors.brandSecondary}; color: ${THEME.colors.white};
      font-weight: 700; box-shadow: 0 4px 10px rgba(212, 175, 55, 0.4);
    }
    .calendar-day.has-event::after {
      content: ''; position: absolute; bottom: 6px; width: 6px; height: 6px;
      border-radius: 50%; background-color: ${THEME.colors.brandSecondary};
    }
    .calendar-day.selected.has-event::after { background-color: ${THEME.colors.white}; }

    /* Form & Input Styles */
    .sju-input {
      width: 100%; padding: 16px 20px; border-radius: ${THEME.radii.full};
      border: 1px solid ${THEME.colors.borderLight};
      font-family: ${THEME.typography.fontFamily.body}; font-size: 0.9rem;
      background: ${THEME.colors.bgPage}; transition: ${THEME.transitions.fast};
      color: ${THEME.colors.textMain};
    }
    .sju-input::placeholder { color: ${THEME.colors.textLight}; }
    .sju-input:focus {
      border-color: ${THEME.colors.brandSecondary}; box-shadow: ${THEME.shadows.focus};
      background: ${THEME.colors.white};
    }
    
    .sju-label {
      display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.75rem;
      color: ${THEME.colors.textMuted}; text-transform: uppercase; letter-spacing: 0.05em;
    }

    /* Accordion / FAQ */
    .sju-faq-summary { 
      cursor: pointer; padding: 24px 0; font-weight: 500; font-size: ${THEME.typography.sizes.lg}; 
      font-family: ${THEME.typography.fontFamily.heading}; list-style: none; display: flex; 
      justify-content: space-between; align-items: center; border-bottom: 1px solid ${THEME.colors.borderLight}; 
      transition: color 0.3s; 
    }
    .sju-faq-summary::-webkit-details-marker { display: none; }
    .sju-faq-summary:hover { color: ${THEME.colors.brandSecondary}; }
    .sju-faq-content { padding: 24px 0 40px 0; color: ${THEME.colors.textMuted}; line-height: 1.8; font-size: ${THEME.typography.sizes.md}; }
    details[open] .sju-faq-summary { border-bottom-color: transparent; }
    
    /* Custom Pristine Scrollbar */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: ${THEME.colors.bgSurface}; }
    ::-webkit-scrollbar-thumb { background: ${THEME.colors.borderMedium}; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: ${THEME.colors.textMuted}; }
  `}</style>
);

// ============================================================================
// MODULE 5: CORE UI COMPONENT SYSTEM
// Standardized wrappers implementing dynamic styles seamlessly.
// ============================================================================

const Box = ({ children, style, className, onClick, id, ...props }) => (
  <div id={id} style={{ ...style }} className={className} onClick={onClick} {...props}>{children}</div>
);

const Flex = ({ children, direction = 'row', align = 'stretch', justify = 'flex-start', wrap = 'nowrap', gap = 0, style, className, ...props }) => (
  <Box style={{ display: 'flex', flexDirection: direction, alignItems: align, justifyContent: justify, flexWrap: wrap, gap: THEME.spacing[gap] || gap, ...style }} className={className} {...props}>
    {children}
  </Box>
);

const Grid = ({ children, columns = '1fr', gap = 6, style, className, ...props }) => (
  <Box style={{ display: 'grid', gridTemplateColumns: columns, gap: THEME.spacing[gap] || gap, ...style }} className={className} {...props}>
    {children}
  </Box>
);

const Text = ({ children, variant = 'body', size = 'md', weight = 'regular', color = 'textMain', align = 'left', transform = 'none', tracking = 'normal', style, className }) => {
  const baseStyle = {
    fontFamily: variant === 'heading' ? THEME.typography.fontFamily.heading : variant === 'serif' ? THEME.typography.fontFamily.serif : THEME.typography.fontFamily.body,
    fontSize: THEME.typography.sizes[size] || size,
    fontWeight: THEME.typography.weights[weight] || weight,
    color: THEME.colors[color] || color,
    textAlign: align, textTransform: transform, letterSpacing: tracking, margin: 0, ...style
  };
  const Tag = variant === 'heading' ? (size === '6xl' || size === '5xl' ? 'h1' : size === '4xl' || size === '3xl' ? 'h2' : 'h3') : 'p';
  return <Tag style={baseStyle} className={className}>{children}</Tag>;
};

const Container = ({ children, maxWidth = '1280px', style, className }) => (
  <Box style={{ width: '100%', maxWidth, margin: '0 auto', padding: '0 5%', position: 'relative', ...style }} className={className}>{children}</Box>
);

const Section = ({ children, bg = 'bgPage', style, className, id }) => (
  <Box id={id} style={{ padding: '120px 0', backgroundColor: THEME.colors[bg] || bg, ...style }} className={className}>{children}</Box>
);

const Button = ({ children, variant = 'primary', size = 'md', fullWidth = false, onClick, type = 'button', icon, style }) => {
  const vStyles = variant === 'primary'
    ? { bg: THEME.colors.brandSecondary, color: THEME.colors.white, border: 'none' }
    : variant === 'outline'
      ? { bg: 'transparent', color: THEME.colors.textMain, border: `1px solid ${THEME.colors.borderMedium}` }
      : { bg: 'transparent', color: THEME.colors.textMuted, border: 'none' };

  return (
    <button
      type={type} onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        backgroundColor: vStyles.bg, color: vStyles.color, border: vStyles.border,
        padding: size === 'lg' ? '16px 36px' : '12px 24px',
        fontSize: size === 'lg' ? THEME.typography.sizes.md : THEME.typography.sizes.sm,
        fontWeight: THEME.typography.weights.bold, borderRadius: THEME.radii.full,
        cursor: 'pointer', transition: THEME.transitions.fast, textTransform: 'uppercase',
        letterSpacing: '0.08em', width: fullWidth ? '100%' : 'auto', ...style
      }}
      onMouseOver={(e) => {
        if (variant === 'primary') { e.currentTarget.style.backgroundColor = THEME.colors.brandPrimary; }
        if (variant === 'outline') { e.currentTarget.style.backgroundColor = THEME.colors.bgSurface; }
        if (variant === 'ghost') { e.currentTarget.style.color = THEME.colors.textMain; }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = vStyles.bg;
        e.currentTarget.style.color = vStyles.color;
      }}
    >
      {children}
      {icon && icon}
    </button>
  );
};

// Standardized Header Component
const SectionHeader = ({ title, subtitle, align = 'center', overline }) => (
  <Box className="fade-in-up" style={{ marginBottom: '60px', textAlign: align }}>
    {overline && (
      <Text size="xs" weight="bold" transform="uppercase" tracking="0.15em" color="brandSecondary" style={{ marginBottom: '16px' }}>
        {overline}
      </Text>
    )}
    <Text variant="heading" size="4xl" weight="bold" color="brandPrimary" style={{ marginBottom: '24px', lineHeight: 1.2 }}>{title}</Text>
    {subtitle && <Text size="lg" color="textMuted" style={{ maxWidth: '700px', margin: align === 'center' ? '0 auto' : '0', lineHeight: 1.7 }}>{subtitle}</Text>}
    <Box style={{ width: '60px', height: '3px', background: THEME.colors.brandSecondary, margin: align === 'center' ? '24px auto 0' : '24px 0 0' }} />
  </Box>
);

// ============================================================================
// MODULE 6: DOMAIN SPECIFIC SECTIONS
// Incorporating data from both codebases into massive unified sections.
// ============================================================================

/**
 * 6.1 HERO SECTION - Typographic, no logo, inclusive for alumni & students.
 */
const HeroSection = () => (
  <Box style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: '40px 24px', backgroundColor: THEME.colors.bgSurfaceAlt }}>

    {/* Subtle Abstract Background */}
    <Box style={{ position: 'absolute', right: '-5%', top: '-10%', opacity: 0.04, pointerEvents: 'none' }}>
      <svg width="800" height="800" viewBox="0 0 100 100" fill="none" stroke={THEME.colors.brandPrimary} xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="30" strokeWidth="0.5" strokeDasharray="1 3" />
      </svg>
    </Box>

    <Flex direction="column" align="center" style={{ position: 'relative', zIndex: 10, maxWidth: '900px', textAlign: 'center' }}>
      <Text className="fade-in-up" size="sm" weight="bold" transform="uppercase" tracking="0.2em" color="brandSecondary" style={{ marginBottom: '24px' }}>
        Official University Portal
      </Text>

      <Text className="fade-in-up delay-1" variant="heading" size="6xl" color="brandPrimary" style={{ lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '32px' }}>
        St. Joseph's University
      </Text>

      <Text className="fade-in-up delay-2 serif-text" size="2xl" color="textMain" style={{ fontStyle: 'italic', marginBottom: '32px' }}>
        "Fide et Labore" — Faith and Toil
      </Text>

      <Text className="fade-in-up delay-3" size="lg" color="textMuted" style={{ maxWidth: '750px', margin: '0 auto 48px auto', lineHeight: 1.8 }}>
        A legacy of excellence continues. Whether you are a current student forging your path in academics and research, or an esteemed alumnus reconnecting with your graduating class, this unified portal is your gateway to lifelong learning and the ongoing story of our institution.
      </Text>

      <Flex className="fade-in-up delay-4" gap="16px" justify="center" wrap="wrap">
        <Button size="lg" onClick={() => document.getElementById('hall-of-fame').scrollIntoView()}>Explore Alumni Network</Button>
        <Button variant="outline" size="lg" onClick={() => document.getElementById('campus-calendar').scrollIntoView()}>View Campus Events</Button>
      </Flex>
    </Flex>
  </Box>
);

/**
 * 6.2 HISTORY & WELCOME SECTION - Extensive textual introduction.
 */
const HistorySection = () => (
  <Section bg="bgPage">
    <Container maxWidth="1000px">
      <Box className="fade-in-up" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Text variant="heading" size="3xl" weight="bold" transform="uppercase" tracking="0.05em" color="brandPrimary">
          Our Heritage & Academic Excellence
        </Text>
      </Box>

      <Box className="fade-in-up delay-1" style={{ color: THEME.colors.textMuted, fontSize: '1.05rem', lineHeight: '1.8', textAlign: 'justify' }}>
        <p style={{ marginBottom: '24px' }}>
          St Joseph's University is a Jesuit university at the heart of Bengaluru, the silicon city of India. Established in 1882 by Paris Foreign Mission Fathers, the management of the college was handed over to the Jesuit order (Society of Jesus) in 1937. The college was first affiliated with the University of Madras and later with the Mysore and Bangalore universities. In 1986, St Joseph's College became the first affiliated college in Karnataka to offer postgraduate programmes. In 1988, it became the first college in Karnataka to get a Research Centre, and in 2005, it was one of five colleges in Karnataka that was awarded academic autonomy. In February 2021, St Joseph's University Bill was presented in the Karnataka Legislative Assembly and was subsequently passed. The college received its University status on 2 July 2022 and was <strong>inaugurated as India's first Public-Private-Partnership University</strong> by the Honourable President of India, Smt. Droupadi Murmu on 27 September 2022.
        </p>
        <p>
          As a university, we are dedicated to excellence in education. Over the years, our students have been ranked among the finest in the country, as attested by our illustrious alumni. With an accomplished faculty both in teaching and research, the university is home to leading centres of excellence on campus. Here we try to create leaders for a better world, leaders deeply rooted in our philosophy who commit themselves to excel in the fields they choose. We make every effort to be relevant, innovative, and creative. Join us and be part of this glorious enterprise!
        </p>
      </Box>
    </Container>
  </Section>
);

/**
 * 6.3 UNIFIED METRICS GRID - Combined 12 Stats
 */
const UnifiedStatsSection = () => (
  <Section bg="bgSurfaceAlt" style={{ paddingTop: '80px', paddingBottom: '120px' }}>
    <Container maxWidth="1200px">
      <SectionHeader overline="At A Glance" title="University & Alumni by the Numbers" align="center" />
      <Grid columns="repeat(auto-fit, minmax(250px, 1fr))" gap="32px">
        {DataFactory.metrics.map((metric, idx) => {
          const IconComponent = Icons[metric.icon];
          return (
            <Flex
              key={idx} direction="column" align="center" justify="center"
              className="fade-in-up interactive-card"
              style={{
                animationDelay: `${(idx % 4) * 0.1}s`, padding: '48px 24px',
                backgroundColor: THEME.colors.white, border: `1px solid ${THEME.colors.borderLight}`,
                borderRadius: THEME.radii.lg, textAlign: 'center', position: 'relative', marginTop: '24px'
              }}
            >
              <Box style={{
                position: 'absolute', top: '-24px', left: '50%', transform: 'translateX(-50%)',
                width: '56px', height: '56px', borderRadius: '50%', background: THEME.colors.white,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.colors.brandSecondary,
                boxShadow: THEME.shadows.md, border: `1px solid ${THEME.colors.borderLight}`
              }}>
                {IconComponent && <IconComponent />}
              </Box>
              <Text variant="heading" size="4xl" weight="bold" color="brandPrimary" style={{ marginBottom: '8px' }}>
                {metric.value}
              </Text>
              <Text size="xs" weight="bold" color="textMuted" transform="uppercase" tracking="0.1em">
                {metric.label}
              </Text>
            </Flex>
          );
        })}
      </Grid>
    </Container>
  </Section>
);

/**
 * 6.4 HALL OF FAME (ALUMNI DIRECTORY) - Filterable, Searchable, 12 Alumni
 */
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

        {/* Advanced Filters */}
        <Flex direction="column" gap="24px" align="center" style={{ marginBottom: '64px' }}>
          <Box style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
            <Box style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: THEME.colors.textLight }}>
              <Icons.search />
            </Box>
            <input type="text" placeholder="Search alumni by name or profession..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="sju-input" style={{ paddingLeft: '56px' }} />
          </Box>

          <Flex wrap="wrap" justify="center" gap="12px">
            {DataFactory.categories.map(cat => (
              <button
                key={cat} onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '10px 20px', borderRadius: THEME.radii.full,
                  border: `1px solid ${activeCategory === cat ? THEME.colors.brandPrimary : THEME.colors.borderMedium}`,
                  background: activeCategory === cat ? THEME.colors.brandPrimary : THEME.colors.white,
                  color: activeCategory === cat ? THEME.colors.white : THEME.colors.textMuted,
                  fontSize: THEME.typography.sizes.xs, fontWeight: THEME.typography.weights.semibold,
                  cursor: 'pointer', transition: THEME.transitions.fast, textTransform: 'uppercase', letterSpacing: '0.05em'
                }}
              >
                {cat}
              </button>
            ))}
          </Flex>
        </Flex>

        {/* 12 Alumni Grid */}
        {filteredAlumni.length > 0 ? (
          <Grid columns="repeat(auto-fill, minmax(280px, 1fr))" gap="32px">
            {filteredAlumni.map((alum, index) => (
              <Box
                key={alum.id} className="interactive-card fade-in-up image-zoom-container"
                onClick={() => onOpenAlumni(alum)}
                style={{ cursor: 'pointer', borderRadius: THEME.radii.lg, border: `1px solid ${THEME.colors.borderLight}`, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
              >
                <Box style={{ width: '100%', paddingTop: '110%', position: 'relative', background: THEME.colors.bgSurface }}>
                  <img src={alum.image} alt={alum.name} className="image-zoom-target" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 10%' }} onError={(e) => { e.target.src = CONFIG.IMAGES.FALLBACK_AVATAR; }} loading="lazy" />
                </Box>
                <Flex direction="column" justify="center" style={{ padding: '32px 24px', flex: 1, textAlign: 'center' }}>
                  <Text size="xs" weight="bold" color="brandSecondary" transform="uppercase" tracking="0.05em" style={{ marginBottom: '8px' }}>{alum.category}</Text>
                  <Text variant="heading" size="xl" color="brandPrimary" style={{ marginBottom: '12px', fontWeight: 700 }}>{alum.name}</Text>
                  <Text size="sm" weight="medium" color="textMuted" style={{ lineHeight: 1.6 }}>{alum.title}</Text>
                </Flex>
              </Box>
            ))}
          </Grid>
        ) : (
          <Flex justify="center" align="center" style={{ padding: '80px 0' }}>
            <Text size="lg" color="textMuted">No alumni found matching your criteria.</Text>
          </Flex>
        )}
      </Container>
    </Section>
  );
};

/**
 * 6.5 INTERACTIVE CALENDAR - V3 UI logic merged beautifully.
 */
const CampusCalendar = () => {
  const [selectedDay, setSelectedDay] = useState(24);
  const selectedEvent = DataFactory.calendarEvents.find(e => e.day === selectedDay) || { title: "No events scheduled" };

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
      <Container maxWidth="1000px">
        <SectionHeader overline="Schedules" title="University Academic Calendar" align="center" />
        <Flex style={{ background: THEME.colors.white, boxShadow: THEME.shadows.lg, borderRadius: THEME.radii.lg, overflow: 'hidden', border: `1px solid ${THEME.colors.borderLight}` }} direction="row" align="stretch" className="fade-in-up" wrap="wrap">
          {/* Left Panel - Dark Navy */}
          <Box style={{ background: THEME.colors.brandPrimary, color: THEME.colors.white, padding: '60px 40px', width: '35%', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
            <Text variant="heading" size="5xl" weight="bold" color="brandSecondary" style={{ marginBottom: '8px' }}>{selectedDay}th</Text>
            <Text size="lg" weight="medium" style={{ marginBottom: '40px', color: THEME.colors.textWhite }}>Tuesday, February 2026</Text>
            <Box style={{ borderTop: `1px solid rgba(255,255,255,0.1)`, paddingTop: '24px', flex: 1 }}>
              {selectedEvent.title !== "No events scheduled" ? (
                <>
                  <Text size="lg" weight="bold" color="brandSecondary" style={{ marginBottom: '12px', lineHeight: 1.3 }}>{selectedEvent.title}</Text>
                  <Text size="sm" style={{ opacity: 0.8 }}>Internal University Event Schedule</Text>
                </>
              ) : (
                <Text size="md" style={{ opacity: 0.6 }}>No events scheduled for this date.</Text>
              )}
            </Box>
          </Box>
          {/* Right Panel - Calendar Grid */}
          <Box style={{ padding: '40px 60px', width: '65%', minWidth: '400px', position: 'relative' }}>
            <Flex justify="space-between" align="center" style={{ marginBottom: '32px' }}>
              <Icons.chevronLeft style={{ cursor: 'pointer', color: THEME.colors.textMuted }} />
              <Text variant="heading" size="xl" weight="bold" color="brandPrimary">February 2026</Text>
              <Icons.chevronRight style={{ cursor: 'pointer', color: THEME.colors.textMuted }} />
            </Flex>
            <div className="calendar-grid">{renderDays()}</div>
          </Box>
        </Flex>
      </Container>
    </Section>
  );
};

/**
 * 6.6 UPCOMING PUBLIC EVENTS - Includes Registration workflow.
 */
const UpcomingEvents = ({ onOpenEvent }) => (
  <Section bg="bgPage">
    <Container maxWidth="1000px">
      <SectionHeader overline="Networking" title="Official Public Gatherings" subtitle="Join networking summits, reunions, and academic symposiums tailored for our community." align="center" />
      <Box>
        {DataFactory.publicEvents.map((ev, idx) => (
          <Flex key={ev.id} className="interactive-card fade-in-up" align="stretch" wrap="wrap" style={{ borderRadius: THEME.radii.lg, border: `1px solid ${THEME.colors.borderLight}`, marginBottom: '24px', overflow: 'hidden' }}>
            <Flex direction="column" justify="center" align="center" style={{ width: '180px', borderRight: `1px solid ${THEME.colors.borderLight}`, background: THEME.colors.bgSurface, padding: '32px' }}>
              <Text size="xs" weight="bold" color="brandSecondary" transform="uppercase" tracking="0.1em" style={{ marginBottom: '8px' }}>{ev.date.split(' ')[0]}</Text>
              <Text variant="heading" size="5xl" color="brandPrimary" style={{ lineHeight: 1 }}>{ev.date.split(' ')[1]}</Text>
            </Flex>
            <Flex direction="column" justify="center" style={{ padding: '32px 48px', flex: 1, minWidth: '300px' }}>
              <Text variant="heading" size="xl" color="brandPrimary" style={{ marginBottom: '16px', fontWeight: 700 }}>{ev.title}</Text>
              <Flex wrap="wrap" gap="24px">
                <Flex align="center" gap="8px"><Icons.location style={{ color: THEME.colors.textLight }} /><Text size="sm" color="textMuted" weight="medium">{ev.loc}</Text></Flex>
                <Flex align="center" gap="8px"><Icons.clock style={{ color: THEME.colors.textLight }} /><Text size="sm" color="textMuted" weight="medium">{ev.time}</Text></Flex>
              </Flex>
            </Flex>
            <Flex align="center" justify="center" style={{ padding: '32px 48px' }}>
              <Button variant="outline" onClick={() => onOpenEvent(ev)}>Register Now</Button>
            </Flex>
          </Flex>
        ))}
      </Box>
    </Container>
  </Section>
);

/**
 * 6.7 NEWS & ANNOUNCEMENTS
 */
const NewsSection = ({ onOpenNews }) => (
  <Section bg="bgSurfaceAlt">
    <Container>
      <SectionHeader overline="Publications" title="Campus News & Stories" align="left" />
      <Grid columns="repeat(auto-fit, minmax(350px, 1fr))" gap="40px">
        {DataFactory.announcements.map((news, idx) => (
          <Flex key={news.id} direction="column" justify="space-between" className="interactive-card fade-in-up" style={{ borderRadius: THEME.radii.lg, border: `1px solid ${THEME.colors.borderLight}`, padding: '48px', height: '100%', animationDelay: `${idx * 0.15}s` }}>
            <Box>
              <Flex justify="space-between" align="center" style={{ marginBottom: '32px' }}>
                <Box style={{ padding: '6px 16px', background: THEME.colors.bgSurface, borderRadius: THEME.radii.full, border: `1px solid ${THEME.colors.borderLight}` }}>
                  <Text size="xs" weight="bold" color="brandSecondary" transform="uppercase" tracking="0.05em">{news.tag}</Text>
                </Box>
                <Text size="sm" color="textLight" weight="medium">{news.date}</Text>
              </Flex>
              <Text variant="heading" size="2xl" color="brandPrimary" style={{ marginBottom: '20px', lineHeight: 1.4, fontWeight: 700 }}>{news.title}</Text>
              <Text size="md" color="textMuted" style={{ marginBottom: '40px', lineHeight: 1.7 }}>{news.preview}</Text>
            </Box>
            <Box><Button variant="ghost" icon={<Icons.chevronRight />} onClick={() => onOpenNews(news)} style={{ padding: 0 }}>Read Full Story</Button></Box>
          </Flex>
        ))}
      </Grid>
    </Container>
  </Section>
);

/**
 * 6.8 ALUMNI REFLECTIONS / REVIEWS (All 12 included dynamically)
 */
const ReviewsSection = () => (
  <Section bg="bgPage">
    <Container>
      <SectionHeader overline="Voices" title="Alumni Reflections" subtitle="Hear directly from those who have walked our halls and shaped the world." align="center" />
      <Grid columns="repeat(auto-fill, minmax(300px, 1fr))" gap="24px">
        {DataFactory.reviews.map((rev, idx) => (
          <Flex key={rev.id} direction="column" className="interactive-card fade-in-up" style={{ padding: '40px', borderRadius: THEME.radii.lg, border: `1px solid ${THEME.colors.borderLight}`, background: THEME.colors.bgSurface, animationDelay: `${(idx % 4) * 0.1}s` }}>
            <Icons.quote style={{ marginBottom: '24px' }} />
            <Text variant="serif" size="lg" color="textMuted" style={{ fontStyle: 'italic', marginBottom: '32px', lineHeight: 1.8, flex: 1 }}>"{rev.text}"</Text>
            <Flex align="center" gap="16px">
              <Box style={{ width: '24px', height: '2px', background: THEME.colors.brandSecondary }} />
              <Text size="xs" weight="bold" color="brandPrimary" transform="uppercase" tracking="0.1em">{rev.author}</Text>
            </Flex>
          </Flex>
        ))}
      </Grid>
    </Container>
  </Section>
);

/**
 * 6.9 FAQ SECTION
 */
const FaqSection = () => (
  <Section bg="bgSurfaceAlt">
    <Container maxWidth="800px">
      <SectionHeader title="Frequently Asked Questions" align="center" />
      <Box style={{ borderTop: `1px solid ${THEME.colors.borderLight}` }}>
        {DataFactory.faqs.map((faq, index) => (
          <details key={index} style={{ borderBottom: `1px solid ${THEME.colors.borderLight}` }}>
            <summary className="sju-faq-summary">
              {faq.question}
              <Box as="span" style={{ color: THEME.colors.brandSecondary, fontWeight: 300, fontSize: '1.5rem' }}>+</Box>
            </summary>
            <Box className="sju-faq-content">{faq.answer}</Box>
          </details>
        ))}
      </Box>
    </Container>
  </Section>
);

// ============================================================================
// MODULE 7: MODAL OVERLAY SYSTEM
// Advanced popups for Alumni Bios, News Reading, and Event Registration.
// ============================================================================

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <Box style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(12, 35, 64, 0.6)', backdropFilter: 'blur(6px)' }} />
      <Box className="fade-in-up" style={{ position: 'relative', width: '100%', maxWidth: '850px', background: THEME.colors.white, borderRadius: THEME.radii.xl, padding: '56px', boxShadow: THEME.shadows.xl, maxHeight: '90vh', overflowY: 'auto', margin: '24px' }}>
        <Flex justify="space-between" align="flex-start" style={{ marginBottom: '40px' }}>
          <Text variant="heading" size="3xl" weight="bold" color="brandPrimary" style={{ lineHeight: 1.2 }}>{title}</Text>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '2.5rem', cursor: 'pointer', color: THEME.colors.textLight, lineHeight: 1, padding: '0 0 0 24px', transition: THEME.transitions.fast }} onMouseOver={(e) => e.target.style.color = THEME.colors.brandSecondary} onMouseOut={(e) => e.target.style.color = THEME.colors.textLight}>&times;</button>
        </Flex>
        <Box>{children}</Box>
      </Box>
    </Box>
  );
};

// ============================================================================
// MODULE 8: MAIN ASSEMBLER COMPONENT
// The root component tying the entire architecture together.
// ============================================================================

const AppUnifiedHome = () => {
  // State for global Modals
  const [modal, setModal] = useState(null);

  // Handlers
  const openNews = useCallback((news) => setModal({ type: 'NEWS', data: news }), []);
  const openEvent = useCallback((event) => setModal({ type: 'EVENT', data: event }), []);
  const openAlumni = useCallback((alum) => setModal({ type: 'ALUMNI', data: alum }), []);
  const closeModal = useCallback(() => setModal(null), []);

  // Body Scroll Lock for Modal
  useEffect(() => {
    document.body.style.overflow = modal ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [modal]);

  return (
    <Box style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GlobalStyles />

      {/* Domain Sections in strict order for narrative flow */}
      <HeroSection />
      <HistorySection />
      <UnifiedStatsSection />
      <AlumniDirectory onOpenAlumni={openAlumni} />
      <CampusCalendar />
      <UpcomingEvents onOpenEvent={openEvent} />
      <NewsSection onOpenNews={openNews} />
      <ReviewsSection />
      <FaqSection />

      {/* Structural bottom padding (Strictly NO footer) */}
      <Box style={{ height: '140px', background: THEME.colors.bgSurfaceAlt }} />

      {/* Global Modal Renderers */}
      <Modal isOpen={!!modal} onClose={closeModal} title={modal?.type === 'ALUMNI' ? 'Alumnus Profile' : modal?.type === 'NEWS' ? 'University Bulletin' : modal?.type === 'EVENT' ? 'Event Registration' : ''}>

        {/* Modal: ALUMNI BIO */}
        {modal?.type === 'ALUMNI' && (
          <Flex wrap="wrap" gap="48px" align="flex-start">
            <Box style={{ flex: '1 1 250px', maxWidth: '320px', borderRadius: THEME.radii.lg, overflow: 'hidden', border: `1px solid ${THEME.colors.borderLight}` }}>
              <img src={modal.data.image} alt={modal.data.name} style={{ width: '100%', display: 'block' }} onError={(e) => { e.target.src = CONFIG.IMAGES.FALLBACK_AVATAR; }} />
            </Box>
            <Box style={{ flex: '2 1 300px' }}>
              <Text variant="heading" size="4xl" weight="bold" color="brandPrimary" style={{ marginBottom: '12px' }}>{modal.data.name}</Text>
              <Text size="sm" weight="bold" color="brandSecondary" transform="uppercase" tracking="0.1em" style={{ marginBottom: '24px' }}>{modal.data.title}</Text>
              <Box style={{ width: '60px', height: '3px', background: THEME.colors.borderLight, marginBottom: '24px' }} />
              <Text size="lg" color="textMuted" style={{ lineHeight: 1.8 }}>{modal.data.bio}</Text>
            </Box>
          </Flex>
        )}

        {/* Modal: NEWS LONG FORM */}
        {modal?.type === 'NEWS' && (
          <Box>
            <Text variant="heading" size="4xl" weight="bold" color="brandPrimary" style={{ marginBottom: '24px', lineHeight: 1.3 }}>{modal.data.title}</Text>
            <Flex align="center" gap="16px" style={{ marginBottom: '48px', borderBottom: `1px solid ${THEME.colors.borderLight}`, paddingBottom: '24px' }}>
              <Box style={{ background: THEME.colors.bgSurface, padding: '8px 16px', borderRadius: THEME.radii.full, border: `1px solid ${THEME.colors.borderLight}` }}>
                <Text size="xs" weight="bold" color="brandSecondary" transform="uppercase" tracking="0.05em">{modal.data.tag}</Text>
              </Box>
              <Text size="sm" color="textLight">•</Text>
              <Text size="sm" color="textMuted" weight="medium">{modal.data.date}</Text>
            </Flex>
            <Box style={{ color: THEME.colors.textMain }}>
              {modal.data.body.split('\n').map((paragraph, i) => (
                paragraph.trim() && <Text key={i} size="lg" style={{ marginBottom: '24px', lineHeight: 1.9 }}>{paragraph}</Text>
              ))}
            </Box>
          </Box>
        )}

        {/* Modal: EVENT REGISTRATION */}
        {modal?.type === 'EVENT' && (
          <Box>
            <Text variant="heading" size="3xl" weight="bold" color="brandPrimary" style={{ marginBottom: '24px' }}>{modal.data.title}</Text>
            <Box style={{ background: THEME.colors.bgSurfaceAlt, padding: '32px', borderRadius: THEME.radii.lg, marginBottom: '40px', border: `1px solid ${THEME.colors.borderLight}` }}>
              <Grid columns="1fr 1fr" gap="16px">
                <Text size="md" color="textMain"><strong>Date & Time:</strong> {modal.data.date} | {modal.data.time}</Text>
                <Text size="md" color="textMain"><strong>Venue:</strong> {modal.data.loc}</Text>
              </Grid>
            </Box>
            <Text size="md" color="textMuted" style={{ marginBottom: '48px', lineHeight: 1.8 }}>{modal.data.desc}</Text>

            <Text variant="heading" size="xl" weight="bold" color="brandPrimary" style={{ marginBottom: '24px', borderBottom: `2px solid ${THEME.colors.borderLight}`, paddingBottom: '16px' }}>
              Official Registration Form
            </Text>

            <form onSubmit={(e) => { e.preventDefault(); alert('Registration Successfully Submitted. You will receive an email confirmation shortly.'); closeModal(); }}>
              <Grid columns="1fr 1fr" gap="24px">
                <Box style={{ gridColumn: '1 / -1' }}>
                  <label className="sju-label">Full Legal Name</label>
                  <input required type="text" className="sju-input" placeholder="e.g. Jane Doe" />
                </Box>
                <Box>
                  <label className="sju-label">Official Email Address</label>
                  <input required type="email" className="sju-input" placeholder="e.g. jane@example.com" />
                </Box>
                <Box>
                  <label className="sju-label">Contact Number</label>
                  <input required type="tel" className="sju-input" placeholder="+91 98765 43210" />
                </Box>
                <Box style={{ gridColumn: '1 / -1' }}>
                  <label className="sju-label">Affiliation (Current Student / Alumni Batch)</label>
                  <input required type="text" className="sju-input" placeholder="e.g. Current B.Sc Student, or Batch of 2018" />
                </Box>
                <Box style={{ gridColumn: '1 / -1', marginTop: '24px' }}>
                  <Button type="submit" fullWidth size="lg">Confirm Attendance & Register</Button>
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