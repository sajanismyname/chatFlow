import { useState, useMemo, useRef } from "react";

import {
    useAppDispatch,
    useAppSelector,
} from "../app/hooks";

import type {
    Conversation,
} from "../features/conversation/conversationTypes";

import {
    createConversation,
} from "../features/conversation/conversationSlice";

import type {
    SidebarProps,
} from "../features/types/sidebarType";

import ConversationItem from "./ConversationItem";
import UserSearch from "./UserSearch";

import {
    setActiveConversation,
    clearNewlyArrivedHighlight,
} from "../features/chat/chatSlice";

import {
    Search,
    Plus,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";

import {
    Button,
} from "@/components/ui/button";

import {
    Input,
} from "@/components/ui/input";

import { Tooltip } from "@base-ui/react/tooltip";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import api from "../api/axios";
import { socket } from "../socket/socket";
import { updateCurrentUserNote } from "../features/auth/authSlice";
import NoteModal from "./NoteModal";


function Sidebar({
    conversations,
    selectedConversation,
    onSelectConversation,
}: SidebarProps) {

    const [search, setSearch] =
        useState("");

    const [showUserSearch, setShowUserSearch] =
        useState(false);


    const dispatch =
        useAppDispatch();


    const currentUser =
        useAppSelector(
            (state) =>
                state.auth.user
        );


    const onlineUsers =
        useAppSelector(
            (state) =>
                state.chat.onlineUsers
        );


    const typingUsers =
        useAppSelector(
            (state) =>
                state.chat.typingUsers
        );


    const activeConversationId =
        useAppSelector(
            (state) =>
                state.chat.activeConversationId
        );

    const unreadCounts =
        useAppSelector(
            (state) =>
                state.chat.unreadCounts ?? {}
        );

    const newlyArrivedConversationId =
        useAppSelector(
            (state) =>
                state.chat.newlyArrivedConversationId
        );


    /* =========================
       OTHER MEMBER
    ========================= */

    const getOtherMember = (
        conversation: Conversation
    ) => {

        return conversation.members.find(
            (member) =>
                member.user.id !==
                currentUser?.id
        );
    };


    /* =========================
       SEARCH
    ========================= */

    const filteredConversations =
        conversations.filter(
            (conversation) => {

                const otherMember =
                    getOtherMember(
                        conversation
                    );


                const name =
                    (
                        otherMember?.nickname ||
                        otherMember?.user.name ||
                        ""
                    ).toLowerCase();


                return name.includes(
                    search.toLowerCase()
                );
            }
        );

    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [isEditingMyNote, setIsEditingMyNote] = useState(false);
    const [activeNoteIndex, setActiveNoteIndex] = useState(0);
    const [selectedUserForNote, setSelectedUserForNote] = useState<{
        id: number;
        name: string;
        avatar?: string | null;
        note?: string | null;
        conversationId?: number;
    } | null>(null);

    const profilesScrollRef = useRef<HTMLDivElement>(null);

    const myProfile = useMemo(() => {
        if (!currentUser) return null;
        const displayName = currentUser.name || "You";
        const initials = displayName
            .split(" ")
            .map((w) => w.charAt(0))
            .join("")
            .slice(0, 2)
            .toUpperCase();

        return {
            id: currentUser.id,
            name: "Your note",
            fullName: displayName,
            avatar: currentUser.avatar ?? null,
            initials,
            note: currentUser.note ?? null,
        };
    }, [currentUser]);

    const connectionProfiles = useMemo(() => {
        const profiles: Array<{
            id: number;
            name: string;
            fullName: string;
            avatar: string | null;
            initials: string;
            isOnline: boolean;
            note: string | null;
            conversationId: number;
            incomingMessage: string | null;
            isIncomingUnread: boolean;
            isNewlyArrived: boolean;
        }> = [];
        const seenIds = new Set<number>();

        conversations.forEach((conversation) => {
            const otherMember = getOtherMember(conversation);
            const otherUser = otherMember?.user;

            if (otherUser && !seenIds.has(otherUser.id)) {
                seenIds.add(otherUser.id);

                const displayName =
                    otherMember?.nickname || otherUser.name || "Unknown user";
                const initials = displayName
                    .split(" ")
                    .map((word) => word.charAt(0))
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                const isOnline = onlineUsers.includes(otherUser.id);

                const lastMsg = conversation.lastMessage;
                const isFromOtherUser =
                    Boolean(lastMsg && otherUser && lastMsg.sender?.id === otherUser.id);
                const incomingMessage = isFromOtherUser && lastMsg ? lastMsg.content : null;
                const isIncomingUnread =
                    Boolean(isFromOtherUser && (unreadCounts[conversation.id] || 0) > 0);
                const isNewlyArrived =
                    newlyArrivedConversationId === conversation.id;

                profiles.push({
                    id: otherUser.id,
                    name: displayName.split(" ")[0],
                    fullName: displayName,
                    avatar: otherUser.avatar ?? null,
                    initials,
                    isOnline,
                    note: otherUser.note ?? null,
                    conversationId: conversation.id,
                    incomingMessage,
                    isIncomingUnread,
                    isNewlyArrived,
                });
            }
        });

        // Sort: online users with incoming messages first, then profiles with note, then online users, then others
        profiles.sort((a, b) => {
            const aHasLive = a.isOnline && (a.isNewlyArrived || a.isIncomingUnread || !!a.incomingMessage);
            const bHasLive = b.isOnline && (b.isNewlyArrived || b.isIncomingUnread || !!b.incomingMessage);
            if (aHasLive && !bHasLive) return -1;
            if (!aHasLive && bHasLive) return 1;

            if (a.note && !b.note) return -1;
            if (!a.note && b.note) return 1;
            if (a.isOnline && !b.isOnline) return -1;
            if (!a.isOnline && b.isOnline) return 1;
            return 0;
        });

        return profiles;
    }, [conversations, onlineUsers, getOtherMember, unreadCounts, newlyArrivedConversationId]);

    const profilesWithNotes = useMemo(() => {
        return connectionProfiles
            .filter((p) => !!p.note)
            .map((p) => ({
                id: p.id,
                name: p.fullName,
                avatar: p.avatar,
                note: p.note,
                conversationId: p.conversationId,
            }));
    }, [connectionProfiles]);

    const liveNewlyArrivedConv = useMemo(() => {
        if (!newlyArrivedConversationId) return null;
        const conv = conversations.find((c) => c.id === newlyArrivedConversationId);
        if (!conv) return null;
        const otherMember = getOtherMember(conv);
        if (!otherMember) return null;
        const isOnline = onlineUsers.includes(otherMember.user.id);
        const isIncoming = conv.lastMessage?.sender?.id === otherMember.user.id;
        if (!isOnline || !isIncoming) return null;

        return {
            conversation: conv,
            otherUser: otherMember.user,
            displayName: otherMember.nickname || otherMember.user.name || "User",
            messageContent: conv.lastMessage?.content || "New message",
        };
    }, [newlyArrivedConversationId, conversations, onlineUsers, getOtherMember]);

    const handleSlideLeft = () => {
        profilesScrollRef.current?.scrollBy({ left: -160, behavior: "smooth" });
    };

    const handleSlideRight = () => {
        profilesScrollRef.current?.scrollBy({ left: 160, behavior: "smooth" });
    };

    const handleOpenMyNoteModal = () => {
        setIsEditingMyNote(true);
        setSelectedUserForNote({
            id: currentUser?.id || 0,
            name: currentUser?.name || "You",
            avatar: currentUser?.avatar,
            note: currentUser?.note,
        });
        setNoteModalOpen(true);
    };

    const handleOpenOtherUserNoteModal = (
        profile: {
            id: number;
            fullName: string;
            avatar: string | null;
            note: string | null;
            conversationId: number;
        },
        e: React.MouseEvent
    ) => {
        e.stopPropagation();
        setIsEditingMyNote(false);
        const index = profilesWithNotes.findIndex((p) => p.id === profile.id);
        setActiveNoteIndex(index >= 0 ? index : 0);
        setSelectedUserForNote({
            id: profile.id,
            name: profile.fullName,
            avatar: profile.avatar,
            note: profile.note,
            conversationId: profile.conversationId,
        });
        setNoteModalOpen(true);
    };

    const handleSaveMyNote = async (note: string | null) => {
        try {
            socket.emit("update_note", note);
            await api.patch("/auth/myProfile", { note });
            dispatch(updateCurrentUserNote(note));
        } catch (error) {
            console.error("Failed to update note:", error);
            throw error;
        }
    };


    /* =========================
       SELECT USER
    ========================= */

    const handleSelectUser =
        async (
            userId: number
        ) => {

            try {

                const conversation =
                    await dispatch(
                        createConversation(
                            userId
                        )
                    ).unwrap();


                setShowUserSearch(
                    false
                );


                dispatch(
                    setActiveConversation(
                        conversation.id
                    )
                );


                onSelectConversation(
                    conversation.id
                );

            } catch (error) {

                console.error(
                    "Failed to create conversation:",
                    error
                );
            }
        };


    /* =========================
       SELECT CONVERSATION
    ========================= */

    const handleSelectConversation =
        (
            conversationId: number
        ) => {

            onSelectConversation(
                conversationId
            );
        };


    return (
        <aside
            className="
                flex
                h-full
                min-h-0
                w-full
                shrink-0
                flex-col
                overflow-hidden
                border-r
                bg-background
            "
        >

            {/* HEADER */}

            <div
                className="
                    shrink-0
                    border-b
                    bg-background
                    px-3
                    py-3
                    sm:px-4
                    sm:py-4
                "
            >

                <div className="flex items-center justify-between gap-3">

                    <div className="min-w-0">

                        <h2 className="truncate text-base font-semibold tracking-tight sm:text-lg">
                            Conversations
                        </h2>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Your messages
                        </p>

                    </div>


                    <Tooltip.Root>
                        <Tooltip.Trigger
                            render={
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-9 shrink-0 rounded-full shadow-sm"
                                onClick={() => setShowUserSearch(true)}
                                aria-label="New conversation"
                            >
                                <Plus className="size-4" />
                            </Button>
                            }
                        />
                        <Tooltip.Portal>
                            <Tooltip.Positioner>
                            {/* ⚡️ Updated Tailwind classes on the Popup component */}
                            <Tooltip.Popup className="bg-white border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded shadow-sm">
                                New conversation
                            </Tooltip.Popup>
                            </Tooltip.Positioner>
                        </Tooltip.Portal>
                    </Tooltip.Root>


                </div>


                {/* SEARCH */}

                <div className="relative mt-3 sm:mt-4">

                    <Search
                        className="
                            pointer-events-none
                            absolute
                            left-3
                            top-1/2
                            size-4
                            -translate-y-1/2
                            text-muted-foreground
                        "
                    />


                    <Input
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search conversations..."
                        className="
                            h-10
                            rounded-xl
                            border-border/70
                            bg-muted/30
                            pl-9
                            pr-9
                            shadow-none
                            focus-visible:bg-background
                        "
                    />


                    {search && (

                        <button
                            type="button"
                            onClick={() =>
                                setSearch("")
                            }
                            className="
                                absolute
                                right-3
                                top-1/2
                                -translate-y-1/2
                                text-sm
                                text-muted-foreground
                                transition-colors
                                hover:text-foreground
                            "
                            aria-label="Clear search"
                        >
                            ×
                        </button>

                    )}

                </div>

            </div>


            {/* PROFILES & NOTES ROW WITH CLICKABLE SLIDER CONTROLS */}

            {myProfile && (
                <div className="relative group/tray shrink-0 border-b border-border/50 px-2 pt-2.5 pb-1 sm:px-3 bg-background">
                    {/* Left Clickable Slider Button */}
                    <button
                        type="button"
                        onClick={handleSlideLeft}
                        className="absolute left-1 top-[60%] -translate-y-1/2 z-20 flex size-7 items-center justify-center rounded-full border border-border bg-background/95 text-foreground shadow-md transition-all hover:bg-foreground hover:text-background opacity-70 group-hover/tray:opacity-100 hover:scale-105 cursor-pointer"
                        aria-label="Slide left"
                    >
                        <ChevronLeft className="size-4" />
                    </button>

                    {/* Right Clickable Slider Button */}
                    <button
                        type="button"
                        onClick={handleSlideRight}
                        className="absolute right-1 top-[60%] -translate-y-1/2 z-20 flex size-7 items-center justify-center rounded-full border border-border bg-background/95 text-foreground shadow-md transition-all hover:bg-foreground hover:text-background opacity-70 group-hover/tray:opacity-100 hover:scale-105 cursor-pointer"
                        aria-label="Slide right"
                    >
                        <ChevronRight className="size-4" />
                    </button>

                    <div
                        ref={profilesScrollRef}
                        className="flex items-end gap-3 overflow-x-auto pb-1 pt-0.5 px-2 scroll-smooth [&::-webkit-scrollbar]:hidden"
                        style={{ scrollbarWidth: "none" }}
                    >
                        {/* 1. MY OWN AVATAR AT FIRST */}
                        <div className="flex flex-col items-center shrink-0 w-19">
                            {/* Note Bubble Slot (Fixed height for alignment) */}
                            <div className="h-10 flex items-end justify-center mb-1 w-full">
                                {myProfile.note ? (
                                    <button
                                        type="button"
                                        onClick={handleOpenMyNoteModal}
                                        className="group/note relative max-w-19 cursor-pointer rounded-2xl border border-gray-200/90 bg-white px-2 py-0.5 text-center text-[10px] font-medium leading-tight text-gray-900 shadow-sm transition-transform hover:scale-105"
                                        title="Click to edit your note"
                                    >
                                        <p className="line-clamp-2 wrap-break-word">
                                            {myProfile.note}
                                        </p>
                                        <div className="absolute -bottom-1 left-1/2 size-1.5 -translate-x-1/2 rotate-45 border-b border-r border-gray-200/90 bg-white" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleOpenMyNoteModal}
                                        className="relative flex items-center gap-0.5 rounded-2xl border border-dashed border-gray-300 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600 shadow-sm transition-all hover:border-primary hover:text-primary hover:scale-105"
                                        title="Share a note"
                                    >
                                        <Plus className="size-2.5" />
                                        <span>Note</span>
                                        <div className="absolute -bottom-1 left-1/2 size-1.5 -translate-x-1/2 rotate-45 border-b border-r border-gray-300 bg-white" />
                                    </button>
                                )}
                            </div>

                            {/* Avatar */}
                            <div
                                className="relative cursor-pointer transition-transform hover:scale-105"
                                onClick={handleOpenMyNoteModal}
                                title="Your profile - click to leave or edit note"
                            >
                                <Avatar className="size-12 border-2 border-primary/40 shadow-sm">
                                    <AvatarImage
                                        src={myProfile.avatar || undefined}
                                        alt={myProfile.fullName}
                                    />
                                    <AvatarFallback>{myProfile.initials}</AvatarFallback>
                                </Avatar>
                                {!myProfile.note && (
                                    <span className="absolute bottom-0 right-0 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                                        <Plus className="size-2.5" />
                                    </span>
                                )}
                            </div>

                            <span className="mt-1 text-[11px] truncate w-full text-center font-medium text-muted-foreground">
                                Your note
                            </span>
                        </div>

                        {/* 2. OTHER PROFILES WHOM I HAD CONVERSATION WITH */}
                        {connectionProfiles.map((user) => (
                            <div
                                key={user.id}
                                className="flex flex-col items-center shrink-0 w-19"
                            >
                                {/* Incoming Message or Note Bubble Slot */}
                                <div className="h-10 flex items-end justify-center mb-1 w-full">
                                    {/* LIVE INCOMING MESSAGE BUBBLE WHEN OTHER USER IS ONLINE */}
                                    {user.isOnline && user.incomingMessage ? (
                                        <button
                                            type="button"
                                            onClick={() => handleSelectConversation(user.conversationId)}
                                            className={`group/incoming-bubble relative max-w-19 cursor-pointer rounded-2xl border px-2 py-0.5 text-center text-[10px] font-semibold leading-tight shadow-md transition-all hover:scale-105 ${
                                                user.isNewlyArrived
                                                    ? "animate-message-arrival"
                                                    : ""
                                            } ${
                                                user.isIncomingUnread
                                                    ? "border-black bg-white text-black ring-1 ring-black/20 dark:border-emerald-500 dark:bg-neutral-900 dark:text-emerald-400 dark:ring-1 dark:ring-emerald-500/40 dark:shadow-emerald-500/25"
                                                    : "border-gray-200 bg-white text-gray-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                                            }`}
                                            title={`Live message from ${user.fullName}: "${user.incomingMessage}"`}
                                        >
                                            <p className="line-clamp-2 wrap-break-word">
                                                {user.incomingMessage}
                                            </p>
                                            <div
                                                className={`absolute -bottom-1 left-1/2 size-1.5 -translate-x-1/2 rotate-45 border-b border-r ${
                                                    user.isIncomingUnread
                                                        ? "border-black bg-white dark:border-emerald-500 dark:bg-neutral-900"
                                                        : "border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
                                                }`}
                                            />
                                        </button>
                                    ) : user.note ? (
                                        <button
                                            type="button"
                                            onClick={(e) => handleOpenOtherUserNoteModal(user, e)}
                                            className="group/note relative max-w-19 cursor-pointer rounded-2xl border border-gray-200/90 bg-white px-2 py-0.5 text-center text-[10px] font-medium leading-tight text-gray-900 shadow-sm transition-transform hover:scale-105 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                                            title="Click to view full note"
                                        >
                                            <p className="line-clamp-2 wrap-break-word">
                                                {user.note}
                                            </p>
                                            <div className="absolute -bottom-1 left-1/2 size-1.5 -translate-x-1/2 rotate-45 border-b border-r border-gray-200/90 bg-white dark:border-neutral-700 dark:bg-neutral-900" />
                                        </button>
                                    ) : null}
                                </div>

                                {/* Avatar */}
                                <button
                                    type="button"
                                    onClick={() => handleSelectConversation(user.conversationId)}
                                    className="relative transition-transform hover:scale-105 focus:outline-none"
                                    title={`Chat with ${user.fullName}`}
                                >
                                    {((unreadCounts[user.conversationId] || 0) > 0) && (
                                        <span className="absolute -top-1 -right-1 z-10 size-3.5 rounded-full bg-black ring-2 ring-background shadow-sm dark:bg-emerald-500 animate-pulse" />
                                    )}
                                    <Avatar
                                        className={`size-12 shadow-sm border-2 ${
                                            (unreadCounts[user.conversationId] || 0) > 0
                                                ? "border-black ring-2 ring-black/20 dark:border-emerald-500 dark:ring-emerald-500/40"
                                                : user.isOnline
                                                    ? "border-emerald-500"
                                                    : "border-border"
                                        }`}
                                    >
                                        <AvatarImage
                                            src={user.avatar || undefined}
                                            alt={user.fullName}
                                        />
                                        <AvatarFallback>{user.initials}</AvatarFallback>
                                    </Avatar>
                                    {user.isOnline && (
                                        <span className="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-background bg-emerald-500" />
                                    )}
                                </button>

                                <span className="mt-1 text-[11px] truncate w-full text-center font-medium">
                                    {user.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {/* CONVERSATIONS */}

            <div
                className="
                    min-h-0
                    flex-1
                    overflow-y-auto
                    overscroll-contain
                    px-2
                    py-2
                    sm:px-3
                    sm:py-3
                "
            >

                {/* LIVE INCOMING MESSAGE BUBBLE WHEN THE OTHER USER IS ONLINE */}
                {liveNewlyArrivedConv && (
                    <div className="mb-2 shrink-0">
                        <div className="relative flex items-center justify-between gap-2.5 rounded-2xl border-2 border-black bg-white p-2.5 shadow-lg transition-all dark:border-emerald-500 dark:bg-neutral-900 animate-message-arrival">
                            <button
                                type="button"
                                onClick={() => handleSelectConversation(liveNewlyArrivedConv.conversation.id)}
                                className="flex min-w-0 flex-1 items-center gap-2.5 text-left focus:outline-none"
                            >
                                <div className="relative shrink-0">
                                    <Avatar className="size-9 border-2 border-black dark:border-emerald-500">
                                        <AvatarImage src={liveNewlyArrivedConv.otherUser.avatar || undefined} />
                                        <AvatarFallback>{liveNewlyArrivedConv.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background bg-emerald-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="truncate text-xs font-bold text-black dark:text-emerald-400">
                                            {liveNewlyArrivedConv.displayName}
                                        </span>
                                        <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                            Online
                                        </span>
                                    </div>
                                    <p className="truncate text-xs font-medium text-black/90 dark:text-emerald-300">
                                        {liveNewlyArrivedConv.messageContent}
                                    </p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => dispatch(clearNewlyArrivedHighlight())}
                                className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                                aria-label="Dismiss alert"
                            >
                                <X className="size-3.5" />
                            </button>
                        </div>
                    </div>
                )}

                {filteredConversations.length > 0 ? (

                    <div className="space-y-1">

                        {filteredConversations.map(
                            (
                                conversation
                            ) => {

                                const otherMember =
                                    getOtherMember(
                                        conversation
                                    );


                                const otherUser =
                                    otherMember?.user;


                                const displayName =
                                    otherMember?.nickname ||
                                    otherUser?.name ||
                                    "Unknown user";


                                const isActive =
                                    activeConversationId ===
                                    conversation.id;


                                const isOnline =
                                    otherUser?.id !==
                                        undefined &&
                                    onlineUsers.includes(
                                        otherUser.id
                                    );


                                const lastMessage =
                                    conversation.lastMessage;


                                /*
                                 * ChatFlow already converts
                                 * the content into the final
                                 * preview string.
                                 */
                                const preview =
                                    lastMessage
                                        ?.content ||
                                    "No messages yet";


                                /*
                                 * Check if other user is
                                 * typing in this conversation.
                                 */
                                const conversationTypingUsers =
                                    typingUsers[
                                        conversation.id
                                    ] ?? [];

                                const isOtherUserTyping =
                                    otherUser?.id !== undefined &&
                                    conversationTypingUsers.includes(
                                        otherUser.id
                                    );


                                return (
                                    <ConversationItem
                                        key={
                                            conversation.id
                                        }

                                        name={
                                            displayName
                                        }

                                        avatar={
                                            otherUser?.avatar ||
                                            undefined
                                        }

                                        lastMessage={
                                            preview
                                        }

                                        active={
                                            isActive ||
                                            selectedConversation ===
                                                conversation.id
                                        }

                                        online={
                                            isOnline
                                        }

                                        isTyping={
                                            isOtherUserTyping
                                        }

                                        lastMessageDate={
                                            lastMessage
                                                ?.createdAt ??
                                            null
                                        }

                                        unreadCount={
                                            unreadCounts[
                                                conversation.id
                                            ] || 0
                                        }

                                        isNewlyArrived={
                                            newlyArrivedConversationId ===
                                            conversation.id
                                        }

                                        onClick={() =>
                                            handleSelectConversation(
                                                conversation.id
                                            )
                                        }
                                    />
                                );
                            }
                        )}

                    </div>

                ) : (

                    <div
                        className="
                            flex
                            h-full
                            min-h-60
                            flex-col
                            items-center
                            justify-center
                            px-6
                            text-center
                        "
                    >

                        <div
                            className="
                                mb-4
                                flex
                                size-12
                                items-center
                                justify-center
                                rounded-full
                                bg-muted
                            "
                        >

                            <Search
                                className="
                                    size-5
                                    text-muted-foreground
                                "
                            />

                        </div>


                        <p className="text-sm font-medium">
                            No conversations found
                        </p>


                        <p className="mt-1 max-w-55 text-xs leading-relaxed text-muted-foreground">
                            Try searching for another person.
                        </p>

                    </div>

                )}

            </div>


            {/* USER SEARCH */}

            {showUserSearch && (

                <UserSearch
                    onClose={() =>
                        setShowUserSearch(
                            false
                        )
                    }

                    onSelectUser={(
                        user
                    ) =>
                        handleSelectUser(
                            user.id
                        )
                    }
                />

            )}


            {/* NOTE MODAL WITH SLIDER */}

            <NoteModal
                isOpen={noteModalOpen}
                onClose={() => setNoteModalOpen(false)}
                isCurrentUser={isEditingMyNote}
                initialNote={selectedUserForNote?.note}
                onSaveNote={isEditingMyNote ? handleSaveMyNote : undefined}
                user={selectedUserForNote}
                notesList={profilesWithNotes}
                initialIndex={activeNoteIndex}
                onOpenConversation={handleSelectConversation}
            />

        </aside>
    );
}


export default Sidebar;