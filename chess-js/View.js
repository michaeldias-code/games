// View.js
import { Board } from './Board.js';

export class View {
    constructor(board, ai, controller) {
        this.board = board;
        this.ai = ai;
        this.controller = controller;
        this.boardDiv = document.createElement('div');
        this.boardDiv.id = 'chessboard';
        this.boardDiv.style.display = 'grid';
        this.boardDiv.style.gridTemplateColumns = 'repeat(8, 60px)';
        this.boardDiv.style.gridTemplateRows = 'repeat(8, 60px)';
        document.body.appendChild(this.boardDiv);

        this.selected = null;
        this.render();
        this.addClickHandlers();
        console.log('View carregado!');
    }

    render() {
        this.boardDiv.innerHTML = '';
        for (let i = 0; i < 64; i++) {
            const cell = document.createElement('div');
            cell.style.width = '60px';
            cell.style.height = '60px';
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.fontSize = '36px';
            cell.style.backgroundColor = ((Math.floor(i/8) + i)%2 === 0) ? '#eee' : '#555';
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
            if (!this.selected) {
                if (this.board.board[index] && this.board.board[index].cor === 'brancas') {
                    this.selected = index;
                }
            } else {
                this.controller.movePiece(this.selected, index);
                this.selected = null;
                // IA joga em seguida
                setTimeout(() => this.ai.makeMove('pretas'), 300);
                setTimeout(() => this.render(), 350);
            }
            this.render();
        });
    }
}
