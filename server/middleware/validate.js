export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Invalid input",
        details: result.error.issues.map((issue) => ({
          field: issue.path.join(".") || "root",
          message: issue.message,
        })),
      });
    }

    req.body = result.data;
    return next();
  };
}
