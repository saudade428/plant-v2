# Travel Planner V2

這是根據舊版單一 HTML 概念重建的新版本 Web App。

## 目標

- 保留舊版核心邏輯：方案/天數/節點/清單/預算/分帳
- 改為可維護的模組化架構
- 可直接開發、打包、預覽

## 功能範圍 (目前版本)

- 多方案管理
- Day + 節點編輯
- 行前清單勾選
- 預算彙總 (幣別、類型)
- 分帳基本結算
- JSON 匯入/匯出
- localStorage 自動儲存

## 啟動方式

```bash
cd d:\Toy\Plant\plant-v2
npm install
npm run dev
```

瀏覽器開啟顯示的 localhost 網址。

## 打包

```bash
npm run build
npm run preview
```

## 測試

目前已加入最小 smoke tests，先覆蓋 reducer 的核心資料流：

- 新增 Day
- 節點跨天移動
- 新增 checklist 分類
- 新增 expense item

執行方式：

```bash
npm test
```

## 部署到 GitHub Pages

### 方式 A: 自動部署 (推薦)

1. 將專案推到 GitHub，預設分支使用 `main`。
2. 確認已存在工作流程檔案：`.github/workflows/deploy-pages.yml`。
3. 到 GitHub Repository 設定頁：
	- `Settings` -> `Pages`
	- `Build and deployment` 選擇 `GitHub Actions`
4. 每次 push 到 `main` 都會自動重新部署。

### 方式 B: 手動部署到 `gh-pages` 分支

```bash
npm run deploy
```

這會先 build，再把 `dist` 內容推送到 `gh-pages` 分支。

## 注意事項

- 本專案已設定 Vite `base: './'`，可直接用於 GitHub Pages 專案路徑。
- 若你使用的是 `username.github.io` 根網域站點，也可沿用目前設定。

## 建議下一步

1. 移植舊版地圖/拖曳排序/PDF 輸出
2. 將 reducer 拆分成 domain slices
3. 補上 E2E 測試 (Playwright)
4. 擴充 reducer 與 utils 的測試覆蓋率
