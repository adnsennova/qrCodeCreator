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

let currentQRData = null;
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
                console.log(result);

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
                        <div class="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
    <div class="p-6 h-[500px] flex flex-col"> <!-- Altura fija para todas las tarjetas -->
        <!-- Encabezado con título y color -->
        <div class="flex justify-between items-start mb-4">
            <div class="flex-1 min-w-0 mr-4">
                <h3 class="text-xl font-semibold text-gray-800 truncate">${qr.nombre}</h3>
                <a href="${qr.url}" target="_blank" 
                   class="text-sm text-blue-600 hover:text-blue-800 break-all">
                    ${qr.url}
                </a>
            </div>
            <div class="w-6 h-6 rounded-full flex-shrink-0" 
                 style="background-color: ${qr.color}">
            </div>
        </div>
        
        <!-- Contenedor del QR con tamaño fijo y centrado -->
        <div class="flex-grow flex items-center justify-center">
            <div class="w-full min-w-[200px] max-w-[300px] aspect-square">
                <div class="min-w-full min-h-full flex items-center justify-center bg-white" id="qr_${qr.id}"></div>
            </div>
        </div>
        
        <!-- Botones de acción -->
        <div class="flex justify-end space-x-2 mt-4">
            <button class="edit-btn px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" data-id="${qr.id}">
                Editar
            </button>
            <button class="delete-btn px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors" data-id="${qr.id}">
                Eliminar
            </button>
            <button class="download-btn px-4 py-2 bg-green-200 text-gray-800 rounded hover:bg-green-600 hover:text-white transition-colors" data-id="${qr.id}">
                Descargar
            </button>
        </div>
    </div>
</div>    
                    `;

                    qrContainer.appendChild(qrCard);

                    // Generación de QR
                    const qrElement = document.getElementById(`qr_${qr.id}`);
                    new QRCode(qrElement, {
                        text: qr.url,
                        width: qr.tamano,
                        height: qr.tamano,
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
                        downloadQRCode(qrElement, qr.nombre, qr.tamano);
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
function downloadQRCode(qrElement, nombre, tamano) {
    console.log(qrElement);

    // Crea un canvas temporal
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Obtén la imagen del QR
    const qrCodeImage = qrElement.querySelector('img');

    if (qrCodeImage) {
        const qrSize = parseInt(tamano);
        const padding = 20; // Margen alrededor del QR

        // Ajusta el tamaño del canvas con el padding
        canvas.width = qrSize + padding * 2;
        canvas.height = qrSize + padding * 2;

        // Centra el QR en el canvas
        const xOffset = (canvas.width - qrSize) / 2;
        const yOffset = (canvas.height - qrSize) / 2;

        // Dibuja la imagen del QR centrada en el canvas
        ctx.drawImage(qrCodeImage, xOffset, yOffset, qrSize, qrSize);

        // Convierte el canvas a un formato de imagen
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${nombre}.png`; // Nombre del archivo
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png');
    } else {
        console.error('No se encontró la imagen del QR para descargar.');
    }
}


// Función para abrir el modal
function openEditModal(qrId) {
    const modal = document.getElementById('editModal');
    const form = document.getElementById('editQRForm');
    
    // Obtener los datos actuales del QR
    fetch(`http://localhost:3000/api/qrs/${qrId}`)
        .then(response => response.json())
        .then(data => {
            currentQRData = data.qr;
            
            // Llenar el formulario con los datos actuales
            document.getElementById('qrId').value = qrId;
            document.getElementById('nombre_qr').value = currentQRData.nombre;
            document.getElementById('url').value = currentQRData.url;
            document.getElementById('color').value = currentQRData.color;
            document.getElementById('tamano').value = currentQRData.tamano;
            
            // Mostrar el modal
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        })
        .catch(error => {
            console.error('Error al obtener datos del QR:', error);
            showToast('Error al cargar los datos del QR', 'error');
        });
}

// Función para cerrar el modal
function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    currentQRData = null;
}

// Función para manejar la actualización del QR
async function handleEditSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const qrId = formData.get('qrId');
    
    const updateData = {
        id_usuario: getCookie("userId"),
        url: formData.get('url'),
        nombre_qr: formData.get('nombre_qr'),
        color: formData.get('color'),
        tamano: parseInt(formData.get('tamano'))
    };

    try {
        const response = await fetch(`http://localhost:3000/api/edit-qr/${qrId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        const result = await response.json();

        if (response.ok) {
            showToast('QR actualizado exitosamente', 'success');
            closeEditModal();
            // Recargar la página para mostrar los cambios
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            throw new Error(result.message || 'Error al actualizar el QR');
        }
    } catch (error) {
        console.error('Error al actualizar el QR:', error);
        showToast('Error al actualizar el QR', 'error');
    }
}

// Agregar los event listeners necesarios
document.addEventListener('DOMContentLoaded', function() {
    // Event listener para el botón de editar en las tarjetas
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', () => {
            const qrId = button.getAttribute('data-id');
            openEditModal(qrId);
        });
    });

    // Event listeners para el modal
    document.getElementById('closeModal').addEventListener('click', closeEditModal);
    document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
    document.getElementById('editQRForm').addEventListener('submit', handleEditSubmit);

    // Cerrar el modal si se hace clic fuera de él
    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeEditModal();
        }
    });
});

document.querySelector("#close_sec").addEventListener('click', cerrar_sesion)
function cerrar_sesion() {
    // Obtener todas las cookies
    const cookies = document.cookie.split(";");

    // Iterar sobre todas las cookies y eliminarlas
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

        // Borrar la cookie estableciendo la fecha de expiración en una pasada
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }

    // Aquí puedes añadir lógica adicional, como redirigir al usuario o mostrar un mensaje de cierre de sesión
    console.log("Todas las cookies han sido eliminadas.");

    showToast("cerrando sesion", "")
    setInterval(() => {
        location.href = "/"
    }, 2000);

}
