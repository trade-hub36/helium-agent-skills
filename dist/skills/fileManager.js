import * as fs from 'fs/promises';
import * as path from 'path';
/**
 * Crée ou met à jour un fichier dans le projet local de l'utilisateur.
 * @param filePath Chemin relatif ou absolu du fichier à créer (ex: "./migrations/01_init.sql")
 * @param content Contenu texte à écrire dans le fichier
 */
export async function writeProjectFile(filePath, content) {
    try {
        const resolvedPath = path.resolve(filePath);
        // Sécurité de base : Empêcher l'agent d'écrire en dehors du répertoire de travail actuel
        const cwd = process.cwd();
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
    }
    catch (error) {
        return { success: false, message: `Erreur d'écriture : ${error.message}` };
    }
}
