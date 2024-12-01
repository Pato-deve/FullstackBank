"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/axiosConfig";
import Cookies from "js-cookie";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBillWave, faMoneyBillTransfer, faFile } from "@fortawesome/free-solid-svg-icons";

function useResumenFinanciero() {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token) {
      axiosInstance
        .get("http://localhost:8000/api/finanzas/resumen/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setResumen(res.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error:", error);
          setError("No se pudo cargar el resumen financiero.");
          setLoading(false);
        });
    } else {
      setError("Token no encontrado");
      setLoading(false);
    }
  }, []);

  return { resumen, loading, error };
}

function ModalCrearTarjeta({ onClose, onSubmit, cuentas }) {
  const [proveedor, setProveedor] = useState("visa"); // Actualización: nombre claro
  const [tipoTarjeta, setTipoTarjeta] = useState("debito");
  const [cuentaId, setCuentaId] = useState(cuentas.length > 0 ? cuentas[0].id : "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ proveedor, tipo_tarjeta: tipoTarjeta, cuenta: cuentaId });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Crear Tarjeta</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Proveedor de Tarjeta</label>
            <select
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="visa">Visa</option>
              <option value="mastercard">MasterCard</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Tipo de Tarjeta</label>
            <select
              value={tipoTarjeta}
              onChange={(e) => setTipoTarjeta(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="debito">Débito</option>
              <option value="credito">Crédito</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Cuenta Asociada</label>
            <select
              value={cuentaId}
              onChange={(e) => setCuentaId(e.target.value)}
              className="w-full border rounded p-2"
            >
              {cuentas.map((cuenta) => (
                <option key={cuenta.id} value={cuenta.id}>
                  {cuenta.tipo_cuenta}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HomeBanking() {
  const { resumen, loading, error } = useResumenFinanciero();
  const [showModal, setShowModal] = useState(false);
  const [cuentas, setCuentas] = useState([]);
  const [tarjetas, setTarjetas] = useState([]);

  const handleModalClose = () => setShowModal(false);

  const handleModalSubmit = (data) => {
    const token = Cookies.get("authToken");
    axiosInstance
      .post(
        "http://localhost:8000/api/finanzas/tarjetas/",
        {
          tipo_tarjeta: data.tipo_tarjeta,
          proveedor: data.proveedor,
          cuenta: data.cuenta,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        console.log("Tarjeta creada exitosamente.");
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error al crear la tarjeta:", error.response?.data || error.message);
      });
  };

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token) {
      axiosInstance
        .get("http://localhost:8000/api/finanzas/cuentas/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => setCuentas(res.data))
        .catch((error) => console.error("Error obteniendo las cuentas:", error));
    }
  }, []);

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token) {
      axiosInstance
        .get("http://localhost:8000/api/finanzas/tarjetas/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => setTarjetas(res.data))
        .catch((error) => console.error("Error obteniendo las tarjetas:", error));
    }
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  const { balances_totales } = resumen || {};
  const acciones = [
    { icon: faMoneyBillWave, label: "Depositar" },
    { icon: faMoneyBillTransfer, label: "Transferir" },
    { icon: faFile, label: "Movimientos" },
  ];

  const tarjetaExistente = tarjetas.length > 0;
  const primeraTarjeta = tarjetaExistente ? tarjetas[0] : null; // Tomar solo la primera tarjeta

  return (
    <section className="bg-gray-200 min-h-screen py-20 px-6">
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-center mb-12">Tus Cuentas</h2>
        {balances_totales ? (
          <div className="bg-white shadow-md rounded-lg p-6 w-96 mx-auto">
            <h3 className="text-gray-600 text-lg font-semibold">Saldo Total:</h3>
            <p className="text-gray-800 font-bold text-xl">${balances_totales.pesos}</p>
            <div className="flex justify-around mt-4">
              {acciones.map((action, index) => (
                <div key={index} className="flex flex-col items-center">
                  <button
                    className="w-16 h-16 bg-gray-100 text-gray-700 rounded-full shadow-md flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon={action.icon} className="text-2xl" />
                  </button>
                  <span className="text-sm mt-2">{action.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>No tienes cuentas disponibles.</p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-center mb-6">Tus Tarjetas</h2>
        {tarjetaExistente ? (
          <ul className="space-y-4">
            <Link href="/homebanking/tarjetas">
              <li className="bg-gradient-to-r from-pink-500 to-blue-700 text-white p-8 rounded-xl shadow-xl hover:shadow-2xl cursor-pointer transition-all duration-300 w-full max-w-sm mx-auto">
                <div className="text-center font-semibold text-lg">
                  {/* Todo el contenedor de la tarjeta es clickeable */}
                  {primeraTarjeta.tipo_tarjeta} - {primeraTarjeta.proveedor}
                </div>
              </li>
            </Link>
          </ul>
        ) : (
          <p className="text-center">No tienes tarjetas disponibles.</p>
        )}
        {!tarjetaExistente && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-full"
            >
              Crear Tarjeta
            </button>
          </div>
        )}
      </section>

      {showModal && (
        <ModalCrearTarjeta
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          cuentas={cuentas}
        />
      )}
    </section>
  );
}
