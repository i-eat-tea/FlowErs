import React, { Component, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      const reload = () => window.location.reload();
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FEFAFB] p-6">
          <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl p-6 text-center border border-[#F0E6E8]">
            <div className="text-3xl mb-3">🌸</div>
            <h2 className="text-lg font-bold text-rose-700 mb-1">Something went wrong</h2>
            <p className="text-sm text-rose-600 mb-4">មានប problemeក្ឲivanje...</p>
            <button onClick={reload} className="px-4 py-2 rounded-full bg-rose-600 text-white text-sm font-medium hover:bg-rose-700">Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
