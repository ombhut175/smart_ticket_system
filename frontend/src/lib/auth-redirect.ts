// Lightweight redirect guard utility previously in src/lib/api.ts
// Avoid import cycles with request helpers; keep this module focused on the flag only

let hasRedirected = false

export const resetRedirectFlag = () => {
  hasRedirected = false
}

export const shouldRedirectOn401 = () => {
  // Allow callers to check and set the flag
  if (hasRedirected) return false
  hasRedirected = true
  return true
}

