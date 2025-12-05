// View.js _v1527
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
        this.numbersDiv.id = 'numbers-label';
        this.container.appendChild(this.numbersDiv);

        // Div do tabuleiro 8x8
        this.boardDiv = document.createElement('div');
        this.boardDiv.id = 'chessboard';
        this.container.appendChild(this.boardDiv);

        // Div para letras (8 colunas)
        this.lettersDiv = document.createElement('div');
        this.lettersDiv.id = 'letters-label';
        this.container.appendChild(this.lettersDiv);

        this.render();
        this.addClickHandlers();
    }

    render() {
        this.boardDiv.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const i = row * 8 + col;
                const cell = document.createElement('div');
                cell.classList.add('cell');

                // Alterna cor da célula
                if ((row + col) % 2 === 0) {
                    cell.classList.add('white');
                } else {
                    cell.classList.add('black');
                }

                // Adiciona peça, se existir
                const piece = this.board.board[i];
                //if (piece) {
                //    cell.textContent = piece.tipo;
                //}

                if (piece) {
                    const pieceSpan = document.createElement('span');
                    pieceSpan.textContent = piece.tipo;
                    pieceSpan.classList.add('piece', piece.cor); // <─ ESSENCIAL
                    cell.appendChild(pieceSpan);
                }
                
                // Seleção
                if (this.selected === i) cell.classList.add('selected');

                // Números na primeira coluna (à esquerda)
                if (col === 0) {
                    const numberLabel = document.createElement('span');
                    numberLabel.textContent = 8 - row;
                    numberLabel.classList.add('number-label');
                    cell.appendChild(numberLabel);
                }

                // Letras na última linha
                if (row === 7) {
                    const letterLabel = document.createElement('span');
                    letterLabel.textContent = String.fromCharCode(97 + col);
                    letterLabel.classList.add('letter-label');
                    cell.appendChild(letterLabel);
                }

                this.boardDiv.appendChild(cell);
            }
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
