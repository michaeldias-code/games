// MoveValidator.js
export class MoveValidator {
    constructor(boardArray) {
        // boardArray é sempre this.board.board
        this.board = boardArray;
    }

    isValidPosition(pos) {
        return pos >= 0 && pos < 64;
    }

    getPossibleMoves(pos) {
        const piece = this.board[pos];
        if (!piece) return [];

        const moves = [];
        const addMove = (to) => {
            if (!this.isValidPosition(to)) return;
            const target = this.board[to];
            if (!target || target.cor !== piece.cor) moves.push(to);
        };

        // Peão branco
        if (piece.tipo === '♙') {
            if (this.isValidPosition(pos-8) && !this.board[pos-8]) moves.push(pos-8);
            if (Math.floor(pos/8) === 6 && !this.board[pos-16]) moves.push(pos-16);
            if (this.isValidPosition(pos-9) && this.board[pos-9]?.cor === 'pretas' && pos%8 !== 0) moves.push(pos-9);
            if (this.isValidPosition(pos-7) && this.board[pos-7]?.cor === 'pretas' && pos%8 !== 7) moves.push(pos-7);
        }
        // Peão preto
        else if (piece.tipo === '♟') {
            if (this.isValidPosition(pos+8) && !this.board[pos+8]) moves.push(pos+8);
            if (Math.floor(pos/8) === 1 && !this.board[pos+16]) moves.push(pos+16);
            if (this.isValidPosition(pos+9) && this.board[pos+9]?.cor === 'brancas' && pos%8 !== 7) moves.push(pos+9);
            if (this.isValidPosition(pos+7) && this.board[pos+7]?.cor === 'brancas' && pos%8 !== 0) moves.push(pos+7);
        } 
        // Torres, bispos, rainhas, cavalos e reis
        else {
            const directions = piece.getMoveOffsets?.() || [];
            for (let d of directions) {
                let p = pos + d;
                while (this.isValidPosition(p) && (Math.abs((p%8)-(pos%8)) <= 1 || d % 8 === 0)) {
                    if (!this.board[p]) moves.push(p);
                    else {
                        if (this.board[p].cor !== piece.cor) moves.push(p);
                        break;
                    }
                    // Apenas peças deslizantes vão continuar
                    if (!piece.isSliding?.()) break;
                    p += d;
                }
            }
        }

        return moves;
    }
}
console.log('MoveValidator carregado!');
