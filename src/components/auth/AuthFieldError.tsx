import { AlertCircle } from "lucide-react";

type Props = {
  message: string;
};

export function AuthFieldError({ message }: Props) {
  return (
    <p
      className="flex items-center gap-1.5 text-sm text-destructive"
      role="alert"
    >
      <AlertCircle className="size-4 shrink-0" strokeWidth={1.75} />
      {message}
    </p>
  );
}
