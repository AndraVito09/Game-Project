import { MuteManager } from '../MuteManager.js';
import { sceneTransitionTo } from '../SceneTransition.js';

export default class CreditScene extends Phaser.Scene {
    constructor() {
        super('CreditScene');
    }

    preload() {
        this.load.image('volumeon', 'assets/volumeon.png');
        this.load.image('mute',     'assets/mute.png');
    }

    create() {
        const W  = this.scale.width;
        const H  = this.scale.height;
        const cx = W / 2;
        const fs = (n) => `${Math.round(n * W / 800)}px`;

        // Terapkan state mute
        MuteManager.applyToScene(this);

        // ── Background gradien gelap ───────────────────────────
        const bg     = this.add.rectangle(cx, H / 2, W, H, 0x000000).setAlpha(0).setDepth(0);
        const bgGlow = this.add.rectangle(cx, H / 2, W, H, 0x0a0a1e).setAlpha(0).setDepth(1);

        // Bintang-bintang kecil random di background
        const starGraphics = this.add.graphics().setDepth(2).setAlpha(0);
        for (let i = 0; i < 120; i++) {
            const sx    = Phaser.Math.Between(0, W);
            const sy    = Phaser.Math.Between(0, H);
            const size  = Phaser.Math.FloatBetween(0.5, 2.2);
            const alpha = Phaser.Math.FloatBetween(0.3, 1.0);
            starGraphics.fillStyle(0xffffff, alpha);
            starGraphics.fillCircle(sx, sy, size);
        }

        // ── Fade in background ─────────────────────────────────
        this.tweens.add({
            targets:  [bg, bgGlow],
            alpha:    { from: 0, to: 1 },
            duration: 1200,
            ease:     'Power2'
        });
        this.tweens.add({
            targets:  starGraphics,
            alpha:    { from: 0, to: 0.6 },
            duration: 1800,
            ease:     'Power2'
        });

        // ── Konten kredit ──────────────────────────────────────
        const container = this.add.container(0, 0).setDepth(5);

        const addText = (y, text, style) => {
            const t = this.add.text(cx, y, text, style).setOrigin(0.5, 0);
            container.add(t);
            return t;
        };

        let y = 0;
        const lineH = H * 0.07;
        const bigH  = H * 0.10;

        addText(y, '✦ WORD ARRANGE GAME ✦', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(44),
            color:      '#FFD700'
        });
        y += bigH * 1.4;

        addText(y, 'Version 1.0', {
            fontFamily: 'PixeloidMono',
            fontSize:   fs(16),
            color:      '#888899'
        });
        y += lineH * 1.8;

        addText(y, '— Developer —', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(22),
            color:      '#aabbff'
        });
        y += lineH;

        [
            ['Game Designer', 'Bayu Dian Permadi'],
            ['programmer', 'Andravito Brilian Satrya'],
            ['Document', 'Kurnia Haikal'],
        ].forEach(([label, value]) => {
            addText(y, label, {
                fontFamily: 'PixeloidSans-Bold',
                fontSize:   fs(14),
                color:      '#888899'
            });
            y += lineH * 0.65;
            addText(y, value, {
                fontFamily: 'PixeloidMono',
                fontSize:   fs(18),
                color:      '#00FF99'
            });
            y += lineH * 1.1;
        });

        addText(y, '— Built With —', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(22),
            color:      '#aabbff'
        });
        y += lineH;

        [
            ['Game Engine',   'Phaser 3'],
            ['Language',      'JavaScript (ES6 Modules)'],
        ].forEach(([label, value]) => {
            addText(y, label, {
                fontFamily: 'PixeloidSans',
                fontSize:   fs(14),
                color:      '#888899'
            });
            y += lineH * 0.65;
            addText(y, value, {
                fontFamily: 'PixeloidMono',
                fontSize:   fs(18),
                color:      '#00FF99'
            });
            y += lineH * 1.1;
        });

        y += lineH * 0.5;

        addText(y, '— Font ─', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(22),
            color:      '#aabbff'
        });
        y += lineH;

        addText(y, 'PixeloidSans  PixeloidSans-Bold  PixeloidMono', {
            fontFamily: 'PixeloidSans',
            fontSize:   fs(18),
            color:      '#ffffff'
        });
        y += lineH * 0.8;

        addText(y, 'by GGBotNet — itch.io/ggbot', {
            fontFamily: 'PixeloidMono',
            fontSize:   fs(14),
            color:      '#888899'
        });
        y += lineH * 2.0;

        addText(y, '— Special Thanks —', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(22),
            color:      '#aabbff'
        });
        y += lineH;

        [
            'Semua yang sudah mencoba game ini',
            'Teman-teman yang sudah support',
            'Keluarga tercinta ♥',
        ].forEach(name => {
            addText(y, name, {
                fontFamily: 'PixeloidSans',
                fontSize:   fs(18),
                color:      '#ffffff'
            });
            y += lineH;
        });

        y += lineH;

        addText(y, '✦  ✦  ✦', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(20),
            color:      '#FFD700'
        });
        y += lineH * 1.2;

        addText(y, 'Terima kasih sudah bermain!', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(28),
            color:      '#FFD700'
        });
        y += lineH * 2.5;

        // ── Posisi awal container ──────────────────────────────
        const totalContentH  = y;
        const startY         = H;
        const endY           = -totalContentH;

        container.setY(startY);

        const scrollDuration = Math.max(totalContentH * 12, 12000);

        this.time.delayedCall(1000, () => {
            this.tweens.add({
                targets:  container,
                y:        endY,
                duration: scrollDuration,
                ease:     'Linear',
                onComplete: () => {
                    sceneTransitionTo(this, 'HomeScene');
                }
            });
        });

        // ── Tombol Skip ────────────────────────────────────────
        const skipBtn = this.add.text(W - 30, 30, '[ Skip ]', {
            fontFamily:      'PixeloidSans',
            fontSize:        fs(16),
            color:           '#666677',
            backgroundColor: '#111122',
            padding:         { x: 12, y: 7 }
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true }).setDepth(10).setAlpha(0);

        this.time.delayedCall(800, () => {
            this.tweens.add({ targets: skipBtn, alpha: 1, duration: 500 });
        });

        skipBtn.on('pointerover', () => skipBtn.setStyle({ color: '#ffffff', backgroundColor: '#333355' }));
        skipBtn.on('pointerout',  () => skipBtn.setStyle({ color: '#666677', backgroundColor: '#111122' }));
        skipBtn.on('pointerdown', () => {
            this.tweens.killAll();
            sceneTransitionTo(this, 'HomeScene');
        });

        // ── Tombol Mute ────────────────────────────────────────
        this._buildMuteButton(W);

        // ── Mask agar teks tidak terlihat di luar layar ────────
        const maskShape = this.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(0, 0, W, H);
        const mask = maskShape.createGeometryMask();
        container.setMask(mask);
    }

    _buildMuteButton(W) {
        const isMuted = MuteManager.isMuted();
        const iconKey = isMuted ? 'mute' : 'volumeon';

        this.muteBtn = this.add.image(80, 80, iconKey)
            .setOrigin(0.5)
            .setScale(0.45)
            .setInteractive()
            .setDepth(100);

        this.muteBtn.on('pointerover', () => this.muteBtn.setScale(0.50));
        this.muteBtn.on('pointerout',  () => this.muteBtn.setScale(0.45));
        this.muteBtn.on('pointerdown', () => {
            const nowMuted = MuteManager.toggle();
            MuteManager.applyToScene(this);
            this.muteBtn.setTexture(nowMuted ? 'mute' : 'volumeon');
        });
    }
}
