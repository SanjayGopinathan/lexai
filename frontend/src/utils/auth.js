/**
 * Auth utilities — token/user storage helpers
 */
export const saveAuth = (token, user) => {
  localStorage.setItem('lexai_token', token)
  localStorage.setItem('lexai_user', JSON.stringify(user))
}

export const clearAuth = () => {
  localStorage.removeItem('lexai_token')
  localStorage.removeItem('lexai_user')
}

export const getToken = () => localStorage.getItem('lexai_token')

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('lexai_user'))
  } catch {
    return null
  }
}

export const isLoggedIn = () => !!getToken()
