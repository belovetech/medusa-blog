import { Request, Response } from 'express';
import { EntityManager } from 'typeorm';
import AuthorService from '../../../../services/author';
import { TResponse } from '../types';

export default async function getAuthor(req: Request, res: Response) {
  const authorService: AuthorService = req.scope.resolve('authorService');
  const manager: EntityManager = req.scope.resolve('manager');

  const authors = await manager.transaction(async (transactionManager) => {
    return await authorService
      .withTransaction(transactionManager)
      .list(req.query);
  });

  const response: TResponse<typeof authors> = {
    message: 'Fetch Authors successfully',
    data: authors,
  };

  res.status(200).json(response);
}
