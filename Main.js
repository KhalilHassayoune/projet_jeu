const WIDTH = 450;
const HEIGHT = 800;
const PLATFORM_COUNT = 6;
const JUMP = -700;
const SPEED = 260;
var helias;
let player;
let platforms;
let cursors;
let scoreText;
let bestY;
let isGameOver = false;
let gameOverText;
let restartText;

const config = {
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: "#87CEEB",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1200 },
      debug: false
    }
  },
  scene: {
    create,
    update
  }
};

new Phaser.Game(config);

function create() {
  makeTextures.call(this);

  this.add.text(12, 12, "Doodle Jump", {
    fontSize: "24px",
    color: "#000"
  }).setScrollFactor(0);

  scoreText = this.add.text(12, 42, "Score : 0", {
    fontSize: "20px",
    color: "#000"
  }).setScrollFactor(0);

  gameOverText = this.add.text(WIDTH / 2, HEIGHT / 2 - 30, "GAME OVER", {
    fontSize: "40px",
    color: "#ff0000",
    fontStyle: "bold"
  })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setVisible(false);

  restartText = this.add.text(WIDTH / 2, HEIGHT / 2 + 20, "Appuie sur ESPACE pour rejouer", {
    fontSize: "20px",
    color: "#000"
  })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setVisible(false);

  platforms = [];

  for (let i = 0; i < PLATFORM_COUNT; i++) {
    const x = Phaser.Math.Between(70, WIDTH - 70);
    const y = HEIGHT - 120 - i * 130;

    const p = this.add.image(x, y, "platform");
    this.physics.add.existing(p, true);

    platforms.push(p);
  }

  player = this.physics.add.image(WIDTH / 2, HEIGHT - 180, "player");
  player.setCollideWorldBounds(false);
  player.setVelocityY(JUMP);

  cursors = this.input.keyboard.createCursorKeys();

  this.cameras.main.startFollow(player, false, 0.08, 0.08);
  this.cameras.main.setDeadzone(WIDTH, 250);

  bestY = player.y;
}

function update() {
  if (isGameOver) {
    player.setVelocityX(0);

    if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
      restartGame.call(this);
    }
    return;
  }

  if (cursors.left.isDown) {
    player.setVelocityX(-SPEED);
  } else if (cursors.right.isDown) {
    player.setVelocityX(SPEED);
  } else {
    player.setVelocityX(0);
  }

  if (player.x < -15) player.x = WIDTH + 15;
  if (player.x > WIDTH + 15) player.x = -15;

  checkPlatformLanding();

  recyclePlatforms();

  if (player.y < bestY) {
    bestY = player.y;
    const score = Math.floor((HEIGHT - 180 - bestY) / 10);
    scoreText.setText("Score : " + score);
  }

  if (player.y > this.cameras.main.scrollY + HEIGHT + 250) {
    triggerGameOver();
  }
}

function checkPlatformLanding() {
  if (player.body.velocity.y <= 0) return;

  const playerLeft = player.x - player.displayWidth / 2 + 4;
  const playerRight = player.x + player.displayWidth / 2 - 4;
  const playerBottom = player.y + player.displayHeight / 2;
  const prevBottom = player.body.prev.y + player.displayHeight / 2;

  for (const p of platforms) {
    const platformLeft = p.x - p.displayWidth / 2;
    const platformRight = p.x + p.displayWidth / 2;
    const platformTop = p.y - p.displayHeight / 2;

    const horizontallyOver =
      playerRight > platformLeft && playerLeft < platformRight;

    const crossedTop =
      prevBottom <= platformTop && playerBottom >= platformTop;

    if (horizontallyOver && crossedTop) {
      player.y = platformTop - player.displayHeight / 2;
      player.setVelocityY(JUMP);
      return;
    }
  }
}

function recyclePlatforms() {
  for (const p of platforms) {
    if (p.y > player.y + 500) {
      const topY = getTopPlatformY();
      p.x = Phaser.Math.Between(70, WIDTH - 70);
      p.y = topY - Phaser.Math.Between(110, 160);
      p.body.updateFromGameObject();
    }
  }
}

function getTopPlatformY() {
  let minY = Infinity;

  for (const p of platforms) {
    if (p.y < minY) minY = p.y;
  }

  return minY;
}

function triggerGameOver() {
  isGameOver = true;
  player.setVelocity(0, 0);
  player.body.enable = false;

  gameOverText.setVisible(true);
  restartText.setVisible(true);
}

function restartGame() {
  isGameOver = false;

  player.body.enable = true;
  player.setPosition(WIDTH / 2, this.cameras.main.scrollY + HEIGHT - 180);
  player.setVelocity(0, JUMP);

  bestY = player.y;

  let startY = this.cameras.main.scrollY + HEIGHT - 120;

  platforms.forEach((p, i) => {
    p.x = Phaser.Math.Between(70, WIDTH - 70);
    p.y = startY - i * 130;
    p.body.updateFromGameObject();
  });

  scoreText.setText("Score : 0");
  gameOverText.setVisible(false);
  restartText.setVisible(false);
}

function makeTextures() {
  const g = this.add.graphics();

  g.fillStyle(0x2e8b57, 1);
  g.fillRoundedRect(0, 0, 100, 18, 6);
  g.lineStyle(2, 0x1d5c39, 1);
  g.strokeRoundedRect(0, 0, 100, 18, 6);
  g.generateTexture("platform", 100, 18);
  g.clear();

  g.fillStyle(0xffd54f, 1);
  g.fillRoundedRect(0, 0, 30, 30, 8);
  g.lineStyle(2, 0x000000, 1);
  g.strokeRoundedRect(0, 0, 30, 30, 8);
  g.fillStyle(0x000000, 1);
  g.fillCircle(10, 10, 2);
  g.fillCircle(20, 10, 2);
  g.generateTexture("player", 30, 30);

  g.destroy();
}