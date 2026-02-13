export interface ApiResult<T> {
  success?: boolean;
  message?: string;
  data?: T;

  Success?: boolean;
  Message?: string;
  Data?: T;
}
