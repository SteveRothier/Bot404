import { cn } from "@/lib/utils";

type Props = {
  message: string;
  isError?: boolean;
};

export function AuthFormMessage({ message, isError = false }: Props) {
  return (
    <p
      className={cn(
        "text-sm",
        isError ? "text-destructive" : "text-muted-foreground"
      )}
      role={isError ? "alert" : "status"}
    >
      {message}
    </p>
  );
}
