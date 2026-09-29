import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueConversationMembership1790320309435 implements MigrationInterface {
    name = 'AddUniqueConversationMembership1790320309435'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation_members" ADD CONSTRAINT "UQ_conversation_members_user_conversation" UNIQUE ("user_id", "conversation_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation_members" DROP CONSTRAINT "UQ_conversation_members_user_conversation"`);
    }

}
