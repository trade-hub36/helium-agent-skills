import { fileManagerSkill, writeProjectFile } from './skills/fileManager.js';
import { dbInspectorSkill, inspectDatabaseSchema } from './skills/dbInspector.js';
import { queryAnalyzerSkill } from './skills/queryAnalyzer.js';
import { costCalculatorSkill } from './skills/costCalculator.js';
import { latencyBenchmarkerSkill } from './skills/latencyBenchmarker.js';
import { migrationPlannerSkill } from './skills/migrationPlanner.js';
import { redisManagerSkill } from './skills/redisManager.js';

// Nouveaux imports de skills
import {
  ddlSchemaGeneratorSkill,
  healthPingCheckSkill,
  backupSchedulerSkill,
  sqlInjectionScannerSkill,
  anomalyDetectorSkill
} from './skills/additionalSkills.js';

// Nouveaux imports d'agents IA
import {
  aiCostNegotiatorAgent,
  aiSecurityGuardianAgent,
  aiAutoRecoveryAgent
} from './skills/agents/aiAgents.js';

import { multiAgentConsensusSuite } from './skills/agents/consensusAgents.js';
import { HeliumDebateEngine } from './skills/agents/debateEngine.js';

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
  
  // Nouveaux exports
  ddlSchemaGeneratorSkill,
  healthPingCheckSkill,
  backupSchedulerSkill,
  sqlInjectionScannerSkill,
  anomalyDetectorSkill,
  aiCostNegotiatorAgent,
  aiSecurityGuardianAgent,
  aiAutoRecoveryAgent,
  
  multiAgentConsensusSuite,
  HeliumDebateEngine
};

export const heliumSkills = [
  fileManagerSkill,
  dbInspectorSkill,
  queryAnalyzerSkill,
  costCalculatorSkill,
  latencyBenchmarkerSkill,
  migrationPlannerSkill,
  redisManagerSkill,
  ddlSchemaGeneratorSkill,
  healthPingCheckSkill,
  backupSchedulerSkill,
  sqlInjectionScannerSkill,
  anomalyDetectorSkill,
  ...multiAgentConsensusSuite
];

console.log("Suite Helium DB élargie : 12 Outils Système, 13 Agents (dont 3 IA) et 1 Moteur de Débat.");