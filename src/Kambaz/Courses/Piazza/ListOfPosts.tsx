import {useNavigate} from "react-router-dom";
import {FormControl} from "react-bootstrap";
import {useEffect, useState} from "react";
import * as postClient from "./client.ts";
import {useParams} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import {setClassPosts} from "./postReducer.ts";


export default function ListOfPosts() {
    const {posts} = useSelector((state: any) => state.postReducer);
    const {pid} = useParams();
    const {selectedFolders} = useSelector((state: any) => state.folderReducer);
    const {cid} = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {currentUser} = useSelector((state: any) => state.accountReducer);
    const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({});

    const toggleSection = (section: string) => {
        setCollapsedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // This function is from ChatGPT as this obviously was not covered in this class
    function groupPostsByWeek(posts: any[]) {
        const now = new Date();
        const groups: { [key: string]: any[] } = {};

        const getWeekRange = (date: Date) => {
            const monday = new Date(date);
            monday.setDate(date.getDate() - (date.getDay() === 0 ? 6 : date.getDay() - 1));
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            return `${monday.getMonth() + 1}/${monday.getDate()} - ${sunday.getMonth() + 1}/${sunday.getDate()}`;
        };

        for (const post of posts) {
            const dt = new Date(post.dateTime);
            const deltaDays = Math.floor((now.getTime() - dt.getTime()) / (1000 * 60 * 60 * 24));

            let label = getWeekRange(dt); // default
            if (deltaDays === 0) label = "Today";
            else if (deltaDays === 1) label = "Yesterday";
            else if (deltaDays <= 7) label = "Last Week";

            if (!groups[label]) groups[label] = [];
            groups[label].push(post);
        }

        // Sort posts within each group by descending date
        Object.keys(groups).forEach((label) => {
            groups[label].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
        });

        // Sort the group labels by the most recent post in each group
        const sortedGroups = Object.entries(groups).sort(
            (a, b) => new Date(b[1][0].dateTime).getTime() - new Date(a[1][0].dateTime).getTime()
        );

        return Object.fromEntries(sortedGroups);
    }

    const filterPostsByContent = async (content: string) => {
        if (content) {
            // I didn't know how to do the filter here to make it so that it only shows posts in the selected folders, so I asked ChatGPT
            const filteredPosts = (await postClient.getPostsByContent(content, cid as string))
                .filter((post: any) => (selectedFolders.length === 0 || selectedFolders.includes(post.folderId)) && (post.type === "QUESTION" || post.type === "NOTE"));

            const sortedFilteredPosts = filteredPosts.sort(
                (a: any, b: any) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
            );

            dispatch(setClassPosts(sortedFilteredPosts));
        } else {
            await filterPostsByFolder();
        }
    };

    // This function was created by ChatGPT
    const filterPostsByFolder = async () => {
        const filteredPosts = [];

        if (selectedFolders.length === 0) {
            await filterPostsByCourseId();
            return;
        }

        for (const folderId of selectedFolders) {
            const posts = await postClient.getPostsByFolderId(folderId);
            filteredPosts.push(...posts);
        }

        const seen = new Set();
        const visiblePosts = filteredPosts.filter((post: any) => {
            const isVisibleType = post.type === "QUESTION" || post.type === "NOTE";
            const isDuplicate = seen.has(post._id);
            if (!isDuplicate && isVisibleType) {
                seen.add(post._id);
                return true;
            }
            return false;
        });

        const sortedFilteredPosts = visiblePosts.sort(
            (a: any, b: any) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
        );

        dispatch(setClassPosts(sortedFilteredPosts));
    };

    const filterPostsByCourseId = async () => {
        const classPosts = await postClient.getPostsByCourseId(cid as string);

        const visiblePosts = classPosts.filter((post: any) =>
            post.type === "QUESTION" || post.type === "NOTE"
        );

        const sortedPosts = visiblePosts.sort(
            (a: any, b: any) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
        );

        dispatch(setClassPosts(sortedPosts));
    };


    useEffect(() => {
        filterPostsByFolder();
    }, [selectedFolders]);

    // This was created by ChatGPT because we did not cover dates in this class
    function formatSmartDate(dateString: string): string {
        const inputDate = new Date(dateString);
        const now = new Date();

        // Check if it's today
        const isToday = inputDate.toDateString() === now.toDateString();
        if (isToday) {
            return inputDate.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});
        }

        // Get the start of this week (Monday)
        const currentDay = now.getDay(); // 0 (Sun) to 6 (Sat)
        const diffToMonday = (currentDay + 6) % 7; // number of days since last Monday
        const mondayThisWeek = new Date(now);
        mondayThisWeek.setDate(now.getDate() - diffToMonday);
        mondayThisWeek.setHours(0, 0, 0, 0);

        if (inputDate >= mondayThisWeek) {
            return inputDate.toLocaleDateString(undefined, {weekday: 'long'});
        }

        // Older than this week → just show date
        return inputDate.toLocaleDateString();
    }


    const displayPost = (post: any) => {
        if (!post.postTo.includes(currentUser._id) && post.postTo.length !== 0) {
            return null;
        }
        return (
            <div key={post._id}
                 className={`post-container${pid === post._id ? " selected-post" : ""}`}
                 onClick={() => navigate(`/Kambaz/Courses/${cid}/Piazza/QA/Post/${post._id}`)}>
                <div className="wd-grid-col-lop-left">
                    <div className="post-title post-title-row">{post.userRole === "FACULTY" &&
                        <div className="instructor-tag">
                            <span className="instructor-icon"></span>
                            <span className="instructor-label">Instr</span>
                        </div>
                    }{post.summary}</div>
                    <div
                        className="post-content">
                        {post.content}
                    </div>
                </div>
                <div className="wd-grid-col-lop-right post-date">
                    {formatSmartDate(post.dateTime)}
                </div>
            </div>
        );
    }

    return (
        <div id="wd-piazza-list_of_posts">
            {/*    Add Post and Search Functions*/}
            <div id="wd-piazza-show-list-of-posts">
                <div className="wd-grid-col-left-sidebar-piazza wd-bg-color-light-gray">
                    <div className="wd-piazza-add-new-post-btn">
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/Kambaz/Courses/${cid}/Piazza/QA/Post/New`)}
                        >
                            Add Post
                        </button>
                    </div>
                </div>
                <div className={"wd-grid-col-main-content-piazza wd-bg-color-light-gray"}>
                    <div className="wd-piazza-search-posts">
                        <FormControl onChange={(e) => filterPostsByContent(e.target.value)}
                                     placeholder="Search Posts"/>
                    </div>
                </div>
            </div>
            {/* This code is from ChatGPT*/}
            {Object.entries(groupPostsByWeek(posts)).map(([section, sectionPosts]) => (
                <div key={section}>
                    <div
                        onClick={() => toggleSection(section)}
                        style={{
                            cursor: "pointer",
                            fontWeight: "bold",
                            backgroundColor: "#e9ecef",
                            padding: "8px 12px",
                            borderRadius: "4px",
                            marginTop: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                        }}
                    >
            <span style={{ fontSize: "0.85rem" }}>
                {collapsedSections[section] ? "▸" : "▾"}
            </span>
                        <span>{section}</span>
                    </div>
                    {!collapsedSections[section] && sectionPosts.map((post: any) => displayPost(post))}
                </div>
            ))}
        </div>
    );
}