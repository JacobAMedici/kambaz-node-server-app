import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    posts: []
};

const postsSlice = createSlice({
    name: "posts",
    initialState,
    reducers: {
        setClassPosts: (state, action) => {
            // console.log("setClassPosts called with payload:", action.payload);
            state.posts = action.payload;
        },

        // These methods were inspired by ChatGPT and previous code from the course
        addPost: (state, {payload: post}) => {
            state.posts = [...state.posts, post] as any;
        },

        updatePost: (state, { payload: post }) => {
            state.posts = state.posts.map((p: any) =>
                p._id === post._id ? post : p
            ) as any;
        },

        deleteClassPost: (state, { payload: postId }) => {
            state.posts = state.posts.filter(
                (p: any) => p._id !== postId);
        },
    },
});
export const {setClassPosts, addPost, updatePost, deleteClassPost} = postsSlice.actions;

export default postsSlice.reducer;