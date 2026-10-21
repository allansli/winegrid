import path from "node:path";
import { pathToFileURL } from "node:url";

const srcRoot = path.resolve(process.cwd(), "src");

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    specifier = pathToFileURL(path.join(srcRoot, specifier.slice(2))).href;
  }
  return nextResolve(specifier, context);
}
