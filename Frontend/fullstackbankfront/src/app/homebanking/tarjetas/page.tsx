"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const TarjetasPage: React.FC = () => {
  const [tarjetas, setTarjetas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tipo_tarjeta: "",
    proveedor: "",
    cuenta: "",
  });

  const token = Cookies.get("authToken");

  // Obtener tarjetas del usuario
  const fetchTarjetas = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/finanzas/tarjetas/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTarjetas(response.data);
    } catch (error) {
      console.error("Error al obtener las tarjetas:", error.response?.data || error.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/finanzas/tarjetas/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Tarjeta eliminada exitosamente.");
      fetchTarjetas(); // Actualizar las tarjetas después de eliminar una
    } catch (error) {
      console.error("Error al eliminar la tarjeta:", error.response?.data || error.message);
    }
  };

  // Manejar envío del formulario del modal
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8000/api/finanzas/tarjetas/",
        {
          tipo_tarjeta: formData.tipo_tarjeta,
          proveedor: formData.proveedor,
          cuenta: formData.cuenta,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Tarjeta creada exitosamente.");
      setModalOpen(false);
      fetchTarjetas(); // Actualizar las tarjetas después de crear una
    } catch (error) {
      console.error("Error al crear la tarjeta:", error.response?.data || error.message);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    fetchTarjetas();
  }, []);

  return (
    <div className="min-h-screen  text-gray-200">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">Mis Tarjetas</h1>

        {/* Lista de tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tarjetas.map((tarjeta) => (
            <div
              key={tarjeta.id}
              className={`p-6 rounded-lg shadow-lg relative ${
                tarjeta.tipo_tarjeta === "credito" ? "bg-gradient-to-br from-gray-800 to-black" : "bg-white"
              }`}
            >
              {/* Marca y Proveedor */}
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-lg font-semibold uppercase ${tarjeta.tipo_tarjeta === "credito" ? "text-white" : "text-black"}`}>
                  {tarjeta.tipo_tarjeta}
                </h2>
                <span className={`text-sm font-bold uppercase ${tarjeta.tipo_tarjeta === "credito" ? "text-gray-400" : "text-gray-700"}`}>
                  {tarjeta.proveedor}
                </span>
              </div>

              {/* Número de Tarjeta */}
              <div className={`text-2xl font-mono tracking-wider ${tarjeta.tipo_tarjeta === "credito" ? "text-gray-200" : "text-gray-800"}`}>
                {tarjeta.numero_tarjeta.replace(/(\d{4})(?=\d)/g, "$1 ")}
              </div>

              {/* Detalles de Expiración y CVV */}
              <div className="flex justify-between mt-4 text-sm">
                <div>
                  <p className={`uppercase ${tarjeta.tipo_tarjeta === "credito" ? "text-gray-400" : "text-gray-600"}`}>Expira</p>
                  <p className={`${tarjeta.tipo_tarjeta === "credito" ? "text-gray-300" : "text-gray-800"}`}>
                    {new Date(tarjeta.expiracion).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className={`uppercase ${tarjeta.tipo_tarjeta === "credito" ? "text-gray-400" : "text-gray-600"}`}>CVV</p>
                  <p className={`${tarjeta.tipo_tarjeta === "credito" ? "text-gray-300" : "text-gray-800"}`}>{tarjeta.cvv}</p>
                </div>
              </div>

              {/* Botón de eliminar reposicionado */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => handleDelete(tarjeta.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    tarjeta.tipo_tarjeta === "credito"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-200 text-black hover:bg-gray-300"
                  } transition-all`}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Botón para abrir el modal */}
        <div className="text-center mt-8">
          <button
            className="relative px-8 py-3 bg-gradient-to-r from-gray-800 to-gray-600 text-white rounded-full shadow-lg hover:from-gray-700 hover:to-gray-500 transition-all duration-300"
            onClick={() => setModalOpen(true)}
          >
            Crear Nueva Tarjeta
          </button>
        </div>
      </div>

      {/* Modal para crear una tarjeta */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Crear Tarjeta</h2>
            <form onSubmit={handleModalSubmit}>
              <div className="mb-4">
                <label htmlFor="tipo_tarjeta" className="block text-sm font-medium">
                  Tipo de Tarjeta
                </label>
                <select
                  name="tipo_tarjeta"
                  id="tipo_tarjeta"
                  className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded text-gray-200"
                  value={formData.tipo_tarjeta}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="debito">Débito</option>
                  <option value="credito">Crédito</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="proveedor" className="block text-sm font-medium">
                  Proveedor
                </label>
                <select
                  name="proveedor"
                  id="proveedor"
                  className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded text-gray-200"
                  value={formData.proveedor}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar proveedor</option>
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="cuenta" className="block text-sm font-medium">
                  Cuenta
                </label>
                <input
                  type="number"
                  name="cuenta"
                  id="cuenta"
                  className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded text-gray-200"
                  value={formData.cuenta}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-600 text-gray-200 rounded hover:bg-gray-700 transition-all"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TarjetasPage;
