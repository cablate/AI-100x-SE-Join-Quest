Feature: Guard Movement Rules (士/仕移動規則)
  As a chess player
  I want the Guard to move diagonally within the palace
  So that it can protect the General effectively

  Background:
    Given a standard Chinese chess board with 9×10 grid
    And positions are indicated as (row, col)
    And Row 1 is Red's bottom row, Row 10 is Black's top row
    And Column 1 is the leftmost column from Red's perspective

  @Guard
  Scenario: Red moves the Guard diagonally in the palace (Legal)
    Given the board is empty except for a Red Guard at (1, 4)
    When Red moves the Guard from (1, 4) to (2, 5)
    Then the move is legal

  @Guard
  Scenario: Red moves the Guard straight (Illegal)
    Given the board is empty except for a Red Guard at (2, 5)
    When Red moves the Guard from (2, 5) to (2, 6)
    Then the move is illegal 