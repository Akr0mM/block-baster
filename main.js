class Player {
  constructor() {
    ({ x: this.x, y: this.y } = mouse);
    this.width = 120;
    this.height = 100;

    this.maxLifes = 3;
    this.lifes = this.maxLifes;
    this.showPlayer = true;
    this.showLifes = false;
    this.lifeLosingVulnerability = 200;
    this.invulnerable = false;

    this.damage = 13;

    this.shootCooldown = 10;
    this.shootTimer = this.shootCooldown;

    this.bulletWidth = this.width / 15;
    this.bulletHeight = this.bulletWidth * 2.5;

    this.leftFirstCannon = { x: this.x - this.width / 3.5, y: this.y - this.height / 5, width: this.bulletWidth, height: this.bulletHeight }
    this.rightFirstCannon = { x: this.x + this.width / 3.5 - this.bulletWidth, y: this.y - this.height / 5, width: this.bulletWidth, height: this.bulletHeight }
  }

  update() {
    ({ x: this.x, y: this.y } = mouse);

    this.leftFirstCannon = { x: this.x - this.width / 3.5, y: this.y - this.height / 5, width: this.bulletWidth, height: this.bulletHeight }
    this.rightFirstCannon = { x: this.x + this.width / 3.5 - this.bulletWidth, y: this.y - this.height / 5, width: this.bulletWidth, height: this.bulletHeight }

    this.shootTimer--;
    if (!this.shootTimer) {
      this.shootTimer = this.shootCooldown;
      this.shoot();
    }
  }

  shoot() {
    bullets.push(new Bullet(this.leftFirstCannon, this.damage));
    bullets.push(new Bullet(this.rightFirstCannon, this.damage));
  }

  draw() {
    if (this.showPlayer) {
      const ship = new Image();
      ship.src = "./public/ship.png";
      ctx.drawImage(ship, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }

    if (this.showLifes) {
      const heart = new Image();
      heart.src = "./public/heart.png";
      const heartW = 25;
      let heartX = this.x - (this.lifes - 1) / 2 * heartW - heartW / 2;
      for (let i = 0; i < this.lifes; i++) {
        ctx.drawImage(heart, heartX, this.y + this.height / 2, heartW, heartW);
        heartX += heartW + 2;
      }
    }
  }

  looseLife() {
    if (this.invulnerable) return;
    this.lifes--;
    if (!this.lifes) {
      gameOver = true;
    } else {
      this.makeInvulnerable(this.lifeLosingVulnerability);
    }
  }

  makeInvulnerable(timer, _seeTimer = 15, _see = false) {
    this.invulnerable = true;
    this.showPlayer = _see;
    this.showLifes = _see;

    if (timer > 0) {
      setTimeout(() => {
        this.makeInvulnerable(timer - 1, _seeTimer - 1 || 15, _seeTimer === 1 ? !_see : _see);
      }, 10); // 100 ms pour ajuster la fréquence du clignotement
    } else {
      this.showPlayer = true;
      this.showLifes = false;
      this.invulnerable = false;
    }
  }

  getBounds() {
    return [
      {
        x: this.x - this.width / 2,
        y: this.y + this.height / 25,
        width: this.width,
        height: this.height / 3.5,
      },
      {
        x: this.x - this.width / 4,
        y: this.y + this.height / 3.2,
        width: this.width / 2,
        height: this.height / 6
      },
      {
        x: this.x - this.width / 3.2,
        y: this.y - this.height / 9,
        width: this.width / 1.6,
        height: this.height / 4,
      },
      {
        x: this.x - this.width / 8,
        y: this.y - this.height / 2,
        width: this.width / 4,
        height: this.height / 2,
      },
    ]
  }
}


class Block {
  constructor(isChild, childPos, childSize, childHealth) {
    this.sizes = [35, 60, 85];
    this.size = isChild ? childSize : Math.floor(Math.random() * this.sizes.length);

    this.radius = this.sizes[this.size];
    this.inside = false;
    this.speed = 3;

    this.maxHp = isChild ? childHealth : Math.floor(Math.random() * 1950 + 50);
    this.hp = this.maxHp;

    //                                    //! doit faire en sorte que ca sorte pas avant que this.inside soit true donc reduire les angles possible en random et pour 
    //                                    //! child pas besoin vu que deja inside 
    if (isChild) {
      ({ x: this.x, y: this.y } = childPos);
      this.angle = Math.random() * 2 * Math.PI;
    } else {
      this.x = Math.random() < 0.5 ? -this.radius : cw + this.radius;
      this.y = Math.random() < 0.5 ? -this.radius : ch + this.radius;

      if (this.x < 0 && this.y < 0) {
        this.angle = Math.random() * (Math.PI / 2) + 3 * Math.PI / 2;
      } else if (this.x < 0 && this.y > 0) {
        this.angle = Math.random() * (Math.PI / 2);
      } else if (this.x > 0 && this.y < 0) {
        this.angle = Math.random() * (Math.PI / 2) + Math.PI;
      } else {
        this.angle = Math.random() * (Math.PI / 2) + Math.PI / 2;
      }
    }

    this.velx = Math.cos(this.angle);
    this.vely = -Math.sin(this.angle);

    this.timer = 200;
    this.timer = 0;
  }

  update() {
    if (this.timer) {
      this.timer--;
    } else {
      this.x += this.velx * this.speed;
      this.y += this.vely * this.speed;

      if (this.inside) {
        if (this.x - this.radius < 0) this.velx = -this.velx;
        else if (this.x + this.radius > cw) this.velx = -this.velx;
        else if (this.y - this.radius < 0) this.vely = -this.vely;
        else if (this.y + this.radius > ch) this.vely = -this.vely;
      }

      this.inside = this.x - this.radius > 0 && this.x + this.radius < cw && this.y - this.radius > 0 && this.y + this.radius < ch;
    }
  }

  collide(bound) {
    let closestX = Math.max(bound.x, Math.min(this.x, bound.x + bound.width));
    let closestY = Math.max(bound.y, Math.min(this.y, bound.y + bound.height));

    let dx = this.x - closestX;
    let dy = this.y - closestY;
    let distanceSquared = dx * dx + dy * dy;

    return distanceSquared < this.radius * this.radius;
  }

  draw() {
    if (this.timer) {

    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.stroke();

      const fontSize = Math.floor(this.radius * 2 / 3);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = "blue";
      ctx.fillText(this.hp, this.x, this.y);
    }
  }
}

class Bullet {
  constructor(cannon, _damage) {
    this.x = cannon.x;
    this.y = cannon.y;
    this.width = cannon.width;
    this.height = cannon.height;
    this.speed = 6;
    this.damage = _damage;
  }

  update() {
    this.y -= this.speed;
  }

  draw() {
    rect(this.x, this.y, this.width, this.height, "red");
  }
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const cw = window.innerWidth;
const ch = window.innerHeight;

canvas.width = cw;
canvas.height = ch;

let menu;
let mouse;
let player;
let bullets;
let blocs;
let gameOver;

function newGame() {
  menu = false;
  mouse = { x: cw / 2, y: ch / 2 };
  player = new Player();
  bullets = [];
  blocs = [new Block()];
  gameOver = false;
}

function update() {
  player.update();

  for (let i = blocs.length - 1; i >= 0; i--) {
    const b = blocs[i];

    b.update();
    for (let j = bullets.length - 1; j >= 0; j--) {
      const bullet = bullets[j]

      if (b.collide(bullet)) {
        b.hp -= bullet.damage;

        if (b.hp <= 0) {
          if (b.size != 0) {
            blocs.push(new Block(true, { x: b.x, y: b.y }, b.size - 1, Math.floor(b.maxHp / 2)))
            blocs.push(new Block(true, { x: b.x, y: b.y }, b.size - 1, Math.floor(b.maxHp / 2)))
          }
          blocs.splice(i, 1);
        }

        bullets.splice(j, 1);
      }

    }

    const pB = player.getBounds();
    if (b.collide(pB[0]) || b.collide(pB[1]) || b.collide(pB[2]) || b.collide(pB[3])) {
      player.looseLife();
    }
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];

    b.update();
    if (b.y + b.height < 0) {
      bullets.splice(i, 1);
    }
  }
}

function draw() {
  // bg
  rect(0, 0, cw, ch, "#121212");

  player.draw();

  for (let i = 0; i < blocs.length; i++) {
    blocs[i].draw();
  }

  for (let i = 0; i < bullets.length; i++) {
    bullets[i].draw();
  }
}

function drawMenu() {
  rect(0, 0, cw, ch, "#cccccc")
}

function rect(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}

function drawGameOver() {
  let r = Math.random() * 255;
  let g = Math.random() * 255;
  let b = Math.random() * 255;

  rect(0, 0, cw, ch, `rgb(${r}, ${g}, ${b})`);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "200px Arial";
  ctx.fillStyle = `rgb(${b}, ${r}, ${g})`;
  ctx.fillText("GAME OVER", cw / 2, ch / 2);
  ctx.font = "50px Arial";
  ctx.fillStyle = `rgb(${g}, ${b}, ${r})`;
  ctx.fillText("CLICK TO RESTART", cw / 2, ch / 2 + 110);
}

function animate() {
  if (gameOver) {
    drawGameOver();
  } else {
    if (menu) {
      drawMenu();
    } else {
      update();
      draw();
    }
  }

  requestAnimationFrame(animate);
}

window.addEventListener("contextmenu", event => {
  event.preventDefault();
})

window.addEventListener("click", event => {
  if (menu) {
    mouse = { x: event.clientX, y: event.clientY }
    menu = false;
  } else if (gameOver) {
    newGame();
  }
})

window.addEventListener("mousemove", event => {
  mouse = { x: event.clientX, y: event.clientY }
})

newGame();
animate();

