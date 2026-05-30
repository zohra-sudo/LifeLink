/** 404 for unmatched API routes. */
export function notFound(_req, res) {
  res.status(404).json({ error: "Resource not found" });
}

/** Central error handler — normalizes Mongoose + custom errors. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || { field: "" })[0];
    message = `${field || "Value"} already in use`;
  }
  // Mongoose validation
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)[0]?.message || "Validation failed";
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ error: message });
}
