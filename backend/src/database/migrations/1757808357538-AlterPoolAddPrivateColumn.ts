import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterPoolAddPrivateColumn1757808357538 implements MigrationInterface {
    name = 'AlterPoolAddPrivateColumn1757808357538'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pools" RENAME COLUMN "privacy" TO "private"`);
        await queryRunner.query(`ALTER TYPE "public"."pools_privacy_enum" RENAME TO "pools_private_enum"`);
        await queryRunner.query(`ALTER TABLE "pools" DROP COLUMN "private"`);
        await queryRunner.query(`ALTER TABLE "pools" ADD "private" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pools" DROP COLUMN "private"`);
        await queryRunner.query(`ALTER TABLE "pools" ADD "private" "public"."pools_private_enum" NOT NULL DEFAULT 'public'`);
        await queryRunner.query(`ALTER TYPE "public"."pools_private_enum" RENAME TO "pools_privacy_enum"`);
        await queryRunner.query(`ALTER TABLE "pools" RENAME COLUMN "private" TO "privacy"`);
    }

}
