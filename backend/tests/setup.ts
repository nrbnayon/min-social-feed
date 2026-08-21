// Set default test environment variables before anything is imported
process.env.NODE_ENV = "test";
process.env.PORT = "5000";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-key-12345";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test-jwt-refresh-secret-key-12345";
process.env.DATABASE_URL = process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/test-min-social";
process.env.CLIENT_ORIGIN = "*";
