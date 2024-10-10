function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const cookieValue = parts.pop().split(';').shift();
        return cookieValue || null;
    }
    return null;
}
document.addEventListener('DOMContentLoaded', () => {
    let id = getCookie("userId");
    console.log(`id en home ${id}`);

    fetch(`http://localhost:3000/api/traer-usuario/${id}`, {
        method: "GET"
    })
        .then(r => r.json())
        .then(data => {
            console.log(data);
            document.querySelector("#name_profile").textContent = data.data.nombre
            document.querySelector("#email_profile").textContent = data.data.correo

        })
})