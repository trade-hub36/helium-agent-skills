/**
 * Inspecte la structure des tables publiques d'une base de données PostgreSQL/Neon.
 * @param connectionString URI de connexion à la base de données
 */
export declare function inspectDatabaseSchema(connectionString: string): Promise<{
    success: boolean;
    schema?: Record<string, any[]>;
    error?: string;
}>;
