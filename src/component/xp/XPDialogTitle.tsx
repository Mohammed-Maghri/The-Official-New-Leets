import { XPIcon } from "./XPIcon";

export function XPDialogTitle({ title, onClose }: { title: string; onClose: () => void }) {
  return <div className="xp-titlebar xp-dialog-title"><span className="xp-window-caption"><XPIcon name="computer" size={18} />{title}</span><div className="xp-window-controls"><button type="button" className="xp-close" onClick={onClose} aria-label={`Close ${title}`}>×</button></div></div>;
}
