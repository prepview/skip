import { Directory, File, Paths } from 'expo-file-system';

const FOLDER = 'photos';

/**
 * Copies a picked photo into the app's own storage and returns its name.
 * Only the name is saved with the day: the full path changes when iOS updates the app.
 */
export function keepPhoto(pickedUri: string, dayKey: string): string {
  const folder = new Directory(Paths.document, FOLDER);
  if (!folder.exists) folder.create({ intermediates: true });
  const name = `${dayKey}-${Date.now()}.jpg`;
  new File(pickedUri).copy(new File(folder, name));
  return name;
}

export function photoUri(name: string): string {
  return new File(Paths.document, FOLDER, name).uri;
}

export function dropPhoto(name: string): void {
  const file = new File(Paths.document, FOLDER, name);
  if (file.exists) file.delete();
}
