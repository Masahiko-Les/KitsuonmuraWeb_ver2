// Maps crop_catalog.name to its icon under /public/crops. Keyed by name
// (not id) since crop_catalog is a small, rarely-changed reference table
// and this avoids a migration just to store an icon path. Falls back to
// the catalog's emoji wherever a name isn't listed here yet.
export const CROP_ICON_SRC: Record<string, string> = {
  トマト: "/crops/tomato.png",
  じゃがいも: "/crops/potato.png",
  かぼちゃ: "/crops/pumpkin.png",
  とうもろこし: "/crops/corn.png",
  にんじん: "/crops/carrot.png",
};
