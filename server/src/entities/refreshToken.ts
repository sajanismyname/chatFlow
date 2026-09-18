import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";

import { User } from "./User.js";

@Entity("refresh_tokens")
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "text", unique: true })
    tokenHash!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ name: "user_id", type: "integer" })
    userId!: number;

    @Column({ type: "timestamp" })
    expiresAt!: Date;

    @Column({ type: "timestamp", nullable: true })
    revokedAt!: Date | null;

    @CreateDateColumn()
    createdAt!: Date;
}