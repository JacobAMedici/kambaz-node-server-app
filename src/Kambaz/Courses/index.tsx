import CourseNavigation from "./Navigation";
import Modules from "./Modules";
import Home from "./Home";
import Grades from "./Grades";
import {Navigate, Route, Routes, useLocation, useParams} from "react-router";
import Assignments from "./Assignments";
import AssignmentEditor from "./Assignments/Editor.tsx";
import People from "./People";
import Piazza from "./Piazza";
import Quizzes from "./Quizzes";
import Zoom from "./Zoom";
import {FaAlignJustify} from "react-icons/fa";
import PeopleTable from "./People/Table.tsx";
import {useSelector} from "react-redux";
import * as userClient from "../Account/client.ts";
import {useEffect, useState} from "react";

export default function Courses({courses}: { courses: any[]; }) {
    const {cid} = useParams();
    const course = courses.find((course) => course._id === cid);
    const currentUser = useSelector((state: any) => state.accountReducer.currentUser);
    const {pathname} = useLocation();

    // I got these following next 20 lines of code or so from ChatGPT to help me control
    // access as my design was completely flipped upside down.
    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        const checkEnrollment = async () => {
            if (!currentUser || !cid) return;

            try {
                const courses = await userClient.findCoursesForUser(currentUser._id) || [];

                const enrolled = courses
                    .filter((c: any) => c && c._id)  // filter out null or malformed entries
                    .some((c: any) => c._id === cid);

                setIsEnrolled(enrolled);
            } catch (e) {
                console.error("Error checking enrollment:", e);
                setIsEnrolled(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkEnrollment();
    }, [cid, currentUser]);

    if (!currentUser) {
        return <Navigate to="/Kambaz/Account/Signin" />;
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isEnrolled) {
        return <Navigate to="/Kambaz/Dashboard" />;
    }


    return (
        <div id="wd-courses">
            <h2 className="text-danger">
                <FaAlignJustify className="me-4 fs-4 mb-1"/>
                {course && course.name} &gt; {pathname.split("/")[4]} </h2>
            <hr/>
            <hr/>
            <div className="d-flex">
                <div className="d-none d-md-block">
                    <CourseNavigation/>
                </div>
                <Routes>
                    <Route path="/" element={<Navigate to="Home"/>}/>
                    <Route path="Home" element={<Home/>}/>
                    <Route path="Modules" element={<Modules/>}/>
                    <Route path="Assignments" element={<Assignments/>}/>
                    <Route path="Assignments/:aid" element={<AssignmentEditor/>}/>
                    <Route path="Grades" element={<Grades/>}/>
                    <Route path="People" element={<People/>}/>
                    <Route path="Piazza/*" element={<Piazza/>}/>
                    <Route path="Quizzes" element={<Quizzes/>}/>
                    <Route path="Zoom" element={<Zoom/>}/>
                    <Route path="People" element={<PeopleTable/>}/>
                </Routes>
            </div>
        </div>
    );
}
