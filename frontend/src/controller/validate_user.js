import config from "../config/config.json";

document.addEventListener("DOMContentLoaded", () => {
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            const cookieValue = parts.pop().split(';').shift();
            return cookieValue || null;
        }
        return null;
    }

    document.querySelector("#form_login").addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = document.querySelector("#form_login");
        const formData = new FormData(form);

        const url = config.host;

        const formDataJson = {};
        formData.forEach((value, key) => {
            formDataJson[key] = value;
        });

        try {
            const response = await fetch(`${url}/validar_usuario`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formDataJson)
            });

            const result = await response.json();
            
            // Verificar primero si la respuesta no es exitosa
            if (!response.ok) {
                Toastify({
                    text: result.message,
                    style: {
                        background: "red"
                    },
                    offset: {
                        x: 50,
                        y: 10
                    },
                }).showToast();
                return; // Detener la ejecución aquí
            }

            // Si llegamos aquí, significa que la respuesta fue exitosa
            // Establecer cookies solo si tenemos todos los datos necesarios
            if (result.userId && result.nombre && result.correo) {
                document.cookie = `userId=${result.userId}; path=/; max-age=3600`;
                document.cookie = `nombre=${result.nombre}; path=/; max-age=3600`;
                document.cookie = `correo=${result.correo}; path=/; max-age=3600`;

                // Verificar que las cookies se establecieron correctamente
                const userId = getCookie("userId");
                const nombre = getCookie("nombre");
                const correo = getCookie("correo");

                if (userId && nombre && correo) {
                    Toastify({
                        text: "Inicio de sesión exitoso",
                        style: {
                            background: "green"
                        },
                        offset: {
                            x: 50,
                            y: 10
                        },
                    }).showToast();

                    setTimeout(() => {
                        window.location.href = "/Home";
                    }, 2000);
                } else {
                    throw new Error("Error al establecer las cookies");
                }
            } else {
                throw new Error("Datos de usuario incompletos");
            }
        } catch (error) {
            console.error('Error:', error);
            Toastify({
                text: "Error en el inicio de sesión",
                style: {
                    background: "red"
                },
                offset: {
                    x: 50,
                    y: 10
                },
            }).showToast();
        }
    });
});