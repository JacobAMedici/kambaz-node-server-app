import {NavLink, useNavigate} from "react-router-dom";
import {useParams} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import * as piazzaClient from "./client.ts";
import {addFolder, deleteFolder, editFolder, setFolders, updateFolder} from "./folderReducer.ts";
import {Button, Form} from "react-bootstrap";
import {useEffect, useState} from "react";
import {v4 as uuidv4} from "uuid";
import {FaPencil} from "react-icons/fa6";
import {FaTrash} from "react-icons/fa";

export default function ManageClass() {
    const {cid, setting} = useParams();
    const {folders} = useSelector((state: any) => state.folderReducer);
    const dispatch = useDispatch();
    const [folderName, setFolderName] = useState('');
    // This was recommended to me by ChatGPT
    const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
    const {currentUser} = useSelector((state: any) => state.accountReducer);
    const navigate = useNavigate();

    // I go the structure for this from ChatGPT
    const navItems = [
        {label: "General Settings", path: "General"},
        {label: "Customize Q&A", path: "CustomizeQA"},
        {label: "Manage Folders", path: "Folders"},
        {label: "Manage Enrollment", path: "Enrollment"},
        {label: "Create Groups", path: "Groups"},
        {label: "Customize Course Page", path: "CustomizePage"},
        {label: "Piazza Network Settings", path: "NetworkSettings"},
    ];

    const toDisplay = () => {
        // I got this line of code from GitHub Copilot because I wasn't sure how to
        // make it so I get the label and not the setting
        if (navItems.some(item => item.path === setting) && setting != "Folders") {
            return navItems.find(item => item.path === setting)?.label;
        }
        return null;
    }

    const addFolderAsync = async (content: string) => {
        const folder = {
            _id: uuidv4(),
            name: content,
            cid: cid,
        }
        await piazzaClient.addFolder(folder);
        dispatch(addFolder(folder))
    }

    const getFoldersAsync = async () => {
        const folders = await piazzaClient.getFolders(cid);
        dispatch(setFolders(folders));
    }

    const updateFolderHandler = async (folder: any) => {
        await piazzaClient.updateFolder(folder);
        dispatch(updateFolder(folder));
    }

    // const deleteFolderAsync = async (folderId: string) => {
    //     await piazzaClient.deleteFolder(folderId);
    //     dispatch(deleteFolder(folderId));
    // }

    useEffect(() => {
        if (currentUser?.role !== "FACULTY") {
            navigate(`/Kambaz/Courses/${cid}/Piazza`);
        }
        getFoldersAsync();
    }, [cid]);

    return (
        <div id="wd-piazza-manage_class">
            {/* Navbar*/}
            <div className="settings-tab-bar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={`/Kambaz/Courses/${cid}/Piazza/Manage/${item.path}`}
                        className={({isActive}) =>
                            isActive ? "settings-tab active" : "settings-tab"
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </div>

            {/* Content */}
            {toDisplay() ? (
                <div className="settings-content">
                    <h2>{toDisplay()} Not Implemented</h2>
                </div>
            ) : (
                <div>
                    <h3>Configure Class Folders</h3>
                    <p>Folders allow you to keep class content organized. When students and
                        instructors add a new post, they will be required to specify at least one
                        folder for their post.</p>
                    <h4>Create New Folders</h4>
                    <p>Add folders that are relevant for your class.</p>
                    <Form className="d-flex align-items-center gap-2">
                        <Form.Control
                            type="text"
                            placeholder="Folder Name"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            style={{maxWidth: '400px'}}
                        />
                        <Button
                            variant="primary"
                            onClick={() => {addFolderAsync(folderName)
                                getFoldersAsync()}}
                        >
                            Add folder
                        </Button>
                    </Form>
                    <h4>Manage Folders</h4>
                    <p>Reorder, delete, edit folder names, or create subfolders.</p>
                    {folders?.map((folder: any) => (
                        <div className="wd-grid-row">
                            <div
                                className="wd-grid-col-selection-box-title d-flex align-items-center gap-2">
                                {/*I got this button from ChatGPT because I wasn't sure what the
                                best way to manage check status was*/}
                                <Form.Check
                                    type="checkbox"
                                    className="wd-checkbox"
                                    id={`folder-${folder._id}`}
                                    label=""
                                    checked={selectedFolders.has(folder._id)}
                                    onChange={(e) => {
                                        const newSet = new Set(selectedFolders);
                                        if (e.target.checked) {
                                            newSet.add(folder._id);
                                        } else {
                                            newSet.delete(folder._id);
                                        }
                                        setSelectedFolders(newSet);
                                    }}
                                />
                                {!folder.editing && <div className={"folder-badge"}>
                                    {folder.name}
                                </div>}
                                {folder.editing &&
                                    <div className={"folder-badge"}>
                                        <input onChange={(e) =>
                                            updateFolderHandler({...folder, name: e.target.value})}
                                               onKeyDown={(e) => {
                                                   if (e.key === "Enter") {
                                                       updateFolderHandler({
                                                           ...folder,
                                                           editing: false
                                                       });
                                                   }
                                               }}
                                               value={folder.name}/>
                                    </div>}
                            </div>
                            <div className="wd-grid-col-edit">
                                <Button variant="secondary" onClick={() => {dispatch(editFolder(folder._id))}}>
                                    <FaPencil className="me-2 wd-icon"/>
                                    Edit
                                </Button>
                            </div>
                        </div>
                    ))}
                    <div className="wd-grid-row">
                        <div className="wd-grid-col-selection-box-title">
                            <div>
                            </div>
                        </div>
                        <div className="wd-grid-col-edit">
                            {/*I got this button from ChatGPT*/}
                            <Button
                                variant="secondary"
                                onClick={async () => {
                                    const promises = Array.from(selectedFolders).map((folderId) =>
                                        piazzaClient.deleteFolder(folderId).then(() => dispatch(deleteFolder(folderId)))
                                    );
                                    await Promise.all(promises);
                                    setSelectedFolders(new Set()); // clear selection
                                    getFoldersAsync()
                                }}
                            >
                                <FaTrash className="me-2 wd-icon"/>
                                Delete All Selected
                            </Button>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}