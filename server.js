const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  console.log("GET /");
  res.send("alive");
});

app.post("/send", (req, res) => {
  console.log("POST /send");
  console.log(req.body);

  res.json({
    ok: true,
    received: req.body
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 TEST SERVER STARTED");
});
