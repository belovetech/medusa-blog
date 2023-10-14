import { Router } from 'express';
import { wrapHandler } from '@medusajs/medusa';
import authorRoute from './author';
import postRoute from './post';
import customRouteHandler from './custom-route-handler';

const router = Router();

export function attachBlogRoutes(blogRouter: Router) {
  // Attach our router to a custom path on the blog router
  blogRouter.use('/custom', router);

  // Define a GET endpoint on the root route of our custom path
  router.get('/', wrapHandler(customRouteHandler));

  // Attach routes for blog experience, defined separately
  authorRoute(blogRouter);
  postRoute(blogRouter);
}
