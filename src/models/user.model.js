import mongoose, { Schema } from "mongoose";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Add index for faster search
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);
//pre and post hooks next is accept in parameter
userSchema.pre("save", async function (next) {
  //if password isNotModified
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    console.log("password after encrypt", this.password);
    next();
  } catch (error) {
    console.log("😭😭 got error");
    return next(error);
  }
});

//function trigger create access and refresh token database

userSchema.method.generateAccessToken = function () {
  //payload
  Jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

userSchema.method.generateRefreshToken = function () {
  Jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

export const User = mongoose.model("User", userSchema);

/* 
const obj = {
  name: "MyObject",
  arrowFunc: () => {
    console.log("Arrow:", this.name);
  },
  regularFunc: function () {
    console.log("Regular:", this.name);
  },
};

obj.arrowFunc();     // Arrow: undefined (or global object's name, if in browser)
obj.regularFunc();   // Regular: MyObject


If someone steals a JWT (like via XSS or man-in-the-middle attack), they can impersonate the user. If the token never expires, the attacker has unlimited access. Expiration limits that window.

2. Allow logout and permission changes
If your app supports logout, revoking permissions, or role changes, an expired token naturally phases out access.

*/
