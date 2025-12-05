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
        console.log("Render iniciado");

        this.boardDiv.innerHTML = '';
        if (!this.board || !this.board.board) {
            console.error("Board não definido ou inválido!", this.board);
            return;
        }

        for (let i = 0; i < 64; i++) {
            const row = Math.floor(i / 8);
            const col = i % 8;

            const cell = document.createElement('div');

            // Adiciona classe da célula
            try {
                cell.classList.add('cell', (row + col) % 2 === 0 ? 'white' : 'black');
            } catch (e) {
                console.error("Erro ao adicionar classe na célula", i, e);
            }

            // Adiciona peça, se existir
            try {
                const piece = this.board.board[i];
                if (piece) {
                    cell.textContent = piece.tipo;
                    console.log(`Peça na posição ${i}:`, piece.tipo);
                }
            } catch (e) {
                console.error("Erro ao acessar peça na posição", i, e);
            }

            cell.dataset.index = i;

            if (this.selected === i) cell.classList.add('selected');

            // Número na primeira coluna
            if (col === 0) {
                try {
                    const numberLabel = document.createElement('span');
                    numberLabel.textContent = 8 - row;
                    cell.appendChild(numberLabel);
                } catch (e) {
                    console.error("Erro ao adicionar número na célula", i, e);
                }
            }

            // Letra na última linha
            if (row === 7) {
                try {
                    const letterLabel = document.createElement('span');
                    letterLabel.textContent = String.fromCharCode(97 + col);
                    cell.appendChild(letterLabel);
                } catch (e) {
                    console.error("Erro ao adicionar letra na célula", i, e);
                }
            }

            this.boardDiv.appendChild(cell);
        }
        console.log("Render finalizado");
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
