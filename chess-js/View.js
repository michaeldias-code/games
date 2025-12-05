// View.js
import { Board } from './Board.js';

export class View {
    constructor(board, ai, controller) {
        this.board = board;
        this.ai = ai;
        this.controller = controller;

        this.selected = null;

        // Criar tabuleiro
        this.boardDiv = document.createElement('div');
        this.boardDiv.id = 'chessboard';
        document.body.appendChild(this.boardDiv);

        this.render();
        this.addClickHandlers();

        console.log('View carregado!');
    }

    render() {
        this.boardDiv.innerHTML = '';

        for (let i = 0; i < 64; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            // Alterna cor da célula
            if ((Math.floor(i / 8) + i) % 2 === 0) {
                cell.classList.add('white');
            } else {
                cell.classList.add('black');
            }

            // Adiciona peça, se existir
            const piece = this.board.board[i];
            if (piece) cell.textContent = piece.tipo;

            cell.dataset.index = i;

            // Destacar célula selecionada
            if (this.selected === i) cell.classList.add('selected');

            this.boardDiv.appendChild(cell);
        }
    }

    addClickHandlers() {
        this.boardDiv.addEventListener('click', e => {
            const target = e.target;

            if (!target.dataset.index) return;

            const index = parseInt(target.dataset.index);

            // Selecionar peça do jogador
            if (this.selected === null) {
                const piece = this.board.board[index];
                if (piece && piece.cor === 'brancas') {
                    this.selected = index;
                }
            } 
            // Tentar mover a peça selecionada
            else {
                const moved = this.controller.movePiece(this.selected, index);

                // IA só joga se o movimento foi válido
                if (moved) {
                    setTimeout(() => this.ai.makeMove('pretas'), 300);
                }

                // Resetar seleção independentemente de ter movido
                this.selected = null;
            }

            this.render();
        });
    }
}
