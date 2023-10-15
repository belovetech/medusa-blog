import { Request, Response } from 'express';
import { EntityManager } from 'typeorm';
import { TResponse } from '../../blog/types';
import BlogService from '../../../../services/post';

export default async function updatePost(req: Request, res: Response) {
  try {
    const blogService: BlogService = req.scope.resolve('blogService');
    const manager: EntityManager = req.scope.resolve('manager');

    const post = await manager.transaction(async (transactionManager) => {
      return await blogService
        .withTransaction(transactionManager)
        .update(req.params.id, req.body);
    });

    const response: TResponse<typeof post> = {
      message: 'Post updated successfully',
      data: post,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(+error.code).json(error);
  }
}
