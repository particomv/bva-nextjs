'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ShoppingBag, Plus, Trash2, Save, Loader2, X, Check, ShoppingCart, Package } from 'lucide-react';

export default function ShopPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [tab, setTab] = useState('shop');
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  useEffect(() => { loadData(); }, []);
  async function loadData() { setLoading(true); const [iRes, oRes] = await Promise.all([supabase.from('shop_items').select('*').order('name'), supabase.from('shop_orders').select('*').order('created_at', { ascending: false })]); setItems(iRes.data || []); setOrders(oRes.data || []); setLoading(false); }
  async function saveItem(data) { if (editing) { await supabase.from('shop_items').update(data).eq('id', editing.id); } else { await supabase.from('shop_items').insert(data); } setShowModal(false); setEditing(null); loadData(); }
  async function deleteItem(id) { if (!confirm('Delete?')) return; await supabase.from('shop_items').delete().eq('id', id); loadData(); }

  function addToCart(item) { const existing = cart.find(c => c.id === item.id); if (existing) { setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)); } else { setCart([...cart, { ...item, qty: 1 }]); } }
  function removeFromCart(id) { setCart(cart.filter(c => c.id !== id)); }
  function cartTotal() { return cart.reduce((sum, c) => sum + c.price * c.qty, 0); }

  async function placeOrder() {
    if (!cart.length) return;
    const order = { user_id: user?.id, user_name: user?.name || user?.username, items: cart.map(c => ({ name: c.name, qty: c.qty, price: c.price })), total: cartTotal(), status: 'pending', date: new Date().toISOString().split('T')[0] };
    await supabase.from('shop_orders').insert(order);
    setCart([]); alert('Order placed!'); loadData();
  }

  async function updateOrderStatus(id, status) { await supabase.from('shop_orders').update({ status }).eq('id', id); loadData(); }

  if (loading) return <LoadingSpinner text="Loading shop..." />;
  const pending = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-xl font-bold text-white">Academy Shop</h2><p className="text-sm text-white/40 mt-1">{items.length} items</p></div>
        <div className="flex gap-2">
          {cart.length > 0 && <button onClick={placeOrder} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 text-sm font-bold border border-emerald-500/25"><ShoppingCart className="w-4 h-4" /> Checkout ({cart.length})</button>}
          {isAdmin && <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold"><Plus className="w-4 h-4" /> Add Item</button>}
        </div>
      </div>

      {/* Stats for admin */}
      {isAdmin && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 text-center"><p className="text-xl font-bold text-white">{orders.length}</p><p className="text-[10px] text-white/30 uppercase">Orders</p></div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center"><p className="text-xl font-bold text-amber-400">{pending}</p><p className="text-[10px] text-white/30 uppercase">Pending</p></div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center"><p className="text-xl font-bold text-emerald-400">MVR {orders.filter(o => o.status === 'approved').reduce((s, o) => s + (o.total || 0), 0).toLocaleString()}</p><p className="text-[10px] text-white/30 uppercase">Revenue</p></div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {['shop', 'orders'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-semibold ${tab === t ? 'bg-[#4F9CF9]/15 text-[#4F9CF9] border border-[#4F9CF9]/25' : 'text-white/40 border border-transparent'}`}>
            {t === 'shop' ? 'Products' : `Orders${pending ? ` (${pending})` : ''}`}
          </button>
        ))}
      </div>

      {tab === 'shop' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map(item => {
              const inCart = cart.find(c => c.id === item.id);
              return (
                <div key={item.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center hover:bg-white/[0.05] transition-all">
                  <div className="w-16 h-16 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3 text-3xl">
                    {item.category === 'Apparel' ? '👕' : item.category === 'Accessories' ? '🧴' : '🏐'}
                  </div>
                  <h3 className="text-sm font-bold text-white">{item.name}</h3>
                  {item.description && <p className="text-[10px] text-white/30 mt-1">{item.description}</p>}
                  <p className="text-lg font-black text-[#4F9CF9] mt-2">MVR {item.price}</p>
                  <div className="flex gap-1 mt-3">
                    <button onClick={() => addToCart(item)} className={`flex-1 py-2 rounded-xl text-xs font-bold ${inCart ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-[#4F9CF9]/10 text-[#4F9CF9] border border-[#4F9CF9]/20'}`}>
                      {inCart ? `In Cart (${inCart.qty})` : 'Add to Cart'}
                    </button>
                    {isAdmin && <button onClick={() => deleteItem(item.id)} className="p-2 rounded-xl bg-white/[0.04] text-white/20 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>}
                  </div>
                </div>
              );
            })}
            {items.length === 0 && <div className="col-span-3 text-center py-16 text-white/30 text-sm">No products yet</div>}
          </div>

          {/* Cart */}
          {cart.length > 0 && (
            <div className="mt-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
              <h3 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-3">🛒 Cart</h3>
              {cart.map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-sm text-white">{c.name} x{c.qty}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">MVR {c.price * c.qty}</span>
                    <button onClick={() => removeFromCart(c.id)} className="text-white/20 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between mt-3 pt-2"><span className="text-sm font-bold text-white">Total</span><span className="text-lg font-black text-[#4F9CF9]">MVR {cartTotal()}</span></div>
              <button onClick={placeOrder} className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold">Place Order</button>
            </div>
          )}
        </>
      )}

      {tab === 'orders' && (
        <div className="grid gap-3">
          {orders.map(o => (
            <div key={o.id} className={`bg-white/[0.03] border-l-2 border border-white/[0.06] rounded-xl p-4 ${o.status === 'pending' ? 'border-l-amber-400' : o.status === 'approved' ? 'border-l-emerald-400' : 'border-l-red-400'}`}>
              <div className="flex justify-between items-start mb-2">
                <div><p className="text-sm font-bold text-white">{o.user_name || 'Customer'}</p><p className="text-[10px] text-white/25">{o.date} · Order #{o.id}</p></div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${o.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' : o.status === 'rejected' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>{o.status}</span>
              </div>
              {(o.items || []).map((it, i) => <p key={i} className="text-xs text-white/40">{it.name} x{it.qty} — MVR {it.price * it.qty}</p>)}
              <p className="text-sm font-bold text-[#4F9CF9] mt-2">Total: MVR {o.total}</p>
              {isAdmin && o.status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => updateOrderStatus(o.id, 'approved')} className="flex-1 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">✅ Approve</button>
                  <button onClick={() => updateOrderStatus(o.id, 'rejected')} className="flex-1 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">❌ Reject</button>
                </div>
              )}
            </div>
          ))}
          {orders.length === 0 && <div className="text-center py-16 text-white/30 text-sm">No orders yet</div>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={() => { setShowModal(false); setEditing(null); }}>
          <div className="bg-[#0a0e17] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-bold text-white">Add Product</h3><button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg bg-white/[0.06] text-white/40"><X className="w-4 h-4" /></button></div>
            <ItemForm onSave={saveItem} />
          </div>
        </div>
      )}
    </div>
  );
}

function ItemForm({ onSave }) {
  const [form, setForm] = useState({ name: '', price: '', category: 'Apparel', description: '' });
  const [saving, setSaving] = useState(false);
  async function handleSave() { if (!form.name || !form.price) return alert('Name and price required'); setSaving(true); await onSave({ ...form, price: parseFloat(form.price) }); setSaving(false); }
  return (<div className="space-y-3">
    <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Name *</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" /></div>
    <div className="grid grid-cols-2 gap-3">
      <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Price (MVR) *</label><input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" /></div>
      <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Category</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none"><option>Apparel</option><option>Accessories</option><option>Equipment</option></select></div>
    </div>
    <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Description</label><input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" /></div>
    <button onClick={handleSave} disabled={saving} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold flex items-center justify-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Add Product</button>
  </div>);
}