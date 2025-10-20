// funciones expuestas globalmente (se usan desde atributos onclick)

function closeConfigPanel() {
    const panel = document.querySelector('.panel-config');
    if (!panel) return;
    panel.style.transition = 'opacity 220ms ease, transform 220ms ease';
    panel.style.opacity = '0';
    panel.style.transform = 'translateX(-8px)';
    setTimeout(() => panel.style.display = 'none', 220);
}

function clearResults() {
    const el = id => document.getElementById(id);
    if (el('resultUrl')) el('resultUrl').textContent = 'N/A';
    if (el('resultStatus')) el('resultStatus').textContent = 'Pendiente de Ejecución';
    if (el('resultPath')) el('resultPath').textContent = 'N/A';
    if (el('resultTimestamp')) el('resultTimestamp').textContent = 'N/A';
    if (el('resultTime')) el('resultTime').textContent = 'N/A';
    const img = el('screenshotPreview');
    if (img) {
        img.style.display = 'none';
        img.src = '';
    }
    const ph = document.getElementById('previewPlaceholder');
    if (ph) ph.style.display = 'flex';
}

function showStatus(text, type = 'info') {
    const s = document.getElementById('status');
    if (!s) return;
    s.textContent = text;
    s.style.display = 'inline-block';
    s.style.color = (type === 'error') ? '#e02424' : '#0b63ff';
    setTimeout(() => {
        if (s) s.style.display = 'none';
    }, 4500);
}

function removeSvgConnectionsByBlockId(blockId) {
    if (!blockId) return;
    const svgs = document.querySelectorAll('.workspace-content .connections-canvas svg');
    svgs.forEach(svg => {
        const toRemove = svg.querySelectorAll(`[data-block-id="${blockId}"], [data-from-block="${blockId}"], [data-to-block="${blockId}"]`);
        toRemove.forEach(n => n.remove());
    });
}

function fadeOutAndRemove(el) {
    if (!el) return;
    el.style.transition = 'opacity 200ms ease, transform 200ms ease';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-6px) scale(0.99)';
    setTimeout(() => {
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 220);
}

function confirmDelete() {
    const ok = confirm('¿Deseas eliminar la configuración y limpiar los resultados?');
    if (!ok) return;

    const form = document.getElementById('configForm');
    if (form) form.reset();
    clearResults();

    const panel = document.querySelector('.panel-config');
    if (!panel) {
        showStatus('Panel no encontrado.', 'error');
        return;
    }

    const workspace = panel.closest('.workspace-content');

    let placedShape = panel.closest('.placed-shape') || panel.closest('.action-block') || null;
    if (!placedShape) {
        const abc = panel.closest('.action-block-content');
        if (abc) placedShape = abc.closest('.placed-shape');
    }

    if (placedShape) {
        const blockId = placedShape.getAttribute('data-id') || placedShape.getAttribute('data-block-id') || placedShape.dataset.id;
        if (!workspace || workspace.contains(placedShape)) {
            removeSvgConnectionsByBlockId(blockId);
            fadeOutAndRemove(placedShape);
            showStatus('Bloque de acción eliminado.', 'info');
            return;
        }
    }

    const actionBlockContent = panel.closest('.action-block-content');
    if (actionBlockContent) {
        const parentPlaced = actionBlockContent.closest('.placed-shape');
        const blockId2 = parentPlaced ? (parentPlaced.getAttribute('data-id') || parentPlaced.dataset.id) : null;
        if (blockId2) removeSvgConnectionsByBlockId(blockId2);
        if (!workspace || workspace.contains(actionBlockContent)) {
            fadeOutAndRemove(actionBlockContent);
            showStatus('Contenido de acción eliminado.', 'info');
            return;
        }
    }

    if (workspace && workspace.contains(panel)) {
        fadeOutAndRemove(panel);
        showStatus('Panel eliminado del workspace.', 'info');
        return;
    }

    showStatus('Configuración eliminada.', 'info');
}

function fillExample() {
    const t = document.getElementById('targetUrl');
    const v = document.getElementById('viewport');
    if (t) t.value = 'https://example.com';
    if (v) v.value = 'desktop';
    showStatus('Valores de ejemplo cargados');
}

function openAdvanced() {
    alert('Aquí puedes abrir las opciones avanzadas (no implementado en el demo).');
}

async function runExecution() {
    const urlEl = document.getElementById('targetUrl');
    const url = urlEl ? urlEl.value.trim() : '';
    if (!url) {
        showStatus('Introduce una URL válida.', 'error');
        return;
    }

    showStatus('Ejecución en curso...');
    const rs = document.getElementById('resultStatus');
    if (rs) rs.textContent = 'En progreso';

    const start = Date.now();
    try {
        await new Promise(r => setTimeout(r, 900));
        const fakePath = `/screenshots/${Date.now()}-screenshot.png`;
        const elapsed = Date.now() - start;

        if (document.getElementById('resultUrl')) document.getElementById('resultUrl').textContent = url;
        if (document.getElementById('resultStatus')) document.getElementById('resultStatus').textContent = 'Completado';
        if (document.getElementById('resultPath')) document.getElementById('resultPath').textContent = fakePath;
        if (document.getElementById('resultTimestamp')) document.getElementById('resultTimestamp').textContent = new Date().toLocaleString();
        if (document.getElementById('resultTime')) document.getElementById('resultTime').textContent = `${elapsed} ms`;

        const img = document.getElementById('screenshotPreview');
        const demoSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700">
                <rect width="100%" height="100%" fill="#f8fafc"/>
                <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#9aa4b2">Screenshot de demo — ${new Date().toLocaleString()}</text>
            </svg>`
        );
        if (img) {
            img.src = demoSvg;
            img.style.display = 'block';
        }
        const ph = document.getElementById('previewPlaceholder');
        if (ph) ph.style.display = 'none';

        showStatus('Ejecución finalizada.');
    } catch (err) {
        console.error(err);
        const rs2 = document.getElementById('resultStatus');
        if (rs2) rs2.textContent = 'Error';
        showStatus('Error durante la ejecución: ' + (err.message || ''), 'error');
    }
}

// inicializar
clearResults();
