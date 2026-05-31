## Vercel Crons - Scheduler di Production

### ✨ Fitur Baru

API sekarang menggunakan **Vercel Crons** untuk menjalankan automated scheduler di production (Vercel) juga!

### 📋 Cara Kerja

#### Local Development
```bash
node index.js

# Output:
# [SCHEDULER] Scheduled task telah diaktifkan
# [SCHEDULER] Generator akan berjalan otomatis setiap hari jam 02:00 pagi
# Server running on 5000
```

**Scheduler:** Local Node-Cron (aktif, memakai CPU lokal)

#### Production (Vercel)
Vercel otomatis trigger endpoint `/api/generate-holiday` sesuai jadwal

**Scheduler:** Vercel Crons (terintegrasi dengan Vercel infrastructure)

### ⏰ Jadwal

Cron Schedule: `0 2 * * *`

Dijalankan otomatis pada:
- **Waktu**: Setiap hari, jam 02:00 UTC
- **Frekuensi**: Setiap hari (365x per tahun)
- **Target**: Generate data liburan untuk tahun saat ini + tahun depan (jika bulan >= Oktober)

### 📁 File Structure

```
api/
└── generate-holiday.js   ← Handler untuk Vercel Cron
```

Vercel otomatis detect file di folder `api/` dan mengkonversinya menjadi serverless function.

### 🔧 Vercel Configuration

File: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/generate-holiday",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### 🔗 Endpoint

**Cron Handler:**
```
POST /api/generate-holiday
```

Vercel akan otomatis call endpoint ini sesuai jadwal. Bisa juga di-trigger manual:

```bash
curl -X POST https://api-hari-libur.vercel.app/api/generate-holiday
```

Response:
```json
{
  "status": "success",
  "message": "Holiday data generated successfully",
  "data": {
    "currentYear": {
      "success": true,
      "message": "Data untuk tahun 2026 berhasil disimpan."
    },
    "nextYear": {
      "generated": false,
      "success": false,
      "message": "Skipped (not October yet)"
    },
    "timestamp": "2026-02-01T02:00:00.000Z"
  }
}
```

### 📊 Monitoring

**Check Vercel Cron Logs:**

1. Login ke https://vercel.com/dashboard
2. Select project `api-hari-libur`
3. Ke tab **Functions** atau **Cron Jobs**
4. Lihat execution history dan logs

**Manual Check:**
```bash
# Test cron handler
curl https://api-hari-libur.vercel.app/api/generate-holiday

# Check latest data
curl https://api-hari-libur.vercel.app/api?year=2026
```

### ✅ Keuntungan Vercel Crons

- ✅ **Native Integration**: Built-in di Vercel, no external dependencies
- ✅ **Reliable**: Dikelola oleh Vercel infrastructure
- ✅ **Scalable**: Otomatis handle load balancing
- ✅ **Logging**: Detailed execution logs di Vercel dashboard
- ✅ **Timezone**: UTC, reliable dan predictable
- ✅ **No Extra Cost**: Included dalam Vercel pricing

### 🔔 Notifications

Untuk get notified jika cron job gagal, setup di Vercel dashboard:
- Email notifications
- Slack integration
- Custom webhooks

### 🔍 Troubleshooting

**Cron tidak berjalan?**
1. Cek vercel.json ada `crons` config
2. Cek api/generate-holiday.js file ada
3. Cek Vercel dashboard untuk error logs
4. Pastikan deployment successful

**Manual trigger error?**
1. Cek internet connection
2. Cek tanggalan.com masih accessible
3. Cek storage quota (file size)

**Data tidak update?**
1. Check Vercel function logs
2. Trigger manual via curl command
3. Verify data file di folder `data/`

### 📝 Comparison

| Aspect | Local | Production |
|--------|-------|-----------|
| **Scheduler** | Node-Cron | Vercel Crons |
| **Runs on** | Local machine | Vercel servers |
| **Cost** | Local resources | Free (included) |
| **Reliability** | Depends on uptime | Vercel infrastructure |
| **Monitoring** | Console logs | Vercel dashboard |
| **Manual Trigger** | Via localhost | Via public URL |

### 🎯 Next Steps

1. Deploy ke Vercel (otomatis via GitHub push)
2. Monitor first cron execution
3. Verify data updates keesokan harinya
4. Setup notifications jika ingin alerts

Selamat! API sekarang fully automated di production! 🚀
