import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryState {
  error: Error | null;
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  handleReset = () => {
    try {
      window.localStorage.removeItem('ba9i_100_bac_state_v1');
    } catch {
      // Ignore storage errors
    }
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#090617] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-3xl bg-[#110B29] border border-pink-500/40 p-6 space-y-4 text-center">
            <h1 className="text-lg font-extrabold text-white">
              تعذّر تشغيل الجلسة المحفوظة
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              حدث خطأ غير متوقع أثناء قراءة البيانات المحلية. اضغط على الزر أدناه لإعادة تهيئة التطبيق بأمان.
            </p>
            <p
              dir="ltr"
              className="text-[11px] font-mono-num text-rose-300 bg-[#090617] border border-[#2D1F5E] rounded-xl p-2.5 break-words"
            >
              {this.state.error.message}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-l from-cyan-400 to-teal-300 text-slate-950 font-extrabold text-sm"
            >
              إعادة تشغيل التطبيق · Relancer
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
