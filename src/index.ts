import { fileManagerSkill, writeProjectFile } from './skills/fileManager.js';
import { dbInspectorSkill, inspectDatabaseSchema } from './skills/dbInspector.js';
import { queryAnalyzerSkill } from './skills/queryAnalyzer.js';
import { costCalculatorSkill } from './skills/costCalculator.js';
import { latencyBenchmarkerSkill } from './skills/latencyBenchmarker.js';
import { migrationPlannerSkill } from './skills/migrationPlanner.js';
import { redisManagerSkill } from './skills/redisManager.js';
import { multiAgentConsensusSuite } from './skills/agents/consensusAgents.js';

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
  multiAgentConsensusSuite
};

// Export de l'ensemble des compétences regroupées pour un chargement dynamique aisé
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

console.log("Suite Helium DB chargée : 7 Outils Système et 10 Agents de Consensus prêts.");