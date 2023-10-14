import { wrapHandler } from '@medusajs/medusa';
import { Router } from 'express';
import createAuthor from './create-author';

const router = Router();

export default (blogRouter: Router) => {
  blogRouter.use('/author', router);

  router.post('/', wrapHandler(createAuthor));
};
