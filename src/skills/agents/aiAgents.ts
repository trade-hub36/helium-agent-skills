import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialisation de l'API gratuite Gemini (utilise gemini-2.5-flash par défaut, rapide et gratuit)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface AIAgentResponse {
  agentName: string;
  verdict: string;
  data: any;
}

/**
 * 1. Agent IA : Cost-Efficiency Negotiator
 */
export const aiCostNegotiatorAgent = {
  name: 'Cost-Efficiency Negotiator (AI)',
  async run(input: { currentConfig: string; databaseSizeMb: number }): Promise<AIAgentResponse> {
    if (!process.env.GEMINI_API_KEY) {
      return {
        agentName: this.name,
        verdict: "[Mode Simulé - Clé API absente] Réduire la taille des tables de logs pour tenir sous les 512 Mo chez Neon.",
        data: { warning: "Configure GEMINI_API_KEY dans ton .env pour de vraies prédictions IA." }
      };
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `En tant qu'architecte Cloud FinOps Database, analyse cette configuration : ${input.currentConfig} avec une taille de base de ${input.databaseSizeMb}MB. Propose un plan strict pour exploiter au maximum les Free Tiers de Neon, Supabase ou Render sans jamais payer 1$. Rends ta réponse concise sous format JSON avec les clés "verdict" et "actionItems".`
      });

      const text = response.text || '{}';
      // Tentative de parsing propre du JSON renvoyé par l'IA
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      return {
        agentName: this.name,
        verdict: parsed.verdict || "Plan d'optimisation généré.",
        data: parsed
      };
    } catch (e: any) {
      return { agentName: this.name, verdict: "Erreur de génération IA.", data: { error: e.message } };
    }
  }
};

/**
 * 2. Agent IA : Security Guardian Agent
 */
export const aiSecurityGuardianAgent = {
  name: 'Security Guardian Agent (AI)',
  async run(input: { queriesToAnalyze: string[] }): Promise<AIAgentResponse> {
    if (!process.env.GEMINI_API_KEY) {
      return {
        agentName: this.name,
        verdict: "[Mode Simulé] Aucune faille critique détectée statiquement dans les requêtes fournies.",
        data: { status: 'SAFE' }
      };
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `En tant qu'expert en sécurité des bases de données et cyber-défense, analyse ces requêtes : ${JSON.stringify(input.queriesToAnalyze)}. Détecte les injections SQL, les fuites potentielles de données personnelles (PII) ou les accès non sécurisés. Renvoie un JSON contenant le niveau de menace global ("LOW", "MEDIUM", "HIGH") et un tableau de conseils de remédiation sous la clé "recommendations".`
      });

      const parsed = JSON.parse((response.text || '{}').replace(/```json|```/g, '').trim());
      return {
        agentName: this.name,
        verdict: `Analyse de sécurité terminée. Risque : ${parsed.securityLevel || 'LOW'}.`,
        data: parsed
      };
    } catch (e: any) {
      return { agentName: this.name, verdict: "Analyse de sécurité interrompue.", data: { error: e.message } };
    }
  }
};
// ==========================================
// 4 NOUVEAUX AGENTS IA GRATUITS (GEMINI)
// ==========================================

/**
 * 1. AI SQL Query Optimizer Agent
 */
export const aiSqlQueryOptimizerAgent = {
  name: 'AI SQL Query Optimizer Agent (AI)',
  async run(input: { slowQuery: string }): Promise<AIAgentResponse> {
    if (!process.env.GEMINI_API_KEY) {
      return {
        agentName: this.name,
        verdict: "[Mode Simulé] Optimisation SQL recommandée : Utiliser une jointure explicite et indexer les clés de filtre.",
        data: { queryOptimized: input.slowQuery }
      };
    }
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `En tant qu'expert en optimisation de requêtes SQL de haut niveau, analyse cette requête lente : "${input.slowQuery}". Réécris-la de manière optimisée et explique pourquoi. Renvoie uniquement un JSON propre avec les clés "optimizedSql" et "explanation".`
      });
      const parsed = JSON.parse((response.text || '{}').replace(/```json|```/g, '').trim());
      return { agentName: this.name, verdict: "Optimisation de la requête réussie par l'IA.", data: parsed };
    } catch (e: any) {
      return { agentName: this.name, verdict: "Échec de l'optimisation IA.", data: { error: e.message } };
    }
  }
};

/**
 * 2. AI Database Architect Agent (Sharding Planner)
 */
export const aiDatabaseArchitectAgent = {
  name: 'AI Database Architect Agent (AI)',
  async run(input: { schemaDetails: string }): Promise<AIAgentResponse> {
    if (!process.env.GEMINI_API_KEY) {
      return {
        agentName: this.name,
        verdict: "[Mode Simulé] Plan de sharding recommandé : Isoler la table 'logs' et 'orders'.",
        data: { strategy: 'Functional Sharding' }
      };
    }
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `En tant qu'architecte de base de données principal spécialisé dans la mise à l'échelle horizontale, analyse ce schéma : ${input.schemaDetails}. Suggère une architecture de Sharding logique ou physique (par clé, par date ou par tenant). Renvoie un JSON contenant les clés "strategy", "shardingKey" et "riskAnalysis".`
      });
      const parsed = JSON.parse((response.text || '{}').replace(/```json|```/g, '').trim());
      return { agentName: this.name, verdict: `L'architecte recommande la stratégie de partition : ${parsed.strategy}.`, data: parsed };
    } catch (e: any) {
      return { agentName: this.name, verdict: "Impossible de générer l'architecture par l'IA.", data: { error: e.message } };
    }
  }
};

/**
 * 3. AI Query Router Supervisor Agent
 */
export const aiQueryRouterSupervisorAgent = {
  name: 'AI Query Router Supervisor Agent (AI)',
  async run(input: { incomingQuery: string; activeShards: string[] }): Promise<AIAgentResponse> {
    if (!process.env.GEMINI_API_KEY) {
      return {
        agentName: this.name,
        verdict: "[Mode Simulé] Proxy de routage : Diriger vers le shard par défaut 'mother-db'.",
        data: { targetShard: 'mother-db' }
      };
    }
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Tu es le superviseur d'aiguillage d'un proxy SQL intelligent. Analyse la requête suivante : "${input.incomingQuery}" face aux Shards disponibles : ${JSON.stringify(input.activeShards)}. Détermine vers quel Shard cette requête doit être routée pour un traitement optimal. Renvoie un JSON avec les clés "targetShard" et "reasoning".`
      });
      const parsed = JSON.parse((response.text || '{}').replace(/```json|```/g, '').trim());
      return { agentName: this.name, verdict: `Routage intelligent supervisé vers : ${parsed.targetShard}.`, data: parsed };
    } catch (e: any) {
      return { agentName: this.name, verdict: "Aiguillage par défaut activé.", data: { error: e.message } };
    }
  }
};

/**
 * 4. AI Database Schema Converter Agent (MySQL to PG / Mongo to SQL)
 */
export const aiSchemaConverterAgent = {
  name: 'AI Schema Converter Agent (AI)',
  async run(input: { sourceSchema: string; targetDialect: string }): Promise<AIAgentResponse> {
    if (!process.env.GEMINI_API_KEY) {
      return {
        agentName: this.name,
        verdict: `[Mode Simulé] Conversion vers ${input.targetDialect} réussie.`,
        data: { schemaConverted: true }
      };
    }
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `En tant qu'ingénieur de migration de données senior, convertis ce schéma source : "${input.sourceSchema}" vers le dialecte "${input.targetDialect}". Conserve l'intégrité des données et des clés. Renvoie un JSON contenant les clés "convertedDdl" et "migrationWarnings".`
      });
      const parsed = JSON.parse((response.text || '{}').replace(/```json|```/g, '').trim());
      return { agentName: this.name, verdict: "Migration et conversion de dialecte réussies.", data: parsed };
    } catch (e: any) {
      return { agentName: this.name, verdict: "Échec de la conversion de schéma.", data: { error: e.message } };
    }
  }
};
/**
 * 3. Agent IA : Auto-Recovery Agent
 */
export const aiAutoRecoveryAgent = {
  name: 'Auto-Recovery Agent (AI)',
  async run(input: { failingShardName: string; failureReason: string }): Promise<AIAgentResponse> {
    if (!process.env.GEMINI_API_KEY) {
      return {
        agentName: this.name,
        verdict: `[Mode Simulé] Le Shard "${input.failingShardName}" est inaccessible (${input.failureReason}). Basculement temporaire de tout le trafic vers la Base Mère (Mother-DB) activé.`,
        data: { circuitBreakerTriggered: true }
      };
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Le Shard de base de données "${input.failingShardName}" vient de tomber en panne. Raison reportée : "${input.failureReason}". En tant qu'expert en résilience de base de données et SRE, rédige un guide d'auto-réparation immédiat et configure la stratégie de secours du proxy (failover). Renvoie un JSON contenant les clés "instantMitigation" et "failoverAction".`
      });

      const parsed = JSON.parse((response.text || '{}').replace(/```json|```/g, '').trim());
      return {
        agentName: this.name,
        verdict: parsed.instantMitigation || "Procédure d'urgence activée.",
        data: parsed
      };
    } catch (e: any) {
      return { agentName: this.name, verdict: "Impossible de générer le plan d'auto-récupération.", data: { error: e.message } };
    }
  }
};