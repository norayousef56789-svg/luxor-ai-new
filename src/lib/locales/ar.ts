import { common } from "./ar/common";
import { explore } from "./ar/explore";
import { portal } from "./ar/portal";

export const ar: Record<string, string> = { ...common, ...explore, ...portal };
