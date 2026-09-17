import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from "typeorm";

import { User } from "./User.js";
import { Conversation } from "./Conversation.js";

@Entity("messages")
export class Message {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "text" })
    content!: string;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: "sender_id" })
    sender!: User;

    @ManyToOne(() => Conversation, { nullable: false })
    @JoinColumn({ name: "conversation_id" })
    conversation!: Conversation;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ type: "timestamp", nullable: true })
    readAt!: Date | null;
}