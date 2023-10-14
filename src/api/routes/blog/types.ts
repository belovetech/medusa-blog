export type TResponse<T> = {
  message: string;
  results?: number;
  data?: T;
};
