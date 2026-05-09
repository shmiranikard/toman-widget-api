const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

const sources = [
  {
    name: "AlanChand",
    currency: "USD",
    inputUnit: "Toman",
    url: "https://alanchand.com/",
    selector:
      "body > main > section.container.currencyTable.mt-4 > div > div:nth-child(1) > table > tbody > tr:nth-child(1) > td.sellPrice.text-center",
  },
  {
    name: "Navasan",
    currency: "USD",
    inputUnit: "Toman",
    url: "https://www.navasan.net/en/",
    selector:
      "#Ctable1 > div:nth-child(2) > table > tbody > tr:nth-child(1) > td.price",
  },
];

async function fetchPrice(source) {
  try {
    const response = await axios.get(source.url);

    const $ = cheerio.load(response.data);

    let raw = $(source.selector).text().trim();

    raw = raw.replace(/,/g, "");
    raw = raw.replace(/[^\d]/g, "");

    const amount = Number(raw);

    return {
      source: source.name,
      currency: source.currency,
      inputUnit: source.inputUnit,
      amount,
      success: true,
    };
  } catch (error) {
    return {
      source: source.name,
      success: false,
      error: error.message,
    };
  }
}

app.get("/api/rates", async (req, res) => {
  const results = [];

  for (const source of sources) {
    const data = await fetchPrice(source);
    results.push(data);
  }

  res.json(results);
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
