Feature: Cannon Movement Rules (炮移動規則)
  As a chess player
  I want the Cannon to move like a Rook but capture by jumping over exactly one piece
  So that it provides unique strategic options

  Background:
    Given a standard Chinese chess board with 9×10 grid
    And positions are indicated as (row, col)
    And Row 1 is Red's bottom row, Row 10 is Black's top row
    And Column 1 is the leftmost column from Red's perspective

  @Cannon
  Scenario: Red moves the Cannon like a Rook with an empty path (Legal)
    Given the board is empty except for a Red Cannon at (6, 2)
    When Red moves the Cannon from (6, 2) to (6, 8)
    Then the move is legal

  @Cannon
  Scenario: Red moves the Cannon and jumps exactly one screen to capture (Legal)
    Given the board has:
      | Piece         | Position |
      | Red Cannon    | (6, 2)   |
      | Black Soldier | (6, 5)   |
      | Black Guard   | (6, 8)   |
    When Red moves the Cannon from (6, 2) to (6, 8)
    Then the move is legal

  @Cannon
  Scenario: Red moves the Cannon and tries to jump with zero screens (Illegal)
    Given the board has:
      | Piece         | Position |
      | Red Cannon    | (6, 2)   |
      | Black Guard   | (6, 8)   |
    When Red moves the Cannon from (6, 2) to (6, 8)
    Then the move is illegal

  @Cannon
  Scenario: Red moves the Cannon and tries to jump with more than one screen (Illegal)
    Given the board has:
      | Piece         | Position |
      | Red Cannon    | (6, 2)   |
      | Red Soldier   | (6, 4)   |
      | Black Soldier | (6, 5)   |
      | Black Guard   | (6, 8)   |
    When Red moves the Cannon from (6, 2) to (6, 8)
    Then the move is illegal 