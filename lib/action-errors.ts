export function actionErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object") {
    const details = error as { code?: unknown; message?: unknown };
    if (details.code === "PGRST116") return "This record could not be found for the signed-in editor. Check that you are using its author account.";
    if (details.code === "42501") return "This editor does not have permission to save that change.";
    if (typeof details.message === "string" && details.message.trim()) return details.message;
  }
  return fallback;
}
