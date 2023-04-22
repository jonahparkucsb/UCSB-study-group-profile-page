import React, { useState, useEffect, useParams } from 'react'
import { doc, setDoc, collection, getDocs, updateDoc, query, where, QuerySnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db, storage } from "../firebaseConfig.js"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import MyClassesList from '../components/departments/MyClassesList'

export default function ProfilePage(props) {
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [major, setMajor] = useState("");
    const [bio, setBio] = useState("");
    const [user, setUser] = useState(null);
    const [profilePictureURL, setProfilePictureURL] = useState("https://freesvg.org/img/abstract-user-flat-4.png");
    const [courses, setCourses] = useState([]);


    const shadowStyle = {
        boxShadow: "0px 0px 6px 0px rgba(0,0,0,0.2)"
    }

    // Getting user auth
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(
        getAuth(),
        (user) => {
          setUser(user);
        }
      )
      return unsubscribe;
    }, [])

    const [userData, setUserData] = useState([]);
    const auth = getAuth();
    let list = [];
    const [docID, setDocID] = useState("");


    // Query for getting user document by finding user ID within user document field
    useEffect(() => {
        if (user) {
            const getUsers = async () => {
                try {
                    const userCollectionRef = collection(db, "users");
                    const q = query(userCollectionRef, where("uid", "==", props.user.uid));
                    const querySnapshot = await getDocs(q);
                    // doc.data() is never undefined for query doc snapshots
                    querySnapshot.forEach((doc) => {
                        list.push(doc.data());
                        setDocID(doc.id);
                    });
                    setUserData(list);
                }
                catch (err) {
                    console.log(err);
                }
            }
            getUsers();
        }
        else {
            console.log("no auth");
        }
    }, [user]);

    // setting variables from collected user data from database
    useEffect(() => {
        if(userData[0]){
            setName(userData[0].name);
            setProfilePictureURL(userData[0].pfpURL);
            if(userData[0].bio == ""){
                setBio("Please set bio");
            }
            else{
                setBio(userData[0].bio);
            }
            if(userData[0].username == ""){
                setUsername("Please set username");
            }
            else{
                setUsername(userData[0].username);
            }
            if(userData[0].major == ""){
                setMajor("Please set major");
            }
            else{
                setMajor(userData[0].major);
            }
            setCourses(userData[0].schedule ? userData[0].schedule : []);
        }
    }, [userData]);

    const [newUsername, setNewUsername] = useState("");
    const [newBio, setNewBio] =useState("");
    const [newMajor, setNewMajor] = useState("");
    const [newPFP, setNewPFP] = useState("https://freesvg.org/img/abstract-user-flat-4.png");

    const handleChangeUsername = async() => {
        const updateUsernameRef = doc(db, "users", docID);
        await updateDoc(updateUsernameRef, {
            username: newUsername
        });
        setUsername(newUsername);
        return;
    };

    const handleChangeBio = async() => {
        const updateBioRef = doc(db, "users", docID);
        await updateDoc(updateBioRef, {
            bio: newBio
        });
        setBio(newBio);
        return;
    };

    const handleChangeMajor = async() => {
        const updateMajorRef = doc(db, "users", docID);
        await updateDoc(updateMajorRef, {
            major: newMajor
        });
        setMajor(newMajor);
        return;
    };
    const handleChangePFP = async() => {
        const updatePFPRef = doc(db, "users", docID);
        await updateDoc(updatePFPRef, {
            pfpURL: newPFP
        });
        console.log(newPFP)
        return;
    };
    const [editMode, setEditMode] = useState(false);
    const [editModeUsername, setEditModeUsername] = useState(false);
    const [editModeBio, setEditModeBio] = useState(false);
    const [editModeMajor, setEditModeMajor] = useState(false);

    const handleEditProfileClick = () => {
        setEditMode(true);
    }
    const handleDoneEditClick = (e) => {
        e.preventDefault();
        setEditMode(false);
    }


    const handleEditUsernameClick=()=>{
        setEditModeUsername(true);
    }
    const handleEditBioClick=()=>{
        setEditModeBio(true);
    }
    const handleEditMajorClick=()=>{
        setEditModeMajor(true);
    }

    // const handleProfileHelper=()=>{
    //     handleChangePFP();
    // }

    const handleDoneUsernameClick=(e)=>{
        e.preventDefault();
        handleChangeUsername();
        setEditModeUsername(false);
    }
    const handleDoneBioClick=(e)=>{
        e.preventDefault();
        handleChangeBio();
        setEditModeBio(false);
    }
    const handleDoneMajorClick=(e)=>{
        e.preventDefault();
        handleChangeMajor();
        setEditModeMajor(false);
    }

    const [imageUpload, setImageUpload] = useState(null);
    const [profilePicturePath, setProfilePicturePath] = useState("");
    const [uploaded, setUploaded] = useState(0);
    const [reupload, setReupload] = useState(false);

    // Uploads user image to Firebase Cloud Storage
    const uploadImage = () => {
        if (imageUpload == null) return;

        if (!reupload) setReupload(true);
        else setReupload(false);

        const imageRef = ref(storage, `images/${imageUpload.name}`);
        setProfilePicturePath(String(imageUpload.name));

        uploadBytes(imageRef, imageUpload).then(() =>{
            getDownloadURL(imageRef).then((url) => {
                setNewPFP(url);
                setProfilePictureURL(url);
            })
            .catch((error) =>{
                console.log(error.message, "error getting the image url");
            });
        })
        .catch((error) =>{
            console.log(error.message);
        });
        handleChangePFP();
        return;
    }


    useEffect(() => {
        const firstBtns = document.querySelectorAll('.first');
        const secondBtns = document.querySelectorAll('.second');

        if (!reupload) {
            firstBtns.forEach(link => link.style.display = 'inline');
            secondBtns.forEach(link => link.style.display = 'none');
        } else {
            firstBtns.forEach(link => link.style.display = 'none');
            secondBtns.forEach(link => link.style.display = 'inline');
        }
    })
    

    //     storage.ref(`images/${imageUpload.name+props.user.uid}`).put(imageUpload)
    //     .on("state_changed", alert("success"), alert,() => {
        
    //     storage.ref("/images").child(`${imageUpload.name+props.user.uid}`).getDownloadURL()
    //     .then((url) =>{
    //         setProfilePictureURL(url);
    //     });
    // });

    // Handler for removing a class from schedule
    const handleRemoveClass = (deletedClass) => {
        pushChangeScheduleRemove(deletedClass);
    }

    // Removes class from schedule
    const pushChangeScheduleRemove = async(deletedClass) => {
        const currentUserData = doc(db, "users", docID);
        console.log(currentUserData);
        setCourses(
            courses.filter(a => a.courseId !== deletedClass.courseId)
        );
        await updateDoc(currentUserData, {
            schedule: courses.filter(a => a.courseId !== deletedClass.courseId)
        });
        console.log('courses after Push:', courses);
        setCourses(
            courses.filter(a => a.courseId !== deletedClass.courseId)
        );
    }


    return (
        <div>
            <h1 className="pt-3 pb-2">My Profile</h1>
            <hr />
            <div class="row">
                <div class="col-md-3 mb-4" style={{ paddingLeft: "50px" }}>
                    <div class="card" style={{ margin: "auto", textAlignLast: "center" }}>
                        <div class="container mb-3 mt-4">
                            <img class="mx-auto mt-1 rounded-circle border border-secondary" src={profilePictureURL} width={200} height={200} style={shadowStyle} alt='examplePFP' />
                        </div>
                        {editMode && (
                            <div style={{ margin: "auto", textAlignLast: "center" }}>
                                <div class="row">
                                <input style={{ textAlignLast: "center" }} type="file" onChange={(event) =>{setImageUpload(event.target.files[0])}} />
                                </div>
                                <div class="row">
                                    <div class="col" style={{ margin: "auto", textAlignLast: "center" }}>
                                        <button style={{ width: "fit-content", textAlignLast: "center" }} class="first mt-2 btn btn-outline-primary btn-sm" onClick={uploadImage}>Upload Image</button>
                                        <button style={{ width: "fit-content", textAlignLast: "center" }} class="second mt-2 btn btn-outline-primary btn-sm" onClick={uploadImage}>Confirm Upload</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <h1 class="pt-3">{name}</h1>
                        <p class="card-text">
                            @{username}
                        </p>
                        {editModeUsername && editMode && (
                            <div class="container">
                                <form class="pb-1" onSubmit={handleDoneUsernameClick} >
                                    <div class="form-group">
                                        <input type="text" class="form-control form-control-sm" placeholder="Enter new username" onChange={(e) => { setNewUsername(e.target.value) }} />
                                    </div>
                                    <button type="submit" class="mt-2 btn btn-outline-primary btn-sm">Done</button>
                                </form>
                            </div>
                        )}
                        {!editModeUsername && editMode && (
                            <div class="text-center">
                                <button type="button" class="btn btn-outline-primary btn-sm" style={{ width: "fit-content" }} onClick={handleEditUsernameClick}>Edit Username</button>
                            </div>
                        )}
                        <br></br>
                        <hr />
                        {editMode && (
                            <div class="text-center">
                                <button type="button" class="btn btn-outline-primary btn-sm" style={{ width: "fit-content" }} onClick={handleDoneEditClick}>Save Changes</button>
                            </div>
                        )}
                        {!editMode && (
                            <div class="text-center">
                                <button type="button" class="btn btn-outline-primary btn-sm" style={{ width: "fit-content" }} onClick={handleEditProfileClick}>Edit Profile</button>
                            </div>
                        )}
                        <br></br>
                    </div>
                </div>
                <div class="col" style={{ paddingRight: "50px", overflowX: "auto" }}>
                    <div class="card">
                        <h4 class="card-title card-header">
                            About Me
                        </h4>
                        <div class="card-body text-start">
                            <h5>
                                Major
                                {editModeMajor && editMode && (
                                    <form class="pb-1 mt-2" onSubmit={handleDoneMajorClick} >
                                        <div class="form-group">
                                            <input type="text" style={{ width: "fit-content" }} class="form-control form-control-sm" placeholder="Enter new major" onChange={(e) => { setNewMajor(e.target.value) }} />
                                        </div>
                                        <button type="submit" class="mt-2 btn btn-outline-primary btn-sm">Done</button>
                                    </form>
                                )}
                                {!editModeMajor && editMode && (
                                    <button type="button" class="mx-2 btn btn-outline-primary btn-sm" style={{ width: "fit-content" }} onClick={handleEditMajorClick}>Edit Major</button>
                                )}
                            </h5>
                            <p>{major}</p>
                            <h5>
                                Bio
                                {editModeBio && editMode && (
                                    <form class="pb-1 mt-2" onSubmit={handleDoneBioClick} >
                                        <div class="form-group">
                                            <textarea type="text mx-2" role="textbox" class="form-control form-control-sm" placeholder="Enter new bio" onChange={(e) => { setNewBio(e.target.value) }} />
                                        </div>
                                        <button type="submit" class="mt-2 btn btn-outline-primary btn-sm">Done</button>
                                    </form>
                                )}
                                {!editModeBio && editMode && (
                                    <button type="button" class="mx-2 btn btn-outline-primary btn-sm" style={{ width: "fit-content" }} onClick={handleEditBioClick}>Edit Bio</button>
                                )}
                            </h5>
                            <p>{bio}</p>
                        </div>
                    </div>
                    <br></br>
                    <div class="card">
                        <h4 class="card-title card-header">
                            My Schedule
                        </h4>
                        <br></br>
                        <MyClassesList props={{...props, courses}} removeClassFunc={handleRemoveClass}/>

                        <br></br>
                    </div>
                </div>
            </div>

        </div>
    )
}