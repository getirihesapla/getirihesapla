"use client";

import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from "firebase/firestore";

interface PriceAlert {
  id: string;
  symbol: string;
  name: string;
  condition: "greater" | "less" | "percent_up" | "percent_down" | "valuation_gap";
  targetValue: number;
  valuationPrice?: number;
  basePrice?: number;
  isActive: boolean;
  isTriggered: boolean;
  createdAt: any;
}

export default function AlertsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [toasts, setToasts] = useState<{id: string, message: string, type: 'success' | 'info'}[]>([]);

  const [formData, setFormData] = useState<{
    symbol: string;
    name: string;
    currentPrice: number;
    condition: "greater" | "less" | "percent_up" | "percent_down" | "valuation_gap";
    targetValue: string;
    valuationPrice: string;
  }>({
    symbol: "",
    name: "",
    currentPrice: 0,
    condition: "greater",
    targetValue: "",
    valuationPrice: "",
  });

  // Init Auth & Permissions
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });

    // Request notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    return () => unsubscribe();
  }, []);

  // Fetch Alerts from Firebase
  useEffect(() => {
    if (!user) {
      setAlerts([]);
      return;
    }

    const q = query(collection(db, "users", user.uid, "alerts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: PriceAlert[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as PriceAlert);
      });
      setAlerts(items);
    });

    return () => unsubscribe();
  }, [user]);

  // Live Price Polling & Alert Evaluation
  useEffect(() => {
    if (alerts.length === 0) return;

    const symbols = Array.from(new Set(alerts.map(a => a.symbol)));
    
    const fetchPrices = async () => {
      try {
        const res = await fetch(`/api/finance/quote?symbols=${encodeURIComponent(symbols.join(","))}`);
        if (res.ok) {
          const data = await res.json();
          const priceMap: Record<string, number> = {};
          
          data.forEach((item: any) => {
            priceMap[item.symbol] = item.price;
          });
          
          setLivePrices(prev => ({ ...prev, ...priceMap }));
        }
      } catch (err) {
        console.error("Fiyatlar güncellenemedi", err);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 3000); // 3 saniyeye indirilerek High-Priority Thread aktif edildi
    return () => clearInterval(interval);
  }, [alerts]);

  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const sendPushNotification = (title: string, body: string) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/korfu_app_icon.svg",
      });
    }
  };



  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    
    setIsSearching(true);
    setShowDropdown(true);
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/finance/search?q=${encodeURIComponent(val)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Arama hatası", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleSelectSymbol = async (item: any) => {
    setSearchQuery(item.symbol);
    setShowDropdown(false);
    
    setFormData(prev => ({ ...prev, symbol: item.symbol, name: item.shortname || item.longname || item.symbol }));
    
    try {
      const res = await fetch(`/api/finance/quote?symbol=${encodeURIComponent(item.symbol)}`);
      if (res.ok) {
        const data = await res.json();
        const price = data[0]?.price || data.price;
        setFormData(prev => ({ ...prev, currentPrice: price || 0 }));
      }
    } catch (err) {
      console.error("Fiyat getirme hatası", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setSubmitting(true);
      
      await addDoc(collection(db, "users", user.uid, "alerts"), {
        symbol: formData.symbol.toUpperCase(),
        name: formData.name,
        condition: formData.condition,
        targetValue: Number(formData.targetValue),
        valuationPrice: formData.condition === "valuation_gap" ? Number(formData.valuationPrice) : null,
        basePrice: formData.currentPrice,
        isActive: true,
        isTriggered: false,
        createdAt: serverTimestamp()
      });
      
      showToast("Alarm başarıyla kuruldu.", 'info');
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Alarm eklenirken hata oluştu:", error);
      alert("Bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAlert = async (id: string, currentStatus: boolean) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid, "alerts", id), {
        isActive: !currentStatus,
        isTriggered: false // Re-activate
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAlert = async (id: string) => {
    if (!user) return;
    if (window.confirm("Bu alarmı silmek istiyor musunuz?")) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "alerts", id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({ symbol: "", name: "", currentPrice: 0, condition: "greater", targetValue: "", valuationPrice: "" });
    setSearchQuery("");
  };

  if (loadingAuth) {
    return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-indigo-500">Sistem Yükleniyor...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 shadow-2xl">
          <div className="text-6xl mb-6">🔔</div>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">Fiyat Alarmları</h2>
          <p className="text-slate-400 mb-8">
            Piyasaları 7/24 izleyen akıllı alarm sistemi için giriş yapın.
          </p>
          <p className="text-sm font-semibold text-indigo-500">Üst menüden hesabınıza bağlanabilirsiniz.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#020617] min-h-screen text-slate-200 font-sans pb-20 relative">
      
      {/* Toast Container */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transform transition-all duration-300 animate-in slide-in-from-right-10 pointer-events-auto ${
            toast.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
          }`}>
            <span className="text-xl">{toast.type === 'success' ? '🚨' : 'ℹ️'}</span>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8 max-w-6xl">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
              <span className="w-2 h-8 bg-indigo-500 rounded-full inline-block"></span>
              Akıllı Fiyat Alarmları
            </h1>
            <p className="text-slate-400 mt-2 text-sm max-w-xl">
              Hisse, kripto ve döviz kurlarında dilediğiniz hedefleri belirleyin, sistem arka planda sizin yerinize takip etsin.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-2.5 px-6 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Yeni Alarm Kur
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
              <span className="text-5xl mb-4 opacity-50">🔕</span>
              <p>Henüz kurulu bir alarmınız bulunmuyor.</p>
            </div>
          ) : (
            alerts.map(alert => {
              const live = livePrices[alert.symbol];
              const isProgressing = live && alert.condition === "greater" ? live > (alert.basePrice || 0) : alert.condition === "less" ? live < (alert.basePrice || 0) : false;
              
              return (
                <div key={alert.id} className={`relative bg-slate-900/80 backdrop-blur-xl border ${alert.isTriggered ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : alert.isActive ? 'border-indigo-500/20' : 'border-slate-800 opacity-60'} rounded-2xl p-6 transition-all group`}>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        {alert.symbol}
                        {alert.isTriggered && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>}
                      </h3>
                      <p className="text-xs text-slate-400">{alert.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleAlert(alert.id, alert.isActive)} className={`w-10 h-5 rounded-full relative transition-colors ${alert.isActive ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${alert.isActive ? 'translate-x-5' : ''}`}></span>
                      </button>
                      <button onClick={() => deleteAlert(alert.id)} className="text-slate-500 hover:text-red-400 transition-colors ml-2">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-400 font-medium">Koşul:</span>
                      <span className="text-sm font-bold text-white bg-slate-800 px-2 py-1 rounded">
                        {alert.condition === "greater" ? "Yükselirse (≥)" : alert.condition === "less" ? "Düşerse (≤)" : alert.condition === "percent_up" ? "% Yükselirse" : alert.condition === "percent_down" ? "% Düşerse" : "Güvenlik Marjı (% İskonto)"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-medium">Hedef:</span>
                      <span className={`text-lg font-mono font-bold ${alert.condition.includes("up") || alert.condition === "greater" ? "text-emerald-400" : "text-red-400"}`}>
                        {alert.condition.includes("percent") ? `%${alert.targetValue}` : alert.targetValue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center text-xs">
                    <span className="text-slate-500">Canlı Fiyat:</span>
                    <span className="font-mono text-white font-bold">{live ? live.toLocaleString() : "Bekleniyor..."}</span>
                  </div>

                  {alert.isTriggered && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500 rounded-b-2xl"></div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Ekleme Modalı */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-3xl w-full max-w-md border border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
                <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                  <span className="text-indigo-500">🔔</span> Yeni Alarm Kur
                </h3>
                <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-full p-1">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              
              <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Varlık Seçimi</label>
                  <div className="relative">
                    <input 
                      value={searchQuery} 
                      onChange={handleSearchChange} 
                      placeholder="Sembol ara (Örn: BTC-USD, THYAO.IS)"
                      onFocus={() => { if(searchQuery.length >= 2) setShowDropdown(true); }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                    />
                    <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                  
                  {showDropdown && (
                    <div className="absolute z-[100] w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-56 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 text-sm text-slate-400 text-center animate-pulse">Aranıyor...</div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((res, i) => (
                          <div 
                            key={i} 
                            onClick={() => handleSelectSymbol(res)}
                            className="p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0 transition-colors"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-indigo-400">{res.symbol}</span>
                              <span className="text-[10px] px-2 py-0.5 bg-slate-900 rounded-full text-slate-300">{res.typeDisp}</span>
                            </div>
                            <div className="text-xs text-slate-400 truncate">{res.shortname || res.longname}</div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-sm text-slate-400 text-center">Sonuç bulunamadı.</div>
                      )}
                    </div>
                  )}
                </div>

                {formData.symbol && (
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex justify-between items-center">
                    <span className="text-sm text-slate-300">Anlık Fiyat:</span>
                    <span className="text-lg font-mono font-bold text-indigo-400">{formData.currentPrice.toLocaleString()}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tetiklenme Koşulu</label>
                  <select 
                    value={formData.condition} 
                    onChange={e => setFormData({...formData, condition: e.target.value as any})} 
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="greater">Fiyat Şuna Eşit veya Üzerine Çıkarsa (≥)</option>
                    <option value="less">Fiyat Şuna Eşit veya Altına İnerse (≤)</option>
                    <option value="percent_up">Şu Kadar Yüzde (%) Değer Kazanırsa</option>
                    <option value="percent_down">Şu Kadar Yüzde (%) Değer Kaybederse</option>
                    <option value="valuation_gap">İçsel Değerin %X Altına Sarktığında (Güvenlik Marjı)</option>
                  </select>
                </div>

                {formData.condition === "valuation_gap" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-indigo-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Hesapladığınız İçsel Değer (Valuation)
                    </label>
                    <input 
                      required 
                      type="number" 
                      step="any" 
                      value={formData.valuationPrice} 
                      onChange={e => setFormData({...formData, valuationPrice: e.target.value})} 
                      className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl py-3 px-4 text-white font-mono focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" 
                      placeholder="Örn: İNA/Gordon ile bulduğunuz değer" 
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {formData.condition === "valuation_gap" ? "Güvenlik Marjı Yüzdesi (%)" : "Hedef Değer"}
                  </label>
                  <input 
                    required 
                    type="number" 
                    step="any" 
                    value={formData.targetValue} 
                    onChange={e => setFormData({...formData, targetValue: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                    placeholder="Örn: 120000 veya 3" 
                  />
                </div>

                <button disabled={submitting || !formData.symbol} type="submit" className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
                  {submitting ? "Kaydediliyor..." : "Alarmı Başlat"}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
