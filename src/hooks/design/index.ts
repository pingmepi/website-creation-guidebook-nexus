
import { useDesignHandlers } from "./useDesignHandlers";
import { TSHIRT_COLORS } from "./types";
import type { TshirtColor } from "./types";

export function useDesignState() {
  const handlers = useDesignHandlers();
  return handlers;
}

export { TSHIRT_COLORS };
export type { TshirtColor };
export * from "./types";
