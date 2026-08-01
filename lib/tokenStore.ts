type Callback = () => void;
type TokensCallback = (access: string, refresh: string, expiresAt: number) => Promise<void>;

let _token: string | null = null;
let _refreshToken: string | null = null;
let _expiresAt: number | null = null;
let _onUnauthorized: Callback | null = null;

export const tokenStore = {
  get:          () => _token,
  getRefresh:   () => _refreshToken,
  getExpiresAt: () => _expiresAt,

  set: (access: string, refresh: string, expiresAt: number) => {
    _token        = access;
    _refreshToken = refresh;
    _expiresAt    = expiresAt;
  },

  clear: () => {
    _token = null;
    _refreshToken = null;
    _expiresAt = null;
  },

  isExpiringSoon: () => {
    if (!_expiresAt) return false;
    return Date.now() / 1000 > _expiresAt - 300; // 5 min buffer
  },

  onUnauthorized:    (cb: Callback) => { _onUnauthorized = cb; },
  unauthorized:      () => { _onUnauthorized?.(); },

  onTokensRefreshed: null as TokensCallback | null,
};
