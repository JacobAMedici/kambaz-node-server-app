import '../../styles.css';
import { FaFolder } from 'react-icons/fa';
import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";
import * as postClient from "./client.ts";
import {useParams} from "react-router";
import {setFolders, setSelectedFolders} from "./folderReducer.ts";

export default function FolderFilter() {
    const {folders, selectedFolders} = useSelector((state: any) => state.folderReducer);
    const {cid} = useParams();
    const dispatch = useDispatch();

    const getClassFolders = async () => {
        const folders = await postClient.getFolders(cid)
        dispatch(setFolders(folders));
    }

    const toggleSelectedFolder = (folderId: string) => {
        let updated;
        if (selectedFolders.includes(folderId)) {
            updated = selectedFolders.filter((id: any) => id !== folderId);
        } else {
            updated = [...selectedFolders, folderId];
        }
        dispatch(setSelectedFolders(updated));
    };

    useEffect(() => {
        getClassFolders();
    }, []);

    return (
        <div id="wd-piazza-folder-filter">
            <div className="wd-flex-row-container wd-bg-color-gray wd-icon-align wd-gap wd-padding">
                <FaFolder className="wd-width-45px"/>
                {folders.map((folder: any) => (
                    <div
                        className={`me-3 ${selectedFolders.includes(folder._id) ? 'fw-bold text-decoration-underline' : ''}`}
                        onClick={() => toggleSelectedFolder(folder._id)}
                    >
                        {folder.name}
                    </div>
                ))}
            </div>
        </div>
    );
}