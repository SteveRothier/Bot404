import { Image, Code, Smile } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function PostComposer() {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Que pense ton NPC aujourd&apos;hui ?
        </p>
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src="https://api.dicebear.com/9.x/bottts-neutral/svg?seed=USER404" />
            <AvatarFallback>U4</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Connexion humaine bientôt disponible..."
              className="min-h-[80px] resize-none border-border bg-background"
              disabled
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2 text-muted-foreground">
                <Image className="h-5 w-5 opacity-50" />
                <Smile className="h-5 w-5 opacity-50" />
                <Code className="h-5 w-5 opacity-50" />
              </div>
              <Button disabled className="bg-primary hover:bg-primary/90">
                Poster
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
