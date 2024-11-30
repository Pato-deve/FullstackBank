import Modal from "../Modal";
import { useEffect, useState } from "react";

const currenciesList = ["ARS", "USD", "CLP", "BRL", "UYU"] as const;

type ForexExchangeDefinition = {
  from: {
    currency: (typeof currenciesList)[number];
    amount: number | null;
  };
  to: {
    currency: (typeof currenciesList)[number];
    amount: number | null;
  };
  calculate: boolean;
};

function isIncluded<T extends U, U>(coll: ReadonlyArray<T>, el: U): el is T {
  return coll.includes(el as T);
}

const getCurrencies = async () => {
  try {
    const tmp: { [key: string]: { [key: string]: number } }[] =
      await Promise.all(
        currenciesList.map((currency) => {
          return new Promise<{ [key: string]: { [key: string]: number } }>(
            (res, rej) => {
              fetch(`https://open.er-api.com/v6/latest/${currency}`)
                .then((ans) => ans.json())
                .then((ans) => {
                  const rates: { [key: string]: number } = ans.rates;
                  return res({ [currency as string]: rates });
                })
                .catch((err: string) => rej(err));
            },
          );
        }),
      );
    return tmp.reduce(
      (obj, item) =>
        Object.assign(obj, {
          [Object.keys(item)[0]]: Object.values(item)[0],
        }),
      {},
    );
  } catch (e) {
    throw new Error(e as string);
  }
};

export default function ForexExchange({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [exchange, setExchange] = useState<ForexExchangeDefinition>({
    from: {
      currency: "ARS",
      amount: null,
    },
    to: {
      currency: "USD",
      amount: null,
    },
    calculate: false,
  });

  useEffect(() => {
    if (exchange.from.amount === null) return;
    if (!exchange.calculate) return;

    getCurrencies().then((currencies) => {
      if (exchange.from.amount === null) return;
      setExchange({
        ...exchange,
        to: {
          currency: exchange.to.currency,
          amount:
            currencies[exchange.from.currency][exchange.to.currency] *
            exchange.from.amount,
        },
        calculate: false,
      });
    });
  }, [exchange]);

  return (
    <Modal
      open={open}
      onClose={() => {
        setExchange({
          from: {
            currency: "ARS",
            amount: null,
          },
          to: {
            currency: "USD",
            amount: null,
          },
          calculate: false,
        });
        onClose();
      }}
      title="Convertir divisas"
    >
      <form className="flex flex-col w-full [&>*]:mt-2 first:mt-0">
        <label htmlFor="from_currency">De</label>
        <select
          id="from_currency"
          className="input-default"
          value={exchange.from.currency}
          onChange={(e) => {
            const value = e.target.value;
            if (isIncluded(currenciesList, value)) {
              setExchange({
                ...exchange,
                from: {
                  currency: value,
                  amount: exchange.from.amount,
                },
                calculate: true,
              });
            }
          }}
        >
          {currenciesList.map((currency) => {
            return (
              <option value={currency} key={`from_${currency}`}>
                {currency}
              </option>
            );
          })}
        </select>
        <label htmlFor="give_currency">Monto a convertir</label>
        <input
          id="give_currency"
          type="number"
          className="input-default"
          value={exchange.from.amount ?? ""}
          min={0}
          onChange={(e) => {
            setExchange({
              ...exchange,
              from: {
                currency: exchange.from.currency,
                amount: e.target.value === "" ? null : +e.target.value,
              },
              calculate: true,
            });
          }}
        />
        <label htmlFor="to_currency">A</label>
        <select
          id="to_currency"
          className="input-default"
          value={exchange.to.currency}
          onChange={(e) => {
            const value = e.target.value;
            if (isIncluded(currenciesList, value)) {
              setExchange({
                ...exchange,
                to: {
                  currency: value,
                  amount: exchange.to.amount,
                },
                calculate: true,
              });
            }
          }}
        >
          {currenciesList.map((currency) => {
            return (
              <option value={currency} key={`from_${currency}`}>
                {currency}
              </option>
            );
          })}
        </select>
        <label htmlFor="receive_currency">Monto a recibir</label>
        <output id="receive_currency" className="input-default">
          {exchange.to.amount}
        </output>
      </form>
    </Modal>
  );
}