// game.js

// --- Global Game Variables ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreDisplay = document.getElementById('score');
const houseHealthDisplay = document.getElementById('houseHealth');
const dogTreatsDisplay = document.getElementById('dogTreats');

const loadingScreen = document.getElementById('loading-screen');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('finalScore');
const upgradeMenu = document.getElementById('upgrade-menu');

const pauseButton = document.getElementById('pauseButton');
const autoBarkButton = document.getElementById('autoBarkButton'); // Access directly

let buddy;
let enemies = [];
let score = 0;
let houseHealth = 100;
let dogTreats = 0;

let gameRunning = false;
let isPaused = false;
let animationFrameId; // To store the requestAnimationFrame ID

let enemySpawnInterval = 90; // Frames per spawn (e.g., 90 frames = 1.5 seconds at 60 FPS)
let frameCount = 0;

// --- Game Object (to pass around easily) ---
const Game = {
    canvas,
    ctx,
    scoreDisplay,
    houseHealthDisplay,
    dogTreatsDisplay,
    autoBarkButton, // Pass reference to auto-bark button
    buddy: null, // Will be initialized
    score: 0,
    houseHealth: 0,
    dogTreats: 0,

    init() {
        canvas.width = 960;
        canvas.height = 720;
        this.loadGameAssets().then(() => {
            loadingScreen.classList.add('hidden');
            startScreen.classList.remove('hidden');
            console.log("Assets loaded! Game ready.");
            setupInput(this); // Pass game object to input handler
            setupUpgradeSystem(this); // Pass game object to upgrade system
        }).catch(error => {
            console.error("Failed to load game assets:", error);
            alert("Failed to load game. Please try again.");
        });
    },

    async loadGameAssets() {
        loadingScreen.classList.remove('hidden'); // Show loading screen

        // Pre-load all images
        const imagePromises = [
            loadAsset('buddy', 'assets/images/buddy.png'),
            loadAsset('house', 'assets/images/house.png'),
            loadAsset('snake', 'assets/images/snake.png'),
            loadAsset('rabbit', 'assets/images/rabbit.png'),
            loadAsset('raccoon', 'assets/images/raccoon.png'),
            // Add more if you have background images or other props
            // loadAsset('background_grass', 'assets/images/background_grass.png') // If you want to draw background on canvas
        ];

        // Pre-load audio (optional)
        const audioPromises = [
            // loadAsset('bark_sound', 'assets/audio/bark.mp3', 'audio'),
            // loadAsset('game_music', 'assets/audio/game_music.mp3', 'audio')
        ];

        await Promise.all([...imagePromises, ...audioPromises]);
        console.log("All assets loaded.");
    },

    startGame() {
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        upgradeMenu.classList.add('hidden'); // Ensure upgrade menu is hidden

        this.score = 0;
        this.houseHealth = 100;
        this.dogTreats = 0;
        enemies = []; // Clear all existing enemies
        frameCount = 0;
        enemySpawnInterval = 90; // Reset spawn rate

        this.buddy = new Buddy(
            canvas.width / 2,
            canvas.height - 100, // Position Buddy above controls
            60, 50 // Buddy's width and height
        );

        gameRunning = true;
        isPaused = false;
        pauseButton.textContent = "Pause"; // Reset pause button text
        this.updateUI();

        // Start game music if loaded
        // if (assets.game_music) {
        //     assets.game_music.loop = true;
        //     assets.game_music.volume = 0.5;
        //     assets.game_music.play();
        // }

        this.gameLoop(); // Start the main game loop
    },

    gameLoop() {
        if (!gameRunning) return;

        if (isPaused) {
            animationFrameId = requestAnimationFrame(Game.gameLoop); // Keep looping to check for unpause
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

        // --- Drawing ---
        // if (assets.background_grass) {
        //     ctx.drawImage(assets.background_grass, 0, 0, canvas.width, canvas.height);
        // }
        Game.drawHouse();
        Game.buddy.draw(ctx);
        enemies.forEach(enemy => enemy.draw(ctx));

        // --- Updating ---
        Game.updateGameLogic();

        // Spawn enemies periodically
        frameCount++;
        if (frameCount % enemySpawnInterval === 0) {
            Game.spawnEnemy();
        }

        animationFrameId = requestAnimationFrame(Game.gameLoop); // Loop
    },

    drawHouse() {
        // Draw House using image
        if (assets.house) {
            const houseWidth = 200;
            const houseHeight = 150;
            ctx.drawImage(assets.house, canvas.width / 2 - houseWidth / 2, 0, houseWidth, houseHeight);
        } else {
            // Fallback: draw basic house
            ctx.fillStyle = 'brown';
            ctx.fillRect(canvas.width / 2 - 75, 20, 150, 100);
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2 - 75, 20);
            ctx.lineTo(canvas.width / 2, -30); // Roof peak
            ctx.lineTo(canvas.width / 2 + 75, 20);
            ctx.closePath();
            ctx.fill();
        }
    },

    updateGameLogic() {
        // Update Buddy's auto-bark state
        Game.buddy.updateAutoBark();

        // Update enemies and check collisions
        enemies = enemies.filter(enemy => {
            enemy.update();

            // Collision with Buddy
            // Check if enemy is in Buddy's "bark range" (simplified as circle around Buddy's x)
            const distance = Math.abs(enemy.x - Game.buddy.x);
            const buddyDetectZone = Game.buddy.barkRange + (Game.buddy.width / 2); // Radius from Buddy's center
            const enemyHitY = enemy.y + enemy.height / 2; // Approximate center Y of enemy

            if ((enemyHitY > Game.buddy.y && enemyHitY < Game.buddy.y + Game.buddy.height) &&
                (distance < buddyDetectZone)) {
                // If auto-bark is active, it's an instant deter
                if (Game.buddy.autoBarkActive) {
                    score += enemy.points;
                    dogTreats += Math.floor(enemy.points / 5);
                    return false; // Remove enemy
                } else if (!Game.buddy.autoBarkActive) { // Manual block needed
                    // Simple collision: if enemy is within slider thumb's horizontal range
                    // This is where slider control comes in.
                    // The 'input.js' directly updates buddy.x, so collision is implicit.
                    score += enemy.points;
                    dogTreats += Math.floor(enemy.points / 5);
                    return false; // Remove enemy
                }
            }

            // Enemy reaches house
            const houseTopY = 0; // House starts at top
            const houseBottomY = 150; // House assumed height
            const houseLeftX = canvas.width / 2 - 100; // House assumed width
            const houseRightX = canvas.width / 2 + 100;

            if (enemy.y < houseBottomY && enemy.y + enemy.height > houseTopY &&
                enemy.x > houseLeftX && enemy.x < houseRightX) {
                this.houseHealth -= enemy.damage;
                if (this.houseHealth <= 0) {
                    this.gameOver();
                }
                return false; // Remove enemy
            }

            // Remove enemies that go off screen (below Buddy)
            return enemy.y < canvas.height + enemy.height;
        });

        this.updateUI();
    },

    spawnEnemy() {
        const enemyTypes = ['snake', 'rabbit', 'raccoon'];
        const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        enemies.push(new Enemy(
            Math.random() * canvas.width, // Random X
            -50, // Start above screen
            randomType
        ));

        // Gradually increase difficulty by speeding up spawn rate
        if (frameCount % 3000 === 0 && enemySpawnInterval > 30) { // Every 50 seconds, speed up
            enemySpawnInterval -= 5;
            console.log("Enemy spawn interval reduced to:", enemySpawnInterval);
        }
    },

    updateUI() {
        scoreDisplay.textContent = this.score;
        houseHealthDisplay.textContent = this.houseHealth;
        dogTreatsDisplay.textContent = this.dogTreats;

        // Auto-bark button state
        if (this.buddy.autoBarkUnlocked) {
            autoBarkButton.classList.remove('hidden');
            autoBarkButton.disabled = this.buddy.autoBarkCooldown > 0 || this.buddy.autoBarkActive;
            if (this.buddy.autoBarkActive) {
                autoBarkButton.textContent = `Active (${Math.ceil(this.buddy.autoBarkDuration / 60)}s)`;
            } else if (this.buddy.autoBarkCooldown > 0) {
                autoBarkButton.textContent = `Cooldown (${Math.ceil(this.buddy.autoBarkCooldown / 60)}s)`;
            } else {
                autoBarkButton.textContent = 'Auto-Bark';
            }
        } else {
            autoBarkButton.classList.add('hidden'); // Hide if not unlocked
        }

        // Pause button text
        pauseButton.textContent = isPaused ? "Resume" : "Pause";
    },

    togglePause() {
        isPaused = !isPaused;
        this.updateUI(); // Update button text
        if (!isPaused) {
            this.gameLoop(); // Resume the loop
        }
    },

    toggleUpgradeMenu(show) {
        if (show) {
            upgradeMenu.classList.remove('hidden');
            isPaused = true; // Pause game when menu is open
            pauseButton.classList.add('hidden'); // Hide pause button
        } else {
            upgradeMenu.classList.add('hidden');
            isPaused = false; // Unpause game
            pauseButton.classList.remove('hidden'); // Show pause button
            this.gameLoop(); // Resume game loop
        }
        this.updateUI(); // Update UI after toggling
    },

    gameOver() {
        gameRunning = false;
        isPaused = true; // Ensure game is paused
        cancelAnimationFrame(animationFrameId); // Stop the game loop
        finalScoreDisplay.textContent = this.score;
        gameOverScreen.classList.remove('hidden');

        // Stop game music
        // if (assets.game_music) assets.game_music.pause();
    }
};

// --- Start the game initialization when the window loads ---
window.onload = () => {
    Game.init();
};
