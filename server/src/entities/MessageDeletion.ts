import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Unique,
} from "typeorm";

import { User } from "./User.js";
import { Message } from "./Message.js";

@Entity("message_deletions")
@Unique(["message", "user"])
export class MessageDeletion {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Message, {
        nullable: false,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "message_id" })
    message!: Message;

    @ManyToOne(() => User, {
        nullable: false,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @CreateDateColumn()
    createdAt!: Date;
}