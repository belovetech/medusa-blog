import { Request, Response } from 'express';
import { EntityManager } from 'typeorm';
import AuthorService from '../../../../services/author';
import { TResponse } from '../types';
import { Author } from '../../../../models/author';

export default async function deleteAuthors(req: Request, res: Response) {
  try {
    const authorService: AuthorService = req.scope.resolve('authorService');
    const manager: EntityManager = req.scope.resolve('manager');

    await manager.transaction(async (transactionManager) => {
      return await authorService
        .withTransaction(transactionManager)
        .delete(req.params.id);
    });

    const response: TResponse<Author> = {
      message: `Author with id: ${req.params.id} was deleted successfully`,
    };

    res.status(204).json(response);
  } catch (error) {
    res.status(+error.code).json(error);
  }
}
