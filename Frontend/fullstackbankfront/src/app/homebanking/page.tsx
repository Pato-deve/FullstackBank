"use client";

export default function HomeBanking() {
  return (
    <section className="bg-gray-100 min-h-screen py-8 px-6">
      {/* Título principal */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-blue-600">Bienvenido a HomeBanking</h1>
        <p className="text-gray-600 mt-2">
          Accede a tus cuentas y realiza tus operaciones de manera rápida y segura.
        </p>
      </div>

      {/* Sección de cuentas */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800">Tus Cuentas</h2>
        <div className="bg-white shadow-md rounded-lg p-6 mt-4">
          <ul>
            <li className="text-gray-600">
              Cuenta Corriente: <span className="font-bold">$45,000</span>
            </li>
            <li className="text-gray-600 mt-2">
              Caja de Ahorros en Dólares: <span className="font-bold">usd$2,000</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Sección de tarjetas */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800">Tus Tarjetas</h2>
        <div className="bg-white shadow-md rounded-lg p-6 mt-4">
          <ul>
            <li className="text-gray-600">
              Visa Gold: <span className="font-bold">$10,000</span> límite disponible
            </li>
            <li className="text-gray-600 mt-2">
              Mastercard Black: <span className="font-bold">$20,000</span> límite disponible
            </li>
          </ul>
        </div>
      </section>

      {/* Botones de acciones rápidas */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800">Acciones Rápidas</h2>
        <div className="flex flex-row flex-wrap gap-4 mt-4">
          {["Transferir Dinero", "Pagar Servicios", "Ver Movimientos", "Solicitar Crédito"].map(
            (accion) => (
              <button
                key={accion}
                className="w-40 h-12 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                type="button"
              >
                {accion}
              </button>
            )
          )}
        </div>
      </section>
    </section>
  );
}
