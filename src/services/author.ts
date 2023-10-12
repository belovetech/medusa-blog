import {
  TransactionBaseService,
  FindConfig,
  Selector,
  buildQuery,
} from '@medusajs/medusa';
import { EntityManager } from 'typeorm';
import { MedusaError } from '@medusajs/utils';
import { AuthorRepository } from '../repositories';
import { Author } from '../models/author';

class AuthorService extends TransactionBaseService {
  protected manager_: EntityManager;
  protected transactionManager_: EntityManager;
  protected authorRepository_: typeof AuthorRepository;

  constructor(container) {
    super(container);
    this.authorRepository_ = container.AuthorRepository;
  }

  async create(data: Partial<Author>): Promise<Author> {
    return this.atomicPhase_(async (manager) => {
      const authorRepo = manager.withRepository(this.authorRepository_);

      const author = await authorRepo.create(data);
      const result = await authorRepo.save(author);

      return result;
    });
  }

  async listAndCount(
    selector?: Selector<Author>,
    config: FindConfig<Author> = {
      relations: [],
      take: 10,
      skip: 0,
    }
  ): Promise<[Author[], number]> {
    const authorRepo = await this.activeManager_.withRepository(
      this.authorRepository_
    );

    const query = buildQuery(selector, config);
    return authorRepo.findAndCount(query);
  }

  async list(
    selector?: Selector<Author>,
    config: FindConfig<Author> = {
      relations: ['post'],
      take: 20,
      skip: 0,
    }
  ): Promise<Author[]> {
    const [authors] = await this.listAndCount(selector, config);
    return authors;
  }

  async retrieve(id: string, config?: FindConfig<Author>): Promise<Author> {
    const authorRepo = this.activeManager_.withRepository(
      this.authorRepository_
    );

    const query = buildQuery({ id }, config);
    const author = await authorRepo.findOne(query);

    if (!author) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `author with id: ${id} was not found`
      );
    }

    return author;
  }

  async update(id: string, data: Omit<Partial<Author>, 'id'>): Promise<Author> {
    return await this.atomicPhase_(async (manager) => {
      const authorRepo = manager.withRepository(this.authorRepository_);

      const author = await this.retrieve(id);

      if (!author) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `author with id: ${id} was not found`
        );
      }

      Object.assign(author, data);
      return await authorRepo.save(author);
    });
  }

  async delete(id: string): Promise<void> {
    return await this.atomicPhase_(async (manager) => {
      const authorRepo = manager.withRepository(this.authorRepository_);

      const author = await this.retrieve(id);

      if (!author) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `author with id: ${id} was not found`
        );
      }

      await authorRepo.remove(author);
    });
  }
}

export default AuthorService;
