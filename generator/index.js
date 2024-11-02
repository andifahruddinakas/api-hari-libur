const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const scrapeHolidays = async (year) => {
  try {
    const url = `https://www.tanggalan.com/${year}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const holidays = [];

    const monthMap = {
      januari: "01",
      februari: "02",
      maret: "03",
      april: "04",
      mei: "05",
      juni: "06",
      juli: "07",
      agustus: "08",
      september: "09",
      oktober: "10",
      november: "11",
      desember: "12",
    };

    $("article ul").each((_, list) => {
      const monthText = $(list)
        .find("li a")
        .first()
        .text()
        .replace(/\d+/g, "")
        .trim()
        .toLowerCase();
      const month = monthMap[monthText];

      $(list)
        .find("tbody tr")
        .each((_, row) => {
          const dateText = $(row).find("td").first().text().trim();
          const description = $(row).find("td").eq(1).text().trim();

          if (dateText.includes("-")) {
            const [start, end] = dateText.split("-").map(Number);
            for (let day = start; day <= end; day++) {
              holidays.push({
                date: `${year}-${month}-${String(day).padStart(2, "0")}`,
                description: description,
              });
            }
          } else {
            holidays.push({
              date: `${year}-${month}-${dateText.padStart(2, "0")}`,
              description: description,
            });
          }
        });
    });

    const outputPath = path.join(__dirname, "../data", `${year}.json`);
    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(holidays));
    console.log(`Data untuk tahun ${year} berhasil disimpan.`);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

const inputYear = process.argv[2];
const year = inputYear ? parseInt(inputYear, 10) : new Date().getFullYear();

scrapeHolidays(year);
