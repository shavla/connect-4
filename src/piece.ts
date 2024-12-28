import { Graphics } from "pixi.js";
import { Layout } from "./layout";

export class Piece {
    private _piece?: Graphics;
    private _x: number;
    private _y: number;
    private _isPlayer: boolean;

    constructor(isPlayer: boolean, x: number, y: number) {
        this._x = x;
        this._y = y;
        this._isPlayer = isPlayer;
        this.createPiece();
    }

    private createPiece() {
        this._piece = new Graphics();
        this._piece.circle(Layout.Board.boxSize/2, Layout.Board.boxSize/2, Layout.Board.boxSize/2);
        if (this._isPlayer) {
            this._piece.fill(Layout.Board.playerColor);
        } else {
            this._piece.fill(Layout.Board.oponentColor);
        }
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get piece(): Graphics {
        return this._piece as Graphics;
    }

    get isPlayer(): boolean {
        return this._isPlayer;
    }
}