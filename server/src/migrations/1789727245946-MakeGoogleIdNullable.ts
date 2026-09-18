import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeGoogleIdNullable1789727245946 implements MigrationInterface {
    name = 'MakeGoogleIdNullable1789727245946'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "googleId" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "googleId" SET NOT NULL`);
    }

}
