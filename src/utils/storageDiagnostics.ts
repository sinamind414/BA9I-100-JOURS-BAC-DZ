export type StorageDiagnosticCategory =
  | 'storage_unavailable'
  | 'storage_access_denied'
  | 'quota_exceeded'
  | 'corrupted_json'
  | 'invalid_schema'
  | 'hydration_exception'
  | 'serialization_error'
  | 'unknown_storage_error';

export interface StorageLogger {
  warn: (message: string, details?: Record<string, unknown>) => void;
  error: (message: string, details?: Record<string, unknown>) => void;
}

export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

export interface ReadStorageResult<T> {
  status: 'ok' | 'empty' | 'error';
  category?: StorageDiagnosticCategory;
  state: T | null;
  rawLength?: number;
}

export interface WriteStorageResult {
  ok: boolean;
  category?: StorageDiagnosticCategory;
  bytes?: number;
}

const DEFAULT_LOGGER: StorageLogger = {
  warn: (message, details) => console.warn(message, details),
  error: (message, details) => console.error(message, details),
};

const LARGE_PAYLOAD_WARN_THRESHOLD = 1_500_000;

export function extractErrorMetadata(err: unknown): {
  name: string;
  message: string;
  code?: number;
} {
  if (err instanceof Error) {
    const withCode = err as Error & { code?: unknown };
    return {
      name: err.name || 'Error',
      message: err.message || String(err),
      code: typeof withCode.code === 'number' ? withCode.code : undefined,
    };
  }
  if (err && typeof err === 'object') {
    const obj = err as Record<string, unknown>;
    return {
      name: typeof obj.name === 'string' ? obj.name : 'UnknownObjectError',
      message: typeof obj.message === 'string' ? obj.message : String(err),
      code: typeof obj.code === 'number' ? obj.code : undefined,
    };
  }
  return {
    name: typeof err,
    message: String(err),
  };
}

export function classifyStorageError(err: unknown): StorageDiagnosticCategory {
  const meta = extractErrorMetadata(err);
  const lowerName = meta.name.toLowerCase();
  const lowerMsg = meta.message.toLowerCase();

  if (
    lowerName === 'quotaexceedederror' ||
    lowerName === 'ns_error_dom_quota_reached' ||
    meta.code === 22 ||
    meta.code === 1014 ||
    lowerMsg.includes('quota') ||
    lowerMsg.includes('exceeded') ||
    lowerMsg.includes('storage limit')
  ) {
    return 'quota_exceeded';
  }

  if (
    lowerName === 'securityerror' ||
    lowerMsg.includes('security') ||
    lowerMsg.includes('access is denied') ||
    lowerMsg.includes('permission') ||
    lowerMsg.includes('storage is disabled')
  ) {
    return 'storage_access_denied';
  }

  if (err instanceof SyntaxError || lowerName === 'syntaxerror') {
    return 'corrupted_json';
  }

  return 'unknown_storage_error';
}

export function readAndValidateStorageState<T>({
  storage,
  key,
  sanitize,
  logger = DEFAULT_LOGGER,
}: {
  storage: StorageLike | null | undefined;
  key: string;
  sanitize: (parsed: unknown) => T | null;
  logger?: StorageLogger;
}): ReadStorageResult<T> {
  if (!storage) {
    logger.warn('[BA9I Storage:Read] localStorage is unavailable in this context.', {
      category: 'storage_unavailable',
      key,
    });
    return {
      status: 'error',
      category: 'storage_unavailable',
      state: null,
    };
  }

  let raw: string | null = null;
  try {
    raw = storage.getItem(key);
  } catch (err) {
    const category = classifyStorageError(err);
    const meta = extractErrorMetadata(err);
    logger.error('[BA9I Storage:Read] Failed to read state from localStorage.', {
      category,
      key,
      errorName: meta.name,
      errorCode: meta.code,
      errorMessage: meta.message,
    });
    return {
      status: 'error',
      category,
      state: null,
    };
  }

  if (raw === null) {
    return {
      status: 'empty',
      state: null,
      rawLength: 0,
    };
  }

  if (raw.trim().length === 0) {
    logger.warn('[BA9I Storage:Parse] Stored payload is empty/whitespace.', {
      category: 'corrupted_json',
      key,
      rawLength: raw.length,
    });
    return {
      status: 'error',
      category: 'corrupted_json',
      state: null,
      rawLength: raw.length,
    };
  }

  if (raw.length >= LARGE_PAYLOAD_WARN_THRESHOLD) {
    logger.warn(
      '[BA9I Storage:SizeWarning] Stored payload is unusually large and may approach browser quota limits.',
      {
        key,
        rawLength: raw.length,
        approxKB: Math.round(raw.length / 1024),
      }
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    const meta = extractErrorMetadata(err);
    logger.error('[BA9I Storage:Parse] Corrupted JSON found in localStorage.', {
      category: 'corrupted_json',
      key,
      rawLength: raw.length,
      rawPreview: raw.slice(0, 120),
      errorName: meta.name,
      errorMessage: meta.message,
    });
    return {
      status: 'error',
      category: 'corrupted_json',
      state: null,
      rawLength: raw.length,
    };
  }

  let sanitized: T | null = null;
  try {
    sanitized = sanitize(parsed);
  } catch (err) {
    const meta = extractErrorMetadata(err);
    logger.error(
      '[BA9I Storage:Hydration] Exception while validating/hydrating stored state.',
      {
        category: 'hydration_exception',
        key,
        rawLength: raw.length,
        errorName: meta.name,
        errorMessage: meta.message,
      }
    );
    return {
      status: 'error',
      category: 'hydration_exception',
      state: null,
      rawLength: raw.length,
    };
  }

  if (!sanitized) {
    const isObj = Boolean(parsed && typeof parsed === 'object' && !Array.isArray(parsed));
    const hasProfile =
      isObj &&
      Boolean((parsed as Record<string, unknown>).profile) &&
      typeof (parsed as Record<string, unknown>).profile === 'object';
    logger.warn(
      '[BA9I Storage:Schema] Stored JSON does not match expected state schema; using fresh state.',
      {
        category: 'invalid_schema',
        key,
        rawLength: raw.length,
        parsedType: Array.isArray(parsed) ? 'array' : typeof parsed,
        hasProfile,
      }
    );
    return {
      status: 'error',
      category: 'invalid_schema',
      state: null,
      rawLength: raw.length,
    };
  }

  return {
    status: 'ok',
    state: sanitized,
    rawLength: raw.length,
  };
}

export function writeStorageState({
  storage,
  key,
  state,
  logger = DEFAULT_LOGGER,
}: {
  storage: StorageLike | null | undefined;
  key: string;
  state: unknown;
  logger?: StorageLogger;
}): WriteStorageResult {
  if (!storage) {
    logger.warn('[BA9I Storage:Write] localStorage is unavailable; changes will not persist.', {
      category: 'storage_unavailable',
      key,
    });
    return { ok: false, category: 'storage_unavailable' };
  }

  let serialized: string;
  try {
    serialized = JSON.stringify(state);
  } catch (err) {
    const meta = extractErrorMetadata(err);
    logger.error('[BA9I Storage:Serialize] Failed to serialize state to JSON.', {
      category: 'serialization_error',
      key,
      errorName: meta.name,
      errorMessage: meta.message,
    });
    return { ok: false, category: 'serialization_error' };
  }

  try {
    storage.setItem(key, serialized);
    return { ok: true, bytes: serialized.length };
  } catch (err) {
    const category = classifyStorageError(err);
    const meta = extractErrorMetadata(err);
    logger.error('[BA9I Storage:Write] Failed to persist state to localStorage.', {
      category,
      key,
      payloadChars: serialized.length,
      approxKB: Math.round(serialized.length / 1024),
      errorName: meta.name,
      errorCode: meta.code,
      errorMessage: meta.message,
    });
    return {
      ok: false,
      category,
      bytes: serialized.length,
    };
  }
}
