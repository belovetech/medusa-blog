import { Router } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { authenticate, ConfigModule, errorHandler } from '@medusajs/medusa';
import { getConfigFile } from 'medusa-core-utils';
import { attachStoreRoutes } from './routes/store';
import { attachAdminRoutes } from './routes/admin';
import { attachBlogRoutes } from './routes/blog';

export default (rootDirectory: string): Router | Router[] => {
  // Read currently-loaded medusa config
  const { configModule } = getConfigFile<ConfigModule>(
    rootDirectory,
    'medusa-config'
  );
  const { projectConfig } = configModule;

  // Set up our CORS options objects, based on config
  const storeCorsOptions = {
    origin: projectConfig.store_cors.split(','),
    credentials: true,
  };

  const adminCorsOptions = {
    origin: projectConfig.admin_cors.split(','),
    credentials: true,
  };

  // Set up express router
  const router = Router();

  // Set up root routes for store and admin endpoints, with appropriate CORS settings
  router.use('/store', cors(storeCorsOptions), bodyParser.json());
  router.use('/admin', cors(adminCorsOptions), bodyParser.json());
  router.use('/blog', bodyParser.json());

  // Add authentication to all admin routes *except* auth and account invite ones
  router.use(
    /\/admin\/((?!auth)(?!invites)(?!users\/reset-password)(?!users\/password-token).*)/,
    authenticate()
  );

  // Set up routers for store and admin endpoints
  const storeRouter = Router();
  const adminRouter = Router();
  const blogRouter = Router();

  // Attach these routers to the root routes
  router.use('/store', storeRouter);
  router.use('/admin', adminRouter);
  router.use('/blog', blogRouter);

  // Attach custom routes to these routers
  attachStoreRoutes(storeRouter);
  attachAdminRoutes(adminRouter);
  attachBlogRoutes(blogRouter);

  // Attach error handler  middleware
  router.use(errorHandler());

  return router;
};
