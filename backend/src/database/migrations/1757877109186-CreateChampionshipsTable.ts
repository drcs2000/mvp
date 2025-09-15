import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateChampionshipsTable1757877109186 implements MigrationInterface {
    name = 'CreateChampionshipsTable1757877109186'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."championships_type_enum" AS ENUM('League', 'Cup')`);
        await queryRunner.query(`CREATE TABLE "championships" ("id" SERIAL NOT NULL, "api_football_id" integer NOT NULL, "api_espn_id" character varying, "name" character varying NOT NULL, "type" "public"."championships_type_enum" NOT NULL, "league_logo_url" character varying NOT NULL, "country_name" character varying NOT NULL, "country_flag_url" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0f99e3669ee9b045b47cc8c916d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_222403f87451dcd0cf884b2b76" ON "championships" ("api_football_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_222403f87451dcd0cf884b2b76"`);
        await queryRunner.query(`DROP TABLE "championships"`);
        await queryRunner.query(`DROP TYPE "public"."championships_type_enum"`);
    }

}
