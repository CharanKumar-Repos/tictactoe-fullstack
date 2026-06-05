import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GameService } from './game.service';
import { GameState } from '../models/game.models';

const mockState: GameState = {
  id: 'test-id',
  mode: 'TwoPlayer',
  board: [['', '', ''], ['', '', ''], ['', '', '']],
  currentPlayer: 'X',
  status: 'InProgress',
  winner: null,
  winningCells: null,
  moveHistory: [],
  scoreboard: { xWins: 0, oWins: 0, draws: 0 },
};

describe('GameService', () => {
  let svc: GameService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GameService],
    });
    svc = TestBed.inject(GameService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('createGame — calls POST /api/games with mode', () => {
    svc.createGame('TwoPlayer').subscribe((s) => {
      expect(s.id).toBe('test-id');
    });
    const req = http.expectOne('http://localhost:5000/api/games');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ mode: 'TwoPlayer' });
    req.flush(mockState);
  });

  it('makeMove — calls POST /api/games/{id}/moves', () => {
    svc.makeMove('test-id', 'X', 0, 0).subscribe();
    const req = http.expectOne('http://localhost:5000/api/games/test-id/moves');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ player: 'X', row: 0, column: 0 });
    req.flush(mockState);
  });

  it('undoMove — calls POST /api/games/{id}/undo', () => {
    svc.undoMove('test-id').subscribe();
    const req = http.expectOne('http://localhost:5000/api/games/test-id/undo');
    expect(req.request.method).toBe('POST');
    req.flush(mockState);
  });

  it('resetGame — calls POST /api/games/{id}/reset', () => {
    svc.resetGame('test-id').subscribe();
    const req = http.expectOne('http://localhost:5000/api/games/test-id/reset');
    expect(req.request.method).toBe('POST');
    req.flush(mockState);
  });

  it('resetScoreboard — calls POST /api/scoreboard/reset', () => {
    svc.resetScoreboard().subscribe();
    const req = http.expectOne('http://localhost:5000/api/scoreboard/reset');
    expect(req.request.method).toBe('POST');
    req.flush({ xWins: 0, oWins: 0, draws: 0 });
  });
});
