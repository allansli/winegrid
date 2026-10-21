export const HINTS_STORAGE_KEY = "winegrid_picker_hints_v1";

export function readHintsOn(storage: { getItem(key: string): string | null }): boolean {
  try {
    return storage.getItem(HINTS_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeHintsOn(
  storage: { setItem(key: string, value: string): void },
  on: boolean
): void {
  try {
    storage.setItem(HINTS_STORAGE_KEY, on ? "1" : "0");
  } catch {
    // Ignore private mode.
  }
}
