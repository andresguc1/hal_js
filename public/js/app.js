document.addEventListener('DOMContentLoaded', () => {
  // Inicializar pestañas
  if (window.tabs?.init) window.tabs.init();

  // Esperar a que tabs cree los workspaces
  setTimeout(() => {
    if (window.connections?.init) {
      window.connections.init();
      console.log('✅ Sistema de conexiones inicializado');
    }
    initApp();
  }, 200);
});

const AppState = {
  actionsShapes: [],
  actionsCounter: 0,
  selectedShapeId: null,

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

    if (window.shapes?.createShapeElement)
      window.shapes.createShapeElement(shape, type, this.actionsCounter);

    workspace.appendChild(shape);

    if (window.dragDrop?.makeDraggable) window.dragDrop.makeDraggable(shape);

    const config = window.shapes?.getDefaultConfig
      ? window.shapes.getDefaultConfig(type, this.actionsCounter)
      : { text: '' };

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

  updateShapePosition(id, x, y) {
    const shape = this.actionsShapes.find((s) => s.id == id);
    if (shape) {
      shape.x = x;
      shape.y = y;
    }
  },

  selectShape(shapeId) {
    this.selectedShapeId = shapeId;
    const shape = this.actionsShapes.find((s) => s.id == shapeId);
    if (shape && window.configPanel?.show) window.configPanel.show(shapeId, shape);
  },

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

  deleteCurrentShape() {
    if (this.selectedShapeId == null) return;
    if (confirm('¿Eliminar este elemento?')) {
      this.actionsShapes = this.actionsShapes.filter((s) => s.id != this.selectedShapeId);
      document.querySelector(`.action-shape[data-id="${this.selectedShapeId}"]`)?.remove();
      window.configPanel?.close?.();
      this.saveState();
      if (typeof window.showNotification === 'function')
        window.showNotification('Elemento eliminado');
    }
  },

  clearActionsFrame() {
    if (confirm('¿Seguro que deseas limpiar el área de acciones?')) {
      document.querySelectorAll('.action-shape').forEach((shape) => shape.remove());
      this.actionsShapes = [];
      this.actionsCounter = 0;
      window.configPanel?.close?.();
      this.saveState();
      if (typeof window.showNotification === 'function')
        window.showNotification('Área de acciones limpiada');
    }
  },

  saveState() {
    if (window.storage?.save) window.storage.save(this.actionsShapes, this.actionsCounter);
    else {
      try {
        localStorage.setItem(
          'appState',
          JSON.stringify({
            shapes: this.actionsShapes,
            counter: this.actionsCounter,
          })
        );
      } catch (e) {
        console.warn('No se pudo guardar el estado:', e);
      }
    }
  },

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
    this.actionsCounter =
      typeof data.counter === 'number'
        ? data.counter
        : this.actionsShapes.length
          ? Math.max(...this.actionsShapes.map((s) => s.id)) + 1
          : 0;

    this.actionsShapes.forEach((shapeData) => {
      if (shapeData.tabId) this.recreateShapeInWorkspace(shapeData, shapeData.tabId);
      else this.recreateShape(shapeData);
    });

    window.configPanel?.close?.();
  },

  recreateShape(shapeData) {
    const actionsFrame = document.querySelector('.actions-frame');
    if (!actionsFrame) return;

    const shape = document.createElement('div');
    shape.className = 'placed-shape action-shape';
    shape.dataset.id = shapeData.id;
    shape.dataset.type = shapeData.type;
    shape.style.left = shapeData.x + 'px';
    shape.style.top = shapeData.y + 'px';

    const text =
      shapeData.text || window.shapes?.getDefaultText?.(shapeData.type, shapeData.id) || '';
    const color = shapeData.config?.color || '#ffffff';

    window.shapes?.createShapeElement?.(shape, shapeData.type, shapeData.id);

    const shapeElement = shape.firstChild;
    if (shapeElement) {
      if (shapeElement.tagName === 'DIV' && !shapeElement.querySelector('span'))
        shapeElement.textContent = text;
      else if (shapeElement.querySelector('span'))
        shapeElement.querySelector('span').textContent = text;
      try {
        shapeElement.style.backgroundColor = color;
      } catch (e) {
        console.debug('No se pudo aplicar color al elemento:', e);
      }
    }

    actionsFrame.appendChild(shape);
    window.dragDrop?.makeDraggable?.(shape);
  },

  recreateShapeInWorkspace(shapeData, tabId) {
    const workspace = document.getElementById(`workspace-${tabId}`);
    if (!workspace) return;

    const shape = document.createElement('div');
    shape.className = 'placed-shape action-shape';
    shape.dataset.id = shapeData.id;
    shape.dataset.type = shapeData.type;
    shape.style.left = shapeData.x + 'px';
    shape.style.top = shapeData.y + 'px';

    const text =
      shapeData.text || window.shapes?.getDefaultText?.(shapeData.type, shapeData.id) || '';
    const color = shapeData.config?.color || '#ffffff';

    window.shapes?.createShapeElement?.(shape, shapeData.type, shapeData.id);

    const shapeElement = shape.firstChild;
    if (shapeElement) {
      if (shapeElement.tagName === 'DIV' && !shapeElement.querySelector('span'))
        shapeElement.textContent = text;
      else if (shapeElement.querySelector('span'))
        shapeElement.querySelector('span').textContent = text;
      try {
        shapeElement.style.backgroundColor = color;
      } catch (e) {
        console.debug('No se pudo aplicar color al elemento en workspace:', e);
      }
    }

    workspace.appendChild(shape);
    window.dragDrop?.makeDraggable?.(shape);
  },

  saveCanvas() {
    if (window.storage?.exportToJSON) window.storage.exportToJSON(this.actionsShapes);
    else {
      const dataStr = JSON.stringify(this.actionsShapes, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagrama.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
    if (typeof window.showNotification === 'function')
      window.showNotification('Diagrama guardado exitosamente');
  },

  loadCanvas() {
    if (window.storage?.importFromJSON) {
      window.storage.importFromJSON((loadedShapes, error) => {
        if (error) {
          if (typeof window.showNotification === 'function')
            window.showNotification('Error al cargar el archivo', true);
          return;
        }
        document.querySelectorAll('.action-shape').forEach((shape) => shape.remove());
        this.actionsShapes = loadedShapes;
        this.actionsCounter = this.actionsShapes.length
          ? Math.max(...this.actionsShapes.map((s) => s.id)) + 1
          : 0;
        this.actionsShapes.forEach((shapeData) => {
          if (shapeData.tabId) this.recreateShapeInWorkspace(shapeData, shapeData.tabId);
          else this.recreateShape(shapeData);
        });
        window.configPanel?.close?.();
        this.saveState();
        if (typeof window.showNotification === 'function')
          window.showNotification('Diagrama cargado exitosamente');
      });
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const loadedShapes = JSON.parse(ev.target.result);
            document.querySelectorAll('.action-shape').forEach((shape) => shape.remove());
            this.actionsShapes = loadedShapes;
            this.actionsCounter = this.actionsShapes.length
              ? Math.max(...this.actionsShapes.map((s) => s.id)) + 1
              : 0;
            this.actionsShapes.forEach((shapeData) => {
              if (shapeData.tabId) this.recreateShapeInWorkspace(shapeData, shapeData.tabId);
              else this.recreateShape(shapeData);
            });
            window.configPanel?.close?.();
            this.saveState();
            if (typeof window.showNotification === 'function')
              window.showNotification('Diagrama cargado exitosamente');
          } catch (err) {
            if (typeof window.showNotification === 'function')
              window.showNotification('Error al leer el archivo JSON', true);
          }
        };
        reader.readAsText(file);
      });
      input.click();
    }
  },

  exportCanvas() {
    if (typeof window.showNotification === 'function') {
      window.showNotification(
        'Función de exportar a imagen en desarrollo.\nPor ahora usa "Guardar" para exportar en formato JSON.'
      );
    }
  },

  executeWorkflow() {
    const activeTab = window.tabs?.getActive?.();
    if (!activeTab) {
      if (typeof window.showNotification === 'function')
        window.showNotification('No hay pestaña activa', true);
      return;
    }
    window.tabs?.saveState?.();
    if (!Array.isArray(activeTab.shapes) || activeTab.shapes.length === 0) {
      if (typeof window.showNotification === 'function')
        window.showNotification('No hay elementos para ejecutar', true);
      return;
    }
    console.log('Ejecutando workflow:', activeTab);
    if (typeof window.showNotification === 'function')
      window.showNotification('Ejecutando workflow... (en desarrollo)');
    // TODO: Implementar lógica de ejecución
  },

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
      requestAnimationFrame(() => {
        window.connections.addPoints(actionElement);
        console.log('✅ Puntos de conexión agregados al bloque');
      });
    }

    const config = window.toolActions?.getDefaultConfig
      ? window.toolActions.getDefaultConfig(actionDef)
      : {};

    this.actionsShapes.push({
      id: this.actionsCounter,
      type: 'action',
      actionType,
      x,
      y,
      config,
    });

    this.actionsCounter++;
    this.saveState();

    if (typeof window.showNotification === 'function')
      window.showNotification(`Acción "${actionDef.name ?? actionType}" agregada`);

    return actionElement;
  },
};

function initApp() {
  console.log('Inicializando aplicación...');

  window.dragDrop?.initGlobalListeners?.();
  window.dragDrop?.makeDroppable?.();
  window.toolActions?.setupListeners?.();

  document
    .getElementById('btnClear')
    ?.addEventListener('click', () => AppState.clearActionsFrame());
  document.getElementById('btnSave')?.addEventListener('click', () => AppState.saveCanvas());
  document.getElementById('btnExport')?.addEventListener('click', () => AppState.exportCanvas());
  document.getElementById('btnLoad')?.addEventListener('click', () => AppState.loadCanvas());
  document
    .getElementById('btnExecute')
    ?.addEventListener('click', () => AppState.executeWorkflow());

  window.tabs?.setupKeyboardNav?.();

  AppState.loadState();

  console.log('Aplicación iniciada correctamente');

  setupDeleteBlockListener();
}

function setupDeleteBlockListener() {
  let selectedBlock = null;

  document.addEventListener('click', (e) => {
    const block = e.target.closest('.action-block');
    document.querySelectorAll('.action-block').forEach((b) => b.classList.remove('selected'));
    if (block) {
      block.classList.add('selected');
      selectedBlock = block;
    } else {
      selectedBlock = null;
    }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlock) {
      const blockId = selectedBlock.dataset.id;
      window.connections?.removeForBlock?.(blockId);
      AppState.actionsShapes = AppState.actionsShapes.filter((s) => s.id != blockId);
      selectedBlock.remove();
      selectedBlock = null;
      AppState.saveState();
      if (typeof window.showNotification === 'function')
        window.showNotification('Bloque eliminado');
    }
  });
}

// Exponer funciones globales para HTML
window.app = AppState;
window.updateShapeConfig = (property, value) => AppState.updateShapeConfig(property, value);
window.deleteCurrentShape = () => AppState.deleteCurrentShape();
