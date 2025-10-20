import { AppState } from './appState.js';

export function initApp() {
    console.log('Inicializando aplicación...');

    window.dragDrop?.initGlobalListeners?.();
    window.dragDrop?.makeDroppable?.();
    window.toolActions?.setupListeners?.();

    document.getElementById('btnClear')?.addEventListener('click', () => AppState.clearActionsFrame());
    document.getElementById('btnSave')?.addEventListener('click', () => AppState.saveCanvas());
    document.getElementById('btnExport')?.addEventListener('click', () => AppState.exportCanvas());
    document.getElementById('btnLoad')?.addEventListener('click', () => AppState.loadCanvas());
    document.getElementById('btnExecute')?.addEventListener('click', () => AppState.executeWorkflow());

    window.tabs?.setupKeyboardNav?.();

    AppState.loadState();

    console.log('Aplicación iniciada correctamente');

    setupDeleteBlockListener();
}

export function setupDeleteBlockListener() {
    let selectedBlock = null;

    document.addEventListener('click', (e) => {
        const block = e.target.closest('.action-block');
        document.querySelectorAll('.action-block').forEach((b) => b.classList.remove('selected'));
        if (block) {
            block.classList.add('selected');
            selectedBlock = block;
        } else {
            selectedBlock = null;
        }
    });

    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlock) {
            const blockId = selectedBlock.dataset.id;
            window.connections?.removeForBlock?.(blockId);
            AppState.actionsShapes = AppState.actionsShapes.filter((s) => s.id != blockId);
            selectedBlock.remove();
            selectedBlock = null;
            AppState.saveState();
            if (typeof window.showNotification === 'function') window.showNotification('Bloque eliminado');
        }
    });
}
