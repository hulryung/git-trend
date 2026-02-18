import type { RepoContent } from "@/types";

const GITHUB_API = "https://api.github.com";

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

async function ghFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, { headers: headers() });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export async function extractRepoContent(
  owner: string,
  name: string
): Promise<RepoContent> {
  const [repoInfo, readmeData, tree, packageJsonData, languages] =
    await Promise.all([
      ghFetch<RepoContent["repoInfo"]>(`/repos/${owner}/${name}`),
      ghFetch<{ content: string; encoding: string }>(
        `/repos/${owner}/${name}/readme`
      ).catch(() => null),
      ghFetch<{ tree: { path: string; type: string }[] }>(
        `/repos/${owner}/${name}/git/trees/HEAD?recursive=1`
      ).catch(() => null),
      ghFetch<{ content: string; encoding: string }>(
        `/repos/${owner}/${name}/contents/package.json`
      ).catch(() => null),
      ghFetch<Record<string, number>>(
        `/repos/${owner}/${name}/languages`
      ).catch(() => ({})),
    ]);

  let readme: string | null = null;
  if (readmeData?.content) {
    readme = Buffer.from(readmeData.content, "base64")
      .toString("utf-8")
      .slice(0, 15000);
  }

  const fileTree = tree
    ? tree.tree
        .filter((f) => f.type === "blob")
        .map((f) => f.path)
        .slice(0, 200)
    : [];

  let packageJson: Record<string, unknown> | null = null;
  if (packageJsonData?.content) {
    try {
      packageJson = JSON.parse(
        Buffer.from(packageJsonData.content, "base64").toString("utf-8")
      );
    } catch {
      packageJson = null;
    }
  }

  return { repoInfo, readme, fileTree, packageJson, languages };
}
