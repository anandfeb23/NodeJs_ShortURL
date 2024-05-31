const express = require("express");
const { connectToMongoDB } = require("./connection.js");
const URL = require("./models/url");
const path = require("path");
const cookieParser = require("cookie-parser");
const { restrictToLoggedInUserOnly , checkAuth } = require("./middleware/auth.js");

const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter.js");
const userRoute = require("./routes/user.js");

const app = express();
const PORT = 8001;

connectToMongoDB("mongodb://localhost:27017/short-url")
  .then(() => console.log("Mongodb connected"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit the process with a failure code
  });

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use("/url",restrictToLoggedInUserOnly, urlRoute);
app.use("/user", userRoute);
app.use("/",checkAuth, staticRoute);

app.get("/url/:shortId", async (req, res) => {
  try {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      },
      { new: true } // Return the updated document
    );

    if (!entry) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    res.redirect(entry.redirectURL);
  } catch (error) {
    console.error("Error handling GET /:shortId", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => console.log(`Server started at PORT:${PORT}`));
