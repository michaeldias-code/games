// AI.js
import { Modules } from './config.js';
import { MoveValidator } from './MoveValidator.js';

export class AI {
  static chooseMove(board, color) {
    console.log(`[${Modules.AI}] Calculando melhor jogada para ${color}`);
    // Placeholder: escolhe o primeiro movimento válido que encontrar
    for(let i=0;i<64;i++) {
      for(let j=0;j<64;j++) {
        if(MoveValidator.isValidMove(board, i, j)) {
          console.log(`[${Modules.AI}] Movimento escolhido: ${i} -> ${j}`);
          return {from:i, to:j};
        }
      }
    }
    return null;
  }
}