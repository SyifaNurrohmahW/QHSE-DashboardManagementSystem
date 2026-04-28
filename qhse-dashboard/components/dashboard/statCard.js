import { Card, CardContent } from "@/components/ui/card";

const toneClasses = {
  red: {
    iconWrap: "bg-[#fff1f1]",
    icon: "text-[#ef4444]",
    stroke: "#dd5b56",
    note: "text-[#dc6a60]",
  },
  amber: {
    iconWrap: "bg-[#fff7e8]",
    icon: "text-[#f59e0b]",
    stroke: "#d8a44f",
    note: "text-[#cf9b40]",
  },
  blue: {
    iconWrap: "bg-[#eef6ff]",
    icon: "text-[#3b82f6]",
    stroke: "#72a1d4",
    note: "text-[#6791c2]",
  },
  green: {
    iconWrap: "bg-[#edf9f1]",
    icon: "text-[#16a34a]",
    stroke: "#3cb27a",
    note: "text-[#29a469]",
  },
};

function Sparkline({ stroke, points }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const path = points
    .map((point, index) => {
      const x = 5 + (index / (points.length - 1 || 1)) * 90;
      const y = 34 - ((point - min) / range) * 20;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 40" className="mt-4 h-12 w-full">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={path}
      />
      {path.split(" ").map((point) => {
        const [cx, cy] = point.split(",");
        return <circle key={point} cx={cx} cy={cy} r="1.7" fill={stroke} />;
      })}
    </svg>
  );
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "green",
  trend = [8, 12, 9, 15, 11, 16, 13],
}) {
  const palette = toneClasses[tone] || toneClasses.green;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[14px] font-medium text-[#3d4652]">{title}</p>
            <p className="mt-1 text-[18px] font-bold leading-none text-[#1d2736]">
              {value}
            </p>
            <p className={`mt-2 text-[12px] ${palette.note}`}>{description}</p>
          </div>

          {Icon ? (
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full ${palette.iconWrap}`}
            >
              <Icon className={palette.icon} size={27} strokeWidth={2.1} />
            </div>
          ) : null}
        </div>

        <Sparkline stroke={palette.stroke} points={trend} />
      </CardContent>
    </Card>
  );
}
