import { hashPassword, comparePassword } from "../../../src/utils/password.js";

describe("Password Utilities", () => {
  it("should hash a password and verify matching hash", async () => {
    const rawPassword = "SecurePassword123!";
    const hash = await hashPassword(rawPassword);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(rawPassword);

    const isMatch = await comparePassword(rawPassword, hash);
    expect(isMatch).toBe(true);
  });

  it("should return false for mismatched password", async () => {
    const rawPassword = "SecurePassword123!";
    const wrongPassword = "WrongPassword456!";
    const hash = await hashPassword(rawPassword);

    const isMatch = await comparePassword(wrongPassword, hash);
    expect(isMatch).toBe(false);
  });
});
