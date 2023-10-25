import { Request, Response } from 'express';
import { EntityManager } from 'typeorm';
import { TResponse } from '../types';
import PostService from '../../../../services/post';
import { Post } from '../../../../models/post';

export default async function deletePost(req: Request, res: Response) {
  try {
    const postService: PostService = req.scope.resolve('postService');
    const manager: EntityManager = req.scope.resolve('manager');

    await manager.transaction(async (transactionManager) => {
      return await postService
        .withTransaction(transactionManager)
        .delete(req.params.id);
    });

    const response: TResponse<Post> = {
      message: 'Post deleted successfully',
    };

    res.status(204).json(response);
  } catch (error) {
res.status(+error.code).json(error);
  }
}
