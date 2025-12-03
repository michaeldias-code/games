// =======================================================
//                 CONTROLLER DO XADREZ
// =======================================================

class ChessController {
    constructor(model) {
        this.model = model;

        // Elementos da View
        this.boardDiv = document.getElementById("board");
        this.turnDiv = document.getElementById("turnDisplay");
        this.statusDiv = document.getElementById("statusDisplay");
        this.btnReset = document.getElementById("btnReset");

        this.selectedSquare = null;

        // Inicializa tabuleiro e render
        this.initBoard();
        this.render();

        // Evento Reiniciar
        if (this.btnReset) {
            this.btnReset.addEventListener("click", () => this.resetGame());
        }
    }

    // Inicializa o tabuleiro
    initBoard() {
        this.boardDiv.innerHTML = "";
        for (let i = 0; i < 64; i++) {
            const square = document.createElement("div");
            const row = Math.floor(i / 8);
            const col = i % 8;

            square.classList.add("square", (row + col) % 2 === 0 ? "white" : "black");
            square.dataset.index = i;

            square.addEventListener("click", () => this.handleClick(i));
            this.boardDiv.appendChild(square);
        }
    }

    // Renderiza o tabuleiro e HUD
    render() {
        const state = this.model.getState();

        for (let i = 0; i < 64; i++) {
            const square = this.boardDiv.children[i];
            square.textContent = state.board[i];
            square.classList.remove("selected");
            if (this.selectedSquare === i) square.classList.add("selected");
        }

        this.turnDiv.textContent = `Vez: ${state.turn}`;
        this.statusDiv.textContent = `Status: ${state.status}`;
    }

    // Clique no tabuleiro
    handleClick(index) {
        const piece = this.model.board[index];

        if (this.selectedSquare !== null) {
            if (this.model.isValidMove(this.selectedSquare, index)) {
                this.model.movePiece(this.selectedSquare, index);
                this.selectedSquare = null;
                this.model.nextTurn();
                this.render();

                // Jogada automática da IA se for turno das pretas
                if (this.model.turn.trim().toLowerCase() === "pretas") {
                    setTimeout(() => {
                        this.model.IAMove();
                        this.render();
                    }, 200);
                }
            }
        }

        // Seleciona peça própria
        if (piece && this.model.isWhite(piece) === (this.model.turn === "Brancas")) {
            this.selectedSquare = index;
            this.render();
        }
    }

    // Botão Reiniciar
    resetGame() {
        this.model.reset();
        this.selectedSquare = null;
        this.render();
    }
}

// =======================================================
// Inicialização
// =======================================================
document.addEventListener("DOMContentLoaded", () => {
    const model = new ModelChess();
    const controller = new ChessController(model);
});
