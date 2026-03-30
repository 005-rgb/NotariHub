/**
 * NotaryHttpClient.ts
 * Helper for making API calls with necessary headers for role-based simulation.
 */
export const NotaryHttpClient = {
  getContext: () => {
    return {
      tid: localStorage.getItem('APP_SESSION_ID_tid') || 'tenant-1',
      uid: localStorage.getItem('APP_SESSION_ID_uid') || 'user-1'
    };
  },

  clearSession: () => {
    localStorage.removeItem('APP_SESSION_ID_token');
    localStorage.removeItem('APP_SESSION_ID_tid');
    localStorage.removeItem('APP_SESSION_ID_uid');
    window.location.href = '/login';
  },

  setSession: (token: string, tid: string, role: string) => {
    localStorage.setItem('APP_SESSION_ID_token', token);
    localStorage.setItem('APP_SESSION_ID_tid', tid);
    localStorage.setItem('userRole', role);
  },

  get: async (url: string, headers: any = {}) => {
    const { tid, uid } = NotaryHttpClient.getContext();
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tid,
        'x-user-id': uid,
        'x-user-role': localStorage.getItem('userRole') || 'NOTARIS',
        'x-user-name': 'Siti Aminah',
        'Authorization': `Bearer ${localStorage.getItem('APP_SESSION_ID_token')}`,
        ...headers
      }
    });
  },

  post: async (url: string, body: any, headers: any = {}) => {
    const { tid, uid } = NotaryHttpClient.getContext();
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tid,
        'x-user-id': uid,
        'x-user-role': localStorage.getItem('userRole') || 'NOTARIS',
        'x-user-name': 'Siti Aminah',
        'Authorization': `Bearer ${localStorage.getItem('APP_SESSION_ID_token')}`,
        ...headers
      },
      body: JSON.stringify(body)
    });
  },

  patch: async (url: string, body: any, headers: any = {}) => {
    const { tid, uid } = NotaryHttpClient.getContext();
    return fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tid,
        'x-user-id': uid,
        'x-user-role': localStorage.getItem('userRole') || 'NOTARIS',
        'x-user-name': 'Siti Aminah',
        'Authorization': `Bearer ${localStorage.getItem('APP_SESSION_ID_token')}`,
        ...headers
      },
      body: JSON.stringify(body)
    });
  },

  delete: async (url: string, headers: any = {}) => {
    const { tid, uid } = NotaryHttpClient.getContext();
    return fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tid,
        'x-user-id': uid,
        'x-user-role': localStorage.getItem('userRole') || 'NOTARIS',
        'x-user-name': 'Siti Aminah',
        'Authorization': `Bearer ${localStorage.getItem('APP_SESSION_ID_token')}`,
        ...headers
      }
    });
  }
};
