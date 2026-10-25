(function () {
  'use strict';

  const { BASE_ELEMENTS, combine, allElements } = window.Recipes;

  const STORAGE_KEY = 'little-mixer-discovered';
  const TILE_W = 110; // keep in sync with .tile width in style.css
  const TILE_H = 40; // keep in sync with .tile height in style.css
  const DRAG_THRESHOLD = 5; // pixels the pointer must move before a drag starts

  const els = {
    palette: document.getElementById('palette'),
    list: document.getElementById('palette-list'),
    search: document.getElementById('search'),
    workspace: document.getElementById('workspace'),
    hint: document.getElementById('hint'),
    progress: document.getElementById('progress'),
    reset: document.getElementById('reset-btn'),
    toast: document.getElementById('toast'),
  };

  const ALL_NAMES = allElements();
  const TOTAL = ALL_NAMES.length;

  const state = {
    discovered: loadDiscovered(), // element names in discovery order
    instances: [], // { id, name, x, y } tiles placed on the workspace
    nextId: 1,
    lastCreatedId: null, // gets a "pop" animation on next render
    fresh: new Set(), // names discovered this session, highlighted in the list
  };

  let drag = null;
  let hoverEl = null;
  let toastTimer = null;

  // ---------- Persistence ----------

  function loadDiscovered() {
    const list = [...BASE_ELEMENTS];
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (_) {
      saved = [];
    }
    if (Array.isArray(saved)) {
      for (const name of saved) {
        if (ALL_NAMES.includes(name) && !list.includes(name)) list.push(name);
      }
    }
    return list;
  }

  function saveDiscovered() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.discovered));
    } catch (_) {
      // Storage unavailable: progress simply won't persist.
    }
  }

  // ---------- State helpers ----------

  function discover(name) {
    if (state.discovered.includes(name)) return false;
    state.discovered.push(name);
    state.fresh.add(name);
    saveDiscovered();
    showToast(`New discovery: ${name}!`);
    return true;
  }

  function addInstance(name, x, y) {
    const inst = { id: state.nextId++, name, x, y };
    state.instances.push(inst);
    return inst;
  }

  function removeInstance(id) {
    state.instances = state.instances.filter((i) => i.id !== id);
  }

  function findInstance(id) {
    return state.instances.find((i) => i.id === id) || null;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), Math.max(min, max));
  }

  // ---------- Rendering ----------

  function makeTile(name, className) {
    const el = document.createElement('div');
    el.className = `tile ${className}`;
    el.textContent = name;
    el.title = name;
    return el;
  }

  function renderPalette() {
    const q = els.search.value.trim().toLowerCase();
    const frag = document.createDocumentFragment();
    for (const name of state.discovered) {
      if (q && !name.toLowerCase().includes(q)) continue;
      const item = makeTile(name, 'palette-item');
      item.dataset.name = name;
      if (state.fresh.has(name)) item.classList.add('is-new');
      frag.appendChild(item);
    }
    els.list.replaceChildren(frag);
    els.progress.textContent = `${state.discovered.length} / ${TOTAL} discovered`;
  }

  function renderWorkspace() {
    els.workspace.querySelectorAll('.workspace-tile').forEach((el) => el.remove());
    for (const inst of state.instances) {
      const el = makeTile(inst.name, 'workspace-tile');
      el.dataset.id = inst.id;
      el.style.left = `${inst.x}px`;
      el.style.top = `${inst.y}px`;
      if (inst.id === state.lastCreatedId) el.classList.add('pop');
      els.workspace.appendChild(el);
    }
    state.lastCreatedId = null; // only animate the new tile once
    els.hint.hidden = state.instances.length > 0;
  }

  function renderAll() {
    renderPalette();
    renderWorkspace();
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2000);
  }

  function flashShake(el) {
    el.classList.remove('shake');
    void el.offsetWidth; // restart the animation
    el.classList.add('shake');
  }

  // ---------- Hit testing ----------

  function isOver(el, x, y) {
    const r = el.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  function tileAt(x, y, ignoreId) {
    const el = document.elementFromPoint(x, y);
    const tile = el && el.closest('.workspace-tile');
    if (!tile || Number(tile.dataset.id) === ignoreId) return null;
    return tile;
  }

  function setHover(el) {
    if (hoverEl === el) return;
    if (hoverEl) hoverEl.classList.remove('drop-target');
    hoverEl = el;
    if (hoverEl) hoverEl.classList.add('drop-target');
  }

  // ---------- Pointer interaction ----------

  function onPointerDown(e) {
    if (e.button !== 0) return;
    const paletteItem = e.target.closest('.palette-item');
    const tileEl = e.target.closest('.workspace-tile');
    if (!paletteItem && !tileEl) return;

    e.preventDefault();

    if (paletteItem) {
      const name = paletteItem.dataset.name;
      paletteItem.classList.remove('is-new');
      state.fresh.delete(name);
      drag = {
        source: 'palette',
        name,
        id: null,
        origin: null,
        ghost: null,
        moved: false,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: TILE_W / 2,
        offsetY: TILE_H / 2,
      };
    } else {
      const inst = findInstance(Number(tileEl.dataset.id));
      if (!inst) return;
      const r = tileEl.getBoundingClientRect();
      drag = {
        source: 'tile',
        name: inst.name,
        id: inst.id,
        origin: tileEl,
        ghost: null,
        moved: false,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - r.left,
        offsetY: e.clientY - r.top,
      };
    }

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', cancelDrag);
  }

  function onPointerMove(e) {
    if (!drag) return;

    if (!drag.moved) {
      const dist = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY);
      if (dist < DRAG_THRESHOLD) return;
      drag.moved = true;
      drag.ghost = makeTile(drag.name, 'ghost');
      document.body.appendChild(drag.ghost);
      if (drag.origin) drag.origin.classList.add('dragging');
    }

    drag.ghost.style.left = `${e.clientX - drag.offsetX}px`;
    drag.ghost.style.top = `${e.clientY - drag.offsetY}px`;
    setHover(tileAt(e.clientX, e.clientY, drag.id));
  }

  function onPointerUp(e) {
    if (!drag) return;
    const finished = drag;
    endDrag();

    if (!finished.moved) {
      // A plain click on a list item adds it to the middle of the workspace.
      if (finished.source === 'palette') spawnAtCenter(finished.name);
      return;
    }
    handleDrop(finished, e.clientX, e.clientY);
  }

  function cancelDrag() {
    endDrag();
  }

  function endDrag() {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', cancelDrag);
    if (drag && drag.ghost) drag.ghost.remove();
    if (drag && drag.origin) drag.origin.classList.remove('dragging');
    setHover(null);
    drag = null;
  }

  // ---------- Drop handling ----------

  function handleDrop(d, x, y) {
    const targetEl = tileAt(x, y, d.id);
    if (targetEl) {
      combineOnto(d, targetEl);
      return;
    }

    // Dragging a placed tile back onto the list removes it.
    if (d.source === 'tile' && isOver(els.palette, x, y)) {
      removeInstance(d.id);
      renderWorkspace();
      return;
    }

    if (isOver(els.workspace, x, y)) {
      const r = els.workspace.getBoundingClientRect();
      const left = clamp(x - d.offsetX - r.left, 0, r.width - TILE_W);
      const top = clamp(y - d.offsetY - r.top, 0, r.height - TILE_H);
      if (d.source === 'palette') {
        state.lastCreatedId = addInstance(d.name, left, top).id;
      } else {
        const inst = findInstance(d.id);
        if (inst) {
          inst.x = left;
          inst.y = top;
        }
      }
      renderWorkspace();
    }
  }

  function combineOnto(d, targetEl) {
    const target = findInstance(Number(targetEl.dataset.id));
    if (!target) return;

    const result = combine(target.name, d.name);
    if (!result) {
      flashShake(targetEl);
      showToast(`${target.name} + ${d.name} doesn't make anything.`);
      return;
    }

    if (d.source === 'tile') removeInstance(d.id);
    removeInstance(target.id);
    const created = addInstance(result, target.x, target.y);
    state.lastCreatedId = created.id;
    discover(result);
    renderAll();
  }

  function spawnAtCenter(name) {
    const r = els.workspace.getBoundingClientRect();
    const jitter = () => (Math.random() - 0.5) * 120;
    const x = clamp(r.width / 2 - TILE_W / 2 + jitter(), 0, r.width - TILE_W);
    const y = clamp(r.height / 2 - TILE_H / 2 + jitter(), 0, r.height - TILE_H);
    state.lastCreatedId = addInstance(name, x, y).id;
    renderWorkspace();
  }

  // ---------- Controls ----------

  function resetGame() {
    if (!confirm('Reset all discoveries and clear the workspace?')) return;
    state.discovered = [...BASE_ELEMENTS];
    state.fresh.clear();
    state.instances = [];
    state.lastCreatedId = null;
    saveDiscovered();
    els.search.value = '';
    renderAll();
  }

  document.addEventListener('pointerdown', onPointerDown);
  els.search.addEventListener('input', renderPalette);
  els.reset.addEventListener('click', resetGame);

  renderAll();
})();
