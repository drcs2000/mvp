import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateH2HTable1758056411807 implements MigrationInterface {
    name = 'CreateH2HTable1758056411807'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "h2h" ("id" SERIAL NOT NULL, "team1Id" integer NOT NULL, "team2Id" integer NOT NULL, "matches" jsonb NOT NULL, "lastUpdated" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0f21c38accc5cec951990707536" UNIQUE ("team1Id", "team2Id"), CONSTRAINT "PK_0b32f60d0c33931d5dbeeaaac3c" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "h2h"`);
    }

}
