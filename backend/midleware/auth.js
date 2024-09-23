const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true
});

// Ejemplo de uso:
// api.get('/ruta').then(response => console.log(response.data));

module.exports = api;