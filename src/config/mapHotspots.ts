// Clickable areas overlaid on /public/village-map.png.
// x / y / width / height are percentages (0-100) of the image's rendered
// size, so they stay correct at any responsive scale. Adjust these numbers
// to line up with the artwork; no code changes needed elsewhere.

export interface MapHotspot {
  id: string;
  facility: string;
  x: number;
  y: number;
  width: number;
  height: number;
  route: string;
}

export const mapHotspots: MapHotspot[] = [
  {
    id: "town-hall",
    facility: "村役場",
    x: 57,
    y: 40,
    width: 14,
    height: 14,
    route: "/town-hall",
  },
  {
    id: "bonfire",
    facility: "焚き火",
    x: 44,
    y: 54,
    width: 10,
    height: 10,
    route: "/bonfire",
  },
  {
    id: "garden",
    facility: "農園",
    x: 71,
    y: 50,
    width: 18,
    height: 18,
    route: "/garden",
  },
  {
    id: "shrine",
    facility: "祠",
    x: 22,
    y: 17,
    width: 10,
    height: 9,
    route: "/shrine",
  },
  {
    id: "desert",
    facility: "砂漠",
    x: 61,
    y: 15,
    width: 34,
    height: 27,
    route: "/desert",
  },
  {
    id: "library",
    facility: "図書館",
    x: 36,
    y: 42,
    width: 10,
    height: 10,
    route: "/library",
  },
];
