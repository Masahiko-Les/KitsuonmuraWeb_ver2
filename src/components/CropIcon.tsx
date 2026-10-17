import Image from "next/image";
import { CROP_ICON_SRC } from "@/config/cropIcons";

export function CropIcon({
  name,
  emoji,
  size = 20,
  className = "",
}: {
  name: string;
  emoji?: string | null;
  size?: number;
  className?: string;
}) {
  const src = CROP_ICON_SRC[name];
  if (!src) {
    return <span className={className}>{emoji ?? "🌾"}</span>;
  }
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className={`inline-block shrink-0 object-contain align-middle ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
