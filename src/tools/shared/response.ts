const FALLBACK_DEFAULT_PAGE = 1;
const FALLBACK_DEFAULT_PER_PAGE = 20;
const FALLBACK_MAX_PER_PAGE = 100;
const FALLBACK_MAX_RESPONSE_CHARS = 15000;
const FALLBACK_ENABLE_TRUNCATION = true;

function parsePositiveIntEnv(name: string, fallback: number) {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function parseBooleanEnv(name: string, fallback: boolean) {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }
  return fallback;
}

const DEFAULT_PAGE = parsePositiveIntEnv("TENCENT_GIT_DEFAULT_PAGE", FALLBACK_DEFAULT_PAGE);
const MAX_PER_PAGE = parsePositiveIntEnv("TENCENT_GIT_MAX_PER_PAGE", FALLBACK_MAX_PER_PAGE);
const DEFAULT_PER_PAGE = Math.min(
  parsePositiveIntEnv("TENCENT_GIT_DEFAULT_PER_PAGE", FALLBACK_DEFAULT_PER_PAGE),
  MAX_PER_PAGE
);
const DEFAULT_MAX_RESPONSE_CHARS = parsePositiveIntEnv("TENCENT_GIT_MAX_RESPONSE_CHARS", FALLBACK_MAX_RESPONSE_CHARS);
const ENABLE_RESPONSE_TRUNCATION = parseBooleanEnv("TENCENT_GIT_ENABLE_RESPONSE_TRUNCATION", FALLBACK_ENABLE_TRUNCATION);

export function normalizePagination(page?: number, perPage?: number) {
  const normalizedPage = Number.isFinite(page) && (page as number) > 0 ? Math.floor(page as number) : DEFAULT_PAGE;
  const normalizedPerPage =
    Number.isFinite(perPage) && (perPage as number) > 0
      ? Math.min(Math.floor(perPage as number), MAX_PER_PAGE)
      : DEFAULT_PER_PAGE;

  return {
    page: normalizedPage,
    per_page: normalizedPerPage,
  };
}

export function withPagination<T extends Record<string, unknown>>(params: T, page?: number, perPage?: number): T & { page: number; per_page: number } {
  return {
    ...params,
    ...normalizePagination(page, perPage),
  };
}

function truncateText(text: string, maxChars: number) {
  if (!ENABLE_RESPONSE_TRUNCATION || text.length <= maxChars) {
    return text;
  }

  return `${text.slice(0, maxChars)}\n\n...[Truncated by server to avoid context overflow. Please narrow scope or use more specific actions/filters.]`;
}

export function asText(data: unknown, maxChars = DEFAULT_MAX_RESPONSE_CHARS) {
  const text = JSON.stringify(data, null, 2);
  return {
    content: [
      {
        type: "text" as const,
        text: truncateText(text, maxChars),
      },
    ],
  };
}