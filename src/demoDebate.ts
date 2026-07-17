// Remplace l'ancien import par celui-ci :
import { HeliumDebateEngine } from './skills/agents/debateEngine.js';

async function runDemo() {
  const engine = new HeliumDebateEngine();
  
  const sampleInput = {
    connectionString: "postgresql://localhost:5432/helium_mother",
    rawQueries: [
      "SELECT * FROM users WHERE id = 1;",
      "INSERT INTO logs (event, created_at) VALUES ('user_login', NOW());",
      "SELECT * FROM products LIMIT 100;",
      "UPDATE orders SET status = 'shipped' WHERE id = 42;"
    ],
    targetRegions: ["eu-west-3", "us-east-1"]
  };

  console.log("=== DÉBUT DE LA SIMULATION DU DÉBAT MULTI-AGENTS ===");
  const result = await engine.runConsensusDebate(sampleInput);
  
  console.log("\n=== HISTORIQUE DE LA CONVERSATION EN TEMPS RÉEL ===");
  result.debateLogs.forEach(log => {
    console.log(`[${log.agentName}] : ${log.message}`);
  });

  console.log("\n=== COMPTE RENDU FINAL DU PLANIFICATEUR (LEAD) ===");
  console.log(JSON.stringify(result.finalReport, null, 2));
}

runDemo().catch(console.error);