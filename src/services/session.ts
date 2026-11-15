let currentFacultyId = '';
let currentFacultyToken = '';
export const getFacultyId = async () => currentFacultyId;
export const setFacultyId = (id: string) => { currentFacultyId = id; };
export const getFacultyToken = () => currentFacultyToken;
export const setFacultyToken = (token: string) => { currentFacultyToken = token; };

let currentStudentId = '';
export const getStudentId = async () => currentStudentId;
export const setStudentId = (id: string) => { currentStudentId = id; };

export const clearSession = () => {
  currentFacultyId = '';
  currentFacultyToken = '';
  currentStudentId = '';
};