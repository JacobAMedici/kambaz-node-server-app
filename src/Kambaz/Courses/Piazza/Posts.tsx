import { useParams } from "react-router";
import ClassAtAGlance from "./ClassAtAGlance.tsx";
import PostEditor from "./PostEditor.tsx";
import ViewPost from "./ViewPost.tsx";

export default function Posts() {
    const { pid } = useParams();

    return (
        <div id="wd-piazza-posts">
            {pid ? (
                pid === "New" ? (
                    <PostEditor post={null}/>
                ) : (
                    <ViewPost/>
                )
            ) : (
                <div>
                    <ClassAtAGlance />
                </div>
            )}
        </div>
    );
}