import { wrapHandler } from '@medusajs/medusa';
import { Router } from 'express';
import createAuthor from './create-author';
import updateAuthor from './update-author';
import deleteAuthor from './delete-author';
import getAuthors from './get-authors';
import getAuthor from './get-author';

const router = Router();

export default (blogRouter: Router) => {
  blogRouter.use('/author', router);

  router.post('/', wrapHandler(createAuthor));
  router.put('/:id', wrapHandler(updateAuthor));
  router.delete('/:id', wrapHandler(deleteAuthor));
  router.get('/', wrapHandler(getAuthors));
  router.get('/:id', wrapHandler(getAuthor));
};
