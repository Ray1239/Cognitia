import React from 'react'

const data = [
  { day: 'Mon', workout: 30, cardio: 45 },
  { day: 'Tue', workout: 25, cardio: 30 },
  { day: 'Wed', workout: 40, cardio: 60 },
  { day: 'Thu', workout: 45, cardio: 50 },
  { day: 'Fri', workout: 20, cardio: 40 },
  { day: 'Sat', workout: 35, cardio: 55 },
  { day: 'Sun', workout: 10, cardio: 20 },
]

const Graph = () => {
  const maxValue = Math.max(...data.flatMap(d => [d.workout, d.cardio]))
  const barWidth = 40
  const gap = 20
  const width = data.length * (barWidth * 2 + gap)
  const height = 300

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Weekly Fitness Activity</h3>
      <svg width={width} height={height}>
        {data.map((d, i) => (
          <g key={d.day} transform={`translate(${i * (barWidth * 2 + gap)}, 0)`}>
            <rect
              y={height - (d.workout / maxValue) * height}
              width={barWidth}
              height={(d.workout / maxValue) * height}
              fill="#4CAF50"
            />
            <rect
              x={barWidth}
              y={height - (d.cardio / maxValue) * height}
              width={barWidth}
              height={(d.cardio / maxValue) * height}
              fill="#2196F3"
            />
            <text
              x={barWidth}
              y={height + 20}
              textAnchor="middle"
              fill="#333"
              fontSize="12"
            >
              {d.day}
            </text>
          </g>
        ))}
        <line x1="0" y1={height} x2={width} y2={height} stroke="#333" strokeWidth="2" />
      </svg>
      <div className="flex justify-center mt-4">
        <div className="flex items-center mr-4">
          <div className="w-4 h-4 bg-[#4CAF50] mr-2"></div>
          <span>Workout</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-[#2196F3] mr-2"></div>
          <span>Cardio</span>
        </div>
      </div>
    </div>
  )
}

export default Graph