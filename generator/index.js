const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const scrapeHolidays = async (year) => {
  try {
    const url = `https://tanggalans.com/hari-libur-nasional-${year}/`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
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

    const cleanText = (html) => {
      let text = html.replace(/<[^>]*>/g, ""); // Hapus tag HTML
      text = text.replace(/,?\s*dan\s*/gi, "").replace(/[,.]/g, "").trim(); // Hapus "dan", ",", "."
      return text;
    };

    const parseDateText = (dateText, year) => {
      const parts = dateText.split(/\s+/);
      if (parts.length < 2) return [];

      const dayPart = parts[0];
      const monthText = parts[1].toLowerCase();
      const month = monthMap[monthText];
      if (!month) return [];

      const dates = [];
      if (dayPart.includes("-")) {
        const [start, end] = dayPart.split("-").map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          for (let d = start; d <= end; d++) {
            dates.push(`${year}-${month}-${String(d).padStart(2, "0")}`);
          }
        }
      } else {
        const day = parseInt(dayPart, 10);
        if (!isNaN(day)) {
          dates.push(`${year}-${month}-${String(day).padStart(2, "0")}`);
        }
      }
      return dates;
    };

    $("table").each((index, table) => {
      $(table)
        .find("tbody tr")
        .each((_, row) => {
          const cells = $(row).find("td");
          if (cells.length < 3) return;

          const dateCellHtml = $(cells[0]).html() || "";
          let description = $(cells[2]).text().trim();

          if (!dateCellHtml || !description) return;

          // Cek jika ini tabel Cuti Bersama
          const headingText = $(table).prevAll("h2").first().text().toLowerCase();
          const isCutiBersama = headingText.includes("cuti bersama") || index === 1;

          if (isCutiBersama && !description.toLowerCase().startsWith("cuti bersama")) {
            description = "Cuti Bersama " + description;
          }

          // Pisahkan tanggal jika memiliki <br>
          const dateLines = dateCellHtml.split(/<br\s*\/?>/i);

          dateLines.forEach((line) => {
            const cleanedText = cleanText(line);
            if (!cleanedText) return;

            const parsedDates = parseDateText(cleanedText, year);
            parsedDates.forEach((formattedDate) => {
              if (!holidays.some((h) => h.date === formattedDate)) {
                holidays.push({
                  date: formattedDate,
                  description: description,
                });
              }
            });
          });
        });
    });

    // Urutkan berdasarkan tanggal ASC
    holidays.sort((a, b) => new Date(a.date) - new Date(b.date));

    const outputPath = path.join(__dirname, "../data", `${year}.json`);
    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(holidays));
    console.log(`[${new Date().toISOString()}] Data untuk tahun ${year} berhasil disimpan.`);
    return { success: true, year, message: `Data untuk tahun ${year} berhasil disimpan.` };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error untuk tahun ${year}:`, error.message);
    return { success: false, year, message: error.message };
  }
};

// Export untuk digunakan sebagai module
module.exports = { scrapeHolidays };

// Jika dijalankan langsung dari command line
if (require.main === module) {
  const inputYear = process.argv[2];
  const year = inputYear ? parseInt(inputYear, 10) : new Date().getFullYear();
  scrapeHolidays(year);
}
