import { fileManagerSkill, writeProjectFile } from './skills/fileManager.js';
import { dbInspectorSkill, inspectDatabaseSchema } from './skills/dbInspector.js';
import { queryAnalyzerSkill } from './skills/queryAnalyzer.js';
import { costCalculatorSkill } from './skills/costCalculator.js';
import { latencyBenchmarkerSkill } from './skills/latencyBenchmarker.js';
import { migrationPlannerSkill } from './skills/migrationPlanner.js';
import { redisManagerSkill } from './skills/redisManager.js';
import { multiAgentConsensusSuite } from './skills/agents/consensusAgents.js';
import { HeliumDebateEngine } from './skills/agents/debateEngine.js'; // Nouvel import

export {
  fileManagerSkill,
  writeProjectFile,
  dbInspectorSkill,
  inspectDatabaseSchema,
  queryAnalyzerSkill,
  costCalculatorSkill,
  latencyBenchmarkerSkill,
  migrationPlannerSkill,
  redisManagerSkill,
  multiAgentConsensusSuite,
  HeliumDebateEngine // Export du moteur de débat
};

export const heliumSkills = [
  fileManagerSkill,
  dbInspectorSkill,
  queryAnalyzerSkill,
  costCalculatorSkill,
  latencyBenchmarkerSkill,
  migrationPlannerSkill,
  redisManagerSkill,
  ...multiAgentConsensusSuite
];

console.log("Suite Helium DB chargée : 7 Outils Système, 10 Agents et 1 Moteur de Débat.");