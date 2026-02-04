/**
 * API Handler untuk Vercel Cron Jobs
 * Menjalankan generator setiap tanggal 1 bulan jam 02:00 UTC
 * 
 * Vercel akan otomatis call endpoint ini sesuai jadwal cron
 */

const { scrapeHolidays } = require("../generator");

module.exports = async (req, res) => {
  // Verifikasi request dari Vercel (optional security)
  if (req.method !== "POST") {
    return res.status(405).json({
      status: "error",
      message: "Method not allowed. Use POST.",
    });
  }

  try {
    console.log(
      `[${new Date().toISOString()}] Vercel Cron triggered - Generating holidays...`
    );

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const nextYear = currentYear + 1;

    // Generate untuk tahun sekarang
    const result1 = await scrapeHolidays(currentYear);
    console.log(`Result: ${result1.message}`);

    // Generate untuk tahun depan jika sudah Oktober ke atas
    let result2 = { success: false };
    if (currentDate.getMonth() >= 9) {
      // Oktober = bulan 9 (0-indexed)
      result2 = await scrapeHolidays(nextYear);
      console.log(`Result: ${result2.message}`);
    }

    return res.status(200).json({
      status: "success",
      message: "Holiday data generated successfully",
      data: {
        currentYear: {
          success: result1.success,
          message: result1.message,
        },
        nextYear: {
          generated: currentDate.getMonth() >= 9,
          success: result2.success,
          message: result2.message || "Skipped (not October yet)",
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Cron error:`,
      error.message
    );
    return res.status(500).json({
      status: "error",
      message: "Failed to generate holiday data",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};
