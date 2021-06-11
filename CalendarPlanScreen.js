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
  Dimensions,
  Button,
  Animated,
  AppState,
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
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import SwitchSelector from "react-native-switch-selector";
import victoryTheme from "./material";
import victoryThemeActivity from "./materialActivity";
import AnimatedLoader from "react-native-animated-loader";

import ModalSelector from "react-native-modal-selector";
import {
  VictoryBar,
  VictoryChart,
  VictoryTheme,
  VictoryPie,
  VictoryGroup,
} from "victory-native";
import { FlatList } from "react-native-gesture-handler";

// let index = 0;
// const data = [
//   { key: index++, section: true, label: "Physical Activities" },
//   { key: index++, label: "Walking" },
//   { key: index++, label: "Jogging" },
//   { key: index++, label: "Gardening" },
//   { key: index++, label: "Biking" },
//   { key: index++, label: "Jumping Rope" },
// ];
// const data = [
//   { quarter: 1, earnings: 13000 },
//   { quarter: 2, earnings: 16500 },
//   { quarter: 3, earnings: 14250 },
//   { quarter: 4, earnings: 19000 },
// ];

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const BACKGROUND_COLOR = "white";
const RED = "#EE442F";
const GREEN = "#63ACBE";
const PIECHART = {
  pie: {
    style: {
      data: {
        padding: 0,
        stroke: "transparent",
        strokeWidth: 1,
      },
      labels: Object.assign({}, { fontSize: 11 }, { padding: 0 }),
    },
    colorScale: [RED, GREEN, "grey"],
    width: "100%",
    height: "100%",

    padding: 0,
  },
};
const WEATHERLIST = [
  { key: "Thunderstorm", icon: "⛈" },
  { key: "Drizzle", icon: "🌧" },
  { key: "Rain", icon: "🌧" },
  { key: "Snow", icon: "❄️" },
  { key: "Clear", icon: "☀️" },
  { key: "Clouds", icon: "🌥" },
];

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
    this.activityData = [
      { key: 1, section: true, label: "Physical Activities" },
    ];
    let activityList = this.props.route.params.userActivityList;
    //console.log("activityList", activityList);
    this.index = 1;
    for (let activity of activityList) {
      this.index++;
      let activityObj = {
        key: this.index,
        label: activity,
      };
      this.activityData.push(activityObj);
    }
    this.monthCalRef = React.createRef();
    this.monthCalRefLast = React.createRef();
    this.monthCalRefNext = React.createRef();
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
    //console.log("this.combineEventListFull",this.combineEventListFull);
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
        } else if (monthNum === currMonth.getMonth() + 2) {
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
    this.detailViewCalendar = [];
    this.preList;
    this.preListLength;
    this.pastPlans = [];
    this.futurePlans = [];
    this.planToday = [];
    this.getPreviousPlanLists();

    this.isPlannedToday = false;
    this.isPlannedDate = new Date();

    this.normalViewModalStartDate = new Date();
    this.isNoEventDayReportModalVis = false;
    this.btnName = "Next";
    this.nextBtnState = "next";
    this.reportPopUp(this.userPlans);
    this.getUnfinishedReport();

    this.totalRecords = 0;
    this.completedRecords = 0;
    this.uncompletedRecords = 0;
    this.weekDayList = [];
    this.weatherCollectionList = [];
    this.activityCollectionList = [];
    this.perceptionCollectionList = [];
    this.timingCollectionList = [];

    this.processRecords(this.userPlans);
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
      isOtherActivity: false,

      isFirstStepVis: "flex",
      isSecondYesStepVis: "none",
      isThirdYesStepVis: "none",

      isSecondNoStepVis: "none",
      isThirdNoStepVis: "none",
      isBackBtnVis: true,

      datePickerDate: new Date(),

      //Update Report Modal Button
      isButtonFirstStage: true,
      btnName: this.btnName,
      nextBtnState: this.nextBtnState,
      submitBtnState: true,
      reason: "",
      feeling: "Neutral",
      otherActivity: "",

      monthCalCurrDate: new Date(),
      isMonthPreBtnAble: true,
      isMonthNextBtnAble: true,
      monthCalCurrentMonth: new Date().getMonth(),

      weatherThisMonth: this.thisMonthWeather,

      isEventDetailModalVis: false,
      isNormalModalVis: false,
      isPlanAbleModalVis: false,

      detailViewTemp: "",
      detailViewIcon: "",
      weatherText: "",

      detailViewTop: "",

      slideUpDayNum: "",
      isPlannedEventModalVis: false,
      isWeatherVisOnPanel: "none",

      eventFilteredList: false,
      timeFilteredList: false,

      activityPickerInitVal: "none",

      detailViewCalendar: this.detailViewCalendar,
      normalViewModalStartDate: this.normalViewModalStartDate,
      isViewEventsDisable: true,
      tempList: [],

      isNoEventDayReportModalVis: this.isNoEventDayReportModalVis,

      activityData: this.activityData,
      userDefinedActivityText: "",

      noEventDayReportDate: new Date(),

      isPlannedToday: this.isPlannedToday,
      isPlannedDate: this.isPlannedDate,

      totalRecords: this.totalRecords,
      completedRecords: this.completedRecords,
      uncompletedRecords: this.uncompletedRecords,
      weekDayList: this.weekDayList,
      weatherCollectionList: this.weatherCollectionList,
      activityCollectionList: this.activityCollectionList,
      perceptionCollectionList: this.perceptionCollectionList,
      timingCollectionList: this.timingCollectionList,

      preList: this.preList,
      preListLength: this.preListLength,

      pastPlans: this.pastPlans,
      futurePlans: this.futurePlans,
      todayPlan: this.planToday,

      isLoaderVis: false,
      appState: AppState.currentState,

      isActivityTypeSelected: false,
      isTimeSelected: false,
    };
    //console.log("weatherThisMonth",this.state.weatherThisMonth);
  }
  getPreviousPlanLists = () => {
    this.planToday = [];
    this.pastPlans = [];
    let todayDate = new Date();
    for (let event of this.userPlans) {
      if (event.title && !event.isDeleted) {
        let eventDate = new Date(event.start);
        if (!event.isReported) {
          if (
            eventDate.getMonth() === todayDate.getMonth() &&
            eventDate.getDate() === todayDate.getDate()
          ) {
            if (
              !this.planToday.includes(event) &&
              !this.planToday.some((e) => e.timeStamp === event.timeStamp)
            ) {
              this.planToday.push(event);
            }
          } else {
            if (todayDate >= eventDate) {
              if (
                !this.pastPlans.includes(event) &&
                !this.pastPlans.some((e) => e.timeStamp === event.timeStamp)
              ) {
                this.pastPlans.push(event);
              }
            } else {
              if (
                !this.futurePlans.includes(event) &&
                !this.futurePlans.some((e) => e.timeStamp === event.timeStamp)
              ) {
                this.futurePlans.push(event);
              }
            }
          }
        }
      }
    }
  };
  componentDidMount = async () => {
    AppState.addEventListener("change", this._handleAppStateChange);
    this.dataModel = getDataModel();
    await this.dataModel.asyncInit();
    this.focusUnsubscribe = this.props.navigation.addListener(
      "focus",
      this.onFocus
    );
    //
  };
  componentWillUnmount = () => {
    AppState.removeEventListener("change", this._handleAppStateChange);
  };
  _handleAppStateChange = async (nextAppState) => {
    if (
      (this.state.appState === "inactive" ||
        this.state.appState === "background") &&
      nextAppState === "active"
    ) {
      console.log("App has come to the foreground!");
      this.setState({ isLoaderVis: true });
      this.dataModel = getDataModel();
      await this.dataModel.asyncInit();

      await this.dataModel.loadUserPlans(this.userKey);
      this.userPlans = this.dataModel.getUserPlans();
      //this.processRecords(this.userPlans);
      this.getUnfinishedReport();
      this.setState({ isLoaderVis: false });
      this.reportPopUp(this.userPlans);
    }
    this.setState({ appState: nextAppState });

    //setAppStateVisible(appState.current);
    //console.log("AppState", appState.current);
  };
  onFocus = async () => {
    console.log("onFocus");
    if (this.props.route.params.needsUpdate) {
      this.setState({ isLoaderVis: true });
      this.dataModel = getDataModel();
      await this.dataModel.asyncInit();

      await this.dataModel.loadUserPlans(this.userKey);
      this.userPlans = this.dataModel.getUserPlans();

      this.processRecords(this.userPlans);
      this.getUnfinishedReport();
      await this.resetCalendarView();
      this.setState({ isLoaderVis: false });
    }
    this.reportPopUp(this.userPlans);

    if (this.isNoEventDayReportModalVis) {
      this.setState({ isNoEventDayReportModalVis: true });
      this.setState({ btnName: "Submit" });
      this.setState({ nextBtnState: "submit" });
    }
  };
  getUnfinishedReport = () => {
    let preList = [];
    let todayDate = new Date();
    let dailyReport = {};
    //this.dataModel = getDataModel();
    dailyReport.start = moment(todayDate).format().slice(0, 10);
    dailyReport.end = dailyReport.start;
    dailyReport.key = dailyReport.start;
    dailyReport.title = "Daily Report";
    let isReportExist = false;
    for (let event of this.userPlans) {
      if (event.start && !event.isDeleted) {
        if (event.start.slice(0, 10) === dailyReport.start.slice(0, 10)) {
          isReportExist = true;
        }
      }
    }
    if (!isReportExist) {
      //report.date = date;
      preList.push(dailyReport);
    }

    //this.preList.push(dailyReport);
    for (let i = 1; i < 5; i++) {
      let preDate = todayDate.setDate(todayDate.getDate() - 1);
      let report = {};
      let date = moment(preDate).format().slice(0, 10);
      let isReportExist = false;
      for (let event of this.userPlans) {
        if (event.start) {
          if (
            event.start.slice(0, 10) === date.slice(0, 10) &&
            !event.isDeleted
          ) {
            isReportExist = true;
          }
        }
      }
      if (!isReportExist) {
        report.title = "Daily Report";
        report.start = date;
        report.end = report.start;
        report.key = report.start;
        preList.push(report);
      }
    }
    if (this.preList) {
      this.setState({ preList: preList });
      this.setState({ preListLength: preList.length });
    } else {
      this.preList = preList;
      this.preListLength = preList.length;
    }
  };

  processRecords = (userPlanList) => {
    let weekDayList = [];
    let weatherCollectionList = [];
    let activityList = [];
    let activityCollectionList = [];
    let perceptionCollectionList = [
      { key: "Positive", completed: 0, uncompleted: 0 },
      { key: "Neutral", completed: 0, uncompleted: 0 },
      { key: "Negative", completed: 0, uncompleted: 0 },
    ];
    let timingCollectionList = [
      { key: "Before 12pm", completed: 0, uncompleted: 0 },
      { key: "After 12pm", completed: 0, uncompleted: 0 },
    ];
    //let activityCollectionList = [];

    let weekDayNum = 0;
    for (let weekDay of WEEKDAY) {
      let weekDayObj = {
        weekDay: weekDay,
        key: weekDay,
        weekDayNum: weekDayNum,
        completed: 0,
        uncompleted: 0,
      };
      weekDayList.push(weekDayObj);
      weekDayNum++;
    }

    for (let weather of WEATHERLIST) {
      let weatherObj = {
        key: weather.key,
        icon: weather.icon,
        completed: 0,
        uncompleted: 0,
      };
      weatherCollectionList.push(weatherObj);
    }

    let preRecordsList = [];
    for (let event of userPlanList) {
      if (event.title && event.isReported && !event.isDeleted) {
        preRecordsList.push(event);
        let activityName = event.title;
        if (!activityList.includes(activityName)) {
          activityList.push(activityName);
        }
      }
    }
    for (let activity of activityList) {
      let activityObj = {
        key: activity,
        completed: 0,
        uncompleted: 0,
      };
      activityCollectionList.push(activityObj);
    }
    let completedList = [];
    let uncompletedList = [];
    for (let event of preRecordsList) {
      // console.log(event.start);
      // console.log((new Date(event.start)).getDay());
      for (let weekDay of weekDayList) {
        if (new Date(event.start).getDay() === weekDay.weekDayNum) {
          if (event.isActivityCompleted) {
            weekDay.completed++;
          } else {
            weekDay.uncompleted++;
          }
        }
      }
      for (let weather of weatherCollectionList) {
        if (event.weather) {
          if (event.weather === weather.key) {
            if (event.isActivityCompleted) {
              weather.completed++;
            } else {
              weather.uncompleted++;
            }
          }
        }
      }
      for (let activity of activityCollectionList) {
        if (event.title === activity.key) {
          if (event.isActivityCompleted) {
            activity.completed++;
          } else {
            activity.uncompleted++;
          }
        }
      }
      for (let perception of perceptionCollectionList) {
        if (event.feeling && event.feeling != "") {
          if (event.feeling === perception.key) {
            if (event.isActivityCompleted) {
              perception.completed++;
            } else {
              perception.uncompleted++;
            }
          }
        }
      }
      for (let timing of timingCollectionList) {
        if (parseInt(event.start.slice(11, 13)) < 12) {
          if (timing.key === "Before 12pm") {
            if (event.isActivityCompleted) {
              timing.completed++;
            } else {
              timing.uncompleted++;
            }
          }
        } else {
          if (timing.key === "After 12pm") {
            if (event.isActivityCompleted) {
              timing.completed++;
            } else {
              timing.uncompleted++;
            }
          }
        }
      }

      if (event.isActivityCompleted) {
        completedList.push(event);
      } else {
        uncompletedList.push(event);
      }
    }
    // for (let weather of weatherCollectionList) {
    //   if (weather.completed === 0 && weather.uncompleted === 0) {
    //     console.log("weather.key",weather.key);
    //     let index = weatherCollectionList.indexOf(weather);
    //     if (index > -1) {
    //       weatherCollectionList.splice(index, 1);
    //     }
    //   }
    // }
    //console.log("this.weekDayList", weekDayList);
    //console.log("weatherCollectionList", weatherCollectionList);
    //console.log("timingCollectionList", timingCollectionList);

    if (this.weekDayList.length === 0) {
      this.weekDayList = weekDayList;
      //console.log("this.weekDayList",this.weekDayList);
    } else {
      this.setState({ weekDayList: weekDayList });
      //console.log("setState",this.state.weekDayList);
    }

    if (this.weatherCollectionList.length === 0) {
      this.weatherCollectionList = weatherCollectionList;
    } else {
      this.setState({ weatherCollectionList: weatherCollectionList });
    }
    if (this.activityCollectionList.length === 0) {
      this.activityCollectionList = activityCollectionList;
    } else {
      this.setState({ activityCollectionList: activityCollectionList });
    }
    if (this.perceptionCollectionList.length === 0) {
      this.perceptionCollectionList = perceptionCollectionList;
    } else {
      this.setState({ perceptionCollectionList: perceptionCollectionList });
    }
    if (this.timingCollectionList.length === 0) {
      this.timingCollectionList = timingCollectionList;
    } else {
      this.setState({ timingCollectionList: timingCollectionList });
    }

    if (
      this.totalRecords === 0 &&
      this.completedRecords === 0 &&
      this.uncompletedRecords === 0
    ) {
      this.totalRecords = preRecordsList.length;
      this.completedRecords = completedList.length;
      this.uncompletedRecords = uncompletedList.length;
    } else {
      this.setState({ totalRecords: preRecordsList.length });
      this.setState({ completedRecords: completedList.length });
      this.setState({ uncompletedRecords: uncompletedList.length });
    }
  };

  reportPopUp = async (userPlanList) => {
    console.log("report pop up");
    let currentDate = moment(new Date()).format().slice(0, 10);
    let weatherList = [];
    //console.log("userPlanList", userPlanList);
    let isNoEventToday = true;
    for (let event of userPlanList) {
      if (event.end && !event.isDeleted) {
        let eventDate = event.end.slice(0, 10);
        if (eventDate === currentDate) {
          isNoEventToday = false;
        }

        //console.log("reportPopUp",event);
        if (currentDate === eventDate) {
          if (event.isReported == false && event.title) {
            this.isReportModalVis = true;
            //console.log("reportPopUp",event);
            // if (this.state.isReportModalVis) {
            //   await this.setState({ isReportModalVis: true });
            // }
            this.setState({ isReportModalVis: true });
            this.eventToday = event;

            let detailViewCalendar = [];
            for (let event of this.combinedEventListThis) {
              if (
                event.start.slice(0, 10) === this.eventToday.start.slice(0, 10)
              ) {
                detailViewCalendar.push(event);
              }
            }
            this.detailViewCalendar = detailViewCalendar;

            //let normalDate = new Date(todayDate.getFullYear(), monthNum, item);
            this.normalViewModalStartDate = currentDate;

            //let currMonthNum = new Date(this.eventToday.start);
            let currDate = new Date(this.eventToday.start).getDate();
            weatherList = this.thisMonthWeather;

            console.log("currDate", currDate);

            for (let weather of weatherList) {
              if (weather.date === currDate) {
                await this.setState({ detailViewTemp: weather.temp });
                await this.setState({ detailViewIcon: weather.img });
                await this.setState({ weatherText: weather.text });
              }
            }
          }
        }
        if (event.title) {
          if (event.timeStamp.slice(0, 10) === currentDate) {
            this.isPlannedToday = true;
            this.isPlannedDate = event.start.slice(0, 10);
          }
        }
      }
    }
    if (isNoEventToday) {
      this.isNoEventDayReportModalVis = true;
      this.setState({ isNoEventDayReportModalVis: true });
      this.btnName = "Submit";
      this.nextBtnState = "submit";
      this.setState({ btnName: "Submit" });
      this.setState({ nextBtnState: "submit" });
    }
    console.log("this.state.isReportModalVis", this.state.isReportModalVis);
  };
  onPress = (item, monthNum, month) => {
    console.log("item,monthNum,month", item, monthNum, month);
    //console.log("this.userPlans", this.userPlans);
    let isPlanAble = false;
    let isPlanOnThatDay = false;
    //this.reportPopUp(this.userPlans);
    let planDetailList = [];
    for (let plan of this.userPlans) {
      if (plan.end && !plan.isDeleted && plan.title) {
        let plannedMonth = parseInt(plan.end.slice(5, 7));
        let plannedDate = parseInt(plan.end.slice(8, 10));
        if (monthNum + 1 == plannedMonth && item == plannedDate) {
          isPlanOnThatDay = true;
          let planDetail = plan;
          if (
            !planDetailList.includes(planDetail) &&
            !planDetailList.some((e) => e.timeStamp === planDetail.timeStamp)
          ) {
            planDetailList.push(planDetail);
          }
        }
      }
    }
    let todayDate = new Date();
    let normalWeatherList = [];
    let normalEventList = [];
    if (!isPlanOnThatDay) {
      //let noPlanDate = todayDate.getFullYear + "-" +
      if (monthNum < todayDate.getMonth()) {
        //console.log("no plans");

        normalWeatherList = this.lastMonthWeather;
        this.setWeatherByDate(item, normalWeatherList);

        for (let event of this.combineEventListFull) {
          let eventDate = new Date(event.start);
          if (
            eventDate.getMonth() === monthNum &&
            eventDate.getDate() === item
          ) {
            normalEventList.push(event);
          }
        }
        let isDailyReported = this.isDailyReport(todayDate, monthNum, item);

        if (isDailyReported) {
          this.setNormalModal(todayDate, normalEventList, monthNum, item);

          return;
        } else {
          this.setState({
            noEventDayReportDate: new Date(
              todayDate.getFullYear(),
              monthNum,
              item
            ),
          });
          this.setState({ isWeatherVisOnPanel: "none" });
          this.setState({ btnName: "Submit" });
          this.setState({ nextBtnState: "submit" });
          this.setState({ isNoEventDayReportModalVis: true });
          return;
        }
      } else if (monthNum === todayDate.getMonth()) {
        //console.log("no plans");

        normalWeatherList = this.thisMonthWeather;
        this.setWeatherByDate(item, normalWeatherList);
        for (let event of this.combineEventListFull) {
          let eventDate = new Date(event.start);
          if (
            eventDate.getMonth() === monthNum &&
            eventDate.getDate() === item
          ) {
            normalEventList.push(event);
          }
        }
        if (item < todayDate.getDate()) {
          let isDailyReported = this.isDailyReport(todayDate, monthNum, item);
          if (isDailyReported) {
            //console.log("normalEventList", normalEventList);
            this.setNormalModal(todayDate, normalEventList, monthNum, item);

            return;
          } else {
            this.setState({
              noEventDayReportDate: new Date(
                todayDate.getFullYear(),
                monthNum,
                item
              ),
            });
            this.setState({ btnName: "Submit" });
            this.setState({ nextBtnState: "submit" });
            this.setState({ isNoEventDayReportModalVis: true });
            this.setState({ isWeatherVisOnPanel: "none" });
            return;
          }
        } else if (item === todayDate.getDate()) {
          let isDailyReported = false;
          let currentDate = moment(new Date()).format().slice(0, 10);
          for (let record of this.userPlans) {
            if (record.end && record.isDailyReport) {
              let eventDate = record.end.slice(0, 10);
              if (eventDate === currentDate) {
                this.eventToday = record;
                isDailyReported = true;
              }
            }
          }
          if (isDailyReported) {
            // Alert.alert("You already reported", "Activity Type Missing", [
            //   { text: "OK", onPress: () => console.log("OK Pressed") },
            // ]);
            //this.setNormalModal(normalEventList, monthNum, item);

            this.setState({ detailViewCalendar: normalEventList });
            let normalDate = new Date();
            this.setState({ normalViewModalStartDate: normalDate });
            let normalWeekday = normalDate.getDay();
            this.setState({ normalWeekday: normalWeekday });
            this.setState({ isNormalModalVis: true });
            this.setState({ isWeatherVisOnPanel: "none" });
            return;
          } else {
            //set date here
            this.setState({ noEventDayReportDate: new Date() });
            this.setState({ btnName: "Submit" });
            this.setState({ nextBtnState: "submit" });
            this.setState({ isNoEventDayReportModalVis: true });
            this.setState({ isWeatherVisOnPanel: "none" });
            return;
          }
        }
      }
    }

    //console.log("planDetailList[0]",planDetailList[0]);
    //console.log("planDetailList", planDetailList);
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

      let planAbleEventList = [];

      for (let event of this.combineEventListFull) {
        let eventDate = new Date(event.start);
        if (eventDate.getMonth() === monthNum && eventDate.getDate() === item) {
          planAbleEventList.push(event);
        }
      }

      this.setState({ detailViewCalendar: planAbleEventList });

      let normalDate = new Date(todayDate.getFullYear(), monthNum, item);
      this.setState({ normalViewModalStartDate: normalDate });

      let targetDate = new Date(this.state.date.getFullYear(), monthNum, item);
      this.setState({ slideUpDayNum: WEEKDAY[targetDate.getDay()] });
      let slideUpWeatherList = [];

      if (monthNum === this.state.date.getMonth()) {
        slideUpWeatherList = this.thisMonthWeather;
      } else {
        slideUpWeatherList = this.nextMonthWeather;
      }
      this.setWeatherByDate(item, slideUpWeatherList);
      this.setState({ isFromWeekView: false });
      this.setState({ selectedDate: item });
      this.setState({ selectedMonth: monthNum });
      this.setState({ isPlanBtnDisable: false });
      this.setState({ isWeatherVisOnPanel: "flex" });
      this.setState({ isViewEventsDisable: false });
    } else {
      if (!planDetailList[0].isDeleted && planDetailList.length === 1) {
        this.eventToday = planDetailList[0];
        //console.log("this.eventToday", this.eventToday);
        let detailViewCalendar = [];
        for (let event of this.state.eventsThisMonth) {
          if (event.start.slice(0, 10) === this.eventToday.start.slice(0, 10)) {
            detailViewCalendar.push(event);
          }
        }
        this.setState({ detailViewCalendar: detailViewCalendar });
        //console.log("detailViewCalendar", detailViewCalendar);
        let currMonthNum = parseInt(this.eventToday.end.slice(5, 7));
        let currDate = parseInt(this.eventToday.end.slice(8, 10));
        let weatherList = [];
        if (currMonthNum === this.state.date.getMonth() + 1) {
          weatherList = this.thisMonthWeather;
        } else {
          weatherList = this.lastMonthWeather;
        }
        this.setWeatherByDate(currDate, weatherList);
        if (this.eventToday.isReported) {
          //show event detail

          this.setState({ detailViewTop: month + " " + item });
          this.setState({ isWeatherVisOnPanel: "none" });
          this.setState({ isEventDetailModalVis: true });
          //console.log("this.state.thisMonthEvents",this.state.eventsThisMonth);
        } else {
          if (currMonthNum === this.state.date.getMonth() + 1) {
            weatherList = this.thisMonthWeather;
          } else {
            weatherList = this.lastMonthWeather;
          }
          this.setWeatherByDate(currDate, weatherList);

          if (monthNum < this.state.date.getMonth()) {
            let normalDate = new Date(todayDate.getFullYear(), monthNum, item);
            this.setState({ normalViewModalStartDate: normalDate });
            this.setState({ nextBtnState: "next" });
            this.setState({ btnName: "Next" });
            this.setState({ isReportModalVis: true });
            this.setState({ isWeatherVisOnPanel: "none" });
          } else if (monthNum === this.state.date.getMonth()) {
            if (item <= this.state.date.getDate()) {
              this.setReportModal(todayDate, monthNum, item);
            } else {
              this.eventToday = planDetailList[0];
              this.setState({ isPlannedEventModalVis: true });
              this.setState({ isWeatherVisOnPanel: "none" });
            }
            //show planned info
          } else {
            this.eventToday = planDetailList[0];
            this.setState({ isPlannedEventModalVis: true });
            this.setState({ isWeatherVisOnPanel: "none" });
          }
        }
      } else if (planDetailList.length != 1) {
        for (let event of planDetailList) {
          if (event.isDeleted === false) {
            this.eventToday = event;
            let detailViewCalendar = [];
            for (let event of this.state.eventsThisMonth) {
              if (
                event.start.slice(0, 10) === this.eventToday.start.slice(0, 10)
              ) {
                detailViewCalendar.push(event);
              }
            }
            //let currDate = parseInt(this.eventToday.end.slice(8, 10));
            this.setState({ detailViewCalendar: detailViewCalendar });

            let currMonthNum = parseInt(this.eventToday.end.slice(5, 7));

            let currDate = parseInt(this.eventToday.end.slice(8, 10));
            let weatherList = [];
            if (currMonthNum === this.state.date.getMonth() + 1) {
              weatherList = this.thisMonthWeather;
            } else {
              weatherList = this.lastMonthWeather;
            }
            this.setWeatherByDate(currDate, weatherList);
            this.setState({ detailViewTop: month + " " + item });

            if (currMonthNum === this.state.date.getMonth() + 1) {
              weatherList = this.thisMonthWeather;
            } else {
              weatherList = this.lastMonthWeather;
            }
            this.setWeatherByDate(currDate, weatherList);

            if (monthNum < this.state.date.getMonth()) {
              if (!this.eventToday.isReported) {
                this.setReportModal(todayDate, monthNum, item);
              } else {
                this.setState({ isEventDetailModalVis: true });
                this.setState({ isWeatherVisOnPanel: "none" });
              }
            } else if (monthNum === this.state.date.getMonth()) {
              if (item <= this.state.date.getDate()) {
                if (!this.eventToday.isReported) {
                  this.setReportModal(todayDate, monthNum, item);
                } else {
                  this.setState({ isEventDetailModalVis: true });
                  this.setState({ isWeatherVisOnPanel: "none" });
                }
              } else {
                this.setState({ isPlannedEventModalVis: true });
                this.setState({ isWeatherVisOnPanel: "none" });
              }
            }
          }
        }
      }
    }
  };

  setNormalModal = (todayDate, normalEventList, monthNum, item) => {
    this.setState({ detailViewCalendar: normalEventList });
    let normalDate = new Date(todayDate.getFullYear(), monthNum, item);
    this.setState({ normalViewModalStartDate: normalDate });
    let normalWeekday = normalDate.getDay();
    this.setState({ normalWeekday: normalWeekday });

    this.setState({ isNormalModalVis: true });
    this.setState({ isWeatherVisOnPanel: "none" });
  };
  setReportModal = (todayDate, monthNum, item) => {
    let normalDate = new Date(todayDate.getFullYear(), monthNum, item);
    this.setState({ normalViewModalStartDate: normalDate });
    this.setState({ nextBtnState: "next" });
    this.setState({ btnName: "Next" });
    this.setState({ isReportModalVis: true });
    this.setState({ isWeatherVisOnPanel: "none" });
  };
  isDailyReport = (todayDate, monthNum, item) => {
    let isDailyReported = false;
    //this.eventToday = {};
    let currentDate = moment(new Date(todayDate.getFullYear(), monthNum, item))
      .format()
      .slice(0, 10);
    for (let record of this.userPlans) {
      if (record.end && record.isDailyReport) {
        let eventDate = record.end.slice(0, 10);
        if (eventDate === currentDate) {
          this.eventToday = record;
          isDailyReported = true;
        }
      }
    }
    return isDailyReported;
  };

  setWeatherByDate = (date, weatherList) => {
    for (let weather of weatherList) {
      if (weather.date === date) {
        this.setState({ detailViewTemp: weather.temp });
        this.setState({ detailViewIcon: weather.img });
        this.setState({ weatherText: weather.text });
      }
    }
  };

  onPlanBtnPressed = async () => {
    if (!this.state.isActivityTypeSelected) {
      Alert.alert(
        "Missing Activity Type",
        "Please select an exercise",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }]
      );
      return;
    }
    // if (!this.state.isTimeSelected) {
    //   Alert.alert(
    //     "Missing Start time",
    //     "Please select a start time",
    //     [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    //   );
    //   return;
    // }
    if (this.state.isPlannedToday) {
      Alert.alert(
        "You already planned today",
        "You could delete the planned activity on " +
          this.state.isPlannedDate +
          " and start a new one",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }]
      );
      return;
    }
    let item = this.state.selectedDate;
    let month = this.state.selectedMonth + 1;

    let planable = true;
    for (let event of this.userPlans) {
      if (event.title && event.isDeleted === false) {
        let eventDate = new Date(event.start);
        if (
          eventDate.getMonth() === this.state.selectedMonth &&
          eventDate.getDate() === item
        ) {
          console.log("event.title", event);
          planable = false;
        }
      }
    }
    if (!planable) {
      Alert.alert("Can't plan two event on a same day", "Pick another day", [
        {
          text: "OK",
          onPress: () => {
            planable = true;
          },
        },
      ]);
      return;
    }

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

    let startMinutes = moment(this.state.datePickerDate).format("HH:mm:ss");
    let endMinutes = moment(this.state.datePickerDate)
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

    for (let weather of this.thisMonthWeather) {
      if (weather.date === item) {
        newEvent.weather = weather.text;
        newEvent.temp = weather.temp;
      }
    }
    // console.log(this.state.eventsThisMonth);
    if (parseInt(monthNum) === this.state.date.getMonth() + 1) {
      this.combinedEventListThis.push(newEvent);
    } else {
      this.combinedEventListNext.push(newEvent);
    }
    // await this.setState({ eventsThisMonth: this.combinedEventListThis });
    // await this.setState({ eventsThisMonth: this.combinedEventListNext });
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

    newEvent.reportReminderKey =
      await this.dataModel.scheduleReportNotification(newEvent);
    await this.dataModel.createNewPlan(this.userKey, newEvent);
    await this.dataModel.loadUserPlans(this.userKey);
    this.userPlans = this.dataModel.getUserPlans();
    this.setState({
      panelTop: newEvent.title + " planned",
    });
    Alert.alert(
      "Activity Planned",
      newEvent.title +
        " planned at " +
        newEvent.start.slice(11, 16) +
        " on " +
        month +
        "/" +
        item,
      [
        {
          text: "OK",
          onPress: () => this.setState({ activityPickerInitVal: "none" }),
        },
      ]
    );
    this.setState({ isPlannedToday: true });
    this.setState({ isPlannedDate: newEvent.start });
    await this.resetCalendarView();
    this.setState({isActivityTypeSelected: false});
    this.setState({isTimeSelected: false})

    //this.componentWillMount
    // this.monthCalRef.current.reSetEvents(this.state.eventsThisMonth);
  };
  onDeletePressed = async () => {
    //console.log(this.eventToday);

    this.setState({ isPlannedEventModalVis: false });
    this.eventToday.isDeleted = true;

    if (
      this.eventToday.timeStamp.slice(0, 10) ===
      moment(new Date()).format().slice(0, 10)
    ) {
      this.setState({ isPlannedToday: false });
    }

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
    } else if (monthNum === this.state.date.getMonth() + 2) {
      let deleteIndex;
      for (let event of this.combinedEventListNext) {
        if (event.timeStamp === this.eventToday.timeStamp) {
          deleteIndex = this.combinedEventListNext.indexOf(event);
        }
      }
      this.combinedEventListNext.splice(deleteIndex, 1);
      await this.setState({ eventsNextMonth: this.combinedEventListNext });
    }
    await this.dataModel.loadUserPlans(this.userKey);
    this.userPlans = this.dataModel.getUserPlans();
    this.updateView();
  };
  updateView = () => {
    //console.log("this.state.eventsThisMonth", this.state.eventsThisMonth);
    if (!this.state.isFromWeekView) {
      this.monthCalRef.current.processEvents();
      this.monthCalRefLast.current.processEvents();
      this.monthCalRefNext.current.processEvents();

      this.setState({ isMonthCalVis: true });
      this.setState({ indexView: "Month" });
    } else {
      //this.setState({isMonthCalVis:true});
      this.setState({ isMonthCalVis: true });
      this.setState({ indexView: "Week" });
    }
  };

  resetCalendarView = async () => {
    this.setState({ eventFilteredList: false });
    this.setState({ timeFilteredList: false });
    let currentList = [];
    let currentListLast = [];
    // if (this.state.monthCalCurrentMonth === this.state.date.getMonth()) {
    //   currentList = this.combinedEventListThis;
    // } else if (
    //   this.state.monthCalCurrentMonth ===
    //   this.state.date.getMonth() - 1
    // ) {
    currentListLast = this.combinedEventListLast;
    // } else {
    currentList = this.combinedEventListThis;
    //}
    await this.setState({ eventsThisMonth: currentList });
    await this.setState({ eventsLastMonth: currentListLast });

    this.monthCalRef.current.processEvents();
    this.monthCalRefLast.current.processEvents();
    this.monthCalRefNext.current.processEvents();
  };

  resetReport = () => {
    this.setState({ isReportModalVis: false });
    this.setState({ feeling: "Neutral" });
    this.setState({ isActivityCompleted: false });
    this.setState({ isOtherActivity: false });
    this.setState({ isFirstStepVis: "flex" });
    this.setState({ isSecondYesStepVis: "none" });
    this.setState({ isThirdYesStepVis: "none" });
    this.setState({ isSecondNoStepVis: "none" });
    this.setState({ isThirdNoStepVis: "none" });

    this.setState({ nextBtnState: "next" });
    this.setState({ btnName: "Next" });
    this.setState({ isBackBtnVis: true });
    this.setState({ reason: "" });
    this.setState({ otherActivity: "" });
  };

  NoEventSecView = (props) => {
    let userFeeling = props.userFeeling;
    // console.log(props);
    // console.log(userFeeling);
    let feelingIcon = "";
    let activityText = "";
    let conText = "";
    if (!userFeeling) {
    } else {
      if (userFeeling.title) {
      } else {
        conText = "";
        if (userFeeling.feeling) {
          // return <Text>{userFeeling.feeling}</Text>;
          if (userFeeling.feeling === "Positive") {
            feelingIcon = "🙂" + " Positive";
            conText = "and I feel";
          } else if (userFeeling.feeling === "Negative") {
            feelingIcon = "😕" + " Negative";
            conText = "and I feel";
          } else if (userFeeling.feeling === "Neutral") {
            feelingIcon = "😑" + "Neutral";
            conText = "and I feel";
          }
        }
        if (userFeeling.isExerciseToday) {
          activityText = "I did " + userFeeling.otherActivity;
          //activityText = "I did " + "";
        } else {
          activityText = "I didn't do any physical exercise today.";
        }
      }
    }

    return (
      <Text style={{ fontWeight: "bold" }}>
        {activityText}
        {/* {conText} {feelingIcon} */}
      </Text>
    );
  };
  activityFilter = async (item) => {
    //this.setState({ isLoaderVis: true });
    this.selectedActivity = item.label;
    this.isActivitySelected = true;
    let newListByActivity = [];
    let currentList = [];
    let currentListLast = [];
    if (!this.state.timeFilteredList) {
      await this.resetCalendarView();
      // if (
      //   this.state.monthCalCurrentMonth ===
      //   this.state.date.getMonth()
      // ) {
      //   currentList = this.combinedEventListThis;
      // } else if (
      //   this.state.monthCalCurrentMonth ===
      //   this.state.date.getMonth() - 1
      // ) {
      //   currentList = this.combinedEventListLast;
      // } else {
      //   currentList = this.combinedEventListNext;
      // }
      currentList = this.state.eventsThisMonth;
      currentListLast = this.state.eventsLastMonth;
      await this.setState({ eventFilteredList: true });
      await this.setState({ timeFilteredList: false });
    } else {
      currentList = this.state.eventsThisMonth;
      currentListLast = this.state.eventsLastMonth;
      //let tempList = currentList;
      await this.setState({ eventFilteredList: false });
      await this.setState({ timeFilteredList: false });
    }

    // console.log(
    //   "this.state.eventFilteredList",
    //   this.state.eventFilteredList
    // );
    // console.log(
    //   "this.state.timeFilteredList",
    //   this.state.timeFilteredList
    // );

    let eventListDates = [];
    let eventListDatesLast = [];
    for (let event of currentList) {
      let dateNum = String(event.start.slice(8, 10));
      if (!eventListDates.includes(dateNum)) {
        eventListDates.push(dateNum);
      }
    }
    for (let event of currentListLast) {
      let dateNum = String(event.start.slice(8, 10));
      if (!eventListDatesLast.includes(dateNum)) {
        eventListDatesLast.push(dateNum);
      }
    }
    console.log("eventListDatesLast", eventListDatesLast);
    let dayEventsList = [];
    let dayEventsListLast = [];

    for (let dateNum of eventListDates) {
      let dayEventObj = {
        dateNum: parseInt(dateNum),
        dayEvents: [],
        isFiltered: false,
      };
      dayEventsList.push(dayEventObj);
    }

    for (let dateNum of eventListDatesLast) {
      let dayEventObj = {
        dateNum: parseInt(dateNum),
        dayEvents: [],
        isFiltered: false,
      };
      dayEventsListLast.push(dayEventObj);
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

    for (let date of dayEventsListLast) {
      for (let event of currentListLast) {
        let dateNum = parseInt(event.start.slice(8, 10));
        if (dateNum === date.dateNum) {
          let newEvent = event;
          date.dayEvents.push(newEvent);
        }
      }
    }
    console.log("dayEventsListLast", dayEventsListLast);

    let newEventList = [];
    let newEventListLast = [];

    for (let date of dayEventsList) {
      for (let event of date.dayEvents) {
        if (event.title) {
          if (event.title === item.label) {
            date.isFiltered = true;
          }
        }
      }
    }

    for (let date of dayEventsListLast) {
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
    for (let date of dayEventsListLast) {
      if (date.isFiltered) {
        for (let event of date.dayEvents) {
          newEventListLast.push(event);
        }
      }
    }

    //this.setState({tempList:tempList})
    console.log("newEventListLast", newEventListLast);

    await this.setState({ eventsThisMonth: newEventList });
    await this.setState({
      eventsLastMonth: newEventListLast,
    });

    this.monthCalRef.current.processEvents();
    this.monthCalRefLast.current.processEvents();
    this.monthCalRefNext.current.processEvents();
    //this.setState({ isLoaderVis: true });
  };
  dateTimeFilter = async (date) => {
    //let setDate = moment(date);
    console.log("DateTimePicker", date);
    let startHour = moment(date).hour();
    this.setState({ datePickerDate: date });
    let newList = [];
    let newListLast = [];

    if (this.state.eventFilteredList) {
      if (!this.state.timeFilteredList) {
        //await this.resetCalendarView();
        await this.setState({ timeFilteredList: true });
        await this.setState({ eventFilteredList: false });
      } else {
        await this.setState({ timeFilteredList: true });
        await this.setState({ eventFilteredList: true });
      }
    } else {
      await this.resetCalendarView();
      await this.setState({ timeFilteredList: true });
      await this.setState({ eventFilteredList: false });
    }
    console.log("this.state.eventFilteredList", this.state.eventFilteredList);
    console.log("this.state.timeFilteredList", this.state.timeFilteredList);
    this.setState({ date: new Date() });

    if (startHour < 12) {
      for (let event of this.state.eventsThisMonth) {
        if (parseInt(event.start.slice(11, 13)) < 12) {
          newList.push(event);
        }
      }
      for (let event of this.state.eventsLastMonth) {
        if (parseInt(event.start.slice(11, 13)) < 12) {
          newListLast.push(event);
        }
      }
    } else {
      for (let event of this.state.eventsThisMonth) {
        if (parseInt(event.start.slice(11, 13)) > 12) {
          newList.push(event);
        }
      }
      for (let event of this.state.eventsLastMonth) {
        if (parseInt(event.start.slice(11, 13)) > 12) {
          newListLast.push(event);
        }
      }
    }
    await this.setState({ eventsThisMonth: newList });
    await this.setState({ eventsLastMonth: newListLast });

    this.monthCalRef.current.processEvents();
    this.monthCalRefLast.current.processEvents();
    this.monthCalRefNext.current.processEvents();
  };

  render() {
    let calView;
    let planDetailView;
    let feeling = this.eventToday.feeling;
    let feelingEmoji = "";
    let colorCode = "white";
    if (feeling === "Positive") {
      feelingEmoji = " 🙂 Positive";
      colorCode = "#00FF00";
    } else if (feeling === "Negative") {
      feelingEmoji = "😕 Negative";
      colorCode = "#FFBF00";
    } else if (feeling === "Neutral") {
      feelingEmoji = "😑 Neutral";
      colorCode = "#F2F2F2";
    }
    if (this.eventToday.isActivityCompleted) {
      planDetailView = (
        <View
          style={{
            marginTop: 5,
            marginBottom: 5,
            borderRadius: 15,
            flex: 0.15,
            backgroundColor: GREEN,
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: 18,
              margin: 10,
            }}
          >
            I did
            <Text style={{ color: "blue" }}>
              {" " + this.eventToday.title}
            </Text>{" "}
            at
            <Text style={{ color: "#9AFE2E" }}>
              {" " + this.eventToday.start.slice(11, 16)}
            </Text>{" "}
            for 30 minutes
            {/* {"\n"}
            {"\n"}I feel{" "}
            <Text style={{ color: colorCode }}>{feelingEmoji}</Text> */}
          </Text>
        </View>
      );
    } else if (
      !this.eventToday.isActivityCompleted &&
      this.eventToday.isOtherActivity
    ) {
      planDetailView = (
        <View
          style={{
            marginTop: 5,
            marginBottom: 5,
            borderRadius: 15,
            flex: 0.25,
            backgroundColor: "#FFBF00",
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: 18,
              margin: 10,
            }}
          >
            I didn't do
            <Text style={{ color: "blue" }}>
              {" " + this.eventToday.title}
            </Text>{" "}
            as I planned because {this.eventToday.reason}
            {"\n"}I did{" "}
            <Text style={{ color: "blue" }}>
              {this.eventToday.otherActivity}
            </Text>{" "}
            instead
            {/* {"\n"}I feel{" "}
            <Text style={{ color: colorCode }}>{feelingEmoji}</Text> */}
          </Text>
        </View>
      );
    } else if (
      !this.eventToday.isActivityCompleted &&
      !this.eventToday.isOtherActivity
    ) {
      planDetailView = (
        <View
          style={{
            marginTop: 5,
            marginBottom: 5,
            borderRadius: 15,
            flex: 0.2,
            backgroundColor: "#FE642E",
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: 18,
              margin: 10,
            }}
          >
            I didn't
            <Text style={{ color: "blue" }}>
              {" " + this.eventToday.title}
            </Text>{" "}
            at
            <Text style={{ color: "#9AFE2E" }}>
              {" " + this.eventToday.start.slice(11, 16)}
            </Text>{" "}
            because
            <Text style={{ color: "#A9E2F3" }}>
              {" " + this.eventToday.reason}
            </Text>{" "}
            {/* {"\n"}
            {"\n"}I feel{" "}
            <Text style={{ color: colorCode }}>{feelingEmoji}</Text> */}
          </Text>
        </View>
      );
    }

    if (this.state.isMonthCalVis) {
      console.log("this.state.isMonthCalVis", this.state.isMonthCalVis);

      calView = (
        <View>
          <View style={{ flex: 0.3 }}>
            <AnimatedLoader
              visible={this.state.isLoaderVis}
              overlayColor="rgba(255,255,255,0.75)"
              source={require("./assets/loader.json")}
              animationStyle={{ width: 100, height: 100 }}
              speed={1}
            >
              <Text style={{ fontWeight: "bold", textAlign: "center" }}>
                Updating Calendar...
              </Text>
            </AnimatedLoader>
          </View>
          <ScrollView
            style={{ height: "95%", width: "100%" }}
            contentContainerStyle={{ height: "100%", paddingBottom: 0 }}
            contentOffset={{ x: 6, y: 0 }}
            showsHorizontalScrollIndicator={false}
            //contentOffset={{x: this.midViewX ,y:0}}
            horizontal={true}
          >
            <ScrollView
              style={{
                marginLeft: 20,
                marginRight: 20,
                backgroundColor: BACKGROUND_COLOR,
                padding: 10,
                width: 350,
                borderRadius: 15,
              }}
              contentContainerStyle={{ alignItems: "center" }}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={{
                  flex: 0.8,
                  width: "95%",
                  flexDirection: "row",
                  marginBottom: 10,
                }}
              >
                <View style={{ flex: 0.8 }}>
                  <Text style={{ fontSize: 24, fontWeight: "bold" }}>
                    Planning History
                  </Text>
                  <Text
                    style={{ fontSize: 24, fontWeight: "bold", marginTop: 5 }}
                  >
                    <Text style={{ color: GREEN }}>
                      {this.state.completedRecords}
                    </Text>{" "}
                    / {this.state.totalRecords}
                  </Text>
                  <Text
                    style={{ fontSize: 12, fontWeight: "bold", marginTop: 5 }}
                  >
                    By {moment(new Date()).format().slice(0, 10)}, I have{" "}
                    <Text style={{ color: "blue" }}>
                      {this.state.totalRecords}
                    </Text>{" "}
                    physical exercise planned and reported, and I completed{" "}
                    <Text style={{ color: GREEN }}>
                      {this.state.completedRecords}
                    </Text>{" "}
                    of them
                  </Text>
                </View>
                <View
                  style={{
                    flex: 0.2,
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    transform: [{ scale: 1 }],
                    // backgroundColor: "blue",
                  }}
                >
                  <View
                    style={{
                      flex: 0.2,
                      //backgroundColor: RED,
                      width: "100%",
                      marginTop: "50%",
                      transform: [{ scale: 1 }],
                      justifyContent: "flex-start",
                      alignItems: "flex-start",
                    }}
                  >
                    <VictoryPie
                      style={{ labels: { fill: "white" } }}
                      // style={{ flex: 1, marginTop:0 }}
                      innerRadius={10}
                      labelRadius={60}
                      width={50}
                      height={50}
                      //labels={({ datum }) => `# ${datum.y}`}
                      //labelComponent={<CustomLabel />}
                      theme={PIECHART}
                      data={[
                        {
                          x: this.state.uncompletedRecords,
                          y: this.state.uncompletedRecords,
                        },
                        {
                          x: this.state.completedRecords,
                          y: this.state.completedRecords,
                        },
                        {
                          x:
                            this.state.pastPlans.length +
                            this.state.todayPlan.length,
                          y:
                            this.state.pastPlans.length +
                            this.state.todayPlan.length,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
              <View
                style={{
                  flex: 1,
                  width: "95%",
                  height: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "white",
                  borderRadius: 20,
                  borderColor: "black",
                  borderWidth: 1,
                }}
              >
                <View style={{ flex: 0.6, marginLeft: 10 }}>
                  <Text style={{ fontWeight: "bold", fontSize: 10 }}>
                    I have{" "}
                    <Text style={{ color: RED }}>
                      {this.state.preListLength +
                        +this.state.pastPlans.length +
                        this.state.todayPlan.length}{" "}
                    </Text>
                    uncompleted daily reports
                  </Text>
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: "black",
                    color: "white",
                    flex: 0.4,
                    height: 25,
                    margin: 2,
                    borderRadius: 30,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  // disabled={this.state.isDailyReportBtnDisabled}
                  disabled={false}
                  onPress={
                    () => {
                      this.props.navigation.navigate("ReportCollection", {
                        userKey: this.userKey,
                        userPlans: this.userPlans,
                        planToday: this.state.todayPlan,
                        pastPlans: this.state.pastPlans,
                      });
                    }
                    // this.setState({ isNoEventDayReportModalVis: true })
                  }
                >
                  <Text
                    style={{ color: "white", fontWeight: "bold", fontSize: 10 }}
                  >
                    Complete
                  </Text>
                </TouchableOpacity>
              </View>

              {/* <View
                style={{
                  flex: 0.8,
                  width: "95%",
                  marginTop: 5,
                  flexDirection: "column",
                  // backgroundColor:RED
                }}
              >
                <Text
                  style={{
                    flex: 0.2,
                    fontWeight: "bold",
                    marginLeft: 10,
                    marginBottom: 10,
                  }}
                >
                  by Weekday
                </Text>
                <View
                  style={{
                    flex: 0.8,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "white",
                    borderRadius: 10,
                    width: "100%",
                    padding: 10,
                  }}
                >
                  <FlatList
                    horizontal={true}
                    contentContainerStyle={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",

                      // backgroundColor:RED
                    }}
                    data={this.state.weekDayList}
                    renderItem={({ item }) => (
                      <View>
                        <Text
                          style={{
                            flex: 0.2,
                            fontWeight: "bold",
                            textAlign: "center",
                            fontSize: 10,
                          }}
                        >
                          {item.weekDay}
                        </Text>
                        <View
                          style={{
                            flex: 0.8,
                            width: "100%",
                            alignItems: "center",
                            justifyContent: "center",
                            //backgroundColor:RED
                          }}
                        >
                          <VictoryPie
                            style={{ labels: { fill: "white" } }}
                            // style={{ flex: 1, marginTop:0 }}
                            innerRadius={10}
                            labelRadius={60}
                            width={40}
                            height={40}
                            labels={({ datum }) => `# ${datum.y}`}
                            //labelComponent={<CustomLabel />}
                            theme={{
                              pie: {
                                style: {
                                  data: {
                                    padding: 0,
                                    stroke: "transparent",
                                    strokeWidth: 1,
                                  },
                                  labels: Object.assign(
                                    {},
                                    { fontSize: 11 },
                                    { padding: 0 }
                                  ),
                                },
                                colorScale: [GREEN, RED],
                                width: "100%",
                                height: "100%",

                                padding: 0,
                              },
                            }}
                            data={[
                              {
                                x: item.completed,
                                y: item.completed,
                              },
                              {
                                x: item.uncompleted,
                                y: item.uncompleted,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    )}
                  />
                </View>
              </View> */}
              {/* <View
                style={{
                  flex: 0.8,
                  width: "95%",
                  marginTop: 5,
                  flexDirection: "column",
                  // backgroundColor:RED
                }}
              >
                <Text
                  style={{
                    flex: 0.2,
                    fontWeight: "bold",
                    marginLeft: 10,
                    marginBottom: 10,
                  }}
                >
                  by Weather
                </Text>
                <View
                  style={{
                    flex: 0.8,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "white",
                    borderRadius: 10,
                    width: "100%",
                    padding: 10,
                  }}
                >
                  <FlatList
                    horizontal={true}
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "space-between",

                      // backgroundColor:RED
                    }}
                    data={this.state.weatherCollectionList}
                    renderItem={({ item }) => (
                      <View>
                        <Text
                          style={{
                            flex: 0.2,
                            fontWeight: "bold",
                            textAlign: "center",
                            fontSize: 10,
                            marginBottom: 2,
                          }}
                        >
                          {item.key}
                          {"\n"} {item.icon}
                        </Text>
                        <View
                          style={{
                            flex: 0.8,
                            width: "100%",
                            alignItems: "center",
                            justifyContent: "center",
                            //backgroundColor:RED
                          }}
                        >
                          <VictoryPie
                            style={{ labels: { fill: "white" } }}
                            // style={{ flex: 1, marginTop:0 }}
                            innerRadius={10}
                            labelRadius={60}
                            width={40}
                            height={40}
                            labels={({ datum }) => `# ${datum.y}`}
                            //labelComponent={<CustomLabel />}
                            theme={{
                              pie: {
                                style: {
                                  data: {
                                    padding: 0,
                                    stroke: "transparent",
                                    strokeWidth: 1,
                                  },
                                  labels: Object.assign(
                                    {},
                                    { fontSize: 11 },
                                    { padding: 0 }
                                  ),
                                },
                                colorScale: [GREEN, RED],
                                width: "100%",
                                height: "100%",

                                padding: 0,
                              },
                            }}
                            data={[
                              {
                                x: item.completed,
                                y: item.completed,
                              },
                              {
                                x: item.uncompleted,
                                y: item.uncompleted,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    )}
                  />
                </View>
              </View> */}
              <View
                style={{
                  flex: 0.8,
                  width: "95%",
                  marginTop: 5,
                  flexDirection: "column",
                  // backgroundColor:RED
                }}
              >
                <Text
                  style={{
                    flex: 0.2,
                    fontWeight: "bold",
                    marginLeft: 10,
                    marginBottom: 10,
                  }}
                >
                  by Weather
                </Text>
                <View
                  style={{
                    flex: 0.8,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "white",
                    borderColor: "black",
                    borderWidth: 1,
                    borderRadius: 10,
                    width: "100%",
                    padding: 10,
                  }}
                >
                  <VictoryChart
                    theme={victoryTheme}
                    labels={({ datum }) => datum.y}
                    height={100}
                    width={300}
                    // style={{parent:{maxWidth:"100%", maxHeight:"100%"}}}
                    // style={{axis:{stroke: "transparent"}}}
                  >
                    <VictoryGroup
                      offset={10}
                      style={{ data: { width: 10 } }}
                      colorScale={[GREEN, RED]}
                    >
                      <VictoryBar
                        labels={({ datum }) => datum.y}
                        data={[
                          {
                            x: "Thunder",
                            y: this.state.weatherCollectionList[0].completed,
                          },
                          {
                            x: "Drizzle",
                            y: this.state.weatherCollectionList[1].completed,
                          },
                          {
                            x: "Rain",
                            y: this.state.weatherCollectionList[2].completed,
                          },
                          {
                            x: "Show",
                            y: this.state.weatherCollectionList[3].completed,
                          },
                          {
                            x: "Clear",
                            y: this.state.weatherCollectionList[4].completed,
                          },
                          {
                            x: "Clouds",
                            y: this.state.weatherCollectionList[5].completed,
                          },
                        ]}
                      />
                      <VictoryBar
                        labels={({ datum }) => datum.y}
                        data={[
                          {
                            x: "Thunder",
                            y: this.state.weatherCollectionList[0].uncompleted,
                          },
                          {
                            x: "Drizzle",
                            y: this.state.weatherCollectionList[1].uncompleted,
                          },
                          {
                            x: "Rain",
                            y: this.state.weatherCollectionList[2].uncompleted,
                          },
                          {
                            x: "Show",
                            y: this.state.weatherCollectionList[3].uncompleted,
                          },
                          {
                            x: "Clear",
                            y: this.state.weatherCollectionList[4].uncompleted,
                          },
                          {
                            x: "Clouds",
                            y: this.state.weatherCollectionList[5].uncompleted,
                          },
                        ]}
                      />
                    </VictoryGroup>
                  </VictoryChart>
                </View>
              </View>
              <View
                style={{
                  flex: 0.8,
                  width: "95%",
                  marginTop: 5,
                  flexDirection: "column",
                  // backgroundColor:RED
                }}
              >
                <Text
                  style={{
                    flex: 0.2,
                    fontWeight: "bold",
                    marginLeft: 10,
                    marginBottom: 10,
                  }}
                >
                  by Activity Type
                </Text>
                <View
                  style={{
                    flex: 0.8,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "white",
                    borderColor: "black",
                    borderWidth: 1,
                    borderRadius: 10,
                    width: "100%",
                    padding: 5,
                  }}
                >
                  <FlatList
                    showsHorizontalScrollIndicator={false}
                    horizontal={true}
                    contentContainerStyle={{
                      flexDirection: "row",
                      justifyContent: "space-between",

                      // backgroundColor:RED
                    }}
                    data={this.state.activityCollectionList}
                    renderItem={({ item }) => (
                      <View>
                        <Text
                          style={{
                            flex: 0.2,
                            fontWeight: "bold",
                            textAlign: "center",
                            fontSize: 10,
                            marginBottom: 2,
                          }}
                        >
                          {item.key}
                        </Text>
                        <View
                          style={{
                            flex: 0.8,
                            width: "100%",
                            height: "100%",
                            alignItems: "center",
                            justifyContent: "center",
                            //backgroundColor:RED
                          }}
                        >
                          <VictoryChart
                            domain={{ y: [0.5, 10.5] }}
                            theme={victoryThemeActivity}
                            labels={({ datum }) => datum.y}
                            height={100}
                            width={50}
                            // style={{parent:{maxWidth:"100%", maxHeight:"100%"}}}
                            // style={{axis:{stroke: "transparent"}}}
                          >
                            <VictoryGroup
                              offset={10}
                              style={{ data: { width: 10 } }}
                              colorScale={[GREEN, RED]}
                            >
                              <VictoryBar
                                labels={({ datum }) => datum.y}
                                data={[
                                  {
                                    x: "Completed",
                                    y: item.completed,
                                  },
                                ]}
                              />
                              <VictoryBar
                                labels={({ datum }) => datum.y}
                                data={[
                                  {
                                    x: "Uncompleted",
                                    y: item.uncompleted,
                                  },
                                ]}
                              />
                            </VictoryGroup>
                          </VictoryChart>
                          {/* <VictoryPie
                            style={{ labels: { fill: "white" } }}
                            // style={{ flex: 1, marginTop:0 }}
                            innerRadius={10}
                            labelRadius={60}
                            width={40}
                            height={40}
                            labels={({ datum }) => `# ${datum.y}`}
                            //labelComponent={<CustomLabel />}
                            theme={{
                              pie: {
                                style: {
                                  data: {
                                    padding: 0,
                                    stroke: "transparent",
                                    strokeWidth: 1,
                                  },
                                  labels: Object.assign(
                                    {},
                                    { fontSize: 11 },
                                    { padding: 0 }
                                  ),
                                },
                                colorScale: [GREEN, RED],
                                width: "100%",
                                height: "100%",

                                padding: 0,
                              },
                            }}
                            data={[
                              {
                                x: item.completed,
                                y: item.completed,
                              },
                              {
                                x: item.uncompleted,
                                y: item.uncompleted,
                              },
                            ]}
                          /> */}
                        </View>
                      </View>
                    )}
                  />
                </View>
              </View>
              <View
                style={{
                  flex: 0.8,
                  width: "95%",
                  marginTop: 5,
                  flexDirection: "column",
                  // backgroundColor:RED
                }}
              >
                <Text
                  style={{
                    flex: 0.2,
                    fontWeight: "bold",
                    marginLeft: 10,
                    marginBottom: 10,
                  }}
                >
                  by Weekday
                </Text>
                <View
                  style={{
                    flex: 0.8,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    borderColor: "black",
                    borderWidth: 1,
                    alignItems: "center",
                    backgroundColor: "white",
                    borderRadius: 10,
                    width: "100%",
                    padding: 10,
                  }}
                >
                  <VictoryChart
                    theme={victoryTheme}
                    labels={({ datum }) => datum.y}
                    height={100}
                    width={300}
                    // style={{parent:{maxWidth:"100%", maxHeight:"100%"}}}
                    // style={{axis:{stroke: "transparent"}}}
                  >
                    <VictoryGroup
                      offset={10}
                      style={{ data: { width: 10 } }}
                      colorScale={[GREEN, RED]}
                    >
                      <VictoryBar
                        labels={({ datum }) => datum.y}
                        data={[
                          { x: "Sun", y: this.state.weekDayList[0].completed },
                          { x: "Mon", y: this.state.weekDayList[1].completed },
                          { x: "Tue", y: this.state.weekDayList[2].completed },
                          { x: "Wed", y: this.state.weekDayList[3].completed },
                          { x: "Thu", y: this.state.weekDayList[4].completed },
                          { x: "Fri", y: this.state.weekDayList[5].completed },
                          { x: "Sat", y: this.state.weekDayList[6].completed },
                        ]}
                      />
                      <VictoryBar
                        labels={({ datum }) => datum.y}
                        data={[
                          {
                            x: "Sun",
                            y: this.state.weekDayList[0].uncompleted,
                          },
                          {
                            x: "Mon",
                            y: this.state.weekDayList[1].uncompleted,
                          },
                          {
                            x: "Tue",
                            y: this.state.weekDayList[2].uncompleted,
                          },
                          {
                            x: "Wed",
                            y: this.state.weekDayList[3].uncompleted,
                          },
                          {
                            x: "Thu",
                            y: this.state.weekDayList[4].uncompleted,
                          },
                          {
                            x: "Fri",
                            y: this.state.weekDayList[5].uncompleted,
                          },
                          {
                            x: "Sat",
                            y: this.state.weekDayList[6].uncompleted,
                          },
                        ]}
                      />
                    </VictoryGroup>
                  </VictoryChart>
                </View>
              </View>
              <View
                style={{
                  flex: 0.8,
                  width: "95%",
                  marginTop: 5,
                  flexDirection: "column",
                  // backgroundColor:RED
                }}
              >
                <Text
                  style={{
                    flex: 0.2,
                    fontWeight: "bold",
                    marginLeft: 10,
                    marginBottom: 10,
                  }}
                >
                  by Timing
                </Text>
                <View
                  style={{
                    flex: 0.8,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "white",
                    borderColor: "black",
                    borderWidth: 1,
                    borderRadius: 10,
                    width: "100%",
                    padding: 10,
                  }}
                >
                  <VictoryChart
                    theme={victoryTheme}
                    labels={({ datum }) => datum.y}
                    height={100}
                    width={150}
                    // style={{parent:{maxWidth:"100%", maxHeight:"100%"}}}
                    // style={{axis:{stroke: "transparent"}}}
                  >
                    <VictoryGroup
                      offset={10}
                      style={{ data: { width: 10 } }}
                      colorScale={[GREEN, RED]}
                    >
                      <VictoryBar
                        labels={({ datum }) => datum.y}
                        data={[
                          {
                            x: "Before 12pm",
                            y: this.state.timingCollectionList[0].completed,
                          },
                          {
                            x: "After 12pm",
                            y: this.state.timingCollectionList[1].completed,
                          },
                        ]}
                      />
                      <VictoryBar
                        labels={({ datum }) => datum.y}
                        data={[
                          {
                            x: "Before 12pm",
                            y: this.state.timingCollectionList[0].uncompleted,
                          },
                          {
                            x: "After 12pm",
                            y: this.state.timingCollectionList[1].uncompleted,
                          },
                        ]}
                      />
                    </VictoryGroup>
                  </VictoryChart>
                </View>
              </View>
              {/* <View
                style={{
                  flex: 0.8,
                  width: "95%",
                  marginTop: 5,
                  flexDirection: "column",
                  // backgroundColor:RED
                }}
              >
                <Text
                  style={{
                    flex: 0.2,
                    fontWeight: "bold",
                    marginLeft: 10,
                    marginBottom: 10,
                  }}
                >
                  by Perception
                </Text>
                <View
                  style={{
                    flex: 0.8,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "white",
                    borderRadius: 10,
                    width: "100%",
                    padding: 10,
                  }}
                >
                  <FlatList
                    horizontal={true}
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                      flexDirection: "row",
                      flex: 1,
                      justifyContent: "space-between",
                      //width: "100%",

                      // backgroundColor:RED
                    }}
                    data={this.state.perceptionCollectionList}
                    renderItem={({ item }) => (
                      <View>
                        <Text
                          style={{
                            flex: 0.2,
                            fontWeight: "bold",
                            textAlign: "center",
                            fontSize: 10,
                            marginBottom: 2,
                          }}
                        >
                          {item.key}
                        </Text>
                        <View
                          style={{
                            flex: 0.8,
                            width: "100%",
                            alignItems: "center",
                            justifyContent: "center",
                            //backgroundColor:RED
                          }}
                        >
                          <VictoryPie
                            style={{ labels: { fill: "white" } }}
                            // style={{ flex: 1, marginTop:0 }}
                            innerRadius={10}
                            labelRadius={60}
                            width={40}
                            height={40}
                            labels={({ datum }) => `# ${datum.y}`}
                            //labelComponent={<CustomLabel />}
                            theme={{
                              pie: {
                                style: {
                                  data: {
                                    padding: 0,
                                    stroke: "transparent",
                                    strokeWidth: 1,
                                  },
                                  labels: Object.assign(
                                    {},
                                    { fontSize: 11 },
                                    { padding: 0 }
                                  ),
                                },
                                colorScale: [GREEN, RED],
                                width: "100%",
                                height: "100%",

                                padding: 0,
                              },
                            }}
                            data={[
                              {
                                x: item.completed,
                                y: item.completed,
                              },
                              {
                                x: item.uncompleted,
                                y: item.uncompleted,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    )}
                  />
                </View>
              </View> */}
              {/* <View
                style={{
                  flex: 0.8,
                  width: "95%",
                  marginTop: 5,
                  flexDirection: "column",
                  // backgroundColor:RED
                }}
              >
                <Text
                  style={{
                    flex: 0.2,
                    fontWeight: "bold",
                    marginLeft: 10,
                    marginBottom: 10,
                  }}
                >
                  by Timing
                </Text>
                <View
                  style={{
                    flex: 0.8,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "white",
                    borderRadius: 10,
                    width: "100%",
                    padding: 10,
                  }}
                >
                  <FlatList
                    horizontal={true}
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                      flexDirection: "row",
                      flex: 1,
                      justifyContent: "space-between",
                      //width: "100%",

                      // backgroundColor:RED
                    }}
                    data={this.state.timingCollectionList}
                    renderItem={({ item }) => (
                      <View>
                        <Text
                          style={{
                            flex: 0.2,
                            fontWeight: "bold",
                            textAlign: "center",
                            fontSize: 10,
                            marginBottom: 2,
                          }}
                        >
                          {item.key}
                        </Text>
                        <View
                          style={{
                            flex: 0.8,
                            width: "100%",
                            alignItems: "center",
                            justifyContent: "center",
                            //backgroundColor:RED
                          }}
                        >
                          <VictoryPie
                            style={{ labels: { fill: "white" } }}
                            // style={{ flex: 1, marginTop:0 }}
                            innerRadius={10}
                            labelRadius={60}
                            width={40}
                            height={40}
                            labels={({ datum }) => `# ${datum.y}`}
                            //labelComponent={<CustomLabel />}
                            theme={{
                              pie: {
                                style: {
                                  data: {
                                    padding: 0,
                                    stroke: "transparent",
                                    strokeWidth: 1,
                                  },
                                  labels: Object.assign(
                                    {},
                                    { fontSize: 11 },
                                    { padding: 0 }
                                  ),
                                },
                                colorScale: [GREEN, RED],
                                width: "100%",
                                height: "100%",

                                padding: 0,
                              },
                            }}
                            data={[
                              {
                                x: item.completed,
                                y: item.completed,
                              },
                              {
                                x: item.uncompleted,
                                y: item.uncompleted,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    )}
                  />
                </View>
              </View> */}
            </ScrollView>
            <View
              style={{
                marginLeft: 20,
                marginRight: 20,
                backgroundColor: BACKGROUND_COLOR,
                padding: 10,
                borderRadius: 15,
              }}
            >
              <MonthCalendar
                ref={this.monthCalRefLast}
                thisMonthEvents={this.state.eventsLastMonth}
                monthCalCurrDate={
                  new Date(
                    this.state.date.getFullYear(),
                    this.state.date.getMonth() - 1,
                    15
                  )
                }
                weatherThisMonth={this.lastMonthWeather}
                onPress={(item, monthNum, month) =>
                  this.onPress(item, monthNum, month)
                }
              />
            </View>
            <View
              style={{
                marginLeft: 20,
                marginRight: 20,
                backgroundColor: "white",
                borderColor: "black",
                borderWidth: 2,
                padding: 10,
                borderRadius: 15,
              }}
            >
              <MonthCalendar
                ref={this.monthCalRef}
                thisMonthEvents={this.state.eventsThisMonth}
                monthCalCurrDate={this.state.monthCalCurrDate}
                weatherThisMonth={this.state.weatherThisMonth}
                onPress={(item, monthNum, month) =>
                  this.onPress(item, monthNum, month)
                }
              />
            </View>
            <View
              style={{
                marginLeft: 20,
                marginRight: 20,
                backgroundColor: BACKGROUND_COLOR,
                padding: 10,
                borderRadius: 15,
              }}
            >
              <MonthCalendar
                ref={this.monthCalRefNext}
                thisMonthEvents={this.state.eventsNextMonth}
                monthCalCurrDate={
                  new Date(
                    this.state.date.getFullYear(),
                    this.state.date.getMonth() + 1,
                    15
                  )
                }
                weatherThisMonth={this.nextMonthWeather}
                onPress={(item, monthNum, month) =>
                  this.onPress(item, monthNum, month)
                }
              />
            </View>
          </ScrollView>
          {/* <TouchableOpacity
            style={{
              flex: 1,
              position: "absolute",
              top: 25,
              right: 90,
              justifyContent: "center",
              alignItems: "center",
            }}
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
            <AntDesign name="leftcircle" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              position: "absolute",
              top: 25,
              right: 30,
              justifyContent: "center",
              alignItems: "center",
            }}
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
            <AntDesign name="rightcircle" size={24} color="black" />
          </TouchableOpacity> */}
        </View>
      );
    }
    // else {
    //   console.log("render week cal");
    //   //console.log("this state", this.state.eventsThisMonth);
    //   calView = (
    //     <View
    //       style={
    //         ({ backgroundColor: RED, justifyContent: "flex-start" },
    //         [{ transform: [{ scaleY: 1 }] }])
    //       }
    //     >
    //       <Calendar
    //         // events={[{ title: "test", start: new Date(), end: new Date() }]}
    //         refs={this.weekCalRef}
    //         contentContainerStyle={{ justifyContent: "flex-start" }}
    //         events={this.state.fullEventList}
    //         eventCellStyle={(event) => {
    //           if (event.color) {
    //             return { backgroundColor: event.color, borderWidth: 2 };
    //           } else {
    //             return { backgroundColor: "grey" };
    //           }
    //         }}
    //         height={750}
    //         scrollOffsetMinutes={480}
    //         showTime={false}
    //         mode="week"
    //         showTime={true}
    //         swipeEnabled={true}
    //         onPressCell={() => alert("cell pressed")}
    //         onPressDateHeader={(date) => {
    //           let selectedDate = parseInt(date.toString().slice(8, 10));
    //           //console.log(selectedDate);
    //           this.setState({ selectedDate: selectedDate });

    //           let monthNum = moment(date).month();
    //           this.setState({ selectedMonth: monthNum });
    //           let month = this.months[monthNum];

    //           this.setState({
    //             panelTop: "plan for " + month + " " + selectedDate,
    //           });
    //           this._panel.show();

    //           this.setState({ isPlanBtnDisable: false });
    //           this.setState({ isFromWeekView: true });
    //         }}
    //         onPressEvent={() => alert("event pressed")}
    //       />
    //     </View>
    //   );
    // }

    return (
      <View
        style={{
          alignContent: "center",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* <View style={{backgroundColor:RED}}>
        <Button
          title="Get permissions"
          onPress={this.dataModel.askPermission}
        ></Button>
        <Button
          title="Push a notification in 5s"
          onPress={this.dataModel.scheduleNotification}
        ></Button>
        </View> */}

        {/* // Plan report */}
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
              //backgroundColor:RED,
            }}
          >
            <View
              style={{
                flex: 0.6,
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
              <View
                style={{
                  flex: 0.05,
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                }}
              >
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      // this.setState({ isReportModalVis: false });
                      // this.setState({ feeling: "Neutral" });
                      // this.setState({ isActivityCompleted: false });
                      // this.setState({ isOtherActivity: false });
                      // this.setState({ isFirstStepVis: "flex" });
                      // this.setState({ isSecondYesStepVis: "none" });
                      // this.setState({ isThirdYesStepVis: "none" });
                      // this.setState({ isSecondNoStepVis: "none" });
                      // this.setState({ isThirdNoStepVis: "none" });
                      // this.setState({ nextBtnState: "next" });
                      // this.setState({ otherActivity: "" });
                      this.resetReport();
                    }}
                  >
                    <MaterialIcons name="cancel" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              </View>
              <View
                style={{
                  flex: 0.2,
                  width: "80%",
                  marginTop: 0,
                  //backgroundColor:RED
                }}
              >
                <Text style={{ fontSize: 24, fontWeight: "bold" }}>
                  Physical Exercise Report
                </Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "bold", marginTop: 5 }}
                >
                  The following questions only take seconds to complete
                </Text>
              </View>

              <View
                style={{
                  flex: 0.8,
                  width: "80%",
                  //backgroundColor: RED,
                  flexDirection: "row",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <View
                  style={{
                    display: this.state.isFirstStepVis,
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginTop: "20%",
                      marginBottom: "10%",
                    }}
                  >
                    You planned {this.eventToday.title} on{" "}
                    {this.eventToday.start.slice(5, 10)} at{" "}
                    {this.eventToday.start.slice(11, 16)} for 30 min, did you
                    follow your plan?
                    {"\n"}
                    {"\n"}
                    (also answer "yes" if you did it at a different time)
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
                <View
                  style={{
                    display: this.state.isSecondYesStepVis,
                    justifyContent: "flex-start",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%",
                    height: "40%",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginTop: "20%",
                    }}
                  >
                    {/* Did you {this.eventToday.title} for 30 min at{" "}
                    {this.eventToday.start.slice(11, 16)} */}
                    Did you engage yourself in any other physical exercise?
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
                        this.setState({ isOtherActivity: value });
                        if (value) {
                          this.setState({ btnName: "Next" });
                          this.setState({ nextBtnState: "next3no" });
                        } else {
                          this.setState({ btnName: "Submit" });
                          this.setState({ nextBtnState: "submit" });
                        }
                      }
                    }
                  />
                </View>
                <View
                  style={{
                    display: this.state.isThirdYesStepVis,
                    justifyContent: "flex-start",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%",
                    height: "40%",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginTop: "20%",
                    }}
                  >
                    {this.state.isActivityCompleted
                      ? "How satisfied are you with what you've experienced as a result of " +
                        this.eventToday.title +
                        " on " +
                        this.eventToday.start.slice(5, 10) +
                        "?"
                      : "How satisfied are you with what you've experienced as a result of " +
                        this.state.otherActivity +
                        "?"}
                  </Text>
                  <SwitchSelector
                    options={[
                      { label: "Unsatisfied", value: "Unsatisfied" },
                      { label: "Neutral", value: "Neutral" },
                      { label: "Satisfied", value: "Satisfied" },
                    ]}
                    initial={1}
                    buttonMargin={1}
                    borderWidth={2}
                    borderColor="black"
                    buttonColor="black"
                    onPress={(value) =>
                      // console.log(`Call onPress with value: ${value}`)
                      {
                        this.setState({ feeling: value });
                      }
                    }
                  />
                </View>
                <View
                  style={{
                    display: this.state.isSecondNoStepVis,
                    justifyContent: "flex-start",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%",
                    height: "40%",
                    //backgroundColor:RED
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginTop: "20%",
                    }}
                  >
                    Tell us the reason why you didn't {this.eventToday.title} as
                    planned
                  </Text>
                  <View
                    style={{
                      flex: 0.8,

                      marginTop: 10,
                      width: "100%",
                      borderWidth: 2,
                      borderRadius: 30,
                      borderColor: "#6E6E6E",
                    }}
                  >
                    <TextInput
                      // secureTextEntry={true}
                      style={{
                        flex: 1,
                        marginLeft: 20,
                        marginRight: 20,
                        fontSize: 20,
                      }}
                      maxLength={35}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={this.state.reason}
                      onChangeText={(text) => {
                        this.setState({ reason: text });
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    display: this.state.isThirdNoStepVis,
                    justifyContent: "flex-start",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%",
                    height: "40%",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginTop: "20%",
                    }}
                  >
                    Tell us what physical exercise you did?
                  </Text>
                  <View
                    style={{
                      flex: 0.8,

                      marginTop: 10,
                      width: "100%",
                      borderWidth: 2,
                      borderRadius: 30,
                      borderColor: "#6E6E6E",
                    }}
                  >
                    <TextInput
                      // secureTextEntry={true}
                      style={{
                        flex: 1,
                        marginLeft: 20,
                        marginRight: 20,
                        fontSize: 20,
                      }}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={this.state.otherActivity}
                      onChangeText={(text) => {
                        this.setState({ otherActivity: text });
                      }}
                    />
                  </View>
                </View>
              </View>
              {/* <View
                style={{
                  flex: 0.15,
                  width: "80%",
                  backgroundColor: "#BDBDBD",
                  borderRadius: 15,
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 20,
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
                    Records on {this.eventToday.title} on{" "}
                    {this.eventToday.start.slice(5, 10)}
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
                    // backgroundColor: RED,
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                    {WEEKDAY[new Date(this.eventToday.end).getDay()]}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      source={{
                        uri:
                          "http://openweathermap.org/img/wn/" +
                          this.state.detailViewIcon +
                          ".png",
                      }}
                      style={{ width: 60, height: 60 }}
                    ></Image>
                    <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                      {this.state.weatherText}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                    {this.state.detailViewTemp}°F
                  </Text>
                </View>
              </View> */}
              {/* <View style={{ flex: 0.5, width: "80%" }}>
                <View style={{ flex: 1 }}>
                  <Calendar
                    events={this.state.detailViewCalendar}
                    date={this.state.normalViewModalStartDate}
                    scrollOffsetMinutes={
                      parseInt(this.eventToday.start.slice(11, 13)) * 60
                    }
                    swipeEnabled={false}
                    height={90}
                    mode="day"
                  />
                </View>
              </View> */}
              <View style={{ flexDirection: "row" }}>
                <Button
                  title="Back"
                  disabled={this.state.isBackBtnVis}
                  onPress={() => {
                    if (this.state.nextBtnState === "submit") {
                      if (this.state.isActivityCompleted) {
                        this.setState({ isBackBtnVis: true });
                        this.setState({ isFirstStepVis: "flex" });
                        this.setState({ isThirdYesStepVis: "none" });

                        // this.setState({ isSecondYesStepVis: "flex" });

                        this.setState({ nextBtnState: "next" });
                        this.setState({ btnName: "Next" });
                      } else {
                        if (this.state.isOtherActivity) {
                          this.setState({ isBackBtnVis: false });
                          this.setState({ isThirdYesStepVis: "none" });
                          this.setState({ isThirdNoStepVis: "flex" });
                          this.setState({ btnName: "Next" });
                          this.setState({ nextBtnState: "next4no" });
                        } else {
                          this.setState({ isSecondYesStepVis: "none" });
                          this.setState({ isSecondNoStepVis: "flex" });
                          this.setState({ btnName: "Next" });
                          this.setState({ nextBtnState: "next2no" });
                        }
                      }
                    } else if (this.state.nextBtnState === "next2") {
                      this.setState({ nextBtnState: "next" });
                      this.setState({ isBackBtnVis: true });
                      this.setState({ isSecondYesStepVis: "none" });
                      this.setState({ isFirstStepVis: "flex" });
                    } else if (this.state.nextBtnState === "next2no") {
                      this.setState({ nextBtnState: "next" });
                      this.setState({ isBackBtnVis: true });
                      this.setState({ isFirstStepVis: "flex" });
                      this.setState({ isSecondNoStepVis: "none" });
                    } else if (this.state.nextBtnState === "next3no") {
                      this.setState({ nextBtnState: "next2no" });
                      this.setState({ isBackBtnVis: false });
                      this.setState({ isSecondNoStepVis: "flex" });
                      this.setState({ isSecondYesStepVis: "none" });
                      this.setState({ isOtherActivity: "no records" });
                    } else if (this.state.nextBtnState === "next4no") {
                      this.setState({ isThirdNoStepVis: "none" });
                      this.setState({ isSecondYesStepVis: "flex" });
                      this.setState({ nextBtnState: "next3no" });
                      this.setState({ isOtherActivity: true });
                      //this.setState({ otherActivity: "" });
                      //this.setState({ secSwitchSelectorInitVal: 0});
                    }
                  }}
                ></Button>
                <Button
                  title={this.state.btnName}
                  onPress={async () => {
                    // console.log(
                    //   "this.state.nextBtnState",
                    //   this.state.nextBtnState
                    // );
                    // console.log("================================");
                    // console.log("this.state.feeling", this.state.feeling);
                    // console.log(
                    //   "this.state.isActivityCompleted",
                    //   this.state.isActivityCompleted
                    // );
                    // console.log(
                    //   "this.state.isOtherActivity",
                    //   this.state.isOtherActivity
                    // );
                    // console.log("this.state.reason", this.state.reason);
                    // console.log(
                    //   "this.state.otherActivity",
                    //   this.state.otherActivity
                    // );
                    // console.log("================================");

                    if (this.state.nextBtnState === "submit") {
                      // this.setState({ isReportModalVis: false });
                      // this.setState({ nextBtnState: "next" });

                      // this.setState({ feeling: "Neutral" });
                      // this.setState({ isActivityCompleted: false });
                      // this.setState({ isOtherActivity: false });
                      // this.setState({ isFirstStepVis: "flex" });
                      // this.setState({ isSecondYesStepVis: "none" });
                      // this.setState({ isSecondNoStepVis: "none" });
                      // this.setState({ isThirdNoStepVis: "none" });
                      // this.setState({ isThirdYesStepVis: "none" });

                      this.resetReport();

                      let eventToUpdate = this.eventToday;
                      eventToUpdate.isActivityCompleted =
                        this.state.isActivityCompleted;
                      eventToUpdate.isReported = true;
                      if (this.state.isActivityCompleted) {
                        eventToUpdate.isOtherActivity = "";
                        eventToUpdate.reason = "";
                      } else {
                        eventToUpdate.isOtherActivity =
                          this.state.isOtherActivity;
                        eventToUpdate.reason = this.state.reason;
                        if (this.state.isOtherActivity) {
                          eventToUpdate.otherActivity =
                            this.state.otherActivity;
                        } else {
                          eventToUpdate.otherActivity = ";";
                        }
                      }

                      if (
                        !this.state.isActivityCompleted &&
                        !this.state.isOtherActivity
                      ) {
                        eventToUpdate.feeling = "";
                      } else {
                        eventToUpdate.feeling = this.state.feeling;
                      }

                      await this.dataModel.updatePlan(
                        this.userKey,
                        eventToUpdate
                      );
                      let eventList = this.state.eventsThisMonth;

                      await this.setState({ eventsThisMonth: eventList });
                      await this.dataModel.loadUserPlans(this.userKey);
                      this.userPlans = this.dataModel.getUserPlans();
                      this.setState({ feeling: "Neutral" });
                      this.setState({ isActivityCompleted: false });
                      this.setState({ isOtherActivity: false });
                      this.setState({ otherActivity: "" });
                      this.updateView();

                      //this.updateView();
                    } else if (this.state.nextBtnState === "next") {
                      this.setState({ isBackBtnVis: false });
                      this.setState({ isFirstStepVis: "none" });
                      this.setState({ nextBtnState: "next2" });
                      if (this.state.isActivityCompleted) {
                        this.setState({ submitBtnState: true });
                        this.setState({ isThirdYesStepVis: "flex" });
                        this.setState({ btnName: "Submit" });
                        this.setState({ nextBtnState: "submit" });
                        //this.setState({ isButtonFirstStage: false });
                      } else {
                        this.setState({ nextBtnState: "next2no" });
                        this.setState({ btnName: "Next" });
                        this.setState({ submitBtnState: false });
                        this.setState({ isSecondNoStepVis: "flex" });
                      }
                    } else if (
                      this.state.nextBtnState === "next2" ||
                      this.state.nextBtnState === "next3no"
                    ) {
                      this.setState({ isSecondYesStepVis: "none" });
                      //this.setState({ btnName: "Submit" });
                      //this.setState({ nextBtnState: "submit" });
                      // this.setState({ isSecondYesStepVis: "none" });
                      // this.setState({ isThirdYesStepVis: "flex" });
                      // this.setState({ isThirdNoStepVis: "none" });
                      if (this.state.isOtherActivity) {
                        this.setState({ isThirdNoStepVis: "flex" });
                        this.setState({ btnName: "Next" });
                        this.setState({ nextBtnState: "next4no" });
                      } else {
                        this.setState({ isThirdNoStepVis: "none" });
                        this.setState({ btnName: "Submit" });
                        this.setState({ nextBtnState: "submit" });
                      }
                    } else if (this.state.nextBtnState === "next2no") {
                      this.setState({ btnName: "Next" });
                      this.setState({ nextBtnState: "next3no" });
                      this.setState({ isSecondNoStepVis: "none" });
                      this.setState({ isSecondYesStepVis: "flex" });
                      if (!this.state.isOtherActivity) {
                        this.setState({ isThirdNoStepVis: "none" });
                        this.setState({ btnName: "Submit" });
                        this.setState({ nextBtnState: "submit" });
                      }
                    } else if (this.state.nextBtnState === "next4no") {
                      if (this.state.otherActivity === "") {
                        Alert.alert(
                          "Invalid Name",
                          "The field can't be empty",
                          [
                            {
                              text: "OK",
                              onPress: () => console.log("OK Pressed"),
                            },
                          ]
                        );
                      } else {
                        this.setState({ isThirdNoStepVis: "none" });
                        this.setState({ isThirdYesStepVis: "flex" });
                        this.setState({ btnName: "Submit" });
                        this.setState({ nextBtnState: "submit" });
                      }
                    }
                    // else if (this.state.nextBtnState === "next4no") {
                    //   this.setState({ isThirdNoStepVis: "none" });
                    //   this.setState({ btnName: "Submit" });
                    //   this.setState({ nextBtnState: "submit" });

                    // }
                  }}
                ></Button>
              </View>
            </View>
          </View>
        </Modal>

        {/* // No event day report */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.isNoEventDayReportModalVis}
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
              //backgroundColor:RED
            }}
          >
            <View
              style={{
                flex: 0.6,
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
              <View
                style={{
                  flex: 0.05,
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                }}
              >
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({ isNoEventDayReportModalVis: false });
                      this.setState({ btnName: "Next" });
                      this.setState({ nextBtnState: "next" });
                      // this.setState({ feeling: "Neutral" });
                      // this.setState({ isActivityCompleted: false });
                      // this.setState({ isOtherActivity: false });
                      // this.setState({ isFirstStepVis: "flex" });
                      // this.setState({ isSecondYesStepVis: "none" });
                      // this.setState({ isThirdYesStepVis: "none" });
                      // this.setState({ isSecondNoStepVis: "none" });
                      // this.setState({ isThirdNoStepVis: "none" });
                      // this.setState({ nextBtnState: "next" });
                      // this.setState({ otherActivity: "" });
                      this.resetReport();
                    }}
                  >
                    <MaterialIcons name="cancel" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              </View>
              <View
                style={{
                  flex: 0.2,
                  width: "80%",
                  marginTop: 0,
                  //backgroundColor:RED
                }}
              >
                <Text style={{ fontSize: 24, fontWeight: "bold" }}>
                  Tell us about your day!{" "}
                  {moment(this.state.noEventDayReportDate)
                    .format()
                    .slice(0, 10)}
                </Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "bold", marginTop: 5 }}
                >
                  The following questions only take seconds to complete
                </Text>
              </View>

              <View
                style={{
                  flex: 0.8,
                  width: "80%",
                  //backgroundColor: RED,
                  flexDirection: "row",
                  alignItems: "flex-start",
                  top: "20%",
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
                    }}
                  >
                    Did you do any physical exercise today?
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
                        this.setState({ isOtherActivity: value });
                        if (value) {
                          this.setState({ nextBtnState: "next" });
                          this.setState({ btnName: "Next" });
                        } else {
                          this.setState({ nextBtnState: "submit" });
                          this.setState({ btnName: "Submit" });
                        }
                      }
                    }
                  />
                </View>
                <View
                  style={{
                    display: this.state.isSecondYesStepVis,
                    justifyContent: "flex-start",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginBottom: "10%",
                    }}
                  >
                    Tell us what physical activity you did?
                  </Text>
                  <View
                    style={{
                      flex: 0.1,

                      marginTop: 10,
                      width: "100%",
                      borderWidth: 2,
                      borderRadius: 30,
                      borderColor: "#6E6E6E",
                    }}
                  >
                    <TextInput
                      // secureTextEntry={true}
                      style={{
                        flex: 1,
                        marginLeft: 20,
                        marginRight: 20,
                        fontSize: 20,
                      }}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={this.state.otherActivity}
                      onChangeText={(text) => {
                        this.setState({ otherActivity: text });
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    display: this.state.isThirdYesStepVis,
                    justifyContent: "flex-start",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginBottom: "10%",
                    }}
                  >
                    How satisfied are you with what you've experienced as a
                    result of {this.state.otherActivity} on{" "}
                    {moment(this.state.noEventDayReportDate)
                      .format()
                      .slice(5, 10)}
                    ?
                  </Text>
                  <SwitchSelector
                    options={[
                      { label: "Unsatisfied", value: "Unsatisfied" },
                      { label: "Neutral", value: "Neutral" },
                      { label: "Satisfied", value: "Satisfied" },
                    ]}
                    initial={1}
                    buttonMargin={1}
                    borderWidth={2}
                    borderColor="black"
                    buttonColor="black"
                    onPress={(value) =>
                      // console.log(`Call onPress with value: ${value}`)
                      {
                        this.setState({ feeling: value });
                      }
                    }
                  />
                </View>
                <View
                  style={{
                    display: this.state.isSecondNoStepVis,
                    justifyContent: "flex-start",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginBottom: "10%",
                    }}
                  >
                    Tell us the reason why you didn't {this.eventToday.title} as
                    planned
                  </Text>
                  <View
                    style={{
                      flex: 0.8,

                      marginTop: 10,
                      width: "100%",
                      borderWidth: 2,
                      borderRadius: 30,
                      borderColor: "#6E6E6E",
                    }}
                  >
                    <TextInput
                      // secureTextEntry={true}
                      style={{
                        flex: 1,
                        marginLeft: 20,
                        marginRight: 20,
                        fontSize: 20,
                      }}
                      maxLength={35}
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
                    if (this.state.nextBtnState === "submit") {
                      if (this.state.isOtherActivity) {
                        this.setState({ isBackBtnVis: false });
                        this.setState({ isSecondYesStepVis: "flex" });
                        this.setState({ isThirdYesStepVis: "none" });
                        this.setState({ nextBtnState: "next2" });
                        this.setState({ btnName: "Next" });
                      } else {
                        this.setState({ isBackBtnVis: false });
                        this.setState({ isThirdYesStepVis: "none" });
                        this.setState({ isFirstStepVis: "flex" });
                        this.setState({ btnName: "Next" });
                        this.setState({ nextBtnState: "next" });
                      }
                    } else if (this.state.nextBtnState === "next2") {
                      this.setState({ nextBtnState: "next" });
                      this.setState({ isBackBtnVis: true });
                      this.setState({ isSecondYesStepVis: "none" });
                      this.setState({ isFirstStepVis: "flex" });
                    } else if (this.state.nextBtnState === "next2no") {
                      this.setState({ nextBtnState: "next" });
                      this.setState({ isBackBtnVis: true });
                      this.setState({ isFirstStepVis: "flex" });
                      this.setState({ isSecondNoStepVis: "none" });
                    } else if (this.state.nextBtnState === "next3no") {
                      this.setState({ nextBtnState: "next2no" });
                      this.setState({ isBackBtnVis: false });
                      this.setState({ isSecondNoStepVis: "flex" });
                      this.setState({ isThirdNoStepVis: "none" });
                    }
                  }}
                ></Button>
                <Button
                  title={this.state.btnName}
                  onPress={async () => {
                    if (this.state.nextBtnState === "submit") {
                      this.setState({ isNoEventDayReportModalVis: false });
                      // this.setState({ nextBtnState: "next" });

                      // this.setState({ feeling: "Neutral" });
                      // this.setState({ isActivityCompleted: false });
                      // this.setState({ isOtherActivity: false });
                      // this.setState({ isFirstStepVis: "flex" });
                      // this.setState({ isSecondYesStepVis: "none" });
                      // this.setState({ isSecondNoStepVis: "none" });
                      // this.setState({ isThirdNoStepVis: "none" });
                      // this.setState({ isThirdYesStepVis: "none" });
                      this.resetReport();

                      let dailyReport = {};
                      dailyReport.isDailyReport = true;
                      dailyReport.isExerciseToday = this.state.isOtherActivity;
                      if (this.state.isOtherActivity) {
                        dailyReport.otherActivity = this.state.otherActivity;
                        dailyReport.feeling = this.state.feeling;
                      } else {
                        dailyReport.otherActivity = "none";
                        dailyReport.feeling = "";
                      }
                      //dailyReport.feeling = this.state.feeling;

                      dailyReport.end = moment(this.state.noEventDayReportDate)
                        .format()
                        .slice(0, 10);
                      dailyReport.start = dailyReport.end;

                      let timeStamp = moment(new Date()).format();
                      dailyReport.timeStamp = timeStamp;
                      await this.dataModel.createNewPlan(
                        this.userKey,
                        dailyReport
                      );

                      // let eventToUpdate = this.eventToday;
                      // eventToUpdate.isActivityCompleted = this.state.isActivityCompleted;
                      // eventToUpdate.isReported = true;

                      // eventToUpdate.isOtherActivity = this.state.isOtherActivity;
                      // eventToUpdate.reason = this.state.reason;
                      // eventToUpdate.otherActivity = this.state.otherActivity;
                      // eventToUpdate.feeling = this.state.feeling;

                      // await this.dataModel.updatePlan(
                      //   this.userKey,
                      //   eventToUpdate
                      // );

                      // let eventList = this.state.eventsThisMonth;
                      // eventList.push(dailyReport);

                      // await this.setState({ eventsThisMonth: eventList });

                      await this.dataModel.loadUserPlans(this.userKey);
                      this.userPlans = this.dataModel.getUserPlans();
                      this.setState({ feeling: "Neutral" });
                      this.setState({ isActivityCompleted: false });
                      this.setState({ isOtherActivity: false });
                      this.setState({ otherActivity: "" });
                      this.updateView();
                    } else if (this.state.nextBtnState === "next") {
                      this.setState({ isBackBtnVis: false });
                      this.setState({ isFirstStepVis: "none" });
                      this.setState({ nextBtnState: "next2" });
                      if (this.state.isOtherActivity) {
                        //this.setState({ submitBtnState: true });
                        this.setState({ isSecondYesStepVis: "flex" });
                        //this.setState({ isButtonFirstStage: false });
                      } else {
                        this.setState({ nextBtnState: "submit" });
                        this.setState({ btnName: "Submit" });
                        //this.setState({ submitBtnState: false });
                        this.setState({ isThirdYesStepVis: "flex" });
                      }
                    } else if (
                      this.state.nextBtnState === "next2" ||
                      this.state.nextBtnState === "next3no"
                    ) {
                      if (this.state.otherActivity === "") {
                        Alert.alert(
                          "Invalid Name",
                          "The field can't be empty",
                          [
                            {
                              text: "OK",
                              onPress: () => console.log("OK Pressed"),
                            },
                          ]
                        );
                      } else {
                        this.setState({ btnName: "Submit" });
                        this.setState({ nextBtnState: "submit" });
                        this.setState({ isSecondYesStepVis: "none" });
                        this.setState({ isThirdYesStepVis: "flex" });
                        this.setState({ isThirdNoStepVis: "none" });
                      }
                    } else if (this.state.nextBtnState === "next2no") {
                      this.setState({ btnName: "next" });
                      this.setState({ nextBtnState: "next3no" });
                      this.setState({ isSecondNoStepVis: "none" });
                      this.setState({ isThirdNoStepVis: "flex" });
                    }
                  }}
                ></Button>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.isPlanAbleModalVis}
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
                  // backgroundColor:RED,

                  justifyContent: "flex-end",
                  alignItems: "flex-start",
                }}
              >
                <View>
                  <TouchableOpacity
                    onPress={() => this.setState({ isPlanAbleModalVis: false })}
                  >
                    <MaterialIcons name="cancel" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ flex: 0.9, width: "90%" }}>
                <View style={{ flex: 1 }}>
                  <Calendar
                    events={this.state.detailViewCalendar}
                    date={this.state.normalViewModalStartDate}
                    scrollOffsetMinutes={480}
                    swipeEnabled={false}
                    height={90}
                    mode="day"
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>
        {/* //no planned event modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.isNormalModalVis}
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
                  // backgroundColor:RED,

                  justifyContent: "flex-end",
                  alignItems: "flex-start",
                }}
              >
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({ isNormalModalVis: false });
                      // this.eventToday = {};
                    }}
                  >
                    <MaterialIcons name="cancel" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ flex: 0.9, width: "90%" }}>
                <View
                  style={{
                    flex: 0.1,
                    width: "100%",
                    backgroundColor: "white",
                    borderColor: "black",
                    borderWidth: 2,
                    borderRadius: 15,
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      flex: 0.7,
                      width: "90%",
                      marginTop: 0,
                      marginLeft: 10,
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexDirection: "row",
                      // backgroundColor: RED,
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                      {WEEKDAY[this.state.normalWeekday]}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        source={{
                          uri:
                            "http://openweathermap.org/img/wn/" +
                            this.state.detailViewIcon +
                            ".png",
                        }}
                        style={{ width: 60, height: 60 }}
                      ></Image>
                      <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                        {this.state.weatherText}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                      {this.state.detailViewTemp}°F
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flex: 0.1,
                    marginTop: 10,
                    width: "100%",
                    backgroundColor: "white",
                    borderColor: "black",
                    borderWidth: 2,
                    borderRadius: 15,
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <this.NoEventSecView userFeeling={this.eventToday} />
                </View>
                <View style={{ flex: 1 }}>
                  <Calendar
                    events={this.state.detailViewCalendar}
                    date={this.state.normalViewModalStartDate}
                    scrollOffsetMinutes={480}
                    swipeEnabled={false}
                    height={90}
                    mode="day"
                  />
                </View>
              </View>
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
                  // backgroundColor:RED,

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
              <View style={{ flex: 0.9, width: "90%" }}>
                <View
                  style={{
                    flex: 0.2,
                    width: "100%",
                    backgroundColor: "white",
                    borderWidth: 2,
                    borderColor: "black",
                    borderRadius: 15,
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      flex: 0.4,
                      width: "90%",
                      marginTop: 10,
                      marginLeft: 10,
                      marginBottom: 0,
                    }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: "bold" }}>
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
                      // backgroundColor: RED,
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                      {WEEKDAY[new Date(this.eventToday.end).getDay()]}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        source={{
                          uri:
                            "http://openweathermap.org/img/wn/" +
                            this.state.detailViewIcon +
                            ".png",
                        }}
                        style={{ width: 60, height: 60 }}
                      ></Image>
                      <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                        {this.state.weatherText}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                      {this.state.detailViewTemp}°F
                    </Text>
                  </View>
                </View>
                {planDetailView}
                <View style={{ flex: 1 }}>
                  <Calendar
                    events={this.state.detailViewCalendar}
                    date={new Date(this.eventToday.start)}
                    scrollOffsetMinutes={
                      parseInt(this.eventToday.start.slice(11, 13)) * 60
                    }
                    swipeEnabled={false}
                    height={90}
                    mode="day"
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>
        {/* future plan Modal */}
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
                  // backgroundColor:RED,

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
                    backgroundColor: "white",
                    borderColor: "black",
                    borderWidth: 2,
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
                    <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                      Planned: {this.eventToday.title} at{" "}
                      {this.eventToday.start.slice(11, 16)}
                      {/* {this.state.detailViewTop} */}
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
                      // backgroundColor: RED,
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                      {WEEKDAY[new Date(this.eventToday.end).getDay()]}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        source={{
                          uri:
                            "http://openweathermap.org/img/wn/" +
                            this.state.detailViewIcon +
                            ".png",
                        }}
                        style={{ width: 60, height: 60 }}
                      ></Image>
                      <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                        {this.state.weatherText}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                      {this.state.detailViewTemp}°F
                    </Text>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Calendar
                    events={this.state.detailViewCalendar}
                    date={new Date(this.eventToday.start)}
                    scrollOffsetMinutes={
                      parseInt(this.eventToday.start.slice(11, 13)) * 60
                    }
                    swipeEnabled={false}
                    height={90}
                    mode="day"
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>
        <View>
          {/* <SegmentedControl
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
          /> */}
        </View>
        <View
          style={{
            marginTop: 20,
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
          draggableRange={{ top: 320, bottom: 60 }}
          showBackdrop={false}
          ref={(c) => (this._panel = c)}
        >
          <View
            style={{
              height: 370,
              justifyContent: "space-between",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: 40,
              backgroundColor: "#BDBDBD",
            }}
          >
            <View
              style={{
                flex: 0.4,
                flexDirection: "column",
                width: "90%",
                borderRadius: 20,
                justifyContent: "space-between",
                marginTop: 20,
                backgroundColor: "white",
              }}
            >
              <View
                style={{
                  flex: 0.5,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "black",
                    marginTop: 10,
                    marginLeft: 10,
                  }}
                >
                  {this.state.panelTop}
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "black",
                      // color: "white",
                      width: 120,
                      height: 30,
                      borderRadius: 15,
                      marginTop: 5,
                      marginRight: 5,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    disabled={this.state.isViewEventsDisable}
                    onPress={async () => {
                      this.setState({ isPlanAbleModalVis: true });
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      View Schedule
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View
                style={{
                  flex: 0.5,
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
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={{
                      uri:
                        "http://openweathermap.org/img/wn/" +
                        this.state.detailViewIcon +
                        ".png",
                    }}
                    style={{ width: 60, height: 60 }}
                  ></Image>
                  <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                    {this.state.weatherText}
                  </Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  {this.state.detailViewTemp}°F
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
                alignItems: "center",
                marginTop: 10,
                backgroundColor: "#6E6E6E",
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  width: "95%",
                  height: "90%",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingLeft: 10,
                  paddingRight: 10,
                  marginBottom: 10,

                  //backgroundColor: "white",
                  borderRadius: 15,
                  //backgroundColor: "blue",
                }}
              >
                <View
                  style={{
                    flex: 0.5,
                    marginRight: 5,
                    flexDirection: "column",
                    height: "100%",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 0.5, justifyContent: "center" }}>
                    <Text
                      style={{
                        margin: 5,
                        fontWeight: "bold",
                        textAlign: "center",
                        fontSize: 14,
                        color: "white",
                      }}
                    >
                      Activity
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 0.5,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "white",
                      width: "100%",

                      borderRadius: 20,
                    }}
                  >
                    <ModalSelector
                      style={{ borderWidth: 0 }}
                      // touchableStyle={{ color: "white" }}
                      optionContainerStyle={{ borderWidth: 0 }}
                      selectStyle={{ borderWidth: 0 }}
                      selectTextStyle={{
                        textAlign: "left",
                        color: "blue",
                        fontWeight: "bold",
                      }}
                      initValueTextStyle={{
                        textAlign: "left",
                        color: "blue",
                        fontWeight: "bold",
                      }}
                      backdropPressToClose={true}
                      overlayStyle={{
                        flex: 1,
                        padding: "5%",
                        justifyContent: "center",
                        backgroundColor: "rgba(0,0,0,0)",
                      }}
                      optionContainerStyle={{
                        backgroundColor: "white",
                        borderRadius: 15,
                      }}
                      optionTextStyle={{ fontWeight: "bold" }}
                      sectionTextStyle={{ fontWeight: "bold" }}
                      cancelStyle={{
                        backgroundColor: "grey",
                        borderRadius: 15,
                      }}
                      cancelTextStyle={{ fontWeight: "bold", color: "white" }}
                      data={this.state.activityData}
                      initValue={this.state.activityPickerInitVal}
                      onChange={async (item) => {
                        this.setState({isActivityTypeSelected: true})
                        await this.activityFilter(item);
                      }}
                    />
                  </View>
                </View>

                <View
                  style={{
                    flex: 0.5,
                    flexDirection: "column",
                    height: "100%",
                    justifyContent: "space-between",
                    marginLeft: 5,
                  }}
                >
                  <View style={{ flex: 0.5, justifyContent: "center" }}>
                    <Text
                      style={{
                        margin: 5,
                        fontWeight: "bold",
                        textAlign: "center",
                        fontSize: 14,
                        color: "white",
                      }}
                    >
                      Add new activity
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 0.5,
                      backgroundColor: "white",
                      height: 50,
                      borderRadius: 20,
                      borderWidth: 2,
                      borderColor: "black",
                      marginRight: 0,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <TextInput
                      style={{ fontSize: 16, marginLeft: 5, flex: 0.8 }}
                      placeholder="new activity"
                      value={this.state.userDefinedActivityText}
                      onChangeText={(text) =>
                        this.setState({ userDefinedActivityText: text })
                      }
                    ></TextInput>
                    <View style={{ marginRight: 2, flex: 0.2 }}>
                      <TouchableOpacity
                        onPress={async () => {
                          let activityList = this.state.activityData;
                          // console.log("activityList",activityList);
                          if (this.state.userDefinedActivityText === "") {
                            Alert.alert(
                              "Invalid Name",
                              "Activity name can't be empty",
                              [
                                {
                                  text: "OK",
                                  onPress: () => console.log("OK Pressed"),
                                },
                              ]
                            );
                            return;
                          }
                          this.index++;
                          let newActivity = {
                            key: this.index,
                            label: this.state.userDefinedActivityText,
                          };
                          for (let activity of activityList) {
                            let activityToLowerCase =
                              activity.label.toLowerCase();
                            let newActivityToLowerCase =
                              this.state.userDefinedActivityText.toLowerCase();
                            if (
                              activityToLowerCase === newActivityToLowerCase
                            ) {
                              Alert.alert(
                                this.state.userDefinedActivityText +
                                  " already existed",
                                "Please add another activity",
                                [
                                  {
                                    text: "OK",
                                    onPress: () => console.log("OK Pressed"),
                                  },
                                ]
                              );
                              this.setState({ userDefinedActivityText: "" });
                              return;
                            }
                          }
                          // console.log("newActivity",newActivity);
                          activityList.push(newActivity);
                          this.setState({ userDefinedActivityText: "" });
                          await this.dataModel.updateUserActivities(
                            this.userKey,
                            this.state.userDefinedActivityText
                          );
                        }}
                      >
                        <Ionicons
                          name="ios-add-circle"
                          size={30}
                          color={"black"}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View
              style={{
                flex: 0.4,
                width: "90%",
                borderRadius: 20,
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 10,
                backgroundColor: "#6E6E6E",
              }}
            >
              <View
                style={{
                  flex: 0.5,
                  flexDirection: "row",
                  width: "95%",
                  height: "100%",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingLeft: 10,
                  paddingRight: 10,
                }}
              >
                <View style={{ flex: 1, justifyContent: "center" }}>
                  <Text
                    style={{
                      margin: 5,
                      fontWeight: "bold",
                      textAlign: "center",
                      fontSize: 14,
                      color: "white",
                    }}
                  >
                    Start
                  </Text>
                </View>
                <View style={{ flex: 1, justifyContent: "center" }}>
                  <Text
                    style={{
                      margin: 5,
                      fontWeight: "bold",
                      textAlign: "center",
                      fontSize: 14,
                      color: "white",
                    }}
                  >
                    End
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flex: 0.5,
                  flexDirection: "row",
                  width: "95%",
                  height: "90%",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingLeft: 10,
                  paddingRight: 10,
                  marginBottom: 10,

                  backgroundColor: "white",
                  borderRadius: 15,
                  // backgroundColor:"blue"
                }}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    marginLeft: "10%",
                  }}
                >
                  <DateTimePicker
                    value={this.state.datePickerDate}
                    mode="default"
                    is24Hour={true}
                    display="default"
                    onChange={async (e, date) => {
                      this.setState({isTimeSelected: true});
                      await this.dateTimeFilter(date);
                    }}
                    style={{
                      width: "100%",
                      alignSelf: "center",
                      flexWrap: "wrap",
                      position: "absolute",
                      left: "6%",
                    }}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                    {moment(this.state.datePickerDate)
                      .add(30, "minutes")
                      .format("hh:mm")}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                flex: 0.4,
                flexDirection: "row",
                width: "90%",
                borderRadius: 20,
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginTop: 1,
                //backgroundColor:RED
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  width: "100%",
                  borderRadius: 20,
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 10,
                  //backgroundColor:RED
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: "white",
                    borderColor: "black",
                    borderWidth: 2,
                    width: 120,
                    height: 40,
                    borderRadius: 15,
                    marginRight: 5,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  disabled={false}
                  onPress={async () => {
                    await this.resetCalendarView();
                  }}
                >
                  <Text style={{ color: "black", fontWeight: "bold" }}>
                    Full View
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={this.state.isPlanBtnDisable}
                  onPress={() => this.onPlanBtnPressed()}
                  style={{
                    // flex: 0.3,
                    backgroundColor: "black",
                    color: "white",
                    width: 120,
                    height: 40,
                    borderRadius: 15,

                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    Plan
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SlidingUpPanel>
      </View>
    );
  }
}
