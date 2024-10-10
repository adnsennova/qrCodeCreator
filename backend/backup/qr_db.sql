-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 10-10-2024 a las 18:23:54
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `qr_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `qrs`
--

CREATE TABLE `qrs` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `color` varchar(40) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `tamano` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `qrs`
--

INSERT INTO `qrs` (`id`, `nombre`, `url`, `color`, `id_usuario`, `tamano`) VALUES
(1, 'hola', 'https://developers.google.com/chart?hl=es-419', '#814646', 1, '300'),
(2, 'google', 'https://www.google.com', '#ab2b2b', 1, '400'),
(3, 'mi perfil linkedin', 'https://www.linkedin.com/in/stiven-colorado-370028', '#26c030', 1, '350'),
(4, 'github', 'https://github.com/', '#333333', 1, '500'),
(5, 'stackoverflow', 'https://stackoverflow.com/', '#f48024', 1, '450'),
(6, 'python', 'https://www.python.org/', '#306998', 1, '320'),
(7, 'mdn web docs', 'https://developer.mozilla.org/', '#0c59b6', 1, '360'),
(8, 'Netflix', 'https://www.netflix.com', '#e50914', 11, '700'),
(9, 'YouTube', 'https://www.youtube.com', '#FF0000', 11, '600'),
(10, 'Spotify', 'https://www.spotify.com', '#1DB954', 11, '550'),
(11, 'Twitch', 'https://www.twitch.tv', '#9146FF', 11, '500'),
(12, 'Hulu', 'https://www.hulu.com', '#3DBB3D', 11, '450');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `correo` varchar(140) NOT NULL,
  `contrasena` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `nombre`, `correo`, `contrasena`) VALUES
(1, 'stiven', 'stivenchoo@gmail.com', '$2a$10$wlxsOt5OWwjpNvPd3S6I/eVmKg1eczppFCRrMaEnO5zxS0kqNHEee'),
(11, 'franyer', 'franyer@gmail.com', '$2b$10$rbYLXNKMU8IlO0f1drAsUuekn7yTVHAKIanSHTsroibNgoZ.xrCGK');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `qrs`
--
ALTER TABLE `qrs`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `qrs`
--
ALTER TABLE `qrs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
