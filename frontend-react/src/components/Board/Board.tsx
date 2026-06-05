import React from 'react';
import Cell from '../Cell/Cell';
import styles from './Board.module.css';

interface Props {
  board: string[][];
  winningCells: number[] | null;
  locked: boolean;
  onCellClick: (idx: number) => void;
}

const Board: React.FC<Props> = ({ board, winningCells, locked, onCellClick }) => {
  const flat = board.flat();

  return (
    <div className={`${styles.board} ${locked ? styles.locked : ''}`}>
      {flat.map((cell, idx) => (
        <Cell
          key={idx}
          index={idx}
          value={cell}
          isWinning={winningCells?.includes(idx) ?? false}
          disabled={locked}
          onClick={() => onCellClick(idx)}
        />
      ))}
    </div>
  );
};

export default Board;
