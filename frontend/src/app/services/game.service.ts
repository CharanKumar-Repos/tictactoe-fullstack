import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { GameMode, GameState, Player, Scoreboard } from '../models/game.models';

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly base = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  createGame(mode: GameMode): Observable<GameState> {
    return this.http
      .post<GameState>(`${this.base}/games`, { mode })
      .pipe(
        tap((s) => console.log('[GameService] Created game', s.id)),
        catchError(this.handleError)
      );
  }

  getGame(id: string): Observable<GameState> {
    return this.http
      .get<GameState>(`${this.base}/games/${id}`)
      .pipe(catchError(this.handleError));
  }

  makeMove(id: string, player: Player, row: number, column: number): Observable<GameState> {
    return this.http
      .post<GameState>(`${this.base}/games/${id}/moves`, { player, row, column })
      .pipe(
        tap((s) => console.log(`[GameService] Move by ${player} → (${row},${column}). Status: ${s.status}`)),
        catchError(this.handleError)
      );
  }

  undoMove(id: string): Observable<GameState> {
    return this.http
      .post<GameState>(`${this.base}/games/${id}/undo`, {})
      .pipe(
        tap(() => console.log('[GameService] Undo move')),
        catchError(this.handleError)
      );
  }

  resetGame(id: string): Observable<GameState> {
    return this.http
      .post<GameState>(`${this.base}/games/${id}/reset`, {})
      .pipe(
        tap(() => console.log('[GameService] Reset game')),
        catchError(this.handleError)
      );
  }

  getScoreboard(): Observable<Scoreboard> {
    return this.http
      .get<Scoreboard>(`${this.base}/scoreboard`)
      .pipe(catchError(this.handleError));
  }

  resetScoreboard(): Observable<Scoreboard> {
    return this.http
      .post<Scoreboard>(`${this.base}/scoreboard/reset`, {})
      .pipe(
        tap(() => console.log('[GameService] Scoreboard reset')),
        catchError(this.handleError)
      );
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    const msg = err.error?.error ?? err.message ?? 'Unknown error';
    console.error('[GameService] API error:', msg);
    return throwError(() => err);
  }
}
