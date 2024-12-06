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
  const [isProcessing, setIsProcessing] = useState<boolean>(false); // estado botones de proceso

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
          setCuentaSeleccionada(dataCuentas[0].id); // primera cuenta por defecto
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
      } catch (err: any) {
        console.error(err.message);
        setError(err.message || "Error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, []);

  const generarPrestamo = async () => {
    setError(null);
    setIsProcessing(true);

    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("No se encontró un token de autenticación. Por favor, inicie sesión.");
      setIsProcessing(false);
      return;
    }

    const montoNumber = parseFloat(monto);
    const mesesNumber = parseInt(meses);

    if (isNaN(montoNumber) || montoNumber <= 0) {
      setError("Por favor, ingresa un monto válido.");
      setIsProcessing(false);
      return;
    }

    if (isNaN(mesesNumber) || mesesNumber <= 0 || mesesNumber > 60) {
      setError("Por favor, selecciona un plazo válido (entre 1 y 60 meses).");
      setIsProcessing(false);
      return;
    }

    if (!cuentaSeleccionada) {
      setError("Por favor, selecciona una cuenta.");
      setIsProcessing(false);
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
    } finally {
      setIsProcessing(false);
    }
  };
  return (
      <div className="max-w-4xl mx-auto bg-gray-50 shadow-lg rounded-lg p-8">
        <div className="max-w-4xl mx-auto px-6">
          <div
              className="bg-gray-800 bg-opacity-5 p-6 m-2 rounded-2xl shadow-inner hover:shadow-lg text-center text-gray-800 max-w-lg mx-auto ">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Tus Préstamos</h2>
            <p className="text-md text-gray-600">Gestiona y revisa tus préstamos activos</p>
          </div>

          {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center shadow">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m2 0a9 9 0 11-6-8.485"
                  />
                </svg>
                {error}
              </div>
          )}

          {loading ? (
              <div className="flex justify-center items-center">
                <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
              </div>
          ) : (
              <>
                <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
                  <label className="block text-md font-medium text-gray-700 mb-3">
                    Selecciona una cuenta
                  </label>
                  <select
                      value={cuentaSeleccionada || ""}
                      onChange={(e) => setCuentaSeleccionada(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-gray-700 shadow"
                  >
                    {cuentas.map((cuenta) => (
                        <option key={cuenta.id} value={cuenta.id}>
                          {cuenta.tipo_cuenta} - {cuenta.numero_cuenta}
                        </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {prestamos.map((prestamo) => (
                      <div
                          key={prestamo.id}
                          className="bg-gray-100 rounded-xl shadow-md p-6 hover:shadow-xl hover:bg-white transition-transform transform duration-300 hover:scale-105"
                      >
                        <p className="text-gray-800 font-semibold mb-3">
                          <strong>Monto:</strong> ${prestamo.monto_prestado.toFixed(2)}
                        </p>
                        <p className="text-gray-700 mb-2">
                          <strong>Plazo:</strong> {prestamo.meses_duracion} meses
                        </p>
                        <p className="text-gray-700 mb-2">
                          <strong>Tasa de interés:</strong> {prestamo.interes}%
                        </p>
                        <p className="text-gray-700 mb-2">
                          <strong>Pago Total:</strong> ${prestamo.pago_total.toFixed(2)}
                        </p>
                        <p className="text-gray-700 mb-2">
                          <strong>Cuota Mensual:</strong> ${prestamo.cuota_mensual.toFixed(2)}
                        </p>
                        <p
                            className={`font-bold ${
                                prestamo.estado === "activo" ? "text-green-600" : "text-gray-500"
                            }`}
                        >
                          <strong>Estado:</strong> {prestamo.estado}
                        </p>
                      </div>
                  ))}
                </div>
              </>
          )}

          <div className="flex justify-center mt-12">
            <button
                onClick={() => setMostrarModal(true)}
                className="px-8 py-3 bg-black text-white font-semibold rounded-xl shadow-lg hover:bg-white hover:text-black border-2 border-black transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-600"
            >
              Generar Préstamo
            </button>
          </div>

          {mostrarModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-100 p-8 rounded-xl shadow-2xl w-full max-w-lg">
                  <h3 className="text-2xl font-bold mb-6 text-gray-900">Generar Préstamo</h3>
                  {error && <p className="text-red-500 mb-4">{error}</p>}

                  <div className="mb-5">
                    <label className="block text-md font-medium text-gray-700 mb-3">
                      Monto del préstamo ($)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-gray-700 shadow"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-md font-medium text-gray-700 mb-3">
                      Plazo (en meses)
                    </label>
                    <select
                        value={meses}
                        onChange={(e) => setMeses(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-gray-700 shadow"
                    >
                      <option value="6">6 meses</option>
                      <option value="12">12 meses</option>
                      <option value="24">24 meses</option>
                      <option value="36">36 meses</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-md font-medium text-gray-700 mb-3">
                      Tasa de interés anual (%)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={interes}
                        onChange={(e) => setInteres(parseFloat(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-gray-700 shadow"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                        onClick={() => setMostrarModal(false)}
                        className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 mr-2 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                        onClick={generarPrestamo}
                        className="px-6 py-2 bg-black text-white rounded-lg transition-all duration-300 hover:bg-white hover:text-black border-2 border-black"
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
