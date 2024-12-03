import { users } from "../dummyData/data.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
const userResolver = {
  Mutation: {
    signUp: async (_, { input }, context) => {
      try {
        const { username, name, password, gender } = input;

        if (!username || !name || !password || !gender) {
          throw new Error("All fields are required");
        }

        const existingUser = await User.findOne({ username });

        if (existingUser) {
          throw new Error("Username already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
          username,
          name,
          password: hashedPassword,
          gender,
        });

        return res.status(201).json({
          message: "User created successfully",
          user,
        });
      } catch (error) {
        console.log(error);
      }
    },
  },
  Query: {
    users: (_, _, { req, res }) => {
      return users;
    },
    user: (_, { userId }) => {
      return users.find((item) => item._id === userId);
    },
  },
};
export default userResolver;
