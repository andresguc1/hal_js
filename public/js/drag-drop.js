// Gestión de drag and drop

let isDragging = false;
let currentElement = null;
let offsetX = 0;
let offsetY = 0;

// Inicializar drag and drop para herramientas
function initToolsDragDrop() {
  // cambiar selector a botones de acción
  document.querySelectorAll('.tool-action-btn').forEach((tool) => {
    tool.setAttribute('draggable', 'true');

    tool.addEventListener('dragstart', function (e) {
      const actionType = this.dataset.action;
      // marcar que este botón fue arrastrado para evitar click posterior
      this.dataset._wasDragged = 'true';
      // también exponer timestamp por si es necesario
      this.dataset._dragTime = Date.now();
      e.dataTransfer.setData('actionType', actionType);
      e.dataTransfer.effectAllowed = 'copy';
      this.style.opacity = '0.5';
    });

    // eliminado parámetro no usado
    tool.addEventListener('dragend', function () {
      this.style.opacity = '1';
      // limpiar la marca ligeramente después para que el click pueda comprobarla
      setTimeout(() => {
        delete this.dataset._wasDragged;
        delete this.dataset._dragTime;
      }, 50);
    });
  });
}

// Hacer el actions-frame receptivo para drop
function makeActionsFrameDroppable() {
  // soportar múltiples workspaces
  const attachTo = (container) => {
    if (!container) return;
    container.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    container.addEventListener('drop', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const action = e.dataTransfer.getData('actionType') || e.dataTransfer.getData('shapeType');
      console.log('[dragDrop] drop action:', action);
      if (!action) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - 50;
      const y = e.clientY - rect.top - 25;

      // Preferir toolActions.addToWorkspace que acepta coordenadas
      if (window.toolActions?.addToWorkspace) {
        window.toolActions.addToWorkspace(action, x, y);
      } else if (window.app?.addActionToWorkspace) {
        // compatibilidad: pasar actionDef vacío si no está disponible
        window.app.addActionToWorkspace(action, window.TestActions?.[action] ?? {}, x, y);
      }

      // Marcar que se creó una acción por drop para que el click posterior lo ignore
      window._lastActionCreatedByDrop = Date.now();
    });
  };

  // Adjuntar a todos los workspaces actuales
  document.querySelectorAll('.workspace-content, .actions-frame').forEach((el) => attachTo(el));

  // Observador para workspaces creados dinámicamente
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes?.forEach((n) => {
        if (!(n instanceof HTMLElement)) return;
        if (n.classList?.contains('workspace-content') || n.classList?.contains('actions-frame')) {
          attachTo(n);
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// Hacer elemento arrastrable con mouse
function makeDraggable(element) {
  element.addEventListener('mousedown', startDrag);
  element.addEventListener('click', selectShape);
  element.addEventListener('dblclick', preventDblClick);
}

// Iniciar arrastre
function startDrag(e) {
  const target = e.target;

  if (target.closest('.action-btn')) {
    return;
  }

  // ⬇️ NO INICIAR DRAG SI SE HACE CLICK EN PUNTO DE CONEXIÓN
  if (target.classList.contains('connection-point')) {
    return;
  }
  if (target.closest('.connection-point')) {
    return;
  }

  e.preventDefault();
  e.stopPropagation();

  isDragging = true;
  currentElement = this;
  currentElement.classList.add('dragging');

  const rect = currentElement.getBoundingClientRect();
  // se eliminó la variable actionsFrame no utilizada
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
}

// Manejar movimiento del mouse
function handleMouseMove(e) {
  if (isDragging && currentElement) {
    e.preventDefault();

    // calcular el bounding rect del workspace del elemento arrastrado
    const workspaceEl = currentElement.closest('.workspace-content') || document.querySelector('.actions-frame');
    if (!workspaceEl) return;
    const actionsFrame = workspaceEl.getBoundingClientRect();

    let x = e.clientX - actionsFrame.left - offsetX;
    let y = e.clientY - actionsFrame.top - offsetY;

    const minY = 60;
    const maxY = actionsFrame.height - currentElement.offsetHeight - 10;
    const maxX = actionsFrame.width - currentElement.offsetWidth - 10;

    x = Math.max(10, Math.min(x, maxX));
    y = Math.max(minY, Math.min(y, maxY));

    currentElement.style.left = x + 'px';
    currentElement.style.top = y + 'px';

    if (window.app) {
      window.app.updateShapePosition(currentElement.dataset.id, x, y);
    }

    // ⬇️ ACTUALIZAR CONEXIONES DURANTE EL DRAG
    if (window.connections?.updateAll) {
      window.connections.updateAll();
    }
  }
}

// Manejar soltar mouse (única definición)
function handleMouseUp() {
  if (currentElement) {
    currentElement.classList.remove('dragging');

    if (window.app) {
      window.app.saveState();
    }

    // ⬇️ ACTUALIZAR CONEXIONES AL SOLTAR
    if (window.connections?.updateAll) {
      requestAnimationFrame(() => {
        window.connections.updateAll();
      });
    }
  }

  isDragging = false;
  currentElement = null;
}

// Seleccionar elemento
function selectShape(e) {
  if (isDragging) return;

  if (e.target.closest('.action-btn')) return;

  e.stopPropagation();

  document.querySelectorAll('.action-shape').forEach((s) => {
    s.classList.remove('selected');
  });

  this.classList.add('selected');

  if (window.app) {
    window.app.selectShape(this.dataset.id);
  }
}

// Prevenir doble click
function preventDblClick(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Inicializar listeners globales
function initGlobalListeners() {
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
}

// Exportar funciones
window.dragDrop = {
  initTools: initToolsDragDrop,
  makeDroppable: makeActionsFrameDroppable,
  makeDraggable,
  initGlobalListeners,
};
