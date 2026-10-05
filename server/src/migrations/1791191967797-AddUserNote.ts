import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserNote1791191967797 implements MigrationInterface {
    name = 'AddUserNote1791191967797'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "note" character varying(1500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "note"`);
    }

}
