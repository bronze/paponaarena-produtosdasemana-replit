import { Badge } from "papo-na-arena-ds";

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Badge>Novo</Badge>
    <Badge variant="secondary">AI Tools</Badge>
    <Badge variant="outline">Produtividade</Badge>
    <Badge variant="destructive">Descontinuado</Badge>
  </div>
);

export const CategoryTags = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Badge variant="secondary">AI Tools</Badge>
    <Badge variant="secondary">Design</Badge>
    <Badge variant="secondary">Analytics</Badge>
    <Badge variant="secondary">Livros</Badge>
  </div>
);
