// Aplicación principal

// (Suponer que las importaciones van arriba)

// Inicializar pestañas primero y luego la app cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar pestañas primero
  if (window.tabs && typeof window.tabs.init === "function") {
    window.tabs.init();
  }

  // Luego inicializar la app
  initApp();
});

// Estado global de la aplicación
const AppState = {
  actionsShapes: [],
  actionsCounter: 0,
  selectedShapeId: null,

  // Agregar forma al actions-frame (ahora usa workspace activo)
  addShapeToActionsFrame(
    type,
    centered = false,
    customX = null,
    customY = null
  ) {
    const workspace = window.tabs?.getActiveWorkspace?.();
    if (!workspace) return;

    const shape = document.createElement("div");
    shape.className = "placed-shape action-shape";
    shape.dataset.id = this.actionsCounter;
    shape.dataset.type = type;

    // Posición inicial
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

    shape.style.left = x + "px";
    shape.style.top = y + "px";

    // Crear la forma visual
    window.shapes.createShapeElement(shape, type, this.actionsCounter);

    // Usar el workspace activo en lugar del actionsFrame global
    workspace.appendChild(shape);
    window.dragDrop.makeDraggable(shape);

    // Obtener configuración por defecto
    const config = window.shapes.getDefaultConfig(type, this.actionsCounter);

    // Guardar en el array (añadimos tabId para saber a qué workspace pertenece)
    const activeTab = window.tabs?.getActive?.();
    this.actionsShapes.push({
      id: this.actionsCounter,
      type: type,
      x: x,
      y: y,
      text: config.text,
      config: config,
      tabId: activeTab?.id ?? null,
    });

    this.actionsCounter++;
    this.saveState();
  },

  // Actualizar posición de forma
  updateShapePosition(id, x, y) {
    const shape = this.actionsShapes.find((s) => s.id == id);
    if (shape) {
      shape.x = x;
      shape.y = y;
    }
  },

  // Seleccionar forma para configurar
  selectShape(shapeId) {
    this.selectedShapeId = shapeId;
    const shape = this.actionsShapes.find((s) => s.id == shapeId);
    if (shape) {
      window.configPanel.show(shapeId, shape);
    }
  },

  // Actualizar configuración de forma
  updateShapeConfig(property, value) {
    if (!this.selectedShapeId) return;

    const shape = this.actionsShapes.find((s) => s.id == this.selectedShapeId);
    if (!shape) return;

    // Actualizar configuración
    shape.config[property] = value;

    // Si es texto, también actualizar el texto principal
    if (property === "text") {
      shape.text = value;
      window.shapes.updateShapeText(this.selectedShapeId, value);
    }

    // Si es color, actualizar elemento visual
    if (property === "color") {
      window.shapes.updateShapeColor(this.selectedShapeId, value);

      // Actualizar vista previa
      const preview = document.querySelector(".preview-shape");
      if (preview) {
        preview.style.backgroundColor = value;
      }
    }

    // Si es subtipo (para oval), actualizar texto automáticamente
    if (property === "subtype") {
      const newText = value === "inicio" ? "Inicio" : "Fin";
      shape.config.text = newText;
      shape.text = newText;

      const textInput = document.getElementById("config-text");
      if (textInput) {
        textInput.value = newText;
      }

      window.shapes.updateShapeText(this.selectedShapeId, newText);

      const preview = document.querySelector(".preview-shape");
      if (preview) {
        preview.textContent = newText;
      }
    }

    this.saveState();
  },

  // Eliminar forma actual
  deleteCurrentShape() {
    if (!this.selectedShapeId) return;

    if (confirm("¿Eliminar este elemento?")) {
      // Eliminar del array
      this.actionsShapes = this.actionsShapes.filter(
        (s) => s.id != this.selectedShapeId
      );

      // Eliminar del DOM
      const domElement = document.querySelector(
        `.action-shape[data-id="${this.selectedShapeId}"]`
      );
      if (domElement) {
        domElement.remove();
      }

      // Cerrar panel
      window.configPanel.close();

      this.saveState();
      showNotification("Elemento eliminado");
    }
  },

  // Limpiar actions-frame (limpia todas las shapes visibles)
  clearActionsFrame() {
    if (confirm("¿Seguro que deseas limpiar el área de acciones?")) {
      const shapes = document.querySelectorAll(".action-shape");
      shapes.forEach((shape) => shape.remove());
      this.actionsShapes = [];
      this.actionsCounter = 0;
      window.configPanel.close();
      this.saveState();
      showNotification("Área de acciones limpiada");
    }
  },

  // Guardar estado
  saveState() {
    window.storage.save(this.actionsShapes, this.actionsCounter);
  },

  // Cargar estado
  loadState() {
    const data = window.storage.load();

    if (!data) {
      this.actionsShapes = [];
      this.actionsCounter = 0;
      window.configPanel.close();
      return;
    }

    this.actionsShapes = data.shapes || [];
    // Si el contador viene en storage lo usamos, si no lo calculamos de los ids
    if (typeof data.counter === "number") {
      this.actionsCounter = data.counter;
    } else {
      this.actionsCounter = this.actionsShapes.length
        ? Math.max(...this.actionsShapes.map((s) => s.id)) + 1
        : 0;
    }

    // Recrear formas, si tienen tabId las recreamos en su workspace
    this.actionsShapes.forEach((shapeData) => {
      if (shapeData.tabId) {
        this.recreateShapeInWorkspace(shapeData, shapeData.tabId);
      } else {
        this.recreateShape(shapeData);
      }
    });

    // Mostrar mensaje inicial
    window.configPanel.close();
  },

  // Recrear forma desde datos guardados (compatibilidad antigua)
  recreateShape(shapeData) {
    const actionsFrame = document.querySelector(".actions-frame");
    if (!actionsFrame) return;

    const shape = document.createElement("div");
    shape.className = "placed-shape action-shape";
    shape.dataset.id = shapeData.id;
    shape.dataset.type = shapeData.type;
    shape.style.left = shapeData.x + "px";
    shape.style.top = shapeData.y + "px";

    const text =
      shapeData.text ||
      window.shapes.getDefaultText(shapeData.type, shapeData.id);
    const color = shapeData.config?.color || "#ffffff";

    // Crear elemento visual
    window.shapes.createShapeElement(shape, shapeData.type, shapeData.id);

    // Aplicar estilos personalizados
    const shapeElement = shape.firstChild;
    if (shapeElement) {
      if (
        shapeElement.tagName === "DIV" &&
        !shapeElement.querySelector("span")
      ) {
        shapeElement.textContent = text;
      } else if (shapeElement.querySelector("span")) {
        shapeElement.querySelector("span").textContent = text;
      }

      shapeElement.style.backgroundColor = color;
    }

    actionsFrame.appendChild(shape);
    window.dragDrop.makeDraggable(shape);
  },

  // Recrear forma en workspace específico
  recreateShapeInWorkspace(shapeData, tabId) {
    const workspace = document.getElementById(`workspace-${tabId}`);
    if (!workspace) return;

    const shape = document.createElement("div");
    shape.className = "placed-shape action-shape";
    shape.dataset.id = shapeData.id;
    shape.dataset.type = shapeData.type;
    shape.style.left = shapeData.x + "px";
    shape.style.top = shapeData.y + "px";

    const text =
      shapeData.text ||
      window.shapes.getDefaultText(shapeData.type, shapeData.id);
    const color = shapeData.config?.color || "#ffffff";

    window.shapes.createShapeElement(shape, shapeData.type, shapeData.id);

    const shapeElement = shape.firstChild;
    if (shapeElement) {
      if (
        shapeElement.tagName === "DIV" &&
        !shapeElement.querySelector("span")
      ) {
        shapeElement.textContent = text;
      } else if (shapeElement.querySelector("span")) {
        shapeElement.querySelector("span").textContent = text;
      }

      shapeElement.style.backgroundColor = color;
    }

    workspace.appendChild(shape);
    window.dragDrop.makeDraggable(shape);
  },

  // Guardar diagrama (exportar JSON)
  saveCanvas() {
    window.storage.exportToJSON(this.actionsShapes);
    showNotification("Diagrama guardado exitosamente");
  },

  // Cargar diagrama (importar JSON)
  loadCanvas() {
    window.storage.importFromJSON((loadedShapes, error) => {
      if (error) {
        showNotification("Error al cargar el archivo", true);
        return;
      }

      // Limpiar actual
      const shapes = document.querySelectorAll(".action-shape");
      shapes.forEach((shape) => shape.remove());

      // Cargar nuevos datos
      this.actionsShapes = loadedShapes;
      this.actionsCounter = this.actionsShapes.length
        ? Math.max(...this.actionsShapes.map((s) => s.id)) + 1
        : 0;

      // Recrear formas
      this.actionsShapes.forEach((shapeData) => {
        if (shapeData.tabId) {
          this.recreateShapeInWorkspace(shapeData, shapeData.tabId);
        } else {
          this.recreateShape(shapeData);
        }
      });

      window.configPanel.close();
      this.saveState();
      showNotification("Diagrama cargado exitosamente");
    });
  },

  // Exportar como imagen
  exportCanvas() {
    showNotification(
      'Función de exportar a imagen en desarrollo.\nPor ahora usa "Guardar" para exportar en formato JSON.'
    );
  },

  // Ejecutar workflow (placeholder)
  executeWorkflow() {
    const activeTab = window.tabs?.getActive?.();
    if (!activeTab) return;

    // Guardar estado de pestañas (si existe la función)
    if (window.tabs && typeof window.tabs.saveState === "function") {
      window.tabs.saveState();
    }

    if (!Array.isArray(activeTab.shapes) || activeTab.shapes.length === 0) {
      showNotification("No hay elementos para ejecutar", true);
      return;
    }

    // Aquí irá la lógica de ejecución
    console.log("Ejecutando workflow:", activeTab);
    showNotification("Ejecutando workflow... (en desarrollo)");

    // TODO: Implementar lógica de ejecución
  },
};

// Inicializar aplicación
function initApp() {
  console.log("Inicializando aplicación...");

  // Inicializar drag and drop
  if (window.dragDrop) {
    if (typeof window.dragDrop.initGlobalListeners === "function")
      window.dragDrop.initGlobalListeners();
    if (typeof window.dragDrop.initTools === "function")
      window.dragDrop.initTools();
    if (typeof window.dragDrop.makeDroppable === "function")
      window.dragDrop.makeDroppable();
  }

  // Inicializar herramientas
  if (window.tools && typeof window.tools.setup === "function") {
    window.tools.setup();
  }

  // Configurar botones de acción (comprobando existencia)
  const btnClear = document.getElementById("btnClear");
  if (btnClear)
    btnClear.addEventListener("click", () => AppState.clearActionsFrame());

  const btnSave = document.getElementById("btnSave");
  if (btnSave) btnSave.addEventListener("click", () => AppState.saveCanvas());

  const btnExport = document.getElementById("btnExport");
  if (btnExport)
    btnExport.addEventListener("click", () => AppState.exportCanvas());

  const btnLoad = document.getElementById("btnLoad");
  if (btnLoad) btnLoad.addEventListener("click", () => AppState.loadCanvas());

  // Agregar listener para botón ejecutar
  const btnExecute = document.getElementById("btnExecute");
  if (btnExecute)
    btnExecute.addEventListener("click", () => AppState.executeWorkflow());

  // Cargar estado guardado
  AppState.loadState();

  // Configurar navegación por teclado
  window.tabs.setupKeyboardNav();

  console.log("Aplicación iniciada correctamente");
}

// Exponer funciones globales para HTML
window.app = AppState;
window.updateShapeConfig = (property, value) =>
  AppState.updateShapeConfig(property, value);
window.deleteCurrentShape = () => AppState.deleteCurrentShape();

// Nota: la inicialización del DOM se realiza en el listener DOMContentLoaded al inicio del archivo
