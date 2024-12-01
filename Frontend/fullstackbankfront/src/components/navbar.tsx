"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
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
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
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

        <button
          className="lg:hidden flex flex-col justify-center items-center space-y-1 relative z-50"
          onClick={toggleMenu}
        >
          <span
            className={`block w-6 h-0.5 bg-gray-400 transition-all duration-500 ${
              isOpen ? "rotate-45 translate-y-1.5" : ""
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-gray-400 transition-all duration-500 ${
              isOpen ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-gray-400 transition-all duration-500 ${
              isOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          ></span>
        </button>

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
        </ul>

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
