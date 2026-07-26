import type { LayoutPage } from "./types";

export function createLayoutPage(pageIndex: number): LayoutPage {
  return {
    pageIndex,
    items: [],
  };
}
