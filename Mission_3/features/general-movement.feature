Feature: General Movement Rules (將/帥移動規則)
  As a chess player
  I want the General to follow traditional movement rules
  So that the game maintains its strategic integrity

  Background:
    Given a standard Chinese chess board with 9×10 grid
    And positions are indicated as (row, col)
    And Row 1 is Red's bottom row, Row 10 is Black's top row
    And Column 1 is the leftmost column from Red's perspective

  @General
  Scenario: Red moves the General within the palace (Legal)
    Given the board is empty except for a Red General at (1, 5)
    When Red moves the General from (1, 5) to (1, 4)
    Then the move is legal

  @General
  Scenario: Red moves the General outside the palace (Illegal)
    Given the board is empty except for a Red General at (1, 6)
    When Red moves the General from (1, 6) to (1, 7)
    Then the move is illegal

  @General
  Scenario: Generals face each other on the same file (Illegal)
    Given the board has:
      | Piece         | Position |
      | Red General   | (2, 4)   |
      | Black General | (8, 5)   |
    When Red moves the General from (2, 4) to (2, 5)
    Then the move is illegal 