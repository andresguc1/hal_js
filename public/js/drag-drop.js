// Gestión de drag and drop

let isDragging = false;
let currentElement = null;
let offsetX = 0;
let offsetY = 0;

// Inicializar drag and drop para herramientas
function initToolsDragDrop() {
  document.querySelectorAll(".tool-shape").forEach((tool) => {
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

// Hacer el actions-frame receptivo para drop
function makeActionsFrameDroppable() {
  const actionsFrame = document.querySelector(".actions-frame");

  actionsFrame.addEventListener("dragover", function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  });

  actionsFrame.addEventListener("drop", function (e) {
    e.preventDefault();
    const shapeType = e.dataTransfer.getData("shapeType");

    if (shapeType && window.app) {
      const rect = actionsFrame.getBoundingClientRect();
      const x = e.clientX - rect.left - 50;
      const y = e.clientY - rect.top - 25;

      window.app.addShapeToActionsFrame(shapeType, false, x, y);
    }
  });
}

// Hacer elemento arrastrable con mouse
function makeDraggable(element) {
  element.addEventListener("mousedown", startDrag);
  element.addEventListener("click", selectShape);
  element.addEventListener("dblclick", preventDblClick);
}

// Iniciar arrastre
function startDrag(e) {
  const target = e.target;

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

    const minY = 60;
    const maxY = actionsFrame.height - currentElement.offsetHeight - 10;
    const maxX = actionsFrame.width - currentElement.offsetWidth - 10;

    x = Math.max(10, Math.min(x, maxX));
    y = Math.max(minY, Math.min(y, maxY));

    currentElement.style.left = x + "px";
    currentElement.style.top = y + "px";

    if (window.app) {
      window.app.updateShapePosition(currentElement.dataset.id, x, y);
    }
  }
}

// Manejar soltar mouse
function handleMouseUp() {
  if (currentElement) {
    currentElement.classList.remove("dragging");
    if (window.app) {
      window.app.saveState();
    }
  }
  isDragging = false;
  currentElement = null;
}

// Seleccionar elemento
function selectShape(e) {
  if (isDragging) return;

  if (e.target.closest(".action-btn")) return;

  e.stopPropagation();

  document.querySelectorAll(".action-shape").forEach((s) => {
    s.classList.remove("selected");
  });

  this.classList.add("selected");

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
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
}

// Exportar funciones
window.dragDrop = {
  initTools: initToolsDragDrop,
  makeDroppable: makeActionsFrameDroppable,
  makeDraggable,
  initGlobalListeners,
};
