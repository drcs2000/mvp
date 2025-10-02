import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateChampionship1759345601817 implements MigrationInterface {
    name = 'UpdateChampionship1759345601817'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."championships_calendar_enum" AS ENUM('brasileiro', 'europeu')`);
        await queryRunner.query(`ALTER TABLE "championships" ADD "calendar" "public"."championships_calendar_enum" NOT NULL DEFAULT 'brasileiro'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "championships" DROP COLUMN "calendar"`);
        await queryRunner.query(`DROP TYPE "public"."championships_calendar_enum"`);
    }

}
