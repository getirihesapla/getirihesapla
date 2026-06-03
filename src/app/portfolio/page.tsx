"use client";

import React, { useState, useEffect, useRef } from "react";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

ChartJS.register(ArcElement, ChartTooltip, Legend);

interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: string;
  amount: number;
  avgPrice: number;
  currentPrice: number; // Stored initially, overwritten by live
  currency: string;
  createdAt: any;
}

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  type: string;
}

interface Transaction {
  id: string;
  type: "buy" | "sell";
  symbol: string;
  name: string;
  amount: number;
  price: number;
  date: any;
}

interface LivePriceData {
  price: number;
  change: number;
  changePercent: number;
}

const USD_TRY_RATE = 32.50; // Mock base rate, can be fetched live if needed

export default function PortfolioPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  
  const [activeTab, setActiveTab] = useState<"portfolio" | "watchlist" | "history">("portfolio");
  
  const [portfolio, setPortfolio] = useState<Asset[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [livePrices, setLivePrices] = useState<Record<string, LivePriceData>>({});
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalType, setModalType] = useState<"asset" | "watchlist">("asset");

  // Form State
  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    type: "Hisse (BIST)",
    amount: "",
    avgPrice: "",
    currentPrice: "",
    currency: "TRY"
  });

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Live Prices
  const fetchLivePrices = async (symbols: string[]) => {
    if (symbols.length === 0) return;
    try {
      const res = await fetch(`/api/finance/quote?symbols=${encodeURIComponent(symbols.join(","))}`);
      if (res.ok) {
        const data = await res.json();
        const priceMap: Record<string, LivePriceData> = {};
        data.forEach((item: any) => {
          priceMap[item.symbol] = {
            price: item.price,
            change: item.change,
            changePercent: item.changePercent
          };
        });
        setLivePrices(prev => ({ ...prev, ...priceMap }));
      }
    } catch (err) {
      console.error("Live price fetch error", err);
    }
  };

  // LocalStorage Fallbacks and Firestore Listeners
  useEffect(() => {
    if (!user) {
      setPortfolio([]);
      setWatchlist([]);
      setTransactions([]);
      return;
    }

    // Try LocalStorage first
    const cachedPortfolio = localStorage.getItem(`portfolio_${user.uid}`);
    if (cachedPortfolio) setPortfolio(JSON.parse(cachedPortfolio));

    // Portfolio Listener
    const qPort = query(collection(db, "users", user.uid, "portfolio"), orderBy("createdAt", "desc"));
    const unsubPort = onSnapshot(qPort, (snapshot) => {
      const assets: Asset[] = [];
      const symbolsToFetch = new Set<string>();
      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() } as Asset;
        assets.push(data);
        symbolsToFetch.add(data.symbol);
      });
      setPortfolio(assets);
      localStorage.setItem(`portfolio_${user.uid}`, JSON.stringify(assets));
      
      // Fetch live prices for new assets
      fetchLivePrices(Array.from(symbolsToFetch));
    });

    // Watchlist Listener
    const qWatch = query(collection(db, "users", user.uid, "watchlist"));
    const unsubWatch = onSnapshot(qWatch, (snapshot) => {
      const items: WatchlistItem[] = [];
      const symbolsToFetch = new Set<string>();
      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() } as WatchlistItem;
        items.push(data);
        symbolsToFetch.add(data.symbol);
      });
      setWatchlist(items);
      fetchLivePrices(Array.from(symbolsToFetch));
    });

    // Transactions Listener
    const qTrans = query(collection(db, "users", user.uid, "transactions"), orderBy("date", "desc"));
    const unsubTrans = onSnapshot(qTrans, (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      setTransactions(items);
    });

    return () => {
      unsubPort();
      unsubWatch();
      unsubTrans();
    };
  }, [user]);

  // Periodic price updates (every 30 seconds)
  useEffect(() => {
    const symbols = new Set([...portfolio.map(a => a.symbol), ...watchlist.map(w => w.symbol)]);
    const interval = setInterval(() => {
      fetchLivePrices(Array.from(symbols));
    }, 30000);
    return () => clearInterval(interval);
  }, [portfolio, watchlist]);

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
    
    let type = "Hisse (Global)";
    if (item.exchange === "IST") type = "Hisse (BIST)";
    if (item.typeDisp === "Cryptocurrency") type = "Kripto";
    if (item.typeDisp === "ETF" || item.typeDisp === "Mutual Fund") type = "Fon";
    if (item.typeDisp === "Currency") type = "Döviz/Altın";
    
    setFormData(prev => ({ ...prev, symbol: item.symbol, name: item.shortname || item.longname || item.symbol, type }));
    
    try {
      const res = await fetch(`/api/finance/quote?symbol=${encodeURIComponent(item.symbol)}`);
      if (res.ok) {
        const data = await res.json();
        const price = data[0]?.price || data.price;
        const currency = data[0]?.currency || data.currency || "USD";
        setFormData(prev => ({
          ...prev,
          currentPrice: price?.toString() || "",
          currency: currency === "TRY" ? "TRY" : "USD"
        }));
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
      
      if (modalType === "asset") {
        await addDoc(collection(db, "users", user.uid, "portfolio"), {
          symbol: formData.symbol.toUpperCase(),
          name: formData.name,
          type: formData.type,
          amount: Number(formData.amount),
          avgPrice: Number(formData.avgPrice),
          currentPrice: Number(formData.currentPrice),
          currency: formData.currency,
          createdAt: serverTimestamp()
        });
        
        // Add transaction record
        await addDoc(collection(db, "users", user.uid, "transactions"), {
          type: "buy",
          symbol: formData.symbol.toUpperCase(),
          name: formData.name,
          amount: Number(formData.amount),
          price: Number(formData.avgPrice),
          date: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, "users", user.uid, "watchlist"), {
          symbol: formData.symbol.toUpperCase(),
          name: formData.name,
          type: formData.type,
        });
      }
      
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Varlık eklenirken hata oluştu:", error);
      alert("Bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAsset = async (id: string, collectionName: string) => {
    if (!user) return;
    const confirmDelete = window.confirm("Bunu silmek istediğinize emin misiniz?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, collectionName, id));
    } catch (error) {
      console.error("Silinirken hata oluştu:", error);
    }
  };

  const resetForm = () => {
    setFormData({ symbol: "", name: "", type: "Hisse (BIST)", amount: "", avgPrice: "", currentPrice: "", currency: "TRY" });
    setSearchQuery("");
  };

  const generatePDF = async () => {
    setIsExporting(true);

    try {
      const reportContainer = document.createElement("div");
      // Place it fixed at 0,0 but with negative z-index so it hides behind the current page
      // This prevents the browser from skipping rendering (which happens with left: -9999px)
      reportContainer.style.position = "fixed";
      reportContainer.style.top = "0";
      reportContainer.style.left = "0";
      reportContainer.style.width = "800px";
      reportContainer.style.zIndex = "-99999";
      reportContainer.style.pointerEvents = "none";
      reportContainer.style.backgroundColor = "#0b1121"; // Slate 950
      reportContainer.style.color = "#f8fafc";
      reportContainer.style.padding = "40px";
      reportContainer.style.fontFamily = "sans-serif";
      
      const chartCanvas = document.querySelector("#portfolio-doughnut-container canvas") as HTMLCanvasElement;
      const chartImgSrc = chartCanvas ? chartCanvas.toDataURL("image/png") : "";

      const tableRows = portfolio.map(asset => {
        const data = getPriceData(asset);
        const isDailyPos = data.changePct >= 0;
        const value = asset.amount * data.price;
        const cost = asset.amount * asset.avgPrice;
        const profit = value - cost;
        
        return `
          <tr style="border-bottom: 1px solid #1e293b;">
            <td style="padding: 12px 8px; font-weight: bold;">${asset.symbol}</td>
            <td style="padding: 12px 8px; text-align: right;">${formatCurrency(data.price, asset.currency)}</td>
            <td style="padding: 12px 8px; text-align: right; color: ${isDailyPos ? '#10b981' : '#ef4444'}">${isDailyPos ? '+' : ''}${data.changePct.toFixed(2)}%</td>
            <td style="padding: 12px 8px; text-align: right;">${formatCurrency(asset.avgPrice, asset.currency)}</td>
            <td style="padding: 12px 8px; text-align: right;">${asset.amount}</td>
            <td style="padding: 12px 8px; text-align: right; font-weight: bold;">${formatCurrency(value, asset.currency)}</td>
            <td style="padding: 12px 8px; text-align: right; color: ${profit >= 0 ? '#10b981' : '#ef4444'}">${formatCurrency(profit, asset.currency)}</td>
          </tr>
        `;
      }).join("");

      reportContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #334155; padding-bottom: 20px;">
          <h1 style="font-size: 32px; margin: 0; color: #fbbf24;">KorfuFinance Premium Portföy Raporu</h1>
          <p style="color: #94a3b8; margin-top: 10px; font-size: 14px;">Oluşturma Tarihi: ${new Date().toLocaleString("tr-TR")}</p>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 40px; background-color: #0f172a; padding: 20px; border-radius: 12px; border: 1px solid #1e293b;">
          <div>
            <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Toplam Bakiye</div>
            <div style="font-size: 28px; font-weight: bold; color: #fff;">${formatCurrency(metrics.totalTRY, "TRY")}</div>
          </div>
          <div>
            <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Net Kâr / Zarar</div>
            <div style="font-size: 24px; font-weight: bold; color: ${metrics.totalProfitTRY >= 0 ? '#10b981' : '#ef4444'};">
              ${formatCurrency(metrics.totalProfitTRY, "TRY")}
            </div>
          </div>
          <div>
            <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Getiri (ROI)</div>
            <div style="font-size: 24px; font-weight: bold; color: ${metrics.profitPercentage >= 0 ? '#10b981' : '#ef4444'};">
              ${metrics.profitPercentage.toFixed(2)}%
            </div>
          </div>
        </div>

        <h2 style="font-size: 20px; color: #f8fafc; border-bottom: 1px solid #1e293b; padding-bottom: 10px; margin-bottom: 20px;">Varlık Listesi ve Performans</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 40px;">
          <thead>
            <tr style="border-bottom: 2px solid #334155; color: #94a3b8; text-transform: uppercase; font-size: 12px;">
              <th style="padding: 12px 8px; text-align: left;">Varlık</th>
              <th style="padding: 12px 8px; text-align: right;">Fiyat</th>
              <th style="padding: 12px 8px; text-align: right;">24S Değişim</th>
              <th style="padding: 12px 8px; text-align: right;">Maliyet</th>
              <th style="padding: 12px 8px; text-align: right;">Miktar</th>
              <th style="padding: 12px 8px; text-align: right;">Toplam Değer</th>
              <th style="padding: 12px 8px; text-align: right;">Kâr/Zarar</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || `<tr><td colspan="7" style="text-align: center; padding: 20px;">Veri bulunamadı.</td></tr>`}
          </tbody>
        </table>

        ${chartImgSrc ? `
          <div style="page-break-inside: avoid;">
            <h2 style="font-size: 20px; color: #f8fafc; border-bottom: 1px solid #1e293b; padding-bottom: 10px; margin-bottom: 20px;">Varlık Dağılım Grafiği</h2>
            <div style="text-align: center; background-color: #0f172a; padding: 30px; border-radius: 12px; border: 1px solid #1e293b;">
              <img src="${chartImgSrc}" style="max-height: 350px; max-width: 100%;" />
            </div>
          </div>
        ` : ''}
      `;

      document.body.appendChild(reportContainer);

      // Force browser to layout and paint before capturing (especially important for images)
      await new Promise(resolve => setTimeout(resolve, 500));

      const imgData = await toPng(reportContainer, { 
        backgroundColor: "#0b1121",
        pixelRatio: 2,
      });
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 190; // margin 10mm each side
      const pageHeight = 297;
      const imgHeight = (reportContainer.offsetHeight * pdfWidth) / reportContainer.offsetWidth;
      
      let heightLeft = imgHeight;
      let position = 10;
      
      pdf.addImage(imgData, "PNG", 10, position, pdfWidth, imgHeight);
      heightLeft -= (pageHeight - position);
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save("KorfuFinance_Premium_Portfoy.pdf");
      document.body.removeChild(reportContainer);
    } catch (error) {
      console.error("PDF oluşturulurken hata:", error);
      alert("PDF oluşturulamadı: " + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const getPriceData = (asset: Asset) => {
    const live = livePrices[asset.symbol];
    return {
      price: live?.price || asset.currentPrice,
      change: live?.change || 0,
      changePct: live?.changePercent || 0
    };
  };

  const calculateMetrics = () => {
    let totalTRY = 0;
    let totalCostTRY = 0;
    let dailyChangeTRY = 0;

    portfolio.forEach(asset => {
      const data = getPriceData(asset);
      const value = asset.amount * data.price;
      const cost = asset.amount * asset.avgPrice;
      const dailyImpact = asset.amount * data.change;

      const rate = asset.currency === "USD" ? USD_TRY_RATE : 1;
      
      totalTRY += value * rate;
      totalCostTRY += cost * rate;
      dailyChangeTRY += dailyImpact * rate;
    });

    const totalProfitTRY = totalTRY - totalCostTRY;
    const profitPercentage = totalCostTRY > 0 ? (totalProfitTRY / totalCostTRY) * 100 : 0;

    return { totalTRY, totalCostTRY, totalProfitTRY, profitPercentage, dailyChangeTRY };
  };

  const metrics = calculateMetrics();

  const chartData = {
    labels: portfolio.map(a => a.symbol),
    datasets: [
      {
        data: portfolio.map(asset => {
          const data = getPriceData(asset);
          const value = asset.amount * data.price;
          return asset.currency === "USD" ? value * USD_TRY_RATE : value;
        }),
        backgroundColor: [
          '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
          '#ef4444', '#ec4899', '#0ea5e9'
        ],
        borderColor: '#0f172a',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' as const, labels: { color: '#cbd5e1', font: { family: 'Inter', size: 12 } } },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(51, 65, 85, 0.5)',
        borderWidth: 1,
      }
    },
    cutout: '70%',
  };

  const formatCurrency = (val: number, currency = "TRY") => {
    const safeCurrency = (currency && currency.length === 3) ? currency : "TRY";
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: safeCurrency, maximumFractionDigits: 2 }).format(val);
  };

  // Sparkline mockup (SVG line)
  const Sparkline = ({ isPositive }: { isPositive: boolean }) => (
    <svg className="w-16 h-8" viewBox="0 0 100 30" preserveAspectRatio="none">
      <path
        d={isPositive ? "M0,25 Q25,20 50,15 T100,5" : "M0,5 Q25,10 50,20 T100,25"}
        fill="none"
        stroke={isPositive ? "#10b981" : "#ef4444"}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d={isPositive ? "M0,25 Q25,20 50,15 T100,5 L100,30 L0,30 Z" : "M0,5 Q25,10 50,20 T100,25 L100,30 L0,30 Z"}
        fill={isPositive ? "url(#gradPos)" : "url(#gradNeg)"}
        opacity="0.2"
      />
      <defs>
        <linearGradient id="gradPos" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
        <linearGradient id="gradNeg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  );

  if (loadingAuth) {
    return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-amber-500">Terminal Başlatılıyor...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 shadow-2xl">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">Giriş Gerekli</h2>
          <p className="text-slate-400 mb-8">
            Gerçek zamanlı portföy takibi, analiz ve raporlama için sisteme giriş yapın.
          </p>
          <p className="text-sm font-semibold text-amber-500">Üst menüden hesabınıza bağlanabilirsiniz.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0b1121] min-h-screen text-slate-200 font-sans pb-20">
      <div className="container mx-auto px-4 md:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
              <span className="w-2 h-8 bg-amber-500 rounded-full inline-block"></span>
              Yatırım Terminali
            </h1>
            <p className="text-slate-400 mt-1 ml-5 text-sm">Canlı piyasa verileri ile senkronize portföy yönetimi</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={generatePDF}
              disabled={isExporting || portfolio.length === 0}
              className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white text-sm font-medium py-2 px-5 rounded-lg transition-colors flex items-center gap-2"
            >
              {isExporting ? (
                <span className="animate-pulse">Hazırlanıyor...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  Rapor Çıkart
                </>
              )}
            </button>
            <button 
              onClick={() => { setModalType("asset"); setIsModalOpen(true); }}
              className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium py-2 px-5 rounded-lg shadow-[0_0_15px_rgba(217,119,6,0.3)] transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Varlık Ekle
            </button>
            <button 
              onClick={() => { setModalType("watchlist"); setIsModalOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 px-5 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              İzlemeye Al
            </button>
          </div>
        </div>

        {/* Top Widgets / Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Toplam Bakiye</p>
            <h3 className="text-3xl font-bold text-white">{formatCurrency(metrics.totalTRY)}</h3>
            <p className="text-slate-500 text-xs mt-2 font-medium">Güncel kur ve fiyatlar baz alınmıştır.</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Günlük P&L</p>
            <h3 className={`text-3xl font-bold ${metrics.dailyChangeTRY >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {metrics.dailyChangeTRY >= 0 ? '+' : ''}{formatCurrency(metrics.dailyChangeTRY)}
            </h3>
            <p className="text-slate-500 text-xs mt-2 font-medium">Son 24 saatlik değişim.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Net Kâr / Zarar</p>
            <h3 className={`text-3xl font-bold ${metrics.totalProfitTRY >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {metrics.totalProfitTRY >= 0 ? '+' : ''}{formatCurrency(metrics.totalProfitTRY)}
            </h3>
            <p className="text-slate-500 text-xs mt-2 font-medium">Tüm zamanların getirisi.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Getiri (ROI)</p>
            <h3 className={`text-3xl font-bold ${metrics.profitPercentage >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {metrics.profitPercentage >= 0 ? '+' : ''}{metrics.profitPercentage.toFixed(2)}%
            </h3>
            <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${metrics.profitPercentage >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                style={{ width: `${Math.min(Math.abs(metrics.profitPercentage), 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 mb-6 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab("portfolio")} 
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === "portfolio" ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Açık Pozisyonlar
          </button>
          <button 
            onClick={() => setActiveTab("watchlist")} 
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === "watchlist" ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            İzleme Listesi (Watchlist)
          </button>
          <button 
            onClick={() => setActiveTab("history")} 
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === "history" ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            İşlem Geçmişi
          </button>
        </div>

        {/* Tab Content: Portfolio */}
        <div ref={pdfRef} className={activeTab === "portfolio" ? "block bg-[#0b1121]" : "hidden"}>
          <div className="flex flex-col lg:flex-row gap-5">
            
            {/* Chart */}
            <div className="w-full lg:w-[22%] shrink-0 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col">
              <h3 className="text-white font-bold mb-4 flex items-center justify-between">
                <span>Varlık Dağılımı</span>
                <span className="text-xs font-normal text-slate-400">{portfolio.length} Kalem</span>
              </h3>
              {portfolio.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">Veri Yok</div>
              ) : (
                <div className="flex-1 min-h-[250px] relative" id="portfolio-doughnut-container">
                  <Doughnut data={chartData} options={chartOptions} />
                </div>
              )}
            </div>

            {/* Table */}
            <div className="w-full lg:w-[78%] bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden flex flex-col min-w-0">
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-800/50 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-2 lg:px-3 py-3 font-semibold uppercase tracking-wider text-[10px] md:text-xs">Varlık</th>
                      <th className="px-2 lg:px-3 py-3 font-semibold uppercase tracking-wider text-[10px] md:text-xs text-right">Fiyat</th>
                      <th className="px-2 lg:px-3 py-3 font-semibold uppercase tracking-wider text-[10px] md:text-xs text-right">24S Değişim</th>
                      <th className="px-2 lg:px-3 py-3 font-semibold uppercase tracking-wider text-[10px] md:text-xs text-right">Ort. Maliyet</th>
                      <th className="px-2 lg:px-3 py-3 font-semibold uppercase tracking-wider text-[10px] md:text-xs text-right">Miktar</th>
                      <th className="px-2 lg:px-3 py-3 font-semibold uppercase tracking-wider text-[10px] md:text-xs text-right">Toplam Değer</th>
                      <th className="px-2 lg:px-3 py-3 font-semibold uppercase tracking-wider text-[10px] md:text-xs text-right">Kâr/Zarar</th>
                      <th className="px-2 lg:px-3 py-3 font-semibold uppercase tracking-wider text-[10px] md:text-xs text-center">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {portfolio.length === 0 ? (
                      <tr><td colSpan={8} className="px-3 py-10 text-center text-slate-500">Açık pozisyon bulunmuyor.</td></tr>
                    ) : (
                      portfolio.map(asset => {
                        const data = getPriceData(asset);
                        const isDailyPos = data.changePct >= 0;
                        
                        const profit = (data.price - asset.avgPrice) * asset.amount;
                        const profitPct = ((data.price - asset.avgPrice) / asset.avgPrice) * 100;
                        const isProfit = profit >= 0;

                        return (
                          <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors group">
                            <td className="px-2 lg:px-3 py-3">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleDeleteAsset(asset.id, "portfolio")}
                                  className="text-slate-500 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                                  title="Varlığı Sil"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                                <div className={`w-2 h-2 rounded-full ${isProfit ? 'bg-emerald-500' : 'bg-red-500'} shadow-[0_0_8px_currentColor] shrink-0`}></div>
                                <div className="min-w-0">
                                  <div className="font-bold text-white tracking-wide text-xs md:text-sm truncate">{asset.symbol}</div>
                                  <div className="text-[10px] text-slate-500 truncate hidden sm:block">{asset.name}</div>
                                </div>
                                <span className="ml-1 text-[9px] md:text-[10px] px-1.5 py-0.5 rounded border border-slate-700 text-slate-400 bg-slate-800/50 whitespace-nowrap">
                                  {asset.type}
                                </span>
                              </div>
                            </td>
                            <td className="px-2 lg:px-3 py-3 text-right font-mono text-slate-200 text-xs md:text-sm">
                              {formatCurrency(data.price, asset.currency)}
                            </td>
                            <td className="px-2 lg:px-3 py-3 text-right text-xs md:text-sm">
                              <div className={`font-medium ${isDailyPos ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isDailyPos ? '+' : ''}{data.changePct.toFixed(2)}%
                              </div>
                            </td>
                            <td className="px-2 lg:px-3 py-3 text-right font-mono text-slate-400 text-xs md:text-sm">
                              {formatCurrency(asset.avgPrice, asset.currency)}
                            </td>
                            <td className="px-2 lg:px-3 py-3 text-right font-mono text-slate-200 text-xs md:text-sm">
                              {asset.amount}
                            </td>
                            <td className="px-2 lg:px-3 py-3 text-right font-mono font-bold text-white text-xs md:text-sm">
                              {formatCurrency(asset.amount * data.price, asset.currency)}
                            </td>
                            <td className="px-2 lg:px-3 py-3 text-right">
                              <div className={`font-bold font-mono text-xs md:text-sm ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isProfit ? '+' : ''}{formatCurrency(profit, asset.currency)}
                              </div>
                              <div className={`text-[10px] md:text-xs ${isProfit ? 'text-emerald-500/70' : 'text-red-500/70'}`}>
                                {isProfit ? '▲' : '▼'} {profitPct.toFixed(2)}%
                              </div>
                            </td>
                            <td className="px-2 lg:px-3 py-3 flex justify-center">
                              <Sparkline isPositive={isDailyPos} />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content: Watchlist */}
        <div className={activeTab === "watchlist" ? "block" : "hidden"}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <h2 className="text-lg font-bold text-white">Takip Edilen Varlıklar</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/50 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Varlık</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Tür</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs text-right">Son Fiyat</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs text-right">Günlük Değişim</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs text-center">Aksiyon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {watchlist.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">İzleme listeniz boş.</td></tr>
                  ) : (
                    watchlist.map(item => {
                      const live = livePrices[item.symbol];
                      const isPos = live?.changePercent >= 0;
                      return (
                        <tr key={item.id} className="hover:bg-slate-800/30">
                          <td className="px-5 py-4 font-bold text-white">
                            {item.symbol} <span className="text-xs font-normal text-slate-500 block">{item.name}</span>
                          </td>
                          <td className="px-5 py-4 text-slate-400">{item.type}</td>
                          <td className="px-5 py-4 text-right font-mono text-slate-200">
                            {live ? live.price.toFixed(2) : "Yükleniyor..."}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${isPos ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                              {live ? (isPos ? '+' : '') + live.changePercent.toFixed(2) + '%' : "-"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button onClick={() => handleDeleteAsset(item.id, "watchlist")} className="text-slate-500 hover:text-red-400">Kaldır</button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Tab Content: History */}
        <div className={activeTab === "history" ? "block" : "hidden"}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
             <div className="p-5 border-b border-slate-800 bg-slate-800/30">
              <h2 className="text-lg font-bold text-white">İşlem Geçmişi</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/50 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Tarih</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">İşlem</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Varlık</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs text-right">Miktar</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs text-right">Fiyat</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs text-right">Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {transactions.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500">Geçmiş işlem bulunamadı.</td></tr>
                  ) : (
                    transactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-800/30">
                        <td className="px-5 py-4 text-slate-400">
                          {t.date?.toDate ? t.date.toDate().toLocaleDateString('tr-TR') : "Yeni"}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {t.type === 'buy' ? 'ALIŞ' : 'SATIŞ'}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-white">{t.symbol}</td>
                        <td className="px-5 py-4 text-right font-mono text-slate-200">{t.amount}</td>
                        <td className="px-5 py-4 text-right font-mono text-slate-200">{t.price}</td>
                        <td className="px-5 py-4 text-right font-mono font-bold text-white">{formatCurrency(t.amount * t.price, "")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Universal Modal for Asset / Watchlist Add */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#0b1121]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl overflow-hidden transform transition-all">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                <h3 className="text-xl font-bold text-white">
                  {modalType === "asset" ? "Pozisyon Ekle" : "İzlemeye Al"}
                </h3>
                <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-slate-400 hover:text-white transition-colors">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
                
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sembol veya Şirket Ara</label>
                  <div className="relative">
                    <input 
                      value={searchQuery} 
                      onChange={handleSearchChange} 
                      placeholder="Örn: AAPL, THYAO.IS, BTC-USD..."
                      onFocus={() => { if(searchQuery.length >= 2) setShowDropdown(true); }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" 
                    />
                    <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                  
                  {/* Custom Dropdown */}
                  {showDropdown && (
                    <div className="absolute z-[100] w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-56 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 text-sm text-slate-400 text-center animate-pulse">Piyasalar taranıyor...</div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((res, i) => (
                          <div 
                            key={i} 
                            onClick={() => handleSelectSymbol(res)}
                            className="p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0 transition-colors"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-amber-400">{res.symbol}</span>
                              <span className="text-[10px] px-2 py-0.5 bg-slate-900 rounded-full text-slate-300">{res.typeDisp}</span>
                            </div>
                            <div className="text-xs text-slate-400 truncate">{res.shortname || res.longname}</div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-sm text-slate-400 text-center">Eşleşen varlık bulunamadı.</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tür</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500">
                      <option value="Hisse (BIST)">Hisse (BIST)</option>
                      <option value="Hisse (ABD)">Hisse (ABD)</option>
                      <option value="Fon">Yatırım Fonu / ETF</option>
                      <option value="Kripto">Kripto Para</option>
                      <option value="Döviz/Altın">Döviz & Altın</option>
                      <option value="Emtia">Emtia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Para Birimi</label>
                    <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500">
                      <option value="TRY">TRY (₺)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>

                {modalType === "asset" && (
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Miktar</label>
                      <input required type="number" step="any" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white font-mono focus:outline-none focus:border-amber-500" placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ort. Maliyet</label>
                      <input required type="number" step="any" value={formData.avgPrice} onChange={e => setFormData({...formData, avgPrice: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white font-mono focus:outline-none focus:border-amber-500" placeholder="0.00" />
                    </div>
                  </div>
                )}

                <button disabled={submitting || !formData.symbol} type="submit" className="w-full mt-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-600/20 transition-all">
                  {submitting ? "İşleniyor..." : "Kaydet ve Onayla"}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
