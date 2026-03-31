import { SaveManager } from '../SaveManager.js';

export default class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super('LevelSelectScene');
    }

    preload() {
        this.load.image('bglevel',  'assets/levelselection.png');
        this.load.image('level1',   'assets/Level 1.png');
        this.load.image('level2',   'assets/Level 2.png');
        this.load.image('level3',   'assets/Level 3.png');
        this.load.image('level4',   'assets/Level 4.png');
        this.load.image('level5',   'assets/Level 5.png');
        this.load.image('level6',   'assets/Level 6.png');
        this.load.image('level7',   'assets/Level 7.png');
        this.load.image('level8',   'assets/Level 8.png');
        this.load.image('level9',   'assets/Level 9.png');
        this.load.image('level10',  'assets/Level 10.png');
        this.load.image('kembali',  'assets/back.png');
    }

    create() {
        const bgs = this.sound.get('bgs');
        if (bgs) bgs.stop();

        // ── GIF Mio ────────────────────────────────────────────────
        const gif = document.createElement('img');
        gif.src = './assets/character/mio.gif';
        gif.id = 'mio-gif';
        gif.style.cssText = `
            position: absolute;
            pointer-events: none;
            z-index: 10;
            image-rendering: pixelated;
            image-rendering: crisp-edges;
        `;
        document.getElementById('game-container').appendChild(gif);

        // Koordinat Phaser target: bawah board, kiri tengah
        // Board ada di sekitar x:620-1520, level row 2 di y:400
        // Mio berdiri di bawah board → x:620, y:490
        const MIO_GAME_X = 800;
        const MIO_GAME_Y = 700;
        const MIO_GAME_SIZE = 200; // ukuran dalam koordinat Phaser

        const updateMioPosition = () => {
            const gameContainer = document.getElementById('game-container');
            const canvas = gameContainer.querySelector('canvas');
            if (!canvas) return;

            // canvas.width = resolusi internal Phaser (koordinat game)
            const gameW = canvas.width;
            const gameH = canvas.height;

            // Ukuran tampil aktual di layar
            const displayW = canvas.offsetWidth;
            const displayH = canvas.offsetHeight;

            // Rasio skala
            const scaleX = displayW / gameW;
            const scaleY = displayH / gameH;

            // Offset canvas dalam container (jika ada letterbox)
            const canvasRect = canvas.getBoundingClientRect();
            const containerRect = gameContainer.getBoundingClientRect();
            const offsetX = canvasRect.left - containerRect.left;
            const offsetY = canvasRect.top - containerRect.top;

            // Konversi koordinat Phaser → pixel layar
            const gifW = MIO_GAME_SIZE * scaleX;
            const gifH = MIO_GAME_SIZE * scaleY;
            const left = offsetX + (MIO_GAME_X * scaleX) - gifW / 2;
            const top  = offsetY + (MIO_GAME_Y * scaleY) - gifH;

            gif.style.width  = `${gifW}px`;
            gif.style.height = `${gifH}px`;
            gif.style.left   = `${left}px`;
            gif.style.top    = `${top}px`;
        };

        updateMioPosition();
        window.addEventListener('resize', updateMioPosition);
        gif._resizeHandler = updateMioPosition;

        this.events.on('shutdown', () => {
            window.removeEventListener('resize', gif._resizeHandler);
            const el = document.getElementById('mio-gif');
            if (el) el.remove();
        });

        // Hapus saat scene shutdown
        this.events.on('shutdown', () => {
            const el = document.getElementById('mio-gif');
            if (el) el.remove();
        });
        this.music = this.sound.get('bgm');

        this.events.on('shutdown', () => {
            if (this.music) this.music.stop();
        });

        const W  = this.scale.width;
        const H  = this.scale.height;
        const cx = W / 2;
        const fs = (n) => `${Math.round(n * W / 800)}px`;

        this.add.image(W / 2, H / 2, 'bglevel').setDisplaySize(W, H);

        this.add.text(1090, 130, 'SELECT LEVEL', {
            fontSize:   '50px',
            fontFamily: 'PixeloidSans-Bold',
            color :     '#ffffff',
            stroke :    '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Hint kriteria unlock
        this.add.text(cx, H * 0.90,
            '🔒 Selesaikan level sebelumnya dengan minimal 3 soal benar atau 60 skor untuk membuka level berikutnya', {
            fontFamily: 'PixeloidSans',
            fontSize:   fs(13),
            color:      '#ffcc44',
            align:      'center',
            wordWrap:   { width: W * 0.75 }
        }).setOrigin(0.5).setDepth(2);

        // Definisi posisi setiap level
        const levelPositions = [
            { level: 1,  x: 620,  y: 250 },
            { level: 2,  x: 770,  y: 250 },
            { level: 3,  x: 920,  y: 250 },
            { level: 4,  x: 1070, y: 250 },
            { level: 5,  x: 1220, y: 250 },
            { level: 6,  x: 1370, y: 250 },
            { level: 7,  x: 1520, y: 250 },
            { level: 8,  x: 920,  y: 400 },
            { level: 9,  x: 1070, y: 400 },
            { level: 10, x: 1220, y: 400 },
        ];

        levelPositions.forEach(({ level, x, y }) => {
            const isUnlocked = SaveManager.isUnlocked(level);
            const stats      = SaveManager.getLevelStats(level);
            const btn        = this.add.image(x, y, `level${level}`)
                .setScale(0.5)
                .setDepth(1);

            if (!isUnlocked) {
                btn.setTint(0x555555);
                btn.setAlpha(0.6);

                this.add.text(x, y - 10, '🔒', {
                    fontSize: fs(24)
                }).setOrigin(0.5).setDepth(2);

                btn.setInteractive();
                btn.on('pointerover', () => {
                    this._showLockTooltip(x, y - 50,
                        `Selesaikan Level ${level - 1} dulu!\nMin. 3 benar / 60 skor`, fs);
                });
                btn.on('pointerout', () => this._hideLockTooltip());

            } else {
                btn.setInteractive();

                if (stats.completed) {
                    this.add.text(x + 28, y - 28, '✓', {
                        fontFamily:      'PixeloidSans-Bold',
                        fontSize:        fs(14),
                        color:           '#00FF99',
                        backgroundColor: '#003300',
                        padding:         { x: 3, y: 2 }
                    }).setOrigin(0.5).setDepth(2);
                }

                btn.on('pointerover', () => {
                    btn.setScale(0.6);
                    if (stats.bestScore > 0) {
                        this._showLockTooltip(x, y - 55,
                            `Best: ${stats.bestScore} skor | ${stats.bestCorrect} benar`, fs);
                    }
                });
                btn.on('pointerout', () => {
                    btn.setScale(0.5);
                    btn.clearTint();
                    this._hideLockTooltip();
                });
                btn.on('pointerdown', () => {
                    btn.setScale(0.4);
                    btn.setTint(0xdddddd);
                });
                btn.on('pointerup', () => {
                    btn.setScale(0.5);
                    btn.clearTint();
                    this.scene.start('GameScene', {
                        level:         String(level),
                        questionIndex: 0,
                        score:         0,
                        lives:         3,
                        correctCount:  0
                    });
                });
            }
        });

        // ── Tombol Back ────────────────────────────────────────
        const btnBack = this.add.image(100, 100, 'kembali').setScale(0.3).setInteractive();
        btnBack.on('pointerdown', () => btnBack.setTint(0xdddddd));
        btnBack.on('pointerup',   () => this.scene.start('HomeScene'));

        // ── Tombol Reset Progress (kanan atas) ─────────────────
        this._buildResetButton(W, fs);

        // ── Overlay Konfirmasi Reset ───────────────────────────
        this._buildResetOverlay(W, H, cx, fs);

        //tooltip untuk hint
        this._tooltipBgHint = this.add.rectangle(cx, H * 0.90, 1500, 100, 0x1a1a2e)
            .setStrokeStyle(1, 0xFFD700).setVisible(true).setDepth(0);

        this._tooltipBg   = this.add.rectangle(0, 0, 220, 50, 0x1a1a2e)
            .setStrokeStyle(1, 0xFFD700).setVisible(false).setDepth(10);
        this._tooltipText = this.add.text(0, 0, '', {
            fontFamily: 'PixeloidSans',
            color:      '#ffcc44',
            align:      'center'
        }).setOrigin(0.5).setVisible(false).setDepth(11);
    }

    // ── Builder: tombol reset di pojok kanan atas ──────────────
    _buildResetButton(W, fs) {
        const btnX = W - 220;
        const btnY = 38;

        // Background tombol
        const resetBg = this.add.rectangle(btnX, btnY, 400, 50, 0x8B0000)
            .setStrokeStyle(2, 0xFF4444)
            .setInteractive()
            .setDepth(5);

        // Label
        const resetLabel = this.add.text(btnX, btnY, '⚠ RESET PROGRESS', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(12),
            color:      '#FF8888',
        }).setOrigin(0.5).setDepth(6);

        // Hover & click effect
        resetBg.on('pointerover', () => {
            resetBg.setFillStyle(0xAA0000);
            resetLabel.setColor('#FFCCCC');
        });
        resetBg.on('pointerout', () => {
            resetBg.setFillStyle(0x8B0000);
            resetLabel.setColor('#FF8888');
        });
        resetBg.on('pointerdown', () => {
            resetBg.setFillStyle(0x550000);
            resetBg.setScale(0.95);
            resetLabel.setScale(0.95);
        });
        resetBg.on('pointerup', () => {
            resetBg.setFillStyle(0xAA0000);
            resetBg.setScale(1);
            resetLabel.setScale(1);
            this._showResetOverlay();
        });
    }

    // ── Builder: overlay konfirmasi ────────────────────────────
    _buildResetOverlay(W, H, cx, fs) {
        const DEPTH = 20;

        // Dim background
        this._overlayDim = this.add.rectangle(cx, H / 2, W, H, 0x000000, 0.7)
            .setDepth(DEPTH)
            .setVisible(false)
            .setInteractive(); // blokir klik ke bawah

        // Panel kotak konfirmasi
        this._overlayPanel = this.add.rectangle(cx, H / 2, 700, 300, 0x1a1a2e)
            .setStrokeStyle(3, 0xFF4444)
            .setDepth(DEPTH + 1)
            .setVisible(false);

        // Judul
        this._overlayTitle = this.add.text(cx, H / 2 - 90, '⚠  RESET PROGRESS', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(20),
            color:      '#FF4444',
            stroke:     '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5).setDepth(DEPTH + 2).setVisible(false);

        // Pesan konfirmasi
        this._overlayMsg = this.add.text(cx, H / 2 - 20,
            'Semua progress level akan dihapus.\nApakah kamu yakin ingin mereset?', {
            fontFamily: 'PixeloidSans',
            fontSize:   fs(14),
            color:      '#ffffff',
            align:      'center',
            lineSpacing: 8,
        }).setOrigin(0.5).setDepth(DEPTH + 2).setVisible(false);

        // ── Tombol YA ──────────────────────────────────────────
        const yaBg = this.add.rectangle(cx - 120, H / 2 + 90, 220, 52, 0xAA0000)
            .setStrokeStyle(2, 0xFF4444)
            .setInteractive()
            .setDepth(DEPTH + 2)
            .setVisible(false);

        const yaLabel = this.add.text(cx - 120, H / 2 + 90, 'YA, RESET', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(14),
            color:      '#FFCCCC',
        }).setOrigin(0.5).setDepth(DEPTH + 3).setVisible(false);

        yaBg.on('pointerover', () => yaBg.setFillStyle(0xCC0000));
        yaBg.on('pointerout',  () => yaBg.setFillStyle(0xAA0000));
        yaBg.on('pointerdown', () => yaBg.setScale(0.95));
        yaBg.on('pointerup',   () => {
            yaBg.setScale(1);
            SaveManager.reset();          // <-- panggil method reset di SaveManager
            this._hideResetOverlay();
            // Restart scene agar badge & lock langsung terupdate
            this.scene.restart();
        });

        // ── Tombol BATAL ───────────────────────────────────────
        const batalBg = this.add.rectangle(cx + 120, H / 2 + 90, 180, 52, 0x1e3a2e)
            .setStrokeStyle(2, 0x00FF99)
            .setInteractive()
            .setDepth(DEPTH + 2)
            .setVisible(false);

        const batalLabel = this.add.text(cx + 120, H / 2 + 90, 'BATAL', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(14),
            color:      '#00FF99',
        }).setOrigin(0.5).setDepth(DEPTH + 3).setVisible(false);

        batalBg.on('pointerover', () => batalBg.setFillStyle(0x245c3a));
        batalBg.on('pointerout',  () => batalBg.setFillStyle(0x1e3a2e));
        batalBg.on('pointerdown', () => batalBg.setScale(0.95));
        batalBg.on('pointerup',   () => {
            batalBg.setScale(1);
            this._hideResetOverlay();
        });

        // Simpan referensi semua elemen overlay
        this._overlayElements = [
            this._overlayDim, this._overlayPanel,
            this._overlayTitle, this._overlayMsg,
            yaBg, yaLabel, batalBg, batalLabel
        ];
    }

    _showResetOverlay() {
        const gif = document.getElementById('mio-gif');
        if (gif) gif.style.display = 'none';
        this._overlayElements.forEach(el => el.setVisible(true));
    }

    _hideResetOverlay() {
        const gif = document.getElementById('mio-gif');
        if (gif) gif.style.display = 'block';
        this._overlayElements.forEach(el => el.setVisible(false));
    }

    // ── Tooltip ────────────────────────────────────────────────
    _showLockTooltip(x, y, msg, fs) {
        const lines = msg.split('\n').length;
        const h     = 30 + lines * 20;
        const w     = 500;
        this._tooltipBg.setPosition(x, y).setSize(w, h).setVisible(true);
        this._tooltipText.setPosition(x, y).setText(msg).setFontSize(fs ? fs(12) : '12px').setVisible(true);
    }

    _hideLockTooltip() {
        this._tooltipBg.setVisible(false);
        this._tooltipText.setVisible(false);
    }
}