import { useContext } from "react";
import { CommonContext } from "@/contexts/common";

export function useCommon() {
  const context = useContext(CommonContext);

  if (context === undefined) {
    throw new Error("useCommon must be used within a CommonProvider");
  }

  return context;
}
