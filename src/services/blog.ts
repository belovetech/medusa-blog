import {
  TransactionBaseService,
  FindConfig,
  Selector,
  buildQuery,
} from '@medusajs/medusa';
import { EntityManager } from 'typeorm';
import { MedusaError } from '@medusajs/utils';
import BlogRepository from '../repositories/blog';
import { Blog } from '../models/blog';

type InjectedDependencies = {
  manager: EntityManager;
  blogRepository: typeof BlogRepository;
};

type CreateBlog = {
  title: string;
  content: string;
};

class BlogService extends TransactionBaseService {
  protected blogRepository_: typeof BlogRepository;

  constructor({ blogRepository }: InjectedDependencies) {
    super(arguments[0]);

    this.blogRepository_ = blogRepository;
  }

  async create(data: CreateBlog): Promise<Blog> {
    return this.atomicPhase_(async (transactionManager) => {
      const blogRepo = transactionManager.withRepository(this.blogRepository_);

      const blog = blogRepo.create();

      if (Object.keys(this.validateblog(data)).length > 0) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          JSON.stringify(this.validateblog(data)),
          '400'
        );
      }

      blog.title = data.title;
      blog.content = data.content;

      const result = await blogRepo.save(blog);
      return result;
    });
  }

  async listAndCount(
    selector?: Selector<Blog>,
    config: FindConfig<Blog> = {
      relations: [],
      take: 10,
      skip: 0,
    }
  ): Promise<[Blog[], number]> {
    try {
      const blogRepo = this.activeManager_.withRepository(this.blogRepository_);
      const query = buildQuery(selector, config);
      return await blogRepo.findAndCount(query);
    } catch (error) {
      throw new MedusaError('Unable to fetch blog', error.message, '500');
    }
  }

  async list(
    selector?: Selector<Blog>,
    config: FindConfig<Blog> = {
      relations: [],
      take: 20,
      skip: 0,
    }
  ): Promise<Blog[]> {
    try {
      const [blogs] = await this.listAndCount(selector, config);
      return blogs;
    } catch (error) {
      throw new MedusaError('Unable to fetch blogs', error.message, '500');
    }
  }

  async retrieve(id: string, config?: FindConfig<Blog>): Promise<Blog> {
    try {
      const blogRepo = this.activeManager_.withRepository(this.blogRepository_);

      const query = buildQuery({ id }, config);
      const blog = await blogRepo.findOne(query);

      if (!blog) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `blog with id: ${id} was not found`
        );
      }

      return blog;
    } catch (error) {
      throw new MedusaError('Unable to retrieve blog', error.message, '500');
    }
  }

  async update(id: string, data: Omit<Partial<Blog>, 'id'>): Promise<Blog> {
    return await this.atomicPhase_(
      async (transactionManager: EntityManager) => {
        try {
          const blogRepo = transactionManager.withRepository(
            this.blogRepository_
          );

          const blog = await this.retrieve(id);

          Object.assign(blog, data);
          return await blogRepo.save(blog);
        } catch (error) {
          throw new MedusaError('Unable to update blog', error.message, '500');
        }
      }
    );
  }

  async delete(id: string): Promise<void> {
    return await this.atomicPhase_(
      async (transactionManager: EntityManager) => {
        try {
          const blogRepo = transactionManager.withRepository(
            this.blogRepository_
          );

          const blog = await this.retrieve(id);
          await blogRepo.remove(blog);
        } catch (error) {
          throw new MedusaError('Unable to delete blog', error.message, '500');
        }
      }
    );
  }

  private validateblog(data: CreateBlog): { [key: string]: string } {
    let errors: { [key: string]: string } = {};
    if (!data.title || data.title.length < 3) {
      errors.title = 'Title is required';
    }

    if (!data.content || data.content.length < 3) {
      errors.content = 'Content is required';
    }
    return errors;
  }
}

export default BlogService;
