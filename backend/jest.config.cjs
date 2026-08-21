module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts", "**/src/**/__tests__/**/*.test.ts"],
  setupFiles: ["<rootDir>/tests/setup.ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.[tj]sx?$": [
      "ts-jest",
      {
        tsconfig: {
          module: "CommonJS",
          moduleResolution: "node",
          esModuleInterop: true,
          target: "ES2022",
          allowJs: true,
        },
      },
    ],
  },
  transformIgnorePatterns: ["node_modules/(?!(expo-server-sdk)/)"],
  clearMocks: true,
  restoreMocks: true,
};
