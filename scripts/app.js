/**
 * AQL AKADEMIYASI - ASOSIY BOSHQARUVCHI (APP ORCHESTRATOR)
 * Foydalanuvchi identifikatsiyasi, XP hisobi, ekranlar almashinuvi va 3D tilt effekti.
 */

class AppState {
  constructor() {
    this.userName = localStorage.getItem('aql_user_name') || '';
    this.xp = parseInt(localStorage.getItem('aql_xp') || '100', 10);
    this.soundEnabled = localStorage.getItem('aql_sound') !== 'false';
    this.currentScreen = 'portal'; // 'portal', 'hub', 'game'
    this.activeGameInstance = null;
    this.portalBackground = null;

    this.init();
  }

  init() {
    // 1. Fon animatsiyasini yoqish
    this.portalBackground = new window.PortalBackground('portal-bg-canvas');

    // 2. Gerb generatorini login kanvasiga ulash
    const nameInput = document.getElementById('input-player-name');
    const crestCanvas = document.getElementById('crest-preview-canvas');
    if (nameInput && crestCanvas) {
      if (this.userName) nameInput.value = this.userName;
      window.crestGenerator.bindCanvas(crestCanvas, () => nameInput.value.trim());

      nameInput.addEventListener('input', () => {
        // Har bir harf yozilganda gerb avtomatik qayta hisoblanadi
      });
    }

    // 3. Hodisalarni bog'lash
    this.bindDOMEvents();

    // 4. Ovoz tugmasini dastlabki sozlash
    this.updateSoundBtnUI();

    // 5. XP ko'rsatkichini yangilash
    this.updateXPUI();
  }

  bindDOMEvents() {
    // Login tugmasi: "TIZIMGA KIRISH →"
    const btnLogin = document.getElementById('btn-portal-login');
    const nameInput = document.getElementById('input-player-name');

    const handleLogin = () => {
      let name = nameInput.value.trim();
      if (!name) name = "Geniy";
      this.userName = name;
      localStorage.setItem('aql_user_name', this.userName);

      window.soundEngine.playCrystalChime();
      this.showHubScreen();
    };

    if (btnLogin) {
      btnLogin.addEventListener('click', handleLogin);
    }
    if (nameInput) {
      nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleLogin();
      });
    }

    // Ovoz yoqish/o'chirish tugmasi
    const btnSound = document.getElementById('btn-toggle-sound');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        this.soundEnabled = window.soundEngine.toggleSound();
        localStorage.setItem('aql_sound', this.soundEnabled);
        this.updateSoundBtnUI();
        window.soundEngine.playButtonTick();
      });
    }

    // Markazga qaytish tugmasi
    const btnBackHub = document.getElementById('btn-back-to-hub');
    if (btnBackHub) {
      btnBackHub.addEventListener('click', () => {
        this.closeActiveGame();
        window.soundEngine.playButtonTick();
      });
    }

    // Chiqish (Portalga qaytish)
    const btnExit = document.getElementById('btn-hub-exit');
    if (btnExit) {
      btnExit.addEventListener('click', () => {
        this.showPortalScreen();
        window.soundEngine.playButtonTick();
      });
    }

    // 4 ta O'yin kartochkalari (3D Tilt va Bosish)
    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
      // 3D Tilt effekti
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -12;
        const rotateY = ((x - centerX) / centerX) * 12;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });

      // Kartochkani bosish -> O'yinni ochish
      card.addEventListener('click', () => {
        const gameType = card.dataset.game;
        this.openGame(gameType);
      });
    });
  }

  showPortalScreen() {
    this.closeActiveGame();
    document.getElementById('portal-screen').style.display = 'flex';
    document.getElementById('hub-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';
    this.currentScreen = 'portal';
  }

  showHubScreen() {
    document.getElementById('portal-screen').style.display = 'none';
    document.getElementById('hub-screen').style.display = 'block';
    document.getElementById('game-screen').style.display = 'none';
    this.currentScreen = 'hub';

    // Yuqori paneldagi profil ma'lumotlarini yangilash
    document.getElementById('topbar-user-name').textContent = this.userName;
    document.getElementById('hub-welcome-user').textContent = this.userName;

    // Mini gerb kanvasini ulash
    const topbarCrest = document.getElementById('topbar-crest-canvas');
    if (topbarCrest) {
      window.crestGenerator.bindCanvas(topbarCrest, () => this.userName);
    }
  }

  openGame(gameType) {
    window.soundEngine.playCrystalChime();

    document.getElementById('hub-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    this.currentScreen = 'game';

    const gameContainer = document.getElementById('active-game-container');
    const titleEl = document.getElementById('game-title-text');
    const badgeEl = document.getElementById('game-age-badge');

    if (this.activeGameInstance) {
      this.activeGameInstance.destroy();
      this.activeGameInstance = null;
    }

    if (gameType === 'coloring') {
      titleEl.textContent = "Sehrli Mo'yqalam";
      badgeEl.textContent = "3–5 YOSH";
      this.activeGameInstance = new window.ColoringGame();
      this.activeGameInstance.mount('active-game-container');
    } else if (gameType === 'pipes') {
      titleEl.textContent = "Oltin Quvurlar";
      badgeEl.textContent = "6–10 YOSH";
      this.activeGameInstance = new window.PipesGame();
      this.activeGameInstance.mount('active-game-container');
    } else if (gameType === 'lock') {
      titleEl.textContent = "Kiber-Qulf";
      badgeEl.textContent = "11–15 YOSH";
      this.activeGameInstance = new window.CyberLockGame();
      this.activeGameInstance.mount('active-game-container');
    } else if (gameType === 'race3d') {
      titleEl.textContent = "MEGA-POYGA 3D: MAXFIY YUK";
      badgeEl.textContent = "16–20 YOSH";
      this.activeGameInstance = new window.MegaRace3D();
      this.activeGameInstance.mount('active-game-container');
    }
  }

  closeActiveGame() {
    if (this.activeGameInstance) {
      this.activeGameInstance.destroy();
      this.activeGameInstance = null;
    }
    const gameContainer = document.getElementById('active-game-container');
    if (gameContainer) gameContainer.innerHTML = '';

    this.showHubScreen();
  }

  addXP(amount, reason = "") {
    this.xp += amount;
    localStorage.setItem('aql_xp', this.xp);
    this.updateXPUI();
    this.showXPToast(amount, reason);
  }

  updateXPUI() {
    const el = document.getElementById('topbar-xp-val');
    if (el) {
      el.textContent = `${this.xp} XP`;
    }
  }

  showXPToast(amount, reason) {
    const toast = document.createElement('div');
    toast.className = 'xp-toast glass-card animate-toast';
    toast.innerHTML = `
      <div class="toast-glow"></div>
      <span class="toast-xp">+${amount} XP</span>
      <span class="toast-reason">${reason || 'Aqliy yutuq!'}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 600);
    }, 3200);
  }

  updateSoundBtnUI() {
    const btn = document.getElementById('btn-toggle-sound');
    if (btn) {
      btn.innerHTML = this.soundEnabled
        ? '<span>🔊</span> Ovoz: Yoqilgan'
        : '<span>🔇</span> Ovoz: O\'chirilgan';
    }
  }
}

// Sahna yuklanganda ishga tushirish
window.addEventListener('DOMContentLoaded', () => {
  window.appState = new AppState();
});
