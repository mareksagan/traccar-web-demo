import { createMemo } from 'solid-js';

export default function SimpleChart(props) {
  const data = () => props.data || [];
  const dataKey = () => props.dataKey || 'value';
  const width = () => props.width || 800;
  const height = () => props.height || 400;
  const padding = () => props.padding || { top: 20, right: 30, bottom: 40, left: 50 };

  const chartWidth = createMemo(() => width() - padding().left - padding().right);
  const chartHeight = createMemo(() => height() - padding().top - padding().bottom);

  const xValues = createMemo(() => data().map((_, i) => i));
  const yValues = createMemo(() => data().map((d) => d[dataKey()]));

  const xScale = createMemo(() => {
    const domain = [0, Math.max(1, data().length - 1)];
    const range = [0, chartWidth()];
    return (i) => ((i - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]) + range[0];
  });

  const yScale = createMemo(() => {
    const values = yValues();
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const padding = (max - min) * 0.1;
    const domain = [min - padding, max + padding];
    const range = [chartHeight(), 0];
    return (v) => ((v - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]) + range[0];
  });

  const yTicks = createMemo(() => {
    const values = yValues();
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const count = 5;
    const step = (max - min) / count;
    return Array.from({ length: count + 1 }, (_, i) => min + step * i);
  });

  const pathD = createMemo(() => {
    if (data().length === 0) return '';
    const points = data().map((d, i) => {
      const x = xScale()(i);
      const y = yScale()(d[dataKey()]);
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  });

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width()} ${height()}`} preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      <g transform={`translate(${padding().left}, ${padding().top})`}>
        {yTicks().map((tick) => (
          <line
            x1={0}
            x2={chartWidth()}
            y1={yScale()(tick)}
            y2={yScale()(tick)}
            stroke="#e5e7eb"
            stroke-dasharray="3,3"
          />
        ))}
      </g>

      {/* Axes */}
      <g transform={`translate(${padding().left}, ${padding().top})`}>
        {/* Y Axis */}
        <line x1={0} y1={0} x2={0} y2={chartHeight()} stroke="#9ca3af" />
        {/* X Axis */}
        <line x1={0} y1={chartHeight()} x2={chartWidth()} y2={chartHeight()} stroke="#9ca3af" />

        {/* Y Axis ticks and labels */}
        {yTicks().map((tick) => (
          <g>
            <line x1={-5} y1={yScale()(tick)} x2={0} y2={yScale()(tick)} stroke="#9ca3af" />
            <text
              x={-10}
              y={yScale()(tick)}
              text-anchor="end"
              dominant-baseline="middle"
              font-size="12"
              fill="#6b7280"
            >
              {tick.toFixed(0)}
            </text>
          </g>
        ))}

        {/* Y Axis label */}
        <text
          x={-35}
          y={chartHeight() / 2}
          text-anchor="middle"
          dominant-baseline="middle"
          transform={`rotate(-90, -35, ${chartHeight() / 2})`}
          font-size="12"
          fill="#6b7280"
        >
          {props.yAxisLabel || ''}
        </text>
      </g>

      {/* Line chart */}
      <g transform={`translate(${padding().left}, ${padding().top})`}>
        <path d={pathD()} fill="none" stroke="#3b82f6" stroke-width="2" />
        
        {/* Data points */}
        {data().map((d, i) => (
          <circle
            cx={xScale()(i)}
            cy={yScale()(d[dataKey()])}
            r={4}
            fill="#3b82f6"
            stroke="#fff"
            stroke-width="2"
          />
        ))}
      </g>
    </svg>
  );
}
