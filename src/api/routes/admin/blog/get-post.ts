import { Request, Response } from 'express';
import { EntityManager } from 'typeorm';
import { TResponse } from '../../blog/types';
import BlogService from '../../../../services/blog';

export default async function getPost(req: Request, res: Response) {
  try {
    const blogService: BlogService = req.scope.resolve('blogService');
    const manager: EntityManager = req.scope.resolve('manager');

    const posts = await manager.transaction(async (transactionManager) => {
      return await blogService
        .withTransaction(transactionManager)
        .list(req.query);
    });

    const response: TResponse<typeof posts> = {
      message: 'Fetched post successfully',
      data: posts,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(+error.code).json(error);
  }
}
