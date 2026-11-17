/**
 * 时间线渲染层（唯一碰 DOM 的部分）。
 * 逻辑全部在 timeline-logic.js，这里只负责读数据、写元素、画线。
 */
import { TIMELINE_ITEMS, normalizeItems } from './timeline-data.js';
import { buildConnectorPaths } from './timeline-logic.js';

/**
 * 按数据渲染卡片，替换 .timeline-items 的内容。
 * @param {HTMLElement} container .timeline-items 容器
 * @param {Array} items 原始数据
 * @returns {number} 渲染出的卡片数量
 */
export function renderItems(container, items = TIMELINE_ITEMS) {
  if (!container) return 0;
  const list = normalizeItems(items);
  container.innerHTML = list
    .map(
      (it) => `
        <div class="timeline-item ${it.side}">
          <div class="ticket-card" style="position: relative;">
            <div class="timeline-dot"></div>
            <span class="bg-accent text-white px-3 py-1 rounded-full text-sm font-gochi">${escapeHtml(it.date)}</span>
            <div class="divider"></div>
            <h3 class="text-2xl font-caveat mt-2 mb-2">${escapeHtml(it.key)}</h3>
            <p class="opacity-70 text-sm">${escapeHtml(it.note)}</p>
          </div>
        </div>`
    )
    .join('');
  return list.length;
}

/**
 * 画垂坠连线。移动端不画（卡片垂直排列，连线无意义）。
 * @param {HTMLElement} container .timeline-horizontal
 * @param {SVGElement} svg #timeline-svg
 * @param {number} minWidth 小于该宽度不绘制
 */
export function drawTimelineLines(container, svg, minWidth = 768) {
  if (!svg || !container) return;
  if (typeof window !== 'undefined' && window.innerWidth < minWidth) {
    svg.innerHTML = '';
    return;
  }

  const dots = container.querySelectorAll('.timeline-item .timeline-dot');
  const containerRect = container.getBoundingClientRect();
  const positions = Array.from(dots).map((dot) => {
    const rect = dot.getBoundingClientRect();
    return {
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + rect.height / 2,
    };
  });

  svg.innerHTML = '';
  const paths = buildConnectorPaths(positions);

  paths.forEach((item, start) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', item.d);
    path.setAttribute('stroke', '#E35342');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('opacity', '0.9');
    svg.appendChild(path);

    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    path.style.transition = `stroke-dashoffset 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${start * 0.2}s`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        path.style.strokeDashoffset = '0';
      });
    });
  });
}

/**
 * 给渲染出的卡片挂滚动入场观察器。
 *
 * 必须在 renderItems 之后调用：卡片是动态生成的，
 * 放在 index.html 的解析期脚本里会因为元素还不存在而静默失效（卡片一直 opacity:0）。
 *
 * @param {HTMLElement} container .timeline-items
 * @param {number} threshold
 * @returns {IntersectionObserver|null}
 */
export function observeCardReveal(container, threshold = 0.1) {
  if (!container || typeof IntersectionObserver === 'undefined') return null;
  const items = container.querySelectorAll('.timeline-item');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('show');
      });
    },
    { threshold }
  );
  items.forEach((item) => observer.observe(item));
  return observer;
}

/** 极简转义，防止文案里的 < > & 破坏结构 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** 挂在 window 上供内联调用（保持与旧调用点兼容） */
if (typeof window !== 'undefined') {
  window.__timeline = { renderItems, drawTimelineLines, observeCardReveal };
  window.addEventListener('load', () => {
    const container = document.querySelector('.timeline-horizontal');
    const items = document.querySelector('.timeline-items');
    const svg = document.getElementById('timeline-svg');
    if (!items) return;
    renderItems(items, TIMELINE_ITEMS);
    observeCardReveal(items);
    drawTimelineLines(container, svg);
  });
  window.addEventListener('resize', () => {
    drawTimelineLines(
      document.querySelector('.timeline-horizontal'),
      document.getElementById('timeline-svg')
    );
  });
}
