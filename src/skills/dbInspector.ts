import pg from 'pg';
const { Client } = pg;

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