import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMessageReply1790769288749 implements MigrationInterface {
    name = 'AddMessageReply1790769288749'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" ADD "reply_to_message_id" integer`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_7f87cbb925b1267778a7f4c5d67" FOREIGN KEY ("reply_to_message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_7f87cbb925b1267778a7f4c5d67"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "reply_to_message_id"`);
    }

}
