import React from "react";
import {
  TextInput,
  Text,
  View,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
  LayoutAnimation,
} from "react-native";

import { loginStyles } from "./Styles";
import { getDataModel } from "./DataModel";
import moment, { min } from "moment";

export class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayNameInput: "",
      passwordInput: "",
    };
  }
  componentDidMount = () => {
    this.dataModel = getDataModel();
    this.focusUnsubscribe = this.props.navigation.addListener(
      "focus",
      this.onFocus
    );
  };
  onFocus = () => {
    this.dataModel.asyncInit();
  };

  // onLogin = () => {
  //   //console.log("Login");
  //   let userList = this.dataModel.getUsers();

  //   let userName = this.state.displayNameInput;
  //   let password = this.state.passwordInput;
  //   let isUserFound = false;
  //   for (let user of userList) {
  //     if (user.email === userName && user.password === password) {
  //       console.log("user found");
  //       isUserFound = true;
  //     }
  //   }
  //   if (isUserFound) {
  //     this.props.navigation.navigate("Home Screen");
  //   } else {
  //     Alert.alert(
  //       "Login Failed",
  //       "No match found for this email and password.",
  //       [{ text: "OK", style: "OK" }]
  //     );
  //   }
  // };
  onGoogleSignIn = async () => {
    console.log("Google Sign In");
    let userList = this.dataModel.getUsers();
    let [timeMin, timeMax] = this.processDate();
    //console.log(timeMin, timeMax);
    let [calEvents,calendarsID] = await this.dataModel.googleServiceInit(timeMin, timeMax);
    let [
      previousMonthList,
      thisMonthList,
      nextMonthList,
    ] = this.processCalEvent(calEvents.items);
    let key;
    let isUserFound = false;
    for (let user of userList) {
      if (calendarsID === user.email) {
        isUserFound = true;
        key = user.key;
      }
    }
    if (!isUserFound) {
      await this.dataModel.createNewUser(calendarsID);
      key = this.dataModel.getUserKey();
    } 
    // console.log(previousMonthList);
    // console.log(thisMonthList);
    // console.log(nextMonthList);

    // console.log("user key:",key);
    await this.dataModel.loadUserPlans(key);
    let userPlans = this.dataModel.getUserPlans();

    let userInfo = {
      key:key,
      userPlans: userPlans,
    }

    // console.log("userPlans",userPlans);
    this.props.navigation.navigate("Home Screen", {
      userEmail: calendarsID,
      userInfo: userInfo,
      eventsLastMonth:previousMonthList,
      eventsThisMonth: thisMonthList,
      eventsNextMonth: nextMonthList,
    });
  };

  processDate = () => {
    let currDate = new Date();
    let month = currDate.getMonth();
    let year = currDate.getFullYear();
    let monthMin = month;
    let monthMax = month + 2;
    if (monthMin < 10) {
      monthMin = "0" + monthMin;
    }
    if (monthMax < 10) {
      monthMax = "0" + monthMax;
    }
    let dateMin = "timeMin=" + year + "-" + monthMin + "-01T10%3A00%3A00Z";
    let monthDays = moment(year + "-" + monthMax, "YYYY-MM").daysInMonth();
    let dateMax =
      "timeMax=" + year + "-" + monthMax + "-" + monthDays + "T23%3A00%3A00Z";

    return [dateMin, dateMax];
  };

  processCalEvent = (eventList) => {
    let currMonth = moment().format("YYYY-MM");
    let nextMonth = moment().add(1, "months").format("YYYY-MM");

    let lastMonth = moment().subtract(1, "months").format("YYYY-MM");
    //console.log(nextMonth,lastMonth);
    let previousMonthList = [];
    let thisMonthList = [];
    let nextMonthList = [];

    for (let dayEvent of eventList) {
      if (dayEvent.start) {
        let timeStamp = dayEvent.start.dateTime.slice(0, 7);
        //console.log("typeof(dayEvent.start.dateTime)",typeof(dayEvent.start.dateTime));
        let simplifiedEvent = {
          start: dayEvent.start.dateTime,
          end: dayEvent.end.dateTime,
        };
        if (timeStamp === currMonth) {
          thisMonthList.push(simplifiedEvent);
        } else if (timeStamp === nextMonth) {
          //console.log(timeStamp, "next month added");
          nextMonthList.push(simplifiedEvent);
        } else if (timeStamp === lastMonth) {
          //console.log(timeStamp, "last month added");
          previousMonthList.push(simplifiedEvent);
        }
      }
    }
    return [previousMonthList, thisMonthList, nextMonthList];
    //console.log(currMonth);
  };

  // onRegist = () => {
  //   //console.log("Regist");
  //   this.props.navigation.navigate("SignUp", {});
  // };
  render() {
    return (
      <View
        style={loginStyles.inputContatiner}
        behavior={"height"}
        keyboardVerticalOffset={1}
      >
        {/* <View style={loginStyles.inputField}>
          <Text style={loginStyles.inputFont}>Email</Text>
          <View style={loginStyles.inputText}>
            <TextInput
              style={loginStyles.inputTextField}
              autoCapitalize="none"
              autoCorrect={false}
              value={this.state.displayNameInput}
              onChangeText={(text) => {
                this.setState({ displayNameInput: text });
              }}
            />
          </View>
          <Text style={loginStyles.inputFont}>Password</Text>
          <View style={loginStyles.inputText}>
            <TextInput
              secureTextEntry={true}
              style={loginStyles.inputTextField}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              value={this.state.passwordInput}
              onChangeText={(text) => {
                this.setState({ passwordInput: text });
              }}
            />
          </View>
        </View> */}
        <View style={loginStyles.buttonArea}>
          {/* <TouchableOpacity
            style={loginStyles.buttonStyle}
            onPress={() => this.onLogin()}
          >
            <Text style={loginStyles.buttonFont}>Log in</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={loginStyles.buttonStyle}
            onPress={() => this.onRegist()}
          >
            <Text style={loginStyles.buttonFont}>Sign up</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            style={loginStyles.buttonStyle}
            onPress={() => this.onGoogleSignIn()}
          >
            <Text style={loginStyles.buttonFont}>Sign In with Google</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={loginStyles.buttonStyle}
            onPress={() => this.processDate()}
          >
            <Text style={loginStyles.buttonFont}>Process Date</Text>
          </TouchableOpacity> */}
          {/* <TouchableOpacity
            style={loginStyles.buttonStyle}
            onPress={() => this.processCalEvent()}
          >
            <Text style={loginStyles.buttonFont}>Process event</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    );
  }
}
