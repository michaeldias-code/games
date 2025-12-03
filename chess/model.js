class ModelChess {
    constructor() {
        this.resetGame();
    }

    resetGame() {
        // Inicializa o tabuleiro e peças
        this.board = this.createBoard();
        this.turn = 'Brancas';
        this.moveHistory = [];
        this.scores = [];
    }

    createBoard() {
        // Representação simples do tabuleiro
        // 0..63 índices do tabuleiro
        let board = Array(64).fill(null);

        // Exemplo: preencher peões brancos
        for (let i = 48; i <= 55; i++) board[i] = { type: '♙', color: 'Brancas' };
        // Exemplo: preencher peões pretos
        for (let i = 8; i <= 15; i++) board[i] = { type: '♟', color: 'Pretas' };
        // Outras peças (torres, cavalos, bispos, rainha, rei)
        board[0] = { type: '♜', color: 'Pretas' };
        board[7] = { type: '♜', color: 'Pretas' };
        board[1] = { type: '♞', color: 'Pretas' };
        board[6] = { type: '♞', color: 'Pretas' };
        board[2] = { type: '♝', color: 'Pretas' };
        board[5] = { type: '♝', color: 'Pretas' };
        board[3] = { type: '♛', color: 'Pretas' };
        board[4] = { type: '♚', color: 'Pretas' };

        board[56] = { type: '♖', color: 'Brancas' };
        board[63] = { type: '♖', color: 'Brancas' };
        board[57] = { type: '♘', color: 'Brancas' };
        board[62] = { type: '♘', color: 'Brancas' };
        board[58] = { type: '♗', color: 'Brancas' };
        board[61] = { type: '♗', color: 'Brancas' };
        board[59] = { type: '♕', color: 'Brancas' };
        board[60] = { type: '♔', color: 'Brancas' };

        return board;
    }

    logMove(piece, from, to, capture) {
        console.log(`Movendo ${piece.type} de ${from} para ${to} (captura: ${capture ? capture.type : 'nenhuma'})`);
    }

    getPossibleMoves(color) {
        // Retorna todos os movimentos válidos para a cor
        let moves = [];
        for (let i = 0; i < 64; i++) {
            let piece = this.board[i];
            if (piece && piece.color === color) {
                moves.push(...this.getPieceMoves(piece, i));
            }
        }
        return moves;
    }

    getPieceMoves(piece, index) {
        // Função simplificada para retornar movimentos possíveis
        // Pode ser expandida para cada tipo de peça
        let moves = [];
        let directions = [];

        switch (piece.type) {
            case '♙': // Peão branco
                if (this.isEmpty(index - 8)) moves.push({ from: index, to: index - 8 });
                if ((index >= 48 && index <= 55) && this.isEmpty(index - 16)) moves.push({ from: index, to: index - 16 });
                if (this.isEnemy(index - 9, piece.color)) moves.push({ from: index, to: index - 9 });
                if (this.isEnemy(index - 7, piece.color)) moves.push({ from: index, to: index - 7 });
                break;
            case '♟': // Peão preto
                if (this.isEmpty(index + 8)) moves.push({ from: index, to: index + 8 });
                if ((index >= 8 && index <= 15) && this.isEmpty(index + 16)) moves.push({ from: index, to: index + 16 });
                if (this.isEnemy(index + 7, piece.color)) moves.push({ from: index, to: index + 7 });
                if (this.isEnemy(index + 9, piece.color)) moves.push({ from: index, to: index + 9 });
                break;
            case '♚':
            case '♔':
                directions = [-1, 1, -8, 8, -9, -7, 7, 9];
                directions.forEach(d => {
                    let to = index + d;
                    if (this.isValidSquare(to) && !this.isAlly(to, piece.color)) moves.push({ from: index, to });
                });
                break;
            case '♞':
            case '♘':
                directions = [-17, -15, -10, -6, 6, 10, 15, 17];
                directions.forEach(d => {
                    let to = index + d;
                    if (this.isValidSquare(to) && !this.isAlly(to, piece.color)) moves.push({ from: index, to });
                });
                break;
            case '♜':
            case '♖':
                directions = [-1, 1, -8, 8];
                moves.push(...this.getSlidingMoves(index, piece.color, directions));
                break;
            case '♝':
            case '♗':
                directions = [-9, -7, 7, 9];
                moves.push(...this.getSlidingMoves(index, piece.color, directions));
                break;
            case '♛':
            case '♕':
                directions = [-1, 1, -8, 8, -9, -7, 7, 9];
                moves.push(...this.getSlidingMoves(index, piece.color, directions));
                break;
        }

        return moves;
    }

    getSlidingMoves(index, color, directions) {
        let moves = [];
        directions.forEach(d => {
            let to = index + d;
            while (this.isValidSquare(to)) {
                if (this.isEmpty(to)) {
                    moves.push({ from: index, to });
                } else if (this.isEnemy(to, color)) {
                    moves.push({ from: index, to });
                    break;
                } else break;
                to += d;
            }
        });
        return moves;
    }

    isValidSquare(index) {
        return index >= 0 && index < 64;
    }

    isEmpty(index) {
        return this.isValidSquare(index) && !this.board[index];
    }

    isEnemy(index, color) {
        return this.isValidSquare(index) && this.board[index] && this.board[index].color !== color;
    }

    isAlly(index, color) {
        return this.isValidSquare(index) && this.board[index] && this.board[index].color === color;
    }

    makeMove(move) {
        const piece = this.board[move.from];
        const captured = this.board[move.to];

        this.board[move.to] = piece;
        this.board[move.from] = null;

        this.moveHistory.push({ piece, from: move.from, to: move.to, captured });
        this.logMove(piece, move.from, move.to, captured);

        // alterna turno
        this.turn = this.turn === 'Brancas' ? 'Pretas' : 'Brancas';
    }

    undoMove() {
        const last = this.moveHistory.pop();
        if (!last) return;
        this.board[last.from] = last.piece;
        this.board[last.to] = last.captured || null;
        this.turn = this.turn === 'Brancas' ? 'Pretas' : 'Brancas';
    }

    isInCheck(color) {
        // Verifica se o rei está atacado
        let kingIndex = this.board.findIndex(p => p && p.type === (color === 'Brancas' ? '♔' : '♚'));
        if (kingIndex === -1) return false; // Rei capturado
        let enemyMoves = this.getPossibleMoves(color === 'Brancas' ? 'Pretas' : 'Brancas');
        return enemyMoves.some(m => m.to === kingIndex);
    }

    isCheckmate(color) {
        if (!this.isInCheck(color)) return false;
        let moves = this.getPossibleMoves(color);
        for (let m of moves) {
            this.makeMove(m);
            let stillInCheck = this.isInCheck(color);
            this.undoMove();
            if (!stillInCheck) return false;
        }
        return true;
    }

    evaluateMoves() {
        let moves = this.getPossibleMoves(this.turn);
        let scoredMoves = moves.map(m => {
            let score = 0;
            let captured = this.board[m.to];
            if (captured) score += this.getPieceValue(captured.type);
            this.makeMove(m);
            if (this.isCheckmate(this.turn === 'Brancas' ? 'Pretas' : 'Brancas')) score += 1000;
            if (this.isInCheck(this.turn === 'Brancas' ? 'Pretas' : 'Brancas')) score += 50;
            this.undoMove();
            return { move: m, score };
        });
        return scoredMoves;
    }

    getPieceValue(type) {
        switch (type) {
            case '♙': case '♟': return 1;
            case '♘': case '♞': return 3;
            case '♗': case '♝': return 3;
            case '♖': case '♜': return 5;
            case '♕': case '♛': return 9;
            case '♔': case '♚': return 1000;
        }
        return 0;
    }

    makeBestMove() {
        let scoredMoves = this.evaluateMoves();
        scoredMoves.sort((a, b) => b.score - a.score);
        let best = scoredMoves[0];
        if (best) this.makeMove(best.move);
    }
}

// Exemplo de uso
const game = new ChessModel();
game.makeMove({ from: 52, to: 36 }); // Peão branco exemplo
game.makeBestMove();
console.log('Turno agora:', game.turn);

