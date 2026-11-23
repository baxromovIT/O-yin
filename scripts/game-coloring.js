/**
 * 3-5 YOSH: "SEHRLI MO'YQALAM"
 * Interaktiv ranglar studiyasi, vektorli rasmlar, chelakcha va erkin mo'yqalam, sehrli yulduzchalar.
 */

class ColoringGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.overlayCanvas = null;
    this.overlayCtx = null;
    this.sparkleCanvas = null;
    this.sparkleCtx = null;

    this.currentDrawing = 'rocket'; // 'rocket', 'elephant', 'castle', 'car'
    this.currentTool = 'fill'; // 'fill', 'brush', 'sparkle'
    this.currentColor = '#f59e0b'; // Standart oltin sariq
    this.brushSize = 14;

    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;

    this.regions = {}; // Region ID -> fill color
    this.sparkles = [];
    this.confetti = [];

    // Vazifalar ro'yxati
    this.tasks = {
      rocket: { text: "Vazifa: Quyosh va yulduzlarni sariq rangga bo'yang!", targetId: 'sun', color: '#f59e0b', completed: false },
      elephant: { text: "Vazifa: Quvnoq sharni yorqin qizil rangga bo'yang!", targetId: 'balloon', color: '#ef4444', completed: false },
      castle: { text: "Vazifa: Qal'a bayroqlarini moviy rangga bo'yang!", targetId: 'flag1', color: '#3b82f6', completed: false },
      car: { text: "Vazifa: Sport mashina korpusini zumrad yashil rangga bo'yang!", targetId: 'body', color: '#10b981', completed: false }
    };

    this.palette = [
      { name: "Oltin Sariq", hex: "#f59e0b" },
      { name: "Yorqin Quyosh", hex: "#fbbf24" },
      { name: "Yoqut Qizil", hex: "#ef4444" },
      { name: "Quyosh Zarg'aldoq", hex: "#f97316" },
      { name: "Safir Moviy", hex: "#3b82f6" },
      { name: "Osmon Moviy", hex: "#60a5fa" },
      { name: "Zumrad Yashil", hex: "#10b981" },
      { name: "Yalpiz Yashil", hex: "#34d399" },
      { name: "Nilufar Binafsha", hex: "#8b5cf6" },
      { name: "Pushti Marvarid", hex: "#ec4899" },
      { name: "Kiber Oq", hex: "#f8fafc" },
      { name: "Obsidian To'q", hex: "#1e293b" }
    ];

    this.animId = null;
  }

  mount(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="coloring-studio">
        <!-- Yuqori Vazifa Bilan Boshqaruv Paneli -->
        <div class="studio-topbar glass-card">
          <div class="task-badge" id="coloring-task-badge">
            <span class="task-icon">🎯</span>
            <span id="coloring-task-text">Vazifa yuklanmoqda...</span>
            <span class="task-status" id="coloring-task-status"></span>
          </div>
          <div class="studio-actions">
            <button class="btn-secondary" id="btn-color-clear">
              <span>🧹</span> Tozalash
            </button>
            <button class="btn-secondary" id="btn-color-save">
              <span>💾</span> Saqlash
            </button>
          </div>
        </div>

        <!-- Asosiy Ish Maydoni -->
        <div class="studio-workspace">
          <!-- Chap panel: Chizmalar tanlovi -->
          <div class="studio-sidebar left-bar glass-card">
            <h4 class="sidebar-title">Rasmlar</h4>
            <div class="drawings-list">
              <button class="drawing-btn active" data-drawing="rocket">
                <span class="draw-icon">🚀</span>
                <span class="draw-name">Kosmik Raketa</span>
              </button>
              <button class="drawing-btn" data-drawing="elephant">
                <span class="draw-icon">🐘</span>
                <span class="draw-name">Quvnoq Filcha</span>
              </button>
              <button class="drawing-btn" data-drawing="castle">
                <span class="draw-icon">🏰</span>
                <span class="draw-name">Sehrli Qal'a</span>
              </button>
              <button class="drawing-btn" data-drawing="car">
                <span class="draw-icon">🏎️</span>
                <span class="draw-name">Sport Mashina</span>
              </button>
            </div>

            <h4 class="sidebar-title" style="margin-top: 15px;">Asboblar</h4>
            <div class="tools-list">
              <button class="tool-btn active" data-tool="fill" title="Chelakcha bilan to'ldirish">
                <span class="tool-icon">🪣</span>
                <span class="tool-label">Chelakcha</span>
              </button>
              <button class="tool-btn" data-tool="brush" title="Erkin mo'yqalam">
                <span class="tool-icon">🖌️</span>
                <span class="tool-label">Mo'yqalam</span>
              </button>
              <button class="tool-btn" data-tool="sparkle" title="Sehrli Yulduzchalar">
                <span class="tool-icon">✨</span>
                <span class="tool-label">Yulduzchalar</span>
              </button>
            </div>

            <div class="brush-sizes" id="brush-size-box">
              <label>Mo'yqalam qalinligi:</label>
              <div class="size-options">
                <button class="size-btn" data-size="8">Kichik</button>
                <button class="size-btn active" data-size="16">O'rta</button>
                <button class="size-btn" data-size="28">Katta</button>
              </div>
            </div>
          </div>

          <!-- Markaz: Kanvaslar Stack -->
          <div class="canvas-viewport glass-card" id="canvas-viewport">
            <div class="canvas-layers-stack" id="canvas-stack">
              <canvas id="color-fill-canvas" width="800" height="600"></canvas>
              <canvas id="color-brush-canvas" width="800" height="600"></canvas>
              <canvas id="color-lineart-canvas" width="800" height="600"></canvas>
              <canvas id="color-sparkle-canvas" width="800" height="600"></canvas>
            </div>
          </div>

          <!-- O'ng panel: Ranglar Palitrasi -->
          <div class="studio-sidebar right-bar glass-card">
            <h4 class="sidebar-title">Ranglar Palitrasi</h4>
            <div class="palette-grid" id="palette-grid">
              <!-- JS orqali to'ldiriladi -->
            </div>
            <div class="active-color-preview">
              <span class="color-dot" id="active-color-dot"></span>
              <span class="color-title" id="active-color-title">Oltin Sariq</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.canvas = document.getElementById('color-fill-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.brushCanvas = document.getElementById('color-brush-canvas');
    this.brushCtx = this.brushCanvas.getContext('2d');

    this.lineArtCanvas = document.getElementById('color-lineart-canvas');
    this.lineArtCtx = this.lineArtCanvas.getContext('2d');

    this.sparkleCanvas = document.getElementById('color-sparkle-canvas');
    this.sparkleCtx = this.sparkleCanvas.getContext('2d');

    this.renderPalette();
    this.bindEvents();
    this.loadDrawing(this.currentDrawing);
    this.startAnimationLoop();
  }

  renderPalette() {
    const grid = document.getElementById('palette-grid');
    if (!grid) return;
    grid.innerHTML = '';

    this.palette.forEach((c, idx) => {
      const btn = document.createElement('button');
      btn.className = `palette-color-btn ${idx === 0 ? 'active' : ''}`;
      btn.style.backgroundColor = c.hex;
      btn.title = c.name;
      btn.dataset.hex = c.hex;
      btn.dataset.name = c.name;

      btn.addEventListener('click', () => {
        document.querySelectorAll('.palette-color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentColor = c.hex;
        document.getElementById('active-color-dot').style.backgroundColor = c.hex;
        document.getElementById('active-color-title').textContent = c.name;
        window.soundEngine.playColorSplash();
      });

      grid.appendChild(btn);
    });
  }

  bindEvents() {
    // Rasmni almashtirish
    document.querySelectorAll('.drawing-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.drawing-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const drawingId = btn.dataset.drawing;
        this.loadDrawing(drawingId);
        window.soundEngine.playButtonTick();
      });
    });

    // Asbobni almashtirish
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTool = btn.dataset.tool;
        window.soundEngine.playButtonTick();
      });
    });

    // Mo'yqalam qalinligi
    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.brushSize = parseInt(btn.dataset.size, 10);
        window.soundEngine.playButtonTick();
      });
    });

    // Tozalash
    document.getElementById('btn-color-clear').addEventListener('click', () => {
      this.clearCanvas();
      window.soundEngine.playButtonTick();
    });

    // Saqlash
    document.getElementById('btn-color-save').addEventListener('click', () => {
      this.saveArtwork();
    });

    // Kanvas hodisalari (Mouse & Touch)
    const topCanvas = this.sparkleCanvas;

    const getPos = (e) => {
      const rect = topCanvas.getBoundingClientRect();
      const scaleX = topCanvas.width / rect.width;
      const scaleY = topCanvas.height / rect.height;

      let clientX = e.clientX;
      let clientY = e.clientY;

      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    const onStart = (e) => {
      e.preventDefault();
      const pos = getPos(e);
      this.isDrawing = true;
      this.lastX = pos.x;
      this.lastY = pos.y;

      if (this.currentTool === 'fill') {
        this.handleFill(pos.x, pos.y);
      } else if (this.currentTool === 'brush') {
        this.drawBrushStroke(pos.x, pos.y, pos.x, pos.y);
        window.soundEngine.playColorSplash();
      } else if (this.currentTool === 'sparkle') {
        this.addSparkles(pos.x, pos.y, 8);
        window.soundEngine.playSparkle();
      }
    };

    const onMove = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);

      if (this.currentTool === 'brush') {
        this.drawBrushStroke(this.lastX, this.lastY, pos.x, pos.y);
      } else if (this.currentTool === 'sparkle') {
        this.addSparkles(pos.x, pos.y, 4);
        if (Math.random() > 0.6) window.soundEngine.playSparkle();
      }

      this.lastX = pos.x;
      this.lastY = pos.y;
    };

    const onEnd = () => {
      this.isDrawing = false;
    };

    topCanvas.addEventListener('mousedown', onStart);
    topCanvas.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    topCanvas.addEventListener('touchstart', onStart, { passive: false });
    topCanvas.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }

  loadDrawing(drawingId) {
    this.currentDrawing = drawingId;
    this.regions = {};
    this.clearCanvas();
    this.updateTaskBanner();
    this.renderLineArt();
  }

  updateTaskBanner() {
    const task = this.tasks[this.currentDrawing];
    const textEl = document.getElementById('coloring-task-text');
    const statusEl = document.getElementById('coloring-task-status');

    if (task && textEl) {
      textEl.textContent = task.text;
      if (task.completed) {
        statusEl.innerHTML = `<span class="badge-success">Bajarildi! +50 XP 🎉</span>`;
      } else {
        statusEl.innerHTML = `<span class="badge-pending">Kutilmoqda...</span>`;
      }
    }
  }

  clearCanvas() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.brushCtx.clearRect(0, 0, this.brushCanvas.width, this.brushCanvas.height);
    this.sparkleCtx.clearRect(0, 0, this.sparkleCanvas.width, this.sparkleCanvas.height);
    this.sparkles = [];
    this.regions = {};
    this.renderLineArt();
  }

  // Erkin mo'yqalam chizig'i
  drawBrushStroke(x1, y1, x2, y2) {
    this.brushCtx.strokeStyle = this.currentColor;
    this.brushCtx.fillStyle = this.currentColor;
    this.brushCtx.lineWidth = this.brushSize;
    this.brushCtx.lineCap = 'round';
    this.brushCtx.lineJoin = 'round';

    this.brushCtx.beginPath();
    this.brushCtx.moveTo(x1, y1);
    this.brushCtx.lineTo(x2, y2);
    this.brushCtx.stroke();
  }

  // Sehrli yulduzchalar qo'shish
  addSparkles(x, y, count) {
    for (let i = 0; i < count; i++) {
      this.sparkles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        size: 5 + Math.random() * 12,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.03,
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.1,
        color: this.currentColor
      });
    }
  }

  // Chelakcha (Tap-to-Fill) bosilganda hududni aniqlash va bo'yash
  handleFill(x, y) {
    const pathDefs = this.getPathDefinitions(this.currentDrawing);
    let matchedRegion = null;

    // Oxirgi chizilgan qismlardan boshlab tekshirish
    for (let i = pathDefs.length - 1; i >= 0; i--) {
      const def = pathDefs[i];
      const p = new Path2D(def.d);
      if (this.ctx.isPointInPath(p, x, y)) {
        matchedRegion = def;
        break;
      }
    }

    if (matchedRegion) {
      this.regions[matchedRegion.id] = this.currentColor;
      window.soundEngine.playColorSplash();
      this.redrawFilledRegions();

      // Mini vazifa tekshiruvi
      const currentTask = this.tasks[this.currentDrawing];
      if (currentTask && !currentTask.completed) {
        if (matchedRegion.id === currentTask.targetId && this.currentColor === currentTask.color) {
          currentTask.completed = true;
          this.triggerCelebration();
          this.updateTaskBanner();
        }
      }
    }
  }

  redrawFilledRegions() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const pathDefs = this.getPathDefinitions(this.currentDrawing);
    pathDefs.forEach(def => {
      const color = this.regions[def.id] || def.defaultFill || '#f8fafc';
      const p = new Path2D(def.d);
      this.ctx.fillStyle = color;
      this.ctx.fill(p);
    });
  }

  triggerCelebration() {
    window.soundEngine.playVictoryFanfare();
    if (window.appState) {
      window.appState.addXP(50, "Sehrli Mo'yqalam vazifasi muvaffaqiyatli bajarildi!");
    }

    // Konfetti otilishi
    for (let i = 0; i < 70; i++) {
      this.confetti.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: -8 - Math.random() * 12,
        size: 7 + Math.random() * 9,
        color: this.palette[Math.floor(Math.random() * this.palette.length)].hex,
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        alpha: 1.0
      });
    }
  }

  // Vektor chiziqlar chizmasi (Line Art)
  renderLineArt() {
    this.lineArtCtx.clearRect(0, 0, this.lineArtCanvas.width, this.lineArtCanvas.height);
    const pathDefs = this.getPathDefinitions(this.currentDrawing);

    this.lineArtCtx.strokeStyle = '#1e293b';
    this.lineArtCtx.lineWidth = 3.5;
    this.lineArtCtx.lineCap = 'round';
    this.lineArtCtx.lineJoin = 'round';

    pathDefs.forEach(def => {
      const p = new Path2D(def.d);
      this.lineArtCtx.stroke(p);
    });

    this.redrawFilledRegions();
  }

  // 4 ta boyitilgan vektor rasm yo'llari
  getPathDefinitions(drawing) {
    if (drawing === 'rocket') {
      return [
        // Kosmik osmon foni
        { id: 'sky', d: 'M 40 40 L 760 40 L 760 560 L 40 560 Z', defaultFill: '#f8fafc' },
        // Quyosh
        { id: 'sun', d: 'M 180 140 m -55 0 a 55 55 0 1 0 110 0 a 55 55 0 1 0 -110 0' },
        // Sayyora (Saturn)
        { id: 'planet', d: 'M 640 160 m -45 0 a 45 45 0 1 0 90 0 a 45 45 0 1 0 -90 0' },
        { id: 'planet_ring', d: 'M 570 160 C 570 140 710 140 710 160 C 710 180 570 180 570 160 Z' },
        // Raketa fyuzelyaji
        { id: 'fuselage', d: 'M 400 100 C 460 220 460 380 440 420 L 360 420 C 340 380 340 220 400 100 Z' },
        // Raketa burun uchi
        { id: 'nose', d: 'M 400 100 C 430 150 435 180 400 200 C 365 180 370 150 400 100 Z' },
        // Qanot chap
        { id: 'wing_left', d: 'M 350 340 L 280 430 L 345 425 Z' },
        // Qanot o'ng
        { id: 'wing_right', d: 'M 450 340 L 520 430 L 455 425 Z' },
        // Illyuminator oyna
        { id: 'window_outer', d: 'M 400 260 m -35 0 a 35 35 0 1 0 70 0 a 35 35 0 1 0 -70 0' },
        { id: 'window_glass', d: 'M 400 260 m -24 0 a 24 24 0 1 0 48 0 a 24 24 0 1 0 -48 0' },
        // Olov / Reaktiv alangasi
        { id: 'flame_outer', d: 'M 365 425 C 380 490 400 520 400 535 C 400 520 420 490 435 425 Z' },
        { id: 'flame_inner', d: 'M 380 425 C 390 470 400 485 400 495 C 400 485 410 470 420 425 Z' },
        // Kichik yulduzlar
        { id: 'star1', d: 'M 220 280 L 225 295 L 240 295 L 228 305 L 232 320 L 220 310 L 208 320 L 212 305 L 200 295 L 215 295 Z' },
        { id: 'star2', d: 'M 580 320 L 585 335 L 600 335 L 588 345 L 592 360 L 580 350 L 568 360 L 572 345 L 560 335 L 575 335 Z' }
      ];
    } else if (drawing === 'elephant') {
      return [
        { id: 'bg', d: 'M 40 40 L 760 40 L 760 560 L 40 560 Z', defaultFill: '#f8fafc' },
        // Quyosh
        { id: 'sun', d: 'M 140 120 m -40 0 a 40 40 0 1 0 80 0 a 40 40 0 1 0 -80 0' },
        // Shar (Balloon)
        { id: 'balloon', d: 'M 620 140 m -50 0 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0' },
        { id: 'balloon_knot', d: 'M 610 190 L 630 190 L 620 202 Z' },
        { id: 'string', d: 'M 620 202 C 600 260 550 300 510 330' },
        // Fil tanasi
        { id: 'body', d: 'M 320 300 C 320 240 460 230 490 310 C 510 370 480 450 470 480 L 430 480 C 430 430 430 410 400 410 C 370 410 370 440 370 480 L 330 480 C 320 440 310 370 320 300 Z' },
        // Katta quloq
        { id: 'ear', d: 'M 290 270 C 230 250 220 360 270 380 C 300 390 310 340 300 290 Z' },
        // Xartum
        { id: 'trunk', d: 'M 340 350 C 380 370 400 390 400 430 C 400 450 370 460 350 440 C 340 430 350 400 330 380 Z' },
        // Ko'z
        { id: 'eye', d: 'M 320 290 m -8 0 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0' },
        // Chayqaluvchi suv tomchilari
        { id: 'drop1', d: 'M 390 370 m -8 0 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0' },
        { id: 'drop2', d: 'M 420 350 m -10 0 a 10 10 0 1 0 20 0 a 10 10 0 1 0 -20 0' },
        // Maysa
        { id: 'grass', d: 'M 40 480 L 760 480 L 760 560 L 40 560 Z' }
      ];
    } else if (drawing === 'castle') {
      return [
        { id: 'sky', d: 'M 40 40 L 760 40 L 760 560 L 40 560 Z', defaultFill: '#f8fafc' },
        // Kamalak
        { id: 'rainbow', d: 'M 100 480 C 100 120 700 120 700 480 L 660 480 C 660 160 140 160 140 480 Z' },
        // Asosiy bino devori
        { id: 'wall_main', d: 'M 260 300 L 540 300 L 540 480 L 260 480 Z' },
        // Darvoza arka
        { id: 'gate', d: 'M 360 480 L 360 380 C 360 340 440 340 440 380 L 440 480 Z' },
        // Chap minora
        { id: 'tower_left', d: 'M 200 240 L 270 240 L 270 480 L 200 480 Z' },
        { id: 'roof_left', d: 'M 180 240 L 235 150 L 290 240 Z' },
        // O'ng minora
        { id: 'tower_right', d: 'M 530 240 L 600 240 L 600 480 L 530 480 Z' },
        { id: 'roof_right', d: 'M 510 240 L 565 150 L 620 240 Z' },
        // O'rta baland minora
        { id: 'tower_mid', d: 'M 350 200 L 450 200 L 450 300 L 350 300 Z' },
        { id: 'roof_mid', d: 'M 330 200 L 400 100 L 470 200 Z' },
        // Bayroqlar
        { id: 'flag1', d: 'M 235 150 L 235 110 L 275 130 L 235 140 Z' },
        { id: 'flag2', d: 'M 400 100 L 400 60 L 445 80 L 400 90 Z' },
        { id: 'flag3', d: 'M 565 150 L 565 110 L 605 130 L 565 140 Z' }
      ];
    } else {
      // Sport Mashina
      return [
        { id: 'bg', d: 'M 40 40 L 760 40 L 760 560 L 40 560 Z', defaultFill: '#f8fafc' },
        // Mashina asosi (Body)
        { id: 'body', d: 'M 160 380 C 180 320 240 280 340 280 L 520 280 C 620 280 660 340 680 380 L 660 420 C 620 420 610 390 560 390 C 510 390 500 420 450 420 L 310 420 C 290 420 280 390 230 390 C 180 390 170 420 130 420 Z' },
        // Kabina shishasi
        { id: 'cabin', d: 'M 310 280 L 360 210 L 490 210 L 530 280 Z' },
        // Orqa spoyler
        { id: 'spoiler', d: 'M 140 290 L 190 290 L 175 320 L 150 320 Z' },
        // G'ildirak old
        { id: 'wheel_front_outer', d: 'M 560 410 m -45 0 a 45 45 0 1 0 90 0 a 45 45 0 1 0 -90 0' },
        { id: 'wheel_front_rim', d: 'M 560 410 m -24 0 a 24 24 0 1 0 48 0 a 24 24 0 1 0 -48 0' },
        // G'ildirak orqa
        { id: 'wheel_back_outer', d: 'M 230 410 m -45 0 a 45 45 0 1 0 90 0 a 45 45 0 1 0 -90 0' },
        { id: 'wheel_back_rim', d: 'M 230 410 m -24 0 a 24 24 0 1 0 48 0 a 24 24 0 1 0 -48 0' },
        // Fara (Oldi nur)
        { id: 'headlight', d: 'M 650 340 L 680 350 L 665 370 Z' },
        // Tezyurar chiziqlar
        { id: 'speed_lines', d: 'M 690 330 L 750 330 M 700 360 L 760 360 M 690 390 L 740 390' }
      ];
    }
  }

  startAnimationLoop() {
    const loop = () => {
      this.sparkleCtx.clearRect(0, 0, this.sparkleCanvas.width, this.sparkleCanvas.height);

      // Yulduzchalar harakati
      for (let i = this.sparkles.length - 1; i >= 0; i--) {
        const s = this.sparkles[i];
        s.alpha -= s.decay;
        s.rot += s.rotSpeed;

        if (s.alpha <= 0) {
          this.sparkles.splice(i, 1);
          continue;
        }

        this.sparkleCtx.save();
        this.sparkleCtx.translate(s.x, s.y);
        this.sparkleCtx.rotate(s.rot);
        this.sparkleCtx.fillStyle = s.color;
        this.sparkleCtx.globalAlpha = s.alpha;

        // 4 qirrali porlovchi yulduzcha
        this.sparkleCtx.beginPath();
        for (let j = 0; j < 8; j++) {
          const r = j % 2 === 0 ? s.size : s.size * 0.35;
          const a = (j * Math.PI) / 4;
          if (j === 0) this.sparkleCtx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else this.sparkleCtx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        this.sparkleCtx.closePath();
        this.sparkleCtx.fill();
        this.sparkleCtx.restore();
      }

      // Konfetti harakati
      for (let i = this.confetti.length - 1; i >= 0; i--) {
        const c = this.confetti[i];
        c.x += c.vx;
        c.y += c.vy;
        c.vy += 0.4; // Gravitatsiya
        c.rot += c.rotSpeed;
        c.alpha -= 0.008;

        if (c.alpha <= 0 || c.y > this.canvas.height + 50) {
          this.confetti.splice(i, 1);
          continue;
        }

        this.sparkleCtx.save();
        this.sparkleCtx.translate(c.x, c.y);
        this.sparkleCtx.rotate(c.rot);
        this.sparkleCtx.fillStyle = c.color;
        this.sparkleCtx.globalAlpha = c.alpha;
        this.sparkleCtx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
        this.sparkleCtx.restore();
      }

      this.animId = requestAnimationFrame(loop);
    };

    if (this.animId) cancelAnimationFrame(this.animId);
    loop();
  }

  saveArtwork() {
    // Hammasini bitta kanvasga birlashtirish
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = this.canvas.width;
    exportCanvas.height = this.canvas.height;
    const eCtx = exportCanvas.getContext('2d');

    eCtx.drawImage(this.canvas, 0, 0);
    eCtx.drawImage(this.brushCanvas, 0, 0);
    eCtx.drawImage(this.lineArtCanvas, 0, 0);

    const link = document.createElement('a');
    link.download = `Aql-Akademiyasi-Moyqalam-${this.currentDrawing}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();

    window.soundEngine.playCrystalChime();
  }

  destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }
}

window.ColoringGame = ColoringGame;
