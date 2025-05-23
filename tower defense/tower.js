const canvas = document.getElementById("meuCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

const path = [
  { x: 0, y: 180 },
  { x: 800, y: 180 }
];

let towers = [];
let enemies = [];
let bullets = [];
let gold = 600;
let life = 5;
let lifeVisible = true;
let lifeDisplayTimer = 0;
let enemiesKilled = 0;
let gametime = 0;
let gameover = false;
const maxGametime = 300 * 60;

function showLifeTemporarily() {
  lifeVisible = true;
  lifeDisplayTimer = 300;
}

class Enemy {
  constructor() {
    this.x = path[0].x;
    this.y = path[0].y;
    this.hp = 200;
    this.speed = 1;
  }

  update() {
    this.x += this.speed;
  }

  drawn() {
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x, this.y - 10, 20, 20);
  }
}

class Tower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.range = 100;
    this.fireRate = 10;
    this.cooldown = 0;
  }

  drawn() {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Bullet {
  constructor(x, y, target) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.speed = 5;
    this.dead = false;
  }

  update() {
    if (!this.target || this.target.hp <= 0) {
      this.dead = true;
      return;
    }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.speed) {
      this.target.hp -= 50;
      if (this.target.hp <= 0) {
        gold += 20;
        enemiesKilled++;
        showLifeTemporarily();
      }
      this.dead = true;
    } else {
      this.x += this.speed * dx / dist;
      this.y += this.speed * dy / dist;
    }
  }

  drawn() {
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (gold >= 50) {
    towers.push(new Tower(x, y));
    gold -= 50;
  }
});

function spawnEnemy() {
  let waveSize = 1 + Math.floor(gametime / (60 * 15));
  for (let i = 0; i < waveSize; i++) {
    setTimeout(() => {
      enemies.push(new Enemy());
    }, i * 200);
  }
}

function update() {
  gametime++;

  enemies.forEach(e => e.update());

  towers.forEach(t => {
    if (t.cooldown > 0) {
      t.cooldown--;
    } else {
      const target = enemies.find(e => {
        const dx = e.x - t.x;
        const dy = e.y - t.y;
        return Math.sqrt(dx * dx + dy * dy) <= t.range;
      });

      if (target) {
        bullets.push(new Bullet(t.x, t.y, target));
        t.cooldown = t.fireRate;
      }
    }
  });

  bullets.forEach(b => b.update());

  enemies = enemies.filter(e => {
    if (e.hp <= 0) return false;
    if (e.x >= canvas.width) {
      life--;
      showLifeTemporarily();
      return false;
    }
    return true;
  });

  bullets = bullets.filter(b => !b.dead);

  if (lifeDisplayTimer > 0) {
    lifeDisplayTimer--;
    if (lifeDisplayTimer === 0) {
      lifeVisible = false;
    }
  }

  if (life <= 0 || gametime >= maxGametime) {
    gameover = true;
  }
}

function drawn() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  enemies.forEach(e => e.drawn());
  towers.forEach(t => t.drawn());
  bullets.forEach(b => b.drawn());

  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText(`Ouro: ${gold}`, 10, 20);

  if (lifeVisible) {
    ctx.fillText(`Vida: ${life}`, 10, 40);
  }

  const secondsLeft = Math.max(0, Math.floor((maxGametime - gametime) / 60));
  ctx.fillText(`Tempo restante: ${secondsLeft}s`, 10, 60);
}

function gameLoop() {
  if (!gameover) {
    update();
    drawn();
    requestAnimationFrame(gameLoop);
  } else {
    showGameOverScreen();
  }
}

function showGameOverScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '32px Arial';
  ctx.fillText("Fim de jogo", canvas.width / 2 - 80, canvas.height / 2);
  ctx.font = '20px Arial';
  ctx.fillText(`Inimigos eliminados: ${enemiesKilled}`, canvas.width / 2 - 100, canvas.height / 2 + 30);

  
  document.getElementById("meu-botao").style.display = "inline-block";
}

document.getElementById("meu-botao").addEventListener("click", () => {
  
  towers = [];
  enemies = [];
  bullets = [];
  gold = 600;
  life = 5;
  enemiesKilled = 0;
  gametime = 0;
  gameover = false;
  lifeVisible = true;
  lifeDisplayTimer = 0;

  
  document.getElementById("meu-botao").style.display = "none";

  
  gameLoop();
});

setInterval(spawnEnemy, 2000);
gameLoop();
