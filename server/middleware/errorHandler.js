export const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";
  const isServerError = statusCode >= 500;

  if (err.body) {
    return res.status(statusCode).json(err.body);
  }

  res.status(statusCode).json({
    error:
      isProduction && isServerError
        ? "Internal Server Error"
        : err.message || "Internal Server Error",
  });
};
