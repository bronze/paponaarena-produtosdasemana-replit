import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
  "hsl(var(--chart-8))",
];

export function TopProductsChart({ data }: { data: { name: string; mentionCount: number }[] }) {
  return (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
      <XAxis type="number" />
      <YAxis
        type="category"
        dataKey="name"
        width={120}
        tick={{ fontSize: 11 }}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: 8,
          color: "hsl(var(--card-foreground))",
        }}
      />
      <Bar dataKey="mentionCount" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} name="Menções" />
    </BarChart>
  </ResponsiveContainer>
  );
}

export function AiCompanyChart({ data }: { data: { company: string; mentions: number; color: string; breakdown: { name: string; mentions: number }[] }[] }) {
  return (
  <ResponsiveContainer width="100%" height={192}>
    <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
      <XAxis type="number" tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }} />
      <YAxis type="category" dataKey="company" width={80} interval={0} tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
      <Tooltip
        content={({ active, payload, label }) => {
          if (!active || !payload?.length) return null;
          const d = payload[0].payload;
          return (
            <div style={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              padding: "6px 12px",
            }}>
              <p style={{ color: "hsl(var(--card-foreground))", margin: 0, marginBottom: 4 }}>{label}</p>
              {d.breakdown.map((item: { name: string; mentions: number }) => (
                <p key={item.name} style={{ color: d.color, margin: 0 }}>{item.name}: {item.mentions}</p>
              ))}
              <p style={{ color: d.color, margin: 0, marginTop: 4, fontWeight: 600 }}>Total: {d.mentions}</p>
            </div>
          );
        }}
      />
      <Bar dataKey="mentions" radius={[0, 4, 4, 0]} name="Menções">
        {data.map((entry) => (
          <Cell key={entry.company} fill={entry.color} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
  );
}

export function CategoryPieChart({ data }: { data: { category: string; count: number }[] }) {
  return (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        dataKey="count"
        nameKey="category"
        cx="50%"
        cy="50%"
        outerRadius={70}
        label={({ x, y, textAnchor, category, percent }) => (
          <text x={x} y={y} textAnchor={textAnchor} dominantBaseline="central" fontSize={12} fill="hsl(var(--foreground))">
            {`${category} (${(percent * 100).toFixed(0)}%)`}
          </text>
        )}
        labelLine={false}
      >
        {data.map((_, index) => (
          <Cell key={index} fill={COLORS[index % COLORS.length]} aria-label={`${data[index].category}: ${data[index].count}`} />
        ))}
      </Pie>
      <Tooltip
        contentStyle={{
          backgroundColor: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: 8,
          color: "hsl(var(--card-foreground))",
        }}
        itemStyle={{ color: "hsl(var(--card-foreground))" }}
      />
    </PieChart>
  </ResponsiveContainer>
  );
}

export function AscensionChart({ data, names }: { data: Record<string, string | number>[]; names: string[] }) {
  return (
  <ResponsiveContainer width="100%" height={280}>
    <LineChart data={data} margin={{ left: 0, right: 16 }}>
      <XAxis dataKey="episode" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
      <YAxis />
      <Tooltip
        contentStyle={{
          backgroundColor: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: 8,
          color: "hsl(var(--card-foreground))",
        }}
      />
      <Legend wrapperStyle={{ fontSize: 11 }} />
      {names.map((name, i) => (
        <Line
          key={name}
          type="monotone"
          dataKey={name}
          stroke={COLORS[i % COLORS.length]}
          dot={false}
          strokeWidth={2}
        />
      ))}
    </LineChart>
  </ResponsiveContainer>
  );
}

export function TrendChart({ data }: { data: { episode: string; date: string; mentions: number }[] }) {
  return (
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={data} margin={{ left: 0, right: 16 }}>
      <XAxis dataKey="episode" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
      <YAxis />
      <Tooltip
        contentStyle={{
          backgroundColor: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: 8,
          color: "hsl(var(--card-foreground))",
        }}
        labelFormatter={(label) => {
          const item = data.find((t) => t.episode === label);
          return item ? `Ep ${label} - ${item.date}` : label;
        }}
      />
      <Bar dataKey="mentions" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Menções" />
    </BarChart>
  </ResponsiveContainer>
  );
}

export function ParticipantsChart({ data }: { data: { episode: string; date: string; participants: number }[] }) {
  return (
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={data} margin={{ left: 0, right: 16 }}>
      <XAxis dataKey="episode" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
      <YAxis allowDecimals={false} />
      <Tooltip
        contentStyle={{
          backgroundColor: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: 8,
          color: "hsl(var(--card-foreground))",
        }}
        labelFormatter={(label) => {
          const item = data.find((t) => t.episode === label);
          return item ? `Ep ${label} - ${item.date}` : label;
        }}
      />
      <Bar dataKey="participants" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Participantes" />
    </BarChart>
  </ResponsiveContainer>
  );
}
