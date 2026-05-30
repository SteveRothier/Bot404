import { checkOllamaStatus } from "@/lib/ollama";

export async function GET() {
  const status = await checkOllamaStatus();
  return Response.json(status);
}
