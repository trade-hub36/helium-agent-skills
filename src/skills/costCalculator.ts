export interface CostCalculatorArgs {
  databaseSizeInMb: number;
  monthlyQueriesCount: number;
}

export const costCalculatorSkill = {
  name: 'costCalculator',
  description: 'Évalue et compare la compatibilité et les coûts estimés de tes Shards sur les plans gratuits de Neon, Supabase et Render.',
  schema: {
    type: 'object',
    properties: {
      databaseSizeInMb: { type: 'number', description: 'Taille totale estimée des tables en Mo' },
      monthlyQueriesCount: { type: 'number', description: 'Volume de requêtes estimé par mois' }
    },
    required: ['databaseSizeInMb', 'monthlyQueriesCount']
  },

  async run(args: CostCalculatorArgs): Promise<string> {
    const { databaseSizeInMb, monthlyQueriesCount } = args;

    const evaluation = [
      {
        provider: 'Neon',
        freeTierLimitSizeMb: 512,
        isEligible: databaseSizeInMb <= 512,
        notes: 'Excellent pour le partitionnement géographique temporaire grâce à l\'autoscaling.'
      },
      {
        provider: 'Supabase',
        freeTierLimitSizeMb: 500,
        isEligible: databaseSizeInMb <= 500,
        notes: 'Idéal si les tables nécessitent des extensions PostgreSQL spécifiques.'
      },
      {
        provider: 'Render (PostgreSQL)',
        freeTierLimitSizeMb: 1024,
        isEligible: databaseSizeInMb <= 1024,
        notes: 'La base expire après 90 jours. À réserver uniquement pour l\'environnement Dev.'
      }
    ];

    return JSON.stringify({
      inputMetrics: { databaseSizeInMb, monthlyQueriesCount },
      providersEvaluation: evaluation,
      recommendation: databaseSizeInMb > 500
        ? 'La taille totale dépasse le quota gratuit unifié. Recommandation : Activer le sharding applicatif sur 2 instances Neon gratuites distinctes pour diviser le stockage.'
        : 'La base s\'intègre parfaitement dans les limites gratuites standards.'
    }, null, 2);
  }
};