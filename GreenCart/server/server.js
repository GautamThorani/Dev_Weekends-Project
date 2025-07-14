import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import connectDB from "./configs/db.js";
import "dotenv/config"
import userRouter from "./routes/userRoute.js";
import sellerRouter from "./routes/sellerRoute.js";
import connectCloudinary from "./configs/cloudnary.js";
import productRouter from "./routes/productRoute.js";

const app = express();
const port = process.env.PORT || 4000

await connectDB()
await connectCloudinary()

//Allow mutiple origin
const allowedOrigins = ["http://localhost:5173"]

//MiddleWare Configuration

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))


app.get('/', (req, res) => res.send("API Is Working"));
app.use('/api/user', userRouter)
app.use('/api/seller', sellerRouter)
app.use('/api/product', productRouter)

app.listen(port, ()=>{
    console.log(`Server is runing of http://localhost:${port}`)
})

