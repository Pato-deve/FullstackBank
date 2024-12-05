"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";

const TarjetasPage: React.FC = () => {
  const [tarjetas, setTarjetas] = useState([]);
  const [visibility, setVisibility] = useState<Record<number, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tipo_tarjeta: "",
    proveedor: "",
    cuenta: "",
  });
  const [cuentas, setCuentas] = useState([]);

  const token = Cookies.get("authToken");

  const fetchTarjetas = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/finanzas/tarjetas/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTarjetas(response.data);
      setVisibility(
        response.data.reduce(
          (acc: Record<number, boolean>, tarjeta: { id: number }) => {
            acc[tarjeta.id] = false;
            return acc;
          },
          {}
        )
      );
    } catch (error) {
      console.error(
        "Error al obtener las tarjetas:",
        error.response?.data || error.message
      );
    }
  };

  const fetchCuentas = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/finanzas/cuentas/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCuentas(response.data);
    } catch (error) {
      console.error("Error al obtener las cuentas:", error.response?.data || error.message);
    }
  };

  const toggleVisibility = (id: number) => {
    setVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(
        `http://localhost:8000/api/finanzas/tarjetas/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchTarjetas();
    } catch (error) {
      console.error(
        "Error al eliminar la tarjeta:",
        error.response?.data || error.message
      );
    }
  };

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
      setModalOpen(false);
      fetchTarjetas();
    } catch (error) {
      console.error("Error al crear la tarjeta:", error.response?.data || error.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    fetchTarjetas();
    fetchCuentas();
  }, []);

  return (
    <div className="min-h-screen text-gray-200">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">
          Mis Tarjetas
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tarjetas.map((tarjeta) => (
            <div
              key={tarjeta.id}
              className={`relative p-6 min-h-52 rounded-lg ${
                tarjeta.tipo_tarjeta === "credito"
                  ? " bg-gradient-to-br from-gray-800 to-black shadow hover:shadow-2xl"
                  : "bg-gradient-to-br from-blue-900 to-blue-950 shadow hover:shadow-2xl"
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold uppercase text-white">
                  {tarjeta.tipo_tarjeta}
                </h2>
                <span className="text-sm font-bold uppercase text-gray-400">
                  {tarjeta.proveedor}
                </span>
              </div>

              <div className="text-2xl font-mono tracking-wider text-gray-200 mb-6">
                {visibility[tarjeta.id]
                  ? tarjeta.numero_tarjeta.replace(/(\d{4})(?=\d)/g, "$1 ")
                  : "**** **** **** " + tarjeta.numero_tarjeta.slice(-4)}
              </div>

              <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                <p className="text-sm text-gray-400 uppercase">CVV:</p>
                <p className="text-gray-300">
                  {visibility[tarjeta.id] ? tarjeta.cvv : "•••"}
                </p>
                <button
                  onClick={() => toggleVisibility(tarjeta.id)}
                  className="text-gray-300 hover:text-white transition"
                >
                  <FontAwesomeIcon
                    icon={visibility[tarjeta.id] ? faEyeSlash : faEye}
                    size="lg"
                  />
                </button>
              </div>

              <div className="absolute bottom-16 right-4 text-right">
                <p className="text-sm text-gray-400 uppercase">Expira:</p>
                <p className="text-gray-300">
                  {new Date(tarjeta.expiracion).toLocaleDateString()}
                </p>
              </div>

              <div className="absolute bottom-4 right-4">
                <button
                  onClick={() => handleDelete(tarjeta.id)}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => setModalOpen(true)}
            className="relative px-8 py-3 bg-gradient-to-r from-gray-800 to-gray-600 text-white rounded-full shadow-lg hover:from-gray-700 hover:to-gray-500 transition-all duration-300"
          >
            Crear Nueva Tarjeta
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-200">Crear Tarjeta</h2>
            <form onSubmit={handleModalSubmit}>
              <div className="mb-4">
                <label htmlFor="tipo_tarjeta" className="block text-sm font-medium text-gray-400">
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
                <label htmlFor="proveedor" className="block text-sm font-medium text-gray-400">
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
                <label htmlFor="cuenta" className="block text-sm font-medium text-gray-400">
                  Cuenta Asociada
                </label>
                <select
                  name="cuenta"
                  id="cuenta"
                  className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded text-gray-200"
                  value={formData.cuenta}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar cuenta</option>
                  {cuentas.map((cuenta) => (
                    <option key={cuenta.id} value={cuenta.id}>
                      {cuenta.nombre} - {cuenta.tipo_cuenta}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
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
