/** Browser preview only: the picked image address is used as-is and lasts for the session. */
export function keepPhoto(pickedUri: string, _dayKey: string): string {
  return pickedUri;
}

export function photoUri(name: string): string {
  return name;
}

export function dropPhoto(_name: string): void {}
