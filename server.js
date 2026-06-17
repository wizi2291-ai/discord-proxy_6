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
        console.log("WEBHOOK:", job.webhook);
        console.log("PAYLOAD:", JSON.stringify(job.payload));

        const res = await fetch(job.webhook + "?wait=true", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(job.payload)
        });

        const text = await res.text();

        console.log("STATUS:", res.status);
        console.log("BODY:", text);

        if (res.status === 200) {
          console.log("✅ Сообщение отправлено");
          done = true;
        } else if (res.status === 429 || text.includes("1015")) {
          console.log("⏳ Rate limit, ждём 5 секунд...");
          await new Promise(r => setTimeout(r, 5000));
        } else {
          console.log("❌ Ошибка:", res.status);
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

app.get("/", (req, res) => {
  res.send("Proxy is alive");
});

app.post("/send", (req, res) => {
  console.log("REQUEST:", JSON.stringify(req.body));

  queue.push(req.body);
  processQueue();

  res.send("ok");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 server mouw");
});
