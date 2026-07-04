type Callback = () => void;

let _token: string | null = null;
let _onUnauthorized: Callback | null = null;

export const tokenStore = {
  get:             ()           => _token,
  set:             (t: string | null) => { _token = t; },
  onUnauthorized:  (cb: Callback)     => { _onUnauthorized = cb; },
  unauthorized:    ()           => { _onUnauthorized?.(); },
};
