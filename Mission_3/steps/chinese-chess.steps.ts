/**
 * 📦 模組：Chinese Chess Step Definitions
 * 🕒 最後更新：2025-07-01
 * 🧑‍💻 作者/更新者：@CabLate
 * 📝 摘要：象棋遊戲的 Cucumber Step Definitions
 */

const { Given, When, Then } = require("@cucumber/cucumber");
import { ChessBoard } from "../src/ChessBoard";
import { MoveResult } from "../src/types";

// 全域變數來儲存測試狀態
let chessBoard: ChessBoard;
let moveResult: MoveResult | null = null;
let gameOverResult: { isOver: boolean; winner?: "red" | "black" } | null = null;

// 移除重複的 step definitions，使用更通用的版本

Then("the move is legal", function () {
  if (!moveResult) {
    throw new Error("移動結果為空");
  }
  if (!moveResult.isLegal) {
    throw new Error(`移動不合法：${moveResult.reason}`);
  }
});

Then("the move is illegal", function () {
  if (!moveResult) {
    throw new Error("移動結果為空");
  }
  if (moveResult.isLegal) {
    throw new Error("移動應該是不合法的，但系統判斷為合法");
  }
});

// 處理表格資料的步驟
Given("the board has:", function (dataTable: any) {
  chessBoard = new ChessBoard();
  const rows = dataTable.hashes();

  rows.forEach((row: any) => {
    const pieceInfo = row.Piece.split(" ");
    const color = pieceInfo[0].toLowerCase() as "red" | "black";
    const pieceType = pieceInfo[1].toLowerCase() as any;

    // 轉換棋子名稱
    const typeMap: Record<string, string> = {
      general: "general",
      guard: "guard",
      rook: "rook",
      horse: "horse",
      cannon: "cannon",
      elephant: "elephant",
      soldier: "soldier",
    };

    const actualType = typeMap[pieceType] || pieceType;

    // 解析位置
    const positionMatch = row.Position.match(/\((\d+),\s*(\d+)\)/);
    if (positionMatch) {
      const rowNum = parseInt(positionMatch[1]);
      const colNum = parseInt(positionMatch[2]);
      chessBoard.placePiece(actualType, color, { row: rowNum, col: colNum });
    }
  });
});

// 處理單一棋子的步驟
Given(
  "the board is empty except for a Red {word} at \\({int}, {int}\\)",
  function (pieceType: string, row: number, col: number) {
    chessBoard = new ChessBoard();
    const actualType = pieceType.toLowerCase();
    chessBoard.placePiece(actualType as any, "red", { row, col });
  }
);

Given(
  "the board is empty except for a Black {word} at \\({int}, {int}\\)",
  function (pieceType: string, row: number, col: number) {
    chessBoard = new ChessBoard();
    const actualType = pieceType.toLowerCase();
    chessBoard.placePiece(actualType as any, "black", { row, col });
  }
);

// 處理移動的步驟
When(
  "Red moves the {word} from \\({int}, {int}\\) to \\({int}, {int}\\)",
  function (
    pieceType: string,
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
  ) {
    moveResult = chessBoard.movePiece(
      { row: fromRow, col: fromCol },
      { row: toRow, col: toCol }
    );

    // 檢查遊戲是否結束
    gameOverResult = chessBoard.isGameOver();
  }
);

// 處理勝利條件
Then("Red wins immediately", function () {
  if (!moveResult) {
    throw new Error("移動結果為空");
  }
  if (!moveResult.isLegal) {
    throw new Error(`移動不合法：${moveResult.reason}`);
  }
  if (!moveResult.isWin) {
    throw new Error("紅方應該立即獲勝");
  }
});

Then("the game is not over just from that capture", function () {
  if (!moveResult) {
    throw new Error("移動結果為空");
  }
  if (!moveResult.isLegal) {
    throw new Error(`移動不合法：${moveResult.reason}`);
  }
  if (moveResult.isWin) {
    throw new Error("遊戲不應該結束");
  }
});
