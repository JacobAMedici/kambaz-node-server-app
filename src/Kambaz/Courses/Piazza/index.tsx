import Navigation from "./Navigation.tsx";
import {Navigate, Route, Routes} from "react-router";
import QuestionAndAnswers from "./QuestionsAndAnswers.tsx";
import ManageClass from "./ManageClass.tsx";
import Resources from "./InactiveRoutes/Resources.tsx";
import Statistics from "./InactiveRoutes/Statistics.tsx";

export default function Piazza() {
    return (
        // This CSS was a last minute addition that I got from ChatGPT, hence it being like this
        <div id="wd-piazza" style={{
            display: "flex",
            flexDirection: "column",
            height: "86vh",
            overflow: "hidden"
        }}>
            <div style={{
                position: "sticky",
                top: 0,
                zIndex: 1000,
                backgroundColor: "#3b6e8c"
            }}>
                <Navigation />
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
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