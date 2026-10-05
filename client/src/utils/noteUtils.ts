const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export interface NotePayload {
    text: string;
    createdAt: number;
}

/**
 * Extracts the note text. Returns null if the note is empty or older than 24 hours.
 */
export const parseNoteText = (rawNote: string | null | undefined): string | null => {
    if (!rawNote) return null;
    try {
        const parsed = JSON.parse(rawNote);
        if (parsed && typeof parsed === "object" && typeof parsed.text === "string") {
            const createdAt = typeof parsed.createdAt === "number" ? parsed.createdAt : 0;
            if (createdAt > 0 && Date.now() - createdAt > TWENTY_FOUR_HOURS_MS) {
                return null; // Expired after 24 hours
            }
            return parsed.text;
        }
    } catch {
        // Plain string (backwards compatible)
        return rawNote;
    }
    return rawNote;
};

/**
 * Returns human-readable time remaining before 24h expiration (e.g. "23h left", "45m left").
 */
export const getNoteTimeRemaining = (rawNote: string | null | undefined): string | null => {
    if (!rawNote) return null;
    try {
        const parsed = JSON.parse(rawNote);
        if (parsed && typeof parsed === "object" && typeof parsed.createdAt === "number") {
            const elapsed = Date.now() - parsed.createdAt;
            const remainingMs = TWENTY_FOUR_HOURS_MS - elapsed;
            if (remainingMs <= 0) return null;
            const hours = Math.floor(remainingMs / (1000 * 60 * 60));
            if (hours >= 1) {
                return `${hours}h left`;
            }
            const minutes = Math.max(1, Math.floor(remainingMs / (1000 * 60)));
            return `${minutes}m left`;
        }
    } catch {
        return null;
    }
    return null;
};
