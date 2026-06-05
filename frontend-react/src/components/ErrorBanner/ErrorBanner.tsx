import React from 'react';
import styles from './ErrorBanner.module.css';

interface Props {
  message: string;
  onDismiss: () => void;
}

const ErrorBanner: React.FC<Props> = ({ message, onDismiss }) => (
  <div className={styles.banner} role="alert">
    <span>⚠️ {message}</span>
    <button className={styles.dismiss} onClick={onDismiss} aria-label="Dismiss error">
      ✕
    </button>
  </div>
);

export default ErrorBanner;
