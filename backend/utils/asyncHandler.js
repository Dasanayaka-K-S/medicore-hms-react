/**
 * Wraps an async Express route handler so any thrown error / rejected
 * promise is passed to next(), landing in the central error handler
 * instead of crashing the process or leaking a raw stack trace.
 */
module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
