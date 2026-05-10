import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ChevronRight, 
  Settings, 
  CheckCircle2,
  Search,
  Star,
  Clock,
  Home,
  Menu as MenuIcon,
  X,
  Zap,
  ShieldCheck
} from 'lucide-react';

// --- CONFIGURATION ---
const TELEGRAM_BOT_TOKEN = '8515752068:AAHyVw2C7KhjiQGeLMQAPQrLBeCiq0J61p8';
const TELEGRAM_CHAT_ID = '8445457521';
const ADMIN_PASSWORD = 'admin';

const DEFAULT_MENU = [
  { id: 1, name: 'Panda Gold Burger', price: 28000, category: 'Fast-fud', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80', description: 'Premium burger with secret gold sauce.', popular: true, time: '12 min' },
  { id: 2, name: 'Truffle Burger', price: 45000, category: 'Fast-fud', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=400&q=80', description: 'Gourmet experience with truffle oil.', popular: true, time: '15 min' },
  { id: 3, name: 'Dark Iced Coffee', price: 15000, category: 'Ichimliklar', image: 'https://images.unsplash.com/photo-1551046710-0229f69d3701?auto=format&fit=crop&w=400&q=80', description: 'Strong Arabica blend.', popular: false, time: '3 min' },
  { id: 4, name: 'Imperial Matcha', price: 22000, category: 'Ichimliklar', image: 'https://images.unsplash.com/photo-1515823662273-ad9524e130d4?auto=format&fit=crop&w=400&q=80', description: 'Ceremonial grade matcha.', popular: false, time: '5 min' },
];

const CATEGORIES = ['Barchasi', 'Fast-fud', 'Ichimliklar'];

export default function App() {
  const [menu, setMenu] = useState(() => {
    const saved = localStorage.getItem('qr_menu_luxury_v2');
    return saved ? JSON.parse(saved) : DEFAULT_MENU;
  });
  
  const [view, setView] = useState('home');
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [table, setTable] = useState('');
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('panda_admin') === 'true');
  const [isSending, setIsSending] = useState(false);
  const [qrTable, setQrTable] = useState('1');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTable(params.get('table') || '1');
  }, []);

  useEffect(() => {
    localStorage.setItem('qr_menu_luxury_v2', JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    sessionStorage.setItem('panda_admin', isAdmin);
  }, [isAdmin]);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
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
    setIsSending(true);
    const formData = new FormData(e.target);
    const customer = formData.get('name');
    const comment = formData.get('comment');

    const orderText = `👑 *PANDA BURGER LUXURY*\n━━━━━━━━━━━━━━\n📍 *Stol:* ${table}\n👤 *Mijoz:* ${customer}\n🍱 *Jami:* ${cartTotal.toLocaleString()} so'm`;

    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: orderText, parse_mode: 'Markdown' })
      });
      setCart([]);
      setView('success');
    } catch (err) {
      alert(`Xato: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  if (view === 'success') {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#050505] flex flex-col items-center justify-center p-10 text-center text-white">
        <CheckCircle2 size={64} className="text-[#c5a059] mb-6" />
        <h1 className="text-2xl font-black uppercase tracking-widest mb-2">Qabul qilindi</h1>
        <p className="text-white/40 text-sm mb-10 uppercase tracking-widest">Buyurtmangiz tayyorlanmoqda</p>
        <button onClick={() => setView('home')} className="w-full gold-bg text-black py-5 rounded-full font-black text-xs uppercase tracking-widest">Asosiyga qaytish</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#050505] text-white font-sans pb-32">
      
      {/* Header */}
      <header className="px-6 py-8 flex items-center justify-between sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div onClick={() => setView('home')} className="cursor-pointer">
          <h1 className="text-sm font-black tracking-widest uppercase gold-text">Panda Burger</h1>
          <p className="text-[9px] font-black text-white/30 tracking-[0.2em] uppercase">Table No. {table}</p>
        </div>
        <button onClick={() => {
          const pass = prompt('Pass:');
          if (pass === ADMIN_PASSWORD) setIsAdmin(true);
          setView(view === 'admin' ? 'home' : 'admin');
        }} className="text-white/10"><Settings size={18} /></button>
      </header>

      <main className="px-6 pt-10">
        {view === 'home' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
            <div className="space-y-6">
              <h2 className="text-6xl font-black tracking-tighter leading-none text-white">The Art <br/> of Taste.</h2>
              <p className="text-white/40 text-sm leading-relaxed max-w-[240px]">Experience luxury in every bite. Handcrafted burgers for the elite.</p>
              <button onClick={() => setView('menu')} className="gold-bg text-black px-10 py-5 rounded-full font-black text-[10px] tracking-widest uppercase flex items-center gap-4">
                Open Menu <ChevronRight size={16} strokeWidth={4} />
              </button>
            </div>

            <div className="space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 text-center">Chef's Specials</h3>
              <div className="grid grid-cols-2 gap-4">
                {menu.filter(i => i.popular).slice(0, 2).map(item => (
                  <div key={item.id} onClick={() => setSelectedItem(item)} className="space-y-4 cursor-pointer">
                    <div className="aspect-[3/4] rounded-[40px] overflow-hidden bg-[#111] border border-white/5">
                      <img src={item.image} className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-700" />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-white/80 uppercase mb-1">{item.name}</p>
                      <p className="text-[10px] font-black gold-text uppercase">{item.price.toLocaleString()} UZS</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : view === 'admin' ? (
          <div className="space-y-10 py-6 text-center">
            <h2 className="text-xl font-black uppercase tracking-widest gold-text">Admin Panel</h2>
            <div className="bg-[#0a0a0a] p-8 rounded-[40px] border border-white/5 flex flex-col items-center gap-6">
              <div className="bg-white p-3 rounded-3xl"><QRCodeSVG value={`${window.location.origin}?table=${qrTable}`} size={160} /></div>
              <input type="number" value={qrTable} onChange={(e) => setQrTable(e.target.value)} className="w-20 bg-white/5 text-gold p-3 rounded-xl text-center border-none outline-none font-black" />
            </div>
            <button onClick={() => setView('home')} className="w-full border border-white/5 py-5 rounded-full text-[10px] font-black tracking-widest uppercase text-white/20">Exit</button>
          </div>
        ) : view === 'cart' ? (
          <div className="space-y-10 py-6">
            <h2 className="text-4xl font-black tracking-tighter uppercase">Your Bag</h2>
            {cart.length === 0 ? (
              <p className="text-white/20 text-center py-20 uppercase tracking-widest text-xs font-black">Empty Bag</p>
            ) : (
              <div className="space-y-8">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-6 p-4 luxury-card">
                    <img src={item.image} className="w-16 h-16 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-black text-[10px] uppercase text-white/80">{item.name}</h4>
                      <p className="text-[10px] font-black gold-text uppercase mt-1">{item.price.toLocaleString()} UZS</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQty(item.id, -1)} className="text-white/20"><Minus size={16}/></button>
                      <span className="text-xs font-black">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="text-[#c5a059]"><Plus size={16}/></button>
                    </div>
                  </div>
                ))}
                <form onSubmit={sendOrder} className="pt-10 space-y-8">
                  <input required name="name" placeholder="YOUR NAME" className="w-full bg-transparent border-b border-white/10 py-4 outline-none text-xs font-black tracking-widest text-white uppercase" />
                  <div className="flex justify-between items-center py-6">
                    <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">Total</span>
                    <span className="text-3xl font-black gold-text">{cartTotal.toLocaleString()}</span>
                  </div>
                  <button type="submit" disabled={isSending} className="w-full gold-bg text-black py-6 rounded-full font-black text-[10px] tracking-widest uppercase shadow-2xl">
                    {isSending ? 'Sending...' : 'Confirm Order'}
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} className={`text-[9px] font-black uppercase tracking-widest px-8 py-3 rounded-full border ${category === cat ? 'gold-bg text-black border-transparent shadow-lg' : 'text-white/20 border-white/5 bg-white/5'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {filteredMenu.map(product => (
                <motion.div key={product.id} layout onClick={() => setSelectedItem(product)} className="luxury-card p-2 flex flex-col items-center cursor-pointer">
                  <div className="w-full aspect-square rounded-[20px] overflow-hidden mb-3 relative bg-[#111]">
                    <img src={product.image} className="w-full h-full object-cover grayscale-[0.2]" />
                    <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="absolute bottom-2 right-2 gold-bg text-black w-7 h-7 rounded-xl flex items-center justify-center active:scale-90 transition-all"><Plus size={14} strokeWidth={4} /></button>
                  </div>
                  <h3 className="font-bold text-[9px] text-center line-clamp-1 uppercase tracking-tighter text-white/80">{product.name}</h3>
                  <p className="text-[9px] font-black gold-text uppercase">{product.price.toLocaleString()}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-black/95 backdrop-blur-md" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="luxury-card bg-[#0a0a0a] w-full max-w-md relative z-10 border border-white/10 p-10">
              <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 text-white/30"><X size={24}/></button>
              <img src={selectedItem.image} className="w-full h-56 object-cover rounded-[40px] mb-8 grayscale-[0.1]" />
              <h2 className="text-4xl font-black gold-text uppercase tracking-tighter mb-4 leading-none">{selectedItem.name}</h2>
              <p className="text-white/40 text-sm mb-10 leading-relaxed tracking-wide">{selectedItem.description}</p>
              <div className="flex items-center justify-between gap-6 pt-4 border-t border-white/5">
                <div>
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Price</p>
                  <p className="text-3xl font-black text-white">{selectedItem.price.toLocaleString()}</p>
                </div>
                <button onClick={() => { addToCart(selectedItem); setSelectedItem(null); }} className="gold-bg text-black px-10 py-6 rounded-full font-black text-[10px] tracking-widest uppercase shadow-2xl">Add to Bag</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-10 left-10 right-10 max-w-md mx-auto z-40">
        <div className="glass-nav rounded-full p-2 flex items-center justify-between shadow-2xl">
          <button onClick={() => setView('home')} className={`flex-1 py-4 flex justify-center ${view === 'home' ? 'text-[#c5a059]' : 'text-white/20'}`}><Home size={22} /></button>
          <button onClick={() => setView('menu')} className={`flex-1 py-4 flex justify-center ${view === 'menu' ? 'text-[#c5a059]' : 'text-white/20'}`}><MenuIcon size={22} /></button>
          <div className="px-2">
            <button onClick={() => setView('cart')} className={`w-16 h-16 rounded-full flex items-center justify-center relative transition-all ${view === 'cart' ? 'gold-bg text-black scale-110 shadow-2xl' : 'bg-white/5 text-white'}`}>
              <ShoppingBag size={24} />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-[#050505]">{cartCount}</span>}
            </button>
          </div>
          <button className="flex-1 py-4 flex justify-center text-white/20 opacity-20"><Star size={22} /></button>
          <button onClick={() => setView('admin')} className={`flex-1 py-4 flex justify-center ${view === 'admin' ? 'text-[#c5a059]' : 'text-white/20'}`}><Settings size={22} /></button>
        </div>
      </nav>
    </div>
  );
}
