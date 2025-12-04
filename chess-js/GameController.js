// GameController.js
import { Modules } from './config.js';
import { Board } from './Board.js';
import { AI } from './AI.js';
import { View } from './View.js';
import { MoveValidator } from './MoveValidator.js';

export class GameController {
  constructor() {
    this.board = new Board();
    this.turn = 'white'; // turno inicial
    this.gameOver = false;
    console.log(`[${Modules.GameController}] Jogo iniciado`);
    View.renderBoard(this.board.grid);
  }

  playerMove(from, to) {
    if(this.gameOver) {
      console.log(`[${Modules.GameController}] O jogo já terminou`);
      return;
    }

    console.log(`[${Modules.GameController}] Jogador move de ${from} para ${to}`);

    // Valida movimento
    if(!MoveValidator.isValidMove(this.board.grid, from, to)) {
      console.log(`[${Modules.GameController}] Movimento inválido`);
      return false;
    }

    // Executa movimento
    const success = this.board.movePiece(from, to);
    if(success) {
      this.nextTurn();
      return true;
    }
    return false;
  }

  nextTurn() {
    // Alterna o turno
    this.turn = this.turn === 'white' ? 'black' : 'white';
    console.log(`[${Modules.GameController}] Próximo turno: ${this.turn}`);

    // Verifica se o jogo acabou (placeholder)
    if(this.checkGameOver()) {
      this.gameOver = true;
      console.log(`[${Modules.GameController}] Jogo encerrado!`);
      return;
    }

    // Se turno da AI, executa movimento automático
    if(this.turn === 'black') {
      const move = AI.chooseMove(this.board.grid, 'black');
      if(move) {
        console.log(`[${Modules.GameController}] IA move de ${move.from} para ${move.to}`);
        this.playerMove(move.from, move.to); // chama recursivamente
      } else {
        console.log(`[${Modules.GameController}] IA não encontrou movimentos válidos`);
        this.gameOver = true;
      }
    }

    // Renderiza tabuleiro atualizado
    View.renderBoard(this.board.grid);
  }

  checkGameOver() {
    // Placeholder simples: retorna false
    // Aqui podemos checar xeque-mate, empate, falta de movimentos
    return false;
  }

  restartGame() {
    console.log(`[${Modules.GameController}] Reiniciando jogo`);
    this.board = new Board();
    this.turn = 'white';
    this.gameOver = false;
    View.renderBoard(this.board.grid);
  }
}