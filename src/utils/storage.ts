const setLocationToken = (token: string) => {
  localStorage.setItem('token', token);
};
const getLocationToken = () => {
  return localStorage.getItem('token');
};
const clearLocationToken = () => {
  localStorage.removeItem('token');
};

const setProjectId = (id: string) => {
  sessionStorage.setItem('projectId', id);
};
const getProjectId = () => {
  return sessionStorage.getItem('projectId');
};

export {
  setLocationToken,
  getLocationToken,
  clearLocationToken,
  setProjectId,
  getProjectId,
};
