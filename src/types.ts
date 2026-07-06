export interface LLMProvider {
  name: string;
  models: string[];
  apiKeyEnvVar: string;
}

export interface SetupConfig {
  provider: string;
  model: string;
  apiKey: string;
  teamFocus?: string;
  stack?: string[];
  projectName?: string;
}

export interface LLMMessage {
  role: "user" | "assistant";
  content: string;
}

export function buildFullConfig(
  setupConfig: SetupConfig,
  answers: Record<string, string>,
  skills: string[],
  agentContext: string,
): any {
  const { Config } = require("./config");

  const projectName =
    answers.projectName || setupConfig.projectName || "MyProject";
  const teamPriority =
    answers.teamPriority || setupConfig.teamFocus || "balanced";
  const stack =
    answers.stack || setupConfig.stack?.join(",") || "bun,drizzle,hono";

  return {
    llm: {
      provider: setupConfig.provider,
      model: setupConfig.model,
    },
    project: {
      name: projectName,
      created_at: new Date().toISOString(),
    },
    team: {
      priority: teamPriority,
      size: answers.teamSize || "small",
      seniority: answers.seniority || "mixed",
      existing_tools: (answers.existingTools || "").split(",").filter(Boolean),
    },
    stack: {
      runtime: "bun",
      language: "typescript",
      frameworks: stack.split(",").map((s) => s.trim()),
      orm: stack.includes("drizzle") ? "drizzle" : "none",
      database: "sqlite",
      testing: "bun",
      styling: "tailwind",
      state_management: "context",
    },
    install: {
      project_root: process.cwd(),
      agentic_dir: ".agentic",
      claude_dir: ".claude",
      skills: Object.fromEntries(skills.map((s) => [s, true])),
      rules: { default: true, patterns: true },
      hooks: { symlink: true },
    },
    agent_context: {
      architect: { focus: agentContext },
      code_reviewer: { focus: agentContext },
    },
  };
}
