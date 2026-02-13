// Async handler wrapper so it eliminates try/catch boilerplate 
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);


