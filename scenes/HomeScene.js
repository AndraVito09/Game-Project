import { MuteManager } from '../MuteManager.js';
import { sceneTransitionTo, sceneFadeIn } from '../SceneTransition.js';

export default class HomeScene extends Phaser.Scene {
    constructor() {
        super('HomeScene');
    }

    preload(){
        this.load.image('bghome', 'assets/mainmenu.png');
        this.load.image('play', 'assets/play.png');
        this.load.image('credit', 'assets/credit.png');
                this.load.image('volumeon', 'assets/volumeon.png');
        this.load.image('mute', 'assets/mute.png');
        this.load.audio('bgm', 'assets/sound/bgsound.ogg');
    }

    create() {
        const existing = this.sound.get('bgm');
        if (existing) {
            this.music = existing;
            if (!this.music.isPlaying) {
                this.music.play();
            }
        } else {
            this.music = this.sound.add('bgm', { loop: true, volume: 0.5 });
            this.music.play();
        }

        MuteManager.applyToScene(this);

        this.add.image(1905/2 , 870/2, 'bghome');
        this.add.text(930.5, 200, 'WORD ARRANGE GAME', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize: '50px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);


        this.creditBtn = this.add.image(1800, 80,'credit').setOrigin(0.5).setInteractive().setScale(0.5);
        this.playBtn   = this.add.image(952.5, 670, 'play').setOrigin(0.5).setInteractive().setScale(0.7);

        // ── Tombol Mute ────────────────────────────────────────
        this._buildMuteButton();

        // ── Fade in saat scene dibuka ──────────────────────────
        sceneFadeIn(this, 400);

        // ── Events ─────────────────────────────────────────────

        this.creditBtn.on('pointerover', () => this.creditBtn.setScale(0.50));
        this.creditBtn.on('pointerout', () => this.creditBtn.setScale(0.45));
        this.creditBtn.on('pointerdown', () => this.creditBtn.setTint(0xdddddd).setScale(0.40));
        this.creditBtn.on('pointerup', () => {
            sceneTransitionTo(this, 'CreditScene');
        });

        this.playBtn.on('pointerover', () => this.playBtn.setScale(0.75));
        this.playBtn.on('pointerout', () => this.playBtn.setScale(0.70));
        this.playBtn.on('pointerdown', () => this.playBtn.setTint(0xdddddd).setScale(0.65));
        this.playBtn.on('pointerup', () => {
            sceneTransitionTo(this, 'LevelSelectScene');
        });
    }

    _buildMuteButton() {
        const isMuted  = MuteManager.isMuted();
        const iconKey  = isMuted ? 'mute' : 'volumeon';

        this.muteBtn = this.add.image(80, 80, iconKey)
            .setOrigin(0.5)
            .setScale(0.45)
            .setInteractive()
            .setDepth(100);

        // Efek hover
        this.muteBtn.on('pointerover', () => this.muteBtn.setScale(0.50));
        this.muteBtn.on('pointerout',  () => this.muteBtn.setScale(0.45));

        this.muteBtn.on('pointerdown', () => {
            const nowMuted = MuteManager.toggle();
            MuteManager.applyToScene(this);
            this.muteBtn.setTexture(nowMuted ? 'mute' : 'volumeon');
        });
    }
}
