// View.js — v1
export class View {
    constructor(board, controller) {
        this.board = board;
        this.controller = controller;
        this.selected = null;
        this.lastMove = null;

        // Criar wrapper do tabuleiro
        this.container = document.createElement("div");
        this.container.id = "chessboard-wrapper";
        document.body.appendChild(this.container);

        // Criar div do tabuleiro
        this.boardDiv = document.createElement("div");
        this.boardDiv.id = "chessboard";
        this.container.appendChild(this.boardDiv);

        // Adicionar notações externas
        this.createFileLabels();
        this.createRankLabels();

        // Renderizar inicial
        this.render();

        // Adicionar eventos de clique
        this.addClickHandlers();
    }

    /* ---------------- Notações ---------------- */
    createFileLabels() {
        const files = "abcdefgh";
        for (let col = 0; col < 8; col++) {
            const lbl = document.createElement("div");
            lbl.className = "file-label";
            lbl.textContent = files[col];
            lbl.style.left = `${(col + 0.5) * 12.5}%`;
            this.container.appendChild(lbl);
        }
    }

    createRankLabels() {
        for (let row = 0; row < 8; row++) {
            const lbl = document.createElement("div");
            lbl.className = "rank-label";
            lbl.textContent = 8 - row;
            lbl.style.top = `${(row + 0.5) * 12.5}%`;
            this.container.appendChild(lbl);
        }
    }

    /* ---------------- Renderização ---------------- */
    render() {
        this.boardDiv.innerHTML = "";

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const i = r * 8 + c;
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.classList.add((r + c) % 2 === 0 ? "white" : "black");
                cell.dataset.index = i;

                // Seleção
                if (this.selected === i) cell.classList.add("selected");

                // Destaque último movimento
                if (this.lastMove && (i === this.lastMove.from || i === this.lastMove.to)) {
                    cell.classList.add("ai-move");
                }

                // Renderizar peça
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

    /* ---------------- Destaque de movimento AI/último movimento ---------------- */
    highlightCell(index) {
        const prev = this.boardDiv.querySelector(".ai-move");
        if (prev) prev.classList.remove("ai-move");

        const cell = this.boardDiv.querySelector(`.cell[data-index="${index}"]`);
        if (cell) cell.classList.add("ai-move");

        setTimeout(() => {
            if (cell) cell.classList.remove("ai-move");
        }, 500);
    }

    /* ---------------- Eventos de clique ---------------- */
    addClickHandlers() {
        this.boardDiv.addEventListener("click", e => {
            const cell = e.target.closest(".cell");
            if (!cell) return;

            const index = Number(cell.dataset.index);
            const piece = this.board.board[index];

            if (this.selected === null) {
                if (piece && piece.cor === "brancas") {
                    this.selected = index;
                }
            } else {
                if (this.selected === index) {
                    this.selected = null;
                } else {
                    const ok = this.controller.movePiece(this.selected, index);
                    if (ok) this.lastMove = { from: this.selected, to: index };
                    this.selected = null;
                }
            }

            this.render();
        });
    }

    /* ---------------- Mensagem de fim de jogo ---------------- */
    onGameOver({ winner, reason }) {
        const div = document.createElement("div");
        div.className = "game-over-message";
        div.textContent = `${winner} venceu por ${reason}!`;
        document.body.appendChild(div);
    }
}
