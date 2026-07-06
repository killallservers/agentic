import React, { useState } from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import TextInput from "ink-text-input";

interface QuestionnaireProps {
  onComplete: (answers: Record<string, string>) => void;
  bootstrapOnly?: boolean;
}

interface QuestionnaireState {
  projectName: string;
  teamSize: string;
  teamPriority: string;
  stack: string;
  seniority: string;
  existingTools: string;
  currentStep: number;
}

export function SetupQuestionnaire({
  onComplete,
  bootstrapOnly,
}: QuestionnaireProps) {
  const [state, setState] = useState<QuestionnaireState>({
    projectName: "",
    teamSize: "",
    teamPriority: "",
    stack: "",
    seniority: "",
    existingTools: "",
    currentStep: 0,
  });

  const allSteps = [
    {
      label: "Project Name",
      key: "projectName",
      type: "text" as const,
      placeholder: "e.g., MyProject",
    },
    {
      label: "Team Size",
      key: "teamSize",
      type: "select" as const,
      options: [
        { label: "Solo", value: "solo" },
        { label: "Small (2-3)", value: "small" },
        { label: "Medium (4-7)", value: "medium" },
        { label: "Large (8+)", value: "large" },
      ],
    },
    {
      label: "Team Priority",
      key: "teamPriority",
      type: "select" as const,
      options: [
        { label: "Speed (ship fast)", value: "speed" },
        { label: "Safety (minimize risk)", value: "safety" },
        { label: "Compliance (legal/regulatory)", value: "compliance" },
        { label: "Balanced", value: "balanced" },
      ],
    },
    {
      label: "Tech Stack (comma-separated: bun, drizzle, hono)",
      key: "stack",
      type: "text" as const,
      placeholder: "bun,drizzle,hono",
    },
    {
      label: "Team Seniority",
      key: "seniority",
      type: "select" as const,
      options: [
        { label: "Junior (0-2 years)", value: "junior" },
        { label: "Mixed", value: "mixed" },
        { label: "Senior (5+ years)", value: "senior" },
      ],
    },
    {
      label: "Existing Tooling (comma-separated, or skip)",
      key: "existingTools",
      type: "text" as const,
      placeholder: "e.g., ESLint, Vitest, Docker",
    },
  ];

  // Bootstrap mode only asks the first 4 questions
  const steps = bootstrapOnly ? allSteps.slice(0, 4) : allSteps;

  const currentStepDef = steps[state.currentStep];

  const handleTextSubmit = (value: string) => {
    setState((prev) => ({
      ...prev,
      [currentStepDef.key]: value,
      currentStep: prev.currentStep + 1,
    }));
  };

  const handleSelectOption = (option: { label: string; value: string }) => {
    setState((prev) => ({
      ...prev,
      [currentStepDef.key]: option.value,
      currentStep: prev.currentStep + 1,
    }));
  };

  // All steps complete
  if (state.currentStep >= steps.length) {
    onComplete({
      projectName: state.projectName,
      teamSize: state.teamSize,
      teamPriority: state.teamPriority,
      stack: state.stack,
      seniority: state.seniority,
      existingTools: state.existingTools,
    });
    return null;
  }

  const step = currentStepDef;

  if (step.type === "text") {
    return (
      <Box flexDirection="column">
        <Text>
          {step.label} ({state.currentStep + 1}/{steps.length})
        </Text>
        <TextInput
          placeholder={step.placeholder}
          onSubmit={handleTextSubmit}
          value={state[step.key as keyof QuestionnaireState] as string}
          onChange={(value) =>
            setState((prev) => ({
              ...prev,
              [step.key]: value,
            }))
          }
        />
      </Box>
    );
  }

  if (step.type === "select") {
    return (
      <Box flexDirection="column">
        <Text bold>
          {step.label} ({state.currentStep + 1}/{steps.length})
        </Text>
        <SelectInput items={step.options || []} onSelect={handleSelectOption} />
      </Box>
    );
  }

  return null;
}
