import { passportPresetInputSchema } from "@/lib/passport-presets/schemas";
import type {
  NewPassportPreset,
  PassportPreset,
  PassportPresetChanges,
  PassportPresetFilter,
} from "@/lib/passport-presets/types";

let passportPresetSequence = 0;

function createPassportPresetId(existingIds: readonly string[]): string {
  let candidate: string;
  do {
    passportPresetSequence += 1;
    candidate = `custom-passport-${passportPresetSequence}`;
  } while (existingIds.includes(candidate));
  return candidate;
}

export function createCustomPassportPreset(
  presets: readonly PassportPreset[],
  input: NewPassportPreset,
  now = new Date().toISOString(),
): PassportPreset | null {
  const parsed = passportPresetInputSchema.safeParse({
    ...input,
    documentType: "passport",
  });
  if (!parsed.success) {
    return null;
  }
  return {
    ...parsed.data,
    id: createPassportPresetId(presets.map((preset) => preset.id)),
    documentType: "passport",
    status: "custom",
    isBuiltIn: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateCustomPassportPreset(
  presets: readonly PassportPreset[],
  presetId: string,
  changes: PassportPresetChanges,
  now = new Date().toISOString(),
): PassportPreset[] | null {
  const source = presets.find((preset) => preset.id === presetId);
  if (!source || source.isBuiltIn) {
    return null;
  }
  const parsed = passportPresetInputSchema.safeParse({
    ...source,
    ...changes,
    documentType: "passport",
  });
  if (!parsed.success) {
    return null;
  }
  return presets.map((preset) =>
    preset.id === presetId
      ? {
          ...preset,
          ...parsed.data,
          id: preset.id,
          documentType: "passport" as const,
          status: "custom" as const,
          isBuiltIn: false,
          createdAt: preset.createdAt,
          updatedAt: now,
        }
      : preset,
  );
}

export function duplicatePassportPreset(
  presets: readonly PassportPreset[],
  presetId: string,
  now = new Date().toISOString(),
): PassportPreset | null {
  const source = presets.find((preset) => preset.id === presetId);
  if (!source) {
    return null;
  }
  return {
    ...source,
    id: createPassportPresetId(presets.map((preset) => preset.id)),
    name: `${source.name.slice(0, 94)} Copy`,
    status: "custom",
    isBuiltIn: false,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function removeCustomPassportPreset(
  presets: readonly PassportPreset[],
  presetId: string,
): PassportPreset[] | null {
  const source = presets.find((preset) => preset.id === presetId);
  if (!source || source.isBuiltIn) {
    return null;
  }
  return presets.filter((preset) => preset.id !== presetId);
}

export function filterPassportPresets(
  presets: readonly PassportPreset[],
  query: string,
  filter: PassportPresetFilter,
  favoriteIds: readonly string[],
  recentIds: readonly string[],
): PassportPreset[] {
  const normalizedQuery = query.trim().toLowerCase();
  const matching = presets.filter((preset) => {
    const matchesQuery =
      !normalizedQuery ||
      [preset.countryName, preset.countryCode, preset.name].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      );
    const matchesFilter =
      filter === "all" ||
      (filter === "favorites" && favoriteIds.includes(preset.id)) ||
      (filter === "recent" && recentIds.includes(preset.id)) ||
      (filter === "built-in" && preset.isBuiltIn) ||
      (filter === "custom" && !preset.isBuiltIn) ||
      filter === preset.status;
    return matchesQuery && matchesFilter;
  });
  return [...matching].sort((left, right) => {
    const favoriteDifference =
      Number(favoriteIds.includes(right.id)) -
      Number(favoriteIds.includes(left.id));
    return favoriteDifference || left.countryName.localeCompare(right.countryName);
  });
}

export function recordRecentPassportPreset(
  recentIds: readonly string[],
  presetId: string,
  limit = 6,
): string[] {
  return [presetId, ...recentIds.filter((id) => id !== presetId)].slice(
    0,
    limit,
  );
}
