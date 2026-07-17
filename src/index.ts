import { fileManagerSkill } from './skills/fileManager.js';
import { dbInspectorSkill } from './skills/dbInspector.js';
import { multiAgentConsensusSuite } from './skills/agents/consensusAgents.js';
export { 
  fileManagerSkill, 
  dbInspectorSkill,
  multiAgentConsensusSuite
};

// Export d'une liste unifiée de l'intégralité des fonctionnalités de l'écosystème Helium
export const heliumSkills = [
  fileManagerSkill,
  dbInspectorSkill,
  ...multiAgentConsensusSuite
];

console.log("Suite logicielle Helium Agent : Outils et 10 Agents de Consensus importés.");