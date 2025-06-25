import {useEffect, useState} from "react";
import {useParams} from "react-router";
import {findUsersForCourse} from "../client.ts";
import {useDispatch, useSelector} from "react-redux";
import * as piazzaClient from "./client.ts";
import {setFolders} from "./folderReducer.ts";
import {Button} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {addPost} from "./postReducer.ts";
import {v4 as uuidv4} from "uuid";

export default function PostEditor() {
    const {cid} = useParams();
    const [students, setStudents] = useState<any[]>([]);
    const [postType, setPostType] = useState("QUESTION");
    const [postToAll, setPostToAll] = useState(true);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
    const [summary, setSummary] = useState("");
    const [details, setDetails] = useState("");
    // I wasn't sure how to do the Modal message eso I asked ChatGPT:
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const {folders} = useSelector((state: any) => state.folderReducer);
    const currentUser = useSelector((state: any) => state.accountReducer.currentUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleQuestionTypeChange = (event: any) => {
        setPostType(event.target.value);
    };

    const handlePostToChange = (event: any) => {
        if (event.target.value === "all") {
            setPostToAll(true);
            setSelectedStudents([]);
        } else {
            setPostToAll(false);
        }
    };

    // I got this function from ChatGPT
    const toggleStudent = (id: string) => {
        setSelectedStudents(prev =>
            prev.includes(id)
                ? prev.filter(sid => sid !== id)
                : [...prev, id]
        );
        loadStudents();
    };

    const toggleFolder = (id: string) => {
        setSelectedFolders(prev =>
            prev.includes(id)
                ? prev.filter(sid => sid !== id)
                : [...prev, id]
        );
    };

    const loadStudents = async () => {
        const data = await findUsersForCourse(cid as string);
        // I was getting null issues, so I got this protection from ChatGPT
        setStudents(data);
    };


    const getFoldersAsync = async () => {
        const folders = await piazzaClient.getFolders(cid);
        dispatch(setFolders(folders));
    }

    const createPost = async () => {
        const missing = [];
        if (selectedFolders.length === 0) missing.push("Folders");
        if (!summary.trim()) missing.push("Summary");
        if (!details.trim()) missing.push("Details");

        if (missing.length > 0) {
            // I wasn't sure how to concatenate it, so I asked ChatGPT
            setModalMessage(`Please complete the following required fields:\n ${missing.join(", ")}`);
            setShowModal(true);
            return;
        }

        const post = {
            _id: uuidv4(),
            type: postType,
            summary: summary,
            user: currentUser._id,
            userRole: currentUser.role,
            content: details,
            courseId: cid,
            folders: selectedFolders,
            postTo: postToAll ? [] : [...selectedStudents, currentUser._id],
            dateTime: new Date().toISOString(),
            responses: [],
            readBy: []
        };

        const newPost = await piazzaClient.createPost(post);
        dispatch(addPost(newPost));
        navigate(`/Kambaz/Courses/${cid}/Piazza/QA`);
    };

    useEffect(() => {
        loadStudents();
        getFoldersAsync();
    }, [cid]);


    return (
        <div id="wd-piazza-post-editor">
            {/*I got this from ChatGPT*/}
            {showModal && (
                <div className="modal show d-block">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Missing Fields</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>{modalMessage}</p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="wd-piazza-editor-content">
                <div
                    id="wd-piazza-editor-post-type"
                    className="wd-flex-row-container wd-icon-align wd-gap wd-padding"
                >
                    <div className="wd-grid-col-edit-right text-end me-3">
                        Post Type*
                    </div>
                    <div className="wd-grid-col-editor-right">
                        <div className="radio-group d-flex gap-4">
                            <div className="radio-option">
                                <label htmlFor="wd-radio-question"
                                       className="d-flex align-items-center">
                                    {/* I got this part of the input from ChatGPT*/}
                                    <input
                                        type="radio"
                                        name="radio-post-type"
                                        id="wd-radio-question"
                                        value="QUESTION"
                                        checked={postType === "QUESTION"}
                                        onChange={handleQuestionTypeChange}
                                        className="me-2"
                                    />
                                    Question
                                </label>
                                <small className="ms-4">if you need an answer</small>
                            </div>

                            <div className="radio-option">
                                <label htmlFor="wd-radio-note"
                                       className="d-flex align-items-center">
                                    <input
                                        type="radio"
                                        name="radio-post-type"
                                        id="wd-radio-note"
                                        value="NOTE"
                                        checked={postType === "NOTE"}
                                        onChange={handleQuestionTypeChange}
                                        className="me-2"
                                    />
                                    Note
                                </label>
                                <small className="ms-4">if you don’t need an answer</small>
                            </div>
                        </div>
                    </div>
                </div>


                <div
                    id="wd-piazza-editor-post-type"
                    className="wd-flex-row-container wd-icon-align wd-gap wd-padding"
                >
                    <div className="wd-grid-col-edit-right text-end me-3">
                        Post To*
                    </div>
                    <div className="wd-grid-col-editor-right">
                        <div className="radio-group d-flex gap-4">
                            <div className="radio-option">
                                <label htmlFor="wd-radio-question"
                                       className="d-flex align-items-center">
                                    <input
                                        type="radio"
                                        name="radio-post-to"
                                        id="wd-radio-post-to-all"
                                        value="all"
                                        checked={postToAll}
                                        onChange={handlePostToChange}
                                        className="me-2"
                                    />
                                    Entire Class
                                </label>
                            </div>
                            <div className="radio-option">
                                <label htmlFor="wd-radio-note"
                                       className="d-flex align-items-center">
                                    <input
                                        type="radio"
                                        name="radio-post-to"
                                        id="wd-radio-selected-individuals"
                                        value="selected"
                                        checked={!postToAll}
                                        onChange={handlePostToChange}
                                        className="me-2"
                                    />
                                    Individual Student(s)/Instructor(s)
                                </label>
                                {!postToAll && students.filter((s: any) => s !== null && s !== undefined).map((student: any) => (
                                    <div key={student._id}
                                         className="d-flex align-items-center mb-1">
                                        <input
                                            type="checkbox"
                                            className="me-2"
                                            checked={selectedStudents.includes(student._id)}
                                            onChange={() => toggleStudent(student._id)}
                                        />
                                        {student.firstName} {student.lastName}
                                    </div>
                                ))}

                            </div>
                        </div>
                    </div>
                </div>


                <div
                    id="wd-piazza-editor-post-type"
                    className="wd-flex-row-container wd-icon-align wd-gap wd-padding"
                >
                    <div className="wd-grid-col-edit-right text-end me-3">
                        Select Folder(s)*
                    </div>
                    <div className="wd-grid-col-editor-right">
                        {folders?.map((folder: any) => (
                            <div key={folder._id} style={{display: "inline-block"}}>
                                {selectedFolders.includes(folder._id) ? (
                                    <div
                                        className="me-2 folder-badge-active"
                                        onClick={() => toggleFolder(folder._id)}
                                        style={{cursor: "pointer"}}
                                    >
                                        {folder.name}
                                    </div>
                                ) : (
                                    <div
                                        className="me-2 folder-badge"
                                        onClick={() => toggleFolder(folder._id)}
                                        style={{cursor: "pointer"}}
                                    >
                                        {folder.name}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                </div>


                <div
                    id="wd-piazza-editor-post-type"
                    className="wd-flex-row-container wd-icon-align wd-gap wd-padding"
                >
                    <div className="wd-grid-col-edit-right text-end me-3">
                        Summary*
                    </div>
                    <div className="wd-grid-col-editor-right">
                        <div className="form-group mb-3">
                            <input
                                type="text"
                                id="summary"
                                name="summary"
                                className="form-control"
                                placeholder="Enter a one line summary, 100 characters or less"
                                maxLength={100}
                                onChange={(e) => setSummary(e.target.value)}
                            />
                        </div>
                    </div>
                </div>


                <div
                    id="wd-piazza-editor-post-type"
                    className="wd-flex-row-container wd-icon-align wd-gap wd-padding"
                >
                    <div className="wd-grid-col-edit-right text-end me-3">
                        Details*
                    </div>
                    <div className="wd-grid-col-editor-right">
                        <div className="mb-3">
                        </div>

                    </div>
                </div>


                <div
                    id="wd-piazza-editor-post-type"
                    className="wd-flex-row-container wd-icon-align wd-gap wd-padding"
                >
                    <div className="wd-grid-col-edit-right text-end me-3">

                    </div>
                    <div className="wd-grid-col-editor-right">
                        <Button onClick={() => createPost()} className="me-2">
                            Submit
                            My {postType === "QUESTION" ? "Question" : "Note"} to {cid?.slice(0, 10)}
                        </Button>
                        <Button variant="secondary"
                                onClick={() => navigate(`/Kambaz/Courses/${cid}/Piazza/QA   `)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}