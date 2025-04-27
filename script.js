let canvas = document.getElementById('mycanvas');
let ctx = canvas.getContext('2d');
let messageDiv = document.getElementById("message");

let gamePaused = false;

// Ball variables
let ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

// Paddle variables
let paddleHeight = 12;
let paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;

// Brick variables
let brickRowCount = 4;
let brickColumnCount = 7;
let brickWidth = 72;
let brickHeight = 24;
let brickPadding = 12;
let brickOffsetTop = 32;
let brickOffsetLeft = 32;

// Game variables
let score = 0;
let lives = 3;

// Load audio files
let brickHitSound = document.getElementById("brickHit");
let paddleHitSound = document.getElementById("paddleHit");
let lifeLostSound = document.getElementById("lifeLost");
let gameWinSound = document.getElementById("gameWin");
let gameOverSound = document.getElementById("gameOver");

// Create bricks array
let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

// Event listeners for paddle movement
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'deeppink';
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = 'deeppink';
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = 'darkviolet';
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    ctx.font = '18px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, 8, 20);
}

function drawLives() {
    ctx.font = '18px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Lives: ' + lives, canvas.width - 85, 20);
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    brickHitSound.play();

                    //increase speed after every 5 bricks
                    if (score % 5 === 0) {
                        if (dx > 0) {
                            dx += 0.2;
                        } else {
                            dx -= 0.2;
                        }
                        if (dy > 0) {
                            dy += 0.2;
                        } else {
                            dy -= 0.2;
                        }
                    }

                    if (score === brickRowCount * brickColumnCount) {
                        gameWinSound.play();
                        gameMessage = "🎉 Congratulations!! You've won!";
                        gamePaused = true;
                        messageDiv.textContent = gameMessage;
                    }
                }
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawScore();
    drawLives();
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    // Ball bounce off walls
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }

    // Ball bounce off top or paddle
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
            paddleHitSound.play();
        } else {

            // Missed paddle: lose life
            lives--;
            lifeLostSound.play();

            if (!lives) {
                gameOverSound.play();
                gameMessage = "Game Over 💀";
                gamePaused = true;
                messageDiv.textContent = gameMessage;
                setTimeout(() => document.location.reload(), 5000);
                return;
            } else {

                // Reset ball and paddle
                x = canvas.width / 2;
                y = canvas.height - 30;
                //resetting speed
                // dx = 2;
                // dy = -2;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }

    //paddle movement
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    //move ball
    x += dx;
    y += dy;

    if (!gamePaused) {
        requestAnimationFrame(draw);
    }
}

draw(); //start game loop
