import { 
  schemaExplorerAgent, 
  queryTrafficAgent, 
  writeLoadAgent, 
  skepticAgent, 
  zeroDowntimePlannerAgent, 
  leadAgent 
} from './consensusAgents.js';

// Nouveaux agents locaux importés
import {
  indexStrategistAgent,
  queryJoinAuditorAgent,
  volumetryMonitorAgent,
  schemaDependencyGuardAgent
} from './consensusAgents.js';

// Nouveaux agents IA importés
import { 
  aiCostNegotiatorAgent, 
  aiSecurityGuardianAgent, 
  aiAutoRecoveryAgent,
  aiSqlQueryOptimizerAgent,
  aiDatabaseArchitectAgent,
  aiQueryRouterSupervisorAgent,
  aiSchemaConverterAgent
} from './aiAgents.js';

export interface DebateSessionInput {
  connectionString: string;
  rawQueries: string[];
  targetRegions: string[];
}

export interface DebateLogMessage {
  timestamp: string;
  agentName: string;
  message: string;
  data?: any;
}

export class HeliumDebateEngine {
  private logs: DebateLogMessage[] = [];

  private log(agentName: string, message: string, data?: any) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      agentName,
      message,
      data
    });
  }

  async runConsensusDebate(input: DebateSessionInput): Promise<{
    success: boolean;
    debateLogs: DebateLogMessage[];
    finalReport: any;
  }> {
    this.log('System', 'Démarrage de la suite analytique Helium DB...');

    // TOUR 1 : ANALYSE STATIQUE DU LOG DE REQUÊTES ET SÉCURITÉ
    this.log('System', '--- TOUR 1 : LECTURE DU SCHÉMA ET ANALYSE SYNTAXIQUE ---');
    const step1Result = await schemaExplorerAgent.run({ rawSchemaInfo: input.connectionString });
    this.log(step1Result.agentName, step1Result.verdict);

    // Audit des Jointures SQL potentiellement critiques (Jointures inter-shards)
    const joinAuditor = await queryJoinAuditorAgent.run({ sql: input.rawQueries[0] });
    this.log(joinAuditor.agentName, joinAuditor.verdict);

    // AI SQL Optimizer intervient pour examiner la requête la plus lente
    const aiSqlOptimizer = await aiSqlQueryOptimizerAgent.run({ slowQuery: input.rawQueries[0] });
    this.log(aiSqlOptimizer.agentName, aiSqlOptimizer.verdict, aiSqlOptimizer.data);


    // TOUR 2 : ANALYSE VOLUMÉTRIQUE ET ARCHITECTURE SHARDING
    this.log('System', '--- TOUR 2 : VOLUMÉTRIE ET PLANIFICATION DE L\'ARCHITECTURE (IA) ---');
    const volResult = await volumetryMonitorAgent.run({ tableSizes: "orders: 1.2M rows" });
    this.log(volResult.agentName, volResult.verdict);

    // L'architecte IA planifie le partitionnement idéal
    const aiArchitect = await aiDatabaseArchitectAgent.run({ schemaDetails: "users(id), orders(id, user_id), logs(id, message)" });
    this.log(aiArchitect.agentName, aiArchitect.verdict, aiArchitect.data);

    // L'agent superviseur IA valide la direction des requêtes vers le futur proxy
    const aiRouter = await aiQueryRouterSupervisorAgent.run({ 
      incomingQuery: input.rawQueries[0], 
      activeShards: ['mother-db', 'shard-neon-orders'] 
    });
    this.log(aiRouter.agentName, aiRouter.verdict, aiRouter.data);


    // TOUR 3 : PRÉPARATION DE LA MIGRATION ET DU CONVERTISSEUR DE SCHÉMA
    this.log('System', '--- TOUR 3 : PRÉPARATION ET MIGRATION ---');
    const step8Result = await zeroDowntimePlannerAgent.run({ migrationComplexity: 'medium' });
    this.log(step8Result.agentName, step8Result.verdict);

    // AI Schema Converter prépare le DDL cible
    const aiConverter = await aiSchemaConverterAgent.run({ 
      sourceSchema: "CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY)", 
      targetDialect: "PostgreSQL" 
    });
    this.log(aiConverter.agentName, aiConverter.verdict, aiConverter.data);


    // SYNTHÈSE FINALE DU CONSEIL
    this.log('System', '--- COMPTE RENDU DE CONCILIATION MULTI-AGENTS ---');
    const finalReportResult = await leadAgent.run({ agentResponses: JSON.stringify(this.logs) });
    this.log(finalReportResult.agentName, finalReportResult.verdict, finalReportResult.data);

    return {
      success: true,
      debateLogs: this.logs,
      finalReport: finalReportResult.data
    };
  }
}