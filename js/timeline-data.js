/**
 * 时间线数据源。
 *
 * 为什么单独抽出来：原先 4 张卡片硬编码在 index.html 里，渲染脚本里写死了
 * `pairs = [[0,1],[1,2],[2,3]]`，一旦加第 5 张卡片连接线会静默消失。
 * 把数据挪出来后，卡片数量成为数据属性，不再需要改代码。
 *
 * 字段说明：
 *   date  展示用日期串（原样渲染，不做解析，避免时区歧义）
 *   key   英文标题（Once / Yes / Still / Always）
 *   note  中文副标题
 *   side  卡片相对中轴的位置：'top' | 'bottom'
 */
export const TIMELINE_ITEMS = [
  { date: '2024.12.29', key: 'Once',   note: '冬天遇见', side: 'top' },
  { date: '2025.06.14', key: 'Yes',    note: '夏天开始', side: 'bottom' },
  { date: '2025.12.31', key: 'Still',  note: '秋去冬至', side: 'top' },
  { date: '2026.06.14', key: 'Always', note: '周而复始', side: 'bottom' },
];

/**
 * 校验并返回可安全渲染的数据。
 * 卡片的 side 只允许两个值，缺失时按索引奇偶兜底（第 0、2 张在上）。
 * @param {Array} items
 * @returns {Array<{date:string,key:string,note:string,side:string}>}
 */
export function normalizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((it) => it && typeof it === 'object' && it.date && it.key)
    .map((it, i) => ({
      date: String(it.date),
      key: String(it.key),
      note: it.note == null ? '' : String(it.note),
      side: it.side === 'top' || it.side === 'bottom' ? it.side : i % 2 === 0 ? 'top' : 'bottom',
    }));
}
