import React from 'react';
import { MoveRecord } from '../../types/game.types';
import styles from './MoveHistory.module.css';

interface Props {
  moves: MoveRecord[];
}

const MoveHistory: React.FC<Props> = ({ moves }) => (
  <div className={styles.card}>
    <h2 className={styles.title}>Move History</h2>
    <div className={styles.scroll}>
      {moves.length === 0 ? (
        <p className={styles.empty}>No moves yet. Start playing!</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Position</th>
            </tr>
          </thead>
          <tbody>
            {moves.map((move) => (
              <tr
                key={move.moveNumber}
                className={move.moveNumber === moves.length ? styles.lastMove : ''}
              >
                <td>{move.moveNumber}</td>
                <td className={move.player === 'X' ? styles.playerX : styles.playerO}>
                  {move.player}
                </td>
                <td>{move.position}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
);

export default MoveHistory;
