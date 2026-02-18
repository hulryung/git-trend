import type { RepoContent } from "@/types";

export function buildAnalysisPrompt(content: RepoContent): string {
  const { repoInfo, readme, fileTree, packageJson, languages } = content;

  const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0) || 1;
  const langBreakdown = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .map(([lang, bytes]) => `${lang}: ${((bytes / totalBytes) * 100).toFixed(1)}%`)
    .join(", ");

  let deps = "";
  if (packageJson) {
    const allDeps = {
      ...(packageJson.dependencies as Record<string, string> | undefined),
      ...(packageJson.devDependencies as Record<string, string> | undefined),
    };
    deps = Object.keys(allDeps).join(", ");
  }

  return `Analyze this GitHub repository and provide a structured analysis.

## Repository
- Name: ${repoInfo.full_name}
- Description: ${repoInfo.description ?? "N/A"}
- Stars: ${repoInfo.stargazers_count} | Forks: ${repoInfo.forks_count}
- Primary Language: ${repoInfo.language ?? "N/A"}
- Topics: ${repoInfo.topics?.join(", ") || "N/A"}
- License: ${repoInfo.license?.spdx_id ?? "N/A"}

## Languages
${langBreakdown || "N/A"}

## File Structure (top files)
${fileTree.slice(0, 80).join("\n") || "N/A"}

${deps ? `## Dependencies\n${deps}` : ""}

${readme ? `## README\n${readme}` : ""}

Respond with ONLY a JSON object (no markdown fencing) in this exact format:
{
  "summary_ko": "한국어 요약 (2-3문장, 이 프로젝트가 무엇이고 왜 유용한지)",
  "summary_en": "English summary (2-3 sentences, what this project is and why it's useful)",
  "tech_stack": ["technology1", "technology2"],
  "category": "one of: AI/ML, Web Framework, DevOps/Infra, Developer Tool, Library, Database, Security, Mobile, Data/Analytics, Other",
  "use_cases": ["use case 1", "use case 2"],
  "similar_projects": ["similar project 1"],
  "highlights": ["notable feature 1", "notable feature 2"],
  "difficulty": "beginner | intermediate | advanced"
}`;
}
