import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by Pockito ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6 text-brand-dark">
          <div className="max-w-md w-full bg-white rounded-3xl border-2 border-brand-dark shadow-saweria p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 border-2 border-brand-dark shadow-saweria-sm flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black text-brand-dark tracking-tight">
                Oops! Terjadi Kendala
              </h1>
              <p className="text-xs sm:text-sm font-bold text-brand-darkMuted leading-relaxed">
                Aplikasi mengalami kendala tak terduga. Tenang, data keuangan dan pengaturan Anda tetap tersimpan aman.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-gray-50 border border-brand-border text-[11px] font-mono text-left text-brand-darkMuted overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={this.handleReload}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Muat Ulang
              </Button>
              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={this.handleGoHome}
                leftIcon={<Home className="w-4 h-4" />}
              >
                Beranda
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
