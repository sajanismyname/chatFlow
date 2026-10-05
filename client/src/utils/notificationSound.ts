/**
 * Notification Sound Service
 * 
 * Provides crisp, high-quality audio notifications using the Web Audio API
 * with automatic fallback and browser autoplay-policy management.
 */

const STORAGE_KEY = "chatflow_sound_enabled";

let audioContext: AudioContext | null = null;

// Initialize or retrieve the global AudioContext
function getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") {
        return null;
    }

    if (!audioContext) {
        const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
                .webkitAudioContext;

        if (AudioContextClass) {
            audioContext = new AudioContextClass();
        }
    }

    return audioContext;
}

/**
 * Resumes AudioContext on user interaction to comply with browser autoplay policies.
 */
export function unlockAudioContext(): void {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => {
            // Browser policy may still block if not from direct gesture
        });
    }
}

// Attach user gesture listeners once on client load
if (typeof window !== "undefined") {
    const handleGesture = () => {
        unlockAudioContext();
    };

    window.addEventListener("pointerdown", handleGesture, { passive: true });
    window.addEventListener("keydown", handleGesture, { passive: true });
}

/**
 * Check if sound notifications are enabled (default: true).
 */
export function isSoundNotificationEnabled(): boolean {
    if (typeof window === "undefined") {
        return true;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === null ? true : saved === "true";
}

/**
 * Set sound notification state.
 */
export function setSoundNotificationEnabled(enabled: boolean): void {
    if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, String(enabled));
    }
}

/**
 * Plays a pleasant, modern two-tone message notification chime.
 * Tone 1: E5 (659.25 Hz)
 * Tone 2: A5 (880.00 Hz)
 */
export function playNotificationSound(): void {
    if (!isSoundNotificationEnabled()) {
        return;
    }

    try {
        const ctx = getAudioContext();
        if (!ctx) {
            playFallbackTone();
            return;
        }

        if (ctx.state === "suspended") {
            ctx.resume().then(() => {
                synthesizeChime(ctx);
            }).catch(() => {
                playFallbackTone();
            });
            return;
        }

        synthesizeChime(ctx);
    } catch (err) {
        console.warn("Failed to play notification sound via AudioContext:", err);
        playFallbackTone();
    }
}

/**
 * Synthesizes a clean two-tone chime via Web Audio API nodes.
 */
function synthesizeChime(ctx: AudioContext): void {
    const startTime = ctx.currentTime;

    // Master volume node
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.22, startTime);
    masterGain.connect(ctx.destination);

    // --- First Tone: E5 (659.25 Hz) ---
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, startTime);

    gain1.gain.setValueAtTime(0, startTime);
    gain1.gain.linearRampToValueAtTime(0.7, startTime + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

    osc1.connect(gain1);
    gain1.connect(masterGain);

    osc1.start(startTime);
    osc1.stop(startTime + 0.28);

    // --- Second Tone: A5 (880 Hz) harmonic chime ---
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    const secondToneStart = startTime + 0.08;

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.00, secondToneStart);

    gain2.gain.setValueAtTime(0, secondToneStart);
    gain2.gain.linearRampToValueAtTime(0.9, secondToneStart + 0.015);
    gain2.gain.exponentialRampToValueAtTime(0.001, secondToneStart + 0.42);

    osc2.connect(gain2);
    gain2.connect(masterGain);

    osc2.start(secondToneStart);
    osc2.stop(secondToneStart + 0.42);
}

/**
 * Fallback tone generator using an in-memory synthesized WAV Data URI
 * for environments where AudioContext might be unavailable or restricted.
 */
function playFallbackTone(): void {
    try {
        if (typeof window === "undefined") return;

        // Generate tiny 16-bit mono 44.1kHz WAV chime
        const sampleRate = 22050;
        const duration = 0.35;
        const numSamples = Math.floor(sampleRate * duration);
        const buffer = new ArrayBuffer(44 + numSamples * 2);
        const view = new DataView(buffer);

        // RIFF chunk
        writeString(view, 0, "RIFF");
        view.setUint32(4, 36 + numSamples * 2, true);
        writeString(view, 8, "WAVE");

        // fmt subchunk
        writeString(view, 12, "fmt ");
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // PCM
        view.setUint16(22, 1, true); // mono
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true); // block align
        view.setUint16(34, 16, true); // bits per sample

        // data subchunk
        writeString(view, 36, "data");
        view.setUint32(40, numSamples * 2, true);

        // Synthesize audio samples: E5 (659Hz) into A5 (880Hz)
        let offset = 44;
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            let sample = 0;

            if (t < 0.25) {
                const env1 = Math.exp(-t * 12);
                sample += Math.sin(2 * Math.PI * 659.25 * t) * env1 * 0.4;
            }

            if (t >= 0.08) {
                const t2 = t - 0.08;
                const env2 = Math.exp(-t2 * 9);
                sample += Math.sin(2 * Math.PI * 880 * t2) * env2 * 0.6;
            }

            const clamped = Math.max(-1, Math.min(1, sample));
            const int16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
            view.setInt16(offset, int16, true);
            offset += 2;
        }

        const blob = new Blob([buffer], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.volume = 0.25;
        audio.play().finally(() => {
            setTimeout(() => URL.revokeObjectURL(url), 2000);
        });
    } catch {
        // Silent catch if autoplay blocked
    }
}

function writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}
