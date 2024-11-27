"use client";

import { useState, useEffect } from "react";

type Prestamo = {
  id: number;
  monto: number;
  plazo: number;
  tasaInteres: number;
  pagoTotal: number;
  cuotaMensual: number;
};

export default function Prestamos() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [usuario, setUsuario] = useState<string | null>(null); // Usuario logeado
  const [mostrarModal, setMostrarModal] = useState<boolean>(false);
  const [monto, setMonto] = useState<string>(""); // Monto del préstamo
  const [plazo, setPlazo] = useState<string>("12"); // Plazo en meses
  const [tasaInteres, setTasaInteres] = useState<number>(10); // Tasa de interés anual
  const [error, setError] = useState<string | null>(null);

  // Obtener el usuario logeado y sus préstamos desde el backend
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const resUsuario = await fetch("/api/usuario"); // Endpoint para obtener el usuario logeado
        const dataUsuario = await resUsuario.json();
        setUsuario(dataUsuario.nombre);

        const resPrestamos = await fetch(`/api/prestamos?usuario=${dataUsuario.id}`); // Endpoint para obtener préstamos
        const dataPrestamos = await resPrestamos.json();
        setPrestamos(dataPrestamos);
      } catch (err) {
        console.error("Error al obtener los datos del usuario o préstamos:", err);
      }
    };

    fetchUsuario();
  }, []);

  // Función para generar un préstamo
  const generarPrestamo = async () => {
    setError(null);

    const montoNumber = parseFloat(monto);
    const plazoNumber = parseInt(plazo);

    if (isNaN(montoNumber) || montoNumber <= 0) {
      setError("Por favor, ingresa un monto válido.");
      return;
    }
    if (isNaN(plazoNumber) || plazoNumber <= 0) {
      setError("Por favor, selecciona un plazo válido.");
      return;
    }

    // Cálculo del préstamo
    const tasaMensual = tasaInteres / 100 / 12;
    const numeroCuotas = plazoNumber;
    const cuota =
      (montoNumber * tasaMensual) /
      (1 - Math.pow(1 + tasaMensual, -numeroCuotas));
    const total = cuota * numeroCuotas;

    const nuevoPrestamo: Prestamo = {
      id: Date.now(), // Generar un ID único
      monto: montoNumber,
      plazo: plazoNumber,
      tasaInteres,
      pagoTotal: parseFloat(total.toFixed(2)),
      cuotaMensual: parseFloat(cuota.toFixed(2)),
    };

    try {
      // Enviar el nuevo préstamo al backend
      await fetch("/api/prestamos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoPrestamo),
      });

      // Actualizar la lista de préstamos
      setPrestamos((prev) => [...prev, nuevoPrestamo]);
      setMostrarModal(false); // Cerrar el modal
      setMonto("");
      setPlazo("12");
    } catch (err) {
      console.error("Error al generar el préstamo:", err);
      setError("No se pudo generar el préstamo. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Préstamos de {usuario || "Cargando..."}
      </h2>

      {/* Lista de préstamos */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          Préstamos creados
        </h3>
        {prestamos.length > 0 ? (
          <ul className="space-y-4">
            {prestamos.map((prestamo) => (
              <li
                key={prestamo.id}
                className="border p-4 rounded shadow-sm bg-gray-50"
              >
                <p className="text-gray-700">
                  <strong>Monto:</strong> ${prestamo.monto.toFixed(2)}
                </p>
                <p className="text-gray-700">
                  <strong>Plazo:</strong> {prestamo.plazo} meses
                </p>
                <p className="text-gray-700">
                  <strong>Tasa de interés:</strong> {prestamo.tasaInteres}%
                </p>
                <p className="text-gray-700">
                  <strong>Pago Total:</strong> ${prestamo.pagoTotal.toFixed(2)}
                </p>
                <p className="text-gray-700">
                  <strong>Cuota Mensual:</strong> $
                  {prestamo.cuotaMensual.toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No hay préstamos generados.</p>
        )}
      </div>

      {/* Botón para abrir el modal */}
      <button
        onClick={() => setMostrarModal(true)}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Generar Préstamo
      </button>

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-md p-6 rounded shadow-md">
            <h3 className="text-lg font-semibold mb-4">Generar Préstamo</h3>
            {error && <div className="text-red-500 mb-4">{error}</div>}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto del préstamo ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plazo (en meses)
              </label>
              <select
                value={plazo}
                onChange={(e) => setPlazo(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded"
              >
                <option value="6">6 meses</option>
                <option value="12">12 meses</option>
                <option value="24">24 meses</option>
                <option value="36">36 meses</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tasa de interés anual (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={tasaInteres}
                onChange={(e) => setTasaInteres(parseFloat(e.target.value))}
                className="w-full border border-gray-300 px-3 py-2 rounded"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setMostrarModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 mr-2"
              >
                Cancelar
              </button>
              <button
                onClick={generarPrestamo}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
