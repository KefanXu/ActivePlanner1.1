import React, { useState } from "react";
import {
  TextInput,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
  Modal,
  LayoutAnimation,
  SectionList,
  Button,
  Animated,
} from "react-native";
import { getDataModel } from "./DataModel";
import { MonthCalendar } from "./Calendar";
import * as Google from "expo-google-app-auth";
import { Calendar } from "react-native-big-calendar";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import DropDownPicker from "react-native-dropdown-picker";

import SlidingUpPanel from "rn-sliding-up-panel";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment, { min } from "moment";

import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import SwitchSelector from "react-native-switch-selector";

import ModalSelector from "react-native-modal-selector";

// import AnimatedMultistep from "react-native-animated-multistep";
// const reportOptions = [
//   {
//     title: "Options",
//     data: [
//       { key: 1, text: "a", color: "red" },
//       { key: 2, text: "b", color: "blue" },
//       { key: 3, text: "c", color: "red" },
//       { key: 4, text: "d", color: "blue" },
//     ],
//   },
// ];

// import Step1 from "./steps/step1";
// import Step2 from "./steps/step2";
// import Step3 from "./steps/step3";
// import Step4 from "./steps/step4";

// const allSteps = [
//   { name: "step 1", component: Step1 },
//   { name: "step 2", component: Step2 },
//   { name: "step 3", component: Step3 },
//   { name: "step 4", component: Step4 },
// ];

let index = 0;
const data = [
  { key: index++, section: true, label: "Physical Activities" },
  { key: index++, label: "Walking" },
  { key: index++, label: "Jogging" },
  // {
  //   key: index++,
  //   label: "Cranberries",
  //   accessibilityLabel: "Tap here for cranberries",
  // },
  // // etc...
  // // Can also add additional custom keys which are passed to the onChange callback
  // { key: index++, label: "Vegetable", customKey: "Not a fruit" },
];

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export class CalendarPlanScreen extends React.Component {
  constructor(props) {
    super(props);
    this.months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    this.monthCalRef = React.createRef();
    this.weekCalRef = React.createRef();
    this.dataModel = getDataModel();
    this.userEmail = this.props.route.params.userEmail;
    this.eventsLastMonth = this.props.route.params.eventsLastMonth;
    this.eventsThisMonth = this.props.route.params.eventsThisMonth;
    this.eventsNextMonth = this.props.route.params.eventsNextMonth;

    this.fullEventList = this.props.route.params.fullEventList;

    this.selectedActivity;
    this.isActivitySelected = false;
    //console.log(this.eventsThisMonth);

    this.eventToday = {
      title: "default",
      start: "default",
    };

    this.userKey = this.props.route.params.userInfo.key;
    this.userPlans = this.props.route.params.userInfo.userPlans;
    this.isReportModalVis = false;

    this.combinedEventListThis = this.eventsThisMonth;
    this.combinedEventListLast = this.eventsLastMonth;
    this.combinedEventListNext = this.eventsNextMonth;
    this.combineEventListFull = this.fullEventList;

    this.lastMonthWeather = this.props.route.params.lastMonthWeather;
    this.thisMonthWeather = this.props.route.params.thisMonthWeather;
    this.nextMonthWeather = this.props.route.params.nextMonthWeather;

    for (let event of this.userPlans) {
      if (event.title && !event.isDeleted) {
        if (
          !this.combineEventListFull.includes(event) &&
          !this.combineEventListFull.some(
            (e) => e.timeStamp === event.timeStamp
          )
        ) {
          this.combineEventListFull.push(event);
        }

        let monthNum = parseInt(event.end.slice(5, 7));
        let currMonth = new Date();
        if (monthNum === currMonth.getMonth() + 1) {
          if (
            !this.combinedEventListThis.includes(event) &&
            !this.combinedEventListThis.some(
              (e) => e.timeStamp === event.timeStamp
            )
          ) {
            this.combinedEventListThis.push(event);
          }
        } else if (monthNum === currMonth.getMonth()) {
          if (
            !this.combinedEventListLast.includes(event) &&
            !this.combinedEventListLast.some(
              (e) => e.timeStamp === event.timeStamp
            )
          ) {
            this.combinedEventListLast.push(event);
          }
        } else {
          if (
            !this.combinedEventListNext.includes(event) &&
            !this.combinedEventListNext.some(
              (e) => e.timeStamp === event.timeStamp
            )
          ) {
            this.combinedEventListNext.push(event);
          }
        }
        //let plannedEvent = Object.assign({}, event);
      }
    }

    this.reportPopUp(this.userPlans);
    this.state = {
      isMonthCalVis: true,
      date: new Date(),
      panelTop: "Pick a date to plan",
      selectedDate: "",
      selectedMonth: "",
      isPlanBtnDisable: true,
      eventsLastMonth: this.combinedEventListLast,
      eventsThisMonth: this.combinedEventListThis,
      eventsNextMonth: this.combinedEventListNext,
      fullEventList: this.combineEventListFull,
      isFromWeekView: false,
      indexView: "Month",
      newListByActivity: [],
      isReportModalVis: this.isReportModalVis,
      isDayReportModalVis: false,
      //Update Report Modal
      isActivityCompleted: false,
      isThirtyMin: false,

      isFirstStepVis: "flex",
      isSecondYesStepVis: "none",
      isSecondNoStepVis: "none",
      isBackBtnVis: true,

      //Update Report Modal Button
      isButtonFirstStage: true,
      btnName: "Next",
      submitBtnState: true,
      reason: "",

      monthCalCurrDate: new Date(),
      isMonthPreBtnAble: true,
      isMonthNextBtnAble: true,
      monthCalCurrentMonth: new Date().getMonth(),

      weatherThisMonth: this.thisMonthWeather,

      isEventDetailModalVis: false,

      detailViewTemp: "",
      detailViewIcon: "",

      detailViewTop: "",

      slideUpDayNum: "",
      isPlannedEventModalVis: false,
      isWeatherVisOnPanel: "none",

      eventFilteredList: false,
      timeFilteredList: false,

      activityPickerInitVal: "none",

      detailViewCalendar: [],
    };
    //console.log("weatherThisMonth",this.state.weatherThisMonth);
    // this.monthCalRef = React.createRef();
  }

  // onNext = () => {
  //   console.log("Next");
  // };

  // /* define the method to be called when you go on back step */

  // onBack = () => {
  //   console.log("Back");
  // };

  // /* define the method to be called when the wizard is finished */

  // finish = (finalState) => {
  //   console.log(finalState);
  // };
  // getEventToday = () => {
  //   let userPlanList = this.userPlanList;
  //   let eventToday;
  //   let currentDate = moment(new Date()).format().slice(0, 10);
  //   for (let event of userPlanList) {
  //     if (event.end) {
  //       let eventDate = event.end.slice(0, 10);
  //       if (currentDate === eventDate) {
  //         console.log(event);
  //       }
  //     }
  //   }
  //   // return eventToday;
  // };
  reportPopUp = (userPlanList) => {
    let currentDate = moment(new Date()).format().slice(0, 10);
    //console.log("userPlanList", userPlanList);
    for (let event of userPlanList) {
      if (event.end && !event.isDeleted) {
        let eventDate = event.end.slice(0, 10);
        //console.log(eventDate);
        if (currentDate === eventDate) {
          if (!event.isReported) {
            this.isReportModalVis = true;
            this.eventToday = event;
          }
        }
      }
    }
    //console.log("this.isReportModalVis", this.isReportModalVis);
  };
  onPress = (item, monthNum, month) => {
    console.log("item,monthNum,month", item, monthNum, month);
    //console.log("this.userPlans", this.userPlans);
    let isPlanAble = false;
    let isPlanOnThatDay = false;
    //this.reportPopUp(this.userPlans);
    let planDetailList = [];
    for (let plan of this.userPlans) {
      if (plan.end) {
        let plannedMonth = parseInt(plan.end.slice(5, 7));
        let plannedDate = parseInt(plan.end.slice(8, 10));
        if (monthNum + 1 == plannedMonth && item == plannedDate) {
          isPlanOnThatDay = true;
          let planDetail = plan;
          planDetailList.push(planDetail);
        }
      }
    }
    //console.log("planDetailList[0]",planDetailList[0]);
    console.log("planDetailList", planDetailList);
    if (monthNum === this.state.date.getMonth()) {
      if (item > this.state.date.getDate()) {
        if (planDetailList.length === 0) {
          isPlanAble = true;
        } else {
          if (planDetailList[0].isDeleted) {
            isPlanAble = true;
            for (let event of planDetailList) {
              if (event.isDeleted === false) {
                isPlanAble = false;
              }
            }
          }
        }
      }
    } else if (monthNum > this.state.date.getMonth()) {
      if (planDetailList.length === 0) {
        isPlanAble = true;
      } else {
        if (planDetailList[0].isDeleted) {
          isPlanAble = true;
        }
      }
    }
    if (isPlanAble) {
      this.setState({ panelTop: "plan for " + month + " " + item });
      this._panel.show();

      let targetDate = new Date(this.state.date.getFullYear(), monthNum, item);
      this.setState({ slideUpDayNum: WEEKDAY[targetDate.getDay()] });
      let slideUpWeatherList = [];
      if (monthNum === this.state.date.getMonth()) {
        slideUpWeatherList = this.thisMonthWeather;
      } else {
        slideUpWeatherList = this.nextMonthWeather;
      }
      for (let weather of slideUpWeatherList) {
        if (weather.date === item) {
          this.setState({ detailViewTemp: weather.temp });
          this.setState({ detailViewIcon: weather.img });
        }
      }
      //console.log(targetDate);
      this.setState({ isFromWeekView: false });
      this.setState({ selectedDate: item });
      this.setState({ selectedMonth: monthNum });
      this.setState({ isPlanBtnDisable: false });
      this.setState({ isWeatherVisOnPanel: "flex" });
    } else {
      if (!planDetailList[0].isDeleted && planDetailList.length === 1) {
        this.eventToday = planDetailList[0];
        //console.log(this.eventToday);
        let currMonthNum = parseInt(this.eventToday.end.slice(5, 7));
        let currDate = parseInt(this.eventToday.end.slice(8, 10));
        let weatherList = [];
        if (currMonthNum === this.state.date.getMonth() + 1) {
          weatherList = this.thisMonthWeather;
        } else {
          weatherList = this.lastMonthWeather;
        }
        for (let weather of weatherList) {
          if (weather.date === currDate) {
            this.setState({ detailViewTemp: weather.temp });
            this.setState({ detailViewIcon: weather.img });
          }
        }
        if (this.eventToday.isReported) {
          //show event detail

          this.setState({ detailViewTop: month + " " + item });
          this.setState({ isEventDetailModalVis: true });
          //console.log("this.state.thisMonthEvents",this.state.eventsThisMonth);
          let detailViewCalendar = [];
          for (let event of this.state.eventsThisMonth) {
            if (
              event.start.slice(0, 10) === this.eventToday.start.slice(0, 10)
            ) {
              detailViewCalendar.push(event);
            }
          }
          this.setState({ detailViewCalendar: detailViewCalendar });
        } else {
          if (
            monthNum <= this.state.date.getMonth() &&
            item <= this.state.date.getDate()
          ) {
            this.setState({ isReportModalVis: true });
          } else {
            //show planned info
            this.eventToday = planDetailList[0];
            this.setState({ isPlannedEventModalVis: true });
          }
        }
      } else if (planDetailList.length != 1) {
        for (let event of planDetailList) {
          if (event.isDeleted === false) {
            this.eventToday = event;
            this.setState({ isPlannedEventModalVis: true });
          }
        }
      }
    }
  };
  // updateMonthCalView = () => {
  //   let newListByActivity = this.state.newListByActivity;
  //   console.log("newListByActivity",this.state.newListByActivity);
  //   this.setState({eventsThisMonth:newListByActivity});
  //   console.log("updateMonthCalView()",this.state.eventsThisMonth);
  // }
  onPlanBtnPressed = async () => {
    let item = this.state.selectedDate;
    let month = this.state.selectedMonth + 1;
    let monthNum = "";
    let dateNum = "";
    if (item < 10) {
      dateNum = "0" + item.toString();
    } else {
      dateNum = item.toString();
    }
    if (month < 10) {
      monthNum = "0" + month;
    }
    let year = new Date().getFullYear();

    let startMinutes = moment(this.state.date).format("HH:mm:ss");
    let endMinutes = moment(this.state.date)
      .add(30, "minutes")
      .format("HH:mm:ss");
    let date = year + "-" + monthNum + "-" + dateNum + "T";
    let startTime = date + startMinutes;
    let endTime = date + endMinutes;
    let activityName = this.selectedActivity;
    let newEvent = {
      start: startTime,
      end: endTime,
      id: startTime + endTime,
      isPlanned: "planned",
      isReported: false,
      isCompleted: false,
      isDeleted: false,
      color: "white",
      title: activityName,
    };
    // console.log(this.state.eventsThisMonth);
    if (parseInt(monthNum) === this.state.date.getMonth() + 1) {
      this.combinedEventListThis.push(newEvent);
      await this.setState({ eventsThisMonth: this.combinedEventListThis });
    } else {
      this.combinedEventListNext.push(newEvent);
      await this.setState({ eventsThisMonth: this.combinedEventListNext });
    }
    // let newEventList = this.eventsThisMonth;
    // console.log("newEventList", newEventList);
    // newEventList.push(newEvent);
    // await this.setState({ eventsThisMonth: newEventList });
    console.log("updateEvent in main view");
    this._panel.hide();
    this.updateView();

    let timeStamp = moment(new Date()).format();

    newEvent.timeStamp = timeStamp;
    newEvent.isReported = false;
    newEvent.activityReminderKey = await this.dataModel.scheduleNotification(
      newEvent
    );

    newEvent.reportReminderKey = await this.dataModel.scheduleReportNotification(
      newEvent
    );
    await this.dataModel.createNewPlan(this.userKey, newEvent);
    await this.dataModel.loadUserPlans(this.userKey);
    this.userPlans = this.dataModel.getUserPlans();

    //this.componentWillMount
    // this.monthCalRef.current.reSetEvents(this.state.eventsThisMonth);
  };
  onDeletePressed = async () => {
    console.log(this.eventToday);

    this.setState({ isPlannedEventModalVis: false });
    this.eventToday.isDeleted = true;
    await this.dataModel.updatePlan(this.userKey, this.eventToday);
    await this.dataModel.deleteReminders(this.eventToday);
    let monthNum = parseInt(this.eventToday.end.slice(5, 7));
    if (monthNum === this.state.date.getMonth() + 1) {
      let deleteIndex;
      //let deleteItem;
      for (let event of this.combinedEventListThis) {
        if (event.timeStamp === this.eventToday.timeStamp) {
          deleteIndex = this.combinedEventListThis.indexOf(event);
        }
      }
      this.combinedEventListThis.splice(deleteIndex, 1);
      await this.setState({ eventsThisMonth: this.combinedEventListThis });
    } else {
      let deleteIndex;
      for (let event of this.combinedEventListNext) {
        if (event.timeStamp === this.eventToday.timeStamp) {
          deleteIndex = this.combinedEventListNext.indexOf(event);
        }
      }
      this.combinedEventListNext.splice(deleteIndex, 1);
      await this.setState({ eventsThisMonth: this.combinedEventListNext });
    }
    this.updateView();
  };
  updateView = () => {
    //console.log("this.state.eventsThisMonth", this.state.eventsThisMonth);
    if (!this.state.isFromWeekView) {
      this.monthCalRef.current.processEvents();

      this.setState({ isMonthCalVis: true });
      this.setState({ indexView: "Month" });
    } else {
      //this.setState({isMonthCalVis:true});
      this.setState({ isMonthCalVis: true });
      this.setState({ indexView: "Week" });
    }
  };

  render() {
    let calView;
    console.log("render");
    // console.log(this.state.newListByActivity);
    // let newListByActivity;
    // if (this.state.newListByActivity.length !== 0) {
    //   newListByActivity = this.state.newListByActivity;
    //   // this.setState({eventsThisMonth:newListByActivity});
    //   // console.log(this.state.eventsThisMonth);
    // } else {
    //   newListByActivity = this.state.eventsThisMonth;
    // }
    // console.log("newListByActivity",newListByActivity);
    //console.log("this.state.eventsThisMonth",this.state.eventsThisMonth);

    if (this.state.isMonthCalVis) {
      console.log("this.state.isMonthCalVis", this.state.isMonthCalVis);

      calView = (
        <View>
          <MonthCalendar
            ref={this.monthCalRef}
            thisMonthEvents={this.state.eventsThisMonth}
            monthCalCurrDate={this.state.monthCalCurrDate}
            weatherThisMonth={this.state.weatherThisMonth}
            onPress={(item, monthNum, month) =>
              this.onPress(item, monthNum, month)
            }
          />
          <TouchableOpacity
            style={{ flex: 1, position: "absolute", top: 0 }}
            disabled={!this.state.isMonthPreBtnAble}
            onPress={async () => {
              let currMonth = this.state.date.getMonth();
              let currMonthOnCal = this.state.monthCalCurrentMonth;
              if (currMonthOnCal === currMonth) {
                this.setState({ isMonthPreBtnAble: false });
                currMonthOnCal = this.state.monthCalCurrentMonth - 1;
                this.setState({ monthCalCurrentMonth: currMonthOnCal });
                //console.log("currMonthOnCal",currMonthOnCal);
                let monthCalCurrDate = new Date(2021, currMonthOnCal, 15);
                //console.log("monthCalCurrDate",monthCalCurrDate);
                await this.setState({ monthCalCurrDate: monthCalCurrDate });
                let preMonthList = this.combinedEventListLast;
                await this.setState({ eventsThisMonth: preMonthList });
                await this.setState({
                  weatherThisMonth: this.lastMonthWeather,
                });
                this.updateView();
                //console.log("this.state.monthCalCurrDate",this.state.monthCalCurrDate);
              } else {
                this.setState({ isMonthNextBtnAble: true });
                currMonthOnCal = this.state.date.getMonth();
                this.setState({ monthCalCurrentMonth: currMonthOnCal });
                let monthCalCurrDate = this.state.date;
                await this.setState({ monthCalCurrDate: monthCalCurrDate });
                let thisMonthList = this.combinedEventListThis;
                await this.setState({ eventsThisMonth: thisMonthList });
                await this.setState({
                  weatherThisMonth: this.thisMonthWeather,
                });
                this.updateView();
              }
            }}
          >
            <Text>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, position: "absolute", top: 0, right: 0 }}
            disabled={!this.state.isMonthNextBtnAble}
            onPress={async () => {
              //console.log("condition1",this.state.monthCalCurrentMonth);
              let currMonth = this.state.date.getMonth();
              let currMonthOnCal = this.state.monthCalCurrentMonth;
              if (currMonthOnCal === currMonth) {
                this.setState({ isMonthNextBtnAble: false });
                currMonthOnCal = this.state.monthCalCurrentMonth + 1;
                this.setState({ monthCalCurrentMonth: currMonthOnCal });
                let monthCalCurrDate = new Date(2021, currMonthOnCal, 15);
                await this.setState({ monthCalCurrDate: monthCalCurrDate });
                let nextMonthList = this.combinedEventListNext;
                await this.setState({ eventsThisMonth: nextMonthList });
                await this.setState({
                  weatherThisMonth: this.nextMonthWeather,
                });
                this.updateView();
              } else {
                //console.log("condition2",this.state.monthCalCurrentMonth);
                this.setState({ isMonthPreBtnAble: true });
                currMonthOnCal = this.state.date.getMonth();
                this.setState({ monthCalCurrentMonth: currMonthOnCal });
                let monthCalCurrDate = this.state.date;
                await this.setState({ monthCalCurrDate: monthCalCurrDate });
                let thisMonthList = this.combinedEventListThis;
                await this.setState({ eventsThisMonth: thisMonthList });
                await this.setState({
                  weatherThisMonth: this.thisMonthWeather,
                });
                this.updateView();
              }
            }}
          >
            <Text>Next</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      console.log("render week cal");
      //console.log("this state", this.state.eventsThisMonth);
      calView = (
        <View
          style={
            ({ backgroundColor: "red", justifyContent: "flex-start" },
            [{ transform: [{ scaleY: 1 }] }])
          }
        >
          <Calendar
            // events={[{ title: "test", start: new Date(), end: new Date() }]}
            refs={this.weekCalRef}
            contentContainerStyle={{ justifyContent: "flex-start" }}
            events={this.state.fullEventList}
            eventCellStyle={(event) => {
              if (event.color) {
                return { backgroundColor: event.color, borderWidth: 2 };
              } else {
                return { backgroundColor: "grey" };
              }
            }}
            height={750}
            scrollOffsetMinutes={480}
            showTime={false}
            mode="week"
            showTime={true}
            swipeEnabled={true}
            onPressCell={() => alert("cell pressed")}
            onPressDateHeader={(date) => {
              let selectedDate = parseInt(date.toString().slice(8, 10));
              //console.log(selectedDate);
              this.setState({ selectedDate: selectedDate });

              let monthNum = moment(date).month();
              this.setState({ selectedMonth: monthNum });
              let month = this.months[monthNum];

              this.setState({
                panelTop: "plan for " + month + " " + selectedDate,
              });
              this._panel.show();

              this.setState({ isPlanBtnDisable: false });
              this.setState({ isFromWeekView: true });
            }}
            onPressEvent={() => alert("event pressed")}
          />
        </View>
      );
    }
    return (
      <View
        style={{
          alignContent: "center",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* <View style={{backgroundColor:"red"}}>
        <Button
          title="Get permissions"
          onPress={this.dataModel.askPermission}
        ></Button>
        <Button
          title="Push a notification in 5s"
          onPress={this.dataModel.scheduleNotification}
        ></Button>
        </View> */}

        {/* //report modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.isReportModalVis}
          onRequestClose={() => {
            Alert.alert("Modal has been closed");
          }}
        >
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <View
              style={{
                flex: 0.5,
                width: "95%",
                backgroundColor: "white",

                borderWidth: 2,
                borderColor: "black",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                borderRadius: 15,
              }}
            >
              {/* <SectionList
                sections={reportOptions}
                renderItem={({ item }) => {
                  let color = item.color;
                  return <Text style={{ color: color }}>{item.text}</Text>;
                }}
              /> */}
              <View
                style={{
                  flex: 0.1,
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                }}
              >
                <View>
                  <TouchableOpacity
                    onPress={() => this.setState({ isReportModalVis: false })}
                  >
                    <MaterialIcons name="cancel" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              </View>
              <View
                style={{
                  flex: 0.25,
                  width: "80%",
                  marginTop: 0,
                  //backgroundColor: "blue",
                }}
              >
                <Text style={{ fontSize: 24, fontWeight: "bold" }}>
                  Tell us your day!
                </Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "bold", marginTop: 5 }}
                >
                  The following questions only take seconds to complete
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  width: "80%",
                  //backgroundColor: "red",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    display: this.state.isFirstStepVis,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginBottom: "10%",
                      marginTop: "20%",
                    }}
                  >
                    Question 1/2
                  </Text>
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginBottom: "10%",
                    }}
                  >
                    Did you {this.eventToday.title} at {this.eventToday.start}
                  </Text>
                  <SwitchSelector
                    options={[
                      { label: "No", value: false },
                      { label: "Yes", value: true },
                    ]}
                    initial={0}
                    buttonMargin={5}
                    borderWidth={2}
                    borderColor="black"
                    buttonColor="black"
                    onPress={(value) =>
                      // console.log(`Call onPress with value: ${value}`)
                      {
                        this.setState({ isActivityCompleted: value });
                      }
                    }
                  />
                </View>
                <View style={{ display: this.state.isSecondYesStepVis }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginBottom: "10%",
                      marginTop: "20%",
                    }}
                  >
                    Did you {this.eventToday.title} for 30 min
                  </Text>
                  <SwitchSelector
                    options={[
                      { label: "No", value: false },
                      { label: "Yes", value: true },
                    ]}
                    initial={0}
                    buttonMargin={5}
                    borderWidth={2}
                    borderColor="black"
                    buttonColor="black"
                    onPress={(value) =>
                      // console.log(`Call onPress with value: ${value}`)
                      {
                        this.setState({ isThirtyMin: value });
                      }
                    }
                  />
                </View>
                <View style={{ display: this.state.isSecondNoStepVis }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginBottom: "10%",
                      marginTop: "20%",
                    }}
                  >
                    Give us a reason
                  </Text>
                  <View
                    style={{
                      flex: 0.15,

                      marginTop: 10,
                      width: "100%",
                      borderWidth: 2,
                      borderRadius: 30,
                      borderColor: "#6E6E6E",
                    }}
                  >
                    <TextInput
                      secureTextEntry={true}
                      style={{
                        flex: 1,
                        marginLeft: 20,
                        marginRight: 20,
                        fontSize: 20,
                      }}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={this.state.reason}
                      onChangeText={(text) => {
                        this.setState({ reason: text });
                      }}
                    />
                  </View>
                </View>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Button
                  title="Back"
                  disabled={this.state.isBackBtnVis}
                  onPress={() => {
                    this.setState({ isBackBtnVis: true });
                    this.setState({ isFirstStepVis: "flex" });
                    this.setState({ isSecondYesStepVis: "none" });

                    this.setState({ isSecondNoStepVis: "none" });
                    //this.setState({ isButtonFirstStage: true });
                    this.setState({ btnName: "Next" });
                  }}
                ></Button>
                <Button
                  title={this.state.btnName}
                  onPress={async () => {
                    if (this.state.btnName === "Submit") {
                      this.setState({ isReportModalVis: false });
                      let eventToUpdate = this.eventToday;
                      eventToUpdate.isActivityCompleted = this.state.isActivityCompleted;
                      eventToUpdate.isReported = true;

                      if (this.state.submitBtnState) {
                        // console.log("this.state.isThirtyMin",this.state.isThirtyMin);
                        // console.log("isActivityCompleted",this.state.isActivityCompleted);

                        eventToUpdate.isThirtyMin = this.state.isThirtyMin;
                      } else {
                        eventToUpdate.reason = this.state.reason;
                      }
                      await this.dataModel.updatePlan(
                        this.userKey,
                        eventToUpdate
                      );
                      let eventList = this.state.eventsThisMonth;
                      await this.setState({ eventsThisMonth: eventList });
                      this.updateView();
                    } else {
                      this.setState({ isBackBtnVis: false });
                      this.setState({ isFirstStepVis: "none" });
                      this.setState({ btnName: "Submit" });
                      if (this.state.isActivityCompleted) {
                        this.setState({ submitBtnState: true });
                        this.setState({ isSecondYesStepVis: "flex" });
                        //this.setState({ isButtonFirstStage: false });
                      } else {
                        this.setState({ submitBtnState: false });
                        this.setState({ isSecondNoStepVis: "flex" });
                      }
                    }
                  }}
                ></Button>
              </View>
              {/* <View style={{ flex: 1 }}>
                <AnimatedMultistep
                  steps={allSteps}
                  onFinish={this.finish}
                  onBack={this.onBack}
                  onNext={this.onNext}
                  comeInOnNext="bounceInUp"
                  OutOnNext="bounceOutDown"
                  comeInOnBack="bounceInDown"
                  OutOnBack="bounceOutUp"
                />
              </View> */}
            </View>
          </View>
        </Modal>
        {/* //Detailed View Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.isEventDetailModalVis}
          onRequestClose={() => {
            Alert.alert("Modal has been closed");
          }}
        >
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <View
              style={{
                flex: 0.9,
                width: "95%",
                backgroundColor: "white",
                borderWidth: 2,
                borderColor: "black",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "center",
                borderRadius: 15,
              }}
            >
              <View
                style={{
                  flex: 0.06,
                  width: "100%",
                  flexDirection: "row",
                  // backgroundColor:"red",

                  justifyContent: "flex-end",
                  alignItems: "flex-start",
                }}
              >
                <View>
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({ isEventDetailModalVis: false })
                    }
                  >
                    <MaterialIcons name="cancel" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ flex: 0.9, width: "90%"}}>
                <View
                  style={{
                    flex: 0.2,
                    width: "100%",
                    backgroundColor: "#BDBDBD",
                    borderRadius: 15,
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      flex: 0.3,
                      width: "90%",
                      marginTop: 10,
                      marginLeft: 10,
                      marginBottom: 0,
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                      Records on {this.eventToday.title},{" "}
                      {this.state.detailViewTop}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 0.7,
                      width: "90%",
                      marginTop: 0,
                      marginLeft: 10,
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexDirection: "row",
                      // backgroundColor: "red",
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                      {WEEKDAY[new Date(this.eventToday.end).getDay()]}
                    </Text>
                    <Image
                      source={{
                        uri:
                          "http://openweathermap.org/img/wn/" +
                          this.state.detailViewIcon +
                          ".png",
                      }}
                      style={{ width: 60, height: 60 }}
                    ></Image>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                      {this.state.detailViewTemp}°C
                    </Text>
                  </View>
                </View>
                <View style={{ flex: 1,}}>
                  <Calendar
                    events={this.state.detailViewCalendar}
                    date={new Date(this.eventToday.start)}
                    scrollOffsetMinutes={parseInt(this.eventToday.start.slice(11,13))*60}
                    swipeEnabled={false}
                    height={90}
                    mode="day"
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.isPlannedEventModalVis}
          onRequestClose={() => {
            Alert.alert("Modal has been closed");
          }}
        >
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <View
              style={{
                flex: 0.9,
                width: "95%",
                backgroundColor: "white",
                borderWidth: 2,
                borderColor: "black",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "center",
                borderRadius: 15,
              }}
            >
              <View
                style={{
                  flex: 0.05,
                  width: "100%",
                  flexDirection: "row",
                  // backgroundColor:"red",

                  justifyContent: "flex-end",
                  alignItems: "flex-start",
                }}
              >
                <View>
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({ isPlannedEventModalVis: false })
                    }
                  >
                    <MaterialIcons name="cancel" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ flex: 0.9, width: "90%" }}>
                <View
                  style={{
                    flex: 0.2,
                    width: "100%",
                    backgroundColor: "#BDBDBD",
                    borderRadius: 15,
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      width: "90%",
                      marginTop: 10,
                      marginLeft: 10,
                      marginBottom: 0,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                      Planned: {this.eventToday.title},{" "}
                      {this.state.detailViewTop}
                    </Text>
                    <View>
                      {/* <Button title="Report" style={{backgroundColor:"black"}}></Button> */}
                      {/* <TouchableOpacity
                        style={{
                          backgroundColor: "black",
                          borderRadius: 15,
                          padding: 5,
                          marginBottom: 10,
                        }}
                        onPress={() => {
                          this.setState({ isPlannedEventModalVis: false });
                          this.setState({ isReportModalVis: true });
                        }}
                      >
                        <Text style={{ color: "white", fontWeight: "bold" }}>
                          Report
                        </Text>
                      </TouchableOpacity> */}
                      <TouchableOpacity
                        onPress={this.onDeletePressed}
                        style={{
                          backgroundColor: "black",
                          borderRadius: 15,
                          padding: 5,
                        }}
                      >
                        <Text style={{ color: "white", fontWeight: "bold" }}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View
                    style={{
                      flex: 0.7,
                      width: "90%",
                      marginTop: 0,
                      marginLeft: 10,
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexDirection: "row",
                      // backgroundColor: "red",
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                      {WEEKDAY[new Date(this.eventToday.end).getDay()]}
                    </Text>
                    <Image
                      source={{
                        uri:
                          "http://openweathermap.org/img/wn/" +
                          this.state.detailViewIcon +
                          ".png",
                      }}
                      style={{ width: 60, height: 60 }}
                    ></Image>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                      {this.state.detailViewTemp}°C
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Modal>
        <View>
          <SegmentedControl
            values={["Month", "Week"]}
            selectedIndex={this.state.indexView}
            onChange={(event) => {
              // this.setState({
              //   selectedIndex: event.nativeEvent.selectedSegmentIndex,
              // });
              //console.log(event.nativeEvent.selectedSegmentIndex);
              if (event.nativeEvent.selectedSegmentIndex === 1) {
                this.setState({ isMonthCalVis: false });
              } else {
                this.setState({ isMonthCalVis: true });
              }
            }}
          />
        </View>
        <View
          style={{
            flexDirection: "column",
            backgroundColor: "",
            justifyContent: "flex-start",
          }}
        >
          {/* <View style={[{alignItems:"flex-start", justifyContent:"flex-start", marginTop:0},{ transform: [{ scale: 0.5 }] }]}>
            <Calendar
              events={[{ title: "test", start: new Date(), end: new Date() }]}
              height={1}
              mode="week"
              showTime={true}
              style={[{marginTop:0},{ transform: [{ scale: 1}] }]}
            />
          </View> */}
          {/* <View style={[{ transform: [{ scale: 0.5 }] }]}>
            <Calendar
              events={[{ title: "test", start: new Date(), end: new Date() }]}
              height={1}
              mode="week"
              showTime={true}
            />
          </View> */}
          {calView}
        </View>
        {/* <TouchableOpacity
          onPress={() => {
            //this._panel.show();
            //this.setState({ isReportModalVis: true });
            this.dataModel.scheduleNotification();
            this.dataModel.scheduleReportNotification();
          }}
          style={{
            width: "100%",
            position: "absolute",
            bottom: "40%",
            alignItems: "center",
          }}
        >
          <View style={{ opacity: 0.5 }}>
            <Ionicons name="add-circle" size={30} color="black" />
          </View>
        </TouchableOpacity> */}
        {/* <TouchableOpacity
          onPress={() => {
            this.setState({ isEventDetailModalVis: true });
          }}
          style={{
            width: "100%",
            position: "absolute",
            bottom: "50%",
            alignItems: "center",
          }}
        >
          <View style={{ opacity: 0.5 }}>
            <Ionicons name="add-circle" size={30} color="black" />
          </View>
        </TouchableOpacity> */}
        {/* <TouchableOpacity
          onPress={() => {
            this.setState({ isDayReportModalVis: true });
          }}
          style={{
            width: "100%",
            position: "absolute",
            bottom: "60%",
            alignItems: "center",
          }}
        >
          <View style={{ opacity: 0.5 }}>
            <Ionicons name="add-circle" size={30} color="black" />
          </View>
        </TouchableOpacity> */}

        <SlidingUpPanel
          draggableRange={{ top: 300, bottom: 100 }}
          ref={(c) => (this._panel = c)}
        >
          <View
            style={{
              height: 300,
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: 40,
              backgroundColor: "#BDBDBD",
            }}
          >
            <View
              style={{
                flex: 0.4,
                width: "90%",
                borderRadius: 20,
                justifyContent: "flex-start",
                marginTop: 20,
                backgroundColor: "#6E6E6E",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "white",
                  marginTop: 10,
                  marginLeft: 10,
                }}
              >
                {this.state.panelTop}
              </Text>
              <View
                style={{
                  flex: 0.8,
                  margin: 10,
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexDirection: "row",
                  display: this.state.isWeatherVisOnPanel,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  {this.state.slideUpDayNum}
                </Text>
                <Image
                  source={{
                    uri:
                      "http://openweathermap.org/img/wn/" +
                      this.state.detailViewIcon +
                      ".png",
                  }}
                  style={{ width: 60, height: 60 }}
                ></Image>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  {this.state.detailViewTemp}°C
                </Text>
              </View>
            </View>
            <View
              style={{
                flex: 0.4,
                width: "90%",
                borderRadius: 20,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginTop: 20,
                backgroundColor: "#6E6E6E",
              }}
            >
              <View style={{ flex: 0.5, alignContent: "flex-start" }}>
                <Text
                  style={{
                    margin: 5,
                    fontWeight: "bold",
                    fontSize: 12,
                    color: "white",
                  }}
                >
                  Activity Type
                </Text>
                <ModalSelector
                  style={{ backgroundColor: "white", borderWidth: 0 }}
                  backdropPressToClose={true}
                  overlayStyle={{
                    flex: 1,
                    padding: "5%",
                    justifyContent: "center",
                    backgroundColor: "rgba(0,0,0,0)",
                  }}
                  initValueTextStyle={{ color: "black" }}
                  data={data}
                  initValue={this.state.activityPickerInitVal}
                  onChange={async (item) => {
                    this.selectedActivity = item.label;
                    this.isActivitySelected = true;
                    let newListByActivity = [];
                    let currentList = [];
                    if (!this.state.timeFilteredList) {
                      if (
                        this.state.monthCalCurrentMonth ===
                        this.state.date.getMonth()
                      ) {
                        currentList = this.combinedEventListThis;
                      } else if (
                        this.state.monthCalCurrentMonth ===
                        this.state.date.getMonth() - 1
                      ) {
                        currentList = this.combinedEventListLast;
                      } else {
                        currentList = this.combinedEventListNext;
                      }
                      this.setState({ eventFilteredList: true });
                    } else {
                      currentList = this.state.eventsThisMonth;
                      this.setState({ eventFilteredList: false });
                    }

                    let eventListDates = [];
                    for (let event of currentList) {
                      let dateNum = String(event.start.slice(8, 10));
                      if (!eventListDates.includes(dateNum)) {
                        eventListDates.push(dateNum);
                      }
                    }

                    let dayEventsList = [];
                    for (let dateNum of eventListDates) {
                      let dayEventObj = {
                        dateNum: parseInt(dateNum),
                        dayEvents: [],
                        isFiltered: false,
                      };
                      dayEventsList.push(dayEventObj);
                    }

                    for (let date of dayEventsList) {
                      for (let event of currentList) {
                        let dateNum = parseInt(event.start.slice(8, 10));
                        if (dateNum === date.dateNum) {
                          let newEvent = event;
                          date.dayEvents.push(newEvent);
                        }
                      }
                    }

                    let newEventList = [];

                    for (let date of dayEventsList) {
                      for (let event of date.dayEvents) {
                        if (event.title) {
                          if (event.title === item.label) {
                            date.isFiltered = true;
                          }
                        }
                      }
                    }

                    for (let date of dayEventsList) {
                      if (date.isFiltered) {
                        for (let event of date.dayEvents) {
                          newEventList.push(event);
                        }
                      }
                    }

                    // this.setState({activityPickerInitVal:"none"})

                    await this.setState({ eventsThisMonth: newEventList });

                    this.monthCalRef.current.processEvents();
                  }}
                />
                {/* <DropDownPicker
                  items={[
                    {
                      label: "Walking",
                      value: "walking",
                      //icon: () => <Icon name="flag" size={18} color="#900" />,
                      //hidden: true,
                    },
                    {
                      label: "Jogging",
                      value: "Jogging",
                      //icon: () => <Icon name="flag" size={18} color="#900" />,
                    },
                  ]}
                  defaultValue={"walking"}
                  containerStyle={{ height: 40 }}
                  style={{
                    backgroundColor: "#fafafa",
                    width: "100%",
                    margin: 5,
                  }}
                  itemStyle={{
                    justifyContent: "flex-start",
                  }}
                  dropDownStyle={{ backgroundColor: "#fafafa" }}
                  onChangeItem={async (item) => {
                    this.selectedActivity = item.label;
                    this.isActivitySelected = true;
                    let newListByActivity = [];
                    let currentList = this.state.eventsThisMonth;
                    //console.log("currentList",currentList);
                    for (let event of currentList) {
                      if (event.title) {
                        if (event.title === item.label) {
                          newListByActivity.push(event);
                        }
                      }
                    }
                    console.log("newListByActivity", newListByActivity);

                    await this.setState({ eventsThisMonth: newListByActivity });
                    //this.monthCalRef.current.processEvents();
                    //this.updateView();
                    //console.log("this.state.eventsThisMonth",this.state.eventsThisMonth);
                    //console.log("this.state.newListByActivity",this.state.newListByActivity);
                    this.monthCalRef.current.processEvents();
                  }}
                /> */}
              </View>
              <View
                style={{
                  flex: 0.25,
                  width: "100%",
                  height: "100%",
                  justifyContent: "flex-start",
                  // backgroundColor:"blue"
                }}
              >
                <Text
                  style={{
                    margin: 5,
                    fontWeight: "bold",
                    fontSize: 12,
                    color: "white",
                  }}
                >
                  Start
                </Text>
                <DateTimePicker
                  value={this.state.date}
                  mode="default"
                  is24Hour={true}
                  display="default"
                  onChange={async (e, date) => {
                    //let setDate = moment(date);
                    let startHour = moment(date).hour();
                    this.setState({ date: date });
                    let newList = [];

                    if (startHour < 12) {
                      for (let event of this.state.eventsThisMonth) {
                        if (parseInt(event.start.slice(11, 13)) < 12) {
                          newList.push(event);
                        }
                      }
                    } else {
                      for (let event of this.state.eventsThisMonth) {
                        if (parseInt(event.start.slice(11, 13)) > 12) {
                          newList.push(event);
                        }
                      }
                    }
                    if (this.state.eventFilteredList) {
                      this.setState({ timeFilteredList: false });
                    } else {
                      this.setState({ timeFilteredList: true });
                    }

                    this.setState({ date: new Date() });
                    await this.setState({ eventsThisMonth: newList });

                    this.monthCalRef.current.processEvents();
                  }}
                  style={{
                    width: 100,
                    alignContent: "center",
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                />
              </View>
              <View
                style={{
                  flex: 0.25,
                  width: "100%",
                  height: "100%",
                  justifyContent: "flex-start",
                }}
              >
                <Text
                  style={{
                    margin: 5,
                    fontWeight: "bold",
                    fontSize: 12,
                    color: "white",
                  }}
                >
                  End
                </Text>
                <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                  {moment(this.state.date).add(30, "minutes").format("hh:mm")}
                </Text>
              </View>
            </View>
            <View
              style={{
                flex: 0.4,
                flexDirection: "row",
                width: "90%",
                borderRadius: 20,
                justifyContent: "flex-start",
                marginTop: 20,
                backgroundColor: "#6E6E6E",
              }}
            >
              <Button
                title="Plan"
                disabled={this.state.isPlanBtnDisable}
                onPress={() => this.onPlanBtnPressed()}
              ></Button>
              <Button
                title="Reset"
                disabled={false}
                onPress={async () => {
                  let currentList = [];
                  if (
                    this.state.monthCalCurrentMonth ===
                    this.state.date.getMonth()
                  ) {
                    currentList = this.combinedEventListThis;
                  } else if (
                    this.state.monthCalCurrentMonth ===
                    this.state.date.getMonth() - 1
                  ) {
                    currentList = this.combinedEventListLast;
                  } else {
                    currentList = this.combinedEventListNext;
                  }
                  await this.setState({ eventsThisMonth: currentList });

                  this.monthCalRef.current.processEvents();
                }}
              ></Button>
            </View>
          </View>
        </SlidingUpPanel>
      </View>
    );
  }
}
