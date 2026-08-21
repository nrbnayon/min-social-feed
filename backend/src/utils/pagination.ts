export const pagination = (page = 1, limit = 20) => ({ page: Math.max(1, page), limit: Math.min(50, Math.max(1, limit)) });
