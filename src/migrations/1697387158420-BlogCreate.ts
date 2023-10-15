import { MigrationInterface, QueryRunner } from "typeorm";

export class BlogCreate1697387158420 implements MigrationInterface {
    name = 'BlogCreate1697387158420'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "blog" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "title" character varying NOT NULL, "content" text NOT NULL, CONSTRAINT "PK_85c6532ad065a448e9de7638571" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "blog"`);
    }

}
