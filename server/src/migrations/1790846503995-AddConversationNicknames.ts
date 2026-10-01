import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConversationNicknames1790846503995 implements MigrationInterface {
    name = 'AddConversationNicknames1790846503995'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "conversation_nicknames" ("id" SERIAL NOT NULL, "nickname" character varying(50) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "conversation_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "UQ_conversation_nicknames_conversation_user" UNIQUE ("conversation_id", "user_id"), CONSTRAINT "PK_f8048b129faae8cd5b47ad23ffc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "conversation_nicknames" ADD CONSTRAINT "FK_c845063129e92f4a35df313ff3a" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation_nicknames" ADD CONSTRAINT "FK_3ad1d1fc48bf817d9d0f73efb27" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation_nicknames" DROP CONSTRAINT "FK_3ad1d1fc48bf817d9d0f73efb27"`);
        await queryRunner.query(`ALTER TABLE "conversation_nicknames" DROP CONSTRAINT "FK_c845063129e92f4a35df313ff3a"`);
        await queryRunner.query(`DROP TABLE "conversation_nicknames"`);
    }

}
