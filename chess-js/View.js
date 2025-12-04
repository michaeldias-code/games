export class View {
    constructor(board, ai, controller) {
        this.board = board;
        this.ai = ai;
        this.controller = controller;

        this.selected = null;

        // Criar tabuleiro
        this.boardDiv = document.createElement('div');
        this.boardDiv.id = 'chessboard';

        Object.assign(this.boardDiv.style, {
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 60px)',
            gridTemplateRows: 'repeat(8, 60px)',
            width: '480px',
            height: '480px',
            border: '2px solid black',
            marginTop: '20px'
        });

        document.body.appendChild(this.boardDiv);

        this.render();
        this.addClickHandlers();

        console.log('View carregado!');
    }

    render() {
        this.boardDiv.innerHTML = '';

        for (let i = 0; i < 64; i++) {
            const cell = document.createElement('div');

            Object.assign(cell.style, {
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                backgroundColor: ((Math.floor(i / 8) + i) % 2 === 0) ? '#eee' : '#555',
                color: '#000'
            });

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
                if (this.board.board[index] && this.board.board[index].cor === 'brancas') {
                    this.selected = index;
                }
            }
            // Mover
            else {
                this.controller.movePiece(this.selected, index);
                this.selected = null;

                // IA move depois
                setTimeout(() => this.ai.makeMove('pretas'), 300);
                setTimeout(() => this.render(), 350);
            }

            this.render();
        });
    }
}
