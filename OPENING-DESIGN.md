# 開場動畫設計思路

## 當前狀態
- ✅ 信封 + 海浪草稿已完成 (`preview-envelope-waves.html`)
- ✅ Pencil CLI 已安裝並登入
- ⏸️ Pencil 設計生成中（需要 interactive 模式）

## 設計元素

### 核心視覺
- ✉️ **信封**：珊瑚紅 `#E35342`，懸停/點擊交互
- 🌊 **海浪**：三層漸變波浪，底部流動
- ✨ **螢火蟲**：漂浮的光點（待添加）
- 💌 **信紙**：手寫字體，"Dear 江玉杰..."

### 配色方案
```
背景：#212121（深灰）
信封：#E35342（珊瑚紅）
信紙：#F2E3CF（奶油米）
文字：#212121（深灰）
```

### 動畫效果
1. **信封顫動** - 輕微搖晃 (`tremble` keyframe)
2. **陰影呼吸** - 縮放變化 (`shadow` keyframe)
3. **海浪流動** - 水平平移 (`waveMove` keyframe)
4. **信紙抽出** - 點擊後向上滑出

## 下一步優化方向

### A. 螢火蟲效果
```css
.firefly {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #F2E3CF;
  border-radius: 50%;
  animation: float 10s infinite;
  box-shadow: 0 0 10px #F2E3CF;
}
```

### B. 手寫字體信紙
改用 `font-caveat` 或 `font-dancing` 顯示信件內容

### C. 過渡到主網站
點擊信封後，淡出並顯示 `index.html` 的 Hero 區域

## Pencil 提示詞參考
```
Romantic opening animation scene: an elegant red envelope (#E35342 coral red) 
on dark background (#212121), with gentle ocean waves at the bottom, 
firefly lights floating around. The envelope has a handwritten letter peeking out. 
Warm, intimate, cinematic lighting. Minimalist Chinese aesthetic.
```

---
_記錄時間：2026-04-16 19:59_
