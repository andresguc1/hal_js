// Aplicación principal

// Estado global de la aplicación
const AppState = {
  actionsShapes: [],
  actionsCounter: 0,
  selectedShapeId: null,

  // Agregar forma al actions-frame
  addShapeToActionsFrame(
    type,
    centered = false,
    customX = null,
    customY = null
  ) {
    const actionsFrame = document.querySelector(".actions-frame");
    const shape = document.createElement("div");
    shape.className = "placed-shape action-shape";
    shape.dataset.id = this.actionsCounter;
    shape.dataset.type = type;

    // Posición inicial
    let x, y;

    if (customX !== null && customY !== null) {
      x = Math.max(10, Math.min(customX, actionsFrame.offsetWidth - 100));
      y = Math.max(60, Math.min(customY, actionsFrame.offsetHeight - 80));
    } else if (centered) {
      x = actionsFrame.offsetWidth / 2 - 60;
      y = 120;
    } else {
      x = 50 + Math.random() * 200;
      y = 100 + Math.random() * 80;
    }

    shape.style.left = x + "px";
    shape.style.top = y + "px";

    // Crear la forma visual
    window.shapes.createShapeElement(shape, type, this.actionsCounter);

    actionsFrame.appendChild(shape);
    window.dragDrop.makeDraggable(shape);

    // Obtener configuración por defecto
    const config = window.shapes.getDefaultConfig(type, this.actionsCounter);

    // Guardar en el array
    this.actionsShapes.push({
      id: this.actionsCounter,
      type: type,
      x: x,
      y: y,
      text: config.text,
      config: config,
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

  // Limpiar actions-frame
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
    this.actionsShapes = data.shapes;
    this.actionsCounter = data.counter;

    // Recrear formas
    this.actionsShapes.forEach((shapeData) => {
      this.recreateShape(shapeData);
    });

    // Mostrar mensaje inicial
    window.configPanel.close();
  },

  // Recrear forma desde datos guardados
  recreateShape(shapeData) {
    const actionsFrame = document.querySelector(".actions-frame");
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
      this.actionsCounter =
        Math.max(...this.actionsShapes.map((s) => s.id)) + 1;

      // Recrear formas
      this.actionsShapes.forEach((shapeData) => this.recreateShape(shapeData));

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
};

// Inicializar aplicación
function initApp() {
  console.log("Inicializando aplicación...");

  // Inicializar drag and drop
  window.dragDrop.initGlobalListeners();
  window.dragDrop.initTools();
  window.dragDrop.makeDroppable();

  // Inicializar herramientas
  window.tools.setup();

  // Configurar botones de acción
  document
    .getElementById("btnClear")
    .addEventListener("click", () => AppState.clearActionsFrame());
  document
    .getElementById("btnSave")
    .addEventListener("click", () => AppState.saveCanvas());
  document
    .getElementById("btnExport")
    .addEventListener("click", () => AppState.exportCanvas());
  document
    .getElementById("btnLoad")
    .addEventListener("click", () => AppState.loadCanvas());

  // Cargar estado guardado
  AppState.loadState();

  console.log("Aplicación iniciada correctamente");
}

// Exponer funciones globales para HTML
window.app = AppState;
window.updateShapeConfig = (property, value) =>
  AppState.updateShapeConfig(property, value);
window.deleteCurrentShape = () => AppState.deleteCurrentShape();

// Inicializar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
