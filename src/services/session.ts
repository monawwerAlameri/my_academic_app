let currentFacultyId = 'Fa001'; //  لازم يكون معرّف دكتور موجود عندنا بقاعدة البيانات

export const getFacultyId = async () => currentFacultyId;
export const setFacultyId = (id: string) => { currentFacultyId = id; };


let currentStudentId = '202100000'; // مؤقت لازم نبدله برقم جامعي لطالبة موجودة بقاعدة البيانات 

export const getStudentId = async () => currentStudentId;
export const setStudentId = (id: string) => { currentStudentId = id; };