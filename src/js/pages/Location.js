import {useEffect, useState} from "react";
import {RevModal, EditModal} from "../components/Modal";
import {useParams} from "react-router-dom";
import axios from "axios";


import person from "../../media/icons/person.svg";
import star from "../../media/icons/double_star.svg";
import share from "../../media/icons/share.svg";
import camera from "../../media/icons/camera.svg";
import wrong from "../../media/icons/close.svg";
import check from "../../media/icons/check.svg";

export function Random(props) {
    if (!(props.rand && props.spots)) return;

    const rand = props.rand;

    return (
        <div>
            <Location spots={props.spots} admin={props.admin} setAdmin={props.makeAdmin} id={rand.spot_id} building={rand.building}
                      maxGroup={rand.max_group_size} capacity={rand.max_capacity}
                      location={rand.location} loudness={rand.loudness_rating}
                      outlets={rand.outlets_rating} naturalLight={rand.natural_light_rating}
                      comfortability={[rand.table_seat_comfort, rand.nontable_seat_comfort, rand.couch_comfort]}
                      hasPrinter={rand.printer} hasTables={rand.tables} overall={rand.overall_rating}
                      description={rand.description} floor={rand.floor} notes={rand.notes} apiPath={props.apiPath}/>
        </div>
    );
}

export function LocationHeader(props) {
    return (
        <div id={"location-header"}>
            <img src={props.image} alt="" className={"location-img"}/>
            <div className={"location-header-info"}>
                <h2>{props.building}</h2>
                <h3>{props.location}</h3>
                <p className={"rating"}>★★★★☆</p>
            </div>
            <button className={"btn see-all-btn"}>
                See All Photos
            </button>
        </div>
    );
}

function LocationButtons(props) {
    const [showRev, setShowRev] = useState(false);

    function handleRev() {(props.user.isSignedIn) ? setShowRev(() => !showRev) : props.handler.handleShowAuthenticate();}
    function closeRev() {setShowRev(false);}

    return (
        <div className={"location-buttons"}>
            <button className={"btn d-flex-row-c"} id={"write-review-btn"} onClick={handleRev}>
                <img src={star} alt="" className={"icon white-icon sm-icon"}/>
                Write a Review
            </button>
            <button className={"btn d-flex-row-c"}>
                <img src={share} alt="" className={"icon invert-icon xs-icon"}/>
                Share
            </button>
            <button className={"btn d-flex-row-c"}>
                <img src={camera} alt="" className={"icon invert-icon sm-icon"}/>
                Add a Photo
            </button>

            {props.user.isAdmin && <button className={"btn d-flex-row-c"} onClick={() => props.handleEditAuth("building")}>Edit Building</button>}
            {props.user.isAdmin && <button className={"btn d-flex-row-c"} onClick={() => props.handleEditAuth("location")}>Edit Location</button>}
            <RevModal {...props} show={showRev} close={closeRev}
                      className={(showRev) ? "item-clicked" : 0}/>
        </div>
    );
}

function LocationMain(props) {
    return (
        <div id={"location-main"}>
            <LocationButtons {...props}/>
            <div className={"location-info"}>
                <div className={"line thin full-length"}/>
                <h4>Space Statistics</h4>
                <div className={"stat-line d-flex jc-sb full-length"}>
                    <h3>Maximum Group</h3>
                    <div className={"d-flex"}>
                        <img src={person} alt="" className={"icon sm-icon"}/>
                        <p>{props.max_group_size}</p>
                    </div>
                </div>
                <div className={"stat-line d-flex jc-sb full-length"}>
                    <h3>Maximum Capacity</h3>
                    <div className={"d-flex"}>
                        <img src={person} alt="" className={"icon sm-icon"}/>
                        <p>{props.max_capacity}</p>
                    </div>
                </div>
                <div className={"stat-line"}><h3>Loudness</h3><div id="loudness-bar" className="stat-bar"></div></div>
                <div className={"stat-line"}><h3>Comfortability</h3><div id="comfort-bar" className="stat-bar"></div></div>
                <div className={"stat-line"}><h3>Natural Light</h3><div id="natlight-bar" className="stat-bar"></div></div>
                <div className={"stat-line"}><h3>Outlet Availability</h3><div id="outlet-bar" className="stat-bar"></div></div>

                <br/><div className={"thin full-length line"}/>
                <h4>About</h4>
                <p className={"fw-300"}>{props.description}</p><br/>
                <div className={"d-flex jc-sb full-length"}>
                    <button className={"btn d-flex-row-c"}>Read More</button>
                    {props.user.isAdmin && <button className={"btn d-flex-row-c"} onClick={() => props.handleEditAuth("description")}>Edit</button>}
                </div>

                <br/><div className={"thin full-length line"}/>
                <h4>More Spaces Like This</h4>

                <br/><div className={"thin full-length line"}/>
                <h4>Amenities</h4>
                <div className={"d-flex"}>
                    {(props.printer) ? <img src={check} alt="" className={"icon sm-icon"}/> : <img src={wrong} alt="" className={"icon sm-icon"}/>}
                    <p>Printer</p>
                </div>
                <div className={"d-flex"}>
                    {(props.tables) ? <img src={check} alt="" className={"icon sm-icon"}/> : <img src={wrong} alt="" className={"icon sm-icon"}/>}
                    <p>Tables</p>
                </div>
            </div>

            <EditModal {...props} show={props.showEdit} close={props.closeEdit}
                       query={props.query}
                       editSubmitted={props.editSubmitted} editSubmit={props.editSubmit}/>
        </div>
    );
}

function LocationAside() {
    return (
        <div id={"location-aside"}>
            <h1>Aside</h1>
        </div>
    );
}

export default function Location(props) {
    const [spotData, setSpotData] = useState([]);
    const [image, setImage] = useState("");

    const root = document.querySelector(":root");
    const params = useParams()

    const [showEdit, setShowEdit] = useState(false);
    const [editSubmitted, setEditSubmitted] = useState(false);
    const [query, setQuery] = useState("");


    function handleShowEdit(queryType) {
        setQuery(queryType)
        setShowEdit(() => !showEdit);
        setEditSubmitted(false);
    }

    function handleEditAuth(query) {
        if (props.user.isAdmin)
            handleShowEdit(query);
        else
            props.handler.handleShowAuthenticate();
    }

    function closeEdit() {setShowEdit(false)}
    function editSubmit() {setEditSubmitted(true)}

    function calcComf(comfRatings) {
        let avg = 0, count = 0;
        for (const rating of comfRatings) {
            if (rating < 1) continue;
            avg += rating;
            count++;
        }
        return avg/count;
    }

    useEffect(() => {
        axios.post(props.apiPath + "/api/post/location", {
            "spot_id": params.spot_id
        }).then(data => {
            setSpotData(data.data[0]);
        });
    }, [params.spot_id, props.apiPath]);

    useEffect(() => {
        root.style.setProperty('--loudness-width', spotData.loudness_rating/5 * 100 + "%");
        root.style.setProperty('--comfort-width', calcComf([spotData.couch_comfort, spotData.table_seat_comfort, spotData.nontable_seat_comfort])/5 * 100 + "%");
        root.style.setProperty('--natlight-width', spotData.natural_light_rating/5 * 100 + "%");
        root.style.setProperty('--outlet-width', spotData.outlets_rating/5 * 100 + "%");
        setImage("../media/locationsHD/" + spotData.spot_id + "-00.webp");
    }, [root.style, spotData]);

    useEffect(() => window.scrollTo(0, 0), []);

    return (
        <section id={"location-container"}>
            <LocationHeader {...spotData} {...props} image={image} closeEdit={closeEdit} editSubmit={editSubmit} showEdit={showEdit}
                            handleShowEdit={handleShowEdit} query={query} editSubmitted={editSubmitted} handleEditAuth={handleEditAuth}/>
            <div className={"d-flex-row-l"}>
                <LocationMain {...spotData} {...props} closeEdit={closeEdit} editSubmit={editSubmit} showEdit={showEdit}
                              handleShowEdit={handleShowEdit} query={query} editSubmitted={editSubmitted} handleEditAuth={handleEditAuth}/>
                <LocationAside {...spotData} {...props} closeEdit={closeEdit} editSubmit={editSubmit} showEdit={showEdit}
                               handleShowEdit={handleShowEdit} query={query} editSubmitted={editSubmitted} handleEditAuth={handleEditAuth}/>
            </div>
        </section>
    );
}
