import { Link } from "react-router-dom";

export function BottomWarning({label, buttonText, to}) {
    return (
        <div className="flex justify-center gap-1 text-sm text-slate-600">
          <span>{label}</span>
          <Link className="font-semibold text-green-800 hover:text-green-900" to={to}>
            {buttonText}
          </Link>
        </div>
      );
    }
