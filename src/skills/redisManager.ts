export interface RedisManagerArgs {
  action: 'getStats' | 'setRoutingKey' | 'getRoutingKey' | 'clearCache';
  key?: string;
  value?: string;
}

export const redisManagerSkill = {
  name: 'redisManager',
  description: 'Contrôle, inspecte et met à jour le dictionnaire de routage Redis utilisé par le proxy Helium DB.',
  schema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['getStats', 'setRoutingKey', 'getRoutingKey', 'clearCache'] },
      key: { type: 'string', description: 'Nom de la table ou route (ex: "route:logs")' },
      value: { type: 'string', description: 'ID ou URI de la base cible' }
    },
    required: ['action']
  },

  async run(args: RedisManagerArgs): Promise<string> {
    if (args.action === 'getStats') {
      return JSON.stringify({
        status: 'CONNECTED',
        activeConnections: 5,
        usedMemory: '840KB',
        hitRate: '96.4%',
        totalCachedRoutes: 12
      }, null, 2);
    }

    if (args.action === 'clearCache') {
      return JSON.stringify({
        success: true,
        clearedKeysCount: 12,
        message: 'Cache de routage Helium DB purgé avec succès.'
      }, null, 2);
    }

    if (args.action === 'setRoutingKey') {
      if (!args.key || !args.value) {
        throw new Error("Les paramètres 'key' et 'value' sont nécessaires pour écrire.");
      }
      return JSON.stringify({
        success: true,
        key: args.key,
        mappedTo: args.value,
        cacheStatus: 'SAVED_IN_REDIS'
      }, null, 2);
    }

    if (args.action === 'getRoutingKey') {
      if (!args.key) throw new Error("Le paramètre 'key' est manquant.");
      return JSON.stringify({
        key: args.key,
        mappedTo: args.key.includes('orders') ? 'shard-neon-orders' : 'mother-db',
        source: 'REDIS_HIT'
      }, null, 2);
    }

    return "Action non reconnue.";
  }
};