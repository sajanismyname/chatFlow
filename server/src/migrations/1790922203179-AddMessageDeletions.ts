import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMessageDeletions1790922203179 implements MigrationInterface {
    name = 'AddMessageDeletions1790922203179'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "message_deletions" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "message_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "UQ_1507eb33f8d77da6f3da52a8369" UNIQUE ("message_id", "user_id"), CONSTRAINT "PK_78cd6a9f486b4a2942265e25f90" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "message_deletions" ADD CONSTRAINT "FK_a5888bcf73fe822a32e79cd8658" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message_deletions" ADD CONSTRAINT "FK_0f8839f89996c03e6d7dada6034" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message_deletions" DROP CONSTRAINT "FK_0f8839f89996c03e6d7dada6034"`);
        await queryRunner.query(`ALTER TABLE "message_deletions" DROP CONSTRAINT "FK_a5888bcf73fe822a32e79cd8658"`);
        await queryRunner.query(`DROP TABLE "message_deletions"`);
    }

}
