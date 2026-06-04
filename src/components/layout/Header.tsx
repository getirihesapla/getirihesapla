"use client";

import React, { useEffect, useState } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import { useMobileMenu } from "@/context/MobileMenuContext";
import NotificationSystem from "./NotificationSystem";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const { setIsOpen } = useMobileMenu();

  useEffect(() => {
    // Check initial dark mode state
    if (document.documentElement.classList.contains("dark")) {
      setIsDark(true);
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists() && userSnap.data().isPremium === true) {
            setIsPremium(true);
          } else {
            setIsPremium(false);
          }
        } catch (err) {
          console.error("Premium kontrol hatası:", err);
          setIsPremium(false);
        }
      } else {
        setIsPremium(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Giriş hatası:", error);
      alert("Giriş yapılırken bir hata oluştu: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  const toggleDarkMode = () => {
    const root = document.documentElement;
    const isNowDark = !root.classList.contains("dark");
    if (isNowDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    setIsDark(isNowDark);
    
    // Dispatch a custom event so other components (like Settings) can react to it
    window.dispatchEvent(new Event("themeChanged"));
  };

  const generatePDF = async () => {
    setIsPdfLoading(true);
    try {
      const container = document.getElementById("pdf-export-area");
      if (!container) throw new Error("Export alanı bulunamadı");
      
      const printHeader = document.createElement("div");
      printHeader.id = "pdf-print-header-temp";
      printHeader.innerHTML = `
        <div style="text-align: center; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid #334155;">
          <h1 style="color: #f8fafc; font-size: 24px; margin: 0; font-family: sans-serif;">KorfuFinance Stratejik Analiz Raporu</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 8px; font-family: sans-serif;">Oluşturma Tarihi: ${new Date().toLocaleString("tr-TR")}</p>
        </div>
      `;
      container.insertBefore(printHeader, container.firstChild);
      
      const docPDF = new jsPDF("p", "mm", "a4");
      
      const imgData = await toPng(container, {
          backgroundColor: document.documentElement.classList.contains("dark") ? "#020617" : "#f1f5f9",
          pixelRatio: 1.5
      });
      
      const imgWidth = 190; 
      const pageHeight = 297;
      const imgHeight = (container.offsetHeight * imgWidth) / container.offsetWidth;
      let heightLeft = imgHeight;
      let position = 40; 
      
      docPDF.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - position);
      
      while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          docPDF.addPage();
          docPDF.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
      }
      
      docPDF.save("Stratejik_Analiz_Raporu.pdf");
    } catch (error) {
      console.error("PDF Hatası:", error);
      alert("PDF oluşturulurken bir hata meydana geldi.");
    } finally {
      const container = document.getElementById("pdf-export-area");
      const headerToRemove = document.getElementById("pdf-print-header-temp");
      if (container && headerToRemove) {
        container.removeChild(headerToRemove);
      }
      setIsPdfLoading(false);
    }
  };
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsOpen(true)}
          className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Menüyü Aç"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div 
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2 md:hidden cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img src="/korfu_favicon.svg" alt="Logo" className="w-8 h-8 object-contain" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            KorfuFinance
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {isPremium && (
          <button 
            onClick={generatePDF}
            disabled={isPdfLoading}
            className="hidden md:flex items-center gap-2 bg-amber-600/10 text-amber-600 dark:text-amber-500 hover:bg-amber-600 hover:text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-70"
          >
            {isPdfLoading ? "Hazırlanıyor..." : "📄 Rapor İndir"}
          </button>
        )}

        <button 
          onClick={toggleDarkMode}
          className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Tema Değiştir"
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

        {!user ? (
          <div className="flex flex-col items-center gap-1">
            <button onClick={handleLogin} className="flex items-center gap-2 text-sm font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="hidden sm:inline">Giriş Yap</span>
            </button>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 max-w-[130px] text-center leading-tight">Google ile giriş yaparak Kullanıcı Sözleşmesi ve KVKK Aydınlatma Metni'ni kabul etmiş olursunuz.</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <NotificationSystem />
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.displayName || user.email?.split('@')[0]}</span>
              <button onClick={handleLogout} className="text-xs text-slate-500 hover:text-red-500 transition-colors">
                Çıkış Yap
              </button>
            </div>
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || '')}&background=0D8ABC&color=fff`} 
              alt="Profil" 
              className="w-9 h-9 rounded-full border-2 border-slate-200 dark:border-slate-700 cursor-pointer object-cover"
              onClick={handleLogout}
              title="Çıkış Yap"
            />
          </div>
        )}
      </div>
    </header>
  );
}
