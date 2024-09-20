import config from "../config/config.json";


document.addEventListener("DOMContentLoaded", () => {

    console.log('se carga ');

    document.querySelector("#form_register").addEventListener("submit", async (e) => {
        e.preventDefault()
        const form = document.querySelector("#form_register");
        const formData = new FormData(form);

        const url = config.host;

        const formDataJson = {};
        formData.forEach((value, key) => {
            formDataJson[key] = value;
        });
        //    realizar la peticion al servidor 
        try {
            const response = await fetch(`${url}/crear_usuario`, {
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
                        x: 50, // horizontal axis - can be a number or a string indicating unity. eg: '2em'
                        y: 10 // vertical axis - can be a number or a string indicating unity. eg: '2em'
                    },
                }).showToast();
            } else {
                Toastify({
                    text: result.message,
                    style: {
                        background: "green"
                    },
                    offset: {
                        x: 50, // horizontal axis - can be a number or a string indicating unity. eg: '2em'
                        y: 10 // vertical axis - can be a number or a string indicating unity. eg: '2em'
                    },
                }).showToast();
            }
        } catch (error) {
            console.error(error);

        }
    })
})