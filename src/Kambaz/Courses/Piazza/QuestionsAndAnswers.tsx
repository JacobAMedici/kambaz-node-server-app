import { useState } from "react";
import FolderFilter from "./FolderFilter.tsx";
import Posts from "./Posts.tsx";
import ListOfPosts from "./ListOfPosts.tsx";
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi";

export default function QuestionAndAnswers() {
    const [showLOP, setShowLOP] = useState(true);

    return (
        // Like in index, this is from ChatGPT
        <div
            id="wd-piazza-questions_and_answers"
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
            }}
        >
            {/* Sticky Folder Filter Bar */}
            <div
                style={{
                    position: "sticky",
                    top: 0, // match navbar height
                    zIndex: 999,
                    backgroundColor: "#f8f9fa", // match your existing filter bar bg
                }}
            >
                <FolderFilter />
                <div className="wd-flex-row-container wd-bg-color-light-gray wd-icon-align wd-gap wd-padding">
                    {showLOP ? (
                        <BiSolidLeftArrow onClick={() => setShowLOP(false)} />
                    ) : (
                        <BiSolidRightArrow onClick={() => setShowLOP(true)} />
                    )}
                </div>
            </div>

            {/* Scrollable Content Below */}
            <div style={{ flex: 1, overflowY: "auto" }}>
                <div id="wd-css-side-bars" className="wd-grid-row">
                    {showLOP ? (
                        <div id="wd-piazza-show-list-of-posts">
                            <div className="wd-grid-col-left-sidebar-piazza">
                                <ListOfPosts />
                            </div>
                            <div className="wd-grid-col-main-content-piazza">
                                <Posts />
                            </div>
                        </div>
                    ) : (
                        <Posts />
                    )}
                </div>
            </div>
        </div>
    );
}
