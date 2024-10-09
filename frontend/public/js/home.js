function showToast(message, type = 'success') {
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
            background: type === 'success' ? "green" : "red"
        },
        offset: {
            x: 50,
            y: 10
        },
    }).showToast();
}

document.addEventListener("DOMContentLoaded", async function () {
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    let id = getCookie("userId");
    if (!id) {
        console.error('No se encontró el ID del usuario.');
        showToast('No se encontró el ID del usuario.', 'error');
        return;
    }

    async function load_qrs() {
        try {
            const response = await fetch(`http://localhost:3000/api/qrs/${id}`);
            const result = await response.json();

            if (response.ok) {
                const qrContainer = document.getElementById('qr-container');

                if (result.qrs.length === 0) {
                    qrContainer.innerHTML = `
                        <div class="col-span-full text-center p-8 bg-slate-600 rounded-lg">
                            <p class="text-white text-lg">No tienes códigos QR creados aún.</p>
                        </div>
                    `;
                    return;
                }

                result.qrs.forEach(qr => {
                    const qrCard = document.createElement("div");
                    qrCard.classList.add(
                        "bg-white",
                        "rounded-lg",
                        "shadow-lg",
                        "overflow-hidden",
                        "transition-transform",
                        "duration-300",
                        "hover:transform",
                        "hover:scale-105"
                    );

                    qrCard.innerHTML = `
                        <div class="p-6">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <h3 class="text-xl font-semibold text-gray-800">${qr.nombre}</h3>
                                    <a href="${qr.url}" target="_blank" 
                                       class="text-sm text-blue-600 hover:text-blue-800 break-all">
                                        ${qr.url}
                                    </a>
                                </div>
                                <div class="w-6 h-6 rounded-full" 
                                     style="background-color: ${qr.color}">
                                </div>
                            </div>
                            
                            <div class="flex justify-center my-4" id="qr_${qr.id}"></div>
                            
                            <div class="flex justify-end space-x-2 mt-4">
                                <button class="edit-btn px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" data-id="${qr.id}">
                                    Editar
                                </button>
                                <button class="delete-btn px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors" data-id="${qr.id}">
                                    Eliminar
                                </button>
                                <button class="download-btn bg-green-200 px-4 py-2 rounded hover:bg-green-600 transition-colors" data-id="${qr.id}">
                                    Descargar
                                </button>
                            </div>
                        </div>
                    `;

                    qrContainer.appendChild(qrCard);

                    // Generación de QR
                    const qrElement = document.getElementById(`qr_${qr.id}`);
                    new QRCode(qrElement, {
                        text: qr.url,
                        width: 128,
                        height: 128,
                        colorDark: qr.color,
                        colorLight: "#ffffff"
                    });

                    // Agregar escuchadores de eventos para los botones
                    const deleteButton = qrCard.querySelector('.delete-btn');
                    deleteButton.addEventListener('click', () => {
                        const qrId = qr.id; // Obtén el ID directamente del objeto qr
                        deleteQR(qrId);
                    });

                    // Agregar escuchador para el botón de descarga
                    const downloadButton = qrCard.querySelector('.download-btn');
                    downloadButton.addEventListener('click', () => {
                        downloadQRCode(qrElement);
                    });
                });

                showToast('QRs cargados exitosamente', 'success');
            } else {
                throw new Error(result.message || 'Error desconocido al cargar los QRs');
            }
        } catch (error) {
            console.error('Error al obtener los QRs:', error);
            showToast(`Error al cargar los QRs: ${error.message}`, 'error');
        }
    }

    load_qrs();
});

// Función para eliminar el QR
async function deleteQR(id) {
    console.log('Eliminar QR:', id);
    try {
        const response = await fetch(`http://localhost:3000/api/qrs/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            showToast(result.message, 'success');
            // Aquí puedes eliminar el elemento del DOM si es necesario
            setInterval(() => {
                location.reload();
            }, 2000);
            // document.getElementById(`qr_${id}`).remove(); // Asegúrate de eliminar el contenedor correcto
        } else {
            showToast(result.message || 'Error al eliminar el QR', 'error');
        }
    } catch (error) {
        console.error('Error al eliminar el QR:', error);
        showToast('Error al eliminar el QR', 'error');
    }
}

// Función para descargar el QR
function downloadQRCode(qrElement) {
    // Crea un canvas temporal
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Obtén la imagen del QR
    const qrCodeImage = qrElement.querySelector('img');

    if (qrCodeImage) {
        // Configura el tamaño del canvas
        canvas.width = 128;
        canvas.height = 128;

        // Dibuja la imagen en el canvas
        ctx.drawImage(qrCodeImage, 0, 0, 128, 128);

        // Convierte el canvas a un formato de imagen
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'codigo_qr.png'; // Nombre del archivo
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png');
    } else {
        console.error('No se encontró la imagen del QR para descargar.');
    }
}

// Mueve las funciones `editQR` y `deleteQR` fuera del DOMContentLoaded
function editQR(id) {
    console.log('Editar QR:', id);
    // Implementar lógica de edición
}
