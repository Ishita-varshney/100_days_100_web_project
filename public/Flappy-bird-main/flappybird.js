//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
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

//pipes
let pipeArray = [];

let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;

//game variables
let gameOver = false;
let gameStarted = false;
let score = 0;
let highscore = 0;

//sounds
let jumpsound;
let scoresound;
let gameoversound;

window.onload = function () {

    //board setup
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    //load bird image
    birdImg = new Image();
    birdImg.src = "./flappybird.png";

    birdImg.onload = function () {
        context.drawImage(
            birdImg,
            bird.x,
            bird.y,
            bird.width,
            bird.height
        );
    };

    //load pipe images
    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    //sounds
    jumpsound = new Audio("./jump.mp3");
    scoresound = new Audio("./score.mp3");
    gameoversound = new Audio("./gameover.mp3");

    //game loop
    requestAnimationFrame(update);

    //place pipes every 1.5 sec
    setInterval(placePipes, 1500);

    //controls
    document.addEventListener("keydown", moveBird);

    //show instructions
    showInstruction();
};

function update() {

    requestAnimationFrame(update);

    //wait until game starts
    if (!gameStarted) {
        return;
    }

    //stop updating if game over
    if (gameOver) {
        return;
    }

    //clear canvas
    context.clearRect(0, 0, board.width, board.height);

    //bird physics
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);

    //draw bird
    context.drawImage(
        birdImg,
        bird.x,
        bird.y,
        bird.width,
        bird.height
    );

    //bird falls below screen
    if (bird.y > board.height) {
        gameOver = true;
        gameoversound.play();

        if (score > highscore) {
            highscore = score;
        }
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {

        let pipe = pipeArray[i];

        //move pipes
        pipe.x += velocityX;

        //draw pipes
        context.drawImage(
            pipe.img,
            pipe.x,
            pipe.y,
            pipe.width,
            pipe.height
        );

        //score update
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
            scoresound.play();
        }

        //collision detection
        if (detectCollision(bird, pipe)) {
            gameOver = true;
            gameoversound.play();

            if (score > highscore) {
                highscore = score;
            }
        }
    }

    //remove old pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    //score display
    context.fillStyle = "red";
    context.font = "45px sans-serif";
    context.fillText(score, 10, 45);

    //highscore display
    context.font = "25px sans-serif";
    context.fillText("HIGH SCORE: " + highscore, 10, 80);

    //game over text
    if (gameOver) {

        context.fillStyle = "red";
        context.font = "35px sans-serif";

        let text = "GAME OVER";
        let textWidth = context.measureText(text).width;

        context.fillText(
            text,
            (boardWidth - textWidth) / 2,
            boardHeight / 2
        );
    }
}

function placePipes() {

    if (gameOver || !gameStarted) {
        return;
    }

    //random pipe height
    let randomPipeY =
        pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);

    let openingSpace = board.height / 4;

    //top pipe
    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };

    pipeArray.push(topPipe);

    //bottom pipe
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

function moveBird(e) {

    if (
        e.code === "Space" ||
        e.code === "ArrowUp" ||
        e.code === "KeyX"
    ) {

        //jump
        velocityY = -6;
        jumpsound.play();

        //start game
        if (!gameStarted) {
            gameStarted = true;
        }

        //restart game
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
}

function showInstruction() {

    context.clearRect(0, 0, board.width, board.height);

    context.fillStyle = "red";

    context.font = "25px sans-serif";

    context.fillText(
        "Press SPACE to Start",
        40,
        boardHeight / 2
    );
}

function detectCollision(a, b) {

    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}