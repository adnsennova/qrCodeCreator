// Asegúrate de tener estas importaciones en el head de tu documento
// <script src="https://cdn.jsdelivr.net/npm/qrcode.js@1.0.0/qrcode.min.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/toastify-js"></script>
// <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css">

import QRCode from 'qrcode';

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

    try {
        const response = await fetch(`http://localhost:3000/api/qrs/${id}`);
        const result = await response.json();
        console.log(result.qrs);
        
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
                            <button onclick="editQR(${qr.id})" 
                                    class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                                Editar
                            </button>
                            <button onclick="deleteQR(${qr.id})" 
                                    class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                                Eliminar
                            </button>
                        </div>
                    </div>
                `;

                qrContainer.appendChild(qrCard);

                // Generar el QR
                new QRCode(document.getElementById(`qr_${qr.id}`), {
                    text: qr.url,
                    width: 128,
                    height: 128,
                    colorDark: qr.color,
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
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
});

// Función helper para mostrar toasts
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

// Funciones para editar y eliminar QRs (implementar según necesidades)
function editQR(id) {
    console.log('Editar QR:', id);
    // Implementar lógica de edición
}

function deleteQR(id) {
    console.log('Eliminar QR:', id);
    // Implementar lógica de eliminación
}