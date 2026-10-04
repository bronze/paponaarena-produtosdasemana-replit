import { ShareBar } from "papo-na-arena-ds";

export const Proportions = () => (
  <div className="w-64 space-y-3">
    <ShareBar value={73} max={73} />
    <ShareBar value={44} max={73} />
    <ShareBar value={18} max={73} />
    <ShareBar value={1} max={73} />
  </div>
);
