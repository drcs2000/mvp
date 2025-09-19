import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateInvitationTable1758232821424 implements MigrationInterface {
    name = 'UpdateInvitationTable1758232821424'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitations" DROP COLUMN "invitee_email"`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD "invitee_id" integer`);
        await queryRunner.query(`ALTER TABLE "invitations" ALTER COLUMN "token" DROP NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."invitations_status_enum" RENAME TO "invitations_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."invitations_status_enum" AS ENUM('pending', 'accepted', 'expired', 'declined', 'canceled')`);
        await queryRunner.query(`ALTER TABLE "invitations" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "invitations" ALTER COLUMN "status" TYPE "public"."invitations_status_enum" USING "status"::"text"::"public"."invitations_status_enum"`);
        await queryRunner.query(`ALTER TABLE "invitations" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."invitations_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_00a9fbc86a920e5788ffcb1dc38" FOREIGN KEY ("invitee_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_00a9fbc86a920e5788ffcb1dc38"`);
        await queryRunner.query(`CREATE TYPE "public"."invitations_status_enum_old" AS ENUM('pending', 'accepted', 'expired', 'canceled')`);
        await queryRunner.query(`ALTER TABLE "invitations" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "invitations" ALTER COLUMN "status" TYPE "public"."invitations_status_enum_old" USING "status"::"text"::"public"."invitations_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "invitations" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."invitations_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."invitations_status_enum_old" RENAME TO "invitations_status_enum"`);
        await queryRunner.query(`ALTER TABLE "invitations" ALTER COLUMN "token" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP COLUMN "invitee_id"`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD "invitee_email" character varying NOT NULL`);
    }

}
