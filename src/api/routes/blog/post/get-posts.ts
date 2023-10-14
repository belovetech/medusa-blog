import { Request, Response } from 'express';
import { EntityManager } from 'typeorm';
import { TResponse } from '../types';
import PostService from '../../../../services/post';

export default async function getPosts(req: Request, res: Response) {
  try {
    const postService: PostService = req.scope.resolve('postService');
    const manager: EntityManager = req.scope.resolve('manager');

    const [posts, count] = await manager.transaction(
      async (transactionManager) => {
        return await postService
          .withTransaction(transactionManager)
          .listAndCount(req.query);
      }
    );

    const response: TResponse<typeof posts> = {
      message: 'Fetched post successfully',
      results: count,
      data: posts,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(+error.code).json(error);
  }
}
