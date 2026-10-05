import React, { useState, useEffect } from "react";
import {
    X,
    Trash2,
    Send,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export interface NoteItem {
    id: number;
    name: string;
    avatar?: string | null;
    note?: string | null;
    conversationId?: number;
}

interface NoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    // If for current user (editing):
    isCurrentUser?: boolean;
    initialNote?: string | null;
    onSaveNote?: (note: string | null) => Promise<void> | void;
    // If viewing another user's note:
    user?: NoteItem | null;
    notesList?: NoteItem[];
    initialIndex?: number;
    onOpenConversation?: (conversationId: number) => void;
}

const MAX_WORDS = 250;

export const countWords = (text: string): number => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
};

export const NoteModal: React.FC<NoteModalProps> = ({
    isOpen,
    onClose,
    isCurrentUser = false,
    initialNote = null,
    onSaveNote,
    user,
    notesList = [],
    initialIndex = 0,
    onOpenConversation,
}) => {
    const [noteText, setNoteText] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeNoteIndex, setActiveNoteIndex] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setNoteText(initialNote || "");
            setError(null);
            setSaving(false);
            if (notesList.length > 0 && initialIndex >= 0 && initialIndex < notesList.length) {
                setActiveNoteIndex(initialIndex);
            } else {
                setActiveNoteIndex(0);
            }
        }
    }, [isOpen, initialNote, initialIndex, notesList]);

    if (!isOpen) return null;

    const words = countWords(noteText);
    const isOverLimit = words > MAX_WORDS;

    const handleSave = async () => {
        if (isOverLimit) {
            setError(`Note cannot exceed ${MAX_WORDS} words (currently ${words} words).`);
            return;
        }

        try {
            setSaving(true);
            setError(null);
            const trimmed = noteText.trim();
            if (onSaveNote) {
                await onSaveNote(trimmed.length > 0 ? trimmed : null);
            }
            onClose();
        } catch (err: any) {
            setError(err?.message || "Failed to save note. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setSaving(true);
            setError(null);
            if (onSaveNote) {
                await onSaveNote(null);
            }
            onClose();
        } catch (err: any) {
            setError(err?.message || "Failed to delete note. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // When viewing notes, determine active user
    const hasMultipleNotes = !isCurrentUser && notesList.length > 1;
    const currentViewUser =
        !isCurrentUser && notesList.length > 0
            ? notesList[activeNoteIndex] || user
            : user;

    const displayName = currentViewUser?.name || "You";
    const initials = displayName
        .split(" ")
        .map((w) => w.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const handlePrev = () => {
        if (activeNoteIndex > 0) {
            setActiveNoteIndex((prev) => prev - 1);
        }
    };

    const handleNext = () => {
        if (activeNoteIndex < notesList.length - 1) {
            setActiveNoteIndex((prev) => prev + 1);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Close"
                >
                    <X className="size-5" />
                </button>

                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/60 pb-4 pr-8">
                    <div className="flex items-center gap-3">
                        <Avatar className="size-12 border-2 border-primary/20 shadow-sm">
                            <AvatarImage src={currentViewUser?.avatar || undefined} alt={displayName} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-base font-semibold leading-none">{displayName}</h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {isCurrentUser
                                    ? "Share a thought visible to people you chat with"
                                    : "Shared note"}
                            </p>
                        </div>
                    </div>

                    {/* Note Counter when multiple notes */}
                    {hasMultipleNotes && (
                        <div className="rounded-full bg-foreground/10 px-2.5 py-0.5 text-xs font-semibold text-foreground">
                            {activeNoteIndex + 1} / {notesList.length}
                        </div>
                    )}
                </div>

                {/* Content */}
                {isCurrentUser ? (
                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-foreground">
                                Leave a Note (up to 250 words)
                            </label>
                            <div className="relative">
                                <textarea
                                    value={noteText}
                                    onChange={(e) => {
                                        setNoteText(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    placeholder="Share what's on your mind with people you have a conversation with..."
                                    rows={5}
                                    className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [scrollbar-color:var(--foreground)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-foreground/40 hover:[&::-webkit-scrollbar-thumb]:bg-foreground [&::-webkit-scrollbar-thumb]:rounded-full"
                                />
                            </div>

                            {/* Word counter */}
                            <div className="mt-1.5 flex items-center justify-between text-xs">
                                <span
                                    className={
                                        isOverLimit
                                            ? "font-medium text-destructive"
                                            : "text-muted-foreground"
                                    }
                                >
                                    {words} / {MAX_WORDS} words
                                </span>
                                {isOverLimit && (
                                    <span className="text-destructive font-medium">
                                        Exceeds 250 words limit
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Live Note Preview with White Text Background */}
                        {noteText.trim() && (
                            <div className="rounded-xl border border-border/80 bg-muted/40 p-3">
                                <span className="mb-2 block text-[11px] font-medium text-muted-foreground">
                                    Preview:
                                </span>
                                <div className="flex justify-center py-1">
                                    <div className="relative max-w-xs rounded-2xl border border-gray-200 bg-white px-3 py-2 text-center text-xs font-medium text-gray-900 shadow-sm">
                                        <p className="whitespace-pre-wrap">{noteText.trim()}</p>
                                        <div className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 border-b border-r border-gray-200 bg-white" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                                {error}
                            </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between gap-2 pt-2">
                            {initialNote ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDelete}
                                    disabled={saving}
                                    className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <Trash2 className="size-4" />
                                    Delete Note
                                </Button>
                            ) : (
                                <div />
                            )}

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                    disabled={saving}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={saving || isOverLimit}
                                    className="gap-1.5 shadow-sm"
                                >
                                    <Send className="size-3.5" />
                                    {saving ? "Saving..." : initialNote ? "Update" : "Share"}
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Viewing Another User's Note */
                    <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Note
                            </span>
                            {hasMultipleNotes && (
                                <span className="text-xs font-medium text-foreground">
                                    Slide to view more ({activeNoteIndex + 1} of {notesList.length})
                                </span>
                            )}
                        </div>

                        {/* Note Card with White Text Background and Foreground Color Slider/Scrollbar */}
                        <div className="relative">
                            <div className="max-h-56 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4.5 text-sm font-medium leading-relaxed text-gray-900 shadow-sm [scrollbar-color:var(--foreground)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-foreground/40 hover:[&::-webkit-scrollbar-thumb]:bg-foreground [&::-webkit-scrollbar-thumb]:rounded-full">
                                <p className="whitespace-pre-wrap">
                                    {currentViewUser?.note || "No note shared."}
                                </p>
                            </div>
                        </div>

                        {/* Clickable Slider Controls for Viewing Notes */}
                        {hasMultipleNotes && (
                            <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                                <button
                                    type="button"
                                    onClick={handlePrev}
                                    disabled={activeNoteIndex === 0}
                                    className="flex size-7 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-xs transition-all hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
                                    aria-label="Previous note"
                                >
                                    <ChevronLeft className="size-4" />
                                </button>

                                <div className="flex items-center gap-1.5">
                                    {notesList.map((_, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setActiveNoteIndex(idx)}
                                            className={`size-2 rounded-full transition-all cursor-pointer ${
                                                idx === activeNoteIndex
                                                    ? "w-4 bg-foreground"
                                                    : "bg-foreground/30 hover:bg-foreground/60"
                                            }`}
                                            aria-label={`Go to note ${idx + 1}`}
                                        />
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={activeNoteIndex === notesList.length - 1}
                                    className="flex size-7 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-xs transition-all hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
                                    aria-label="Next note"
                                >
                                    <ChevronRight className="size-4" />
                                </button>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onClose}
                            >
                                Close
                            </Button>
                            {currentViewUser?.conversationId && onOpenConversation && (
                                <Button
                                    type="button"
                                    size="sm"
                                    className="gap-1.5"
                                    onClick={() => {
                                        onOpenConversation(currentViewUser.conversationId!);
                                        onClose();
                                    }}
                                >
                                    <MessageSquare className="size-4" />
                                    Message {displayName.split(" ")[0]}
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoteModal;
