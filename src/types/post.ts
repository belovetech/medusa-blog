import { Post } from '../models/post';

export type CreatePostDto = {
  title: string;
  content: string;
  author_id: string;
};
