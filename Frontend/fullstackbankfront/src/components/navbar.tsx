"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const [isEmpleado, setIsEmpleado] = useState(false); // Estado para empleados
  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      const token = Cookies.get("authToken");
      if (!token) throw new Error("No token found");

      const response = await fetch("http://localhost:8000/api/usuarios/detalle/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("Response status:", response.status, response.statusText);
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      setUser({
        username: data.first_name,
        email: data.email,
      });

      const empleadoStatus = localStorage.getItem("isEmpleado") === "true";
      setIsEmpleado(empleadoStatus);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    Cookies.remove("authToken");
    Cookies.remove("isEmpleado");
    window.location.href = "/";
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const navItems = [
    { href: "/homebanking", label: "HomeBanking" },
    { href: "/homebanking/cuentas", label: "Cuentas" },
    { href: "/homebanking/tarjetas", label: "Tarjetas" },
    { href: "/homebanking/prestamos", label: "Préstamos" },
    { href: "/homebanking/pagos", label: "Pagos" },
    { href: "/homebanking/transferencias", label: "Transferencias" },
  ];

  if (isEmpleado) {
    navItems.push({ href: "/homebanking/empleados", label: "Empleados" });
  }

  return (
    <nav className="bg-black text-gray-200 px-4 py-3 shadow-md border-b border-gray-700">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center">
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
          <div className="lg:hidden relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-xl hover:text-white"
            >
              <FontAwesomeIcon icon={faUser} className="w-8 h-8 text-gray-400" />
            </button>
            <div
              className={`absolute ${
                isDropdownOpen ? "block" : "hidden"
              } top-full mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg z-50`}
            >
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm">
                    <p>{user.username}</p>
                    <p className="text-gray-400">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm rounded-lg hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <p className="px-4 py-2 text-sm text-gray-500">Cargando...</p>
              )}
            </div>
          </div>
        </div>

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
          <li className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 text-sm hover:text-white"
            >
              <span>{user?.username || "Usuario"}</span>
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
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm">
                    <p>{user.username}</p>
                    <p className="text-gray-400">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm rounded-lg hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <p className="px-4 py-2 text-sm text-gray-500">Cargando...</p>
              )}
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
