// Gestión del panel de configuración

let selectedShapeId = null;

// Mostrar panel de configuración
function showConfigPanel(shapeId, shape) {
  selectedShapeId = shapeId;
  const canvasArea = document.getElementById("canvas");
  canvasArea.innerHTML = "";

  let configPanel;

  switch (shape.type) {
    case "oval":
      configPanel = createOvalConfigPanel(shape);
      break;
    case "rectangle":
      configPanel = createRectangleConfigPanel(shape);
      break;
    default:
      configPanel = createGenericConfigPanel(shape);
  }

  canvasArea.appendChild(configPanel);
}

// Crear panel de configuración para Oval (Inicio/Fin)
function createOvalConfigPanel(shape) {
  const panel = document.createElement("div");
  panel.className = "config-panel";

  panel.innerHTML = `
        <div class="config-header">
            <h2>Configuración: Inicio/Fin</h2>
            <button class="close-config" onclick="closeConfigPanel()">✕</button>
        </div>
        
        <div class="config-content">
            <div class="config-section">
                <h3>Información Básica</h3>
                
                <div class="form-group">
                    <label>Tipo de elemento:</label>
                    <select id="config-subtype" onchange="updateShapeConfig('subtype', this.value)">
                        <option value="inicio" ${
                          shape.config.subtype === "inicio" ? "selected" : ""
                        }>Inicio</option>
                        <option value="fin" ${
                          shape.config.subtype === "fin" ? "selected" : ""
                        }>Fin</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Etiqueta:</label>
                    <input type="text" id="config-text" value="${
                      shape.config.text
                    }" 
                           oninput="updateShapeConfig('text', this.value)" 
                           placeholder="Texto del elemento">
                </div>
                
                <div class="form-group">
                    <label>Descripción:</label>
                    <textarea id="config-description" rows="3" 
                              oninput="updateShapeConfig('description', this.value)"
                              placeholder="Descripción opcional...">${
                                shape.config.description || ""
                              }</textarea>
                </div>
            </div>
            
            <div class="config-section">
                <h3>Apariencia</h3>
                
                <div class="form-group">
                    <label>Color de fondo:</label>
                    <input type="color" id="config-color" value="${
                      shape.config.color
                    }" 
                           onchange="updateShapeConfig('color', this.value)">
                </div>
            </div>
            
            <div class="config-section">
                <h3>Vista Previa</h3>
                <div class="preview-container">
                    <div class="shape-oval preview-shape" style="background-color: ${
                      shape.config.color
                    }">
                        ${shape.config.text}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="config-footer">
            <button class="btn-secondary" onclick="deleteCurrentShape()">Eliminar</button>
            <button class="btn-primary" onclick="closeConfigPanel()">Cerrar</button>
        </div>
    `;

  return panel;
}

// Crear panel de configuración para Rectangle (Proceso)
function createRectangleConfigPanel(shape) {
  const panel = document.createElement("div");
  panel.className = "config-panel";

  panel.innerHTML = `
        <div class="config-header">
            <h2>Configuración: Proceso</h2>
            <button class="close-config" onclick="closeConfigPanel()">✕</button>
        </div>
        
        <div class="config-content">
            <div class="config-section">
                <h3>Información Básica</h3>
                
                <div class="form-group">
                    <label>Nombre de la acción:</label>
                    <input type="text" id="config-text" value="${
                      shape.config.text
                    }" 
                           oninput="updateShapeConfig('text', this.value)" 
                           placeholder="Nombre del proceso">
                </div>
                
                <div class="form-group">
                    <label>Descripción de la acción:</label>
                    <textarea id="config-action" rows="3" 
                              oninput="updateShapeConfig('action', this.value)"
                              placeholder="Describe qué hace este proceso...">${
                                shape.config.action || ""
                              }</textarea>
                </div>
                
                <div class="form-group">
                    <label>Notas adicionales:</label>
                    <textarea id="config-description" rows="2" 
                              oninput="updateShapeConfig('description', this.value)"
                              placeholder="Notas opcionales...">${
                                shape.config.description || ""
                              }</textarea>
                </div>
            </div>
            
            <div class="config-section">
                <h3>Apariencia</h3>
                
                <div class="form-group">
                    <label>Color de fondo:</label>
                    <input type="color" id="config-color" value="${
                      shape.config.color
                    }" 
                           onchange="updateShapeConfig('color', this.value)">
                </div>
            </div>
            
            <div class="config-section">
                <h3>Vista Previa</h3>
                <div class="preview-container">
                    <div class="shape-rectangle preview-shape" style="background-color: ${
                      shape.config.color
                    }">
                        ${shape.config.text}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="config-footer">
            <button class="btn-secondary" onclick="deleteCurrentShape()">Eliminar</button>
            <button class="btn-primary" onclick="closeConfigPanel()">Cerrar</button>
        </div>
    `;

  return panel;
}

// Crear panel genérico para otros tipos
function createGenericConfigPanel(shape) {
  const panel = document.createElement("div");
  panel.className = "config-panel";

  panel.innerHTML = `
        <div class="config-header">
            <h2>Configuración del Elemento</h2>
            <button class="close-config" onclick="closeConfigPanel()">✕</button>
        </div>
        
        <div class="config-content">
            <div class="config-section">
                <div class="info-box">
                    Panel de configuración para ${shape.type} (En desarrollo)
                </div>
            </div>
        </div>
        
        <div class="config-footer">
            <button class="btn-secondary" onclick="deleteCurrentShape()">Eliminar</button>
            <button class="btn-primary" onclick="closeConfigPanel()">Cerrar</button>
        </div>
    `;

  return panel;
}

// Cerrar panel de configuración
function closeConfigPanel() {
  const canvasArea = document.getElementById("canvas");
  canvasArea.innerHTML =
    '<div class="empty-canvas"><p>Selecciona un elemento para configurarlo</p></div>';

  // Remover selección
  document.querySelectorAll(".action-shape").forEach((s) => {
    s.classList.remove("selected");
  });

  selectedShapeId = null;
}

// Obtener ID del elemento seleccionado
function getSelectedShapeId() {
  return selectedShapeId;
}

// Exportar funciones globalmente
window.configPanel = {
  show: showConfigPanel,
  close: closeConfigPanel,
  getSelectedId: getSelectedShapeId,
};

// Funciones globales para el HTML
window.closeConfigPanel = closeConfigPanel;
