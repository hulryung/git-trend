import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Brain, Code, Lightbulb, Target, Users } from "lucide-react";

interface AnalysisPanelProps {
  summaryKo: string | null;
  summaryEn: string | null;
  category: string | null;
  techStack: string[];
  useCases: string[];
  similarProjects: string[];
  highlights: string[];
  difficulty: string | null;
  analyzedAt: string;
}

const difficultyConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: "Beginner", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  intermediate: { label: "Intermediate", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  advanced: { label: "Advanced", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
};

export function AnalysisPanel({
  summaryKo,
  summaryEn,
  category,
  techStack,
  useCases,
  similarProjects,
  highlights,
  difficulty,
  analyzedAt,
}: AnalysisPanelProps) {
  const diffConf = difficulty ? difficultyConfig[difficulty] : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            {category && <Badge variant="outline">{category}</Badge>}
            {diffConf && (
              <Badge className={diffConf.color}>{diffConf.label}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {summaryKo && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Summary (KO)</h4>
            <p>{summaryKo}</p>
          </div>
        )}
        {summaryEn && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Summary (EN)</h4>
            <p className="text-muted-foreground">{summaryEn}</p>
          </div>
        )}

        <Separator />

        {techStack.length > 0 && (
          <div>
            <h4 className="font-medium text-sm flex items-center gap-1 mb-2">
              <Code className="w-4 h-4" /> Tech Stack
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {techStack.map((tech) => (
                <Badge key={tech} variant="secondary">{tech}</Badge>
              ))}
            </div>
          </div>
        )}

        {highlights.length > 0 && (
          <div>
            <h4 className="font-medium text-sm flex items-center gap-1 mb-2">
              <Lightbulb className="w-4 h-4" /> Highlights
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        )}

        {useCases.length > 0 && (
          <div>
            <h4 className="font-medium text-sm flex items-center gap-1 mb-2">
              <Target className="w-4 h-4" /> Use Cases
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {useCases.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </div>
        )}

        {similarProjects.length > 0 && (
          <div>
            <h4 className="font-medium text-sm flex items-center gap-1 mb-2">
              <Users className="w-4 h-4" /> Similar Projects
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {similarProjects.map((p) => (
                <Badge key={p} variant="outline">{p}</Badge>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground pt-2">
          Analyzed at {new Date(analyzedAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
