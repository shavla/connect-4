import { GameMode } from "./main";
import { Application, Container, Graphics } from "pixi.js";
import { Layout } from "./layout";
import { Piece } from "./piece";
import gsap from "gsap";

export class GameBoard {
    private cells: (number | Piece)[][] = [];
    private isPlayerTurn: boolean = true;
    private hitAreas: Graphics[] = [];
    private isGameGoing: boolean = true;
    private board: Container  = new Container();

    constructor(private app: Application, private gameMode: GameMode, private showFinishDialog: (isPlayerTurn: boolean) => void) {
        this.createBoard();
        this.createHitAreas();
        this.createEmptyCells();
    }

    private createBoard() {
        const board = new Graphics();
        board.rect(0, 0, Layout.Board.sizeX * Layout.Board.boxSize, Layout.Board.sizeY * Layout.Board.boxSize)
        board.fill(0x1c62f1)
        for (let i = 0; i < Layout.Board.sizeX; i++) {
            for (let j = 0; j < Layout.Board.sizeY; j++) {
                let x = i * Layout.Board.boxSize + Layout.Board.boxSize / 2;
                let y = j * Layout.Board.boxSize + Layout.Board.boxSize / 2;
                board.circle(x, y, Layout.Board.circleRadius);
            }
        }
        board.cut();
        this.board.addChild(board);
        this.board.position.set(this.app.renderer.width / 2, this.app.renderer.height / 2);
        this.board.pivot.set(board.width / 2, board.height / 2);
        this.app.stage.addChild(this.board);
    }

    private createHitAreas() {
        for (let i = 0; i < Layout.Board.sizeX; i++) {
            const rect = new Graphics();
            rect.rect(i * Layout.Board.boxSize, 0, Layout.Board.boxSize, Layout.Board.sizeY * Layout.Board.boxSize);
            rect.fill("#de3249");
            rect.eventMode = 'static';
            rect.alpha = 0;
            rect.on("click", () => this.handleClick(i));
            this.board.addChild(rect);
            this.hitAreas.push(rect);
        }
    }

    private createEmptyCells() {
        this.cells = new Array(Layout.Board.sizeY).fill(null).map(() => new Array(Layout.Board.sizeX).fill(0));
    }

    private handleClick(index: number) {
        if (this.canAddInCol(index)) {
            this.disableHitAreas();
            this.displayPieceInBox(index);
        }
    }

    private canAddInCol(index: number) {
        for (let i = 0; i < this.cells.length; i++) {
            if (this.cells[i][index] == 0) {
                return true;
            }
        }
        return false;
    }

    private disableHitAreas() {
        this.hitAreas.forEach(area => area.eventMode = "none");
    }

    private enableHitAreas() {
        this.hitAreas.forEach(area => area.eventMode = "static");
    }

    private checkForWin(row: number, col: number) {
        // //all combinations
        if (this.checkHorizontalWin(row, col) ||
            this.checkVerticalWin(row, col) ||
            this.checkDiagonallyLeftToRight(row, col) ||
            this.checkDiagonallyRightToLeft(row, col)) {
            this.gameFinished();
        }
    }

    private gameFinished() {
        this.isGameGoing = false;
        this.disableHitAreas();
        this.showFinishDialog(this.isPlayerTurn);
    }

    restartGame(mode: GameMode) {
        this.gameMode = mode;
        this.isGameGoing = true;
        this.isPlayerTurn = true;
        this.enableHitAreas();
        this.cleanCells();
    }

    private cleanCells() {
        for (let i = 0; i < this.cells.length; i++) {
            for (let j = 0; j < this.cells[i].length; j++) {
                let item = this.cells[i][j];
                if (item != 0) {
                    (item as Piece).piece.destroy();
                    item = 0;
                }
            }
        }
        this.createEmptyCells();
    }

    private changePlayer() {
        this.isPlayerTurn = !this.isPlayerTurn;
    }

    private displayPieceInBox(index: number) {
        for (let i = this.cells.length - 1; i >= 0; i--) {
            if (this.cells[i][index] == 0) {
                let piece = new Piece(this.isPlayerTurn, index, i);
                this.cells[i][index] = piece;
                piece.piece.position.set(index * Layout.Board.boxSize, 0);
                gsap.to(piece.piece, {
                    ease: "bounce.out",
                    duration: 0.7,
                    pixi: {
                        x: index * Layout.Board.boxSize,
                        y: i * Layout.Board.boxSize
                    },
                    onComplete: () => {
                        this.checkForWin(i, index);
                        this.secondPlayerTurn();
                    }
                })
                piece.piece.zIndex = -1;
                this.board.addChild(piece.piece);
                break;
            }
        }
    }

    private secondPlayerTurn() {
        if (this.isGameGoing) {
            this.changePlayer();
            if (this.isPlayerTurn) {
                this.enableHitAreas();
            } else {
                if (this.gameMode == GameMode.SINGLE) {
                    this.dropRandomly();
                }
                if (this.gameMode == GameMode.MULTIPLIER) {
                    this.enableHitAreas();
                }
            }
        }
    }

    private dropRandomly() {
        setTimeout(() => {
            let indexes = this.getAllEmptyIndexes();
            let randomIndex = indexes[Math.floor(Math.random() * indexes.length)];
            this.displayPieceInBox(randomIndex);
        }, 700);
    }

    private getAllEmptyIndexes() {
        let indexes = this.cells[0].map((elements, i) => elements == 0 ? i : -1)
            .filter(index => index !== -1);
        return indexes;
    }

    private checkDiagonallyRightToLeft(row: number, col: number) {
        for (let i = 0; i < 4; i++) {
            let count = 0;
            for (let j = 0; j < 4; j++) {
                let x = row - 3 + i + j;
                let y = col + 3 - i - j;
                if ((this.cells[x]?.[y] as Piece)?.isPlayer === this.isPlayerTurn) count++;
                // if (this.cells[x]) {
                //     let piece = this.cells[x][y];
                //     if (piece) {
                //         if ((piece as Piece).isPlayer == this.isPlayerTurn) count++;
                //     }
                // }
            }
            if (count == 4) return true;
        }
        return false;
    }

    private checkDiagonallyLeftToRight(row: number, col: number) {
        for (let i = 0; i < 4; i++) {
            let count = 0;
            for (let j = 0; j < 4; j++) {
                let x = row - 3 + i + j;
                let y = col - 3 + i + j;
                if ((this.cells[x]?.[y] as Piece)?.isPlayer === this.isPlayerTurn) count++;
            }
            if (count == 4) return true;
        }
        return false;
    }

    private checkVerticalWin(row: number, col: number) {
        // start and end
        for (let i = Math.max(row - 3, 0); i <= Math.min(row, this.cells.length - 4); i++) {
            let count = 0;
            for (let j = 0; j < 4; j++) {
                let piece = this.cells[i + j][col];
                if (piece) {
                    if ((piece as Piece).isPlayer == this.isPlayerTurn) count++;
                }
            }
            if (count == 4) return true;
        }
        return false;
    }

    private checkHorizontalWin(row: number, col: number) {
        // start and end
        for (let i = Math.max(col - 3, 0); i <= Math.min(col, this.cells[row].length - 4); i++) {
            let count = 0;
            for (let j = 0; j < 4; j++) {
                let piece = this.cells[row][i + j];
                if (piece) {
                    if ((piece as Piece).isPlayer == this.isPlayerTurn) count++;
                }
            }
            if (count == 4) return true;
        }
        return false;
    }
}