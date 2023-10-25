import { Request, Response } from 'express';
import { EntityManager } from 'typeorm';
import { TResponse } from '../types';
import PostService from '../../../../services/post';

export default async function createPost(req: Request, res: Response) {
  try {
    const postService: PostService = req.scope.resolve('postService');
    const manager: EntityManager = req.scope.resolve('manager');

    const post = await manager.transaction(async (transactionManager) => {
      return await postService
        .withTransaction(transactionManager)
        .create(req.body);
    });

    const response: TResponse<typeof post> = {
      message: 'Post created successfully',
      data: post,
    };

    res.status(201).json(response);
  } catch (error) {
    if (+error.code === 400) {
      res.status(+error.code).json({
        ...error,
        message: JSON.parse(error.message),
      });
    } else {
      res.status(+error.code).json(error);
    }
  }
}
