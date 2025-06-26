import Navigation from "./Navigation.tsx";
import {Navigate, Route, Routes} from "react-router";
import QuestionAndAnswers from "./QuestionsAndAnswers.tsx";
import ManageClass from "./ManageClass.tsx";
import Resources from "./InactiveRoutes/Resources.tsx";
import Statistics from "./InactiveRoutes/Statistics.tsx";

export default function Piazza() {
    return (
        <div id="wd-piazza">
            <Navigation/>

            <div>
                <Routes>
                    <Route path="/" element={<Navigate to="QA"/>}/>
                    <Route path="QA" element={<QuestionAndAnswers/>}/>
                    <Route path="QA/Post/:pid" element={<QuestionAndAnswers/>}/>
                    <Route path="Resources" element={<Resources/>}/>
                    <Route path="Statistics" element={<Statistics/>}/>
                    <Route path="Manage/:setting" element={<ManageClass/>}/>
                </Routes>
            </div>
        </div>
    );
}