"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import Link from "next/link";

interface Subscription {
  plan: "free" | "premium";
  status: "active" | "canceled" | "past_due";
  currentPeriodEnd: any;
  cancelAtPeriodEnd: boolean;
}

interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  date: any;
  status: string;
  invoiceUrl?: string;
}

export default function PremiumPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  
  const [subscription, setSubscription] = useState<Subscription>({
    plan: "free",
    status: "active",
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false
  });
  
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch User Subscription Role from Firebase
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.subscription) {
             setSubscription(data.subscription);
          }
        }

        // Fetch Payment History
        const q = query(collection(db, "users", currentUser.uid, "payments"), orderBy("date", "desc"));
        onSnapshot(q, (snapshot) => {
          const payments: PaymentHistory[] = [];
          snapshot.forEach(d => {
            payments.push({ id: d.id, ...d.data() } as PaymentHistory);
          });
          setPaymentHistory(payments);
        });

      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpgrade = async (planType: "monthly" | "yearly") => {
    if (!user) {
      alert("Lütfen önce giriş yapın.");
      return;
    }

    try {
      setIsProcessing(true);
      // Mock Payment Gateway Integration (Stripe / Iyzico Checkout Redirection)
      // Gerçek senaryoda burada Stripe Checkout Session veya Iyzico form oluşturulur.
      await new Promise(resolve => setTimeout(resolve, 2000)); 

      // Payment Success Mock
      const amount = planType === "monthly" ? 499 : 4990;
      
      // 1. Update User Role
      const nextMonth = new Date();
      if(planType === "monthly") nextMonth.setMonth(nextMonth.getMonth() + 1);
      else nextMonth.setFullYear(nextMonth.getFullYear() + 1);

      const subData: Subscription = {
        plan: "premium",
        status: "active",
        currentPeriodEnd: nextMonth,
        cancelAtPeriodEnd: false
      };

      await setDoc(doc(db, "users", user.uid), { subscription: subData }, { merge: true });
      setSubscription(subData);

      // 2. Add Payment History
      await addDoc(collection(db, "users", user.uid, "payments"), {
        amount: amount,
        currency: "TRY",
        date: serverTimestamp(),
        status: "succeeded",
        plan: planType
      });

      alert("Tebrikler! Premium hesabınız başarıyla aktifleştirildi.");

    } catch (error) {
      console.error("Ödeme hatası:", error);
      alert("Ödeme işlemi sırasında bir hata oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if(!user || !window.confirm("Aboneliğinizi iptal etmek istediğinize emin misiniz? Premium haklarınızı dönem sonuna kadar kullanmaya devam edebilirsiniz.")) return;
    
    try {
      setIsProcessing(true);
      const subData = { ...subscription, cancelAtPeriodEnd: true };
      await updateDoc(doc(db, "users", user.uid), { subscription: subData });
      setSubscription(subData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-amber-500">Hesap bilgileri kontrol ediliyor...</div>;
  }

  const isPremium = subscription.plan === "premium" && subscription.status === "active";

  return (
    <div className="bg-[#020617] min-h-screen text-slate-200 font-sans pb-20 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-8 pt-16 pb-24 max-w-6xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Yatırımlarınızı <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Profesyonelce</span> Yönetin
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Gelişmiş AI analizleri, profesyonel PDF raporları ve limitsiz fiyat alarmları ile finansal hedeflerinize daha hızlı ulaşın.
          </p>
        </div>

        {/* Pricing Toggle */}
        {!isPremium && (
          <div className="flex justify-center mb-12">
            <div className="bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl inline-flex border border-slate-800">
              <button 
                onClick={() => setBillingCycle("monthly")}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${billingCycle === "monthly" ? "bg-slate-800 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
              >
                Aylık Plan
              </button>
              <button 
                onClick={() => setBillingCycle("yearly")}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === "yearly" ? "bg-slate-800 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
              >
                Yıllık Plan <span className="bg-amber-500/20 text-amber-500 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">2 Ay Hediye</span>
              </button>
            </div>
          </div>
        )}

        {/* Plan Cards */}
        {!isPremium ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
            {/* Free Plan */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-2">Başlangıç</h3>
              <p className="text-slate-400 text-sm mb-6">Finansal okuryazarlık ve temel takip için.</p>
              <div className="text-4xl font-bold text-white mb-8">
                ₺0 <span className="text-lg text-slate-500 font-normal">/ay</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="text-slate-500">✓</span> Limitli Portföy Takibi (5 Varlık)
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="text-slate-500">✓</span> Temel Fiyat Alarmları (3 Adet)
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="text-slate-500">✓</span> Standart Hesaplama Araçları
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-500 line-through">
                  <span>×</span> PDF Rapor Export Sistemi
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-500 line-through">

                </li>
              </ul>
              <button disabled className="w-full py-4 rounded-xl font-bold text-slate-400 bg-slate-800 border border-slate-700 cursor-not-allowed">
                Mevcut Planınız
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-b from-slate-900 to-[#0a0f1d] backdrop-blur-xl border-2 border-amber-500/50 rounded-3xl p-8 flex flex-col relative shadow-[0_0_50px_rgba(245,158,11,0.15)] transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                En Popüler
              </div>
              <h3 className="text-2xl font-bold text-amber-500 mb-2">Korfu Premium</h3>
              <p className="text-slate-400 text-sm mb-6">Profesyonel yatırımcılar ve fon yöneticileri için.</p>
              <div className="text-4xl font-bold text-white mb-2 flex items-baseline gap-2">
                ₺{billingCycle === "monthly" ? "499" : "4.990"} <span className="text-lg text-slate-500 font-normal">/{billingCycle === "monthly" ? "ay" : "yıl"}</span>
              </div>
              <p className="text-xs text-amber-500/80 mb-6 h-4">{billingCycle === "yearly" ? "Aylık 415 ₺'ye denk gelir" : ""}</p>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm text-slate-200">
                  <span className="text-amber-500">✓</span> <b>Limitsiz</b> Portföy ve Varlık Takibi
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-200">
                  <span className="text-amber-500">✓</span> <b>Limitsiz</b> Akıllı Fiyat Alarmları
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-200">
                  <span className="text-amber-500">✓</span> Kapsamlı <b>PDF Rapor</b> Sistemi (Logolu)
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-200">

                </li>
                <li className="flex items-start gap-3 text-sm text-slate-200">
                  <span className="text-amber-500">✓</span> Reklamsız Premium Dashboard
                </li>
              </ul>
              
              {user ? (
                 <button 
                  onClick={() => handleUpgrade(billingCycle)}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-lg shadow-amber-600/25 transition-all transform active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isProcessing ? <span className="animate-pulse">Ödeme İşleniyor (Stripe)...</span> : "Hemen Yükselt"}
                </button>
              ) : (
                <Link href="/login" className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-lg shadow-amber-600/25 transition-all flex justify-center items-center text-center">
                  Devam Etmek İçin Giriş Yapın
                </Link>
              )}
             
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto mb-20 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            {/* Active Subscription Dashboard */}
            <div className="p-8 border-b border-slate-800 bg-gradient-to-r from-amber-500/10 to-transparent relative">
              <div className="absolute top-6 right-6">
                <span className="bg-amber-500/20 text-amber-500 border border-amber-500/30 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span> Korfu Premium Aktif
                </span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-white mb-2">Abonelik Yönetimi</h2>
              <p className="text-slate-400">Tüm premium özelliklere tam erişiminiz bulunmaktadır.</p>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Mevcut Plan</p>
                  <p className="text-xl font-bold text-white">Korfu Premium (Aylık)</p>
                </div>
                <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Yenilenme Tarihi</p>
                  <p className="text-xl font-bold text-white">
                    {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd.toDate ? subscription.currentPeriodEnd.toDate() : subscription.currentPeriodEnd).toLocaleDateString('tr-TR') : "-"}
                  </p>
                  {subscription.cancelAtPeriodEnd && (
                    <p className="text-xs text-red-400 mt-1">Dönem sonunda iptal edilecek.</p>
                  )}
                </div>
              </div>

              {!subscription.cancelAtPeriodEnd && (
                <button 
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                >
                  {isProcessing ? "İşleniyor..." : "Aboneliği İptal Et"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Payment History (Only visible to users) */}
        {user && paymentHistory.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6">Ödeme Geçmişi (Faturalar)</h3>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/50 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Tarih</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Tutar</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Durum</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Fatura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {paymentHistory.map(payment => (
                    <tr key={payment.id} className="hover:bg-slate-800/30">
                      <td className="px-6 py-4 text-slate-300">
                        {payment.date?.toDate ? payment.date.toDate().toLocaleDateString('tr-TR') : "-"}
                      </td>
                      <td className="px-6 py-4 font-mono text-white">₺{payment.amount}</td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-xs font-bold">
                          Başarılı
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-indigo-400 hover:text-indigo-300 transition-colors">PDF İndir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
