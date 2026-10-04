import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from "papo-na-arena-ds";

export const Basic = () => (
  <Card className="max-w-sm">
    <CardHeader>
      <CardTitle className="text-base">Top 10 Produtos</CardTitle>
      <CardDescription>Os mais citados desde o primeiro episódio.</CardDescription>
    </CardHeader>
    <CardContent>
      <ol className="space-y-2 text-sm">
        <li className="flex justify-between"><span className="font-semibold">Claude Code</span><span className="text-muted-foreground">73 menções</span></li>
        <li className="flex justify-between"><span className="font-semibold">Claude</span><span className="text-muted-foreground">63 menções</span></li>
        <li className="flex justify-between"><span className="font-semibold">ChatGPT</span><span className="text-muted-foreground">56 menções</span></li>
      </ol>
    </CardContent>
  </Card>
);

export const WithFooter = () => (
  <Card className="max-w-sm">
    <CardHeader className="pb-3">
      <CardTitle className="text-base">Episódios</CardTitle>
      <CardDescription>Em que episódios o Cursor foi citado.</CardDescription>
    </CardHeader>
    <CardContent className="text-sm">
      <p>#136 · O Vale faz algo diferente em produto e IA?</p>
    </CardContent>
    <CardFooter>
      <Button variant="outline" className="h-12 w-full rounded-full font-semibold">Mostrar todos (37)</Button>
    </CardFooter>
  </Card>
);
