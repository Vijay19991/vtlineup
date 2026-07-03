/**
 * VTlineup — Home Services App
 * Firebase Auth: Email/Password + Google Sign-In
 *
 * SETUP (run once in your project root):
 *   npm install firebase
 *
 * Then drop this file into your src/ folder and import it as your root component.
 */

import { useState, useEffect, useCallback, useRef } from "react";

/* ============================================================
   FIREBASE — initialised inline (no separate firebase.js needed)
   ============================================================ */
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAHUzE59H3P43F-Yp1VyNM_E5lAwpn9OVg",
  authDomain: "v-tlineup-detw8r.firebaseapp.com",
  projectId: "v-tlineup-detw8r",
  storageBucket: "v-tlineup-detw8r.firebasestorage.app",
  messagingSenderId: "365739949017",
  appId: "1:365739949017:web:06ce0b0e43540d2e41b7c8",
};

// Prevent duplicate app initialisation (React hot-reload safe)
const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

/* ============================================================
   CONSTANTS & DATA
   ============================================================ */
const COLORS = {
  pr: "#E8652A", prL: "#FFF0E8", prD: "#C04E18",
  ac: "#2A7E60", acL: "#E8F5EF",
  warn: "#D97706", warnL: "#FEF3C7",
  danger: "#DC2626", dangerL: "#FEE2E2",
  bg: "#FFF8F2",
  text: "#2C2018", muted: "#8B7355", hint: "#B8A090",
  bdr: "#EDD8C4",
  sidebar: "#1E1610", sidebarT: "#C4A882",
};

const DEFAULT_SERVICES = [
  { id: "cleaning",     name: "Home Cleaning",    emoji: "🧹", color: "#FFF0E8", price: 499, unit: "/session", desc: "Regular, deep cleaning, move-in/move-out and post-renovation services with eco-friendly products.", features: ["Deep clean","Eco-friendly","4–6 hrs"] },
  { id: "plumbing",     name: "Plumbing",          emoji: "🔧", color: "#E8F0FF", price: 299, unit: "/visit",   desc: "Pipe repairs, tap installations, drainage cleaning, water heater repair and all plumbing emergencies.", features: ["Emergency","All fixtures","Warranty"] },
  { id: "electrical",   name: "Electrical",        emoji: "⚡", color: "#FFFBE8", price: 349, unit: "/visit",   desc: "Wiring, switchboard repairs, fan & light fitting, MCB replacements and electrical safety checks.", features: ["Certified","Safety check","All wiring"] },
  { id: "carpentry",    name: "Carpentry",         emoji: "🪚", color: "#FFF0E8", price: 399, unit: "/visit",   desc: "Furniture assembly, door/window repairs, custom shelving, modular kitchen fittings and all woodwork.", features: ["Custom work","All wood","Precision"] },
  { id: "painting",     name: "Painting",          emoji: "🖌️", color: "#F0FFF4", price: 8,   unit: "/sq ft",  desc: "Interior & exterior painting, texture and POP work, waterproofing and designer wall finishes.", features: ["Premium paint","Interior/exterior","Clean work"] },
  { id: "appliance",    name: "Appliance Repair",  emoji: "🔨", color: "#F0F8FF", price: 199, unit: "/visit",   desc: "AC, washing machine, refrigerator, microwave and TV repairs. All brands supported with genuine parts.", features: ["All brands","Genuine parts","Warranty"] },
  { id: "construction", name: "Construction",      emoji: "🏗️", color: "#FFF5E0", price: 0,   unit: "custom",  desc: "Home renovation, civil work, false ceiling, tiling, bathroom renovation and new builds — end to end.", features: ["End-to-end","Custom quote","Project mgmt"] },
];

const DEFAULT_VISIT_CHARGES = { "Delhi NCR": 99, Mumbai: 129, Bangalore: 119, Hyderabad: 109 };

const DEFAULT_PROS = [
  { id: 1, name: "Ramesh Kumar",  initials: "RK", service: "Plumbing",        city: "Delhi NCR", phone: "+91 98001 11111", email: "ramesh@pro.in",  rating: 4.9, jobs: 143, kyc: "Verified", status: "Active", exp: 12 },
  { id: 2, name: "Vikas Sharma",  initials: "VS", service: "Painting",         city: "Mumbai",    phone: "+91 98002 22222", email: "vikas@pro.in",   rating: 4.8, jobs: 98,  kyc: "Verified", status: "Active", exp: 8  },
  { id: 3, name: "Mohan Das",     initials: "MD", service: "Appliance Repair", city: "Bangalore", phone: "+91 98003 33333", email: "mohan@pro.in",   rating: 4.7, jobs: 211, kyc: "Verified", status: "Active", exp: 15 },
  { id: 4, name: "Kavita Rajan",  initials: "KR", service: "Cleaning",         city: "Hyderabad", phone: "+91 98004 44444", email: "kavita@pro.in",  rating: 5.0, jobs: 67,  kyc: "Verified", status: "Active", exp: 5  },
  { id: 5, name: "Deepak Nair",   initials: "DN", service: "Electrical",       city: "Delhi NCR", phone: "+91 98005 55555", email: "deepak@pro.in",  rating: 4.6, jobs: 88,  kyc: "Verified", status: "Active", exp: 7  },
];

const DEFAULT_KYC = [
  { id: "k1", name: "Suresh Patel", initials: "SP", service: "Carpentry",  city: "Delhi NCR", phone: "+91 96001 10001", dob: "12 Mar 1988", aadhar: "1234 XXXX 5678", pan: "ABCDE1234F", email: "suresh@email.com", kyc: "Pending",  submitted: "Jun 7, 2026" },
  { id: "k2", name: "Anjali Singh", initials: "AS", service: "Cleaning",   city: "Mumbai",    phone: "+91 97002 20002", dob: "5 Jul 1995",  aadhar: "5678 XXXX 9012", pan: "FGHIJ5678K", email: "anjali@email.com", kyc: "Verified", submitted: "Jun 6, 2026" },
  { id: "k3", name: "Manoj Yadav",  initials: "MY", service: "Electrical", city: "Bangalore", phone: "+91 96003 30003", dob: "22 Jan 1990", aadhar: "9012 XXXX 3456", pan: "KLMNO9012P", email: "manoj@email.com",  kyc: "Pending",  submitted: "Jun 5, 2026" },
];

const CITIES        = ["Delhi NCR", "Mumbai", "Bangalore", "Hyderabad"];
const SERVICE_NAMES = ["Cleaning","Plumbing","Electrical","Carpentry","Painting","Appliance Repair","Construction"];
const TIME_SLOTS    = ["Morning (8–11 AM)","Afternoon (12–3 PM)","Evening (4–7 PM)"];

/* ============================================================
   HELPERS
   ============================================================ */
function getInitials(name) {
  return (name || "").split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2);
}
function formatPrice(svc) {
  return svc.price === 0 ? "Custom Quote" : `₹${svc.price}${svc.unit}`;
}

// Map Firebase auth error codes → human-friendly messages
function friendlyAuthError(code) {
  const map = {
    "auth/email-already-in-use":    "This email is already registered. Please sign in instead.",
    "auth/invalid-email":           "Please enter a valid email address.",
    "auth/weak-password":           "Password must be at least 6 characters.",
    "auth/user-not-found":          "No account found with this email.",
    "auth/wrong-password":          "Incorrect password. Please try again.",
    "auth/invalid-credential":      "Incorrect email or password. Please try again.",
    "auth/too-many-requests":       "Too many attempts. Please wait a moment and try again.",
    "auth/popup-closed-by-user":    "Google sign-in was cancelled.",
    "auth/popup-blocked":           "Pop-up was blocked by your browser. Please allow pop-ups and try again.",
    "auth/network-request-failed":  "Network error. Please check your connection.",
    "auth/cancelled-popup-request": "Sign-in cancelled.",
  };
  return map[code] || "Something went wrong. Please try again.";
}

/* ============================================================
   LOCAL STORAGE (for non-auth data)
   ============================================================ */
const KEYS = {
  prices: "hs_prices", visits: "hs_visits", pros: "hs_pros",
  bookings: "hs_bookings", kyc: "hs_kyc",
};
function loadData(key, def) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : JSON.parse(JSON.stringify(def)); }
  catch { return JSON.parse(JSON.stringify(def)); }
}
function saveData(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.warn(e); }
}

/* ============================================================
   GLOBAL CSS
   ============================================================ */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Lora:ital,wght@0,500;0,600;1,400&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Nunito',sans-serif;background:#FFF8F2;color:#2C2018;line-height:1.6}
:root{
  --pr:#E8652A;--pr-l:#FFF0E8;--pr-d:#C04E18;
  --ac:#2A7E60;--ac-l:#E8F5EF;
  --warn:#D97706;--warn-l:#FEF3C7;
  --danger:#DC2626;--danger-l:#FEE2E2;
  --bg:#FFF8F2;
  --text:#2C2018;--muted:#8B7355;--hint:#B8A090;
  --bdr:#EDD8C4;
  --sidebar:#1E1610;--sidebar-t:#C4A882;
  --card-shadow:0 2px 8px rgba(0,0,0,.06);
  --radius:12px;--radius-sm:8px;--radius-lg:16px;
}
.btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:24px;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;cursor:pointer;border:none;transition:all .18s;white-space:nowrap;background:transparent}
.btn-primary{background:var(--pr);color:#fff}.btn-primary:hover{background:var(--pr-d);transform:translateY(-1px)}
.btn-outline{color:var(--pr);border:2px solid var(--pr)}.btn-outline:hover{background:var(--pr-l)}
.btn-ghost{color:var(--muted);border:1px solid var(--bdr)}.btn-ghost:hover{border-color:var(--pr);color:var(--pr)}
.btn-success{background:var(--ac-l);color:var(--ac);border:1px solid #A5D6BC}.btn-success:hover{background:#D1EFE3}
.btn-danger{background:var(--danger-l);color:var(--danger);border:1px solid #FECACA}
.btn-white{background:#fff;color:var(--pr);border:2px solid #fff}.btn-white:hover{background:var(--pr-l)}
.btn-google{background:#fff;color:#3c4043;border:1.5px solid #dadce0;gap:10px}.btn-google:hover{background:#f8f9fa;box-shadow:0 1px 6px rgba(0,0,0,.1)}
.btn-sm{padding:5px 12px;font-size:12px;border-radius:16px}
.btn-lg{padding:13px 28px;font-size:15px}
.btn:disabled{opacity:.55;cursor:not-allowed;transform:none!important}
.badge{display:inline-block;font-size:11px;font-weight:700;padding:3px 9px;border-radius:10px;white-space:nowrap}
.badge-pending{background:var(--warn-l);color:var(--warn)}
.badge-active{background:var(--ac-l);color:var(--ac)}
.badge-inactive{background:#F3F4F6;color:#6B7280}
.badge-rejected{background:var(--danger-l);color:var(--danger)}
.badge-verified{background:#DBEAFE;color:#1D4ED8}
.badge-new{background:var(--pr-l);color:var(--pr)}
.form-group{margin-bottom:14px}
.form-group label{display:block;font-size:12px;font-weight:700;margin-bottom:5px;color:var(--text)}
.form-control{width:100%;border:1.5px solid var(--bdr);border-radius:var(--radius-sm);padding:9px 12px;font-family:'Nunito',sans-serif;font-size:13px;color:var(--text);background:#fff;outline:none;transition:border-color .15s}
.form-control:focus{border-color:var(--pr);box-shadow:0 0 0 3px rgba(232,101,42,.1)}
.form-control::placeholder{color:var(--hint)}
textarea.form-control{height:80px;resize:vertical}
select.form-control{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%238B7355' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:30px}
.form-row-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.form-row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.card{background:#fff;border:1px solid var(--bdr);border-radius:var(--radius-lg);box-shadow:var(--card-shadow)}
.card-header{padding:14px 18px;border-bottom:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between;gap:10px}
.card-header h3{font-size:14px;font-weight:700}
.card-body{padding:18px}
.tbl{width:100%;border-collapse:collapse;font-size:13px;min-width:500px}
.tbl th{text-align:left;padding:9px 12px;font-size:11px;font-weight:700;color:var(--muted);letter-spacing:.4px;background:#FFFCFA;border-bottom:1px solid var(--bdr);white-space:nowrap}
.tbl td{padding:10px 12px;border-bottom:.5px solid var(--bdr);vertical-align:middle}
.tbl tbody tr:last-child td{border-bottom:none}
.tbl tbody tr:hover td{background:#FFFCFA}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px}
.modal{background:#fff;border-radius:var(--radius-lg);width:100%;max-width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2)}
.modal-header{padding:16px 20px;border-bottom:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between}
.modal-header h3{font-size:15px;font-weight:700}
.modal-body{padding:20px}
.modal-footer{padding:14px 20px;border-top:1px solid var(--bdr);display:flex;gap:10px;justify-content:flex-end}
.tabs{display:flex;border-bottom:1.5px solid var(--bdr);margin-bottom:18px}
.tab-btn{padding:9px 18px;font-size:13px;font-weight:700;color:var(--muted);cursor:pointer;border:none;background:none;border-bottom:2px solid transparent;margin-bottom:-1.5px;transition:all .15s}
.tab-btn.active{color:var(--pr);border-bottom-color:var(--pr)}
.avatar{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0}
.avatar-sm{width:32px;height:32px;font-size:12px}
.avatar-md{width:42px;height:42px;font-size:15px}
.avatar-pr{background:var(--pr-l);color:var(--pr)}
.avatar-ac{background:var(--ac-l);color:var(--ac)}
.avatar-blue{background:#DBEAFE;color:#1D4ED8}
.live-badge{display:inline-flex;align-items:center;gap:5px;background:var(--ac-l);color:var(--ac);font-size:11px;font-weight:700;padding:3px 10px;border-radius:10px}
.live-dot{width:6px;height:6px;background:var(--ac);border-radius:50%;animation:livePulse 1.5s infinite}
@keyframes livePulse{0%,100%{opacity:1}50%{opacity:.4}}
.toast-container{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none}
.toast{display:flex;align-items:center;gap:10px;padding:12px 18px;border-radius:12px;font-size:13px;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,.15);animation:toastIn .3s ease;min-width:220px;pointer-events:auto}
.toast-success{background:#1E1610;color:#fff}
.toast-error{background:#DC2626;color:#fff}
.toast-warn{background:#D97706;color:#fff}
@keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.analytics-bar-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.analytics-bar-label{font-size:12px;font-weight:600;width:110px;flex-shrink:0}
.analytics-bar-wrap{flex:1;background:#F5F0EA;border-radius:4px;height:14px;overflow:hidden}
.analytics-bar-fill{height:100%;border-radius:4px;background:var(--pr);transition:width .5s ease}
.analytics-bar-val{font-size:12px;font-weight:700;color:var(--muted);width:36px;text-align:right;flex-shrink:0}
.price-item{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:.5px solid var(--bdr)}
.price-item:last-child{border-bottom:none}
.price-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.price-input{width:110px;border:1.5px solid var(--bdr);border-radius:var(--radius-sm);padding:7px 10px;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;color:var(--pr);text-align:right;outline:none}
.price-input:focus{border-color:var(--pr)}
.pro-card{background:#fff;border:1px solid var(--bdr);border-radius:var(--radius);padding:14px;display:flex;align-items:flex-start;gap:12px;margin-bottom:10px}
.upload-box{border:2px dashed var(--bdr);border-radius:var(--radius-sm);padding:16px;text-align:center;cursor:pointer;transition:.15s;background:#fff}
.upload-box:hover{border-color:var(--pr);background:var(--pr-l)}
.notif-success-banner{background:var(--ac-l);color:var(--ac);border:1px solid #A5D6BC;border-radius:var(--radius-sm);padding:10px 14px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;margin-bottom:14px}
.auth-divider{display:flex;align-items:center;gap:12px;margin:16px 0;color:var(--hint);font-size:12px;font-weight:600}
.auth-divider::before,.auth-divider::after{content:'';flex:1;height:1px;background:var(--bdr)}
.spinner{display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.spinner-dark{border-color:rgba(44,32,24,.15);border-top-color:var(--pr)}
@media(max-width:900px){.form-row-2,.form-row-3{grid-template-columns:1fr}}
@media(max-width:600px){.hero-h1{font-size:28px!important}.booking-grid{grid-template-columns:1fr!important}}
`;

/* ============================================================
   TOAST
   ============================================================ */
function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "⚠"}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   BADGE
   ============================================================ */
function Badge({ status }) {
  const map = {
    Active: "badge-active", Inactive: "badge-inactive", Suspended: "badge-rejected",
    Pending: "badge-pending", Verified: "badge-verified", Rejected: "badge-rejected",
    Confirmed: "badge-active", Completed: "badge-active", Cancelled: "badge-rejected", New: "badge-new",
  };
  return <span className={`badge ${map[status] || "badge-inactive"}`}>{status}</span>;
}

/* ============================================================
   GOOGLE LOGO SVG
   ============================================================ */
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

/* ============================================================
   AUTH MODAL  (Firebase-powered)
   ============================================================ */
function AuthModal({ initialMode = "signin", onClose, onSuccess, showToast }) {
  const [mode, setMode]       = useState(initialMode);
  const [form, setForm]       = useState({ name: "", phone: "", email: "", password: "" });
  const [status, setStatus]   = useState(null); // { type, msg }
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);

  const setF = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const showErr = msg => setStatus({ type: "error", msg });
  const showWarn = msg => setStatus({ type: "warn", msg });

  async function handleEmailSubmit() {
    setStatus(null);
    if (mode === "signup" && !form.name.trim()) { showErr("Please enter your full name."); return; }
    if (mode === "signup" && form.phone.length < 8) { showErr("Please enter a valid phone number."); return; }
    setLoading(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
        // Store display name in Firebase profile
        await updateProfile(cred.user, { displayName: form.name.trim() });
        // Store extra data (phone) in localStorage keyed by uid
        localStorage.setItem(`vtl_phone_${cred.user.uid}`, form.phone.trim());
        onSuccess(cred.user);
        showToast(`Account created. Welcome, ${form.name.split(" ")[0]}!`, "success");
      } else {
        const cred = await signInWithEmailAndPassword(auth, form.email, form.password);
        onSuccess(cred.user);
        showToast(`Welcome back, ${(cred.user.displayName || cred.user.email).split(" ")[0]}!`, "success");
      }
      onClose();
    } catch (err) {
      showErr(friendlyAuthError(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setStatus(null);
    setGLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onSuccess(result.user);
      showToast(`Welcome, ${result.user.displayName?.split(" ")[0] || "there"}! 👋`, "success");
      onClose();
    } catch (err) {
      if (err.code !== "auth/cancelled-popup-request" && err.code !== "auth/popup-closed-by-user") {
        showErr(friendlyAuthError(err.code));
      }
    } finally {
      setGLoading(false);
    }
  }

  const statusBg = {
    error: { background: "#FEE2E2", color: "#DC2626", border: "1px solid #FECACA" },
    warn:  { background: "#FEF3C7", color: "#D97706", border: "1px solid #FCD34D" },
    info:  { background: "#E8F5EF", color: "#2A7E60", border: "1px solid #A5D6BC" },
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <h3>{mode === "signup" ? "Create Account" : "Sign In"}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: COLORS.muted, lineHeight: 1 }}>✕</button>
        </div>

        <div className="modal-body">
          {/* Mode switcher */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, background: "#F5F0EA", borderRadius: 12, padding: 4, marginBottom: 20 }}>
            {["signin", "signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setStatus(null); }}
                style={{ border: 0, borderRadius: 9, padding: "8px 10px", fontFamily: "Nunito,sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: ".15s", background: mode === m ? "#fff" : "transparent", color: mode === m ? COLORS.pr : COLORS.muted, boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,.07)" : "none" }}>
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Google button */}
          <button className="btn btn-google" onClick={handleGoogle} disabled={gLoading || loading}
            style={{ width: "100%", justifyContent: "center", marginBottom: 4, padding: "10px 18px" }}>
            {gLoading ? <span className="spinner spinner-dark" /> : <GoogleLogo />}
            <span>{gLoading ? "Signing in…" : `Continue with Google`}</span>
          </button>

          <div className="auth-divider">or {mode === "signup" ? "sign up" : "sign in"} with email</div>

          {/* Sign-up extras */}
          {mode === "signup" && (
            <div className="form-row-2">
              <div className="form-group"><label>Full Name *</label><input className="form-control" value={form.name} onChange={setF("name")} placeholder="Your full name" autoFocus /></div>
              <div className="form-group"><label>Phone *</label><input className="form-control" value={form.phone} onChange={setF("phone")} placeholder="+91 XXXXX XXXXX" /></div>
            </div>
          )}

          <div className="form-group"><label>Email *</label><input className="form-control" type="email" value={form.email} onChange={setF("email")} placeholder="you@example.com" autoFocus={mode === "signin"} /></div>
          <div className="form-group"><label>Password *</label><input className="form-control" type="password" value={form.password} onChange={setF("password")} placeholder="Minimum 6 characters" onKeyDown={e => e.key === "Enter" && handleEmailSubmit()} /></div>

          {status && (
            <div style={{ ...statusBg[status.type], padding: "9px 11px", borderRadius: 8, fontSize: 12, fontWeight: 700, marginTop: 8 }}>
              {status.msg}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading || gLoading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleEmailSubmit} disabled={loading || gLoading} style={{ minWidth: 120, justifyContent: "center" }}>
            {loading ? <><span className="spinner" /> {mode === "signup" ? "Creating…" : "Signing in…"}</> : (mode === "signup" ? "Sign Up" : "Sign In")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SITE NAV
   ============================================================ */
function SiteNav({ page, setPage, currentUser, onSignIn, onSignUp, onSignOut, openAdmin }) {
  const displayName = currentUser?.displayName || currentUser?.email?.split("@")[0] || "Account";
  const avatar = currentUser?.photoURL
    ? <img src={currentUser.photoURL} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
    : <div className="avatar avatar-sm avatar-pr">{getInitials(displayName)}</div>;

  return (
    <nav style={{ background: "#fff", borderBottom: `1px solid ${COLORS.bdr}`, padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 200, boxShadow: "0 1px 8px rgba(0,0,0,.04)" }}>
      <a onClick={() => setPage("home")} style={{ fontFamily: "Lora,serif", fontSize: 20, fontWeight: 600, color: COLORS.pr, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        🏠 VTlineup
      </a>
      <ul style={{ display: "flex", gap: 4, listStyle: "none" }}>
        {[["home","Home"],["services","Services"],["booking","Book Now"],["contact","Contact"]].map(([p,l]) => (
          <li key={p}><a onClick={() => setPage(p)} style={{ fontSize: 13, fontWeight: 700, padding: "7px 14px", borderRadius: 20, cursor: "pointer", color: page===p ? COLORS.pr : COLORS.muted, background: page===p ? COLORS.prL : "transparent", display: "block", transition: ".15s" }}>{l}</a></li>
        ))}
      </ul>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {currentUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFFCFA", border: `1px solid ${COLORS.bdr}`, borderRadius: 24, padding: "4px 8px 4px 4px" }}>
            {avatar}
            <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.text, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</span>
            <button onClick={onSignOut} className="btn btn-ghost btn-sm" style={{ borderRadius: "50%", width: 28, height: 28, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }} title="Sign out">↩</button>
          </div>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm" onClick={onSignIn}>Sign In</button>
            <button className="btn btn-primary btn-sm" onClick={onSignUp}>Sign Up</button>
          </>
        )}
        <a onClick={openAdmin} style={{ fontSize: 12, color: COLORS.hint, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 8, transition: ".15s" }}>⚙ Admin</a>
        <button className="btn btn-primary btn-sm" onClick={() => setPage("booking")}>📅 Book Now</button>
      </div>
    </nav>
  );
}

/* ============================================================
   HOME PAGE
   ============================================================ */
function HomePage({ services, setPage }) {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg,#FFF3EA 0%,#FFF8F2 55%,#EBF6F0 100%)", padding: "60px 24px 48px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: COLORS.acL, color: COLORS.ac, fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20, marginBottom: 18 }}>
          🛡 Trusted by 15,000+ Families Across India
        </div>
        <h1 className="hero-h1" style={{ fontFamily: "Lora,serif", fontSize: 42, fontWeight: 600, lineHeight: 1.15, color: COLORS.text, marginBottom: 14, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
          Expert Home Services<br /><em style={{ color: COLORS.pr, fontStyle: "italic" }}>at Your Doorstep</em>
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 16, maxWidth: 460, margin: "0 auto 28px", lineHeight: 1.7 }}>
          Reliable, background-verified professionals for every home need. Book in minutes, relax while we handle the rest.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
          <button className="btn btn-primary btn-lg" onClick={() => setPage("booking")}>📅 Book a Service</button>
          <button className="btn btn-outline btn-lg" onClick={() => setPage("services")}>🔲 Explore Services</button>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          {[["🕐","Same-Day Slots"],["🏅","Verified Pros"],["👍","Satisfaction Guarantee"],["🎧","24/7 Support"]].map(([icon,label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff", border: `1px solid ${COLORS.bdr}`, borderRadius: 24, padding: "8px 16px", fontSize: 13, fontWeight: 600, boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
              <span style={{ color: COLORS.pr }}>{icon}</span>{label}
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: "#fff", borderTop: `1px solid ${COLORS.bdr}`, borderBottom: `1px solid ${COLORS.bdr}` }}>
        {[["15K+","Happy Customers"],["500+","Verified Experts"],["4.9★","Average Rating"],["7","Service Categories"]].map(([num,lbl]) => (
          <div key={lbl} style={{ padding: "18px 16px", textAlign: "center", borderRight: `1px solid ${COLORS.bdr}` }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.pr }}>{num}</div>
            <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, marginTop: 2 }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Services Grid */}
      <section style={{ padding: "52px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.pr, letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 6 }}>What We Offer</div>
          <h2 style={{ fontFamily: "Lora,serif", fontSize: 30, fontWeight: 600, marginBottom: 8 }}>All your home needs, one platform</h2>
          <p style={{ color: COLORS.muted, fontSize: 15, maxWidth: 480, margin: "0 auto" }}>From a leaky tap to a full renovation — our professionals handle it all.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(148px,1fr))", gap: 14, maxWidth: 800, margin: "0 auto" }}>
          {services.map(s => (
            <div key={s.id} onClick={() => setPage("services")}
              style={{ background: "#fff", border: `1.5px solid ${COLORS.bdr}`, borderRadius: 16, padding: "20px 14px", textAlign: "center", cursor: "pointer", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.pr; e.currentTarget.style.boxShadow = "0 6px 20px rgba(232,101,42,.12)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.bdr; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 26, background: s.color }}>{s.emoji}</div>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{s.name}</h3>
              <div style={{ fontSize: 12, color: COLORS.pr, fontWeight: 700 }}>{formatPrice(s)}</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 3 }}>{s.desc.split(".")[0]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section style={{ background: "#fff", padding: "52px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.pr, letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 6 }}>How It Works</div>
          <h2 style={{ fontFamily: "Lora,serif", fontSize: 30, fontWeight: 600 }}>Book a pro in 3 easy steps</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, maxWidth: 700, margin: "0 auto", position: "relative" }}>
          <div style={{ position: "absolute", top: 28, left: "16%", right: "16%", height: 2, background: `linear-gradient(90deg,${COLORS.prL},${COLORS.pr},${COLORS.prL})` }} />
          {[["1","Choose Your Service","Browse from 7 categories and pick exactly what your home needs."],
            ["2","Pick a Slot","Select a date and time that works for you — same-day available."],
            ["3","Expert Arrives","A background-verified pro shows up and delivers quality work."]].map(([n,t,d]) => (
            <div key={n} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
              <div style={{ width: 56, height: 56, background: COLORS.pr, color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, margin: "0 auto 14px", border: `4px solid ${COLORS.bg}` }}>{n}</div>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{t}</h4>
              <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "52px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.pr, letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 6 }}>Customer Reviews</div>
          <h2 style={{ fontFamily: "Lora,serif", fontSize: 30, fontWeight: 600 }}>What homeowners are saying</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, maxWidth: 800, margin: "0 auto" }}>
          {[["PR","avatar-pr","The plumber arrived within an hour and fixed our burst pipe perfectly.","Priya Rao","Plumbing — Delhi NCR"],
            ["AK","avatar-ac","Deep cleaning done in just 4 hours. My house looks brand new.","Amit Kumar","Cleaning — Mumbai"],
            ["SM","avatar-blue","Got the entire home repainted in 2 days with zero mess. Worth every rupee!","Sunita Mehta","Painting — Bangalore"]].map(([ini,av,q,name,meta]) => (
            <div key={name} style={{ background: "#fff", border: `1px solid ${COLORS.bdr}`, borderRadius: 16, padding: 18 }}>
              <div style={{ color: "#F59E0B", fontSize: 14, marginBottom: 8 }}>★★★★★</div>
              <p style={{ fontSize: 13, lineHeight: 1.65, fontStyle: "italic", marginBottom: 14 }}>"{q}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className={`avatar avatar-sm ${av}`}>{ini}</div>
                <div><span style={{ display: "block", fontSize: 13, fontWeight: 700 }}>{name}</span><small style={{ fontSize: 11, color: COLORS.muted }}>{meta}</small></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: `linear-gradient(135deg,${COLORS.prD},${COLORS.pr})`, padding: "52px 24px", textAlign: "center", color: "#fff" }}>
        <h2 style={{ fontFamily: "Lora,serif", fontSize: 28, fontWeight: 600, marginBottom: 10 }}>Ready to get started?</h2>
        <p style={{ fontSize: 15, opacity: .88, marginBottom: 24, maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>Join 15,000+ families who trust VTlineup for every home need.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-white" onClick={() => setPage("booking")}>📅 Book Now — It's Fast</button>
          <button className="btn btn-outline" style={{ borderColor: "rgba(255,255,255,.6)", color: "#fff" }} onClick={() => setPage("contact")}>Talk to Us</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: COLORS.sidebar, padding: "40px 24px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 32, marginBottom: 32, maxWidth: 1000, margin: "0 auto 32px" }}>
          <div>
            <div style={{ fontFamily: "Lora,serif", fontSize: 20, color: "#fff", display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><span style={{ color: COLORS.pr }}>🏠</span> VTlineup</div>
            <p style={{ fontSize: 13, color: COLORS.sidebarT, lineHeight: 1.7, maxWidth: 200 }}>Expert home services at your doorstep. Trusted by 15,000+ families across India.</p>
          </div>
          {[["Services",["Cleaning","Plumbing","Electrical","Carpentry","Painting"]],["Company",["About Us","Contact","Admin Portal"]],["Support",["Book a Service","Help Center","Privacy Policy","Terms of Service"]]].map(([title,items]) => (
            <div key={title}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 12 }}>{title}</h4>
              <ul style={{ listStyle: "none" }}>{items.map(i => <li key={i} style={{ marginBottom: 6 }}><a style={{ fontSize: 13, color: COLORS.sidebarT, cursor: "pointer" }}>{i}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1000, margin: "0 auto" }}>
          <p style={{ fontSize: 12, color: COLORS.sidebarT }}>© 2026 VTlineup. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================
   SERVICES PAGE
   ============================================================ */
function ServicesPage({ services, setPage }) {
  return (
    <section style={{ padding: "52px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.pr, letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 6 }}>Our Services</div>
        <h2 style={{ fontFamily: "Lora,serif", fontSize: 30, fontWeight: 600, marginBottom: 8 }}>Professional solutions for every room</h2>
        <p style={{ color: COLORS.muted, fontSize: 15, maxWidth: 480, margin: "0 auto" }}>All services backed by our satisfaction guarantee and background-verified professionals.</p>
      </div>
      <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
        {services.map(s => (
          <div key={s.id} style={{ background: "#fff", border: `1px solid ${COLORS.bdr}`, borderRadius: 16, padding: 18, display: "flex", gap: 14, alignItems: "flex-start", transition: ".15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.pr}
            onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.bdr}>
            <div style={{ width: 52, height: 52, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, background: s.color }}>{s.emoji}</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{s.name}</h3>
              <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6, marginBottom: 8 }}>{s.desc}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                {s.features.map(f => <span key={f} style={{ fontSize: 11, color: COLORS.muted, background: "#F5F0EA", padding: "2px 8px", borderRadius: 6 }}>{f}</span>)}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.ac, background: COLORS.acL, padding: "4px 12px", borderRadius: 10 }}>
                  {s.price === 0 ? "Custom Quote" : `Starting ₹${s.price}${s.unit}`}
                </span>
                <button className="btn btn-primary btn-sm" onClick={() => setPage("booking")}>📅 Book Now</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <button className="btn btn-primary btn-lg" onClick={() => setPage("booking")}>📅 Book Any Service</button>
      </div>
    </section>
  );
}

/* ============================================================
   BOOKING PAGE
   ============================================================ */
function BookingPage({ services, visitCharges, currentUser, onNeedAuth, showToast, bookings, setBookings }) {
  const phone = currentUser ? (localStorage.getItem(`vtl_phone_${currentUser.uid}`) || "") : "";
  const displayName = currentUser?.displayName || "";
  const [form, setForm] = useState({ name: displayName, phone, email: currentUser?.email || "", service: "", address: "", city: "", date: "", time: TIME_SLOTS[0], notes: "" });
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const p = localStorage.getItem(`vtl_phone_${currentUser.uid}`) || "";
      setForm(f => ({ ...f, name: f.name || currentUser.displayName || "", phone: f.phone || p, email: f.email || currentUser.email || "" }));
    }
  }, [currentUser]);

  const setF = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const svc = services.find(s => s.id === form.service);
  const visitCharge = visitCharges[form.city] || 0;
  const today = new Date().toISOString().split("T")[0];

  function submit() {
    if (!currentUser) { onNeedAuth(); showToast("Please sign in before booking.", "warn"); return; }
    if (!form.name || !form.phone || !form.service || !form.address || !form.city || !form.date) {
      showToast("Please fill all required fields.", "error"); return;
    }
    const booking = {
      id: "#" + String(1000 + bookings.length + 1),
      uid: currentUser.uid,
      name: form.name, phone: form.phone, email: form.email,
      service: svc ? svc.name : form.service, serviceId: form.service,
      address: form.address, city: form.city, date: form.date, time: form.time,
      notes: form.notes, status: "Pending", assignedPro: "",
      visitCharge, createdAt: new Date().toISOString(),
    };
    const updated = [...bookings, booking];
    setBookings(updated);
    saveData(KEYS.bookings, updated);
    setDone(true);
    showToast("Booking confirmed! We'll call you shortly.", "success");
  }

  if (done) return (
    <section style={{ padding: "52px 24px" }}>
      <div style={{ textAlign: "center", padding: "40px 20px", maxWidth: 500, margin: "0 auto" }}>
        <div style={{ width: 72, height: 72, background: COLORS.acL, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 32, color: COLORS.ac }}>✓</div>
        <h2 style={{ fontFamily: "Lora,serif", fontSize: 24, marginBottom: 8 }}>Booking Confirmed!</h2>
        <p style={{ color: COLORS.muted, fontSize: 15, marginBottom: 6 }}>Thank you, <strong>{form.name}</strong>! Your <strong>{svc?.name}</strong> booking is received.</p>
        <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 24 }}>Our team will call you within 30 minutes to confirm your slot.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-outline" onClick={() => { setDone(false); setForm({ name: displayName, phone, email: currentUser?.email || "", service: "", address: "", city: "", date: "", time: TIME_SLOTS[0], notes: "" }); }}>+ Book Another</button>
        </div>
      </div>
    </section>
  );

  return (
    <section style={{ padding: "52px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.pr, letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 6 }}>Book a Service</div>
        <h2 style={{ fontFamily: "Lora,serif", fontSize: 30, fontWeight: 600 }}>Schedule your expert visit</h2>
      </div>
      <div className="booking-grid" style={{ maxWidth: 680, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>
        <div style={{ background: "#fff", border: `1px solid ${COLORS.bdr}`, borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontFamily: "Lora,serif", fontSize: 20, marginBottom: 20 }}>Fill in your details</h2>
          {!currentUser && (
            <div style={{ background: COLORS.warnL, border: `1px solid #FCD34D`, borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600, color: COLORS.warn, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              ⚠ Please <button onClick={onNeedAuth} style={{ background: "none", border: "none", color: COLORS.pr, fontWeight: 700, cursor: "pointer", fontSize: 13, padding: "0 3px" }}>sign in</button> to confirm a booking.
            </div>
          )}
          <div className="form-row-2">
            <div className="form-group"><label>Full Name *</label><input className="form-control" value={form.name} onChange={setF("name")} placeholder="Your full name" /></div>
            <div className="form-group"><label>Phone Number *</label><input className="form-control" value={form.phone} onChange={setF("phone")} placeholder="+91 XXXXX XXXXX" /></div>
          </div>
          <div className="form-group"><label>Email</label><input className="form-control" type="email" value={form.email} onChange={setF("email")} placeholder="you@example.com" /></div>
          <div className="form-group">
            <label>Service *</label>
            <select className="form-control" value={form.service} onChange={setF("service")}>
              <option value="">Select a service</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Full Address *</label><input className="form-control" value={form.address} onChange={setF("address")} placeholder="House no., Street, Locality" /></div>
          <div className="form-group">
            <label>City *</label>
            <select className="form-control" value={form.city} onChange={setF("city")}>
              <option value="">Select city</option>
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-row-2">
            <div className="form-group"><label>Preferred Date *</label><input className="form-control" type="date" value={form.date} min={today} onChange={setF("date")} /></div>
            <div className="form-group">
              <label>Time Slot *</label>
              <select className="form-control" value={form.time} onChange={setF("time")}>
                {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label>Additional Notes</label><textarea className="form-control" value={form.notes} onChange={setF("notes")} placeholder="Any specific requirements…" /></div>
          <button className="btn btn-primary" style={{ width: "100%", padding: 13, justifyContent: "center" }} onClick={submit}>✓ Confirm Booking</button>
        </div>
        <div style={{ background: "#fff", border: `1px solid ${COLORS.bdr}`, borderRadius: 16, padding: 18, position: "sticky", top: 80 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: COLORS.muted, textTransform: "uppercase", letterSpacing: ".5px" }}>Booking Summary</h4>
          {[["Service", svc?.name || "—"], ["City", form.city || "—"], ["Visit Charge", form.city ? `₹${visitCharge}` : "—"], ["Service From", svc ? formatPrice(svc) : "—"]].map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: `.5px solid ${COLORS.bdr}` }}>
              <span>{label}</span><span style={{ fontWeight: 700, color: COLORS.pr }}>{val}</span>
            </div>
          ))}
          <div style={{ marginTop: 14, background: COLORS.acL, borderRadius: 8, padding: "10px 12px" }}>
            <p style={{ fontSize: 12, color: COLORS.ac, fontWeight: 600 }}>🛡 Visit charge adjustable against final bill</p>
          </div>
          <div style={{ marginTop: 10, background: COLORS.prL, borderRadius: 8, padding: "10px 12px" }}>
            <p style={{ fontSize: 12, color: COLORS.pr, fontWeight: 600 }}>🕐 Same-day slots available</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CONTACT PAGE
   ============================================================ */
function ContactPage({ showToast }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "General Enquiry", msg: "" });
  const setF = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  function submit() {
    if (!form.name || !form.email || !form.msg) { showToast("Please fill all fields.", "error"); return; }
    setForm({ name: "", email: "", subject: "General Enquiry", msg: "" });
    showToast("Message sent! We'll reply within 2 hours.", "success");
  }
  return (
    <section style={{ padding: "52px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.pr, letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 6 }}>Contact Us</div>
        <h2 style={{ fontFamily: "Lora,serif", fontSize: 30, fontWeight: 600 }}>We're always here to help</h2>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[["📞","Call Us","+91 98765 43210","Mon–Sat, 7AM–9PM"],["✉","Email","hello@vtlineup.com","Reply within 2 hours"],["💬","WhatsApp","+91 98765 43210","Available 24/7"],["📍","We Serve","Delhi NCR · Mumbai · Bangalore · Hyderabad",""]].map(([icon,title,l1,l2]) => (
            <div key={title} style={{ background: "#fff", border: `1px solid ${COLORS.bdr}`, borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 24, color: COLORS.pr, width: 32, textAlign: "center" }}>{icon}</span>
              <div><h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{title}</h4><p style={{ fontSize: 13, color: COLORS.muted }}>{l1}</p>{l2 && <p style={{ fontSize: 11, color: COLORS.hint }}>{l2}</p>}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#fff", border: `1px solid ${COLORS.bdr}`, borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontFamily: "Lora,serif", fontSize: 18, marginBottom: 18 }}>Send a Message</h3>
          <div className="form-group"><label>Name</label><input className="form-control" value={form.name} onChange={setF("name")} placeholder="Your name" /></div>
          <div className="form-group"><label>Email</label><input className="form-control" type="email" value={form.email} onChange={setF("email")} placeholder="you@example.com" /></div>
          <div className="form-group"><label>Subject</label>
            <select className="form-control" value={form.subject} onChange={setF("subject")}>
              {["General Enquiry","Booking Issue","Professional Complaint","Become a Partner"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Message</label><textarea className="form-control" value={form.msg} onChange={setF("msg")} placeholder="Tell us how we can help…" style={{ height: 100 }} /></div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={submit}>✉ Send Message</button>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   ADMIN DASHBOARD
   ============================================================ */
function AdminDashboard({ bookings, professionals, kycQueue, setAdminPanel, onQuickApprove }) {
  const revenue = bookings.filter(b => b.status !== "Cancelled").reduce((a, b) => a + b.visitCharge, 0);
  const recent = bookings.slice(-5).reverse();
  const svcCounts = {};
  bookings.forEach(b => svcCounts[b.service] = (svcCounts[b.service] || 0) + 1);
  const maxC = Math.max(1, ...Object.values(svcCounts));
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 18 }}>
        {[["Total Bookings", bookings.length, "↑ All time", COLORS.ac],
          ["Active Professionals", professionals.filter(p => p.status === "Active").length, "Verified & live", COLORS.ac],
          ["Pending KYC", kycQueue.length, "Awaiting review", COLORS.danger],
          ["Est. Revenue", `₹${revenue.toLocaleString("en-IN")}`, "Based on bookings", COLORS.ac]].map(([label, num, delta, color]) => (
          <div key={label} className="card" style={{ padding: 16, cursor: "pointer" }} onClick={() => setAdminPanel(label.includes("Book") ? "bookings" : label.includes("Pro") ? "professionals" : label.includes("KYC") ? "onboarding" : "analytics")}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{num}</div>
            <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color }}>{delta}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div className="card">
          <div className="card-header"><h3>Recent Bookings</h3><button className="btn btn-ghost btn-sm" onClick={() => setAdminPanel("bookings")}>View all</button></div>
          <div style={{ overflowX: "auto" }}>
            <table className="tbl"><thead><tr><th>Customer</th><th>Service</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>{recent.length ? recent.map(b => <tr key={b.id}><td>{b.name}</td><td>{b.service}</td><td>{b.date}</td><td><Badge status={b.status} /></td></tr>) : <tr><td colSpan={4} style={{ textAlign: "center", color: COLORS.hint, padding: 20 }}>No bookings yet</td></tr>}</tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Pending Onboarding</h3><button className="btn btn-ghost btn-sm" onClick={() => setAdminPanel("onboarding")}>Review all</button></div>
          <div style={{ overflowX: "auto" }}>
            <table className="tbl"><thead><tr><th>Name</th><th>Service</th><th>KYC</th><th>Action</th></tr></thead>
              <tbody>{kycQueue.slice(0, 4).map(k => <tr key={k.id}><td>{k.name}</td><td>{k.service}</td><td><Badge status={k.kyc} /></td><td><button className="btn btn-success btn-sm" onClick={() => onQuickApprove(k.id)}>Approve</button></td></tr>)}{!kycQueue.length && <tr><td colSpan={4} style={{ textAlign: "center", color: COLORS.hint, padding: 20 }}>None pending</td></tr>}</tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Service Popularity</h3><span className="live-badge"><span className="live-dot" />Live data</span></div>
        <div className="card-body">
          {DEFAULT_SERVICES.map(s => { const c = svcCounts[s.name] || 0; return (
            <div key={s.id} className="analytics-bar-row">
              <span className="analytics-bar-label">{s.emoji} {s.name.split(" ")[0]}</span>
              <div className="analytics-bar-wrap"><div className="analytics-bar-fill" style={{ width: `${Math.round(c / maxC * 100)}%` }} /></div>
              <span className="analytics-bar-val">{c}</span>
            </div>
          ); })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ADMIN ONBOARDING
   ============================================================ */
function AdminOnboarding({ kycQueue, setKycQueue, professionals, setProfessionals, showToast }) {
  const [tab, setTab] = useState("new");
  const [form, setForm] = useState({ name: "", phone: "", email: "", dob: "", aadhar: "", pan: "", svc: "", exp: "", city: CITIES[0], addr: "" });
  const setF = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  function fmtAadhar(e) {
    let v = e.target.value.replace(/\D/g, "").substring(0, 12).replace(/(.{4})(.{0,4})(.{0,4})/, "$1 $2 $3").trim();
    setForm(p => ({ ...p, aadhar: v }));
  }
  function submit() {
    if (!form.name || !form.phone || !form.email || !form.dob || !form.aadhar || !form.pan || !form.svc) { showToast("Please fill all required fields.", "error"); return; }
    if (form.aadhar.replace(/\s/g, "").length < 12) { showToast("Enter a valid 12-digit Aadhaar number.", "error"); return; }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan.toUpperCase())) { showToast("Enter a valid PAN number (e.g. ABCDE1234F).", "error"); return; }
    const entry = { id: "k" + Date.now(), name: form.name, initials: getInitials(form.name), service: form.svc, city: form.city, phone: form.phone, dob: form.dob, aadhar: form.aadhar, pan: form.pan.toUpperCase(), email: form.email, kyc: "Pending", submitted: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) };
    const updated = [...kycQueue, entry]; setKycQueue(updated); saveData(KEYS.kyc, updated);
    setForm({ name: "", phone: "", email: "", dob: "", aadhar: "", pan: "", svc: "", exp: "", city: CITIES[0], addr: "" });
    showToast(`${form.name} submitted for KYC review.`, "success"); setTab("review");
  }
  function approve(id) {
    const k = kycQueue.find(x => x.id === id); if (!k) return;
    const newPro = { id: Date.now(), name: k.name, initials: k.initials, service: k.service, city: k.city, phone: k.phone, dob: k.dob, aadhar: k.aadhar, pan: k.pan, email: k.email, rating: 5.0, jobs: 0, kyc: "Verified", status: "Active", exp: 0 };
    const updatedPros = [...professionals, newPro]; const updatedKyc = kycQueue.filter(x => x.id !== id);
    setProfessionals(updatedPros); setKycQueue(updatedKyc); saveData(KEYS.pros, updatedPros); saveData(KEYS.kyc, updatedKyc);
    showToast(`${k.name} approved and now live!`, "success");
  }
  function reject(id) {
    const k = kycQueue.find(x => x.id === id);
    const updated = kycQueue.filter(x => x.id !== id); setKycQueue(updated); saveData(KEYS.kyc, updated);
    showToast(`${k?.name}'s application rejected.`, "warn");
  }
  return (
    <div>
      <div className="tabs">
        <button className={`tab-btn ${tab === "new" ? "active" : ""}`} onClick={() => setTab("new")}>New Application</button>
        <button className={`tab-btn ${tab === "review" ? "active" : ""}`} onClick={() => setTab("review")}>Review KYC ({kycQueue.length})</button>
      </div>
      {tab === "new" && (
        <div className="card">
          <div className="card-header"><h3>Professional Onboarding Form</h3><span style={{ fontSize: 13, color: COLORS.muted }}>Fields marked <span style={{ color: COLORS.pr }}>*</span> are required</span></div>
          <div className="card-body">
            <div className="form-row-2">
              <div className="form-group"><label>Full Name *</label><input className="form-control" value={form.name} onChange={setF("name")} placeholder="Full legal name" /></div>
              <div className="form-group"><label>Phone *</label><input className="form-control" value={form.phone} onChange={setF("phone")} placeholder="+91 XXXXX XXXXX" /></div>
            </div>
            <div className="form-row-2">
              <div className="form-group"><label>Email *</label><input className="form-control" type="email" value={form.email} onChange={setF("email")} placeholder="professional@email.com" /></div>
              <div className="form-group"><label>Date of Birth *</label><input className="form-control" type="date" value={form.dob} onChange={setF("dob")} /></div>
            </div>
            <div className="form-row-2">
              <div className="form-group"><label>Aadhaar Number *</label><input className="form-control" value={form.aadhar} onChange={fmtAadhar} placeholder="XXXX XXXX XXXX" maxLength={14} /></div>
              <div className="form-group"><label>PAN Card Number *</label><input className="form-control" value={form.pan} onChange={setF("pan")} placeholder="ABCDE1234F" maxLength={10} style={{ textTransform: "uppercase" }} /></div>
            </div>
            <div className="form-row-3">
              <div className="form-group"><label>Service Category *</label>
                <select className="form-control" value={form.svc} onChange={setF("svc")}><option value="">Select service</option>{SERVICE_NAMES.map(s => <option key={s}>{s}</option>)}</select>
              </div>
              <div className="form-group"><label>Years of Experience</label><input className="form-control" type="number" value={form.exp} onChange={setF("exp")} placeholder="e.g. 5" min={0} max={50} /></div>
              <div className="form-group"><label>City *</label>
                <select className="form-control" value={form.city} onChange={setF("city")}>{CITIES.map(c => <option key={c}>{c}</option>)}</select>
              </div>
            </div>
            <div className="form-group"><label>Residential Address</label><textarea className="form-control" value={form.addr} onChange={setF("addr")} placeholder="Full address with PIN code" /></div>
            <div className="form-row-2">
              {["Aadhaar Card Upload","PAN Card Upload"].map(l => (
                <div className="form-group" key={l}><label>{l}</label>
                  <div className="upload-box"><span style={{ fontSize: 22, color: COLORS.muted, display: "block", marginBottom: 4 }}>⬆</span><p style={{ fontSize: 12, color: COLORS.muted }}>Click to upload (PDF / JPG)</p></div>
                </div>
              ))}
            </div>
            <hr style={{ border: "none", borderTop: `.5px solid ${COLORS.bdr}`, margin: "20px 0" }} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setForm({ name: "", phone: "", email: "", dob: "", aadhar: "", pan: "", svc: "", exp: "", city: CITIES[0], addr: "" })}>✕ Clear</button>
              <button className="btn btn-primary" onClick={submit}>✓ Submit & Onboard</button>
            </div>
          </div>
        </div>
      )}
      {tab === "review" && (
        <div>
          {!kycQueue.length
            ? <div className="notif-success-banner">✓ All professionals have been reviewed.</div>
            : kycQueue.map(k => (
              <div key={k.id} className="pro-card">
                <div className="avatar avatar-md avatar-pr">{k.initials}</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{k.name} <Badge status={k.kyc} /></h4>
                  <p style={{ fontSize: 12, color: COLORS.muted }}>{k.service} · {k.city} · {k.phone}</p>
                  <p style={{ fontSize: 11, color: COLORS.hint, marginTop: 4 }}>Aadhaar: {k.aadhar} | PAN: {k.pan} | Submitted: {k.submitted}</p>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-success btn-sm" onClick={() => approve(k.id)}>✓ Approve</button>
                  <button className="btn btn-danger btn-sm" onClick={() => reject(k.id)}>✕ Reject</button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ADMIN PROFESSIONALS
   ============================================================ */
function AdminProfessionals({ professionals, setProfessionals, showToast, setAdminPanel }) {
  const [search, setSearch] = useState(""); const [svcFilter, setSvcFilter] = useState(""); const [editPro, setEditPro] = useState(null);
  const list = professionals.filter(p => (!search || p.name.toLowerCase().includes(search.toLowerCase())) && (!svcFilter || p.service === svcFilter));
  function toggleStatus(id) {
    const updated = professionals.map(p => p.id === id ? { ...p, status: p.status === "Active" ? "Inactive" : "Active" } : p);
    setProfessionals(updated); saveData(KEYS.pros, updated);
    const p = professionals.find(x => x.id === id); showToast(`${p.name} set to ${p.status === "Active" ? "Inactive" : "Active"}.`, "success");
  }
  function saveEdit() {
    const updated = professionals.map(p => p.id === editPro.id ? { ...editPro, initials: getInitials(editPro.name) } : p);
    setProfessionals(updated); saveData(KEYS.pros, updated); setEditPro(null); showToast("Professional updated.", "success");
  }
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3>All Professionals</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="form-control" style={{ width: 180, padding: "6px 10px", fontSize: 12 }} placeholder="Search by name…" value={search} onChange={e => setSearch(e.target.value)} />
            <select className="form-control" style={{ width: 140, padding: "6px 10px", fontSize: 12 }} value={svcFilter} onChange={e => setSvcFilter(e.target.value)}>
              <option value="">All Services</option>{SERVICE_NAMES.map(s => <option key={s}>{s}</option>)}
            </select>
            <button className="btn btn-primary btn-sm" onClick={() => setAdminPanel("onboarding")}>+ Add New</button>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead><tr><th>Professional</th><th>Service</th><th>City</th><th>Rating</th><th>Jobs</th><th>KYC</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {list.length ? list.map(p => (
                <tr key={p.id}>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div className="avatar avatar-sm avatar-pr">{p.initials || getInitials(p.name)}</div><div><div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div><div style={{ fontSize: 11, color: COLORS.muted }}>{p.email}</div></div></div></td>
                  <td>{p.service}</td><td>{p.city}</td>
                  <td style={{ color: "#F59E0B", fontWeight: 700 }}>{p.rating}★</td><td>{p.jobs}</td>
                  <td><Badge status={p.kyc} /></td><td><Badge status={p.status} /></td>
                  <td><div style={{ display: "flex", gap: 4 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditPro({ ...p })}>✏</button>
                    <button className="btn btn-danger btn-sm" onClick={() => toggleStatus(p.id)}>⊘</button>
                  </div></td>
                </tr>
              )) : <tr><td colSpan={8} style={{ textAlign: "center", color: COLORS.hint, padding: 20 }}>No professionals found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {editPro && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditPro(null)}>
          <div className="modal">
            <div className="modal-header"><h3>Edit Professional</h3><button onClick={() => setEditPro(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: COLORS.muted }}>✕</button></div>
            <div className="modal-body">
              <div className="form-row-2">
                <div className="form-group"><label>Name</label><input className="form-control" value={editPro.name} onChange={e => setEditPro(p => ({ ...p, name: e.target.value }))} /></div>
                <div className="form-group"><label>Phone</label><input className="form-control" value={editPro.phone} onChange={e => setEditPro(p => ({ ...p, phone: e.target.value }))} /></div>
              </div>
              <div className="form-row-2">
                <div className="form-group"><label>Service</label><select className="form-control" value={editPro.service} onChange={e => setEditPro(p => ({ ...p, service: e.target.value }))}>{SERVICE_NAMES.map(s => <option key={s}>{s}</option>)}</select></div>
                <div className="form-group"><label>City</label><select className="form-control" value={editPro.city} onChange={e => setEditPro(p => ({ ...p, city: e.target.value }))}>{CITIES.map(c => <option key={c}>{c}</option>)}</select></div>
              </div>
              <div className="form-row-2">
                <div className="form-group"><label>Status</label><select className="form-control" value={editPro.status} onChange={e => setEditPro(p => ({ ...p, status: e.target.value }))}>{["Active","Inactive","Suspended"].map(s => <option key={s}>{s}</option>)}</select></div>
                <div className="form-group"><label>KYC Status</label><select className="form-control" value={editPro.kyc} onChange={e => setEditPro(p => ({ ...p, kyc: e.target.value }))}>{["Verified","Pending","Rejected"].map(s => <option key={s}>{s}</option>)}</select></div>
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setEditPro(null)}>Cancel</button><button className="btn btn-primary" onClick={saveEdit}>✓ Save Changes</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ADMIN PRICING
   ============================================================ */
function AdminPricing({ services, setServices, showToast }) {
  const [prices, setPrices] = useState(() => services.map(s => s.price));
  const [saved, setSaved] = useState(false);
  function save() {
    const updated = services.map((s, i) => ({ ...s, price: s.unit === "custom" ? 0 : parseInt(prices[i]) || 0 }));
    setServices(updated); saveData(KEYS.prices, updated.map(s => ({ id: s.id, price: s.price })));
    setSaved(true); setTimeout(() => setSaved(false), 3500); showToast("Prices updated and live!", "success");
  }
  function reset() {
    setPrices(DEFAULT_SERVICES.map(s => s.price));
    setServices(services.map((s, i) => ({ ...s, price: DEFAULT_SERVICES[i].price })));
    saveData(KEYS.prices, DEFAULT_SERVICES.map(s => ({ id: s.id, price: s.price })));
    showToast("Prices reset to defaults.", "success");
  }
  return (
    <div>
      {saved && <div className="notif-success-banner">✓ Changes saved and live on website immediately.</div>}
      <div className="card">
        <div className="card-header"><h3>Service Price Management</h3><span className="live-badge"><span className="live-dot" />Reflects instantly</span></div>
        <div className="card-body">
          {services.map((s, i) => (
            <div key={s.id} className="price-item">
              <div className="price-icon" style={{ background: s.color }}>{s.emoji}</div>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{s.name}</span>
              <span style={{ fontSize: 12, color: COLORS.muted, width: 60 }}>{s.unit !== "custom" ? "₹" : ""}</span>
              {s.unit === "custom" ? <input className="price-input" value="Custom" readOnly style={{ width: 120 }} /> : <input className="price-input" type="number" value={prices[i]} min={0} onChange={e => setPrices(p => { const n = [...p]; n[i] = e.target.value; return n; })} />}
              <span style={{ fontSize: 12, color: COLORS.muted, width: 60 }}>{s.unit}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14, gap: 10 }}>
        <button className="btn btn-ghost" onClick={reset}>↺ Reset to Default</button>
        <button className="btn btn-primary" onClick={save}>💾 Save & Publish Prices</button>
      </div>
    </div>
  );
}

/* ============================================================
   ADMIN VISIT CHARGES
   ============================================================ */
function AdminVisitCharges({ visitCharges, setVisitCharges, showToast }) {
  const [charges, setCharges] = useState(visitCharges);
  const [saved, setSaved] = useState(false);
  function save() {
    setVisitCharges(charges); saveData(KEYS.visits, charges);
    setSaved(true); setTimeout(() => setSaved(false), 3500); showToast("Visit charges saved.", "success");
  }
  const cityMeta = { "Delhi NCR": ["🏙️","#FFF0E8"], Mumbai: ["🌊","#E8F0FF"], Bangalore: ["🌿","#E8F5EF"], Hyderabad: ["⭐","#FFFBE8"] };
  return (
    <div>
      {saved && <div className="notif-success-banner">✓ Visit charges updated and applied to all new bookings.</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="card">
          <div className="card-header"><h3>City-wise Visit Charges</h3></div>
          <div className="card-body">
            <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 12 }}>Charged when a professional visits for inspection before work begins.</p>
            {CITIES.map(city => (
              <div key={city} className="price-item">
                <div className="price-icon" style={{ background: cityMeta[city][1] }}>{cityMeta[city][0]}</div>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{city}</span>
                <span style={{ fontSize: 12, color: COLORS.muted, width: 30 }}>₹</span>
                <input className="price-input" type="number" value={charges[city] || ""} min={0} onChange={e => setCharges(p => ({ ...p, [city]: parseInt(e.target.value) || 0 }))} />
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Visit Charge Rules</h3></div>
          <div className="card-body">
            {[["Waive charge if job value exceeds ₹","1000"],["Emergency visit surcharge (%)","50"],["Weekend surcharge (%)","20"],["Free revisit within (days)","7"]].map(([label, def]) => (
              <div className="form-group" key={label}><label>{label}</label><input className="form-control" type="number" defaultValue={def} /></div>
            ))}
            <div className="form-group"><label>Charge refundable on booking?</label>
              <select className="form-control"><option value="yes">Yes — deducted from final bill</option><option value="no">No — non-refundable</option></select>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
        <button className="btn btn-primary" onClick={save}>💾 Save Visit Charges</button>
      </div>
    </div>
  );
}

/* ============================================================
   ADMIN BOOKINGS
   ============================================================ */
function AdminBookings({ bookings, setBookings, professionals, showToast }) {
  const [statusFilter, setStatusFilter] = useState(""); const [viewIdx, setViewIdx] = useState(null);
  const activePros = professionals.filter(p => p.status === "Active");
  let list = (statusFilter ? bookings.filter(b => b.status === statusFilter) : bookings).slice().reverse();

  function assignPro(origIdx, name) {
    const updated = bookings.map((b, i) => i === origIdx ? { ...b, assignedPro: name, status: name && b.status === "Pending" ? "Confirmed" : b.status } : b);
    setBookings(updated); saveData(KEYS.bookings, updated); if (name) showToast(`${name} assigned.`, "success");
  }
  function updateStatus(origIdx, status) {
    const updated = bookings.map((b, i) => i === origIdx ? { ...b, status } : b);
    setBookings(updated); saveData(KEYS.bookings, updated); showToast(`Booking marked as ${status}.`, "success"); setViewIdx(null);
  }
  function exportCSV() {
    const headers = ["ID","Customer","Phone","Email","Service","Date","Time","City","Visit ₹","Status"];
    const rows = bookings.map(b => [b.id,b.name,b.phone,b.email,b.service,b.date,b.time,b.city,b.visitCharge,b.status]);
    const csv = [headers,...rows].map(r => r.map(v => `"${(v||"").toString().replace(/"/g,'""')}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv); a.download = "vtlineup_bookings.csv"; a.click();
    showToast("Exported as CSV.", "success");
  }
  const vb = viewIdx !== null ? bookings[viewIdx] : null;
  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-header">
          <h3>All Bookings</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select className="form-control" style={{ width: 140, padding: "6px 10px", fontSize: 12 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>{["Pending","Confirmed","Completed","Cancelled"].map(s => <option key={s}>{s}</option>)}
            </select>
            <button className="btn btn-ghost btn-sm" onClick={exportCSV}>⬇ Export CSV</button>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead><tr><th>#</th><th>Customer</th><th>Service</th><th>Date & Time</th><th>City</th><th>Visit ₹</th><th>Assign Pro</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {list.length ? list.map((b, ri) => {
                const origIdx = bookings.length - 1 - ri;
                return (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 700, color: COLORS.pr }}>{b.id}</td>
                    <td><div style={{ fontWeight: 700 }}>{b.name}</div><div style={{ fontSize: 11, color: COLORS.muted }}>{b.phone}</div></td>
                    <td>{b.service}</td>
                    <td>{b.date}<div style={{ fontSize: 11, color: COLORS.muted }}>{b.time}</div></td>
                    <td>{b.city}</td><td style={{ fontWeight: 700 }}>₹{b.visitCharge}</td>
                    <td>
                      <select style={{ border: `1.5px solid ${COLORS.bdr}`, borderRadius: 8, padding: "5px 8px", fontFamily: "Nunito,sans-serif", fontSize: 12, fontWeight: 600, background: "#fff", outline: "none", cursor: "pointer" }} value={b.assignedPro || ""} onChange={e => assignPro(origIdx, e.target.value)}>
                        <option value="">Unassigned</option>{activePros.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                      </select>
                    </td>
                    <td><Badge status={b.status} /></td>
                    <td><div style={{ display: "flex", gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setViewIdx(origIdx)}>👁</button>
                      {b.status === "Pending" && <button className="btn btn-success btn-sm" onClick={() => updateStatus(origIdx, "Confirmed")}>✓</button>}
                    </div></td>
                  </tr>
                );
              }) : <tr><td colSpan={9} style={{ textAlign: "center", color: COLORS.hint, padding: 30 }}>No bookings found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {vb && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewIdx(null)}>
          <div className="modal">
            <div className="modal-header"><h3>Booking Details</h3><button onClick={() => setViewIdx(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: COLORS.muted }}>✕</button></div>
            <div className="modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                {[["BOOKING ID", vb.id, COLORS.pr],["STATUS",null,null],["CUSTOMER",vb.name,null],["PHONE",vb.phone,null],["SERVICE",vb.service,null],["CITY",vb.city,null],["DATE & TIME",`${vb.date} · ${vb.time}`,null],["VISIT CHARGE",`₹${vb.visitCharge}`,COLORS.ac]].map(([label,val,color]) => (
                  <div key={label}><label style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700 }}>{label}</label>
                    {label === "STATUS" ? <p><Badge status={vb.status} /></p> : <p style={{ fontWeight: 700, color: color || COLORS.text }}>{val}</p>}
                  </div>
                ))}
                <div style={{ gridColumn: "1/-1" }}><label style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700 }}>ADDRESS</label><p>{vb.address}</p></div>
                {vb.notes && <div style={{ gridColumn: "1/-1" }}><label style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700 }}>NOTES</label><p>{vb.notes}</p></div>}
                <div><label style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700 }}>ASSIGNED PRO</label><p>{vb.assignedPro || <span style={{ color: COLORS.pr }}>Unassigned</span>}</p></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setViewIdx(null)}>Close</button>
              <button className="btn btn-danger btn-sm" onClick={() => updateStatus(viewIdx, "Cancelled")}>Cancel Booking</button>
              <button className="btn btn-primary" onClick={() => updateStatus(viewIdx, "Completed")}>Mark Completed</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ADMIN ANALYTICS
   ============================================================ */
function AdminAnalytics({ bookings, professionals, services }) {
  const revenue = bookings.filter(b => b.status !== "Cancelled").reduce((a, b) => {
    const svc = services.find(s => s.name === b.service); return a + (svc ? svc.price : 0) + b.visitCharge;
  }, 0);
  const avgVal = bookings.length ? Math.round(revenue / bookings.length) : 0;
  const svcCounts = {}; bookings.forEach(b => svcCounts[b.service] = (svcCounts[b.service] || 0) + 1);
  const topSvc = Object.entries(svcCounts).sort((a, b) => b[1] - a[1])[0];
  const maxC = Math.max(1, ...Object.values(svcCounts));
  const cityCounts = {}; bookings.forEach(b => cityCounts[b.city] = (cityCounts[b.city] || 0) + 1);
  const maxC2 = Math.max(1, ...Object.values(cityCounts));
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 18 }}>
        {[["Total Revenue",`₹${revenue.toLocaleString("en-IN")}`],["Avg Booking Value",`₹${avgVal.toLocaleString("en-IN")}`],["Most Booked",topSvc?topSvc[0]:"—"],["Satisfaction","4.9★"]].map(([label,num]) => (
          <div key={label} className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: num.length > 6 ? 16 : 24, fontWeight: 800, lineHeight: 1 }}>{num}</div>
            <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: COLORS.ac }}>This month</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div className="card"><div className="card-header"><h3>Bookings by Service</h3></div>
          <div className="card-body">{services.map(s => { const c = svcCounts[s.name] || 0; return (
            <div key={s.id} className="analytics-bar-row">
              <span className="analytics-bar-label">{s.emoji} {s.name.split(" ")[0]}</span>
              <div className="analytics-bar-wrap"><div className="analytics-bar-fill" style={{ width: `${Math.round(c/maxC*100)}%` }} /></div>
              <span className="analytics-bar-val">{c}</span>
            </div>); })}</div>
        </div>
        <div className="card"><div className="card-header"><h3>Bookings by City</h3></div>
          <div className="card-body">{CITIES.map(city => { const c = cityCounts[city] || 0; return (
            <div key={city} className="analytics-bar-row">
              <span className="analytics-bar-label">{city}</span>
              <div className="analytics-bar-wrap"><div className="analytics-bar-fill" style={{ width: `${Math.round(c/maxC2*100)}%`, background: COLORS.ac }} /></div>
              <span className="analytics-bar-val">{c}</span>
            </div>); })}</div>
        </div>
      </div>
      <div className="card"><div className="card-header"><h3>Professional Performance</h3></div>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl"><thead><tr><th>Professional</th><th>Service</th><th>Jobs</th><th>Rating</th><th>Status</th></tr></thead>
            <tbody>{professionals.length ? professionals.map(p => {
              const jobs = bookings.filter(b => b.assignedPro === p.name).length;
              return <tr key={p.id}><td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div className="avatar avatar-sm avatar-pr">{p.initials || getInitials(p.name)}</div><span style={{ fontWeight: 700 }}>{p.name}</span></div></td><td>{p.service}</td><td style={{ fontWeight: 700 }}>{jobs}</td><td style={{ color: "#F59E0B", fontWeight: 700 }}>{p.rating}★</td><td><Badge status={p.status} /></td></tr>;
            }) : <tr><td colSpan={5} style={{ textAlign: "center", color: COLORS.hint, padding: 20 }}>No professionals yet.</td></tr>}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ADMIN SHELL
   ============================================================ */
function AdminShell({ adminUser, onClose, bookings, setBookings, professionals, setProfessionals, kycQueue, setKycQueue, services, setServices, visitCharges, setVisitCharges, showToast }) {
  const adminName = adminUser?.displayName || "Vijay Chaudhary";
  const adminEmail = adminUser?.email || ADMIN_EMAIL;
  const [panel, setPanel] = useState("dashboard");
  const navItems = [
    { group: "Overview",       items: [{ id: "dashboard",     icon: "🗂",  label: "Dashboard" }] },
    { group: "Professionals",  items: [{ id: "onboarding",    icon: "👤+", label: "Onboarding",        badge: kycQueue.length }, { id: "professionals", icon: "👥", label: "All Professionals" }] },
    { group: "Pricing",        items: [{ id: "pricing",       icon: "🏷",  label: "Service Prices" },  { id: "visit", icon: "🛵", label: "Visit Charges" }] },
    { group: "Operations",     items: [{ id: "bookings",      icon: "📅",  label: "Bookings",          badge: bookings.filter(b => b.status === "Pending").length }, { id: "analytics", icon: "📊", label: "Analytics" }] },
  ];
  const titles = { dashboard: "Dashboard", onboarding: "Professional Onboarding", professionals: "All Professionals", pricing: "Service Price Management", visit: "Visit Charges", bookings: "Bookings", analytics: "Analytics" };

  function quickApprove(id) {
    const k = kycQueue.find(x => x.id === id); if (!k) return;
    const newPro = { id: Date.now(), name: k.name, initials: k.initials, service: k.service, city: k.city, phone: k.phone, email: k.email, rating: 5.0, jobs: 0, kyc: "Verified", status: "Active", exp: 0 };
    const updPros = [...professionals, newPro]; const updKyc = kycQueue.filter(x => x.id !== id);
    setProfessionals(updPros); setKycQueue(updKyc); saveData(KEYS.pros, updPros); saveData(KEYS.kyc, updKyc);
    showToast(`${k.name} approved and now live!`, "success");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F0EBE3" }}>
      <aside style={{ width: 220, background: COLORS.sidebar, flexShrink: 0, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ padding: "16px 14px", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ color: COLORS.pr, fontSize: 20 }}>🏠</span>
          <div><span style={{ display: "block", fontFamily: "Lora,serif", fontSize: 15, fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>VTlineup</span><small style={{ fontSize: 10, color: COLORS.sidebarT, letterSpacing: ".5px" }}>ADMIN PANEL</small></div>
        </div>
        {navItems.map(({ group, items }) => (
          <div key={group}>
            <div style={{ padding: "10px 14px 4px", fontSize: 10, fontWeight: 700, color: "rgba(196,168,130,.5)", letterSpacing: ".8px", textTransform: "uppercase" }}>{group}</div>
            {items.map(({ id, icon, label, badge }) => (
              <div key={id} onClick={() => setPanel(id)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", margin: "1px 8px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: panel===id ? "#fff" : COLORS.sidebarT, background: panel===id ? COLORS.pr : "transparent", cursor: "pointer", transition: ".15s" }}
                onMouseEnter={e => { if (panel!==id) e.currentTarget.style.background="rgba(255,255,255,.07)"; }}
                onMouseLeave={e => { if (panel!==id) e.currentTarget.style.background="transparent"; }}>
                <span style={{ fontSize: 15, width: 18 }}>{icon}</span><span>{label}</span>
                {badge > 0 && <span style={{ marginLeft: "auto", background: "rgba(255,255,255,.2)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 8 }}>{badge}</span>}
              </div>
            ))}
          </div>
        ))}
        <div style={{ marginTop: "auto", padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div className="avatar avatar-sm avatar-pr" style={{ background: COLORS.pr, color: "#fff" }}>VC</div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", display: "block" }}>{adminName}</span>
              <small style={{ fontSize: 10, color: COLORS.sidebarT }}>{adminEmail}</small>
            </div>
          </div>
          <button onClick={onClose} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,.05)", color: COLORS.sidebarT, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", transition: ".15s" }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(220,38,38,.2)"; e.currentTarget.style.color="#FCA5A5"; }}
            onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.05)"; e.currentTarget.style.color=COLORS.sidebarT; }}>
            🔐 Sign Out of Admin
          </button>
        </div>
      </aside>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ background: "#fff", borderBottom: `1px solid ${COLORS.bdr}`, padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{titles[panel]}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a onClick={onClose} style={{ fontSize: 12, color: COLORS.pr, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: `1px solid ${COLORS.bdr}`, fontWeight: 600 }}>↗ View Website</a>
            <div className="avatar avatar-sm" style={{ background: COLORS.pr, color: "#fff", fontSize: 12, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>VC</div>
          </div>
        </div>
        <div style={{ padding: 20, flex: 1 }}>
          {panel === "dashboard"     && <AdminDashboard bookings={bookings} professionals={professionals} kycQueue={kycQueue} setAdminPanel={setPanel} onQuickApprove={quickApprove} />}
          {panel === "onboarding"    && <AdminOnboarding kycQueue={kycQueue} setKycQueue={setKycQueue} professionals={professionals} setProfessionals={setProfessionals} showToast={showToast} />}
          {panel === "professionals" && <AdminProfessionals professionals={professionals} setProfessionals={setProfessionals} showToast={showToast} setAdminPanel={setPanel} />}
          {panel === "pricing"       && <AdminPricing services={services} setServices={setServices} showToast={showToast} />}
          {panel === "visit"         && <AdminVisitCharges visitCharges={visitCharges} setVisitCharges={setVisitCharges} showToast={showToast} />}
          {panel === "bookings"      && <AdminBookings bookings={bookings} setBookings={setBookings} professionals={professionals} showToast={showToast} />}
          {panel === "analytics"     && <AdminAnalytics bookings={bookings} professionals={professionals} services={services} />}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ADMIN CONFIG — only this email can access admin
   ============================================================ */
const ADMIN_EMAIL = "vijay.chaudharycsc@gmail.com";
const ADMIN_PASSWORD = "Vijay$1999$";

/* ============================================================
   ADMIN LOGIN GATE
   ============================================================ */
function AdminLoginGate({ onSuccess, onBack }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [shake, setShake]       = useState(false);

  async function handleLogin(e) {
    e && e.preventDefault();
    setError("");
    if (!email.trim() || !password) { setError("Please enter your email and password."); return; }

    setLoading(true);
    try {
      // Sign in with Firebase using the provided credentials
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const signedInEmail = (cred.user.email || "").toLowerCase().trim();

      // Strict check — only the admin email is allowed through
      if (signedInEmail !== ADMIN_EMAIL.toLowerCase()) {
        // Sign them back out immediately
        await firebaseSignOut(auth);
        triggerShake();
        setError("Access denied. This email is not authorised to access the admin panel.");
        setLoading(false);
        return;
      }
      // ✅ Authorised admin
      onSuccess(cred.user);
    } catch (err) {
      triggerShake();
      setError(friendlyAuthError(err.code));
    } finally {
      setLoading(false);
    }
  }

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(135deg, ${COLORS.sidebar} 0%, #2C1F14 100%)`,
      fontFamily: "Nunito,sans-serif", padding: 16,
    }}>
      {/* Decorative background blobs */}
      <div style={{ position: "fixed", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: `${COLORS.pr}18`, pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -60, left: -60, width: 260, height: 260, borderRadius: "50%", background: `${COLORS.ac}14`, pointerEvents: "none" }} />

      <div style={{
        width: "100%", maxWidth: 400, position: "relative", zIndex: 1,
        animation: shake ? "adminShake .5s ease" : "adminFadeIn .4s ease",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: COLORS.pr, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 12px", boxShadow: `0 8px 24px ${COLORS.pr}55` }}>
            🏠
          </div>
          <h1 style={{ fontFamily: "Lora,serif", fontSize: 22, fontWeight: 600, color: "#fff", marginBottom: 4 }}>VTlineup Admin</h1>
          <p style={{ fontSize: 13, color: COLORS.sidebarT }}>Authorised personnel only</p>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "28px 28px 24px", boxShadow: "0 24px 64px rgba(0,0,0,.35)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
            <div style={{ width: 3, height: 20, borderRadius: 2, background: COLORS.pr }} />
            <h2 style={{ fontSize: 16, fontWeight: 800, color: COLORS.text }}>Admin Sign In</h2>
          </div>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="form-group">
              <label>Admin Email</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: COLORS.hint, pointerEvents: "none" }}>✉</span>
                <input
                  className="form-control"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  placeholder="admin@example.com"
                  style={{ paddingLeft: 34 }}
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: 6 }}>
              <label>Password</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: COLORS.hint, pointerEvents: "none" }}>🔒</span>
                <input
                  className="form-control"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter your password"
                  style={{ paddingLeft: 34, paddingRight: 40 }}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: COLORS.hint, padding: 2 }}>
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div style={{ background: COLORS.dangerL, border: `1px solid #FECACA`, borderRadius: 8, padding: "9px 12px", fontSize: 12, fontWeight: 700, color: COLORS.danger, marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 6 }}>
                <span style={{ flexShrink: 0 }}>⚠</span> {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: "100%", justifyContent: "center", padding: "12px 18px", fontSize: 14, marginTop: 8, borderRadius: 12 }}>
              {loading ? <><span className="spinner" /> Verifying…</> : "🔐 Sign In to Admin"}
            </button>
          </form>

          {/* Security notice */}
          <div style={{ marginTop: 16, padding: "10px 12px", background: "#F5F0EA", borderRadius: 10, display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>🛡</span>
            <p style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.5 }}>
              This panel is restricted to authorised administrators only. Unauthorised access attempts are logged.
            </p>
          </div>
        </div>

        {/* Back link */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: COLORS.sidebarT, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Nunito,sans-serif", fontWeight: 600 }}>
            ← Back to Website
          </button>
        </div>
      </div>

      {/* Keyframe animations injected inline */}
      <style>{`
        @keyframes adminFadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes adminShake  { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
      `}</style>
    </div>
  );
}

/* ============================================================
   ROOT APP
   ============================================================ */
export default function App() {
  // "site" | "admin-login" | "admin"
  const [view, setView]   = useState("site");
  const [page, setPage]   = useState("home");
  const [authModal, setAuthModal] = useState(null); // null | "signin" | "signup"

  // Firebase auth state — single source of truth for currentUser
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady]     = useState(false);
  // Separate state for the verified admin user
  const [adminUser, setAdminUser]     = useState(null);

  // App data
  const [services, setServices]           = useState(() => {
    const stored = loadData(KEYS.prices, null);
    if (stored && Array.isArray(stored) && stored.length === DEFAULT_SERVICES.length)
      return DEFAULT_SERVICES.map((s, i) => ({ ...s, price: stored[i]?.price ?? s.price }));
    return JSON.parse(JSON.stringify(DEFAULT_SERVICES));
  });
  const [visitCharges, setVisitCharges]   = useState(() => loadData(KEYS.visits, DEFAULT_VISIT_CHARGES));
  const [professionals, setProfessionals] = useState(() => loadData(KEYS.pros, DEFAULT_PROS));
  const [bookings, setBookings]           = useState(() => loadData(KEYS.bookings, []));
  const [kycQueue, setKycQueue]           = useState(() => loadData(KEYS.kyc, DEFAULT_KYC));
  const [toasts, setToasts]               = useState([]);

  // Inject global CSS once
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Listen to Firebase auth state changes (for regular site users)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      // If the signed-in user is the admin, don't treat them as a site user
      if (user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        // Keep currentUser null for site — admin is tracked separately
        setCurrentUser(null);
      } else {
        setCurrentUser(user);
      }
      setAuthReady(true);
    });
    return unsub;
  }, []);

  const showToast = useCallback((msg, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  async function handleSignOut() {
    await firebaseSignOut(auth);
    showToast("Signed out successfully.", "success");
  }

  async function handleAdminLogout() {
    await firebaseSignOut(auth);
    setAdminUser(null);
    setView("site");
    showToast("Signed out of admin panel.", "success");
  }

  function handleAdminLoginSuccess(user) {
    setAdminUser(user);
    setView("admin");
    showToast(`Welcome back, Vijay! 👋`, "success");
  }

  // When admin clicks ⚙ Admin in the nav
  function openAdmin() {
    // If already authenticated as admin, go straight in
    if (adminUser) { setView("admin"); return; }
    setView("admin-login");
  }

  function navTo(p) { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }

  // Splash while Firebase resolves initial auth state
  if (!authReady) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.bg, fontFamily: "Nunito,sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
          <div style={{ fontFamily: "Lora,serif", fontSize: 22, color: COLORS.pr, fontWeight: 600, marginBottom: 16 }}>VTlineup</div>
          <span className="spinner spinner-dark" style={{ width: 24, height: 24, borderWidth: 3 }} />
        </div>
      </div>
    );
  }

  // ── Admin Login Gate ──────────────────────────────────────
  if (view === "admin-login") {
    return (
      <>
        <ToastContainer toasts={toasts} />
        <AdminLoginGate
          onSuccess={handleAdminLoginSuccess}
          onBack={() => setView("site")}
        />
      </>
    );
  }

  // ── Admin Panel (only reachable after gate) ───────────────
  if (view === "admin") {
    if (!adminUser) { setView("admin-login"); return null; }
    return (
      <>
        <ToastContainer toasts={toasts} />
        <AdminShell
          adminUser={adminUser}
          onClose={handleAdminLogout}
          bookings={bookings}           setBookings={setBookings}
          professionals={professionals} setProfessionals={setProfessionals}
          kycQueue={kycQueue}           setKycQueue={setKycQueue}
          services={services}           setServices={setServices}
          visitCharges={visitCharges}   setVisitCharges={setVisitCharges}
          showToast={showToast}
        />
      </>
    );
  }

  // ── Public Website ────────────────────────────────────────
  return (
    <>
      <ToastContainer toasts={toasts} />

      {authModal && (
        <AuthModal
          initialMode={authModal}
          onClose={() => setAuthModal(null)}
          onSuccess={() => setAuthModal(null)}
          showToast={showToast}
        />
      )}

      <div>
        <SiteNav
          page={page}
          setPage={navTo}
          currentUser={currentUser}
          onSignIn={() => setAuthModal("signin")}
          onSignUp={() => setAuthModal("signup")}
          onSignOut={handleSignOut}
          openAdmin={openAdmin}
        />
        {page === "home"     && <HomePage services={services} setPage={navTo} />}
        {page === "services" && <ServicesPage services={services} setPage={navTo} />}
        {page === "booking"  && <BookingPage services={services} visitCharges={visitCharges} currentUser={currentUser} onNeedAuth={() => setAuthModal("signin")} showToast={showToast} bookings={bookings} setBookings={setBookings} />}
        {page === "contact"  && <ContactPage showToast={showToast} />}
      </div>
    </>
  );
}
