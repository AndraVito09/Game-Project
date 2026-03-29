import { SaveManager } from './SaveManager.js';

export default class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super('LevelSelectScene');
    }

    preload() {
        this.load.image('bglevel', 'assets/levelselection.png');
        for (let i = 1; i <= 10; i++) this.load.image(`level${i}`, `assets/Level ${i}.png`);
    }

    create() {
        const W  = this.scale.width;
        const H  = this.scale.height;
        const cx = W / 2;
        const fs = (n) => `${Math.round(n * W / 800)}px`;

        this.add.image(W / 2, H / 2, 'bglevel');
        this.add.text(cx, H * 0.15, 'SELECT LEVEL', {
            fontSize: fs(32), fontFamily: 'PixeloidSans-Bold'
        }).setOrigin(0.5);

        // Layout posisi tombol level (sama seperti aslinya)
        const positions = [
            { x: 620,  y: 250 }, { x: 770,  y: 250 }, { x: 920,  y: 250 },
            { x: 1070, y: 250 }, { x: 1220, y: 250 }, { x: 1370, y: 250 },
            { x: 1520, y: 250 }, { x: 920,  y: 400 }, { x: 1070, y: 400 },
            { x: 1220, y: 400 }
        ];

        for (let i = 1; i <= 10; i++) {
            const pos      = positions[i - 1];
            const unlocked = SaveManager.isUnlocked(i);
            const stats    = SaveManager.getLevelStats(i);

            // Gambar tombol level
            const btn = this.add.image(pos.x, pos.y, `level${i}`)
                .setScale(0.5)
                .setDepth(1);

            if (unlocked) {
                // ── LEVEL TERBUKA ──────────────────────────────
                btn.setInteractive();

                btn.on('pointerover',  () => btn.setScale(0.6));
                btn.on('pointerout',   () => { btn.setScale(0.5); btn.clearTint(); });
                btn.on('pointerdown',  () => { btn.setScale(0.44); btn.setTint(0xdddddd); });
                btn.on('pointerup',    () => {
                    btn.setScale(0.5); btn.clearTint();
                    this.scene.start('GameScene', { level: String(i), questionIndex: 0, score: 0, lives: 3, correctCount: 0 });
                });

                // Badge completed
                if (stats.completed) {
                    this.add.text(pos.x + 36, pos.y - 36, '✓', {
                        fontFamily: 'PixeloidSans-Bold',
                        fontSize:   fs(18),
                        color:      '#00ff99',
                        backgroundColor: '#003300',
                        padding:    { x: 4, y: 2 }
                    }).setOrigin(0.5).setDepth(3);
                }

                // Best score kecil di bawah tombol
                if (stats.bestCorrect > 0) {
                    this.add.text(pos.x, pos.y + 46, `${stats.bestCorrect}/5 ✓`, {
                        fontFamily: 'PixeloidMono',
                        fontSize:   fs(12),
                        color:      '#aaaaff'
                    }).setOrigin(0.5).setDepth(2);
                }

            } else {
                // ── LEVEL TERKUNCI ─────────────────────────────
                btn.setTint(0x333333);   // gelap

                // Ikon gembok
                this.add.text(pos.x, pos.y, '🔒', {
                    fontSize: fs(26)
                }).setOrigin(0.5).setDepth(3);
            }
        }

        // Tombol Back
        const btnBack = this.add.text(60, 50, '← Back', {
            fontFamily: 'PixeloidSans', fontSize: fs(18),
            backgroundColor: '#444', padding: { x: 10, y: 6 }
        }).setInteractive().setOrigin(0.5).setDepth(2);

        btnBack.on('pointerover',  () => btnBack.setStyle({ color: '#ffffff' }));
        btnBack.on('pointerout',   () => btnBack.setStyle({ color: '#cccccc' }));
        btnBack.on('pointerdown',  () => { this.scene.start('HomeScene'); });

        // Tombol Reset Progress (tersembunyi kecil di pojok)
        const btnReset = this.add.text(W - 20, H - 20, 'reset progress', {
            fontFamily: 'PixeloidSans', fontSize: fs(11), color: '#444444'
        }).setOrigin(1, 1).setInteractive().setDepth(2);

        btnReset.on('pointerover',  () => btnReset.setColor('#ff8888'));
        btnReset.on('pointerout',   () => btnReset.setColor('#444444'));
        btnReset.on('pointerdown',  () => {
            SaveManager.reset();
            this.scene.restart();
        });
    }
}