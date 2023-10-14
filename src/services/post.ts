import {
  TransactionBaseService,
  FindConfig,
  Selector,
  buildQuery,
} from '@medusajs/medusa';
import { MedusaError } from '@medusajs/utils';
import PostRepository from '../repositories/post';
import { Post } from '../models/post';
import { CreatePostDto } from 'src/types/post';

class PostService extends TransactionBaseService {
  protected postRepository_: typeof PostRepository;
  constructor(container) {
    super(container);

    this.postRepository_ = container.postRepository;
  }

  async create(data: CreatePostDto): Promise<Post> {
    return this.atomicPhase_(async (manager) => {
      const postRepo = manager.withRepository(this.postRepository_);
      const post = await postRepo.create();

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
    const postRepo = await this.activeManager_.withRepository(
      this.postRepository_
    );

    const query = buildQuery(selector, config);
    return postRepo.findAndCount(query);
  }

  async list(
    selector?: Selector<Post>,
    config: FindConfig<Post> = {
      relations: ['author'],
      take: 20,
      skip: 0,
    }
  ): Promise<Post[]> {
    const [posts] = await this.listAndCount(selector, config);
    return posts;
  }

  async retrieve(id: string, config?: FindConfig<Post>): Promise<Post> {
    const postRepo = await this.activeManager_.withRepository(
      this.postRepository_
    );

    const query = buildQuery({ id }, config);
    const post = await postRepo.findOne(query);

    if (!post) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Post with id: ${id} was not found`
      );
    }

    return post;
  }

  async update(id: string, data: Omit<Partial<Post>, 'id'>): Promise<Post> {
    return await this.atomicPhase_(async (manager) => {
      const postRepo = manager.withRepository(this.postRepository_);

      const post = await this.retrieve(id);

      if (!post) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Post with id: ${id} was not found`
        );
      }

      Object.assign(post, data);
      return await postRepo.save(post);
    });
  }

  async delete(id: string): Promise<void> {
    return await this.atomicPhase_(async (manager) => {
      const postRepo = manager.withRepository(this.postRepository_);

      const post = await this.retrieve(id);

      if (!post) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Post with id: ${id} was not found`
        );
      }

      await postRepo.remove(post);
    });
  }
}

export default PostService;
