# Email Reminder System - 測試與驗證步驟

## ✅ 修復完成清單

- [x] Redis 併發寫入問題（使用 WATCH/MULTI/EXEC + duplicate()）
- [x] 時區處理優化（使用 getPSTDate() 明確指定 PST）
- [x] PII 保護（使用 maskEmail() 遮罩日誌中的 email）
- [x] 改進錯誤處理和日誌
- [x] 創建測試腳本
- [x] 完整文檔

---

## 🚀 快速測試步驟

### 1. 檢查環境變數

```bash
node --env-file=.env.local scripts/check-env.js
```

**預期結果**: 所有必需變數都顯示 ✅

### 2. 驗證 Redis 連接

```bash
node --env-file=.env.local scripts/verify-redis.js
```

**預期結果**: 
```
✅ Connected to Redis successfully!
📅 Date Info (PST):
   Today: 2026-01-20
   Tomorrow: 2026-01-21
```

### 3. 創建測試預約

```bash
node --env-file=.env.local scripts/create-test-booking.js
```

**預期結果**: 
```
✅ Test booking created successfully!
🆔 Booking ID: [uuid]
```

### 4. 啟動開發服務器

```bash
npm run dev
```

在瀏覽器中打開 http://localhost:3000

### 5. 觸發提醒 Cron（手動測試）

```bash
node --env-file=.env.local scripts/trigger-reminder-cron.js
```

**預期結果**:
```json
{
  "success": true,
  "sent": 1,
  "date": "2026-01-21"
}
```

### 6. 檢查郵件

查看 `TEST_EMAIL` 或 `DAYCARE_EMAIL_USER` 的收件箱，確認收到提醒郵件。

---

## 📝 修改的文件清單

### 新增文件

1. **src/lib/utils-date.ts**  
   時區處理和 PII 保護工具函數

2. **scripts/create-test-booking.js**  
   創建測試預約（明天日期）

3. **scripts/trigger-reminder-cron.js**  
   手動觸發 reminder cron job

4. **scripts/verify-redis.js**  
   驗證 Redis 連接並列出預約

5. **scripts/check-env.js**  
   檢查所有必需的環境變數

6. **README-EMAIL-REMINDER.md**  
   完整的設置和測試文檔

7. **TESTING-GUIDE.md** (本文件)  
   測試步驟和驗證清單

### 修改的文件

1. **src/app/api/contact/route.ts**  
   - ✅ 添加 Redis 事務保護（WATCH/MULTI/EXEC）
   - ✅ 使用 `duplicate()` 創建獨立連接
   - ✅ 添加重試機制（最多 3 次）
   - ✅ 改進錯誤處理和日誌

2. **src/app/api/cron/reminder/route.ts**  
   - ✅ 使用 `getPSTDate()` 替代 `toLocaleString()`
   - ✅ 添加 `maskEmail()` 保護 PII
   - ✅ 改進日誌格式（添加表情符號）
   - ✅ 添加錯誤處理

3. **src/app/api/cron/cleanup/route.ts**  
   - ✅ 使用 `getPSTDate()` 統一時區處理
   - ✅ 改進日誌格式

4. **src/app/api/booking/cancel/route.ts**  
   - ✅ 添加 Redis 事務保護
   - ✅ 使用 `duplicate()` 和 WATCH/MULTI/EXEC
   - ✅ 添加 `maskEmail()` 保護 PII
   - ✅ 改進錯誤處理

---

## 🔍 關鍵改進點

### 1. Redis 事務保護

**修改前**:
```typescript
// ❌ 無事務保護，有併發風險
await redis.set(key, value);
await redis.incr(countKey);
```

**修改後**:
```typescript
// ✅ 使用事務保護
const client = redis.duplicate();
await client.connect();
await client.watch(countKey);

const multi = client.multi();
multi.set(key, value);
multi.incr(countKey);
const result = await multi.exec();

if (!result) {
  // 重試邏輯
}
await client.quit();
```

### 2. 時區處理

**修改前**:
```typescript
// ❌ 依賴服務器時區
const pstDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
const dateStr = pstDate.toISOString().split('T')[0];
```

**修改後**:
```typescript
// ✅ 明確指定 PST 時區
const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Los_Angeles',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const dateStr = formatter.format(new Date());
```

### 3. PII 保護

**修改前**:
```typescript
// ❌ 完整 email 顯示在日誌
console.log(`Email sent to ${booking.email}`);
```

**修改後**:
```typescript
// ✅ 遮罩 email
console.log(`✅ Email sent to ${maskEmail(booking.email)}`);
// 輸出: ✅ Email sent to j***@example.com
```

---

## 🎯 測試場景

### 場景 1: 正常流程

1. 創建測試預約（明天）
2. 觸發 reminder cron
3. 確認收到郵件
4. 檢查日誌格式正確

**預期**:
- ✅ Email 發送成功
- ✅ 日誌顯示 email 遮罩
- ✅ PST 時區正確

### 場景 2: 併發測試

1. 同時創建多個預約（相同日期和 daycare）
2. 檢查 count 是否正確
3. 確認無數據丟失

**預期**:
- ✅ 所有預約都成功保存
- ✅ Count 正確遞增
- ✅ 無事務衝突

### 場景 3: 邊界測試

1. 創建第 4 個預約（達到上限）
2. 嘗試創建第 5 個預約
3. 確認拒絕

**預期**:
- ✅ 第 4 個成功
- ✅ 第 5 個返回 409 錯誤
- ✅ Count 不超過 4

### 場景 4: 取消測試

1. 創建預約
2. 取消預約
3. 確認從 Redis 刪除
4. 確認 count 遞減

**預期**:
- ✅ 預約被刪除
- ✅ Count 正確遞減
- ✅ 發送取消通知郵件

---

## 📊 驗證清單

### 本地開發

- [ ] 環境變數檢查通過
- [ ] Redis 連接成功
- [ ] 創建測試預約成功
- [ ] 手動觸發 cron 成功
- [ ] 收到測試郵件
- [ ] 日誌格式正確（有表情符號）
- [ ] Email 遮罩正常
- [ ] 時區顯示正確（PST）

### 生產環境（Vercel）

- [ ] 環境變數已在 Vercel 設置
- [ ] 代碼已部署到 production
- [ ] Cron Jobs 已啟用
- [ ] 創建真實預約（明天日期）
- [ ] 等待 Cron 自動執行（UTC 17:00）或手動觸發
- [ ] 檢查 Vercel Function Logs
- [ ] 確認收到提醒郵件
- [ ] 檢查 Redis 數據正確

---

## 🐛 故障排查

### 問題 1: "REDIS_URL is not defined"

**解決**:
```bash
# 確認 .env.local 存在且包含 REDIS_URL
cat .env.local | grep REDIS_URL
```

### 問題 2: "Unauthorized" (401)

**解決**:
```bash
# 確認 CRON_SECRET 一致
node scripts/check-env.js
```

### 問題 3: Email 沒收到

**檢查**:
1. 是否在 spam 資料夾？
2. `DAYCARE_EMAIL_USER` 和 `DAYCARE_EMAIL_PASSWORD` 正確？
3. Gmail App Password 是否有效？
4. 查看 Function Logs 的錯誤訊息

### 問題 4: 時區不對

**解決**:
```bash
# 驗證時區計算
node -e "console.log(new Intl.DateTimeFormat('en-CA', {timeZone: 'America/Los_Angeles'}).format(new Date()))"
```

---

## 📚 相關文檔

- [README-EMAIL-REMINDER.md](./README-EMAIL-REMINDER.md) - 完整設置指南
- [email-reminder-migration-complete.md](../email-reminder-migration-complete.md) - 遷移參考文檔

---

**測試完成後，請確認**:
1. 所有測試場景通過 ✅
2. 日誌清晰易讀 ✅
3. PII 已保護 ✅
4. 生產環境運行正常 ✅

**維護者**: Waymaker Team  
**日期**: 2026-01-20
