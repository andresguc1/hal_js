// Gestión de acciones de testing en el panel de herramientas

let currentCategory = "navigation";

// Cambiar categoría de herramientas
function switchToolCategory(category) {
  currentCategory = category;

  // Actualizar pestañas
  document.querySelectorAll(".tools-tab").forEach((tab) => {
    if (tab.dataset.category === category) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  // Actualizar contenido
  document.querySelectorAll(".tools-category").forEach((content) => {
    if (content.dataset.category === category) {
      content.classList.add("active");
    } else {
      content.classList.remove("active");
    }
  });
}

// Inicializar listeners de acciones
function setupActionListeners() {
  document.querySelectorAll(".tool-action-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const actionType = this.dataset.action;
      addActionToWorkspace(actionType);
    });

    // Drag and drop
    btn.setAttribute("draggable", "true");

    btn.addEventListener("dragstart", function (e) {
      const actionType = this.dataset.action;
      e.dataTransfer.setData("actionType", actionType);
      e.dataTransfer.effectAllowed = "copy";
      this.style.opacity = "0.5";
    });

    btn.addEventListener("dragend", function (e) {
      this.style.opacity = "1";
    });
  });
}

// Agregar acción al workspace
function addActionToWorkspace(actionType) {
  const actionDef = window.TestActions[actionType];
  if (!actionDef) {
    showNotification("Acción no encontrada", true);
    return;
  }

  if (window.app) {
    window.app.addActionToWorkspace(actionType, actionDef);
  }
}

// Obtener configuración de acción por defecto
function getDefaultActionConfig(actionDef) {
  const config = {
    name: actionDef.name,
    icon: actionDef.icon,
    description: actionDef.description,
  };

  // Agregar parámetros con valores por defecto
  Object.keys(actionDef.params).forEach((paramName) => {
    const param = actionDef.params[paramName];
    config[paramName] = param.default || "";
  });

  return config;
}

// Validar configuración de acción
function validateActionConfig(actionType, config) {
  const actionDef = window.TestActions[actionType];
  if (!actionDef) return { valid: false, errors: ["Acción no encontrada"] };

  const errors = [];

  Object.keys(actionDef.params).forEach((paramName) => {
    const param = actionDef.params[paramName];
    const value = config[paramName];

    if (param.required && (!value || value.toString().trim() === "")) {
      errors.push(`El campo "${param.label}" es obligatorio`);
    }
  });

  return {
    valid: errors.length === 0,
    errors: errors,
  };
}

// Exportar funciones
window.toolActions = {
  switchCategory: switchToolCategory,
  setupListeners: setupActionListeners,
  addToWorkspace: addActionToWorkspace,
  getDefaultConfig: getDefaultActionConfig,
  validateConfig: validateActionConfig,
};

// Funciones globales para HTML
window.switchToolCategory = switchToolCategory;
