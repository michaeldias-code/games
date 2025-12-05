// View.js — v_1945
export class View {
    constructor(board, controller) {
        this.board = board;
        this.controller = controller;
        this.selected = null;

        // Wrapper principal
        this.container = document.createElement("div");
        this.container.id = "chessboard-wrapper";
        document.body.appendChild(this.container);

        // Tabuleiro
        this.boardDiv = document.createElement("div");
        this.boardDiv.id = "chessboard";
        this.container.appendChild(this.boardDiv);

        // Adiciona notações externas
        this.createFileLabels();
        this.createRankLabels();

        this.render();
        this.addClickHandlers();
    }

    createFileLabels() {
        const files = "abcdefgh";
        for (let col = 0; col < 8; col++) {
            const label = document.createElement("div");
            label.className = "file-label";
            label.textContent = files[col];
            label.style.left = `${col * 60 + 25}px`;
            this.container.appendChild(label);
        }
    }

    createRankLabels() {
        for (let row = 0; row < 8; row++) {
            const label = document.createElement("div");
            label.className = "rank-label";
            label.textContent = 8 - row;
            label.style.top = `${row * 60 + 22}px`;
            this.container.appendChild(label);
        }
    }

    render() {
        this.boardDiv.innerHTML = "";

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {

                const i = row * 8 + col;
                const cell = document.createElement("div");
                cell.classList.add("cell");

                // Alternar cor
                cell.classList.add((row + col) % 2 === 0 ? "white" : "black");

                // Data index para clique
                cell.dataset.index = i;

                // Peça
                const piece = this.board.board[i];
                if (piece) {
                    const span = document.createElement("span");
                    span.textContent = piece.tipo;
                    span.className = `piece ${piece.cor}`;
                    cell.appendChild(span);
                }

                this.boardDiv.appendChild(cell);
            }
        }
    }

    addClickHandlers() {
        this.boardDiv.addEventListener("click", e => {
            const cell = e.target.closest(".cell");
            if (!cell) return;

            const index = parseInt(cell.dataset.index);

            // Esta lógica não altera nada do GameController
            if (this.selected === null) {
                if (this.board.board[index] && this.board.board[index].cor === "brancas") {
                    this.selected = index;
                }
            } else {
                if (this.selected === index) {
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
        const div = document.createElement("div");
        div.className = "game-over-message";
        div.textContent = reason === "checkmate"
            ? `${winner} venceu por checkmate!`
            : "Fim de jogo!";
        document.body.appendChild(div);
    }
}
