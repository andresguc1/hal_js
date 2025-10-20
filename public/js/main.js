// js/main.js — punto de entrada (módulo ES)

// Importar módulos que inicializan/definen globals por efecto lateral
import { initApp, setupDeleteBlockListener } from './init.js';
import { AppState } from './appState.js';
import './tabs.js';            // define window.tabs
import './connections.js';     // define window.Connections
import './drag-drop.js';       // define window.DragDrop
import './storage.js';         // define window.storage
import './tool-actions.js';    // define window.toolActions
import './config-panel.js';    // define window.configPanel

// Exponer módulos globalmente usando lo que ya existe en window
window.tabs = window.tabs ?? null;
window.connections = window.Connections ?? window.connections ?? null;
window.dragDrop = window.DragDrop ?? window.dragDrop ?? null;
window.storage = window.storage ?? null;
window.toolActions = window.toolActions ?? null;
window.configPanel = window.ConfigPanel ?? window.configPanel ?? null;

// Exponer AppState y helpers globales
window.app = AppState;
window.updateShapeConfig = (property, value) => AppState.updateShapeConfig(property, value);
window.deleteCurrentShape = () => AppState.deleteCurrentShape();

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar pestañas si está disponible
    if (window.tabs?.init) window.tabs.init();

    // Inicializar conexiones y app principal después de un pequeño delay
    setTimeout(() => {
        if (window.connections?.init) {
            window.connections.init();
            console.log('✅ Sistema de conexiones inicializado');
        }
        initApp();
    }, 200);
});
