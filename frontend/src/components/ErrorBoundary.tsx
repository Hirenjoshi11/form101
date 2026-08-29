import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

// App-wide error boundary. Without this, any client-side render exception shows
// Next.js's bare "Application error: a client-side exception has occurred" screen
// with no recovery. A very common trigger in this app is STALE localStorage data
// (e.g. formseva_custom_forms_v6 cached by an older deployment whose shape the
// current code no longer expects), so the recovery action clears that cache.
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || 'Unknown error' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Surface the real error in the console for debugging (visible in dev & prod devtools).
    // eslint-disable-next-line no-console
    console.error('[FormSeva] Caught render error:', error, info);
  }

  private clearCacheAndReload = () => {
    if (typeof window !== 'undefined') {
      try {
        // Remove app-specific cached data that can crash newer render code.
        Object.keys(localStorage)
          .filter((k) => k.startsWith('formseva_'))
          .forEach((k) => localStorage.removeItem(k));
      } catch {
        /* ignore storage access errors */
      }
      window.location.reload();
    }
  };

  private reload = () => {
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDev = process.env.NODE_ENV === 'development';

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          padding: '24px',
          textAlign: 'center',
          background: '#f8fafc',
          color: '#18232D',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: '#fde68a',
            color: '#b45309',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
          }}
          aria-hidden
        >
          ⚠️
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Something went wrong</h1>
        <p style={{ maxWidth: 440, color: '#475569', fontSize: 14, margin: 0 }}>
          The page hit an unexpected error. This is often caused by outdated data saved in your
          browser. Clearing it and reloading usually fixes it.
        </p>
        {this.state.message && (
          <pre
            style={{
              maxWidth: 560,
              overflowX: 'auto',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: 12,
              textAlign: 'left',
            }}
          >
            {this.state.message}
          </pre>
        )}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={this.clearCacheAndReload}
            style={{
              padding: '10px 16px',
              background: '#159447',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
            }}
          >
            Clear cached data &amp; reload
          </button>
          <button
            type="button"
            onClick={this.reload}
            style={{
              padding: '10px 16px',
              background: '#fff',
              color: '#18232D',
              fontSize: 13,
              fontWeight: 700,
              border: '1px solid #cbd5e1',
              borderRadius: 12,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
