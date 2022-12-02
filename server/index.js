const express = require('express');
const db = require('./config/db');
const cors = require('cors');
const axios = require('axios');

const app = express();
const  PORT = 5001;
app.use(cors());
app.use(express.json());

/* GET API ENDPOINTS */

app.get("/api/get", (req, res) => {
    db.query("SELECT * \
                FROM study_spots \
                ORDER BY building", (err, result) => {
        if (err) console.log(err);
        res.send(result);
    });
});

app.get("/api/get/majors", (req, res) => {
    db.query("SELECT major \
                FROM majors \
                ORDER BY major;", (err, result) => {
        if (err) console.log(err);
        res.send(result);
    });
});

app.get("/api/get/usernames", (req, res) => {
    db.query("SELECT username \
                FROM users;", (err, result) => {
        if (err) console.log(err);
        res.send(result);
    });
});

app.get("/api/get/emails", (req, res) => {
    db.query("SELECT email \
                FROM users;", (err, result) => {
        if (err) console.log(err);
        res.send(result);
    });
});

app.get("/api/get/location", (req, res) => {
    db.query(`SELECT * \
                FROM study_spots \
                WHERE spot_id = ?`, [req.query.spot_id], (err, result) => {
        if (err) console.log(err);
        res.send(result);
    });
});

app.get("/api/get/buildingInfo", (req, res) => {
    db.query(`SELECT * \
                FROM buildings \
                WHERE building = ?`, [req.query.building], (err, result) => {
        if (err) console.log(err);
        res.send(result);
    })
});


/* PUT API ENDPOINTS */

app.put("/api/put/edit", (req, res) => {
    db.query(`UPDATE study_spots \
                SET ${req.body.query} = ? \
                WHERE spot_id = ?`, [req.body.description, req.body.id], (err, result) => {
        if (err) console.log(err);
        res.send(result);
    });
});

app.put("/api/put/signin", (req, res) => {
    db.query(`SELECT first_name, last_name, username, admin \
                FROM users \
                WHERE username=\"${req.body.user}\" and password=\"${req.body.password}\"`, (err, result) => {
        if (err) console.log(err);

        let user = {isSignedIn: false, isAdmin: false, firstName: "", lastName: "", username: ""};
        if (result.length) {
            db.query(`UPDATE users SET last_login=now(), latitude=${req.body.latitude}, longitude=${req.body.longitude} WHERE username=\"${req.body.user}\"`);
            user.isSignedIn = true;
            user.isAdmin = (result[0].admin) ? true : false;
            user.firstName = result[0].first_name;
            user.lastName = result[0].last_name;
            user.username = result[0].username;
        }

        res.send(user);

    });
});

/* POST API ENDPOINTS */

app.post("/api/post/review", (req, res) => {
    db.query(`INSERT INTO reviews (time, date, content, name, rating, space_id) \
                VALUES (now(), curdate(), \"${req.body.description}\", \"${req.body.name}\", ${req.body.rating}, ${req.body.spot_id})`, (err, result) => {
        if (err) console.log(err);
        res.send(result);
    });
});

app.post("/api/post/search", (req, res) => {
    let building = (req.body.building) ? `building="${req.body.building}"` : `building!=""`;
    let seatComfort = (req.body.seatComfort) ? `` : ``;
    let outlets = (req.body.outlets) ? `outlets_rating=${req.body.outlets}` : `outlets_rating>=1`;
    let loudness = (req.body.loudness) ? `loudness_rating=${req.body.loudness}` : `loudness_rating>=1`;
    let naturalLight = (req.body.naturalLight) ? `natural_light_rating=${req.body.naturalLight}` : `natural_light_rating>=1`;
    let capacity = (req.body.capacity) ? `max_capacity>=${req.body.capacity}` : `max_capacity>=1`;
    let group = (req.body.group) ? `max_group_size>=${req.body.group}` : `max_group_size>=1`;

    db.query(`SELECT * \
                FROM study_spots \
                WHERE ${building} AND ${outlets} AND ${loudness} AND ${naturalLight} AND ${group} AND ${capacity}`, (err, result) => {
        if (err) console.log(err);
        res.send(result);
    });
});


app.post("/api/post/signup", (req, res) => {
	db.query(`INSERT INTO users (first_name, last_name, email, major, latitude, longitude, last_login, created, username, password, admin) \
                VALUES (\"${req.body.first_name}\", \"${req.body.last_name}\", \"${req.body.email}\", \"${req.body.major}\", ${req.body.latitude}, ${req.body.longitude}, now(), now(), \"${req.body.username}\", \"${req.body.password}\", 0)`, (err, result) => {
        if (err) console.log(err);
        res.send(result);
    });
});

app.get("/api/get/groupRec", (req, res) => {
    const key = "AIzaSyAT1Fh-IXMLOqzp6tWekPy-0FpplWtITaY" // API Key
    const units = "imperial"
    const mode = "walking"
    const maps_url = "https://maps.googleapis.com/maps/api/distancematrix/json?"

    let group = `max_group_size >= ${req.query.groupSize}`;
    let loudness = `loudness_rating > 1`;
    locs = req.query.locations
    console.log(group);
    console.log(locs)

    db.query(`SELECT * \
                FROM study_spots \
                WHERE ${group} and ${loudness}`, (err, result) => {
        if (err) console.log(err);
        console.log(result)
        result = result.map(place => place, Object.assign(place, get_distance(place["building"], place["spot_id"], locs)))
        res.send(result)
    });

    function get_distance(building, spot_id, locs) {
        distObj = {}
        let longestDist = 0
        for (let i = 0; i < locs.length; i++) {

            let url = `${maps_url}origins=${locs[i]}&destinations=${building}&units=${units}&mode=${mode}&key=${key}`
            dist = axios.get(url).data["rows"][0]["elements"][0]["duration"]["text"].split()[0];

            longestDist = max(longestDist, dist)
            distObj[`dist${i}`] = dist
            if (i === (locs.length - 1))
                distObj["longestDist"] = longestDist
        }

        return distObj;
    }

    axios.get("https://maps.googleapis.com/maps/api/distancematrix/json?origins=Knott Hall&destinations=Fitzpatrick Hall of Engineering&units=imperial&mode=walking&key=AIzaSyBYmmmLt6AxjNqDP4DW-uGZ8UHTPGqkgRE").then(response => {
        res.send(response.data["rows"][0]["elements"][0]["duration"]["text"].split()[0])
    });
});

/* LISTENER */

app.listen(PORT, ()=>{
    console.log("Server is running on port " + PORT)
})
