import express from 'express';
import { createClient } from 'redis';
import { ProxyConfig } from './types.js';
import { QueryParser } from './queryParser.js';
import { ShardConnectionPool } from './connectionPool.js';

export class HeliumProxyServer {
  private app = express();
  private redisClient: ReturnType<typeof createClient>;
  private shardPools = new Map<string, ShardConnectionPool>();
  private motherPool: ShardConnectionPool;
  private config: ProxyConfig;

  constructor(config: ProxyConfig) {
    this.config = config;
    
    // Initialiser le client Redis avec désactivation des reconnexions en boucle
    this.redisClient = createClient({ 
      url: config.redisUri,
      socket: {
        reconnectStrategy: false // Empêche de tenter de se reconnecter à l'infini
      }
    });

    // Log discret pour éviter de saturer la console
    this.redisClient.on('error', (err) => {
      // N'affiche l'erreur que si Redis était actif et s'est coupé brusquement
      if (this.redisClient.isOpen) {
        console.error('[Redis Error]:', err.message);
      }
    });

    // Initialiser les Pools de connexion vers les Shards
    config.shards.forEach(shard => {
      this.shardPools.set(shard.id, new ShardConnectionPool(shard));
    });

    // Pool vers la Base Mère
    this.motherPool = new ShardConnectionPool({
      id: 'mother-db',
      connectionString: config.motherDbUri,
      region: 'main',
      weight: 1,
      maxConnections: 20
    });

    this.setupMiddlewares();
    this.setupRoutes();
  }

  private setupMiddlewares() {
    this.app.use(express.json());
  }

  private setupRoutes() {
    // Point d'entrée de requêtes SQL du Proxy
    this.app.post('/query', async (req, res) => {
      const { sql, params = [] } = req.body;

      if (!sql) {
        return res.status(400).json({ error: "Le paramètre 'sql' est obligatoire." });
      }

      try {
        // 1. Analyse statique de la requête
        const analysis = QueryParser.analyze(sql, this.config.routeRules);

        // Bloquer les requêtes dangereuses faisant des jointures inter-shards
        if (analysis.isCrossShardRisk) {
          return res.status(400).json({
            error: "Requête bloquée : Les jointures inter-shards physiques ne sont pas autorisées par le Proxy.",
            analysis
          });
        }

        // 2. Déterminer la cible (Routing)
        let targetPool = this.motherPool;
        let targetName = 'mother-db';

        if (analysis.tables.length > 0) {
          const firstTable = analysis.tables[0];
          const targetShardId = this.config.routeRules[firstTable];

          if (targetShardId && this.shardPools.has(targetShardId)) {
            targetPool = this.shardPools.get(targetShardId)!;
            targetName = targetShardId;
          }
        }

        // 3. Gestion du Cache Redis pour les lectures (SÉCURISÉ)
        const cacheKey = `query-cache:${targetName}:${Buffer.from(sql).toString('base64')}`;
        
        if (analysis.operation === 'SELECT' && this.redisClient.isOpen) {
          try {
            const cachedResult = await this.redisClient.get(cacheKey);
            if (cachedResult) {
              return res.json({
                source: 'REDIS_CACHE',
                target: targetName,
                data: JSON.parse(cachedResult)
              });
            }
          } catch (err) {
            console.error('[Redis Read Error]:', err);
          }
        }

        // 4. Exécution de la requête sur la cible résolue
        const queryResult = await targetPool.query(analysis.sanitizedSql, params);

        // 5. Enregistrement en cache si c'est une lecture réussie (SÉCURISÉ)
        if (analysis.operation === 'SELECT' && queryResult.rows.length > 0 && this.redisClient.isOpen) {
          try {
            // Mise en cache pendant 60 secondes
            await this.redisClient.setEx(cacheKey, 60, JSON.stringify(queryResult.rows));
          } catch (err) {
            console.error('[Redis Write Error]:', err);
          }
        }

        // Réponse finale au client
        return res.json({
          source: 'LIVE_DATABASE',
          target: targetName,
          data: queryResult.rows,
          rowCount: queryResult.rowCount
        });

      } catch (error: any) {
        console.error('[Proxy Execution Error]:', error.message);
        return res.status(500).json({ error: error.message });
      }
    });

    // Route d'état pour ton tableau de bord
    this.app.get('/health', async (req, res) => {
      res.json({
        status: 'ONLINE',
        shardsActive: Array.from(this.shardPools.keys()),
        routeRules: this.config.routeRules
      });
    });
  }

  async start() {
    try {
      await this.redisClient.connect();
      console.log("ℹ️ Connected to Redis Cache");
    } catch (err) {
      console.warn("⚠️ Redis indisponible. Le proxy fonctionnera sans système de cache.");
    }
    
    this.app.listen(this.config.port, () => {
      console.log(`🚀 [Helium Routing Proxy] démarré sur le port ${this.config.port}`);
    });
  }

  async stop() {
    if (this.redisClient.isOpen) {
      await this.redisClient.disconnect();
    }
    await this.motherPool.close();
    for (const pool of this.shardPools.values()) {
      await pool.close();
    }
  }
}