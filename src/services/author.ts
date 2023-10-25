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

        if (Object.keys(this.validateAuthor(data)).length > 0) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            JSON.stringify(this.validateAuthor(data)),
            '400'
          );
        }

        const query = buildQuery({ email: data.email });
        const authorExist = await authorRepo.findOne(query);

        if (authorExist) {
          throw new MedusaError(
            MedusaError.Types.CONFLICT,
            `Author with email "${data.email}" already exists.`,
            '409'
          );
        }

        const author = authorRepo.create();
        author.name = data.name;
        author.email = data.email;
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
    try {
      const authorRepo = this.activeManager_.withRepository(
        this.authorRepository_
      );

      const query = buildQuery(selector, config);
      return await authorRepo.findAndCount(query);
    } catch (error) {
      throw new MedusaError(
        'Unable to fetch authors',
        error.message,
        error.code ?? '500'
      );
    }
  }

  async list(
    selector?: Selector<Author>,
    config: FindConfig<Author> = {
      relations: ['post'],
      take: 20,
      skip: 0,
    }
  ): Promise<Author[]> {
    try {
      const [authors] = await this.listAndCount(selector, config);
      return authors;
    } catch (error) {
      throw new MedusaError(
        'Unable to fetch authors',
        error.message,
        error.code ?? '500'
      );
    }
  }

  async retrieve(id: string, config?: FindConfig<Author>): Promise<Author> {
    try {
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
    } catch (error) {
      throw new MedusaError(
        'Unable to retrieve authors',
        error.message,
        error.code ?? '500'
      );
    }
  }

  async update(id: string, data: Omit<Partial<Author>, 'id'>): Promise<Author> {
    try {
      return await this.atomicPhase_(
        async (transactionManager: EntityManager) => {
          const authorRepo = transactionManager.withRepository(
            this.authorRepository_
          );

          const author = await this.retrieve(id);
          Object.assign(author, data);
          return await authorRepo.save(author);
        }
      );
    } catch (error) {
      throw new MedusaError(
        'Unable to update author',
        error.message,
        error.code ?? '500'
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      return await this.atomicPhase_(
        async (transactionManager: EntityManager) => {
          const authorRepo = transactionManager.withRepository(
            this.authorRepository_
          );

          const author = await this.retrieve(id);
          await authorRepo.remove(author);
        }
      );
    } catch (error) {
      throw new MedusaError(
        'Unable to delete author',
        error.message,
        error.code ?? '500'
      );
    }
  }

  private validateAuthor(data: Partial<Author>): { [key: string]: string } {
    let errors: { [key: string]: string } = {};
    if (!data.name || data.name.length < 3) {
      errors.name = 'Author name is required';
    }

    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;

    if (!data.email || !emailRegex.test(data.email)) {
      errors.email = 'Valid email is required';
    }

    return errors;
  }
}

export default AuthorService;
