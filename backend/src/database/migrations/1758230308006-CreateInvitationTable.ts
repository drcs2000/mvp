import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInvitationTable1758230308006 implements MigrationInterface {
    name = 'CreateInvitationTable1758230308006'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."invitations_status_enum" AS ENUM('pending', 'accepted', 'expired', 'canceled')`);
        await queryRunner.query(`CREATE TABLE "invitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "invitee_email" character varying NOT NULL, "status" "public"."invitations_status_enum" NOT NULL DEFAULT 'pending', "expires_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "pool_id" integer, "inviter_id" integer, CONSTRAINT "UQ_e577dcf9bb6d084373ed3998509" UNIQUE ("token"), CONSTRAINT "PK_5dec98cfdfd562e4ad3648bbb07" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_f50a9b543849a18ce853b114c68" FOREIGN KEY ("pool_id") REFERENCES "pools"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_9752bd6630e9c8a1e1b046b43e7" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_9752bd6630e9c8a1e1b046b43e7"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_f50a9b543849a18ce853b114c68"`);
        await queryRunner.query(`DROP TABLE "invitations"`);
        await queryRunner.query(`DROP TYPE "public"."invitations_status_enum"`);
    }

}
