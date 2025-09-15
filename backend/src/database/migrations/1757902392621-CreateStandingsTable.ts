import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStandingsTable1757902392621 implements MigrationInterface {
    name = 'CreateStandingsTable1757902392621'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "standings" ("id" SERIAL NOT NULL, "championshipApiFootballId" integer NOT NULL, "teamApiId" integer NOT NULL, "teamName" character varying NOT NULL, "teamLogoUrl" character varying NOT NULL, "rank" integer NOT NULL, "points" integer NOT NULL, "goalsDiff" integer NOT NULL, "form" character varying(10) NOT NULL, "description" character varying, "played" integer NOT NULL, "win" integer NOT NULL, "draw" integer NOT NULL, "lose" integer NOT NULL, "goalsFor" integer NOT NULL, "goalsAgainst" integer NOT NULL, "lastUpdate" TIMESTAMP WITH TIME ZONE NOT NULL, "championshipId" integer, CONSTRAINT "UQ_a84f2b3dad6206bee53a104e0cd" UNIQUE ("championshipApiFootballId", "teamApiId"), CONSTRAINT "PK_ca695befaab9b01d05dd453dbdb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "standings" ADD CONSTRAINT "FK_4baa014af5f6e6e8e8f371dcbbe" FOREIGN KEY ("championshipId") REFERENCES "championships"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "standings" DROP CONSTRAINT "FK_4baa014af5f6e6e8e8f371dcbbe"`);
        await queryRunner.query(`DROP TABLE "standings"`);
    }

}
