import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePoolsTable1757807468044 implements MigrationInterface {
    name = 'CreatePoolsTable1757807468044'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."pools_privacy_enum" AS ENUM('public', 'private')`);
        await queryRunner.query(`CREATE TABLE "pools" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "max_participants" integer NOT NULL, "bet_deadline_hours" integer NOT NULL, "base_championship_id" integer NOT NULL, "privacy" "public"."pools_privacy_enum" NOT NULL DEFAULT 'public', "points" jsonb NOT NULL, "entry_fee" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6708c86fc389259de3ee43230ee" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "pools"`);
        await queryRunner.query(`DROP TYPE "public"."pools_privacy_enum"`);
    }

}
