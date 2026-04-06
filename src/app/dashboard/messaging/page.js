'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import LoadingSpinner from '@/components/LoadingSpinner';
import { MessageCircle, Send, Loader2 } from 'lucide-react';

export default function MessagingPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => { loadData(); }, []);
  async function loadData() { setLoading(true); const [mRes, uRes] = await Promise.all([supabase.from('messages').select('*').order('created_at', { ascending: false }), supabase.from('users').select('id, username, name, role')]); setMessages(mRes.data || []); setUsers((uRes.data || []).filter(u => u.id !== user?.id)); setLoading(false); }
  async function sendMessage() { if (!text.trim() || !selectedUser) return; setSending(true); await supabase.from('messages').insert({ from_user: user?.username, to_user: selectedUser, text: text.trim(), date: new Date().toISOString().split('T')[0], read: false }); setText(''); setSending(false); loadData(); }

  const threads = {};
  messages.forEach(m => { const other = m.from_user === user?.username ? m.to_user : m.from_user; if (!threads[other]) threads[other] = []; threads[other].push(m); });

  if (loading) return <LoadingSpinner text="Loading messages..." />;
  const chatMessages = selectedUser ? (threads[selectedUser] || []).sort((a, b) => (a.created_at || '').localeCompare(b.created_at || '')) : [];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-white mb-6">Messages</h2>
      <div className="grid sm:grid-cols-3 gap-4" style={{ minHeight: '60vh' }}>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3 overflow-y-auto">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2 px-2">Contacts</p>
          {users.map(u => (
            <button key={u.id} onClick={() => setSelectedUser(u.username)} className={`w-full text-left px-3 py-2.5 rounded-xl mb-1 transition-all ${selectedUser === u.username ? 'bg-[#4F9CF9]/15 text-[#4F9CF9]' : 'text-white/60 hover:bg-white/[0.04]'}`}>
              <p className="text-sm font-medium">{u.name || u.username}</p>
              <p className="text-[10px] text-white/25">{u.role}</p>
            </button>
          ))}
        </div>
        <div className="sm:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex flex-col">
          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center text-white/20 text-sm"><MessageCircle className="w-8 h-8 mr-2 opacity-30" /> Select a contact</div>
          ) : (<>
            <div className="p-4 border-b border-white/[0.06]"><p className="text-sm font-bold text-white">{selectedUser}</p></div>
            <div className="flex-1 p-4 overflow-y-auto space-y-2" style={{ maxHeight: '50vh' }}>
              {chatMessages.map(m => (
                <div key={m.id} className={`max-w-[80%] ${m.from_user === user?.username ? 'ml-auto' : ''}`}>
                  <div className={`px-3 py-2 rounded-xl text-sm ${m.from_user === user?.username ? 'bg-[#4F9CF9]/20 text-white' : 'bg-white/[0.06] text-white/70'}`}>{m.text}</div>
                  <p className="text-[9px] text-white/20 mt-0.5 px-1">{m.date}</p>
                </div>
              ))}
              {chatMessages.length === 0 && <p className="text-center text-white/20 text-xs">No messages yet</p>}
            </div>
            <div className="p-3 border-t border-white/[0.06] flex gap-2">
              <input type="text" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white outline-none placeholder:text-white/20" />
              <button onClick={sendMessage} disabled={sending} className="p-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14]">{sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}</button>
            </div>
          </>)}
        </div>
      </div>
    </div>
  );
}