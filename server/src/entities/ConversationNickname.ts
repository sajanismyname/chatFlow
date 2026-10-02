import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from "typeorm";

import { User } from "./User.js";
import { Conversation } from "./Conversation.js";

@Entity("conversation_nicknames")
@Unique(
    "UQ_conversation_nicknames_conversation_user",
    ["conversation", "user"]
)
export class ConversationNickname {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(
        () => Conversation,
        { nullable: false, onDelete: "CASCADE" }
    )
    @JoinColumn({ name: "conversation_id" })
    conversation!: Conversation;

    @ManyToOne(
        () => User,
        { nullable: false, onDelete: "CASCADE" }
    )
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({
        type: "varchar",
        length: 50,
    })
    nickname!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}