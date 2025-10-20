// js/header.js
(function () {
    // Esperar DOM
    function onReady(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    onReady(function () {
        var btnBurger = document.getElementById('btnHeaderBurger');
        var userProfile = document.getElementById('userProfile');
        var btnUserMenu = document.getElementById('btnUserMenu');

        if (btnBurger) {
            btnBurger.addEventListener('click', function (e) {
                // alternar clase en body para que estilos/JS existentes puedan reaccionar
                document.body.classList.toggle('settings-open');

                // Si existe hook global para abrir panel de configuración, llámalo:
                if (typeof window.openSettingsPanel === 'function') {
                    window.openSettingsPanel();
                } else if (typeof window.toggleSettings === 'function') {
                    window.toggleSettings();
                }
                // Para depuración ligera (puedes quitarlo luego)
                // console.log('Burger clicked - settings-open:', document.body.classList.contains('settings-open'));
            });
        }

        // Abrir menú de usuario (ejemplo simple: alterna atributo aria-expanded)
        if (userProfile && btnUserMenu) {
            function toggleUserMenu() {
                var expanded = userProfile.getAttribute('aria-expanded') === 'true';
                userProfile.setAttribute('aria-expanded', (!expanded).toString());
                document.body.classList.toggle('user-menu-open');
                // Si necesitas mostrar un menú real, aquí puedes disparar tu lógica:
                // window.showUserMenu?.();
            }

            userProfile.addEventListener('click', function (e) {
                toggleUserMenu();
            });

            // Soporte para teclado (Enter / Space)
            userProfile.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleUserMenu();
                }
            });

            btnUserMenu.addEventListener('click', function (e) {
                e.stopPropagation();
                toggleUserMenu();
            });
        }
    });
})();
