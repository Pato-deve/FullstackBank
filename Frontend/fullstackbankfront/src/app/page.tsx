"use client";
import React from "react";
import { FaLock, FaBolt, FaGlobe } from "react-icons/fa";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-black text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">ITBANK</h1>
          <div className="flex gap-4">
            <a
              href="/sucursales"
              className="bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors duration-300"
            >
              Nuestras Sucursales
            </a>
            <a
              href="/login?register=true"
              className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-all"
            >
              Crear Cuenta
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-black to-gray-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Bienvenido a Argentarius
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            La plataforma más segura y conveniente para gestionar tus finanzas
            digitales. Conecta, transfiere y administra tu dinero de manera
            inteligente.
          </p>
          <a
            href="/login"
            className="bg-teal-500 text-black px-8 py-3 rounded-full font-bold hover:bg-teal-400 transition-all"
          >
            Ingresar
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-gray-900 text-4xl mb-4">
                <FaLock className="mx-auto" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Seguridad Garantizada
              </h3>
              <p className="text-gray-600">
                Tus datos siempre protegidos con tecnología avanzada y cifrado
                bancario.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-gray-900 text-4xl mb-4">
                <FaBolt className="mx-auto" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Transferencias Instantáneas
              </h3>
              <p className="text-gray-600">
                Envía y recibe dinero al instante, sin fronteras ni demoras.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-gray-900 text-4xl mb-4">
                <FaGlobe className="mx-auto" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Accesibilidad Global
              </h3>
              <p className="text-gray-600">
                Administra tu cuenta desde cualquier lugar, en cualquier
                dispositivo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-800 text-gray-300 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>© 2024 Billetera Virtual. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
