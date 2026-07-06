import { useState } from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import TextInput from "ink-text-input";

interface AgentAnswers {
  name: string;
  role: string;
  teamSize: "solo" | "small" | "medium" | "large";
  priority: "speed" | "safety" | "learning" | "correctness";
  stack: "frontend" | "backend" | "fullstack" | "data";
  compliance?: string;
}

type Step =
  | "name"
  | "role"
  | "teamSize"
  | "priority"
  | "stack"
  | "compliance"
  | "confirm"
  | "done";

export function AgentGeneratorPrompt() {
  const [answers, setAnswers] = useState<Partial<AgentAnswers>>({});
  const [step, setStep] = useState<Step>("name");
  const [nameInput, setNameInput] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const [complianceInput, setComplianceInput] = useState("");
  const [resolveAnswer, setResolveAnswer] = useState<
    ((value: AgentAnswers) => void) | null
  >(null);

  const waitForAnswer = () =>
    new Promise<AgentAnswers>((resolve) => {
      setResolveAnswer(() => resolve);
    });

  const handleNameSubmit = () => {
    if (!nameInput.trim()) return;
    const newAnswers = {
      ...answers,
      name: nameInput.trim().toLowerCase().replace(/\s+/g, "-"),
    };
    setAnswers(newAnswers);
    setNameInput("");
    setStep("role");
  };

  const handleRoleSubmit = () => {
    if (!roleInput.trim()) return;
    const newAnswers = { ...answers, role: roleInput.trim() };
    setAnswers(newAnswers);
    setRoleInput("");
    setStep("teamSize");
  };

  const handleTeamSizeSelect = (item: { value: string }) => {
    const newAnswers = {
      ...answers,
      teamSize: item.value as AgentAnswers["teamSize"],
    };
    setAnswers(newAnswers);
    setStep("priority");
  };

  const handlePrioritySelect = (item: { value: string }) => {
    const newAnswers = {
      ...answers,
      priority: item.value as AgentAnswers["priority"],
    };
    setAnswers(newAnswers);
    setStep("stack");
  };

  const handleStackSelect = (item: { value: string }) => {
    const newAnswers = {
      ...answers,
      stack: item.value as AgentAnswers["stack"],
    };
    setAnswers(newAnswers);
    setStep("compliance");
  };

  const handleComplianceSubmit = () => {
    const newAnswers = {
      ...answers,
      compliance: complianceInput.trim() || undefined,
    };
    setAnswers(newAnswers);
    setComplianceInput("");
    setStep("confirm");
  };

  const handleConfirm = () => {
    if (
      resolveAnswer &&
      answers.name &&
      answers.role &&
      answers.teamSize &&
      answers.priority &&
      answers.stack
    ) {
      setStep("done");
      resolveAnswer(answers as AgentAnswers);
    }
  };

  return {
    Component: () => {
      if (step === "name") {
        return (
          <Box flexDirection="column">
            <Text>
              What's the agent's name? (e.g., security-auditor,
              performance-reviewer)
            </Text>
            <TextInput
              value={nameInput}
              onChange={setNameInput}
              onSubmit={handleNameSubmit}
            />
          </Box>
        );
      }

      if (step === "role") {
        return (
          <Box flexDirection="column">
            <Text>
              What's the agent's role? (e.g., "Find security vulnerabilities in
              TypeScript code")
            </Text>
            <TextInput
              value={roleInput}
              onChange={setRoleInput}
              onSubmit={handleRoleSubmit}
            />
          </Box>
        );
      }

      if (step === "teamSize") {
        return (
          <Box flexDirection="column">
            <Text bold>What's your team size?</Text>
            <SelectInput
              items={[
                { label: "1 (Solo developer)", value: "solo" },
                { label: "2-5 (Small team)", value: "small" },
                { label: "5-20 (Medium team)", value: "medium" },
                { label: "20+ (Large org)", value: "large" },
              ]}
              onSelect={handleTeamSizeSelect}
            />
          </Box>
        );
      }

      if (step === "priority") {
        return (
          <Box flexDirection="column">
            <Text bold>What's your top priority?</Text>
            <SelectInput
              items={[
                {
                  label: "Speed — Ship fast, iterate based on feedback",
                  value: "speed",
                },
                {
                  label: "Safety — Minimize risk, ensure stability",
                  value: "safety",
                },
                {
                  label: "Learning — Explain decisions, teach concepts",
                  value: "learning",
                },
                {
                  label: "Correctness — High quality, type safety",
                  value: "correctness",
                },
              ]}
              onSelect={handlePrioritySelect}
            />
          </Box>
        );
      }

      if (step === "stack") {
        return (
          <Box flexDirection="column">
            <Text bold>What's your tech stack?</Text>
            <SelectInput
              items={[
                {
                  label: "Frontend (React, TypeScript, UI)",
                  value: "frontend",
                },
                { label: "Backend (APIs, databases, logic)", value: "backend" },
                {
                  label: "Full-stack (frontend + backend)",
                  value: "fullstack",
                },
                { label: "Data (pipelines, analytics)", value: "data" },
              ]}
              onSelect={handleStackSelect}
            />
          </Box>
        );
      }

      if (step === "compliance") {
        return (
          <Box flexDirection="column">
            <Text>
              Any compliance requirements? (e.g., HIPAA, SOC2, GDPR) Press Enter
              to skip.
            </Text>
            <TextInput
              value={complianceInput}
              onChange={setComplianceInput}
              onSubmit={handleComplianceSubmit}
            />
          </Box>
        );
      }

      if (step === "confirm") {
        return (
          <Box flexDirection="column">
            <Text bold>✨ Your Custom Agent</Text>
            <Text></Text>
            <Box flexDirection="column">
              <Text> Name: {answers.name}</Text>
              <Text> Role: {answers.role}</Text>
              <Text> Team: {answers.teamSize}</Text>
              <Text> Priority: {answers.priority}</Text>
              <Text> Stack: {answers.stack}</Text>
              {answers.compliance && (
                <Text> Compliance: {answers.compliance}</Text>
              )}
            </Box>
            <Text></Text>
            <Text bold>Press Enter to create agent...</Text>
            <TextInput value="" onChange={() => {}} onSubmit={handleConfirm} />
          </Box>
        );
      }

      return <Text>Done!</Text>;
    },
    waitForAnswer,
  };
}
