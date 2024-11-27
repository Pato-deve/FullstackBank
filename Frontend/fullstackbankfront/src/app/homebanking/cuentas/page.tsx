"use client";
import WithHeader from "../WithHeader";
import { useState } from "react";
import ForexExchange from "./ForexExchange";

function Header() {
  return (
    <div className="flex flex-row flex-wrap justify-start h-min text-sm mx-16 mb-4 mt-0 gap-y-2 gap-x-8 md:col-start-2 lg:flex-nowrap lg:justify-between">
      <div className="flex flex-col gap-2 text-base my-2">
        Saldo en pesos
        <div className="text-lg">
          <span>1000000</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 text-base my-2">
        Saldo en dólares
        <div className="text-lg">
          <span>1000000</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 my-2 [>*]:text-nowrap lg:w-[30%]">
        <div className="text-base">
          CBU:
          <br />
          0000000000000000000000
        </div>
        <div>
          ALIAS:
          <br />
          itbank.account
        </div>
      </div>
    </div>
  );
}

export default function Cuentas() {
  const [openExchangeModal, setOpenExchangeModal] = useState(false);

  return (
    <>
      <WithHeader
        header=<Header />
        title="Cuenta 123-45678/1"
        submenuOptions={[
          {
            id: 1,
            text: "Convertir divisas",
            callback: () => {
              setOpenExchangeModal(true);
            },
          },
        ]}
        tags={[
          {
            text: "Movimientos en pesos",
            callback: () => {
              console.log("pesos");
            },
          },
          {
            text: "Movimientos en dólares",
            callback: () => {
              console.log("dólares");
            },
          },
        ]}
      >
        <main className="text-xl gap-y-4 text-center">
          <p>No tenés movimientos en los últimos 7 días.</p>
          <p>Podés consultar los movimientos de los últimos 60 días.</p>
        </main>
      </WithHeader>
      <ForexExchange
        open={openExchangeModal}
        onClose={() => setOpenExchangeModal(false)}
      />
    </>
  );
}