// js/storage.js — gestión de localStorage

const STORAGE_KEYS = {
  ACTIONS_SHAPES: 'haljs_actions_shapes',
  ACTIONS_COUNTER: 'haljs_actions_counter',
};

function saveToLocalStorage(shapes, counter) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIONS_SHAPES, JSON.stringify(shapes));
    localStorage.setItem(STORAGE_KEYS.ACTIONS_COUNTER, counter);
  } catch (error) {
    console.error('Error guardando en localStorage:', error);
    if (typeof window.showNotification === 'function') {
      window.showNotification('Error al guardar los datos', true);
    }
  }
}

function loadFromLocalStorage() {
  try {
    const savedShapes = localStorage.getItem(STORAGE_KEYS.ACTIONS_SHAPES);
    const savedCounter = localStorage.getItem(STORAGE_KEYS.ACTIONS_COUNTER);
    return {
      shapes: savedShapes ? JSON.parse(savedShapes) : [],
      counter: savedCounter ? parseInt(savedCounter) : 0,
    };
  } catch (error) {
    console.error('Error cargando desde localStorage:', error);
    return { shapes: [], counter: 0 };
  }
}

function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACTIONS_SHAPES);
    localStorage.removeItem(STORAGE_KEYS.ACTIONS_COUNTER);
  } catch (error) {
    console.error('Error limpiando localStorage:', error);
  }
}

function exportToJSON(shapes) {
  const dataStr = JSON.stringify(shapes, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'diagrama_acciones_' + Date.now() + '.json';
  link.click();
  URL.revokeObjectURL(url);
}

function importFromJSON(callback) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const loadedShapes = JSON.parse(event.target.result);
        callback(loadedShapes, null);
      } catch (error) {
        callback(null, error);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// Exponer API global
window.storage = {
  save: saveToLocalStorage,
  load: loadFromLocalStorage,
  clear: clearLocalStorage,
  exportToJSON,
  importFromJSON,
};

console.log('📦 storage.js cargado');
