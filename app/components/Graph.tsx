"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface GraphProps {
  data: {
    name: string;
    [key: string]: string | number | undefined;
  }[];
  currencies: string[];
}

const currencyFormatter = (value: number, currency: string) => {
  if (currency === "IDR") {
    return `Rp ${value.toLocaleString("id-ID")}`;
  }
  return `$ ${value.toLocaleString("en-US")}`;
};

const currencyColors: Record<string, string> = {
  USD: "#2563eb", // blue
  IDR: "#16a34a", // green
};

const currencyLabels: Record<string, string> = {
  USD: "USD ($)",
  IDR: "IDR (Rp)",
};

export function Graph({ data, currencies }: GraphProps) {
  return (
    <div className="h-[300px] sm:h-[350px] md:h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            dy={10}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value.toLocaleString()}
            dx={-10}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              currencyFormatter(value as number, name),
              currencyLabels[name] || name,
            ]}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "8px 12px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
            labelStyle={{
              fontWeight: "bold",
              marginBottom: "4px",
            }}
            itemStyle={{
              padding: "2px 0",
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => (
              <span className="text-sm font-medium">
                {currencyLabels[value] || value}
              </span>
            )}
            iconSize={10}
            iconType="circle"
            wrapperStyle={{
              paddingTop: "8px",
            }}
          />
          {currencies.map((currency) => (
            <Line
              key={currency}
              type="monotone"
              dataKey={currency}
              stroke={currencyColors[currency]}
              strokeWidth={2.5}
              dot={false}
              name={currency}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
