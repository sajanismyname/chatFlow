import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
} from "typeorm";

import { Message } from "./Message.js";
import { ConversationMember } from "./ConversationMember.js";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", unique: true, nullable: true })
    googleId!: string | null;

    @Column({ type: "varchar", unique: true })
    email!: string;

    @Column({ type: "varchar" })
    name!: string;

    @Column({ type: "varchar", nullable: true, select: false })
    password!: string | null;

    @Column({ type: "varchar", nullable: true })
    avatar!: string | null;

    @OneToMany(() => Message, (message) => message.sender)
    messages!: Message[];

    @OneToMany(
        () => ConversationMember,
        (member) => member.user
    )
    conversationMembers!: ConversationMember[];
}