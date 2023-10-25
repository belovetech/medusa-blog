import { Request, Response } from 'express';
import { EntityManager } from 'typeorm';
import AuthorService from '../../../../services/author';
import { TResponse } from '../types';

export default async function createAuthor(req: Request, res: Response) {
  try {
    const authorService: AuthorService = req.scope.resolve('authorService');
    const manager: EntityManager = req.scope.resolve('manager');

    const author = await manager.transaction(async (transactionManager) => {
      return await authorService
        .withTransaction(transactionManager)
        .create(req.body);
    });

    const response: TResponse<typeof author> = {
      message: 'Author created successfully',
      data: author,
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
