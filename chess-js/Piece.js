// Piece.js
import { Modules } from './config.js';

export class Piece {
  constructor(type, color) {
    this.type = type; // 'Pawn', 'Knight', etc.
    this.color = color; // 'white' ou 'black'
    console.log(`[${Modules.Piece}] Peça criada: ${this.color} ${this.type}`);
  }

  getMoves(position, board) {
    console.log(`[${Modules.Piece}] Calculando movimentos para ${this.color} ${this.type} na posição ${position}`);
    // Retorna array de movimentos válidos (exemplo simples)
    return [];
  }
}