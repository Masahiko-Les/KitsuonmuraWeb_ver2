// Maps flower_catalog.name to its icon under /public/flowers. Mirrors
// cropIcons.ts — keyed by name since flower_catalog is a small,
// rarely-changed reference table, avoiding a migration just for icon
// paths. Falls back to the catalog's emoji wherever a name isn't listed.
export const FLOWER_ICON_SRC: Record<string, string> = {
  さくら: "/flowers/sakura.png",
  チューリップ: "/flowers/tulip.png",
  ハイビスカス: "/flowers/hibiscus.png",
  ひまわり: "/flowers/sunflower.png",
  マーガレット: "/flowers/marguerite.png",
};
