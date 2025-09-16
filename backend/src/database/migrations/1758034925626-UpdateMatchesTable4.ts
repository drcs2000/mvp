import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMatchesTable41758034925626 implements MigrationInterface {
    name = 'UpdateMatchesTable41758034925626'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "stadium" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "stadium" SET DEFAULT 'Não declarado'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "stadium" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "stadium" SET NOT NULL`);
    }

}
