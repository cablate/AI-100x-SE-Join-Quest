/**
 * 📦 模組：Chinese Chess Board
 * 🕒 最後更新：2025-07-01
 * 🧑‍💻 作者/更新者：@CabLate
 * 📝 摘要：象棋棋盤類別，處理棋盤狀態和移動驗證
 */

import { MoveResult, Piece, PieceColor, PieceType, Position } from "./types";

export class ChessBoard {
  private board: (Piece | null)[][] = [];

  constructor() {
    this.initializeEmptyBoard();
  }

  private initializeEmptyBoard(): void {
    this.board = Array(10)
      .fill(null)
      .map(() => Array(9).fill(null));
  }

  public placePiece(
    type: PieceType,
    color: PieceColor,
    position: Position
  ): void {
    if (!this.isValidPosition(position)) {
      throw new Error(`Invalid position: (${position.row}, ${position.col})`);
    }

    const piece: Piece = { type, color, position };
    this.board[position.row - 1][position.col - 1] = piece;
  }

  public getPiece(position: Position): Piece | null {
    if (!this.isValidPosition(position)) {
      return null;
    }
    return this.board[position.row - 1][position.col - 1];
  }

  public movePiece(from: Position, to: Position): MoveResult {
    const piece = this.getPiece(from);
    if (!piece) {
      return { isLegal: false, reason: "No piece at source position" };
    }

    const targetPiece = this.getPiece(to);
    const moveResult = this.validateMove(piece, from, to);

    if (moveResult.isLegal) {
      // 檢查是否捕獲將軍
      const isCapturingGeneral = targetPiece && targetPiece.type === "general";

      // 執行移動
      this.board[from.row - 1][from.col - 1] = null;
      piece.position = to;
      this.board[to.row - 1][to.col - 1] = piece;

      // 設定結果
      moveResult.isCapture = !!targetPiece;
      moveResult.isWin = !!isCapturingGeneral;
    }

    return moveResult;
  }

  private validateMove(piece: Piece, from: Position, to: Position): MoveResult {
    if (!this.isValidPosition(to)) {
      return { isLegal: false, reason: "Target position is out of bounds" };
    }

    // 檢查目標位置是否有同色棋子
    const targetPiece = this.getPiece(to);
    if (targetPiece && targetPiece.color === piece.color) {
      return { isLegal: false, reason: "Cannot capture own piece" };
    }

    // 根據棋子類型驗證移動
    switch (piece.type) {
      case "general":
        return this.validateGeneralMove(piece, from, to);
      case "guard":
        return this.validateGuardMove(piece, from, to);
      case "rook":
        return this.validateRookMove(piece, from, to);
      case "horse":
        return this.validateHorseMove(piece, from, to);
      case "cannon":
        return this.validateCannonMove(piece, from, to);
      case "elephant":
        return this.validateElephantMove(piece, from, to);
      case "soldier":
        return this.validateSoldierMove(piece, from, to);
      default:
        return { isLegal: false, reason: "Unknown piece type" };
    }
  }

  private validateGeneralMove(
    piece: Piece,
    from: Position,
    to: Position
  ): MoveResult {
    // 檢查是否在皇宮內
    if (!this.isInPalace(to, piece.color)) {
      return { isLegal: false, reason: "General must stay in palace" };
    }

    // 檢查是否只移動一格（橫向或縱向）
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);

    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
      // 檢查將帥對面規則
      if (this.wouldGeneralsFaceEachOther(piece, to)) {
        return { isLegal: false, reason: "Generals cannot face each other" };
      }
      return { isLegal: true };
    }

    return {
      isLegal: false,
      reason: "General can only move one step horizontally or vertically",
    };
  }

  private validateGuardMove(
    piece: Piece,
    from: Position,
    to: Position
  ): MoveResult {
    // 檢查是否在皇宮內
    if (!this.isInPalace(to, piece.color)) {
      return { isLegal: false, reason: "Guard must stay in palace" };
    }

    // 檢查是否斜向移動一格
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);

    if (rowDiff === 1 && colDiff === 1) {
      return { isLegal: true };
    }

    return {
      isLegal: false,
      reason: "Guard can only move diagonally one step",
    };
  }

  private validateRookMove(
    piece: Piece,
    from: Position,
    to: Position
  ): MoveResult {
    // 車只能直線移動
    if (from.row !== to.row && from.col !== to.col) {
      return { isLegal: false, reason: "Rook can only move in straight lines" };
    }

    // 檢查路徑是否有阻擋
    if (this.hasObstacleInPath(from, to)) {
      return { isLegal: false, reason: "Path is blocked" };
    }

    return { isLegal: true };
  }

  private validateHorseMove(
    piece: Piece,
    from: Position,
    to: Position
  ): MoveResult {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);

    // 馬走日：2+1 或 1+2
    if (
      !((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))
    ) {
      return { isLegal: false, reason: "Horse must move in L-shape" };
    }

    // 檢查蹩腳
    const legPosition = this.getHorseLegPosition(from, to);
    if (this.getPiece(legPosition)) {
      return { isLegal: false, reason: "Horse leg is blocked" };
    }

    return { isLegal: true };
  }

  private validateCannonMove(
    piece: Piece,
    from: Position,
    to: Position
  ): MoveResult {
    // 炮只能直線移動
    if (from.row !== to.row && from.col !== to.col) {
      return {
        isLegal: false,
        reason: "Cannon can only move in straight lines",
      };
    }

    const targetPiece = this.getPiece(to);
    const screenCount = this.countScreensInPath(from, to);

    if (targetPiece) {
      // 打子需要恰好一個炮架
      if (screenCount !== 1) {
        return {
          isLegal: false,
          reason: "Cannon needs exactly one screen to capture",
        };
      }
    } else {
      // 移動不能有炮架
      if (screenCount !== 0) {
        return {
          isLegal: false,
          reason: "Cannon cannot jump over pieces when not capturing",
        };
      }
    }

    return { isLegal: true };
  }

  private validateElephantMove(
    piece: Piece,
    from: Position,
    to: Position
  ): MoveResult {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);

    // 象走田：2+2
    if (rowDiff !== 2 || colDiff !== 2) {
      return {
        isLegal: false,
        reason: "Elephant must move diagonally 2 steps",
      };
    }

    // 檢查是否跨河
    if (this.isCrossingRiver(piece.color, from, to)) {
      return { isLegal: false, reason: "Elephant cannot cross the river" };
    }

    // 檢查塞象眼
    const eyePosition: Position = {
      row: from.row + (to.row - from.row) / 2,
      col: from.col + (to.col - from.col) / 2,
    };
    if (this.getPiece(eyePosition)) {
      return { isLegal: false, reason: "Elephant eye is blocked" };
    }

    return { isLegal: true };
  }

  private validateSoldierMove(
    piece: Piece,
    from: Position,
    to: Position
  ): MoveResult {
    const rowDiff = to.row - from.row;
    const colDiff = Math.abs(to.col - from.col);

    // 只能移動一格
    if (Math.abs(rowDiff) + colDiff !== 1) {
      return { isLegal: false, reason: "Soldier can only move one step" };
    }

    const hasCrossedRiver = this.hasSoldierCrossedRiver(piece.color, from);

    if (hasCrossedRiver) {
      // 過河後可以橫移或前進，但不能後退
      if (piece.color === "red" && rowDiff < 0) {
        return { isLegal: false, reason: "Soldier cannot move backward" };
      }
      if (piece.color === "black" && rowDiff > 0) {
        return { isLegal: false, reason: "Soldier cannot move backward" };
      }
    } else {
      // 未過河只能前進
      if (colDiff !== 0) {
        return {
          isLegal: false,
          reason: "Soldier cannot move sideways before crossing river",
        };
      }
      if (piece.color === "red" && rowDiff <= 0) {
        return { isLegal: false, reason: "Red soldier must move forward" };
      }
      if (piece.color === "black" && rowDiff >= 0) {
        return { isLegal: false, reason: "Black soldier must move forward" };
      }
    }

    return { isLegal: true };
  }

  // 輔助方法
  private isValidPosition(pos: Position): boolean {
    return pos.row >= 1 && pos.row <= 10 && pos.col >= 1 && pos.col <= 9;
  }

  private isInPalace(pos: Position, color: PieceColor): boolean {
    if (color === "red") {
      return pos.row >= 1 && pos.row <= 3 && pos.col >= 4 && pos.col <= 6;
    } else {
      return pos.row >= 8 && pos.row <= 10 && pos.col >= 4 && pos.col <= 6;
    }
  }

  private wouldGeneralsFaceEachOther(
    movingGeneral: Piece,
    newPos: Position
  ): boolean {
    // 找到對方的將
    let opponentGeneral: Piece | null = null;
    for (let row = 1; row <= 10; row++) {
      for (let col = 1; col <= 9; col++) {
        const piece = this.getPiece({ row, col });
        if (
          piece &&
          piece.type === "general" &&
          piece.color !== movingGeneral.color
        ) {
          opponentGeneral = piece;
          break;
        }
      }
    }

    if (!opponentGeneral) return false;

    // 檢查是否在同一列
    if (newPos.col !== opponentGeneral.position.col) return false;

    // 檢查中間是否有其他棋子
    const startRow = Math.min(newPos.row, opponentGeneral.position.row) + 1;
    const endRow = Math.max(newPos.row, opponentGeneral.position.row) - 1;

    for (let row = startRow; row <= endRow; row++) {
      if (this.getPiece({ row, col: newPos.col })) {
        return false; // 中間有棋子，不會對面
      }
    }

    return true; // 將帥對面
  }

  private hasObstacleInPath(from: Position, to: Position): boolean {
    const rowStep =
      from.row === to.row
        ? 0
        : (to.row - from.row) / Math.abs(to.row - from.row);
    const colStep =
      from.col === to.col
        ? 0
        : (to.col - from.col) / Math.abs(to.col - from.col);

    let currentRow = from.row + rowStep;
    let currentCol = from.col + colStep;

    while (currentRow !== to.row || currentCol !== to.col) {
      if (this.getPiece({ row: currentRow, col: currentCol })) {
        return true;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }

    return false;
  }

  private getHorseLegPosition(from: Position, to: Position): Position {
    const rowDiff = to.row - from.row;
    const colDiff = to.col - from.col;

    if (Math.abs(rowDiff) === 2) {
      // 豎走，腿在中間行
      return { row: from.row + rowDiff / 2, col: from.col };
    } else {
      // 橫走，腿在中間列
      return { row: from.row, col: from.col + colDiff / 2 };
    }
  }

  private countScreensInPath(from: Position, to: Position): number {
    let count = 0;
    const rowStep =
      from.row === to.row
        ? 0
        : (to.row - from.row) / Math.abs(to.row - from.row);
    const colStep =
      from.col === to.col
        ? 0
        : (to.col - from.col) / Math.abs(to.col - from.col);

    let currentRow = from.row + rowStep;
    let currentCol = from.col + colStep;

    while (currentRow !== to.row || currentCol !== to.col) {
      if (this.getPiece({ row: currentRow, col: currentCol })) {
        count++;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }

    return count;
  }

  private isCrossingRiver(
    color: PieceColor,
    from: Position,
    to: Position
  ): boolean {
    if (color === "red") {
      return from.row <= 5 && to.row > 5;
    } else {
      return from.row > 5 && to.row <= 5;
    }
  }

  private hasSoldierCrossedRiver(
    color: PieceColor,
    position: Position
  ): boolean {
    if (color === "red") {
      return position.row > 5;
    } else {
      return position.row <= 5;
    }
  }

  public clear(): void {
    this.initializeEmptyBoard();
  }

  public isGameOver(): { isOver: boolean; winner?: PieceColor } {
    let redGeneral = false;
    let blackGeneral = false;

    for (let row = 1; row <= 10; row++) {
      for (let col = 1; col <= 9; col++) {
        const piece = this.getPiece({ row, col });
        if (piece && piece.type === "general") {
          if (piece.color === "red") redGeneral = true;
          if (piece.color === "black") blackGeneral = true;
        }
      }
    }

    if (!redGeneral) return { isOver: true, winner: "black" };
    if (!blackGeneral) return { isOver: true, winner: "red" };

    return { isOver: false };
  }
}
