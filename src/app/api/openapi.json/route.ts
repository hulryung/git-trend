import { NextResponse } from "next/server";

export async function GET() {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://trend.hulryung.com";

  return NextResponse.json({
    openapi: "3.1.0",
    info: {
      title: "git-trend API",
      description:
        "API for accessing GitHub trending repositories with AI-powered analysis, related news, and more.",
      version: "1.0.0",
    },
    servers: [{ url: appUrl }],
    paths: {
      "/api/trending": {
        get: {
          operationId: "getTrendingRepos",
          summary: "Get trending GitHub repositories",
          description:
            "Returns a list of trending GitHub repositories with optional filtering by period, programming language, and date.",
          parameters: [
            {
              name: "period",
              in: "query",
              description: "Trending period",
              schema: { type: "string", enum: ["daily", "weekly", "monthly"], default: "daily" },
            },
            {
              name: "language",
              in: "query",
              description: "Filter by programming language (e.g., TypeScript, Python, Rust)",
              schema: { type: "string" },
            },
            {
              name: "date",
              in: "query",
              description: "Specific date in YYYY-MM-DD format",
              schema: { type: "string", format: "date" },
            },
          ],
          responses: {
            "200": {
              description: "List of trending repositories",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        rank: { type: "integer" },
                        fullName: { type: "string" },
                        description: { type: "string", nullable: true },
                        language: { type: "string", nullable: true },
                        stars: { type: "integer" },
                        forks: { type: "integer" },
                        starsToday: { type: "integer", nullable: true },
                        category: { type: "string", nullable: true },
                        summaryKo: { type: "string", nullable: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/repo/{owner}/{name}": {
        get: {
          operationId: "getRepoDetails",
          summary: "Get repository details with AI analysis",
          parameters: [
            { name: "owner", in: "path", required: true, schema: { type: "string" } },
            { name: "name", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            "200": {
              description: "Repository details with analysis",
            },
          },
        },
      },
      "/api/repo/{owner}/{name}/news": {
        get: {
          operationId: "getRepoNews",
          summary: "Get related news and articles for a repository",
          description:
            "Fetches related news from Hacker News, GitHub Releases, and DEV.to for the given repository.",
          parameters: [
            { name: "owner", in: "path", required: true, schema: { type: "string" } },
            { name: "name", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            "200": {
              description: "List of related news items",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        url: { type: "string" },
                        source: { type: "string", enum: ["hackernews", "github_release", "devto"] },
                        sourceLabel: { type: "string" },
                        date: { type: "string", nullable: true },
                        points: { type: "integer" },
                        comments: { type: "integer" },
                        summary: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}
