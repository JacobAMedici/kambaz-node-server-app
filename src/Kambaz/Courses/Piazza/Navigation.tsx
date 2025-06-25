import {useSelector} from "react-redux";
import {BsPersonSquare} from 'react-icons/bs';
import {Link, NavLink} from "react-router-dom";
import {useLocation, useParams} from "react-router";
import '../../styles.css';


export default function Navigation() {
    const {currentUser} = useSelector((state: any) => state.accountReducer);
    const {cid} = useParams();
    const location = useLocation();
    const base = `/Kambaz/Courses/${cid}/Piazza`;

    return (
        <div
            className="wd-piazza-navbar"
        >
            <nav className="navbar navbar-expand-lg navbar-dark w-100 m-0 p-0">
                <Link to={base} className="navbar-brand text-white">Pazza</Link>

                <button
                    type="button"
                    className="navbar-toggler"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarCollapse1"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div
                    className="collapse navbar-collapse d-flex justify-content-between align-items-center"
                    id="navbarCollapse1">
                    <div className="navbar-nav d-flex gap-4 align-items-center">
                        <span className="text-white fw-light small">
                            {/* I asked ChatGPT how to make it so this only shows the first few chars*/}
                            {cid?.substring(0, 10)}
                        </span>

                        {["QA", "Resources", "Statistics"].map((item) => (
                            <NavLink
                                key={item}
                                to={`${base}/${item}`}
                                className="nav-item nav-link text-white"
                                // I originally had this so it set it to active, but changed my mind
                                // and had ChatGOT show me how to make it underline instaed
                                style={({isActive}) => ({
                                    textDecoration: isActive ? "underline" : "none"
                                })}
                            >
                                {item}
                            </NavLink>
                        ))}

                        {currentUser.role === "FACULTY" && (
                            <NavLink
                                to={`${base}/Manage/Folders`}
                                className="nav-item nav-link text-white"
                                style={() => ({
                                    textDecoration: location.pathname.startsWith(`${base}/Manage`) ? "underline" : "none"
                                })}
                            >
                                Manage Class
                            </NavLink>
                        )}
                    </div>

                    <div className="navbar-nav d-flex align-items-center">
                        <span
                            className="nav-item nav-link text-white d-flex align-items-center gap-1">
                            <BsPersonSquare
                                size={24}/> {currentUser.firstName} {currentUser.lastName}
                        </span>
                    </div>
                </div>
            </nav>
        </div>
    );
}
