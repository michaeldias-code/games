// View.js _v3
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
        this.boardDiv.innerHTML = '';
        this.numbersDiv.innerHTML = '';
        this.lettersDiv.innerHTML = '';

        // Preenche números das linhas (1-8)
        for (let row = 0; row < 8; row++) {
            const number = document.createElement('div');
            number.classList.add('number');
            number.textContent = 8 - row;
            this.numbersDiv.appendChild(number);
        }

        // Preenche células do tabuleiro
        for (let i = 0; i < 64; i++) {
            const row = Math.floor(i / 8);
            const col = i % 8;
            const cell = document.createElement('div');
            cell.classList.add('cell', (row + col) % 2 === 0 ? 'white' : 'black');

            // Adiciona peça se houver
            const piece = this.board.board[i];
            if (piece) cell.textContent = piece.tipo;

            cell.dataset.index = i;

            if (this.selected === i) cell.classList.add('selected');

            this.boardDiv.appendChild(cell);
        }

        // Preenche letras das colunas (a-h)
        for (let col = 0; col < 8; col++) {
            const letter = document.createElement('div');
            letter.classList.add('letter');
            letter.textContent = String.fromCharCode(97 + col);
            this.lettersDiv.appendChild(letter);
        }
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
