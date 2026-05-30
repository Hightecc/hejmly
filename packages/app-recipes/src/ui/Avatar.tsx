import type { ReactElement } from "react";
import type { Cook } from "../shared/index.ts";
import { paletteFor } from "./colors.ts";

type AvatarProps = { cook: Cook; size?: number };

export const Avatar = ({ cook, size = 24 }: AvatarProps): ReactElement => {
  const palette = paletteFor(cook.name);
  return (
    <div
      role="img"
      aria-label={cook.name}
      title={cook.name}
      className="grid shrink-0 place-items-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        background: palette.bg,
        color: palette.fg,
        fontSize: Math.round(size * 0.38),
      }}
    >
      <span aria-hidden="true">{cook.initial}</span>
    </div>
  );
};
