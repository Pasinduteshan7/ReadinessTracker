




function buildQuery(params: Record<string, string | number | boolean> = {}) {
  const esc = encodeURIComponent;
  return Object.keys(params)
    .map((k) => `${esc(k)}=${esc(String(params[k]))}`)
    .join('&');
}

function createProdAdapter() {
  const auth = {
    async getUser() {
      const res = await fetch('/api/auth/user', { credentials: 'include' });
      return { data: await res.json(), error: null };
    },
    async signInWithPassword({ email, password }: { email: string; password?: string }) {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      return { data: await res.json(), error: null };
    },
    async signUp({ email, password }: { email: string; password?: string }) {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      return { data: await res.json(), error: null };
    },
    async signOut() {
      await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' });
      return { error: null };
    },

    onAuthStateChange() {

      return { data: { subscription: { unsubscribe: () => {} } }, error: null };
    },
  };
  function from(table: string) {
    const filters: Array<{ k: string; v: any; op?: string }> = [];
    let selected: string | null = null;


  let _countHead: boolean | undefined;

  void _countHead;
    const api: any = {
      select(fields?: string, opts?: any) {
        selected = fields || null;
        if (opts && opts.head) _countHead = opts.head;
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
      async maybeSingle() {
        const q: any = {};
        if (selected) q.select = selected;
        for (const f of filters) {
          if (f.op === 'in') q[`${f.k}.in`] = f.v.join(',');
          else q[f.k] = f.v;
        }
        const qs = buildQuery(q);
        const res = await fetch(`/api/${table}?${qs}`, { credentials: 'include' });
        const data = await res.json();
        return { data: data?.[0] ?? null, error: null };
      },
      async single() {
        const { data } = await api.maybeSingle();
        return { data, error: null };
      },
      async insert(obj: any) {
        const res = await fetch(`/api/${table}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(obj),
        });
        return { data: await res.json(), error: null };
      },
      then(resolve: any) {
        return api.maybeSingle().then(resolve);
      },
    };
    return api;
  }
  return { auth, from };
}

let adapter: any;
if (import.meta.env.DEV) {


  const mock = require('./backendMock');

  adapter = (mock && (mock.default ?? mock.backend ?? mock)) || mock;
} else {
  adapter = createProdAdapter();
}
export const api = adapter;
export default api;
