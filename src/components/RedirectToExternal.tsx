import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface RedirectToExternalProps {
  url: string;
}

export function RedirectToExternal({ url }: RedirectToExternalProps) {
  useEffect(() => {
    window.location.replace(url);
  }, [url]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground text-sm">Redirecting to portal...</p>
      </div>
    </div>
  );
}
