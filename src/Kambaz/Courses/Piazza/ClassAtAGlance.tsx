import {useDispatch, useSelector} from "react-redux";
import {useParams} from "react-router";
import * as postClient from "./client.ts";
import {setUserPosts} from "./postReducer.ts";
import {useEffect, useState} from "react";
import {FaCheckSquare} from "react-icons/fa";
import {BsExclamationSquareFill} from "react-icons/bs";
import {findUsersForCourse} from "../client.ts";

export default function ClassAtAGlance() {
    const {userPosts} = useSelector((state: any) => state.postReducer);
    const [allPosts, setAllPosts] = useState([]);
    const {cid} = useParams();
    const {currentUser} = useSelector((state: any) => state.accountReducer);
    const dispatch = useDispatch();
    const [numberOfStudents, setNumberOfStudents] = useState(0);

    // I got this from ChatGPT
    const filterPostsByCourseId = async () => {
        const classPosts = await postClient.getPostsByCourseId(cid as string);

        // Get all response posts (flattened)
        const responseIds = classPosts.flatMap((post: any) => post.responses);
        const uniqueResponseIds = [...new Set(responseIds)];

        const fullResponses = await Promise.all(
            (uniqueResponseIds as string[]).map((rid) => postClient.getPostsByPostId(rid))
        );

        // Map response ID to post object
        const responseMap = new Map(fullResponses.map(r => [r._id, r]));

        // Attach full response objects to each post
        const postsWithResolvedResponses = classPosts.map((post: any) => ({
            ...post,
            responses: post.responses
                .map((rid: string) => responseMap.get(rid))
                .filter((r: any) => r !== undefined),
        }));

        setAllPosts(postsWithResolvedResponses);

        const visiblePosts = postsWithResolvedResponses.filter(
            (post: any) =>
                (post.postTo.length === 0 || post.postTo.includes(currentUser._id)) &&
                (post.type === "QUESTION" || post.type === "NOTE")
        );

        dispatch(setUserPosts(visiblePosts));
    };

    const getUnreadCount = () => {
        return userPosts.filter(
            (post: any) =>
                post.user !== currentUser._id && !post.readBy.includes(currentUser._id)
        ).length;
    };

    const getUnansweredCount = () => {
        return userPosts.filter((post: any) => post.responses.length === 0 && post.type === "QUESTION").length;
    }

    const getNumberOfStudents = async () => {
        const users = await findUsersForCourse(cid as string);
        const students = users.filter((user: any) => user.role === "STUDENT");
        setNumberOfStudents(students.length);
    }

    const getInstructorResponses = () => {
        return allPosts.reduce((count: number, post: any) => {
            return count + post.responses.filter((r: any) => r.userRole === "FACULTY").length;
        }, 0);
    };

    const getStudentResponses = () => {
        return allPosts.reduce((count: number, post: any) => {
            return count + post.responses.filter((r: any) => r.userRole === "STUDENT").length;
        }, 0);
    };

    useEffect(() => {
        filterPostsByCourseId();
        getNumberOfStudents();
    }, []);

    return (
        <div id="wd-piazza-class-at-a-glance">
            <div className="class-glance-box">
                <h2>Class at a Glance</h2>

                <div className="glance-content">
                    <div className="left-col">
                        <div className="check-item">
                            {
                                getUnreadCount() === 0 ? (
                                    <div className="me-2">
                                        <FaCheckSquare size={25}
                                                       className="wd-fg-color-green me-1"/>
                                        no unread posts
                                    </div>
                                ) : (
                                    <div className="me-2">
                                        <BsExclamationSquareFill size={25}
                                                                 className="wd-fg-color-red me-1"/>
                                        {getUnreadCount()} unread posts
                                    </div>
                                )
                            }

                            {
                                getUnansweredCount() === 0 ? (
                                    <div className="me-2">
                                        <FaCheckSquare size={25}
                                                       className="wd-fg-color-green me-1"/>
                                        no unanswered questions
                                    </div>
                                ) : (
                                    <div className="me-2">
                                        <BsExclamationSquareFill size={25}
                                                                 className="wd-fg-color-red me-1"/>
                                        {getUnansweredCount()} unanswered questions
                                    </div>
                                )
                            }
                        </div>
                    </div>
                    <div className="right-col">
                        <div className="right-inner-col right-values">
                            <div className="value">active instructor license</div>
                            <div className="value">{userPosts.length}</div>
                            <div className="value">{getInstructorResponses()}</div>
                            <div className="value">{getStudentResponses()}</div>
                            <div className="value">{numberOfStudents}</div>
                        </div>
                        <div className="right-inner-col">
                            <div className="label">license status</div>
                            <div className="label">total posts</div>
                            <div className="label">instructors' responses</div>
                            <div className="label">students' responses</div>
                            <div className="label">students enrolled</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );


}