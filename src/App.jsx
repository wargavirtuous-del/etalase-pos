import { useState, useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { Document, Packer, Table, TableRow, TableCell, Paragraph, TextRun, ImageRun, WidthType } from "docx";
import {
  ShoppingCart, ArrowRightLeft, ClipboardCheck, Plus, Minus, Trash2,
  X, Check, AlertTriangle, Package, Banknote, CreditCard, QrCode, Search,
  BarChart3, Grid3x3, List, Barcode as BarcodeIcon, Printer, Loader2, Settings as SettingsIcon, Wallet, ArrowUp, FileText, TrendingUp
} from "lucide-react";

const darkPalette = {
  bg: "#12171A",
  surface: "#1B2226",
  surfaceAlt: "#222B30",
  border: "#2C363B",
  text: "#EDEFEF",
  textDim: "#A9B7BC",
  textFaint: "#6C7A80",
  mint: "#3ECF8E",
  mintDim: "rgba(62,207,142,0.14)",
  success: "#4ADE80",
  amber: "#F2B84B",
  amberDim: "rgba(242,184,75,0.14)",
  coral: "#EF6B6B",
  coralDim: "rgba(239,107,107,0.14)",
};
const lightPalette = {
  bg: "#F5F4F0",
  surface: "#FFFFFF",
  surfaceAlt: "#EFEEE8",
  border: "#DEDCD4",
  text: "#1C1F21",
  textDim: "#5B6570",
  textFaint: "#8A929A",
  mint: "#0E9F63",
  mintDim: "rgba(14,159,99,0.12)",
  success: "#059669",
  amber: "#B07A0A",
  amberDim: "rgba(176,122,10,0.12)",
  coral: "#C43F3A",
  coralDim: "rgba(196,63,58,0.10)",
};
const GLASS_THEMES = {
  aurora: {
    label: "Aurora Blue",
    gradient: "linear-gradient(160deg, #0F172A 0%, #1D4ED8 55%, #60A5FA 100%)",
    blobs: ["rgba(99,102,241,0.70)", "rgba(59,130,246,0.60)", "rgba(6,182,212,0.50)"],
    accent: "#3B82F6",
    ctaGradient: "linear-gradient(135deg, #4F8DFF, #2F6FFF)",
    tabTint: { kasir: "rgba(59,130,246,0.16)", katalog: "rgba(59,130,246,0.10)", gudang: "rgba(6,182,212,0.16)", opname: "rgba(6,182,212,0.10)", laporan: "rgba(168,85,247,0.16)" },
  },
  midnight: {
    label: "Midnight Purple",
    gradient: "linear-gradient(160deg, #09090B 0%, #312E81 55%, #6366F1 100%)",
    blobs: ["rgba(49,46,129,0.45)", "rgba(168,85,247,0.30)", "rgba(99,102,241,0.25)"],
    accent: "#A855F7",
    ctaGradient: "linear-gradient(135deg, #A78BFA, #7C3AED)",
    tabTint: { kasir: "rgba(168,85,247,0.16)", katalog: "rgba(168,85,247,0.10)", gudang: "rgba(99,102,241,0.16)", opname: "rgba(99,102,241,0.10)", laporan: "rgba(217,70,239,0.16)" },
  },
  emerald: {
    label: "Emerald Glass",
    gradient: "linear-gradient(160deg, #052E16 0%, #065F46 55%, #10B981 100%)",
    blobs: ["rgba(6,95,70,0.45)", "rgba(16,185,129,0.30)", "rgba(110,231,183,0.20)"],
    accent: "#10B981",
    ctaGradient: "linear-gradient(135deg, #34D399, #059669)",
    tabTint: { kasir: "rgba(16,185,129,0.16)", katalog: "rgba(16,185,129,0.10)", gudang: "rgba(6,182,212,0.16)", opname: "rgba(6,182,212,0.10)", laporan: "rgba(20,184,166,0.16)" },
  },
  sunset: {
    label: "Sunset Orange",
    gradient: "linear-gradient(160deg, #7C2D12 0%, #EA580C 55%, #FB923C 100%)",
    blobs: ["rgba(124,45,18,0.45)", "rgba(234,88,12,0.30)", "rgba(251,146,60,0.22)"],
    accent: "#FB923C",
    ctaGradient: "linear-gradient(135deg, #FDBA74, #F97316)",
    tabTint: { kasir: "rgba(251,146,60,0.16)", katalog: "rgba(251,146,60,0.10)", gudang: "rgba(234,88,12,0.16)", opname: "rgba(234,88,12,0.10)", laporan: "rgba(220,38,38,0.12)" },
  },
  monochrome: {
    label: "Monochrome Glass",
    gradient: "linear-gradient(160deg, #111827 0%, #374151 55%, #6B7280 100%)",
    blobs: ["rgba(55,65,81,0.90)", "rgba(107,114,128,0.60)", "rgba(147,197,253,0.40)"],
    accent: "#93C5FD",
    ctaGradient: "linear-gradient(135deg, #60A5FA, #2563EB)",
    tabTint: { kasir: "rgba(147,197,253,0.14)", katalog: "rgba(147,197,253,0.08)", gudang: "rgba(107,114,128,0.16)", opname: "rgba(107,114,128,0.10)", laporan: "rgba(209,213,219,0.10)" },
  },
};

function getGlassPalette(themeKey) {
  const t = GLASS_THEMES[themeKey] || GLASS_THEMES.aurora;
  return {
    bg: "transparent",
    surface: "rgba(255,255,255,0.15)",
    surfaceAlt: "rgba(255,255,255,0.09)",
    border: "rgba(255,255,255,0.25)",
    text: "#FFFFFF",
    textDim: "rgba(255,255,255,0.78)",
    textFaint: "rgba(255,255,255,0.55)",
    mint: t.accent,
    mintDim: "rgba(255,255,255,0.20)",
    success: "#4ADE80",
    amber: "#F59E0B",
    amberDim: "rgba(245,158,11,0.20)",
    coral: "#EF4444",
    coralDim: "rgba(239,68,68,0.20)",
  };
}

// ---- 3 tema baru (Corporate Flat, Liquid Glass Terang, Arctic Blue) ----
// Sesuai spesifikasi "ASPHO CASH — 3 TEMA FINAL": struktur/layout tidak berubah,
// radius/spacing/blur adalah pembeda identitas tiap tema. Indikator hijau/kuning/merah tetap sama persis.
const LIGHT_THEME_META = {
  corporate: {
    label: "Corporate Flat",
    pageGradient: "linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 55%, #EEEEEE 100%)",
    blobs: [],
    blur: 0,
    radius: 9,
    cardBg: "#FFFFFF",
    cardBorder: "#E2E4E8",
    cardShadow: "0 1px 3px rgba(0,0,0,.06)",
    navActiveBg: "#EFF6FF",
    navActiveBorder: "#BFDBFE",
    accent: "#2563EB",
    accentDim: "rgba(37,99,235,0.10)",
    danggerBg: "#FEF2F2",
    danggerBorder: "#FCA5A5",
  },
  glasslight: {
    label: "Liquid Glass (Terang)",
   pageGradient: "linear-gradient(160deg, #DCEBFA 0%, #C9DFF5 55%, #B8D4F0 100%)",
    auroraColors: ["#93C5FD", "#C4B5FD", "#7DD3FC", "#F0ABFC"],
    blobs: [
      { color: "#93C5FD", size: 520, blur: 130, opacity: 0.16, top: -160, left: -140 },
      { color: "#C4B5FD", size: 460, blur: 130, opacity: 0.14, top: -80, right: -160 },
      { color: "#7DD3FC", size: 420, blur: 130, opacity: 0.12, bottom: -180, left: "30%" },
    ],
    blur: 28,
    radius: 22,
    cardBg: "rgba(255,255,255,0.97)",
    cardBorder: "rgba(15,23,42,0.10)",
    cardShadow: "0 20px 50px rgba(30,58,138,.14), 0 4px 12px rgba(15,23,42,.10), inset 0 1px 0 rgba(255,255,255,0.8)",
    navDefaultBg: "rgba(255,255,255,0.80)",
    navDefaultBorder: "rgba(148,163,184,0.4)",
    navDefaultShadow: "0 2px 8px rgba(0,0,0,0.02)",
    navActiveBg: "rgba(255,255,255,0.95)",
    navActiveBorder: "rgba(37,99,235,0.4)",
    navActiveShadow: "0 4px 15px rgba(37,99,235,0.15)",
    accent: "#2563EB",
    accentDim: "rgba(37,99,235,0.10)",
  },
  arctic: {
    label: "Arctic Blue",
    pageGradient: "linear-gradient(160deg, #C9E4FB 0%, #A9D2F5 55%, #8FC2ED 100%)",
    auroraColors: ["#7DD3FC", "#93C5FD", "#BAE6FD", "#A5F3FC"],
    blobs: [
      { color: "#7DD3FC", size: 560, blur: 140, opacity: 0.14, top: -170, left: -150 },
      { color: "#93C5FD", size: 480, blur: 140, opacity: 0.12, top: -60, right: -170 },
      { color: "#BAE6FD", size: 440, blur: 140, opacity: 0.10, bottom: -190, left: "35%" },
    ],
    blur: 24,
    radius: 20,
    cardBg: "rgba(232, 238, 241,0.65)",
    cardBorder: "rgba(29,78,216,0.12)",
    cardShadow: "0 20px 50px rgba(29,78,216,.16), 0 4px 12px rgba(15,23,42,.10), inset 0 1px 0 rgba(255,255,255,0.85)",
    navDefaultBg: "rgba(255,255,255,0.85)",
    navDefaultBorder: "rgba(147,197,253,0.45)",
    navDefaultShadow: "0 2px 8px rgba(0,0,0,0.02)",
    navActiveBg: "rgba(255,255,255,0.95)",
    navActiveBorder: "#93C5FD",
    navActiveShadow: "0 4px 12px rgba(29,78,216,0.12)",
    accent: "#1D4ED8",
    accentDim: "rgba(29,78,216,0.10)",
  },
};
const LIGHT_THEME_TEXT = {
  corporate: { text: "#111827", textDim: "#374151", textFaint: "#6B7280" },
  glasslight: { text: "#0F172A", textDim: "#374151", textFaint: "#64748B" },
  arctic: { text: "#0F1E3C", textDim: "#33507A", textFaint: "#6B87AC" },
};
function getLightThemePalette(themeKey) {
  const m = LIGHT_THEME_META[themeKey];
  const t = LIGHT_THEME_TEXT[themeKey];
  return {
    bg: themeKey === "corporate" ? "#F5F5F5" : "#EEF8FF",
    surface: m.cardBg,
    surfaceAlt: themeKey === "corporate" ? "#F7F7F7" : "rgba(255,255,255,0.30)",
    border: m.cardBorder,
    text: t.text,
    textDim: t.textDim,
    textFaint: t.textFaint,
    mint: m.accent,
    mintDim: m.accentDim,
    success: "#16A34A",
    amber: "#F59E0B",
    amberDim: "rgba(245,158,11,0.14)",
    coral: "#DC2626",
    coralDim: m.danggerBg || "rgba(220,38,38,0.10)",
  };
}

let c = { ...darkPalette };
let currentThemeMode = "dark";
function applyTheme(mode, glassColorTheme) {
  currentThemeMode = mode;
  const palette =
    mode === "light" ? lightPalette :
    mode === "glass" ? getGlassPalette(glassColorTheme) :
    LIGHT_THEME_META[mode] ? getLightThemePalette(mode) :
    darkPalette;
  Object.assign(c, palette);
}
function themeMeta() {
  return LIGHT_THEME_META[currentThemeMode] || null;
}
// Style kartu/panel bersama — dipakai supaya radius & efek kaca konsisten di 3 tema baru
// tanpa perlu mengubah setiap className rounded-* satu per satu (inline style menang atas class).
function cardStyle(extra = {}) {
  const { ring, ...rest } = extra;
  const m = themeMeta();
  const base = !m
    ? { backgroundColor: c.surface, border: `1px solid ${c.border}` }
    : {
        backgroundColor: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: m.radius,
        boxShadow: m.cardShadow,
        backdropFilter: m.blur ? `blur(${m.blur}px)` : undefined,
        WebkitBackdropFilter: m.blur ? `blur(${m.blur}px)` : undefined,
      };
  if (ring) {
    base.boxShadow = base.boxShadow ? `${base.boxShadow}, 0 0 0 2px ${c.mint}` : `0 0 0 2px ${c.mint}`;
    base.border = `1px solid ${c.mint}`;
  }
  return { ...base, ...rest };
}
// Untuk pembungkus tabel (border saja, tanpa background) — radius tetap ikut tema.
function tableWrapStyle() {
  const m = themeMeta();
  return { border: `1px solid ${c.border}`, borderRadius: m ? m.radius : undefined };
}

const STORAGE_KEY = "pos-data-v1";
const SETTINGS_KEY = "pos-settings-v1";
const STORE_NAME = "Asia Stationery and Photocopy";
const STORE_PHONE = "0857-0703-3705";
const STORE_ADDRESS = "Jl. Widotomo No.29, Gontor, Mlarak, Ponorogo, Jawa Timur, Indonesia, Bumi";
const APP_VERSION = "0.21";

const ACCOUNTS_KEY = "pos-accounts-v1";
const DEFAULT_ADMIN_ACCOUNTS = [
  { id: "wafa", password: "123456" },
  { id: "kresno", password: "123456" },
];
const DEFAULT_KASIR_ACCOUNTS = [
  { id: "wafa", password: "654321" },
  { id: "mario", password: "654321" },
  { id: "rezi", password: "654321" },
  { id: "kresno", password: "654321" },
  { id: "ridho", password: "654321" },
];

function useAccounts() {
  const [accounts, setAccounts] = useState(() => {
    try {
      const raw = localStorage.getItem(ACCOUNTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { admins: DEFAULT_ADMIN_ACCOUNTS, kasirs: DEFAULT_KASIR_ACCOUNTS };
  });

  const update = (next) => {
    setAccounts(next);
    try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next)); } catch (e) {}
  };

  return { accounts, update };
}

const seedProducts = [
  { id: 1, sku: "TK-0001", barcode: "8991002100019", nama: "Kopi Bubuk 200g", kategori: "Minuman", satuan: "pcs", hargaBeli: 17000, hargaJual: 24000, etalase: 18, gudang: 60 },
  { id: 2, sku: "TK-0002", barcode: "8991002100026", nama: "Gula Pasir 1kg", kategori: "Sembako", satuan: "pcs", hargaBeli: 12500, hargaJual: 15500, etalase: 6, gudang: 40 },
  { id: 3, sku: "TK-0003", barcode: "8991002100033", nama: "Minyak Goreng 1L", kategori: "Sembako", satuan: "pcs", hargaBeli: 15000, hargaJual: 19000, etalase: 3, gudang: 25 },
  { id: 4, sku: "TK-0004", barcode: "8991002100040", nama: "Teh Celup 25s", kategori: "Minuman", satuan: "pcs", hargaBeli: 6500, hargaJual: 9500, etalase: 22, gudang: 15 },
  { id: 5, sku: "TK-0005", barcode: "8991002100057", nama: "Sabun Cuci Piring", kategori: "Kebersihan", satuan: "pcs", hargaBeli: 8500, hargaJual: 12000, etalase: 14, gudang: 30 },
  { id: 6, sku: "TK-0006", barcode: "8991002100064", nama: "Mie Instan Goreng", kategori: "Makanan", satuan: "pcs", hargaBeli: 2600, hargaJual: 3500, etalase: 40, gudang: 120 },
];

function rupiah(n) {
  return "Rp" + Math.round(n).toLocaleString("id-ID");
}
function formatRibuan(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function RupiahInput({ value, onChange, placeholder, className, style, onKeyDown }) {
  return (
    <div className="relative">
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: c.textDim }}>Rp</span>
      <input
        inputMode="numeric"
        pattern="[0-9]*"
        value={formatRibuan(value)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={className}
        style={{ ...style, paddingLeft: 22 }}
      />
    </div>
  );
}
function nextSku(products) {
  const nums = products.map((p) => parseInt(p.sku.split("-")[1] || "0", 10));
  const n = (nums.length ? Math.max(...nums) : 0) + 1;
  return "TK-" + String(n).padStart(4, "0");
}
function genBarcodeDigits() {
  // Timestamp + random memastikan tidak pernah bentrok, walau tambah barang berkali-kali cepat.
  const raw = (Date.now().toString() + Math.floor(10 + Math.random() * 90)).slice(-11);
  const base12 = raw.padStart(12, "0");
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(base12[i], 10) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return base12 + check;
}

// Barcode CODE128 asli & bisa dipindai (dibangkitkan lewat library jsbarcode)
function barcodeToPngDataUrl(value, width = 300, height = 90) {
  const canvas = document.createElement("canvas");
  try {
    JsBarcode(canvas, value, { format: "CODE128", width: 2, height: height - 30, displayValue: true, fontSize: 14, margin: 6 });
  } catch (e) {
    console.error("Gagal membuat barcode", e);
  }
  return canvas.toDataURL("image/png");
}

function BarcodeSVG({ value, width = 200, height = 90 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    try {
      JsBarcode(ref.current, value, { format: "CODE128", width: 2, height: height - 30, displayValue: true, fontSize: 14, margin: 6 });
    } catch (e) {
      console.error("Gagal membuat barcode", e);
    }
  }, [value, width, height]);
  return <svg ref={ref} style={{ background: "#fff" }} />;
}

function useStorage() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setData(JSON.parse(raw));
      } else {
        const seed = { products: seedProducts, transactions: [], movements: [] };
        setData(seed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      }
    } catch (e) {
      const seed = { products: seedProducts, transactions: [], movements: [] };
      setData(seed);
    }
    setStatus("ready");
  }, []);

  const persist = async (next) => {
    setData(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("Gagal menyimpan data", e);
    }
  };

  return { data, persist, status };
}

function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { theme: "dark", kasirDisplay: "visual", printerBridgeUrl: "", glassColorTheme: "aurora", glassBlur: 20 };
  });

  const update = (patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  return { settings, update };
}

function ChangePasswordSection({ currentUser, accounts, updateAccounts }) {
  const [oldPass, setOldPass] = useState("");
  const [newId, setNewId] = useState(currentUser.id);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

  const listKey = currentUser.role === "admin" ? "admins" : "kasirs";
  const list = accounts[listKey];
  const me = list.find((a) => a.id === currentUser.id);

  const submit = () => {
    if (!me || me.password !== oldPass) {
      setMsg({ type: "error", text: "Password lama salah." });
      return;
    }
    if (!newPass || newPass.length < 4) {
      setMsg({ type: "error", text: "Password baru minimal 4 karakter." });
      return;
    }
    if (newPass !== confirmPass) {
      setMsg({ type: "error", text: "Konfirmasi password baru tidak cocok." });
      return;
    }
    const newList = list.map((a) => (a.id === currentUser.id ? { ...a, id: newId.trim() || a.id, password: newPass } : a));
    updateAccounts({ ...accounts, [listKey]: newList });
    setMsg({ type: "ok", text: "Password berhasil diubah." });
    setOldPass(""); setNewPass(""); setConfirmPass("");

    const waText = `Konfirmasi: password akun ${currentUser.role} "${currentUser.id}" baru saja diubah pada ${new Date().toLocaleString("id-ID")}.`;
    const waUrl = `https://wa.me/62${STORE_PHONE.replace(/\D/g, "").replace(/^0/, "")}?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="mb-4">
      <p className="text-xs mb-2" style={{ color: c.textDim }}>Ganti ID & Password Saya</p>
      <div className="space-y-1.5">
        <input type="password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} placeholder="Password lama" className="w-full text-xs bg-transparent outline-none px-2 py-1.5 rounded-lg" style={{ border: `1px solid ${c.border}`, color: c.text }} />
        <input value={newId} onChange={(e) => setNewId(e.target.value)} placeholder="ID baru" className="w-full text-xs bg-transparent outline-none px-2 py-1.5 rounded-lg" style={{ border: `1px solid ${c.border}`, color: c.text }} />
        <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Password baru" className="w-full text-xs bg-transparent outline-none px-2 py-1.5 rounded-lg" style={{ border: `1px solid ${c.border}`, color: c.text }} />
        <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="Konfirmasi password baru" className="w-full text-xs bg-transparent outline-none px-2 py-1.5 rounded-lg" style={{ border: `1px solid ${c.border}`, color: c.text }} />
        {msg.text && <p className="text-[11px]" style={{ color: msg.type === "error" ? c.coral : c.mint }}>{msg.text}</p>}
        <button onClick={submit} className="w-full py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: c.mint, color: "#0B1210" }}>
          Simpan Perubahan
        </button>
        <p className="text-[10px]" style={{ color: c.textDim }}>
          Setelah disimpan, WhatsApp akan terbuka otomatis untuk kirim konfirmasi ke nomor toko.
        </p>
      </div>
    </div>
  );
}

function ManageAccountsSection({ accounts, updateAccounts }) {
  const [resetting, setResetting] = useState(null); // { list, id }
  const [newPass, setNewPass] = useState("");

  const doReset = () => {
    if (!newPass || newPass.length < 4) return;
    const list = accounts[resetting.list];
    const newList = list.map((a) => (a.id === resetting.id ? { ...a, password: newPass } : a));
    updateAccounts({ ...accounts, [resetting.list]: newList });
    setResetting(null);
    setNewPass("");
  };

  return (
    <div className="mb-2">
      <p className="text-xs mb-2" style={{ color: c.textDim }}>Kelola Akun (Reset Password)</p>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {["admins", "kasirs"].map((listKey) =>
          accounts[listKey].map((a) => (
            <div key={listKey + a.id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg" style={{ backgroundColor: c.surfaceAlt }}>
              <span style={{ color: c.text }}>{a.id} <span style={{ color: c.textDim }}>({listKey === "admins" ? "admin" : "kasir"})</span></span>
              {resetting?.list === listKey && resetting?.id === a.id ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doReset()}
                    placeholder="Password baru"
                    className="text-[11px] bg-transparent outline-none px-1.5 py-1 rounded"
                    style={{ border: `1px solid ${c.border}`, color: c.text, width: 90 }}
                  />
                  <button onClick={doReset} className="text-[11px] px-2 py-1 rounded" style={{ backgroundColor: c.mint, color: "#0B1210" }}>OK</button>
                  <button onClick={() => { setResetting(null); setNewPass(""); }} className="text-[11px] px-1.5 py-1" style={{ color: c.textDim }} aria-label="Batal reset password">✕</button>
                </div>
              ) : (
                <button onClick={() => setResetting({ list: listKey, id: a.id })} className="text-[11px] px-2 py-1 rounded" style={{ backgroundColor: c.surface, color: c.textDim, border: `1px solid ${c.border}` }}>
                  Reset
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
function useFocusTrap(isOpen, containerRef) {
  const prevFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    prevFocusRef.current = document.activeElement;

    // Fokus ke elemen pertama yang bisa difokus di dalam modal
    const focusables = containerRef.current?.querySelectorAll(
      'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusables?.[0]?.focus();

    // Kunci Tab supaya tidak keluar dari modal
    const handleTab = (e) => {
      if (e.key !== "Tab") return;
      const list = Array.from(
        containerRef.current?.querySelectorAll(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
        ) || []
      );
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleTab);

    return () => {
      window.removeEventListener("keydown", handleTab);
      prevFocusRef.current?.focus?.();
    };
  }, [isOpen]);
}
function SettingsModal({ settings, update, onClose, currentUser, accounts, updateAccounts }) {
  const containerRef = useRef(null);
  useModalKeys(true, null, onClose);
  useFocusTrap(true, containerRef);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="w-80 rounded-xl p-4 max-h-[85vh] overflow-y-auto" style={cardStyle()}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold" style={{ color: c.text }}>Pengaturan</p>
          <button onClick={onClose} aria-label="Tutup pengaturan"><X size={16} color={c.textDim} /></button>
        </div>

        <p className="text-xs mb-2" style={{ color: c.textDim }}>Tema Aplikasi</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { key: "dark", label: "Gelap" },
            { key: "light", label: "Terang" },
            { key: "glass", label: "Liquid Glass (Gelap)" },
            { key: "corporate", label: "Corporate Flat" },
            { key: "glasslight", label: "Liquid Glass (Terang)" },
            { key: "arctic", label: "Arctic Blue" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => update({ theme: t.key })}
              className="py-2 rounded-lg text-xs font-medium"
              style={{
                backgroundColor: settings.theme === t.key ? c.mint : c.surfaceAlt,
                color: settings.theme === t.key ? (LIGHT_THEME_META[t.key] ? "#fff" : "#0B1210") : c.textDim,
                border: `1px solid ${c.border}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {settings.theme === "glass" && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: c.surfaceAlt, border: `1px solid ${c.border}` }}>
            <p className="text-xs mb-2" style={{ color: c.textDim }}>Warna Dasar Liquid Glass</p>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {Object.entries(GLASS_THEMES).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => update({ glassColorTheme: key })}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: settings.glassColorTheme === key ? c.mint : c.surface,
                    color: settings.glassColorTheme === key ? "#0B1210" : c.textDim,
                    border: `1px solid ${c.border}`,
                  }}
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: t.gradient }} />
                  {t.label}
                </button>
              ))}
            </div>
            <p className="text-xs mb-2" style={{ color: c.textDim }}>Ketebalan Efek Kaca</p>
            <div className="flex gap-1.5">
              {[{ v: 10, l: "Tipis" }, { v: 20, l: "Sedang" }, { v: 40, l: "Tebal" }].map((b) => (
                <button
                  key={b.v}
                  onClick={() => update({ glassBlur: b.v })}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: settings.glassBlur === b.v ? c.mint : c.surface,
                    color: settings.glassBlur === b.v ? "#0B1210" : c.textDim,
                    border: `1px solid ${c.border}`,
                  }}
                >
                  {b.l}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-2 mb-5">
          {[{ key: "visual", label: "Bergambar" }, { key: "text", label: "Teks Saja" }].map((t) => (
            <button
              key={t.key}
              onClick={() => update({ kasirDisplay: t.key })}
              className="flex-1 py-2 rounded-lg text-xs font-medium"
              style={{
                backgroundColor: settings.kasirDisplay === t.key ? c.mint : c.surfaceAlt,
                color: settings.kasirDisplay === t.key ? "#0B1210" : c.textDim,
                border: `1px solid ${c.border}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <p className="text-xs mb-2" style={{ color: c.textDim }}>Alamat Print Bridge (untuk cetak struk otomatis)</p>
        <input
          value={settings.printerBridgeUrl}
          onChange={(e) => update({ printerBridgeUrl: e.target.value })}
          placeholder="https://192.168.1.15:4000"
          className="w-full text-xs bg-transparent outline-none px-2 py-1.5 rounded-lg mb-1"
          style={{ border: `1px solid ${c.border}`, color: c.text }}
        />
        <p className="text-[10px] mb-5" style={{ color: c.textDim }}>
          Kosongkan kalau printer nyambung langsung ke komputer ini. Lihat tutorial print bridge untuk printer di komputer lain.
        </p>

        <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 14 }}>
          <ChangePasswordSection currentUser={currentUser} accounts={accounts} updateAccounts={updateAccounts} />
          {currentUser.role === "admin" && (
            <ManageAccountsSection accounts={accounts} updateAccounts={updateAccounts} />
          )}
        </div>
      </div>
    </div>
  );
}

function LoginGate({ onLogin, accounts }) {
  const [mode, setMode] = useState(null); // 'admin' | 'kasir'
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    const list = mode === "admin" ? accounts.admins : accounts.kasirs;
    const found = list.find((a) => a.id.toLowerCase() === id.trim().toLowerCase() && a.password === password);
    if (!found) {
      setError("ID atau password salah.");
      return;
    }
    onLogin({ id: found.id, role: mode });
  };

  return (
    <div className="login-shell w-full min-h-screen flex items-center justify-center font-sans relative overflow-hidden">
      <div className="login-aurora login-aurora-1" />
      <div className="login-aurora login-aurora-2" />
      <div className="login-aurora login-aurora-3" />

      <div className="login-card w-80 rounded-3xl p-7 relative z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="login-logo mb-4">
            <ShoppingCart size={28} color="#0B1210" />
          </div>
          <p className="text-xl font-bold tracking-tight text-white">Aspho Cash</p>
          <p className="text-xs text-center mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>Masuk untuk melanjutkan</p>
        </div>

        {!mode ? (
          <div className="space-y-2.5">
            <button onClick={() => setMode("admin")} className="login-btn-primary w-full py-3 rounded-xl text-sm font-semibold">
              Masuk sebagai Admin
            </button>
            <button onClick={() => setMode("kasir")} className="login-btn-secondary w-full py-3 rounded-xl text-sm font-medium">
              Masuk sebagai Kasir
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <p className="text-xs mb-1 capitalize" style={{ color: "rgba(255,255,255,0.65)" }}>Login {mode}</p>
            <input
              value={id}
              onChange={(e) => { setId(e.target.value); setError(""); }}
              placeholder="ID"
              className="login-input w-full text-sm outline-none px-3 py-2.5 rounded-xl"
            />
            <input
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              type="password"
              placeholder="Password"
              className="login-input w-full text-sm outline-none px-3 py-2.5 rounded-xl"
            />
            {error && <p className="text-xs" style={{ color: "#FCA5A5" }}>{error}</p>}
           <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setMode(null); setId(""); setPassword(""); setError(""); }}
                className="login-btn-secondary flex-1 py-2.5 rounded-xl text-xs"
              >
                Kembali
              </button>
              <button onClick={submit} className="login-btn-primary flex-1 py-2.5 rounded-xl text-xs font-semibold">
                Masuk
              </button>
            </div>
            <a
              href={`https://wa.me/62${STORE_PHONE.replace(/\D/g, "").replace(/^0/, "")}?text=${encodeURIComponent(`Halo, saya lupa password akun ${mode} dengan ID: ${id || "(isi ID kamu)"}. Mohon bantuan reset password.`)}`}
              target="_blank"
              rel="noreferrer"
              className="block text-center text-[11px] mt-2 underline"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              Lupa password? Hubungi toko via WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function Nav({ tab, setTab }) {
  const items = [
    { key: "kasir", label: "Kasir", icon: ShoppingCart, desc: "Layar transaksi utama — cari/scan barang, hitung pembayaran, cetak struk." },
    { key: "katalog", label: "Katalog", icon: Grid3x3, desc: "Daftar semua barang & harga, bisa tampilan bergambar atau teks saja." },
    { key: "gudang", label: "Gudang & Transfer", icon: ArrowRightLeft, desc: "Kelola stok gudang, transfer ke etalase, tambah/edit/hapus barang, cetak label barcode." },
    { key: "opname", label: "Stok Opname", icon: ClipboardCheck, desc: "Cocokkan stok yang tercatat di sistem dengan stok fisik hasil hitung manual." },
    { key: "laporan", label: "Laporan", icon: BarChart3, desc: "Ringkasan omzet, laba per kategori, dan riwayat transaksi per kasir." },
  ];
  const btnRefs = useRef([]);
  const m = themeMeta();

  // Navigasi tab pakai panah kiri/kanan (pengganti mouse) — aktif saat fokus ada di salah satu tab.
  const handleNavKey = (e, idx) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const nextIdx = (idx + dir + items.length) % items.length;
      setTab(items[nextIdx].key);
      btnRefs.current[nextIdx]?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setTab(items[idx].key);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 px-5 pt-3 pb-2.5 border-b" style={{ borderColor: c.border }}>
      {items.map((it, idx) => {
        const active = tab === it.key;
        const Icon = it.icon;
        const glassNav = m && (m.navDefaultBg || m.navActiveBg);
        const navStyle = glassNav
          ? {
              backgroundColor: active ? m.navActiveBg : (m.navDefaultBg || "transparent"),
              color: active ? (m.accent || c.mint) : c.textDim,
              border: `1px solid ${active ? m.navActiveBorder : (m.navDefaultBorder || "transparent")}`,
              backdropFilter: m.blur ? `blur(${Math.round(m.blur * 0.7)}px)` : undefined,
              WebkitBackdropFilter: m.blur ? `blur(${Math.round(m.blur * 0.7)}px)` : undefined,
              borderRadius: Math.min(m.radius, 12),
            }
          : {
              backgroundColor: active ? c.mintDim : "transparent",
              color: active ? c.mint : c.textDim,
              border: `1px solid ${active ? c.mint : "transparent"}`,
            };
        return (
          <div key={it.key} className="relative group">
            <button
              ref={(el) => (btnRefs.current[idx] = el)}
              onClick={() => setTab(it.key)}
              onKeyDown={(e) => handleNavKey(e, idx)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={navStyle}
            >
              <Icon size={15} />
              {it.label}
            </button>
            <div
              className="absolute left-0 top-full mt-1 w-56 px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none transition-opacity z-50"
              style={{ backgroundColor: c.surfaceAlt, color: c.text, border: `1px solid ${c.border}` }}
            >
              {it.desc}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function useModalKeys(isOpen, onConfirm, onCancel) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Enter" && onConfirm) {
        e.preventDefault();
        onConfirm();
      } else if (e.key === "Escape" && onCancel) {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onConfirm, onCancel]);
}

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-5 right-5 p-3 rounded-full shadow-lg z-50"
      style={{ backgroundColor: c.mint, color: "#0B1210", border: `1px solid ${c.border}` }}
      aria-label="Ke atas"
    >
      <ArrowUp size={18} />
    </button>
  );
}

function QtyInput({ value, max, onCommit }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);

  const commit = () => {
    const n = parseInt(text, 10);
    const clamped = isNaN(n) || n < 1 ? value : Math.min(n, max);
    setText(String(clamped));
    if (clamped !== value) onCommit(clamped);
  };

 return (
    <input
      inputMode="numeric"
      pattern="[0-9]*"
      value={text}
      onChange={(e) => setText(e.target.value.replace(/\D/g, ""))}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") { e.preventDefault(); commit(); }
      }}
      className="text-xs font-mono w-10 text-center bg-transparent outline-none rounded py-0.5"
      style={{ border: `1px solid ${c.border}`, color: c.text }}
    />
  );
}

function successTextStyle() {
  const isLightGlass = currentThemeMode === "glasslight" || currentThemeMode === "arctic";
  return {
    color: c.success,
    fontWeight: 700,
    textShadow:
      currentThemeMode === "glass" ? "0 1px 4px rgba(0,0,0,0.45)" :
      isLightGlass ? "0 1px 3px rgba(255,255,255,0.7)" :
      "none",
  };
}

function searchBarStyle() {
  if (currentThemeMode === "glass") {
    return { backgroundColor: "rgba(255,255,255,0.20)", border: "1px solid rgba(255,255,255,0.35)" };
  }
  const m = themeMeta();
  if (m) {
    return {
      backgroundColor: m.navDefaultBg || c.surfaceAlt,
      border: `1px solid ${m.navDefaultBorder || c.border}`,
      borderRadius: Math.min(m.radius, 12),
      backdropFilter: m.blur ? `blur(${Math.round(m.blur * 0.7)}px)` : undefined,
      WebkitBackdropFilter: m.blur ? `blur(${Math.round(m.blur * 0.7)}px)` : undefined,
    };
  }
  return { backgroundColor: c.surfaceAlt, border: `1px solid ${c.border}` };
}

function ctaStyle(enabled, glassColorTheme) {
  if (!enabled) return { backgroundColor: c.surfaceAlt, color: c.textDim };
  if (currentThemeMode === "glass") {
    const t = GLASS_THEMES[glassColorTheme] || GLASS_THEMES.aurora;
    return { background: t.ctaGradient, color: "#fff", boxShadow: "0 4px 16px -2px rgba(0,0,0,0.35)" };
  }
  const m = themeMeta();
  if (m) return { backgroundColor: c.mint, color: "#fff", borderRadius: Math.min(m.radius, 10) };
  return { backgroundColor: c.mint, color: "#0B1210" };
}

function StokBadge({ n }) {
  const color = n <= 0 ? c.coral : n <= 5 ? c.amber : n <= 10 ? "#EAB308" : c.success;
  return (
    <span className="font-mono text-[11px] inline-flex items-center gap-1" style={{ color }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      Stok: {n}
    </span>
  );
}
function ConfirmModal({ title, desc, onCancel, onConfirm, confirmLabel = "Ya, batalkan", confirmColor = c.coral, confirmTextColor = "#2A0E0E" }) {
  const containerRef = useRef(null);
  useFocusTrap(true, containerRef);
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div ref={containerRef} className="w-72 rounded-xl p-4" style={cardStyle()}>
        <p className="text-sm font-medium mb-1" style={{ color: c.text }}>{title}</p>
        <p className="text-xs mb-3" style={{ color: c.textDim }}>{desc}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2 rounded-lg text-xs" style={{ backgroundColor: c.surfaceAlt, color: c.text }}>Kembali</button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: confirmColor, color: confirmTextColor }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
// ---------------- KASIR ----------------
function KasirScreen({ data, persist, currentUser, displayMode, printerBridgeUrl, glassColorTheme }) {
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState("");
  const [splitMode, setSplitMode] = useState(false);
  const [payments, setPayments] = useState([]);
  const [kembalianTotal, setKembalianTotal] = useState(0);
  const [cashInput, setCashInput] = useState("");
  const [cashWarning, setCashWarning] = useState("");
  const [voidConfirm, setVoidConfirm] = useState(false);
  const [cancelReceiptConfirm, setCancelReceiptConfirm] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef(null);
  const receiptRef = useRef(null);
useFocusTrap(!!receipt, receiptRef);

  useEffect(() => {
    inputRef.current?.focus();
  }, [cart.length, receipt]);

  const products = data.products;
  const filtered = products.filter(
    (p) =>
      p.nama.toLowerCase().includes(query.toLowerCase()) ||
      p.barcode.includes(query) ||
      p.sku.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => { setHighlight(0); }, [query]);

  // Navigasi hasil pencarian pakai panah atas/bawah, pilih dengan Enter.
  const handleSearchKeyDown = (e) => {
    if (!filtered.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const target = filtered[highlight];
      if (target && target.etalase > 0) {
        e.preventDefault();
        addToCart(target);
        setQuery("");
      }
    }
  };

  const addToCart = (p) => {
    if (p.etalase <= 0) return;
    setCart((prev) => {
      const found = prev.find((i) => i.id === p.id);
      if (found) {
        if (found.qty >= p.etalase) return prev;
        return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...p, qty: 1 }];
    });
    setCartBump(true);
    setTimeout(() => setCartBump(false), 300);
  };

 // Penangkap scan global: cadangan kalau fokus kursor kebetulan gak lagi di kolom cari.
  // Scanner mengetik sangat cepat (semua karakter dalam <100ms), beda dari ketikan manusia.
  useEffect(() => {
    let buffer = "";
    let lastTime = 0;
    const handler = (e) => {
      // Kalau user sedang mengetik manual di input/textarea LAIN (bukan kolom cari Kasir),
      // biarkan ketikan berjalan normal — jangan tangkap sebagai kode scan.
      const activeTag = document.activeElement?.tagName;
      const isTypingElsewhere =
        (activeTag === "INPUT" || activeTag === "TEXTAREA") &&
        document.activeElement !== inputRef.current;
      if (isTypingElsewhere) return;

      const now = Date.now();
      if (now - lastTime > 120) buffer = "";
      lastTime = now;
      if (e.key === "Enter") {
        const code = buffer.trim();
        buffer = "";
        if (code.length < 3) return; // terlalu pendek, kemungkinan bukan hasil scan
        const match = products.find((p) => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase());
        if (match) {
          addToCart(match);
          setQuery("");
        }
        return;
      }
      if (e.key.length === 1) buffer += e.key;
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [products]);

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)).filter((i) => i.qty > 0)
    );
  };

  const setQtyExact = (id, qty) => {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)).filter((i) => i.qty > 0));
  };

  const total = cart.reduce((s, i) => s + i.hargaJual * i.qty, 0);
  const paid = payments.reduce((s, p) => s + p.jumlah, 0);
  const sisa = total - paid;

  useEffect(() => {
    const handleF5 = (e) => {
      if (e.key !== "F5") return;
      e.preventDefault();
      if (cart.length === 0 || sisa <= 0) return;
      setSplitMode(true);
      setPayments((prev) => [...prev, { metode: "cashless", jumlah: Math.max(sisa, 0) }]);
    };
    window.addEventListener("keydown", handleF5);
    return () => window.removeEventListener("keydown", handleF5);
  }, [cart.length, sisa]);

  const addPayment = (metode, jumlah) => {
    if (jumlah <= 0) return;
    setPayments((prev) => [...prev, { metode, jumlah }]);
  };

  const bayarCash = () => {
    const diterima = parseInt(cashInput || "0", 10);
    if (!diterima || diterima <= 0) return;
    const sisaSebelum = Math.max(sisa, 0);
    if (diterima < sisaSebelum) {
      setCashWarning(`Uang kurang Rp${(sisaSebelum - diterima).toLocaleString("id-ID")}. Lengkapi sisa tagihan dengan cash tambahan atau metode lain.`);
    } else {
      setCashWarning("");
    }
    const applied = Math.min(diterima, sisaSebelum);
    if (applied > 0) addPayment("cash", applied);
    const kembalian = diterima - applied;
    if (kembalian > 0) setKembalianTotal((prev) => prev + kembalian);
    setCashInput("");
  };

  const [printing, setPrinting] = useState(false);

  const kirimKePrintBridge = async (trx) => {
    if (!printerBridgeUrl || printing) return;
    setPrinting(true);
    try {
      await fetch(printerBridgeUrl.replace(/\/$/, "") + "/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: STORE_NAME,
          storePhone: STORE_PHONE,
          storeAddress: STORE_ADDRESS,
          invoice: trx.id,
          tanggal: trx.tanggal,
          items: trx.items.map((i) => ({ nama: i.nama, qty: i.qty, subtotal: i.harga * i.qty })),
          total: trx.total,
          payments: trx.payments,
          kembalian: trx.kembalian,
        }),
      });
    } catch (e) {
      console.error("Gagal kirim ke print bridge:", e);
    } finally {
      setTimeout(() => setPrinting(false), 3000); // cegah klik dobel dalam 3 detik
    }
  };

  const selesaikanTransaksi = async () => {
    const invoice = "INV-" + Date.now().toString().slice(-8);
    const newProducts = products.map((p) => {
      const item = cart.find((i) => i.id === p.id);
      return item ? { ...p, etalase: p.etalase - item.qty } : p;
    });
    const trx = {
      id: invoice,
      tanggal: new Date().toISOString(),
      kasir: currentUser?.id || "-",
      items: cart.map((i) => ({ id: i.id, nama: i.nama, qty: i.qty, harga: i.hargaJual, hargaBeli: i.hargaBeli })),
      total,
      payments,
      kembalian: kembalianTotal,
      status: "selesai",
    };
    const newMovements = cart.map((i) => ({
      id: Date.now() + "-" + i.id,
      productId: i.id,
      nama: i.nama,
      tipe: "keluar",
      jumlah: i.qty,
      referensi: invoice,
      waktu: new Date().toISOString(),
    }));
    await persist({
      products: newProducts,
      transactions: [trx, ...data.transactions],
      movements: [...newMovements, ...data.movements],
    });
    setReceipt(trx);
    kirimKePrintBridge(trx);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 1800);
    setCart([]);
    setPayments([]);
    setSplitMode(false);
    setKembalianTotal(0);
    setCashInput("");
    setCashWarning("");
  };

  const batalkanTransaksiSelesai = async () => {
    if (!receipt) return;
    const restoredProducts = data.products.map((p) => {
      const item = receipt.items.find((i) => i.id === p.id);
      return item ? { ...p, etalase: p.etalase + item.qty } : p;
    });
    const cancelMovements = receipt.items.map((i) => ({
      id: Date.now() + "-cancel-" + i.id,
      productId: i.id,
      nama: i.nama,
      tipe: "batal_transaksi",
      jumlah: i.qty,
      referensi: receipt.id,
      waktu: new Date().toISOString(),
    }));
    await persist({
      ...data,
      products: restoredProducts,
      transactions: data.transactions.filter((t) => t.id !== receipt.id),
      movements: [...cancelMovements, ...data.movements],
    });
    setReceipt(null);
    setCancelReceiptConfirm(false);
  };

  const batalkanTransaksi = () => {
    setCart([]);
    setPayments([]);
    setKembalianTotal(0);
    setCashInput("");
    setCashWarning("");
    setVoidConfirm(false);
  };

  useModalKeys(voidConfirm, batalkanTransaksi, () => setVoidConfirm(false));
  useModalKeys(!!receipt, null, () => setReceipt(null));
  useModalKeys(cancelReceiptConfirm, batalkanTransaksiSelesai, () => setCancelReceiptConfirm(false));

  return (
    <div className="flex gap-5 p-5">
      <div
        className="flex-1 flex flex-col rounded-xl overflow-hidden"
        style={
          currentThemeMode === "glass"
            ? {
                backgroundColor: "rgba(255,255,255,0.20)",
                border: "1px solid rgba(255,255,255,0.35)",
                boxShadow: "0 12px 40px -8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
              }
            : cardStyle()
        }
      >
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px dashed ${c.border}` }}>
          <span className="text-sm font-semibold" style={{ color: c.text }}>Keranjang</span>
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${cartBump ? "anim-wiggle" : ""}`} style={{ color: cartBump ? "#fff" : c.textDim, backgroundColor: cartBump ? c.success : "transparent" }}>{cart.length} item</span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2" style={{ maxHeight: 300 }}>
          {cart.length === 0 && <p className="text-xs text-center py-8" style={{ color: c.textDim }}>Belum ada barang.</p>}
          {cart.map((i) => (
            <div key={i.id} className="flex items-center gap-2 py-2" style={{ borderBottom: `1px solid ${c.border}` }}>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: c.text }}>{i.nama}</p>
                <p className="text-[11px] font-mono" style={{ color: c.textDim }}>{rupiah(i.hargaJual)}</p>
              </div>
             <button onClick={() => changeQty(i.id, -1)} className="p-2 rounded min-w-[32px] min-h-[32px] flex items-center justify-center" style={{ backgroundColor: c.surfaceAlt }} aria-label={`Kurangi jumlah ${i.nama}`}><Minus size={12} color={c.text} /></button>
<QtyInput value={i.qty} max={i.etalase} onCommit={(n) => setQtyExact(i.id, n)} />
<button onClick={() => changeQty(i.id, 1)} className="p-2 rounded min-w-[32px] min-h-[32px] flex items-center justify-center" style={{ backgroundColor: c.surfaceAlt }} aria-label={`Tambah jumlah ${i.nama}`}><Plus size={12} color={c.text} /></button>
<button onClick={() => changeQty(i.id, -i.qty)} className="p-2 rounded ml-1 min-w-[32px] min-h-[32px] flex items-center justify-center" aria-label={`Hapus ${i.nama} dari keranjang`}><Trash2 size={12} color={c.coral} /></button>
            </div>
          ))}
        </div>
        <div className="px-4 py-3" style={{ borderTop: `1px dashed ${c.border}` }}>
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: c.textDim }}>Total</span>
            <span className="font-mono font-semibold" style={{ color: c.text }}>{rupiah(total)}</span>
          </div>
         {cart.length > 0 ? (
            <div className="mt-2 space-y-2">
              <div className="flex flex-col gap-1">
                <RupiahInput
                  value={cashInput}
                  onChange={(v) => { setCashInput(v); setCashWarning(""); }}
                  placeholder="Uang diterima (cash)"
                  className="w-full text-xs bg-transparent outline-none py-1.5 pr-2 rounded-lg font-mono"
                  style={{ border: `1px solid ${c.border}`, color: c.text }}
                />
                <button
                  onClick={bayarCash}
                  disabled={sisa <= 0}
                  className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-medium"
                  style={{ backgroundColor: c.surfaceAlt, color: c.text, border: `1px solid ${c.border}` }}
                >
                  <Banknote size={12} /> Bayar Cash
                </button>
              </div>
              <div className="flex gap-1.5">
                {[{ key: "cashless", icon: Wallet, label: "cashless (F5)" }].map(({ key, icon: Icon, label }) => (
                  <button key={key} onClick={() => addPayment(key, Math.max(sisa, 0))} disabled={sisa <= 0} className="flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] capitalize" style={{ backgroundColor: c.surfaceAlt, color: c.text, border: `1px solid ${c.border}` }}>
                    <Icon size={14} />{label}
                  </button>
                ))}
              </div>
              {cashWarning && (
                <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-lg text-[11px]" style={{ backgroundColor: c.coralDim, color: c.coral }}>
                  <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                  {cashWarning}
                </div>
              )}
              {payments.map((p, idx) => (
                <div key={idx} className="flex justify-between text-xs font-mono" style={{ color: c.mint }}>
                  <span className="capitalize">{p.metode}</span><span>{rupiah(p.jumlah)}</span>
                </div>
              ))}
              <div className="flex justify-between text-xs font-mono pt-1" style={{ color: sisa > 0 ? c.amber : c.mint, borderTop: `1px solid ${c.border}` }}>
                <span>Sisa</span><span>{rupiah(Math.max(sisa, 0))}</span>
              </div>
              {kembalianTotal > 0 && (
                <div className="flex justify-between text-xs font-mono" style={{ color: c.amber }}>
                  <span>Kembalian</span><span>{rupiah(kembalianTotal)}</span>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button onClick={() => setVoidConfirm(true)} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: c.coralDim, color: c.coral }}>Batalkan</button>
                <button onClick={selesaikanTransaksi} disabled={sisa > 0} className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all active:scale-95" style={ctaStyle(sisa <= 0, glassColorTheme)}>
                  <Check size={12} /> Selesai
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs text-center py-2" style={{ color: c.textDim }}>
              Tambahkan barang dulu untuk mulai pembayaran.
            </p>
          )}
        </div>
      </div>

      <div className="w-80 flex flex-col">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4 sticky top-0 z-20"
          style={{ ...searchBarStyle(), boxShadow: `0 4px 8px -4px ${c.bg}` }}
        >
          <Search size={16} color={c.textDim} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Cari nama, scan barcode, atau ketik SKU, lalu ↑↓ + Enter untuk pilih..."
            className="bg-transparent outline-none text-sm w-full"
            style={{ color: c.text }}
          />
        </div>
        <div className="grid grid-cols-1 gap-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
          {displayMode === "text" && (
            <div className="rounded-xl overflow-hidden" style={tableWrapStyle()}>
              {filtered.map((p, idx) => {
                const habis = p.etalase <= 0;
                const isHi = idx === highlight;
                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    onMouseEnter={() => setHighlight(idx)}
                    disabled={habis}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-left"
                    style={{ backgroundColor: isHi ? c.mintDim : c.surface, borderBottom: `1px solid ${c.border}`, boxShadow: isHi ? `inset 0 0 0 1px ${c.mint}` : "none", opacity: habis ? 0.45 : 1, cursor: habis ? "not-allowed" : "pointer" }}
                  >
                    <span className="text-sm" style={{ color: c.text }}>{p.nama}</span>
                    <div className="flex items-center gap-4">
                      <StokBadge n={p.etalase} />
                      <span className="text-xs font-mono w-20 text-right" style={successTextStyle()}>{rupiah(p.hargaJual)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {displayMode !== "text" && filtered.map((p, idx) => {
            const habis = p.etalase <= 0;
            const isHi = idx === highlight;
            return (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                onMouseEnter={() => setHighlight(idx)}
                disabled={habis}
                className="text-left p-3 rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-3"
                style={cardStyle({ opacity: habis ? 0.45 : 1, cursor: habis ? "not-allowed" : "pointer", ring: isHi })}
              >
                <div className="w-12 h-12 shrink-0 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: c.surfaceAlt }}>
                  {p.foto ? <img src={p.foto} alt={p.nama} className="w-full h-full object-cover" /> : <Package size={18} color={c.textDim} />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight truncate" style={{ color: c.text }}>{p.nama}</p>
                  <p className="text-xs font-mono mt-0.5" style={successTextStyle()}>{rupiah(p.hargaJual)}</p>
                  <StokBadge n={p.etalase} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {voidConfirm && (
         <ConfirmModal
    title="Batalkan transaksi ini?"
    desc="Item di keranjang akan dihapus dan tidak tersimpan."
    onCancel={() => setVoidConfirm(false)}
    onConfirm={batalkanTransaksi}
  />
)}

      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[60]">
          <div
            className="anim-pop-in px-6 py-4 rounded-2xl flex items-center gap-2 shadow-2xl"
            style={{ backgroundColor: c.mint, color: "#0B1210" }}
          >
            <span className="text-2xl">🎉</span>
            <span className="text-sm font-bold">Transaksi Berhasil!</span>
          </div>
        </div>
      )}

      {receipt && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div ref={receiptRef} className="w-72 rounded-xl overflow-hidden" style={{ backgroundColor: "#fff" }}>
            <div className="p-4 font-mono text-[11px] print-receipt" style={{ color: "#111" }}>
              <p className="text-center font-semibold receipt-title" style={{ textTransform: "uppercase" }}>{STORE_NAME}</p>
              <div className="my-1" style={{ borderTop: "1px dashed #999" }} />
              <p className="text-center" style={{ color: "#555" }}>{STORE_ADDRESS}</p>
              <p className="text-center" style={{ color: "#555" }}>Telp: {STORE_PHONE}</p>
              <p className="text-center" style={{ color: "#555" }}>{receipt.id}</p>
              <p className="text-center" style={{ color: "#555" }}>{new Date(receipt.tanggal).toLocaleString("id-ID")}</p>
              <div className="my-2" style={{ borderTop: "1px dashed #999" }} />
              {receipt.items.map((it) => (
                <div key={it.id} className="flex justify-between">
                  <span>{it.nama} x{it.qty}</span>
                  <span>{rupiah(it.harga * it.qty)}</span>
                </div>
              ))}
              <div className="my-2" style={{ borderTop: "2px solid #111" }} />
              <div className="flex justify-between font-semibold"><span>Total</span><span>{rupiah(receipt.total)}</span></div>
              {receipt.payments.map((p, idx) => (
                <div key={idx} className="flex justify-between capitalize" style={{ color: "#555" }}><span>{p.metode}</span><span>{rupiah(p.jumlah)}</span></div>
              ))}
              {receipt.kembalian > 0 && (
                <div className="flex justify-between font-semibold" style={{ color: "#111" }}><span>Kembalian</span><span>{rupiah(receipt.kembalian)}</span></div>
              )}
              <p className="text-center mt-3">Syukron Atas Kunjungannya :)</p>
              <p className="text-center">Anda Belanja Anda Beramal</p>
            </div>
            {printerBridgeUrl && (
              <p className="text-center text-xs px-4" style={{ color: "#0E9F63" }}>✓ Sudah dikirim otomatis ke printer</p>
            )}
            <div className="flex gap-2 p-3 no-print" style={{ backgroundColor: "#eee" }}>
              <button onClick={() => setCancelReceiptConfirm(true)} className="py-2 px-3 rounded-lg text-xs font-medium" style={{ backgroundColor: "#f3d2d2", color: "#8a2020" }}>Batalkan</button>
              <button onClick={() => setReceipt(null)} className="flex-1 py-2 rounded-lg text-xs" style={{ backgroundColor: "#ddd", color: "#111" }}>Tutup</button>
              <button
                onClick={() => (printerBridgeUrl ? kirimKePrintBridge(receipt) : window.print())}
                disabled={printerBridgeUrl && printing}
                className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                style={{ backgroundColor: printerBridgeUrl && printing ? "#ccc" : c.mint, color: "#0B1210" }}
              >
                <Printer size={12} /> {printerBridgeUrl ? (printing ? "Mencetak..." : "Cetak Ulang") : "Cetak"}
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelReceiptConfirm && (
        <ConfirmModal
    title={`Batalkan transaksi ${receipt?.id}?`}
    desc="Stok akan dikembalikan dan transaksi dihapus dari riwayat & laporan. Tindakan ini tercatat di log audit."
    onCancel={() => setCancelReceiptConfirm(false)}
    onConfirm={batalkanTransaksiSelesai}
  />
)}
    </div>
    );
}

// ---------------- KATALOG ----------------
function KatalogScreen({ data }) {
  const [mode, setMode] = useState("visual");
  const [search, setSearch] = useState("");
  const [highlight, setHighlight] = useState(0);

  const filtered = data.products.filter((p) =>
    (p.nama + p.sku + p.barcode + p.kategori).toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => { setHighlight(0); }, [search, mode]);

  // Katalog cuma menampilkan info (tidak ada aksi klik/pilih), jadi panah+Enter di sini
  // berfungsi menyorot & menggulir ke barang yang dituju — pengganti mouse untuk menelusuri daftar.
  const cols = mode === "visual" ? 4 : 1;
  const handleKatalogKeyDown = (e) => {
    if (!filtered.length) return;
    let delta = null;
    if (e.key === "ArrowRight") delta = 1;
    else if (e.key === "ArrowLeft") delta = -1;
    else if (e.key === "ArrowDown") delta = cols;
    else if (e.key === "ArrowUp") delta = -cols;
    else if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById(`katalog-item-${highlight}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    if (delta !== null) {
      e.preventDefault();
      setHighlight((i) => Math.min(Math.max(i + delta, 0), filtered.length - 1));
    }
  };

  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-4 sticky top-0 z-20 py-2" style={{ backgroundColor: c.bg }}>
        <button onClick={() => setMode("visual")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: mode === "visual" ? c.mintDim : c.surfaceAlt, color: mode === "visual" ? c.mint : c.textDim }}>
          <Grid3x3 size={13} /> Bergambar
        </button>
        <button onClick={() => setMode("text")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: mode === "text" ? c.mintDim : c.surfaceAlt, color: mode === "text" ? c.mint : c.textDim }}>
          <List size={13} /> Teks
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg flex-1" style={searchBarStyle()}>
          <Search size={14} color={c.textDim} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKatalogKeyDown}
            placeholder="Cari nama, SKU, barcode, atau kategori... (↑↓←→ sorot, Enter gulir ke situ)"
            className="bg-transparent outline-none text-sm w-full"
            style={{ color: c.text }}
          />
        </div>
      </div>

      {mode === "visual" ? (
        <div className="grid grid-cols-4 gap-3">
          {filtered.length === 0 && (
            <p className="col-span-4 text-center text-xs py-6" style={{ color: c.textDim }}>Tidak ada barang yang cocok.</p>
          )}
          {filtered.map((p, idx) => (
            <div id={`katalog-item-${idx}`} key={p.id} className="rounded-xl p-3" style={cardStyle({ ring: idx === highlight })}>
              <div className="w-full h-20 rounded-lg flex items-center justify-center mb-2 overflow-hidden" style={{ backgroundColor: c.surfaceAlt }}>
                {p.foto ? <img src={p.foto} alt={p.nama} className="w-full h-full object-cover" /> : <Package size={26} color={c.textDim} />}
              </div>
              <p className="text-sm font-medium" style={{ color: c.text }}>{p.nama}</p>
              <p className="text-xs" style={{ color: c.textDim }}>{p.kategori}</p>
              <p className="text-sm font-mono mt-1" style={successTextStyle()}>{rupiah(p.hargaJual)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={tableWrapStyle()}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: c.surfaceAlt, color: c.textDim }}>
                <th className="text-left px-4 py-2 font-medium">SKU</th>
                <th className="text-left px-4 py-2 font-medium">Nama</th>
                <th className="text-left px-4 py-2 font-medium">Kategori</th>
                <th className="text-right px-4 py-2 font-medium">Harga</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-xs" style={{ color: c.textDim }}>Tidak ada barang yang cocok.</td></tr>
              )}
              {filtered.map((p, idx) => (
                <tr id={`katalog-item-${idx}`} key={p.id} style={{ backgroundColor: idx === highlight ? c.mintDim : c.surface, borderTop: `1px solid ${c.border}`, boxShadow: idx === highlight ? `inset 0 0 0 1px ${c.mint}` : "none" }}>
                  <td className="px-4 py-2 font-mono text-xs" style={{ color: c.textDim }}>{p.sku}</td>
                  <td className="px-4 py-2" style={{ color: c.text }}>{p.nama}</td>
                  <td className="px-4 py-2" style={{ color: c.textDim }}>{p.kategori}</td>
                  <td className="px-4 py-2 text-right font-mono" style={successTextStyle()}>{rupiah(p.hargaJual)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------- GUDANG & TRANSFER (+ barang baru & barcode) ----------------
function GudangScreen({ data, persist, role }) {
  const isAdmin = role === "admin";
  const [inputs, setInputs] = useState({});
  const [refillInputs, setRefillInputs] = useState({});
  const [form, setForm] = useState({ nama: "", kategori: "", hargaBeli: "", hargaJual: "", gudang: "", etalaseAwal: "", barcode: "", foto: "" });
  const [showLabel, setShowLabel] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selected, setSelected] = useState([]);
  const [bulkPrint, setBulkPrint] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightRow, setHighlightRow] = useState(0);
  const addFormRef = useRef(null);
  const editingRef = useRef(null);
useFocusTrap(!!editing, editingRef);
  const showLabelRef = useRef(null);
useFocusTrap(!!showLabel, showLabelRef);
  const bulkPrintRef = useRef(null);
useFocusTrap(bulkPrint, bulkPrintRef);
  const handleEnterNext = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const container = addFormRef.current;
    if (!container) return;
    const focusables = Array.from(container.querySelectorAll("input:not([type=file])"));
    const idx = focusables.indexOf(e.target);
    if (idx > -1 && idx < focusables.length - 1) {
      focusables[idx + 1].focus();
    } else {
      addProduct();
    }
  };

  const filteredProducts = data.products.filter((p) =>
    (p.nama + p.sku + p.barcode + p.kategori).toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => { setHighlightRow(0); }, [search]);

  // Panah atas/bawah pindah baris, Enter untuk memilih (centang) barang yang di-highlight.
  const handleSearchListKeyDown = (e) => {
    if (!filteredProducts.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightRow((i) => Math.min(i + 1, filteredProducts.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightRow((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const target = filteredProducts[highlightRow];
      if (target) {
        e.preventDefault();
        toggleSelect(target.id);
      }
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const toggleSelectAll = () => {
    setSelected((prev) => (prev.length === filteredProducts.length ? [] : filteredProducts.map((p) => p.id)));
  };
  const selectedProducts = data.products.filter((p) => selected.includes(p.id));

  const [copyMsg, setCopyMsg] = useState("");

  const copySelected = async () => {
    const header = ["Nama", "SKU", "Barcode", "Kategori", "Harga Jual"].join("\t");
    const rows = selectedProducts.map((p) => [p.nama, p.sku, p.barcode, p.kategori, p.hargaJual].join("\t"));
    try {
      await navigator.clipboard.writeText([header, ...rows].join("\n"));
      setCopyMsg("Kode tersalin (teks saja).");
    } catch (e) {
      setCopyMsg("Gagal menyalin.");
    }
    setTimeout(() => setCopyMsg(""), 2500);
  };

  const copySelectedWithBarcode = async () => {
    setCopyMsg("Menyiapkan gambar barcode...");
    try {
      const rows = selectedProducts.map((p) => {
        const dataUrl = barcodeToPngDataUrl(p.barcode, 220, 80);
        return `<tr>
            <td style="padding:10px;border:1px solid #ddd;text-align:center;">
              <div style="font-weight:bold;font-size:13px;margin-bottom:2px;">${p.nama}</div>
              <div style="font-size:12px;margin-bottom:6px;">Rp${formatRibuan(p.hargaJual)}</div>
              <img src="${dataUrl}" width="220" height="80" />
            </td>
          </tr>`;
      });
      const html = `<table style="border-collapse:collapse;font-family:sans-serif;">
        <tbody>${rows.join("")}</tbody>
      </table>`;
      const plain = selectedProducts.map((p) => `${p.nama}\nRp${formatRibuan(p.hargaJual)}\n${p.barcode}`).join("\n\n");

      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([plain], { type: "text/plain" }),
        }),
      ]);
      setCopyMsg("Kode + gambar barcode tersalin! Paste ke Word/Google Docs.");
    } catch (e) {
      console.error(e);
      setCopyMsg("Gagal menyalin gambar. Pastikan pakai Chrome/Edge versi terbaru.");
    }
    setTimeout(() => setCopyMsg(""), 3500);
  };

  const downloadDocx = async () => {
    setCopyMsg("Menyiapkan file Word...");
    try {
      const rows = selectedProducts.map((p) => {
        const dataUrl = barcodeToPngDataUrl(p.barcode, 300, 100);
        const base64 = dataUrl.split(",")[1];
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              margins: { top: 150, bottom: 150, left: 150, right: 150 },
              children: [
                new Paragraph({ children: [new TextRun({ text: p.nama, bold: true, size: 24 })] }),
                new Paragraph({ children: [new TextRun({ text: `Rp${formatRibuan(p.hargaJual)}`, size: 22 })] }),
                new Paragraph({
                  children: [new ImageRun({ data: bytes, type: "png", transformation: { width: 220, height: 73 } })],
                }),
              ],
            }),
          ],
        });
      });
      const doc = new Document({
        sections: [
          {
            children: [
              new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }),
            ],
          },
        ],
      });
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "label-barang.docx";
      a.click();
      URL.revokeObjectURL(url);
      setCopyMsg("File Word berhasil di-download.");
    } catch (e) {
      console.error(e);
      setCopyMsg("Gagal membuat file Word.");
    }
    setTimeout(() => setCopyMsg(""), 3000);
  };

  const downloadCSV = () => {
    const header = ["Nama", "SKU", "Barcode", "Kategori", "Harga Jual"].join(",");
    const rows = selectedProducts.map((p) => [`"${p.nama}"`, p.sku, p.barcode, `"${p.kategori}"`, p.hargaJual].join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "barang-terpilih.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const doTransfer = async (p) => {
    const jumlah = parseInt(inputs[p.id] || "0", 10);
    if (!jumlah || jumlah <= 0 || jumlah > p.gudang) return;
    const newProducts = data.products.map((x) => (x.id === p.id ? { ...x, gudang: x.gudang - jumlah, etalase: x.etalase + jumlah } : x));
    const mv = { id: Date.now() + "-t", productId: p.id, nama: p.nama, tipe: "transfer", jumlah, referensi: "-", waktu: new Date().toISOString() };
    await persist({ ...data, products: newProducts, movements: [mv, ...data.movements] });
    setInputs((prev) => ({ ...prev, [p.id]: "" }));
  };

  const doRefill = async (p) => {
    const jumlah = parseInt(refillInputs[p.id] || "0", 10);
    if (!jumlah || jumlah <= 0) return;
    const newProducts = data.products.map((x) => (x.id === p.id ? { ...x, gudang: x.gudang + jumlah } : x));
    const mv = { id: Date.now() + "-r", productId: p.id, nama: p.nama, tipe: "masuk", jumlah, referensi: "Refill gudang", waktu: new Date().toISOString() };
    await persist({ ...data, products: newProducts, movements: [mv, ...data.movements] });
    setRefillInputs((prev) => ({ ...prev, [p.id]: "" }));
  };

  const addProduct = async () => {
    if (!form.nama || !form.hargaJual) return;
    const id = Date.now();
    const sku = nextSku(data.products);
    const barcode = form.barcode.trim() ? form.barcode.trim() : genBarcodeDigits();
    const newProduct = {
      id, sku, barcode,
      nama: form.nama,
      kategori: form.kategori || "Umum",
      satuan: "pcs",
      hargaBeli: parseInt(form.hargaBeli || "0", 10),
      hargaJual: parseInt(form.hargaJual || "0", 10),
      etalase: parseInt(form.etalaseAwal || "0", 10),
      gudang: parseInt(form.gudang || "0", 10),
      foto: form.foto || "",
    };
    await persist({ ...data, products: [...data.products, newProduct] });
    setForm({ nama: "", kategori: "", hargaBeli: "", hargaJual: "", gudang: "", etalaseAwal: "", barcode: "", foto: "" });
    setShowLabel(newProduct);
  };

  const handleFotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, foto: reader.result }));
    reader.readAsDataURL(file);
  };

  const simpanEdit = async () => {
    const oldProduct = data.products.find((p) => p.id === editing.id);
    const newGudang = parseInt(editing.gudang || "0", 10);
    const newEtalase = parseInt(editing.etalase || "0", 10);
    const newProducts = data.products.map((p) => {
      if (p.id !== editing.id) return p;
      return {
        ...p,
        nama: editing.nama,
        kategori: editing.kategori,
        satuan: editing.satuan,
        hargaBeli: isAdmin ? parseInt(editing.hargaBeli || "0", 10) : p.hargaBeli,
        hargaJual: isAdmin ? parseInt(editing.hargaJual || "0", 10) : p.hargaJual,
        barcode: editing.barcode?.trim() ? editing.barcode.trim() : p.barcode,
        gudang: newGudang,
        etalase: newEtalase,
      };
    });
    const newMovements = [];
    if (oldProduct && newGudang !== oldProduct.gudang) {
      newMovements.push({ id: Date.now() + "-eg", productId: editing.id, nama: editing.nama, tipe: "edit_stok_gudang", jumlah: newGudang - oldProduct.gudang, referensi: "Edit manual", waktu: new Date().toISOString() });
    }
    if (oldProduct && newEtalase !== oldProduct.etalase) {
      newMovements.push({ id: Date.now() + "-ee", productId: editing.id, nama: editing.nama, tipe: "edit_stok_etalase", jumlah: newEtalase - oldProduct.etalase, referensi: "Edit manual", waktu: new Date().toISOString() });
    }
    await persist({ ...data, products: newProducts, movements: [...newMovements, ...data.movements] });
    setEditing(null);
  };

  const hapusBarang = async (p) => {
    const newProducts = data.products.filter((x) => x.id !== p.id);
    const mv = { id: Date.now() + "-del", productId: p.id, nama: p.nama, tipe: "hapus_barang", jumlah: 0, referensi: "-", waktu: new Date().toISOString() };
    await persist({ ...data, products: newProducts, movements: [mv, ...data.movements] });
    setDeleteConfirm(null);
  };

  useModalKeys(!!editing, simpanEdit, () => setEditing(null));
  useModalKeys(!!deleteConfirm, () => hapusBarang(deleteConfirm), () => setDeleteConfirm(null));
  useModalKeys(!!showLabel, () => window.print(), () => setShowLabel(null));
  useModalKeys(bulkPrint, () => window.print(), () => setBulkPrint(false));

  return (
    <div className="p-5 flex gap-5">
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg sticky top-0 z-20" style={{ ...searchBarStyle(), boxShadow: `0 4px 8px -4px ${c.bg}` }}>
          <Search size={16} color={c.textDim} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchListKeyDown}
            placeholder="Cari nama, SKU, barcode, atau kategori... (↑↓ pilih, Enter centang)"
            className="bg-transparent outline-none text-sm w-full"
            style={{ color: c.text }}
          />
        </div>
        {selected.length > 0 && (
          <div className="px-3 py-2 rounded-lg" style={{ backgroundColor: c.mintDim, border: `1px solid ${c.mint}` }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: c.mint }}>{selected.length} barang dipilih</span>
              <div className="flex gap-2">
                <button onClick={copySelected} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ backgroundColor: c.surfaceAlt, color: c.text }}>Copy Kode</button>
                <button onClick={copySelectedWithBarcode} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ backgroundColor: c.surfaceAlt, color: c.text }}>Copy Kode + Barcode</button>
                <button onClick={downloadDocx} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ backgroundColor: c.surfaceAlt, color: c.text }}>Download Word</button>
                <button onClick={downloadCSV} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ backgroundColor: c.surfaceAlt, color: c.text }}>Download CSV</button>
                <button onClick={() => setBulkPrint(true)} className="text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1" style={{ backgroundColor: c.mint, color: "#0B1210" }}>
                  <Printer size={12} /> Cetak Label Terpilih
                </button>
                <button onClick={() => setSelected([])} className="text-xs px-2 py-1.5 rounded-lg" style={{ color: c.textDim }} aria-label="Batalkan pilihan barang">✕</button>
              </div>
            </div>
            {copyMsg && <p className="text-[11px] mt-1.5" style={{ color: c.mint }}>{copyMsg}</p>}
          </div>
        )}
        <div className="rounded-xl overflow-hidden" style={tableWrapStyle()}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: c.surfaceAlt, color: c.textDim }}>
                <th className="px-3 py-2">
                  <input type="checkbox" checked={selected.length === filteredProducts.length && filteredProducts.length > 0} onChange={toggleSelectAll} />
                </th>
                <th className="text-left px-4 py-2 font-medium">Barang</th>
                <th className="text-right px-4 py-2 font-medium">Gudang</th>
                <th className="text-right px-4 py-2 font-medium">Etalase</th>
                <th className="text-right px-4 py-2 font-medium">Isi Gudang</th>
                <th className="text-right px-4 py-2 font-medium">Transfer ke Etalase</th>
                <th className="px-4 py-2"></th>
                {isAdmin && <th className="px-4 py-2"></th>}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 && (
                <tr><td colSpan={isAdmin ? 8 : 7} className="px-4 py-6 text-center text-xs" style={{ color: c.textDim }}>Tidak ada barang yang cocok.</td></tr>
              )}
              {filteredProducts.map((p, idx) => (
                <tr
                  key={p.id}
                  onMouseEnter={() => setHighlightRow(idx)}
                  style={{ backgroundColor: idx === highlightRow ? c.mintDim : c.surface, borderTop: `1px solid ${c.border}`, boxShadow: idx === highlightRow ? `inset 0 0 0 1px ${c.mint}` : "none" }}
                >
                  <td className="px-3 py-2 text-center">
                    <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                  </td>
                  <td className="px-4 py-2" style={{ color: c.text }}>{p.nama}</td>
                  <td className="px-4 py-2 text-right font-mono" style={{ color: c.text }}>{p.gudang}</td>
                  <td className="px-4 py-2 text-right font-mono" style={{ color: c.text }}>{p.etalase}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                     <input inputMode="numeric" pattern="[0-9]*" value={refillInputs[p.id] || ""} onChange={(e) => setRefillInputs((prev) => ({ ...prev, [p.id]: e.target.value.replace(/\D/g, "") }))} placeholder="0" className="w-14 text-right bg-transparent outline-none font-mono text-sm px-1 py-0.5 rounded" style={{ border: `1px solid ${c.border}`, color: c.text }} />
                      <button onClick={() => doRefill(p)} className="text-xs px-2 py-1.5 rounded-lg font-medium" style={{ backgroundColor: c.amberDim, color: c.amber }}>Isi</button>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                     <input inputMode="numeric" pattern="[0-9]*" value={inputs[p.id] || ""} onChange={(e) => setInputs((prev) => ({ ...prev, [p.id]: e.target.value.replace(/\D/g, "") }))} placeholder="0" className="w-14 text-right bg-transparent outline-none font-mono text-sm px-1 py-0.5 rounded" style={{ border: `1px solid ${c.border}`, color: c.text }} />
                      <button onClick={() => doTransfer(p)} className="text-xs px-2 py-1.5 rounded-lg font-medium" style={{ backgroundColor: c.mintDim, color: c.mint }}>Transfer</button>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => setShowLabel(p)} className="text-xs px-2 py-1.5 rounded-lg flex items-center gap-1" style={{ backgroundColor: c.surfaceAlt, color: c.textDim }}>
                      <BarcodeIcon size={12} /> Label
                    </button>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => setEditing({ ...p, hargaBeli: String(p.hargaBeli), hargaJual: String(p.hargaJual), gudang: String(p.gudang), etalase: String(p.etalase) })}
                        className="text-xs px-2 py-1.5 rounded-lg mr-1"
                        style={{ backgroundColor: c.surfaceAlt, color: c.textDim }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(p)}
                        className="text-xs px-2 py-1.5 rounded-lg"
                        style={{ backgroundColor: c.coralDim, color: c.coral }}
                      >
                        Hapus
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdmin ? (
        <div className="w-72 rounded-xl p-4" style={cardStyle()}>
          <p className="text-sm font-semibold mb-3" style={{ color: c.text }}>Tambah Barang Baru</p>
          <div className="space-y-2" ref={addFormRef}>
            {[
              { key: "nama", ph: "Nama barang" },
              { key: "kategori", ph: "Kategori" },
              { key: "gudang", ph: "Stok awal gudang" },
              { key: "etalaseAwal", ph: "Stok awal etalase (langsung dipajang)" },
              { key: "barcode", ph: "Barcode pabrik (opsional, scan di sini)" },
            ].map((f) => (
              <input
                key={f.key}
                value={form[f.key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                onKeyDown={handleEnterNext}
                placeholder={f.ph}
                className="w-full text-sm bg-transparent outline-none px-2 py-1.5 rounded-lg"
                style={{ border: `1px solid ${c.border}`, color: c.text }}
              />
            ))}
            <RupiahInput
              value={form.hargaBeli}
              onChange={(v) => setForm((prev) => ({ ...prev, hargaBeli: v }))}
              onKeyDown={handleEnterNext}
              placeholder="Harga beli"
              className="w-full text-sm bg-transparent outline-none py-1.5 pr-2 rounded-lg"
              style={{ border: `1px solid ${c.border}`, color: c.text }}
            />
            <RupiahInput
              value={form.hargaJual}
              onChange={(v) => setForm((prev) => ({ ...prev, hargaJual: v }))}
              onKeyDown={handleEnterNext}
              placeholder="Harga jual"
              className="w-full text-sm bg-transparent outline-none py-1.5 pr-2 rounded-lg"
              style={{ border: `1px solid ${c.border}`, color: c.text }}
            />
            <div>
              <p className="text-[11px] mb-1" style={{ color: c.textDim }}>Foto barang (opsional)</p>
              {form.foto && (
                <img src={form.foto} alt="preview" className="w-full h-20 object-cover rounded-lg mb-1" />
              )}
              <input type="file" accept="image/*" onChange={handleFotoUpload} className="w-full text-xs" style={{ color: c.textDim }} />
            </div>
            <button onClick={addProduct} className="w-full py-2 rounded-lg text-sm font-medium mt-1" style={{ backgroundColor: c.mint, color: "#0B1210" }}>
              Simpan & Buat Barcode
            </button>
            <p className="text-[11px]" style={{ color: c.textDim }}>
              Kalau barang sudah punya barcode dari pabrik, scan/ketik di kolom "Barcode pabrik". Kalau dikosongkan, sistem buat barcode sendiri otomatis. Tekan Enter untuk pindah ke kolom berikutnya.
            </p>
          </div>
        </div>
      ) : (
        <div className="w-72 rounded-xl p-4 flex items-start gap-2" style={cardStyle()}>
          <AlertTriangle size={14} color={c.amber} className="mt-0.5 shrink-0" />
          <p className="text-xs" style={{ color: c.textDim }}>
            Login sebagai <b style={{ color: c.text }}>kasir</b> — hanya bisa transfer stok. Tambah barang baru dan ubah harga hanya bisa dilakukan admin.
          </p>
        </div>
      )}

      {editing && (
        <div ref={editingRef} className="rounded-xl p-4 w-80" style={cardStyle()}>
            <p className="text-sm font-semibold mb-3" style={{ color: c.text }}>Edit Barang</p>
            <div className="space-y-2">
              <input value={editing.nama} onChange={(e) => setEditing((prev) => ({ ...prev, nama: e.target.value }))} placeholder="Nama barang" className="w-full text-sm bg-transparent outline-none px-2 py-1.5 rounded-lg" style={{ border: `1px solid ${c.border}`, color: c.text }} />
              <input value={editing.kategori} onChange={(e) => setEditing((prev) => ({ ...prev, kategori: e.target.value }))} placeholder="Kategori" className="w-full text-sm bg-transparent outline-none px-2 py-1.5 rounded-lg" style={{ border: `1px solid ${c.border}`, color: c.text }} />
              <div>
                <p className="text-[10px] mb-1" style={{ color: c.textDim }}>Barcode / Kode Label</p>
                <input value={editing.barcode || ""} onChange={(e) => setEditing((prev) => ({ ...prev, barcode: e.target.value }))} placeholder="Barcode" className="w-full text-sm bg-transparent outline-none px-2 py-1.5 rounded-lg font-mono" style={{ border: `1px solid ${c.border}`, color: c.text }} />
              </div>
              <RupiahInput value={editing.hargaBeli} onChange={(v) => setEditing((prev) => ({ ...prev, hargaBeli: v }))} placeholder="Harga beli" className="w-full text-sm bg-transparent outline-none py-1.5 pr-2 rounded-lg" style={{ border: `1px solid ${c.border}`, color: c.text }} />
              <RupiahInput value={editing.hargaJual} onChange={(v) => setEditing((prev) => ({ ...prev, hargaJual: v }))} placeholder="Harga jual" className="w-full text-sm bg-transparent outline-none py-1.5 pr-2 rounded-lg" style={{ border: `1px solid ${c.border}`, color: c.text }} />
              <div className="flex gap-2 pt-1" style={{ borderTop: `1px dashed ${c.border}` }}>
                <div className="flex-1">
                  <p className="text-[10px] mb-1" style={{ color: c.textDim }}>Stok Gudang</p>
                  <input inputMode="numeric" pattern="[0-9]*" value={editing.gudang} onChange={(e) => setEditing((prev) => ({ ...prev, gudang: e.target.value.replace(/\D/g, "") }))} className="w-full text-sm bg-transparent outline-none px-2 py-1.5 rounded-lg" style={{ border: `1px solid ${c.border}`, color: c.text }} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] mb-1" style={{ color: c.textDim }}>Stok Etalase</p>
                  <input value={editing.etalase} onChange={(e) => setEditing((prev) => ({ ...prev, etalase: e.target.value.replace(/\D/g, "") }))} className="w-full text-sm bg-transparent outline-none px-2 py-1.5 rounded-lg" style={{ border: `1px solid ${c.border}`, color: c.text }} />
                </div>
              </div>
              <p className="text-[10px]" style={{ color: c.textDim }}>Mengubah angka ini langsung menimpa jumlah stok (bukan transfer) — perubahan tercatat di log audit.</p>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setEditing(null)} className="flex-1 py-2 rounded-lg text-xs" style={{ backgroundColor: c.surfaceAlt, color: c.text }}>Batal</button>
              <button onClick={simpanEdit} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: c.mint, color: "#0B1210" }}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <ConfirmModal
    title={`Hapus "${deleteConfirm.nama}"?`}
    desc="Barang akan hilang dari katalog, gudang, dan etalase. Riwayat transaksi lama tidak terpengaruh."
    onCancel={() => setDeleteConfirm(null)}
    onConfirm={() => hapusBarang(deleteConfirm)}
    confirmLabel="Ya, hapus"
  />
)}

      {showLabel && (
        <div ref={showLabelRef} className="rounded-xl p-4" style={{ backgroundColor: "#fff", width: 220 }}>
            <div className="print-receipt">
              <p className="text-xs font-semibold text-center mb-1" style={{ color: "#111" }}>{showLabel.nama}</p>
              <p className="text-xs text-center mb-2" style={{ color: "#333" }}>{rupiah(showLabel.hargaJual)}</p>
              <BarcodeSVG value={showLabel.barcode} width={190} />
            </div>
            <div className="flex gap-2 mt-3 no-print">
              <button onClick={() => setShowLabel(null)} className="flex-1 py-2 rounded-lg text-xs" style={{ backgroundColor: "#eee", color: "#111" }}>Tutup</button>
              <button onClick={() => window.print()} className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1" style={{ backgroundColor: c.mint, color: "#0B1210" }}>
                <Printer size={12} /> Cetak Label
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkPrint && (
      <div ref={bulkPrintRef} className="rounded-xl p-4 max-h-[85vh] overflow-y-auto" style={{ backgroundColor: "#fff", width: 260 }}>
            <div className="grid grid-cols-1 gap-3 print-receipt">
              {selectedProducts.map((p) => (
                <div key={p.id} className="pb-3" style={{ borderBottom: "1px dashed #ccc" }}>
                  <p className="text-xs font-semibold text-center mb-1" style={{ color: "#111" }}>{p.nama}</p>
                  <p className="text-xs text-center mb-2" style={{ color: "#333" }}>{rupiah(p.hargaJual)}</p>
                  <BarcodeSVG value={p.barcode} width={220} />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3 no-print">
              <button onClick={() => setBulkPrint(false)} className="flex-1 py-2 rounded-lg text-xs" style={{ backgroundColor: "#eee", color: "#111" }}>Tutup</button>
              <button onClick={() => window.print()} className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1" style={{ backgroundColor: c.mint, color: "#0B1210" }}>
                <Printer size={12} /> Cetak Semua
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- STOK OPNAME ----------------
function OpnameScreen({ data, persist }) {
  const [fisik, setFisik] = useState({});
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState("");

  const rows = data.products
    .filter((p) => (p.nama + p.sku + p.barcode + p.kategori).toLowerCase().includes(search.toLowerCase()))
    .map((p) => {
      const nilai = fisik[p.id];
      const ada = nilai !== undefined && nilai !== "";
      const jumlahFisik = ada ? parseInt(nilai, 10) : null;
      const selisih = ada ? jumlahFisik - p.etalase : null;
      return { ...p, jumlahFisik, selisih, ada };
    });

  const simpanOpname = async () => {
    const allRows = data.products.map((p) => {
      const nilai = fisik[p.id];
      const ada = nilai !== undefined && nilai !== "";
      const jumlahFisik = ada ? parseInt(nilai, 10) : null;
      const selisih = ada ? jumlahFisik - p.etalase : null;
      return { ...p, jumlahFisik, selisih, ada };
    });
    const adaPerubahan = allRows.filter((r) => r.ada && r.selisih !== 0);
    const newProducts = data.products.map((p) => {
      const r = allRows.find((x) => x.id === p.id);
      return r && r.ada ? { ...p, etalase: r.jumlahFisik } : p;
    });
    const newMovements = adaPerubahan.map((r) => ({
      id: Date.now() + "-op-" + r.id,
      productId: r.id,
      nama: r.nama,
      tipe: "opname",
      jumlah: r.selisih,
      referensi: "-",
      waktu: new Date().toISOString(),
    }));
    await persist({ ...data, products: newProducts, movements: [...newMovements, ...data.movements] });
    setSaved(true);
    setFisik({});
  };

  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-4 sticky top-0 z-20 py-2" style={{ backgroundColor: c.bg }}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg flex-1" style={searchBarStyle()}>
          <Search size={14} color={c.textDim} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, SKU, barcode, atau kategori..."
            className="bg-transparent outline-none text-sm w-full"
            style={{ color: c.text }}
          />
        </div>
        <button onClick={simpanOpname} className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap" style={{ backgroundColor: c.mint, color: "#0B1210" }}>
          Simpan Hasil Opname
        </button>
      </div>

      {saved && <p className="mb-3 text-xs" style={{ color: c.mint }}>Tersimpan. Selisih otomatis dicatat ke log audit stok.</p>}

      <div className="rounded-xl overflow-hidden" style={tableWrapStyle()}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: c.surfaceAlt, color: c.textDim }}>
              <th className="text-left px-4 py-2 font-medium">Barang</th>
              <th className="text-right px-4 py-2 font-medium">Stok Sistem</th>
              <th className="text-right px-4 py-2 font-medium">Stok Fisik</th>
              <th className="text-right px-4 py-2 font-medium">Selisih</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-xs" style={{ color: c.textDim }}>Tidak ada barang yang cocok.</td></tr>
            )}
            {rows.map((p) => (
              <tr key={p.id} style={{ backgroundColor: c.surface, borderTop: `1px solid ${c.border}` }}>
                <td className="px-4 py-2" style={{ color: c.text }}>{p.nama}</td>
                <td className="px-4 py-2 text-right font-mono" style={{ color: c.text }}>{p.etalase}</td>
                <td className="px-4 py-2 text-right">
                  <input inputMode="numeric" pattern="[0-9]*" value={fisik[p.id] ?? ""} onChange={(e) => setFisik((prev) => ({ ...prev, [p.id]: e.target.value.replace(/\D/g, "") }))} placeholder="—" className="w-16 text-right bg-transparent outline-none font-mono text-sm px-1 py-0.5 rounded" style={{ border: `1px solid ${c.border}`, color: c.text }} />
                </td>
                <td className="px-4 py-2 text-right">
                  {p.ada ? (
                    <span className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded" style={{ backgroundColor: p.selisih === 0 ? c.mintDim : p.selisih < 0 ? c.coralDim : c.amberDim, color: p.selisih === 0 ? c.mint : p.selisih < 0 ? c.coral : c.amber }}>
                      {p.selisih !== 0 && <AlertTriangle size={11} />}
                      {p.selisih > 0 ? `+${p.selisih}` : p.selisih}
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: c.textDim }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CopyButton({ getText }) {
  const [copied, setCopied] = useState(false);
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("Gagal menyalin", e);
    }
  };
  return (
    <button onClick={doCopy} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ backgroundColor: copied ? c.mintDim : c.surfaceAlt, color: copied ? c.mint : c.textDim }}>
      {copied ? "Tersalin ✓" : "Copy"}
    </button>
  );
}

function getWeekRangeSatToFri(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Minggu ... 6=Sabtu
  const diffToSaturday = (day + 1) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - diffToSaturday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getHijriParts(date) {
  const fmt = new Intl.DateTimeFormat("en-u-ca-islamic", { year: "numeric", month: "numeric" });
  const parts = fmt.formatToParts(new Date(date));
  return {
    year: parts.find((p) => p.type === "year").value,
    month: parts.find((p) => p.type === "month").value,
  };
}

function getPeriodInfo(periodType, refDate = new Date()) {
  if (periodType === "mingguan") {
    const { start, end } = getWeekRangeSatToFri(refDate);
    return {
      inRange: (d) => { const t = new Date(d).getTime(); return t >= start.getTime() && t <= end.getTime(); },
      label: `${start.toLocaleDateString("id-ID")} – ${end.toLocaleDateString("id-ID")} (Sabtu–Jumat)`,
    };
  }
  if (periodType === "bulanan_masehi") {
    const y = refDate.getFullYear(), m = refDate.getMonth();
    return {
      inRange: (d) => { const dd = new Date(d); return dd.getFullYear() === y && dd.getMonth() === m; },
      label: refDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
    };
  }
  // bulanan_hijriah
  const ref = getHijriParts(refDate);
  return {
    inRange: (d) => { const p = getHijriParts(d); return p.year === ref.year && p.month === ref.month; },
    label: new Intl.DateTimeFormat("id-u-ca-islamic", { year: "numeric", month: "long" }).format(refDate) + " H",
  };
}

function ProductAnalysis({ data }) {
  const [periodType, setPeriodType] = useState("mingguan");
  const [customRange, setCustomRange] = useState({ preset: "custom", customStart: "", customEnd: "" });

  let inRange, label;
  if (periodType === "custom") {
    inRange = (d) => inDateRange(d, customRange);
    label = customRange.customStart || customRange.customEnd
      ? `${customRange.customStart || "..."} s/d ${customRange.customEnd || "..."}`
      : "Pilih rentang tanggal di bawah";
  } else {
    ({ inRange, label } = getPeriodInfo(periodType));
  }

  const stats = {};
  data.transactions.forEach((t) => {
    if (!inRange(t.tanggal)) return;
    t.items.forEach((it) => {
      if (!stats[it.id]) stats[it.id] = { id: it.id, nama: it.nama, qty: 0, trxSet: new Set() };
      stats[it.id].qty += it.qty;
      stats[it.id].trxSet.add(t.id);
    });
  });
  const list = Object.values(stats).map((s) => ({ ...s, freq: s.trxSet.size }));

  const top = (arr, key, dir, n = 5) =>
    [...arr].sort((a, b) => (dir === "desc" ? b[key] - a[key] : a[key] - b[key])).slice(0, n);

  const cepat = top(list, "freq", "desc");
  const lambat = top(list, "freq", "asc");
  const banyak = top(list, "qty", "desc");
  const sedikit = top(list, "qty", "asc");

  const MiniTable = ({ title, rows, valueKey, valueLabel }) => (
    <div className="rounded-xl overflow-hidden" style={tableWrapStyle()}>
      <div className="px-3 py-2" style={{ backgroundColor: c.surfaceAlt }}>
        <p className="text-xs font-semibold" style={{ color: c.text }}>{title}</p>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-center py-4" style={{ color: c.textDim }}>Tidak ada data periode ini.</p>
      ) : (
        <table className="w-full text-xs">
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id} style={{ borderTop: idx > 0 ? `1px solid ${c.border}` : "none", backgroundColor: c.surface }}>
                <td className="px-3 py-1.5" style={{ color: c.text }}>{idx + 1}. {r.nama}</td>
                <td className="px-3 py-1.5 text-right font-mono" style={{ color: c.mint }}>{r[valueKey]} {valueLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        {[
          { key: "mingguan", label: "Mingguan (Sab–Jum)" },
          { key: "bulanan_masehi", label: "Bulanan Masehi" },
          { key: "bulanan_hijriah", label: "Bulanan Hijriah" },
          { key: "custom", label: "Custom Tanggal" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setPeriodType(t.key)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium"
            style={{ backgroundColor: periodType === t.key ? c.mint : c.surfaceAlt, color: periodType === t.key ? "#0B1210" : c.textDim }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {periodType === "custom" && (
        <div className="flex items-center gap-1 mb-2">
          <input type="date" value={customRange.customStart} onChange={(e) => setCustomRange((prev) => ({ ...prev, customStart: e.target.value }))} className="text-xs px-2 py-1.5 rounded-lg" style={{ border: `1px solid ${c.border}`, backgroundColor: "transparent", color: c.text }} />
          <span className="text-xs" style={{ color: c.textDim }}>s/d</span>
          <input type="date" value={customRange.customEnd} onChange={(e) => setCustomRange((prev) => ({ ...prev, customEnd: e.target.value }))} className="text-xs px-2 py-1.5 rounded-lg" style={{ border: `1px solid ${c.border}`, backgroundColor: "transparent", color: c.text }} />
        </div>
      )}
      <p className="text-xs mb-3" style={{ color: c.textDim }}>Periode: {label}</p>
      <div className="grid grid-cols-2 gap-3">
        <MiniTable title="Tercepat Terjual (paling sering muncul di transaksi)" rows={cepat} valueKey="freq" valueLabel="transaksi" />
        <MiniTable title="Terlambat Terjual (paling jarang muncul di transaksi)" rows={lambat} valueKey="freq" valueLabel="transaksi" />
        <MiniTable title="Paling Banyak Terbeli (total unit)" rows={banyak} valueKey="qty" valueLabel="unit" />
        <MiniTable title="Paling Sedikit Terbeli (total unit)" rows={sedikit} valueKey="qty" valueLabel="unit" />
      </div>
    </div>
  );
}

function inDateRange(dateStr, range) {
  if (!range || range.preset === "semua") return true;
  const t = new Date(dateStr).getTime();
  if (range.preset === "custom") {
    if (!range.customStart && !range.customEnd) return true;
    const s = range.customStart ? new Date(range.customStart).setHours(0, 0, 0, 0) : -Infinity;
    const e = range.customEnd ? new Date(range.customEnd).setHours(23, 59, 59, 999) : Infinity;
    return t >= s && t <= e;
  }
  if (!range.start) return true;
  return t >= range.start.getTime() && t <= range.end.getTime();
}

function DateRangeFilter({ range, setRange }) {
  const setPreset = (preset) => {
    const now = new Date();
    let start = null, end = null;
    if (preset === "hari") {
      start = new Date(now); start.setHours(0, 0, 0, 0);
      end = new Date(now); end.setHours(23, 59, 59, 999);
    } else if (preset === "minggu") {
      const r = getWeekRangeSatToFri(now);
      start = r.start; end = r.end;
    } else if (preset === "bulan") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (preset === "tahun") {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    }
    setRange({ preset, start, end });
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-3">
      {[
        { k: "semua", l: "Semua" },
        { k: "hari", l: "Hari Ini" },
        { k: "minggu", l: "Minggu Ini" },
        { k: "bulan", l: "Bulan Ini" },
        { k: "tahun", l: "Tahun Ini" },
      ].map((p) => (
        <button
          key={p.k}
          onClick={() => setPreset(p.k)}
          className="text-xs px-2.5 py-1.5 rounded-lg font-medium"
          style={{ backgroundColor: range.preset === p.k ? c.mint : c.surfaceAlt, color: range.preset === p.k ? "#0B1210" : c.textDim }}
        >
          {p.l}
        </button>
      ))}
      <div className="flex items-center gap-1 ml-1">
        <input
          type="date"
          value={range.customStart || ""}
          onChange={(e) => setRange({ ...range, preset: "custom", customStart: e.target.value })}
          className="text-xs px-2 py-1.5 rounded-lg"
          style={{ border: `1px solid ${c.border}`, backgroundColor: "transparent", color: c.text }}
        />
        <span className="text-xs" style={{ color: c.textDim }}>s/d</span>
        <input
          type="date"
          value={range.customEnd || ""}
          onChange={(e) => setRange({ ...range, preset: "custom", customEnd: e.target.value })}
          className="text-xs px-2 py-1.5 rounded-lg"
          style={{ border: `1px solid ${c.border}`, backgroundColor: "transparent", color: c.text }}
        />
      </div>
    </div>
  );
}

function ReportModal({ title, onClose, children }) {
  const containerRef = useRef(null);
  useModalKeys(true, null, onClose);
  useFocusTrap(true, containerRef);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
      <div className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl p-5" style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-base font-semibold" style={{ color: c.text }}>{title}</p>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ backgroundColor: c.surfaceAlt }} aria-label="Tutup laporan"><X size={16} color={c.textDim} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ReportCard({ icon: Icon, title, desc, onClick, cardRef, onKeyDown }) {
  return (
    <button
      ref={cardRef}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className="text-left p-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
      style={cardStyle()}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: c.mintDim }}>
        <Icon size={16} color={c.mint} />
      </div>
      <p className="text-sm font-medium" style={{ color: c.text }}>{title}</p>
      <p className="text-xs mt-0.5" style={{ color: c.textDim }}>{desc}</p>
    </button>
  );
}

function LaporanScreen({ data }) {
  const trx = data.transactions;
  const omzet = trx.reduce((s, t) => s + t.total, 0);
  const labaKotor = trx.reduce((s, t) => s + t.items.reduce((ss, it) => ss + (it.harga - it.hargaBeli) * it.qty, 0), 0);
  const jumlahTrx = trx.length;

  const kategoriMap = Object.fromEntries(data.products.map((p) => [p.id, p.kategori]));

  const flatRows = trx.flatMap((t) =>
    t.items.map((it) => ({
      waktu: t.tanggal,
      invoice: t.id,
      kasir: t.kasir || "-",
      kategori: kategoriMap[it.id] || "Tidak diketahui",
      nama: it.nama,
      qty: it.qty,
      omzet: it.harga * it.qty,
      laba: (it.harga - it.hargaBeli) * it.qty,
    }))
  ).sort((a, b) => new Date(b.waktu) - new Date(a.waktu));

  const totalUnitTerjual = trx.reduce((s, t) => s + t.items.reduce((ss, it) => ss + it.qty, 0), 0);
  const totalUnitMovementKeluar = data.movements.filter((m) => m.tipe === "keluar").reduce((s, m) => s + m.jumlah, 0);
  const balance = totalUnitTerjual === totalUnitMovementKeluar;
  const fmtWaktu = (w) => new Date(w).toLocaleString("id-ID");

  const [openReport, setOpenReport] = useState(null);
  const reportKeys = ["nota", "analisis", "laba", "riwayat"];
  const reportRefs = useRef([]);
  // Panah kiri/kanan/atas/bawah untuk pindah antar kartu laporan (pengganti mouse), Enter membuka kartu yang fokus.
  const handleReportCardKey = (e, idx) => {
    let nextIdx = null;
    if (e.key === "ArrowRight") nextIdx = (idx + 1) % reportKeys.length;
    else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + reportKeys.length) % reportKeys.length;
    else if (e.key === "ArrowDown") nextIdx = (idx + 2) % reportKeys.length;
    else if (e.key === "ArrowUp") nextIdx = (idx - 2 + reportKeys.length) % reportKeys.length;
    if (nextIdx !== null) {
      e.preventDefault();
      reportRefs.current[nextIdx]?.focus();
    }
  };
  const [searchLaba, setSearchLaba] = useState("");
  const [searchRiwayat, setSearchRiwayat] = useState("");
  const [searchTrx, setSearchTrx] = useState("");
  const [rangeNota, setRangeNota] = useState({ preset: "semua" });
  const [rangeLaba, setRangeLaba] = useState({ preset: "semua" });
  const [rangeRiwayat, setRangeRiwayat] = useState({ preset: "semua" });

  const perTrxRows = trx
    .filter((t) => inDateRange(t.tanggal, rangeNota))
    .map((t) => ({
      invoice: t.id,
      waktu: t.tanggal,
      kasir: t.kasir || "-",
      jumlahItem: t.items.reduce((s, i) => s + i.qty, 0),
      jenisBarang: t.items.length,
      total: t.total,
    }))
    .filter((r) => (r.invoice + r.kasir).toLowerCase().includes(searchTrx.toLowerCase()));

  const trxTextForCopy = () => {
    const header = ["Invoice", "Waktu", "Kasir", "Jumlah Item", "Jenis Barang", "Total"].join("\t");
    const rows = perTrxRows.map((r) => [r.invoice, fmtWaktu(r.waktu), r.kasir, r.jumlahItem, r.jenisBarang, r.total].join("\t"));
    return [header, ...rows].join("\n");
  };

  const labaRows = flatRows
    .filter((r) => inDateRange(r.waktu, rangeLaba))
    .filter((r) => (r.kategori + r.nama).toLowerCase().includes(searchLaba.toLowerCase()));
  const riwayatRows = flatRows
    .filter((r) => inDateRange(r.waktu, rangeRiwayat))
    .filter((r) => (r.kategori + r.nama + r.invoice + r.kasir).toLowerCase().includes(searchRiwayat.toLowerCase()));

  const labaTextForCopy = () => {
    const header = ["Waktu", "Kategori", "Barang", "Unit Terjual", "Omzet", "Laba Kotor"].join("\t");
    const rows = labaRows.map((r) => [fmtWaktu(r.waktu), r.kategori, r.nama, r.qty, r.omzet, r.laba].join("\t"));
    return [header, ...rows].join("\n");
  };
  const riwayatTextForCopy = () => {
    const header = ["Waktu", "Kategori", "Barang", "Invoice", "Item", "Total", "Kasir"].join("\t");
    const rows = riwayatRows.map((r) => [fmtWaktu(r.waktu), r.kategori, r.nama, r.invoice, r.qty, r.omzet, r.kasir].join("\t"));
    return [header, ...rows].join("\n");
  };

  return (
    <div className="p-5 space-y-5">
      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-2 rounded-xl p-5" style={cardStyle({ boxShadow: `0 4px 20px -6px ${c.success}33` })}>
          <p className="text-xs mb-1.5" style={{ color: c.textDim }}>Omzet</p>
          <p className="text-3xl font-mono font-bold" style={successTextStyle()}>{rupiah(omzet)}</p>
        </div>
        {[
          { label: "Laba Kotor", value: rupiah(labaKotor), color: c.success },
          { label: "Jumlah Transaksi", value: jumlahTrx, color: c.text },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={cardStyle()}>
            <p className="text-[11px] mb-1" style={{ color: c.textDim }}>{s.label}</p>
            <p className="text-lg font-mono font-semibold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
        <div className="col-span-4 rounded-xl p-4" style={cardStyle()}>
          <p className="text-[11px] mb-1" style={{ color: c.textDim }}>Balance Stok vs Transaksi</p>
          <p className="text-lg font-mono font-semibold" style={{ color: balance ? c.success : c.coral }}>{balance ? "Cocok ✓" : "Selisih!"}</p>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: c.text }}>Pilih Laporan</p>
        <div className="grid grid-cols-2 gap-3">
          <ReportCard icon={FileText} title="Riwayat Transaksi (per Nota)" desc="Satu baris per transaksi — invoice, kasir, jumlah item, total" onClick={() => setOpenReport("nota")} cardRef={(el) => (reportRefs.current[0] = el)} onKeyDown={(e) => handleReportCardKey(e, 0)} />
          <ReportCard icon={TrendingUp} title="Analisis Produk" desc="Barang tercepat/terlambat terjual, terbanyak/tersedikit terbeli" onClick={() => setOpenReport("analisis")} cardRef={(el) => (reportRefs.current[1] = el)} onKeyDown={(e) => handleReportCardKey(e, 1)} />
          <ReportCard icon={BarChart3} title="Laba per Kategori" desc="Rincian omzet & laba kotor per kategori barang" onClick={() => setOpenReport("laba")} cardRef={(el) => (reportRefs.current[2] = el)} onKeyDown={(e) => handleReportCardKey(e, 2)} />
          <ReportCard icon={List} title="Riwayat Transaksi (per Kasir)" desc="Satu baris per barang terjual, lengkap dengan nama kasir" onClick={() => setOpenReport("riwayat")} cardRef={(el) => (reportRefs.current[3] = el)} onKeyDown={(e) => handleReportCardKey(e, 3)} />
        </div>
      </div>

      {openReport === "nota" && (
        <ReportModal title="Riwayat Transaksi (per Nota)" onClose={() => setOpenReport(null)}>
          <DateRangeFilter range={rangeNota} setRange={setRangeNota} />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ backgroundColor: c.surfaceAlt, border: `1px solid ${c.border}` }}>
              <Search size={12} color={c.textDim} />
              <input value={searchTrx} onChange={(e) => setSearchTrx(e.target.value)} placeholder="Cari invoice/kasir..." className="bg-transparent outline-none text-xs" style={{ color: c.text, width: 160 }} />
            </div>
            <CopyButton getText={trxTextForCopy} />
          </div>
          <div className="rounded-xl overflow-hidden" style={tableWrapStyle()}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: c.surfaceAlt, color: c.textDim }}>
                  <th className="text-left px-4 py-2 font-medium">Invoice</th>
                  <th className="text-left px-4 py-2 font-medium">Waktu</th>
                  <th className="text-left px-4 py-2 font-medium">Kasir</th>
                  <th className="text-right px-4 py-2 font-medium">Jumlah Item</th>
                  <th className="text-right px-4 py-2 font-medium">Jenis Barang</th>
                  <th className="text-right px-4 py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {perTrxRows.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-xs" style={{ color: c.textDim }}>Tidak ada data.</td></tr>
                )}
                {perTrxRows.map((r) => (
                  <tr key={r.invoice} style={{ backgroundColor: c.surface, borderTop: `1px solid ${c.border}` }}>
                    <td className="px-4 py-2 font-mono text-xs" style={{ color: c.textDim }}>{r.invoice}</td>
                    <td className="px-4 py-2 text-xs" style={{ color: c.textDim }}>{fmtWaktu(r.waktu)}</td>
                    <td className="px-4 py-2 capitalize" style={{ color: c.text }}>{r.kasir}</td>
                    <td className="px-4 py-2 text-right font-mono" style={{ color: c.text }}>{r.jumlahItem}</td>
                    <td className="px-4 py-2 text-right font-mono" style={{ color: c.text }}>{r.jenisBarang}</td>
                    <td className="px-4 py-2 text-right font-mono" style={successTextStyle()}>{rupiah(r.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportModal>
      )}

      {openReport === "analisis" && (
        <ReportModal title="Analisis Produk" onClose={() => setOpenReport(null)}>
          <ProductAnalysis data={data} />
        </ReportModal>
      )}

      {openReport === "laba" && (
        <ReportModal title="Laba per Kategori" onClose={() => setOpenReport(null)}>
          <DateRangeFilter range={rangeLaba} setRange={setRangeLaba} />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ backgroundColor: c.surfaceAlt, border: `1px solid ${c.border}` }}>
              <Search size={12} color={c.textDim} />
              <input value={searchLaba} onChange={(e) => setSearchLaba(e.target.value)} placeholder="Cari kategori/barang..." className="bg-transparent outline-none text-xs" style={{ color: c.text, width: 160 }} />
            </div>
            <CopyButton getText={labaTextForCopy} />
          </div>
          <div className="rounded-xl overflow-hidden" style={tableWrapStyle()}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: c.surfaceAlt, color: c.textDim }}>
                  <th className="text-left px-4 py-2 font-medium">Waktu</th>
                  <th className="text-left px-4 py-2 font-medium">Kategori</th>
                  <th className="text-left px-4 py-2 font-medium">Barang</th>
                  <th className="text-right px-4 py-2 font-medium">Unit Terjual</th>
                  <th className="text-right px-4 py-2 font-medium">Omzet</th>
                  <th className="text-right px-4 py-2 font-medium">Laba Kotor</th>
                </tr>
              </thead>
              <tbody>
                {labaRows.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-xs" style={{ color: c.textDim }}>Tidak ada data.</td></tr>
                )}
                {labaRows.map((r, idx) => (
                  <tr key={idx} style={{ backgroundColor: c.surface, borderTop: `1px solid ${c.border}` }}>
                    <td className="px-4 py-2 text-xs" style={{ color: c.textDim }}>{fmtWaktu(r.waktu)}</td>
                    <td className="px-4 py-2" style={{ color: c.text }}>{r.kategori}</td>
                    <td className="px-4 py-2" style={{ color: c.text }}>{r.nama}</td>
                    <td className="px-4 py-2 text-right font-mono" style={{ color: c.text }}>{r.qty}</td>
                    <td className="px-4 py-2 text-right font-mono" style={{ color: c.text }}>{rupiah(r.omzet)}</td>
                    <td className="px-4 py-2 text-right font-mono" style={successTextStyle()}>{rupiah(r.laba)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportModal>
      )}

      {openReport === "riwayat" && (
        <ReportModal title="Riwayat Transaksi (per Kasir)" onClose={() => setOpenReport(null)}>
          <DateRangeFilter range={rangeRiwayat} setRange={setRangeRiwayat} />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ backgroundColor: c.surfaceAlt, border: `1px solid ${c.border}` }}>
              <Search size={12} color={c.textDim} />
              <input value={searchRiwayat} onChange={(e) => setSearchRiwayat(e.target.value)} placeholder="Cari kasir/invoice/barang..." className="bg-transparent outline-none text-xs" style={{ color: c.text, width: 160 }} />
            </div>
            <CopyButton getText={riwayatTextForCopy} />
          </div>
          <div className="rounded-xl overflow-hidden" style={tableWrapStyle()}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: c.surfaceAlt, color: c.textDim }}>
                  <th className="text-left px-4 py-2 font-medium">Waktu</th>
                  <th className="text-left px-4 py-2 font-medium">Kategori</th>
                  <th className="text-left px-4 py-2 font-medium">Barang</th>
                  <th className="text-left px-4 py-2 font-medium">Invoice</th>
                  <th className="text-right px-4 py-2 font-medium">Item</th>
                  <th className="text-right px-4 py-2 font-medium">Total</th>
                  <th className="text-left px-4 py-2 font-medium">Kasir</th>
                </tr>
              </thead>
              <tbody>
                {riwayatRows.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-6 text-center text-xs" style={{ color: c.textDim }}>Tidak ada data.</td></tr>
                )}
                {riwayatRows.map((r, idx) => (
                  <tr key={idx} style={{ backgroundColor: c.surface, borderTop: `1px solid ${c.border}` }}>
                    <td className="px-4 py-2 text-xs" style={{ color: c.textDim }}>{fmtWaktu(r.waktu)}</td>
                    <td className="px-4 py-2" style={{ color: c.text }}>{r.kategori}</td>
                    <td className="px-4 py-2" style={{ color: c.text }}>{r.nama}</td>
                    <td className="px-4 py-2 font-mono text-xs" style={{ color: c.textDim }}>{r.invoice}</td>
                    <td className="px-4 py-2 text-right font-mono" style={{ color: c.text }}>{r.qty}</td>
                    <td className="px-4 py-2 text-right font-mono" style={successTextStyle()}>{rupiah(r.omzet)}</td>
                    <td className="px-4 py-2 capitalize" style={{ color: c.text }}>{r.kasir}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportModal>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("kasir");
  const [currentUser, setCurrentUser] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const { settings, update } = useSettings();
  const { accounts, update: updateAccounts } = useAccounts();
  const { data, persist, status } = useStorage();

  applyTheme(settings.theme, settings.glassColorTheme);

  if (status === "loading" || !data) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center" style={{ backgroundColor: c.bg }}>
        <div className="flex items-center gap-2" style={{ color: c.textDim }}>
          <Loader2 size={16} className="animate-spin" /> Memuat data...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginGate onLogin={setCurrentUser} accounts={accounts} />;
  }

  const isGlass = settings.theme === "glass";
  const glassTheme = GLASS_THEMES[settings.glassColorTheme] || GLASS_THEMES.aurora;
  const lightMeta = LIGHT_THEME_META[settings.theme] || null;

  return (
    <div
      className={`relative w-full min-h-screen font-sans ${isGlass ? "glass-mode" : ""}`}
      style={{
        backgroundColor: c.bg,
        ...(isGlass ? { background: glassTheme.gradient, "--glass-blur": `${settings.glassBlur}px` } : {}),
        ...(lightMeta ? { background: lightMeta.pageGradient } : {}),
      }}
    >
   {isGlass && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute rounded-full anim-drift-1" style={{ width: 480, height: 480, top: -120, left: -100, background: glassTheme.blobs[0], filter: "blur(80px)" }} />
          <div className="absolute rounded-full anim-drift-2" style={{ width: 420, height: 420, top: "30%", right: -140, background: glassTheme.blobs[1], filter: "blur(90px)" }} />
          <div className="absolute rounded-full anim-drift-3" style={{ width: 380, height: 380, bottom: -140, left: "20%", background: glassTheme.blobs[2], filter: "blur(90px)" }} />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: glassTheme.tabTint?.[tab] || "transparent", transition: "background-color 300ms ease" }}
          />
        </div>
      )}
      {lightMeta && lightMeta.auroraColors && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div
            className="absolute anim-aurora"
            style={{
              width: "180%",
              height: "180%",
              top: "-40%",
              left: "-40%",
              opacity: 0.18,
              filter: "blur(90px)",
              background: `conic-gradient(from 0deg at 50% 50%, ${lightMeta.auroraColors.join(", ")}, ${lightMeta.auroraColors[0]})`,
            }}
          />
        </div>
      )}
      <div
        className="px-5 pt-3 pb-1 flex items-center justify-between"
        style={themeMeta() ? { backgroundColor: "rgba(255,255,255,0.5)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" } : undefined}
      >
        <div>
          <p className="text-lg font-semibold tracking-tight" style={{ color: c.text }}>
            Aspho Cash <span className="text-xs font-mono font-normal" style={{ color: c.textDim }}>v{APP_VERSION}</span>
          </p>
          <p className="text-xs mt-0.5" style={{ color: c.textDim }}>Data tersimpan otomatis di sesi kamu</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-3 py-1.5 rounded-lg capitalize"
            style={{ backgroundColor: c.surfaceAlt, color: c.text, border: `1px solid ${c.border}` }}
          >
            {currentUser.id} · {currentUser.role}
          </span>
          <button
  onClick={() => setShowSettings(true)}
  className="p-2 rounded-lg"
  style={{ backgroundColor: c.surfaceAlt, border: `1px solid ${c.border}` }}
  aria-label="Buka pengaturan"
>
  <SettingsIcon size={14} color={c.textDim} />
</button>
          <button
            onClick={() => setCurrentUser(null)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium"
            style={{ backgroundColor: c.coralDim, color: c.coral }}
          >
            Keluar
          </button>
        </div>
      </div>
      <Nav tab={tab} setTab={setTab} />
      {tab === "kasir" && <KasirScreen data={data} persist={persist} currentUser={currentUser} displayMode={settings.kasirDisplay} printerBridgeUrl={settings.printerBridgeUrl} glassColorTheme={settings.glassColorTheme} />}
      {tab === "katalog" && <KatalogScreen data={data} />}
      {tab === "gudang" && <GudangScreen data={data} persist={persist} role={currentUser.role} />}
      {tab === "opname" && <OpnameScreen data={data} persist={persist} />}
      {tab === "laporan" && <LaporanScreen data={data} />}
      {showSettings && <SettingsModal settings={settings} update={update} onClose={() => setShowSettings(false)} currentUser={currentUser} accounts={accounts} updateAccounts={updateAccounts} />}
      <ScrollToTopButton />
    </div>
  );
}
