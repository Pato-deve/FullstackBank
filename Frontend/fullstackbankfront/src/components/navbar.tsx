"use client";

import React, { useState } from "react";
import Link from "next/link";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gray-900 text-white px-4 py-2">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <Link href="/homebanking" className="hover:text-blue-400">
            FullstackBank
          </Link>
        </h1>

        {/* Hamburger Menu Icon */}
        <button
          className="lg:hidden flex flex-col justify-center items-center space-y-2"
          onClick={toggleMenu}
        >
          <span className="block w-6 h-1 bg-white"></span>
          <span className="block w-6 h-1 bg-white"></span>
          <span className="block w-6 h-1 bg-white"></span>
        </button>

        {/* Menu for large screens */}
        <ul className="hidden lg:flex space-x-4">
          <li>
            <Link href="/homebanking/cuentas" className="hover:text-blue-400">
              Cuentas
            </Link>
          </li>
          <li>
            <Link href="/homebanking/tarjetas" className="hover:text-blue-400">
              Tarjetas
            </Link>
          </li>
          <li>
            <Link href="/homebanking/prestamos" className="hover:text-blue-400">
              Préstamos
            </Link>
          </li>
          <li>
            <Link href="/homebanking/pagos" className="hover:text-blue-400">
              Pagos
            </Link>
          </li>
          <li>
            <Link href="/homebanking/transferencias" className="hover:text-blue-400">
              Transferencias
            </Link>
          </li>
        </ul>

        {/* Dropdown menu for small screens */}
        <div
          className={`lg:hidden absolute top-16 left-0 w-full bg-blue-800 ${
            isOpen ? "block" : "hidden"
          }`}
        >
          <ul className="space-y-4 py-4">
            <li>
              <Link href="/homebanking" className="block text-white px-4 py-2 hover:bg-blue-700">
                HomeBanking
              </Link>
            </li>
            <li>
              <Link href="/homebanking/cuentas" className="block text-white px-4 py-2 hover:bg-blue-700">
                Cuentas
              </Link>
            </li>
            <li>
              <Link href="/homebanking/tarjetas" className="block text-white px-4 py-2 hover:bg-blue-700">
                Tarjetas
              </Link>
            </li>
            <li>
              <Link href="/homebanking/prestamos" className="block text-white px-4 py-2 hover:bg-blue-700">
                Préstamos
              </Link>
            </li>
            <li>
              <Link href="/homebanking/pagos" className="block text-white px-4 py-2 hover:bg-blue-700">
                Pagos
              </Link>
            </li>
            <li>
              <Link href="/homebanking/transferencias" className="block text-white px-4 py-2 hover:bg-blue-700">
                Transferencias
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
