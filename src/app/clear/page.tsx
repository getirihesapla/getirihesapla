'use client';
import { useEffect } from 'react';

export default function ClearCachePage() {
  useEffect(() => {
    // Tüm önbellekleri ve kalıntıları temizle
    const clearAll = async () => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          for (let name of cacheNames) {
            await caches.delete(name);
          }
        }
        
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (let registration of registrations) {
            await registration.unregister();
          }
        }
        
        // Temizlik bittikten sonra ana sayfaya yönlendir
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } catch (err) {
        console.error('Cache clear error:', err);
        window.location.href = '/';
      }
    };
    
    clearAll();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#0f172a', color: '#fff', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px', color: '#f59e0b' }}>Sistem Temizleniyor...</h1>
      <p style={{ color: '#94a3b8' }}>Tarayıcı önbelleği siliniyor, lütfen bekleyin. Otomatik olarak ana sayfaya yönlendirileceksiniz.</p>
      <div style={{ marginTop: '30px', width: '40px', height: '40px', border: '4px solid rgba(245,158,11,0.3)', borderTop: '4px solid #f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
