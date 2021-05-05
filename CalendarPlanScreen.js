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
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import SwitchSelector from "react-native-switch-selector";

import ModalSelector from "react-native-modal-selector";

// let index = 0;
// const data = [
//   { key: index++, section: true, label: "Physical Activities" },
//   { key: index++, label: "Walking" },
//   { key: index++, label: "Jogging" },
//   { key: index++, label: "Gardening" },
//   { key: index++, label: "Biking" },
//   { key: index++, label: "Jumping Rope" },
// ];

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
    this.activityData = [
      { key: 1, section: true, label: "Physical Activities" },
    ];
    let activityList = this.props.route.params.userActivityList;
    console.log("activityList", activityList);
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
    this.detailViewCalendar = [];
    this.normalViewModalStartDate = new Date();
    this.isNoEventDayReportModalVis = false;
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
      isThirdYesStepVis: "none",

      isSecondNoStepVis: "none",
      isThirdNoStepVis: "none",
      isBackBtnVis: true,

      datePickerDate: new Date(),

      //Update Report Modal Button
      isButtonFirstStage: true,
      btnName: "Next",
      nextBtnState: "next",
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
    };
    //console.log("weatherThisMonth",this.state.weatherThisMonth);
    // this.monthCalRef = React.createRef();
  }

  reportPopUp = async (userPlanList) => {
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
      }
    }
    if (isNoEventToday) {
      this.isNoEventDayReportModalVis = true;
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

        // for (let weather of normalWeatherList) {
        //   if (weather.date === item) {
        //     this.setState({ detailViewTemp: weather.temp });
        //     this.setState({ detailViewIcon: weather.img });
        //     this.setState({ weatherText: weather.text });
        //   }
        // }

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
        // let isDailyReported = false;
        // let currentDate = moment(
        //   new Date(todayDate.getFullYear(), monthNum, item)
        // )
        //   .format()
        //   .slice(0, 10);
        // for (let record of this.userPlans) {
        //   if (record.end && record.isDailyReport) {
        //     let eventDate = record.end.slice(0, 10);
        //     if (eventDate === currentDate) {
        //       this.eventToday = record;
        //       isDailyReported = true;
        //     }
        //   }
        // }
        if (isDailyReported) {
          this.setNormalModal(todayDate, normalEventList, monthNum, item);
          // this.setState({ detailViewCalendar: normalEventList });
          // let normalDate = new Date(todayDate.getFullYear(), monthNum, item);
          // this.setState({ normalViewModalStartDate: normalDate });
          // let normalWeekday = normalDate.getDay();
          // this.setState({ normalWeekday: normalWeekday });

          // this.setState({ isNormalModalVis: true });
          // this.setState({ isWeatherVisOnPanel: "none" });

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
          this.setState({ isNoEventDayReportModalVis: true });
          return;
        }
      } else if (monthNum === todayDate.getMonth()) {
        //console.log("no plans");

        normalWeatherList = this.thisMonthWeather;
        this.setWeatherByDate(item, normalWeatherList);
        // for (let weather of normalWeatherList) {
        //   if (weather.date === item) {
        //     this.setState({ detailViewTemp: weather.temp });
        //     this.setState({ detailViewIcon: weather.img });
        //     this.setState({ weatherText: weather.text });
        //   }
        // }

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
          // //console.log("item < todayDate.getDate()");
          // let isDailyReported = false;
          // //this.eventToday = {};
          // let currentDate = moment(
          //   new Date(todayDate.getFullYear(), monthNum, item)
          // )
          //   .format()
          //   .slice(0, 10);
          // for (let record of this.userPlans) {
          //   if (record.end && record.isDailyReport) {
          //     let eventDate = record.end.slice(0, 10);
          //     if (eventDate === currentDate) {
          //       this.eventToday = record;
          //       isDailyReported = true;
          //     }
          //   }
          // }
          if (isDailyReported) {
            //console.log("normalEventList", normalEventList);
            this.setNormalModal(todayDate, normalEventList, monthNum, item);
            // this.setState({ detailViewCalendar: normalEventList });
            // let normalDate = new Date(todayDate.getFullYear(), monthNum, item);
            // this.setState({ normalViewModalStartDate: normalDate });

            // let normalWeekday = normalDate.getDay();
            // this.setState({ normalWeekday: normalWeekday });
            // this.setState({ isWeatherVisOnPanel: "none" });
            // this.setState({ isNormalModalVis: true });

            return;
          } else {
            this.setState({
              noEventDayReportDate: new Date(
                todayDate.getFullYear(),
                monthNum,
                item
              ),
            });

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
      // for (let weather of slideUpWeatherList) {
      //   if (weather.date === item) {
      //     this.setState({ detailViewTemp: weather.temp });
      //     this.setState({ detailViewIcon: weather.img });
      //     this.setState({ weatherText: weather.text });
      //   }
      // }
      //console.log(targetDate);
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
        // for (let weather of weatherList) {
        //   if (weather.date === currDate) {
        //     this.setState({ detailViewTemp: weather.temp });
        //     this.setState({ detailViewIcon: weather.img });
        //     this.setState({ weatherText: weather.text });
        //   }
        // }
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
          // for (let weather of weatherList) {
          //   if (weather.date === currDate) {
          //     this.setState({ detailViewTemp: weather.temp });
          //     this.setState({ detailViewIcon: weather.img });
          //     this.setState({ weatherText: weather.text });
          //   }
          // }

          if (monthNum < this.state.date.getMonth()) {
            let normalDate = new Date(todayDate.getFullYear(), monthNum, item);
            this.setState({ normalViewModalStartDate: normalDate });
            this.setState({ isReportModalVis: true });
            this.setState({ isWeatherVisOnPanel: "none" });
          } else if (monthNum === this.state.date.getMonth()) {
            if (item <= this.state.date.getDate()) {
              this.setReportModal(todayDate, monthNum, item);
              // let normalDate = new Date(
              //   todayDate.getFullYear(),
              //   monthNum,
              //   item
              // );
              // this.setState({ normalViewModalStartDate: normalDate });
              // this.setState({ isReportModalVis: true });
              // this.setState({ isWeatherVisOnPanel: "none" });
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
            // for (let weather of weatherList) {
            //   if (weather.date === currDate) {
            //     this.setState({ detailViewTemp: weather.temp });
            //     this.setState({ detailViewIcon: weather.img });
            //     this.setState({ weatherText: weather.text });
            //   }
            // }
            this.setState({ detailViewTop: month + " " + item });

            if (currMonthNum === this.state.date.getMonth() + 1) {
              weatherList = this.thisMonthWeather;
            } else {
              weatherList = this.lastMonthWeather;
            }
            this.setWeatherByDate(currDate, weatherList);
            // for (let weather of weatherList) {
            //   if (weather.date === currDate) {
            //     this.setState({ detailViewTemp: weather.temp });
            //     this.setState({ detailViewIcon: weather.img });
            //     this.setState({ weatherText: weather.text });
            //   }
            // }

            if (monthNum < this.state.date.getMonth()) {
              if (!this.eventToday.isReported) {
                this.setReportModal(todayDate, monthNum, item);
                // let normalDate = new Date(
                //   todayDate.getFullYear(),
                //   monthNum,
                //   item
                // );
                // this.setState({ normalViewModalStartDate: normalDate });
                // this.setState({ isReportModalVis: true });
                // this.setState({ isWeatherVisOnPanel: "none" });
              } else {
                this.setState({ isEventDetailModalVis: true });
                this.setState({ isWeatherVisOnPanel: "none" });
              }
            } else if (monthNum === this.state.date.getMonth()) {
              if (item <= this.state.date.getDate()) {
                if (!this.eventToday.isReported) {
                  this.setReportModal(todayDate, monthNum, item);
                  // let normalDate = new Date(
                  //   todayDate.getFullYear(),
                  //   monthNum,
                  //   item
                  // );
                  // this.setState({ normalViewModalStartDate: normalDate });
                  // this.setState({ isReportModalVis: true });
                  // this.setState({ isWeatherVisOnPanel: "none" });
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
  // updateMonthCalView = () => {
  //   let newListByActivity = this.state.newListByActivity;
  //   console.log("newListByActivity",this.state.newListByActivity);
  //   this.setState({eventsThisMonth:newListByActivity});
  //   console.log("updateMonthCalView()",this.state.eventsThisMonth);
  // }
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
    await this.dataModel.loadUserPlans(this.userKey);
    this.userPlans = this.dataModel.getUserPlans();
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

  resetCalendarView = async () => {
    this.setState({ eventFilteredList: false });
    this.setState({ timeFilteredList: false });
    let currentList = [];
    if (this.state.monthCalCurrentMonth === this.state.date.getMonth()) {
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
        conText = "and I feel";
        if (userFeeling.feeling) {
          // return <Text>{userFeeling.feeling}</Text>;
          if (userFeeling.feeling === "Positive") {
            feelingIcon = "🙂" + " Positive";
          } else if (userFeeling.feeling === "Negative") {
            feelingIcon = "😕" + " Negative";
          } else if (userFeeling.feeling === "Neutral") {
            feelingIcon = "😑" + "Neutral";
          }
        }
        if (userFeeling.isExerciseToday) {
          activityText = "I did " + userFeeling.otherActivity;
        } else {
          activityText = "I didn't do any physical exercise today.";
        }
      }
    }

    return (
      <Text>
        {activityText} {conText} {feelingIcon}
      </Text>
    );
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
    if (this.eventToday.isActivityCompleted && this.eventToday.isThirtyMin) {
      planDetailView = (
        <View
          style={{
            marginTop: 5,
            marginBottom: 5,
            borderRadius: 15,
            flex: 0.2,
            backgroundColor: "green",
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
            <Text style={{ color: "#00FFFF" }}>
              {" " + this.eventToday.title}
            </Text>{" "}
            at
            <Text style={{ color: "#9AFE2E" }}>
              {" " + this.eventToday.start.slice(11, 16)}
            </Text>{" "}
            for 30 minutes
            {"\n"}
            {"\n"}I feel{" "}
            <Text style={{ color: colorCode }}>{feelingEmoji}</Text>
          </Text>
        </View>
      );
    } else if (
      this.eventToday.isActivityCompleted &&
      !this.eventToday.isThirtyMin
    ) {
      planDetailView = (
        <View
          style={{
            marginTop: 5,
            marginBottom: 5,
            borderRadius: 15,
            flex: 0.2,
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
            I did
            <Text style={{ color: "#00FFFF" }}>
              {" " + this.eventToday.title}
            </Text>{" "}
            different from what I planned
            {"\n"}
            {"\n"}I feel{" "}
            <Text style={{ color: colorCode }}>{feelingEmoji}</Text>
          </Text>
        </View>
      );
    } else if (!this.eventToday.isActivityCompleted) {
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
            <Text style={{ color: "#00FFFF" }}>
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
            {"\n"}
            {"\n"}I feel{" "}
            <Text style={{ color: colorCode }}>{feelingEmoji}</Text>
          </Text>
        </View>
      );
    }
    //console.log("render");
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
            {/* <Text style={{fontWeight:"bold", fontSize:8}}>Previous</Text> */}
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
            {/* <Text>Next</Text> */}
            <AntDesign name="rightcircle" size={24} color="black" />
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
              //backgroundColor:"red",
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
                      this.setState({ isReportModalVis: false });
                      this.setState({ feeling: "Neutral" });
                      this.setState({ isActivityCompleted: false });
                      this.setState({ isThirtyMin: false });
                      this.setState({ isFirstStepVis: "flex" });
                      this.setState({ isSecondYesStepVis: "none" });
                      this.setState({ isThirdYesStepVis: "none" });
                      this.setState({ isSecondNoStepVis: "none" });
                      this.setState({ isThirdNoStepVis: "none" });
                      this.setState({ nextBtnState: "next" });
                      this.setState({ otherActivity: "" });
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
                  //backgroundColor:"red"
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
                  flex: 0.8,
                  width: "80%",
                  //backgroundColor: "red",
                  flexDirection: "row",
                  alignItems: "center",
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
                    Did you {this.eventToday.title} on{" "}
                    {this.eventToday.start.slice(5, 10)}
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
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginBottom: "10%",
                    }}
                  >
                    Did you {this.eventToday.title} for 30 min at{" "}
                    {this.eventToday.start.slice(11, 16)}
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
                    How satisfied are you with today's activity?
                  </Text>
                  <SwitchSelector
                    options={[
                      { label: "😕 Negative", value: "Negative" },
                      { label: "😑 Neutral", value: "Neutral" },
                      { label: "🙂 Positive", value: "Positive" },
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
                <View
                  style={{
                    display: this.state.isThirdNoStepVis,
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
                    Did you do any other activities (if yes, what activity and
                    when)?
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
                    // backgroundColor: "red",
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
                    {this.state.detailViewTemp}°C
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
                        this.setState({ isBackBtnVis: false });
                        this.setState({ isSecondYesStepVis: "flex" });
                        this.setState({ isThirdYesStepVis: "none" });
                        this.setState({ nextBtnState: "next2" });
                        this.setState({ btnName: "Next" });
                      } else {
                        this.setState({ isBackBtnVis: false });
                        this.setState({ isThirdYesStepVis: "none" });
                        this.setState({ isThirdNoStepVis: "flex" });
                        this.setState({ btnName: "Next" });
                        this.setState({ nextBtnState: "next3no" });
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
                      this.setState({ isReportModalVis: false });
                      this.setState({ nextBtnState: "next" });

                      this.setState({ feeling: "Neutral" });
                      this.setState({ isActivityCompleted: false });
                      this.setState({ isThirtyMin: false });
                      this.setState({ isFirstStepVis: "flex" });
                      this.setState({ isSecondYesStepVis: "none" });
                      this.setState({ isSecondNoStepVis: "none" });
                      this.setState({ isThirdNoStepVis: "none" });
                      this.setState({ isThirdYesStepVis: "none" });

                      let eventToUpdate = this.eventToday;
                      eventToUpdate.isActivityCompleted = this.state.isActivityCompleted;
                      eventToUpdate.isReported = true;

                      eventToUpdate.isThirtyMin = this.state.isThirtyMin;
                      eventToUpdate.reason = this.state.reason;
                      eventToUpdate.otherActivity = this.state.otherActivity;
                      eventToUpdate.feeling = this.state.feeling;

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
                      this.setState({ isThirtyMin: false });
                      this.setState({ otherActivity: "" });
                      this.updateView();
                    } else if (this.state.nextBtnState === "next") {
                      this.setState({ isBackBtnVis: false });
                      this.setState({ isFirstStepVis: "none" });
                      this.setState({ nextBtnState: "next2" });
                      if (this.state.isActivityCompleted) {
                        this.setState({ submitBtnState: true });
                        this.setState({ isSecondYesStepVis: "flex" });
                        //this.setState({ isButtonFirstStage: false });
                      } else {
                        this.setState({ nextBtnState: "next2no" });
                        this.setState({ submitBtnState: false });
                        this.setState({ isSecondNoStepVis: "flex" });
                      }
                    } else if (
                      this.state.nextBtnState === "next2" ||
                      this.state.nextBtnState === "next3no"
                    ) {
                      this.setState({ btnName: "Submit" });
                      this.setState({ nextBtnState: "submit" });
                      this.setState({ isSecondYesStepVis: "none" });
                      this.setState({ isThirdYesStepVis: "flex" });
                      this.setState({ isThirdNoStepVis: "none" });
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
              //backgroundColor:"red"
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
                      this.setState({ feeling: "Neutral" });
                      this.setState({ isActivityCompleted: false });
                      this.setState({ isThirtyMin: false });
                      this.setState({ isFirstStepVis: "flex" });
                      this.setState({ isSecondYesStepVis: "none" });
                      this.setState({ isThirdYesStepVis: "none" });
                      this.setState({ isSecondNoStepVis: "none" });
                      this.setState({ isThirdNoStepVis: "none" });
                      this.setState({ nextBtnState: "next" });
                      this.setState({ otherActivity: "" });
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
                  //backgroundColor:"red"
                }}
              >
                <Text style={{ fontSize: 24, fontWeight: "bold" }}>
                  Tell us your day!{" "}
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
                  //backgroundColor: "red",
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
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginBottom: "10%",
                    }}
                  >
                    Did you do any other activities (if yes, what activity and
                    when)?
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
                        flex: 0.5,
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
                    How satisfied are you with today's activity?
                  </Text>
                  <SwitchSelector
                    options={[
                      { label: "😕 Negative", value: "Negative" },
                      { label: "😑 Neutral", value: "Neutral" },
                      { label: "🙂 Positive", value: "Positive" },
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
                      if (this.state.isActivityCompleted) {
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
                      this.setState({ nextBtnState: "next" });

                      this.setState({ feeling: "Neutral" });
                      this.setState({ isActivityCompleted: false });
                      this.setState({ isThirtyMin: false });
                      this.setState({ isFirstStepVis: "flex" });
                      this.setState({ isSecondYesStepVis: "none" });
                      this.setState({ isSecondNoStepVis: "none" });
                      this.setState({ isThirdNoStepVis: "none" });
                      this.setState({ isThirdYesStepVis: "none" });

                      let dailyReport = {};
                      dailyReport.isDailyReport = true;
                      dailyReport.isExerciseToday = this.state.isActivityCompleted;
                      if (this.state.isActivityCompleted) {
                        dailyReport.otherActivity = this.state.otherActivity;
                      } else {
                        dailyReport.otherActivity = "none";
                      }
                      dailyReport.feeling = this.state.feeling;

                      dailyReport.end = moment(this.state.noEventDayReportDate)
                        .format()
                        .slice(0, 19);
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

                      // eventToUpdate.isThirtyMin = this.state.isThirtyMin;
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
                      this.setState({ isThirtyMin: false });
                      this.setState({ otherActivity: "" });
                      this.updateView();
                    } else if (this.state.nextBtnState === "next") {
                      this.setState({ isBackBtnVis: false });
                      this.setState({ isFirstStepVis: "none" });
                      this.setState({ nextBtnState: "next2" });
                      if (this.state.isActivityCompleted) {
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
                      this.setState({ btnName: "Submit" });
                      this.setState({ nextBtnState: "submit" });
                      this.setState({ isSecondYesStepVis: "none" });
                      this.setState({ isThirdYesStepVis: "flex" });
                      this.setState({ isThirdNoStepVis: "none" });
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
                  // backgroundColor:"red",

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
                  // backgroundColor:"red",

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
                    backgroundColor: "#BDBDBD",
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
                      // backgroundColor: "red",
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
                      {this.state.detailViewTemp}°C
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flex: 0.1,
                    marginTop: 10,
                    width: "100%",
                    backgroundColor: "#BDBDBD",
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
                      {this.state.detailViewTemp}°C
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
                      // backgroundColor: "red",
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
                      {this.state.detailViewTemp}°C
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
          draggableRange={{ top: 250, bottom: 100 }}
          showBackdrop={false}
          ref={(c) => (this._panel = c)}
        >
          <View
            style={{
              height: 300,
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
                      width: 60,
                      height: 30,
                      borderRadius: 15,
                      marginTop: 5,
                      marginRight: 5,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    disabled={false}
                    onPress={async () => {
                      await this.resetCalendarView();
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      Reset
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "black",
                      // color: "white",
                      width: 90,
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
                      View event
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
                  {this.state.detailViewTemp}°C
                </Text>
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
                marginTop: 20,
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
                    Activity
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
                    cancelStyle={{ backgroundColor: "grey", borderRadius: 15 }}
                    cancelTextStyle={{ fontWeight: "bold", color: "white" }}
                    data={this.state.activityData}
                    initValue={this.state.activityPickerInitVal}
                    onChange={async (item) => {
                      this.selectedActivity = item.label;
                      this.isActivitySelected = true;
                      let newListByActivity = [];
                      let currentList = [];
                      if (!this.state.timeFilteredList) {
                        await this.resetCalendarView();
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
                        await this.setState({ eventFilteredList: true });
                        await this.setState({ timeFilteredList: false });
                      } else {
                        currentList = this.state.eventsThisMonth;
                        //let tempList = currentList;
                        await this.setState({ eventFilteredList: false });
                        await this.setState({ timeFilteredList: false });
                      }

                      console.log(
                        "this.state.eventFilteredList",
                        this.state.eventFilteredList
                      );
                      console.log(
                        "this.state.timeFilteredList",
                        this.state.timeFilteredList
                      );

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

                      //this.setState({tempList:tempList})

                      await this.setState({ eventsThisMonth: newEventList });

                      this.monthCalRef.current.processEvents();
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
                  <DateTimePicker
                    value={this.state.datePickerDate}
                    mode="default"
                    is24Hour={true}
                    display="default"
                    onChange={async (e, date) => {
                      //let setDate = moment(date);
                      console.log("DateTimePicker", date);
                      let startHour = moment(date).hour();
                      this.setState({ datePickerDate: date });
                      let newList = [];

                      if (this.state.eventFilteredList) {
                        if (!this.state.timeFilteredList) {
                          await this.resetCalendarView();
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
                      console.log(
                        "this.state.eventFilteredList",
                        this.state.eventFilteredList
                      );
                      console.log(
                        "this.state.timeFilteredList",
                        this.state.timeFilteredList
                      );
                      this.setState({ date: new Date() });

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
                      await this.setState({ eventsThisMonth: newList });

                      this.monthCalRef.current.processEvents();
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
                marginTop: 20,
              }}
            >
              <View
                style={{
                  flex: 0.7,
                  backgroundColor: "white",
                  height: 50,
                  borderRadius: 15,
                  borderWidth: 2,
                  borderColor: "black",
                  marginRight: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <TextInput
                  style={{ fontSize: 16, marginLeft: 5 }}
                  placeholder="add self-defined activity"
                  value={this.state.userDefinedActivityText}
                  onChangeText={(text) =>
                    this.setState({ userDefinedActivityText: text })
                  }
                ></TextInput>
                <View style={{}}>
                  <TouchableOpacity
                    onPress={async () => {
                      let activityList = this.state.activityData;
                      // console.log("activityList",activityList);
                      this.index++;
                      let newActivity = {
                        key: this.index,
                        label: this.state.userDefinedActivityText,
                      };
                      // console.log("newActivity",newActivity);
                      activityList.push(newActivity);
                      this.setState({ userDefinedActivityText: activityList });
                      await this.dataModel.updateUserActivities(
                        this.userKey,
                        this.state.userDefinedActivityText
                      );
                    }}
                  >
                    <Ionicons name="ios-add-circle" size={30} color={"black"} />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                disabled={this.state.isPlanBtnDisable}
                onPress={() => this.onPlanBtnPressed()}
                style={{
                  flex: 0.3,
                  backgroundColor: "black",
                  color: "white",
                  width: 100,
                  height: 50,
                  borderRadius: 15,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SlidingUpPanel>
      </View>
    );
  }
}
