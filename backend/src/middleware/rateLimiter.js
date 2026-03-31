import rateLimit from "express-rate-limit";

function retryAfterSeconds(res) {
  const reset = res.getHeader("RateLimit-Reset");
  if (!reset) return null;
  return Math.ceil(Number(reset));
}

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler(req, res) {
    res.status(429).json({
      error: "Too many requests, please try again later.",
      retryAfter: retryAfterSeconds(res),
    });
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler(req, res) {
    res.status(429).json({
      error: "Too many login attempts, please try again later.",
      retryAfter: retryAfterSeconds(res),
    });
  },
});
