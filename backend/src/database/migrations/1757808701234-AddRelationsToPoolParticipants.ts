import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRelationsToPoolParticipants1757808701234 implements MigrationInterface {
    name = 'AddRelationsToPoolParticipants1757808701234'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."pool_participants_role_enum" AS ENUM('admin', 'participant')`);
        await queryRunner.query(`CREATE TABLE "pool_participants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" integer NOT NULL, "pool_id" uuid NOT NULL, "role" "public"."pool_participants_role_enum" NOT NULL DEFAULT 'participant', CONSTRAINT "PK_a8f89d2814501f7a54c6339d1f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "pool_participants" ADD CONSTRAINT "FK_6093a5c1be4b930477340bf3504" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pool_participants" ADD CONSTRAINT "FK_fd7e27895cfeea1029cc89be3e2" FOREIGN KEY ("pool_id") REFERENCES "pools"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pool_participants" DROP CONSTRAINT "FK_fd7e27895cfeea1029cc89be3e2"`);
        await queryRunner.query(`ALTER TABLE "pool_participants" DROP CONSTRAINT "FK_6093a5c1be4b930477340bf3504"`);
        await queryRunner.query(`DROP TABLE "pool_participants"`);
        await queryRunner.query(`DROP TYPE "public"."pool_participants_role_enum"`);
    }

}
