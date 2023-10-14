import { BeforeInsert, Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity, generateEntityId } from '@medusajs/medusa';
import { Post } from './post';

@Entity()
export class Author extends BaseEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @OneToMany(() => Post, (post) => post.author, { cascade: true })
  posts: Post[];

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id);
  }
}
