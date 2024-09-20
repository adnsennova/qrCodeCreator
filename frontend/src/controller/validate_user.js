import config from "../config/config.json";


document.addEventListener("DOMContentLoaded", () => {

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    document.querySelector("#form_login").addEventListener("submit", async (e) => {
        e.preventDefault()
        const form = document.querySelector("#form_login");
        const formData = new FormData(form);

        const url = config.host;

        const formDataJson = {};
        formData.forEach((value, key) => {
            formDataJson[key] = value;
        });
        //    realizar la peticion al servidor 
        try {
            const response = await fetch(`${url}/validar_usuario`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(formDataJson)
            });
            const result = await response.json();
            console.log(result);

            if (result.error) {
                Toastify({
                    text: result.error.message,
                    style: {
                        background: "red"
                    },
                    offset: {
                        x: 50,
                        y: 10
                    },
                }).showToast();
            } else {
                // Establecer cookies
                document.cookie = `userId=${result.userId}; path=/; max-age=3600`; // 1 hora
                document.cookie = `nombre=${result.nombre}; path=/; max-age=3600`;
                document.cookie = `correo=${result.correo}; path=/; max-age=3600`;

                // Log de las nuevas cookies
                console.log('Cookies establecidas:');
                console.log('userId:', getCookie("userId"));
                console.log('nombre:', getCookie("nombre"));
                console.log('correo:', getCookie("correo"));

                Toastify({
                    text: result.message,
                    style: {
                        background: "green"
                    },
                    offset: {
                        x: 50,
                        y: 10
                    },
                }).showToast();
            }


        } catch (error) {
            console.error(error);

        }
    })
})