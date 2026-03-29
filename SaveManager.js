/**
 * SaveManager — sistem save/load progress via localStorage.
 *
 * Struktur data yang disimpan:
 * {
 *   unlockedLevel: 3,
 *   levelStats: {
 *     "1": { bestScore: 80, bestCorrect: 4, completed: true },
 *     ...
 *   }
 * }
 *
 * Aturan unlock:
 *   - Level 1 selalu terbuka.
 *   - Level N+1 terbuka bila level N selesai dengan correct >= MIN_CORRECT (3).
 */

const SAVE_KEY    = 'wordgame_save';
const MIN_CORRECT = 3;   // minimal soal benar untuk unlock level berikutnya
const MAX_LEVEL   = 10;

export const SaveManager = {

    /** Ambil seluruh data save. Selalu kembalikan objek valid. */
    load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (_) {}
        return this._defaultSave();
    },

    /** Simpan objek save ke localStorage. */
    save(data) {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        } catch (_) {}
    },

    /** Hapus semua progress. */
    reset() {
        localStorage.removeItem(SAVE_KEY);
    },

    /**
     * Catat hasil level yang baru selesai.
     * @param {number} level   - nomor level
     * @param {number} score   - skor akhir
     * @param {number} correct - jumlah soal benar
     */
    recordLevelResult(level, score, correct) {
        const data   = this.load();
        const key    = String(level);
        const prev   = data.levelStats[key] || { bestScore: 0, bestCorrect: 0, completed: false };
        const passed = correct >= MIN_CORRECT;

        data.levelStats[key] = {
            bestScore:   Math.max(prev.bestScore, score),
            bestCorrect: Math.max(prev.bestCorrect, correct),
            completed:   prev.completed || passed
        };

        // Unlock level berikutnya jika lulus
        if (passed && level < MAX_LEVEL) {
            data.unlockedLevel = Math.max(data.unlockedLevel, level + 1);
        }

        this.save(data);
        return { passed };
    },

    /** Apakah level N boleh dimainkan? */
    isUnlocked(level) {
        if (level === 1) return true;
        return level <= this.load().unlockedLevel;
    },

    /** Stats sebuah level. */
    getLevelStats(level) {
        const data = this.load();
        return data.levelStats[String(level)] || { bestScore: 0, bestCorrect: 0, completed: false };
    },

    _defaultSave() {
        return { unlockedLevel: 1, levelStats: {} };
    }
};