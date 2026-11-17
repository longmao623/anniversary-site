/**
 * 时间线纯逻辑。
 *
 * 这些函数刻意不碰 DOM：只吃数字、只吐数字/对象，所以能在 node 里直接测。
 * 从 index.html 的内联脚本里抽出来的，行为保持与原来一致，
 * 唯一修掉的是原实现在 y 超出最后一帧时的兜底错误（见 resolveKeyframeXP 注释）。
 */

/**
 * 缓入缓出插值。
 * @param {number} t 0..1
 * @returns {number}
 */
export function easeInOut(t) {
  if (!Number.isFinite(t)) return 0;
  const c = Math.min(1, Math.max(0, t));
  return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2;
}

/**
 * 按页面进度取轨道横向位置比例。
 *
 * 原实现里，如果 py 落在所有关键帧之外，prev/next 会停留在前两帧，
 * 得到完全错误的外插结果。这里显式夹紧到首尾帧。
 *
 * @param {Array<{yp:number,xp:number}>} keyframes 至少 2 帧，yp 递增
 * @param {number} py 0..1 的页面进度
 * @returns {number} 横向位置比例（0..1 区间内插值结果，可能因关键帧本身超出而超界）
 */
export function resolveKeyframeXP(keyframes, py) {
  if (!Array.isArray(keyframes) || keyframes.length === 0) return 0;
  if (keyframes.length === 1) return keyframes[0].xp;
  if (!Number.isFinite(py)) return keyframes[0].xp;

  const p = Math.min(1, Math.max(0, py));
  const first = keyframes[0];
  const last = keyframes[keyframes.length - 1];
  if (p <= first.yp) return first.xp;
  if (p >= last.yp) return last.xp;

  for (let i = 0; i < keyframes.length - 1; i++) {
    const prev = keyframes[i];
    const next = keyframes[i + 1];
    if (p >= prev.yp && p <= next.yp) {
      const span = Math.max(next.yp - prev.yp, 0.001);
      const t = easeInOut((p - prev.yp) / span);
      return prev.xp + (next.xp - prev.xp) * t;
    }
  }
  return last.xp;
}

/**
 * 生成相邻节点之间的垂坠连线路径数据（纯几何，不生成 SVG 元素）。
 *
 * 关键行为：长度由 positions 决定，不再是写死的 3 对。
 * 0 个或 1 个点返回空数组；任意 N>=2 返回 N-1 条。
 *
 * @param {Array<{x:number,y:number}>} positions
 * @returns {Array<{p1:{x:number,y:number}, control:{x:number,y:number}, p2:{x:number,y:number}, d:string}>}
 */
export function buildConnectorPaths(positions) {
  if (!Array.isArray(positions) || positions.length < 2) return [];

  const out = [];
  for (let i = 0; i < positions.length - 1; i++) {
    const p1 = positions[i];
    const p2 = positions[i + 1];
    const midX = (p1.x + p2.x) / 2;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const controlY = Math.max(p1.y, p2.y) + length * 0.3;
    const control = { x: midX, y: controlY };
    out.push({ p1, control, p2, d: `M ${p1.x} ${p1.y} Q ${midX} ${controlY} ${p2.x} ${p2.y}` });
  }
  return out;
}
