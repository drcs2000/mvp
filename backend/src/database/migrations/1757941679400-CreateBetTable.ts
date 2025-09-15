import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBetTable1757941679400 implements MigrationInterface {
    name = 'CreateBetTable1757941679400'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bets" ("id" SERIAL NOT NULL, "home_score_bet" integer NOT NULL, "away_score_bet" integer NOT NULL, "points_earned" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer NOT NULL, "poolId" integer NOT NULL, "matchId" integer NOT NULL, CONSTRAINT "UQ_02ba75c709069c58028c2c7d60f" UNIQUE ("userId", "poolId", "matchId"), CONSTRAINT "PK_7ca91a6a39623bd5c21722bcedd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."matches_status_enum" RENAME TO "matches_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."matches_status_enum" AS ENUM('TBD', 'NS', '1H', '2H', 'HT', 'FT', 'PST', 'CANC')`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "status" TYPE "public"."matches_status_enum" USING "status"::"text"::"public"."matches_status_enum"`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "status" SET DEFAULT 'TBD'`);
        await queryRunner.query(`DROP TYPE "public"."matches_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "bets" ADD CONSTRAINT "FK_ca8cf669d26fbfcc365a4811b22" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bets" ADD CONSTRAINT "FK_c452bdcd64f1b721f1d5cf8a24c" FOREIGN KEY ("poolId") REFERENCES "pools"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bets" ADD CONSTRAINT "FK_ddd8dce54aa5f1af36c467c9dae" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bets" DROP CONSTRAINT "FK_ddd8dce54aa5f1af36c467c9dae"`);
        await queryRunner.query(`ALTER TABLE "bets" DROP CONSTRAINT "FK_c452bdcd64f1b721f1d5cf8a24c"`);
        await queryRunner.query(`ALTER TABLE "bets" DROP CONSTRAINT "FK_ca8cf669d26fbfcc365a4811b22"`);
        await queryRunner.query(`CREATE TYPE "public"."matches_status_enum_old" AS ENUM('TBD', 'NS', '1H', '2H', 'FT', 'PST', 'CANC')`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "status" TYPE "public"."matches_status_enum_old" USING "status"::"text"::"public"."matches_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "status" SET DEFAULT 'TBD'`);
        await queryRunner.query(`DROP TYPE "public"."matches_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."matches_status_enum_old" RENAME TO "matches_status_enum"`);
        await queryRunner.query(`DROP TABLE "bets"`);
    }

}
