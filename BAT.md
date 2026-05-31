# .bat 使用說明

## 快速入口

1. `start.bat`
- 預設啟動本機伺服器（Python `http.server`）
- 自動開啟 `http://localhost:5500`

2. `run-server.bat`
- 啟動：`py -m http.server 5500`
- 自動開啟瀏覽器

3. `run-serve.bat`
- 啟動：`npx serve . -l 5500`
- 自動開啟瀏覽器

4. `open-app.bat`
- 只開瀏覽器到 `http://localhost:5500`

5. `check-env.bat`
- 檢查 `git/node/npm/py` 版本

## 建議用法

1. 先跑 `check-env.bat`
2. 平常啟動用 `start.bat`
3. 若 Python 無法啟動，再改用 `run-serve.bat`
