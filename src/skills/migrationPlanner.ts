export interface MigrationPlannerArgs {
  tableName: string;
  sourceShard: string;
  targetShard: string;
}

export const migrationPlannerSkill = {
  name: 'migrationPlanner',
  description: 'Génère un plan de migration technique détaillé avec double-écriture pour isoler une table sans interruption.',
  schema: {
    type: 'object',
    properties: {
      tableName: { type: 'string', description: 'Table à migrer (ex: "orders")' },
      sourceShard: { type: 'string', description: 'Nom de la base d\'origine' },
      targetShard: { type: 'string', description: 'Nom de la base cible' }
    },
    required: ['tableName', 'sourceShard', 'targetShard']
  },

  async run(args: MigrationPlannerArgs): Promise<string> {
    const steps = [
      {
        step: 1,
        title: 'Mise en place de la Double Écriture (Dual-Write)',
        details: `Configurer le proxy Helium DB pour dupliquer en temps réel chaque INSERT/UPDATE/DELETE sur "${args.tableName}" vers les bases "${args.sourceShard}" et "${args.targetShard}". Les lectures pointent toujours sur "${args.sourceShard}".`
      },
      {
        step: 2,
        title: 'Migration à froid historique (Backfill)',
        details: `Lancer l'extraction des lignes préexistantes de "${args.sourceShard}" et les réinjecter dans "${args.targetShard}" avec une clause "ON CONFLICT DO NOTHING" pour ne pas écraser les écritures dynamiques de l'étape 1.`
      },
      {
        step: 3,
        title: 'Validation de la cohérence (Checksum)',
        details: 'Comparer le nombre total de lignes et exécuter un test de hachage aléatoire pour confirmer que les données sont identiques.'
      },
      {
        step: 4,
        title: 'Bascule de lecture (Cutover)',
        details: `Rediriger instantanément les flux de lecture (SELECT) vers "${args.targetShard}".`
      },
      {
        step: 5,
        title: 'Nettoyage des ressources',
        details: `Désactiver l'écriture double sur "${args.sourceShard}" et purger la table historique après un délai de sécurité de 48 heures.`
      }
    ];

    return JSON.stringify({
      table: args.tableName,
      migrationStrategy: 'Double-Write Pattern (Zero-Downtime)',
      estimatedRequiredTimeMin: 15,
      steps
    }, null, 2);
  }
};