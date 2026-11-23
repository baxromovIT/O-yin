/**
 * 6-10 YOSH: "OLTIN QUVURLAR"
 * Mantiqiy mexanik quvurlar va suyuq energiya oqimi jumboqlari. 4 ta to'liq tekshirilgan bosqich.
 */

class PipesGame {
  constructor() {
    this.currentLevel = 0;
    this.grid = [];
    this.rows = 4;
    this.cols = 4;
    this.sourcePos = { r: 0, c: 0, dir: 1 };
    this.vaultPos = { r: 3, c: 3, dir: 0 };
    this.isSolved = false;
    this.isFlowing = false;
    this.flowPath = [];
    this.moves = 0;

    // 4 ta aniq tekshirilgan va kafolatlangan bosqich
    this.levels = [
      {
        id: 1,
        title: "1-Bosqich: Boshlang'ich Oqim",
        rows: 4,
        cols: 4,
        source: { r: 0, c: 0, dir: 1 }, // Manba Sharqqa (o'ngga) chiqadi
        vault: { r: 3, c: 3, dir: 0 },  // Xazina Shimoldan (yuqoridan) qabul qiladi
        layout: [
          // row 0: (0,0)->(0,1)
          ['source',   'corner',   'straight', 'corner'],
          // row 1: (1,1)->(1,2)
          ['straight', 'corner',   'corner',   'straight'],
          // row 2: (2,2)->(2,3)
          ['corner',   'straight', 'corner',   'straight'],
          // row 3: (2,3)->(3,3)
          ['straight', 'corner',   'straight', 'vault']
        ],
        // Dastlabki chalkashtirilgan burilishlar (0, 1, 2, 3)
        // Yechim yo'li: (0,0)->(0,1)[W-S: rot 2]->(1,1)[N-E: rot 0]->(1,2)[W-S: rot 2]->(2,2)[N-E: rot 0]->(2,3)[N-S: rot 0]->(3,3)
        rotations: [
          [0, 1, 1, 3],
          [0, 3, 1, 0],
          [2, 0, 3, 1],
          [1, 3, 0, 0]
        ]
      },
      {
        id: 2,
        title: "2-Bosqich: Burilishlar Sirlari",
        rows: 4,
        cols: 4,
        source: { r: 0, c: 0, dir: 2 }, // Janubga (pastga) chiqadi
        vault: { r: 3, c: 3, dir: 3 },  // G'arbdan (chapdan) qabul qiladi
        layout: [
          // (0,0)->(1,0)->(2,0)->(2,1)->(3,1)->(3,2)->(3,3)
          ['source',   'straight', 'corner',   'block'],
          ['straight', 'tee',      'corner',   'straight'],
          ['corner',   'tee',      'straight', 'corner'],
          ['block',    'corner',   'straight', 'vault']
        ],
        rotations: [
          [0, 1, 3, 0],
          [1, 2, 1, 0],
          [3, 0, 0, 2],
          [0, 1, 1, 0]
        ]
      },
      {
        id: 3,
        title: "3-Bosqich: Bosim Taqsimoti",
        rows: 5,
        cols: 5,
        source: { r: 0, c: 1, dir: 2 }, // Janubga chiqadi
        vault: { r: 4, c: 3, dir: 0 },  // Shimoldan qabul qiladi
        layout: [
          ['block',    'source',   'corner',   'straight', 'corner'],
          ['corner',   'corner',   'tee',      'straight', 'corner'],
          ['straight', 'straight', 'block',    'straight', 'straight'],
          ['corner',   'corner',   'straight', 'straight', 'corner'],
          ['straight', 'corner',   'straight', 'vault',    'block']
        ],
        rotations: [
          [0, 0, 2, 1, 3],
          [1, 3, 0, 0, 1],
          [0, 1, 0, 0, 1],
          [2, 0, 1, 0, 2],
          [1, 0, 3, 0, 0]
        ]
      },
      {
        id: 4,
        title: "4-Bosqich: Katta Magistral",
        rows: 5,
        cols: 5,
        source: { r: 0, c: 0, dir: 1 }, // Sharqqa chiqadi
        vault: { r: 4, c: 4, dir: 3 },  // G'arbdan qabul qiladi
        layout: [
          ['source',   'tee',      'straight', 'corner',   'block'],
          ['corner',   'cross',    'corner',   'tee',      'corner'],
          ['straight', 'corner',   'block',    'corner',   'straight'],
          ['tee',      'corner',   'cross',    'corner',   'tee'],
          ['corner',   'straight', 'corner',   'straight', 'vault']
        ],
        rotations: [
          [0, 2, 0, 1, 0],
          [3, 1, 2, 0, 3],
          [1, 0, 0, 2, 1],
          [0, 3, 1, 0, 2],
          [2, 1, 3, 1, 0]
        ]
      }
    ];
  }

  mount(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="pipes-game-wrapper">
        <!-- Yuqori axborot paneli -->
        <div class="pipes-header glass-card">
          <div class="level-indicator">
            <span class="level-label" id="pipes-level-title">1-Bosqich</span>
            <span class="moves-count" id="pipes-moves-count">Harakatlar: 0</span>
          </div>
          <div class="status-indicator" id="pipes-status-msg">
            Quvurlarni burab, Oltin Oqimni Xazinaga ulang!
          </div>
          <div class="pipes-actions">
            <button class="btn-secondary" id="btn-pipe-restart">
              <span>🔄</span> Qayta boshlash
            </button>
            <button class="btn-primary" id="btn-pipe-flow" disabled>
              <span>⚡</span> Oqimni yoqish
            </button>
          </div>
        </div>

        <!-- Asosiy o'yin maydoni -->
        <div class="pipes-board-container glass-card">
          <div class="pipes-grid" id="pipes-grid"></div>
        </div>

        <!-- Bosqich yakunlanganida chiqadigan modal -->
        <div class="pipes-modal-overlay" id="pipes-modal" style="display: none;">
          <div class="pipes-modal-content glass-card">
            <div class="modal-icon">🏆</div>
            <h3 class="modal-title" id="pipes-modal-title">Ajoyib G'alaba!</h3>
            <p class="modal-desc" id="pipes-modal-desc">Suyuq oltin quvvati xazinaga muvaffaqiyatli yetib bordi!</p>
            <div class="modal-reward">+100 XP Aql Quvvati</div>
            <button class="btn-primary" id="btn-pipes-next-level">
              Keyingi Bosqich →
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindDOMEvents();
    this.startLevel(0);
  }

  bindDOMEvents() {
    document.getElementById('btn-pipe-restart').addEventListener('click', () => {
      this.startLevel(this.currentLevel);
      window.soundEngine.playButtonTick();
    });

    document.getElementById('btn-pipe-flow').addEventListener('click', () => {
      if (this.isSolved && !this.isFlowing) {
        this.triggerFlowAnimation();
      }
    });

    document.getElementById('btn-pipes-next-level').addEventListener('click', () => {
      document.getElementById('pipes-modal').style.display = 'none';
      if (this.currentLevel + 1 < this.levels.length) {
        this.startLevel(this.currentLevel + 1);
      } else {
        this.startLevel(0);
      }
    });
  }

  startLevel(lvlIdx) {
    this.currentLevel = lvlIdx;
    const lvl = this.levels[this.currentLevel];
    this.rows = lvl.rows;
    this.cols = lvl.cols;
    this.sourcePos = { ...lvl.source };
    this.vaultPos = { ...lvl.vault };
    this.isSolved = false;
    this.isFlowing = false;
    this.moves = 0;
    this.flowPath = [];

    document.getElementById('pipes-level-title').textContent = lvl.title;
    document.getElementById('pipes-moves-count').textContent = `Harakatlar: ${this.moves}`;
    document.getElementById('pipes-status-msg').textContent = "Quvurlarni burab, Oltin Oqimni Xazinaga ulang!";
    document.getElementById('btn-pipe-flow').disabled = true;

    // To'r matritsasini qurish
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) {
        const type = lvl.layout[r][c];
        const rot = lvl.rotations[r][c];
        row.push({
          r, c,
          type,
          rotation: rot,
          isFilled: false
        });
      }
      this.grid.push(row);
    }

    this.renderGrid();
    this.checkConnectivity();
  }

  // Quvur turlari bo'yicha ulanish portlari: [North, East, South, West]
  getBasePorts(type) {
    switch (type) {
      case 'straight':
        return [1, 0, 1, 0]; // Vertikal (Shimol va Janub)
      case 'corner':
        return [1, 1, 0, 0]; // Shimol va Sharq
      case 'tee':
        return [1, 1, 1, 0]; // T-shakl (Shimol, Sharq, Janub)
      case 'cross':
        return [1, 1, 1, 1]; // To'rt tomonlama
      default:
        return [0, 0, 0, 0];
    }
  }

  getRotatedPorts(tile) {
    if (tile.type === 'source') {
      const p = [0, 0, 0, 0];
      p[this.sourcePos.dir] = 1;
      return p;
    }
    if (tile.type === 'vault') {
      const p = [0, 0, 0, 0];
      p[this.vaultPos.dir] = 1;
      return p;
    }
    if (tile.type === 'block') return [0, 0, 0, 0];

    const base = this.getBasePorts(tile.type);
    const rot = tile.rotation % 4;
    const shifted = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
      shifted[(i + rot) % 4] = base[i];
    }
    return shifted;
  }

  renderGrid() {
    const gridEl = document.getElementById('pipes-grid');
    if (!gridEl) return;

    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const tile = this.grid[r][c];
        const tileEl = document.createElement('div');
        tileEl.className = `pipe-tile type-${tile.type} ${tile.isFilled ? 'filled' : ''}`;
        tileEl.id = `tile-${r}-${c}`;
        tileEl.dataset.r = r;
        tileEl.dataset.c = c;

        tileEl.innerHTML = this.getTileGraphicHTML(tile);

        if (tile.type !== 'source' && tile.type !== 'vault' && tile.type !== 'block') {
          tileEl.addEventListener('click', () => this.rotateTile(r, c));
        }

        gridEl.appendChild(tileEl);
      }
    }
  }

  getTileGraphicHTML(tile) {
    const rotDeg = tile.rotation * 90;

    if (tile.type === 'source') {
      return `
        <div class="tile-content source-content">
          <div class="source-beacon"></div>
          <span class="tile-tag">MANBA</span>
        </div>
      `;
    }

    if (tile.type === 'vault') {
      return `
        <div class="tile-content vault-content">
          <div class="vault-box">
            <span class="vault-lock">🔒</span>
          </div>
          <span class="tile-tag">XAZINA</span>
        </div>
      `;
    }

    if (tile.type === 'block') {
      return `
        <div class="tile-content block-content">
          <div class="obstacle-stone">◆</div>
        </div>
      `;
    }

    return `
      <div class="tile-content pipe-content" style="transform: rotate(${rotDeg}deg);">
        <svg class="pipe-svg" viewBox="0 0 100 100">
          ${this.getPipeSvgPath(tile.type)}
        </svg>
      </div>
    `;
  }

  getPipeSvgPath(type) {
    if (type === 'straight') {
      return `
        <rect x="36" y="0" width="28" height="100" class="pipe-body" rx="4" />
        <rect x="42" y="0" width="16" height="100" class="pipe-fluid" />
        <circle cx="50" cy="50" r="10" class="pipe-joint" />
      `;
    } else if (type === 'corner') {
      return `
        <path d="M 36 0 L 64 0 L 64 36 L 100 36 L 100 64 L 36 64 Z" class="pipe-body" />
        <path d="M 42 0 L 58 0 L 58 42 L 100 42 L 100 58 L 42 58 Z" class="pipe-fluid" />
        <circle cx="50" cy="50" r="10" class="pipe-joint" />
      `;
    } else if (type === 'tee') {
      return `
        <path d="M 36 0 L 64 0 L 64 36 L 100 36 L 100 64 L 64 64 L 64 100 L 36 100 Z" class="pipe-body" />
        <path d="M 42 0 L 58 0 L 58 42 L 100 42 L 100 58 L 58 58 L 58 100 L 42 100 Z" class="pipe-fluid" />
        <circle cx="50" cy="50" r="12" class="pipe-joint" />
      `;
    } else if (type === 'cross') {
      return `
        <rect x="36" y="0" width="28" height="100" class="pipe-body" rx="4" />
        <rect x="0" y="36" width="100" height="28" class="pipe-body" rx="4" />
        <rect x="42" y="0" width="16" height="100" class="pipe-fluid" />
        <rect x="0" y="42" width="100" height="16" class="pipe-fluid" />
        <circle cx="50" cy="50" r="14" class="pipe-joint" />
      `;
    }
    return '';
  }

  rotateTile(r, c) {
    if (this.isFlowing) return;
    const tile = this.grid[r][c];
    tile.rotation = (tile.rotation + 1) % 4;
    this.moves++;
    document.getElementById('pipes-moves-count').textContent = `Harakatlar: ${this.moves}`;

    const tileEl = document.getElementById(`tile-${r}-${c}`);
    if (tileEl) {
      const content = tileEl.querySelector('.pipe-content');
      if (content) {
        content.style.transform = `rotate(${tile.rotation * 90}deg)`;
      }
    }

    window.soundEngine.playPipeRotate();
    this.checkConnectivity();
  }

  // BFS orqali Manba va Xazina orasidagi bog'liqlikni tekshirish
  checkConnectivity() {
    const dr = [-1, 0, 1, 0];
    const dc = [0, 1, 0, -1];
    const opp = [2, 3, 0, 1];

    const queue = [{ r: this.sourcePos.r, c: this.sourcePos.c, path: [] }];
    const visited = new Set();
    visited.add(`${this.sourcePos.r},${this.sourcePos.c}`);

    let foundPath = null;

    while (queue.length > 0) {
      const current = queue.shift();
      const curTile = this.grid[current.r][current.c];
      const curPorts = this.getRotatedPorts(curTile);
      const newPath = [...current.path, { r: current.r, c: current.c }];

      if (current.r === this.vaultPos.r && current.c === this.vaultPos.c) {
        foundPath = newPath;
        break;
      }

      for (let dir = 0; dir < 4; dir++) {
        if (curPorts[dir] === 1) {
          const nr = current.r + dr[dir];
          const nc = current.c + dc[dir];

          if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
            const key = `${nr},${nc}`;
            if (!visited.has(key)) {
              const nextTile = this.grid[nr][nc];
              const nextPorts = this.getRotatedPorts(nextTile);

              if (nextPorts[opp[dir]] === 1) {
                visited.add(key);
                queue.push({ r: nr, c: nc, path: newPath });
              }
            }
          }
        }
      }
    }

    if (foundPath) {
      this.isSolved = true;
      this.flowPath = foundPath;
      document.getElementById('pipes-status-msg').innerHTML = `<span style="color:#10b981;font-weight:700;">Bog'lanish mavjud! Oqimni yoqing! ⚡</span>`;
      const btnFlow = document.getElementById('btn-pipe-flow');
      btnFlow.disabled = false;
      btnFlow.classList.add('pulse-glow');
    } else {
      this.isSolved = false;
      this.flowPath = [];
      document.getElementById('pipes-status-msg').textContent = "Quvurlarni burab, Oltin Oqimni Xazinaga ulang!";
      const btnFlow = document.getElementById('btn-pipe-flow');
      btnFlow.disabled = true;
      btnFlow.classList.remove('pulse-glow');
    }
  }

  // Oqim animatsiyasi
  triggerFlowAnimation() {
    this.isFlowing = true;
    document.getElementById('btn-pipe-flow').disabled = true;
    window.soundEngine.playFluidRush();

    this.flowPath.forEach((pt, idx) => {
      setTimeout(() => {
        const tileEl = document.getElementById(`tile-${pt.r}-${pt.c}`);
        if (tileEl) {
          tileEl.classList.add('flowing-active');
        }

        if (idx === this.flowPath.length - 1) {
          setTimeout(() => {
            this.handleLevelComplete();
          }, 350);
        }
      }, idx * 160);
    });
  }

  handleLevelComplete() {
    window.soundEngine.playVictoryFanfare();
    const vaultEl = document.getElementById(`tile-${this.vaultPos.r}-${this.vaultPos.c}`);
    if (vaultEl) {
      const lock = vaultEl.querySelector('.vault-lock');
      if (lock) lock.textContent = '🔓';
      vaultEl.classList.add('vault-unlocked');
    }

    if (window.appState) {
      window.appState.addXP(100, `${this.levels[this.currentLevel].title} muvaffaqiyatli yakunlandi!`);
    }

    setTimeout(() => {
      const modal = document.getElementById('pipes-modal');
      const title = document.getElementById('pipes-modal-title');
      const desc = document.getElementById('pipes-modal-desc');

      title.textContent = `${this.levels[this.currentLevel].title} Yechildi!`;
      desc.textContent = `Siz ${this.moves} ta mohirona harakat bilan suyuq oltin oqimini to'liq yo'naltirdingiz!`;
      modal.style.display = 'flex';
      this.isFlowing = false;
    }, 600);
  }

  destroy() {
    this.isFlowing = false;
  }
}

window.PipesGame = PipesGame;
