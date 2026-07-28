import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSearchHistoriesTable1785251280227 implements MigrationInterface {
    name = 'CreateSearchHistoriesTable1785251280227'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "search_histories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "provider" character varying(50) NOT NULL, "query_params" jsonb NOT NULL, "response_status" integer NOT NULL, "execution_time_ms" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_55eb6ed37ed8a334b599b3dfe66" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "search_histories" ADD CONSTRAINT "FK_bbe77df2112da0baf6bc31de5aa" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "search_histories" DROP CONSTRAINT "FK_bbe77df2112da0baf6bc31de5aa"`);
        await queryRunner.query(`DROP TABLE "search_histories"`);
    }

}
