// ============================================================
// AgriPlatform.jsx — Sustainable Agriculture Platform
// Single-file React app. All components included below.
// Stack: React + Tailwind (CDN) + Framer Motion + Lucide React
// ============================================================

import { useState, useEffect, useRef, createContext, useContext } from "react";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import {
  Leaf, Tractor, ShoppingBasket, Users, ChevronRight, Star,
  MapPin, Calendar, Search, Plus, Minus, X, ArrowUp,
  CheckCircle, Package, Wheat, Sun, Droplets, Wind,
  MessageSquare, ThumbsUp, Menu, ShoppingCart, Sprout,
  ClipboardList, TrendingUp, Filter, Bell, User, ChevronDown,
  BarChart2, Clock, Heart, Share2, Send, Loader
} from "lucide-react";

// ─── DESIGN TOKENS ───────────────────────────────────────────
const T = {
  green: "#1B4332",
  greenLight: "#2D6A4F",
  greenMid: "#40916C",
  greenSoft: "#74C69D",
  greenPale: "#D8F3DC",
  brown: "#6A4E42",
  brownLight: "#A0756A",
  brownPale: "#F0E6E3",
  cream: "#F8F9FA",
  sand: "#F4F1EA",
  white: "#FFFFFF",
  gray: "#6C757D",
  grayLight: "#DEE2E6",
  text: "#1A1A1A",
  textMute: "#555",
};

// ─── GLOBAL STATE (Context) ───────────────────────────────────
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

function AppProvider({ children }) {
  const [page, setPage] = useState("landing");
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);

  const addToCart = (item) => {
    setCart((c) => {
      const ex = c.find((x) => x.id === item.id);
      if (ex) return c.map((x) => x.id === item.id ? { ...x, qty: x.qty + 1 } : x);
      return [...c, { ...item, qty: 1 }];
    });
    showToast(`${item.name} added to cart`);
  };

  const removeFromCart = (id) => setCart((c) => c.filter((x) => x.id !== id));

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <AppContext.Provider value={{ page, setPage, cart, addToCart, removeFromCart, toast, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── MOCK DATA ────────────────────────────────────────────────
const FARMERS = [
  { id: 1, name: "Ramesh Yadav", location: "Punjab, India", crop: "Wheat", rating: 4.8, contracts: 34, avatar: "RY", verified: true, price: 2200 },
  { id: 2, name: "Sunita Devi", location: "Maharashtra", crop: "Soybean", rating: 4.6, contracts: 21, avatar: "SD", verified: true, price: 4100 },
  { id: 3, name: "Arjun Patil", location: "Karnataka", crop: "Cotton", rating: 4.9, contracts: 47, avatar: "AP", verified: true, price: 6500 },
  { id: 4, name: "Meena Kumari", location: "Rajasthan", crop: "Mustard", rating: 4.7, contracts: 18, avatar: "MK", verified: false, price: 5200 },
];

const CROPS = [
  { id: 1, name: "Organic Wheat", category: "Grain", price: 45, unit: "kg", stock: 2400, img: "🌾", farmer: "Ramesh Yadav", rating: 4.8 },
  { id: 2, name: "Basmati Rice", category: "Grain", price: 92, unit: "kg", stock: 800, img: "🍚", farmer: "Priya Singh", rating: 4.9 },
  { id: 3, name: "Fresh Tomatoes", category: "Vegetable", price: 28, unit: "kg", stock: 450, img: "🍅", farmer: "Arjun Patil", rating: 4.7 },
  { id: 4, name: "Green Chickpea", category: "Pulse", price: 68, unit: "kg", stock: 1200, img: "🫘", farmer: "Sunita Devi", rating: 4.6 },
  { id: 5, name: "Black Mustard", category: "Oilseed", price: 55, unit: "kg", stock: 600, img: "🌿", farmer: "Meena Kumari", rating: 4.8 },
  { id: 6, name: "Red Onion", category: "Vegetable", price: 22, unit: "kg", stock: 3200, img: "🧅", farmer: "Rajesh More", rating: 4.5 },
];

const EQUIPMENT = [
  { id: 1, name: "John Deere Tractor 5E", category: "Tractor", price: 1200, unit: "day", owner: "Harpreet Singh", location: "Ludhiana, Punjab", distance: "12 km", rating: 4.9, available: true, img: "🚜", specs: { power: "75 HP", fuel: "Diesel", capacity: "4WD", year: 2021 } },
  { id: 2, name: "Rotavator 6-ft", category: "Tillage", price: 450, unit: "day", owner: "Santosh Kumar", location: "Nagpur, MH", distance: "5 km", rating: 4.7, available: true, img: "⚙️", specs: { width: "6 ft", blades: "36", depth: "20cm", year: 2022 } },
  { id: 3, name: "Paddy Thresher", category: "Harvesting", price: 800, unit: "day", owner: "Vijay Reddy", location: "Guntur, AP", distance: "8 km", rating: 4.8, available: false, img: "🌾", specs: { capacity: "800 kg/hr", motor: "5 HP", type: "Axial", year: 2020 } },
  { id: 4, name: "Drip Irrigation Kit", category: "Irrigation", price: 350, unit: "day", owner: "Anita Joshi", location: "Pune, MH", distance: "3 km", rating: 4.6, available: true, img: "💧", specs: { area: "1 acre", pipes: "500m", emitters: "200", year: 2023 } },
];

const POSTS = [
  { id: 1, author: "Ramesh Yadav", avatar: "RY", title: "How I doubled my wheat yield using vermicompost", body: "After switching from chemical fertilizers to vermicompost three seasons ago, I noticed dramatic improvements in soil health and yield. Here's my step-by-step process...", likes: 142, comments: 28, tag: "Soil Health", time: "2h ago" },
  { id: 2, author: "Dr. Priya Nair", avatar: "PN", title: "Early blight in tomatoes — detection and organic treatment", body: "Early blight caused by Alternaria solani can devastate a tomato crop within weeks. In this post I explain the warning signs and share an effective neem-oil spray schedule...", likes: 89, comments: 15, tag: "Pest Control", time: "5h ago" },
  { id: 3, author: "Suresh Mane", avatar: "SM", title: "Peer-to-peer water sharing in drought-prone zones", body: "Our village cooperative built a shared drip network across 22 farms. Water costs dropped by 40%. I am sharing our model so others can replicate it...", likes: 214, comments: 43, tag: "Water", time: "1d ago" },
];

// ─── UTILITY COMPONENTS ───────────────────────────────────────

function Tag({ children, color = T.greenPale, textColor = T.green }) {
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: color, color: textColor }}>
      {children}
    </span>
  );
}

function Avatar({ initials, size = 40 }) {
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
      <Star size={13} fill="#F59E0B" />
      {rating}
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

// ─── NAV ─────────────────────────────────────────────────────

function Navbar() {
  const { page, setPage, cart } = useApp();
  const [open, setOpen] = useState(false);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const links = [
    { id: "landing", label: "Home" },
    { id: "contracts", label: "Contracts" },
    { id: "marketplace", label: "Marketplace" },
    { id: "equipment", label: "Equipment" },
    { id: "community", label: "Community" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b" style={{ background: T.white, borderColor: T.grayLight }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <button onClick={() => setPage("landing")} className="flex items-center gap-2 font-black text-xl" style={{ color: T.green }}>
          <Sprout size={26} style={{ color: T.greenMid }} />
          <span style={{ fontFamily: "Georgia, serif" }}>AgriRoot</span>
        </button>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <button key={l.id} onClick={() => setPage(l.id)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ color: page === l.id ? T.white : T.text, background: page === l.id ? T.green : "transparent" }}>
              {l.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
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
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            <Menu size={22} style={{ color: T.green }} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
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
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─── TOAST ────────────────────────────────────────────────────

function Toast() {
  const { toast } = useApp();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl text-white text-sm font-medium shadow-xl flex items-center gap-2"
          style={{ background: T.green }}>
          <CheckCircle size={16} />
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE 1: LANDING
// ═══════════════════════════════════════════════════════════════

function GrowthIllustration() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="flex items-end justify-center gap-2 h-32">
      {[30, 55, 40, 70, 50, 90, 65].map((h, i) => (
        <motion.div key={i}
          initial={{ height: 0, opacity: 0 }}
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
    { icon: <ClipboardList size={24} />, title: "Direct Contracts", desc: "Negotiate directly with farmers. Zero middlemen, fair prices.", page: "contracts", color: T.greenPale },
    { icon: <ShoppingBasket size={24} />, title: "Smart Marketplace", desc: "Browse fresh crops, build bundles, and order with one tap.", page: "marketplace", color: T.brownPale },
    { icon: <Tractor size={24} />, title: "Equipment Rental", desc: "Rent tractors and tools from neighbours by the day.", page: "equipment", color: "#E8F4F8" },
    { icon: <Users size={24} />, title: "Community Forum", desc: "Share knowledge, ask questions, grow together.", page: "community", color: "#FFF8E7" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {features.map((f, i) => (
        <motion.button key={i} onClick={() => setPage(f.page)}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.04 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          className="rounded-2xl p-6 text-left shadow-sm hover:shadow-md transition-shadow"
          style={{ background: f.color }}>
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
  const { setPage } = useApp();
  return (
    <section className="relative overflow-hidden py-20 px-4" style={{ background: T.green }}>
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: T.greenSoft, transform: "translate(30%, -30%)" }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10" style={{ background: T.greenSoft, transform: "translate(-30%, 30%)" }} />

      <div className="max-w-4xl mx-auto text-center relative">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Tag color="rgba(255,255,255,0.15)" textColor="#fff">🌱 Farmer-First Platform</Tag>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
          className="mt-5 text-4xl sm:text-6xl font-black leading-tight text-white"
          style={{ fontFamily: "Georgia, serif" }}>
          Grow Smarter.<br />Earn Better.
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.4 }}
          className="mt-5 text-lg max-w-xl mx-auto" style={{ color: T.greenSoft }}>
          Connect directly with buyers, rent equipment from neighbours, and learn from a community of 50,000+ farmers across India.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.3 }}
          className="mt-8 flex flex-wrap gap-3 justify-center">
          <button onClick={() => setPage("contracts")}
            className="px-7 py-3 rounded-2xl font-bold text-white transition-all hover:opacity-90"
            style={{ background: T.brown }}>
            Find Farmers
          </button>
          <button onClick={() => setPage("marketplace")}
            className="px-7 py-3 rounded-2xl font-bold transition-all hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.12)", color: T.white, border: `1px solid rgba(255,255,255,0.2)` }}>
            Browse Market
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-12 grid grid-cols-3 gap-6 max-w-sm mx-auto">
          {[["50K+", "Farmers"], ["₹420Cr", "Transacted"], ["18", "States"]].map(([n, l]) => (
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
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-center mb-10">
          <h2 className="text-3xl font-black" style={{ color: T.green, fontFamily: "Georgia, serif" }}>
            Everything a farmer needs
          </h2>
          <p className="mt-2 text-sm" style={{ color: T.textMute }}>One platform. Every tool. Real relationships.</p>
        </motion.div>
        <FeatureCards />

        <div className="mt-20 rounded-3xl p-10 text-center" style={{ background: T.sand }}>
          <h3 className="text-2xl font-bold mb-4" style={{ color: T.green, fontFamily: "Georgia, serif" }}>
            Seasonal Growth Dashboard
          </h3>
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

// ═══════════════════════════════════════════════════════════════
// PAGE 2: CONTRACT FARMING
// ═══════════════════════════════════════════════════════════════

function FarmerCard({ farmer, onSelect, selected }) {
  return (
    <motion.div layout
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelect(farmer)}
      className="rounded-2xl p-4 cursor-pointer transition-all"
      style={{
        background: selected ? T.greenPale : T.white,
        border: `2px solid ${selected ? T.greenMid : T.grayLight}`,
        boxShadow: selected ? `0 0 0 3px ${T.greenSoft}33` : "none"
      }}>
      <div className="flex items-start gap-3">
        <Avatar initials={farmer.avatar} size={48} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold truncate" style={{ color: T.text }}>{farmer.name}</span>
            {farmer.verified && <CheckCircle size={14} style={{ color: T.greenMid }} />}
          </div>
          <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: T.gray }}>
            <MapPin size={11} />{farmer.location}
          </div>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Tag>{farmer.crop}</Tag>
            <StarRating rating={farmer.rating} />
            <span className="text-xs" style={{ color: T.gray }}>{farmer.contracts} contracts</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-bold text-sm" style={{ color: T.green }}>₹{farmer.price.toLocaleString()}</div>
          <div className="text-xs" style={{ color: T.gray }}>per quintal</div>
        </div>
      </div>
    </motion.div>
  );
}

function PriceChart({ crop }) {
  const data = [2100, 2250, 2180, 2400, 2320, 2500, 2200, 2380, 2450].map((v, i) => ({
    v, label: `W${i + 1}`
  }));
  const max = Math.max(...data.map(d => d.v));
  const min = Math.min(...data.map(d => d.v));

  return (
    <div className="rounded-2xl p-5" style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold" style={{ color: T.text }}>Price trend — {crop || "Wheat"}</span>
        <Tag color={T.greenPale}>Last 9 weeks</Tag>
      </div>
      <div className="flex items-end gap-2 h-28">
        {data.map((d, i) => (
          <motion.div key={i} layout className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              initial={{ height: 0 }} animate={{ height: `${((d.v - min) / (max - min)) * 80 + 10}%` }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="w-full rounded-t-lg"
              style={{ background: i === data.length - 1 ? T.greenMid : T.greenSoft }} />
            <span className="text-xs" style={{ color: T.gray }}>{d.label}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-3 flex justify-between text-xs" style={{ color: T.gray }}>
        <span>Min ₹{min}</span>
        <span>Max ₹{max}</span>
      </div>
    </div>
  );
}

function ContractBuilder({ farmer, onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ quantity: 50, duration: "3", delivery: "", notes: "" });
  const { showToast } = useApp();

  const submit = async () => {
    setLoading(true);
    // POST /api/contracts
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setDone(true);
    setTimeout(() => { onClose(); showToast("Contract sent to " + farmer.name); }, 1800);
  };

  if (done) return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="text-center py-10 px-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}>
        <CheckCircle size={64} style={{ color: T.greenMid, margin: "0 auto 16px" }} />
      </motion.div>
      <div className="text-xl font-bold" style={{ color: T.green }}>Contract Submitted!</div>
      <div className="text-sm mt-2" style={{ color: T.textMute }}>
        {farmer.name} will be notified shortly.
      </div>
    </motion.div>
  );

  return (
    <div>
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.grayLight }}>
        <div>
          <div className="font-bold" style={{ color: T.text }}>Build Contract</div>
          <div className="text-xs" style={{ color: T.gray }}>with {farmer.name}</div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg" style={{ color: T.gray }}><X size={18} /></button>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold block mb-1.5" style={{ color: T.textMute }}>QUANTITY (Quintals)</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setForm(f => ({ ...f, quantity: Math.max(1, f.quantity - 5) }))}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: T.sand }}>
              <Minus size={15} />
            </button>
            <span className="text-xl font-bold w-12 text-center" style={{ color: T.green }}>{form.quantity}</span>
            <button onClick={() => setForm(f => ({ ...f, quantity: f.quantity + 5 }))}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: T.sand }}>
              <Plus size={15} />
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold block mb-1.5" style={{ color: T.textMute }}>DURATION</label>
          <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{ background: T.sand, border: `1px solid ${T.grayLight}`, color: T.text }}>
            <option value="3">3 Months</option>
            <option value="6">6 Months</option>
            <option value="12">12 Months</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold block mb-1.5" style={{ color: T.textMute }}>DELIVERY LOCATION</label>
          <input value={form.delivery} onChange={e => setForm(f => ({ ...f, delivery: e.target.value }))}
            placeholder="e.g. APMC Yard, Nagpur"
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{ background: T.sand, border: `1px solid ${T.grayLight}`, color: T.text }} />
        </div>

        <div className="rounded-xl p-4" style={{ background: T.greenPale }}>
          <div className="flex justify-between text-sm">
            <span style={{ color: T.textMute }}>Estimated Value</span>
            <span className="font-bold" style={{ color: T.green }}>
              ₹{(farmer.price * form.quantity / 100).toLocaleString()}
            </span>
          </div>
        </div>

        <button onClick={submit} disabled={loading}
          className="w-full py-3 rounded-2xl font-bold text-white transition-all"
          style={{ background: loading ? T.greenSoft : T.green }}>
          {loading ? <span className="flex items-center justify-center gap-2"><Loader size={16} className="animate-spin" /> Submitting...</span> : "Send Contract Proposal"}
        </button>
      </div>
    </div>
  );
}

function ContractPage() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // GET /api/farmers
    setTimeout(() => { setFarmers(FARMERS); setLoading(false); }, 700);
  }, []);

  const filtered = farmers.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.crop.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black mb-1" style={{ color: T.green, fontFamily: "Georgia, serif" }}>Direct Contract Farming</h1>
      <p className="text-sm mb-8" style={{ color: T.textMute }}>Connect with verified farmers and negotiate fair contracts</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Farmer list */}
        <div className="lg:col-span-1 space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.gray }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search farmers or crops..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: T.white, border: `1px solid ${T.grayLight}` }} />
          </div>

          {loading ? [1, 2, 3].map(i => <SkeletonCard key={i} />) :
            filtered.map((f, i) => (
              <motion.div key={f.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <FarmerCard farmer={f} onSelect={setSelected} selected={selected?.id === f.id} />
              </motion.div>
            ))}
        </div>

        {/* Right: Details */}
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
                      <div className="flex items-center gap-1 text-sm mt-1" style={{ color: T.gray }}>
                        <MapPin size={13} />{selected.location}
                      </div>
                      <div className="flex gap-4 mt-4 text-sm">
                        <div><div className="font-bold" style={{ color: T.text }}>{selected.contracts}</div><div style={{ color: T.gray }}>Contracts</div></div>
                        <div><div className="font-bold" style={{ color: T.text }}>{selected.rating}</div><div style={{ color: T.gray }}>Rating</div></div>
                        <div><div className="font-bold" style={{ color: T.text }}>₹{selected.price.toLocaleString()}</div><div style={{ color: T.gray }}>per quintal</div></div>
                      </div>
                    </div>
                    <button onClick={() => setShowBuilder(true)}
                      className="px-5 py-2.5 rounded-xl font-bold text-white text-sm"
                      style={{ background: T.green }}>
                      Create Contract
                    </button>
                  </div>
                </div>
                <PriceChart crop={selected.crop} />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="rounded-2xl flex flex-col items-center justify-center py-20" style={{ background: T.sand }}>
              <Leaf size={40} style={{ color: T.greenSoft }} />
              <p className="mt-4 text-sm" style={{ color: T.textMute }}>Select a farmer to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Contract Builder Modal */}
      <AnimatePresence>
        {showBuilder && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={(e) => e.target === e.currentTarget && setShowBuilder(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md rounded-3xl overflow-hidden" style={{ background: T.white }}>
              <ContractBuilder farmer={selected} onClose={() => setShowBuilder(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE 3: MARKETPLACE
// ═══════════════════════════════════════════════════════════════

function MarketplaceCard({ crop }) {
  const { addToCart } = useApp();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart({ id: crop.id, name: crop.name, price: crop.price, unit: crop.unit });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
      <div className="p-5 text-5xl text-center" style={{ background: T.sand }}>{crop.img}</div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-bold text-sm" style={{ color: T.text }}>{crop.name}</div>
            <div className="text-xs mt-0.5" style={{ color: T.gray }}>{crop.farmer}</div>
          </div>
          <StarRating rating={crop.rating} />
        </div>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="font-black text-lg" style={{ color: T.green }}>₹{crop.price}</span>
            <span className="text-xs ml-1" style={{ color: T.gray }}>/{crop.unit}</span>
          </div>
          <Tag color={T.greenPale}>{crop.stock.toLocaleString()} kg left</Tag>
        </div>
        <motion.button onClick={handleAdd}
          animate={added ? { scale: [1, 1.15, 1] } : {}}
          className="mt-3 w-full py-2 rounded-xl text-sm font-bold transition-all"
          style={{
            background: added ? T.greenPale : T.green,
            color: added ? T.greenMid : T.white
          }}>
          {added ? "✓ Added!" : "Add to Cart"}
        </motion.button>
      </div>
    </motion.div>
  );
}

function CropSearch({ value, onChange }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.gray }} />
      <input value={value} onChange={e => onChange(e.target.value)}
        placeholder="Search crops, grains, vegetables..."
        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
        style={{ background: T.white, border: `1px solid ${T.grayLight}` }} />
    </div>
  );
}

function BundleModal({ onClose }) {
  const { addToCart, showToast } = useApp();
  const bundle = [
    { id: 10, name: "Wheat 10kg", price: 450, unit: "bundle" },
    { id: 11, name: "Rice 5kg", price: 460, unit: "bundle" },
    { id: 12, name: "Dal 3kg", price: 204, unit: "bundle" },
  ];

  const handleBundle = () => {
    bundle.forEach(i => addToCart(i));
    showToast("Bundle added to cart! 🎉");
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="w-full max-w-sm rounded-3xl overflow-hidden" style={{ background: T.white }}>
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.grayLight }}>
          <div className="font-bold" style={{ color: T.text }}>Staples Bundle 🛒</div>
          <button onClick={onClose} style={{ color: T.gray }}><X size={18} /></button>
        </div>
        <div className="p-5 space-y-3">
          {bundle.map((item, i) => (
            <motion.div key={item.id}
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-3 rounded-xl" style={{ background: T.sand }}>
              <span className="text-sm font-medium" style={{ color: T.text }}>{item.name}</span>
              <span className="font-bold text-sm" style={{ color: T.green }}>₹{item.price}</span>
            </motion.div>
          ))}
          <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: T.grayLight }}>
            <span style={{ color: T.text }}>Total</span>
            <span style={{ color: T.green }}>₹{bundle.reduce((s, i) => s + i.price, 0)}</span>
          </div>
          <button onClick={handleBundle}
            className="w-full py-3 rounded-2xl font-bold text-white"
            style={{ background: T.green }}>
            Add Bundle to Cart
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MarketplacePage() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showBundle, setShowBundle] = useState(false);
  const { cart, removeFromCart } = useApp();
  const [showCart, setShowCart] = useState(false);

  const categories = ["All", "Grain", "Vegetable", "Pulse", "Oilseed"];

  useEffect(() => {
    // GET /api/crops
    setTimeout(() => { setCrops(CROPS); setLoading(false); }, 600);
  }, []);

  const filtered = crops.filter(c =>
    (category === "All" || c.category === category) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-black" style={{ color: T.green, fontFamily: "Georgia, serif" }}>Smart Marketplace</h1>
          <p className="text-sm" style={{ color: T.textMute }}>Fresh from the farm, direct to you</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBundle(true)}
            className="px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: T.brownPale, color: T.brown }}>
            📦 Bundles
          </button>
          <button onClick={() => setShowCart(v => !v)}
            className="px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: T.greenPale, color: T.green }}>
            🛒 Cart ({cart.length})
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <CropSearch value={search} onChange={setSearch} />
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: category === c ? T.green : T.sand,
                color: category === c ? T.white : T.text
              }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Cart panel */}
      <AnimatePresence>
        {showCart && cart.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mt-4 rounded-2xl p-4" style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
            <div className="font-bold mb-3" style={{ color: T.text }}>Your Cart</div>
            {cart.map(i => (
              <div key={i.id} className="flex items-center justify-between py-2 border-b text-sm" style={{ borderColor: T.grayLight }}>
                <span style={{ color: T.text }}>{i.name} × {i.qty}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold" style={{ color: T.green }}>₹{i.price * i.qty}</span>
                  <button onClick={() => removeFromCart(i.id)} style={{ color: T.gray }}><X size={14} /></button>
                </div>
              </div>
            ))}
            <div className="flex justify-between mt-3 font-bold">
              <span>Total</span>
              <span style={{ color: T.green }}>₹{cartTotal}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />) :
          filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
              <MarketplaceCard crop={c} />
            </motion.div>
          ))}
      </div>

      <AnimatePresence>{showBundle && <BundleModal onClose={() => setShowBundle(false)} />}</AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE 4: EQUIPMENT RENTAL (CORE)
// ═══════════════════════════════════════════════════════════════

function EquipmentCard({ equip }) {
  const [expanded, setExpanded] = useState(false);
  const [showRent, setShowRent] = useState(false);
  const { showToast } = useApp();
  const [renting, setRenting] = useState(false);
  const [date, setDate] = useState("");

  const handleRent = async () => {
    if (!date) { showToast("Please pick a date"); return; }
    setRenting(true);
    // POST /api/equipment/rent
    await new Promise(r => setTimeout(r, 1000));
    setRenting(false);
    setShowRent(false);
    showToast(`${equip.name} booked for ${date}!`);
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="text-4xl">{equip.img}</div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold" style={{ color: T.text }}>{equip.name}</div>
                <div className="text-xs mt-0.5" style={{ color: T.gray }}>{equip.category}</div>
              </div>
              <Tag color={equip.available ? T.greenPale : "#FFE4E4"} textColor={equip.available ? T.green : "#C0392B"}>
                {equip.available ? "Available" : "Booked"}
              </Tag>
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <StarRating rating={equip.rating} />
              <span className="flex items-center gap-1" style={{ color: T.gray }}>
                <MapPin size={11} />{equip.distance}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-xl font-black" style={{ color: T.green }}>₹{equip.price}</span>
              <span className="text-xs" style={{ color: T.gray }}>/{equip.unit}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={() => setExpanded(!expanded)}
            className="flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1"
            style={{ background: T.sand, color: T.text }}>
            Specs <ChevronDown size={14} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>
          {equip.available && (
            <button onClick={() => setShowRent(!showRent)}
              className="flex-1 py-2 rounded-xl text-sm font-bold"
              style={{ background: T.green, color: T.white }}>
              Rent Now
            </button>
          )}
        </div>
      </div>

      {/* Specs accordion */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t" style={{ borderColor: T.grayLight }}>
            <div className="p-4 grid grid-cols-2 gap-3">
              {Object.entries(equip.specs).map(([k, v]) => (
                <div key={k} className="rounded-xl p-3" style={{ background: T.sand }}>
                  <div className="text-xs capitalize" style={{ color: T.gray }}>{k}</div>
                  <div className="font-bold text-sm mt-0.5" style={{ color: T.text }}>{v}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rent panel */}
      <AnimatePresence>
        {showRent && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t" style={{ borderColor: T.grayLight }}>
            <div className="p-4 space-y-3">
              <div className="text-sm font-semibold" style={{ color: T.text }}>Book a Date</div>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: T.sand, border: `1px solid ${T.grayLight}` }} />
              <div className="text-xs" style={{ color: T.gray }}>Owner: {equip.owner} · {equip.location}</div>
              <button onClick={handleRent} disabled={renting}
                className="w-full py-2.5 rounded-xl font-bold text-white text-sm"
                style={{ background: renting ? T.greenSoft : T.green }}>
                {renting ? "Booking..." : `Confirm Rental · ₹${equip.price}`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RentalCalendar() {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const booked = [3, 7, 8, 15, 16, 22, 23, 24];

  return (
    <div className="rounded-2xl p-5" style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
      <div className="font-bold mb-4" style={{ color: T.text }}>Availability Calendar</div>
      <div className="grid grid-cols-7 gap-1.5">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="text-center text-xs font-bold" style={{ color: T.gray }}>{d}</div>
        ))}
        {days.map(d => (
          <motion.div key={d} whileHover={{ scale: 1.1 }}
            className="aspect-square flex items-center justify-center rounded-lg text-xs font-medium cursor-pointer"
            style={{
              background: booked.includes(d) ? "#FFE4E4" : T.greenPale,
              color: booked.includes(d) ? "#C0392B" : T.green
            }}>
            {d}
          </motion.div>
        ))}
      </div>
      <div className="flex gap-4 mt-3 text-xs" style={{ color: T.gray }}>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded inline-block" style={{ background: T.greenPale }} /> Available</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded inline-block" style={{ background: "#FFE4E4" }} /> Booked</span>
      </div>
    </div>
  );
}

function EquipmentMap() {
  const markers = [
    { label: "🚜", top: "30%", left: "20%", name: "Tractor" },
    { label: "⚙️", top: "55%", left: "60%", name: "Rotavator" },
    { label: "💧", top: "70%", left: "35%", name: "Irrigation" },
    { label: "🌾", top: "25%", left: "75%", name: "Thresher" },
  ];

  return (
    <div className="rounded-2xl overflow-hidden relative" style={{ height: 220, background: "#E8F5E9", border: `1px solid ${T.grayLight}` }}>
      <div className="absolute inset-0 flex items-center justify-center" style={{ color: T.greenSoft, fontSize: 60, opacity: 0.15 }}>
        🗺️
      </div>
      {markers.map((m, i) => (
        <motion.div key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.15, type: "spring" }}
          whileHover={{ scale: 1.2 }}
          className="absolute cursor-pointer"
          style={{ top: m.top, left: m.left }}>
          <div className="text-2xl">{m.label}</div>
          <div className="text-xs font-medium text-center -mt-1" style={{ color: T.green }}>{m.name}</div>
        </motion.div>
      ))}
      <div className="absolute bottom-3 left-3 text-xs px-2 py-1 rounded-lg font-medium" style={{ background: "rgba(255,255,255,0.85)", color: T.text }}>
        📍 Equipment near you
      </div>
    </div>
  );
}

function EquipmentPage() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");

  useEffect(() => {
    // GET /api/equipment
    setTimeout(() => { setEquipment(EQUIPMENT); setLoading(false); }, 600);
  }, []);

  const categories = ["All", "Tractor", "Tillage", "Harvesting", "Irrigation"];
  const filtered = category === "All" ? equipment : equipment.filter(e => e.category === category);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black mb-1" style={{ color: T.green, fontFamily: "Georgia, serif" }}>Equipment Rental</h1>
      <p className="text-sm mb-8" style={{ color: T.textMute }}>Rent farm equipment from trusted neighbours by the day</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Map & Calendar */}
        <div className="space-y-4">
          <EquipmentMap />
          <RentalCalendar />
        </div>

        {/* Right: Equipment listing */}
        <div className="lg:col-span-2">
          <div className="flex gap-2 flex-wrap mb-4">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: category === c ? T.green : T.sand, color: category === c ? T.white : T.text }}>
                {c}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {loading ? [1, 2, 3].map(i => <SkeletonCard key={i} />) :
              filtered.map((e, i) => (
                <motion.div key={e.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                  <EquipmentCard equip={e} />
                </motion.div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE 5: COMMUNITY FORUM
// ═══════════════════════════════════════════════════════════════

function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);

  const handleLike = () => {
    // POST /api/posts/upvote
    if (liked) { setLikes(l => l - 1); } else { setLikes(l => l + 1); }
    setLiked(!liked);
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5"
      style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
      <div className="flex items-start gap-3">
        <Avatar initials={post.avatar} size={42} />
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="font-bold text-sm" style={{ color: T.text }}>{post.author}</span>
              <span className="ml-2 text-xs" style={{ color: T.gray }}>{post.time}</span>
            </div>
            <Tag>{post.tag}</Tag>
          </div>
          <h3 className="mt-2 font-bold" style={{ color: T.text, fontFamily: "Georgia, serif" }}>{post.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed line-clamp-2" style={{ color: T.textMute }}>{post.body}</p>
          <div className="mt-4 flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleLike}
              className="flex items-center gap-1.5 text-sm font-medium"
              style={{ color: liked ? T.green : T.gray }}>
              <motion.div animate={liked ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.25 }}>
                <ThumbsUp size={15} fill={liked ? T.green : "none"} />
              </motion.div>
              {likes}
            </motion.button>
            <button className="flex items-center gap-1.5 text-sm" style={{ color: T.gray }}>
              <MessageSquare size={15} />{post.comments}
            </button>
            <button className="flex items-center gap-1.5 text-sm ml-auto" style={{ color: T.gray }}>
              <Share2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CreatePost({ onPost }) {
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [posting, setPosting] = useState(false);
  const { showToast } = useApp();

  const handlePost = async () => {
    if (!title.trim() || !body.trim()) { showToast("Please fill in title and body"); return; }
    setPosting(true);
    // POST /api/posts
    await new Promise(r => setTimeout(r, 800));
    setPosting(false);
    onPost({ id: Date.now(), author: "You", avatar: "YO", title, body, likes: 0, comments: 0, tag: "General", time: "just now" });
    setTitle("");
    setBody("");
    showToast("Post published!");
  };

  return (
    <div className="rounded-2xl p-5 mb-6" style={{ background: T.white, border: `1px solid ${T.grayLight}` }}>
      <div className="font-bold mb-3" style={{ color: T.text }}>Share with the community</div>
      <input value={title} onChange={e => setTitle(e.target.value)}
        placeholder="Post title..."
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-2"
        style={{ background: T.sand, border: `1px solid ${T.grayLight}` }} />
      <textarea value={body} onChange={e => setBody(e.target.value)}
        placeholder="Share your knowledge, question, or experience..."
        rows={3}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
        style={{ background: T.sand, border: `1px solid ${T.grayLight}` }} />
      <div className="mt-3 flex justify-end">
        <button onClick={handlePost} disabled={posting}
          className="px-5 py-2 rounded-xl font-bold text-white text-sm flex items-center gap-2"
          style={{ background: posting ? T.greenSoft : T.green }}>
          {posting ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
          {posting ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}

function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // GET /api/posts
    setTimeout(() => { setPosts(POSTS); setLoading(false); }, 600);
  }, []);

  const addPost = (post) => setPosts(p => [post, ...p]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black mb-1" style={{ color: T.green, fontFamily: "Georgia, serif" }}>Community Forum</h1>
      <p className="text-sm mb-8" style={{ color: T.textMute }}>Learn from fellow farmers. Share what you know.</p>

      <CreatePost onPost={addPost} />

      <div className="space-y-4">
        {loading ? [1, 2, 3].map(i => <SkeletonCard key={i} />) :
          posts.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}>
              <PostCard post={p} />
            </motion.div>
          ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════

function PageRenderer() {
  const { page } = useApp();

  const pages = {
    landing: <LandingPage />,
    contracts: <ContractPage />,
    marketplace: <MarketplacePage />,
    equipment: <EquipmentPage />,
    community: <CommunityPage />,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div key={page} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
        {pages[page] || <LandingPage />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen" style={{ background: T.cream, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <Navbar />
        <main>
          <PageRenderer />
        </main>
        <footer className="text-center py-8 text-sm border-t mt-10" style={{ color: T.gray, borderColor: T.grayLight }}>
          © 2025 AgriRoot · Farmer-first sustainable agriculture
        </footer>
        <Toast />
      </div>
    </AppProvider>
  );
}