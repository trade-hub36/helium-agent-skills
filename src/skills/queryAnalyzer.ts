export interface QueryAnalyzerArgs {
  queries: string[];
}

export const queryAnalyzerSkill = {
  name: 'queryAnalyzer',
  description: 'Analyse un historique de requêtes SQL pour détecter les tables subissant une forte charge de lecture (Read-heavy) ou d\'écriture (Write-heavy).',
  schema: {
    type: 'object',
    properties: {
      queries: {
        type: 'array',
        items: { type: 'string' },
        description: 'Tableau contenant les requêtes SQL à analyser'
      }
    },
    required: ['queries']
  },

  async run(args: QueryAnalyzerArgs): Promise<string> {
    const stats: Record<string, { reads: number; writes: number }> = {};
    
    // Regex simplifiées pour extraire les tables
    const readRegex = /\bfrom\s+([a-zA-Z0-9_"\.]+)/gi;
    const insertRegex = /\binto\s+([a-zA-Z0-9_"\.]+)/gi;
    const updateRegex = /\bupdate\s+([a-zA-Z0-9_"\.]+)/gi;
    const deleteRegex = /\bfrom\s+([a-zA-Z0-9_"\.]+)/gi;

    for (const query of args.queries) {
      const q = query.toLowerCase().trim();
      let isWrite = false;
      const tableMatches: string[] = [];

      if (q.startsWith('select')) {
        let match;
        while ((match = readRegex.exec(q)) !== null) {
          tableMatches.push(match[1]);
        }
      } else if (q.startsWith('insert')) {
        isWrite = true;
        let match;
        while ((match = insertRegex.exec(q)) !== null) {
          tableMatches.push(match[1]);
        }
      } else if (q.startsWith('update')) {
        isWrite = true;
        let match;
        while ((match = updateRegex.exec(q)) !== null) {
          tableMatches.push(match[1]);
        }
      } else if (q.startsWith('delete')) {
        isWrite = true;
        let match;
        while ((match = deleteRegex.exec(q)) !== null) {
          tableMatches.push(match[1]);
        }
      }

      for (const table of tableMatches) {
        const cleanTable = table.replace(/['`"]/g, '');
        if (!stats[cleanTable]) {
          stats[cleanTable] = { reads: 0, writes: 0 };
        }
        if (isWrite) {
          stats[cleanTable].writes += 1;
        } else {
          stats[cleanTable].reads += 1;
        }
      }
    }

    return JSON.stringify({
      totalQueriesAnalyzed: args.queries.length,
      tableMetrics: stats
    }, null, 2);
  }
};