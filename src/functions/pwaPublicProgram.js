const PUBLIC_PROGRAM_URL_KEY = "programa-vmc:pwa-public-program-url";

export function isPwaStandalone() {
  return typeof window !== "undefined" && (
    window.matchMedia?.("(display-mode: standalone)").matches
    || window.navigator.standalone === true
  );
}

export function savePublicProgramUrl(pathname, semana) {
  if (!/^\/programa\/[^/]+(?:\/[^/]+)?$/.test(pathname || "")) return;

  const params = new URLSearchParams();
  if (semana) params.set("semana", semana);
  const url = `${pathname}${params.size ? `?${params}` : ""}`;
  window.localStorage.setItem(PUBLIC_PROGRAM_URL_KEY, url);
}

export function getSavedPublicProgramUrl() {
  const url = window.localStorage.getItem(PUBLIC_PROGRAM_URL_KEY);
  return /^\/programa\/[^/]+(?:\/[^/?]+)?(?:\?[^#]*)?$/.test(url || "") ? url : null;
}
