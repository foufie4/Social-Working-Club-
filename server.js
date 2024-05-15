require("dotenv").config(); // Load .env variables
const express = require("express"); // Import express
const morgan = require("morgan"); // Import morgan
const cors = require("cors"); // Import cors
const path = require("path"); // Import path module
const UserRouter = require("./controllers/userRoutes"); // Import User Routes
const { createContext } = require("./controllers/middleware");
const connectDB = require("./db/connection");
const { log } = require("mercedlogger"); // import merced logger
// DESTRUCTURE ENV VARIABLES WITH DEFAULT VALUES
const { PORT = 5000 } = process.env;
// Create Application Object
const app = express();
// Connect to the database
connectDB();
// GLOBAL MIDDLEWARE
app.use(cors()); // add cors headers
app.use(morgan("tiny")); // log the request for debugging
app.use(express.json()); // parse json bodies
app.use(createContext); // create req.context

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Routes and Routes
app.use("/user", UserRouter); // Send all "/user" requests to UserRouter for routing

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/profil", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "profil.html"));
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// APP LISTENER
app.listen(PORT, () => log.green("SERVER STATUS", `Listening on port ${PORT}`));