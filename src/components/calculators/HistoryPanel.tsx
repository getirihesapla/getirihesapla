"use client";

import React, { useEffect, useState, useCallback } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, limit, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

export default function HistoryPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadLocalHistory = useCallback(() => {
    if (!user) {
      try {
        const local = JSON.parse(localStorage.getItem('korfu_history') || '[]');
        setHistory(local);
      } catch (e) {
        setHistory([]);
      }
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        loadLocalHistory();
      }
    });
    return () => unsubscribeAuth();
  }, [loadLocalHistory]);

  useEffect(() => {
    const handleHistoryUpdate = () => {
      if (!user) {
        loadLocalHistory();
      }
    };
    window.addEventListener('history_updated', handleHistoryUpdate);
    return () => window.removeEventListener('history_updated', handleHistoryUpdate);
  }, [user, loadLocalHistory]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "history"), orderBy("createdAt", "desc"), limit(20));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setHistory(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      if (user) {
        await deleteDoc(doc(db, "users", user.uid, "history", id));
      } else {
        const local = JSON.parse(localStorage.getItem('korfu_history') || '[]');
        const filtered = local.filter((item: any) => item.id !== id);
        localStorage.setItem('korfu_history', JSON.stringify(filtered));
        setHistory(filtered);
      }
      setTimeout(() => setDeletingId(null), 300);
    } catch (error) {
      console.error("Geçmiş silinirken hata:", error);
      setDeletingId(null);
    }
  };

  const formatDate = (dateObj: any) => {
    if (!dateObj) return 'Şimdi';
    if (dateObj.toDate) {
      return new Date(dateObj.toDate()).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
    }
    return new Date(dateObj).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shadow-inner">
          <span role="img" aria-label="history">🕒</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Geçmiş Hesaplamalar</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Son yaptığınız analizler</p>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-8 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          Henüz kaydedilmiş bir hesaplamanız bulunmuyor.
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {history.map((item) => (
            <div 
              key={item.id} 
              className={`flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl border-b border-gray-100 dark:border-zinc-800 last:border-0 transition-all duration-300 group ${deletingId === item.id ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}
            >
              <div className="flex items-start md:items-center gap-3 flex-1 mb-2 md:mb-0">
                <div className="hidden md:flex shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center text-slate-500 dark:text-slate-400 text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.type}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.inputsSummary || '-'}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:justify-end gap-6 md:w-auto">
                <div className="text-right">
                  <div className="text-sm font-black text-amber-600 dark:text-amber-500">{item.resultValue}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{formatDate(item.createdAt)}</div>
                </div>
                
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Kaydı Sil"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
