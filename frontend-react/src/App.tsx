import React from 'react';
import { useGame } from './hooks/useGame';
import ModeSelector from './components/ModeSelector/ModeSelector';
import ErrorBanner from './components/ErrorBanner/ErrorBanner';
import StatusBar from './components/StatusBar/StatusBar';
import Board from './components/Board/Board';
import Controls from './components/Controls/Controls';
import Scoreboard from './components/Scoreboard/Scoreboard';
import MoveHistory from './components/MoveHistory/MoveHistory';
import LoadingOverlay from './components/LoadingOverlay/LoadingOverlay';
import styles from './App.module.css';

const App: React.FC = () => {
  const {
    state,
    loading,
    error,
    selectedMode,
    clearError,
    handleModeChange,
    handleCellClick,
    handleUndo,
    handleResetGame,
    handleResetScoreboard,
    canUndo,
    statusMessage,
    isBoardLocked,
  } = useGame();

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <h1 className={styles.title}>Tic Tac Toe</h1>
        <ModeSelector
          selected={selectedMode}
          onChange={handleModeChange}
          disabled={loading}
        />
      </header>

      {/* ── Error ── */}
      {error && <ErrorBanner message={error} onDismiss={clearError} />}

      {/* ── Game layout ── */}
      {state && (
        <main className={styles.layout}>
          {/* Left — board + controls */}
          <section className={styles.gameSection}>
            <StatusBar message={statusMessage} status={state.status} />
            <Board
              board={state.board}
              winningCells={state.winningCells}
              locked={isBoardLocked}
              onCellClick={handleCellClick}
            />
            <Controls
              canUndo={canUndo}
              loading={loading}
              onUndo={handleUndo}
              onReset={handleResetGame}
              onResetScoreboard={handleResetScoreboard}
            />
          </section>

          {/* Right — scoreboard + history */}
          <aside className={styles.infoSection}>
            <Scoreboard scoreboard={state.scoreboard} />
            <MoveHistory moves={state.moveHistory} />
          </aside>
        </main>
      )}

      {/* ── Loading overlay ── */}
      {loading && <LoadingOverlay />}
    </div>
  );
};

export default App;
