/**
 * 📦 模組：Chinese Chess Types
 * 🕒 最後更新：2025-07-01
 * 🧑‍💻 作者/更新者：@CabLate
 * 📝 摘要：象棋遊戲的基本類型定義
 */

export type PieceColor = "red" | "black";

export type PieceType =
  | "general" // 將/帥
  | "guard" // 士/仕
  | "elephant" // 相/象
  | "horse" // 馬/傌
  | "rook" // 車
  | "cannon" // 炮
  | "soldier"; // 兵/卒

export interface Position {
  row: number; // 1-10
  col: number; // 1-9
}

export interface Piece {
  type: PieceType;
  color: PieceColor;
  position: Position;
}

export interface MoveResult {
  isLegal: boolean;
  reason?: string;
  isCapture?: boolean;
  isWin?: boolean;
}
