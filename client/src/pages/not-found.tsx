import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-tint">
              <AlertCircle className="h-5 w-5 text-foreground" aria-hidden="true" />
            </div>
            <h1 className="detail-title">Página não encontrada</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Esse endereço não existe.{" "}
            <Link href="/" className="font-medium text-foreground underline underline-offset-2">
              Voltar para o dashboard
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
