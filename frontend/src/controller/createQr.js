import config from "../config/config.json";

document.getElementById('qrForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    let id = getCookie("userId");
    console.log(`valor del id: ${id}`);

    const data = {
        id_usuario: id,
        url: formData.get('url'),
        nombre_qr: formData.get('nombre_qr'),
        color: formData.get('color'),
        tamano: formData.get('tamano')
    };

    try {
        const response = await fetch(`${config.host}/crear_qr`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        const resultMessage = document.getElementById('resultMessage');
        if (response.ok) {
            // Mostrar el QR generado
            const qrContainer = document.createElement('div');
            qrContainer.innerHTML = `<img src="${result.qrPath}" alt="QR Code" class="mx-auto my-4">`;
            resultMessage.parentNode.insertBefore(qrContainer, resultMessage.nextSibling);

            resultMessage.classList.remove('hidden', 'text-red-500');
            resultMessage.classList.add('text-green-500');
            resultMessage.innerText = 'QR generado exitosamente';

            Toastify({
                text: 'QR generado exitosamente',
                style: {
                    background: "green"
                },
                offset: {
                    x: 50,
                    y: 10
                },
            }).showToast();

            setTimeout(() => {
                location.href = "/Home";
            }, 2000);
        } else {
            throw new Error(result.message || 'Error desconocido');
        }
    } catch (error) {
        const resultMessage = document.getElementById('resultMessage');
        resultMessage.classList.remove('hidden', 'text-green-500');
        resultMessage.classList.add('text-red-500');
        resultMessage.innerText = `Error: ${error.message}`;
    }
});