import * as fs from 'fs/promises';
import { existsSync, readdirSync } from 'fs';
import * as path from 'path';

export interface FileManagerArgs {
  action: 'read' | 'write' | 'list';
  filePath?: string;
  content?: string;
}

/**
 * Crée ou met à jour un fichier dans le projet local de l'utilisateur.
 * @param filePath Chemin relatif ou absolu du fichier à créer
 * @param content Contenu texte à écrire dans le fichier
 */
export async function writeProjectFile(filePath: string, content: string): Promise<{ success: boolean; message: string }> {
  try {
    const resolvedPath = path.resolve(filePath);
    const cwd = process.cwd();

    // Sécurité : Empêcher d'écrire en dehors du répertoire de travail actuel
    if (!resolvedPath.startsWith(cwd)) {
      throw new Error("Accès non autorisé : Impossible d'écrire en dehors du répertoire du projet.");
    }

    // Création des dossiers parents si inexistants
    await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
    
    // Écriture du fichier
    await fs.writeFile(resolvedPath, content, 'utf-8');
    
    return { 
      success: true, 
      message: `Fichier enregistré avec succès dans : ${path.relative(cwd, resolvedPath)}` 
    };
  } catch (error: any) {
    return { success: false, message: `Erreur d'écriture : ${error.message}` };
  }
}

/**
 * Skill de gestion de fichiers pour l'agent Helium.
 */
export const fileManagerSkill = {
  name: 'fileManager',
  description: 'Permet de lire, écrire ou lister les fichiers du projet (ex: scripts SQL, configurations).',
  schema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['read', 'write', 'list'] },
      filePath: { type: 'string', description: 'Le chemin relatif du fichier' },
      content: { type: 'string', description: 'Le contenu à écrire (si action=write)' }
    },
    required: ['action']
  },
  
  async run(args: FileManagerArgs): Promise<string> {
    const rootDir = process.cwd();
    
    if (args.action === 'list') {
      const files = readdirSync(rootDir);
      return `Fichiers : ${files.join(', ')}`;
    }

    if (!args.filePath) {
      throw new Error("Le paramètre 'filePath' est requis.");
    }

    if (args.action === 'read') {
      const resolvedPath = path.resolve(rootDir, args.filePath);
      if (!resolvedPath.startsWith(rootDir)) {
        throw new Error("Accès non autorisé.");
      }
      if (!existsSync(resolvedPath)) {
        return `Le fichier ${args.filePath} n'existe pas.`;
      }
      return await fs.readFile(resolvedPath, 'utf-8');
    }

    if (args.action === 'write') {
      if (args.content === undefined) {
        throw new Error("Le paramètre 'content' est requis pour écrire.");
      }
      const result = await writeProjectFile(args.filePath, args.content);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.message;
    }

    return "Action non reconnue.";
  }
};