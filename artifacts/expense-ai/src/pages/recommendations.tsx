import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetRecommendations } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, AlertCircle, ArrowRightCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Recommendations() {
  const { data: recommendations, isLoading } = useGetRecommendations();

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return "destructive";
      case 'medium':
        return "default";
      case 'low':
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'medium':
        return <ArrowRightCircle className="h-5 w-5 text-primary" />;
      case 'low':
        return <CheckCircle2 className="h-5 w-5 text-accent" />;
      default:
        return <Lightbulb className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">AI Insights</h2>
        <p className="text-muted-foreground">Smart recommendations to optimize your spending.</p>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-4 items-start">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : !recommendations || recommendations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-foreground">Your spending looks great!</p>
              <p>No new recommendations at this time. Keep up the good habits.</p>
            </CardContent>
          </Card>
        ) : (
          recommendations.map((rec, i) => (
            <Card key={i} className="overflow-hidden transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex gap-4 items-start flex-col sm:flex-row">
                  <div className="p-2 bg-muted rounded-full hidden sm:block">
                    {getPriorityIcon(rec.priority)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <div className="flex items-center gap-2 sm:hidden">
                         {getPriorityIcon(rec.priority)}
                      </div>
                      <h3 className="font-semibold text-lg leading-none">{rec.title}</h3>
                      <Badge variant={getPriorityColor(rec.priority) as any} className="ml-auto sm:ml-2">
                        {rec.priority} Priority
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground pt-1">
                      {rec.description}
                    </p>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 text-left sm:text-right border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto flex sm:flex-col items-center justify-between sm:justify-start">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Potential Saving</span>
                    <span className="text-xl font-bold text-accent">{formatCurrency(rec.potentialSaving)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
