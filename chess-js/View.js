// View.js
import { Modules } from './config.js';

export class View {
    constructor(board, ai, controller) {
        this.board = board;
        this.ai = ai;
        this.controller = controller;
        this.selected = null;

        this.createBoardUI();
        this.render();
    }

    createBoardUI() {
        this.boardDiv = document.createElement('div');
        this.boardDiv.id = 'chess-board';
        this.boardDiv.style.display = 'grid';
        this.boardDiv.style.gridTemplateColumns = 'repeat(8, 60px)';
        this.boardDiv.style.gridTemplateRows = 'repeat(8, 60px)';
        this.boardDiv.style.width = '480px';
        this.boardDiv.style.height = '480px';
        this.boardDiv.style.border = '2px solid black';

        for (let i = 0; i < 64; i++) {
            const cell = document.createElement('div');
            cell.dataset.pos = i;
            cell.style.width = '60px';
            cell.style.height = '60px';
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.fontSize = '32px';
            cell.style.cursor = 'pointer';

            // Cores xadrez
            const row = Math.floor(i / 8);
            const col = i % 8;
            if ((row + col) % 2 === 0) {
                cell.style.backgroundColor = '#eee';
            } else {
                cell.style.backgroundColor = '#999';
            }

            cell.addEventListener('click', () => this.handleClick(i));
            this.boardDiv.appendChild(cell);
        }

        document.body.appendChild(this.boardDiv);
    }

    handleClick(pos) {
        const piece = this.board.getPiece(pos);

        // Seleção
        if (!this.selected) {
            if (piece && piece.cor === this.board.turn) {
                this.selected = pos;
            }
        } else {
            // Tenta mover
            const moved = this.controller.movePiece(this.selected, pos);
            if (moved) {
                this.selected = null;
                this.render();

                // Se vez da IA
                if (this.board.turn === 'pretas') {
                    setTimeout(() => {
                        this.ai.makeMove('pretas');
                        this.board.switchTurn();
                        this.render();
                    }, 300);
                }
            } else {
                // Seleciona outra peça
                if (piece && piece.cor === this.board.turn) {
                    this.selected = pos;
                } else {
                    this.selected = null;
                }
            }
        }
    }

    render() {
        for (let i = 0; i < 64; i++) {
            const cell = this.boardDiv.children[i];
            const piece = this.board.getPiece(i);
            cell.textContent = piece ? piece.tipo : '';
            if (this.selected === i) {
                cell.style.outline = '3px solid yellow';
            } else {
                cell.style.outline = 'none';
            }
        }

        // Indica turno
        const turnDiv = document.getElementById('turn-indicator');
        if (turnDiv) {
            turnDiv.textContent = `Turno: ${this.board.turn}`;
        } else {
            const d = document.createElement('div');
            d.id = 'turn-indicator';
            d.style.marginTop = '10px';
            d.style.fontWeight = 'bold';
            d.textContent = `Turno: ${this.board.turn}`;
            document.body.appendChild(d);
        }
    }
}

console.log('View carregado!');
