// Gestión del panel de configuración

let selectedShapeId = null;

// ===============================================
// Funciones de Comportamiento y Utilidad
// ===============================================

// Función esencial para adjuntar listeners DESPUÉS de insertar HTML (Elimina JS inline)
function attachConfigPanelBehaviors(panelElement) {
  if (!panelElement) return;

  // 1. Botón de Cerrar (general)
  panelElement.querySelectorAll('.close-config').forEach(btn => {
    btn.onclick = closeConfigPanel;
  });

  // 2. Comportamiento de inputs en paneles internos (Oval/Rectangle)
  if (panelElement.querySelector('.config-content[data-internal="true"]')) {
    // Asume que las funciones updateShapeConfig y deleteCurrentShape están definidas globalmente

    // Listener para inputs/selects que usan updateShapeConfig(key, value)
    panelElement.querySelectorAll('[data-config-key]').forEach(input => {
      const key = input.dataset.configKey;
      input.oninput = input.onchange = (e) => {
        // Previene error si updateShapeConfig no existe (asume que existe en el entorno)
        if (typeof window.updateShapeConfig === 'function') {
          window.updateShapeConfig(key, e.target.value);
        } else {
          console.warn('Función updateShapeConfig no definida. No se actualizará la configuración.');
        }
      };
    });

    // Listener para el botón de Eliminar
    panelElement.querySelectorAll('.config-footer .btn-secondary').forEach(btn => {
      if (btn.textContent.includes('Eliminar')) {
        btn.onclick = (e) => {
          e.preventDefault();
          if (typeof window.deleteCurrentShape === 'function') {
            window.deleteCurrentShape();
          } else {
            console.warn('Función deleteCurrentShape no definida.');
          }
        };
      }
    });
  }

  // 3. Comportamiento del botón de simulación en Tool Panel
  const btnSimulate = panelElement.querySelector('#btn-simulate');
  if (btnSimulate) {
    const action = btnSimulate.dataset.action;
    const displayName = btnSimulate.dataset.displayName;
    const resultArea = panelElement.querySelector('#result-area');

    btnSimulate.onclick = () => {
      const selector = panelElement.querySelector('#config-selector').value;
      const value = panelElement.querySelector('#config-value').value;
      const timeout = Number(panelElement.querySelector('#config-timeout').value) || 0;
      const success = !!panelElement.querySelector('#config-success').checked;

      const simulated = {
        action,
        displayName: displayName || action,
        config: { selector, value, timeout },
        executedAt: new Date().toISOString(),
        status: success ? 'success' : 'error',
        output: success ? { message: 'Ejecución simulada correcta', data: { sample: 123 } } : { message: 'Ejecución simulada fallida', code: 500 }
      };

      if (resultArea) resultArea.textContent = JSON.stringify(simulated, null, 2);
    };
  }
}

// Cerrar panel de configuración
function closeConfigPanel() {
  const canvasArea = document.getElementById('canvas');
  if (!canvasArea) return;

  canvasArea.innerHTML =
    '<div class="empty-canvas"><p>Selecciona un elemento para configurarlo</p></div>';

  // Remover selección visual
  document.querySelectorAll('.action-shape').forEach((s) => {
    s.classList.remove('selected');
  });
  document.querySelectorAll('.tool-action-btn.selected').forEach((s) => {
    s.classList.remove('selected');
  });

  selectedShapeId = null;
}

// Obtener ID del elemento seleccionado
function getSelectedShapeId() {
  return selectedShapeId;
}

// Función principal unificada para abrir la configuración
function openElementConfig(shapeId, shape, configPage, action, displayName, initialConfig) {
  selectedShapeId = shapeId;
  const canvasArea = document.getElementById('canvas');
  if (!canvasArea) return;

  // PRIORIDAD 1: Cargar configuración mediante Iframe (la más flexible)
  if (configPage || action) {
    loadConfigPage({ action, configPage, nodeId: shapeId, initialConfig, displayName });
    return;
  }

  // PRIORIDAD 2: Si no hay página externa, revisar si es una herramienta interna (simulación)
  const actionName =
    shape?.action ||
    shape?.config?.action ||
    shape?.config?.toolAction ||
    (shape?.config?.type === 'action' ? shape?.type : null) || // Ajustado para capturar toolAction si es tipo 'action'
    null;

  if (actionName) {
    // Crear panel de herramienta de simulación
    const newPanel = createToolInfoPanel(actionName, displayName || actionName);
    const existing = canvasArea.querySelector('.config-panel');

    if (existing) {
      // Lógica de reemplazo de contenido similar a showConfigPanel original
      const newHeader = newPanel.querySelector('.config-header');
      const existingHeader = existing.querySelector('.config-header');
      if (newHeader && existingHeader) {
        const newTitle = newHeader.querySelector('h2');
        const oldTitle = existingHeader.querySelector('h2');
        if (newTitle && oldTitle) oldTitle.textContent = newTitle.textContent;
      }
      const newContent = newPanel.querySelector('.config-content');
      const existingContent = existing.querySelector('.config-content');
      if (newContent && existingContent) existingContent.innerHTML = newContent.innerHTML;
      const newFooter = newPanel.querySelector('.config-footer');
      const existingFooter = existing.querySelector('.config-footer');
      if (newFooter && existingFooter) existingFooter.innerHTML = newFooter.innerHTML;

      attachConfigPanelBehaviors(existing);
    } else {
      canvasArea.innerHTML = '';
      canvasArea.appendChild(newPanel);
      attachConfigPanelBehaviors(newPanel);
    }
    return;
  }

  // PRIORIDAD 3: Paneles internos por tipo de forma (Oval, Rectangle, Genérico)
  if (!shape) {
    // Si no hay información de forma, mostramos un fallback
    ensureConfigPanelShell('Elemento No Seleccionado').querySelector('.config-content').innerHTML =
      `<div class="info-box">No se pudo determinar el tipo de elemento para configurar.</div>`;
    return;
  }

  let newPanel;
  switch (shape.type) {
    case 'oval':
      newPanel = createOvalConfigPanel(shape);
      break;
    case 'rectangle':
      newPanel = createRectangleConfigPanel(shape);
      break;
    default:
      newPanel = createGenericConfigPanel(shape);
  }

  const existing = canvasArea.querySelector('.config-panel');
  if (existing) {
    // Lógica de actualización de panel existente (manteniendo el contenedor)
    const newHeader = newPanel.querySelector('.config-header');
    const existingHeader = existing.querySelector('.config-header');
    if (newHeader && existingHeader) {
      const newTitle = newHeader.querySelector('h2');
      const oldTitle = existingHeader.querySelector('h2');
      if (newTitle && oldTitle) oldTitle.textContent = newTitle.textContent;
    }

    const newContent = newPanel.querySelector('.config-content');
    const existingContent = existing.querySelector('.config-content');
    if (newContent && existingContent) existingContent.innerHTML = newContent.innerHTML;

    const newFooter = newPanel.querySelector('.config-footer');
    const existingFooter = existing.querySelector('.config-footer');
    if (newFooter && existingFooter) existingFooter.innerHTML = newFooter.innerHTML;

    attachConfigPanelBehaviors(existing);
  } else {
    canvasArea.innerHTML = '';
    canvasArea.appendChild(newPanel);
    attachConfigPanelBehaviors(newPanel);
  }
}

// Función showConfigPanel original ahora llama a la función unificada.
function showConfigPanel(shapeId, shape) {
  const displayName =
    shape?.config?.label ||
    shape?.config?.text ||
    shape?.label ||
    shape?.name ||
    shape?.action ||
    shape?.config?.toolAction ||
    shape?.type ||
    'Elemento';

  // Delegar al handler unificado sin configPage ni action explícitos
  openElementConfig(shapeId, shape, null, null, displayName, shape?.config);
}


// ===============================================
// Paneles Internos (Markup)
// ===============================================

// Nota: se eliminan los 'onclick', 'oninput', 'onchange' inline en favor de attachConfigPanelBehaviors.

function createOvalConfigPanel(shape) {
  const panel = document.createElement('div');
  panel.className = 'config-panel';
  const config = shape?.config || {};

  panel.innerHTML = `
        <div class="config-header">
            <h2>Configuración: Inicio/Fin</h2>
            <button class="close-config">✕</button>
        </div>
        
        <div class="config-content" data-internal="true">
            <div class="config-section">
                <h3>Información Básica</h3>
                
                <div class="form-group">
                    <label>Tipo de elemento:</label>
                    <select id="config-subtype" data-config-key="subtype">
                        <option value="inicio" ${config.subtype === 'inicio' ? 'selected' : ''
    }>Inicio</option>
                        <option value="fin" ${config.subtype === 'fin' ? 'selected' : ''
    }>Fin</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Etiqueta:</label>
                    <input type="text" id="config-text" value="${config.text || ''}" 
                           data-config-key="text" 
                           placeholder="Texto del elemento">
                </div>
                
                <div class="form-group">
                    <label>Descripción:</label>
                    <textarea id="config-description" rows="3" 
                              data-config-key="description"
                              placeholder="Descripción opcional...">${config.description || ''
    }</textarea>
                </div>
            </div>
            
            <div class="config-section">
                <h3>Apariencia</h3>
                
                <div class="form-group">
                    <label>Color de fondo:</label>
                    <input type="color" id="config-color" value="${config.color || '#fff'}" 
                           data-config-key="color">
                </div>
            </div>
            
            <div class="config-section">
                <h3>Vista Previa</h3>
                <div class="preview-container">
                    <div class="shape-oval preview-shape" style="background-color: ${config.color || '#fff'
    }">
                        ${config.text || ''}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="config-footer">
            <button class="btn-secondary">Eliminar</button>
            <button class="btn-primary" onclick="closeConfigPanel()">Cerrar</button>
        </div>
    `;
  return panel;
}

function createRectangleConfigPanel(shape) {
  const panel = document.createElement('div');
  panel.className = 'config-panel';
  const config = shape?.config || {};

  panel.innerHTML = `
        <div class="config-header">
            <h2>Configuración: Proceso</h2>
            <button class="close-config">✕</button>
        </div>
        
        <div class="config-content" data-internal="true">
            <div class="config-section">
                <h3>Información Básica</h3>
                
                <div class="form-group">
                    <label>Nombre de la acción:</label>
                    <input type="text" id="config-text" value="${config.text || ''}" 
                           data-config-key="text" 
                           placeholder="Nombre del proceso">
                </div>
                
                <div class="form-group">
                    <label>Descripción de la acción:</label>
                    <textarea id="config-action" rows="3" 
                              data-config-key="action"
                              placeholder="Describe qué hace este proceso...">${config.action || ''
    }</textarea>
                </div>
                
                <div class="form-group">
                    <label>Notas adicionales:</label>
                    <textarea id="config-description" rows="2" 
                              data-config-key="description"
                              placeholder="Notas opcionales...">${config.description || ''
    }</textarea>
                </div>
            </div>
            
            <div class="config-section">
                <h3>Apariencia</h3>
                
                <div class="form-group">
                    <label>Color de fondo:</label>
                    <input type="color" id="config-color" value="${config.color || '#fff'}" 
                           data-config-key="color">
                </div>
            </div>
            
            <div class="config-section">
                <h3>Vista Previa</h3>
                <div class="preview-container">
                    <div class="shape-rectangle preview-shape" style="background-color: ${config.color || '#fff'
    }">
                        ${config.text || ''}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="config-footer">
            <button class="btn-secondary">Eliminar</button>
            <button class="btn-primary" onclick="closeConfigPanel()">Cerrar</button>
        </div>
    `;
  return panel;
}

function createGenericConfigPanel(shape) {
  const panel = document.createElement('div');
  panel.className = 'config-panel';

  panel.innerHTML = `
        <div class="config-header">
            <h2>Configuración del Elemento</h2>
            <button class="close-config">✕</button>
        </div>
        
        <div class="config-content">
            <div class="config-section">
                <div class="info-box">
                    Panel de configuración para ${shape.type} (En desarrollo)
                </div>
            </div>
        </div>
        
        <div class="config-footer">
            <button class="btn-secondary">Eliminar</button>
            <button class="btn-primary" onclick="closeConfigPanel()">Cerrar</button>
        </div>
    `;

  return panel;
}

// ===============================================
// Panel de Herramientas y Iframe (con corrección de listener)
// ===============================================

function createToolInfoPanel(action, displayName) {
  const panel = document.createElement('div');
  panel.className = 'config-panel';

  panel.innerHTML = `
        <div class="config-header">
            <h2>Herramienta: ${displayName || action}</h2>
            <button class="close-config">✕</button>
        </div>

        <div class="config-content">
            <div class="info-box tools-info">
                <div class="tools-left">
                    <h3>Configuración</h3>
                    <div class="form-group">
                        <label>Selector / Identificador</label>
                        <input type="text" id="config-selector" placeholder="#miElemento" value="">
                    </div>
                    <div class="form-group">
                        <label>Valor / Texto</label>
                        <input type="text" id="config-value" placeholder="Valor a usar" value="">
                    </div>
                    <div class="form-group">
                        <label>Timeout (ms)</label>
                        <input type="number" id="config-timeout" value="5000" min="0">
                    </div>
                    <div class="form-group">
                        <label><input type="checkbox" id="config-success" checked> Simular ejecución exitosa</label>
                    </div>
                    <div class="config-actions">
                        <button class="btn-primary" id="btn-simulate" data-action="${action}" data-display-name="${displayName}">Ejecutar simulación</button>
                        <button class="btn-secondary" onclick="closeConfigPanel()">Cerrar</button>
                    </div>
                </div>

                <div class="tools-right">
                    <h3>Resultado (Simulado)</h3>
                    <div class="result-box">
                        <pre id="result-area">Aquí se mostrará el resultado tras ejecutar la simulación.</pre>
                    </div>
                </div>
            </div>
        </div>

        <div class="config-footer">
            <small>Panel de configuración y resultado simulado — frontend solamente</small>
        </div>
    `;

  // El listener del botón de simulación se adjunta ahora en attachConfigPanelBehaviors
  // para evitar el uso de setTimeout(..., 0).

  return panel;
}

// ... El resto de funciones (showToolPanel, showCategoryPanel, ensureConfigPanelShell, 
// handleIframeMessage, loadConfigPage, initToolsListeners, initWorkspaceSelectionListeners) 
// se mantienen igual, pero con la corrección del 'postMessage' en 'loadConfigPage'
// donde se recomienda NO usar el wildcard '*' para entornos reales.
// Aquí se mantiene con '*', pero se señala la advertencia.

const _iframeCache = new Map();

function ensureConfigPanelShell(title) {
  const canvasArea = document.getElementById('canvas');
  if (!canvasArea) return null;

  let panel = canvasArea.querySelector('.config-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'config-panel';
    panel.innerHTML = `
            <div class="config-header">
                <h2>${title || 'Configuración'}</h2>
                <button class="close-config">✕</button>
            </div>
            <div class="config-content">
                <div class="info-box">
                    <p>Selecciona un elemento para mostrar su configuración.</p>
                </div>
            </div>
            <div class="config-footer"></div>
        `;
    canvasArea.innerHTML = '';
    canvasArea.appendChild(panel);
    attachConfigPanelBehaviors(panel); // Asegura listeners en el shell si se crea
  } else {
    const h2 = panel.querySelector('.config-header h2');
    if (h2) h2.textContent = title || 'Configuración';
  }
  const content = panel.querySelector('.config-content');
  if (content) {
    content.style.background = '#f6f7f9';
  }
  return panel;
}

function handleIframeMessage(event) {
  const msg = event?.data;
  if (!msg || !msg.type) return;

  switch (msg.type) {
    case 'save-config':
      if (msg.payload && msg.payload.nodeId) {
        if (window.shapesRegistry && typeof window.shapesRegistry.save === 'function') {
          try { window.shapesRegistry.save(msg.payload.nodeId, msg.payload.config); } catch (e) { }
        }
      }
      document.dispatchEvent(new CustomEvent('configpanel:save', { detail: msg.payload }));
      break;
    case 'close':
      closeConfigPanel();
      break;
    case 'preview':
      document.dispatchEvent(new CustomEvent('configpanel:preview', { detail: msg.payload }));
      break;
    default:
      break;
  }
}

function loadConfigPage(options = {}) {
  const { action, configPage, nodeId, initialConfig, displayName } = options;
  const panel = ensureConfigPanelShell(displayName || action || 'Configuración');
  if (!panel) return;

  const content = panel.querySelector('.config-content');
  if (!content) return;

  let page = configPage || null;

  if (!page && action) {
    page = `config/${action}.html`;
  }

  if (!page) {
    content.innerHTML = `<div class="info-box">No hay configuración disponible para ${action || 'este elemento'}.</div>`;
    return;
  }

  const key = page;
  let iframeEntry = _iframeCache.get(key);

  if (iframeEntry && iframeEntry.iframe) {
    content.innerHTML = '';
    content.appendChild(iframeEntry.iframe);
    // Advertencia: Se mantiene '*' pero se recomienda un origen específico
    iframeEntry.iframe.contentWindow?.postMessage({ type: 'init', payload: { nodeId: nodeId || null, initialConfig: initialConfig || null } }, '*');
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.src = page;
  iframe.className = 'config-iframe';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = '0';
  iframe.setAttribute('loading', 'lazy');
  iframe.dataset.configPage = page;
  iframe.dataset.nodeId = nodeId || '';

  content.innerHTML = `<div class="info-box">Cargando configuración: ${page} ...</div>`;

  iframe.addEventListener('load', () => {
    if (!content.contains(iframe)) {
      content.innerHTML = '';
      content.appendChild(iframe);
    }
    try {
      // Advertencia: Se mantiene '*' pero se recomienda un origen específico
      iframe.contentWindow.postMessage({ type: 'init', payload: { nodeId: nodeId || null, initialConfig: initialConfig || null } }, '*');
    } catch (e) {
      // ignore
    }
  });

  content.innerHTML = '';
  content.appendChild(iframe);
  _iframeCache.set(key, { iframe, page, createdAt: Date.now() });
}

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
    if (!action && label) {
      action = slugify(label);
      btn.dataset.action = action;
    }
    if (!btn.dataset.configPage && !btn.getAttribute('data-config-page') && action) {
      btn.dataset.configPage = `config/${action}.html`;
    }

    btn.__listenerAttached = true;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const actionAttr = btn.dataset.action || btn.getAttribute('data-action') || null;
      const configPage = btn.dataset.configPage || btn.getAttribute('data-config-page') || null;
      const displayName = btn.dataset.label || btn.querySelector?.('.tool-name')?.textContent?.trim() || actionAttr || 'Herramienta';

      // Usar openElementConfig para unificar el proceso de apertura
      openElementConfig(null, null, configPage, actionAttr, displayName, null);

      document.querySelectorAll('.tool-action-btn.selected').forEach(s => s.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
}

function initToolsListeners() {
  document.querySelectorAll('.tools-tab').forEach((tab) => {
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

    // Usar la función unificada para determinar el panel a cargar
    openElementConfig(nodeId, shape, configPage, action, displayName, initialConfig);
  });
}

// Conectar listener global de mensajes desde iframes
window.addEventListener('message', handleIframeMessage, false);

// Inicializar listeners cuando DOM listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { initToolsListeners(); initWorkspaceSelectionListeners(); });
} else {
  initToolsListeners(); initWorkspaceSelectionListeners();
}

// Exportar funciones globalmente
window.configPanel = {
  show: showConfigPanel,
  close: closeConfigPanel,
  getSelectedId: getSelectedShapeId,
};

// Funciones globales para el HTML (Asegurar que existan)
window.closeConfigPanel = closeConfigPanel;
// Estas funciones deben ser definidas en otro lugar si son necesarias:
// window.updateShapeConfig = (key, value) => { console.log(`UPDATE ${key}: ${value}`); };
// window.deleteCurrentShape = () => { console.log('SHAPE DELETED'); };