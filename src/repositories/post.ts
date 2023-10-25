import { dataSource } from '@medusajs/medusa/dist/loaders/database';
import { Post } from '../models/post';

const PostRepository = dataSource.getRepository(Post);
export default PostRepository;
