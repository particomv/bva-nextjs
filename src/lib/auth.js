'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('bva_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('bva_user'); }
    }
    setLoading(false);
  }, []);

  async function login(username, password) {
    const { data, error } = await supabase
      .from('users').select('*')
      .eq('username', username).eq('password', password).single();
    if (error || !data) throw new Error('Invalid username or password');
    const userData = { id: data.id, username: data.username, role: data.role, name: data.name || data.username };
    setUser(userData);
    localStorage.setItem('bva_user', JSON.stringify(userData));
    return userData;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('bva_user');
    window.location.href = '/';
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
