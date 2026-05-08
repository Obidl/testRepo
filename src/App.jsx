import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ChevronRight, 
  Settings, 
  ChevronLeft,
  CheckCircle2,
  PlusCircle,
  UtensilsCrossed,
  Search,
  Star,
  Clock,
  Info,
  Home,
  Menu as MenuIcon,
  X
} from 'lucide-react';

// --- CONFIGURATION ---
const TELEGRAM_BOT_TOKEN = '8515752068:AAHyVw2C7KhjiQGeLMQAPQrLBeCiq0J61p8';
const TELEGRAM_CHAT_ID = '8445457521';
const ADMIN_PASSWORD = 'admin';

// --- INITIAL DATA ---
const DEFAULT_MENU = [
  { id: 1, name: 'Panda Burger Big', price: 28000, category: 'Fast-fud', image: 'https://images.unsplash.com/photo-1626700051175-656fc7cae0bb?auto=format&fit=crop&w=400&q=80', description: 'Mol go\'shti, bodring, pomidor, maxsus sous va sarsiq piyoz bilan.', popular: true, time: '10-15 daqiqa' },
  { id: 2, name: 'Burger Special', price: 32000, category: 'Fast-fud', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80', description: 'Ikki qavatli go\'sht, cheddar pishlog\'i va qizil piyoz bilan.', popular: true, time: '12-18 daqiqa' },
  { id: 3, name: 'Kofye Americano', price: 15000, category: 'Ichimliklar', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80', description: 'Yangi yanchilgan arabika donachalaridan tayyorlangan kofe.', popular: false, time: '5 daqiqa' },
  { id: 4, name: 'Choy ko\'k', price: 5000, category: 'Ichimliklar', image: 'https://images.unsplash.com/photo-1563911191333-dc1952097746?auto=format&fit=crop&w=400&q=80', description: 'Issiq va xushbo\'y ko\'k choy.', popular: false, time: '3 daqiqa' },
  { id: 5, name: 'Cheesecake New York', price: 25000, category: 'Shirinliklar', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=400&q=80', description: 'Klassik qaymoqli pishloq va pechenye asosi.', popular: true, time: '5 daqiqa' },
];

const CATEGORIES = ['Barchasi', 'Fast-fud', 'Ichimliklar', 'Shirinliklar'];

export default function App() {
  const [menu, setMenu] = useState(() => {
    const saved = localStorage.getItem('qr_menu_panda_v4');
    return saved ? JSON.parse(saved) : DEFAULT_MENU;
  });
  
  const [view, setView] = useState('home');
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [table, setTable] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTable(params.get('table') || 'Noma\'lum');
  }, []);

  useEffect(() => {
    localStorage.setItem('qr_menu_panda_v4', JSON.stringify(menu));
  }, [menu]);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
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
    if (category !== 'Barchasi') {
      result = result.filter(item => item.category === category);
    }
    if (searchQuery) {
      result = result.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [menu, category, searchQuery]);

  const popularItems = useMemo(() => {
    return menu.filter(item => item.popular).slice(0, 3);
  }, [menu]);

  const sendOrder = async (e) => {
    e.preventDefault();
    if (isSending) return;
    
    const formData = new FormData(e.target);
    const customer = formData.get('name');
    const comment = formData.get('comment');

    setIsSending(true);

    const orderText = `
🐼 *YANGI PANDA BURGER BUYURTMA!*
━━━━━━━━━━━━━━
📍 *Stol:* ${table}
👤 *Mijoz:* ${customer}
📝 *Izoh:* ${comment || 'Yo\'q'}

🍱 *Taomlar:*
${cart.map(item => `• ${item.name} x ${item.qty} (${(item.price * item.qty).toLocaleString()} so'm)`).join('\n')}

━━━━━━━━━━━━━━
💰 *JAMI:* ${cartTotal.toLocaleString()} so'm
    `;

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: orderText,
          parse_mode: 'Markdown'
        })
      });
      
      if (!response.ok) throw new Error('Telegram API error');

      setCart([]);
      setView('success');
    } catch (err) {
      alert('Buyurtma yuborishda xatolik yuz berdi. Bot token va Chat ID sozlamalarini tekshiring.');
    } finally {
      setIsSending(false);
    }
  };

  const FoodCard = ({ product }) => (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setSelectedItem(product)}
      className="bg-white rounded-[24px] p-2 flex flex-col items-center text-center custom-shadow border border-white relative group"
    >
      <div className="w-full aspect-square rounded-[20px] overflow-hidden mb-2 relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <button 
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
          }}
          className="absolute bottom-1 right-1 bg-amber-400 text-amber-950 p-2 rounded-lg shadow-lg active:bg-amber-500"
        >
          <Plus size={14} strokeWidth={4} />
        </button>
      </div>
      <h3 className="font-bold text-slate-800 text-[10px] leading-tight line-clamp-2 px-1">{product.name}</h3>
      <p className="text-[10px] font-black text-amber-600 mt-1">{product.price.toLocaleString()}</p>
    </motion.div>
  );

  if (view === 'success') {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-32 h-32 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={64} />
        </motion.div>
        <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Panda Burger</h1>
        <p className="text-slate-500 mb-8 max-w-[200px]">Buyurtmangiz qabul qilindi. Panda sizga rahmat aytadi! 🐼</p>
        <button onClick={() => setView('home')} className="bg-amber-400 text-amber-950 px-10 py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all">
          BOSH SAHIFAGA QAYTISH
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white font-sans pb-32">
      <header className="px-6 py-6 flex items-center justify-between sticky top-0 z-30 glass shadow-sm">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} onClick={() => setView('home')} className="flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg text-amber-950 text-xl">🐼</div>
          <h1 className="text-base font-black text-slate-900 tracking-tighter uppercase">Panda Burger</h1>
        </motion.div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end mr-2 text-[10px] font-black">
            <span className="text-slate-400 uppercase tracking-widest">STOL</span>
            <span className="text-amber-600 leading-none">{table}</span>
          </div>
          <button onClick={() => {
            if (!isAdmin) {
              const pass = prompt('Admin parolini kiriting:');
              if (pass === ADMIN_PASSWORD) setIsAdmin(true);
            }
            setView(view === 'admin' ? 'home' : 'admin');
          }} className="p-2.5 bg-white rounded-xl text-slate-400 border border-slate-100 shadow-sm">
            <Settings size={18} />
          </button>
        </div>
      </header>

      <main className="px-4 py-4">
        {view === 'home' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 pb-10 text-center">
            <div className="pt-6">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="w-32 h-32 bg-amber-400 rounded-[40px] flex items-center justify-center text-6xl shadow-2xl mx-auto mb-8 relative">
                🐼
                <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-2xl shadow-lg text-2xl animate-bounce">🍔</div>
              </motion.div>
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase leading-none">
                Eng Mazali <br/> <span className="text-amber-500">Burgerlar</span>
              </h2>
              <p className="text-slate-500 mb-8 leading-relaxed font-medium text-sm">Panda Burger - sifatli go'sht va yangi mahsulotlardan tayyorlangan sevimli burgerlaringiz maskani!</p>
              <button onClick={() => setView('menu')} className="bg-slate-900 text-white py-5 px-10 rounded-[28px] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all mx-auto">
                MENYUNI KO'RISH <ChevronRight size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 px-2">
              <div className="bg-amber-50/50 p-5 rounded-[32px] border border-amber-100/50">
                <Clock className="mx-auto mb-2 text-amber-600" size={24} />
                <h4 className="font-black text-[10px] uppercase text-slate-400 mb-1">TEZKOR</h4>
                <p className="text-xs font-bold text-slate-800">15 daqiqa</p>
              </div>
              <div className="bg-amber-50/50 p-5 rounded-[32px] border border-amber-100/50">
                <Star className="mx-auto mb-2 text-amber-600" size={24} />
                <h4 className="font-black text-[10px] uppercase text-slate-400 mb-1">SIFATLI</h4>
                <p className="text-xs font-bold text-slate-800">100% Halol</p>
              </div>
            </div>
            <div className="space-y-4 px-2 text-left">
              <div className="flex justify-between items-end">
                <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Mashhur Burgerlar</h3>
                <button onClick={() => setView('menu')} className="text-amber-600 text-[10px] font-black uppercase">Barchasi</button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {popularItems.map(item => (
                  <div key={item.id} onClick={() => setSelectedItem(item)} className="cursor-pointer group">
                    <img src={item.image} className="w-full aspect-square object-cover rounded-[24px] mb-2 shadow-sm border border-slate-50 group-hover:scale-105 transition-all" />
                    <p className="text-[9px] font-bold text-slate-800 line-clamp-1">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : view === 'admin' ? (
          <div className="p-4 space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Admin Panel</h2>
            <div className="bg-white p-6 rounded-[32px] custom-shadow text-center">
              <p className="text-slate-400 italic">Tahrirlash rejimi faol.</p>
              <button onClick={() => setView('home')} className="w-full mt-4 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold">Bosh sahifaga qaytish</button>
            </div>
          </div>
        ) : view === 'cart' ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 px-2">Savatcha</h2>
            {cart.length === 0 ? (
              <div className="py-20 text-center">
                <ShoppingBag size={48} className="mx-auto mb-4 text-slate-200" />
                <p className="text-slate-400 font-bold">Savatchangiz bo'sh</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-[28px] flex items-center gap-4 custom-shadow mx-2">
                    <img src={item.image} className="w-16 h-16 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                      <p className="text-xs font-black text-amber-600">{(item.price * item.qty).toLocaleString()} so'm</p>
                    </div>
                    <div className="flex flex-col items-center bg-slate-50 rounded-2xl p-1">
                      <button onClick={() => updateQty(item.id, 1)} className="p-1 text-amber-600"><Plus size={14} strokeWidth={3} /></button>
                      <span className="font-black text-[10px]">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, -1)} className="p-1 text-slate-400"><Minus size={14} strokeWidth={3} /></button>
                    </div>
                  </div>
                ))}
                <form onSubmit={sendOrder} className="bg-white p-6 rounded-[32px] custom-shadow space-y-4 mx-2">
                  <input required name="name" placeholder="Ismingiz" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-medium text-sm" />
                  <textarea name="comment" placeholder="Izoh..." className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-medium text-sm h-24" />
                  <div className="flex justify-between items-center px-2 pt-2 border-t border-dashed">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Jami summa</span>
                    <span className="text-xl font-black text-slate-900">{cartTotal.toLocaleString()} so'm</span>
                  </div>
                  <button type="submit" className="w-full bg-amber-400 text-amber-950 py-5 rounded-[24px] font-black shadow-xl active:scale-95 transition-all">BUYURTMANI YUBORISH</button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative group px-2">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Qidirish..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white py-4 pl-14 pr-6 rounded-[20px] outline-none shadow-sm border border-slate-100 font-medium text-slate-700 text-sm focus:ring-4 ring-amber-50" />
            </div>
            {!searchQuery && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 px-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase whitespace-nowrap ${category === cat ? 'bg-amber-400 text-amber-950 shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>{cat}</button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-3 gap-3 pb-20 px-2">
              <AnimatePresence mode="popLayout">{filteredMenu.map(product => <FoodCard key={product.id} product={product} />)}</AnimatePresence>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-white w-full max-w-md rounded-[40px] overflow-hidden relative z-10 p-6">
              <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 z-20 w-8 h-8 bg-black/5 rounded-full flex items-center justify-center"><X size={16} /></button>
              <img src={selectedItem.image} className="w-full h-48 object-cover rounded-[32px] mb-6 shadow-lg" />
              <h2 className="text-2xl font-black text-slate-900 mb-2">{selectedItem.name}</h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">{selectedItem.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-slate-900">{selectedItem.price.toLocaleString()} so'm</span>
                <button onClick={() => { addToCart(selectedItem); setSelectedItem(null); }} className="bg-amber-400 text-amber-950 px-8 py-4 rounded-[20px] font-black shadow-lg shadow-amber-100 active:scale-95 transition-all">SAVATCHAGA</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-6 left-6 right-6 max-w-md mx-auto z-40">
        <div className="glass-dark rounded-[32px] p-2 flex items-center justify-between shadow-2xl">
          <button onClick={() => setView('home')} className={`flex-1 py-3 rounded-2xl flex flex-col items-center gap-1 ${view === 'home' ? 'text-amber-400 bg-white/10' : 'text-slate-500'}`}><Home size={20} /><span className="text-[8px] font-black uppercase tracking-widest">Asosiy</span></button>
          <button onClick={() => setView('menu')} className={`flex-1 py-3 rounded-2xl flex flex-col items-center gap-1 ${view === 'menu' ? 'text-amber-400 bg-white/10' : 'text-slate-500'}`}><MenuIcon size={20} /><span className="text-[8px] font-black uppercase tracking-widest">Menyu</span></button>
          <div className="px-2">
            <button onClick={() => setView('cart')} className={`w-14 h-14 rounded-2xl flex items-center justify-center relative ${view === 'cart' ? 'bg-amber-400 text-amber-950 shadow-lg' : 'bg-white text-slate-900'}`}>
              <ShoppingBag size={24} />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">{cartCount}</span>}
            </button>
          </div>
          <button onClick={() => setView('admin')} className={`flex-1 py-3 rounded-2xl flex flex-col items-center gap-1 ${view === 'admin' ? 'text-amber-400 bg-white/10' : 'text-slate-500'}`}><Settings size={20} /><span className="text-[8px] font-black uppercase tracking-widest">ADMIN</span></button>
        </div>
      </nav>
    </div>
  );
}
