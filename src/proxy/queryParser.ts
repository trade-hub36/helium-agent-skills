export interface AnalyzedQuery {
  rawSql: string;
  sanitizedSql: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'DDL' | 'UNKNOWN';
  tables: string[];
  isCrossShardRisk: boolean;
}

export class QueryParser {
  /**
   * Nettoie et analyse une requête SQL brute
   */
  static analyze(sql: string, shardMapping: Record<string, string>): AnalyzedQuery {
    // Nettoyage des commentaires et espaces superflus
    const sanitized = sql
      .replace(/--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const upperSql = sanitized.toUpperCase();
    
    // Détection de l'opération principale
    let operation: AnalyzedQuery['operation'] = 'UNKNOWN';
    if (upperSql.startsWith('SELECT')) operation = 'SELECT';
    else if (upperSql.startsWith('INSERT')) operation = 'INSERT';
    else if (upperSql.startsWith('UPDATE')) operation = 'UPDATE';
    else if (upperSql.startsWith('DELETE')) operation = 'DELETE';
    else if (upperSql.startsWith('CREATE') || upperSql.startsWith('ALTER') || upperSql.startsWith('DROP')) {
      operation = 'DDL';
    }

    // Extraction basique des tables ciblées
    const tables: string[] = [];
    const tableRegex = /\b(?:FROM|JOIN|INSERT\s+INTO|UPDATE)\s+([a-zA-Z0-9_]+)/gi;
    let match;
    while ((match = tableRegex.exec(sanitized)) !== null) {
      const tableName = match[1].toLowerCase();
      if (!tables.includes(tableName)) {
        tables.push(tableName);
      }
    }

    // Détection du risque de jointure inter-shard (Cross-Shard Join)
    // Si la requête implique des tables associées à des Shards physiques distincts
    const shardsInvolved = tables
      .map(table => shardMapping[table])
      .filter(Boolean);
    
    const uniqueShards = Array.from(new Set(shardsInvolved));
    const isCrossShardRisk = uniqueShards.length > 1;

    return {
      rawSql: sql,
      sanitizedSql: sanitized,
      operation,
      tables,
      isCrossShardRisk
    };
  }
}