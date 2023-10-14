import { Request, Response } from 'express';
import { EntityManager } from 'typeorm';
import { TResponse } from '../types';
import PostService from '../../../../services/post';

export default async function getPost(req: Request, res: Response) {
  const postService: PostService = req.scope.resolve('postService');
  const manager: EntityManager = req.scope.resolve('manager');

  const posts = await manager.transaction(async (transactionManager) => {
    return await postService
      .withTransaction(transactionManager)
      .list(req.query);
  });

  const response: TResponse<typeof posts> = {
    message: 'Fetched post successfully',
    data: posts,
  };

  res.status(200).json(response);
}
