import { Component, OnInit } from '@angular/core';
import { GameService } from './services/game.service';
import { GameState, GameMode } from './models/game.models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  state: GameState | null = null;
  loading = false;
  error: string | null = null;
  selectedMode: GameMode = 'TwoPlayer';

  constructor(private gameSvc: GameService) {}

  ngOnInit(): void {
    this.createGame();
  }

  get boardFlat(): string[] {
    if (!this.state) return Array(9).fill('');
    return this.state.board.flat();
  }

  isWinningCell(idx: number): boolean {
    return this.state?.winningCells?.includes(idx) ?? false;
  }

  isBoardLocked(): boolean {
    return !this.state || this.state.status !== 'InProgress' || this.loading;
  }

  canUndo(): boolean {
    return !!this.state && this.state.moveHistory.length > 0 && !this.loading;
  }

  createGame(): void {
    this.error = null;
    this.loading = true;
    this.gameSvc.createGame(this.selectedMode).subscribe({
      next: (s) => { this.state = s; this.loading = false; },
      error: (e) => { this.error = e.message; this.loading = false; },
    });
  }

  onCellClick(idx: number): void {
    if (!this.state || this.isBoardLocked()) return;
    const row = Math.floor(idx / 3);
    const col = idx % 3;

    if (this.state.board[row][col] !== '') return;

    this.loading = true;
    this.error = null;
    this.gameSvc.makeMove(this.state.id, this.state.currentPlayer as any, row, col).subscribe({
      next: (s) => { this.state = s; this.loading = false; },
      error: (e) => { this.error = e.error?.error ?? e.message; this.loading = false; },
    });
  }

  undoMove(): void {
    if (!this.state) return;
    this.loading = true;
    this.gameSvc.undoMove(this.state.id).subscribe({
      next: (s) => { this.state = s; this.loading = false; },
      error: (e) => { this.error = e.error?.error ?? e.message; this.loading = false; },
    });
  }

  resetGame(): void {
    if (!this.state) return;
    this.loading = true;
    this.gameSvc.resetGame(this.state.id).subscribe({
      next: (s) => { this.state = s; this.loading = false; },
      error: (e) => { this.error = e.error?.error ?? e.message; this.loading = false; },
    });
  }

  resetScoreboard(): void {
    this.loading = true;
    this.gameSvc.resetScoreboard().subscribe({
      next: (sb) => {
        if (this.state) this.state = { ...this.state!, scoreboard: sb };
        this.loading = false;
      },
      error: (e) => { this.error = e.message; this.loading = false; },
    });
  }

  onModeChange(mode: GameMode): void {
    this.selectedMode = mode;
    this.createGame();
  }

  get statusMessage(): string {
    if (!this.state) return '';
    if (this.state.status === 'Won') return `🎉 Player ${this.state.winner} wins!`;
    if (this.state.status === 'Draw') return "It's a draw! 🤝";
    const turn = this.state.currentPlayer;
    const isComputer =
      this.state.mode === 'VsComputer' && turn === 'O';
    return isComputer ? '🤖 Computer is thinking…' : `Player ${turn}'s turn`;
  }
}
