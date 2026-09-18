import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefreshTokens1789711533889 implements MigrationInterface {
    name = 'AddRefreshTokens1789711533889'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" SERIAL NOT NULL, "tokenHash" text NOT NULL, "user_id" integer NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "revokedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c25bc63d248ca90e8dcc1d92d06" UNIQUE ("tokenHash"), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    }

}
