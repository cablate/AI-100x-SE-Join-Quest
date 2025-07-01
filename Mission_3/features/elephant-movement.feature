Feature: Elephant Movement Rules (相/象移動規則)
  As a chess player
  I want the Elephant to move diagonally 2 steps without crossing the river
  So that it can defend the home territory

  Background:
    Given a standard Chinese chess board with 9×10 grid
    And positions are indicated as (row, col)
    And Row 1 is Red's bottom row, Row 10 is Black's top row
    And Column 1 is the leftmost column from Red's perspective
    And the river is between Row 5 and Row 6

  @Elephant
  Scenario: Red moves the Elephant 2-step diagonal with a clear midpoint (Legal)
    Given the board is empty except for a Red Elephant at (3, 3)
    When Red moves the Elephant from (3, 3) to (5, 5)
    Then the move is legal

  @Elephant
  Scenario: Red moves the Elephant and tries to cross the river (Illegal)
    Given the board is empty except for a Red Elephant at (5, 3)
    When Red moves the Elephant from (5, 3) to (7, 5)
    Then the move is illegal

  @Elephant
  Scenario: Red moves the Elephant and its midpoint is blocked (Illegal)
    Given the board has:
      | Piece         | Position |
      | Red Elephant  | (3, 3)   |
      | Black Rook    | (4, 4)   |
    When Red moves the Elephant from (3, 3) to (5, 5)
    Then the move is illegal 