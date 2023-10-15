import { dataSource } from '@medusajs/medusa/dist/loaders/database';
import { Blog } from '../models/blog';

const blogRepository = dataSource.getRepository(Blog);
export default blogRepository;
