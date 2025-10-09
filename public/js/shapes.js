// Gestión de formas y sus configuraciones

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

// Obtener configuración por defecto según el tipo
function getDefaultConfig(type, counter) {
  switch (type) {
    case "oval":
      return {
        text: "Inicio",
        subtype: "inicio", // inicio o fin
        description: "",
        color: "#ffffff",
      };
    case "rectangle":
      return {
        text: "Acción " + (counter + 1),
        action: "",
        description: "",
        color: "#ffffff",
      };
    case "diamond":
      return {
        text: "Decisión",
        condition: "",
        description: "",
        color: "#ffffff",
      };
    case "parallelogram":
      return {
        text: "Input/Output",
        ioType: "input", // input o output
        description: "",
        color: "#ffffff",
      };
    case "roundedRect":
      return {
        text: "Subproceso",
        subprocess: "",
        description: "",
        color: "#ffffff",
      };
    case "hexagon":
      return {
        text: "Preparación",
        preparation: "",
        description: "",
        color: "#ffffff",
      };
    case "trapezoid":
      return {
        text: "Manual",
        manualAction: "",
        description: "",
        color: "#ffffff",
      };
    case "cylinder":
      return {
        text: "Datos",
        dataType: "",
        description: "",
        color: "#ffffff",
      };
    default:
      return {
        text: getDefaultText(type, counter),
        description: "",
        color: "#ffffff",
      };
  }
}

// Crear elemento visual de forma
function createShapeElement(container, type, counter) {
  let shapeElement;
  const text = getDefaultText(type, counter);

  switch (type) {
    case "oval":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-oval";
      shapeElement.textContent = text;
      break;

    case "rectangle":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-rectangle";
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
      spanPara.textContent = text;
      shapeElement.appendChild(spanPara);
      break;

    case "roundedRect":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-roundedRect";
      shapeElement.textContent = text;
      break;

    case "hexagon":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-hexagon";
      const spanHex = document.createElement("span");
      spanHex.textContent = text;
      shapeElement.appendChild(spanHex);
      break;

    case "trapezoid":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-trapezoid";
      const spanTrap = document.createElement("span");
      spanTrap.textContent = text;
      shapeElement.appendChild(spanTrap);
      break;

    case "cylinder":
      shapeElement = document.createElement("div");
      shapeElement.className = "shape-cylinder";
      const spanCyl = document.createElement("span");
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
      shapeElement.textContent = text;
  }

  container.appendChild(shapeElement);
}

// Actualizar texto de forma en el DOM
function updateShapeText(shapeId, text) {
  const domElement = document.querySelector(
    `.action-shape[data-id="${shapeId}"]`
  );
  if (!domElement) return;

  const textElement = domElement.querySelector(
    ".shape-oval, .shape-rectangle, .shape-roundedRect, span"
  );
  if (textElement) {
    textElement.textContent = text;
  }
}

// Actualizar color de forma en el DOM
function updateShapeColor(shapeId, color) {
  const domElement = document.querySelector(
    `.action-shape[data-id="${shapeId}"]`
  );
  if (!domElement) return;

  const shapeElement = domElement.querySelector(
    ".shape-oval, .shape-rectangle, .shape-roundedRect, .shape-hexagon, .shape-trapezoid, .shape-cylinder, .shape-parallelogram"
  );
  if (shapeElement) {
    shapeElement.style.backgroundColor = color;
  }
}

// Exportar funciones globalmente
window.shapes = {
  getDefaultText,
  getDefaultConfig,
  createShapeElement,
  updateShapeText,
  updateShapeColor,
};
