// DOM elements
const playerTurnDisplay = document.getElementById('playerTurn');
const reactionTimerDisplay = document.getElementById('reactionTimer');
const statusDisplay = document.getElementById('status');
const cells = document.querySelectorAll('.cell');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

// Game state variables
let gameActive = false;
let currentPlayer = "X";
let gameState = ["", "", "", "", "", "", "", "", ""]; 
const reactionTimeLimit = 3; // seconds
let currentReactionTime = reactionTimeLimit;
let reactionTimerInterval; // Interval for the countdown
let moleTimeout; // Timeout for the active cell to change or turn ends
let currentActiveCellIndex = -1; // The cell the player needs to click

// Winning conditions
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Messages
const winningMessage = () => `Player ${currentPlayer} wins! Awesome! 🎉`;
const drawMessage = () => `It's a draw! Well played! 🤝`;
const currentPlayerMessage = () => `It's Player ${currentPlayer}'s turn!`;
const timeUpMessage = () => `Time's up! Player ${currentPlayer}'s turn skipped.`;


// --- Game Logic Functions ---

// 1. Choose a random EMPTY cell for the current player to click
function pickRandomEmptyCell() {
    const emptyCells = [];
    gameState.forEach((cell, index) => {
        if (cell === "") {
            emptyCells.push(index);
        }
    });

    if (emptyCells.length === 0) return -1; // No empty cells left (draw)

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
}

// 2. Start the reaction timer for the current player
function startReactionTimer() {
    clearInterval(reactionTimerInterval); // Clear any existing timer
    currentReactionTime = reactionTimeLimit;
    reactionTimerDisplay.textContent = currentReactionTime;
    reactionTimerDisplay.classList.remove('danger'); // Reset danger class

    reactionTimerInterval = setInterval(() => {
        currentReactionTime--;
        reactionTimerDisplay.textContent = currentReactionTime;

        if (currentReactionTime <= 1) { // Apply danger class in last second
            reactionTimerDisplay.classList.add('danger');
        }

        if (currentReactionTime <= 0) {
            clearInterval(reactionTimerInterval);
            handleTimeUp();
        }
    }, 1000); // Update every second
}

// 3. What happens when time runs out
function handleTimeUp() {
    if (!gameActive) return;

    statusDisplay.textContent = timeUpMessage();
    setTimeout(() => { // Give a moment to read the message
        endTurn(); // Just ends the turn without a move
    }, 1500);
}

// 4. Mark the active cell on the board
function makeCellActive(index) {
    if (index === -1) { // No empty cells left
        handleResultValidation();
        return;
    }
    currentActiveCellIndex = index;
    cells[index].classList.add('clickable');
    
    // Start the reaction timer for this turn
    startReactionTimer();
}

// 5. Handle a player making a valid move
function handleCellPlayed(clickedCellIndex) {
    if (!gameActive) return;

    // Stop timer and remove active state
    clearInterval(reactionTimerInterval);
    cells[currentActiveCellIndex].classList.remove('clickable');

    // Update game state
    gameState[clickedCellIndex] = currentPlayer;
    cells[clickedCellIndex].innerHTML = currentPlayer;
    cells[clickedCellIndex].classList.add(currentPlayer.toLowerCase()); // Add 'x' or 'o' class for styling

    handleResultValidation(); // Check for win/draw
}

// 6. Check for win or draw
function handleResultValidation() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];

        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusDisplay.innerHTML = winningMessage();
        endGame();
        return;
    }

    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        statusDisplay.innerHTML = drawMessage();
        endGame();
        return;
    }

    endTurn(); // If no win/draw, continue to next turn
}

// 7. End the current turn and switch player
function endTurn() {
    if (!gameActive) return;
    
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    playerTurnDisplay.innerHTML = currentPlayerMessage();
    statusDisplay.innerHTML = currentPlayerMessage(); // Reset status

    // Find and activate a new random empty cell for the next player
    const nextCellToClick = pickRandomEmptyCell();
    if (nextCellToClick === -1) { // If no empty cells (game should be draw)
        handleResultValidation();
    } else {
        makeCellActive(nextCellToClick);
    }
}

// 8. End the entire game
function endGame() {
    gameActive = false;
    clearInterval(reactionTimerInterval);
    // Remove clickable class from any remaining active cell
    if (currentActiveCellIndex !== -1 && cells[currentActiveCellIndex]) {
        cells[currentActiveCellIndex].classList.remove('clickable');
    }
    startButton.classList.add('hidden'); // Hide start button
    restartButton.classList.remove('hidden'); // Show restart button
}

// 9. Initialize/Restart the game
function startGame() {
    gameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    currentActiveCellIndex = -1; // Reset active cell
    
    clearInterval(reactionTimerInterval); // Clear any old timer
    reactionTimerDisplay.classList.remove('danger');
    reactionTimerDisplay.textContent = reactionTimeLimit;

    playerTurnDisplay.innerHTML = currentPlayerMessage();
    statusDisplay.innerHTML = currentPlayerMessage();

    startButton.classList.add('hidden');
    restartButton.classList.add('hidden');

    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove('x', 'o', 'clickable');
    });

    // Start the first turn by making a random cell active
    const firstCellToClick = pickRandomEmptyCell();
    makeCellActive(firstCellToClick);
}

// --- Event Listeners ---

// Listen for clicks on individual cells
cells.forEach((cell, index) => {
    cell.addEventListener('click', () => {
        if (!gameActive) return; // Only allow clicks if game is active
        
        // Player must click the currently active cell, AND it must be empty
        if (index === currentActiveCellIndex && gameState[index] === "") {
            handleCellPlayed(index);
        } else if (gameState[index] !== "") {
            statusDisplay.textContent = "That spot's taken! Choose an empty one!";
            setTimeout(() => statusDisplay.textContent = currentPlayerMessage(), 1000);
        } else {
            statusDisplay.textContent = "You need to click the glowing cell, hurry!";
            setTimeout(() => statusDisplay.textContent = currentPlayerMessage(), 1000);
        }
    });
});

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    playerTurnDisplay.innerHTML = "Welcome!";
    statusDisplay.innerHTML = "Ready for a fast-paced Tic-Tac-Toe?";
    restartButton.classList.add('hidden'); // Ensure restart button is hidden initially
});