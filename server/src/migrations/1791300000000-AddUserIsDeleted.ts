import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserIsDeleted1791300000000 implements MigrationInterface {
    name = "AddUserIsDeleted1791300000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isDeleted" boolean NOT NULL DEFAULT false`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" DROP COLUMN IF EXISTS "isDeleted"`
        );
    }
}
