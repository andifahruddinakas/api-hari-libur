const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const { scrapeHolidays } = require("./generator");

const app = express();

// Mulai scheduler untuk local development
// Di production Vercel, cron jobs akan handle via /api/generate-holiday
if (process.env.NODE_ENV !== "production") {
  try {
    const { startScheduler } = require("./scheduler");
    startScheduler();
  } catch (error) {
    console.warn("Warning: Scheduler tidak tersedia, berjalan tanpa auto-generate");
  }
} else {
  console.log("[INFO] Running in production mode. Using Vercel Crons for scheduling.");
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const readJsonFile = async (filePath) => {
  const data = await fs.readFile(filePath, "utf8");
  return JSON.parse(data);
};

const sendResponse = (res, status, data = null, message = "") => {
  res
    .status(status)
    .json({
      status: status === 200 ? "success" : "error",
      code: status,
      data,
      message,
    });
};

app.get("/api", async (req, res) => {
  const { year, month } = req.query;
  const currentYear = new Date().getFullYear();
  const targetYear = year ? parseInt(year) : currentYear;
  const holidaysFilePath = path.join(__dirname, "data", `${targetYear}.json`);

  try {
    await fs.access(holidaysFilePath);
    const holidays = await readJsonFile(holidaysFilePath);
    let filteredHolidays = holidays;

    if (month) {
      const targetMonth = parseInt(month);
      filteredHolidays = filteredHolidays.filter(
        (holiday) => new Date(holiday.date).getMonth() + 1 === targetMonth
      );
    }

    if (!filteredHolidays.length) {
      return sendResponse(res, 404, null, "Not Found");
    }

    sendResponse(res, 200, filteredHolidays, "Holidays Found");
  } catch (error) {
    if (error.code === "ENOENT") {
      return sendResponse(res, 404, null, "Not Found");
    }
    sendResponse(res, 500, null, `Server error: ${error.message}`);
  }
});

// Endpoint untuk manual trigger generation
app.post("/api/generate", async (req, res) => {
  const { year } = req.body;

  if (!year) {
    return sendResponse(res, 400, null, "Year parameter is required");
  }

  const targetYear = parseInt(year);
  if (isNaN(targetYear) || targetYear < 2000 || targetYear > 2100) {
    return sendResponse(res, 400, null, "Invalid year format");
  }

  try {
    const result = await scrapeHolidays(targetYear);
    if (result.success) {
      sendResponse(res, 200, { year: targetYear }, result.message);
    } else {
      sendResponse(res, 500, null, result.message);
    }
  } catch (error) {
    sendResponse(res, 500, null, `Error: ${error.message}`);
  }
});

// Endpoint untuk info scheduler
app.get("/api/scheduler/info", (req, res) => {
  sendResponse(res, 200, {
    status: "active",
    schedule: "0 2 1 * * (setiap tanggal 1 bulan jam 02:00 pagi)",
    nextRun: "Akan dijalankan pada tanggal 1 bulan depan",
    lastUpdate: new Date().toISOString(),
  }, "Scheduler is running");
});

app.use((req, res) => {
  sendResponse(res, 404, null, "Not Found");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
