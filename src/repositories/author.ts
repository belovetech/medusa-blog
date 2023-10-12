import { dataSource } from '@medusajs/medusa/dist/loaders/database';
import { Author } from '../models/author';

const AuthorRepository = dataSource.getRepository(Author);
export default AuthorRepository;
