import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { easeInOut, resolveKeyframeXP, buildConnectorPaths } from '../js/timeline-logic.js';
import { TIMELINE_ITEMS, normalizeItems } from '../js/timeline-data.js';

describe('easeInOut', () => {
  test('端点固定：0 进 0 出，1 进 1 出', () => {
    assert.equal(easeInOut(0), 0);
    assert.equal(easeInOut(1), 1);
  });

  test('中点对称：0.5 处为 0.5', () => {
    assert.equal(easeInOut(0.5), 0.5);
  });

  test('单调不减', () => {
    let prev = -Infinity;
    for (let t = 0; t <= 1; t += 0.05) {
      const v = easeInOut(t);
      assert.ok(v >= prev, `t=${t} 处出现回落`);
      prev = v;
    }
  });

  test('越界与非法输入被夹紧，不抛错', () => {
    assert.equal(easeInOut(-3), 0);
    assert.equal(easeInOut(9), 1);
    assert.equal(easeInOut(NaN), 0);
  });
});

describe('resolveKeyframeXP', () => {
  // 与线上一致的关键帧（节选）
  const keyframes = [
    { yp: 0.0, xp: 0.05 },
    { yp: 0.15, xp: 0.32 },
    { yp: 0.28, xp: 0.22 },
    { yp: 0.38, xp: 0.4 },
    { yp: 0.48, xp: 0.58 },
    { yp: 0.62, xp: 0.65 },
    { yp: 0.78, xp: 0.72 },
    { yp: 1.0, xp: 0.82 },
  ];

  test('落在关键帧上时取该帧值', () => {
    assert.equal(resolveKeyframeXP(keyframes, 0.0), 0.05);
    assert.equal(resolveKeyframeXP(keyframes, 0.38), 0.4);
  });

  test('区间内返回首尾之间', () => {
    const v = resolveKeyframeXP(keyframes, 0.43);
    assert.ok(v > 0.4 && v < 0.58, `期望 0.4~0.58 之间，实际 ${v}`);
  });

  test('超过末帧时夹紧到末帧（回归测试：旧实现会外插出错误值）', () => {
    // 旧实现此时 prev/next 停在 [0.0,0.15] 两帧，会返回负数
    assert.equal(resolveKeyframeXP(keyframes, 1.6), 0.82);
  });

  test('低于首帧时夹紧到首帧', () => {
    assert.equal(resolveKeyframeXP(keyframes, -0.5), 0.05);
  });

  test('空/单帧/非法入参不抛错', () => {
    assert.equal(resolveKeyframeXP([], 0.3), 0);
    assert.equal(resolveKeyframeXP([{ yp: 0, xp: 0.5 }], 0.3), 0.5);
    assert.equal(resolveKeyframeXP(keyframes, NaN), 0.05);
  });
});

describe('buildConnectorPaths', () => {
  const mk = (n) =>
    Array.from({ length: n }, (_, i) => ({ x: i * 100, y: i % 2 === 0 ? 0 : 40 }));

  test('0 个或 1 个点不画线', () => {
    assert.deepEqual(buildConnectorPaths([]), []);
    assert.deepEqual(buildConnectorPaths([{ x: 0, y: 0 }]), []);
    assert.deepEqual(buildConnectorPaths(null), []);
  });

  test('N 个点生成 N-1 条线', () => {
    for (const n of [2, 4, 5, 7, 12]) {
      assert.equal(buildConnectorPaths(mk(n)).length, n - 1, `${n} 点应有 ${n - 1} 条线`);
    }
  });

  test('回归：第 5 张卡片仍能连线（旧实现写死 4 点，第 5 张起线消失）', () => {
    const paths5 = buildConnectorPaths(mk(5));
    assert.equal(paths5.length, 4, '5 张卡片应产出 4 条连接线');
    // 最后一条必须连接第 4、5 个点
    assert.equal(paths5[3].p1.x, 300);
    assert.equal(paths5[3].p2.x, 400);
  });

  test('路径字符串可被 SVG 解析（含 M 与 Q）', () => {
    const p = buildConnectorPaths(mk(2))[0];
    assert.match(p.d, /^M .* Q .*$/);
  });

  test('控制点始终在两点下方，保证垂坠方向一致', () => {
    for (const p of buildConnectorPaths(mk(6))) {
      assert.ok(p.control.y > Math.max(p.p1.y, p.p2.y), '控制点应低于两端');
    }
  });
});

describe('normalizeItems', () => {
  test('线上数据全部通过校验', () => {
    const out = normalizeItems(TIMELINE_ITEMS);
    assert.equal(out.length, TIMELINE_ITEMS.length);
    for (const it of out) assert.ok(['top', 'bottom'].includes(it.side));
  });

  test('缺 date 或 key 的条目被丢弃', () => {
    const out = normalizeItems([{ key: 'A' }, { date: '2025.01.01' }, { date: '2025.02.02', key: 'B' }]);
    assert.equal(out.length, 1);
    assert.equal(out[0].key, 'B');
  });

  test('side 非法或缺失时按索引兜底', () => {
    const out = normalizeItems([
      { date: 'd1', key: 'k1' },
      { date: 'd2', key: 'k2' },
      { date: 'd3', key: 'k3', side: 'left' },
    ]);
    assert.equal(out[0].side, 'top');
    assert.equal(out[1].side, 'bottom');
    assert.equal(out[2].side, 'top', '非法 side 按索引兜底');
  });

  test('非数组输入返回空数组，不抛错', () => {
    assert.deepEqual(normalizeItems(null), []);
    assert.deepEqual(normalizeItems(undefined), []);
    assert.deepEqual(normalizeItems('nope'), []);
  });
});
