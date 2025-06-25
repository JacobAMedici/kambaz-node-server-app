import {createSlice} from "@reduxjs/toolkit";
import {v4 as uuidv4} from "uuid";
import * as courseClient from "../Courses/client";
import * as userClient from "../Account/client";
import * as piazzaClient from "./Piazza/client.ts";

type Course = {
    _id: string;
    number: string;
    startDate: string;
    endDate: string;
    department: string;
    credits: number;
    author: string;
};

type Enrollment = {
    _id: string;
    user: string;
    course: string;
};


const initialState: {
    courses: Course[];
    enrollments: Enrollment[];
} = {
    courses: [],
    enrollments: [],
};

export const loadInitialState = () => async (dispatch: any) => {
    try {
        const courses = await courseClient.fetchAllCourses();
        const enrollments = await userClient.findAllEnrollments();

        dispatch(setCourses(courses));
        dispatch(setEnrollments(enrollments)); // You need to create this reducer
    } catch (e) {
        console.error("Failed to load initial state", e);
    }
};


// The following three functions were generated with the help of ChatGPT as I did not know
// how to implement them properly using the reading due to my implementation
export const addCourseAsync = (course: any, userId: string) => async (dispatch: any) => {
    try {
        const newCourse = await courseClient.createCourse(course);
        await dispatch(addCourse(newCourse));
        await dispatch(enrollAsync(userId, newCourse._id));
        const defaultFolders = ["hw1", "hw2", "hw3", "hw4", "hw5", "hw6", "exam1", "logistics", "office hours"];
        for (const content of defaultFolders) {
            const folder = {
                _id: uuidv4(),
                name: content,
                cid: newCourse._id,
            };
            await piazzaClient.addFolder(folder);
        }
    } catch (e) {
        console.error("Failed to add course", e);
    }
};

export const deleteCourseAsync = (courseId: string) => async (dispatch: any) => {
    try {
        await courseClient.deleteCourse(courseId);
        dispatch(deleteCourse(courseId));
    } catch (e) {
        console.error("Failed to delete course", e);
    }
}

export const updateCourseAsync = (course: any) => async (dispatch: any) => {
    try {
        const updatedCourse = await courseClient.updateCourse(course);
        dispatch(updateCourse(updatedCourse));
    } catch (e) {
        console.error("Failed to update course", e);
    }
};

export const enrollAsync = (userId: string, courseId: string) => async (dispatch: any) => {
    // console.log("Unenrolling user:", userId, "from course:", courseId);
    try {
        await userClient.enrollInCourse(userId, courseId);
        await dispatch(enroll({ userId, courseId }));
        console.log("Successfully enrolled")
    } catch (e) {
        console.error("Failed to enroll", e);
    }
};

export const unenrollAsync = (userId: string, courseId: string) => async (dispatch: any) => {
    // console.log("Unenrolling user:", userId, "from course:", courseId);
    try {
        await userClient.unenrollFromCourse(userId, courseId);
        await dispatch(unenroll({ userId, courseId }));
        // console.log(initialState.enrollments)
    } catch (e) {
        console.error("Failed to unenroll", e);
    }
};


const modulesSlice = createSlice({
    name: "courses",
    initialState,

    reducers: {
        setCourses: (state, action) => {
            state.courses = action.payload;
        },

        addCourse: (state, { payload: course }) => {
            const newCourse = {
                ...course,
                _id: course._id || uuidv4(),
                number: course.number || "",
                startDate: course.startDate || new Date().toISOString(),
                endDate: course.endDate || new Date().toISOString(),
                department: course.department || "",
                credits: course.credits || 0,
                author: "",
            };
            state.courses = [...state.courses, newCourse];
        },

        deleteCourse: (state, {payload: cid}) => {
            state.courses = state.courses.filter(
                (m: any) => m._id !== cid);
        },

        updateCourse: (state, { payload: updated }) => {
            state.courses = state.courses.map((c: any) =>
                c._id === updated._id ? updated : c
            );
        },

        enroll: (state, { payload: payload }) => {
            const alreadyEnrolled = state.enrollments.some(
                (enrollment: any) =>
                    enrollment.user === payload.userId && enrollment.course === payload.courseId
            );

            // console.log(alreadyEnrolled)
            // console.log(state.enrollments);

            if (!alreadyEnrolled) {
                state.enrollments = [...state.enrollments,
                    {
                        _id: `${payload.userId}-${payload.courseId}`,
                        user: payload.userId,
                        course: payload.courseId
                    }
                ] as any;
            }
        },

        unenroll: (state, {payload: payload}) => {
            state.enrollments = state.enrollments.filter(
                (enrollment: any) =>
                    !(enrollment.user === payload.userId && enrollment.course === payload.courseId)
            );
        },

        setEnrollments: (state, action) => {
            state.enrollments = action.payload;
        },
    },
});
export const {setCourses, addCourse, deleteCourse, updateCourse, enroll, unenroll, setEnrollments} =
    modulesSlice.actions;
export default modulesSlice.reducer;