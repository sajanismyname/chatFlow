import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1789643600771 implements MigrationInterface {
    name = 'InitialSchema1789643600771'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "conversation_members" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "conversation_id" integer NOT NULL, CONSTRAINT "PK_33146a476696a973a14d931e675" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "conversations" ("id" SERIAL NOT NULL, "type" character varying NOT NULL DEFAULT 'direct', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ee34f4f7ced4ec8681f26bf04ef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "messages" ("id" SERIAL NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "readAt" TIMESTAMP, "sender_id" integer NOT NULL, "conversation_id" integer NOT NULL, CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "googleId" character varying NOT NULL, "email" character varying NOT NULL, "name" character varying NOT NULL, "avatar" character varying, CONSTRAINT "UQ_f382af58ab36057334fb262efd5" UNIQUE ("googleId"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "conversation_members" ADD CONSTRAINT "FK_a46c76be8f62c4b00a835cdc370" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation_members" ADD CONSTRAINT "FK_36340a1704b039608e34244511f" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_22133395bd13b970ccd0c34ab22" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_3bc55a7c3f9ed54b520bb5cfe23" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_3bc55a7c3f9ed54b520bb5cfe23"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_22133395bd13b970ccd0c34ab22"`);
        await queryRunner.query(`ALTER TABLE "conversation_members" DROP CONSTRAINT "FK_36340a1704b039608e34244511f"`);
        await queryRunner.query(`ALTER TABLE "conversation_members" DROP CONSTRAINT "FK_a46c76be8f62c4b00a835cdc370"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TABLE "conversations"`);
        await queryRunner.query(`DROP TABLE "conversation_members"`);
    }

}
