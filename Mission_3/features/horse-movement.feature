Feature: Horse Movement Rules (馬/傌移動規則)
  As a chess player
  I want the Horse to move in L-shape without being blocked
  So that it can jump over pieces strategically

  Background:
    Given a standard Chinese chess board with 9×10 grid
    And positions are indicated as (row, col)
    And Row 1 is Red's bottom row, Row 10 is Black's top row
    And Column 1 is the leftmost column from Red's perspective

  @Horse
  Scenario: Red moves the Horse in an "L" shape with no block (Legal)
    Given the board is empty except for a Red Horse at (3, 3)
    When Red moves the Horse from (3, 3) to (5, 4)
    Then the move is legal

  @Horse
  Scenario: Red moves the Horse and it is blocked by an adjacent piece (Illegal)
    Given the board has:
      | Piece        | Position |
      | Red Horse    | (3, 3)   |
      | Black Rook   | (4, 3)   |
    When Red moves the Horse from (3, 3) to (5, 4)
    Then the move is illegal 