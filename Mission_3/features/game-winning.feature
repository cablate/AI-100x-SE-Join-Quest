Feature: Game Winning Rules (勝負規則)
  As a chess player
  I want to win by capturing the opponent's General
  So that the game has a clear victory condition

  Background:
    Given a standard Chinese chess board with 9×10 grid
    And positions are indicated as (row, col)
    And Row 1 is Red's bottom row, Row 10 is Black's top row
    And Column 1 is the leftmost column from Red's perspective

  @Winning
  Scenario: Red captures opponent's General and wins immediately (Legal)
    Given the board has:
      | Piece         | Position |
      | Red Rook      | (5, 5)   |
      | Black General | (5, 8)   |
    When Red moves the Rook from (5, 5) to (5, 8)
    Then Red wins immediately

  @Winning
  Scenario: Red captures a non-General piece and the game continues (Legal)
    Given the board has:
      | Piece         | Position |
      | Red Rook      | (5, 5)   |
      | Black Cannon  | (5, 8)   |
    When Red moves the Rook from (5, 5) to (5, 8)
    Then the game is not over just from that capture 