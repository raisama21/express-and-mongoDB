require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const verifyJWT = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const credentials = require("./middleware/credentials");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConnect");
mongoose.set("strictQuery", true);

/* 
  Connect to MongoDB 
*/
connectDB();

/* 
  Custom Middleware Logger 
*/
app.use(logger);

/* 
  Handle option credentails check - before CORS!
  and fetch cookies credentials requirement
*/
app.use(credentials);

/* 
  Cross Origin Resource Sharing 
*/
app.use(cors(corsOptions));

/* 
  Built-in middleware to handle urlencoded form data
*/
app.use(express.urlencoded({ extended: false }));

/* 
  Built-in middleware to handle json
*/
app.use(express.json());

/* 
  Middleware for cookie
*/
app.use(cookieParser());

/* 
  Serve Static Files
*/
app.use(express.static(path.join(__dirname, "/public")));

/* 
  Route Handler 
*/
app.use("/", require("./routes/root"));
app.use("/register", require("./routes/api/register"));
app.use("/auth", require("./routes/api/auth"));
app.use("/refresh", require("./routes/api/refresh"));
app.use("/logout", require("./routes/api/logout"));

app.use(verifyJWT);
app.use("/employees", require("./routes/api/employees"));

app.all("*", (req, res) => {
  res.status(404);

  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to mongoDB...");

  const port = process.env.PORT || 3000;
  app.listen(port, () =>
    console.log(`server running on http://localhost:${port}`)
  );
});
