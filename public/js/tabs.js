// Gestión de pestañas/proyectos

let tabs = [];
let activeTabId = 0;
let tabCounter = 1;

// Inicializar sistema de pestañas
function initTabs() {
  // Crear pestaña inicial
  tabs.push({
    id: 0,
    name: "Proyecto 1",
    shapes: [],
    counter: 0,
  });

  activeTabId = 0;
}

// Agregar nueva pestaña
function addNewTab() {
  const newTabId = tabCounter++;
  const newTab = {
    id: newTabId,
    name: `Proyecto ${newTabId + 1}`,
    shapes: [],
    counter: 0,
  };

  tabs.push(newTab);

  // Crear elemento de pestaña en el DOM
  const tabsList = document.getElementById("tabsList");
  const tabElement = document.createElement("div");
  tabElement.className = "tab";
  tabElement.dataset.tabId = newTabId;
  tabElement.onclick = () => switchTab(newTabId);

  tabElement.innerHTML = `
        <span class="tab-name">${newTab.name}</span>
        <button class="tab-close" onclick="event.stopPropagation(); closeTab(${newTabId})">×</button>
    `;

  tabsList.appendChild(tabElement);

  // Crear workspace para esta pestaña
  const workspaceContainer = document.querySelector(".workspace-container");
  const workspace = document.createElement("div");
  workspace.className = "workspace-content hidden";
  workspace.id = `workspace-${newTabId}`;
  workspace.dataset.tabId = newTabId;

  workspaceContainer.appendChild(workspace);

  // Cambiar a la nueva pestaña
  switchTab(newTabId);

  showNotification("Nueva pestaña creada");
}

// Cambiar de pestaña
function switchTab(tabId) {
  // Guardar estado de la pestaña actual
  if (window.app) {
    saveCurrentTabState();
  }

  // Actualizar pestaña activa
  activeTabId = tabId;

  // Actualizar UI de pestañas
  document.querySelectorAll(".tab").forEach((tab) => {
    if (parseInt(tab.dataset.tabId) === tabId) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  // Mostrar workspace correspondiente
  document.querySelectorAll(".workspace-content").forEach((workspace) => {
    if (parseInt(workspace.dataset.tabId) === tabId) {
      workspace.classList.remove("hidden");
    } else {
      workspace.classList.add("hidden");
    }
  });

  // Cargar estado de la pestaña
  loadTabState(tabId);

  // Cerrar panel de configuración
  if (window.configPanel) {
    window.configPanel.close();
  }
}

// Cerrar pestaña
function closeTab(tabId) {
  // No permitir cerrar si es la única pestaña
  if (tabs.length === 1) {
    showNotification("Debe existir al menos una pestaña", true);
    return;
  }

  if (confirm("¿Cerrar esta pestaña? Se perderán los cambios no guardados.")) {
    // Eliminar del array
    tabs = tabs.filter((tab) => tab.id !== tabId);

    // Eliminar del DOM
    const tabElement = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
    if (tabElement) {
      tabElement.remove();
    }

    const workspace = document.getElementById(`workspace-${tabId}`);
    if (workspace) {
      workspace.remove();
    }

    // Si es la pestaña activa, cambiar a la primera disponible
    if (activeTabId === tabId) {
      switchTab(tabs[0].id);
    }

    showNotification("Pestaña cerrada");
  }
}

// Renombrar pestaña
function renameTab(tabId, newName) {
  const tab = tabs.find((t) => t.id === tabId);
  if (tab) {
    tab.name = newName;

    const tabElement = document.querySelector(
      `.tab[data-tab-id="${tabId}"] .tab-name`
    );
    if (tabElement) {
      tabElement.textContent = newName;
    }
  }
}

// Guardar estado de la pestaña actual
function saveCurrentTabState() {
  const currentTab = tabs.find((t) => t.id === activeTabId);
  if (currentTab && window.app) {
    currentTab.shapes = JSON.parse(JSON.stringify(window.app.actionsShapes));
    currentTab.counter = window.app.actionsCounter;
  }
}

// Cargar estado de una pestaña
function loadTabState(tabId) {
  const tab = tabs.find((t) => t.id === tabId);
  if (!tab || !window.app) return;

  // Limpiar workspace actual
  const workspace = document.getElementById(`workspace-${tabId}`);
  if (workspace) {
    workspace.innerHTML = "";
  }

  // Cargar datos de la pestaña
  window.app.actionsShapes = JSON.parse(JSON.stringify(tab.shapes));
  window.app.actionsCounter = tab.counter;

  // Recrear formas en el workspace
  tab.shapes.forEach((shapeData) => {
    window.app.recreateShapeInWorkspace(shapeData, tabId);
  });
}

// Obtener pestaña activa
function getActiveTab() {
  return tabs.find((t) => t.id === activeTabId);
}

// Obtener workspace activo
function getActiveWorkspace() {
  return document.getElementById(`workspace-${activeTabId}`);
}

// Exportar todas las pestañas
function exportAllTabs() {
  saveCurrentTabState();

  const exportData = {
    version: "1.0",
    timestamp: Date.now(),
    tabs: tabs,
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "proyecto_completo_" + Date.now() + ".json";
  link.click();
  URL.revokeObjectURL(url);

  showNotification("Proyecto completo exportado");
}

// Importar todas las pestañas
function importAllTabs(callback) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        const data = JSON.parse(event.target.result);

        if (data.tabs && Array.isArray(data.tabs)) {
          // Limpiar pestañas actuales
          document.querySelectorAll(".tab").forEach((tab) => tab.remove());
          document
            .querySelectorAll(".workspace-content")
            .forEach((ws) => ws.remove());

          tabs = data.tabs;
          tabCounter = Math.max(...tabs.map((t) => t.id)) + 1;

          // Recrear pestañas en el DOM
          const tabsList = document.getElementById("tabsList");
          const workspaceContainer = document.querySelector(
            ".workspace-container"
          );

          tabs.forEach((tab, index) => {
            // Crear pestaña
            const tabElement = document.createElement("div");
            tabElement.className = "tab";
            tabElement.dataset.tabId = tab.id;
            tabElement.onclick = () => switchTab(tab.id);

            tabElement.innerHTML = `
                            <span class="tab-name">${tab.name}</span>
                            <button class="tab-close" onclick="event.stopPropagation(); closeTab(${tab.id})">×</button>
                        `;

            tabsList.appendChild(tabElement);

            // Crear workspace
            const workspace = document.createElement("div");
            workspace.className = "workspace-content hidden";
            workspace.id = `workspace-${tab.id}`;
            workspace.dataset.tabId = tab.id;

            workspaceContainer.appendChild(workspace);
          });

          // Activar primera pestaña
          if (tabs.length > 0) {
            switchTab(tabs[0].id);
          }

          showNotification("Proyecto completo importado");
          if (callback) callback(null);
        } else {
          throw new Error("Formato de archivo inválido");
        }
      } catch (error) {
        showNotification("Error al cargar el proyecto", true);
        if (callback) callback(error);
      }
    };

    reader.readAsText(file);
  };

  input.click();
}

// Exportar funciones
window.tabs = {
  init: initTabs,
  add: addNewTab,
  switch: switchTab,
  close: closeTab,
  rename: renameTab,
  getActive: getActiveTab,
  getActiveWorkspace: getActiveWorkspace,
  saveState: saveCurrentTabState,
  loadState: loadTabState,
  exportAll: exportAllTabs,
  importAll: importAllTabs,
};

// Funciones globales para HTML
window.addNewTab = addNewTab;
window.closeTab = closeTab;
window.switchTab = switchTab;
