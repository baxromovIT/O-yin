/**
 * AQL AKADEMIYASI - INTERAKTIV PORTAL FON CHIZUVCHISI
 * Qalqib yuruvchi oltin va moviy 3D geometrik kristallar, sichqonchaga silliq javob beruvchi fizika.
 */

class PortalBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.crystals = [];
    this.particles = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.animId = null;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = (e.clientX - this.width / 2) / (this.width / 2);
      this.targetMouseY = (e.clientY - this.height / 2) / (this.height / 2);
    });

    // Kristallarni yaratish
    this.crystals = [];
    const crystalCount = 28;
    for (let i = 0; i < crystalCount; i++) {
      this.crystals.push(this.createCrystal());
    }

    // Yorug'lik zarrachalarini yaratish
    this.particles = [];
    const particleCount = 45;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: 1 + Math.random() * 2.5,
        speedY: -0.2 - Math.random() * 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        alpha: 0.2 + Math.random() * 0.6,
        color: Math.random() > 0.4 ? 'rgba(245, 158, 11, ' : 'rgba(59, 130, 246, '
      });
    }

    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.scale(this.dpr, this.dpr);
  }

  createCrystal() {
    const types = ['octahedron', 'diamond', 'prism', 'cube', 'dodeca'];
    return {
      x: (Math.random() - 0.5) * this.width * 1.2 + this.width / 2,
      y: (Math.random() - 0.5) * this.height * 1.2 + this.height / 2,
      z: 0.4 + Math.random() * 1.4, // Chuqurlik
      size: 25 + Math.random() * 45,
      rotX: Math.random() * Math.PI * 2,
      rotY: Math.random() * Math.PI * 2,
      rotZ: Math.random() * Math.PI * 2,
      speedX: (Math.random() - 0.5) * 0.01,
      speedY: 0.008 + Math.random() * 0.015,
      speedZ: (Math.random() - 0.5) * 0.008,
      driftX: (Math.random() - 0.5) * 0.4,
      driftY: -0.3 - Math.random() * 0.4,
      type: types[Math.floor(Math.random() * types.length)],
      colorTheme: Math.random() > 0.45 ? 'gold' : 'blue'
    };
  }

  // 3D nuqtani aylantirish va proektsiyalash
  project(p, rotX, rotY, rotZ, scale, cx, cy) {
    // X o'qi bo'yicha aylantirish
    let y1 = p.y * Math.cos(rotX) - p.z * Math.sin(rotX);
    let z1 = p.y * Math.sin(rotX) + p.z * Math.cos(rotX);

    // Y o'qi bo'yicha aylantirish
    let x2 = p.x * Math.cos(rotY) + z1 * Math.sin(rotY);
    let z2 = -p.x * Math.sin(rotY) + z1 * Math.cos(rotY);

    // Z o'qi bo'yicha aylantirish
    let x3 = x2 * Math.cos(rotZ) - y1 * Math.sin(rotZ);
    let y3 = x2 * Math.sin(rotZ) + y1 * Math.cos(rotZ);

    return {
      x: cx + x3 * scale,
      y: cy + y3 * scale,
      z: z2
    };
  }

  // Geometriyalar (3D cho'qqilar va yoqlar)
  getCrystalGeometry(type) {
    if (type === 'diamond') {
      const vertices = [
        { x: 0, y: -1.3, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 0, z: 1 },
        { x: -1, y: 0, z: 0 },
        { x: 0, y: 0, z: -1 },
        { x: 0, y: 1.3, z: 0 }
      ];
      const faces = [
        [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
        [5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4]
      ];
      return { vertices, faces };
    } else if (type === 'cube') {
      const vertices = [
        { x: -0.7, y: -0.7, z: -0.7 }, { x: 0.7, y: -0.7, z: -0.7 },
        { x: 0.7, y: 0.7, z: -0.7 }, { x: -0.7, y: 0.7, z: -0.7 },
        { x: -0.7, y: -0.7, z: 0.7 }, { x: 0.7, y: -0.7, z: 0.7 },
        { x: 0.7, y: 0.7, z: 0.7 }, { x: -0.7, y: 0.7, z: 0.7 }
      ];
      const faces = [
        [0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7],
        [1, 5, 6, 2], [4, 5, 1, 0], [3, 2, 6, 7]
      ];
      return { vertices, faces };
    } else {
      // Standart Octahedron
      const vertices = [
        { x: 0, y: -1, z: 0 },
        { x: 0.9, y: 0, z: 0.9 },
        { x: -0.9, y: 0, z: 0.9 },
        { x: -0.9, y: 0, z: -0.9 },
        { x: 0.9, y: 0, z: -0.9 },
        { x: 0, y: 1, z: 0 }
      ];
      const faces = [
        [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
        [5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4]
      ];
      return { vertices, faces };
    }
  }

  animate() {
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Zarrachalar (Particles)
    this.particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX + this.mouseX * 0.4;
      if (p.y < -20) p.y = this.height + 20;
      if (p.x < -20) p.x = this.width + 20;
      if (p.x > this.width + 20) p.x = -20;

      this.ctx.fillStyle = p.color + p.alpha + ')';
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // 2. Kristallar
    // Chuqurlik bo'yicha saralash
    this.crystals.sort((a, b) => a.z - b.z);

    this.crystals.forEach(c => {
      c.rotX += c.speedX;
      c.rotY += c.speedY;
      c.rotZ += c.speedZ;

      c.y += c.driftY * c.z;
      c.x += c.driftX * c.z;

      // Ekrandan chiqsa qayta tiklash
      if (c.y < -100) {
        c.y = this.height + 100;
        c.x = Math.random() * this.width;
      }
      if (c.x < -100) c.x = this.width + 100;
      if (c.x > this.width + 100) c.x = -100;

      // Parallaks effekti
      const renderX = c.x + this.mouseX * 60 * c.z;
      const renderY = c.y + this.mouseY * 60 * c.z;
      const scale = c.size * c.z;

      const geom = this.getCrystalGeometry(c.type);

      // Har bir cho'qqini proyeksiyalash
      const projected = geom.vertices.map(v => 
        this.project(v, c.rotX, c.rotY, c.rotZ, scale, renderX, renderY)
      );

      // Yoqlarni chuqurlik (Z) bo'yicha chizish
      const facesWithZ = geom.faces.map(face => {
        let avgZ = 0;
        face.forEach(idx => { avgZ += projected[idx].z; });
        avgZ /= face.length;
        return { face, avgZ };
      });

      facesWithZ.sort((a, b) => a.avgZ - b.avgZ);

      facesWithZ.forEach(item => {
        const face = item.face;
        if (item.avgZ < -0.1) return; // Orqa tomonni yashirish (backface culling)

        this.ctx.beginPath();
        face.forEach((idx, i) => {
          const pt = projected[idx];
          if (i === 0) this.ctx.moveTo(pt.x, pt.y);
          else this.ctx.lineTo(pt.x, pt.y);
        });
        this.ctx.closePath();

        // Rang tanlash
        const lightIntensity = Math.min(1, Math.max(0.15, (item.avgZ + 1) / 2));
        if (c.colorTheme === 'gold') {
          const r = Math.floor(245 + lightIntensity * 10);
          const g = Math.floor(158 + lightIntensity * 60);
          const b = Math.floor(11 + lightIntensity * 140);
          this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.55 * c.z})`;
          this.ctx.strokeStyle = `rgba(251, 191, 36, ${0.85 * c.z})`;
        } else {
          const r = Math.floor(37 + lightIntensity * 50);
          const g = Math.floor(99 + lightIntensity * 80);
          const b = Math.floor(235 + lightIntensity * 20);
          this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.5 * c.z})`;
          this.ctx.strokeStyle = `rgba(96, 165, 250, ${0.85 * c.z})`;
        }

        this.ctx.lineWidth = 1.2;
        this.ctx.fill();
        this.ctx.stroke();
      });
    });

    this.animId = requestAnimationFrame(() => this.animate());
  }
}

window.PortalBackground = PortalBackground;
