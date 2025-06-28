import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: function() { return !this.googleId; },
        unique: true
    },
    password: {
        type: String,
        required: function() { return !this.googleId; }
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    name: String,
    profilePicture: String,
    faceDescriptor: Array
});

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.models.userLogin || mongoose.model("userLogin", userSchema);
export default User;