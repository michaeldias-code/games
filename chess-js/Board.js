// Board.js
import { Modules } from './config.js';
import { Piece } from './Piece.js';

export class Board {
  constructor() {
    this.grid = this.createInitialBoard();
    console.log(`[${Modules.Board}] Tabuleiro inicializado`);
  }

  createInitialBoard() {
    const board = Array(64).fill(null);
    // Exemplo: inicializar peões brancos na segunda linha
    for(let i=8; i<16; i++) {
      board[i] = new Piece('Pawn', 'white');
    }
    console.log(`[${Modules.Board}] Peças posicionadas`);
    return board;
  }

  movePiece(from, to) {
    console.log(`[${Modules.Board}] Tentando mover peça de ${from} para ${to}`);
    const piece = this.grid[from];
    if(!piece) {
      console.log(`[${Modules.Board}] Sem peça na posição ${from}`);
      return false;
    }
    this.grid[to] = piece;
    this.grid[from] = null;
    console.log(`[${Modules.Board}] Movimento realizado`);
    return true;
  }
}