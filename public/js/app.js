// Estado de la aplicación
let isDragging = false;
let currentElement = null;
let offsetX, offsetY;
let shapeCounter = 0;
let shapes = [];
let actionsCounter = 0;
let actionsShapes = [];

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", init);

function init() {
  setupToolListeners();
  setupActionButtons();
  setupCanvasListeners();
  makeActionsFrameDroppable();
  loadFromLocalStorage();
}

// Configurar listeners para las herramientas con drag and drop
function setupToolListeners() {
  document.querySelectorAll(".tool-shape").forEach((tool) => {
    // Click simple - agregar forma al actions-frame
    tool.addEventListener("click", function (e) {
      const shapeType = this.dataset.shape;
      addShapeToActionsFrame(shapeType);
    });

    // Drag and Drop desde herramientas
    tool.setAttribute("draggable", "true");

    tool.addEventListener("dragstart", function (e) {
      const shapeType = this.dataset.shape;
      e.dataTransfer.setData("shapeType", shapeType);
      e.dataTransfer.effectAllowed = "copy";
      this.style.opacity = "0.5";
    });

    tool.addEventListener("dragend", function (e) {
      this.style.opacity = "1";
    });
  });
}

// Configurar botones de acción
function setupActionButtons() {
  document
    .getElementById("btnClear")
    .addEventListener("click", clearActionsFrame);
  document.getElementById("btnSave").addEventListener("click", saveCanvas);
  document.getElementById("btnExport").addEventListener("click", exportCanvas);
  document.getElementById("btnLoad").addEventListener("click", loadCanvas);
}

// Configurar listeners globales
function setupCanvasListeners() {
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
}

// Hacer el actions-frame receptivo para drop
function makeActionsFrameDroppable() {
  const actionsFrame = document.querySelector(".actions-frame");
  actionsFrame.style.position = "relative";

  // Eventos de drag and drop
  actionsFrame.addEventListener("dragover", function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  });

  actionsFrame.addEventListener("drop", function (e) {
    e.preventDefault();
    const shapeType = e.dataTransfer.getData("shapeType");

    if (shapeType) {
      // Calcular posición relativa al actions-frame
      const rect = actionsFrame.getBoundingClientRect();
      const x = e.clientX - rect.left - 50; // Centrar aproximadamente
      const y = e.clientY - rect.top - 25;

      addShapeToActionsFrame(shapeType, false, x, y);
    }
  });
}

// Agregar forma al actions-frame
function addShapeToActionsFrame(
  type,
  centered = false,
  customX = null,
  customY = null
) {
  const actionsFrame = document.querySelector(".actions-frame");
  const shape = document.createElement("div");
  shape.className = "placed-shape action-shape";
  shape.dataset.id = actionsCounter;
  shape.dataset.type = type;

  // Posición inicial dentro del actions-frame
  let x, y;

  if (customX !== null && customY !== null) {
    // Posición personalizada (drag and drop)
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

  // Crear la forma específica
  createShape(shape, type, actionsCounter);

  actionsFrame.appendChild(shape);
  makeDraggableInActions(shape);

  // Guardar en el array de formas del actions-frame
  actionsShapes.push({
    id: actionsCounter,
    type: type,
    x: x,
    y: y,
    text: getDefaultText(type, actionsCounter),
  });

  actionsCounter++;
  saveToLocalStorage();
}

// Crear forma según el tipo
function createShape(container, type, counter) {
  let shapeElement;
  const text = getDefaultText(type, counter);

  switch (type) {
    case "oval":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-oval";
      shapeElement.contentEditable = true;
      shapeElement.textContent = text;
      break;

    case "rectangle":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-rectangle";
      shapeElement.contentEditable = true;
      shapeElement.textContent = text;
      break;

    case "diamond":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-diamond";
      break;

    case "parallelogram":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-parallelogram";
      const spanPara = document.createElement("span");
      spanPara.contentEditable = true;
      spanPara.textContent = text;
      shapeElement.appendChild(spanPara);
      break;

    case "roundedRect":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-roundedRect";
      shapeElement.contentEditable = true;
      shapeElement.textContent = text;
      break;

    case "hexagon":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-hexagon";
      const spanHex = document.createElement("span");
      spanHex.contentEditable = true;
      spanHex.textContent = text;
      shapeElement.appendChild(spanHex);
      break;

    case "trapezoid":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-trapezoid";
      const spanTrap = document.createElement("span");
      spanTrap.contentEditable = true;
      spanTrap.textContent = text;
      shapeElement.appendChild(spanTrap);
      break;

    case "cylinder":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-cylinder";
      const spanCyl = document.createElement("span");
      spanCyl.contentEditable = true;
      spanCyl.textContent = text;
      shapeElement.appendChild(spanCyl);
      break;

    case "arrow":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-arrow";
      break;

    case "connector":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-connector";
      shapeElement.textContent = counter + 1;
      break;

    default:
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-rectangle";
      shapeElement.contentEditable = true;
      shapeElement.textContent = text;
  }

  container.appendChild(shapeElement);
}

// Obtener texto por defecto según el tipo
function getDefaultText(type, counter) {
  const texts = {
    oval: "Inicio",
    rectangle: "Acción " + (counter + 1),
    diamond: "",
    parallelogram: "Input/Output",
    roundedRect: "Subproceso",
    hexagon: "Preparación",
    trapezoid: "Manual",
    cylinder: "Datos",
    arrow: "",
    connector: "",
  };
  return texts[type] || "Texto";
}

// Hacer elemento arrastrable dentro del actions-frame
function makeDraggableInActions(element) {
  element.addEventListener("mousedown", startDragInActions);

  // Prevenir el comportamiento por defecto del doble click
  element.addEventListener("dblclick", function (e) {
    e.preventDefault();
    e.stopPropagation();
    // No hacer nada en doble click
  });
}

// Iniciar arrastre en actions-frame
function startDragInActions(e) {
  // No iniciar drag si se está editando texto
  const target = e.target;
  if (target.contentEditable === "true" || target.isContentEditable) {
    return;
  }

  // Verificar que no se esté haciendo clic en un botón de acción
  if (target.closest(".action-btn")) {
    return;
  }

  e.preventDefault();
  e.stopPropagation();

  isDragging = true;
  currentElement = this;
  currentElement.classList.add("dragging");

  const rect = currentElement.getBoundingClientRect();
  const actionsFrame = document
    .querySelector(".actions-frame")
    .getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
}

// Manejar movimiento del mouse
function handleMouseMove(e) {
  if (isDragging && currentElement) {
    e.preventDefault();

    const actionsFrame = document
      .querySelector(".actions-frame")
      .getBoundingClientRect();
    let x = e.clientX - actionsFrame.left - offsetX;
    let y = e.clientY - actionsFrame.top - offsetY;

    // Mantener dentro del actions-frame con más margen
    const minY = 60;
    const maxY = actionsFrame.height - currentElement.offsetHeight - 10;
    const maxX = actionsFrame.width - currentElement.offsetWidth - 10;

    x = Math.max(10, Math.min(x, maxX));
    y = Math.max(minY, Math.min(y, maxY));

    currentElement.style.left = x + "px";
    currentElement.style.top = y + "px";

    // Actualizar posición en el array
    updateActionShapePosition(currentElement.dataset.id, x, y);
  }
}

// Manejar soltar mouse
function handleMouseUp() {
  if (currentElement) {
    currentElement.classList.remove("dragging");
    saveToLocalStorage();
  }
  isDragging = false;
  currentElement = null;
}

// Actualizar posición de forma en actions
function updateActionShapePosition(id, x, y) {
  const shape = actionsShapes.find((s) => s.id == id);
  if (shape) {
    shape.x = x;
    shape.y = y;
  }
}

// Limpiar actions-frame
function clearActionsFrame() {
  if (confirm("¿Seguro que deseas limpiar el área de acciones?")) {
    const shapes = document.querySelectorAll(".action-shape");
    shapes.forEach((shape) => shape.remove());
    actionsShapes = [];
    actionsCounter = 0;
    saveToLocalStorage();
  }
}

// Guardar en localStorage
function saveToLocalStorage() {
  localStorage.setItem("haljs_actions_shapes", JSON.stringify(actionsShapes));
  localStorage.setItem("haljs_actions_counter", actionsCounter);
}

// Cargar desde localStorage
function loadFromLocalStorage() {
  const savedShapes = localStorage.getItem("haljs_actions_shapes");
  const savedCounter = localStorage.getItem("haljs_actions_counter");

  if (savedShapes) {
    actionsShapes = JSON.parse(savedShapes);
    actionsCounter = parseInt(savedCounter) || 0;

    actionsShapes.forEach((shapeData) => {
      recreateShapeInActions(shapeData);
    });
  }
}

// Recrear forma en actions-frame desde datos guardados
function recreateShapeInActions(shapeData) {
  const actionsFrame = document.querySelector(".actions-frame");
  const shape = document.createElement("div");
  shape.className = "placed-shape action-shape";
  shape.dataset.id = shapeData.id;
  shape.dataset.type = shapeData.type;
  shape.style.left = shapeData.x + "px";
  shape.style.top = shapeData.y + "px";

  let shapeElement;
  const text = shapeData.text || getDefaultText(shapeData.type, shapeData.id);

  switch (shapeData.type) {
    case "oval":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-oval";
      shapeElement.contentEditable = true;
      shapeElement.textContent = text;
      break;

    case "rectangle":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-rectangle";
      shapeElement.contentEditable = true;
      shapeElement.textContent = text;
      break;

    case "diamond":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-diamond";
      break;

    case "parallelogram":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-parallelogram";
      const spanPara = document.createElement("span");
      spanPara.contentEditable = true;
      spanPara.textContent = text;
      shapeElement.appendChild(spanPara);
      break;

    case "roundedRect":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-roundedRect";
      shapeElement.contentEditable = true;
      shapeElement.textContent = text;
      break;

    case "hexagon":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-hexagon";
      const spanHex = document.createElement("span");
      spanHex.contentEditable = true;
      spanHex.textContent = text;
      shapeElement.appendChild(spanHex);
      break;

    case "trapezoid":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-trapezoid";
      const spanTrap = document.createElement("span");
      spanTrap.contentEditable = true;
      spanTrap.textContent = text;
      shapeElement.appendChild(spanTrap);
      break;

    case "cylinder":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-cylinder";
      const spanCyl = document.createElement("span");
      spanCyl.contentEditable = true;
      spanCyl.textContent = text;
      shapeElement.appendChild(spanCyl);
      break;

    case "arrow":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-arrow";
      break;

    case "connector":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-connector";
      shapeElement.textContent = text;
      break;

    default:
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-rectangle";
      shapeElement.contentEditable = true;
      shapeElement.textContent = text;
  }

  shape.appendChild(shapeElement);
  actionsFrame.appendChild(shape);
  makeDraggableInActions(shape);
}

// Guardar canvas (exportar JSON)
function saveCanvas() {
  const dataStr = JSON.stringify(actionsShapes, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "diagrama_acciones_" + Date.now() + ".json";
  link.click();
  URL.revokeObjectURL(url);

  showNotification("Diagrama guardado exitosamente");
}

// Cargar canvas (importar JSON)
function loadCanvas() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        const loadedShapes = JSON.parse(event.target.result);
        actionsShapes = [];
        const shapes = document.querySelectorAll(".action-shape");
        shapes.forEach((shape) => shape.remove());
        actionsShapes = loadedShapes;
        actionsCounter = Math.max(...actionsShapes.map((s) => s.id)) + 1;
        actionsShapes.forEach((shapeData) => recreateShapeInActions(shapeData));
        saveToLocalStorage();
        showNotification("Diagrama cargado exitosamente");
      } catch (error) {
        showNotification("Error al cargar el archivo", true);
      }
    };

    reader.readAsText(file);
  };

  input.click();
}

// Exportar como imagen
function exportCanvas() {
  showNotification(
    'Función de exportar a imagen en desarrollo.\nPor ahora usa "Guardar" para exportar en formato JSON.'
  );
}

// Mostrar notificación temporal
function showNotification(message, isError = false) {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${isError ? "#f44336" : "#4CAF50"};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;

  const style = document.createElement("style");
  style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideIn 0.3s ease reverse";
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 300);
  }, 3000);
}
