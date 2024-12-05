"use client";

import { useState, useEffect } from "react";

type Prestamo = {
  id: number;
  monto_prestado: number;
  meses_duracion: number;
  interes: number;
  pago_total: number;
  cuota_mensual: number;
  estado: string;
};

type Cuenta = {
  id: number;
  numero_cuenta: string;
  tipo_cuenta: string;
  balance_pesos: number;
};

export default function Prestamos() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<number | null>(null);
  const [usuario, setUsuario] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState<boolean>(false);
  const [monto, setMonto] = useState<string>("");
  const [meses, setMeses] = useState<string>("12");
  const [interes, setInteres] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDatos = async () => {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      if (!token) {
        setError("Por favor, inicie sesión. No se encontró el token.");
        setLoading(false);
        return;
      }

      try {
        const resUsuario = await fetch("http://localhost:8000/api/usuarios/usuario/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!resUsuario.ok) {
          const errorData = await resUsuario.text();
          console.error("Error al obtener usuario:", errorData);
          throw new Error("Error al obtener los datos del usuario.");
        }

        const dataUsuario = await resUsuario.json();
        setUsuario(dataUsuario.nombre);

        const resCuentas = await fetch("http://localhost:8000/api/finanzas/cuentas/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!resCuentas.ok) {
          const errorData = await resCuentas.text();
          console.error("Error al obtener cuentas:", errorData);
          throw new Error("Error al obtener las cuentas.");
        }

        const dataCuentas = await resCuentas.json();
        setCuentas(dataCuentas);
        if (dataCuentas.length > 0) {
          setCuentaSeleccionada(dataCuentas[0].id); //primera cuenta por defecto
        }

        const resPrestamos = await fetch("http://localhost:8000/api/finanzas/prestamos/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!resPrestamos.ok) {
          const errorData = await resPrestamos.text();
          console.error("Error al obtener préstamos:", errorData);
          throw new Error("Error al obtener los préstamos.");
        }

        const dataPrestamos = await resPrestamos.json();
        setPrestamos(
          dataPrestamos.map((prestamo: any) => ({
            ...prestamo,
            monto_prestado: parseFloat(prestamo.monto_prestado),
            interes: parseFloat(prestamo.interes),
            pago_total: parseFloat(prestamo.pago_total),
            cuota_mensual: parseFloat(prestamo.cuota_mensual),
          }))
        );
        setLoading(false);
      } catch (err: any) {
        console.error(err.message);
        setError(err.message || "Error al cargar los datos.");
        setLoading(false);
      }
    };

    fetchDatos();
  }, []);

  const generarPrestamo = async () => {
    setError(null);

    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("No se encontró un token de autenticación. Por favor, inicie sesión.");
      return;
    }

    const montoNumber = parseFloat(monto);
    const mesesNumber = parseInt(meses);

    if (isNaN(montoNumber) || montoNumber <= 0) {
      setError("Por favor, ingresa un monto válido.");
      return;
    }

    if (isNaN(mesesNumber) || mesesNumber <= 0 || mesesNumber > 60) {
      setError("Por favor, selecciona un plazo válido (entre 1 y 60 meses).");
      return;
    }

    if (!cuentaSeleccionada) {
      setError("Por favor, selecciona una cuenta.");
      return;
    }

    const nuevoPrestamo = {
      cuenta: cuentaSeleccionada,
      monto_prestado: montoNumber,
      meses_duracion: mesesNumber,
      interes,
    };

    try {
      const res = await fetch("http://localhost:8000/api/finanzas/prestamos/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevoPrestamo),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error al crear préstamo:", errorText);
        throw new Error("No se pudo generar el préstamo.");
      }

      const dataPrestamo = await res.json();

      setPrestamos((prev) => [
        ...prev,
        {
          ...dataPrestamo,
          monto_prestado: parseFloat(dataPrestamo.monto_prestado),
          interes: parseFloat(dataPrestamo.interes),
          pago_total: parseFloat(dataPrestamo.pago_total),
          cuota_mensual: parseFloat(dataPrestamo.cuota_mensual),
        },
      ]);
      setMostrarModal(false);
      setMonto("");
      setMeses("12");
    } catch (err: any) {
      console.error(err.message);
      setError(err.message || "Error al generar el préstamo. Intente de nuevo.");
    }
  };
  return (
  <div className="h-screen bg-gray-50 text-gray-800">
    <div className="max-w-6xl mx-auto py-10 px-6">
      <h2 className="text-3xl font-extrabold mb-8 text-gray-900 text-center">Tus Préstamos</h2>

      {error && <p className="text-red-500 text-center mb-6">{error}</p>}

      {loading ? (
        <div className="flex justify-center items-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Selecciona una cuenta</label>
            <select
              value={cuentaSeleccionada || ""}
              onChange={(e) => setCuentaSeleccionada(Number(e.target.value))}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {cuentas.map((cuenta) => (
                <option key={cuenta.id} value={cuenta.id}>
                  {cuenta.tipo_cuenta} - {cuenta.numero_cuenta}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prestamos.map((prestamo) => (
              <div
                key={prestamo.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <p className="text-gray-700 font-medium mb-2">
                  <strong>Monto:</strong> ${prestamo.monto_prestado.toFixed(2)}
                </p>
                <p className="text-gray-700 font-medium mb-2">
                  <strong>Plazo:</strong> {prestamo.meses_duracion} meses
                </p>
                <p className="text-gray-700 font-medium mb-2">
                  <strong>Tasa de interés:</strong> {prestamo.interes}%
                </p>
                <p className="text-gray-700 font-medium mb-2">
                  <strong>Pago Total:</strong> ${prestamo.pago_total.toFixed(2)}
                </p>
                <p className="text-gray-700 font-medium mb-2">
                  <strong>Cuota Mensual:</strong> ${prestamo.cuota_mensual.toFixed(2)}
                </p>
                <p className={`font-bold ${prestamo.estado === "activo" ? "text-green-600" : "text-gray-500"}`}>
                  <strong>Estado:</strong> {prestamo.estado}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex justify-center mt-10">
        <button
          onClick={() => setMostrarModal(true)}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          Generar Préstamo
        </button>
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Generar Préstamo</h3>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto del préstamo ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Plazo (en meses)</label>
              <select
                value={meses}
                onChange={(e) => setMeses(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="6">6 meses</option>
                <option value="12">12 meses</option>
                <option value="24">24 meses</option>
                <option value="36">36 meses</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tasa de interés anual (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={interes}
                onChange={(e) => setInteres(parseFloat(e.target.value))}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setMostrarModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 mr-2"
              >
                Cancelar
              </button>
              <button
                onClick={generarPrestamo}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

}
