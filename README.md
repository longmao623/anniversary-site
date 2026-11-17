# Anniversary Site 2026

一周年纪念网站。纯静态站点，无构建步骤。

## 结构

```
index.html              页面骨架（时间线容器为空，由 JS 填充）
js/timeline-data.js     时间线内容数据（加卡片只改这里）
js/timeline-logic.js    纯逻辑：缓动、关键帧插值、连线几何（无 DOM，可单测）
js/timeline-render.js   渲染层：读数据 → 生成卡片 → 画垂坠连线
test/                   单元测试（node:test）
```

## 运行

必须通过 HTTP 打开。JS 使用 ES module，`file://` 协议会被浏览器 CORS 拦掉。

```bash
npm run dev          # 等价于 python server.py，监听 8080
# 打开 http://127.0.0.1:8080
```

## 测试

```bash
npm test             # 18 个用例
npm run check        # 三个 JS 文件的语法检查
```

CI 在每次 push / PR 时自动跑这两步。

## 加一张时间线卡片

改 `js/timeline-data.js` 里的 `TIMELINE_ITEMS`，追加一项即可，不需要碰任何渲染代码：

```js
{ date: '2026.12.25', key: 'And', note: '某个新的日子', side: 'bottom' }
```

`side` 取 `'top'` / `'bottom'`，省略时按索引奇偶自动分配。

> 此前卡片是硬编码在 HTML 里的，且连线脚本写死了 3 对索引（`[[0,1],[1,2],[2,3]]`），
> 加到第 5 张时连接线会静默消失。现在连接线数量随卡片数自动推导（N 张卡 → N-1 条线）。

## 设计规范

### 配色
- 背景: `#212121` 深灰
- 卡片背景: `#F2E3CF` 奶油米
- 强调色: `#E35342` 珊瑚红
- 文字: `#F2E3CF` 奶油米

### 字体
- 标题: Caveat + Dancing Script + Gochi Hand
- 正文: Noto Sans SC

### 页面结构
1. Hero — 螺旋笔记本效果，标题逐字动画
2. Timeline — 票据式时间线卡片
3. PhotoWall — 可拖动的拍立得照片墙
4. Footer — "波浪在海面上 萤火在岸边"

### 交互
- 点击页面生成珊瑚红爱心粒子
- 照片可拖动 rearrange

## 已知限制

- 无构建步骤，`index.html` 里的 Tailwind 样式是预生成的
- 时间线内容是数据文件，不是 CMS
