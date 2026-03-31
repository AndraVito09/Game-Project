/**
 * SaveManager — sistem save/load progress via localStorage.
 * Dilindungi dengan enkripsi XOR + Base64 + checksum validasi.
 */

const SAVE_KEY    = 'wg_d';        // key disamarkan
const MIN_CORRECT = 3;
const MAX_LEVEL   = 10;
const SECRET_KEY  = 'mi0-w0rdg4me-s3cr3t-2025'; // ganti sesukamu

// ── Enkripsi XOR + Base64 ─────────────────────────────────────
function encrypt(data) {
    const str = JSON.stringify(data);
    let result = '';
    for (let i = 0; i < str.length; i++) {
        result += String.fromCharCode(
            str.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length)
        );
    }
    return btoa(unescape(encodeURIComponent(result)));
}

function decrypt(encoded) {
    try {
        const str = decodeURIComponent(escape(atob(encoded)));
        let result = '';
        for (let i = 0; i < str.length; i++) {
            result += String.fromCharCode(
                str.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length)
            );
        }
        return JSON.parse(result);
    } catch (_) {
        return null;
    }
}

// ── Checksum untuk deteksi manipulasi manual ──────────────────
function generateChecksum(data) {
    const str = JSON.stringify(data);
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash |= 0; // convert to 32bit int
    }
    return (hash >>> 0).toString(36);
}

export const SaveManager = {

    /** Ambil seluruh data save. Selalu kembalikan objek valid. */
    load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return this._defaultSave();

            const parsed = decrypt(raw);

            // Gagal decrypt → data korup atau dimanipulasi
            if (!parsed) {
                this._handleTampered();
                return this._defaultSave();
            }

            // Pisahkan checksum dari data
            const { _cs, ...data } = parsed;

            // Validasi checksum
            if (_cs !== generateChecksum(data)) {
                this._handleTampered();
                return this._defaultSave();
            }

            return data;
        } catch (_) {
            return this._defaultSave();
        }
    },

    /** Simpan objek save ke localStorage dengan enkripsi. */
    save(data) {
        try {
            const checksum = generateChecksum(data);
            const payload  = { ...data, _cs: checksum };
            localStorage.setItem(SAVE_KEY, encrypt(payload));
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

    /** Data default jika save kosong. */
    _defaultSave() {
        return { unlockedLevel: 1, levelStats: {} };
    },

    /** Tangani data yang dimanipulasi. */
    _handleTampered() {
        // Hapus data korup
        localStorage.removeItem(SAVE_KEY);

        // Tampilkan peringatan
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: #0d0d1a;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            font-family: monospace;
            text-align: center;
        `;
        overlay.innerHTML = `
            <div style="font-size:64px">⚠️</div>
            <div style="font-size:24px;color:#FF4444;margin-top:16px">Data Terdeteksi Dimanipulasi</div>
            <div style="font-size:14px;color:#aaa;margin-top:12px;line-height:1.8">
                Progress kamu telah direset karena terdeteksi<br>
                adanya modifikasi data yang tidak sah.
            </div>
            <button onclick="location.reload()" style="
                margin-top:28px;
                padding:10px 28px;
                background:#1e3a2e;
                color:#00FF99;
                border:2px solid #00FF99;
                font-family:monospace;
                font-size:14px;
                cursor:pointer;
                border-radius:4px;
            ">Main Ulang</button>
        `;
        document.body.appendChild(overlay);
    }
};