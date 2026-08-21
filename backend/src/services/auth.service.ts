import { User } from "../models/User.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";

const publicUser = (user: InstanceType<typeof User>) => ({ id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl });
export const register = async (input: { username: string; email: string; password: string }) => {
  const user = await User.create({ ...input, passwordHash: await hashPassword(input.password) });
  return { user: publicUser(user), token: signToken({ userId: user.id }) };
};
export const login = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !(await comparePassword(password, user.passwordHash))) throw new Error("Invalid email or password");
  return { user: publicUser(user), token: signToken({ userId: user.id }) };
};
