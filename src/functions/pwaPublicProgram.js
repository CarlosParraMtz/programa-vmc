export function isPwaStandalone() {
  return typeof window !== "undefined" && (
    window.matchMedia?.("(display-mode: standalone)").matches
    || window.navigator.standalone === true
  );
}
