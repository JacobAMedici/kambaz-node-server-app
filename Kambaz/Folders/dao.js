import model from './model.js';

export async function deleteFolder(folderId) {
    return model.deleteOne({ _id: folderId });
}

export async function updateFolder(folderId, folderData) {
    return model.updateOne({ _id: folderId }, folderData);
}

export async function createFolder(folderData) {
    return model.create(folderData);
}

export async function getFoldersByCourseId(courseId) {
    return model.find({ cid: courseId });
}
