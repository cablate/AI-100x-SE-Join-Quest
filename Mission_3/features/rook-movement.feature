Feature: Rook Movement Rules (車移動規則)
  As a chess player
  I want the Rook to move in straight lines without obstruction
  So that it can control ranks and files effectively

  Background:
    Given a standard Chinese chess board with 9×10 grid
    And positions are indicated as (row, col)
    And Row 1 is Red's bottom row, Row 10 is Black's top row
    And Column 1 is the leftmost column from Red's perspective

  @Rook
  Scenario: Red moves the Rook along a clear rank (Legal)
    Given the board is empty except for a Red Rook at (4, 1)
    When Red moves the Rook from (4, 1) to (4, 9)
    Then the move is legal

  @Rook
  Scenario: Red moves the Rook and attempts to jump over a piece (Illegal)
    Given the board has:
      | Piece         | Position |
      | Red Rook      | (4, 1)   |
      | Black Soldier | (4, 5)   |
    When Red moves the Rook from (4, 1) to (4, 9)
    Then the move is illegal 