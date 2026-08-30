import { runHomepageCurationAgent } from "../src/server/curation-agent.js";

const result = await runHomepageCurationAgent();
console.log(JSON.stringify(result, null, 2));

if (!result.published) {
  console.log(`Homepage briefing not published: ${result.reason}`);
  process.exit(0);
}

console.log(`Published ${result.curation?.items.length} items for ${result.date}`);
