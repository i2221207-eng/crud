// Script de redirección de autenticación
// Este script se ejecuta en todas las páginas para manejar las redirecciones

(function() {
    'use strict';
    
    // Función para verificar si el usuario está autenticado
    function isAuthenticated() {
        const token = localStorage.getItem('token');
        return token !== null && token !== undefined && token !== '';
    }
    
    // Función para obtener la ruta actual
    function getCurrentPath() {
        return window.location.pathname;
    }
    
    // Función para redirigir según el estado de autenticación
    function handleAuthRedirection() {
        const currentPath = getCurrentPath();
        const isAuth = isAuthenticated();
        
        // Si está en la página de autenticación y ya está autenticado
        if (currentPath === '/auth' && isAuth) {
            console.log('Usuario ya autenticado, redirigiendo al CRUD...');
            window.location.href = '/';
            return;
        }
        
        // Si está en la página principal y NO está autenticado
        if (currentPath === '/' && !isAuth) {
            console.log('Usuario no autenticado, redirigiendo a autenticación...');
            window.location.href = '/auth';
            return;
        }
        
        // Si está autenticado en la página principal, mostrar información del usuario
        if (currentPath === '/' && isAuth) {
            const username = localStorage.getItem('username');
            if (username) {
                // Esperar a que el DOM esté listo
                document.addEventListener('DOMContentLoaded', function() {
                    const currentUserElement = document.getElementById('currentUser');
                    const welcomeUserElement = document.getElementById('welcomeUser');
                    
                    if (currentUserElement) {
                        currentUserElement.textContent = username;
                    }
                    if (welcomeUserElement) {
                        welcomeUserElement.textContent = username;
                    }
                });
            }
        }
    }
    
    // Función para validar token (opcional - para verificaciones más estrictas)
    async function validateToken() {
        const token = localStorage.getItem('token');
        if (!token) return false;
        
        try {
            // Hacer una petición simple para verificar si el token es válido
            const response = await fetch('/api/categorias', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Si el token es inválido, limpiar localStorage
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                return false;
            }
            
            return response.ok;
        } catch (error) {
            console.error('Error validando token:', error);
            return true; // En caso de error de red, asumir que el token es válido
        }
    }
    
    // Función global para cerrar sesión
    window.cerrarSesion = function() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        
        // Mostrar mensaje si existe la función
        if (typeof mostrarAlerta === 'function') {
            mostrarAlerta('Sesión cerrada correctamente', 'info');
        }
        
        // Redirigir a autenticación
        setTimeout(() => {
            window.location.href = '/auth';
        }, 1000);
    };
    
    // Ejecutar redirección cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleAuthRedirection);
    } else {
        handleAuthRedirection();
    }
    
    // También ejecutar inmediatamente para casos donde el DOM ya está listo
    handleAuthRedirection();
    
})();