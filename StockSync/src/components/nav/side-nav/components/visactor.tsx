import { VisActorLogo } from "../../../icons";

export default function VisActor() {
  return (
    <a
      href="https://visactor.io"
      target="_blank"
      rel="noreferrer"
      className="relative my-2 flex flex-col items-center justify-center gap-y-2 px-4 py-4"
    >
      <div className="dot-matrix absolute left-0 top-0 -z-10 h-full w-full" />
      <span className="text-xs text-muted-foreground">Powered by</span>
      <div className="flex items-center space-x-2">
        <VisActorLogo size={24} />
        <span className="text-md text-accent-foreground">VisActor</span>
      </div>
    </a>
  );
}
