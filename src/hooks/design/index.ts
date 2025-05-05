
import { useDesignHandlers } from "./useDesignHandlers";
import { TSHIRT_COLORS, TshirtColor } from "./types";

export function useDesignState() {
  const handlers = useDesignHandlers();
  return handlers;
}

export { TSHIRT_COLORS, TshirtColor };
export * from "./types";
