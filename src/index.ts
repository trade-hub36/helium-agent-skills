import { fileManagerSkill, writeProjectFile } from './skills/fileManager.js';
import { dbInspectorSkill, inspectDatabaseSchema } from './skills/dbInspector.js';
import { queryAnalyzerSkill } from './skills/queryAnalyzer.js';
import { costCalculatorSkill } from './skills/costCalculator.js';
import { latencyBenchmarkerSkill } from './skills/latencyBenchmarker.js';
import { migrationPlannerSkill } from './skills/migrationPlanner.js';
import { redisManagerSkill } from './skills/redisManager.js';

// Skills supplémentaires
import {
  ddlSchemaGeneratorSkill,
  healthPingCheckSkill,
  backupSchedulerSkill,
  sqlInjectionScannerSkill,
  anomalyDetectorSkill
} from './skills/additionalSkills.js';

// 8 NOUVEAUX SKILLS (Lecture & SQL)
import {
  sqlParserSkill,
  indexInspectorSkill,
  tableSizeEstimatorSkill,
  crossJoinDetectorSkill,
  schemaDependencySkill,
  sqlSanitizerSkill,
  indexSuggesterSkill,
  rawSchemaExtractorSkill
} from './skills/additionalSkills.js';

// Nouveaux agents IA
import {
  aiCostNegotiatorAgent,
  aiSecurityGuardianAgent,
  aiAutoRecoveryAgent,
  aiSqlQueryOptimizerAgent,
  aiDatabaseArchitectAgent,
  aiQueryRouterSupervisorAgent,
  aiSchemaConverterAgent
} from './skills/agents/aiAgents.js';

import { multiAgentConsensusSuite } from './skills/agents/consensusAgents.js';
import { HeliumDebateEngine } from './skills/agents/debateEngine.js';
// Import du Proxy
import { HeliumProxyServer } from './proxy/proxyServer.js';
import { ProxyConfigSchema, ShardConfigSchema } from './proxy/types.js';


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
  
  // Nouveaux Skills système
  ddlSchemaGeneratorSkill,
  healthPingCheckSkill,
  backupSchedulerSkill,
  sqlInjectionScannerSkill,
  anomalyDetectorSkill,
  sqlParserSkill,
  indexInspectorSkill,
  tableSizeEstimatorSkill,
  crossJoinDetectorSkill,
  schemaDependencySkill,
  sqlSanitizerSkill,
  indexSuggesterSkill,
  rawSchemaExtractorSkill,
  
  // Agents IA
  aiCostNegotiatorAgent,
  aiSecurityGuardianAgent,
  aiAutoRecoveryAgent,
  aiSqlQueryOptimizerAgent,
  aiDatabaseArchitectAgent,
  aiQueryRouterSupervisorAgent,
  aiSchemaConverterAgent,
  
  multiAgentConsensusSuite,
  HeliumDebateEngine,
  HeliumProxyServer,
  ProxyConfigSchema,
  ShardConfigSchema
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
  sqlParserSkill,
  indexInspectorSkill,
  tableSizeEstimatorSkill,
  crossJoinDetectorSkill,
  schemaDependencySkill,
  sqlSanitizerSkill,
  indexSuggesterSkill,
  rawSchemaExtractorSkill,
  ...multiAgentConsensusSuite
];

console.log("Suite Helium DB élargie : 20 Outils Système, 17 Agents d'orchestration (Locaux et IA).");