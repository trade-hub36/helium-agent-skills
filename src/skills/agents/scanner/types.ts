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