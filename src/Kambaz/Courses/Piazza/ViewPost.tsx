import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {deletePost, getFolders, getPostsByPostId, updatePost} from "./client.ts";
import {useDispatch, useSelector} from "react-redux";
import {MdOutlineNotes} from "react-icons/md";
import {BsFillQuestionSquareFill} from "react-icons/bs";
import {deleteClassPost} from "./postReducer.ts";

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


export default function ViewPost() {
    const {pid, cid} = useParams();
    const [post, setPost] = useState<Post | null>(null);
    const [folderNames, setFolderNames] = useState<string[]>([]);
    const navigate = useNavigate();
    const {currentUser} = useSelector((state: any) => state.accountReducer);
    const dispatch = useDispatch();

    const deletePostAsync = async () => {
        if (!post) return;
        await deletePost(post._id);
        dispatch(deleteClassPost(post._id));
        navigate(`/Kambaz/Courses/${cid}/Piazza`);
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
        }
    };

    useEffect(() => {
        fetchPost();
    }, [pid, cid, navigate]);

    // I was having issues with crashing before loading, and asked ChatGPT, which told me to use this
    if (post === null) return <div>Loading...</div>;

    return (
        <div id="wd-piazza-view-post" className="wd-piazza-view-post">
            <div className="piazza-post-header">
                <div className="piazza-post-info">
                    {post.type === "QUESTION" ? (
                        <BsFillQuestionSquareFill
                            className={post.responses.length === 0 ? "text-danger" : ""}/>
                    ) : (
                        <MdOutlineNotes/>
                    )}
                    {post.type === "QUESTION" ? "question" : "note"} @{post._id.substring(0, 8)}
                </div>
                <div className="piazza-views">{post.readBy.length} views</div>
            </div>

            <div id="wd-piazza-view-post-body">
                <div className="d-flex justify-content-between align-items-center">
                    <h1>{post.summary}</h1>
                    {/* This dropdown menu came from ChatGPT*/}
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
                                <button className="dropdown-item">Edit
                                </button>
                            </li>
                            <li>
                                <button className="dropdown-item text-danger"
                                onClick={() => deletePostAsync()}>Delete
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="wd-piazza-view-post-content"
                     dangerouslySetInnerHTML={{__html: post.content}}/>
                {folderNames.map((name, index) => (
                    <span key={index} className="folder-badge me-2">
                    {name}
                </span>
                ))}
                <br/>
                <br/>
                <button className="btn btn-primary"
                        onClick={() => navigate(`/Kambaz/Courses/${cid}/Piazza/QA/Post/${pid}/Edit`)}>
                    Edit
                </button>
            </div>
            <div id="wd-piazza-view-post-student-answer">
            </div>
            <div id="wd-piazza-view-post-instructor-answer">
            </div>
            <div id="wd-piazza-view-post-follow-up">
            </div>
        </div>
    );
}
