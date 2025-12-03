/* ============================================================
   CONFIGURAÇÕES INICIAIS
============================================================ */
let board = [
    ["l","n","s","g","k","g","s","n","l"],
    [".","r",".",".",".",".",".","b","."],
    ["p","p","p","p","p","p","p","p","p"],
    [".",".",".",".",".",".",".",".","."],
    [".",".",".",".",".",".",".",".","."],
    [".",".",".",".",".",".",".",".","."],
    ["P","P","P","P","P","P","P","P","P"],
    [".","B",".",".",".",".",".","R","."],
    ["L","N","S","G","K","G","S","N","L"]
];
let currentPlayer = "PLAYER";
let capturedPlayer = [];
let capturedAI = [];
let selectedPiece = null;
let selectedDropPiece = null;
let gameOver = false;

const PLAYER = "PLAYER";
const AI = "AI";

/* ============================================================
   FUNÇÕES AUXILIARES
============================================================ */
function isPlayerPiece(p){ return p && p === p.toUpperCase(); }
function isAIPiece(p){ return p && p === p.toLowerCase(); }
function unpromote(p){ return p.replace("+","").toUpperCase(); }
function pieceImageFromBase(p){ return p.toUpperCase() + ".svg"; }
function randomChoice(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

/* ============================================================
   LEGAL MOVES — movimentos de cada peça
============================================================ */
function legalMoves(sel) {
    const moves = [];
    const r = sel.r;
    const c = sel.c;
    const p = sel.p;
    const isPlayer = isPlayerPiece(p);
    const forward = isPlayer ? -1 : 1; // jogador move "para cima"

    function addMove(tr, tc) {
        if (tr < 0 || tr > 8 || tc < 0 || tc > 8) return;
        const target = board[tr][tc];
        if (target === "." || (isPlayer && isAIPiece(target)) || (!isPlayer && isPlayerPiece(target))) {
            moves.push({from:[r,c], to:[tr,tc], piece:p});
        }
    }

    const base = p.toUpperCase();
    switch(base) {
        case "P": // Peão
            addMove(r+forward, c);
            break;
        case "L": // Lança
            for (let i=1;i<9;i++){
                let tr = r + i*forward;
                if (tr<0||tr>8) break;
                let target = board[tr][c];
                if (target === ".") moves.push({from:[r,c], to:[tr,c], piece:p});
                else { if ((isPlayer && isAIPiece(target)) || (!isPlayer && isPlayerPiece(target))) moves.push({from:[r,c], to:[tr,c], piece:p}); break;}
            }
            break;
        case "N": // Cavalo
            let nr = r + 2*forward;
            if (nr >=0 && nr <=8){
                if (c-1 >=0) addMove(nr, c-1);
                if (c+1 <=8) addMove(nr, c+1);
            }
            break;
        case "S": // Prata
            [[forward,0],[forward,-1],[forward,1],[-forward,-1],[-forward,1]].forEach(([dr,dc])=>addMove(r+dr,c+dc));
            break;
        case "G": // Ouro e promovidos
        case "P+": case "L+": case "N+": case "S+":
            [[forward,0],[0,-1],[0,1],[forward,-1],[forward,1],[-forward,0]].forEach(([dr,dc])=>addMove(r+dr,c+dc));
            break;
        case "B": // Bispo
            [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>{
                for(let i=1;i<9;i++){
                    let tr=r+dr*i, tc=c+dc*i;
                    if(tr<0||tr>8||tc<0||tc>8) break;
                    let target = board[tr][tc];
                    if(target === ".") moves.push({from:[r,c], to:[tr,tc], piece:p});
                    else { if((isPlayer&&isAIPiece(target))||(!isPlayer&&isPlayerPiece(target))) moves.push({from:[r,c], to:[tr,tc], piece:p}); break; }
                }
            });
            break;
        case "R": // Torre
            [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>{
                for(let i=1;i<9;i++){
                    let tr=r+dr*i, tc=c+dc*i;
                    if(tr<0||tr>8||tc<0||tc>8) break;
                    let target = board[tr][tc];
                    if(target === ".") moves.push({from:[r,c], to:[tr,tc], piece:p});
                    else { if((isPlayer&&isAIPiece(target))||(!isPlayer&&isPlayerPiece(target))) moves.push({from:[r,c], to:[tr,tc], piece:p}); break; }
                }
            });
            break;
        case "K": // Rei
            [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>addMove(r+dr,c+dc));
            break;
    }
    return moves;
}

/* ============================================================
   HIGHLIGHT DOS MOVIMENTOS VÁLIDOS
============================================================ */
function highlightMoves(r,c,p){
    clearHighlights();
    const moves = legalMoves({r,c,p});
    moves.forEach(mv=>{
        const [tr,tc] = mv.to;
        const cell = document.querySelector(`.cell[data-r='${tr}'][data-c='${tc}']`);
        if(cell) cell.style.backgroundColor = "#a2f5a2"; // verde suave
    });
}

function clearHighlights(){
    document.querySelectorAll(".cell").forEach(cell=>cell.style.backgroundColor="");
}

/* ============================================================
   DROPS
============================================================ */
function dropIsLegal(piece,r,c){
    if(board[r][c] !== ".") return false;
    const p = piece.piece;
    if(p === "P" && columnHasPawn(PLAYER,c)) return false;
    if(p === "P" || p === "L") if(r===0) return false;
    if(p === "N") if(r<=1) return false;
    return true;
}
function makeDrop(move){
    const {piece,to} = move;
    const [r,c] = to;
    const idx = capturedPlayer.indexOf(piece);
    if(idx>=0) capturedPlayer.splice(idx,1);
    board[r][c] = piece;
    renderCaptures();
}
function columnHasPawn(side,col){
    for(let r=0;r<9;r++){
        const p = board[r][col];
        if(side===PLAYER && p==="P") return true;
        if(side===AI && p==="p") return true;
    }
    return false;
}

/* ============================================================
   MOVIMENTOS
============================================================ */
function makeMove(move){
    const {from,to,piece} = move;
    const [fr,fc] = from;
    const [tr,tc] = to;
    const target = board[tr][tc];
    if(target !== "."){
        if(isPlayerPiece(piece)) capturedPlayer.push(unpromote(target));
        else capturedAI.push(unpromote(target));
    }
    board[tr][tc] = piece;
    board[fr][fc] = ".";
    renderCaptures();
}

/* ============================================================
   REI, XEQUE E XEQUE-MATE
============================================================ */
function findKing(side){
    const target = side===PLAYER?"K":"k";
    for(let r=0;r<9;r++) for(let c=0;c<9;c++) if(board[r][c]===target) return [r,c];
    return null;
}
function kingIsInCheck(side){
    const kingPos = findKing(side);
    if(!kingPos) return false;
    const [kr,kc] = kingPos;
    const enemySide = side===PLAYER?AI:PLAYER;
    for(let r=0;r<9;r++){
        for(let c=0;c<9;c++){
            const p = board[r][c];
            if(!p) continue;
            if(side===PLAYER && isAIPiece(p)){
                if(legalMoves({r,c,p}).some(m=>m.to[0]===kr && m.to[1]===kc)) return true;
            }
            if(side===AI && isPlayerPiece(p)){
                if(legalMoves({r,c,p}).some(m=>m.to[0]===kr && m.to[1]===kc)) return true;
            }
        }
    }
    return false;
}

/* ============================================================
   RENDER E INTERAÇÃO
============================================================ */
function renderCaptures(){
    const pArea = document.getElementById("captures-player");
    const aArea = document.getElementById("captures-ai");
    pArea.innerHTML = "Suas capturas:<br>";
    aArea.innerHTML = "Capturas da IA:<br>";
    for(const p of capturedPlayer) pArea.innerHTML+=`<img class="piece" src="pieces/${pieceImageFromBase(p)}">`;
    for(const p of capturedAI) aArea.innerHTML+=`<img class="piece" src="pieces/${pieceImageFromBase(p)}">`;
}
function render(){
    const boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";
    for(let r=0;r<9;r++){
        for(let c=0;c<9;c++){
            const cell = document.createElement("div");
            cell.className="cell";
            cell.dataset.r=r;
            cell.dataset.c=c;
            const p = board[r][c];
            if(p!=="."){
                const img = document.createElement("img");
                img.src="pieces/"+p.toUpperCase()+".svg";
                img.style.width="60px";
                img.style.height="60px";
                cell.appendChild(img);
            }
            cell.onclick=()=>handleClick(r,c);
            boardDiv.appendChild(cell);
        }
    }
    renderCaptures();
}
function handleClick(r,c){
    const clickedPiece = board[r][c];
    if(selectedPiece){
        const move = {from:selectedPiece,to:[r,c],piece:board[selectedPiece[0]][selectedPiece[1]]};
        if(legalMoves({r:selectedPiece[0],c:selectedPiece[1],p:move.piece}).some(m=>m.to[0]===r && m.to[1]===c)){
            makeMove(move);
            clearHighlights();
            selectedPiece = null;
            render();
            setTimeout(aiPlay,300);
        }else{ selectedPiece=null; clearHighlights(); }
        return;
    }
    if(clickedPiece!=="."){
        if(isPlayerPiece(clickedPiece)){
            selectedPiece=[r,c];
            highlightMoves(r,c,clickedPiece);
        }
    }
}

/* ============================================================
   IA SIMPLES
============================================================ */
function aiPlay(){
    if(gameOver) return;
    const moves = [];
    for(let r=0;r<9;r++){
        for(let c=0;c<9;c++){
            const p = board[r][c];
            if(p!== "." && isAIPiece(p)) legalMoves({r,c,p}).forEach(mv=>moves.push(mv));
        }
    }
    if(moves.length===0){ log("IA não tem jogadas. Você venceu!"); gameOver=true; return; }
    const move = randomChoice(moves);
    makeMove(move);
    render();
}

/* ============================================================
   INIT
============================================================ */
render();


// ---------- Help Modal ----------
document.addEventListener("DOMContentLoaded", () => {
    const helpBtn = document.getElementById("help-btn");
    const helpModal = document.getElementById("help-modal");
    const helpClose = document.getElementById("help-close");

    helpBtn.onclick = () => {
        helpModal.style.display = "block";
    };

    helpClose.onclick = () => {
        helpModal.style.display = "none";
    };

    // Fechar clicando fora do modal
    window.onclick = (event) => {
        if (event.target === helpModal) {
            helpModal.style.display = "none";
        }
    };
});


