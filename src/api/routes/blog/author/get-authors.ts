import { Request, Response } from 'express';
import { EntityManager } from 'typeorm';
import AuthorService from '../../../../services/author';
import { TResponse } from '../types';

export default async function getAuthors(req: Request, res: Response) {
  try {
    const authorService: AuthorService = req.scope.resolve('authorService');
    const manager: EntityManager = req.scope.resolve('manager');

    const [authors, count] = await manager.transaction(
      async (transactionManager) => {
        return await authorService
          .withTransaction(transactionManager)
          .listAndCount(req.query);
      }
    );

    const response: TResponse<typeof authors> = {
      message: 'Fetch Authors successfully',
      results: count,
      data: authors,
    };

    res.status(200).json(response);
  } catch (error) {
   res.status(+error.code).json(error);
  }
}
