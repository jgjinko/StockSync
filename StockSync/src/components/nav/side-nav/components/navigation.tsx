import { Link, useLocation } from "react-router-dom";
import { navigations } from "../../../../config/site";
import { cn } from "../../../../lib/utils";

export default function Navigation() {
  const { pathname } = useLocation();
  return (
    <nav className="flex flex-grow flex-col gap-y-1 p-2">
      {navigations.map((navigation) => {
        const Icon = navigation.icon;
        return (
          <Link
            key={navigation.name}
            to={navigation.href}
            className={cn(
              "flex items-center rounded-md px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-800",
              pathname === navigation.href
                ? "bg-slate-200 dark:bg-slate-800"
                : "bg-transparent",
            )}
          >
            <Icon
              size={16}
              className="mr-2 text-slate-800 dark:text-slate-200"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {navigation.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
