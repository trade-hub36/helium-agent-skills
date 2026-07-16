/**
 * Crée ou met à jour un fichier dans le projet local de l'utilisateur.
 * @param filePath Chemin relatif ou absolu du fichier à créer (ex: "./migrations/01_init.sql")
 * @param content Contenu texte à écrire dans le fichier
 */
export declare function writeProjectFile(filePath: string, content: string): Promise<{
    success: boolean;
    message: string;
}>;
