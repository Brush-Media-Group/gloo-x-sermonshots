import { MigrationInterface, QueryRunner } from 'typeorm';

export class Video1758031734618 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "video" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "transcript_id" text NOT NULL,
            "title" character varying NOT NULL,
            "raw_transcript" text NOT NULL,
            "video_url" text NOT NULL,
            "is_public" boolean NOT NULL DEFAULT false,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_a3afef72ec8f80e6e5c310b28a4" PRIMARY KEY ("id")
        )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "video"`);
  }
}
