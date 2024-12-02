"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesome
import { faUser } from "@fortawesome/free-regular-svg-icons"; // Importar el icono faUser

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); // Menú móvil
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown usuario
  const [isMobile, setIsMobile] = useState(false); // Estado para detectar si es móvil
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'bottom'>('bottom'); // Para ajustar la posición del dropdown
  const pathname = usePathname();

  const user = {
    name: "Juan Pérez",
    email: "juan@example.com",
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    Cookies.remove("authToken");
    window.location.href = "/";
  };

  const navItems = [
    { href: "/homebanking", label: "HomeBanking" },
    { href: "/homebanking/cuentas", label: "Cuentas" },
    { href: "/homebanking/tarjetas", label: "Tarjetas" },
    { href: "/homebanking/prestamos", label: "Préstamos" },
    { href: "/homebanking/pagos", label: "Pagos" },
    { href: "/homebanking/transferencias", label: "Transferencias" },
  ];

  // Cerrar el menú móvil al cambiar de página
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Detectar tamaño de pantalla para diferenciar entre móvil y escritorio
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobile(false); // Es escritorio
        setDropdownPosition('left'); // Mostrar el dropdown a la izquierda en escritorio
        setIsOpen(false); // Cerrar menú móvil en escritorio
      } else {
        setIsMobile(true); // Es móvil
        setDropdownPosition('bottom'); // Mostrar el dropdown abajo en móvil
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Llamar una vez al cargar
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="bg-black text-gray-200 px-4 py-3 shadow-md border-b border-gray-700">
      <div className="w-full flex items-center justify-between">
        {/* Logo o Usuario (según tamaño de pantalla) */}
        <div className="flex items-center">
          {/* Pantallas grandes: Logo Rest */}
          <div className="hidden lg:flex items-center space-x-6">
          <Link href="/homebanking">
            <img
              src="/logoRest.png"
              alt="Logo Rest"
              className="w-16 h-16 object-contain"
            />
            </Link>
            <h1 className="text-lg font-bold tracking-wide">
              <Link href="/homebanking">Rest</Link>
            </h1>
          </div>

          {/* Pantallas pequeñas: Ícono Usuario */}
          <div className="lg:hidden relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-xl hover:text-white"
            >
              <FontAwesomeIcon icon={faUser} className="w-8 h-8 text-gray-400" />
            </button>
            <div
              className={`absolute ${dropdownPosition === 'bottom' ? 'top-full mt-2' : 'left-full ml-2'} w-48 bg-gray-800 text-white rounded-lg shadow-lg z-50 ${
                isDropdownOpen ? "block" : "hidden"
              }`}
            >
              <div className="px-4 py-2 text-sm">
                <p>{user.name}</p>
                <p className="text-gray-400">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm rounded-lg hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Menú Desktop */}
        <ul className="hidden lg:flex space-x-6 text-sm items-center">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${
                  pathname === item.href ? "text-white" : "hover:text-white"
                } transition-all duration-300`}
              >
                {item.label}
              </Link>
            </li>
          ))}

          {/* Dropdown Usuario */}
          <li className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 text-sm hover:text-white"
            >
              <span>{user.name}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              className={`absolute right-0 mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg ${
                isDropdownOpen ? "block" : "hidden"
              }`}
            >
              <div className="px-4 py-2 text-sm">
                <p>{user.name}</p>
                <p className="text-gray-400">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm rounded-lg hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          </li>
        </ul>

        {/* Menú Móvil Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden flex flex-col justify-between items-center w-6 h-6 z-50" // Flex container for hamburger
        >
          <span className="block w-full h-1 bg-gray-400 mb-1"></span> {/* Línea 1 */}
          <span className="block w-full h-1 bg-gray-400 mb-1"></span> {/* Línea 2 */}
          <span className="block w-full h-1 bg-gray-400"></span> {/* Línea 3 */}
        </button>

        {/* Menú Móvil */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-90 transform ${
            isOpen ? "translate-y-0" : "-translate-y-full"
          } transition-transform duration-300`}
        >
          <ul className="flex flex-col items-center justify-center h-full space-y-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-white text-lg hover:underline"
                  onClick={() => setIsOpen(false)} // Cierra el menú al hacer clic
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
