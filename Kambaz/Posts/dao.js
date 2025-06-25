import model from './model.js';
import { v4 as uuidv4 } from 'uuid';

// Note, for all of these, check if you need async await
export function deletePost(postId) {
    console.log(`Deleting post with ID: ${postId}`);
    return model.deleteOne({ _id: postId })
}

export function updatePost(postId, postData) {
    return model.updateOne({ _id: postId }, { $set: postData });
}

export async function createPost(postData, courseId) {
    const newPost = {
        ...postData,
        _id: uuidv4(),
    };
    console.log(newPost)
    return model.create(newPost);
}

export async function getPostsByPostId(pid) {
    return model.findOne({ _id: pid });
}

export async function getPostsByFolderId(folder, cid) {
    // This was given to me by ChatGPT
    return model.find({
        folders: { $in: folder }
    });
}

export async function getPostsByContent(content, cid) {
    console.log(content)
    // Got this from the Users/dao used in class
    const regex = new RegExp(content, "i");
    return model.find({
        courseId: cid,
        $or: [
            { summary: { $regex: regex } },
            { content: { $regex: regex } }
        ]
    });
}


export async function getPostsByCourseId(courseId) {
    return model.find({ courseId: courseId });
}

export async function getPosts() {
    return model.find();
}