import {
  TransactionBaseService,
  FindConfig,
  Selector,
  buildQuery,
} from '@medusajs/medusa';
import { EntityManager } from 'typeorm';
import { MedusaError } from '@medusajs/utils';
import PostRepository from '../repositories/post';
import { Post } from '../models/post';
import { CreatePostDto } from '../types/post';

type InjectedDependencies = {
  manager: EntityManager;
  postRepository: typeof PostRepository;
};

class PostService extends TransactionBaseService {
  protected postRepository_: typeof PostRepository;

  constructor({ postRepository }: InjectedDependencies) {
    super(arguments[0]);

    this.postRepository_ = postRepository;
  }

  async create(data: CreatePostDto): Promise<Post> {
    return this.atomicPhase_(async (transactionManager) => {
      const postRepo = transactionManager.withRepository(this.postRepository_);

      const post = postRepo.create();

      if (Object.keys(this.validatePost(data)).length > 0) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          JSON.stringify(this.validatePost(data)),
          '400'
        );
      }

      post.title = data.title;
      post.content = data.content;
      post.author_id = data.author_id;

      const result = await postRepo.save(post);
      return result;
    });
  }

  async listAndCount(
    selector?: Selector<Post>,
    config: FindConfig<Post> = {
      relations: ['author'],
      take: 10,
      skip: 0,
    }
  ): Promise<[Post[], number]> {
    try {
      const postRepo = this.activeManager_.withRepository(this.postRepository_);
      const query = buildQuery(selector, config);
      return await postRepo.findAndCount(query);
    } catch (error) {
      throw new MedusaError('Unable to fetch posts', error.message, '500');
    }
  }

  async list(
    selector?: Selector<Post>,
    config: FindConfig<Post> = {
      relations: ['author'],
      take: 20,
      skip: 0,
    }
  ): Promise<Post[]> {
    try {
      const [posts] = await this.listAndCount(selector, config);
      return posts;
    } catch (error) {
      throw new MedusaError('Unable to fetch posts', error.message, '500');
    }
  }

  async retrieve(id: string, config?: FindConfig<Post>): Promise<Post> {
    try {
      const postRepo = this.activeManager_.withRepository(this.postRepository_);

      const query = buildQuery({ id }, config);
      const post = await postRepo.findOne(query);

      if (!post) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Post with id: ${id} was not found`
        );
      }

      return post;
    } catch (error) {
      throw new MedusaError('Unable to retrieve posts', error.message, '500');
    }
  }

  async update(id: string, data: Omit<Partial<Post>, 'id'>): Promise<Post> {
    return await this.atomicPhase_(
      async (transactionManager: EntityManager) => {
        try {
          const postRepo = transactionManager.withRepository(
            this.postRepository_
          );

          const post = await this.retrieve(id);

          Object.assign(post, data);
          return await postRepo.save(post);
        } catch (error) {
          throw new MedusaError('Unable to update posts', error.message, '500');
        }
      }
    );
  }

  async delete(id: string): Promise<void> {
    return await this.atomicPhase_(
      async (transactionManager: EntityManager) => {
        try {
          const postRepo = transactionManager.withRepository(
            this.postRepository_
          );

          const post = await this.retrieve(id);
          await postRepo.remove(post);
        } catch (error) {
          throw new MedusaError('Unable to delete posts', error.message, '500');
        }
      }
    );
  }

  private validatePost(data: CreatePostDto): { [key: string]: string } {
    let errors: { [key: string]: string } = {};
    if (!data.title || data.title.length < 3) {
      errors.title = 'Title is required';
    }

    if (!data.content || data.content.length < 3) {
      errors.content = 'Content is required';
    }

    if (!data.author_id) {
      errors.author_id = 'Author is required';
    }
    return errors;
  }
}

export default PostService;
