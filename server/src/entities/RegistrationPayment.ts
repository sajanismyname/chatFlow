import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { User } from "./User.js";

export type PaymentGatewayType = "khalti" | "esewa";
export type PaymentStatusType = "PENDING" | "COMPLETED" | "FAILED";

@Entity("registration_payments")
export class RegistrationPayment {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", unique: true })
    transactionUuid!: string;

    @Column({ type: "varchar" })
    gateway!: PaymentGatewayType;

    @Column({ type: "numeric", precision: 10, scale: 2 })
    amount!: number;

    @Column({ type: "varchar", default: "PENDING" })
    status!: PaymentStatusType;

    @Column({ type: "varchar" })
    name!: string;

    @Column({ type: "varchar" })
    email!: string;

    @Column({ type: "varchar" })
    password!: string;

    @Column({ type: "varchar", nullable: true })
    pidx!: string | null;

    @Column({ type: "varchar", nullable: true })
    gatewayRefId!: string | null;

    @Column({ type: "integer", nullable: true })
    userId!: number | null;

    @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "userId" })
    user!: User | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
