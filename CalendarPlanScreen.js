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

    this.selectedActivity;
    this.isActivitySelected = false;
    //console.log(this.eventsThisMonth);

    this.userKey = this.props.route.params.userInfo.key;
    this.userPlans = this.props.route.params.userInfo.userPlans;
    this.isReportModalVis = false;

    let combinedEventList = this.eventsThisMonth;
    for (let event of this.userPlans) {
      if (event.title) {
        //console.log("event", event);
        let plannedEvent = Object.assign({}, event);
        combinedEventList.push(plannedEvent);
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
      eventsLastMonth: this.eventsLastMonth,
      eventsThisMonth: combinedEventList,
      eventsNextMonth: this.eventsNextMonth,
      isFromWeekView: false,
      indexView: "Month",
      newListByActivity: [],
      isReportModalVis: this.isReportModalVis,
      isDayReportModalVis: false,
    };
    // this.monthCalRef = React.createRef();
  }
  getEventToday = () => {
    let userPlanList = this.userPlanList;
    let eventToday;
    let currentDate = moment(new Date()).format().slice(0, 10);
    for (let event of userPlanList) {
      if (event.end) {
        let eventDate = event.end.slice(0, 10);
        if (currentDate === eventDate) {
          eventToday = Object.assign({}, event);
        }
      }
    }
    return eventToday;
  };
  reportPopUp = (userPlanList) => {
    let currentDate = moment(new Date()).format().slice(0, 10);
    //console.log("userPlanList", userPlanList);
    for (let event of userPlanList) {
      if (event.end) {
        let eventDate = event.end.slice(0, 10);
        console.log(eventDate);
        if (currentDate === eventDate) {
          if (!event.isReported) {
            this.isReportModalVis = true;
          }
        }
      }
    }
    console.log("this.isReportModalVis", this.isReportModalVis);
  };
  onPress = (item, monthNum, month) => {
    this.setState({ panelTop: "plan for " + month + " " + item });
    this._panel.show();
    this.setState({ isFromWeekView: false });
    this.setState({ selectedDate: item });
    this.setState({ selectedMonth: monthNum });
    this.setState({ isPlanBtnDisable: false });
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
      color: "white",
      title: activityName,
    };
    // console.log(this.state.eventsThisMonth);
    let newEventList = this.eventsThisMonth;
    console.log("newEventList", newEventList);
    newEventList.push(newEvent);
    await this.setState({ eventsThisMonth: newEventList });
    console.log("updateEvent in main view");
    this._panel.hide();
    this.updateView();

    let timeStamp = moment(new Date()).format();

    newEvent.timeStamp = timeStamp;
    newEvent.isReported = false;
    await this.dataModel.createNewPlan(this.userKey, newEvent);

    //this.componentWillMount
    // this.monthCalRef.current.reSetEvents(this.state.eventsThisMonth);
  };
  updateView = () => {
    console.log("this.state.eventsThisMonth", this.state.eventsThisMonth);
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
        <MonthCalendar
          ref={this.monthCalRef}
          thisMonthEvents={this.state.eventsThisMonth}
          lastMonthEvents={this.state.eventsLastMonth}
          nextMonthEvents={this.state.eventsNextMonth}
          onPress={(item, monthNum, month) =>
            this.onPress(item, monthNum, month)
          }
        />
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
            events={this.state.eventsThisMonth}
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
                flex: 0.9,
                width: "95%",
                backgroundColor: "white",
                borderWidth: 2,
                borderColor: "black",
                flexDirection: "column",
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
              <View style={{width:"100%", flexDirection:"column", justifyContent:"flex-end"}}>
                <TouchableOpacity
                  onPress={() => this.setState({ isReportModalVis: false })}
                  style={{justifyContent: "flex-end", alignContent:"flex-end" }}
                >
                  <MaterialIcons name="cancel" size={24} color="black" />

                </TouchableOpacity>
              </View>
              <View style={{ width: "80%", marginTop: "10%" }}>
                <Text style={{ fontSize: 24, fontWeight: "bold" }}>
                  Tell us your day!
                </Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "bold", marginTop: 5 }}
                >
                  The following questions only take seconds to complete
                </Text>
                <Text style={{fontSize:18, fontWeight:"bold",marginTop: 10}}>Question 1/3</Text>
                <View></View>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.isDayReportModalVis}
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
                width: "90%",
                backgroundColor: "red",
                flexDirection: "column",
                alignItems: "center",
                borderRadius: 15,
              }}
            >
              <TouchableOpacity
                onPress={() => this.setState({ isDayReportModalVis: false })}
                style={{ flex: 1, justifyContent: "flex-end" }}
              >
                <MaterialIcons name="cancel" size={24} color="black" />
              </TouchableOpacity>
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
        <TouchableOpacity
          onPress={() => {
            this._panel.show();
            //this.setState({ isReportModalVis: true });
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
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            this.setState({ isReportModalVis: true });
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
        </TouchableOpacity>
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
          draggableRange={{ top: 500, bottom: 100 }}
          ref={(c) => (this._panel = c)}
        >
          <View
            style={{
              height: 500,
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
              <Text>{this.state.panelTop}</Text>
            </View>
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
              <DropDownPicker
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
                style={{ backgroundColor: "#fafafa", width: "50%", margin: 5 }}
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
              />
              <DateTimePicker
                value={this.state.date}
                mode="default"
                is24Hour={true}
                display="default"
                onChange={(e, date) => {
                  //let setDate = moment(date);
                  console.log(date.toString());
                  this.setState({ date: date });
                }}
                style={{
                  width: 100,
                  alignContent: "center",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              />
              <Text>
                {moment(this.state.date).add(30, "minutes").format("hh:mm")}
              </Text>
            </View>
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
              <Button
                title="Plan"
                disabled={this.state.isPlanBtnDisable}
                onPress={() => this.onPlanBtnPressed()}
              ></Button>
            </View>
          </View>
        </SlidingUpPanel>
      </View>
    );
  }
}
