import axios from "axios";

const axiosWithCredentials = axios.create({withCredentials: true});
export const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
export const PIAZZA_API = `${REMOTE_SERVER}/api/courses/piazza`;

export const getPosts = async () => {
    const response = await axiosWithCredentials.get(`${PIAZZA_API}/posts`);
    return response.data;
}

export const getPostsByCourseId = async (courseId: string) => {
    const response = await axiosWithCredentials.get(`${PIAZZA_API}/posts/${courseId}`);
    return response.data;
}

export const getPostsByContent = async (content: string, cid: string) => {
    // The use of params here was recommended by GitHub Copilot
    const response = await axiosWithCredentials.get(`${PIAZZA_API}/posts/search/${cid}`, {
        params: { content }
    });
    return response.data;
}

export const getPostsByFolderId = async (folder: string) => {
    const response = await axiosWithCredentials.get(`${PIAZZA_API}/posts/folder/${folder}`);
    return response.data;
}

export const getPostsByPostId = async (pid: string) => {
    const response = await axiosWithCredentials.get(`${PIAZZA_API}/posts/post/${pid}`);
    return response.data;
}

export const createPost = async (post: any) => {
    const response = await axiosWithCredentials.post(`${PIAZZA_API}/posts`, post);
    return response.data;
};

export const updatePost = async (post: any) => {
    const response = await axiosWithCredentials.put(`${PIAZZA_API}/posts/${post._id}`, post);
    return response.data;
}

export const deletePost = async (postId: string) => {
    console.log(`Deleting post with ID: ${postId}`);
    await axiosWithCredentials.delete(`${PIAZZA_API}/posts/${postId}`);
}

export const addFolder = async (folder: any) => {
    const response = await axiosWithCredentials.post(`${PIAZZA_API}/folders`, folder);
    return response.data;
};

export const getFolders = async (courseId: any) => {
    const response = await axiosWithCredentials.get(`${PIAZZA_API}/folders/${courseId}`);
    return response.data;
};

export const updateFolder = async (folder: any) => {
    const response = await axiosWithCredentials.put(`${PIAZZA_API}/folders/${folder._id}`, folder);
    return response.data;
};

export const deleteFolder = async (folderId: any) => {
    const response = await axiosWithCredentials.delete(`${PIAZZA_API}/folders/${folderId}`);
    return response.data;
};