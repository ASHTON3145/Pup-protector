// input.js

let gameRef; // Reference to the main game object/functions

function setupInput(game) {
    gameRef = game;

    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const upgradeButton = document.getElementById('upgradeButton');
    const autoBarkButton = document.getElementById('autoBarkButton');
    const restartButton = document.getElementById('restartButton');
    const buddySlider = document.getElementById('buddySlider');

    startButton.addEventListener('click', () => {
        gameRef.startGame();
    });

    pauseButton.addEventListener('click', () => {
        gameRef.togglePause();
    });

    upgradeButton.addEventListener('click', () => {
        gameRef.openUpgradeMenu();
    });

    autoBarkButton.addEventListener('click', () => {
        if (gameRef.buddy.activateAutoBark()) {
            console.log("Auto-Bark activated!");
        } else {
            console.log("Auto-Bark not ready or not unlocked.");
        }
    });

    restartButton.addEventListener('click', () => {
        gameRef.startGame(); // Re-initializes and starts the game
    });

    buddySlider.addEventListener('input', (event) => {
        if (gameRef.buddy) { // Ensure buddy exists
            gameRef.buddy.x = (parseInt(event.target.value) / 100) * gameRef.canvas.width;
        }
    });
}
