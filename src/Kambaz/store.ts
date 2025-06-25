import { configureStore } from "@reduxjs/toolkit";
import modulesReducer from "./Courses/Modules/reducer";
import accountReducer from "./Account/reducer";
import assignmentReducer from "./Courses/Assignments/reducer";
import coursesReducer from "./Courses/courseReducer";
import postReducer from "./Courses/Piazza/postReducer";
import folderReducer from "./Courses/Piazza/folderReducer";

const store = configureStore({
    reducer: {
        modulesReducer,
        accountReducer,
        assignmentReducer,
        coursesReducer,
        postReducer,
        folderReducer
    },
});
export default store;