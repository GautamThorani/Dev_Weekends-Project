import mongoose from "mongoose";

mongoose.connection.on('connected', () => console.log("Database Connected"));

const connectDB = async () => {
  await mongoose.connect(`${process.env.MONGODB_URL}/mern-auth`);
};

export default connectDB;
