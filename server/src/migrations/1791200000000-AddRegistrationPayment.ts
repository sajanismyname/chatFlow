import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRegistrationPayment1791200000000 implements MigrationInterface {
    name = "AddRegistrationPayment1791200000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isPaid" boolean NOT NULL DEFAULT true`
        );
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "registration_payments" (
                "id" SERIAL NOT NULL,
                "transactionUuid" character varying NOT NULL,
                "gateway" character varying NOT NULL,
                "amount" numeric(10,2) NOT NULL,
                "status" character varying NOT NULL DEFAULT 'PENDING',
                "name" character varying NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "pidx" character varying,
                "gatewayRefId" character varying,
                "userId" integer,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_registration_payments_transactionUuid" UNIQUE ("transactionUuid"),
                CONSTRAINT "PK_registration_payments_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_registration_payments_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "registration_payments"`);
        await queryRunner.query(
            `ALTER TABLE "users" DROP COLUMN IF EXISTS "isPaid"`
        );
    }
}
