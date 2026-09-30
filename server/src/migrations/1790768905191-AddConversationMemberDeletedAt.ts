import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConversationMemberDeletedAt1790768905191 implements MigrationInterface {
    name = 'AddConversationMemberDeletedAt1790768905191'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation_members" ADD "deletedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation_members" DROP COLUMN "deletedAt"`);
    }

}
