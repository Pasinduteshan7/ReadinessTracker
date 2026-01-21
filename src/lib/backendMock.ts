// Lightweight in-memory mock backend for frontend-only development.
// Provides the minimal API surface the app expects (auth + simple table queries).

type Row = Record<string, any>;

const db: Record<string, Row[]> = {
  student_profiles: [],
  advisor_profiles: [],
  admin_profiles: [],
  readiness_scores: [],
  advisor_student_assignments: [],
};

let currentUser: { id: string; email?: string } | null = null;

const authListeners: Array<(event: string, session: { user: typeof currentUser } | null) => void> = [];

function makeFrom(table: string) {
  const filters: Array<{ k: string; v: any; op?: string }> = [];
  let selected: string | null = null;
  let countHead: boolean | undefined;

  const api: any = {
    select(fields?: string, opts?: any) {
      selected = fields || null;
      if (opts && opts.head) countHead = opts.head;
      return api;
    },
    eq(k: string, v: any) {
      filters.push({ k, v, op: 'eq' });
      return api;
    },
    in(k: string, values: any[]) {
      filters.push({ k, v: values, op: 'in' });
      return api;
    },
    maybeSingle(): Promise<{ data: any; error: null } | { data: null; error: null }> {
      const rows = applyFilters(db[table] || [], filters, selected);
      return Promise.resolve({ data: rows.length > 0 ? rows[0] : null, error: null });
    },
    single(): Promise<{ data: any; error: null } | { data: null; error: null }> {
      const rows = applyFilters(db[table] || [], filters, selected);
      return Promise.resolve({ data: rows[0] ?? null, error: null });
    },
    insert(obj: Row | Row[]) {
      const items = Array.isArray(obj) ? obj : [obj];
      for (const it of items) {
        const id = it.id ?? `mock-${table}-${Math.random().toString(36).slice(2, 9)}`;
        db[table] = db[table] || [];
        db[table].push({ ...it, id });
      }
      return Promise.resolve({ data: items, error: null });
    },
    then(resolve: any) {
      if (countHead) {
        const count = (db[table] || []).length;
        return resolve({ count });
      }
      const rows = applyFilters(db[table] || [], filters, selected);
      return resolve({ data: rows });
    },
  };

  return api;
}

function applyFilters(rows: Row[], filters: Array<{ k: string; v: any; op?: string }>, selected: string | null) {
  let result = rows.slice();
  for (const f of filters) {
    if (f.op === 'in') {
      result = result.filter((r) => f.v.includes(r[f.k]));
    } else {
      result = result.filter((r) => r[f.k] === f.v);
    }
  }
  if (selected && selected !== '*') {
    const fields = selected.split(',').map((s) => s.trim().split(' ')[0]);
    result = result.map((r) => {
      const out: any = {};
      for (const f of fields) {
        if (f in r) out[f] = r[f];
      }
      return out;
    });
  }
  return result;
}

export const backend = {
  auth: {
    async getUser() {
      return { data: { user: currentUser }, error: null };
    },
    async signInWithPassword({ email, password }: { email: string; password?: string }) {
      void password;
      const id = `mock-user-${email?.split('@')[0]}`;
      currentUser = { id, email };
      authListeners.forEach((cb) => cb('SIGNED_IN', { user: currentUser }));
      return { data: { user: currentUser }, error: null };
    },
    async signUp({ email, password }: { email: string; password?: string }) {
      void password;
      const id = `mock-user-${email?.split('@')[0]}`;
      currentUser = { id, email };
      authListeners.forEach((cb) => cb('SIGNED_IN', { user: currentUser }));
      return { data: { user: currentUser }, error: null };
    },
    async signOut() {
      currentUser = null;
      authListeners.forEach((cb) => cb('SIGNED_OUT', null));
      return { error: null };
    },
    onAuthStateChange(callback: (event: string, session: { user: typeof currentUser } | null) => void) {
      authListeners.push(callback);
      return { data: { subscription: { unsubscribe: () => {
        const idx = authListeners.indexOf(callback);
        if (idx !== -1) authListeners.splice(idx, 1);
      } } }, error: null };
    },
  },
  from(table: string) {
    return makeFrom(table);
  },
};

export function __mockSeed__(table: string, rows: Row[]) {
  db[table] = db[table] || [];
  for (const r of rows) {
    db[table].push(r.id ? r : { ...r, id: r.id ?? `mock-${table}-${Math.random().toString(36).slice(2, 9)}` });
  }
}

export default backend;
