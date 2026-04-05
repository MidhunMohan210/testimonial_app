export const createHttpError = (
  statusCode,
  message,
  body = { message },
) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.body = body;
  return err;
};
