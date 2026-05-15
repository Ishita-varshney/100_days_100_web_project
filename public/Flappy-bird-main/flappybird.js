// BOARD
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// BIRD
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;

let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

// PIPES
let pipeArray = [];

let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// PHYSICS
let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;

// GAME
let gameOver = false;
let gameStarted = false;

let score = 0;
let highScore = 0;

// SOUNDS
let jumpSound;
let scoreSound;
let gameOverSound;

// START GAME
window.onload = function () {

    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;

    context = board.getContext("2d");

    // LOAD IMAGES
    birdImg = new Image();
    birdImg.src = "./flappybird.png";

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    // LOAD SOUNDS
    jumpSound = new Audio("./jump.mp3");
    scoreSound = new Audio("./score.mp3");
    gameOverSound = new Audio("./gameover.mp3");

    // GAME LOOP
    requestAnimationFrame(update);

    // PIPE LOOP
    setInterval(placePipes, 1500);

    // COMPUTER CONTROL
    document.addEventListener("keydown", moveBird);

    // MOBILE + TABLET CONTROL
    document.addEventListener("touchstart", moveBird);

    // SHOW START SCREEN
    showInstruction();
};

// UPDATE GAME
function update() {

    requestAnimationFrame(update);

    if (!gameStarted) {
        return;
    }

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    // BIRD GRAVITY
    velocityY += gravity;

    bird.y = Math.max(bird.y + velocityY, 0);

    // DRAW BIRD
    context.drawImage(
        birdImg,
        bird.x,
        bird.y,
        bird.width,
        bird.height
    );

    // GAME OVER IF FALLS
    if (bird.y > board.height) {
        endGame();
    }

    // PIPES
    for (let i = 0; i < pipeArray.length; i++) {

        let pipe = pipeArray[i];

        pipe.x += velocityX;

        context.drawImage(
            pipe.img,
            pipe.x,
            pipe.y,
            pipe.width,
            pipe.height
        );

        // SCORE
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {

            score += 0.5;
            pipe.passed = true;

            scoreSound.play();
        }

        // COLLISION
        if (detectCollision(bird, pipe)) {
            endGame();
        }
    }

    // REMOVE OLD PIPES
    while (pipeArray.length > 0 &&
        pipeArray[0].x < -pipeWidth) {

        pipeArray.shift();
    }

    // SCORE TEXT
    context.fillStyle = "white";
    context.font = "40px Arial";
    context.fillText(score, 10, 45);

    // HIGH SCORE
    context.font = "25px Arial";
    context.fillText(
        "High Score: " + highScore,
        10,
        80
    );

    // GAME OVER TEXT
    if (gameOver) {

        context.fillStyle = "red";
        context.font = "40px Arial";

        let text = "GAME OVER";

        let textWidth =
            context.measureText(text).width;

        context.fillText(
            text,
            (boardWidth - textWidth) / 2,
            boardHeight / 2
        );
    }
}

// PLACE PIPES
function placePipes() {

    if (gameOver || !gameStarted) {
        return;
    }

    let randomPipeY =
        pipeY -
        pipeHeight / 4 -
        Math.random() * (pipeHeight / 2);

    let openingSpace = board.height / 4;

    // TOP PIPE
    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };

    pipeArray.push(topPipe);

    // BOTTOM PIPE
    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };

    pipeArray.push(bottomPipe);
}

// MOVE BIRD
function moveBird(e) {

    velocityY = -6;

    jumpSound.play();

    // START GAME
    if (!gameStarted) {
        gameStarted = true;
    }

    // RESTART GAME
    if (gameOver) {

        bird.y = birdY;

        pipeArray = [];

        score = 0;

        velocityY = 0;

        gameOver = false;

        gameStarted = false;

        showInstruction();
    }
}

// SHOW START TEXT
function showInstruction() {

    context.clearRect(
        0,
        0,
        board.width,
        board.height
    );

    context.fillStyle = "white";

    context.font = "25px Arial";

    context.fillText(
        "Tap or Press Space to Start",
        20,
        boardHeight / 2
    );
}

// COLLISION DETECTION
function detectCollision(a, b) {

    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// END GAME
function endGame() {

    gameOver = true;

    gameOverSound.play();

    if (score > highScore) {
        highScore = score;
    }
}