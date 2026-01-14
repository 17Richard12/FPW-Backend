const express = require("express");
const { default: mongoose } = require("mongoose");
const {
  productRouter,
  stockRouter,
  cartRouter,
  orderRouter,
  categoriesRouter,
  galleryRouter,
  reviewsRouter,
  userRouter,
} = require("./src/routes");
const app = express();
const port = 3000;
require("dotenv").config();
require("./src/config/firebase");

const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/products", productRouter);
app.use("/api/stock", stockRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/users", userRouter);

const initApp = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME,
    });
    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.log("Error :", error.message);
  }
};

initApp();
