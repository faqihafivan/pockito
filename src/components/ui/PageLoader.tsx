import React from 'react';
import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ 
  message = 'Memuat halaman...', 
  fullScreen = false 
}) => {
  return (
    <div 
      className={`flex items-center justify-center p-6 text-brand-dark ${
        fullScreen ? 'min-h-screen bg-brand-cream' : 'min-h-[50vh]'
      }`}
      role="status"
      aria-label={message}
    >
      <div className="bg-white border-2 border-brand-dark rounded-2xl p-5 shadow-saweria flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-brand-yellow border-2 border-brand-dark shadow-saweria-sm flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-brand-dark animate-spin" />
        </div>
        <div>
          <p className="text-sm font-black text-brand-dark tracking-tight">{message}</p>
          <p className="text-[11px] font-bold text-brand-darkMuted">Pockito Workspace</p>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
