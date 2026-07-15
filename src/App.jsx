import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart, ArrowRightLeft, ClipboardCheck, Plus, Minus, Trash2,
  X, Check, AlertTriangle, Package, Banknote, CreditCard, QrCode, Search,
  BarChart3, Grid3x3, List, Barcode as BarcodeIcon, Printer, Loader2
} from "lucide-react";

const c = {
  bg: "#12171A",
  surface: "#1B2226",
  surfaceAlt: "#222B30",
  border: "#2C363B",
  text: "#EDEFEF",
  textDim: "#8FA0A6",
  mint: "#3ECF8E",
  mintDim: "rgba(62,207,142,0.14)",
  amber: "#F2B84B",
  amberDim: "rgba(242,184,75,0.14)",
  coral: "#EF6B6B",
  coralDim: "rgba(239,107,107,0.14)",
};

const STORAGE_KEY = "pos-data-v1";
const STORE_PHONE = "0812-3456-7890";

const ADMIN_ACCOUNTS = [
  { id: "wafa", password: "123456" },
  { id: "kresno", password: "123456" },
];
const KASIR_ACCOUNTS = [
  { id: "wafa", password: "654321" },
  { id: "mario", password: "654321" },
  { id: "rezi", password: "654321" },
  { id: "kresno", password: "654321" },
  { id: "ridho", password: "654321" },
];

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
function nextSku(products) {
  const nums = products.map((p) => parseInt(p.sku.split("-")[1] || "0", 10));
  const n = (nums.length ? Math.max(...nums) : 0) + 1;
  return "TK-" + String(n).padStart(4, "0");
}
function genBarcodeDigits(id) {
  const base = "899100" + String(id).padStart(6, "0");
  let sum = 0;
  for (let i = 0; i < base.length; i++) {
    sum += parseInt(base[i], 10) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return base + check;
}

// --- Minimal Code128-ish visual barcode (bars purely illustrative, not scannable-grade) ---
function BarcodeSVG({ value, width = 160, height = 46 }) {
  const bars = [];
  let seed = 0;
  for (let i = 0; i < value.length; i++) seed += value.charCodeAt(i) * (i + 1);
  let x = 4;
  const usable = width - 8;
  const n = value.length * 3;
  const unit = usable / n;
  for (let i = 0; i < n; i++) {
    const v = (seed * (i + 7) * 13) % 5;
    const w = unit * (0.5 + (v % 3) * 0.4);
    if (i % 2 === 0) {
      bars.push(<rect key={i} x={x} y={4} width={Math.max(1, w)} height={height - 16} fill={c.text} />);
    }
    x += w;
  }
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <rect x="0" y="0" width={width} height={height} fill="#fff" rx="4" />
      {bars}
      <text x={width / 2} y={height - 4} fontSize="9" fontFamily="monospace" fill="#111" textAnchor="middle">{value}</text>
    </svg>
  );
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

function LoginGate({ onLogin }) {
  const [mode, setMode] = useState(null); // 'admin' | 'kasir'
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    const list = mode === "admin" ? ADMIN_ACCOUNTS : KASIR_ACCOUNTS;
    const found = list.find((a) => a.id.toLowerCase() === id.trim().toLowerCase() && a.password === password);
    if (!found) {
      setError("ID atau password salah.");
      return;
    }
    onLogin({ id: found.id, role: mode });
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center font-sans" style={{ backgroundColor: c.bg }}>
      <div className="w-80 rounded-2xl p-6" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
        <p className="text-lg font-semibold tracking-tight text-center mb-1" style={{ color: c.text }}>Etalase — Aplikasi Kasir</p>
        <p className="text-xs text-center mb-5" style={{ color: c.textDim }}>Masuk untuk melanjutkan</p>

        {!mode ? (
          <div className="space-y-2">
            <button onClick={() => setMode("admin")} className="w-full py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: c.mint, color: "#0B1210" }}>
              Masuk sebagai Admin
            </button>
            <button onClick={() => setMode("kasir")} className="w-full py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: c.surfaceAlt, color: c.text, border: `1px solid ${c.border}` }}>
              Masuk sebagai Kasir
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs mb-2 capitalize" style={{ color: c.textDim }}>Login {mode}</p>
            <input
              value={id}
              onChange={(e) => { setId(e.target.value); setError(""); }}
              placeholder="ID"
              className="w-full text-sm bg-transparent outline-none px-3 py-2 rounded-lg"
              style={{ border: `1px solid ${c.border}`, color: c.text }}
            />
            <input
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              type="password"
              placeholder="Password"
              className="w-full text-sm bg-transparent outline-none px-3 py-2 rounded-lg"
              style={{ border: `1px solid ${c.border}`, color: c.text }}
            />
            {error && <p className="text-xs" style={{ color: c.coral }}>{error}</p>}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setMode(null); setId(""); setPassword(""); setError(""); }}
                className="flex-1 py-2 rounded-lg text-xs"
                style={{ backgroundColor: c.surfaceAlt, color: c.text }}
              >
                Kembali
              </button>
              <button onClick={submit} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: c.mint, color: "#0B1210" }}>
                Masuk
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Nav({ tab, setTab }) {
  const items = [
    { key: "kasir", label: "Kasir", icon: ShoppingCart },
    { key: "katalog", label: "Katalog", icon: Grid3x3 },
    { key: "gudang", label: "Gudang & Transfer", icon: ArrowRightLeft },
    { key: "opname", label: "Stok Opname", icon: ClipboardCheck },
    { key: "laporan", label: "Laporan", icon: BarChart3 },
  ];
  return (
    <div className="flex flex-wrap gap-2 px-5 pt-5 pb-4 border-b" style={{ borderColor: c.border }}>
      {items.map((it) => {
        const active = tab === it.key;
        const Icon = it.icon;
        return (
          <button
            key={it.key}
            onClick={() => setTab(it.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: active ? c.mintDim : "transparent",
              color: active ? c.mint : c.textDim,
              border: `1px solid ${active ? c.mint : "transparent"}`,
            }}
          >
            <Icon size={16} />
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

function StokBadge({ n }) {
  const color = n <= 0 ? c.coral : n <= 5 ? c.amber : c.textDim;
  return <span className="font-mono text-[11px]" style={{ color }}>Stok: {n}</span>;
}

// ---------------- KASIR ----------------
function KasirScreen({ data, persist, currentUser }) {
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState("");
  const [splitMode, setSplitMode] = useState(false);
  const [payments, setPayments] = useState([]);
  const [kembalianTotal, setKembalianTotal] = useState(0);
  const [cashInput, setCashInput] = useState("");
  const [voidConfirm, setVoidConfirm] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const inputRef = useRef(null);

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
  };

  const handleScanEnter = (e) => {
    if (e.key !== "Enter") return;
    const code = query.trim();
    const match = products.find((p) => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase());
    if (match) {
      addToCart(match);
      setQuery("");
    }
  };

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)).filter((i) => i.qty > 0)
    );
  };

  const total = cart.reduce((s, i) => s + i.hargaJual * i.qty, 0);
  const paid = payments.reduce((s, p) => s + p.jumlah, 0);
  const sisa = total - paid;

  const addPayment = (metode, jumlah) => {
    if (jumlah <= 0) return;
    setPayments((prev) => [...prev, { metode, jumlah }]);
  };

  const bayarCash = () => {
    const diterima = parseInt(cashInput || "0", 10);
    if (!diterima || diterima <= 0) return;
    const sisaSebelum = Math.max(sisa, 0);
    const applied = Math.min(diterima, sisaSebelum);
    if (applied > 0) addPayment("cash", applied);
    const kembalian = diterima - applied;
    if (kembalian > 0) setKembalianTotal((prev) => prev + kembalian);
    setCashInput("");
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
    setCart([]);
    setPayments([]);
    setSplitMode(false);
    setKembalianTotal(0);
    setCashInput("");
  };

  const batalkanTransaksi = () => {
    setCart([]);
    setPayments([]);
    setKembalianTotal(0);
    setCashInput("");
    setVoidConfirm(false);
  };

  return (
    <div className="flex gap-5 p-5">
      <div className="flex-1">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4"
          style={{ backgroundColor: c.surfaceAlt, border: `1px solid ${c.border}` }}
        >
          <Search size={16} color={c.textDim} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleScanEnter}
            placeholder="Cari nama, scan barcode, atau ketik SKU lalu Enter..."
            className="bg-transparent outline-none text-sm w-full"
            style={{ color: c.text }}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((p) => {
            const habis = p.etalase <= 0;
            return (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={habis}
                className="text-left p-3 rounded-xl transition-transform active:scale-95"
                style={{ backgroundColor: c.surface, border: `1px solid ${c.border}`, opacity: habis ? 0.45 : 1, cursor: habis ? "not-allowed" : "pointer" }}
              >
                <div className="w-full h-14 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: c.surfaceAlt }}>
                  <Package size={20} color={c.textDim} />
                </div>
                <p className="text-sm font-medium leading-tight" style={{ color: c.text }}>{p.nama}</p>
                <p className="text-xs font-mono mt-1" style={{ color: c.mint }}>{rupiah(p.hargaJual)}</p>
                <StokBadge n={p.etalase} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-80 flex flex-col rounded-xl overflow-hidden" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px dashed ${c.border}` }}>
          <span className="text-sm font-semibold" style={{ color: c.text }}>Keranjang</span>
          <span className="text-xs font-mono" style={{ color: c.textDim }}>{cart.length} item</span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2" style={{ maxHeight: 300 }}>
          {cart.length === 0 && <p className="text-xs text-center py-8" style={{ color: c.textDim }}>Belum ada barang.</p>}
          {cart.map((i) => (
            <div key={i.id} className="flex items-center gap-2 py-2" style={{ borderBottom: `1px solid ${c.border}` }}>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: c.text }}>{i.nama}</p>
                <p className="text-[11px] font-mono" style={{ color: c.textDim }}>{rupiah(i.hargaJual)}</p>
              </div>
              <button onClick={() => changeQty(i.id, -1)} className="p-1 rounded" style={{ backgroundColor: c.surfaceAlt }}><Minus size={12} color={c.text} /></button>
              <span className="text-xs font-mono w-4 text-center" style={{ color: c.text }}>{i.qty}</span>
              <button onClick={() => changeQty(i.id, 1)} className="p-1 rounded" style={{ backgroundColor: c.surfaceAlt }}><Plus size={12} color={c.text} /></button>
              <button onClick={() => changeQty(i.id, -i.qty)} className="p-1 rounded ml-1"><Trash2 size={12} color={c.coral} /></button>
            </div>
          ))}
        </div>
        <div className="px-4 py-3" style={{ borderTop: `1px dashed ${c.border}` }}>
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: c.textDim }}>Total</span>
            <span className="font-mono font-semibold" style={{ color: c.text }}>{rupiah(total)}</span>
          </div>
          {!splitMode ? (
            <button
              disabled={cart.length === 0}
              onClick={() => setSplitMode(true)}
              className="w-full mt-2 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: cart.length ? c.mint : c.surfaceAlt, color: cart.length ? "#0B1210" : c.textDim }}
            >
              Bayar
            </button>
          ) : (
            <div className="mt-2 space-y-2">
              <div className="flex gap-1.5 items-stretch">
                <div className="flex-1 flex flex-col gap-1">
                  <input
                    value={cashInput}
                    onChange={(e) => setCashInput(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && bayarCash()}
                    placeholder="Uang diterima (cash)"
                    className="w-full text-xs bg-transparent outline-none px-2 py-1.5 rounded-lg font-mono"
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
                {[{ key: "qris", icon: QrCode }, { key: "debit", icon: CreditCard }].map(({ key, icon: Icon }) => (
                  <button key={key} onClick={() => addPayment(key, Math.max(sisa, 0))} disabled={sisa <= 0} className="flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] capitalize" style={{ backgroundColor: c.surfaceAlt, color: c.text, border: `1px solid ${c.border}` }}>
                    <Icon size={14} />{key}
                  </button>
                ))}
              </div>
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
                <button onClick={selesaikanTransaksi} disabled={sisa > 0} className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1" style={{ backgroundColor: sisa <= 0 ? c.mint : c.surfaceAlt, color: sisa <= 0 ? "#0B1210" : c.textDim }}>
                  <Check size={12} /> Selesai
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {voidConfirm && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-72 rounded-xl p-4" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
            <p className="text-sm font-medium mb-1" style={{ color: c.text }}>Batalkan transaksi ini?</p>
            <p className="text-xs mb-3" style={{ color: c.textDim }}>Item di keranjang akan dihapus dan tidak tersimpan.</p>
            <div className="flex gap-2">
              <button onClick={() => setVoidConfirm(false)} className="flex-1 py-2 rounded-lg text-xs" style={{ backgroundColor: c.surfaceAlt, color: c.text }}>Kembali</button>
              <button onClick={batalkanTransaksi} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: c.coral, color: "#2A0E0E" }}>Ya, batalkan</button>
            </div>
          </div>
        </div>
      )}

      {receipt && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-72 rounded-xl overflow-hidden" style={{ backgroundColor: "#fff" }}>
            <div className="p-4 font-mono text-[11px]" style={{ color: "#111" }}>
              <p className="text-center font-semibold">TOKO KAMU</p>
              <p className="text-center" style={{ color: "#555" }}>{receipt.id}</p>
              <p className="text-center" style={{ color: "#555" }}>Telp: {STORE_PHONE}</p>
              <div className="my-2" style={{ borderTop: "1px dashed #999" }} />
              {receipt.items.map((it) => (
                <div key={it.id} className="flex justify-between">
                  <span>{it.nama} x{it.qty}</span>
                  <span>{rupiah(it.harga * it.qty)}</span>
                </div>
              ))}
              <div className="my-2" style={{ borderTop: "1px dashed #999" }} />
              <div className="flex justify-between font-semibold"><span>Total</span><span>{rupiah(receipt.total)}</span></div>
              {receipt.payments.map((p, idx) => (
                <div key={idx} className="flex justify-between capitalize" style={{ color: "#555" }}><span>{p.metode}</span><span>{rupiah(p.jumlah)}</span></div>
              ))}
              {receipt.kembalian > 0 && (
                <div className="flex justify-between font-semibold" style={{ color: "#111" }}><span>Kembalian</span><span>{rupiah(receipt.kembalian)}</span></div>
              )}
              <div className="my-2" style={{ borderTop: "1px dashed #999" }} />
              <p className="text-center" style={{ color: "#888" }}>Kasir: {receipt.kasir}</p>
            </div>
            <div className="flex gap-2 p-3" style={{ backgroundColor: "#eee" }}>
              <button onClick={() => setReceipt(null)} className="flex-1 py-2 rounded-lg text-xs" style={{ backgroundColor: "#ddd", color: "#111" }}>Tutup</button>
              <button onClick={() => window.print()} className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1" style={{ backgroundColor: c.mint, color: "#0B1210" }}>
                <Printer size={12} /> Cetak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- KATALOG ----------------
function KatalogScreen({ data }) {
  const [mode, setMode] = useState("visual");
  return (
    <div className="p-5">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setMode("visual")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: mode === "visual" ? c.mintDim : c.surfaceAlt, color: mode === "visual" ? c.mint : c.textDim }}>
          <Grid3x3 size={13} /> Bergambar
        </button>
        <button onClick={() => setMode("text")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: mode === "text" ? c.mintDim : c.surfaceAlt, color: mode === "text" ? c.mint : c.textDim }}>
          <List size={13} /> Teks
        </button>
      </div>

      {mode === "visual" ? (
        <div className="grid grid-cols-4 gap-3">
          {data.products.map((p) => (
            <div key={p.id} className="rounded-xl p-3" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
              <div className="w-full h-20 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: c.surfaceAlt }}>
                <Package size={26} color={c.textDim} />
              </div>
              <p className="text-sm font-medium" style={{ color: c.text }}>{p.nama}</p>
              <p className="text-xs" style={{ color: c.textDim }}>{p.kategori}</p>
              <p className="text-sm font-mono mt-1" style={{ color: c.mint }}>{rupiah(p.hargaJual)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
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
              {data.products.map((p) => (
                <tr key={p.id} style={{ backgroundColor: c.surface, borderTop: `1px solid ${c.border}` }}>
                  <td className="px-4 py-2 font-mono text-xs" style={{ color: c.textDim }}>{p.sku}</td>
                  <td className="px-4 py-2" style={{ color: c.text }}>{p.nama}</td>
                  <td className="px-4 py-2" style={{ color: c.textDim }}>{p.kategori}</td>
                  <td className="px-4 py-2 text-right font-mono" style={{ color: c.mint }}>{rupiah(p.hargaJual)}</td>
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
  const [form, setForm] = useState({ nama: "", kategori: "", hargaBeli: "", hargaJual: "", gudang: "", barcode: "" });
  const [showLabel, setShowLabel] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const doTransfer = async (p) => {
    const jumlah = parseInt(inputs[p.id] || "0", 10);
    if (!jumlah || jumlah <= 0 || jumlah > p.gudang) return;
    const newProducts = data.products.map((x) => (x.id === p.id ? { ...x, gudang: x.gudang - jumlah, etalase: x.etalase + jumlah } : x));
    const mv = { id: Date.now() + "-t", productId: p.id, nama: p.nama, tipe: "transfer", jumlah, referensi: "-", waktu: new Date().toISOString() };
    await persist({ ...data, products: newProducts, movements: [mv, ...data.movements] });
    setInputs((prev) => ({ ...prev, [p.id]: "" }));
  };

  const addProduct = async () => {
    if (!form.nama || !form.hargaJual) return;
    const id = Math.max(0, ...data.products.map((p) => p.id)) + 1;
    const sku = nextSku(data.products);
    const barcode = form.barcode.trim() ? form.barcode.trim() : genBarcodeDigits(id);
    const newProduct = {
      id, sku, barcode,
      nama: form.nama,
      kategori: form.kategori || "Umum",
      satuan: "pcs",
      hargaBeli: parseInt(form.hargaBeli || "0", 10),
      hargaJual: parseInt(form.hargaJual || "0", 10),
      etalase: 0,
      gudang: parseInt(form.gudang || "0", 10),
    };
    await persist({ ...data, products: [...data.products, newProduct] });
    setForm({ nama: "", kategori: "", hargaBeli: "", hargaJual: "", gudang: "", barcode: "" });
    setShowLabel(newProduct);
  };

  const simpanEdit = async () => {
    const newProducts = data.products.map((p) => {
      if (p.id !== editing.id) return p;
      return {
        ...p,
        nama: editing.nama,
        kategori: editing.kategori,
        satuan: editing.satuan,
        hargaBeli: isAdmin ? parseInt(editing.hargaBeli || "0", 10) : p.hargaBeli,
        hargaJual: isAdmin ? parseInt(editing.hargaJual || "0", 10) : p.hargaJual,
      };
    });
    await persist({ ...data, products: newProducts });
    setEditing(null);
  };

  const hapusBarang = async (p) => {
    const newProducts = data.products.filter((x) => x.id !== p.id);
    const mv = { id: Date.now() + "-del", productId: p.id, nama: p.nama, tipe: "hapus_barang", jumlah: 0, referensi: "-", waktu: new Date().toISOString() };
    await persist({ ...data, products: newProducts, movements: [mv, ...data.movements] });
    setDeleteConfirm(null);
  };

  return (
    <div className="p-5 flex gap-5">
      <div className="flex-1 space-y-5">
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: c.surfaceAlt, color: c.textDim }}>
                <th className="text-left px-4 py-2 font-medium">Barang</th>
                <th className="text-right px-4 py-2 font-medium">Gudang</th>
                <th className="text-right px-4 py-2 font-medium">Etalase</th>
                <th className="text-right px-4 py-2 font-medium">Transfer</th>
                <th className="px-4 py-2"></th>
                {isAdmin && <th className="px-4 py-2"></th>}
              </tr>
            </thead>
            <tbody>
              {data.products.map((p) => (
                <tr key={p.id} style={{ backgroundColor: c.surface, borderTop: `1px solid ${c.border}` }}>
                  <td className="px-4 py-2" style={{ color: c.text }}>{p.nama}</td>
                  <td className="px-4 py-2 text-right font-mono" style={{ color: c.text }}>{p.gudang}</td>
                  <td className="px-4 py-2 text-right font-mono" style={{ color: c.text }}>{p.etalase}</td>
                  <td className="px-4 py-2 text-right">
                    <input value={inputs[p.id] || ""} onChange={(e) => setInputs((prev) => ({ ...prev, [p.id]: e.target.value.replace(/\D/g, "") }))} placeholder="0" className="w-16 text-right bg-transparent outline-none font-mono text-sm px-1 py-0.5 rounded" style={{ border: `1px solid ${c.border}`, color: c.text }} />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => doTransfer(p)} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ backgroundColor: c.mintDim, color: c.mint }}>Transfer</button>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => setShowLabel(p)} className="text-xs px-2 py-1.5 rounded-lg flex items-center gap-1" style={{ backgroundColor: c.surfaceAlt, color: c.textDim }}>
                      <BarcodeIcon size={12} /> Label
                    </button>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => setEditing({ ...p, hargaBeli: String(p.hargaBeli), hargaJual: String(p.hargaJual) })}
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
        <div className="w-72 rounded-xl p-4" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
          <p className="text-sm font-semibold mb-3" style={{ color: c.text }}>Tambah Barang Baru</p>
          <div className="space-y-2">
            {[
              { key: "nama", ph: "Nama barang" },
              { key: "kategori", ph: "Kategori" },
              { key: "hargaBeli", ph: "Harga beli" },
              { key: "hargaJual", ph: "Harga jual" },
              { key: "gudang", ph: "Stok awal gudang" },
              { key: "barcode", ph: "Barcode pabrik (opsional, scan di sini)" },
            ].map((f) => (
              <input
                key={f.key}
                value={form[f.key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.ph}
                className="w-full text-sm bg-transparent outline-none px-2 py-1.5 rounded-lg"
                style={{ border: `1px solid ${c.border}`, color: c.text }}
              />
            ))}
            <button onClick={addProduct} className="w-full py-2 rounded-lg text-sm font-medium mt-1" style={{ backgroundColor: c.mint, color: "#0B1210" }}>
              Simpan & Buat Barcode
            </button>
            <p className="text-[11px]" style={{ color: c.textDim }}>
              Kalau barang sudah punya barcode dari pabrik, scan/ketik di kolom "Barcode pabrik". Kalau dikosongkan, sistem buat barcode sendiri otomatis.
            </p>
          </div>
        </div>
      ) : (
        <div className="w-72 rounded-xl p-4 flex items-start gap-2" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
          <AlertTriangle size={14} color={c.amber} className="mt-0.5 shrink-0" />
          <p className="text-xs" style={{ color: c.textDim }}>
            Login sebagai <b style={{ color: c.text }}>kasir</b> — hanya bisa transfer stok. Tambah barang baru dan ubah harga hanya bisa dilakukan admin.
          </p>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="rounded-xl p-4 w-80" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
            <p className="text-sm font-semibold mb-3" style={{ color: c.text }}>Edit Barang</p>
            <div className="space-y-2">
              <input value={editing.nama} onChange={(e) => setEditing((prev) => ({ ...prev, nama: e.target.value }))} placeholder="Nama barang" className="w-full text-sm bg-transparent outline-none px-2 py-1.5 rounded-lg" style={{ border: `1px solid ${c.border}`, color: c.text }} />
              <input value={editing.kategori} onChange={(e) => setEditing((prev) => ({ ...prev, kategori: e.target.value }))} placeholder="Kategori" className="w-full text-sm bg-transparent outline-none px-2 py-1.5 rounded-lg" style={{ border: `1px solid ${c.border}`, color: c.text }} />
              <input value={editing.hargaBeli} onChange={(e) => setEditing((prev) => ({ ...prev, hargaBeli: e.target.value.replace(/\D/g, "") }))} placeholder="Harga beli" className="w-full text-sm bg-transparent outline-none px-2 py-1.5 rounded-lg" style={{ border: `1px solid ${c.border}`, color: c.text }} />
              <input value={editing.hargaJual} onChange={(e) => setEditing((prev) => ({ ...prev, hargaJual: e.target.value.replace(/\D/g, "") }))} placeholder="Harga jual" className="w-full text-sm bg-transparent outline-none px-2 py-1.5 rounded-lg" style={{ border: `1px solid ${c.border}`, color: c.text }} />
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setEditing(null)} className="flex-1 py-2 rounded-lg text-xs" style={{ backgroundColor: c.surfaceAlt, color: c.text }}>Batal</button>
              <button onClick={simpanEdit} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: c.mint, color: "#0B1210" }}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="rounded-xl p-4 w-72" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
            <p className="text-sm font-medium mb-1" style={{ color: c.text }}>Hapus "{deleteConfirm.nama}"?</p>
            <p className="text-xs mb-3" style={{ color: c.textDim }}>Barang akan hilang dari katalog, gudang, dan etalase. Riwayat transaksi lama tidak terpengaruh.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-lg text-xs" style={{ backgroundColor: c.surfaceAlt, color: c.text }}>Batal</button>
              <button onClick={() => hapusBarang(deleteConfirm)} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: c.coral, color: "#2A0E0E" }}>Ya, hapus</button>
            </div>
          </div>
        </div>
      )}

      {showLabel && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="rounded-xl p-4" style={{ backgroundColor: "#fff", width: 220 }}>
            <p className="text-xs font-semibold text-center mb-1" style={{ color: "#111" }}>{showLabel.nama}</p>
            <p className="text-xs text-center mb-2" style={{ color: "#333" }}>{rupiah(showLabel.hargaJual)}</p>
            <BarcodeSVG value={showLabel.barcode} width={190} />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setShowLabel(null)} className="flex-1 py-2 rounded-lg text-xs" style={{ backgroundColor: "#eee", color: "#111" }}>Tutup</button>
              <button onClick={() => window.print()} className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1" style={{ backgroundColor: c.mint, color: "#0B1210" }}>
                <Printer size={12} /> Cetak Label
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

  const rows = data.products.map((p) => {
    const nilai = fisik[p.id];
    const ada = nilai !== undefined && nilai !== "";
    const jumlahFisik = ada ? parseInt(nilai, 10) : null;
    const selisih = ada ? jumlahFisik - p.etalase : null;
    return { ...p, jumlahFisik, selisih, ada };
  });

  const simpanOpname = async () => {
    const adaPerubahan = rows.filter((r) => r.ada && r.selisih !== 0);
    const newProducts = data.products.map((p) => {
      const r = rows.find((x) => x.id === p.id);
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
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
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
            {rows.map((p) => (
              <tr key={p.id} style={{ backgroundColor: c.surface, borderTop: `1px solid ${c.border}` }}>
                <td className="px-4 py-2" style={{ color: c.text }}>{p.nama}</td>
                <td className="px-4 py-2 text-right font-mono" style={{ color: c.text }}>{p.etalase}</td>
                <td className="px-4 py-2 text-right">
                  <input value={fisik[p.id] ?? ""} onChange={(e) => setFisik((prev) => ({ ...prev, [p.id]: e.target.value.replace(/\D/g, "") }))} placeholder="—" className="w-16 text-right bg-transparent outline-none font-mono text-sm px-1 py-0.5 rounded" style={{ border: `1px solid ${c.border}`, color: c.text }} />
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
      <button onClick={simpanOpname} className="mt-4 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: c.mint, color: "#0B1210" }}>
        Simpan Hasil Opname
      </button>
      {saved && <p className="mt-2 text-xs" style={{ color: c.mint }}>Tersimpan. Selisih otomatis dicatat ke log audit stok.</p>}
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

function LaporanScreen({ data }) {
  const trx = data.transactions;
  const omzet = trx.reduce((s, t) => s + t.total, 0);
  const labaKotor = trx.reduce((s, t) => s + t.items.reduce((ss, it) => ss + (it.harga - it.hargaBeli) * it.qty, 0), 0);
  const jumlahTrx = trx.length;

  const kategoriMap = Object.fromEntries(data.products.map((p) => [p.id, p.kategori]));

  // flatten: satu baris per item per transaksi
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

  const [searchLaba, setSearchLaba] = useState("");
  const [searchRiwayat, setSearchRiwayat] = useState("");

  const labaRows = flatRows.filter((r) =>
    (r.kategori + r.nama).toLowerCase().includes(searchLaba.toLowerCase())
  );
  const riwayatRows = flatRows.filter((r) =>
    (r.kategori + r.nama + r.invoice + r.kasir).toLowerCase().includes(searchRiwayat.toLowerCase())
  );

  const fmtWaktu = (w) => new Date(w).toLocaleString("id-ID");

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
        {[
          { label: "Omzet", value: rupiah(omzet), color: c.mint },
          { label: "Laba Kotor", value: rupiah(labaKotor), color: c.mint },
          { label: "Jumlah Transaksi", value: jumlahTrx, color: c.text },
          { label: "Balance Stok vs Transaksi", value: balance ? "Cocok ✓" : "Selisih!", color: balance ? c.mint : c.coral },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
            <p className="text-[11px] mb-1" style={{ color: c.textDim }}>{s.label}</p>
            <p className="text-lg font-mono font-semibold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold" style={{ color: c.text }}>Laba per Kategori</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ backgroundColor: c.surfaceAlt, border: `1px solid ${c.border}` }}>
              <Search size={12} color={c.textDim} />
              <input value={searchLaba} onChange={(e) => setSearchLaba(e.target.value)} placeholder="Cari kategori/barang..." className="bg-transparent outline-none text-xs" style={{ color: c.text, width: 160 }} />
            </div>
            <CopyButton getText={labaTextForCopy} />
          </div>
        </div>
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
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
                  <td className="px-4 py-2 text-right font-mono" style={{ color: c.mint }}>{rupiah(r.laba)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold" style={{ color: c.text }}>Riwayat Transaksi (per Kasir)</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ backgroundColor: c.surfaceAlt, border: `1px solid ${c.border}` }}>
              <Search size={12} color={c.textDim} />
              <input value={searchRiwayat} onChange={(e) => setSearchRiwayat(e.target.value)} placeholder="Cari kasir/invoice/barang..." className="bg-transparent outline-none text-xs" style={{ color: c.text, width: 160 }} />
            </div>
            <CopyButton getText={riwayatTextForCopy} />
          </div>
        </div>
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
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
                  <td className="px-4 py-2 text-right font-mono" style={{ color: c.mint }}>{rupiah(r.omzet)}</td>
                  <td className="px-4 py-2 capitalize" style={{ color: c.text }}>{r.kasir}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("kasir");
  const [currentUser, setCurrentUser] = useState(null);
  const { data, persist, status } = useStorage();

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
    return <LoginGate onLogin={setCurrentUser} />;
  }

  return (
    <div className="w-full min-h-screen font-sans" style={{ backgroundColor: c.bg }}>
      <div className="px-5 pt-5 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold tracking-tight" style={{ color: c.text }}>Etalase — Aplikasi Kasir</p>
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
            onClick={() => setCurrentUser(null)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium"
            style={{ backgroundColor: c.coralDim, color: c.coral }}
          >
            Keluar
          </button>
        </div>
      </div>
      <Nav tab={tab} setTab={setTab} />
      {tab === "kasir" && <KasirScreen data={data} persist={persist} currentUser={currentUser} />}
      {tab === "katalog" && <KatalogScreen data={data} />}
      {tab === "gudang" && <GudangScreen data={data} persist={persist} role={currentUser.role} />}
      {tab === "opname" && <OpnameScreen data={data} persist={persist} />}
      {tab === "laporan" && <LaporanScreen data={data} />}
    </div>
  );
}
