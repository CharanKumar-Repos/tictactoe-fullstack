import React from 'react';
import { GameStatus } from '../../types/game.types';
import styles from './StatusBar.module.css';

interface Props {
  message: string;
  status: GameStatus | string;
}

const StatusBar: React.FC<Props> = ({ message, status }) => {
  const className = [
    styles.bar,
    status === 'Won' ? styles.won : '',
    status === 'Draw' ? styles.draw : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} role="status" aria-live="polite">
      {message}
    </div>
  );
};

export default StatusBar;
