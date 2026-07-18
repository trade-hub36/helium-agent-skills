import { HeliumProxyServer } from './src/index';
const config = {
  port: 4000,
  motherDbUri: "postgresql://localhost:5432/helium_mother",
  redisUri: "redis://localhost:6379",
  shards: [
    {
      id: "shard-neon-orders",
      connectionString: "postgresql://localhost:5432/neon_orders_db",
      region: "eu-west-3",
      weight: 1,
      maxConnections: 10
    },
    {
      id: "shard-supabase-logs",
      connectionString: "postgresql://localhost:5432/supabase_logs_db",
      region: "us-east-1",
      weight: 1,
      maxConnections: 5
    }
  ],
  routeRules: {
    "orders": "shard-neon-orders",
    "logs": "shard-supabase-logs",
    "users": "mother-db"
  }
};

const proxy = new HeliumProxyServer(config);
proxy.start().catch(console.error);