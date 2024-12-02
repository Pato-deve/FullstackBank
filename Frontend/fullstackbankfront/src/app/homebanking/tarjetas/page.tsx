"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";

const TarjetasPage: React.FC = () => {
  const [tarjetas, setTarjetas] = useState([]);
  const [visibility, setVisibility] = useState<Record<number, boolean>>({});

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

  useEffect(() => {
    fetchTarjetas();
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

              {/* Número de tarjeta */}
              <div className="text-2xl font-mono tracking-wider text-gray-200 mb-6">
                {visibility[tarjeta.id]
                  ? tarjeta.numero_tarjeta.replace(/(\d{4})(?=\d)/g, "$1 ")
                  : "**** **** **** " + tarjeta.numero_tarjeta.slice(-4)}
              </div>

              {/* CVV e ícono */}
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

              {/* Fecha de expiración */}
              <div className="absolute bottom-16 right-4 text-right">
                <p className="text-sm text-gray-400 uppercase">Expira:</p>
                <p className="text-gray-300">
                  {new Date(tarjeta.expiracion).toLocaleDateString()}
                </p>
              </div>

              {/* Botón de eliminación */}
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
      </div>
    </div>
  );
};

export default TarjetasPage;
