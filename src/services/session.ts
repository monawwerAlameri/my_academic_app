let currentFacultyId = '';
export const getFacultyId = async () => currentFacultyId;
export const setFacultyId = (id: string) => { currentFacultyId = id; };

let currentStudentId = '';
export const getStudentId = async () => currentStudentId;
export const setStudentId = (id: string) => { currentStudentId = id; };

let currentAdminId = '';
export const getAdminId = () => currentAdminId;
export const setAdminId = (id: string) => { currentAdminId = id; };

export const clearSession = () => {
  currentAdminId = '';
  currentFacultyId = '';
  currentStudentId = '';
};