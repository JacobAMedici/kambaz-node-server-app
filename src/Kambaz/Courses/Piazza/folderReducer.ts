import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    folders: [],
    selectedFolders: [],
};

const folderSlice = createSlice({
    name: "folders",
    initialState,
    reducers: {
        setFolders: (state, action) => {
            state.folders = action.payload;
        },

        addFolder: (state, {payload: folder}) => {
            state.folders = [...state.folders, folder] as any;
        },

        updateFolder: (state, {payload: folder}) => {
            state.folders = state.folders.map((f: any) =>
                f._id === folder._id ? folder : f
            ) as any;
        },

        deleteFolder: (state, {payload: folderId}) => {
            state.folders = state.folders.filter(
                (f: any) => f._id !== folderId);
        },

        editFolder: (state, { payload: folderId }) => {
            state.folders = state.folders.map((f: any) =>
                f._id === folderId ? { ...f, editing: true } : f
            ) as any;
        },

        setSelectedFolders: (state, action) => {
            state.selectedFolders = action.payload;
        },
    },
});
export const {setFolders, addFolder, updateFolder, deleteFolder, editFolder, setSelectedFolders} = folderSlice.actions;

export default folderSlice.reducer;