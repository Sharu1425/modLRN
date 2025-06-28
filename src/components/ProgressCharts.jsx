"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts"

const progressData = [
    { name: "Week 1", score: 65 },
    { name: "Week 2", score: 72 },
    { name: "Week 3", score: 78 },
    { name: "Week 4", score: 85 },
    { name: "Week 5", score: 82 },
    { name: "Week 6", score: 88 },
]

const subjectData = [
    { name: "Mathematics", value: 35 },
    { name: "Physics", value: 25 },
    { name: "Chemistry", value: 20 },
    { name: "Biology", value: 20 },
]

const COLORS = ["#6366f1", "#8b5cf6", "#3b82f6", "#2dd4bf"]

export default function ProgressCharts() {
    const [activeIndex, setActiveIndex] = useState(0)

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="card h-[400px]"
            >
                <h3 className="text-xl font-semibold mb-4 text-gray-100">Progress Over Time</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={progressData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid #374151",
                                borderRadius: "0.5rem",
                                color: "#e2e8f0",
                            }}
                        />
                        <Area type="monotone" dataKey="score" stroke="#6366f1" fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                </ResponsiveContainer>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="card h-[400px]"
            >
                <h3 className="text-xl font-semibold mb-4 text-white">Subject Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={subjectData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            fill="#ffffff"
                            paddingAngle={5}
                            dataKey="value"
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelStyle={{ fill: "#ffffff" }} // Set label text color to white

                        >
                            {subjectData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    opacity={index === activeIndex ? 1 : 0.7}

                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid #374151",
                                borderRadius: "0.5rem",
                                color: "#ffffff",
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </motion.div>
        </div>
    )
}

