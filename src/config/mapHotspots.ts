// Clickable areas overlaid on /public/village-map.jpg.
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
    x: 56,
    y: 24,
    width: 17,
    height: 14,
    route: "/town-hall",
  },
  {
    id: "bonfire",
    facility: "焚き火",
    x: 46,
    y: 38,
    width: 12,
    height: 10,
    route: "/bonfire",
  },
  {
    id: "garden",
    facility: "農園",
    x: 71,
    y: 38,
    width: 23,
    height: 14,
    route: "/garden",
  },
  {
    id: "shrine",
    facility: "祠",
    x: 22,
    y: 7,
    width: 15,
    height: 10,
    route: "/shrine",
  },
  {
    id: "desert",
    facility: "砂漠",
    x: 58,
    y: 2,
    width: 40,
    height: 21,
    route: "/desert",
  },
  {
    id: "library",
    facility: "図書館",
    x: 37,
    y: 27,
    width: 13,
    height: 9,
    route: "/library",
  },
  {
    id: "my-house",
    facility: "自分の家",
    x: 54,
    y: 50,
    width: 14,
    height: 10,
    route: "/my-house",
  },
  {
    id: "cinema",
    facility: "映画館",
    x: 23,
    y: 39,
    width: 14,
    height: 10,
    route: "/cinema",
  },
  {
    id: "field",
    facility: "自分の家の畑",
    x: 74,
    y: 54,
    width: 24,
    height: 19,
    route: "/field",
  },
  {
    id: "radio-station",
    facility: "ラジオ局",
    x: 8,
    y: 35,
    width: 11,
    height: 14,
    route: "/radio-station",
  },
  {
    id: "dev-station",
    facility: "開発局",
    x: 35,
    y: 51,
    width: 14,
    height: 10,
    route: "/dev-station",
  },
  {
    id: "outside-world",
    facility: "外の世界へ",
    x: 7,
    y: 62,
    width: 20,
    height: 16,
    route: "/outside-world",
  },
  {
    id: "research-lab",
    facility: "研究所",
    x: 11,
    y: 27,
    width: 11,
    height: 8,
    route: "/research-lab",
  },
];
