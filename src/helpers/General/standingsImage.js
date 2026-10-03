/**
 * Draws an event's standings as a square PNG (1080×1080, the usual social-media size)
 * and downloads it. No libraries: plain canvas.
 *
 * @param {object} o { event, org, color, rows: [{ position, name, total }], labels: { title, pos, total, more } }
 */
export function downloadStandingsImage(o) {
  const S = 1080;
  const c = document.createElement('canvas');
  c.width = S; c.height = S;
  const g = c.getContext('2d');
  const color = /^#[0-9a-f]{6}$/i.test(o.color || '') ? o.color : '#0098D8';

  const bg = g.createLinearGradient(0, 0, S, S);
  bg.addColorStop(0, '#0b1220'); bg.addColorStop(1, '#151f33');
  g.fillStyle = bg; g.fillRect(0, 0, S, S);
  g.fillStyle = color; g.fillRect(0, 0, S, 14);

  const font = (w, px) => `${w} ${px}px "Inter", "Segoe UI", system-ui, sans-serif`;
  const fit = (text, max, w, px) => {
    let size = px;
    g.font = font(w, size);
    while (g.measureText(text).width > max && size > 18) { size -= 2; g.font = font(w, size); }
    return size;
  };
  const clip = (text, max) => {
    let t = String(text ?? '');
    if (g.measureText(t).width <= max) return t;
    while (t.length > 1 && g.measureText(t + '…').width > max) t = t.slice(0, -1);
    return t + '…';
  };

  g.fillStyle = '#9fb0c9'; g.font = font(600, 30);
  g.fillText(clip(o.org || '', S - 160), 80, 110);
  g.fillStyle = '#ffffff';
  fit(o.event, S - 160, 800, 58);
  g.fillText(clip(o.event, S - 160), 80, 180);
  g.fillStyle = color; g.font = font(700, 30);
  g.fillText(o.labels.title.toUpperCase(), 80, 238);

  const rows = o.rows.slice(0, 10);
  const top = 290; const rowH = 66;
  rows.forEach((r, i) => {
    const y = top + i * rowH;
    g.fillStyle = i % 2 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)';
    g.fillRect(60, y, S - 120, rowH - 8);
    const medal = { 1: '#f5c542', 2: '#c9d1dc', 3: '#d08b4f' }[r.position];
    g.fillStyle = medal || 'rgba(255,255,255,0.14)';
    g.beginPath(); g.arc(112, y + (rowH - 8) / 2, 22, 0, Math.PI * 2); g.fill();
    g.fillStyle = medal ? '#0b1220' : '#ffffff'; g.font = font(800, 24); g.textAlign = 'center';
    g.fillText(String(r.position), 112, y + (rowH - 8) / 2 + 8);
    g.textAlign = 'left'; g.fillStyle = '#ffffff'; g.font = font(i < 3 ? 700 : 500, 30);
    g.fillText(clip(r.name, S - 420), 156, y + (rowH - 8) / 2 + 10);
    g.textAlign = 'right'; g.font = font(800, 30); g.fillStyle = color;
    g.fillText(String(r.total ?? ''), S - 90, y + (rowH - 8) / 2 + 10);
    g.textAlign = 'left';
  });
  if (o.rows.length > rows.length) {
    g.fillStyle = '#9fb0c9'; g.font = font(500, 24);
    g.fillText(o.labels.more, 80, top + rows.length * rowH + 30);
  }
  g.fillStyle = '#9fb0c9'; g.font = font(700, 28); g.textAlign = 'right';
  g.fillText('ehubapp.com', S - 80, S - 60);
  g.textAlign = 'left';

  c.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = String(o.event || 'classificacao').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]+/g, '-').toLowerCase() + '-classificacao.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }, 'image/png');
}
