import { z } from 'zod';

// Schéma de configuration d'un Shard physique (ex: Neon, Supabase)
export const ShardConfigSchema = z.object({
  id: z.string(),
  connectionString: z.string().url(),
  region: z.string(),
  weight: z.number().default(1),
  maxConnections: z.number().default(10)
});

// Configuration globale du Proxy
export const ProxyConfigSchema = z.object({
  port: z.number().default(5432), // Port par défaut pour imiter Postgres
  motherDbUri: z.string().url(),
  redisUri: z.string().url(),
  shards: z.array(ShardConfigSchema),
  // Règles de routage par défaut pour les tables
  routeRules: z.record(z.string(), z.string()) // Ex: { "orders": "shard-neon", "users": "mother-db" }
});

export type ShardConfig = z.infer<typeof ShardConfigSchema>;
export type ProxyConfig = z.infer<typeof ProxyConfigSchema>;