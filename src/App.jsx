import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Leaf,
  Timer
} from 'lucide-react';

// --- CONFIGURATION ---
const TELEGRAM_BOT_TOKEN = '8515752068:AAHyVw2C7KhjiQGeLMQAPQrLBeCiq0J61p8';
const TELEGRAM_CHAT_ID = '8445457521';
const ADMIN_PASSWORD = 'admin';

const DEFAULT_MENU = [
  { id: 1, name: 'Panda Classic Burger', price: 28000, category: 'Fast-fud', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', description: 'Fresh beef, cheddar, and our secret green sauce.', popular: true, time: '10 min' },
  { id: 2, name: 'Spicy Zinger', price: 32000, category: 'Fast-fud', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80', description: 'Crispy chicken with spicy jalapeños.', popular: true, time: '12 min' },
  { id: 3, name: 'Fresh Mint Lemonade', price: 12000, category: 'Ichimliklar', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80', description: 'Real lemons and fresh mint leaves.', popular: false, time: '3 min' },
  { id: 4, name: 'Berry Smoothie', price: 18000, category: 'Ichimliklar', image: 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=800&q=80', description: 'Wild berries with Greek yogurt.', popular: false, time: '5 min' },
];

const CATEGORIES = ['Barchasi', 'Fast-fud', 'Ichimliklar'];

export default function App() {
  const [menu, setMenu] = useState(() => {
    const saved = localStorage.getItem('qr_menu_fresh_v1');
    return saved ? JSON.parse(saved) : DEFAULT_MENU;
  });
  
  const [view, setView] = useState('home');
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [table, setTable] = useState('1');
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('panda_admin') === 'true');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('table')) setTable(params.get('table'));
  }, []);

  useEffect(() => {
    localStorage.setItem('qr_menu_fresh_v1', JSON.stringify(menu));
  }, [menu]);

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

    const orderText = `🐼 *PANDA BURGER FRESH*\n━━━━━━━━━━━━━━\n📍 *Stol:* ${table}\n👤 *Mijoz:* ${customer}\n🍱 *Jami:* ${cartTotal.toLocaleString()} UZS`;

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
      <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col items-center justify-center p-12 text-center text-slate-900">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8">
          <CheckCircle2 size={40} />
        </motion.div>
        <h1 className="text-3xl font-black mb-4 tracking-tight">Buyurtma Qabul Qilindi!</h1>
        <p className="text-slate-500 text-sm mb-12 leading-relaxed">Sizning mazali burgeringiz tayyorlanmoqda.</p>
        <button onClick={() => setView('home')} className="w-full btn-primary">Asosiy sahifaga</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white font-sans pb-32">
      
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between sticky top-0 z-30 glass-header">
        <div onClick={() => setView('home')} className="cursor-pointer flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-black text-xl animate-bounce">P</div>
          <div>
            <h1 className="text-sm font-black tracking-tight uppercase text-slate-900 flex items-center gap-2">
              Panda Burger <span className="bg-red-500 text-[8px] text-white px-2 py-0.5 rounded-full animate-pulse">NEW VERSION</span>
            </h1>
            <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Table {table}</p>
          </div>
        </div>
        <button onClick={() => setView(view === 'admin' ? 'home' : 'admin')} className="text-slate-300">
          <Settings size={20} />
        </button>
      </header>

      <main className="px-6">
        {view === 'home' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 py-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Leaf size={12} /> Fresh & Natural
              </div>
              <h2 className="text-5xl font-black tracking-tighter leading-[1.1] text-slate-900">Eat Good <br/>Feel <span className="text-green-500 text-6xl">Fresh.</span></h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-[280px]">Healthy ingredients, vibrant taste, and fast delivery to your table.</p>
              <button onClick={() => setView('menu')} className="btn-primary flex items-center gap-4 group">
                Open Menu <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-6 rounded-[40px] border border-slate-100 space-y-4">
                <Timer className="text-green-500" size={24} />
                <div>
                  <h4 className="font-black text-[10px] uppercase text-slate-900 tracking-widest mb-1">Fast</h4>
                  <p className="text-[10px] text-slate-400 font-bold">10-15 Min</p>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-[40px] border border-slate-100 space-y-4">
                <Star className="text-green-500" size={24} />
                <div>
                  <h4 className="font-black text-[10px] uppercase text-slate-900 tracking-widest mb-1">Top</h4>
                  <p className="text-[10px] text-slate-400 font-bold">Best Taste</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : view === 'admin' ? (
          <div className="space-y-10 py-12 text-center">
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">Admin</h2>
            <div className="bg-slate-50 p-10 rounded-[48px] border border-slate-100 flex flex-col items-center gap-8 shadow-sm">
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xl"><QRCodeSVG value={`${window.location.origin}?table=${table}`} size={160} /></div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Table {table} QR Code</p>
            </div>
            <button onClick={() => setView('home')} className="w-full py-5 rounded-full border border-slate-100 text-xs font-black uppercase tracking-widest text-slate-400">Exit Panel</button>
          </div>
        ) : view === 'cart' ? (
          <div className="space-y-10 py-8">
            <h2 className="text-4xl font-black tracking-tighter uppercase text-slate-900">My Cart</h2>
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <ShoppingBag size={48} className="text-slate-100 mx-auto" />
                <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-8">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-6 p-2">
                    <div className="w-20 h-20 rounded-[28px] overflow-hidden bg-slate-50">
                      <img src={item.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
                      <p className="text-xs text-green-600 font-black mt-1">{item.price.toLocaleString()} UZS</p>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-1 rounded-full border border-slate-100">
                      <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400"><Minus size={14} /></button>
                      <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 rounded-full flex items-center justify-center text-green-500"><Plus size={14} /></button>
                    </div>
                  </div>
                ))}
                <form onSubmit={sendOrder} className="pt-10 space-y-8">
                  <div className="space-y-4">
                    <input required name="name" placeholder="YOUR NAME" className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none text-sm font-bold uppercase tracking-widest text-slate-900 placeholder:text-slate-300 focus:border-green-500 transition-colors" />
                  </div>
                  <div className="flex justify-between items-center py-6 border-t border-slate-100">
                    <span className="text-xs font-black uppercase text-slate-400">Total Price</span>
                    <span className="text-4xl font-black text-slate-900">{cartTotal.toLocaleString()}</span>
                  </div>
                  <button type="submit" disabled={isSending} className="w-full btn-primary py-6 rounded-[28px] uppercase tracking-widest text-xs">
                    {isSending ? 'Sending...' : 'Confirm Order'}
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-12 py-8">
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} className={`category-btn ${category === cat ? 'category-active' : 'category-inactive'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {filteredMenu.map(product => (
                <div key={product.id} onClick={() => setSelectedItem(product)} className="product-card cursor-pointer group">
                  <div className="aspect-square overflow-hidden bg-slate-50 relative">
                    <img src={product.image} className="w-full h-full object-cover" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                      className="absolute bottom-3 right-3 bg-white text-green-500 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all border border-slate-50"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="p-4 space-y-1 text-center">
                    <h3 className="font-bold text-xs truncate text-slate-900 uppercase tracking-tight">{product.name}</h3>
                    <p className="text-green-600 font-black text-xs">{product.price.toLocaleString()} UZS</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Item Detail */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-white w-full max-w-md relative z-10 rounded-[48px] overflow-hidden p-8 shadow-2xl">
              <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"><X size={20}/></button>
              <img src={selectedItem.image} className="w-full h-64 object-cover rounded-[32px] mb-8" />
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3 text-green-600 text-[10px] font-black uppercase tracking-widest">
                  <Clock size={14} /> {selectedItem.time} • {selectedItem.category}
                </div>
                <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase">{selectedItem.name}</h2>
                <p className="text-slate-500 text-sm leading-relaxed">{selectedItem.description}</p>
              </div>
              <div className="flex items-center justify-between gap-6 pt-6 border-t border-slate-100">
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price</p>
                  <p className="text-3xl font-black text-slate-900">{selectedItem.price.toLocaleString()}</p>
                </div>
                <button onClick={() => { addToCart(selectedItem); setSelectedItem(null); }} className="btn-primary py-5 px-10 rounded-3xl text-xs uppercase tracking-widest">Add to Bag</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-10 left-8 right-8 max-w-md mx-auto z-40">
        <div className="bg-[#0f172a] rounded-full p-2 flex items-center justify-between shadow-2xl">
          <button onClick={() => setView('home')} className={`nav-item ${view === 'home' ? 'nav-active' : 'nav-inactive'}`}><Home size={22} /></button>
          <button onClick={() => setView('menu')} className={`nav-item ${view === 'menu' ? 'nav-active' : 'nav-inactive'}`}><MenuIcon size={22} /></button>
          <div className="px-2">
            <button onClick={() => setView('cart')} className={`w-16 h-16 rounded-full flex items-center justify-center relative transition-all ${view === 'cart' ? 'bg-[#22c55e] text-white' : 'bg-white/5 text-white'}`}>
              <ShoppingBag size={24} />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-[#0f172a]">{cartCount}</span>}
            </button>
          </div>
          <button className="nav-item opacity-20"><Star size={22} /></button>
          <button onClick={() => setView('admin')} className={`nav-item ${view === 'admin' ? 'nav-active' : 'nav-inactive'}`}><Settings size={22} /></button>
        </div>
      </nav>
    </div>
  );
}
