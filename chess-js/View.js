// View.js _v5
export class View {
    constructor(board, controller) {
        this.board = board;
        this.controller = controller;

        this.selected = null;

        this.container = document.createElement('div');
        this.container.id = 'chessboard-container';
        document.body.appendChild(this.container);

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

        for (let i = 0; i < 64; i++) {
            const row = Math.floor(i / 8);
            const col = i % 8;
            const cell = document.createElement('div');
            cell.classList.add('cell', (row + col) % 2 === 0 ? 'white' : 'black');

            // Adiciona número na primeira coluna
            let label = '';
            if (col === 0) label += 8 - row;

            // Adiciona letra na última linha
            if (row === 7) label += String.fromCharCode(97 + col);

            // Adiciona peça se houver
            const piece = this.board.board[i];
            if (piece) cell.textContent = piece.tipo;
            else cell.textContent = label;

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
