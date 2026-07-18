import pg from 'pg';
import { ShardConfig } from './types.js';

export class ShardConnectionPool {
  private pool: pg.Pool;
  private shardId: string;
  private state: 'CLOSED' | 'OPEN' | 'HALF-OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold = 3; // Coupe après 3 erreurs
  private readonly cooldownPeriod = 30000; // Attend 30 secondes avant de retester (Half-Open)

  constructor(config: ShardConfig) {
    this.shardId = config.id;
    this.pool = new pg.Pool({
      connectionString: config.connectionString,
      max: config.maxConnections,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000 // Timeout rapide
    });

    this.pool.on('error', (err) => {
      console.error(`[Pool Error - Shard: ${this.shardId}]:`, err.message);
      this.onFailure();
    });
  }

  /**
   * Exécute une requête SQL de manière sécurisée
   */
  async query(sql: string, params: any[] = []): Promise<pg.QueryResult> {
    this.checkCircuitState();

    if (this.state === 'OPEN') {
      throw new Error(`[Circuit Breaker]: Le Shard "${this.shardId}" est temporairement indisponible (Circuit Ouvert).`);
    }

    try {
      const client = await this.pool.connect();
      try {
        const result = await client.query(sql, params);
        this.onSuccess();
        return result;
      } finally {
        client.release();
      }
    } catch (error: any) {
      this.onFailure();
      throw new Error(`[Shard: ${this.shardId}] Échec de la requête: ${error.message}`);
    }
  }

  private checkCircuitState() {
    if (this.state === 'OPEN' && Date.now() - this.lastFailureTime > this.cooldownPeriod) {
      this.state = 'HALF-OPEN';
      console.warn(`[Circuit Breaker - Shard: ${this.shardId}]: Tentative de reconnexion (Mode HALF-OPEN)...`);
    }
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.error(`[Circuit Breaker - Shard: ${this.shardId}]: SEUIL D'ERREURS ATTEINT. Le Shard est isolé !`);
    }
  }

  private onSuccess() {
    if (this.state === 'HALF-OPEN') {
      console.log(`[Circuit Breaker - Shard: ${this.shardId}]: Shard rétabli avec succès (Mode CLOSED).`);
    }
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  async close() {
    await this.pool.end();
  }
}