export interface LatencyBenchmarkerArgs {
  targetRegions: string[];
}

export const latencyBenchmarkerSkill = {
  name: 'latencyBenchmarker',
  description: 'Mesure et estime la latence réseau théorique du point d\'accès de ton proxy Helium DB vers différentes régions cloud.',
  schema: {
    type: 'object',
    properties: {
      targetRegions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Exemple : ["us-east-1", "eu-west-3", "ap-southeast-1"]'
      }
    },
    required: ['targetRegions']
  },

  async run(args: LatencyBenchmarkerArgs): Promise<string> {
    // Profil de latence typique (par exemple depuis une passerelle au Maroc / Europe)
    const latencyDatabase: Record<string, number> = {
      'eu-west-3': 22,      // Paris (proche Maroc)
      'eu-central-1': 35,   // Francfort
      'us-east-1': 78,      // Virginie
      'us-west-2': 140,     // Oregon
      'ap-southeast-1': 210 // Singapour
    };

    const results = args.targetRegions.map(region => {
      const r = region.toLowerCase().trim();
      const delay = latencyDatabase[r] || 115;
      return {
        region,
        estimatedLatencyMs: delay,
        performanceGrade: delay < 40 ? 'EXCELLENT' : delay < 90 ? 'ACCEPTABLE' : 'POOR_LATENCY'
      };
    });

    return JSON.stringify({
      timestamp: new Date().toISOString(),
      results,
      bestRoutingTarget: results.reduce((prev, curr) => prev.estimatedLatencyMs < curr.estimatedLatencyMs ? prev : curr).region
    }, null, 2);
  }
};