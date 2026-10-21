import fs from "node:fs";
import path from "node:path";
import { buildCoverageReport } from "../src/data/coverageReport";

const destination = path.join(process.cwd(), "docs", "data-coverage.md");
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, buildCoverageReport());
console.log(`wrote ${destination}`);
