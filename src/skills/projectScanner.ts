// src/skills/projectScanner.ts
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ProjectMetadata {
  name: string;
  framework: string;
  language: 'TypeScript' | 'JavaScript' | 'Unknown';
  databaseORM: 'Prisma' | 'Drizzle' | 'Mongoose' | 'Raw-SQL' | 'Unknown';
  dependencies: Record<string, string>;
  totalFiles: number;
}

export interface TableSummary {
  name: string;
  columns: string[];
  rowCountEstimate: number;
}

export class HeliumProjectScanner {
  private rootDir: string;
  private aiClient?: GoogleGenerativeAI;

  constructor(rootDir: string = process.cwd()) {
    this.rootDir = rootDir;
    if (process.env.GEMINI_API_KEY) {
      this.aiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  public async analyzeLocalProject(): Promise<ProjectMetadata> {
    const packageJsonPath = path.join(this.rootDir, 'package.json');
    let dependencies: Record<string, string> = {};
    let name = 'unknown-project';

    if (fs.existsSync(packageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      name = pkg.name || name;
      dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
    }

    let framework = 'Vanilla Node.js';
    if (dependencies['next']) framework = 'Next.js';
    else if (dependencies['react']) framework = 'React.js';
    else if (dependencies['@nestjs/core']) framework = 'NestJS';
    else if (dependencies['express']) framework = 'Express';

    let databaseORM: ProjectMetadata['databaseORM'] = 'Unknown';
    if (dependencies['@prisma/client']) databaseORM = 'Prisma';
    else if (dependencies['drizzle-orm']) databaseORM = 'Drizzle';
    else if (dependencies['mongoose']) databaseORM = 'Mongoose';
    else if (dependencies['pg'] || dependencies['mysql2']) databaseORM = 'Raw-SQL';

    const tsconfigExists = fs.existsSync(path.join(this.rootDir, 'tsconfig.json'));
    const language = tsconfigExists ? 'TypeScript' : 'JavaScript';

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

  public async generateReport(meta: ProjectMetadata, tables: TableSummary[]): Promise<string> {
    if (!this.aiClient) {
      return "⚠️ Clé GEMINI_API_KEY manquante. Impossible de générer le rapport d'analyse IA.";
    }

    const model = this.aiClient.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
      Tu es l'agent expert en sharding d'Helium DB.
      Analyse ce projet et génère un rapport complet contenant les points de pression et une configuration de sharding Helium DB YAML suggérée.

      STACK TECHNIQUE :
      - Nom : ${meta.name}
      - Framework : ${meta.framework}
      - Langage : ${meta.language}
      - ORM : ${meta.databaseORM}
      - Fichiers : ${meta.totalFiles}

      TABLES DETECTEES :
      ${JSON.stringify(tables, null, 2)}

      Donne une réponse structurée en Markdown :
      1. Architecture détectée
      2. Points de pression (tables lourdes à risques)
      3. Configuration 'helium-db.config.yml' suggérée (bloc de code yaml).
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  public async run() {
    console.log("🔍 [Helium Scanner] Analyse de la racine du projet...");
    const meta = await this.analyzeLocalProject();
    console.log(`📁 Projet : ${meta.name} (${meta.framework} + ${meta.language})`);
    console.log(`🗄️ ORM : ${meta.databaseORM}`);

    const tables = await this.scanDatabaseSchema();
    const report = await this.generateReport(meta, tables);
    
    console.log("\n========================================================");
    console.log(report);
    console.log("========================================================\n");
  }
}

const scanner = new HeliumProjectScanner();
scanner.run().catch(err => console.error(err));