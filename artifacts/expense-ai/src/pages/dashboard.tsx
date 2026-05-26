import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetSummary, useGetTrend, useGetByCategory, useGetPrediction } from "@workspace/api-client-react";
import { formatCurrency, formatPercent } from "@/lib/format";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { BrainCircuit, TrendingUp, TrendingDown, DollarSign, ListOrdered } from "lucide-react";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetSummary();
  const { data: trend, isLoading: loadingTrend } = useGetTrend();
  const { data: byCategory, isLoading: loadingCategory } = useGetByCategory();
  const { data: prediction, isLoading: loadingPrediction } = useGetPrediction();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your spending and AI predictions.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-total-month">{formatCurrency(summary?.totalThisMonth || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  {summary?.changePercent && summary.changePercent > 0 ? (
                    <span className="text-destructive flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> {formatPercent(summary.changePercent)}</span>
                  ) : summary?.changePercent && summary.changePercent < 0 ? (
                    <span className="text-accent flex items-center"><TrendingDown className="h-3 w-3 mr-1" /> {formatPercent(Math.abs(summary.changePercent))}</span>
                  ) : (
                    <span>No change</span>
                  )}
                  {" "}from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Daily</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(summary?.avgDaily || 0)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <ListOrdered className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{summary?.topCategory || "N/A"}</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/80">Next Month Prediction</CardTitle>
            <BrainCircuit className="h-4 w-4 text-primary-foreground/80" />
          </CardHeader>
          <CardContent>
            {loadingPrediction ? (
              <Skeleton className="h-8 w-24 bg-primary-foreground/20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(prediction?.predictedTotal || 0)}</div>
                <p className="text-xs text-primary-foreground/80 mt-1">
                  {formatPercent(prediction?.confidence || 0)} confidence
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Spending Trend</CardTitle>
            <CardDescription>Monthly totals over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loadingTrend ? (
              <div className="h-full w-full flex items-center justify-center">
                <Skeleton className="h-[250px] w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), "Total"]}
                    contentStyle={{ backgroundColor: "hsl(var(--popover))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                  />
                  <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--background))", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>This month's expenses</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loadingCategory ? (
              <div className="h-full w-full flex items-center justify-center">
                <Skeleton className="h-[250px] w-[250px] rounded-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="category"
                  >
                    {byCategory?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), "Total"]}
                    contentStyle={{ backgroundColor: "hsl(var(--popover))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
