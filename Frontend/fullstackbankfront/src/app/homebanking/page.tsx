"use client";

import { useState, useEffect } from "react";

export default function HomePage() {
  const [branches, setBranches] = useState([]); // Estado para guardar las sucursales
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado de error

  // Obtener sucursales desde el API
  useEffect(() => {
    fetch("http://localhost:8000/api/sucursales/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener datos del API");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Datos obtenidos del API:", data); // Depuración
        setBranches(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener sucursales:", error);
        setError("No se pudieron cargar las sucursales.");
        setBranches([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-black text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">ITBANK</h1>
      </header>

      {/* Sección principal */}
      <main className="container mx-auto p-4">
        {/* Bienvenida */}
        <section className="text-center my-8">
          <h2 className="text-4xl font-bold mb-4">Bienvenido a ITBANK</h2>
          <p className="text-gray-600">
            La plataforma más segura para gestionar tus finanzas digitales.
          </p>
        </section>

        {/* Tabla de sucursales */}
        <section className="my-10">
          <h2 className="text-3xl font-bold text-center mb-6">Nuestras Sucursales</h2>
          {loading ? (
            <p className="text-center text-gray-500">Cargando sucursales...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : branches.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table-auto w-full bg-gray-800 text-white rounded-lg">
                <thead>
                  <tr className="bg-gray-900">
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Nombre</th>
                    <th className="px-4 py-2">Dirección</th>
                    <th className="px-4 py-2">Teléfono</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((branch, index) => (
                    <tr key={branch.id} className="border-b border-gray-700">
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">{branch.nombre}</td>
                      <td className="px-4 py-2">{branch.direccion}</td>
                      <td className="px-4 py-2">{branch.telefono || "No disponible"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500">No hay sucursales disponibles.</p>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white p-4 text-center mt-auto">
        © 2024 ITBANK. Todos los derechos reservados.
      </footer>
    </div>
  );
}
