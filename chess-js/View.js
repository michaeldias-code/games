// View.js _v2
export class View {
    constructor(board, controller) {
        this.board = board;
        this.controller = controller;

        this.selected = null;

        // Cria div do tabuleiro
        this.boardDiv = document.createElement('div');
        this.boardDiv.id = 'chessboard';
        document.body.appendChild(this.boardDiv);

        // Renderiza inicial
        this.render();
        this.addClickHandlers();

        console.log('View carregado!');
    }

    render() {
        // Limpa tabuleiro e labels
        this.boardDiv.innerHTML = '';

        // Cria container para linhas e colunas
        const rowsContainer = document.createElement('div');
        rowsContainer.classList.add('rows-container');

        for (let row = 0; row < 8; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('row');

            // Label da linha
            const rowLabel = document.createElement('div');
            rowLabel.classList.add('row-label');
            rowLabel.textContent = 8 - row;
            rowDiv.appendChild(rowLabel);

            for (let col = 0; col < 8; col++) {
                const i = row * 8 + col;
                const cell = document.createElement('div');
                cell.classList.add('cell', (row + col) % 2 === 0 ? 'white' : 'black');

                const piece = this.board.board[i];
                if (piece) cell.textContent = piece.tipo;

                cell.dataset.index = i;
                if (this.selected === i) cell.classList.add('selected');

                rowDiv.appendChild(cell);
            }
            rowsContainer.appendChild(rowDiv);
        }

        this.boardDiv.appendChild(rowsContainer);

        // Letras abaixo do tabuleiro
        const lettersDiv = document.createElement('div');
        lettersDiv.classList.add('letters');
        for (let col = 0; col < 8; col++) {
            const letter = document.createElement('div');
            letter.classList.add('letter');
            letter.textContent = String.fromCharCode(97 + col);
            lettersDiv.appendChild(letter);
        }
        this.boardDiv.appendChild(lettersDiv);
    }

    addClickHandlers() {
        this.boardDiv.addEventListener('click', e => {
            const target = e.target;
            if (!target.dataset.index) return;

            const index = parseInt(target.dataset.index);

            // Se nenhuma peça está selecionada ainda
            if (this.selected === null) {
                if (this.board.board[index] && this.board.board[index].cor === 'brancas') {
                    this.selected = index; // seleciona a peça
                }
            } 
            // Se já existe uma peça selecionada
            else {
                // Clicou na mesma célula? apenas deseleciona
                if (index === this.selected) {
                    this.selected = null;
                } 
                // Caso contrário, tenta mover
                else {
                    const moved = this.controller.movePiece(this.selected, index);
                    if (moved) {
                        this.selected = null; // limpa seleção apenas se o movimento foi feito
                    }
                }
            }

            // Sempre renderiza após o clique
            this.render();
        });
    }
    // recebe dados do Controller e decide o que mostrar
    onGameOver({ winner, reason }) {
        let message = '';

        switch(reason) {
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
