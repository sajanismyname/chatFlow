import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserPassword1789726590935 implements MigrationInterface {
    name = 'AddUserPassword1789726590935'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "password" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
    }

}
