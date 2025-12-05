// View.js _v6
export class View {
    constructor(board, controller) {
        this.board = board;
        this.controller = controller;
        this.selected = null;

        // Container do tabuleiro com números e letras
        this.container = document.createElement('div');
        this.container.id = 'chessboard-wrapper';
        document.body.appendChild(this.container);

        // Div para números (8 linhas)
        this.numbersDiv = document.createElement('div');
        this.numbersDiv.id = 'numbers';
        this.container.appendChild(this.numbersDiv);

        // Div do tabuleiro 8x8
        this.boardDiv = document.createElement('div');
        this.boardDiv.id = 'chessboard';
        this.container.appendChild(this.boardDiv);

        // Div para letras (8 colunas)
        this.lettersDiv = document.createElement('div');
        this.lettersDiv.id = 'letters';
        this.container.appendChild(this.lettersDiv);

        this.render();
        this.addClickHandlers();
    }

    render() {
        // Limpa tudo
        this.boardDiv.innerHTML = '';
        this.numbersDiv.innerHTML = '';
        this.lettersDiv.innerHTML = '';

        // Números (8-1)
        for (let i = 8; i >= 1; i--) {
            const div = document.createElement('div');
            div.textContent = i;
            div.classList.add('number-label');
            this.numbersDiv.appendChild(div);
        }

        // Letras (a-h)
        for (let i = 0; i < 8; i++) {
            const div = document.createElement('div');
            div.textContent = String.fromCharCode(97 + i);
            div.classList.add('letter-label');
            this.lettersDiv.appendChild(div);
        }

        // Tabuleiro 8x8
        for (let i = 0; i < 64; i++) {
            const row = Math.floor(i / 8);
            const col = i % 8;
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.classList.add((row + col) % 2 === 0 ? 'white' : 'black');

            // Adiciona peça
            const piece = this.board.board[i];
            if (piece) {
                cell.textContent = piece.tipo;
            }

            cell.dataset.index = i;

            if (this.selected === i) cell.classList.add('selected');

            this.boardDiv.appendChild(cell);
        }
    }

    addClickHandlers() {
        this.boardDiv.addEventListener('click', e => {
            const target = e.target;
            if (!target.dataset.index) return;

            const index = parseInt(target.dataset.index);

            if (this.selected === null) {
                if (this.board.board[index] && this.board.board[index].cor === 'brancas') {
                    this.selected = index;
                }
            } else {
                if (index === this.selected) {
                    this.selected = null;
                } else {
                    const moved = this.controller.movePiece(this.selected, index);
                    if (moved) this.selected = null;
                }
            }

            this.render();
        });
    }

    onGameOver({ winner, reason }) {
        let message = '';
        switch (reason) {
            case 'checkmate':
                message = `${winner} venceu por checkmate!`;
                break;
            case 'stalemate':
                message = 'Empate por afogamento!';
                break;
            default:
                message = 'Fim de jogo!';
        }
        this.showMessage(message);
    }

    showMessage(text) {
        const div = document.createElement('div');
        div.classList.add('game-over-message');
        div.textContent = text;
        document.body.appendChild(div);
    }
}
