Feature: Soldier Movement Rules (兵/卒移動規則)
  As a chess player
  I want the Soldier to move forward before crossing river and sideways after crossing
  So that it can advance and attack effectively

  Background:
    Given a standard Chinese chess board with 9×10 grid
    And positions are indicated as (row, col)
    And Row 1 is Red's bottom row, Row 10 is Black's top row
    And Column 1 is the leftmost column from Red's perspective
    And the river is between Row 5 and Row 6

  @Soldier
  Scenario: Red moves the Soldier forward before crossing the river (Legal)
    Given the board is empty except for a Red Soldier at (3, 5)
    When Red moves the Soldier from (3, 5) to (4, 5)
    Then the move is legal

  @Soldier
  Scenario: Red moves the Soldier and tries to move sideways before crossing (Illegal)
    Given the board is empty except for a Red Soldier at (3, 5)
    When Red moves the Soldier from (3, 5) to (3, 4)
    Then the move is illegal

  @Soldier
  Scenario: Red moves the Soldier sideways after crossing the river (Legal)
    Given the board is empty except for a Red Soldier at (6, 5)
    When Red moves the Soldier from (6, 5) to (6, 4)
    Then the move is legal

  @Soldier
  Scenario: Red moves the Soldier and attempts to move backward after crossing (Illegal)
    Given the board is empty except for a Red Soldier at (6, 5)
    When Red moves the Soldier from (6, 5) to (5, 5)
    Then the move is illegal 