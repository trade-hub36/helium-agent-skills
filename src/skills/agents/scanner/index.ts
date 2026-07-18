import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProjectMetadata, TableSummary } from './types.js';

export class HeliumProjectScanner {
  private rootDir: string;
  private aiClient?: GoogleGenerativeAI;

  constructor(rootDir: string = process.cwd()) {
    this.rootDir = rootDir;
    
    // Si la variable n'est pas chargée, on tente de lire manuellement le fichier .env
    if (!process.env.GEMINI_API_KEY) {
      const envPath = path.join(this.rootDir, '.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/^GEMINI_API_KEY\s*=\s*(.*)$/m);
        if (match && match[1]) {
          process.env.GEMINI_API_KEY = match[1].trim().replace(/['"]/g, '');
        }
      }
    }

    if (process.env.GEMINI_API_KEY) {
      // Un seul argument pour respecter la signature stricte du constructeur
      this.aiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  /**
   * Phase 1 : Analyse de l'environnement et de la stack du développeur
   */
  public async analyzeLocalProject(): Promise<ProjectMetadata> {
    const packageJsonPath = path.join(this.rootDir, 'package.json');
    let dependencies: Record<string, string> = {};
    let name = 'unknown-project';

    if (fs.existsSync(packageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      name = pkg.name || name;
      dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
    }

    // Détection basique du Framework
    let framework = 'Vanilla Node.js';
    if (dependencies['next']) framework = 'Next.js';
    else if (dependencies['react']) framework = 'React.js';
    else if (dependencies['@nestjs/core']) framework = 'NestJS';
    else if (dependencies['express']) framework = 'Express';

    // Détection de l'ORM / Outil DB
    let databaseORM: ProjectMetadata['databaseORM'] = 'Unknown';
    if (dependencies['@prisma/client']) databaseORM = 'Prisma';
    else if (dependencies['drizzle-orm']) databaseORM = 'Drizzle';
    else if (dependencies['mongoose']) databaseORM = 'Mongoose';
    else if (dependencies['pg'] || dependencies['mysql2']) databaseORM = 'Raw-SQL';

    // Détection du langage dominant
    const tsconfigExists = fs.existsSync(path.join(this.rootDir, 'tsconfig.json'));
    const language = tsconfigExists ? 'TypeScript' : 'JavaScript';

    // Compte des fichiers pertinents (en ignorant les dossiers lourds)
    const files = await glob('**/*.{ts,js,json,prisma}', {
      cwd: this.rootDir,
      ignore: ['node_modules/**', 'dist/**', '.git/**', '.next/**']
    });

    return {
      name,
      framework,
      language,
      databaseORM,
      dependencies,
      totalFiles: files.length
    };
  }

  /**
   * Phase 2 : Scan du schéma de base de données (Exemple d'extraction mockée/Prisma)
   */
  public async scanDatabaseSchema(): Promise<TableSummary[]> {
    const prismaSchemaPath = path.join(this.rootDir, 'prisma', 'schema.prisma');
    
    if (fs.existsSync(prismaSchemaPath)) {
      const content = fs.readFileSync(prismaSchemaPath, 'utf-8');
      const modelMatches = [...content.matchAll(/model\s+(\w+)\s+{([\s\S]*?)}/g)];
      
      return modelMatches.map(match => {
        const tableName = match[1];
        const body = match[2];
        const columns = [...body.matchAll(/^\s+(\w+)\s+\w+/gm)].map(m => m[1]);
        
        let rowCountEstimate = 1000;
        if (tableName.toLowerCase().includes('log') || tableName.toLowerCase().includes('session')) {
          rowCountEstimate = 1500000;
        }

        return { name: tableName, columns, rowCountEstimate };
      });
    }

    return [
      { name: 'users', columns: ['id', 'email', 'password'], rowCountEstimate: 5000 },
      { name: 'audit_logs', columns: ['id', 'action', 'userId', 'createdAt'], rowCountEstimate: 2500000 }
    ];
  }

  /**
   * Phase 3 & 4 : Appel à l'IA pour générer le rapport final et les suggestions de sharding
   */
 public async generateReport(meta: ProjectMetadata, tables: TableSummary[]): Promise<string> {
    if (!this.aiClient) {
      return "⚠️ Clé GEMINI_API_KEY manquante. Impossible de générer le rapport d'analyse IA.";
    }

    // Changement du modèle vers 'gemini-2.0-flash' ou 'gemini-1.5-flash'
    const model = this.aiClient.getGenerativeModel(
      { model: 'gemini-2.0-flash' },
      { apiVersion: 'v1' }
    );

    const prompt = `
      Tu es l'agent expert en sharding et base de données d'Helium DB.
      Analyse ce projet de développeur et génère un rapport complet contenant les points de pression et une configuration de sharding Helium DB YAML suggérée.

      STACK TECHNIQUE DU PROJET :
      - Nom : ${meta.name}
      - Framework : ${meta.framework}
      - Langage : ${meta.language}
      - ORM utilisé : ${meta.databaseORM}
      - Nombre de fichiers : ${meta.totalFiles}

      TABLES DETECTEES ET ESTIMATIONS DE LIGNES :
      ${JSON.stringify(tables, null, 2)}

      Donne une réponse structurée en Markdown claire et concise, similairement à ce modèle :
      1. Architecture détectée
      2. Points de pression (Identifie les tables avec beaucoup de lignes/logs comme critiques)
      3. Configuration 'helium-db.config.yml' générée (au format bloc de code yaml) avec une règle de routage logique (Ex: mettre les logs sur un shard append-only, le reste sur la base mère).
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }
  /**
   * Lancement séquentiel complet du scanneur
   */
  public async run() {
    console.log("🔍 [Helium Scanner] Analyse de la racine du projet en cours...");
    const meta = await this.analyzeLocalProject();
    
    console.log(`📁 Projet détecté : ${meta.name} (${meta.framework} + ${meta.language})`);
    console.log(`🗄️ ORM identifié : ${meta.databaseORM}`);

    console.log("⚡ Extraction de la structure de la base de données...");
    const tables = await this.scanDatabaseSchema();
    console.log(`📊 Schéma trouvé : ${tables.length} tables analysées.`);

    console.log("🧠 Interrogation de l'IA pour l'évaluation des points de pression...");
    const report = await this.generateReport(meta, tables);
    
    console.log("\n========================================================");
    console.log(report);
    console.log("========================================================\n");
  }
}

// Permet de tester directement le script si exécuté via la CLI
if (process.argv[1]?.endsWith('index.ts') || process.argv[1]?.endsWith('index.js')) {
  const scanner = new HeliumProjectScanner();
  scanner.run().catch(err => console.error("Erreur lors du scan :", err));
}