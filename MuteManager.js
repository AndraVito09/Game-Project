/**
 * MuteManager — singleton untuk mengatur state mute musik.
 * State disimpan di localStorage agar persisten antar sesi.
 */

const MUTE_KEY = 'wg_mute';

export const MuteManager = {

    /** Apakah musik sedang di-mute? */
    isMuted() {
        return localStorage.getItem(MUTE_KEY) === '1';
    },

    /** Toggle mute/unmute, kembalikan state baru */
    toggle() {
        const next = !this.isMuted();
        localStorage.setItem(MUTE_KEY, next ? '1' : '0');
        return next;
    },

    /** Set mute secara eksplisit */
    setMuted(val) {
        localStorage.setItem(MUTE_KEY, val ? '1' : '0');
    },

    /**
     * Terapkan state mute ke semua sound aktif pada scene.
     * @param {Phaser.Scene} scene
     */
    applyToScene(scene) {
        scene.sound.mute = this.isMuted();
    }
};
