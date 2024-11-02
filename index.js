const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const app = express();

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
