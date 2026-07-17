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