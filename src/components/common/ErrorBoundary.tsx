import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Error capturado:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh flex items-center justify-center bg-[#0b0e14] px-4">
          <div className="max-w-sm w-full text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-950/50 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-rose-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">Algo salió mal</h2>
            <p className="text-sm text-slate-400 mb-2">
              Ocurrió un error inesperado en la aplicación.
            </p>
            {this.state.error && (
              <p className="text-xs text-rose-400/80 bg-rose-950/30 border border-rose-500/20 rounded-lg px-3 py-2 mb-4 break-words">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0084FF] hover:bg-[#0072de] text-white text-sm font-semibold transition-colors active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4" />
              Recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
