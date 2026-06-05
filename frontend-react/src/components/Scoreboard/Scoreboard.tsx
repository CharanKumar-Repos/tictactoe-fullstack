import React from 'react';
import { Scoreboard as ScoreboardType } from '../../types/game.types';
import styles from './Scoreboard.module.css';

interface Props {
  scoreboard: ScoreboardType;
}

const Scoreboard: React.FC<Props> = ({ scoreboard }) => (
  <div className={styles.card}>
    <h2 className={styles.title}>Scoreboard</h2>
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Player</th>
          <th>Wins</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className={styles.playerX}>X</td>
          <td className={styles.score}>{scoreboard.xWins}</td>
        </tr>
        <tr>
          <td className={styles.playerO}>O</td>
          <td className={styles.score}>{scoreboard.oWins}</td>
        </tr>
        <tr className={styles.drawRow}>
          <td>Draws</td>
          <td className={styles.score}>{scoreboard.draws}</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default Scoreboard;
