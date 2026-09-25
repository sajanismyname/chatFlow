import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from "typeorm";

import { User } from "./User.js";
import { Conversation } from "./Conversation.js";

@Entity("conversation_members")
@Unique("UQ_conversation_members_user_conversation", ["user", "conversation"])
export class ConversationMember {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @ManyToOne(() => Conversation, { nullable: false })
    @JoinColumn({ name: "conversation_id" })
    conversation!: Conversation;
}