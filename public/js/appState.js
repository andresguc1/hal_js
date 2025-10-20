// appState.js
export const AppState = {
  actionsShapes: [],
  actionsCounter: 0,
  selectedShapeId: null,

  // Agregar un nuevo shape al workspace activo
  addShapeToActionsFrame(type, centered = false, customX = null, customY = null) {
    const workspace = window.tabs?.getActiveWorkspace?.();
    if (!workspace) return;

    const shape = document.createElement('div');
    shape.className = 'placed-shape action-shape';
    shape.dataset.id = this.actionsCounter;
    shape.dataset.type = type;

    let x, y;
    if (customX !== null && customY !== null) {
      x = Math.max(10, Math.min(customX, workspace.offsetWidth - 100));
      y = Math.max(60, Math.min(customY, workspace.offsetHeight - 80));
    } else if (centered) {
      x = workspace.offsetWidth / 2 - 60;
      y = 120;
    } else {
      x = 50 + Math.random() * 200;
      y = 100 + Math.random() * 80;
    }

    shape.style.left = x + 'px';
    shape.style.top = y + 'px';

    if (window.shapes?.createShapeElement) window.shapes.createShapeElement(shape, type, this.actionsCounter);

    workspace.appendChild(shape);
    if (window.dragDrop?.makeDraggable) window.dragDrop.makeDraggable(shape);

    const config = window.shapes?.getDefaultConfig ? window.shapes.getDefaultConfig(type, this.actionsCounter) : { text: '' };
    const activeTab = window.tabs?.getActive?.();
    this.actionsShapes.push({
      id: this.actionsCounter,
      type,
      x,
      y,
      text: config.text,
      config,
      tabId: activeTab?.id ?? null,
    });

    this.actionsCounter++;
    this.saveState();
  },

  // Actualizar posición de un shape
  updateShapePosition(id, x, y) {
    const shape = this.actionsShapes.find((s) => s.id == id);
    if (shape) {
      shape.x = x;
      shape.y = y;
      this.saveState();
    }
  },

  // Seleccionar un shape
  selectShape(shapeId) {
    this.selectedShapeId = shapeId;
    const shape = this.actionsShapes.find((s) => s.id == shapeId);
    if (shape && window.configPanel?.show) window.configPanel.show(shapeId, shape);
  },

  // Actualizar configuración de un shape
  updateShapeConfig(property, value) {
    if (this.selectedShapeId == null) return;
    const shape = this.actionsShapes.find((s) => s.id == this.selectedShapeId);
    if (!shape) return;

    shape.config ??= {};
    shape.config[property] = value;

    if (property === 'text') {
      shape.text = value;
      window.shapes?.updateShapeText?.(this.selectedShapeId, value);
    }

    if (property === 'color') {
      window.shapes?.updateShapeColor?.(this.selectedShapeId, value);
      const preview = document.querySelector('.preview-shape');
      if (preview) preview.style.backgroundColor = value;
    }

    if (property === 'subtype') {
      const newText = value === 'inicio' ? 'Inicio' : 'Fin';
      shape.config.text = newText;
      shape.text = newText;
      const textInput = document.getElementById('config-text');
      if (textInput) textInput.value = newText;
      window.shapes?.updateShapeText?.(this.selectedShapeId, newText);
      const preview = document.querySelector('.preview-shape');
      if (preview) preview.textContent = newText;
    }

    this.saveState();
  },

  // Eliminar shape seleccionado
  deleteCurrentShape() {
    if (this.selectedShapeId == null) return;
    if (confirm('¿Eliminar este elemento?')) {
      this.actionsShapes = this.actionsShapes.filter((s) => s.id != this.selectedShapeId);
      document.querySelector(`.action-shape[data-id="${this.selectedShapeId}"]`)?.remove();
      window.configPanel?.close?.();
      this.selectedShapeId = null;
      this.saveState();
      if (typeof window.showNotification === 'function') window.showNotification('Elemento eliminado');
    }
  },

  // Limpiar todas las shapes
  clearActionsFrame() {
    if (confirm('¿Seguro que deseas limpiar el área de acciones?')) {
      document.querySelectorAll('.action-shape').forEach((shape) => shape.remove());
      this.actionsShapes = [];
      this.actionsCounter = 0;
      window.configPanel?.close?.();
      this.saveState();
      if (typeof window.showNotification === 'function') window.showNotification('Área de acciones limpiada');
    }
  },

  // Guardar estado global (localStorage o window.storage)
  saveState() {
    if (window.tabs?.saveState) window.tabs.saveState();
    if (window.storage?.save) window.storage.save(this.actionsShapes, this.actionsCounter);
    else {
      try {
        localStorage.setItem('appState', JSON.stringify({ shapes: this.actionsShapes, counter: this.actionsCounter }));
      } catch (e) {
        console.warn('No se pudo guardar el estado:', e);
      }
    }
  },

  // Cargar estado desde almacenamiento
  loadState() {
    let data = null;
    if (window.storage?.load) data = window.storage.load();
    else {
      try {
        const raw = localStorage.getItem('appState');
        if (raw) data = JSON.parse(raw);
      } catch (e) {
        console.warn('No se pudo cargar estado desde localStorage:', e);
      }
    }

    if (!data) {
      this.actionsShapes = [];
      this.actionsCounter = 0;
      window.configPanel?.close?.();
      return;
    }

    this.actionsShapes = data.shapes || [];
    this.actionsCounter = typeof data.counter === 'number' ? data.counter : this.actionsShapes.length ? Math.max(...this.actionsShapes.map((s) => s.id)) + 1 : 0;

    this.actionsShapes.forEach((shapeData) => {
      if (shapeData.tabId) this.recreateShapeInWorkspace(shapeData, shapeData.tabId);
      else this.recreateShape(shapeData);
    });

    window.configPanel?.close?.();
  },

  // Recrear shape en actions-frame principal
  recreateShape(shapeData) {
    const actionsFrame = document.querySelector('.actions-frame');
    if (!actionsFrame) return;

    const shape = document.createElement('div');
    shape.className = 'placed-shape action-shape';
    shape.dataset.id = shapeData.id;
    shape.dataset.type = shapeData.type;
    shape.style.left = shapeData.x + 'px';
    shape.style.top = shapeData.y + 'px';

    const text = shapeData.text || window.shapes?.getDefaultText?.(shapeData.type, shapeData.id) || '';
    const color = shapeData.config?.color || '#ffffff';

    window.shapes?.createShapeElement?.(shape, shapeData.type, shapeData.id);

    const shapeElement = shape.firstChild;
    if (shapeElement) {
      if (shapeElement.tagName === 'DIV' && !shapeElement.querySelector('span')) shapeElement.textContent = text;
      else if (shapeElement.querySelector('span')) shapeElement.querySelector('span').textContent = text;
      try { shapeElement.style.backgroundColor = color; } catch (e) { }
    }

    actionsFrame.appendChild(shape);
    window.dragDrop?.makeDraggable?.(shape);
  },

  // Recrear shape dentro del workspace de una pestaña
  recreateShapeInWorkspace(shapeData, tabId) {
    const workspace = document.getElementById(`workspace-${tabId}`);
    if (!workspace) return;

    const shape = document.createElement('div');
    shape.className = 'placed-shape action-shape';
    shape.dataset.id = shapeData.id;
    shape.dataset.type = shapeData.type;
    shape.style.left = shapeData.x + 'px';
    shape.style.top = shapeData.y + 'px';

    const text = shapeData.text || window.shapes?.getDefaultText?.(shapeData.type, shapeData.id) || '';
    const color = shapeData.config?.color || '#ffffff';

    window.shapes?.createShapeElement?.(shape, shapeData.type, shapeData.id);

    const shapeElement = shape.firstChild;
    if (shapeElement) {
      if (shapeElement.tagName === 'DIV' && !shapeElement.querySelector('span')) shapeElement.textContent = text;
      else if (shapeElement.querySelector('span')) shapeElement.querySelector('span').textContent = text;
      try { shapeElement.style.backgroundColor = color; } catch (e) { }
    }

    workspace.appendChild(shape);
    window.dragDrop?.makeDraggable?.(shape);
  },

  // Agregar bloque de acción al workspace activo (usado por tool-actions)
  addActionToWorkspace(actionType, actionDef) {
    const workspace = window.tabs?.getActiveWorkspace?.();
    if (!workspace) return;

    const actionElement = document.createElement('div');
    actionElement.className = 'placed-shape action-shape action-block';
    actionElement.dataset.id = this.actionsCounter;
    actionElement.dataset.type = 'action';
    actionElement.dataset.actionType = actionType;

    const x = 50 + Math.random() * 200;
    const y = 100 + Math.random() * 80;
    actionElement.style.left = x + 'px';
    actionElement.style.top = y + 'px';

    actionElement.innerHTML = `
      <div class="action-block-content">
        <div class="action-block-header">
          <span class="action-block-icon">${actionDef.icon ?? ''}</span>
          <span class="action-block-name">${actionDef.name ?? 'Acción'}</span>
        </div>
      </div>
    `;

    workspace.appendChild(actionElement);
    window.dragDrop?.makeDraggable?.(actionElement);

    if (window.connections?.addPoints) {
      requestAnimationFrame(() => window.connections.addPoints(actionElement));
    }

    const config = window.toolActions?.getDefaultConfig ? window.toolActions.getDefaultConfig(actionDef) : {};
    this.actionsShapes.push({ id: this.actionsCounter, type: 'action', actionType, x, y, config });
    this.actionsCounter++;
    this.saveState();

    if (typeof window.showNotification === 'function') window.showNotification(`Acción "${actionDef.name ?? actionType}" agregada`);

    return actionElement;
  },

  // Ejecutar workflow de la pestaña activa (placeholder)
  executeWorkflow() {
    const activeTab = window.tabs?.getActive?.();
    if (!activeTab) {
      if (typeof window.showNotification === 'function') window.showNotification('No hay pestaña activa', true);
      return;
    }
    window.tabs?.saveState?.();
    if (!Array.isArray(activeTab.shapes) || activeTab.shapes.length === 0) {
      if (typeof window.showNotification === 'function') window.showNotification('No hay elementos para ejecutar', true);
      return;
    }
    console.log('Ejecutando workflow:', activeTab);
    if (typeof window.showNotification === 'function') window.showNotification('Ejecutando workflow... (en desarrollo)');
  },
};
