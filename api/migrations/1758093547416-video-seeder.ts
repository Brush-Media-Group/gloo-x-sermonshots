import { MigrationInterface, QueryRunner } from 'typeorm';

export class VideoSeeder1758093547416 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "video" (id, transcript_id, title, raw_transcript, video_url, is_public)
            VALUES
            (uuid_generate_v4(), 'transcript1', 'Sample Video 1', 'This is the transcript of sample video 1.', 'http://example.com/video1', true),
            (uuid_generate_v4(), 'transcript2', 'Sample Video 2', 'This is the transcript of sample video 2.', 'http://example.com/video2', true),
            (uuid_generate_v4(), 'transcript3', 'Sample Video 3', 'This is the transcript of sample video 3.', 'http://example.com/video3', false);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            TRUNCATE TABLE "video";
        `);
  }
}
