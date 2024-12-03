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

        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;

        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

        const profilePic = gender === "male" ? boyProfilePic : girlProfilePic;

        const user = await User.create({
          username,
          name,
          password: hashedPassword,
          gender,
          profilePic,
        });
        await context.login(user);
        return res.status(201).json({
          message: "User created successfully",
          user,
        });
      } catch (error) {
        console.log(error);
      }
    },
    login: async (_, { input }, context) => {
      try {
        const { username, password } = input;
        const { user } = await context.authenticate("session", {
          username,
          password,
        });

        await context.login(user);
        return user;
      } catch (error) {
        console.log(error);
        res.status(401).json({ message: "Invalid credentials" });
      }
    },
    logout: async (_, __, { req, res }) => {
      try {
        await context.logout();
        req.session.destroy((err) => {
          if (err) throw err;
          res.clearCookie("connect.sid");
          res.status(200).json({ message: "Logged out successfully" });
        });
      } catch (error) {
        console.log(error);
        res.status(401).json({ message: "error in logout" });
      }
    },
  },
  Query: {
    authUser: async (_, _, context) => {
      try {
        const user = await context.getUser();
        return user;
      } catch (error) {
        throw new Error("Internal server error");
      }
    },
    user: async (_, { userId }) => {
      try {
        const user = await User.findById(userId);
        return user;
      } catch (error) {
        throw new Error("Internal server error" || error.message);
      }
    },
  },
};
export default userResolver;
