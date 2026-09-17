import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";

import { User } from "./User.js";
import { Conversation } from "./Conversation.js";

@Entity("conversation_members")
export class ConversationMember {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user!: User;

    @ManyToOne(() => Conversation)
    @JoinColumn({ name: "conversation_id" })
    conversation!: Conversation;
}