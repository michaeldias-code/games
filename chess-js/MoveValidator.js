//MoveValidator v2007
export class MoveValidator {
    constructor(boardArray) {
        this.board = boardArray; // RECEBE DIRETO O ARRAY DE 64 CASAS
        console.log('MoveValidator carregado!');
    }

    isValidPosition(pos) {
        return pos >= 0 && pos < 64;
    }

    getPossibleMoves(pos) {
        const piece = this.board[pos];
        if (!piece) return [];

        const moves = [];
        const row = Math.floor(pos / 8);
        const col = pos % 8;

        const addMove = (to) => {
            if (!this.isValidPosition(to)) return;
            const target = this.board[to];
            if (!target || target.cor !== piece.cor) moves.push(to);
        };

        switch(piece.tipo) {
            case '♙': // Peão branco
                if (row > 0 && !this.board[pos - 8]) moves.push(pos - 8);
                if (row === 6 && !this.board[pos - 8] && !this.board[pos - 16]) moves.push(pos - 16);
                if (col > 0 && this.board[pos - 9] && this.board[pos - 9].cor === 'pretas') moves.push(pos - 9);
                if (col < 7 && this.board[pos - 7] && this.board[pos - 7].cor === 'pretas') moves.push(pos - 7);
                break;

            case '♟': // Peão preto
                if (row < 7 && !this.board[pos + 8]) moves.push(pos + 8);
                if (row === 1 && !this.board[pos + 8] && !this.board[pos + 16]) moves.push(pos + 16);
                if (col < 7 && this.board[pos + 9] && this.board[pos + 9].cor === 'brancas') moves.push(pos + 9);
                if (col > 0 && this.board[pos + 7] && this.board[pos + 7].cor === 'brancas') moves.push(pos + 7);
                break;

            case '♖': case '♜': // Torre
                moves.push(...this.getSlidingMoves(pos, [-1,1,-8,8]));
                break;

            case '♗': case '♝': // Bispo
                moves.push(...this.getSlidingMoves(pos, [-9,-7,7,9]));
                break;

            case '♕': case '♛': // Rainha
                moves.push(...this.getSlidingMoves(pos, [-1,1,-8,8,-9,-7,7,9]));
                break;

            case '♘': case '♞': // Cavalo
                const knightOffsets = [-17,-15,-10,-6,6,10,15,17];
                knightOffsets.forEach(o => {
                    const to = pos + o;
                    if (!this.isValidPosition(to)) return;

                    const toRow = Math.floor(to / 8);
                    const toCol = to % 8;

                    const rowDiff = Math.abs(toRow - row);
                    const colDiff = Math.abs(toCol - col);

                    if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
                        const target = this.board[to];
                        if (!target || target.cor !== piece.cor) moves.push(to);
                    }
                });
                break;

            case '♔': case '♚': // Rei
                const kingOffsets = [-9,-8,-7,-1,1,7,8,9];
                kingOffsets.forEach(o => {
                    const to = pos + o;
                    if (!this.isValidPosition(to)) return;

                    const toRow = Math.floor(to / 8);
                    const toCol = to % 8;

                    const rowDiff = Math.abs(toRow - row);
                    const colDiff = Math.abs(toCol - col);

                    if (rowDiff <= 1 && colDiff <= 1) {
                        const target = this.board[to];
                    if (!target || target.cor !== piece.cor) moves.push(to);
                }
            });
            break;
        }
        // Filtra movimentos que deixariam o rei em xeque
        return moves.filter(to => this.wouldNotLeaveKingInCheck(pos, to));
    }

    getSlidingMoves(pos, directions) {
        const moves = [];
        const piece = this.board[pos];

        directions.forEach(d => {
            let p = pos + d;
            while (this.isValidPosition(p) && this.isInSameLineOrCol(pos, p, d)) {
                const target = this.board[p];
                if (!target) moves.push(p);
                else {
                    if (target.cor !== piece.cor) moves.push(p);
                    break;
                }
                p += d;
            }
        });

        return moves;
    }

    isInSameLineOrCol(start, end, offset) {
        const startRow = Math.floor(start / 8);
        const startCol = start % 8;
        const endRow = Math.floor(end / 8);
        const endCol = end % 8;

        if (offset === -1 || offset === 1) return startRow === endRow;
        if (offset === -8 || offset === 8) return true;
        if (offset === -9 || offset === 7) return Math.abs(endCol - startCol) === Math.abs(endRow - startRow);
        if (offset === -7 || offset === 9) return Math.abs(endCol - startCol) === Math.abs(endRow - startRow);
        return false;
    }

    wouldNotLeaveKingInCheck(from, to) {
        const originalPiece = this.board[from]; // A peça original da posição de origem
        const targetPiece = this.board[to];     // A peça que está no destino

        // Realiza o movimento "temporário"
        this.board[to] = originalPiece;
        this.board[from] = null;

        // Verifica se o rei do jogador que está movendo ficaria em xeque
        const inCheck = this.isKingInCheck(originalPiece.cor);

        // Restaura a posição original do tabuleiro
        this.board[from] = originalPiece;
        this.board[to] = targetPiece;

        // Retorna se o movimento não colocaria o rei em xeque
        return !inCheck;
    }

    isKingInCheck(color) {
        const kingPos = this.board.findIndex(p => p && ((p.tipo === '♔' && p.cor === color) || (p.tipo === '♚' && p.cor === color)));
        if (kingPos === -1) return false;

        for (let i = 0; i < 64; i++) {
            const p = this.board[i];
            if (p && p.cor !== color) {
                const moves = this.getPossibleMovesWithoutCheckFilter(i);
                if (moves.includes(kingPos)) return true;
            }
        }
        return false;
    }

    getPossibleMovesWithoutCheckFilter(pos) {
        const piece = this.board[pos];
        if (!piece) return [];

        const moves = [];
        const addMove = (to) => {
            if (!this.isValidPosition(to)) return;
            const target = this.board[to];
            if (!target || target.cor !== piece.cor) moves.push(to);
        };

        const row = Math.floor(pos / 8);
        const col = pos % 8;

        switch(piece.tipo) {
            case '♙':
                if (row > 0 && !this.board[pos - 8]) moves.push(pos - 8);
                if (row === 6 && !this.board[pos - 8] && !this.board[pos - 16]) moves.push(pos - 16);
                if (col > 0 && this.board[pos - 9] && this.board[pos - 9].cor === 'pretas') moves.push(pos - 9);
                if (col < 7 && this.board[pos - 7] && this.board[pos - 7].cor === 'pretas') moves.push(pos - 7);
                break;
            case '♟':
                if (row < 7 && !this.board[pos + 8]) moves.push(pos + 8);
                if (row === 1 && !this.board[pos + 8] && !this.board[pos + 16]) moves.push(pos + 16);
                if (col < 7 && this.board[pos + 9] && this.board[pos + 9].cor === 'brancas') moves.push(pos + 9);
                if (col > 0 && this.board[pos + 7] && this.board[pos + 7].cor === 'brancas') moves.push(pos + 7);
                break;
            case '♖': case '♜': moves.push(...this.getSlidingMoves(pos, [-1,1,-8,8])); break;
            case '♗': case '♝': moves.push(...this.getSlidingMoves(pos, [-9,-7,7,9])); break;
            case '♕': case '♛': moves.push(...this.getSlidingMoves(pos, [-1,1,-8,8,-9,-7,7,9])); break;
            case '♘': case '♞': [-17,-15,-10,-6,6,10,15,17].forEach(o => addMove(pos + o)); break;
            case '♔': case '♚': [-9,-8,-7,-1,1,7,8,9].forEach(o => addMove(pos + o)); break;
        }

        return moves;
    }

    isCheckmate(color) {
        if (!this.isKingInCheck(color)) return false;

        for (let i = 0; i < 64; i++) {
            const p = this.board[i];
            if (p && p.cor === color) {
                const moves = this.getPossibleMoves(i);
                for (let m of moves) {
                    const originalPiece = this.board[i];
                    const targetPiece = this.board[m];

                    // Realiza o movimento temporário
                    this.board[m] = originalPiece;
                    this.board[i] = null;
                    
                    if (!this.isKingInCheck(color)) {
                        this.board[i] = originalPiece;
                        this.board[m] = targetPiece;
                        return false;
                    }

                    this.board[i] = originalPiece;
                    this.board[m] = targetPiece;
                }
            }
        }

        return true;
    }
}

