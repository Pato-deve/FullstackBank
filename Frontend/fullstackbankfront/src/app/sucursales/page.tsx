"use client";

import React, { useState, useEffect } from "react";

const SucursalesPage = () => {
  const [branches, setBranches] = useState([]); // Estado para guardar las sucursales
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Estado de error

  // Fetch para obtener las sucursales
  useEffect(() => {
    fetch("http://localhost:8000/api/sucursales/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener las sucursales");
        }
        return response.json();
      })
      .then((data) => {
        setBranches(data); // Guardar las sucursales en el estado
        setLoading(false); // Terminar la carga
      })
      .catch((error) => {
        console.error("Error al obtener sucursales:", error);
        setError("No se pudieron cargar las sucursales.");
        setLoading(false); // Terminar la carga en caso de error
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-black text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">ITBANK</h1>
          <a
            href="/"
            className="bg-teal-500 text-black px-4 py-2 rounded-lg hover:bg-teal-400 transition-all"
          >
            Volver al Inicio
          </a>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto p-4">
        <h2 className="text-4xl font-bold text-center mb-8">Sucursales</h2>
        {loading ? (
          <p className="text-center text-gray-500">Cargando sucursales...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : branches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((branch: any) => (
              <div
                key={branch.id}
                className="bg-gray-800 text-white rounded-lg shadow-md p-6"
              >
                <h4 className="text-xl font-bold mb-2">{branch.nombre}</h4>
                <p className="text-gray-300">{branch.direccion}</p>
                <p className="text-gray-500">
                  Teléfono: {branch.telefono || "No disponible"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No hay sucursales disponibles.
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>© 2024 ITBANK. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default SucursalesPage;
