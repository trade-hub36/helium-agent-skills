import pg from 'pg';
const { Client } = pg;

export interface DbInspectorArgs {
  connectionString: string;
  action: 'getSchemas' | 'getTables' | 'getTableDetails' | 'inspectSchema';
  tableName?: string;
}

/**
 * Inspecte la structure des tables publiques d'une base de données PostgreSQL/Neon.
 * @param connectionString URI de connexion à la base de données
 */
export async function inspectDatabaseSchema(connectionString: string): Promise<{ success: boolean; schema?: Record<string, any[]>; error?: string }> {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    
    // Requête système pour récupérer les tables, colonnes et types
    const query = `
      SELECT 
        table_name, 
        column_name, 
        data_type, 
        is_nullable
      FROM 
        information_schema.columns
      WHERE 
        table_schema = 'public'
      ORDER BY 
        table_name, ordinal_position;
    `;
    
    const res = await client.query(query);
    
    // Regroupement des données par table
    const schema: Record<string, any[]> = {};
    for (const row of res.rows) {
      if (!schema[row.table_name]) {
        schema[row.table_name] = [];
      }
      schema[row.table_name].push({
        column: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES'
      });
    }

    return { success: true, schema };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

/**
 * Skill d'inspection PostgreSQL pour l'agent Helium.
 */
export const dbInspectorSkill = {
  name: 'dbInspector',
  description: 'Permet d\'inspecter une base de données PostgreSQL (schémas, tables, colonnes et types).',
  schema: {
    type: 'object',
    properties: {
      connectionString: { type: 'string', description: 'URI de connexion PostgreSQL' },
      action: { type: 'string', enum: ['getSchemas', 'getTables', 'getTableDetails', 'inspectSchema'] },
      tableName: { type: 'string', description: 'Nom de la table (uniquement pour getTableDetails)' }
    },
    required: ['connectionString', 'action']
  },

  async run(args: DbInspectorArgs): Promise<string> {
    const client = new Client({ connectionString: args.connectionString });

    try {
      // Nouvelle action utilisant ta fonction optimisée
      if (args.action === 'inspectSchema') {
        const result = await inspectDatabaseSchema(args.connectionString);
        if (!result.success) {
          throw new Error(result.error);
        }
        return JSON.stringify(result.schema, null, 2);
      }

      await client.connect();

      if (args.action === 'getSchemas') {
        const res = await client.query(`
          SELECT schema_name FROM information_schema.schemata 
          WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
        `);
        return JSON.stringify(res.rows, null, 2);
      }

      if (args.action === 'getTables') {
        const res = await client.query(`
          SELECT table_schema, table_name FROM information_schema.tables 
          WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        `);
        return JSON.stringify(res.rows, null, 2);
      }

      if (args.action === 'getTableDetails') {
        if (!args.tableName) throw new Error("Le paramètre tableName est requis.");
        const res = await client.query(`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = $1 AND table_schema = 'public'
        `, [args.tableName]);
        return JSON.stringify(res.rows, null, 2);
      }

      return "Action non reconnue.";
    } catch (error: any) {
      return `Erreur : ${error.message}`;
    } finally {
      // On s'assure d'exécuter client.end() uniquement si la connexion a été ouverte localement ici
      if (args.action !== 'inspectSchema') {
        await client.end();
      }
    }
  }
};