import { wrapHandler } from '@medusajs/medusa';
import { Router } from 'express';
import createPost from './create-post';
import updatePost from './update-post';
import deletePost from './delete-post';
import getPosts from './get-posts';
import getPost from './get-post';

const router = Router();

export default (blogRouter: Router) => {
  blogRouter.use('/post', router);

  router.post('/', wrapHandler(createPost));
  router.put('/:id', wrapHandler(updatePost));
  router.delete('/:id', wrapHandler(deletePost));
  router.get('/', wrapHandler(getPosts));
  router.get('/:id', wrapHandler(getPost));
};
