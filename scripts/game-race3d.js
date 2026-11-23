/**
 * 16-20 YOSH: "MEGA-POYGA 3D: MAXFIY YUK"
 * Three.js asosidagi quyoshli ultra-HDR 3D ochiq shahar, giperkar, Kiber-Politsiya ta'qibi va taktik haydash.
 */

class MegaRace3D {
  constructor() {
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // O'yinchi mashinasi holati
    this.car = {
      mesh: null,
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      speed: 0,
      maxSpeed: 1.5,
      nitroMaxSpeed: 2.25,
      accel: 0.025,
      brake: 0.045,
      friction: 0.985,
      angle: 0,
      steerAngle: 0,
      steerSpeed: 0.042,
      wheels: [],
      frontWheels: [],
      headlights: [],
      taillights: [],
      nitroFlames: [],
      health: 100,
      nitro: 100,
      isNitro: false,
      isGrounded: true
    };

    // Boshqaruv tugmalari holati (100% kafolatlangan)
    this.input = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      nitro: false,
      drift: false
    };

    // Politsiya mashinalari
    this.policeCars = [];

    // Maqsad: Maxfiy yuk
    this.cargo = {
      mesh: null,
      boxMesh: null,
      x: 280,
      z: -320,
      collected: false
    };

    // To'siqlar va binolar to'qnashuv qutilari
    this.buildings = [];
    this.ramps = [];

    // Vaqt va missiya
    this.timer = 90;
    this.timerInterval = null;
    this.isVictory = false;
    this.isGameOver = false;

    // Radar kanvasi
    this.radarCanvas = null;
    this.radarCtx = null;

    this.animId = null;
    this.clock = null;
    this.boundKeyDown = null;
    this.boundKeyUp = null;
  }

  mount(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="race3d-wrapper">
        <!-- 3D Three.js Kanvas Maydoni -->
        <div id="three-viewport" class="three-viewport"></div>

        <!-- O'zbek tilidagi HUD Qatlamlari -->
        <div class="race-hud">
          <!-- Yuqori Chap: Doiraviy Radar / Mini-xarita -->
          <div class="hud-radar-box glass-card">
            <div class="radar-title">RADAR / XARITA</div>
            <canvas id="race-radar-canvas" width="160" height="160"></canvas>
            <div class="radar-legend">
              <span class="legend-item"><span class="dot-player"></span> Siz</span>
              <span class="legend-item"><span class="dot-cargo"></span> Yuk</span>
              <span class="legend-item"><span class="dot-police"></span> Politsiya</span>
            </div>
          </div>

          <!-- Yuqori Markaz: Vazifa va Taymer -->
          <div class="hud-center-box glass-card">
            <div class="mission-badge">
              <span class="mission-icon">📦</span>
              <span class="mission-text">VAZIFA: MAXFIY YUK NUQTASINI TOPING VA POLATSIYADAN QOCHING!</span>
            </div>
            <div class="race-timer-box">
              <span class="timer-label">QOLGAN VAQT:</span>
              <span class="timer-val" id="race-timer-val">90s</span>
            </div>
          </div>

          <!-- Pastki Chap: Spidometr va Avtomobil Ko'rsatkichlari -->
          <div class="hud-dashboard glass-card">
            <div class="speed-gauge">
              <span class="speed-number" id="race-speed-val">0</span>
              <span class="speed-unit">KM/SOAT</span>
            </div>
            <div class="meters-col">
              <div class="meter-row">
                <span class="meter-name">NITRO:</span>
                <div class="meter-bar-wrap">
                  <div class="meter-bar-fill nitro-fill" id="race-nitro-fill" style="width: 100%;"></div>
                </div>
              </div>
              <div class="meter-row">
                <span class="meter-name">HOLAT:</span>
                <div class="meter-bar-wrap">
                  <div class="meter-bar-fill health-fill" id="race-health-fill" style="width: 100%;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pastki O'ng: 100% ISHONCHLI SENSOR / SICHQONCHA BOSHQARUV TUGMALARI -->
          <div class="hud-touch-controls">
            <div class="pedal-cluster">
              <button class="pedal-btn btn-turn" id="ctrl-left" data-key="left">
                <span>◀</span>
                <span class="key-sub">[A] Chap</span>
              </button>
              <div class="vert-cluster">
                <button class="pedal-btn btn-gas" id="ctrl-gas" data-key="forward">
                  <span>▲</span>
                  <span class="key-sub">[W] Gaz</span>
                </button>
                <button class="pedal-btn btn-brake" id="ctrl-brake" data-key="backward">
                  <span>▼</span>
                  <span class="key-sub">[S] Tormoz</span>
                </button>
              </div>
              <button class="pedal-btn btn-turn" id="ctrl-right" data-key="right">
                <span>▶</span>
                <span class="key-sub">[D] O'ng</span>
              </button>
            </div>
            <div class="extra-cluster">
              <button class="pedal-btn btn-nitro" id="ctrl-nitro" data-key="nitro">
                <span>⚡ NITRO</span>
                <span class="key-sub">[Shift]</span>
              </button>
              <button class="pedal-btn btn-drift" id="ctrl-drift" data-key="drift">
                <span>🛑 DRIFT</span>
                <span class="key-sub">[Space]</span>
              </button>
            </div>
          </div>
        </div>

        <!-- G'alaba / Mag'lubiyat Modali -->
        <div class="race-modal-overlay" id="race-modal" style="display: none;">
          <div class="race-modal-content glass-card">
            <div class="modal-icon" id="race-modal-icon">🏆</div>
            <h3 class="modal-title" id="race-modal-title">MAXFIY YUK YETKAZILDI!</h3>
            <p class="modal-desc" id="race-modal-desc">
              Siz politsiyani ortda qoldirib, maxfiy yukni belgilangan manzilga eson-omon yetkazdingiz!
            </p>
            <div class="modal-reward">+250 XP Aql Quvvati</div>
            <button class="btn-primary" id="btn-race-retry">
              Qayta O'ynash ↺
            </button>
          </div>
        </div>
      </div>
    `;

    this.radarCanvas = document.getElementById('race-radar-canvas');
    this.radarCtx = this.radarCanvas.getContext('2d');

    if (typeof THREE === 'undefined') {
      const vp = document.getElementById('three-viewport');
      vp.innerHTML = `
        <div style="padding:40px;text-align:center;color:#0f172a;font-weight:700;">
          Three.js yuklanmoqda... Iltimos internet aloqasini tekshiring.
        </div>
      `;
      return;
    }

    this.initThree();
    this.buildCity();
    this.buildPlayerCar();
    this.buildPoliceCars();
    this.buildSecretCargo();
    this.bindControls();
    this.startTimer();
    this.startAnimationLoop();

    window.soundEngine.startEngine();
    window.soundEngine.startSiren();
  }

  initThree() {
    const viewport = document.getElementById('three-viewport');
    const width = viewport.clientWidth || 900;
    const height = viewport.clientHeight || 580;

    this.clock = new THREE.Clock();

    // Sahna
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xfef3c7);
    this.scene.fog = new THREE.FogExp2(0xfef3c7, 0.0018);

    // Kamera
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.2, 2000);
    this.camera.position.set(0, 7, -14);

    // Renderlovchi
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    viewport.appendChild(this.renderer.domElement);

    // Yorug'lik
    const hemiLight = new THREE.HemisphereLight(0xffedd5, 0x93c5fd, 0.75);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.35);
    sunLight.position.set(200, 350, 150);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 800;
    const d = 300;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    this.scene.add(sunLight);

    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    const viewport = document.getElementById('three-viewport');
    if (!viewport || !this.renderer || !this.camera) return;
    const width = viewport.clientWidth || 900;
    const height = viewport.clientHeight || 580;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  buildCity() {
    // 1. Asosiy Yer va Yo'llar Gridi
    const groundGeo = new THREE.PlaneGeometry(1200, 1200);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 2. Yo'l chiziqlari (Avenue grid markings)
    const gridSize = 100;
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

    for (let i = -500; i <= 500; i += gridSize) {
      // Z bo'ylab yo'l
      const zLineGeo = new THREE.PlaneGeometry(1.5, 1100);
      const zLine = new THREE.Mesh(zLineGeo, lineMat);
      zLine.rotation.x = -Math.PI / 2;
      zLine.position.set(i, 0.05, 0);
      this.scene.add(zLine);

      // X bo'ylab yo'l
      const xLineGeo = new THREE.PlaneGeometry(1100, 1.5);
      const xLine = new THREE.Mesh(xLineGeo, lineMat);
      xLine.rotation.x = -Math.PI / 2;
      xLine.position.set(0, 0.05, i);
      this.scene.add(xLine);
    }

    // 3. Osmono'par Binolar (Skyscrapers)
    const buildingColors = [0xf8fafc, 0xf1f5f9, 0xe2e8f0, 0x0284c7, 0x0369a1];
    this.buildings = [];

    for (let bx = -450; bx <= 450; bx += gridSize) {
      for (let bz = -450; bz <= 450; bz += gridSize) {
        if (Math.abs(bx) < 20 && Math.abs(bz) < 20) continue;
        if (Math.abs(bx - this.cargo.x) < 40 && Math.abs(bz - this.cargo.z) < 40) continue;

        const offsetX = (bx + 50);
        const offsetZ = (bz + 50);

        const bHeight = 35 + Math.random() * 85;
        const bWidth = 32 + Math.random() * 18;
        const bDepth = 32 + Math.random() * 18;

        const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
        const bMat = new THREE.MeshStandardMaterial({
          color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
          roughness: 0.25,
          metalness: 0.65
        });
        const building = new THREE.Mesh(bGeo, bMat);
        building.position.set(offsetX, bHeight / 2, offsetZ);
        building.castShadow = true;
        building.receiveShadow = true;
        this.scene.add(building);

        // Oltin arxitektura toji (Rooftop crown)
        const crownGeo = new THREE.BoxGeometry(bWidth + 1, 3, bDepth + 1);
        const crownMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          roughness: 0.1,
          metalness: 0.9
        });
        const crown = new THREE.Mesh(crownGeo, crownMat);
        crown.position.set(offsetX, bHeight + 1.5, offsetZ);
        this.scene.add(crown);

        this.buildings.push({
          minX: offsetX - bWidth / 2 - 2,
          maxX: offsetX + bWidth / 2 + 2,
          minZ: offsetZ - bDepth / 2 - 2,
          maxZ: offsetZ + bDepth / 2 + 2
        });
      }
    }

    // 4. Oltin Sakrash Tramplinlari (Stunt Ramps)
    this.ramps = [];
    const rampPositions = [
      { x: 0, z: -160, rot: 0 },
      { x: 100, z: -80, rot: Math.PI / 2 },
      { x: 200, z: -250, rot: 0 },
      { x: -100, z: -120, rot: -Math.PI / 2 }
    ];

    rampPositions.forEach(rp => {
      const rampGroup = new THREE.Group();
      const rGeo = new THREE.BoxGeometry(10, 3.5, 14);
      const rMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.8,
        roughness: 0.2
      });
      const rampMesh = new THREE.Mesh(rGeo, rMat);
      rampMesh.rotation.x = 0.26;
      rampMesh.position.y = 1.2;
      rampMesh.castShadow = true;
      rampGroup.add(rampMesh);

      rampGroup.position.set(rp.x, 0, rp.z);
      rampGroup.rotation.y = rp.rot;
      this.scene.add(rampGroup);

      this.ramps.push({
        x: rp.x,
        z: rp.z,
        radius: 8
      });
    });

    // 5. Palma daraxtlari
    for (let p = 0; p < 36; p++) {
      const px = (Math.random() - 0.5) * 800;
      const pz = (Math.random() - 0.5) * 800;
      this.createPalmTree(px, pz);
    }
  }

  createPalmTree(x, z) {
    const palmGroup = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.6, 9, 7);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 4.5;
    trunk.castShadow = true;
    palmGroup.add(trunk);

    const leavesGeo = new THREE.ConeGeometry(4.5, 3, 6);
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5 });
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.y = 9.5;
    leaves.castShadow = true;
    palmGroup.add(leaves);

    palmGroup.position.set(x, 0, z);
    this.scene.add(palmGroup);
  }

  buildPlayerCar() {
    const carGroup = new THREE.Group();

    // Korpus (Metallic Pearl White with Champagne Gold Trim)
    const bodyGeo = new THREE.BoxGeometry(2.3, 0.7, 4.6);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.7,
      roughness: 0.2
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.7;
    body.castShadow = true;
    carGroup.add(body);

    // Kokpit oynasi (Cobalt glass canopy)
    const cabinGeo = new THREE.BoxGeometry(1.7, 0.55, 2.2);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85
    });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.2, -0.3);
    carGroup.add(cabin);

    // Oltin aerodinamik qanot (Spoiler)
    const spoilerGeo = new THREE.BoxGeometry(2.2, 0.1, 0.6);
    const spoilerMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
    const spoiler = new THREE.Mesh(spoilerGeo, spoilerMat);
    spoiler.position.set(0, 1.35, -2.0);
    carGroup.add(spoiler);

    // 4 ta G'ildirak
    const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.38, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 });

    const wheelPositions = [
      { x: -1.25, y: 0.48, z: 1.4, isFront: true },
      { x: 1.25, y: 0.48, z: 1.4, isFront: true },
      { x: -1.25, y: 0.48, z: -1.4, isFront: false },
      { x: 1.25, y: 0.48, z: -1.4, isFront: false }
    ];

    this.car.wheels = [];
    this.car.frontWheels = [];

    wheelPositions.forEach(pos => {
      const wGroup = new THREE.Group();
      const tire = new THREE.Mesh(wheelGeo, wheelMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wGroup.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.4, 8), rimMat);
      rim.rotation.z = Math.PI / 2;
      wGroup.add(rim);

      wGroup.position.set(pos.x, pos.y, pos.z);
      carGroup.add(wGroup);

      this.car.wheels.push(wGroup);
      if (pos.isFront) this.car.frontWheels.push(wGroup);
    });

    // Fara nurlari (LED Headlights)
    const light1 = new THREE.SpotLight(0xfffbeb, 2.5, 45, 0.45, 0.5);
    light1.position.set(-0.8, 0.7, 2.4);
    light1.target.position.set(-0.8, 0, 15);
    carGroup.add(light1);
    carGroup.add(light1.target);

    const light2 = new THREE.SpotLight(0xfffbeb, 2.5, 45, 0.45, 0.5);
    light2.position.set(0.8, 0.7, 2.4);
    light2.target.position.set(0.8, 0, 15);
    carGroup.add(light2);
    carGroup.add(light2.target);

    // Orqa qizil stop-chiroqlar
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const tailGeo = new THREE.BoxGeometry(0.5, 0.15, 0.1);
    const tailL = new THREE.Mesh(tailGeo, tailMat);
    tailL.position.set(-0.8, 0.75, -2.32);
    carGroup.add(tailL);

    const tailR = new THREE.Mesh(tailGeo, tailMat);
    tailR.position.set(0.8, 0.75, -2.32);
    carGroup.add(tailR);

    this.car.taillights = [tailL, tailR];

    // Nitro alanga konusi
    const flameGeo = new THREE.ConeGeometry(0.22, 1.2, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.9 });
    const flame1 = new THREE.Mesh(flameGeo, flameMat);
    flame1.rotation.x = -Math.PI / 2;
    flame1.position.set(-0.45, 0.5, -2.7);
    flame1.visible = false;
    carGroup.add(flame1);

    const flame2 = new THREE.Mesh(flameGeo, flameMat);
    flame2.rotation.x = -Math.PI / 2;
    flame2.position.set(0.45, 0.5, -2.7);
    flame2.visible = false;
    carGroup.add(flame2);

    this.car.nitroFlames = [flame1, flame2];

    carGroup.position.set(0, 0, 0);
    this.scene.add(carGroup);
    this.car.mesh = carGroup;
  }

  buildPoliceCars() {
    this.policeCars = [];
    const positions = [
      { x: 120, z: -100, rot: Math.PI },
      { x: -140, z: -180, rot: 0 },
      { x: 200, z: -260, rot: Math.PI / 2 }
    ];

    positions.forEach((pos, idx) => {
      const pGroup = new THREE.Group();

      const bGeo = new THREE.BoxGeometry(2.3, 0.75, 4.5);
      const bMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.y = 0.75;
      bMesh.castShadow = true;
      pGroup.add(bMesh);

      const doorGeo = new THREE.BoxGeometry(2.34, 0.65, 2.0);
      const doorMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
      const door = new THREE.Mesh(doorGeo, doorMat);
      door.position.y = 0.75;
      pGroup.add(door);

      const redLightGeo = new THREE.BoxGeometry(0.5, 0.2, 0.3);
      const redLightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const redSiren = new THREE.Mesh(redLightGeo, redLightMat);
      redSiren.position.set(-0.4, 1.45, 0);
      pGroup.add(redSiren);

      const blueLightGeo = new THREE.BoxGeometry(0.5, 0.2, 0.3);
      const blueLightMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
      const blueSiren = new THREE.Mesh(blueLightGeo, blueLightMat);
      blueSiren.position.set(0.4, 1.45, 0);
      pGroup.add(blueSiren);

      pGroup.position.set(pos.x, 0, pos.z);
      pGroup.rotation.y = pos.rot;
      this.scene.add(pGroup);

      this.policeCars.push({
        mesh: pGroup,
        x: pos.x,
        z: pos.z,
        angle: pos.rot,
        speed: 0,
        maxSpeed: 0.85 + idx * 0.12,
        redSiren,
        blueSiren
      });
    });
  }

  buildSecretCargo() {
    const cargoGroup = new THREE.Group();

    // Baland nur ustuni (Emerald Sky Beacon)
    const beamGeo = new THREE.CylinderGeometry(1.5, 1.5, 250, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.45
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 125;
    cargoGroup.add(beam);

    // Oltin yuk konteyneri (Floating spinning container)
    const boxGeo = new THREE.BoxGeometry(4.5, 3.5, 5.5);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.1
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.y = 3.5;
    box.castShadow = true;
    cargoGroup.add(box);

    // Pulsatsiyalanuvchi xavfsizlik halqasi
    const ringGeo = new THREE.RingGeometry(5, 6, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.2;
    cargoGroup.add(ring);

    cargoGroup.position.set(this.cargo.x, 0, this.cargo.z);
    this.scene.add(cargoGroup);

    this.cargo.mesh = cargoGroup;
    this.cargo.boxMesh = box;
  }

  // 100% ISHONCHLI BOSHQARUV BOG'LAMALARI (KEYBOARD + ON-SCREEN BUTTONS)
  bindControls() {
    this.boundKeyDown = (e) => {
      let handled = false;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') { this.input.forward = true; handled = true; }
      if (e.code === 'KeyS' || e.code === 'ArrowDown') { this.input.backward = true; handled = true; }
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') { this.input.left = true; handled = true; }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') { this.input.right = true; handled = true; }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') { this.input.nitro = true; handled = true; }
      if (e.code === 'Space') { this.input.drift = true; handled = true; }

      if (handled) {
        e.preventDefault();
        this.updatePedalsUI();
      }
    };

    this.boundKeyUp = (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.input.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.input.backward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.input.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.input.right = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.input.nitro = false;
      if (e.code === 'Space') this.input.drift = false;

      this.updatePedalsUI();
    };

    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);

    // Ekranni bosish / bosib turish tugmalari
    const pedalMap = {
      'ctrl-gas': 'forward',
      'ctrl-brake': 'backward',
      'ctrl-left': 'left',
      'ctrl-right': 'right',
      'ctrl-nitro': 'nitro',
      'ctrl-drift': 'drift'
    };

    Object.entries(pedalMap).forEach(([id, action]) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      const press = (e) => {
        e.preventDefault();
        this.input[action] = true;
        this.updatePedalsUI();
        if (action === 'nitro') window.soundEngine.playNitroWhoosh();
      };

      const release = (e) => {
        e.preventDefault();
        this.input[action] = false;
        this.updatePedalsUI();
      };

      btn.addEventListener('mousedown', press);
      btn.addEventListener('mouseup', release);
      btn.addEventListener('mouseleave', release);

      btn.addEventListener('touchstart', press, { passive: false });
      btn.addEventListener('touchend', release, { passive: false });
    });

    document.getElementById('btn-race-retry').addEventListener('click', () => {
      this.restartGame();
    });
  }

  updatePedalsUI() {
    const setBtn = (id, active) => {
      const el = document.getElementById(id);
      if (el) {
        if (active) el.classList.add('active-press');
        else el.classList.remove('active-press');
      }
    };

    setBtn('ctrl-gas', this.input.forward);
    setBtn('ctrl-brake', this.input.backward);
    setBtn('ctrl-left', this.input.left);
    setBtn('ctrl-right', this.input.right);
    setBtn('ctrl-nitro', this.input.nitro);
    setBtn('ctrl-drift', this.input.drift);
  }

  startTimer() {
    this.timer = 90;
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (this.isVictory || this.isGameOver) return;
      this.timer--;
      const timerEl = document.getElementById('race-timer-val');
      if (timerEl) {
        timerEl.textContent = `${this.timer}s`;
        if (this.timer <= 15) timerEl.style.color = '#ef4444';
        else timerEl.style.color = 'var(--gold-hover)';
      }

      if (this.timer <= 0) {
        this.handleGameOver(false);
      }
    }, 1000);
  }

  startAnimationLoop() {
    const loop = () => {
      this.updatePhysics();
      this.updatePolice();
      this.updateCamera();
      this.renderRadar();
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
      this.animId = requestAnimationFrame(loop);
    };

    if (this.animId) cancelAnimationFrame(this.animId);
    loop();
  }

  updatePhysics() {
    if (this.isVictory || this.isGameOver) return;

    // 1. Nitro holati
    let currentMaxSpeed = this.car.maxSpeed;
    if (this.input.nitro && this.car.nitro > 0) {
      this.car.isNitro = true;
      this.car.nitro = Math.max(0, this.car.nitro - 0.45);
      currentMaxSpeed = this.car.nitroMaxSpeed;
      this.car.nitroFlames.forEach(f => { f.visible = true; });
    } else {
      this.car.isNitro = false;
      this.car.nitro = Math.min(100, this.car.nitro + 0.15);
      this.car.nitroFlames.forEach(f => { f.visible = false; });
    }

    // 2. Tezlanish va Tormoz
    if (this.input.forward) {
      this.car.speed += this.car.accel * (this.car.isNitro ? 1.5 : 1.0);
      if (this.car.speed > currentMaxSpeed) this.car.speed = currentMaxSpeed;
    } else if (this.input.backward) {
      this.car.speed -= this.car.brake;
      if (this.car.speed < -currentMaxSpeed * 0.45) this.car.speed = -currentMaxSpeed * 0.45;
    } else {
      this.car.speed *= this.car.friction;
      if (Math.abs(this.car.speed) < 0.005) this.car.speed = 0;
    }

    // Stop-chiroqlar
    const isBraking = this.input.backward || (this.input.drift && this.car.speed > 0.1);
    this.car.taillights.forEach(t => {
      t.material.color.setHex(isBraking ? 0xff0000 : 0x7f1d1d);
    });

    // 3. Rul burilishi (Steering)
    const steerDir = (this.input.left ? 1 : 0) - (this.input.right ? 1 : 0);
    const speedFactor = Math.min(1.0, Math.abs(this.car.speed) / 0.5);

    if (steerDir !== 0 && this.car.speed !== 0) {
      const turnMultiplier = (this.car.speed < 0 ? -1 : 1) * (this.input.drift ? 1.6 : 1.0);
      this.car.angle += steerDir * this.car.steerSpeed * speedFactor * turnMultiplier;
      this.car.steerAngle = THREE.MathUtils.lerp(this.car.steerAngle, steerDir * 0.45, 0.15);
    } else {
      this.car.steerAngle = THREE.MathUtils.lerp(this.car.steerAngle, 0, 0.15);
    }

    this.car.frontWheels.forEach(w => {
      w.rotation.y = this.car.steerAngle;
    });

    this.car.wheels.forEach(w => {
      w.children[0].rotation.x += this.car.speed * 0.8;
    });

    // 4. Koordinatalarni yangilash
    const nextX = this.car.x + Math.sin(this.car.angle) * this.car.speed;
    const nextZ = this.car.z + Math.cos(this.car.angle) * this.car.speed;

    // Bino to'qnashuvlari tekshiruvi (AABB collision check)
    let collision = false;
    for (const b of this.buildings) {
      if (nextX >= b.minX && nextX <= b.maxX && nextZ >= b.minZ && nextZ <= b.maxZ) {
        collision = true;
        break;
      }
    }

    if (collision) {
      this.car.speed *= -0.35;
      this.car.health = Math.max(0, this.car.health - 6);
      window.soundEngine.playCrash();
      if (this.car.health <= 0) {
        this.handleGameOver(false);
      }
    } else {
      this.car.x = nextX;
      this.car.z = nextZ;
    }

    // 5. Tramplinlar tekshiruvi (Jump ramps)
    this.ramps.forEach(ramp => {
      const d = Math.hypot(this.car.x - ramp.x, this.car.z - ramp.z);
      if (d < ramp.radius && this.car.speed > 0.6 && this.car.isGrounded) {
        this.car.vy = 0.55;
        this.car.isGrounded = false;
        window.soundEngine.playNitroWhoosh();
      }
    });

    if (!this.car.isGrounded) {
      this.car.y += this.car.vy;
      this.car.vy -= 0.025;
      if (this.car.y <= 0) {
        this.car.y = 0;
        this.car.vy = 0;
        this.car.isGrounded = true;
      }
    }

    this.car.mesh.position.set(this.car.x, this.car.y, this.car.z);
    this.car.mesh.rotation.y = this.car.angle;

    // 6. Maxfiy yukka yetish tekshiruvi
    const distToCargo = Math.hypot(this.car.x - this.cargo.x, this.car.z - this.cargo.z);
    if (distToCargo < 8 && !this.isVictory) {
      this.handleGameOver(true);
    }

    if (this.cargo.boxMesh) {
      this.cargo.boxMesh.rotation.y += 0.02;
    }

    // 7. HUD va Audio yangilash
    const speedKmh = Math.floor(Math.abs(this.car.speed) * 155);
    const speedEl = document.getElementById('race-speed-val');
    if (speedEl) speedEl.textContent = speedKmh;

    const nitroEl = document.getElementById('race-nitro-fill');
    if (nitroEl) nitroEl.style.width = `${this.car.nitro}%`;

    const healthEl = document.getElementById('race-health-fill');
    if (healthEl) healthEl.style.width = `${this.car.health}%`;

    window.soundEngine.updateEngine(Math.abs(this.car.speed) / this.car.maxSpeed, this.car.isNitro);
  }

  updatePolice() {
    let closestDist = 9999;
    const now = Date.now();

    this.policeCars.forEach((p, idx) => {
      const dx = this.car.x - p.x;
      const dz = this.car.z - p.z;
      const dist = Math.hypot(dx, dz);
      if (dist < closestDist) closestDist = dist;

      if (dist < 180) {
        const targetAngle = Math.atan2(dx, dz);
        p.angle = THREE.MathUtils.lerp(p.angle, targetAngle, 0.035);

        p.speed = Math.min(p.maxSpeed, p.speed + 0.015);
        p.x += Math.sin(p.angle) * p.speed;
        p.z += Math.cos(p.angle) * p.speed;

        p.mesh.position.set(p.x, 0, p.z);
        p.mesh.rotation.y = p.angle;

        if (dist < 4.2) {
          this.car.health = Math.max(0, this.car.health - 8);
          this.car.speed *= 0.5;
          p.speed *= -0.2;
          window.soundEngine.playCrash();
          if (this.car.health <= 0) {
            this.handleGameOver(false);
          }
        }
      }

      const flash = Math.sin(now * 0.012 + idx) > 0;
      p.redSiren.material.color.setHex(flash ? 0xff0000 : 0x330000);
      p.blueSiren.material.color.setHex(!flash ? 0x0088ff : 0x001133);
    });

    const distanceRatio = Math.min(1.0, closestDist / 120);
    window.soundEngine.updateSirenVolume(distanceRatio);
  }

  updateCamera() {
    const targetX = this.car.x - Math.sin(this.car.angle) * 11;
    const targetZ = this.car.z - Math.cos(this.car.angle) * 11;
    const targetY = this.car.y + 4.8;

    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetX, 0.12);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetZ, 0.12);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetY, 0.12);

    this.camera.lookAt(this.car.x, this.car.y + 1.2, this.car.z);
  }

  // Doiraviy Radar (Aqlli chekka klamp mexanizmi bilan)
  renderRadar() {
    if (!this.radarCtx) return;
    const w = this.radarCanvas.width;
    const h = this.radarCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = 0.22;
    const maxR = cx - 9;

    this.radarCtx.clearRect(0, 0, w, h);

    // Radar foni
    this.radarCtx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    this.radarCtx.beginPath();
    this.radarCtx.arc(cx, cy, cx - 2, 0, Math.PI * 2);
    this.radarCtx.fill();

    // Radar konsentrik halqalari
    this.radarCtx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    this.radarCtx.lineWidth = 1;
    this.radarCtx.beginPath();
    this.radarCtx.arc(cx, cy, (cx - 2) * 0.5, 0, Math.PI * 2);
    this.radarCtx.arc(cx, cy, (cx - 2) * 0.82, 0, Math.PI * 2);
    this.radarCtx.stroke();

    // Maxfiy yuk belgisi (Klamping bilan - doimo yo'nalishni ko'rsatib turadi)
    const cargoRelX = (this.cargo.x - this.car.x) * scale;
    const cargoRelZ = (this.cargo.z - this.car.z) * scale;
    const cargoDist = Math.hypot(cargoRelX, cargoRelZ);

    let drawCargoX = cargoRelX;
    let drawCargoY = cargoRelZ;
    if (cargoDist > maxR) {
      drawCargoX = (cargoRelX / cargoDist) * maxR;
      drawCargoY = (cargoRelZ / cargoDist) * maxR;
    }

    // Zumrad olmos nishoni
    this.radarCtx.save();
    this.radarCtx.translate(cx + drawCargoX, cy + drawCargoY);
    this.radarCtx.fillStyle = '#10b981';
    this.radarCtx.shadowColor = '#34d399';
    this.radarCtx.shadowBlur = 8;
    this.radarCtx.beginPath();
    this.radarCtx.moveTo(0, -6);
    this.radarCtx.lineTo(6, 0);
    this.radarCtx.lineTo(0, 6);
    this.radarCtx.lineTo(-6, 0);
    this.radarCtx.closePath();
    this.radarCtx.fill();
    this.radarCtx.restore();

    // Politsiya mashinalari (Red dots)
    this.policeCars.forEach(p => {
      const pRelX = (p.x - this.car.x) * scale;
      const pRelZ = (p.z - this.car.z) * scale;
      if (Math.hypot(pRelX, pRelZ) < cx - 4) {
        this.radarCtx.fillStyle = '#ef4444';
        this.radarCtx.shadowColor = '#f43f5e';
        this.radarCtx.shadowBlur = 6;
        this.radarCtx.beginPath();
        this.radarCtx.arc(cx + pRelX, cy + pRelZ, 4, 0, Math.PI * 2);
        this.radarCtx.fill();
      }
    });

    // O'yinchi (Cyan directional arrow)
    this.radarCtx.save();
    this.radarCtx.translate(cx, cy);
    this.radarCtx.rotate(-this.car.angle);
    this.radarCtx.fillStyle = '#38bdf8';
    this.radarCtx.shadowColor = '#0284c7';
    this.radarCtx.shadowBlur = 10;
    this.radarCtx.beginPath();
    this.radarCtx.moveTo(0, -8);
    this.radarCtx.lineTo(6, 7);
    this.radarCtx.lineTo(0, 3.5);
    this.radarCtx.lineTo(-6, 7);
    this.radarCtx.closePath();
    this.radarCtx.fill();
    this.radarCtx.restore();
  }

  handleGameOver(won) {
    if (won) {
      this.isVictory = true;
      window.soundEngine.playVictoryFanfare();
      if (window.appState) {
        window.appState.addXP(250, "Maxfiy yuk nuqtasiga eson-omon yetib borildi!");
      }
    } else {
      this.isGameOver = true;
      window.soundEngine.playCrash();
    }

    window.soundEngine.stopContinuousSounds();

    setTimeout(() => {
      const modal = document.getElementById('race-modal');
      const icon = document.getElementById('race-modal-icon');
      const title = document.getElementById('race-modal-title');
      const desc = document.getElementById('race-modal-desc');

      if (won) {
        icon.textContent = '🏆';
        title.textContent = 'MISSIYA BAJARILDI!';
        desc.textContent = `Siz kiber-politsiyadan qochib, maxfiy yukni o'z vaqtida (${90 - this.timer} soniyada) muvaffaqiyatli yetkazdingiz!`;
      } else {
        icon.textContent = '💥';
        title.textContent = "MISSIYA MUVAFFAQIYATSIZ!";
        desc.textContent = this.car.health <= 0
          ? "Avtomobil haddan tashqari ko'p shikastlandi!"
          : "Belgilangan vaqt tugadi! Politsiya barcha yo'llarni to'sib qo'ydi.";
      }

      modal.style.display = 'flex';
    }, 400);
  }

  restartGame() {
    document.getElementById('race-modal').style.display = 'none';

    this.car.x = 0;
    this.car.y = 0;
    this.car.z = 0;
    this.car.speed = 0;
    this.car.angle = 0;
    this.car.health = 100;
    this.car.nitro = 100;

    this.isVictory = false;
    this.isGameOver = false;

    this.policeCars[0].x = 120; this.policeCars[0].z = -100;
    this.policeCars[1].x = -140; this.policeCars[1].z = -180;
    this.policeCars[2].x = 200; this.policeCars[2].z = -260;

    this.startTimer();
    window.soundEngine.startEngine();
    window.soundEngine.startSiren();
  }

  destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.boundKeyDown) window.removeEventListener('keydown', this.boundKeyDown);
    if (this.boundKeyUp) window.removeEventListener('keyup', this.boundKeyUp);
    window.soundEngine.stopContinuousSounds();
  }
}

window.MegaRace3D = MegaRace3D;
