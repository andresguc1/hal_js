// Gestión de pestañas/proyectos

let tabs = [];
let activeTabId = 0;
let tabCounter = 1; // contador humano para nombres
let idCounter = 1; // contador para ids únicos (el id 0 se reserva para la inicial)
let contextMenu = null;

// Inicializar sistema de pestañas
function initTabs() {
  // Crear pestaña inicial en modelo
  const initialTab = {
    id: 0,
    name: "Proyecto 1",
    shapes: [],
    counter: 0,
  };
  tabs = [initialTab];
  activeTabId = 0;
  tabCounter = 2; // la próxima etiqueta será Proyecto 2
  idCounter = 1; // próximo id libre

  // Crear DOM para la pestaña inicial y su workspace
  const tabsList = document.getElementById("tabsList");
  const workspaceContainer = document.querySelector(".workspace-container");

  // Limpiar por si acaso
  if (tabsList) tabsList.innerHTML = "";
  if (workspaceContainer) workspaceContainer.innerHTML = "";

  if (tabsList)
    tabsList.appendChild(createTabElement(initialTab.id, initialTab.name));
  if (workspaceContainer) {
    const workspace = document.createElement("div");
    workspace.className = "workspace-content";
    workspace.id = `workspace-${initialTab.id}`;
    workspace.dataset.tabId = initialTab.id;
    workspaceContainer.appendChild(workspace);
  }

  // Asegurar que la pestaña inicial se muestre como activa
  setActiveTabClass(initialTab.id);

  // Agregar listener para cerrar menú contextual al hacer clic fuera
  document.addEventListener("click", closeContextMenu);

  // Prevenir menú contextual del navegador en pestañas
  document.addEventListener("contextmenu", (e) => {
    if (e.target.closest(".tab")) {
      e.preventDefault();
    }
  });
}

// Agregar nueva pestaña
function addNewTab() {
  const newTabId = idCounter++;
  const newTabName = `Proyecto ${tabCounter++}`;
  const newTab = {
    id: newTabId,
    name: newTabName,
    shapes: [],
    counter: 0,
  };

  tabs.push(newTab);

  // Crear elemento de pestaña en el DOM
  const tabsList = document.getElementById("tabsList");
  const tabElement = createTabElement(newTabId, newTabName);

  if (tabsList) {
    tabsList.appendChild(tabElement);
    // Scroll al final de las pestañas y focus visual
    tabsList.scrollLeft = tabsList.scrollWidth;
  }

  // Crear workspace para esta pestaña
  const workspaceContainer = document.querySelector(".workspace-container");
  if (workspaceContainer) {
    const workspace = document.createElement("div");
    workspace.className = "workspace-content hidden";
    workspace.id = `workspace-${newTabId}`;
    workspace.dataset.tabId = newTabId;
    workspaceContainer.appendChild(workspace);
  }

  // Cambiar a la nueva pestaña
  switchTab(newTabId);

  showNotification("Nueva pestaña creada");
}

// Crear elemento de pestaña
function createTabElement(tabId, tabName) {
  const tabElement = document.createElement("div");
  tabElement.className = "tab";
  tabElement.dataset.tabId = tabId;

  const tabNameSpan = document.createElement("span");
  tabNameSpan.className = "tab-name";
  tabNameSpan.textContent = tabName;
  tabNameSpan.title =
    "Click para cambiar, doble click para renombrar, click derecho para opciones";

  // Click simple - cambiar de pestaña
  tabNameSpan.addEventListener("click", (e) => {
    e.stopPropagation();
    switchTab(tabId);
  });

  // Doble click - editar nombre
  tabNameSpan.addEventListener("dblclick", (e) => {
    e.stopPropagation();
    startEditingTabName(tabId, tabNameSpan);
  });

  // Click derecho - menú contextual en todo el elemento
  tabElement.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();
    showTabContextMenu(e, tabId);
  });

  const closeBtn = document.createElement("button");
  closeBtn.className = "tab-close";
  closeBtn.type = "button";
  closeBtn.textContent = "×";
  closeBtn.title = "Cerrar pestaña";
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeTab(tabId);
  });

  tabElement.appendChild(tabNameSpan);
  tabElement.appendChild(closeBtn);

  return tabElement;
}

// Util: marcar visualmente la pestaña activa
function setActiveTabClass(tabId) {
  document.querySelectorAll(".tab").forEach((tab) => {
    if (parseInt(tab.dataset.tabId, 10) === tabId) {
      tab.classList.add("active");
      tab.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    } else {
      tab.classList.remove("active");
    }
  });
}

// Iniciar edición de nombre de pestaña
function startEditingTabName(tabId, tabNameElement) {
  const currentName = tabNameElement.textContent;
  const input = document.createElement("input");
  input.type = "text";
  input.className = "tab-name-input";
  input.value = currentName;

  // Reemplazar el span con el input
  tabNameElement.replaceWith(input);
  input.focus();
  input.select();

  // Guardar al perder foco
  const saveEdit = () => {
    const newName = input.value.trim() || currentName;
    renameTab(tabId, newName);

    // Recrear el span
    const newSpan = document.createElement("span");
    newSpan.className = "tab-name";
    newSpan.textContent = newName;
    newSpan.title =
      "Click para cambiar, doble click para renombrar, click derecho para opciones";

    newSpan.addEventListener("click", (e) => {
      e.stopPropagation();
      switchTab(tabId);
    });

    newSpan.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      startEditingTabName(tabId, newSpan);
    });

    input.replaceWith(newSpan);
  };

  input.addEventListener("blur", saveEdit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      const newSpan = document.createElement("span");
      newSpan.className = "tab-name";
      newSpan.textContent = currentName;
      newSpan.title =
        "Click para cambiar, doble click para renombrar, click derecho para opciones";

      newSpan.addEventListener("click", (e) => {
        e.stopPropagation();
        switchTab(tabId);
      });

      newSpan.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        startEditingTabName(tabId, newSpan);
      });

      input.replaceWith(newSpan);
    }
  });
}

// Mostrar menú contextual
function showTabContextMenu(event, tabId) {
  closeContextMenu();

  const menu = document.createElement("div");
  menu.className = "tab-context-menu";
  menu.style.left = event.pageX + "px";
  menu.style.top = event.pageY + "px";

  const tab = tabs.find((t) => t.id === tabId);

  // Opción: Renombrar
  const renameItem = document.createElement("div");
  renameItem.className = "tab-context-menu-item";
  renameItem.innerHTML = "<span>✏️</span><span>Renombrar</span>";
  renameItem.addEventListener("click", () => {
    closeContextMenu();
    const tabNameElement = document.querySelector(
      `.tab[data-tab-id="${tabId}"] .tab-name`
    );
    if (tabNameElement) {
      startEditingTabName(tabId, tabNameElement);
    }
  });
  menu.appendChild(renameItem);

  // Opción: Duplicar
  const duplicateItem = document.createElement("div");
  duplicateItem.className = "tab-context-menu-item";
  duplicateItem.innerHTML = "<span>📋</span><span>Duplicar</span>";
  duplicateItem.addEventListener("click", () => {
    closeContextMenu();
    duplicateTab(tabId);
  });
  menu.appendChild(duplicateItem);

  // Separador
  const separator1 = document.createElement("div");
  separator1.className = "tab-context-menu-separator";
  menu.appendChild(separator1);

  // Opción: Cambiar a esta pestaña
  if (tabId !== activeTabId) {
    const switchItem = document.createElement("div");
    switchItem.className = "tab-context-menu-item";
    switchItem.innerHTML = "<span>👉</span><span>Ir a esta pestaña</span>";
    switchItem.addEventListener("click", () => {
      closeContextMenu();
      switchTab(tabId);
    });
    menu.appendChild(switchItem);
  }

  // Separador
  const separator2 = document.createElement("div");
  separator2.className = "tab-context-menu-separator";
  menu.appendChild(separator2);

  // Opción: Cerrar (solo si hay más de una pestaña)
  if (tabs.length > 1) {
    const closeItem = document.createElement("div");
    closeItem.className = "tab-context-menu-item danger";
    closeItem.innerHTML = "<span>✕</span><span>Cerrar pestaña</span>";
    closeItem.addEventListener("click", () => {
      closeContextMenu();
      closeTab(tabId);
    });
    menu.appendChild(closeItem);
  }

  // Opción: Cerrar otras pestañas
  if (tabs.length > 1) {
    const closeOthersItem = document.createElement("div");
    closeOthersItem.className = "tab-context-menu-item danger";
    closeOthersItem.innerHTML = "<span>✕✕</span><span>Cerrar otras</span>";
    closeOthersItem.addEventListener("click", () => {
      closeContextMenu();
      closeOtherTabs(tabId);
    });
    menu.appendChild(closeOthersItem);
  }

  document.body.appendChild(menu);
  contextMenu = menu;

  // Ajustar posición si se sale de la ventana
  const menuRect = menu.getBoundingClientRect();
  if (menuRect.right > window.innerWidth) {
    menu.style.left = event.pageX - menuRect.width + "px";
  }
  if (menuRect.bottom > window.innerHeight) {
    menu.style.top = event.pageY - menuRect.height + "px";
  }
}

// Cerrar menú contextual
function closeContextMenu() {
  if (contextMenu) {
    contextMenu.remove();
    contextMenu = null;
  }
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
  setActiveTabClass(tabId);

  // Mostrar workspace correspondiente
  document.querySelectorAll(".workspace-content").forEach((workspace) => {
    if (parseInt(workspace.dataset.tabId, 10) === tabId) {
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

  const tab = tabs.find((t) => t.id === tabId);
  if (!tab) return;

  const hasContent = tab && tab.shapes && tab.shapes.length > 0;

  const message = hasContent
    ? "¿Cerrar esta pestaña? Se perderán los cambios no guardados."
    : "¿Cerrar esta pestaña?";

  if (!confirm(message)) return;

  // Antes de eliminar, localizar índice y decidir siguiente pestaña
  const currentIndex = tabs.findIndex((t) => t.id === tabId);
  // Eliminar del array
  tabs = tabs.filter((t) => t.id !== tabId);

  // Eliminar del DOM
  const tabElement = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
  if (tabElement) {
    tabElement.remove();
  }

  const workspace = document.getElementById(`workspace-${tabId}`);
  if (workspace) {
    workspace.remove();
  }

  // Si es la pestaña activa, cambiar a otra
  if (activeTabId === tabId) {
    // Intentar tomar la pestaña a la derecha, si no la anterior, si no la primera
    const nextTab = tabs[currentIndex] || tabs[currentIndex - 1] || tabs[0];
    if (nextTab) {
      switchTab(nextTab.id);
    } else if (tabs.length > 0) {
      switchTab(tabs[0].id);
    }
  }

  showNotification("Pestaña cerrada");
}

// Cerrar otras pestañas
function closeOtherTabs(keepTabId) {
  if (
    !confirm(
      "¿Cerrar todas las demás pestañas? Se perderán los cambios no guardados."
    )
  )
    return;

  const tabsToClose = tabs.filter((t) => t.id !== keepTabId);

  tabsToClose.forEach((tab) => {
    const tabElement = document.querySelector(`.tab[data-tab-id="${tab.id}"]`);
    if (tabElement) tabElement.remove();
    const workspace = document.getElementById(`workspace-${tab.id}`);
    if (workspace) workspace.remove();
  });

  tabs = tabs.filter((t) => t.id === keepTabId);

  // Asegurarse de que esté activa
  switchTab(keepTabId);

  showNotification("Pestañas cerradas");
}

// Duplicar pestaña
function duplicateTab(tabId) {
  const originalTab = tabs.find((t) => t.id === tabId);
  if (!originalTab) return;

  const newTabId = idCounter++;
  const newTab = {
    id: newTabId,
    name: originalTab.name + " (copia)",
    shapes: JSON.parse(JSON.stringify(originalTab.shapes || [])), // Copia profunda
    counter: originalTab.counter || 0,
  };

  // Insertar después de la original en el array
  const insertIndex = tabs.findIndex((t) => t.id === tabId) + 1;
  tabs.splice(insertIndex, 0, newTab);

  // Crear elemento de pestaña en el DOM
  const tabsList = document.getElementById("tabsList");
  const tabElement = createTabElement(newTabId, newTab.name);

  const originalElement = document.querySelector(
    `.tab[data-tab-id="${tabId}"]`
  );
  if (originalElement && originalElement.nextSibling && tabsList) {
    tabsList.insertBefore(tabElement, originalElement.nextSibling);
  } else if (tabsList) {
    tabsList.appendChild(tabElement);
  }

  // Crear workspace para esta pestaña
  const workspaceContainer = document.querySelector(".workspace-container");
  if (workspaceContainer) {
    const workspace = document.createElement("div");
    workspace.className = "workspace-content hidden";
    workspace.id = `workspace-${newTabId}`;
    workspace.dataset.tabId = newTabId;
    workspaceContainer.appendChild(workspace);
  }

  // Cambiar a la nueva pestaña
  switchTab(newTabId);

  showNotification("Pestaña duplicada");
}

// Renombrar pestaña (modelo + DOM)
function renameTab(tabId, newName) {
  const tab = tabs.find((t) => t.id === tabId);
  if (tab) {
    tab.name = newName;
    // Actualizar DOM si existe
    const tabNameElement = document.querySelector(
      `.tab[data-tab-id="${tabId}"] .tab-name`
    );
    if (tabNameElement) tabNameElement.textContent = newName;
    showNotification("Pestaña renombrada");
  }
}

// Guardar estado de la pestaña actual
function saveCurrentTabState() {
  const currentTab = tabs.find((t) => t.id === activeTabId);
  if (currentTab && window.app) {
    currentTab.shapes = JSON.parse(
      JSON.stringify(window.app.actionsShapes || [])
    );
    currentTab.counter = window.app.actionsCounter || 0;
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
  window.app.actionsShapes = JSON.parse(JSON.stringify(tab.shapes || []));
  window.app.actionsCounter = tab.counter || 0;

  // Recrear formas en el workspace
  (tab.shapes || []).forEach((shapeData) => {
    if (typeof window.app.recreateShapeInWorkspace === "function") {
      window.app.recreateShapeInWorkspace(shapeData, tabId);
    }
  });
}

// Obtener pestaña activa
function getActiveTab() {
  return tabs.find((t) => t.id === activeTabId);
}

// Obtener workspace activo
function getActiveWorkspace() {
  const activeTab = tabs.find((t) => t.id === activeTabId);
  if (!activeTab) return null;

  const workspace = document.getElementById(`workspace-${activeTab.id}`);
  if (workspace) return workspace;

  // Fallback: buscar workspace visible
  return (
    document.querySelector(".workspace-content:not(.hidden)") ||
    document.querySelector(".workspace-content")
  );
}

// Obtener todas las pestañas
function getAllTabs() {
  return tabs;
}

// Navegación con teclado
function setupKeyboardNavigation() {
  document.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + Tab - siguiente pestaña
    if ((e.ctrlKey || e.metaKey) && e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
      const nextIndex = (currentIndex + 1) % tabs.length;
      switchTab(tabs[nextIndex].id);
    }

    // Ctrl/Cmd + Shift + Tab - pestaña anterior
    if ((e.ctrlKey || e.metaKey) && e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      switchTab(tabs[prevIndex].id);
    }

    // Ctrl/Cmd + T - nueva pestaña
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "t") {
      e.preventDefault();
      addNewTab();
    }

    // Ctrl/Cmd + W - cerrar pestaña actual
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "w") {
      e.preventDefault();
      if (tabs.length > 1) {
        closeTab(activeTabId);
      }
    }
  });
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

          tabs = data.tabs.map((t) => ({
            id: t.id,
            name: t.name || `Proyecto ${tabCounter++}`,
            shapes: t.shapes || [],
            counter: t.counter || 0,
          }));

          // recalcular contadores
          const maxId = tabs.length ? Math.max(...tabs.map((t) => t.id)) : -1;
          idCounter = maxId + 1;
          tabCounter = Math.max(tabCounter, tabs.length + 1);

          // Recrear pestañas en el DOM
          const tabsList = document.getElementById("tabsList");
          const workspaceContainer = document.querySelector(
            ".workspace-container"
          );

          tabs.forEach((tab) => {
            // Crear pestaña
            const tabElement = createTabElement(tab.id, tab.name);
            if (tabsList) tabsList.appendChild(tabElement);

            // Crear workspace
            if (workspaceContainer) {
              const workspace = document.createElement("div");
              workspace.className = "workspace-content hidden";
              workspace.id = `workspace-${tab.id}`;
              workspace.dataset.tabId = tab.id;
              workspaceContainer.appendChild(workspace);
            }
          });

          // Activar primera pestaña si existe
          if (tabs.length > 0) {
            switchTab(tabs[0].id);
          } else {
            // restaurar pestaña inicial si no hay ninguna
            initTabs();
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
  duplicate: duplicateTab,
  closeOthers: closeOtherTabs,
  getActive: getActiveTab,
  getActiveWorkspace: getActiveWorkspace,
  getAll: getAllTabs,
  saveState: saveCurrentTabState,
  loadState: loadTabState,
  exportAll: exportAllTabs,
  importAll: importAllTabs,
  setupKeyboardNav: setupKeyboardNavigation,
};

// Funciones globales para HTML
window.addNewTab = addNewTab;
window.closeTab = closeTab;
window.switchTab = switchTab;
