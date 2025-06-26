import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {deletePost, getFolders, getPostsByPostId, updatePost} from "./client.ts";
import {useDispatch, useSelector} from "react-redux";
import {MdOutlineNotes} from "react-icons/md";
import {BsFillQuestionSquareFill} from "react-icons/bs";
import {deleteClassPost} from "./postReducer.ts";
import PostEditor from "./PostEditor.tsx";
import {findUsersForCourse} from "../client.ts";

export type Post = {
    _id: string;
    type: string;
    summary: string;
    user: string;
    userRole: string;
    content: string;
    courseId: string;
    folders: string[];
    postToAll: boolean;
    postTo: string[];
    dateTime: Date;
    responses: string[];
    readBy: string[];
};

export type User = {
    _id: string;
    username: string;
    password: string;
    firstName?: string;
    email?: string;
    lastName?: string;
    dob?: Date;
    role: "STUDENT" | "FACULTY" | "ADMIN" | "USER";
    loginId?: string;
    section?: string;
    lastActivity?: Date;
    totalActivity?: string;
};

export default function ViewPost() {
    const {pid, cid} = useParams();
    const [post, setPost] = useState<Post | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [folderNames, setFolderNames] = useState<string[]>([]);
    const [editing, setEditing] = useState(false);
    const [studentEditing, setStudentEditing] = useState(false);
    const [instructorEditing, setInstructorEditing] = useState(false);
    const [followUpEditing, setFollowUpEditing] = useState(false);
    const [editingResponse, setEditingResponse] = useState(null);
    const [responses, setResponses] = useState<Post[]>([]);
    const navigate = useNavigate();
    const {currentUser} = useSelector((state: any) => state.accountReducer);
    const dispatch = useDispatch();

    const deletePostAsync = async (postId: string) => {
        console.log(`Deleting post with ID: ${postId}`);
        if (!postId) return;
        await deletePost(postId);
        dispatch(deleteClassPost(postId));
        if (post && postId === post._id) {
            navigate(`/Kambaz/Courses/${cid}/Piazza`);
        }
        fetchPost();
    };

    const fetchPost = async () => {
        const result = await getPostsByPostId(pid as string);
        if (!result) {
            navigate(`/Kambaz/Courses/${cid}/Piazza`);
        } else {
            // I didn't know how to make it so that it only adds if the user hasn't read it yet
            const newResult = {
                ...result,
                readBy: result.readBy.includes(currentUser._id)
                    ? result.readBy
                    : [...result.readBy, currentUser._id]
            };
            setPost(newResult);
            await updatePost(newResult as any);

            const allFolders = await getFolders(cid as string);

            // I got this from ChatGPT because I wasn't sure how to filter for this
            const matchedNames = result.folders
                .map((fid: string) => {
                    const match = allFolders.find((f: any) => f._id === fid);
                    return match ? match.name : null;
                })
                .filter((name: any): name is string => name !== null);

            setFolderNames(matchedNames);

            const fullResponses = await Promise.all(
                newResult.responses.map(async (rid: string) => {
                    try {
                        return await getPostsByPostId(rid);
                    } catch {
                        return null;
                    }
                })
            );
            setResponses(fullResponses.filter((r): r is Post => r !== null));

        }
    };

    const fetchUsers = async () => {
        const classUsers = await findUsersForCourse(cid as string);
        setUsers(classUsers);
    }

    useEffect(() => {
        fetchPost();
        fetchUsers();
    }, [pid, cid, navigate]);

    // I was having issues with crashing before loading, and asked ChatGPT, which told me to use this
    if (post === null) return <div>Loading...</div>;

    const postViewer = () => {
        return (
            <div id="wd-piazza-view-post-body">
                <div className="d-flex justify-content-between align-items-center">
                    <h1>{post.summary}</h1>
                    {/* This dropdown menu came from ChatGPT*/}
                    {(currentUser._id === post.user || currentUser.role === "FACULTY") &&
                        <div className="dropdown ms-auto">
                            <button
                                className="btn btn-sm btn-secondary dropdown-toggle"
                                type="button"
                                id="postActionsDropdown"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                Actions
                            </button>
                            <ul className="dropdown-menu" aria-labelledby="postActionsDropdown">
                                <li>
                                    <button className="dropdown-item"
                                            onClick={() => setEditing(!editing)}>Edit
                                    </button>
                                </li>
                                <li>
                                    <button className="dropdown-item text-danger"
                                            onClick={() => deletePostAsync(post._id)}>Delete
                                    </button>
                                </li>
                            </ul>
                        </div>}
                </div>
                <div className="wd-piazza-view-post-content">
                    {post.content}
                </div>
                {folderNames.map((name, index) => (
                    <span key={index} className="folder-badge me-2">
                    {name}
                </span>
                ))}
                <br/>
                <br/>
                {(currentUser._id === post.user || currentUser.role === "FACULTY") &&
                    <button className="btn btn-primary"
                            onClick={() => setEditing(!editing)}>
                        Edit
                    </button>}
            </div>
        )
    }

    return (
        <div id="wd-piazza-view-post">
            <div className="wd-piazza-view-post">
                <div className="piazza-post-header">
                    <div className="piazza-post-info">
                        {post.type === "QUESTION" ? (
                            <BsFillQuestionSquareFill
                                className={post.responses.length === 0 ? "text-danger" : ""}/>
                        ) : (
                            <MdOutlineNotes/>
                        )}
                        {post.type === "QUESTION" ? "question" : "note"} @{post._id.substring(0, 8)} - {users.find(u => u._id === post.user)?.firstName || "Unknown"} {users.find(u => u._id === post.user)?.lastName || "User"} -
                        at {new Date(post.dateTime).toLocaleString()}
                    </div>
                    <div className="piazza-views">{post.readBy.length} views</div>
                </div>
                {editing ? <PostEditor post={post} onPostSubmit={() => {
                    fetchPost();
                    setEditing(false);
                }}/> : postViewer()}
            </div>
            {post.type === "QUESTION" && (
                <>
                    <div id="wd-piazza-view-post-student-answer" className="wd-piazza-view-post">
                        <div className="piazza-post-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className="status-icon student">S</span>
                                <span>The Student's Answers</span>
                            </div>
                        </div>
                        {responses.filter((response: any) => response.type === "STUDENT_RESPONSE").map(
                            (response: any) => (
                                <div key={response._id} className="follow-up-response">
                                    <div className="follow-up-header">
                                        <span>{users.find(u => u._id === response.user)?.firstName || "Unknown"} {users.find(u => u._id === response.user)?.lastName || "User"}</span>
                                        <span className="follow-up-date">
                                        {new Date(response.dateTime).toLocaleString()}
                                    </span>
                                    </div>
                                    <div className="follow-up-content">
                                        {response.content}
                                    </div>
                                </div>
                            )
                        )}
                        <div className="wd-piazza-view-post-add-to-conversation">
                            {currentUser.role === "STUDENT" && (
                                <>
                                    <button className="btn btn-sm"
                                            onClick={() => setStudentEditing(!studentEditing)}>
                                        Add to this conversation
                                    </button>
                                    {studentEditing && (
                                        <PostEditor post={null} type={"STUDENT_RESPONSE"}
                                                    parentPost={post} onPostSubmit={() => {
                                            fetchPost();
                                            setStudentEditing(false);
                                        }}/>
                                    )}</>
                            )}
                        </div>
                    </div>

                    <div id="wd-piazza-view-post-instructor-answer" className="wd-piazza-view-post">
                        <div className="piazza-post-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className="status-icon info">i</span>
                                <span>The Instructor's Answers</span>
                            </div>
                        </div>
                        <div className="wd-piazza-view-post-add-to-conversation">
                            {responses.filter((response: any) => response.type === "INSTRUCTOR_RESPONSE").map(
                                (response: any) => (
                                    <div key={response._id} className="follow-up-response">
                                        <div
                                            className="follow-up-header d-flex justify-content-between align-items-center">
                                            <span>
                                                {users.find(u => u._id === response.user)?.firstName || "Unknown"}{" "}
                                                {users.find(u => u._id === response.user)?.lastName || "User"}
                                            </span>
                                            <div className="d-flex align-items-center gap-3">
                                                <span className="follow-up-date">
                                                    {new Date(response.dateTime).toLocaleString()}
                                                </span>
                                                {(currentUser._id === post.user || currentUser.role === "FACULTY") && (
                                                    <div className="dropdown">
                                                        <button
                                                            className="btn btn-sm btn-secondary dropdown-toggle"
                                                            type="button"
                                                            id="postActionsDropdown"
                                                            data-bs-toggle="dropdown"
                                                            aria-expanded="false"
                                                        >
                                                            Actions
                                                        </button>
                                                        <ul className="dropdown-menu"
                                                            aria-labelledby="postActionsDropdown">
                                                            <li>
                                                                <button className="dropdown-item"
                                                                        onClick={() => setEditingResponse(response._id)}>
                                                                    Edit
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button
                                                                    className="dropdown-item text-danger"
                                                                    onClick={() => deletePostAsync(response._id)}>
                                                                    Delete
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {editingResponse === response._id ? (
                                            <PostEditor post={response} type={"INSTRUCTOR_RESPONSE"}
                                                        parentPost={post} onPostSubmit={() => {
                                                fetchPost();
                                                setInstructorEditing(false);
                                                setEditingResponse(null);
                                            }}/>) : (
                                            <div className="follow-up-content">
                                                {response.content}
                                            </div>)}
                                    </div>

                                )
                            )}
                            {currentUser.role === "FACULTY" && (
                                <>
                                    <button className="btn btn-sm"
                                            onClick={() => setInstructorEditing(!instructorEditing)}>
                                        Add to this conversation
                                    </button>
                                    {instructorEditing && (
                                        <PostEditor post={null} type={"INSTRUCTOR_RESPONSE"}
                                                    parentPost={post} onPostSubmit={() => {
                                            fetchPost();
                                            setInstructorEditing(false);
                                        }}/>
                                    )}</>
                            )}
                        </div>
                    </div>
                </>
            )}

            <div id="wd-piazza-view-post-follow-up" className="wd-piazza-view-post">
                <div className="piazza-post-header">
                    Follow-up Discussion
                </div>
                <div className="wd-piazza-view-post-add-to-conversation">
                    {responses.filter((response: any) => response.type === "FOLLOW_UP").map(
                        (response: any) => (
                            <div key={response._id} className="follow-up-response">
                                <div className="follow-up-header">
                                    <span>{users.find(u => u._id === response.user)?.firstName || "Unknown"} {users.find(u => u._id === response.user)?.lastName || "User"}</span>
                                    <span className="follow-up-date">
                                        {new Date(response.dateTime).toLocaleString()}
                                    </span>
                                </div>
                                <div className="follow-up-content">
                                    {response.content}
                                </div>
                            </div>
                        )
                    )}
                    <button className="btn btn-sm"
                            onClick={() => setFollowUpEditing(!followUpEditing)}>
                        Add to this conversation
                    </button>
                    {followUpEditing && (
                        <PostEditor post={null} type={"FOLLOW_UP"} parentPost={post}
                                    onPostSubmit={() => {
                                        fetchPost();
                                        setFollowUpEditing(false);
                                    }}/>
                    )}
                </div>
            </div>
        </div>
    );
}