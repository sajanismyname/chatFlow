import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMessageDeletionSupport1790920120132 implements MigrationInterface {
    name = 'AddMessageDeletionSupport1790920120132'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "messages" ADD "deletedForEveryone" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "deletedForEveryone"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "deletedAt"`);
    }

}
