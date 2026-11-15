export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}
export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  res.status(status).json({
    message: err.code === 11000 ? 'A record with this information already exists.' : (err.message || 'Server error'),
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
}
