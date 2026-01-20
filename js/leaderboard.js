
(function(){
  const $ = s=>document.querySelector(s); const wrap = $('#lbWrap');
  
function parseStorage() {
  const data = {}; // { 'Quiz': [ { key, value }, ... ], ... }

  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;

    // We care about specific game prefixes:
    // quiz:cat:sub, memory:..., cloze:..., sudoku:..., wordsearch:...
    let group = null;
    if (k.startsWith('quiz:')) group = 'Quiz';
    else if (k.startsWith('memory:')) group = 'Memory';
    else if (k.startsWith('cloze:')) group = 'Cloze';
    else if (k.startsWith('sudoku:')) group = 'Sudoku';
    else if (k.startsWith('wordsearch:')) group = 'Word Search';
    else continue; // ignore other keys

    const raw = localStorage.getItem(k);
    let v;
    try { v = JSON.parse(raw); } catch { v = raw; }

    (data[group] ||= []).push({ key: k, value: v });
  }

  // Sort each group by value descending where value is numeric
  Object.keys(data).forEach(g => {
    data[g].sort((a,b) => {
      const va = typeof a.value === 'number' ? a.value : 0;
      const vb = typeof b.value === 'number' ? b.value : 0;
      return vb - va;
    });
  });

  return data;
}


function fmt(ms) {
  // simple mm:ss
  const sec = Math.floor((+ms || 0) / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2,'0')}`;
}

function render() {
  const data = parseStorage();
  const groups = Object.keys(data);
  if (!groups.length) {
    wrap.innerHTML = '<p>No entries yet.</p>';
    return;
  }

  wrap.innerHTML = groups.map(g => {
    const rows = data[g].map(r => {
      const label = r.key.split(':').slice(1).join(' › '); // cat › sub
      const v = r.value;

      let stat = '';
      if (g === 'Quiz') stat = `Score: ${v}`;                     // <-- quiz numeric
      else if (g === 'Memory') stat = `Best time: ${fmt(v.ms)} — Moves: ${v.moves}`;
      else if (g === 'Cloze')  stat = `Correct: ${v.right} — Time: ${fmt(v.ms)}`;
      else if (g === 'Sudoku') stat = `Best time: ${fmt(v.ms)}`;
      else if (g === 'Word Search') stat = `Best time: ${fmt(v.ms)}`;

      return `
        <tr>
          <td>${label}</td>
          <td>${stat}</td>
        </tr>`;
    }).join('');

    return `
      <h3>${g}</h3>
      <table>
        <tr><th>Category</th><th>Best</th></tr>
        ${rows}
      </table>`;
  }).join('');
}

document.getElementById('lbRefresh').addEventListener('click', render);
document.getElementById('lbClear').addEventListener('click', () => {
  if (!confirm('Clear all leaderboard entries?')) return;
  ['quiz:','memory:','cloze:','sudoku:','wordsearch:'].forEach(pref => {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(pref)) localStorage.removeItem(k);
    }
  });
  render();
});

document.getElementById('lbExport').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(parseStorage(), null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leaderboard.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
});

render();
  document.getElementById('lbRefresh').addEventListener('click', render);
  document.getElementById('lbClear').addEventListener('click', ()=>{ if(confirm('Clear all leaderboard entries?')){ ['quiz:','memory:','cloze:','sudoku:','wordsearch:'].forEach(pref=>{ for(let i=localStorage.length-1;i>=0;i--){ const k=localStorage.key(i); if(k && k.startsWith(pref)) localStorage.removeItem(k); } }); render(); } });
  document.getElementById('lbExport').addEventListener('click', ()=>{ const blob=new Blob([JSON.stringify(parseStorage(),null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='leaderboard.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),500); });
  render();
})();
