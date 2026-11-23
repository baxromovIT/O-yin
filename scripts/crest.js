/**
 * AQL GERBI (GEOMETRIC CREST GENERATOR)
 * Ism asosida deterministik va dinamik muqaddas geometriya gerbi yaratuvchi generator.
 */

class CrestGenerator {
  constructor() {
    this.animationFrames = new Map();
  }

  // Matn asosida kuchli deterministik hesh hisoblash
  hashString(str) {
    if (!str || str.length === 0) str = "AQL AKADEMIYASI";
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    return hash;
  }

  // Heshdan olingan parametrlarni aniqlash
  getParams(name) {
    const hash = this.hashString(name);
    const h1 = hash & 0xff;
    const h2 = (hash >> 8) & 0xff;
    const h3 = (hash >> 16) & 0xff;
    const h4 = (hash >> 24) & 0xff;

    // Simmetriya qirralari: 5, 6, 7, 8, 9, 10, 12
    const symmetries = [5, 6, 7, 8, 9, 10, 12];
    const symmetry = symmetries[h1 % symmetries.length];

    // Ranglar palitralari (Quyosh-kelajak & Keramika shisha uslubi)
    const palettes = [
      { primary: '#f59e0b', secondary: '#2563eb', accent: '#fef3c7', glow: 'rgba(245, 158, 11, 0.4)' }, // Oltin-Safir
      { primary: '#10b981', secondary: '#3b82f6', accent: '#d1fae5', glow: 'rgba(16, 185, 129, 0.4)' }, // Zumrad-Sian
      { primary: '#d97706', secondary: '#f43f5e', accent: '#fffbeb', glow: 'rgba(244, 63, 94, 0.4)' },  // Quyosh botishi
      { primary: '#6366f1', secondary: '#06b6d4', accent: '#e0e7ff', glow: 'rgba(99, 102, 241, 0.4)' }, // Kiber-Safir
      { primary: '#eab308', secondary: '#10b981', accent: '#fefce8', glow: 'rgba(234, 179, 8, 0.4)' }   // Oltin-Zumrad
    ];
    const palette = palettes[h2 % palettes.length];

    const innerShapeType = h3 % 4; // 0: romb, 1: yulduz, 2: aylana ko'z, 3: ko'pburchak
    const starRatio = 0.35 + (h4 % 40) / 100; // Ichki burchak radiusi
    const spinSpeed = 0.008 + (h1 % 15) * 0.001;

    return {
      symmetry,
      palette,
      innerShapeType,
      starRatio,
      spinSpeed,
      seed: hash
    };
  }

  // Kanvasda gerbni uzluksiz aylantirib chizish
  bindCanvas(canvas, getNameCallback) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rotation = 0;

    const render = () => {
      const name = getNameCallback ? getNameCallback() : "";
      const params = this.getParams(name);

      const width = canvas.width;
      const height = canvas.height;
      const size = Math.min(width, height);
      const cx = width / 2;
      const cy = height / 2;
      const radius = size * 0.44;

      ctx.clearRect(0, 0, width, height);

      rotation += params.spinSpeed;

      // 1. Tashqi yorug'lik g'ubori (Glow)
      const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.05);
      glowGrad.addColorStop(0, params.palette.glow);
      glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.05, 0, Math.PI * 2);
      ctx.fill();

      // 2. Tashqi aylanuvchi uzuk (Segmented orbital ring)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);

      ctx.strokeStyle = params.palette.primary;
      ctx.lineWidth = Math.max(1.5, size * 0.025);
      ctx.setLineDash([size * 0.06, size * 0.03]);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Tashqi tishlar / Quyosh nurlari
      const teethCount = params.symmetry * 2;
      ctx.fillStyle = params.palette.primary;
      for (let i = 0; i < teethCount; i++) {
        const angle = (i * Math.PI * 2) / teethCount;
        const tx = Math.cos(angle) * radius;
        const ty = Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.arc(tx, ty, size * 0.02, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // 3. O'rta geometrik yulduz / Ko'pburchak (Teskari aylanadi)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-rotation * 1.4);

      const sym = params.symmetry;
      const rOuter = radius * 0.82;
      const rInner = rOuter * params.starRatio;

      ctx.beginPath();
      for (let i = 0; i < sym * 2; i++) {
        const r = i % 2 === 0 ? rOuter : rInner;
        const angle = (i * Math.PI) / sym;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Gradent to'ldirish
      const starGrad = ctx.createLinearGradient(-rOuter, -rOuter, rOuter, rOuter);
      starGrad.addColorStop(0, params.palette.secondary);
      starGrad.addColorStop(1, params.palette.primary);
      ctx.strokeStyle = starGrad;
      ctx.lineWidth = Math.max(1.8, size * 0.028);
      ctx.stroke();

      ctx.fillStyle = params.palette.glow;
      ctx.fill();

      // Qirralardan markazga chiziqlar
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      for (let i = 0; i < sym; i++) {
        const angle = (i * Math.PI * 2) / sym;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * rOuter, Math.sin(angle) * rOuter);
        ctx.stroke();
      }

      ctx.restore();

      // 4. Ichki yadro kristalli (Dynamic Core Gem)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation * 2.2);

      const coreRadius = radius * 0.35;
      const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.5, params.palette.accent);
      coreGrad.addColorStop(1, params.palette.primary);

      ctx.fillStyle = coreGrad;
      ctx.beginPath();

      if (params.innerShapeType === 0) {
        // Romb kristall
        ctx.moveTo(0, -coreRadius);
        ctx.lineTo(coreRadius, 0);
        ctx.lineTo(0, coreRadius);
        ctx.lineTo(-coreRadius, 0);
      } else if (params.innerShapeType === 1) {
        // Kichik yulduzcha
        for (let j = 0; j < 8; j++) {
          const r = j % 2 === 0 ? coreRadius : coreRadius * 0.5;
          const a = (j * Math.PI) / 4;
          if (j === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
      } else if (params.innerShapeType === 2) {
        // Oltiburchak qirrali
        for (let j = 0; j < 6; j++) {
          const a = (j * Math.PI) / 3;
          if (j === 0) ctx.moveTo(Math.cos(a) * coreRadius, Math.sin(a) * coreRadius);
          else ctx.lineTo(Math.cos(a) * coreRadius, Math.sin(a) * coreRadius);
        }
      } else {
        // Doira ko'z
        ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
      }

      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Markaziy nur nuqtasi
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, coreRadius * 0.28, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      const frameId = requestAnimationFrame(render);
      this.animationFrames.set(canvas, frameId);
    };

    if (this.animationFrames.has(canvas)) {
      cancelAnimationFrame(this.animationFrames.get(canvas));
    }
    render();
  }

  stop(canvas) {
    if (this.animationFrames.has(canvas)) {
      cancelAnimationFrame(this.animationFrames.get(canvas));
      this.animationFrames.delete(canvas);
    }
  }
}

window.crestGenerator = new CrestGenerator();
