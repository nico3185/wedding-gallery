export const i18n = {
  privateGallery: ["Galerie privée",       "Galeria pribatua"],
  enterBtn:       ["Entrer",               "Sartu"],
  wrongPassword:  ["Mot de passe incorrect","Pasahitz okerra"],
  all:            ["Tout",                 "Dena"],
  loading:        ["Chargement…",          "Kargatzen…"],
  moments:        ["moments",              "une"],
} as const;

export function t(key: keyof typeof i18n): string {
  const v = i18n[key];
  // @ts-expect-error: v[0] and v[1] always differ (FR vs Euskara)
  return v[0] === v[1] ? v[0] : `${v[0]} · ${v[1]}`;
}
