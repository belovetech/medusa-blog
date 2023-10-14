import { Request, Response } from 'express';
import { EntityManager } from 'typeorm';
import { TResponse } from '../types';
import PostService from '../../../../services/post';

export default async function updatePost(req: Request, res: Response) {
  const postService: PostService = req.scope.resolve('postService');
  const manager: EntityManager = req.scope.resolve('manager');

  const post = await manager.transaction(async (transactionManager) => {
    return await postService
      .withTransaction(transactionManager)
      .update(req.params.id, req.body);
  });

  const response: TResponse<typeof post> = {
    message: 'Post updated successfully',
    data: post,
  };

  res.status(200).json(response);
}
