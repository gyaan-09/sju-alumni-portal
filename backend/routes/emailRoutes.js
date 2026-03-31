const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// ── Transporter (Gmail App Password) ─────────────────────────
const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,  // Gmail App Password (16-char)
    },
  });

// ── POST /api/send-email ────────────────────────────────────
router.post('/', async (req, res) => {
  const { type, to_email, to_name, message, username, password, login_url } = req.body;

  if (!type || !to_email) {
    return res.status(400).json({ error: 'Missing required fields: type, to_email' });
  }

  let subject = '';
  let html = '';

  const base = (body) => `
    <div style="font-family:'Lora', 'Georgia', serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
      <div style="background:linear-gradient(135deg,#061121,#0C2340);padding:32px 40px;text-align:center;">
        <h1 style="color:#D4AF37;margin:0;font-size:1.6rem;letter-spacing:0.05em;">St. Joseph's University</h1>
        <p style="color:rgba(255,255,255,0.6);margin:6px 0 0;font-size:0.9rem;letter-spacing:0.15em;text-transform:uppercase;">Alumni Portal</p>
      </div>
      <div style="padding:40px;">${body}</div>
      <div style="padding:20px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:0.8rem;color:#94a3b8;">
        © ${new Date().getFullYear()} St. Joseph's University, Bengaluru · alumni.sju.ainp@gmail.com
      </div>
    </div>`;

  switch (type) {

    case 'newsletter':
      subject = 'Welcome to the SJU Alumni Network Updates!';
      html = base(`
        <h2 style="color:#0C2340;margin:0 0 16px;">You're In! 🎉</h2>
        <p style="color:#475569;line-height:1.8;">Hi <strong>${to_name || 'there'}</strong>,</p>
        <p style="color:#475569;line-height:1.8;">
          Thank you for subscribing to the <strong style="color:#0C2340;">SJU Alumni Network</strong> newsletter.
          You'll be the first to hear about upcoming events, reunions, career opportunities, and university news.
        </p>
        <p style="color:#475569;line-height:1.8;">Stay connected — <em>Fide et Labore</em>.</p>
        <a href="http://localhost:5173" style="display:inline-block;margin-top:24px;padding:14px 32px;background:#D4AF37;color:#0C2340;border-radius:999px;font-weight:700;text-decoration:none;">Visit the Portal →</a>
      `);
      break;

    case 'registration_submitted':
      subject = 'Application Received — SJU Alumni Portal';
      html = base(`
        <h2 style="color:#0C2340;margin:0 0 16px;">Application Received</h2>
        <p style="color:#475569;line-height:1.8;">Dear <strong>${to_name}</strong>,</p>
        <p style="color:#475569;line-height:1.8;">
          Your registration application for the <strong style="color:#0C2340;">SJU Alumni Portal</strong> has been successfully received.
          It is currently <strong>pending verification</strong> by the administration team.
        </p>
        <div style="background:#f8fafc;border-left:4px solid #D4AF37;padding:16px 20px;border-radius:8px;margin:20px 0;">
          <p style="margin:0;color:#0C2340;font-weight:600;">What happens next?</p>
          <p style="margin:8px 0 0;color:#475569;font-size:0.9rem;">Once your details are verified, you will receive a separate email with your login username and password.</p>
        </div>
        <p style="color:#475569;line-height:1.8;">For queries, contact <a href="mailto:alumni.sju.ainp@gmail.com" style="color:#D4AF37;">alumni.sju.ainp@gmail.com</a></p>
      `);
      break;

    case 'alumni_approved':
      subject = 'Your SJU Alumni Account is Approved — Login Credentials Inside';
      html = base(`
        <h2 style="color:#0C2340;margin:0 0 16px;">Account Approved! 🎓</h2>
        <p style="color:#475569;line-height:1.8;">Dear <strong>${to_name}</strong>,</p>
        <p style="color:#475569;line-height:1.8;">
          We are pleased to inform you that your application to the <strong style="color:#0C2340;">SJU Alumni Portal</strong> has been <strong style="color:#10B981;">approved and activated</strong>.
        </p>
        <div style="background:#0C2340;border-radius:12px;padding:28px;margin:24px 0;text-align:center;">
          <p style="color:rgba(255,255,255,0.6);margin:0 0 4px;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.1em;">Your Login Credentials</p>
          <div style="margin:16px 0;">
            <div style="background:rgba(255,255,255,0.08);border-radius:8px;padding:12px 20px;margin-bottom:10px;">
              <span style="color:rgba(255,255,255,0.5);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;">Username</span><br/>
              <strong style="color:#D4AF37;font-size:1.2rem;letter-spacing:0.05em;">${username}</strong>
            </div>
            <div style="background:rgba(255,255,255,0.08);border-radius:8px;padding:12px 20px;">
              <span style="color:rgba(255,255,255,0.5);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;">Password</span><br/>
              <strong style="color:#D4AF37;font-size:1.2rem;letter-spacing:0.05em;">${password}</strong>
            </div>
          </div>
          <p style="color:rgba(255,255,255,0.5);font-size:0.75rem;margin:0;">Please change your password after first login for security.</p>
        </div>
        <a href="${login_url || 'http://localhost:5173/login'}" style="display:inline-block;margin-top:8px;padding:14px 32px;background:#D4AF37;color:#0C2340;border-radius:999px;font-weight:700;text-decoration:none;">Login to the Portal →</a>
      `);
      break;

    case 'alumni_rejected':
      subject = 'Update on Your SJU Alumni Portal Application';
      html = base(`
        <h2 style="color:#0C2340;margin:0 0 16px;">Application Update</h2>
        <p style="color:#475569;line-height:1.8;">Dear <strong>${to_name}</strong>,</p>
        <p style="color:#475569;line-height:1.8;">
          ${message || 'Unfortunately, we were unable to verify your registration application at this time. This may be due to a mismatch in the provided details.'}
        </p>
        <div style="background:#fef2f2;border-left:4px solid #EF4444;padding:16px 20px;border-radius:8px;margin:20px 0;">
          <p style="margin:0;color:#991b1b;font-weight:600;">Next Steps</p>
          <p style="margin:8px 0 0;color:#7f1d1d;font-size:0.9rem;">Please contact the SJU Alumni Office directly at <a href="mailto:alumni.sju.ainp@gmail.com" style="color:#D4AF37;">alumni.sju.ainp@gmail.com</a> or call +91 80 2221 1429 for further assistance.</p>
        </div>
      `);
      break;

    case 'event_rsvp':
      subject = 'Registration Confirmed — SJU Alumni Event';
      html = base(`
        <h2 style="color:#0C2340;margin:0 0 16px;">Event Confirmation 🎟️</h2>
        <p style="color:#475569;line-height:1.8;">Hi <strong>${to_name}</strong>,</p>
        <p style="color:#475569;line-height:1.8;">
          Thank you for registering! This email confirms your attendance for the upcoming SJU event.
        </p>
        <div style="background:#f8fafc;border-radius:8px;padding:20px;margin:20px 0;border:1px solid #e2e8f0;">
          <p style="margin:0;color:#475569;line-height:1.6;">${message}</p>
        </div>
        <p style="color:#475569;line-height:1.8;">Fide et Labore.</p>
      `);
      break;

    case 'profile_edit_request':
      subject = `Profile Update Request: ${req.body.from_name} (${req.body.reg_no})`;
      html = base(`
        <h2 style="color:#0C2340;margin:0 0 16px;">Profile Edit Request 📩</h2>
        <p style="color:#475569;line-height:1.8;">
          An alumni has requested an update to their profile information.
        </p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:20px;border-radius:12px;margin:24px 0;">
          <p style="margin:0 0 8px;font-size:0.8rem;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;">Alumni Details</p>
          <p style="margin:0;color:#0C2340;font-weight:700;font-size:1.1rem;">${req.body.from_name}</p>
          <p style="margin:4px 0;color:#475569;">Reg No: <strong>${req.body.reg_no}</strong></p>
          <p style="margin:0;color:#475569;">Email: <strong>${req.body.from_email}</strong></p>
        </div>
        <p style="color:#475569;line-height:1.8;">
          Please reach out to the alumni to verify the requested changes and update the records in the database.
        </p>
      `);
      break;

    default:
      return res.status(400).json({ error: `Unknown email type: "${type}"` });
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"SJU Alumni Portal" <${process.env.MAIL_USER}>`,
      to: to_email,
      subject,
      html,
    });
    res.status(200).json({ success: true, message: `Email type "${type}" sent to ${to_email}` });
  } catch (err) {
    console.error('Nodemailer error:', err.message);
    res.status(500).json({ error: 'Failed to send email', details: err.message });
  }
});

module.exports = router;
