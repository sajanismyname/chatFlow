import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
} from "typeorm";

import { ConversationMember } from "./ConversationMember.js";
import { Message } from "./Message.js";

@Entity("conversations")
export class Conversation {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "varchar",
        default: "direct",
    })
    type!: "direct" | "group";

    @CreateDateColumn()
    createdAt!: Date;

    @OneToMany(
        () => ConversationMember,
        (member) => member.conversation
    )
    members!: ConversationMember[];

    @OneToMany(
        () => Message,
        (message) => message.conversation
    )
    messages!: Message[];
}