import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from "typeorm";

@Entity("password_reset_tokens")
export class PasswordResetToken {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "varchar",
        unique: true,
    })
    tokenHash!: string;

    @Column({
        type: "integer",
    })
    userId!: number;

    @Column({
        type: "timestamp",
    })
    expiresAt!: Date;

    @Column({
        type: "timestamp",
        nullable: true,
    })
    usedAt!: Date | null;

    @CreateDateColumn({
        type: "timestamp",
    })
    createdAt!: Date;
}