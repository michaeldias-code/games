// AI.js -vGem
import { MoveValidator } from "./MoveValidator.js";

export class AI {
    /**
     * @param {Board} board 
     * @param {MoveValidator} validator 
     * @param {EnPassant} enPassant Instância do módulo EnPassant
     */
    constructor(board, validator, enPassant) {
        this.board = board;
        this.validator = validator;
        this.enPassant = enPassant; // <<<< NOVO: Armazena a instância EnPassant
        console.log("AI carregado! Validator e EnPassant recebidos.");
    }

    getRandomMove(color) {
        console.log("Validator dentro da IA:", this.validator);
        const moves = [];

        // Gera todos os movimentos possíveis
        for (let i = 0; i < 64; i++) {
            const p = this.board.board[i];
            if (p && p.cor === color) {
                // getPossibleMoves já retorna movimentos EP se disponíveis.
                const possible = this.validator.getPossibleMoves(i); 
                for (let dest of possible) moves.push({ from: i, to: dest });
            }
        }

        if (moves.length === 0) return null;

        // Retorna um movimento aleatório
        return moves[Math.floor(Math.random() * moves.length)];
    }

    /**
     * Executa a jogada escolhida (random, por enquanto), aplicando a lógica EP.
     * @param {string} color A cor da IA.
     * @returns {{from: number, to: number}|null} O movimento realizado.
     */
    makeMove(color) {
        const m = this.getRandomMove(color);

        if (m) {
            const piece = this.board.board[m.from];

            // 1. Tenta detectar se o movimento é um En Passant
            let epCapturedPos = null;
            if (this.enPassant && piece.tipo in {'♙':1, '♟':1}) {
                // Verifica se é um movimento EP. O MoveValidator garante que o movimento seja legal.
                epCapturedPos = this.enPassant.isEnPassantMove(m.from, m.to, piece);
            }
            
            // 2. Executa o movimento, passando a posição EP capturada se for um EP
            // O Board.movePiece saberá se deve remover a peça adjacente ou não.
            this.board.movePiece(m.from, m.to, epCapturedPos); 
            
            // O GameController é responsável por limpar o estado EP do Board e transferir para o EnPassant.

            return m; 
        }
        return null;
    }

    // O método reset está funcional, mas deve garantir que o EnPassant também seja resetado
    reset() {
        console.log("Resetando IA...");
        // O GameController já recria e injeta as novas instâncias, então este método é principalmente informativo.
        // Se a IA fosse mais complexa (árvores de busca, cache), ela seria limpa aqui.
    }
}
