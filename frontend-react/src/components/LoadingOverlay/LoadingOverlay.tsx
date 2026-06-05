import React from 'react';
import styles from './LoadingOverlay.module.css';

const LoadingOverlay: React.FC = () => (
  <div className={styles.overlay} role="status" aria-label="Loading">
    <div className={styles.spinner} />
  </div>
);

export default LoadingOverlay;
