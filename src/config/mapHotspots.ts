// Clickable areas overlaid on /public/village-map.jpg.
// x / y / width / height are percentages (0-100) of the image's rendered
// size, so they stay correct at any responsive scale. Adjust these numbers
// to line up with the artwork; no code changes needed elsewhere.
//
// This array's order also drives the mobile facility list below the map
// (rendered two-per-row), independent of the x/y coordinates used for the
// map hotspots themselves.

export interface MapHotspot {
  id: string;
  facility: string;
  iconSrc: string;
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
    iconSrc: "/icons/town-hall.png",
    x: 56,
    y: 24,
    width: 17,
    height: 14,
    route: "/town-hall",
  },
  {
    id: "bonfire",
    facility: "焚き火",
    iconSrc: "/icons/bonfire.png",
    x: 46,
    y: 38,
    width: 12,
    height: 10,
    route: "/bonfire",
  },
  {
    id: "my-house",
    facility: "自分の家",
    iconSrc: "/icons/my-house.png",
    x: 54,
    y: 50,
    width: 14,
    height: 10,
    route: "/my-house",
  },
  {
    id: "field",
    facility: "自分の家の畑",
    iconSrc: "/icons/field.png",
    x: 74,
    y: 54,
    width: 24,
    height: 19,
    route: "/field",
  },
  {
    id: "garden",
    facility: "農園",
    iconSrc: "/icons/garden.png",
    x: 71,
    y: 38,
    width: 23,
    height: 14,
    route: "/garden",
  },
  {
    id: "desert",
    facility: "砂漠",
    iconSrc: "/icons/desert.png",
    x: 58,
    y: 2,
    width: 40,
    height: 21,
    route: "/desert",
  },
  {
    id: "library",
    facility: "図書館",
    iconSrc: "/icons/library.png",
    x: 37,
    y: 27,
    width: 13,
    height: 9,
    route: "/library",
  },
  {
    id: "cinema",
    facility: "映画館",
    iconSrc: "/icons/cinema.png",
    x: 23,
    y: 39,
    width: 14,
    height: 15,
    route: "/cinema",
  },
  {
    id: "shrine",
    facility: "祠",
    iconSrc: "/icons/shrine.png",
    x: 22,
    y: 7,
    width: 15,
    height: 10,
    route: "/shrine",
  },
  {
    id: "radio-station",
    facility: "ラジオ局",
    iconSrc: "/icons/radio-station.png",
    x: 8,
    y: 35,
    width: 11,
    height: 14,
    route: "/radio-station",
  },
  {
    id: "dev-station",
    facility: "開発局",
    iconSrc: "/icons/dev-station.png",
    x: 35,
    y: 51,
    width: 14,
    height: 10,
    route: "/dev-station",
  },
  {
    id: "outside-world",
    facility: "外の世界へ",
    iconSrc: "/icons/outside-world.png",
    x: 7,
    y: 62,
    width: 20,
    height: 16,
    route: "/outside-world",
  },
  {
    id: "research-lab",
    facility: "研究所",
    iconSrc: "/icons/research-lab.png",
    x: 11,
    y: 27,
    width: 11,
    height: 8,
    route: "/research-lab",
  },
];
