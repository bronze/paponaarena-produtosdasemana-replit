import { StatBand } from "papo-na-arena-ds";

export const Dashboard = () => (
  <StatBand
    className="grid-cols-2 lg:grid-cols-4"
    items={[
      { label: "Episódios", value: 103, href: "/episodes" },
      { label: "Produtos", value: 642, href: "/products" },
      { label: "Menções", value: 1476, href: "/products" },
      { label: "Pessoas", value: 409, href: "/people" },
    ]}
  />
);

export const ThreeUp = () => (
  <StatBand
    className="grid-cols-3"
    items={[
      { label: "Menções", value: 73 },
      { label: "Episódios", value: 41 },
      { label: "Pessoas", value: 28 },
    ]}
  />
);
