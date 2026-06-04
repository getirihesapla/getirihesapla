"use client";

import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, onSnapshot, query, orderBy, updateDoc, doc } from "firebase/firestore";
import Link from "next/link";

interface PriceAlert {
  id: string;
  symbol: string;
  name: string;
  condition: "greater" | "less" | "percent_up" | "percent_down";
  targetValue: number;
  basePrice?: number;
  isActive: boolean;
  isTriggered: boolean;
  triggerMsg?: string;
  createdAt: any;
}

export default function NotificationSystem() {
  const [user, setUser] = useState<User | null>(null);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch all alerts
  useEffect(() => {
    if (!user) return;
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

  // Live price polling for active alerts
  useEffect(() => {
    const activeAlerts = alerts.filter(a => a.isActive && !a.isTriggered);
    if (activeAlerts.length === 0) return;

    const symbols = Array.from(new Set(activeAlerts.map(a => a.symbol)));
    
    const fetchAndEvaluate = async () => {
      try {
        const res = await fetch(`/api/finance/quote?symbols=${encodeURIComponent(symbols.join(","))}`);
        if (res.ok) {
          const data = await res.json();
          const priceMap: Record<string, number> = {};
          data.forEach((item: any) => {
            priceMap[item.symbol] = item.price;
          });
          
          let newlyTriggered = false;

          for (const alert of activeAlerts) {
            const currentPrice = priceMap[alert.symbol];
            if (!currentPrice) continue;

            let triggered = false;
            let msg = "";

            switch (alert.condition) {
              case "greater":
                if (currentPrice >= alert.targetValue) {
                  triggered = true;
                  msg = `${alert.symbol} belirlediğiniz ${alert.targetValue} hedefini aştı! (Güncel: ${currentPrice})`;
                }
                break;
              case "less":
                if (currentPrice <= alert.targetValue) {
                  triggered = true;
                  msg = `${alert.symbol} belirlediğiniz ${alert.targetValue} seviyesinin altına indi! (Güncel: ${currentPrice})`;
                }
                break;
              case "percent_up":
                if (alert.basePrice) {
                  const target = alert.basePrice * (1 + (alert.targetValue / 100));
                  if (currentPrice >= target) {
                    triggered = true;
                    msg = `${alert.symbol} %${alert.targetValue} değer kazandı! (Güncel: ${currentPrice})`;
                  }
                }
                break;
              case "percent_down":
                if (alert.basePrice) {
                  const target = alert.basePrice * (1 - (alert.targetValue / 100));
                  if (currentPrice <= target) {
                    triggered = true;
                    msg = `${alert.symbol} %${alert.targetValue} değer kaybetti! (Güncel: ${currentPrice})`;
                  }
                }
                break;
            }

            if (triggered && user) {
              newlyTriggered = true;
              try {
                await updateDoc(doc(db, "users", user.uid, "alerts", alert.id), {
                  isTriggered: true,
                  isActive: false,
                  triggerMsg: msg,
                });
                
                // Push notification (Tarayıcı izni varsa)
                if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                  new Notification("🚨 Korfu Fiyat Alarmı", {
                    body: msg,
                    icon: "/korfu_favicon.svg",
                  });
                }
              } catch (err) {
                console.error("Alarm güncellenemedi", err);
              }
            }
          }
          
          if (newlyTriggered) {
            setHasUnread(true);
          }
        }
      } catch (err) {
        console.error("Fiyatlar güncellenemedi", err);
      }
    };

    fetchAndEvaluate();
    const interval = setInterval(fetchAndEvaluate, 15000);
    return () => clearInterval(interval);
  }, [alerts, user]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  const triggeredAlerts = alerts.filter(a => a.isTriggered).slice(0, 10);

  if (!user) return null;

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative flex items-center justify-center"
        title="Bildirimler"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        
        {hasUnread && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Bildirimler</h3>
            <Link href="/alerts" onClick={() => setIsOpen(false)} className="text-xs text-amber-600 dark:text-amber-500 hover:underline font-medium">
              Alarmları Yönet
            </Link>
          </div>
          
          <div className="max-h-80 overflow-y-auto no-scrollbar">
            {triggeredAlerts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                Henüz tetiklenen bir alarmınız bulunmuyor.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {triggeredAlerts.map(alert => (
                  <div key={alert.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex gap-3">
                      <div className="mt-0.5 shrink-0">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                          {alert.symbol} Alarmı Tetiklendi
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {alert.triggerMsg || `${alert.name} belirlediğiniz hedefe ulaştı.`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
