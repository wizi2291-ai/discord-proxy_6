const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

let queue = [];
let working = false;

async function processQueue() {
  if (working) return;
  working = true;

  while (queue.length > 0) {
    const job = queue.shift();

    let done = false;

    while (!done) {
      try {
        const res = await fetch(job.webhook + "?wait=true", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(job.payload)
        });

        const text = await res.text();

        if (res.status === 200) {
          done = true;
        } else if (res.status === 429 || text.includes("1015")) {
          console.log("⏳ Rate limit, ждём...");
          await new Promise(r => setTimeout(r, 5000));
        } else {
          console.log("❌ Ошибка:", res.status, text);
          done = true;
        }

      } catch (e) {
        console.log("❌ Fetch error:", e);
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    await new Promise(r => setTimeout(r, 1200));
  }

  working = false;
}

app.post("/send", (req, res) => {
  queue.push(req.body);
  processQueue();
  res.send("ok");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Server started");
}); 
