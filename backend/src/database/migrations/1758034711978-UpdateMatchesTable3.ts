import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMatchesTable31758034711978 implements MigrationInterface {
    name = 'UpdateMatchesTable31758034711978'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."matches_status_enum" RENAME TO "matches_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."matches_status_enum" AS ENUM('TBD', 'NS', '1H', '2H', 'HT', 'FT', 'PST', 'CANC', 'ABD', 'PEN', 'AET')`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "status" TYPE "public"."matches_status_enum" USING "status"::"text"::"public"."matches_status_enum"`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "status" SET DEFAULT 'TBD'`);
        await queryRunner.query(`DROP TYPE "public"."matches_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."matches_status_enum_old" AS ENUM('TBD', 'NS', '1H', '2H', 'HT', 'FT', 'PST', 'CANC', 'ABD', 'PEN')`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "status" TYPE "public"."matches_status_enum_old" USING "status"::"text"::"public"."matches_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "status" SET DEFAULT 'TBD'`);
        await queryRunner.query(`DROP TYPE "public"."matches_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."matches_status_enum_old" RENAME TO "matches_status_enum"`);
    }

}
