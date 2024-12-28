import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { Application } from 'pixi.js';
import { GameBoard } from './gameBoard.ts';
import './style.css';

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

class Lobby {
  private lobby: HTMLElement;
  private appContainer: HTMLElement;
  private singleButton: HTMLElement;
  private multiplierButton: HTMLElement;
  private gameBoard?: GameBoard;
  private dialog: HTMLElement;
  private dialogInfo: HTMLElement;
  private gameMode?: GameMode;
  private backToMenu: HTMLElement;
  private playAgain: HTMLElement;

  constructor() {
    this.lobby = document.querySelector("#lobby") as HTMLElement;
    this.appContainer = document.querySelector("#app") as HTMLElement;
    this.dialog = document.querySelector(".dialog-container") as HTMLElement;
    this.dialogInfo = document.querySelector(".info") as HTMLElement;
    this.singleButton = document.querySelector(".single-button") as HTMLElement;
    this.multiplierButton = document.querySelector(".multiplier-button") as HTMLElement;
    this.backToMenu = document.querySelector(".go-back") as HTMLElement;
    this.playAgain = document.querySelector(".play-again") as HTMLElement;
    this.initListeners();
  }

  private initListeners() {
    this.singleButton.addEventListener("click", () => {
      this.gameMode = GameMode.SINGLE;
      this.startGame(GameMode.SINGLE);
    });

    this.multiplierButton.addEventListener("click", () => {
      this.gameMode = GameMode.MULTIPLIER;
      this.startGame(GameMode.MULTIPLIER);
    });

    this.backToMenu.addEventListener("click", () => {
      this.backToLobby();
      this.dialog.classList.add("hidden");
    });

    this.playAgain.addEventListener("click", () => {
      this.startGame(this.gameMode as GameMode);
      this.dialog.classList.add("hidden");
    });
  }

  private async startGame(mode: GameMode) {
    if (!this.gameBoard) {
      const app = new Application();
      await app.init({ background: '#1099bb', resizeTo: window, antialias: true });
      this.appContainer?.append(app.canvas);
      this.gameBoard = new GameBoard(app, mode, this.showFinishDialog.bind(this));
    } else {
      this.gameBoard.restartGame(this.gameMode as GameMode);
    }
    this.hideLobby();
  }

  private showFinishDialog(isPlayerTurn: boolean) {
    this.dialog.classList.remove("hidden");
    let text = this.gameMode == GameMode.SINGLE ?
      isPlayerTurn ? "You Won!" : "Computer Won!" :
      isPlayerTurn ? "Player 1 Won!" : "Player 2 Won!";

    this.dialogInfo.textContent = text;
  }

  private backToLobby() {
    this.lobby.classList.remove("hidden");
    this.appContainer.classList.add("hidden");
  }

  private hideLobby() {
    this.lobby.classList.add("hidden");
    this.appContainer.classList.remove("hidden");
  }
}

const lobby = new Lobby();

export enum GameMode {
  SINGLE,
  MULTIPLIER
}

