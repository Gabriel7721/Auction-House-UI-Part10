export type ApiMessageResponse = {
  message?: string;
};

export type ApiErrorResponse = {
  message?: string;
  error?: string;
};

export type ApiDataResponse<T> = {
  data: T;
  message?: string;
};
