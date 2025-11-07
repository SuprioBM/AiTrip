// Tiny auth helper - store token in localStorage. In production use a more secure approach.
export const saveAuth = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  try {
    const u = localStorage.getItem("user");    
    return u ? JSON.parse(u) : null;
  } catch (e) {    
    return null;
  }
};

export const getToken = () => localStorage.getItem("token");