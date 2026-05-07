import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ChevronRight, 
  Settings, 
  ChevronLeft,
  CheckCircle2,
  X,
  PlusCircle,
  UtensilsCrossed
} from 'lucide-react';

// --- CONFIGURATION ---
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID_HERE';
const ADMIN_PASSWORD = 'admin'; // Simple MVP password

// --- INITIAL DATA ---
const DEFAULT_MENU = [
  { id: 1, name: 'Lavash Big', price: 28000, category: 'Fast-fud', image: 'https://images.unsplash.com/photo-1626700051175-656fc7cae0bb?auto=format&fit=crop&w=300&q=80' },
  { id: 2, name: 'Burger Special', price: 25000, category: 'Fast-fud', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80' },
  { id: 3, name: 'Kofye Americano', price: 15000, category: 'Ichimliklar', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=300&q=80' },
  { id: 4, name: 'Choy ko\'k', price: 5000, category: 'Ichimliklar', image: 'https://images.unsplash.com/photo-1563911191333-dc1952097746?auto=format&fit=crop&w=300&q=80' },
  { id: 5, name: 'Cheesecake', price: 22000, category: 'Shirinliklar', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=300&q=80' },
];

const CATEGORIES = ['Barchasi', 'Fast-fud', 'Ichimliklar', 'Shirinliklar'];

export default function App() {
  const [menu, setMenu] = useState(() => {
    const saved = localStorage.getItem('qr_menu_data');
    return saved ? JSON.parse(saved) : DEFAULT_MENU;
  });
  
  const [view, setView] = useState('menu'); // 'menu', 'cart', 'admin', 'success'
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState('Barchasi');
  const [table, setTable] = useState('');
  
  // Admin states
  const [isAdmin, setIsAdmin] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: '', category: 'Fast-fud', image: '' });

  // Get table number from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTable(params.get('table') || 'Noma\'lum');
  }, []);

  // Save menu to localStorage
  useEffect(() => {
    localStorage.setItem('qr_menu_data', JSON.stringify(menu));
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
    if (category === 'Barchasi') return menu;
    return menu.filter(item => item.category === category);
  }, [menu, category]);

  const sendOrder = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const customer = formData.get('name');
    const comment = formData.get('comment');

    const orderText = `
🔔 *YANGI BUYURTMA!*
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
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: orderText,
          parse_mode: 'Markdown'
        })
      });
      setCart([]);
      setView('success');
    } catch (err) {
      alert('Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.');
    }
  };

  const handleAddMenuItem = (e) => {
    e.preventDefault();
    const item = { ...newItem, id: Date.now(), price: Number(newItem.price) };
    setMenu([...menu, item]);
    setNewItem({ name: '', price: '', category: 'Fast-fud', image: '' });
  };

  const deleteMenuItem = (id) => {
    if (confirm('Ushbu taomni o\'chirishni xohlaysizmi?')) {
      setMenu(menu.filter(m => m.id !== id));
    }
  };

  // --- VIEWS ---

  if (view === 'success') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-4 animate-bounce" />
        <h1 className="text-2xl font-bold mb-2">Buyurtma qabul qilindi!</h1>
        <p className="text-slate-500 mb-8">Tez orada taomlaringiz tayyor bo'ladi.</p>
        <button 
          onClick={() => setView('menu')}
          className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg active:scale-95 transition-all"
        >
          Menyuga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative pb-24">
      {/* Header */}
      <header className="bg-white px-6 py-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-indigo-600 flex items-center gap-2">
            <UtensilsCrossed size={24} /> QR MENU
          </h1>
          <p className="text-xs text-slate-400 font-medium">STOL: {table}</p>
        </div>
        <button 
          onClick={() => {
            if (!isAdmin) {
              const pass = prompt('Admin parolini kiriting:');
              if (pass === ADMIN_PASSWORD) setIsAdmin(true);
            }
            setView(view === 'admin' ? 'menu' : 'admin');
          }}
          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <Settings size={20} />
        </button>
      </header>

      {view === 'admin' ? (
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={() => setView('menu')} className="p-1"><ChevronLeft /></button>
            <h2 className="text-xl font-bold">Admin Panel</h2>
          </div>

          <form onSubmit={handleAddMenuItem} className="bg-white p-4 rounded-2xl shadow-sm mb-8 space-y-4">
            <h3 className="font-semibold text-sm text-slate-500 uppercase">Yangi taom qo'shish</h3>
            <input 
              required placeholder="Nomi" 
              className="w-full p-3 bg-slate-100 rounded-xl outline-none"
              value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})}
            />
            <input 
              required type="number" placeholder="Narxi (so'm)" 
              className="w-full p-3 bg-slate-100 rounded-xl outline-none"
              value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})}
            />
            <select 
              className="w-full p-3 bg-slate-100 rounded-xl outline-none"
              value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}
            >
              {CATEGORIES.filter(c => c !== 'Barchasi').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input 
              placeholder="Rasm URL" 
              className="w-full p-3 bg-slate-100 rounded-xl outline-none"
              value={newItem.image} onChange={e => setNewItem({...newItem, image: e.target.value})}
            />
            <button className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2">
              <PlusCircle size={20} /> Qo'shish
            </button>
          </form>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-slate-500 uppercase">Menyu tahrirlash</h3>
            {menu.map(item => (
              <div key={item.id} className="bg-white p-3 rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-xs text-indigo-600 font-medium">{item.price.toLocaleString()} so'm</p>
                  </div>
                </div>
                <button onClick={() => deleteMenuItem(item.id)} className="text-red-500 p-2">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : view === 'cart' ? (
        <div className="p-6 animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={() => setView('menu')} className="p-1"><ChevronLeft /></button>
            <h2 className="text-xl font-bold">Savatcha</h2>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={64} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400">Savatchangiz bo'sh</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <img src={item.image} className="w-14 h-14 rounded-xl object-cover" />
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-sm text-indigo-600 font-bold">{(item.price * item.qty).toLocaleString()} so'm</p>
                      </div>
                    </div>
                    <div className="flex items-center bg-slate-100 rounded-full p-1">
                      <button onClick={() => updateQty(item.id, -1)} className="p-1 text-slate-500"><Minus size={16} /></button>
                      <span className="w-8 text-center font-bold">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="p-1 text-indigo-600"><Plus size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendOrder} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <h3 className="font-bold text-lg">Ma'lumotlar</h3>
                <input 
                  required name="name" placeholder="Ismingiz" 
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-indigo-100 transition-all"
                />
                <textarea 
                  name="comment" placeholder="Izoh (masalan: piyozsiz bo'lsin)" 
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-indigo-100 transition-all h-24"
                />
                <div className="pt-4 border-t border-dashed flex justify-between items-center mb-4">
                  <span className="text-slate-500 font-medium">Jami summa:</span>
                  <span className="text-xl font-black text-indigo-600">{cartTotal.toLocaleString()} so'm</span>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 active:scale-95 transition-all">
                  BUYURTMA BERISH
                </button>
              </form>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Categories */}
          <div className="flex gap-2 px-6 py-4 overflow-x-auto no-scrollbar whitespace-nowrap">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                  category === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 gap-4 px-6">
            {filteredMenu.map(product => (
              <div key={product.id} className="bg-white rounded-3xl p-3 flex items-center gap-4 shadow-sm border border-slate-50 group hover:border-indigo-100 transition-all">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-24 h-24 rounded-2xl object-cover shadow-inner"
                />
                <div className="flex-1">
                  <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-1">{product.category}</p>
                  <h3 className="font-black text-slate-800 mb-1">{product.name}</h3>
                  <p className="text-lg font-black text-slate-900">{product.price.toLocaleString()} <span className="text-xs font-medium text-slate-400">so'm</span></p>
                </div>
                <button 
                  onClick={() => addToCart(product)}
                  className="bg-slate-900 text-white p-3 rounded-2xl active:scale-90 transition-all shadow-md group-hover:bg-indigo-600"
                >
                  <Plus size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* Floating Cart Button */}
          {cartCount > 0 && (
            <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto z-20">
              <button 
                onClick={() => setView('cart')}
                className="w-full bg-slate-900 text-white py-4 px-6 rounded-3xl flex items-center justify-between shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs">
                    {cartCount}
                  </div>
                  <span className="font-bold tracking-tight">Savatchani ko'rish</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black">{cartTotal.toLocaleString()} so'm</span>
                  <ChevronRight size={20} />
                </div>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
