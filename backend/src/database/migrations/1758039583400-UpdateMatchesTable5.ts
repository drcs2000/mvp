import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateMatchesTable51758039583400 implements MigrationInterface {
    name = 'UpdateMatchesTable51758039583400'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("matches", new TableColumn({
            name: "home_team_api_id",
            type: "integer",
            isNullable: true, // Adiciona a coluna permitindo valores nulos
        }));

        await queryRunner.addColumn("matches", new TableColumn({
            name: "away_team_api_id",
            type: "integer",
            isNullable: true, // Adiciona a coluna permitindo valores nulos
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("matches", "away_team_api_id");
        await queryRunner.dropColumn("matches", "home_team_api_id");
    }
}