/**
 * SceneTransition — helper untuk animasi fade smooth antar scene.
 *
 * Cara pakai:
 *   import { sceneTransitionTo } from '../SceneTransition.js';
 *   sceneTransitionTo(this, 'LevelSelectScene', { ... data ... });
 */

/**
 * Fade-out scene saat ini, lalu pindah ke targetScene.
 * @param {Phaser.Scene} scene       - scene yang sedang aktif (this)
 * @param {string}       targetScene - key scene tujuan
 * @param {object}       [data={}]   - data yang dikirim ke scene tujuan
 * @param {number}       [duration=400] - durasi fade in+out dalam ms
 */
export function sceneTransitionTo(scene, targetScene, data = {}, duration = 400) {
    // Blokir input selama transisi
    scene.input.enabled = false;

    // Overlay hitam untuk fade-out
    const overlay = scene.add.rectangle(
        scene.scale.width / 2,
        scene.scale.height / 2,
        scene.scale.width,
        scene.scale.height,
        0x000000
    ).setAlpha(0).setDepth(9999);

    scene.tweens.add({
        targets:  overlay,
        alpha:    1,
        duration: duration,
        ease:     'Power2',
        onComplete: () => {
            scene.scene.start(targetScene, data);
        }
    });
}

/**
 * Tambahkan efek fade-in saat scene baru dibuka.
 * Panggil di awal create() scene tujuan.
 * @param {Phaser.Scene} scene
 * @param {number}       [duration=400]
 */
export function sceneFadeIn(scene, duration = 400) {
    const overlay = scene.add.rectangle(
        scene.scale.width / 2,
        scene.scale.height / 2,
        scene.scale.width,
        scene.scale.height,
        0x000000
    ).setAlpha(1).setDepth(9999);

    scene.tweens.add({
        targets:  overlay,
        alpha:    0,
        duration: duration,
        ease:     'Power2',
        onComplete: () => {
            overlay.destroy();
        }
    });
}
