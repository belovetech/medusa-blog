import { Request, Response } from 'express';
import { EntityManager } from 'typeorm';
import { TResponse } from '../../blog/types';
import BlogService from '../../../../services/blog';
import { Blog } from '../../../../models/blog';

export default async function deletePost(req: Request, res: Response) {
  try {
    const blogService: BlogService = req.scope.resolve('blogService');
    const manager: EntityManager = req.scope.resolve('manager');

    await manager.transaction(async (transactionManager) => {
      return await blogService
        .withTransaction(transactionManager)
        .delete(req.params.id);
    });

    const response: TResponse<Blog> = {
      message: 'Post deleted successfully',
    };

    res.status(204).json(response);
  } catch (error) {
    res.status(+error.code).json(error);
  }
}
