export interface TrendingRepo {
  fullName: string;
  owner: string;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  starsToday: number;
  rank: number;
  url: string;
}

export interface RepoContent {
  repoInfo: {
    full_name: string;
    description: string | null;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    topics: string[];
    license: { spdx_id: string } | null;
    homepage: string | null;
    created_at: string;
    pushed_at: string;
  };
  readme: string | null;
  fileTree: string[];
  packageJson: Record<string, unknown> | null;
  languages: Record<string, number>;
}

export interface AnalysisResult {
  summaryKo: string;
  summaryEn: string;
  techStack: string[];
  category: string;
  useCases: string[];
  similarProjects: string[];
  highlights: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface WebhookPayload {
  date: string;
  repos: TrendingRepo[];
}
