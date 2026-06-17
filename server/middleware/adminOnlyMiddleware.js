import { createHttpError } from "../utils/httpError.js";

const adminOnlyMiddleware = (req, res, next) => {
  if (!req.user) {
    return next(createHttpError(401, "Unauthorized"));
  }

  if (req.user.role !== "admin") {
    return next(createHttpError(403, "Forbidden"));
  }

  return next();
};

export default adminOnlyMiddleware;
