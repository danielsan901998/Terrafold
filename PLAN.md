# Improvement Implementation Plan for Terrafold1-fixed

This plan outlines the steps to implement the potential improvements identified in the codebase analysis, focusing on fixing critical bugs, enhancing code structure, and modernizing practices.

## 1. Fix Critical Data-Loss Bug (saving.js)

*   **Goal:** Ensure all game state is correctly persisted to local storage.
*   **Steps:**
    *   Locate the `save()` function within `saving.js`.
    *   Identify and remove the lines that explicitly clear `game.space.planets` and `game.space.ships` before writing to storage.
    *   Thoroughly test the save and load functionality, specifically checking if planet and ship data is preserved.

## 2. Modularize the Codebase (ES6 Modules)

*   **Goal:** Eliminate global scope pollution and improve code organization and maintainability by adopting ES6 modules.
*   **Steps:**
    *   Identify distinct modules within the project (e.g., `Game` model, `View` component, `Saving` logic, individual `classes/*`).
    *   Refactor each identified module to use `export` for its public API (functions, classes, constants).
    *   Update files that depend on these modules to use `import` statements.
    *   Pay close attention to the Web Worker (`driver.js`, `interval.js`) communication, ensuring it's integrated with the new module system.
    *   Start with less coupled modules or those with clear boundaries.

## 3. Implement an Event-Driven System

*   **Goal:** Decouple the game logic (model) from the user interface (view) by introducing an event-driven architecture.
*   **Steps:**
    *   Create a simple, reusable event emitter or Pub/Sub utility.
    *   Modify the `Game` model and its associated classes (`classes/*`) to emit custom events when significant state changes occur (e.g., resource updates, ship construction, planet changes).
    *   Update the `View` and its components to subscribe to these emitted events.
    *   Modify the `View` to react to these events by updating only the relevant parts of the DOM, rather than re-rendering everything.

## 4. Refactor UI Components and DOM Manipulation

*   **Goal:** Improve the efficiency and maintainability of the user interface by breaking down monolithic components and optimizing DOM operations.
*   **Steps:**
    *   Decompose the `view.js` file into smaller, more focused modules or classes, each responsible for a specific UI element or section (e.g., `ComputerView`, `ProgressBarView`).
    *   Ensure these new UI components utilize the event system to receive state updates.
    *   Optimize DOM updates within these components to only affect changed elements.
    *   Replace all inline `onclick` attributes in `index.html` with `addEventListener` calls managed by the respective JavaScript modules.
    *   Address the use of parallel arrays (e.g., in `classes/Computer.js`) by refactoring to use more appropriate data structures, such as arrays of objects where each object contains all related data.

## 5. Address Remaining Global Variables and Outdated Patterns

*   **Goal:** Further modernize the codebase and reduce complexity by eliminating remaining global dependencies and archaic patterns.
*   **Steps:**
    *   As modularization and refactoring progress, systematically identify and eliminate any remaining reliance on global variables.
    *   Ensure data and functionality are passed as arguments or accessed via imports.
    *   Review other classes and functions for any other outdated patterns and refactor them accordingly.

## 6. Testing and Verification

*   **Goal:** Ensure the integrity and stability of the application throughout the refactoring process.
*   **Steps:**
    *   Perform manual testing after each major step (bug fix, module refactoring, event system implementation) to verify functionality.
    *   Pay special attention to game state persistence, UI responsiveness, and the correct operation of core game mechanics.
    *   If possible, consider introducing a simple testing framework or writing end-to-end tests to automate verification.
