import React from 'react';
import styles from './Cell.module.css';

interface Props {
  value: string;       // "" | "X" | "O"
  isWinning: boolean;
  disabled: boolean;
  onClick: () => void;
  index: number;
}

const Cell: React.FC<Props> = ({ value, isWinning, disabled, onClick, index }) => {
  const className = [
    styles.cell,
    value === 'X' ? styles.x : '',
    value === 'O' ? styles.o : '',
    isWinning ? styles.winning : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled || value !== ''}
      aria-label={`Cell ${index + 1}: ${value || 'empty'}`}
    >
      {value}
    </button>
  );
};

export default Cell;
