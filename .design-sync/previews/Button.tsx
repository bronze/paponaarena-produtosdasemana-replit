import { Button } from "papo-na-arena-ds";

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button>Ver episódio</Button>
    <Button variant="outline">Limpar busca</Button>
    <Button variant="secondary">Categorias</Button>
    <Button variant="ghost">Mostrar todos</Button>
    <Button variant="destructive">Remover</Button>
  </div>
);

export const Pill = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button variant="outline" className="h-12 rounded-full px-6 font-semibold">Carregar mais 20</Button>
    <Button variant="ghost" className="h-12 rounded-full px-6 font-semibold">Mostrar todos (642)</Button>
  </div>
);

export const Disabled = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button disabled>Ver episódio</Button>
    <Button variant="outline" disabled>Limpar busca</Button>
  </div>
);
