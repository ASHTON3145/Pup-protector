// upgrades.js

let gameRef; // Will hold a reference to the main game object/functions

function setupUpgradeSystem(game) {
    gameRef = game; // Get reference to main game to update its state
    const upgradeMenu = document.getElementById('upgrade-menu');
    const upgradeSpeedButton = document.getElementById('upgradeSpeed');
    const upgradeBarkRangeButton = document.getElementById('upgradeBarkRange');
    const unlockAutoBarkButton = document.getElementById('unlockAutoBark');
    const closeUpgradeMenuButton = document.getElementById('closeUpgradeMenu');

    const currentSpeedDisplay = document.getElementById('currentSpeed');
    const currentBarkRangeDisplay = document.getElementById('currentBarkRange');
    const currentAutoBarkDisplay = document.getElementById('currentAutoBark');

    // Update the UI of the upgrade menu
    function updateUpgradeMenuUI() {
        if (!gameRef || !gameRef.buddy) return;

        currentSpeedDisplay.textContent = gameRef.buddy.speed;
        currentBarkRangeDisplay.textContent = gameRef.buddy.barkRange;
        currentAutoBarkDisplay.textContent = gameRef.buddy.autoBarkUnlocked ? "Unlocked" : "Locked";

        // Enable/disable buttons based on dog treats and unlock status
        upgradeSpeedButton.disabled = gameRef.dogTreats < parseInt(upgradeSpeedButton.dataset.cost);
        upgradeBarkRangeButton.disabled = gameRef.dogTreats < parseInt(upgradeBarkRangeButton.dataset.cost);
        unlockAutoBarkButton.disabled = gameRef.dogTreats < parseInt(unlockAutoBarkButton.dataset.cost) || gameRef.buddy.autoBarkUnlocked;

        if (gameRef.buddy.autoBarkUnlocked) {
            unlockAutoBarkButton.textContent = "Auto-Bark Unlocked!";
        }
    }

    upgradeSpeedButton.addEventListener('click', () => {
        const cost = parseInt(upgradeSpeedButton.dataset.cost);
        if (gameRef.dogTreats >= cost) {
            gameRef.dogTreats -= cost;
            gameRef.buddy.upgradeSpeed();
            gameRef.updateUI(); // Update main game UI
            updateUpgradeMenuUI(); // Update upgrade menu UI
            console.log("Buddy Speed upgraded to:", gameRef.buddy.speed);
        } else {
            alert("Not enough Dog Treats!");
        }
    });

    upgradeBarkRangeButton.addEventListener('click', () => {
        const cost = parseInt(upgradeBarkRangeButton.dataset.cost);
        if (gameRef.dogTreats >= cost) {
            gameRef.dogTreats -= cost;
            gameRef.buddy.upgradeBarkRange();
            gameRef.updateUI();
            updateUpgradeMenuUI();
            console.log("Bark Range upgraded to:", gameRef.buddy.barkRange);
        } else {
            alert("Not enough Dog Treats!");
        }
    });

    unlockAutoBarkButton.addEventListener('click', () => {
        const cost = parseInt(unlockAutoBarkButton.dataset.cost);
        if (gameRef.dogTreats >= cost && !gameRef.buddy.autoBarkUnlocked) {
            gameRef.dogTreats -= cost;
            gameRef.buddy.unlockAutoBark();
            gameRef.autoBarkButton.classList.remove('hidden'); // Make the button visible
            gameRef.updateUI();
            updateUpgradeMenuUI();
            console.log("Auto-Bark unlocked!");
        } else {
            alert("Not enough Dog Treats or already unlocked!");
        }
    });

    closeUpgradeMenuButton.addEventListener('click', () => {
        gameRef.toggleUpgradeMenu(false); // Close the menu
    });

    // Expose functions to the gameRef
    gameRef.openUpgradeMenu = () => {
        gameRef.toggleUpgradeMenu(true);
        updateUpgradeMenuUI(); // Update UI when opening
    };
}
