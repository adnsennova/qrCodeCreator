// auth.js
function validateSession() {
    // Función para obtener el valor de una cookie
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Verificar si existen las cookies necesarias
    const userId = getCookie('userId');
    const nombre = getCookie('nombre');
    const correo = getCookie('correo');

    // Si falta alguna de las cookies requeridas
    if (!userId || !nombre || !correo) {
        console.log('Sesión no válida. Redirigiendo al inicio...');
        Toastify({
            text: "no has iniciado sesion",
            style: {
                background: "red"
            },
            offset: {
                x: 50,
                y: 10
            },
        }).showToast();
        setInterval(() => {
            window.location.href = '/';
           
        }, 1000);
        return false;
    }

    // Si todo está correcto, devolver los datos del usuario
    return {
        userId,
        nombre,
        correo
    };
}

// Ejemplo de uso en cualquier página que requiera autenticación:
document.addEventListener('DOMContentLoaded', () => {
    const session = validateSession();
    if (!session) return; // Si no hay sesión, la función ya habrá redirigido

    // Si hay sesión, puedes usar los datos
    console.log('Sesión válida');
    console.log('Usuario:', session.nombre);
    console.log('Correo:', session.correo);
});