import { MigrationInterface, QueryRunner } from "typeorm";

export class FixPasswordResetRequestIpColumn1790857000000
    implements MigrationInterface
{
    name =
        "FixPasswordResetRequestIpColumn1790857000000";

    public async up(
        queryRunner: QueryRunner
    ): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "password_reset_tokens"
            ADD COLUMN IF NOT EXISTS "requestIp" varchar
        `);
    }

    public async down(
        queryRunner: QueryRunner
    ): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "password_reset_tokens"
            DROP COLUMN IF EXISTS "requestIp"
        `);
    }
}