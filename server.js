const express = require("express");
const app = express();
const PORT = 3000;

const { connectDB } = require("./db");
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});