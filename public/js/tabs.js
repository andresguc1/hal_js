// tabs.js — Gestión de pestañas/proyectos

let tabs = [];
let activeTabId = 0;
let tabCounter = 1; // contador humano para nombres
let idCounter = 1;  // contador para ids únicos
let contextMenu = null;

// Limpiar DOM y listeners para reiniciar
function resetTabs() {
  document.querySelectorAll('.tab').forEach(tab => tab.remove());
  document.querySelectorAll('.workspace-content').forEach(ws => ws.remove());

  tabs = [];
  activeTabId = 0;
  tabCounter = 1;
  idCounter = 1;
  closeContextMenu();

  document.removeEventListener('click', closeContextMenu);
  document.removeEventListener('contextmenu', preventDefaultTabContextMenu);
}

// Prevenir menú contextual nativo
function preventDefaultTabContextMenu(e) {
  if (e.target.closest('.tab')) e.preventDefault();
}

// Inicializar sistema de pestañas
function initTabs() {
  resetTabs();

  const initialTab = { id: 0, name: 'Proyecto 1', shapes: [], counter: 0 };
  tabs = [initialTab];
  activeTabId = 0;
  tabCounter = 2;
  idCounter = 1;

  const tabsList = document.getElementById('tabsList');
  const workspaceContainer = document.querySelector('.workspace-container');

  if (tabsList) tabsList.innerHTML = '';
  if (workspaceContainer) workspaceContainer.innerHTML = '';

  if (tabsList) tabsList.appendChild(createTabElement(initialTab.id, initialTab.name));
  if (workspaceContainer) {
    const workspace = document.createElement('div');
    workspace.className = 'workspace-content';
    workspace.id = `workspace-${initialTab.id}`;
    workspace.dataset.tabId = initialTab.id;
    workspaceContainer.appendChild(workspace);
  }

  setActiveTabClass(initialTab.id);

  document.addEventListener('click', closeContextMenu);
  document.addEventListener('contextmenu', preventDefaultTabContextMenu);
}

// Agregar nueva pestaña
function addNewTab() {
  const newTabId = idCounter++;
  const newTabName = `Proyecto ${tabCounter++}`;
  const newTab = { id: newTabId, name: newTabName, shapes: [], counter: 0 };

  tabs.push(newTab);

  const tabsList = document.getElementById('tabsList');
  const tabElement = createTabElement(newTabId, newTabName);

  if (tabsList) {
    tabsList.appendChild(tabElement);
    tabsList.scrollLeft = tabsList.scrollWidth;
  }

  const workspaceContainer = document.querySelector('.workspace-container');
  if (workspaceContainer) {
    const workspace = document.createElement('div');
    workspace.className = 'workspace-content hidden';
    workspace.id = `workspace-${newTabId}`;
    workspace.dataset.tabId = newTabId;
    workspaceContainer.appendChild(workspace);
  }


  switchTab(newTabId);

  if (typeof window.showNotification === 'function') {
    window.showNotification('Nueva pestaña creada');
  }
}

// Crear elemento de pestaña
function createTabElement(tabId, tabName) {
  const tabElement = document.createElement('div');
  tabElement.className = 'tab';
  tabElement.dataset.tabId = tabId;

  const tabNameSpan = document.createElement('span');
  tabNameSpan.className = 'tab-name';
  tabNameSpan.textContent = tabName;
  tabNameSpan.title = 'Click para cambiar, doble click para renombrar, click derecho para opciones';

  tabNameSpan.addEventListener('click', (e) => {
    e.stopPropagation();
    switchTab(tabId);
  });

  tabNameSpan.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    startEditingTabName(tabId, tabNameSpan);
  });

  tabElement.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showTabContextMenu(e, tabId);
  });

  const closeBtn = document.createElement('button');
  closeBtn.className = 'tab-close';
  closeBtn.type = 'button';
  closeBtn.textContent = '×';
  closeBtn.title = 'Cerrar pestaña';
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeTab(tabId);
  });

  tabElement.appendChild(tabNameSpan);
  tabElement.appendChild(closeBtn);

  return tabElement;
}

// Marcar pestaña activa
function setActiveTabClass(tabId) {
  document.querySelectorAll('.tab').forEach(tab => {
    if (parseInt(tab.dataset.tabId, 10) === tabId) {
      tab.classList.add('active');
      tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      tab.classList.remove('active');
    }
  });
}

// Editar nombre de pestaña
function startEditingTabName(tabId, tabNameElement) {
  const currentName = tabNameElement.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'tab-name-input';
  input.value = currentName;

  tabNameElement.replaceWith(input);
  input.focus();
  input.select();

  const saveEdit = () => {
    const newName = input.value.trim() || currentName;
    renameTab(tabId, newName);

    const newSpan = document.createElement('span');
    newSpan.className = 'tab-name';
    newSpan.textContent = newName;
    newSpan.title = 'Click para cambiar, doble click para renombrar, click derecho para opciones';
    newSpan.addEventListener('click', (e) => { e.stopPropagation(); switchTab(tabId); });
    newSpan.addEventListener('dblclick', (e) => { e.stopPropagation(); startEditingTabName(tabId, newSpan); });

    input.replaceWith(newSpan);
  };

  input.addEventListener('blur', saveEdit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveEdit();
    else if (e.key === 'Escape') {
      const newSpan = document.createElement('span');
      newSpan.className = 'tab-name';
      newSpan.textContent = currentName;
      newSpan.title = 'Click para cambiar, doble click para renombrar, click derecho para opciones';
      newSpan.addEventListener('click', (e) => { e.stopPropagation(); switchTab(tabId); });
      newSpan.addEventListener('dblclick', (e) => { e.stopPropagation(); startEditingTabName(tabId, newSpan); });
      input.replaceWith(newSpan);
    }
  });
}

// Menú contextual
function showTabContextMenu(event, tabId) {
  closeContextMenu();

  const menu = document.createElement('div');
  menu.className = 'tab-context-menu';
  menu.style.left = event.pageX + 'px';
  menu.style.top = event.pageY + 'px';

  const renameItem = document.createElement('div');
  renameItem.className = 'tab-context-menu-item';
  renameItem.innerHTML = '<span>✏️</span><span>Renombrar</span>';
  renameItem.addEventListener('click', () => {
    closeContextMenu();
    const tabNameElement = document.querySelector(`.tab[data-tab-id="${tabId}"] .tab-name`);
    if (tabNameElement) startEditingTabName(tabId, tabNameElement);
  });
  menu.appendChild(renameItem);

  const duplicateItem = document.createElement('div');
  duplicateItem.className = 'tab-context-menu-item';
  duplicateItem.innerHTML = '<span>📋</span><span>Duplicar</span>';
  duplicateItem.addEventListener('click', () => { closeContextMenu(); duplicateTab(tabId); });
  menu.appendChild(duplicateItem);

  const separator1 = document.createElement('div');
  separator1.className = 'tab-context-menu-separator';
  menu.appendChild(separator1);

  if (tabId !== activeTabId) {
    const switchItem = document.createElement('div');
    switchItem.className = 'tab-context-menu-item';
    switchItem.innerHTML = '<span>👉</span><span>Ir a esta pestaña</span>';
    switchItem.addEventListener('click', () => { closeContextMenu(); switchTab(tabId); });
    menu.appendChild(switchItem);
  }

  const separator2 = document.createElement('div');
  separator2.className = 'tab-context-menu-separator';
  menu.appendChild(separator2);

  if (tabs.length > 1) {
    const closeItem = document.createElement('div');
    closeItem.className = 'tab-context-menu-item danger';
    closeItem.innerHTML = '<span>✕</span><span>Cerrar pestaña</span>';
    closeItem.addEventListener('click', () => { closeContextMenu(); closeTab(tabId); });
    menu.appendChild(closeItem);

    const closeOthersItem = document.createElement('div');
    closeOthersItem.className = 'tab-context-menu-item danger';
    closeOthersItem.innerHTML = '<span>✕✕</span><span>Cerrar otras</span>';
    closeOthersItem.addEventListener('click', () => { closeContextMenu(); closeOtherTabs(tabId); });
    menu.appendChild(closeOthersItem);
  }

  document.body.appendChild(menu);
  contextMenu = menu;

  const menuRect = menu.getBoundingClientRect();
  if (menuRect.right > window.innerWidth) menu.style.left = event.pageX - menuRect.width + 'px';
  if (menuRect.bottom > window.innerHeight) menu.style.top = event.pageY - menuRect.height + 'px';
}

function closeContextMenu() {
  if (contextMenu) { contextMenu.remove(); contextMenu = null; }
}

// Cerrar pestaña
function closeTab(tabId) {
  if (tabs.length === 1) {
    if (typeof window.showNotification === 'function') window.showNotification('Debe existir al menos una pestaña', true);
    return;
  }

  const tab = tabs.find(t => t.id === tabId);
  if (!tab) return;

  const hasContent = tab.shapes?.length > 0;
  if (!confirm(hasContent ? '¿Cerrar esta pestaña? Se perderán los cambios no guardados.' : '¿Cerrar esta pestaña?')) return;

  const currentIndex = tabs.findIndex(t => t.id === tabId);
  tabs = tabs.filter(t => t.id !== tabId);

  const tabElement = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
  if (tabElement) tabElement.remove();

  const workspace = document.getElementById(`workspace-${tabId}`);
  if (workspace) workspace.remove();

  if (activeTabId === tabId) {
    const nextTab = tabs[currentIndex] || tabs[currentIndex - 1] || tabs[0];
    if (nextTab) switchTab(nextTab.id);
  }

  if (typeof window.showNotification === 'function') window.showNotification('Pestaña cerrada');
}

// Cerrar otras pestañas
function closeOtherTabs(keepTabId) {
  if (!confirm('¿Cerrar todas las demás pestañas? Se perderán los cambios no guardados.')) return;

  tabs.filter(t => t.id !== keepTabId).forEach(tab => {
    const tabElement = document.querySelector(`.tab[data-tab-id="${tab.id}"]`);
    if (tabElement) tabElement.remove();
    const ws = document.getElementById(`workspace-${tab.id}`);
    if (ws) ws.remove();
  });

  tabs = tabs.filter(t => t.id === keepTabId);
  switchTab(keepTabId);

  if (typeof window.showNotification === 'function') window.showNotification('Pestañas cerradas');
}

// Duplicar pestaña
function duplicateTab(tabId) {
  const originalTab = tabs.find(t => t.id === tabId);
  if (!originalTab) return;

  const newTabId = idCounter++;
  const newTab = {
    id: newTabId,
    name: originalTab.name + ' (copia)',
    shapes: JSON.parse(JSON.stringify(originalTab.shapes || [])),
    counter: originalTab.counter || 0
  };

  const insertIndex = tabs.findIndex(t => t.id === tabId) + 1;
  tabs.splice(insertIndex, 0, newTab);

  const tabsList = document.getElementById('tabsList');
  const tabElement = createTabElement(newTabId, newTab.name);

  const originalElement = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
  if (originalElement && originalElement.nextSibling && tabsList) {
    tabsList.insertBefore(tabElement, originalElement.nextSibling);
  } else if (tabsList) {
    tabsList.appendChild(tabElement);
  }

  const workspaceContainer = document.querySelector('.workspace-container');
  if (workspaceContainer) {
    const workspace = document.createElement('div');
    workspace.className = 'workspace-content hidden';
    workspace.id = `workspace-${newTabId}`;
    workspace.dataset.tabId = newTabId;
    workspaceContainer.appendChild(workspace);
  }

  switchTab(newTabId);

  if (typeof window.showNotification === 'function') window.showNotification('Pestaña duplicada');
}

// Renombrar pestaña
function renameTab(tabId, newName) {
  const tab = tabs.find(t => t.id === tabId);
  if (tab) {
    tab.name = newName;
    const tabNameElement = document.querySelector(`.tab[data-tab-id="${tabId}"] .tab-name`);
    if (tabNameElement) tabNameElement.textContent = newName;
    if (typeof window.showNotification === 'function') window.showNotification('Pestaña renombrada');
  }
}

// Guardar estado de la pestaña actual
function saveCurrentTabState() {
  const currentTab = tabs.find(t => t.id === activeTabId);
  if (currentTab && window.app) {
    currentTab.shapes = JSON.parse(JSON.stringify(window.app.actionsShapes || []));
    currentTab.counter = window.app.actionsCounter || 0;
  }
}

// Cargar estado de una pestaña
function loadTabState(tabId) {
  const tab = tabs.find(t => t.id === tabId);
  if (!tab || !window.app) return;

  const workspace = document.getElementById(`workspace-${tabId}`);
  if (workspace) workspace.innerHTML = '';

  window.app.actionsShapes = JSON.parse(JSON.stringify(tab.shapes || []));
  window.app.actionsCounter = tab.counter || 0;

  (tab.shapes || []).forEach(shapeData => {
    if (typeof window.app.recreateShapeInWorkspace === 'function') {
      window.app.recreateShapeInWorkspace(shapeData, tabId);
    }
  });
}

// Obtener pestaña activa
function getActiveTab() {
  return tabs.find(t => t.id === activeTabId);
}

// Obtener workspace activo
function getActiveWorkspace() {
  const activeTab = tabs.find(t => t.id === activeTabId);
  if (!activeTab) return null;
  return document.getElementById(`workspace-${activeTab.id}`) || document.querySelector('.workspace-content:not(.hidden)');
}

// Obtener todas las pestañas
function getAllTabs() { return tabs; }

// Exportar todas las pestañas
function exportAllTabs() {
  saveCurrentTabState();
  const dataStr = JSON.stringify({ version: '1.0', timestamp: Date.now(), tabs }, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'proyecto_completo_' + Date.now() + '.json';
  link.click();
  URL.revokeObjectURL(url);

  if (typeof window.showNotification === 'function') window.showNotification('Proyecto completo exportado');
}

// Importar todas las pestañas
function importAllTabs(callback) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const data = JSON.parse(event.target.result);
        if (data.tabs && Array.isArray(data.tabs)) {
          document.querySelectorAll('.tab').forEach(tab => tab.remove());
          document.querySelectorAll('.workspace-content').forEach(ws => ws.remove());

          tabs = data.tabs.map(t => ({
            id: t.id,
            name: t.name || `Proyecto ${tabCounter++}`,
            shapes: t.shapes || [],
            counter: t.counter || 0
          }));

          const maxId = tabs.length ? Math.max(...tabs.map(t => t.id)) : -1;
          idCounter = maxId + 1;
          tabCounter = Math.max(tabCounter, tabs.length + 1);

          const tabsList = document.getElementById('tabsList');
          const workspaceContainer = document.querySelector('.workspace-container');

          tabs.forEach(tab => {
            if (tabsList) tabsList.appendChild(createTabElement(tab.id, tab.name));
            if (workspaceContainer) {
              const ws = document.createElement('div');
              ws.className = 'workspace-content hidden';
              ws.id = `workspace-${tab.id}`;
              ws.dataset.tabId = tab.id;
              workspaceContainer.appendChild(ws);
            }
          });

          if (tabs.length > 0) switchTab(tabs[0].id);
          else initTabs();

          if (typeof window.showNotification === 'function') window.showNotification('Proyecto completo importado');
          if (callback) callback(null);
        } else throw new Error('Formato de archivo inválido');
      } catch (err) {
        if (typeof window.showNotification === 'function') window.showNotification('Error al cargar el proyecto', true);
        if (callback) callback(err);
      }
    };
    reader.readAsText(file);
  };

  input.click();
}

// Cambiar a otra pestaña (switch)
function switchTab(tabId) {
  tabId = Number(tabId);
  if (Number.isNaN(tabId)) return;

  // Si la pestaña ya es la activa, solo asegurar UI y return
  if (tabId === activeTabId) {
    setActiveTabClass(tabId);
    return;
  }

  // Guardar estado de la pestaña actual
  try {
    saveCurrentTabState();
  } catch (e) {
    // no critico: continuar
    console.warn('Error guardando estado antes de cambiar de pestaña:', e);
  }

  // Asegurarse de que la pestaña destino exista en el modelo
  const targetTab = tabs.find(t => t.id === tabId);
  if (!targetTab) {
    console.warn('Intentando cambiar a una pestaña inexistente:', tabId);
    return;
  }

  // Actualizar id activo
  activeTabId = tabId;

  // Actualizar clases visuales en el listado de pestañas
  setActiveTabClass(tabId);

  // Asegurar existencia del workspace en DOM (crear si hace falta)
  const workspaceContainer = document.querySelector('.workspace-container');
  let workspace = document.getElementById(`workspace-${tabId}`);
  if (!workspace && workspaceContainer) {
    workspace = document.createElement('div');
    workspace.className = 'workspace-content hidden';
    workspace.id = `workspace-${tabId}`;
    workspace.dataset.tabId = tabId;
    workspaceContainer.appendChild(workspace);
  }

  // Mostrar/ocultar workspaces
  document.querySelectorAll('.workspace-content').forEach(ws => {
    const wsTabId = parseInt(ws.dataset.tabId, 10);
    if (wsTabId === tabId) {
      ws.classList.remove('hidden');
    } else {
      ws.classList.add('hidden');
    }
  });

  // Cargar estado de la pestaña (recrea shapes en su workspace)
  try {
    loadTabState(tabId);
  } catch (e) {
    console.warn('Error al cargar estado de la pestaña:', e);
  }

  // Cerrar panel de configuración si está abierto
  if (window.configPanel && typeof window.configPanel.close === 'function') {
    try { window.configPanel.close(); } catch (e) { }
  }

  // Notificar visualmente (opcional)
  if (typeof window.showNotification === 'function') {
    window.showNotification(`Cambiada a pestaña: ${targetTab.name}`);
  }
}

// Navegación con teclado
function setupKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const idx = tabs.findIndex(t => t.id === activeTabId);
      switchTab(tabs[(idx + 1) % tabs.length].id);
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      const idx = tabs.findIndex(t => t.id === activeTabId);
      switchTab(tabs[(idx - 1 + tabs.length) % tabs.length].id);
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
      e.preventDefault();
      addNewTab();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
      e.preventDefault();
      if (tabs.length > 1) closeTab(activeTabId);
    }
  });
}

// Exportar funciones
window.tabs = {
  init: initTabs,
  reset: resetTabs,
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