import { Entity, BeforeInsert, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity, generateEntityId } from '@medusajs/medusa';
import { Author } from './author';

@Entity()
export class Post extends BaseEntity {
  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar' })
  author_id: string;

  @ManyToOne(() => Author, (author) => author.blogs)
  @JoinColumn({ name: 'author_id' })
  author: Author;

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id);
  }
}
