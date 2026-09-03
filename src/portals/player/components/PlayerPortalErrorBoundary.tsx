import React from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface State {
  hasError: boolean;
}

export class PlayerPortalErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('[PlayerPortalErrorBoundary]', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="cgpt-fatal-state" role="alert">
        <div className="cgpt-fatal-state__icon"><AlertTriangle size={30} /></div>
        <h1>Player portal needs a retry <span lang="ar" dir="rtl">· بوابة اللاعب تحتاج إعادة المحاولة</span></h1>
        <p>One portal surface failed without exposing technical details. <span lang="ar" dir="rtl">تعذر تحميل جزء من البوابة دون كشف تفاصيل تقنية.</span></p>
        <div className="cgpt-fatal-state__actions">
          <button type="button" onClick={() => this.setState({ hasError: false })}><RotateCcw size={15} /> Retry · إعادة المحاولة</button>
          <Link to="/player/home"><Home size={15} /> Home · الرئيسية</Link>
        </div>
      </main>
    );
  }
}
