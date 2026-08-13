import { AI_SYSTEM_PROMPT, buildAiPrompt } from "./aiPrompt";
import { knowledgeBase } from "./docs";

export { AI_SYSTEM_PROMPT, buildAiPrompt };

export const aiSystemPrompt = `${AI_SYSTEM_PROMPT}

Knowledge base:
${knowledgeBase}`;

export function buildAiQuery(question: string) {
  return buildAiPrompt(question, knowledgeBase);
}
