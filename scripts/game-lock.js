/**
 * 11-15 YOSH: "KIBER-QULF"
 * Strategik vaqt, tezkor reaksiya, aylanuvchi xavfsizlik halqalari, lazerlar va sekinlashtirilgan kadr (near-miss).
 */

class CyberLockGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 800;
    this.height = 700;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.currentStage = 1;
    this.maxStages = 3;

    // O'yinchi sferasi
    this.player = {
      x: 400,
      y: 630,
      radius: 13,
      vx: 0,
      vy: 0,
      speed: 4.8,
      shield: 3, // 3 ta himoya zaryadi
      color: '#38bdf8'
    };

    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    this.mouseControl = false;
    this.targetMouse = { x: 400, y: 630 };

    // Sekinlashtirilgan vaqt (Slow-motion near-miss)
    this.timeScale = 1.0;
    this.slowMoTimer = 0;
    this.nearMissCooldown = 0;

    // 3 ta Ma'lumotlar kaliti
    this.dataKeys = [];

    // Halqalar va lazerlar
    this.rings = [];
    this.lasers = [];
    this.particles = [];

    // Yadro holati
    this.core = {
      x: 400,
      y: 75,
      radius: 35,
      unlocked: false
    };

    this.isGameOver = false;
    this.isVictory = false;
    this.animId = null;
  }

  mount(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="cyber-lock-wrapper">
        <!-- Yuqori HUD -->
        <div class="lock-hud glass-card">
          <div class="hud-item stage-tag">
            <span class="hud-label">BOSQICH:</span>
            <span class="hud-val" id="lock-stage-val">1 / 3</span>
          </div>
          <div class="hud-item keys-tag">
            <span class="hud-label">MA'LUMOTLAR KALITI:</span>
            <div class="key-icons" id="lock-keys-icons">
              <span class="key-icon" id="key-1">🗝️</span>
              <span class="key-icon" id="key-2">🗝️</span>
              <span class="key-icon" id="key-3">🗝️</span>
            </div>
          </div>
          <div class="hud-item shield-tag">
            <span class="hud-label">QALQON:</span>
            <div class="shield-bars" id="lock-shield-bars">
              <span class="shield-pip active"></span>
              <span class="shield-pip active"></span>
              <span class="shield-pip active"></span>
            </div>
          </div>
          <div class="hud-item actions">
            <button class="btn-secondary" id="btn-lock-restart">
              <span>🔄</span> Qayta
            </button>
          </div>
        </div>

        <!-- Kanvas Maydoni -->
        <div class="lock-canvas-container glass-card">
          <canvas id="cyber-lock-canvas" width="800" height="700"></canvas>
          <div class="slowmo-overlay" id="lock-slowmo-alert" style="opacity: 0;">
            <span>⚡ SEKINLASHTIRILGAN REJIM ⚡</span>
          </div>
        </div>

        <!-- Boshqaruv ko'rsatmasi -->
        <div class="lock-instructions">
          <span>🎮 <b>Boshqaruv:</b> Klaviatura strelkalari [WASD / ↑↓←→] yoki Sichqoncha / Sensor orqali sferani yo'naltiring.</span>
        </div>

        <!-- G'alaba modali -->
        <div class="lock-modal-overlay" id="lock-modal" style="display: none;">
          <div class="lock-modal-content glass-card">
            <div class="modal-icon">🔓</div>
            <h3 class="modal-title" id="lock-modal-title">Kiber-Qulf Buzildi!</h3>
            <p class="modal-desc" id="lock-modal-desc">Siz yuqori aniqlik va tezkor reaksiya bilan barcha xavfsizlik to'siqlaridan o'tdingiz!</p>
            <div class="modal-reward">+150 XP Aql Quvvati</div>
            <button class="btn-primary" id="btn-lock-next">
              Keyingi Bosqich →
            </button>
          </div>
        </div>
      </div>
    `;

    this.canvas = document.getElementById('cyber-lock-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.bindEvents();
    this.initStage(1);
    this.startLoop();
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) { this.keys.up = true; e.preventDefault(); }
      if (['ArrowDown', 'KeyS'].includes(e.code)) { this.keys.down = true; e.preventDefault(); }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) { this.keys.left = true; e.preventDefault(); }
      if (['ArrowRight', 'KeyD'].includes(e.code)) { this.keys.right = true; e.preventDefault(); }
      this.mouseControl = false;
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = false;
    });

    const getCanvasPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    this.canvas.addEventListener('mousemove', (e) => {
      const pos = getCanvasPos(e);
      this.targetMouse = pos;
      this.mouseControl = true;
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        this.targetMouse = {
          x: (e.touches[0].clientX - rect.left) * (this.canvas.width / rect.width),
          y: (e.touches[0].clientY - rect.top) * (this.canvas.height / rect.height)
        };
        this.mouseControl = true;
        e.preventDefault();
      }
    }, { passive: false });

    document.getElementById('btn-lock-restart').addEventListener('click', () => {
      this.initStage(this.currentStage);
      window.soundEngine.playButtonTick();
    });

    document.getElementById('btn-lock-next').addEventListener('click', () => {
      document.getElementById('lock-modal').style.display = 'none';
      if (this.currentStage < this.maxStages) {
        this.initStage(this.currentStage + 1);
      } else {
        this.initStage(1);
      }
    });
  }

  initStage(stage) {
    this.currentStage = stage;
    this.isGameOver = false;
    this.isVictory = false;
    this.timeScale = 1.0;
    this.slowMoTimer = 0;
    this.particles = [];

    // O'yinchini boshlang'ich nuqtaga qaytarish
    this.player.x = 400;
    this.player.y = 630;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.shield = 3;

    // Yadro markazi va radiusi
    const cx = 400;
    const cy = 340; // Halqalar markazi

    this.core = {
      x: 400,
      y: 75,
      radius: 35,
      unlocked: false
    };

    document.getElementById('lock-stage-val').textContent = `${this.currentStage} / ${this.maxStages}`;
    this.updateHUD();

    // 3 ta Ma'lumotlar kalitini yaratish
    this.dataKeys = [
      { id: 1, x: 260, y: 480, collected: false, pulse: 0 },
      { id: 2, x: 540, y: 340, collected: false, pulse: 0 },
      { id: 3, x: 320, y: 200, collected: false, pulse: 0 }
    ];

    // Bosqichlarga ko'ra halqalar konfiguratsiyasi
    if (stage === 1) {
      this.rings = [
        {
          cx, cy, radius: 130, thickness: 16,
          angle: 0, speed: 0.012,
          gaps: [{ start: 0, size: 1.1 }]
        },
        {
          cx, cy, radius: 210, thickness: 18,
          angle: Math.PI, speed: -0.01,
          gaps: [{ start: 0, size: 1.2 }]
        }
      ];

      this.lasers = [
        {
          x1: 150, y1: 340, x2: 650, y2: 340,
          baseY: 340, rangeY: 70, speed: 0.02, t: 0
        }
      ];
    } else if (stage === 2) {
      this.rings = [
        {
          cx, cy, radius: 110, thickness: 16,
          angle: 0, speed: 0.016,
          gaps: [{ start: 0, size: 0.95 }]
        },
        {
          cx, cy, radius: 180, thickness: 18,
          angle: Math.PI / 2, speed: -0.014,
          gaps: [{ start: 0, size: 0.9 }]
        },
        {
          cx, cy, radius: 250, thickness: 20,
          angle: Math.PI, speed: 0.011,
          gaps: [{ start: 0, size: 1.0 }]
        }
      ];

      this.lasers = [
        {
          x1: 120, y1: 270, x2: 680, y2: 270,
          baseY: 270, rangeY: 60, speed: 0.025, t: 0
        },
        {
          x1: 120, y1: 420, x2: 680, y2: 420,
          baseY: 420, rangeY: 70, speed: -0.02, t: 1.5
        }
      ];
    } else {
      // 3-Bosqich: Giper-Qulf
      this.rings = [
        {
          cx, cy, radius: 95, thickness: 16,
          angle: 0, speed: 0.022,
          gaps: [{ start: 0, size: 0.8 }]
        },
        {
          cx, cy, radius: 160, thickness: 18,
          angle: Math.PI * 0.4, speed: -0.018,
          gaps: [{ start: 0, size: 0.85 }]
        },
        {
          cx, cy, radius: 225, thickness: 18,
          angle: Math.PI * 0.9, speed: 0.016,
          gaps: [{ start: 0, size: 0.8 }]
        },
        {
          cx, cy, radius: 280, thickness: 20,
          angle: Math.PI * 1.5, speed: -0.012,
          gaps: [{ start: 0, size: 0.9 }]
        }
      ];

      this.lasers = [
        {
          x1: 100, y1: 220, x2: 700, y2: 220,
          baseY: 220, rangeY: 70, speed: 0.03, t: 0
        },
        {
          x1: 100, y1: 460, x2: 700, y2: 460,
          baseY: 460, rangeY: 70, speed: 0.028, t: 1.2
        }
      ];
    }
  }

  updateHUD() {
    // Kalitlar holati
    this.dataKeys.forEach(k => {
      const el = document.getElementById(`key-${k.id}`);
      if (el) {
        if (k.collected) el.classList.add('collected');
        else el.classList.remove('collected');
      }
    });

    // Qalqon pips
    const pips = document.querySelectorAll('.shield-pip');
    pips.forEach((pip, idx) => {
      if (idx < this.player.shield) {
        pip.classList.add('active');
      } else {
        pip.classList.remove('active');
      }
    });
  }

  triggerNearMiss() {
    if (this.nearMissCooldown > 0) return;
    this.nearMissCooldown = 60; // 1 soniya cooldown
    this.slowMoTimer = 45; // 0.75 soniya sekin kadr
    this.timeScale = 0.28;
    window.soundEngine.playSlowMotion();

    const alertEl = document.getElementById('lock-slowmo-alert');
    if (alertEl) {
      alertEl.style.opacity = '1';
      setTimeout(() => { alertEl.style.opacity = '0'; }, 800);
    }
  }

  handleHit() {
    this.player.shield--;
    this.updateHUD();
    window.soundEngine.playLaserZap();

    // Uchqunlar portlashi
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: this.player.x,
        y: this.player.y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        radius: 2 + Math.random() * 3,
        color: '#f43f5e',
        alpha: 1.0
      });
    }

    if (this.player.shield <= 0) {
      // Qayta boshlash
      this.player.x = 400;
      this.player.y = 630;
      this.player.shield = 3;
      this.updateHUD();
    } else {
      // Kichik orqaga surish
      this.player.y = Math.min(630, this.player.y + 40);
    }
  }

  checkCoreUnlock() {
    const allCollected = this.dataKeys.every(k => k.collected);
    if (allCollected && !this.core.unlocked) {
      this.core.unlocked = true;
      window.soundEngine.playVictoryFanfare();
    }
  }

  startLoop() {
    const updateAndDraw = () => {
      this.update();
      this.draw();
      this.animId = requestAnimationFrame(updateAndDraw);
    };
    if (this.animId) cancelAnimationFrame(this.animId);
    updateAndDraw();
  }

  update() {
    // Sekinlashtirilgan vaqt hisobi
    if (this.slowMoTimer > 0) {
      this.slowMoTimer--;
      if (this.slowMoTimer <= 0) this.timeScale = 1.0;
    }
    if (this.nearMissCooldown > 0) this.nearMissCooldown--;

    const dt = this.timeScale;

    // 1. O'yinchi harakati
    if (this.mouseControl) {
      const dx = this.targetMouse.x - this.player.x;
      const dy = this.targetMouse.y - this.player.y;
      this.player.x += dx * 0.12 * dt;
      this.player.y += dy * 0.12 * dt;
    } else {
      let mx = 0;
      let my = 0;
      if (this.keys.up) my -= 1;
      if (this.keys.down) my += 1;
      if (this.keys.left) mx -= 1;
      if (this.keys.right) mx += 1;

      if (mx !== 0 && my !== 0) {
        mx *= 0.7071;
        my *= 0.7071;
      }

      this.player.x += mx * this.player.speed * dt;
      this.player.y += my * this.player.speed * dt;
    }

    // Chegaralar
    this.player.x = Math.max(25, Math.min(this.width - 25, this.player.x));
    this.player.y = Math.max(25, Math.min(this.height - 25, this.player.y));

    // 2. Kalitlarni terish
    this.dataKeys.forEach(k => {
      if (!k.collected) {
        k.pulse += 0.05;
        const dist = Math.hypot(this.player.x - k.x, this.player.y - k.y);
        if (dist < this.player.radius + 18) {
          k.collected = true;
          window.soundEngine.playKeyCollect();
          this.updateHUD();
          this.checkCoreUnlock();
        }
      }
    });

    // 3. Halqalar aylanishi va to'qnashuv
    this.rings.forEach(ring => {
      ring.angle += ring.speed * dt;

      // O'yinchi va halqa markazi masofasi
      const dx = this.player.x - ring.cx;
      const dy = this.player.y - ring.cy;
      const dist = Math.hypot(dx, dy);

      const rInner = ring.radius - ring.thickness / 2;
      const rOuter = ring.radius + ring.thickness / 2;

      // Near-miss tekshiruvi (halqa sirtiga juda yaqin bo'lsa)
      if (dist >= rInner - 12 && dist <= rOuter + 12) {
        let pAngle = Math.atan2(dy, dx);
        if (pAngle < 0) pAngle += Math.PI * 2;

        let inGap = false;
        let nearGapEdge = false;

        ring.gaps.forEach(gap => {
          let gStart = (ring.angle + gap.start) % (Math.PI * 2);
          if (gStart < 0) gStart += Math.PI * 2;
          let gEnd = (gStart + gap.size) % (Math.PI * 2);

          let isInside = false;
          if (gStart < gEnd) {
            isInside = (pAngle >= gStart && pAngle <= gEnd);
          } else {
            isInside = (pAngle >= gStart || pAngle <= gEnd);
          }

          if (isInside) {
            inGap = true;
            // Qirralariga yaqinlik
            const d1 = Math.abs(pAngle - gStart);
            const d2 = Math.abs(pAngle - gEnd);
            if (d1 < 0.12 || d2 < 0.12) nearGapEdge = true;
          }
        });

        // Agar halqa qattiq qismiga tushsa -> To'qnashuv
        if (dist >= rInner && dist <= rOuter) {
          if (!inGap) {
            this.handleHit();
          } else if (nearGapEdge) {
            this.triggerNearMiss();
          }
        } else if (!inGap) {
          this.triggerNearMiss();
        }
      }
    });

    // 4. Lazer nurlari harakati va to'qnashuv
    this.lasers.forEach(laser => {
      laser.t += laser.speed * dt;
      const curY = laser.baseY + Math.sin(laser.t) * laser.rangeY;

      // O'yinchi lazer bilan to'qnashuvi
      const distY = Math.abs(this.player.y - curY);
      const isXInRange = this.player.x >= laser.x1 && this.player.x <= laser.x2;

      if (isXInRange) {
        if (distY < this.player.radius + 3) {
          this.handleHit();
        } else if (distY < this.player.radius + 16) {
          this.triggerNearMiss();
        }
      }
    });

    // 5. Yadroga yetish
    if (this.core.unlocked && !this.isVictory) {
      const distCore = Math.hypot(this.player.x - this.core.x, this.player.y - this.core.y);
      if (distCore < this.player.radius + this.core.radius) {
        this.isVictory = true;
        this.handleStageVictory();
      }
    }

    // 6. Zarrachalar
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.02;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }
  }

  handleStageVictory() {
    window.soundEngine.playVictoryFanfare();
    if (window.appState) {
      window.appState.addXP(150, `Kiber-Qulf ${this.currentStage}-bosqichi muvaffaqiyatli ochildi!`);
    }

    setTimeout(() => {
      const modal = document.getElementById('lock-modal');
      const title = document.getElementById('lock-modal-title');
      const desc = document.getElementById('lock-modal-desc');

      title.textContent = `${this.currentStage}-Bosqich Kiber-Qulfi Buzildi!`;
      desc.textContent = `Barcha ma'lumotlar kalitlari topildi va xavfsizlik yadrosi muvaffaqiyatli faolsizlantirildi!`;
      modal.style.display = 'flex';
    }, 400);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Fon to'ri (Solar cyber grid)
    this.ctx.strokeStyle = 'rgba(219, 234, 254, 0.4)';
    this.ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < this.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    // 2. Boshlang'ich dok (Pastki maydoncha)
    this.ctx.fillStyle = 'rgba(241, 245, 249, 0.8)';
    this.ctx.strokeStyle = '#cbd5e1';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(400, 630, 45, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#64748b';
    this.ctx.font = '11px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText("BOSHLANG'ICH DOK", 400, 665);

    // 3. Halqalar (Rotating rings with gaps)
    this.rings.forEach(ring => {
      const rInner = ring.radius - ring.thickness / 2;
      const rOuter = ring.radius + ring.thickness / 2;

      // Halqa segmentlarini chizish
      ring.gaps.forEach(gap => {
        let gStart = (ring.angle + gap.start) % (Math.PI * 2);
        if (gStart < 0) gStart += Math.PI * 2;
        let gEnd = (gStart + gap.size) % (Math.PI * 2);

        // Qattiq to'siq yoyi: gEnd dan gStart gacha
        this.ctx.beginPath();
        this.ctx.arc(ring.cx, ring.cy, ring.radius, gEnd, gStart, false);
        this.ctx.strokeStyle = '#f59e0b';
        this.ctx.lineWidth = ring.thickness;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

        // Ichki yorug'lik chizig'i
        this.ctx.beginPath();
        this.ctx.arc(ring.cx, ring.cy, ring.radius, gEnd, gStart, false);
        this.ctx.strokeStyle = '#fef3c7';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
      });
    });

    // 4. Lazerlar
    this.lasers.forEach(laser => {
      const curY = laser.baseY + Math.sin(laser.t) * laser.rangeY;

      // Lazer nuri g'ubori
      this.ctx.strokeStyle = 'rgba(244, 63, 94, 0.25)';
      this.ctx.lineWidth = 14;
      this.ctx.beginPath();
      this.ctx.moveTo(laser.x1, curY);
      this.ctx.lineTo(laser.x2, curY);
      this.ctx.stroke();

      // O'tkir lazer o'zagi
      this.ctx.strokeStyle = '#f43f5e';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(laser.x1, curY);
      this.ctx.lineTo(laser.x2, curY);
      this.ctx.stroke();

      // Emitentlar (Laser emitters)
      this.ctx.fillStyle = '#1e293b';
      this.ctx.fillRect(laser.x1 - 10, curY - 12, 10, 24);
      this.ctx.fillRect(laser.x2, curY - 12, 10, 24);
    });

    // 5. Ma'lumotlar kalitlari (Data Keys)
    this.dataKeys.forEach(k => {
      if (!k.collected) {
        const pulseScale = 1 + Math.sin(k.pulse) * 0.15;
        this.ctx.save();
        this.ctx.translate(k.x, k.y);
        this.ctx.scale(pulseScale, pulseScale);

        // Oltin porlash
        const grad = this.ctx.createRadialGradient(0, 0, 2, 0, 0, 20);
        grad.addColorStop(0, '#fbbf24');
        grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
        this.ctx.fill();

        // Romb shakli
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -12);
        this.ctx.lineTo(12, 0);
        this.ctx.lineTo(0, 12);
        this.ctx.lineTo(-12, 0);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.restore();
      }
    });

    // 6. Yuqori Kiber-Yadro (Core)
    this.ctx.save();
    this.ctx.translate(this.core.x, this.core.y);

    const coreColor = this.core.unlocked ? '#10b981' : '#64748b';
    const coreGlow = this.core.unlocked ? 'rgba(16, 185, 129, 0.4)' : 'rgba(100, 116, 139, 0.2)';

    // G'ubor
    const coreGrad = this.ctx.createRadialGradient(0, 0, 10, 0, 0, this.core.radius * 1.6);
    coreGrad.addColorStop(0, coreGlow);
    coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    this.ctx.fillStyle = coreGrad;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.core.radius * 1.6, 0, Math.PI * 2);
    this.ctx.fill();

    // Tashqi aylanuvchi maydon
    this.ctx.strokeStyle = coreColor;
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([8, 6]);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.core.radius + 6, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Yadro markazi
    this.ctx.fillStyle = coreColor;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.core.radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 12px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.core.unlocked ? "OCHIQ!" : "QULFLANGAN", 0, 4);

    this.ctx.restore();

    // 7. O'yinchi sferasi (Energy Sphere)
    this.ctx.save();
    this.ctx.translate(this.player.x, this.player.y);

    // Sfera orqasidagi plazma nuri
    const pGrad = this.ctx.createRadialGradient(0, 0, 2, 0, 0, this.player.radius * 1.8);
    pGrad.addColorStop(0, '#ffffff');
    pGrad.addColorStop(0.4, '#38bdf8');
    pGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    this.ctx.fillStyle = pGrad;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.player.radius * 1.8, 0, Math.PI * 2);
    this.ctx.fill();

    // Asosiy sfera
    this.ctx.fillStyle = '#0284c7';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.player.radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.ctx.restore();

    // 8. Zarrachalar
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
    });
  }

  destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }
}

window.CyberLockGame = CyberLockGame;
