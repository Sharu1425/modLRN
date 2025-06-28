import User from "../models/user.js";
import bcrypt from "bcryptjs";

const loginUser = async (email, password) => {
    try {
        const user = await User.findOne({ email });
        if (!user) return { status: 500, error: "Username not found" };
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return { status: 500, error: "Password does not match" };
        return { status: 200, message: "Login Successful", user: user }
    } catch (error) {
        return { status: 400, error: "Error logging in" }
    }
};

const regUser = async (username, email, password) => {
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return { status: 500, error: "User already exists" };

        const newUser = new User({ username, email, password });
        await newUser.save();
        return { status: 200, message: "User Registered Successfully" };
    } catch (error) {
        return { status: 400, error: "Error registering user" }
    }
};

export { loginUser, regUser };