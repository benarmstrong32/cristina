import { readFile } from "node:fs/promises";
import path from "node:path";

// Client-specific written content (names, research, plans). Lives in data/snapshot/, which ships
// with the deployment but is never committed to git.
export type NextStepsContent = {
  asOf: string;
  recentChanges: { title: string; detail: string }[];
  learningPhase: { title: string; body: string[] };
  nextSteps: { title: string; detail: string }[];
};
export type NotableContent = {
  asOf: string;
  items: { company: string; lead: string; role: string; why: string; fit: string; sources: { label: string; url: string }[] }[];
};

async function read<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), "data", "snapshot", file), "utf8"));
  } catch {
    return null;
  }
}

export const getNextSteps = () => read<NextStepsContent>("next-steps.json");
export const getNotable = () => read<NotableContent>("notable-companies.json");
