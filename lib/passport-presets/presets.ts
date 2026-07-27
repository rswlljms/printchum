import type { PassportPreset } from "@/lib/passport-presets/types";

const BUILT_IN_TIMESTAMP = "2026-01-01T00:00:00.000Z";

function createBuiltInPassportPreset(
  input: Pick<
    PassportPreset,
    | "id"
    | "countryCode"
    | "countryName"
    | "name"
    | "width"
    | "height"
    | "unit"
    | "allowedBackgroundColors"
    | "defaultBackgroundColor"
  >,
): PassportPreset {
  return {
    ...input,
    documentType: "passport",
    notes:
      "Placeholder preparation data. Review the issuing authority’s current requirements before use.",
    officialSourceUrl: `https://example.com/passport-source/${input.countryCode.toLowerCase()}`,
    status: "review-needed",
    isBuiltIn: true,
    isFavorite: false,
    createdAt: BUILT_IN_TIMESTAMP,
    updatedAt: BUILT_IN_TIMESTAMP,
  };
}

export const builtInPassportPresets: readonly PassportPreset[] = [
  createBuiltInPassportPreset({
    id: "passport-ph",
    countryCode: "PH",
    countryName: "Philippines",
    name: "Philippines Passport",
    width: 35,
    height: 45,
    unit: "mm",
    allowedBackgroundColors: ["#ffffff"],
    defaultBackgroundColor: "#ffffff",
  }),
  createBuiltInPassportPreset({
    id: "passport-us",
    countryCode: "US",
    countryName: "United States",
    name: "United States Passport",
    width: 2,
    height: 2,
    unit: "in",
    allowedBackgroundColors: ["#ffffff"],
    defaultBackgroundColor: "#ffffff",
  }),
  createBuiltInPassportPreset({
    id: "passport-gb",
    countryCode: "GB",
    countryName: "United Kingdom",
    name: "United Kingdom Passport",
    width: 35,
    height: 45,
    unit: "mm",
    allowedBackgroundColors: ["#ffffff"],
    defaultBackgroundColor: "#ffffff",
  }),
  createBuiltInPassportPreset({
    id: "passport-ca",
    countryCode: "CA",
    countryName: "Canada",
    name: "Canada Passport",
    width: 50,
    height: 70,
    unit: "mm",
    allowedBackgroundColors: ["#ffffff"],
    defaultBackgroundColor: "#ffffff",
  }),
  createBuiltInPassportPreset({
    id: "passport-jp",
    countryCode: "JP",
    countryName: "Japan",
    name: "Japan Passport",
    width: 35,
    height: 45,
    unit: "mm",
    allowedBackgroundColors: ["#ffffff"],
    defaultBackgroundColor: "#ffffff",
  }),
  createBuiltInPassportPreset({
    id: "passport-au",
    countryCode: "AU",
    countryName: "Australia",
    name: "Australia Passport",
    width: 35,
    height: 45,
    unit: "mm",
    allowedBackgroundColors: ["#ffffff"],
    defaultBackgroundColor: "#ffffff",
  }),
];

export const PASSPORT_PRESET_DISCLAIMER =
  "Passport presets are preparation guides. Final acceptance depends on the issuing authority’s current requirements.";
