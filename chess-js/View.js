// View.js
import { Board } from './Board.js';

export class View {
    constructor(board, ai, controller) {
        this.board = board;
        this.ai = ai;
        this.controller = controller;

        this.selected = null;
        this.possibleMoves = [];

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

            // Determinar cor das casas alternadas
            if ((Math.floor(i / 8) + i) % 2 === 0) {
                cell.classList.add('white-cell');
            } else {
                cell.classList.add('black-cell');
            }

            // Destacar casa selecionada
            if (this.selected === i) {
                cell.classList.add('selected');
            }

            // Destacar possíveis movimentos
            if (this.possibleMoves.includes(i)) {
                cell.classList.add('highlight');
            }

            // Colocar peça
            const piece = this.board.board[i];
            if (piece) cell.textContent = piece.tipo;

            cell.dataset.index = i;
            this.boardDiv.appendChild(cell);
        }
    }

    addClickHandlers() {
        this.boardDiv.addEventListener('click', e => {
            const target = e.target;
            if (!target.dataset.index) return;

            const index = parseInt(target.dataset.index);

            // Selecionar peça branca
            if (this.selected === null) {
                const piece = this.board.board[index];
                if (piece && piece.cor === 'brancas') {
                    this.selected = index;
                    // Mostrar possíveis movimentos
                    this.possibleMoves = this.board.getPossibleMoves(index);
                }
            }
            // Mover
            else {
                if (this.possibleMoves.includes(index)) {
                    this.controller.movePiece(this.selected, index);
                    // IA joga depois
                    setTimeout(() => this.ai.makeMove('pretas'), 300);
                }
                this.selected = null;
                this.possibleMoves = [];
            }

            this.render();
        });
    }
}
