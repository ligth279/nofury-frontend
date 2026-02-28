// ============================================================
// AgriPlatform.jsx — Sustainable Agriculture Platform
// Stack: React + Tailwind + Framer Motion + Lucide React
// ============================================================

import { useState, useEffect, useRef, createContext, useContext } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Leaf, Tractor, ShoppingBasket, Users, ChevronRight, Star,
  MapPin, Search, Plus, Minus, X, CheckCircle, MessageSquare,
  ThumbsUp, Menu, ShoppingCart, Sprout, ClipboardList, User,
  ChevronDown, Share2, Send, Loader, LogOut, LogIn, Eye, EyeOff,
  Edit3, Camera, Shield, Package, Settings, AlertCircle
} from "lucide-react";

// ─── DESIGN TOKENS ───────────────────────────────────────────
const T = {
  green: "#1B4332",
  greenLight: "#2D6A4F",
  greenMid: "#40916C",
  greenSoft: "#74C69D",
  greenPale: "#D8F3DC",
  brown: "#6A4E42",
  brownPale: "#F0E6E3",
  cream: "#F8F9FA",
  sand: "#F4F1EA",
  white: "#FFFFFF",
  gray: "#6C757D",
  grayLight: "#DEE2E6",
  text: "#1A1A1A",
  textMute: "#555",
  error: "#DC2626",
};

// ─── API ─────────────────────────────────────────────────────
const API = "https://echo-vegetation-numeric-nextel.trycloudflare.com";

const api = {
  get:  (path)       => fetch(`${API}${path}`).then(r => r.json()),
  post: (path, body) => fetch(`${API}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
  put:  (path, body) => fetch(`${API}${path}`, { method: "PUT",  headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
};

// ─── GLOBAL STATE ────────────────────────────────────────────
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

function AppProvider({ children }) {
  const [page, setPage] = useState("landing");
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [credits, setCredits] = useState(0);

  const addToCart = (item) => {
    setCart((c) => {
      const ex = c.find((x) => x.id === item.id);
      if (ex) return c.map((x) => x.id === item.id ? { ...x, qty: x.qty + 1 } : x);
      return [...c, { ...item, qty: 1 }];
    });
    showToast(`${item.name} added to cart`);
  };

  const removeFromCart = (id) => setCart((c) => c.filter((x) => x.id !== id));

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const signIn = async (name, phone, password) => {
    try {
      const data = await api.post("/signin", { name, phone, password });
      if (data.error) return { error: data.error };
      const u = data.user;
      setUser({ id: u.id, name: u.name });
      setProfile({ id: u.id, name: u.name, phone, avatar_url: u.avatar_url });
      setCredits(Number(u.community_credits) || 0);
      return { error: null };
    } catch (err) {
      return { error: "Connection failed. Try again." };
    }
  };

  const signUp = async (form) => {
    try {
      const data = await api.post("/person", { id: form.phone, name: form.name, phone: form.phone, password_hash: form.password });
      if (data.error) return { error: data.error };
      return { error: null };
    } catch (err) {
      return { error: "Registration failed. Try again." };
    }
  };

  const signOut = () => {
    setUser(null);
    setProfile(null);
    setCredits(0);
    setPage("landing");
    showToast("Signed out successfully");
  };

  const updateProfile = (updates) => {
    setProfile(p => ({ ...p, ...updates }));
  };

  const addCredits = async (amount) => {
    setCredits(c => c + amount);
    if (user?.id) {
      try { await api.put(`/person/${user.id}/add-credits`, { amount }); } catch (_) {}
    }
  };

  return (
    <AppContext.Provider value={{
      page, setPage,
      cart, addToCart, removeFromCart,
      toast, showToast,
      user, profile, setProfile, updateProfile,
      signIn, signUp, signOut,
      credits, addCredits,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── UTILITY COMPONENTS ──────────────────────────────────────

function Tag({ children, color = T.greenPale, textColor = T.green }) {
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: color, color: textColor }}>
      {children}
    </span>
  );
}

function Avatar({ initials, photo, size = 40 }) {
  if (photo) return <img src={photo} alt="avatar" className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return (
    <div className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, background: T.greenMid, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

function StarRating({ rating }) {
  return (
    <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: "#F59E0B" }}>
      <Star size={13} fill="#F59E0B" />{rating}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-4 animate-pulse" style={{ background: T.grayLight }}>
      <div className="h-4 rounded mb-3" style={{ background: "#ccc" }} />
      <div className="h-3 rounded mb-2 w-3/4" style={{ background: "#ccc" }} />
      <div className="h-3 rounded w-1/2" style={{ background: "#ccc" }} />
    </div>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5 text-xs" style={{ color: T.error }}>
      <AlertCircle size={12} />{msg}
    </div>
  );
}

// ─── NAVBAR ──────────────────────────────────────────────────

function Navbar() {
  const { page, setPage, cart, user, profile, signOut, credits } = useApp();
  const [open, setOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const links = [
    { id: "landing", label: "Home" },
    { id: "contracts", label: "Contracts" },
    { id: "marketplace", label: "Marketplace" },
    { id: "rental", label: "Rental" },
    { id: "community", label: "Community" },
  ];
  const initials = profile?.name
    ? profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <nav className="sticky top-0 z-50 border-b" style={{ background: T.white, borderColor: T.grayLight }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <button onClick={() => setPage("landing")} className="flex items-center gap-2 font-black text-xl" style={{ color: T.green }}>
          <Sprout size={26} style={{ color: T.greenMid }} />
          <span style={{ fontFamily: "Georgia, serif" }}>AgriRoot</span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <button key={l.id} onClick={() => setPage(l.id)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ color: page === l.id ? T.white : T.text, background: page === l.id ? T.green : "transparent" }}>
              {l.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-bold" style={{ background: "#FFF8E7", color: "#B7791F" }}>
              ⭐ {credits} credits
            </div>
          )}
          <button className="relative p-2 rounded-xl" style={{ background: T.sand }} onClick={() => setPage("marketplace")}>
            <ShoppingCart size={20} style={{ color: T.green }} />
            {cartCount > 0 && (
              <motion.span key={cartCount} initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                style={{ background: T.brown }}>
                {cartCount}
              </motion.span>
            )}
          </button>

          {user ? (
            <div className="relative">
              <button onClick={() => setDropOpen(v => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: T.greenPale }}>
                <Avatar initials={initials} size={28} />
                <span className="text-sm font-semibold hidden md:block" style={{ color: T.green }}>
                  {profile?.name?.split(" ")[0] || "Profile"}
                </span>
                <ChevronDown size={14} style={{ color: T.green }} />
              </button>
              <AnimatePresence>
                {dropOpen && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 w-48 rounded-2xl shadow-xl overflow-hidden z-50"
                    style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
                    <button onClick={() => { setPage("profile"); setDropOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50" style={{ color: T.text }}>
                      <User size={15} /> My Profile
                    </button>
                    <button onClick={() => { setPage("profile"); setDropOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50" style={{ color: T.text }}>
                      <Settings size={15} /> Settings
                    </button>
                    <div style={{ borderTop: `1px solid ${T.grayLight}` }} />
                    <button onClick={() => { signOut(); setDropOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50" style={{ color: T.error }}>
                      <LogOut size={15} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={() => setPage("login")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: T.green }}>
              <LogIn size={15} /> Sign In
            </button>
          )}

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            <Menu size={22} style={{ color: T.green }} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t" style={{ borderColor: T.grayLight, background: T.white }}>
            {links.map((l) => (
              <button key={l.id} onClick={() => { setPage(l.id); setOpen(false); }}
                className="w-full text-left px-6 py-3 text-sm font-medium"
                style={{ color: page === l.id ? T.greenMid : T.text, background: page === l.id ? T.greenPale : "transparent" }}>
                {l.label}
              </button>
            ))}
            {user ? (
              <>
                <button onClick={() => { setPage("profile"); setOpen(false); }}
                  className="w-full text-left px-6 py-3 text-sm font-medium" style={{ color: T.text }}>My Profile</button>
                <button onClick={() => { signOut(); setOpen(false); }}
                  className="w-full text-left px-6 py-3 text-sm font-medium" style={{ color: T.error }}>Sign Out</button>
              </>
            ) : (
              <button onClick={() => { setPage("login"); setOpen(false); }}
                className="w-full text-left px-6 py-3 text-sm font-medium" style={{ color: T.greenMid }}>Sign In</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─── TOAST ───────────────────────────────────────────────────

function Toast() {
  const { toast } = useApp();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl text-white text-sm font-medium shadow-xl flex items-center gap-2"
          style={{ background: toast.type === "error" ? T.error : T.green }}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════

function LoginPage() {
  const { setPage, showToast, signIn } = useApp();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required";
    if (!phone.trim()) e.phone = "Phone is required";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await signIn(name, phone, password);
    setLoading(false);
    if (error) { showToast(error, "error"); }
    else { showToast("Welcome back!"); setPage("landing"); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: T.cream }}>
      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-col justify-between w-2/5 p-12" style={{ background: T.green }}>
        <div className="flex items-center gap-2">
          <Sprout size={30} style={{ color: T.greenSoft }} />
          <span className="text-2xl font-black text-white" style={{ fontFamily: "Georgia, serif" }}>AgriRoot</span>
        </div>
        <div>
          <div className="text-5xl font-black text-white leading-tight mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Welcome<br />back,<br />farmer.
          </div>
          <p style={{ color: T.greenSoft }}>Your crops, contracts, and community are waiting.</p>
        </div>
        <div className="flex gap-6 text-sm" style={{ color: T.greenSoft }}>
          <span>Free to join</span><span>Verified farmers</span><span>Secure contracts</span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <button onClick={() => setPage("landing")}
            className="flex items-center gap-1.5 text-sm font-medium mb-6 group"
            style={{ color: T.gray }}>
            <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </button>
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Sprout size={24} style={{ color: T.greenMid }} />
            <span className="text-xl font-black" style={{ color: T.green, fontFamily: "Georgia, serif" }}>AgriRoot</span>
          </div>
          <h1 className="text-3xl font-black mb-1" style={{ color: T.text, fontFamily: "Georgia, serif" }}>Sign in</h1>
          <p className="text-sm mb-8" style={{ color: T.textMute }}>
            Don't have an account?{" "}
            <button onClick={() => setPage("register")} className="font-bold" style={{ color: T.greenMid }}>Create one</button>
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>FULL NAME</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your registered name"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: T.white, border: `1.5px solid ${errors.name ? T.error : T.grayLight}`, color: T.text }} />
              <FieldError msg={errors.name} />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>PHONE NUMBER</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: T.white, border: `1.5px solid ${errors.phone ? T.error : T.grayLight}`, color: T.text }} />
              <FieldError msg={errors.phone} />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>PASSWORD</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none"
                  style={{ background: T.white, border: `1.5px solid ${errors.password ? T.error : T.grayLight}`, color: T.text }} />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: T.gray }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError msg={errors.password} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-2xl font-bold text-white text-sm mt-2 flex items-center justify-center gap-2"
              style={{ background: loading ? T.greenSoft : T.green }}>
              {loading ? <><Loader size={16} className="animate-spin" /> Signing in...</> : "Sign In"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// REGISTER PAGE
// ═══════════════════════════════════════════════════════════════

function RegisterPage() {
  const { setPage, showToast, signUp, signIn } = useApp();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: "farmer", location: "", phone: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    if (!form.location.trim()) e.location = "Location is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await signUp(form);
    setLoading(false);
    if (error) { showToast(error, "error"); return; }
    setDone(true);
  };

  if (done) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: T.cream }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: T.greenPale }}>
          <CheckCircle size={40} style={{ color: T.greenMid }} />
        </div>
        <h2 className="text-2xl font-black mb-2" style={{ color: T.green, fontFamily: "Georgia, serif" }}>Account Created!</h2>
        <p className="text-sm mb-6" style={{ color: T.textMute }}>Your account is ready. Sign in to get started.</p>
        <button onClick={() => setPage("login")} className="px-8 py-3 rounded-2xl font-bold text-white" style={{ background: T.green }}>
          Go to Sign In
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: T.cream }}>
      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-col justify-between w-2/5 p-12" style={{ background: T.green }}>
        <div className="flex items-center gap-2">
          <Sprout size={30} style={{ color: T.greenSoft }} />
          <span className="text-2xl font-black text-white" style={{ fontFamily: "Georgia, serif" }}>AgriRoot</span>
        </div>
        <div>
          <div className="text-5xl font-black text-white leading-tight mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Join 50,000+<br />farmers<br />today.
          </div>
          <p style={{ color: T.greenSoft }}>Direct contracts. Fair prices. Real community.</p>
        </div>
        <div className="space-y-3">
          {["Zero middlemen on contracts", "Rent equipment from neighbours", "Learn from expert farmers"].map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm" style={{ color: T.greenSoft }}>
              <CheckCircle size={14} />{f}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <button onClick={() => setPage("landing")}
            className="flex items-center gap-1.5 text-sm font-medium mb-6 group"
            style={{ color: T.gray }}>
            <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </button>
          <h1 className="text-3xl font-black mb-1" style={{ color: T.text, fontFamily: "Georgia, serif" }}>Create account</h1>
          <p className="text-sm mb-6" style={{ color: T.textMute }}>
            Already have one?{" "}
            <button onClick={() => setPage("login")} className="font-bold" style={{ color: T.greenMid }}>Sign in</button>
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: "farmer", label: "I'm a Seller", icon: "🌾", desc: "Sell products & rent equipment" },
              { value: "buyer", label: "I'm a Buyer", icon: "🛒", desc: "Buy products & contract sellers" },
            ].map(r => (
              <button key={r.value} type="button" onClick={() => set("role", r.value)}
                className="p-4 rounded-2xl text-left transition-all"
                style={{ border: `2px solid ${form.role === r.value ? T.greenMid : T.grayLight}`, background: form.role === r.value ? T.greenPale : T.white }}>
                <div className="text-2xl mb-1">{r.icon}</div>
                <div className="font-bold text-sm" style={{ color: T.text }}>{r.label}</div>
                <div className="text-xs mt-0.5" style={{ color: T.textMute }}>{r.desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>FULL NAME</label>
              <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your full name"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: T.white, border: `1.5px solid ${errors.name ? T.error : T.grayLight}`, color: T.text }} />
              <FieldError msg={errors.name} />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>PHONE NUMBER</label>
              <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 9876543210"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: T.white, border: `1.5px solid ${errors.phone ? T.error : T.grayLight}`, color: T.text }} />
              <FieldError msg={errors.phone} />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>EMAIL ADDRESS <span style={{ color: T.gray, fontWeight: 400 }}>(optional)</span></label>
              <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: T.white, border: `1.5px solid ${errors.email ? T.error : T.grayLight}`, color: T.text }} />
              <FieldError msg={errors.email} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>LOCATION</label>
                <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="City, State"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: T.white, border: `1.5px solid ${errors.location ? T.error : T.grayLight}`, color: T.text }} />
                <FieldError msg={errors.location} />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>PASSWORD</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)} placeholder="At least 6 characters"
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none"
                  style={{ background: T.white, border: `1.5px solid ${errors.password ? T.error : T.grayLight}`, color: T.text }} />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: T.gray }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError msg={errors.password} />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>CONFIRM PASSWORD</label>
              <input type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)} placeholder="Repeat password"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: T.white, border: `1.5px solid ${errors.confirm ? T.error : T.grayLight}`, color: T.text }} />
              <FieldError msg={errors.confirm} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
              style={{ background: loading ? T.greenSoft : T.green }}>
              {loading ? <><Loader size={16} className="animate-spin" /> Creating account...</> : "Create Account"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PROFILE PAGE
// ═══════════════════════════════════════════════════════════════

function ProfilePage() {
  const { user, profile, updateProfile, showToast, credits } = useApp();
  const [tab, setTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    phone: profile?.phone || "",
  });

  const myContracts = [
    { id: 1, farmer: "Ramesh Yadav", crop: "Wheat", qty: 50, value: 110000, status: "Active", date: "Jan 2025" },
    { id: 2, farmer: "Sunita Devi", crop: "Soybean", qty: 20, value: 82000, status: "Completed", date: "Nov 2024" },
  ];
  const myListings = [
    { id: 1, name: "Solar Drip Irrigation Kit", price: 4500, stock: 12, status: "Active" },
    { id: 2, name: "Organic Fertilizer (50kg)", price: 850, stock: 40, status: "Active" },
  ];
  const myEquipment = [
    { id: 1, name: "Rotavator 6-ft", price: 450, rentals: 12, status: "Available" },
  ];
  const myPosts = [
    { id: 1, title: "How I doubled my wheat yield", likes: 142, comments: 28, time: "2h ago" },
  ];

  const initials = profile?.name
    ? profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    updateProfile(form);
    setSaving(false);
    setEditing(false);
    showToast("Profile updated!");
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <User size={15} /> },
    { id: "contracts", label: "Contracts", icon: <ClipboardList size={15} /> },
    { id: "listings", label: "My Listings", icon: <Package size={15} /> },
    { id: "equipment", label: "Equipment", icon: <Tractor size={15} /> },
    { id: "posts", label: "Forum Posts", icon: <MessageSquare size={15} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 mb-6 relative overflow-hidden" style={{ background: T.green }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: T.greenSoft, transform: "translate(30%,-30%)" }} />
        <div className="flex items-start gap-5 relative">
          <div className="relative flex-shrink-0">
            <Avatar initials={initials} size={80} />
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: T.white }}>
              <Camera size={13} style={{ color: T.green }} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-2xl font-black text-white" style={{ fontFamily: "Georgia, serif" }}>
                  {profile?.name || user?.email}
                </h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Tag color="rgba(255,255,255,0.15)" textColor="#fff">
                    {profile?.role === "farmer" ? "🌾 Seller" : "🛒 Buyer"}
                  </Tag>
                  {profile?.verified && (
                    <Tag color="rgba(116,198,157,0.25)" textColor={T.greenSoft}>
                      <span className="flex items-center gap-1"><Shield size={10} /> Verified</span>
                    </Tag>
                  )}
                  {profile?.location && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: T.greenSoft }}>
                      <MapPin size={11} />{profile.location}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setEditing(v => !v)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: "rgba(255,255,255,0.15)", color: T.white }}>
                <Edit3 size={14} />{editing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
            {profile?.bio && <p className="mt-2 text-sm" style={{ color: T.greenSoft }}>{profile.bio}</p>}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          {[["Contracts", myContracts.length], ["Listings", myListings.length], ["Equipment", myEquipment.length], ["Posts", myPosts.length]].map(([label, val]) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-black text-white">{val}</div>
              <div className="text-xs mt-0.5" style={{ color: T.greenSoft }}>{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6">
            <div className="rounded-2xl p-6" style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
              <h3 className="font-bold mb-4" style={{ color: T.text }}>Edit Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "name", label: "FULL NAME", placeholder: "Your name" },
                  { key: "location", label: "LOCATION", placeholder: "City, State" },
                  { key: "phone", label: "PHONE", placeholder: "+91 ..." },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>{f.label}</label>
                    <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: T.sand, border: `1px solid ${T.grayLight}`, color: T.text }} />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>BIO</label>
                  <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell the community about yourself..." rows={2}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={{ background: T.sand, border: `1px solid ${T.grayLight}`, color: T.text }} />
                </div>
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <button onClick={() => setEditing(false)} className="px-5 py-2 rounded-xl text-sm font-bold"
                  style={{ background: T.sand, color: T.text }}>Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="px-5 py-2 rounded-xl text-sm font-bold text-white flex items-center gap-2"
                  style={{ background: saving ? T.greenSoft : T.green }}>
                  {saving ? <><Loader size={13} className="animate-spin" /> Saving...</> : "Save Changes"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
            style={{ background: tab === t.id ? T.green : T.white, color: tab === t.id ? T.white : T.text, border: `1px solid ${tab === t.id ? T.green : T.grayLight}` }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {tab === "overview" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl p-5" style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
                <div className="font-bold mb-3" style={{ color: T.text }}>Account Details</div>
                {[
                  ["Email", user?.email],
                  ["Role", profile?.role === "farmer" ? "Seller 🌾" : "Buyer 🛒"],
                  ["Location", profile?.location || "—"],
                  ["Phone", profile?.phone || "—"],
                  ["Joined", profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 text-sm border-b last:border-0" style={{ borderColor: T.grayLight }}>
                    <span style={{ color: T.gray }}>{k}</span>
                    <span className="font-medium" style={{ color: T.text }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl p-5" style={{ background: "#FFF8E7", border: "1px solid #F6E05E" }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold" style={{ color: "#92400E" }}>⭐ Community Credits</div>
                    <div className="text-2xl font-black" style={{ color: "#B7791F" }}>{credits}</div>
                  </div>
                  <p className="text-xs" style={{ color: "#B7791F" }}>Earned by donating to the Community Fund. Use credits to buy products in the Marketplace.</p>
                </div>
                <div className="rounded-2xl p-5" style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
                  <div className="font-bold mb-3" style={{ color: T.text }}>Activity Summary</div>
                  {[
                    ["Active Contracts", myContracts.filter(c => c.status === "Active").length],
                    ["Active Listings", myListings.length],
                    ["Equipment Listed", myEquipment.length],
                    ["Forum Posts", myPosts.length],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 text-sm border-b last:border-0" style={{ borderColor: T.grayLight }}>
                      <span style={{ color: T.gray }}>{k}</span>
                      <span className="font-bold" style={{ color: T.green }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {tab === "contracts" && (
            <div className="space-y-3">
              {myContracts.map(c => (
                <div key={c.id} className="rounded-2xl p-4 flex items-center justify-between gap-3"
                  style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
                  <div>
                    <div className="font-bold text-sm" style={{ color: T.text }}>{c.farmer} — {c.crop}</div>
                    <div className="text-xs mt-0.5" style={{ color: T.gray }}>{c.qty} quintals · {c.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold" style={{ color: T.green }}>₹{c.value.toLocaleString()}</div>
                    <Tag color={c.status === "Active" ? T.greenPale : T.sand} textColor={c.status === "Active" ? T.green : T.gray}>{c.status}</Tag>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "listings" && (
            <div className="space-y-3">
              {myListings.map(l => (
                <div key={l.id} className="rounded-2xl p-4 flex items-center justify-between gap-3"
                  style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
                  <div>
                    <div className="font-bold text-sm" style={{ color: T.text }}>{l.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: T.gray }}>Stock: {l.stock} kg</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold" style={{ color: T.green }}>₹{l.price}/unit</div>
                    <Tag color={T.greenPale}>{l.status}</Tag>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "equipment" && (
            <div className="space-y-3">
              {myEquipment.map(e => (
                <div key={e.id} className="rounded-2xl p-4 flex items-center justify-between gap-3"
                  style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
                  <div>
                    <div className="font-bold text-sm" style={{ color: T.text }}>{e.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: T.gray }}>{e.rentals} rentals so far</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold" style={{ color: T.green }}>₹{e.price}/day</div>
                    <Tag color={T.greenPale}>{e.status}</Tag>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "posts" && (
            <div className="space-y-3">
              {myPosts.map(p => (
                <div key={p.id} className="rounded-2xl p-4" style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
                  <div className="font-bold text-sm" style={{ color: T.text }}>{p.title}</div>
                  <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: T.gray }}>
                    <span className="flex items-center gap-1"><ThumbsUp size={11} />{p.likes}</span>
                    <span className="flex items-center gap-1"><MessageSquare size={11} />{p.comments}</span>
                    <span>{p.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── PROTECTED ROUTE ─────────────────────────────────────────

function RequireAuth({ children }) {
  const { user, setPage } = useApp();
  if (!user) { setTimeout(() => setPage("login"), 0); return null; }
  return children;
}

// ═══════════════════════════════════════════════════════════════
// EXISTING PAGES
// ═══════════════════════════════════════════════════════════════

function GrowthIllustration() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="flex items-end justify-center gap-2 h-32">
      {[30, 55, 40, 70, 50, 90, 65].map((h, i) => (
        <motion.div key={i} initial={{ height: 0, opacity: 0 }}
          animate={inView ? { height: h, opacity: 1 } : {}}
          transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
          className="w-6 rounded-t-full"
          style={{ background: i % 2 === 0 ? T.greenMid : T.greenSoft }} />
      ))}
    </div>
  );
}

function FeatureCards() {
  const { setPage } = useApp();
  const features = [
    { icon: <ClipboardList size={24} />, title: "Contracts", desc: "Browse listings, set wage schedules, and create fair work contracts.", page: "contracts", color: T.greenPale },
    { icon: <ShoppingBasket size={24} />, title: "Smart Marketplace", desc: "Browse products, build bundles, and order with one tap.", page: "marketplace", color: T.brownPale },
    { icon: <Tractor size={24} />, title: "Rental", desc: "Rent equipment & warehouse space listed by the community.", page: "rental", color: "#E8F4F8" },
    { icon: <Users size={24} />, title: "Community", desc: "Share knowledge, donate to the Community Fund, grow together.", page: "community", color: "#FFF8E7" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {features.map((f, i) => (
        <motion.button key={i} onClick={() => setPage(f.page)}
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.04 }}
          viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.3 }}
          className="rounded-2xl p-6 text-left shadow-sm hover:shadow-md transition-shadow" style={{ background: f.color }}>
          <div className="mb-3" style={{ color: T.green }}>{f.icon}</div>
          <div className="font-bold mb-1" style={{ color: T.text, fontFamily: "Georgia, serif" }}>{f.title}</div>
          <div className="text-sm" style={{ color: T.textMute }}>{f.desc}</div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: T.greenMid }}>
            Explore <ChevronRight size={14} />
          </div>
        </motion.button>
      ))}
    </div>
  );
}

function HeroSection() {
  const { setPage, user } = useApp();
  return (
    <section className="relative overflow-hidden py-20 px-4" style={{ background: T.green }}>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: T.greenSoft, transform: "translate(30%,-30%)" }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10" style={{ background: T.greenSoft, transform: "translate(-30%,30%)" }} />
      <div className="max-w-4xl mx-auto text-center relative">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Tag color="rgba(255,255,255,0.15)" textColor="#fff">🌱 Farmer-First Platform</Tag>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mt-5 text-4xl sm:text-6xl font-black leading-tight text-white" style={{ fontFamily: "Georgia, serif" }}>
          Grow Smarter.<br />Earn Better.
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          className="mt-5 text-lg max-w-xl mx-auto" style={{ color: T.greenSoft }}>
          Connect directly with buyers, rent equipment from neighbours, and learn from a community of 50,000+ farmers.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mt-8 flex flex-wrap gap-3 justify-center">
          <button onClick={() => setPage("contracts")} className="px-7 py-3 rounded-2xl font-bold text-white" style={{ background: T.brown }}>
            Find Farmers
          </button>
          {!user && (
            <button onClick={() => setPage("register")}
              className="px-7 py-3 rounded-2xl font-bold"
              style={{ background: "rgba(255,255,255,0.12)", color: T.white, border: "1px solid rgba(255,255,255,0.2)" }}>
              Join Free
            </button>
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-12 grid grid-cols-3 gap-6 max-w-sm mx-auto">
          {[["Free", "To Join"], ["Verified", "Farmers"], ["Secure", "Contracts"]].map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="text-2xl font-black text-white">{n}</div>
              <div className="text-xs mt-0.5" style={{ color: T.greenSoft }}>{l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function LandingPage() {
  return (
    <div>
      <HeroSection />
      <section className="max-w-6xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-3xl font-black" style={{ color: T.green, fontFamily: "Georgia, serif" }}>Everything a farmer needs</h2>
          <p className="mt-2 text-sm" style={{ color: T.textMute }}>One platform. Every tool. Real relationships.</p>
        </motion.div>
        <FeatureCards />
        <div className="mt-20 rounded-3xl p-10 text-center" style={{ background: T.sand }}>
          <h3 className="text-2xl font-bold mb-2" style={{ color: T.green, fontFamily: "Georgia, serif" }}>Seasonal Growth Dashboard</h3>
          <p className="text-sm mb-8" style={{ color: T.textMute }}>Platform transactions across harvest seasons</p>
          <GrowthIllustration />
          <div className="mt-4 flex justify-center gap-8 text-xs" style={{ color: T.textMute }}>
            {["Jan", "Mar", "May", "Jul", "Sep", "Nov", "Dec"].map(m => <span key={m}>{m}</span>)}
          </div>
        </div>
      </section>
    </div>
  );
}

function FarmerCard({ farmer, onSelect, selected }) {
  return (
    <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }} onClick={() => onSelect(farmer)} className="rounded-2xl p-4 cursor-pointer"
      style={{ background: selected ? T.greenPale : T.white, border: `2px solid ${selected ? T.greenMid : T.grayLight}` }}>
      <div className="flex items-start gap-3">
        <Avatar initials={farmer.avatar} size={48} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold truncate" style={{ color: T.text }}>{farmer.name}</span>
            {farmer.verified && <CheckCircle size={14} style={{ color: T.greenMid }} />}
          </div>
          <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: T.gray }}><MapPin size={11} />{farmer.location}</div>
          <div className="mt-2 flex items-center gap-2 flex-wrap"><Tag>{farmer.crop}</Tag><StarRating rating={farmer.rating} /></div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-bold text-sm" style={{ color: T.green }}>₹{farmer.price.toLocaleString()}</div>
          <div className="text-xs" style={{ color: T.gray }}>wage rate</div>
        </div>
      </div>
    </motion.div>
  );
}

const WAGE_OPTIONS = [
  { value: "daily", label: "📅 End of each day" },
  { value: "weekly", label: "📅 Weekly" },
  { value: "end-of-contract", label: "📋 End of contract / duration" },
];

function ContractBuilder({ farmer, onClose }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ workDesc: "", duration: "", delivery: "", wageSchedule: "end-of-contract" });
  const { showToast, user, setPage } = useApp();

  const submit = async () => {
    if (!user) { onClose(); setPage("login"); showToast("Please sign in to create a contract", "error"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false); setDone(true);
    setTimeout(() => { onClose(); showToast("Contract sent to " + farmer.name); }, 1800);
  };

  if (done) return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10 px-6">
      <CheckCircle size={64} style={{ color: T.greenMid, margin: "0 auto 16px" }} />
      <div className="text-xl font-bold" style={{ color: T.green }}>Contract Submitted!</div>
      <div className="text-sm mt-2" style={{ color: T.textMute }}>{farmer.name} will be notified.</div>
    </motion.div>
  );

  return (
    <div>
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.grayLight }}>
        <div><div className="font-bold" style={{ color: T.text }}>Create Contract</div><div className="text-xs" style={{ color: T.gray }}>with {farmer.name}</div></div>
        <button onClick={onClose} style={{ color: T.gray }}><X size={18} /></button>
      </div>
      <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
        <div>
          <label className="text-xs font-semibold block mb-1.5" style={{ color: T.textMute }}>WORK DESCRIPTION</label>
          <textarea value={form.workDesc || ""} onChange={e => setForm(f => ({ ...f, workDesc: e.target.value }))}
            placeholder="Describe the work required, scope, expectations..." rows={2}
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
            style={{ background: T.sand, border: `1px solid ${T.grayLight}`, color: T.text }} />
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1.5" style={{ color: T.textMute }}>DURATION</label>
          <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
            placeholder="e.g. 3 Months, 1 Year"
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{ background: T.sand, border: `1px solid ${T.grayLight}`, color: T.text }} />
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1.5" style={{ color: T.textMute }}>DELIVERY LOCATION</label>
          <input value={form.delivery} onChange={e => setForm(f => ({ ...f, delivery: e.target.value }))}
            placeholder="e.g. APMC Yard, Nagpur" className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{ background: T.sand, border: `1px solid ${T.grayLight}` }} />
        </div>
        <div>
          <label className="text-xs font-semibold block mb-2" style={{ color: T.textMute }}>WAGE PAYMENT SCHEDULE</label>
          <div className="grid grid-cols-1 gap-2">
            {WAGE_OPTIONS.map(opt => (
              <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, wageSchedule: opt.value }))}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-left transition-all"
                style={{ background: form.wageSchedule === opt.value ? T.greenPale : T.sand, border: `1.5px solid ${form.wageSchedule === opt.value ? T.greenMid : "transparent"}`, color: T.text }}>
                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: form.wageSchedule === opt.value ? T.greenMid : T.gray }}>
                  {form.wageSchedule === opt.value && <div className="w-2 h-2 rounded-full" style={{ background: T.greenMid }} />}
                </div>
                <span className="font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ background: T.greenPale }}>
          <div className="flex justify-between text-sm">
            <span style={{ color: T.textMute }}>Agreed Wage Rate</span>
            <span className="font-bold" style={{ color: T.green }}>₹{farmer.price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span style={{ color: T.textMute }}>Payment Schedule</span>
            <span className="font-medium" style={{ color: T.green }}>{WAGE_OPTIONS.find(o => o.value === form.wageSchedule)?.label.replace(/📅|📋/g, "").trim()}</span>
          </div>
          {form.duration && (
            <div className="flex justify-between text-sm mt-1">
              <span style={{ color: T.textMute }}>Duration</span>
              <span className="font-medium" style={{ color: T.green }}>{form.duration}</span>
            </div>
          )}
        </div>
        <button onClick={submit} disabled={loading} className="w-full py-3 rounded-2xl font-bold text-white"
          style={{ background: loading ? T.greenSoft : T.green }}>
          {loading ? <span className="flex items-center justify-center gap-2"><Loader size={16} className="animate-spin" /> Submitting...</span> : "Send Contract Proposal"}
        </button>
      </div>
    </div>
  );
}

// ─── LIST CONTRACT MODAL ─────────────────────────────────────
function ListContractModal({ onClose, onList }) {
  const { user, setPage, showToast } = useApp();
  const [form, setForm] = useState({ name: "", location: "", crop: "", price: "", minQty: "", duration: "", wageSchedule: "end-of-contract", bio: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Your name is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.crop.trim()) e.crop = "Work / produce type is required";
    if (!form.price || isNaN(form.price) || +form.price <= 0) e.price = "Enter a valid wage rate";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { onClose(); setPage("login"); showToast("Please sign in to make a listing", "error"); return; }
    if (!validate()) return;
    setSubmitting(true);
    try {
      // Post a forum question as a work listing so others can find it
      await api.post("/forum-question", { author_id: user.id, title: `Available for ${form.crop} — ${form.location}`, body: `Wage rate: ₹${form.price}. ${form.bio || ""}`, topic_id: null });
      const initials = form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
      onList({ id: Date.now(), name: form.name, location: form.location, crop: form.crop, price: +form.price, rating: 5.0, contracts: 0, avatar: initials, verified: false });
      showToast("Your listing is now live!");
      onClose();
    } catch (err) { showToast("Failed to create listing. Try again.", "error"); }
    finally { setSubmitting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        className="w-full max-w-md rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
        style={{ background: "#fff" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-black" style={{ color: T.text, fontFamily: "Georgia, serif" }}>Make a Listing</h2>
            <p className="text-xs mt-0.5" style={{ color: T.textMute }}>Others will see your listing and reach out to contract you</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl" style={{ background: T.sand }}><X size={18} style={{ color: T.gray }} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>YOUR NAME</label>
              <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Full name"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: T.sand, border: `1.5px solid ${errors.name ? T.error : T.grayLight}`, color: T.text }} />
              <FieldError msg={errors.name} />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>LOCATION</label>
              <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="City, State"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: T.sand, border: `1.5px solid ${errors.location ? T.error : T.grayLight}`, color: T.text }} />
              <FieldError msg={errors.location} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>WORK / PRODUCE TYPE</label>
            <input value={form.crop} onChange={e => set("crop", e.target.value)} placeholder="e.g. Wheat Harvesting, Land Preparation"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: T.sand, border: `1.5px solid ${errors.crop ? T.error : T.grayLight}`, color: T.text }} />
            <FieldError msg={errors.crop} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>WAGE RATE (₹)</label>
              <input type="number" min="1" value={form.price} onChange={e => set("price", e.target.value)} placeholder="e.g. 800"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: T.sand, border: `1.5px solid ${errors.price ? T.error : T.grayLight}`, color: T.text }} />
              <FieldError msg={errors.price} />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>CONTRACT DURATION</label>
              <input value={form.duration} onChange={e => set("duration", e.target.value)} placeholder="e.g. 2 Weeks, 3 Months"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: T.sand, border: `1.5px solid ${T.grayLight}`, color: T.text }} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold block mb-2" style={{ color: T.textMute }}>WAGE PAYMENT SCHEDULE</label>
            <div className="grid grid-cols-1 gap-2">
              {WAGE_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => set("wageSchedule", opt.value)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-left transition-all"
                  style={{ background: form.wageSchedule === opt.value ? T.greenPale : T.sand, border: `1.5px solid ${form.wageSchedule === opt.value ? T.greenMid : "transparent"}`, color: T.text }}>
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: form.wageSchedule === opt.value ? T.greenMid : T.gray }}>
                    {form.wageSchedule === opt.value && <div className="w-2 h-2 rounded-full" style={{ background: T.greenMid }} />}
                  </div>
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>ABOUT YOU (optional)</label>
            <textarea value={form.bio} onChange={e => set("bio", e.target.value)}
              placeholder="Experience, skills, certifications..." rows={2}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ background: T.sand, border: `1.5px solid ${T.grayLight}`, color: T.text }} />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
            style={{ background: submitting ? T.greenSoft : T.green }}>
            {submitting ? <><Loader size={15} className="animate-spin" /> Posting...</> : <><Plus size={15} /> Post Listing</>}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function ContractPage() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => {
    api.get("/person")
      .then(data => {
        const mapped = data.map(p => ({
          id: p.id,
          name: p.name,
          location: p.location || "India",
          crop: p.skill || p.role || "General",
          rating: 5.0,
          contracts: 0,
          avatar: p.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
          verified: true,
          price: p.hourly_rate || 0,
        }));
        setFarmers(mapped);
      })
      .catch(() => setFarmers([]))
      .finally(() => setLoading(false));
  }, []);
  const filtered = farmers.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.crop.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <AnimatePresence>
        {showListModal && (
          <ListContractModal
            onClose={() => setShowListModal(false)}
            onList={farmer => setFarmers(prev => [farmer, ...prev])}
          />
        )}
      </AnimatePresence>
      <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-black" style={{ color: T.green, fontFamily: "Georgia, serif" }}>Contracts</h1>
          <p className="text-sm mt-0.5" style={{ color: T.textMute }}>Browse listings, negotiate terms, and create contracts</p>
        </div>
        <button onClick={() => setShowListModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: T.green, color: T.white }}>
          <Plus size={15} /> Make a Listing
        </button>
      </div>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.gray }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings or work type..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: T.white, border: `1px solid ${T.grayLight}` }} />
          </div>
          {loading ? [1, 2, 3].map(i => <SkeletonCard key={i} />) :
            filtered.map((f, i) => (
              <motion.div key={f.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <FarmerCard farmer={f} onSelect={setSelected} selected={selected?.id === f.id} />
              </motion.div>
            ))}
        </div>
        <div className="lg:col-span-2 space-y-5">
          {selected ? (
            <AnimatePresence mode="wait">
              <motion.div key={selected.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="rounded-2xl p-6 mb-5" style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
                  <div className="flex items-start gap-4">
                    <Avatar initials={selected.avatar} size={64} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold" style={{ color: T.text }}>{selected.name}</h2>
                        {selected.verified && <Tag color={T.greenPale}>✓ Verified</Tag>}
                      </div>
                      <div className="flex items-center gap-1 text-sm mt-1" style={{ color: T.gray }}><MapPin size={13} />{selected.location}</div>
                      <div className="flex gap-4 mt-4 text-sm">
                        <div><div className="font-bold">{selected.contracts}</div><div style={{ color: T.gray }}>Contracts</div></div>
                        <div><div className="font-bold">{selected.rating}</div><div style={{ color: T.gray }}>Rating</div></div>
                        <div><div className="font-bold">₹{selected.price.toLocaleString()}</div><div style={{ color: T.gray }}>wage rate</div></div>
                      </div>
                    </div>
                    <button onClick={() => setShowBuilder(true)} className="px-5 py-2.5 rounded-xl font-bold text-white text-sm" style={{ background: T.green }}>Create Contract</button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="rounded-2xl flex flex-col items-center justify-center py-20" style={{ background: T.sand }}>
              <Leaf size={40} style={{ color: T.greenSoft }} />
              <p className="mt-4 text-sm" style={{ color: T.textMute }}>Select a listing to view details</p>
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {showBuilder && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={e => e.target === e.currentTarget && setShowBuilder(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-md rounded-3xl overflow-hidden" style={{ background: T.white }}>
              <ContractBuilder farmer={selected} onClose={() => setShowBuilder(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MarketplaceCard({ product }) {
  const { addToCart } = useApp();
  const [added, setAdded] = useState(false);
  const handleAdd = () => {
    addToCart({ id: product.id, name: product.name, price: product.price, unit: product.unit });
    setAdded(true); setTimeout(() => setAdded(false), 1500);
  };
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3 }}
      className="rounded-2xl overflow-hidden" style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
      <div className="p-5 text-5xl text-center" style={{ background: T.sand }}>{product.img}</div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-bold text-sm" style={{ color: T.text }}>{product.name}</div>
            <div className="text-xs mt-0.5" style={{ color: T.gray }}>{product.seller}</div>
          </div>
          <StarRating rating={product.rating} />
        </div>
        <div className="flex items-center justify-between mt-3">
          <div><span className="font-black text-lg" style={{ color: T.green }}>₹{product.price}</span></div>
          <Tag color={T.greenPale}>{product.stock.toLocaleString()} in stock</Tag>
        </div>
        <motion.button onClick={handleAdd} animate={added ? { scale: [1, 1.15, 1] } : {}}
          className="mt-3 w-full py-2 rounded-xl text-sm font-bold transition-all"
          style={{ background: added ? T.greenPale : T.green, color: added ? T.greenMid : T.white }}>
          {added ? "✓ Added!" : "Add to Cart"}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── LIST PRODUCT MODAL ──────────────────────────────────────
function ListProductModal({ onClose, onList }) {
  const { user, setPage, showToast } = useApp();
  const [form, setForm] = useState({ name: "", category: "", price: "", stock: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.price || isNaN(form.price) || +form.price <= 0) e.price = "Enter a valid price";
    if (!form.stock || isNaN(form.stock) || +form.stock <= 0) e.stock = "Enter available stock";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { onClose(); setPage("login"); showToast("Please sign in to list a product", "error"); return; }
    if (!validate()) return;
    setSubmitting(true);
    try {
      // 1. Create the object
      const obj = await api.post("/object", { name: form.name, description: form.description || form.name, company: "AgriRoot Seller", tag: form.category || "General" });
      // 2. List it on market as for sale
      await api.post("/market", { object_id: obj.object_id, owner_id: user.id, listing_type: "buy", price_to_buy: +form.price });
      onList({ id: obj.object_id, name: form.name, category: form.category || "General", price: +form.price, unit: "piece", stock: +form.stock, img: "📦", seller: "You", rating: 5.0 });
      showToast(`${form.name} listed on marketplace!`);
      onClose();
    } catch (err) {
      showToast("Failed to list product. Try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        className="w-full max-w-md rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
        style={{ background: "#fff" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-black" style={{ color: T.text, fontFamily: "Georgia, serif" }}>List a Product</h2>
            <p className="text-xs mt-0.5" style={{ color: T.textMute }}>It'll appear on the Marketplace for buyers</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl" style={{ background: T.sand }}><X size={18} style={{ color: T.gray }} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>PRODUCT NAME</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Sprayer Pump, Fertilizer Bag, Shade Net"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: T.sand, border: `1.5px solid ${errors.name ? T.error : T.grayLight}`, color: T.text }} />
            <FieldError msg={errors.name} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>CATEGORY</label>
              <input value={form.category} onChange={e => set("category", e.target.value)}
                placeholder="e.g. Equipment, Inputs, Tools"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: T.sand, border: `1.5px solid ${T.grayLight}`, color: T.text }} />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>PRICE (₹)</label>
              <input type="number" min="1" value={form.price} onChange={e => set("price", e.target.value)} placeholder="e.g. 1200"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: T.sand, border: `1.5px solid ${errors.price ? T.error : T.grayLight}`, color: T.text }} />
              <FieldError msg={errors.price} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>STOCK (no. of units)</label>
            <input type="number" min="1" value={form.stock} onChange={e => set("stock", e.target.value)} placeholder="e.g. 50"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: T.sand, border: `1.5px solid ${errors.stock ? T.error : T.grayLight}`, color: T.text }} />
            <FieldError msg={errors.stock} />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>DESCRIPTION (optional)</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)}
              placeholder="Describe the product — specs, brand, condition, warranty..." rows={2}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ background: T.sand, border: `1.5px solid ${T.grayLight}`, color: T.text }} />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
            style={{ background: submitting ? T.greenSoft : T.green }}>
            {submitting ? <><Loader size={15} className="animate-spin" /> Listing...</> : <><Plus size={15} /> List Product</>}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── LIST RENTAL MODAL ───────────────────────────────────────
function ListEquipmentModal({ onClose, onList }) {
  const { user, setPage, showToast } = useApp();
  const [type, setType] = useState("equipment");
  const [form, setForm] = useState({ name: "", category: "", price: "", location: "", size: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = type === "equipment" ? "Equipment name is required" : "Warehouse name is required";
    if (!form.price || isNaN(form.price) || +form.price <= 0) e.price = "Enter a valid rate";
    if (!form.location.trim()) e.location = "Location is required";
    if (type === "warehouse" && !form.size.trim()) e.size = "Size is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { onClose(); setPage("login"); showToast("Please sign in to list a rental", "error"); return; }
    if (!validate()) return;
    setSubmitting(true);
    try {
      const obj = await api.post("/object", { name: form.name, description: form.description || form.name, company: user.name || "Owner", tag: form.category || type });
      const marketPayload = { object_id: obj.object_id, owner_id: user.id, listing_type: "rent", price_to_rent_per_day: +form.price };
      await api.post("/market", marketPayload);
      if (type === "equipment") {
        onList({ id: obj.object_id, name: form.name, category: form.category || "Other", price: +form.price, unit: "day", owner: user.name || "You", location: form.location, distance: "", rating: 5.0, available: true, img: "🔧" });
      } else {
        onList({ id: obj.object_id, name: form.name, size: form.size, price: +form.price, unit: "month", owner: user.name || "You", location: form.location, distance: "", rating: 5.0, available: true, img: "🏗️", features: form.description ? [form.description] : [] });
      }
      showToast(`${form.name} listed for rental!`);
      onClose();
    } catch (err) {
      showToast("Failed to list rental. Try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        className="w-full max-w-md rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
        style={{ background: "#fff" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-black" style={{ color: T.text, fontFamily: "Georgia, serif" }}>List a Rental</h2>
            <p className="text-xs mt-0.5" style={{ color: T.textMute }}>Let others rent from you and earn</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl" style={{ background: T.sand }}><X size={18} style={{ color: T.gray }} /></button>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {[{ id: "equipment", label: "🚜 Equipment" }, { id: "warehouse", label: "🏭 Warehouse" }].map(t => (
            <button key={t.id} type="button" onClick={() => setType(t.id)}
              className="py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: type === t.id ? T.green : T.sand, color: type === t.id ? T.white : T.text }}>
              {t.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>{type === "equipment" ? "EQUIPMENT NAME" : "WAREHOUSE NAME"}</label>
            <input value={form.name} onChange={e => set("name", e.target.value)}
              placeholder={type === "equipment" ? "e.g. Rotavator, Sprayer Pump" : "e.g. Cold Storage Unit, Dry Shed"}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: T.sand, border: `1.5px solid ${errors.name ? T.error : T.grayLight}`, color: T.text }} />
            <FieldError msg={errors.name} />
          </div>
          {type === "equipment" ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>CATEGORY</label>
                <input value={form.category} onChange={e => set("category", e.target.value)} placeholder="e.g. Tractor, Tillage"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: T.sand, border: `1.5px solid ${T.grayLight}`, color: T.text }} />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>RATE (₹/day)</label>
                <input type="number" min="1" value={form.price} onChange={e => set("price", e.target.value)} placeholder="e.g. 800"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: T.sand, border: `1.5px solid ${errors.price ? T.error : T.grayLight}`, color: T.text }} />
                <FieldError msg={errors.price} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>SIZE</label>
                <input value={form.size} onChange={e => set("size", e.target.value)} placeholder="e.g. 300 sq ft"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: T.sand, border: `1.5px solid ${errors.size ? T.error : T.grayLight}`, color: T.text }} />
                <FieldError msg={errors.size} />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>RATE (₹/month)</label>
                <input type="number" min="1" value={form.price} onChange={e => set("price", e.target.value)} placeholder="e.g. 1500"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: T.sand, border: `1.5px solid ${errors.price ? T.error : T.grayLight}`, color: T.text }} />
                <FieldError msg={errors.price} />
              </div>
            </div>
          )}
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>LOCATION</label>
            <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Ludhiana, Punjab"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: T.sand, border: `1.5px solid ${errors.location ? T.error : T.grayLight}`, color: T.text }} />
            <FieldError msg={errors.location} />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>{type === "equipment" ? "DESCRIPTION (optional)" : "FEATURES (optional)"}</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)}
              placeholder={type === "equipment" ? "Year, condition, specs..." : "e.g. Temperature Controlled, CCTV, Loading Dock"} rows={2}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ background: T.sand, border: `1.5px solid ${T.grayLight}`, color: T.text }} />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
            style={{ background: submitting ? T.greenSoft : T.green }}>
            {submitting ? <><Loader size={15} className="animate-spin" /> Listing...</> : <><Plus size={15} /> List Rental</>}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}


function MarketplacePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const { cart, removeFromCart } = useApp();
  const [showCart, setShowCart] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const categories = ["All", "Equipment", "Inputs", "Tools"];
  useEffect(() => {
    api.get("/objects-for-sale")
      .then(data => {
        const tagEmoji = { Equipment: "🚜", Inputs: "🌿", Tools: "🔧", Seeds: "🌱", Fertilizer: "🧪" };
        const mapped = data.map(p => ({
          id: p.object_id,
          name: p.name,
          category: p.tag || "General",
          price: Number(p.price_to_buy) || 0,
          unit: "piece",
          stock: 99,
          img: tagEmoji[p.tag] || "📦",
          seller: p.company || "AgriRoot Seller",
          rating: 4.8,
          description: p.description,
        }));
        setProducts(mapped);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);
  const filtered = products.filter(c => (category === "All" || c.category === category) && c.name.toLowerCase().includes(search.toLowerCase()));
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <AnimatePresence>
        {showListModal && <ListProductModal onClose={() => setShowListModal(false)} onList={product => setProducts(prev => [product, ...prev])} />}
      </AnimatePresence>
      <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-black" style={{ color: T.green, fontFamily: "Georgia, serif" }}>Smart Marketplace</h1>
          <p className="text-sm" style={{ color: T.textMute }}>Quality agri-products, direct from sellers</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowListModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: T.green, color: T.white }}>
            <Plus size={15} /> List Your Product
          </button>
          <button onClick={() => setShowCart(v => !v)} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: T.greenPale, color: T.green }}>
            🛒 Cart ({cart.length})
          </button>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.gray }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: T.white, border: `1px solid ${T.grayLight}` }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: category === c ? T.green : T.sand, color: category === c ? T.white : T.text }}>{c}</button>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {showCart && cart.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mt-4 rounded-2xl p-4" style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
            {cart.map(i => (
              <div key={i.id} className="flex items-center justify-between py-2 border-b text-sm" style={{ borderColor: T.grayLight }}>
                <span>{i.name} × {i.qty}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold" style={{ color: T.green }}>₹{i.price * i.qty}</span>
                  <button onClick={() => removeFromCart(i.id)} style={{ color: T.gray }}><X size={14} /></button>
                </div>
              </div>
            ))}
            <div className="flex justify-between mt-3 font-bold"><span>Total</span><span style={{ color: T.green }}>₹{cartTotal}</span></div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />) :
          filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
              <MarketplaceCard product={p} />
            </motion.div>
          ))}
      </div>
    </div>
  );
}

function EquipmentCard({ equip }) {
  const [showRent, setShowRent] = useState(false);
  const { showToast, user, setPage } = useApp();
  const [renting, setRenting] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const handleRent = async () => {
    if (!user) { setPage("login"); showToast("Please sign in to rent equipment", "error"); return; }
    if (!startDate || !endDate) { showToast("Please pick start and end dates", "error"); return; }
    if (endDate < startDate) { showToast("End date must be after start date", "error"); return; }
    setRenting(true);
    try {
      await api.post("/rent", { market_id: equip.market_id, renter_id: user.id, starting_date: startDate, ending_date: endDate });
      showToast(`${equip.name} booked!`);
      setShowRent(false);
    } catch (err) {
      showToast("Booking failed. Try again.", "error");
    } finally {
      setRenting(false);
    }
  };
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden" style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="text-4xl">{equip.img}</div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div><div className="font-bold" style={{ color: T.text }}>{equip.name}</div><div className="text-xs mt-0.5" style={{ color: T.gray }}>{equip.category}</div></div>
              <Tag color={equip.available ? T.greenPale : "#FFE4E4"} textColor={equip.available ? T.green : "#C0392B"}>{equip.available ? "Available" : "Booked"}</Tag>
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <StarRating rating={equip.rating} />
              <span className="flex items-center gap-1" style={{ color: T.gray }}><MapPin size={11} />{equip.distance}</span>
            </div>
            <div className="mt-2"><span className="text-xl font-black" style={{ color: T.green }}>₹{equip.price}</span><span className="text-xs ml-1" style={{ color: T.gray }}>/{equip.unit}</span></div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {equip.available && (
            <button onClick={() => setShowRent(!showRent)} className="w-full py-2 rounded-xl text-sm font-bold" style={{ background: T.green, color: T.white }}>Rent Now</button>
          )}
        </div>
      </div>
      <AnimatePresence>
        {showRent && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t" style={{ borderColor: T.grayLight }}>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: T.textMute }}>START DATE</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: T.sand, border: `1px solid ${T.grayLight}` }} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: T.textMute }}>END DATE</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: T.sand, border: `1px solid ${T.grayLight}` }} />
              </div>
              <div className="text-xs" style={{ color: T.gray }}>Owner: {equip.owner} · {equip.location}</div>
              <button onClick={handleRent} disabled={renting} className="w-full py-2.5 rounded-xl font-bold text-white text-sm"
                style={{ background: renting ? T.greenSoft : T.green }}>
                {renting ? "Booking..." : `Confirm · ₹${equip.price}`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function WarehouseCard({ wh }) {
  const [showBook, setShowBook] = useState(false);
  const [booking, setBooking] = useState(false);
  const [months, setMonths] = useState(1);
  const { showToast, user, setPage } = useApp();
  const handleBook = async () => {
    if (!user) { setPage("login"); showToast("Please sign in to book storage", "error"); return; }
    setBooking(true);
    await new Promise(r => setTimeout(r, 900));
    setBooking(false); setShowBook(false);
    showToast(`${wh.name} booked for ${months} month${months > 1 ? "s" : ""}!`);
  };
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden" style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="text-4xl">{wh.img}</div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold" style={{ color: T.text }}>{wh.name}</div>
                <div className="text-xs mt-0.5" style={{ color: T.gray }}>{wh.size}</div>
              </div>
              <Tag color={wh.available ? T.greenPale : "#FFE4E4"} textColor={wh.available ? T.green : "#C0392B"}>{wh.available ? "Available" : "Full"}</Tag>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <StarRating rating={wh.rating} />
              <span className="flex items-center gap-1" style={{ color: T.gray }}><MapPin size={11} />{wh.distance}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {wh.features.map(f => <Tag key={f} color={T.sand} textColor={T.textMute}>{f}</Tag>)}
            </div>
            <div className="mt-2"><span className="text-xl font-black" style={{ color: T.green }}>₹{wh.price.toLocaleString()}</span><span className="text-xs ml-1" style={{ color: T.gray }}>/{wh.unit}</span></div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <div className="flex-1 text-xs py-2 px-3 rounded-xl" style={{ background: T.sand, color: T.gray }}>Owner: {wh.owner} · {wh.location}</div>
          {wh.available && (
            <button onClick={() => setShowBook(!showBook)} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: T.green, color: T.white }}>Book</button>
          )}
        </div>
      </div>
      <AnimatePresence>
        {showBook && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t" style={{ borderColor: T.grayLight }}>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: T.textMute }}>MONTHS NEEDED</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setMonths(m => Math.max(1, m - 1))} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.sand }}><Minus size={14} /></button>
                  <span className="text-xl font-bold w-10 text-center" style={{ color: T.green }}>{months}</span>
                  <button onClick={() => setMonths(m => m + 1)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.sand }}><Plus size={14} /></button>
                </div>
              </div>
              <div className="rounded-xl p-3 flex justify-between text-sm" style={{ background: T.greenPale }}>
                <span style={{ color: T.textMute }}>Total</span>
                <span className="font-bold" style={{ color: T.green }}>₹{(wh.price * months).toLocaleString()}</span>
              </div>
              <button onClick={handleBook} disabled={booking} className="w-full py-2.5 rounded-xl font-bold text-white text-sm" style={{ background: booking ? T.greenSoft : T.green }}>
                {booking ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RentalPage() {
  const [equipment, setEquipment] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("equipment");
  const [category, setCategory] = useState("All");
  const [showListModal, setShowListModal] = useState(false);
  const equipCategories = ["All", "Tractor", "Tillage", "Harvesting", "Irrigation"];
  useEffect(() => {
    const tagEmoji = { Tractor: "🚜", Tillage: "⚙️", Harvesting: "🌾", Irrigation: "💧", Warehouse: "🏭", Storage: "📦" };
    Promise.all([
      api.get("/objects-for-rent"),
      api.get("/market-details"),
    ]).then(([rentals, market]) => {
      const equipList = rentals.map(r => ({
        id: r.object_id,
        market_id: market.find(m => m.object_name === r.name)?.market_id,
        name: r.name,
        category: r.tag || "Equipment",
        price: Number(r.price_to_rent_per_day) || 0,
        unit: "day",
        owner: r.company || "Owner",
        location: "India",
        distance: "",
        rating: 4.8,
        available: true,
        img: tagEmoji[r.tag] || "🔧",
        description: r.description,
      }));
      setEquipment(equipList);
      setWarehouses([]);
    })
    .catch(() => { setEquipment([]); setWarehouses([]); })
    .finally(() => setLoading(false));
  }, []);
  const filteredEquip = category === "All" ? equipment : equipment.filter(e => e.category === category);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <AnimatePresence>
        {showListModal && <ListEquipmentModal onClose={() => setShowListModal(false)} onList={equip => setEquipment(prev => [equip, ...prev])} />}
      </AnimatePresence>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-black" style={{ color: T.green, fontFamily: "Georgia, serif" }}>Rental</h1>
          <p className="text-sm mt-0.5" style={{ color: T.textMute }}>Rent equipment & warehouse space from trusted community members</p>
        </div>
        <button onClick={() => setShowListModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: T.green, color: T.white }}>
          <Plus size={15} /> List Your Rental
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {[{ id: "equipment", label: "🚜 Equipment" }, { id: "warehouse", label: "🏭 Warehouse" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-5 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: tab === t.id ? T.green : T.white, color: tab === t.id ? T.white : T.text, border: `1px solid ${tab === t.id ? T.green : T.grayLight}` }}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          {tab === "equipment" && (
            <>
              <div className="flex gap-2 flex-wrap mb-5">
                {equipCategories.map(c => (
                  <button key={c} onClick={() => setCategory(c)} className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all"
                    style={{ background: category === c ? T.green : T.sand, color: category === c ? T.white : T.text }}>{c}</button>
                ))}
              </div>
              <div className="space-y-4">
                {loading ? [1, 2, 3].map(i => <SkeletonCard key={i} />) :
                  filteredEquip.map((e, i) => (
                    <motion.div key={e.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                      <EquipmentCard equip={e} />
                    </motion.div>
                  ))}
              </div>
            </>
          )}
          {tab === "warehouse" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loading ? [1, 2, 3, 4].map(i => <SkeletonCard key={i} />) :
                warehouses.map((w, i) => (
                  <motion.div key={w.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <WarehouseCard wh={w} />
                  </motion.div>
                ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const handleLike = () => { setLikes(l => liked ? l - 1 : l + 1); setLiked(!liked); };
  return (
    <motion.div layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5" style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
      <div className="flex items-start gap-3">
        <Avatar initials={post.avatar} size={42} />
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div><span className="font-bold text-sm" style={{ color: T.text }}>{post.author}</span><span className="ml-2 text-xs" style={{ color: T.gray }}>{post.time}</span></div>
            <Tag>{post.tag}</Tag>
          </div>
          <h3 className="mt-2 font-bold" style={{ color: T.text, fontFamily: "Georgia, serif" }}>{post.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed line-clamp-2" style={{ color: T.textMute }}>{post.body}</p>
          <div className="mt-4 flex items-center gap-4">
            <motion.button whileTap={{ scale: 0.85 }} onClick={handleLike}
              className="flex items-center gap-1.5 text-sm font-medium" style={{ color: liked ? T.green : T.gray }}>
              <motion.div animate={liked ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.25 }}>
                <ThumbsUp size={15} fill={liked ? T.green : "none"} />
              </motion.div>{likes}
            </motion.button>
            <button className="flex items-center gap-1.5 text-sm" style={{ color: T.gray }}><MessageSquare size={15} />{post.comments}</button>
            <button className="flex items-center gap-1.5 text-sm ml-auto" style={{ color: T.gray }}><Share2 size={14} /></button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CreatePost({ onPost }) {
  const [body, setBody] = useState(""); const [title, setTitle] = useState("");
  const [posting, setPosting] = useState(false);
  const { showToast, user, setPage } = useApp();
  const handlePost = async () => {
    if (!user) { setPage("login"); showToast("Please sign in to post", "error"); return; }
    if (!title.trim() || !body.trim()) { showToast("Please fill in title and body", "error"); return; }
    setPosting(true);
    try {
      const data = await api.post("/forum-question", { author_id: user.id, title, body, topic_id: null });
      onPost({ id: data.question_id, author: user.name, avatar: user.name.slice(0, 2).toUpperCase(), title, body, likes: 0, comments: 0, tag: "General", time: "just now" });
      setTitle(""); setBody("");
      showToast("Post published!");
    } catch (err) { showToast("Failed to post. Try again.", "error"); }
    finally { setPosting(false); }
  };
  return (
    <div className="rounded-2xl p-5 mb-6" style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
      <div className="font-bold mb-3" style={{ color: T.text }}>Share with the community</div>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title..."
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-2" style={{ background: T.sand, border: `1px solid ${T.grayLight}` }} />
      <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Share your knowledge..." rows={3}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ background: T.sand, border: `1px solid ${T.grayLight}` }} />
      <div className="mt-3 flex justify-end">
        <button onClick={handlePost} disabled={posting} className="px-5 py-2 rounded-xl font-bold text-white text-sm flex items-center gap-2"
          style={{ background: posting ? T.greenSoft : T.green }}>
          {posting ? <><Loader size={14} className="animate-spin" /> Posting...</> : <><Send size={14} /> Post</>}
        </button>
      </div>
    </div>
  );
}


function FundraiserCard({ fundraiser, onDonate }) {
  const raised = Number(fundraiser.raised) || 0;
  const goal = Number(fundraiser.goal) || 1;
  const pct = Math.min(100, Math.round((raised / goal) * 100));
  const met = fundraiser.status === "reached" || raised >= goal;
  return (
    <motion.div layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5" style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
      <div className="flex items-start gap-3">
        <Avatar initials={fundraiser.avatar} size={42} />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <span className="font-bold text-sm" style={{ color: T.text }}>{fundraiser.author}</span>
              <span className="ml-2 text-xs" style={{ color: T.gray }}>{fundraiser.time}</span>
            </div>
            <div className="flex gap-1">
              {fundraiser.urgent && <Tag color="#FFF0F0" textColor="#C0392B">🚨 Urgent</Tag>}
              <Tag>{fundraiser.tag}</Tag>
            </div>
          </div>
          <h3 className="mt-2 font-bold" style={{ color: T.text, fontFamily: "Georgia, serif" }}>{fundraiser.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed line-clamp-2" style={{ color: T.textMute }}>{fundraiser.description}</p>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: T.textMute }}>
              <span><span className="font-bold text-sm" style={{ color: T.green }}>₹{raised.toLocaleString()}</span> raised of ₹{goal.toLocaleString()}</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: T.grayLight }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full" style={{ background: met ? T.greenMid : T.greenSoft }} />
            </div>
          </div>
          {met ? (
            <div className="mt-3 flex items-center gap-1.5 text-sm font-bold" style={{ color: T.greenMid }}>
              <CheckCircle size={15} /> Goal Met! Thank you community 🎉
            </div>
          ) : (
            <button onClick={() => onDonate(fundraiser)}
              className="mt-3 w-full py-2 rounded-xl text-sm font-bold"
              style={{ background: T.green, color: T.white }}>
              💛 Donate & Earn Credits
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function DonateModal({ fundraiser, onClose }) {
  const { user, setPage, showToast, addCredits, profile } = useApp();
  const [amount, setAmount] = useState(500);
  const [donating, setDonating] = useState(false);
  const [done, setDone] = useState(false);
  const creditsEarned = Math.floor(amount / 10);
  const presets = [200, 500, 1000, 2000];

  const handleDonate = async () => {
    if (!user) { onClose(); setPage("login"); showToast("Please sign in to donate", "error"); return; }
    if (!amount || amount < 1) { showToast("Enter a valid amount", "error"); return; }
    setDonating(true);
    const loaded = await new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true); script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
    if (!loaded) { setDonating(false); showToast("Failed to load payment gateway.", "error"); return; }
    const rzp = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amount * 100, currency: "INR",
      name: "AgriRoot Community Fund",
      description: `Donation to ${fundraiser.author}`,
      handler: async () => {
        try { await api.post("/donation", { fundraiser_id: fundraiser.id, donor_id: user.id, amount }); await addCredits(creditsEarned); } catch (_) {}
        setDonating(false); setDone(true);
      },
      prefill: { name: profile?.name || "", contact: profile?.phone || "" },
      theme: { color: "#1B4332" },
      modal: { ondismiss: () => { setDonating(false); showToast("Payment cancelled", "error"); } },
    });
    rzp.on("payment.failed", () => { setDonating(false); showToast("Payment failed. Try again.", "error"); });
    rzp.open();
  };

  if (done) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
        className="w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl" style={{ background: T.white }}>
        <div className="text-5xl mb-4">💛</div>
        <h2 className="text-xl font-black mb-2" style={{ color: T.green, fontFamily: "Georgia, serif" }}>Thank you!</h2>
        <p className="text-sm mb-1" style={{ color: T.textMute }}>You donated <strong>₹{amount.toLocaleString()}</strong> to {fundraiser.author}</p>
        <div className="mt-4 py-3 px-5 rounded-2xl inline-block" style={{ background: "#FFF8E7" }}>
          <span className="text-sm font-bold" style={{ color: "#B7791F" }}>⭐ +{creditsEarned} credits earned!</span>
          <p className="text-xs mt-0.5" style={{ color: "#B7791F" }}>Use credits to buy items in the Marketplace</p>
        </div>
        <button onClick={onClose} className="mt-5 w-full py-3 rounded-2xl font-bold text-white" style={{ background: T.green }}>Done</button>
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        className="w-full max-w-sm rounded-3xl p-6 shadow-2xl" style={{ background: "#fff" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black" style={{ color: T.text, fontFamily: "Georgia, serif" }}>Donate to {fundraiser.author}</h2>
          <button onClick={onClose} className="p-2 rounded-xl" style={{ background: T.sand }}><X size={16} style={{ color: T.gray }} /></button>
        </div>
        <p className="text-sm mb-4 line-clamp-2" style={{ color: T.textMute }}>{fundraiser.title}</p>
        <div className="flex gap-2 mb-4 flex-wrap">
          {presets.map(p => (
            <button key={p} onClick={() => setAmount(p)} type="button"
              className="px-3 py-1.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: amount === p ? T.green : T.sand, color: amount === p ? T.white : T.text }}>
              ₹{p}
            </button>
          ))}
        </div>
        <div className="mb-2">
          <label className="text-xs font-bold block mb-1.5" style={{ color: T.textMute }}>CUSTOM AMOUNT (₹)</label>
          <input type="number" min="1" value={amount} onChange={e => setAmount(+e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: T.sand, border: `1.5px solid ${T.grayLight}`, color: T.text }} />
        </div>
        <div className="py-3 px-4 rounded-xl mb-4 flex items-center justify-between" style={{ background: "#FFF8E7" }}>
          <span className="text-sm" style={{ color: "#B7791F" }}>Credits you'll earn</span>
          <span className="font-black" style={{ color: "#B7791F" }}>⭐ {Math.floor(amount / 10)}</span>
        </div>
        <button onClick={handleDonate} disabled={donating}
          className="w-full py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
          style={{ background: donating ? T.greenSoft : T.green }}>
          {donating ? <><Loader size={15} className="animate-spin" /> Processing...</> : `💛 Donate ₹${amount?.toLocaleString() || 0}`}
        </button>
      </motion.div>
    </motion.div>
  );
}

function CreateFundraiser({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", goal: "", tag: "" });
  const [submitting, setSubmitting] = useState(false);
  const { showToast, user, setPage } = useApp();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!user) { setPage("login"); showToast("Please sign in to post a fundraiser", "error"); return; }
    if (!form.title.trim() || !form.goal || +form.goal < 1) { showToast("Please fill in title and goal amount", "error"); return; }
    setSubmitting(true);
    try {
      const question = await api.post("/forum-question", { author_id: user.id, title: form.title, body: form.description || form.title, topic_id: null });
      const fund = await api.post("/fundraiser", { question_id: question.question_id, goal_amount: +form.goal });
      onAdd({ id: fund.fundraiser_id, author: user.name, avatar: user.name.slice(0, 2).toUpperCase(), title: form.title, description: form.description, goal: +form.goal, raised: 0, tag: form.tag || "General", time: "just now", status: "open" });
      setForm({ title: "", description: "", goal: "", tag: "" });
      setOpen(false);
      showToast("Fundraiser posted!");
    } catch (err) { showToast("Failed to post fundraiser. Try again.", "error"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="rounded-2xl p-5 mb-6" style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between font-bold text-sm" style={{ color: T.text }}>
        <span>🆘 Request community support</span>
        <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none", transition: "0.2s" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pt-4 space-y-3">
              <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="What do you need? (e.g. Tractor for harvest)"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: T.sand, border: `1px solid ${T.grayLight}` }} />
              <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Tell your story — why you need this and how it'll help..." rows={3}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ background: T.sand, border: `1px solid ${T.grayLight}` }} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" min="1" value={form.goal} onChange={e => set("goal", e.target.value)} placeholder="Goal amount (₹)"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: T.sand, border: `1px solid ${T.grayLight}` }} />
                <input value={form.tag} onChange={e => set("tag", e.target.value)} placeholder="Tag (e.g. Equipment)"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: T.sand, border: `1px solid ${T.grayLight}` }} />
              </div>
              <button onClick={handleSubmit} disabled={submitting} className="w-full py-2.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
                style={{ background: submitting ? T.greenSoft : T.green }}>
                {submitting ? <><Loader size={14} className="animate-spin" /> Posting...</> : "Post Fundraiser"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [fundraisers, setFundraisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("forum");
  const [donateTarget, setDonateTarget] = useState(null);
  useEffect(() => {
    Promise.all([api.get("/forum-question"), api.get("/fundraiser")])
      .then(([questions, funds]) => {
        setPosts(questions.map(q => ({
          id: q.question_id, author: q.author_name,
          avatar: q.author_name.slice(0, 2).toUpperCase(),
          title: q.title, body: q.body, likes: 0, comments: 0,
          tag: q.topic_name || "General",
          time: new Date(q.created_at).toLocaleDateString(),
        })));
        setFundraisers(funds.map(f => ({
          id: f.fundraiser_id, author: f.question_author,
          avatar: f.question_author.slice(0, 2).toUpperCase(),
          title: f.question_title, description: "",
          goal: Number(f.goal_amount), raised: Number(f.total_donated),
          tag: "Community", time: new Date(f.created_at).toLocaleDateString(),
          status: f.status,
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <AnimatePresence>
        {donateTarget && <DonateModal fundraiser={donateTarget} onClose={() => setDonateTarget(null)} />}
      </AnimatePresence>
      <h1 className="text-3xl font-black mb-1" style={{ color: T.green, fontFamily: "Georgia, serif" }}>Community</h1>
      <p className="text-sm mb-6" style={{ color: T.textMute }}>Share knowledge, support those in need, grow together.</p>

      <div className="flex gap-2 mb-6">
        {[{ id: "forum", label: "💬 Forum" }, { id: "fundraise", label: "💛 Community Fund" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-5 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: tab === t.id ? T.green : T.white, color: tab === t.id ? T.white : T.text, border: `1px solid ${tab === t.id ? T.green : T.grayLight}` }}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          {tab === "forum" && (
            <>
              <CreatePost onPost={p => setPosts(prev => [p, ...prev])} />
              <div className="space-y-4">
                {loading ? [1, 2, 3].map(i => <SkeletonCard key={i} />) :
                  posts.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}>
                      <PostCard post={p} />
                    </motion.div>
                  ))}
              </div>
            </>
          )}
          {tab === "fundraise" && (
            <>
              <div className="rounded-2xl p-4 mb-6 flex items-start gap-3" style={{ background: "#FFF8E7", border: "1px solid #F6E05E" }}>
                <span className="text-2xl">⭐</span>
                <div>
                  <div className="font-bold text-sm" style={{ color: "#92400E" }}>⭐ Credit Rewards</div>
                  <div className="text-xs mt-0.5" style={{ color: "#B7791F" }}>Donate to the Community Fund and earn credits — every ₹10 = 1 credit. Spend credits in the Marketplace.</div>
                </div>
              </div>
              <CreateFundraiser onAdd={f => setFundraisers(prev => [f, ...prev])} />
              <div className="space-y-4">
                {loading ? [1, 2, 3].map(i => <SkeletonCard key={i} />) :
                  fundraisers.map((f, i) => (
                    <motion.div key={f.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}>
                      <FundraiserCard fundraiser={f} onDonate={setDonateTarget} />
                    </motion.div>
                  ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════

function AppShell() {
  const { page } = useApp();
  const authPages = ["login", "register"];
  const isAuthPage = authPages.includes(page);

  const pages = {
    landing:     <LandingPage />,
    login:       <LoginPage />,
    register:    <RegisterPage />,
    contracts:   <ContractPage />,
    marketplace: <MarketplacePage />,
    rental:      <RentalPage />,
    community:   <CommunityPage />,
    profile:     <RequireAuth><ProfilePage /></RequireAuth>,
  };

  return (
    <div className="min-h-screen" style={{ background: T.cream, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {!isAuthPage && <Navbar />}
      <main>
        <AnimatePresence mode="wait">
          <motion.div key={page}
            initial={{ opacity: 0, y: isAuthPage ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isAuthPage ? 0 : -8 }}
            transition={{ duration: 0.2 }}>
            {pages[page] || <LandingPage />}
          </motion.div>
        </AnimatePresence>
      </main>
      {!isAuthPage && (
        <footer className="text-center py-8 text-sm border-t mt-10" style={{ color: T.gray, borderColor: T.grayLight }}>
          © 2025 AgriRoot · Farmer-first sustainable agriculture
        </footer>
      )}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}