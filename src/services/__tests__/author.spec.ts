import { EntityManager } from 'typeorm';
import { Author } from '../../models/author';
import AuthorService from '../author';

describe('AuthorService', () => {
  let authorService: AuthorService;
  let entityManager: EntityManager;

  beforeEach(() => {
    entityManager = {} as EntityManager;
    authorService = new AuthorService({ authorRepository: {} } as any);
    authorService.activeManager_ = entityManager;
  });

  describe('create', () => {
    it('should create a new author', async () => {
      const authorData: Partial<Author> = {
        name: 'John Doe',
        email: 'johndoe@example.com',
      };

      const author = {} as Author;
      const authorRepo = {
        create: jest.fn().mockReturnValue(author),
        save: jest.fn().mockReturnValue(author),
      };
      entityManager.withRepository = jest.fn().mockReturnValue(authorRepo);

      const result = await authorService.create(authorData);

      expect(entityManager.withRepository).toHaveBeenCalledWith(
        authorService.authorRepository_
      );
      expect(authorRepo.create).toHaveBeenCalled();
      expect(authorRepo.save).toHaveBeenCalledWith(author);
      expect(result).toBe(author);
    });

    it('should throw an error if author data is invalid', async () => {
      const authorData: Partial<Author> = {
        name: 'Jo',
        email: 'johndoe',
      };

      await expect(authorService.create(authorData)).rejects.toThrow(
        'INVALID_DATA'
      );
    });

    it('should throw an error if author with email already exists', async () => {
      const authorData: Partial<Author> = {
        name: 'John Doe',
        email: 'johndoe@example.com',
      };

      const authorRepo = {
        findOne: jest.fn().mockReturnValue({}),
      };
      entityManager.withRepository = jest.fn().mockReturnValue(authorRepo);

      await expect(authorService.create(authorData)).rejects.toThrow(
        'CONFLICT'
      );
    });
  });

  describe('listAndCount', () => {
    it('should list and count authors', async () => {
      const authors = [{}] as Author[];
      const authorRepo = {
        findAndCount: jest.fn().mockReturnValue([authors, 1]),
      };
      entityManager.withRepository = jest.fn().mockReturnValue(authorRepo);

      const result = await authorService.listAndCount();

      expect(entityManager.withRepository).toHaveBeenCalledWith(
        authorService.authorRepository_
      );
      expect(authorRepo.findAndCount).toHaveBeenCalled();
      expect(result).toEqual([authors, 1]);
    });

    it('should throw an error if unable to fetch authors', async () => {
      const authorRepo = {
        findAndCount: jest.fn().mockRejectedValue(new Error('Failed')),
      };
      entityManager.withRepository = jest.fn().mockReturnValue(authorRepo);

      await expect(authorService.listAndCount()).rejects.toThrow('Failed');
    });
  });

  describe('list', () => {
    it('should list authors', async () => {
      const authors = [{}] as Author[];
      const authorRepo = {
        findAndCount: jest.fn().mockReturnValue([authors, 1]),
      };
      entityManager.withRepository = jest.fn().mockReturnValue(authorRepo);

      const result = await authorService.list();

      expect(entityManager.withRepository).toHaveBeenCalledWith(
        authorService.authorRepository_
      );
      expect(authorRepo.findAndCount).toHaveBeenCalled();
      expect(result).toEqual(authors);
    });

    it('should throw an error if unable to fetch authors', async () => {
      const authorRepo = {
        findAndCount: jest.fn().mockRejectedValue(new Error('Failed')),
      };
      entityManager.withRepository = jest.fn().mockReturnValue(authorRepo);

      await expect(authorService.list()).rejects.toThrow('Failed');
    });
  });

  describe('retrieve', () => {
    it('should retrieve an author by id', async () => {
      const author = {} as Author;
      const authorRepo = {
        findOne: jest.fn().mockReturnValue(author),
      };
      entityManager.withRepository = jest.fn().mockReturnValue(authorRepo);

      const result = await authorService.retrieve('1');

      expect(entityManager.withRepository).toHaveBeenCalledWith(
        authorService.authorRepository_
      );
      expect(authorRepo.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: [],
      });
      expect(result).toBe(author);
    });

    it('should throw an error if author is not found', async () => {
      const authorRepo = {
        findOne: jest.fn().mockReturnValue(undefined),
      };
      entityManager.withRepository = jest.fn().mockReturnValue(authorRepo);

      await expect(authorService.retrieve('1')).rejects.toThrow('NOT_FOUND');
    });

    it('should throw an error if unable to retrieve author', async () => {
      const authorRepo = {
        findOne: jest.fn().mockRejectedValue(new Error('Failed')),
      };
      entityManager.withRepository = jest.fn().mockReturnValue(authorRepo);

      await expect(authorService.retrieve('1')).rejects.toThrow('Failed');
    });
  });

  describe('update', () => {
    it('should update an author by id', async () => {
      const author = { id: '1' } as Author;
      const authorRepo = {
        findOne: jest.fn().mockReturnValue(author),
        save: jest.fn().mockReturnValue(author),
      };
      entityManager.withRepository = jest.fn().mockReturnValue(authorRepo);

      const result = await authorService.update('1', { name: 'Jane Doe' });

      expect(entityManager.withRepository).toHaveBeenCalledWith(
        authorService.authorRepository_
      );
      expect(authorRepo.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(authorRepo.save).toHaveBeenCalledWith(author);
      expect(author.name).toBe('Jane Doe');
      expect(result).toBe(author);
    });

    it('should throw an error if author is not found', async () => {
      const authorRepo = {
        findOne: jest.fn().mockReturnValue(undefined),
      };
      entityManager.withRepository = jest.fn().mockReturnValue(authorRepo);

      await expect(
        authorService.update('1', { name: 'Jane Doe' })
      ).rejects.toThrow('NOT_FOUND');
    });

    it('should throw an error if unable to update author', async () => {
      const authorRepo = {
        findOne: jest.fn().mockReturnValue({}),
        save: jest.fn().mockRejectedValue(new Error('Failed')),
      };
      entityManager.withRepository = jest.fn().mockReturnValue(authorRepo);

      await expect(
        authorService.update('1', { name: 'Jane Doe' })
      ).rejects.toThrow('Failed');
    });
  });

  describe('delete', () => {
    it('should delete an author by id', async () => {
      const author = { id: '1' } as Author;
      const authorRepo = {
        findOne: jest.fn().mockReturnValue(author),
        remove: jest.fn(),
      };
      entityManager.withRepository = jest.fn().mockReturnValue(authorRepo);

      await authorService.delete('1');

      expect(entityManager.withRepository).toHaveBeenCalledWith(
        authorService.authorRepository_
      );
      expect(authorRepo.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(authorRepo.remove).toHaveBeenCalledWith(author);
    });

    it('should throw an error if author is not found', async () => {
      const authorRepo = {
        findOne: jest.fn().mockReturnValue(undefined),
      };
      entityManager.withRepository = jest.fn().mockReturnValue(authorRepo);

      await expect(authorService.delete('1')).rejects.toThrow('NOT_FOUND');
    });

    it('should throw an error if unable to delete author', async () => {
      const authorRepo = {
        findOne: jest.fn().mockReturnValue({}),
        remove: jest.fn().mockRejectedValue(new Error('Failed')),
      };
      entityManager.withRepository = jest.fn().mockReturnValue(authorRepo);

      await expect(authorService.delete('1')).rejects.toThrow('Failed');
    });
  });
});
