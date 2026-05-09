import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShoppingBag, Plus, Minus, Trash2, ChevronRight, Settings,
  CheckCircle2, Search, Star, Clock, Home, Menu as MenuIcon,
  X, QrCode, LogOut, Edit2, Check
} from 'lucide-react';

// --- CONFIGURATION ---
const TELEGRAM_BOT_TOKEN = '8515752068:AAHyVw2C7KhjiQGeLMQAPQrLBeCiq0J61p8';
const TELEGRAM_CHAT_ID = '8445457521';
const ADMIN_PASSWORD = 'panda12';
const MAX_ATTEMPTS = 3;
const LOCK_MS = 30 * 60 * 1000;
const AUTO_LOGOUT_MS = 30 * 60 * 1000;

// --- INITIAL DATA ---
const DEFAULT_MENU = [
  { id: 1, name: 'Classic Panda Burger', price: 28000, category: 'Fast-fud', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80', description: 'Premium mol go\'shti, cheddar pishlog\'i va maxsus "Zen" sousi.', popular: true, time: '12 min', daySpecial: false },
  { id: 2, name: 'Truffle Burger', price: 45000, category: 'Fast-fud', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=400&q=80', description: 'Truffle moyi bilan boyitilgan gurme burger.', popular: true, time: '15 min', daySpecial: false },
  { id: 3, name: 'Iced Americano', price: 15000, category: 'Ichimliklar', image: 'https://images.unsplash.com/photo-1551046710-0229f69d3701?auto=format&fit=crop&w=400&q=80', description: '100% Arabika donachalaridan tayyorlangan salqin kofe.', popular: false, time: '3 min', daySpecial: false },
  { id: 4, name: 'Matcha Latte', price: 22000, category: 'Ichimliklar', image: 'https://images.unsplash.com/photo-1515823662273-ad9524e130d4?auto=format&fit=crop&w=400&q=80', description: 'Organik yapon matchasi va mayin sut ko\'pigi.', popular: false, time: '5 min', daySpecial: false },
  { id: 5, name: 'Mochi Ice Cream', price: 18000, category: 'Shirinliklar', image: 'https://images.unsplash.com/photo-1582760901533-339890f53199?auto=format&fit=crop&w=400&q=80', description: 'Yapon an\'anaviy guruchli shirinligi.', popular: true, time: '2 min', daySpecial: false },
];

const CATEGORIES = ['Barchasi', 'Fast-fud', 'Ichimliklar', 'Shirinliklar'];
const MENU_CATS = ['Fast-fud', 'Ichimliklar', 'Shirinliklar'];
const EMPTY_FORM = { name: '', price: '', category: 'Fast-fud', image: '', description: '', time: '10-15 min' };

export default function App() {
  const [menu, setMenu] = useState(() => {
    const saved = localStorage.getItem('qr_menu_panda_v7');
    return saved ? JSON.parse(saved) : DEFAULT_MENU;
  });

  const [view, setView] = useState('home');
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [table, setTable] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); // No sessionStorage — security fix
  const [isSending, setIsSending] = useState(false);
  const [qrTable, setQrTable] = useState('1');

  // --- Security state ---
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(null);
  const lastActivityRef = useRef(Date.now());

  // --- Admin panel state ---
  const [adminTab, setAdminTab] = useState('menu');
  const [orders, setOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', price: '', category: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState(EMPTY_FORM);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTable(params.get('table') || 'Noma\'lum');
  }, []);

  useEffect(() => {
    localStorage.setItem('qr_menu_panda_v7', JSON.stringify(menu));
  }, [menu]);

  // Track activity for auto-logout
  useEffect(() => {
    const update = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener('click', update);
    window.addEventListener('touchstart', update);
    window.addEventListener('keydown', update);
    return () => {
      window.removeEventListener('click', update);
      window.removeEventListener('touchstart', update);
      window.removeEventListener('keydown', update);
    };
  }, []);

  // Auto logout after 30 min inactivity
  useEffect(() => {
    if (!isAdmin) return;
    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > AUTO_LOGOUT_MS) {
        setIsAdmin(false);
        setView('home');
        alert('Siz 30 daqiqa faoliyatsizlik sababli admindan chiqarildingiz.');
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleAdminLogin = () => {
    if (lockUntil && Date.now() < lockUntil) {
      const mins = Math.ceil((lockUntil - Date.now()) / 60000);
      alert(`Kirish bloklangan! ${mins} daqiqadan keyin urinib ko'ring. 🔒`);
      return false;
    }
    const pass = prompt('Admin parolini kiriting:');
    if (pass === null) return false;
    if (pass === ADMIN_PASSWORD) {
      setLoginAttempts(0);
      setLockUntil(null);
      setIsAdmin(true);
      return true;
    }
    const next = loginAttempts + 1;
    if (next >= MAX_ATTEMPTS) {
      setLockUntil(Date.now() + LOCK_MS);
      setLoginAttempts(0);
      alert("3 marta noto'g'ri parol! Kirish 30 daqiqaga bloklandi. 🔒");
    } else {
      setLoginAttempts(next);
      alert(`Noto'g'ri parol! ${MAX_ATTEMPTS - next} ta urinish qoldi.`);
    }
    return false;
  };

  const openAdmin = () => {
    if (!isAdmin) {
      if (handleAdminLogin()) setView('admin');
    } else {
      setView(view === 'admin' ? 'home' : 'admin');
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev =>
      prev.map(item => item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item)
        .filter(item => item.qty > 0)
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const filteredMenu = useMemo(() => {
    let result = menu;
    if (category !== 'Barchasi') result = result.filter(item => item.category === category);
    if (searchQuery) result = result.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return result;
  }, [menu, category, searchQuery]);

  const sendOrder = async (e) => {
    e.preventDefault();
    if (isSending) return;
    const formData = new FormData(e.target);
    const customer = formData.get('name');
    const comment = formData.get('comment');
    setIsSending(true);
    const orderText = `
🐼 *PANDA BURGER PREMIUM*
━━━━━━━━━━━━━━
📍 *Stol:* ${table}
👤 *Mijoz:* ${customer}
📝 *Izoh:* ${comment || '—'}

🍱 *Buyurtma:*
${cart.map(item => `• ${item.name} x ${item.qty} — ${(item.price * item.qty).toLocaleString()} so'm`).join('\n')}

━━━━━━━━━━━━━━
💰 *JAMI:* ${cartTotal.toLocaleString()} so'm
    `;
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: orderText, parse_mode: 'Markdown' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.description || 'API Error');

      // Save to order history
      setOrders(prev => [{
        id: Date.now(),
        customer,
        table,
        items: [...cart],
        total: cartTotal,
        comment: comment || '',
        time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      }, ...prev]);

      setCart([]);
      setView('success');
    } catch (err) {
      alert(`Xatolik: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Admin: inline edit
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditValues({ name: item.name, price: String(item.price), category: item.category });
  };
  const saveEdit = (id) => {
    setMenu(prev => prev.map(item =>
      item.id === id
        ? { ...item, name: editValues.name, price: parseInt(editValues.price) || item.price, category: editValues.category }
        : item
    ));
    setEditingId(null);
  };

  // Admin: kun taomi toggle
  const toggleDaySpecial = (id) => {
    setMenu(prev => prev.map(item => item.id === id ? { ...item, daySpecial: !item.daySpecial } : item));
  };

  // Admin: add new menu item
  const addMenuItem = () => {
    if (!newItem.name.trim() || !newItem.price) {
      alert('Ism va narx kiritish shart!');
      return;
    }
    setMenu(prev => [...prev, {
      id: Date.now(),
      name: newItem.name.trim(),
      price: parseInt(newItem.price),
      category: newItem.category,
      image: newItem.image.trim() || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
      description: newItem.description.trim() || newItem.name.trim(),
      time: newItem.time || '10-15 min',
      popular: false,
      daySpecial: false,
    }]);
    setNewItem(EMPTY_FORM);
    setShowAddForm(false);
  };

  const qrValue = `${window.location.origin + window.location.pathname}?table=${qrTable}`;

  // --- COMPONENTS ---
  const FoodCard = ({ product }) => (
    <motion.div
      layout
      whileTap={{ scale: 0.98 }}
      onClick={() => setSelectedItem(product)}
      className="matte-card p-3 flex flex-col items-center group cursor-pointer relative"
    >
      {product.daySpecial && (
        <div className="absolute top-4 left-4 z-10 bg-amber-400 text-black text-[8px] font-black px-2 py-0.5 rounded-full">
          ⭐ KUN
        </div>
      )}
      <div className="w-full aspect-[4/5] rounded-[30px] overflow-hidden mb-3 relative bg-slate-100">
        <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <button
          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
          className="absolute bottom-3 right-3 bg-black text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all"
        >
          <Plus size={18} />
        </button>
      </div>
      <h3 className="font-bold text-[11px] text-center line-clamp-1 px-1 mb-0.5">{product.name}</h3>
      <p className="text-[10px] font-black text-amber-600">{product.price.toLocaleString()}</p>
    </motion.div>
  );

  if (view === 'success') {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
          <CheckCircle2 size={48} strokeWidth={1} />
        </div>
        <h1 className="text-2xl font-black mb-2 uppercase tracking-widest">Qabul qilindi</h1>
        <p className="text-slate-400 text-sm mb-12">Sizning buyurtmangiz navbatga qo'shildi.</p>
        <button onClick={() => setView('home')} className="w-full bg-black text-white py-5 rounded-full font-bold tracking-widest text-xs uppercase">Yopish</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white font-sans selection:bg-black selection:text-white pb-32">

      {/* Header */}
      <header className="px-8 py-8 flex items-center justify-between sticky top-0 z-30 glass">
        <div onClick={() => setView('home')} className="cursor-pointer">
          <h1 className="text-sm font-black tracking-[0.2em] uppercase">Panda Burger</h1>
          <p className="text-[9px] font-bold text-slate-300 tracking-widest uppercase">Table No. {table}</p>
        </div>
        <button onClick={openAdmin} className="w-10 h-10 flex items-center justify-end text-slate-300">
          <Settings size={18} />
        </button>
      </header>

      <main className="px-6">
        {view === 'home' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16 py-10">
            <div className="space-y-6">
              <h2 className="text-5xl font-black tracking-tighter leading-[0.9]">Taste the <br />Minimalism.</h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-[240px]">High-quality ingredients. Simple recipes. Better life.</p>
              <button onClick={() => setView('menu')} className="bg-black text-white px-8 py-5 rounded-full font-bold text-xs tracking-widest uppercase flex items-center gap-4">
                Explore Menu <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Handpicked for you</h3>
              <div className="grid grid-cols-2 gap-4">
                {menu.filter(i => i.popular).slice(0, 2).map(item => (
                  <div key={item.id} onClick={() => setSelectedItem(item)} className="space-y-3 cursor-pointer group relative">
                    {item.daySpecial && (
                      <div className="absolute top-2 left-2 z-10 bg-amber-400 text-black text-[8px] font-black px-2 py-0.5 rounded-full">⭐ KUN</div>
                    )}
                    <div className="aspect-square rounded-[40px] overflow-hidden bg-slate-100">
                      <img src={item.image} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold">{item.name}</p>
                      <p className="text-[10px] text-amber-600 font-black">{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        ) : view === 'admin' && isAdmin ? (
          <div className="space-y-8 py-6">
            {/* Admin header */}
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-black uppercase tracking-widest">Admin</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setIsAdmin(false); setView('home'); }}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-400 border border-red-100 px-4 py-2 rounded-full"
                >
                  <LogOut size={12} /> Chiqish
                </button>
                <button onClick={() => setView('home')} className="text-slate-300"><X size={18} /></button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-50 p-1 rounded-2xl">
              {[['menu', '🍔 Menyu'], ['orders', '📋 Buyurtmalar'], ['qr', '📱 QR Kod']].map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setAdminTab(tab)}
                  className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${adminTab === tab ? 'bg-white text-black shadow-sm' : 'text-slate-300'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── Menyu tab ── */}
            {adminTab === 'menu' && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="w-full py-4 border border-dashed border-slate-200 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Yangi taom qo'shish
                </button>

                {showAddForm && (
                  <div className="bg-slate-50 p-5 rounded-2xl space-y-3">
                    <p className="font-black text-xs uppercase tracking-widest text-slate-400">Yangi taom</p>
                    {[
                      [newItem.name, (v) => setNewItem(p => ({ ...p, name: v })), 'Taom nomi *', 'text'],
                      [newItem.price, (v) => setNewItem(p => ({ ...p, price: v })), "Narx (so'm) *", 'number'],
                      [newItem.image, (v) => setNewItem(p => ({ ...p, image: v })), 'Rasm URL (ixtiyoriy)', 'text'],
                      [newItem.description, (v) => setNewItem(p => ({ ...p, description: v })), 'Tavsif', 'text'],
                      [newItem.time, (v) => setNewItem(p => ({ ...p, time: v })), 'Vaqt (10-15 min)', 'text'],
                    ].map(([val, onChange, placeholder, type]) => (
                      <input
                        key={placeholder}
                        value={val}
                        onChange={e => onChange(e.target.value)}
                        type={type}
                        placeholder={placeholder}
                        className="w-full p-3 bg-white rounded-xl text-sm outline-none border border-slate-100"
                      />
                    ))}
                    <select
                      value={newItem.category}
                      onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))}
                      className="w-full p-3 bg-white rounded-xl text-sm outline-none border border-slate-100"
                    >
                      {MENU_CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <div className="flex gap-2 pt-1">
                      <button onClick={addMenuItem} className="flex-1 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest">
                        Qo'shish
                      </button>
                      <button onClick={() => { setShowAddForm(false); setNewItem(EMPTY_FORM); }} className="px-5 py-3 bg-white border border-slate-100 text-slate-400 rounded-xl font-black text-xs">
                        Bekor
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  {menu.map(item => (
                    <div key={item.id} className="bg-slate-50 rounded-2xl">
                      {editingId === item.id ? (
                        <div className="p-4 space-y-2">
                          <input
                            value={editValues.name}
                            onChange={e => setEditValues(p => ({ ...p, name: e.target.value }))}
                            className="w-full p-2.5 text-xs bg-white rounded-xl outline-none border border-slate-100"
                          />
                          <div className="flex gap-2">
                            <input
                              value={editValues.price}
                              onChange={e => setEditValues(p => ({ ...p, price: e.target.value }))}
                              type="number"
                              placeholder="Narx"
                              className="flex-1 p-2.5 text-xs bg-white rounded-xl outline-none border border-slate-100"
                            />
                            <select
                              value={editValues.category}
                              onChange={e => setEditValues(p => ({ ...p, category: e.target.value }))}
                              className="flex-1 p-2.5 text-xs bg-white rounded-xl outline-none border border-slate-100"
                            >
                              {MENU_CATS.map(c => <option key={c}>{c}</option>)}
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => saveEdit(item.id)} className="flex-1 py-2 bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                              <Check size={12} /> Saqlash
                            </button>
                            <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-white text-slate-400 rounded-xl text-xs font-bold border border-slate-100">
                              Bekor
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3">
                          <img src={item.image} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold truncate">{item.name}</span>
                              {item.daySpecial && (
                                <span className="text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap">⭐ KUN</span>
                              )}
                            </div>
                            <span className="text-[10px] text-amber-600 font-bold">{item.price.toLocaleString()} so'm · {item.category}</span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => toggleDaySpecial(item.id)}
                              title="Kun taomi"
                              className={`p-2 rounded-xl text-sm transition-all ${item.daySpecial ? 'bg-amber-100 text-amber-600' : 'bg-white text-slate-200'}`}
                            >⭐</button>
                            <button onClick={() => startEdit(item)} className="p-2 bg-white rounded-xl text-slate-300 hover:text-black transition-all">
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => setMenu(menu.filter(m => m.id !== item.id))} className="p-2 bg-white rounded-xl text-slate-200 hover:text-red-400 transition-all">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Buyurtmalar tab ── */}
            {adminTab === 'orders' && (
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="text-4xl mb-4 opacity-20">📋</div>
                    <p className="text-slate-300 text-xs font-black uppercase tracking-widest">Hali buyurtma yo'q</p>
                  </div>
                ) : orders.map(order => (
                  <div key={order.id} className="bg-slate-50 p-4 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-black text-sm">{order.customer}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest">Stol {order.table} · {order.time}</p>
                      </div>
                      <span className="text-amber-600 font-black text-sm">{order.total.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-slate-100 pt-2 space-y-1">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between">
                          <p className="text-[11px] text-slate-500">{item.name} × {item.qty}</p>
                          <p className="text-[11px] text-slate-400">{(item.price * item.qty).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    {order.comment && (
                      <p className="text-[10px] text-slate-400 italic border-t border-slate-100 pt-2">"{order.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── QR tab ── */}
            {adminTab === 'qr' && (
              <div className="bg-slate-50 p-8 rounded-[40px] flex flex-col items-center gap-6">
                <QRCodeSVG value={qrValue} size={160} level="H" />
                <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-widest">Scan for Table {qrTable}</p>
                <input
                  type="number"
                  value={qrTable}
                  onChange={(e) => setQrTable(e.target.value)}
                  className="w-20 text-center bg-white p-2 rounded-xl font-bold border border-slate-100 outline-none"
                />
                <p className="text-[10px] text-slate-300 text-center">Bu QR kodni chop etib stolga qo'ying</p>
              </div>
            )}
          </div>

        ) : view === 'cart' ? (
          <div className="space-y-10 py-6">
            <h2 className="text-2xl font-black tracking-tight">Your Cart</h2>
            {cart.length === 0 ? (
              <p className="text-slate-300 text-sm italic">Empty like a zen garden...</p>
            ) : (
              <div className="space-y-6">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[28px] overflow-hidden bg-slate-50 flex-shrink-0">
                      <img src={item.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{item.name}</h4>
                      <p className="text-xs text-slate-400">Qty: {item.qty}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center"><Minus size={14} /></button>
                      <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center"><Plus size={14} /></button>
                    </div>
                  </div>
                ))}
                <form onSubmit={sendOrder} className="pt-10 space-y-6">
                  <div className="space-y-4">
                    <input required name="name" placeholder="Name" className="w-full border-b border-slate-100 py-4 outline-none text-sm font-medium" />
                    <input name="comment" placeholder="Note (optional)" className="w-full border-b border-slate-100 py-4 outline-none text-sm font-medium" />
                  </div>
                  <div className="flex justify-between items-center py-6">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">Total</span>
                    <span className="text-3xl font-black">{cartTotal.toLocaleString()}</span>
                  </div>
                  <button type="submit" disabled={isSending} className="w-full bg-black text-white py-6 rounded-full font-black text-xs uppercase tracking-widest disabled:opacity-50 transition-all">
                    {isSending ? 'Sending...' : 'Place Order'}
                  </button>
                </form>
              </div>
            )}
          </div>

        ) : (
          <div className="space-y-10 py-6">
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap px-6 py-3 rounded-full transition-all ${category === cat ? 'bg-black text-white shadow-xl' : 'text-slate-300 border border-slate-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-x-3 gap-y-8">
              {filteredMenu.map(product => <FoodCard key={product.id} product={product} />)}
            </div>
          </div>
        )}
      </main>

      {/* Item detail modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-white w-full max-w-md rounded-[50px] overflow-hidden relative z-10 p-10">
              {selectedItem.daySpecial && (
                <div className="absolute top-6 left-6 z-20 bg-amber-400 text-black text-[9px] font-black px-2.5 py-1 rounded-full">⭐ KUN TAOMI</div>
              )}
              <img src={selectedItem.image} className="w-full h-56 object-cover rounded-[40px] mb-8" />
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-black tracking-tighter uppercase">{selectedItem.name}</h2>
                <div className="flex items-center gap-2 text-amber-600 font-black text-xs">
                  <Clock size={14} /> {selectedItem.time}
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-10">{selectedItem.description}</p>
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Price</p>
                  <p className="text-3xl font-black">{selectedItem.price.toLocaleString()}</p>
                </div>
                <button onClick={() => { addToCart(selectedItem); setSelectedItem(null); }} className="bg-black text-white px-10 py-6 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl">
                  Add to Bag
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom navigation */}
      <nav className="fixed bottom-10 left-8 right-8 max-w-md mx-auto z-40">
        <div className="glass-dark rounded-full p-2 flex items-center justify-between shadow-2xl">
          <button onClick={() => setView('home')} className={`flex-1 py-4 flex justify-center ${view === 'home' ? 'text-white' : 'text-slate-600'}`}><Home size={20} /></button>
          <button onClick={() => setView('menu')} className={`flex-1 py-4 flex justify-center ${view === 'menu' ? 'text-white' : 'text-slate-600'}`}><MenuIcon size={20} /></button>
          <button onClick={() => setView('cart')} className={`w-14 h-14 rounded-full flex items-center justify-center relative ${view === 'cart' ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-black">{cartCount}</span>}
          </button>
          <button className="flex-1 py-4 flex justify-center text-slate-600 opacity-30"><Star size={20} /></button>
          <button onClick={openAdmin} className={`flex-1 py-4 flex justify-center ${view === 'admin' ? 'text-white' : 'text-slate-600'}`}><Settings size={20} /></button>
        </div>
      </nav>
    </div>
  );
}
