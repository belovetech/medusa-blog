import { Entity, BeforeInsert, Column } from 'typeorm';
import { BaseEntity, generateEntityId } from '@medusajs/medusa';

@Entity()
export class Blog extends BaseEntity {
  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id);
  }
}
