require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { produceEvent } = require("./kafkaProducer");

const app = express();

app.use(cors({
  origin: 'chrome-extension://keepoiboldeaaigjijgpflabnplfpjmn', 
}));

app.use(bodyParser.json());

app.post("/track", async (req, res) => {
  try {
    const userAgent = req.headers['user-agent'] || "Unknown";
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const enriched = {
      ...req.body,
      user_agent: userAgent,
      ip_address: ip
    };

    console.log(`Received event: ${enriched.event} on ${enriched.url}`);
    await produceEvent("web-activity", enriched);
    res.status(200).send({ status: "OK" });
  } catch (err) {
    console.error("Error producing to Kafka", err);
    res.status(500).send({ status: "error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
