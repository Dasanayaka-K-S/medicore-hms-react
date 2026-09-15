/**
 * Central error handler. Logs the real error server-side but only ever
 * sends a generic, safe message to the client - never a stack trace,
 * SQL text, or DB credentials.
 */
function notFoundHandler(req, res) {
  res.status(404).json({ message: 'The requested resource was not found.' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  // Known MySQL duplicate-entry error -> friendly message
  if (err && err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'A record with these details already exists.' });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Something went wrong on our end. Please try again.' : err.message;

  res.status(status).json({ message });
}

module.exports = { notFoundHandler, errorHandler };
