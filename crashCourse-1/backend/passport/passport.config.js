import passport from "passport";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import User from "../models/user.model.js";

import { GraphQLLocalStrategy } from "graphql-passport";

dotenv.config();

export const configurePassport = async () => {
  passport.serializeUser((user, done) => {
    console.log("seralizing user");
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  passport.use(
    new GraphQLLocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username });

        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        const validPassword = bcrypt.compare(password, user.password);

        if (!validPassword) {
          return done(null, false, { message: "Invalid password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
};
