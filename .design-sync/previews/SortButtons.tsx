import { useState } from "react";
import { SortButtons } from "papo-na-arena-ds";

export const Products = () => {
  const [mode, setMode] = useState<"mentions" | "episodes" | "alpha">("mentions");
  return (
    <SortButtons
      options={[["mentions", "Menções"], ["episodes", "Episódios"], ["alpha", "A–Z"]] as const}
      value={mode}
      onChange={setMode}
    />
  );
};
