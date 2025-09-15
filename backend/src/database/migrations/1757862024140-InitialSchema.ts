import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1757862024140 implements MigrationInterface {
    name = 'InitialSchema1757862024140'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "pools" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "max_participants" integer NOT NULL, "bet_deadline_hours" integer NOT NULL, "base_championship_id" integer NOT NULL, "private" boolean NOT NULL DEFAULT false, "points" jsonb NOT NULL, "entry_fee" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6708c86fc389259de3ee43230ee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."pool_participants_role_enum" AS ENUM('admin', 'participant')`);
        await queryRunner.query(`CREATE TABLE "pool_participants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" integer NOT NULL, "pool_id" integer NOT NULL, "role" "public"."pool_participants_role_enum" NOT NULL DEFAULT 'participant', CONSTRAINT "PK_a8f89d2814501f7a54c6339d1f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "pool_participants" ADD CONSTRAINT "FK_6093a5c1be4b930477340bf3504" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pool_participants" ADD CONSTRAINT "FK_fd7e27895cfeea1029cc89be3e2" FOREIGN KEY ("pool_id") REFERENCES "pools"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pool_participants" DROP CONSTRAINT "FK_fd7e27895cfeea1029cc89be3e2"`);
        await queryRunner.query(`ALTER TABLE "pool_participants" DROP CONSTRAINT "FK_6093a5c1be4b930477340bf3504"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "pool_participants"`);
        await queryRunner.query(`DROP TYPE "public"."pool_participants_role_enum"`);
        await queryRunner.query(`DROP TABLE "pools"`);
    }

}
