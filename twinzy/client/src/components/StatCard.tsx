import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: {
    direction: "up" | "down";
    value: string;
  };
  borderColor: string;
}

export default function StatCard({ title, value, trend, borderColor }: StatCardProps) {
  return (
    <Card className="rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className={`h-1 ${borderColor}`}></div>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">{title}</h3>
        <p className="text-4xl font-bold text-primary mb-2">{value}</p>
        
        {trend && (
          <p className="text-sm text-gray-500 flex items-center">
            <span className={`${trend.direction === "up" ? "text-green-500" : "text-red-500"} flex items-center mr-1`}>
              <i className={`fas fa-arrow-${trend.direction} mr-1`}></i>
              <span>{trend.value}</span>
            </span>
            since last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}
