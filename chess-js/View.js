// View.js
import { Modules } from './config.js';

export class View {
  static renderBoard(board) {
    console.log(`[${Modules.View}] Renderizando tabuleiro`);
    // Exemplo simples: log do grid
    console.table(board.map(p => p ? `${p.color[0]}${p.type[0]}` : '  '));
  }
}