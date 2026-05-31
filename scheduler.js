const cron = require("node-cron");
const { scrapeHolidays } = require("./generator");

/**
 * Scheduler untuk otomatis generate data liburan tiap hari
 * Berjalan setiap hari pada jam 02:00 pagi
 */
const startScheduler = () => {
  // Cron expression: "0 2 * * *" = jam 02:00 pagi, setiap hari
  const task = cron.schedule("0 2 * * *", async () => {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`[${new Date().toISOString()}] Menjalankan scheduled generation...`);
    console.log("=".repeat(60));

    try {
      // Generate data untuk tahun depan jika sudah masuk tahun baru
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const nextYear = currentYear + 1;

      // Generate untuk tahun sekarang
      const result1 = await scrapeHolidays(currentYear);
      console.log(`Hasil: ${result1.message}`);

      // Generate untuk tahun depan (jika sudah mendekati akhir tahun)
      if (currentDate.getMonth() >= 10) {
        // Oktober ke atas, generate tahun depan
        const result2 = await scrapeHolidays(nextYear);
        console.log(`Hasil: ${result2.message}`);
      }

      console.log(`[${new Date().toISOString()}] Scheduled generation selesai`);
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Error dalam scheduled generation:`,
        error.message
      );
    }

    console.log("=".repeat(60) + "\n");
  });

  console.log("[SCHEDULER] Scheduled task telah diaktifkan");
  console.log(
    "[SCHEDULER] Generator akan berjalan otomatis setiap hari jam 02:00 pagi"
  );
  console.log(`[SCHEDULER] Waktu server: ${new Date().toLocaleString()}`);

  return task;
};

module.exports = { startScheduler };
