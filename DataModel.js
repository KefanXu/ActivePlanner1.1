import firebase from "firebase";
import "@firebase/firestore";
import "@firebase/storage";
import { firebaseConfig } from "./Secret";

import * as Notification from 'expo-notifications';

Notification.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class DataModel {
  constructor() {
    if (firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
    this.usersRef = firebase.firestore().collection("users");
    this.users = [];
    this.asyncInit();
    console.log("Data Model created");
  }

  asyncInit = async () => {
    await this.loadUsers();
    //console.log("this.users", this.users);
  };

  loadUsers = async () => {
    let querySnap = await this.usersRef.get();
    querySnap.forEach(async (qDocSnap) => {
      let key = qDocSnap.id;
      let data = qDocSnap.data();
      data.key = key;
      let isUserExist = false;
      for (let user of this.users) {
        if (user.key === data.key) {
          isUserExist = true;
        }
      }
      if (!isUserExist) {
        this.users.push(data);
      }  
    });
    console.log("load user", this.users.length);
    console.log("this.users", this.users);
  };

  createNewUser = async (username, password) => {
    let newUser = {
      email: username,
      password: password,
    }
    let newUsersDocRef = await this.usersRef.add(newUser);
  };

  getUsers = () => {
    return this.users;
  };

  askPermission = async() => {
    const perms = await Notification.getPermissionsAsync()
    let granted = perms.granted;
    console.log('tried to get permissions', perms);
    if (!granted) {
      const newPerms = await Notification.requestPermissionsAsync();
      granted = newPerms.granted;
    }
    return granted;
  }
  scheduleNotification = async() => {
    await Notification.scheduleNotificationAsync({
      content: {
        titel:"test",
        body:"notification in 5s",
        data: {data:"goes here"},
      },
      trigger: {
        seconds:5
      },
    })
  }
}

let theDataModel = undefined;

export function getDataModel() {
  if (!theDataModel) {
    theDataModel = new DataModel();
  }
  return theDataModel;
}
