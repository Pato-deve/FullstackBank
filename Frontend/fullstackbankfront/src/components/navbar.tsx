"use client"; // Añadir esta línea al inicio del archivo

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Este hook necesita el componente marcado como cliente
import Cookies from 'js-cookie';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();

  const user = {
    name: 'Juan Pérez',
    email: 'juan@example.com',
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    Cookies.remove('authToken');
    window.location.href = 'http://localhost:3000';
  };

  const navItems = [
    { href: "/homebanking", label: "HomeBanking" },
    { href: "/homebanking/cuentas", label: "Cuentas" },
    { href: "/homebanking/tarjetas", label: "Tarjetas" },
    { href: "/homebanking/prestamos", label: "Préstamos" },
    { href: "/homebanking/pagos", label: "Pagos" },
    { href: "/homebanking/transferencias", label: "Transferencias" },
  ];

  return (
    <nav className="bg-black text-gray-200 px-4 py-3 shadow-md border-b border-gray-700">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <img
            src="logoRest.png"
            alt="Logo Rest"
            className="w-16 h-16 object-contain"
          />
          <h1 className="text-lg font-bold tracking-wide">
            <Link href="/homebanking" className="hover:text-white transition-all duration-500">
              Rest
            </Link>
          </h1>
        </div>

        <ul className="hidden lg:flex space-x-6 text-sm">
          {navItems.map((item) => (
            <li key={item.href} className="relative group">
              <Link
                href={item.href}
                className={`${
                  pathname === item.href
                    ? "text-white"
                    : "hover:text-white"
                } transition-all duration-300`}
              >
                {item.label}
              </Link>
              <span
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${
                  pathname === item.href ? "scale-x-100" : ""
                }`}
              ></span>
            </li>
          ))}

          {/* Usuario con hover efecto */}
          <li className="relative group">
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 text-sm hover:text-white transition-all duration-300"
            >
              <span>{user.name}</span>
              {/* Flecha */}
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

            {/* Línea debajo del nombre de usuario */}
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>

            {/* Dropdown de usuario */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg">
                <div className="px-4 py-2 text-sm">
                  <p>{user.name}</p>
                  <p className="text-gray-400">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            )}
          </li>
        </ul>

        {/* Botón de hamburguesa */}
        <button
          className="lg:hidden flex flex-col justify-center items-center space-y-1 relative z-50"
          onClick={toggleMenu}
        >
          <span
            className={`block w-6 h-0.5 bg-gray-400 transition-all duration-500 ${isOpen ? "rotate-45 translate-y-1.5" : ""}`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-gray-400 transition-all duration-500 ${isOpen ? "opacity-0" : ""}`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-gray-400 transition-all duration-500 ${isOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
          ></span>
        </button>

        {/* Menú móvil */}
        <div
          className={`lg:hidden fixed inset-0 bg-black bg-opacity-90 transform transition-all duration-700 ease-in-out ${
            isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          }`}
        >
          <ul className="flex flex-col items-center justify-center h-full space-y-6 text-sm">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-6 py-2 rounded-md text-gray-200 ${
                    pathname === item.href
                      ? "bg-gray-800 text-white"
                      : "hover:bg-gray-800 hover:text-white"
                  } transition-all duration-500`}
                  onClick={() => setIsOpen(false)}
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
