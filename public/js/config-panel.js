// ./config-panel.js (módulo ES, versión final corregida)

let selectedShapeId = null;
const _iframeCache = new Map(); // Se mantiene pero ya no se usa para configuración dinámica

function attachConfigPanelBehaviors(panelElement) {
  if (!panelElement) return;

  panelElement.querySelectorAll('.close-config').forEach(btn => btn.onclick = closeConfigPanel);

  if (panelElement.querySelector('.config-content[data-internal="true"]')) {
    panelElement.querySelectorAll('[data-config-key]').forEach(input => {
      const key = input.dataset.configKey;
      input.oninput = input.onchange = (e) => {
        if (typeof window.updateShapeConfig === 'function') window.updateShapeConfig(key, e.target.value);
      };
    });

    panelElement.querySelectorAll('.config-footer .btn-secondary').forEach(btn => {
      if (btn.textContent.includes('Eliminar')) {
        btn.onclick = (e) => {
          e.preventDefault();
          if (typeof window.deleteCurrentShape === 'function') window.deleteCurrentShape();
        };
      }
    });
  }

  const btnSimulate = panelElement.querySelector('#btn-simulate');
  if (btnSimulate) {
    const resultArea = panelElement.querySelector('#result-area');
    btnSimulate.onclick = () => {
      const selector = panelElement.querySelector('#config-selector')?.value || '';
      const value = panelElement.querySelector('#config-value')?.value || '';
      const timeout = Number(panelElement.querySelector('#config-timeout')?.value) || 0;
      const success = !!panelElement.querySelector('#config-success')?.checked;
      const simulated = {
        action: btnSimulate.dataset.action,
        displayName: btnSimulate.dataset.displayName || btnSimulate.dataset.action,
        config: { selector, value, timeout },
        executedAt: new Date().toISOString(),
        status: success ? 'success' : 'error',
        output: success ? { message: 'Ejecución simulada correcta' } : { message: 'Ejecución simulada fallida', code: 500 }
      };
      if (resultArea) resultArea.textContent = JSON.stringify(simulated, null, 2);
    };
  }
}

function closeConfigPanel() {
  const canvasArea = document.getElementById('canvas');
  if (!canvasArea) return;
  canvasArea.innerHTML = '<div class="empty-canvas"><p>Selecciona un elemento para configurarlo</p></div>';
  document.querySelectorAll('.action-shape').forEach(s => s.classList.remove('selected'));
  document.querySelectorAll('.tool-action-btn.selected').forEach(s => s.classList.remove('selected'));
  selectedShapeId = null;
}

function getSelectedShapeId() {
  return selectedShapeId;
}

function openElementConfig(shapeId, shape, configPage, action, displayName, initialConfig) {
  selectedShapeId = shapeId;
  const canvasArea = document.getElementById('canvas');
  if (!canvasArea) return;

  if (configPage || action) {
    loadConfigPage({ action, configPage, nodeId: shapeId, initialConfig, displayName });
    return;
  }

  const actionName = shape?.action || shape?.config?.action || shape?.config?.toolAction || (shape?.config?.type === 'action' ? shape?.type : null);

  if (actionName) {
    const newPanel = createToolInfoPanel(actionName, displayName || actionName);
    const existing = canvasArea.querySelector('.config-panel');
    if (existing) {
      const newContent = newPanel.querySelector('.config-content');
      const existingContent = existing.querySelector('.config-content');
      if (newContent && existingContent) existingContent.innerHTML = newContent.innerHTML;
      attachConfigPanelBehaviors(existing);
    } else {
      canvasArea.innerHTML = '';
      canvasArea.appendChild(newPanel);
      attachConfigPanelBehaviors(newPanel);
    }
    return;
  }

  if (!shape) {
    ensureConfigPanelShell('Elemento No Seleccionado').querySelector('.config-content').innerHTML =
      `<div class="info-box">No se pudo determinar el tipo de elemento para configurar.</div>`;
    return;
  }

  let newPanel;
  switch (shape.type) {
    case 'oval': newPanel = createOvalConfigPanel(shape); break;
    case 'rectangle': newPanel = createRectangleConfigPanel(shape); break;
    default: newPanel = createGenericConfigPanel(shape);
  }

  const existing = canvasArea.querySelector('.config-panel');
  if (existing) {
    const newContent = newPanel.querySelector('.config-content');
    const existingContent = existing.querySelector('.config-content');
    if (newContent && existingContent) existingContent.innerHTML = newContent.innerHTML;
    attachConfigPanelBehaviors(existing);
  } else {
    canvasArea.innerHTML = '';
    canvasArea.appendChild(newPanel);
    attachConfigPanelBehaviors(newPanel);
  }
}

function showConfigPanel(shapeId, shape) {
  const displayName =
    shape?.config?.label || shape?.config?.text || shape?.label || shape?.name || shape?.action || shape?.type || 'Elemento';
  openElementConfig(shapeId, shape, null, null, displayName, shape?.config);
}

function createOvalConfigPanel(shape) {
  const panel = document.createElement('div');
  panel.className = 'config-panel';
  const config = shape?.config || {};
  panel.innerHTML = `
    <div class="config-header"><h2>Configuración: Inicio/Fin</h2><button class="close-config">✕</button></div>
    <div class="config-content" data-internal="true">
      <div class="config-section">
        <div class="form-group"><label>Tipo:</label>
          <select id="config-subtype" data-config-key="subtype">
            <option value="inicio" ${config.subtype === 'inicio' ? 'selected' : ''}>Inicio</option>
            <option value="fin" ${config.subtype === 'fin' ? 'selected' : ''}>Fin</option>
          </select>
        </div>
        <div class="form-group"><label>Etiqueta:</label>
          <input type="text" id="config-text" value="${config.text || ''}" data-config-key="text" placeholder="Texto">
        </div>
        <div class="form-group"><label>Descripción:</label>
          <textarea id="config-description" rows="3" data-config-key="description" placeholder="...">${config.description || ''}</textarea>
        </div>
      </div>
      <div class="config-section">
        <div class="form-group"><label>Color:</label>
          <input type="color" id="config-color" value="${config.color || '#ffffff'}" data-config-key="color">
        </div>
      </div>
      <div class="config-section"><div class="preview-container">
        <div class="shape-oval preview-shape" style="background-color:${config.color || '#ffffff'}">${config.text || ''}</div>
      </div></div>
    </div>
    <div class="config-footer"><button class="btn-secondary">Eliminar</button><button class="btn-primary close-config">Cerrar</button></div>
  `;
  return panel;
}

function createRectangleConfigPanel(shape) {
  const panel = document.createElement('div');
  panel.className = 'config-panel';
  const config = shape?.config || {};
  panel.innerHTML = `
    <div class="config-header"><h2>Configuración: Proceso</h2><button class="close-config">✕</button></div>
    <div class="config-content" data-internal="true">
      <div class="config-section">
        <div class="form-group"><label>Nombre:</label>
          <input type="text" id="config-text" value="${config.text || ''}" data-config-key="text" placeholder="Nombre">
        </div>
        <div class="form-group"><label>Descripción:</label>
          <textarea id="config-action" rows="3" data-config-key="action" placeholder="...">${config.action || ''}</textarea>
        </div>
      </div>
      <div class="config-section">
        <div class="form-group"><label>Color:</label>
          <input type="color" id="config-color" value="${config.color || '#ffffff'}" data-config-key="color">
        </div>
      </div>
      <div class="config-section"><div class="preview-container">
        <div class="shape-rectangle preview-shape" style="background-color:${config.color || '#ffffff'}">${config.text || ''}</div>
      </div></div>
    </div>
    <div class="config-footer"><button class="btn-secondary">Eliminar</button><button class="btn-primary close-config">Cerrar</button></div>
  `;
  return panel;
}

function createGenericConfigPanel(shape) {
  const panel = document.createElement('div');
  panel.className = 'config-panel';
  panel.innerHTML = `
    <div class="config-header"><h2>Configuración del Elemento</h2><button class="close-config">✕</button></div>
    <div class="config-content"><div class="config-section"><div class="info-box">Panel para ${shape.type} (En desarrollo)</div></div></div>
    <div class="config-footer"><button class="btn-secondary">Eliminar</button><button class="btn-primary close-config">Cerrar</button></div>
  `;
  return panel;
}

function createToolInfoPanel(action, displayName) {
  const panel = document.createElement('div');
  panel.className = 'config-panel';
  panel.innerHTML = `
    <div class="config-header"><h2>Herramienta: ${displayName || action}</h2><button class="close-config">✕</button></div>
    <div class="config-content">
      <div class="tools-info">
        <div class="tools-left">
          <div class="form-group"><label>Selector</label><input type="text" id="config-selector" value=""></div>
          <div class="form-group"><label>Valor</label><input type="text" id="config-value" value=""></div>
          <div class="form-group"><label>Timeout</label><input type="number" id="config-timeout" value="5000"></div>
          <div class="form-group"><label><input type="checkbox" id="config-success" checked> Simular ok</label></div>
          <div class="config-actions">
            <button class="btn-primary" id="btn-simulate" data-action="${action}" data-display-name="${displayName}">Ejecutar simulación</button>
            <button class="btn-secondary close-config">Cerrar</button>
          </div>
        </div>
        <div class="tools-right">
          <div class="result-box"><pre id="result-area">Aquí se mostrará el resultado.</pre></div>
        </div>
      </div>
    </div>
    <div class="config-footer"><small>Simulación frontend</small></div>
  `;
  return panel;
}

function ensureConfigPanelShell(title) {
  const canvasArea = document.getElementById('canvas');
  if (!canvasArea) return null;
  let panel = canvasArea.querySelector('.config-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'config-panel';
    panel.innerHTML = `<div class="config-header"><h2>${title || 'Configuración'}</h2><button class="close-config">✕</button></div><div class="config-content"><div class="info-box"><p>Selecciona un elemento para mostrar su configuración.</p></div></div><div class="config-footer"></div>`;
    canvasArea.innerHTML = '';
    canvasArea.appendChild(panel);
    attachConfigPanelBehaviors(panel);
  } else {
    const h2 = panel.querySelector('.config-header h2');
    if (h2) h2.textContent = title || 'Configuración';
  }
  const content = panel.querySelector('.config-content');
  if (content) content.style.background = '#f6f7f9';
  return panel;
}

function handleIframeMessage(event) {
  const msg = event?.data;
  if (!msg || !msg.type) return;
  switch (msg.type) {
    case 'save-config':
      document.dispatchEvent(new CustomEvent('configpanel:save', { detail: msg.payload }));
      break;
    case 'close':
      closeConfigPanel(); break;
    case 'preview':
      document.dispatchEvent(new CustomEvent('configpanel:preview', { detail: msg.payload })); break;
    default: break;
  }
}

// ---------------------------------------------------------------------
// FUNCIÓN CORREGIDA
// ---------------------------------------------------------------------
function loadConfigPage(options = {}) {
  const { action, configPage, nodeId, initialConfig, displayName } = options;
  const panel = ensureConfigPanelShell(displayName || action || 'Configuración');
  if (!panel) return;
  const content = panel.querySelector('.config-content');
  if (!content) return;
  
  let page = configPage || (action ? `config/${action}.html` : null);
  if (!page) { content.innerHTML = `<div class="info-box">No hay configuración disponible.</div>`; return; }

  // 💡 Corrección clave: Deshabilitar la caché. Añadir un timestamp como query 
  // para forzar al navegador a recargar el iframe cada vez, eliminando el "flash" 
  // y la pérdida de configuración.
  const pageUrl = `${page}?_t=${Date.now()}`; 

  const iframe = document.createElement('iframe');
  iframe.src = pageUrl;
  iframe.className = 'config-iframe';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = '0';
  iframe.setAttribute('loading', 'lazy');

  content.innerHTML = `<div class="info-box">Cargando configuración: ${page} ...</div>`;
  
  // No hay lógica de caché aquí: siempre se crea un iframe nuevo.
  
  iframe.addEventListener('load', () => {
    // Reemplazar el contenido de "Cargando" con el iframe si aún no está adjunto
    if (!content.contains(iframe)) {
      content.innerHTML = '';
      content.appendChild(iframe);
    }
    try { 
      // Enviar el mensaje 'init' con la configuración inicial al iframe
      iframe.contentWindow.postMessage({ type: 'init', payload: { nodeId: nodeId || null, initialConfig: initialConfig || null } }, '*'); 
    } catch (e) { /* Manejo de errores de postMessage */ }
  });
  
  // Adjuntar el iframe al DOM (esto dispara la carga)
  content.innerHTML = '';
  content.appendChild(iframe);
  
  // No se utiliza _iframeCache, por lo que no se almacena aquí.
  
  attachConfigPanelBehaviors(panel);
}
// ---------------------------------------------------------------------

function slugify(str = '') {
  return String(str).trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function attachActionButtons() {
  document.querySelectorAll('.tool-action-btn').forEach((btn) => {
    if (btn.__listenerAttached) return;
    let action = btn.dataset.action || btn.getAttribute('data-action') || null;
    const label = btn.dataset.label || btn.querySelector?.('.tool-name')?.textContent?.trim() || btn.textContent?.trim() || '';
    if (!action && label) { action = slugify(label); btn.dataset.action = action; }
    if (!btn.dataset.configPage && !btn.getAttribute('data-config-page') && action) btn.dataset.configPage = `config/${action}.html`;
    btn.__listenerAttached = true;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const actionAttr = btn.dataset.action || btn.getAttribute('data-action') || null;
      const configPage = btn.dataset.configPage || btn.getAttribute('data-config-page') || null;
      const displayName = btn.dataset.label || btn.querySelector?.('.tool-name')?.textContent?.trim() || actionAttr || 'Herramienta';
      openElementConfig(null, null, configPage, actionAttr, displayName, null);
      document.querySelectorAll('.tool-action-btn.selected').forEach(s => s.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
}

function initToolsListeners() {
  document.querySelectorAll('.tools-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tools-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const category = tab.dataset.category;
      ensureConfigPanelShell(`Categoría: ${category}`);
    });
  });
  attachActionButtons();
  setTimeout(attachActionButtons, 300);
}

function initWorkspaceSelectionListeners() {
  const workspace = document.getElementById('workspace-0');
  if (!workspace) return;
  workspace.addEventListener('click', (e) => {
    const el = e.target.closest('.action-shape, [data-shape-id], [data-action], [data-tool-action], [data-tool]');
    if (!el || !workspace.contains(el)) return;
    workspace.querySelectorAll('.selected').forEach(s => s.classList.remove('selected'));
    if (el.classList) el.classList.add('selected');
    const nodeId = el.dataset?.shapeId || el.getAttribute('data-shape-id') || el.id || null;
    const configPage = el.dataset?.configPage || el.getAttribute('data-config-page') || null;
    const action = el.dataset?.action || el.dataset?.toolAction || el.dataset?.tool || null;
    let initialConfig = null;
    if (el.dataset?.shapeConfig) {
      try { initialConfig = JSON.parse(el.dataset.shapeConfig); } catch (err) { initialConfig = null; }
    }
    let shape = initialConfig || { type: el.dataset?.shapeType || el.getAttribute('data-shape-type') || 'generic', config: {} };
    const text = el.textContent?.trim();
    if (text) shape.config.text = shape.config.text || text;
    const displayName = initialConfig?.label || action || el.textContent?.trim() || 'Configuración';
    openElementConfig(nodeId, shape, configPage, action, displayName, initialConfig);
  });
}

window.addEventListener('message', handleIframeMessage, false);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { initToolsListeners(); initWorkspaceSelectionListeners(); });
} else {
  initToolsListeners(); initWorkspaceSelectionListeners();
}

export const ConfigPanel = {
  show: showConfigPanel,
  close: closeConfigPanel,
  getSelectedId: getSelectedShapeId,
};

window.configPanel = ConfigPanel;
window.closeConfigPanel = closeConfigPanel;