import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

/** Collects express-validator results and 400s with the first message. */
export function validate(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    throw new ApiError(400, first.msg);
  }
  next();
}
