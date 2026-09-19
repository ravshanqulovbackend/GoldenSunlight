export type PasswordStrength = { label: string; percent: number; tone: string };

export function getPasswordStrength(value: string, t: (key: string) => string): PasswordStrength {
  if (!value) return { label: "", percent: 0, tone: "bg-outline-variant" };
  let score = 0;
  if (value.length >= 6) score++;
  if (value.length >= 10) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  if (value.length < 6) return { label: t("tooShort"), percent: 15, tone: "bg-error" };
  if (score <= 2) return { label: t("weak"), percent: 40, tone: "bg-error" };
  if (score <= 3) return { label: t("medium"), percent: 65, tone: "bg-secondary" };
  return { label: t("strong"), percent: 100, tone: "bg-primary" };
}
