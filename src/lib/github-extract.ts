export interface RepoData {
  name: string;
  description: string;
  readme: string;
  languages: Record<string, number>;
  stars: number;
  forks: number;
  topics: string[];
  createdAt: string;
  contributors: { login: string; contributions: number; avatar: string }[];
  openIssues: number;
  license: string | null;
}

export async function extractRepoData(repoUrl: string, accessToken: string): Promise<RepoData> {
  // Parse owner/repo from URL
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
  if (!match) throw new Error("Invalid GitHub repository URL");
  const [, owner, repo] = match;
  const repoName = repo.replace(/\.git$/, "");

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github.v3+json",
  };

  // Fetch repo info, readme, languages, contributors in parallel
  const [repoRes, readmeRes, langRes, contribRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${repoName}`, { headers }),
    fetch(`https://api.github.com/repos/${owner}/${repoName}/readme`, { headers }).catch(() => null),
    fetch(`https://api.github.com/repos/${owner}/${repoName}/languages`, { headers }),
    fetch(`https://api.github.com/repos/${owner}/${repoName}/contributors?per_page=5`, { headers }),
  ]);

  if (!repoRes.ok) throw new Error("Repository not found or not accessible");

  const repoInfo = await repoRes.json();

  let readme = "";
  if (readmeRes?.ok) {
    const readmeData = await readmeRes.json();
    readme = Buffer.from(readmeData.content, "base64").toString("utf-8");
    // Truncate to ~4000 chars for prompt limits
    if (readme.length > 4000) readme = readme.substring(0, 4000) + "\n...[truncated]";
  }

  const languages = langRes.ok ? await langRes.json() : {};
  const contributors = contribRes.ok
    ? (await contribRes.json()).map((c: Record<string, unknown>) => ({
        login: c.login as string,
        contributions: c.contributions as number,
        avatar: c.avatar_url as string,
      }))
    : [];

  return {
    name: repoInfo.name,
    description: repoInfo.description || "",
    readme,
    languages,
    stars: repoInfo.stargazers_count,
    forks: repoInfo.forks_count,
    topics: repoInfo.topics || [],
    createdAt: repoInfo.created_at,
    contributors,
    openIssues: repoInfo.open_issues_count,
    license: repoInfo.license?.spdx_id || null,
  };
}

export function repoDataToFormFields(data: RepoData) {
  // Map repo data to the form fields used by generateDeck
  const topLangs = Object.entries(data.languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang]) => lang)
    .join(", ");

  const teamMembers = data.contributors
    .slice(0, 5)
    .map((c) => c.login)
    .join(", ");

  return {
    companyName: data.name,
    industry: data.topics?.[0] || "Technology",
    problem: `Based on the project README and description: ${data.description}`,
    solution: data.readme ? `Extracted from README:\n${data.readme.substring(0, 2000)}` : data.description,
    traction: `${data.stars} GitHub stars, ${data.forks} forks, ${data.openIssues} open issues, ${data.contributors.length} contributors`,
    teamBackground: teamMembers ? `Core contributors: ${teamMembers}` : "Open source team",
    fundingTarget: "",
    additionalContext: `Tech stack: ${topLangs}. License: ${data.license || "Not specified"}. Topics: ${data.topics.join(", ")}. Created: ${data.createdAt}.`,
  };
}
