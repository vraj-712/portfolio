import { Component, type ErrorInfo, type ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
  /** Shown instead of the default panel. Use to degrade one section quietly. */
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

/** Error boundaries have no hook equivalent — React requires a class.
 *
 *  Without one, a throw anywhere in the tree unmounts the WHOLE app and the
 *  visitor gets a blank page. That is the worst available failure mode for a
 *  portfolio, and it is exactly what happened when a ScrollTrigger pin-spacer
 *  desynced React's view of <main> (see SITE_AUDIT.md). This is the safety net,
 *  not the fix: it converts a blank page into a legible, still-navigable one. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Kept as console.error deliberately: there is no error-reporting service
    // wired up, and swallowing this would make the next regression invisible.
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback !== undefined) return this.props.fallback;

    return (
      <div className={styles.panel} role="alert">
        <p className={styles.label}>Something broke here</p>
        <p className={styles.body}>
          This section failed to render. The rest of the page still works — try reloading.
        </p>
        <button type="button" className={styles.action} onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    );
  }
}
