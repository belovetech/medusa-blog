import { Request, Response } from 'express';
import { EntityManager } from 'typeorm';
import { TResponse } from '../../blog/types';
import BlogService from '../../../../services/blog';

export default async function createPost(req: Request, res: Response) {
  try {
    const blogService: BlogService = req.scope.resolve('blogService');
    const manager: EntityManager = req.scope.resolve('manager');

    const post = await manager.transaction(async (transactionManager) => {
      return await blogService
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
