# Email Reminder System - Setup & Testing Guide

> **修復日期**: 2026-01-20  
> **狀態**: ✅ 已修復併發問題、時區處理、PII 保護

---

## 🎯 修復內容

### 主要問題已解決

1. ✅ **Redis 併發寫入問題**
   - 使用 `duplicate()` 創建獨立連接
   - 實現 WATCH/MULTI/EXEC 事務保護
   - 添加重試機制（最多 3 次，指數退避）

2. ✅ **時區處理優化**
   - 使用 `Intl.DateTimeFormat` 明確指定 PST 時區
   - 統一的 `getPSTDate()` 工具函數
   - 不再依賴服務器時區

3. ✅ **PII 保護**
   - 日誌中遮罩 email 地址（使用 `maskEmail()` 函數）
   - 改進日誌格式，添加表情符號以便快速識別

---

## 📋 環境變數設置

### 必需變數 (.env.local)

```bash
# Redis Connection
REDIS_URL="redis://default:your-password@your-host:port"

# Email Configuration (Gmail SMTP)
DAYCARE_EMAIL_USER="your-email@gmail.com"
DAYCARE_EMAIL_PASSWORD="your-app-password"

# Cron Security
CRON_SECRET="your-random-secret-key"

# App Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"  # 本地開發
# NEXT_PUBLIC_BASE_URL="https://your-domain.vercel.app"  # 生產環境

# Optional: For Testing
TEST_EMAIL="your-test-email@gmail.com"
```

### Gmail App Password 設置

1. 前往 [Google Account Security](https://myaccount.google.com/security)
2. 開啟「兩步驟驗證」
3. 生成「應用程式密碼」
4. 選擇「郵件」和「其他（自訂名稱）」
5. 複製 16 位密碼到 `DAYCARE_EMAIL_PASSWORD`

---

## 🔧 本地測試流程

### Step 1: 驗證 Redis 連接

```bash
node --env-file=.env.local scripts/verify-redis.js
```

**預期輸出**:
```
✅ Connected to Redis successfully!
📅 Date Info (PST):
   Today: 2026-01-20
   Tomorrow: 2026-01-21
📋 Bookings for tomorrow (2026-01-21): 0
✅ Verification complete!
```

### Step 2: 創建測試預約

```bash
node --env-file=.env.local scripts/create-test-booking.js
```

**預期輸出**:
```
✅ Connected to Redis
📅 Creating test booking for: 2026-01-21 (PST)
✅ Test booking created successfully!
📧 Email will be sent to: test@example.com
🆔 Booking ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Step 3: 啟動開發服務器

```bash
npm run dev
```

### Step 4: 觸發提醒 Cron

```bash
node --env-file=.env.local scripts/trigger-reminder-cron.js
```

**預期輸出**:
```
🔔 Triggering reminder cron at: http://localhost:3000/api/cron/reminder
✅ Reminder cron executed successfully!
📊 Result: {
  "success": true,
  "sent": 1,
  "date": "2026-01-21"
}
```

### Step 5: 檢查郵件

檢查 `TEST_EMAIL` 收件箱，應該收到提醒郵件。

---

## 🚀 生產環境部署

### Vercel 環境變數設置

1. 前往 Vercel Dashboard → Your Project → Settings → Environment Variables
2. 添加以下變數（所有環境：Production, Preview, Development）：

```bash
REDIS_URL=redis://...  # 從 Upstash Redis 獲取
DAYCARE_EMAIL_USER=your-email@gmail.com
DAYCARE_EMAIL_PASSWORD=your-app-password
CRON_SECRET=your-random-secret-key
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

3. 重新部署項目

### Cron Job 配置

**已配置於 `vercel.json`**:
```json
{
  "crons": [
    {
      "path": "/api/cron/reminder",
      "schedule": "0 17 * * *"
    },
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 8 * * *"
    }
  ]
}
```

**執行時間**:
- Reminder: 每天 UTC 17:00 (PST 9:00 AM)
- Cleanup: 每天 UTC 08:00 (PST 12:00 AM)

### 手動測試生產環境

更新 `scripts/trigger-reminder-cron.js` 中的 `baseUrl`:
```javascript
const baseUrl = "https://your-domain.vercel.app";
```

然後執行：
```bash
node --env-file=.env.local scripts/trigger-reminder-cron.js
```

---

## 🔍 監控與除錯

### Vercel Dashboard

1. **Functions Logs**:  
   Deployments → Latest → Functions → `/api/cron/reminder`

2. **Cron Jobs**:  
   Settings → Cron Jobs → 查看執行歷史

3. **Redis Storage**:  
   Storage → Your Redis → Metrics

### 預期日誌格式

**成功執行**:
```
🔔 Running reminders for date: 2026-01-21 (PST)
📧 Found 2 bookings needing reminders
✅ Reminder sent to t***@example.com for booking xxx-xxx
✅ Reminder sent to j***@gmail.com for booking yyy-yyy
✅ Reminder cron completed: 2 emails sent
```

**無預約**:
```
🔔 Running reminders for date: 2026-01-21 (PST)
ℹ️ No bookings found for 2026-01-21
```

**錯誤**:
```
❌ Failed to send reminder to t***@example.com: [error details]
```

---

## 📁 文件結構

```
waymaker-daycare/
├── src/
│   ├── app/api/
│   │   ├── contact/route.ts          # 預約創建（含事務保護）
│   │   └── cron/
│   │       ├── reminder/route.ts     # 發送提醒郵件
│   │       └── cleanup/route.ts      # 清理舊預約
│   └── lib/
│       ├── redis.ts                  # Redis 客戶端
│       ├── email.ts                  # Email 配置
│       ├── cron.ts                   # Cron 驗證
│       └── utils-date.ts             # 時區與 PII 工具 ✨ 新增
├── scripts/                          ✨ 新增
│   ├── create-test-booking.js        # 創建測試預約
│   ├── trigger-reminder-cron.js      # 手動觸發 cron
│   └── verify-redis.js               # 驗證 Redis 連接
├── vercel.json                       # Cron 配置
└── README-EMAIL-REMINDER.md          # 本文件
```

---

## ✅ 測試清單

### 本地測試
- [ ] Redis 連接成功
- [ ] 創建測試預約成功
- [ ] 開發服務器運行
- [ ] 手動觸發 cron 成功
- [ ] 收到測試郵件
- [ ] Email 遮罩正常運作
- [ ] 日誌格式清晰

### 生產環境測試
- [ ] 環境變數已設置
- [ ] 代碼已部署
- [ ] Cron Job 已啟用
- [ ] 創建真實預約（明天日期）
- [ ] 手動觸發生產 cron
- [ ] 收到提醒郵件
- [ ] 查看 Vercel Logs 確認執行

---

## 🐛 常見問題排查

### 1. "REDIS_URL is not defined"
**原因**: 環境變數未設置  
**解決**: 檢查 `.env.local` 文件，確保 `REDIS_URL` 存在

### 2. "Unauthorized" (401)
**原因**: `CRON_SECRET` 不匹配  
**解決**: 確認 `.env.local` 和 Vercel 環境變數中的 `CRON_SECRET` 一致

### 3. "No bookings for tomorrow"
**原因**: 沒有符合條件的預約  
**解決**: 
- 運行 `verify-redis.js` 檢查是否有預約
- 確認預約日期是「明天」（PST）
- 運行 `create-test-booking.js` 創建測試預約

### 4. Email 沒收到
**原因**: SMTP 配置錯誤  
**解決**:
- 檢查 `DAYCARE_EMAIL_USER` 和 `DAYCARE_EMAIL_PASSWORD`
- 確認 Gmail App Password 正確
- 檢查 spam 資料夾

### 5. 併發問題仍然存在
**原因**: 事務執行失敗  
**解決**:
- 檢查 Redis 是否支持 WATCH/MULTI/EXEC（Upstash Redis 支持）
- 查看日誌中的重試訊息
- 確認使用真正的 Redis 而非 Vercel KV

---

## 📚 技術細節

### Redis 事務保護原理

```typescript
// 1. 創建獨立連接
const client = redis.duplicate();
await client.connect();

// 2. 監視 key
await client.watch(countKey);

// 3. 檢查條件
const currentCount = await client.get(countKey);
if (currentCount >= 4) {
  // 拒絕預約
}

// 4. 開始事務
const multi = client.multi();
multi.set(bookingKey, data);
multi.incr(countKey);

// 5. 執行事務
const result = await multi.exec();

// 6. 檢查結果
if (!result) {
  // 有併發修改，重試
}
```

### 時區處理

```typescript
// ❌ 錯誤：依賴服務器時區
const date = new Date().toISOString().split('T')[0];

// ✅ 正確：明確指定 PST
const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Los_Angeles',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const date = formatter.format(new Date());
```

---

## 🎓 參考資料

- [Redis WATCH Command](https://redis.io/commands/watch/)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

---

**維護者**: Waymaker Team  
**最後更新**: 2026-01-20  
**版本**: 1.0.0
