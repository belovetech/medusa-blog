import {
  TransactionBaseService,
  FindConfig,
  Selector,
  buildQuery,
} from '@medusajs/medusa';
import { EntityManager } from 'typeorm';
import { MedusaError } from '@medusajs/utils';
import AuthorRepository from '../repositories/author';
import { Author } from '../models/author';

type InjectedDependencies = {
  manager: EntityManager;
  authorRepository: typeof AuthorRepository;
};

class AuthorService extends TransactionBaseService {
  protected authorRepository_: typeof AuthorRepository;

  constructor({ authorRepository }: InjectedDependencies) {
    super(arguments[0]);
    this.authorRepository_ = authorRepository;
  }

  async create(data: Partial<Author>): Promise<Author> {
    return await this.atomicPhase_(
      async (transactionManager: EntityManager) => {
        const authorRepo = transactionManager.withRepository(
          this.authorRepository_
        );

        const query = buildQuery({ email: data.email });
        const existing = await authorRepo.findOne(query);

        if (existing) {
          throw new MedusaError(
            MedusaError.Types.CONFLICT,
            `Author with email "${data.email}" already exists.`
          );
        }

        const author = await authorRepo.create(data);
        const result = await authorRepo.save(author);

        return result;
      }
    );
  }

  async listAndCount(
    selector?: Selector<Author>,
    config: FindConfig<Author> = {
      relations: [],
      take: 10,
      skip: 0,
    }
  ): Promise<[Author[], number]> {
    const authorRepo = this.activeManager_.withRepository(
      this.authorRepository_
    );

    const query = buildQuery(selector, config);
    return await authorRepo.findAndCount(query);
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
    return await this.atomicPhase_(
      async (transactionManager: EntityManager) => {
        const authorRepo = transactionManager.withRepository(
          this.authorRepository_
        );

        const author = await this.retrieve(id);

        if (!author) {
          throw new MedusaError(
            MedusaError.Types.NOT_FOUND,
            `author with id: ${id} was not found`
          );
        }

        Object.assign(author, data);
        return await authorRepo.save(author);
      }
    );
  }

  async delete(id: string): Promise<void> {
    return await this.atomicPhase_(
      async (transactionManager: EntityManager) => {
        const authorRepo = transactionManager.withRepository(
          this.authorRepository_
        );

        const author = await this.retrieve(id);

        if (!author) {
          throw new MedusaError(
            MedusaError.Types.NOT_FOUND,
            `author with id: ${id} was not found`
          );
        }

        await authorRepo.remove(author);
      }
    );
  }
}

export default AuthorService;
