import { Request, Response } from 'express';
import { EntityManager } from 'typeorm';
import AuthorService from '../../../../services/author';
import { TResponse } from '../types';

export default async function updateAuthor(req: Request, res: Response) {
  const authorService: AuthorService = req.scope.resolve('authorService');
  const manager: EntityManager = req.scope.resolve('manager');

  const author = await manager.transaction(async (transactionManager) => {
    return await authorService
      .withTransaction(transactionManager)
      .update(req.params.id, req.body);
  });

  const response: TResponse<typeof author> = {
    message: 'Author Updated successfully',
    data: author,
  };

  res.status(200).json(response);
}
