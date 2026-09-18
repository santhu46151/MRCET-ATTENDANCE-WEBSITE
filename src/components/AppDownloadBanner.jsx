import React from 'react';
import { Smartphone, Download, CheckCircle2 } from 'lucide-react';

const AppDownloadBanner = () => {
  // Check if running inside native Capacitor Android app
  const isNative = typeof window !== 'undefined' && 
    window.Capacitor && 
    (window.Capacitor.isNativePlatform?.() || window.Capacitor.platform !== 'web');

  if (isNative) return null;

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '0.9rem 1.25rem', 
        marginBottom: '1.25rem', 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(16, 185, 129, 0.08))',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div 
          style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '10px', 
            background: 'var(--primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}
        >
          <Smartphone size={22} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Get the MRCET Attendance Android App
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Install the native Android APK for fast offline-first attendance marking.
          </div>
        </div>
      </div>

      <a
        href="/downloads/MRCET-Attendance.apk"
        download="MRCET-Attendance.apk"
        className="btn btn-primary btn-sm"
        style={{ textDecoration: 'none', padding: '0.45rem 0.95rem' }}
      >
        <Download size={15} />
        <span>Download APK (Android)</span>
      </a>
    </div>
  );
};

export default AppDownloadBanner;
