import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateStandingsTable31758055616566 implements MigrationInterface {
    name = 'UpdateStandingsTable31758055616566'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "standings" DROP CONSTRAINT "UQ_a84f2b3dad6206bee53a104e0cd"`);
        await queryRunner.query(`ALTER TABLE "standings" ALTER COLUMN "teamApiId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "standings" ADD CONSTRAINT "UQ_a84f2b3dad6206bee53a104e0cd" UNIQUE ("championshipApiFootballId", "teamApiId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "standings" DROP CONSTRAINT "UQ_a84f2b3dad6206bee53a104e0cd"`);
        await queryRunner.query(`ALTER TABLE "standings" ALTER COLUMN "teamApiId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "standings" ADD CONSTRAINT "UQ_a84f2b3dad6206bee53a104e0cd" UNIQUE ("championshipApiFootballId", "teamApiId")`);
    }

}
