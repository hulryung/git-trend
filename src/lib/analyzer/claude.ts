import Replicate from "replicate";
import type { RepoContent, AnalysisResult } from "@/types";
import { buildAnalysisPrompt } from "./prompts";

const MODEL = "anthropic/claude-4-sonnet";

function parseJsonResponse(text: string): Record<string, unknown> {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (match) {
      return JSON.parse(match[1]);
    }
    // Try to find JSON object in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse JSON from Replicate response");
  }
}

export async function analyzeWithClaude(
  content: RepoContent
): Promise<AnalysisResult> {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  const prompt = buildAnalysisPrompt(content);

  const output = await replicate.run(MODEL, {
    input: {
      prompt,
      max_tokens: 4096,
      system_prompt:
        "You are a GitHub repository analyzer. Always respond with valid JSON only, no markdown fencing.",
    },
  });

  const responseText = Array.isArray(output) ? output.join("") : String(output);

  const raw = parseJsonResponse(responseText);

  return {
    summaryKo: raw.summary_ko as string,
    summaryEn: raw.summary_en as string,
    techStack: raw.tech_stack as string[],
    category: raw.category as string,
    useCases: raw.use_cases as string[],
    similarProjects: raw.similar_projects as string[],
    highlights: raw.highlights as string[],
    difficulty: raw.difficulty as AnalysisResult["difficulty"],
  };
}
