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

    @Column({ unique: true })
    googleId!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    name!: string;

    @Column({ nullable: true })
    avatar!: string | null;

    @CreateDateColumn()
    createdAt!: Date;

    @OneToMany(() => Message, (message) => message.sender)
    messages!: Message[];

    @OneToMany(
        () => ConversationMember,
        (member) => member.user
    )
    conversationMembers!: ConversationMember[];
}