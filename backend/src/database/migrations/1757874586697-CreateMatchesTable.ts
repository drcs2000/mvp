import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMatchesTable1757874586697 implements MigrationInterface {
    name = 'CreateMatchesTable1757874586697'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."matches_status_enum" AS ENUM('TBD', 'NS', '1H', '2H', 'FT', 'PST', 'CANC')`);
        await queryRunner.query(`CREATE TABLE "matches" ("id" SERIAL NOT NULL, "api_match_id" integer NOT NULL, "date" TIMESTAMP NOT NULL, "stadium" character varying NOT NULL, "home_team_name" character varying NOT NULL, "home_team_logo_url" character varying NOT NULL, "away_team_name" character varying NOT NULL, "away_team_logo_url" character varying NOT NULL, "home_score" integer, "away_score" integer, "status" "public"."matches_status_enum" NOT NULL DEFAULT 'TBD', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1a022d89e3cf9f35e814743e46e" UNIQUE ("api_match_id"), CONSTRAINT "PK_8a22c7b2e0828988d51256117f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_61dbf08a29d373645dc4a3e24a" ON "matches" ("date") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_61dbf08a29d373645dc4a3e24a"`);
        await queryRunner.query(`DROP TABLE "matches"`);
        await queryRunner.query(`DROP TYPE "public"."matches_status_enum"`);
    }

}
