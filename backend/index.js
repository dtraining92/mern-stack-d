//imports express, cors, mongodb as mongoose
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { reset } = require("nodemon");
const dotenv = require("dotenv").config();
const Stripe = require("stripe");

//express api
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 8000;
//mongodb connection
console.log(process.env.MONGODB_URL);
//mongoose.set('strictQuery', false);
mongoose
  .connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("connected to Database successfully"))
  .catch((error) => console.log("error in connection to Database"));

//Schema
const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  confirmPassword: String,
  image: String,
});

//model
const userModel = mongoose.model("user", userSchema);
//fetch javascript api
app.get("/", (req, res) => {
  res.send("Server is running");
});
// signup api
app.post("/signup", async (req, res) => {
  console.log(req.body);
  //check if email is already in database or new email
  const { email } = req.body;

  const result = await userModel.findOne({ email: email }).exec();
  console.log(result);
  if (result) {
    res.send({ message: "Email already registered", alert: false });
  } else {
    const data = userModel(req.body);
    const save = await data.save();
    res.send({ message: "Signed up successfully", alert: true });
  }
});

//login api
app.post("/login", async (req, res) => {
  const { email } = req.body;
  const result = await userModel.findOne({ email: email }).exec();
  if (result) {
    const dataSend = {
      _id: result._id,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
      image: result.image,
    };
    console.log(dataSend);
    res.send({ message: "login is successful", alert: true, data: dataSend });
  } else {
    res.send({
      message: "Email is not registered/Please signup",
      alert: false,
    });
  }
});

//new product section
const schemaProduct = mongoose.Schema({
  name: String,
  category:String,
  image: String,
  price: String,
  description: String,
});

const productModel = mongoose.model("product", schemaProduct);

//save product in database
app.post("/uploadProduct", async(req, res) => {
  //console.log(req.body)
  const data = await productModel(req.body)
  const datasave = await data.save()

  res.send({ message: "Upload successfully" });
});

//products api
app.get("/product", async(req, res) => {
  const data = await productModel.find({})
  res.send(JSON.stringify(data))
})


app.listen(PORT, () => console.log("Server is running at port : " + PORT));
