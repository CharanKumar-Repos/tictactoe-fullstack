import React from 'react';
import styles from './Controls.module.css';

interface Props {
  canUndo: boolean;
  loading: boolean;
  onUndo: () => void;
  onReset: () => void;
  onResetScoreboard: () => void;
}

const Controls: React.FC<Props> = ({
  canUndo,
  loading,
  onUndo,
  onReset,
  onResetScoreboard,
}) => (
  <div className={styles.controls}>
    <button
      className={`${styles.btn} ${styles.secondary}`}
      onClick={onUndo}
      disabled={!canUndo || loading}
      title="Undo last move"
    >
      ↩ Undo
    </button>
    <button
      className={`${styles.btn} ${styles.primary}`}
      onClick={onReset}
      disabled={loading}
      title="Reset the board"
    >
      🔄 Reset Game
    </button>
    <button
      className={`${styles.btn} ${styles.danger}`}
      onClick={onResetScoreboard}
      disabled={loading}
      title="Reset scoreboard to zero"
    >
      🗑 Reset Scores
    </button>
  </div>
);

export default Controls;
