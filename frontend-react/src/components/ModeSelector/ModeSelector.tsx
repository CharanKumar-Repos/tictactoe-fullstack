import React from 'react';
import { GameMode } from '../../types/game.types';
import styles from './ModeSelector.module.css';

interface Props {
  selected: GameMode;
  onChange: (mode: GameMode) => void;
  disabled: boolean;
}

const MODES: { value: GameMode; label: string }[] = [
  { value: 'TwoPlayer', label: '👥 Two Player' },
  { value: 'VsComputer', label: '🤖 vs Computer' },
];

const ModeSelector: React.FC<Props> = ({ selected, onChange, disabled }) => (
  <div className={styles.container}>
    <span className={styles.label}>Mode:</span>
    {MODES.map(({ value, label }) => (
      <button
        key={value}
        className={`${styles.btn} ${selected === value ? styles.active : ''}`}
        onClick={() => onChange(value)}
        disabled={disabled}
        aria-pressed={selected === value}
      >
        {label}
      </button>
    ))}
  </div>
);

export default ModeSelector;
