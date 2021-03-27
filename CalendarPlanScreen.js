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

export class CalendarPlanScreen extends React.Component {
  constructor(props) {
    super(props);
    this.monthCalRef = React.createRef();
    this.dataModel = getDataModel();
    this.userEmail = this.props.route.params.userEmail;
    this.eventsLastMonth = this.props.route.params.eventsLastMonth;
    this.eventsThisMonth = this.props.route.params.eventsThisMonth;
    this.eventsNextMonth = this.props.route.params.eventsNextMonth;
    //console.log(this.eventsThisMonth);
    this.state = {
      isMonthCalVis: true,
      date: new Date(),
      panelTop: "Pick a date to plan",
      selectedDate: "",
      selectedMonth: "",
      isPlanBtnDisable: true,
      eventsLastMonth: this.eventsLastMonth,
      eventsThisMonth: this.eventsThisMonth,
      eventsNextMonth: this.eventsNextMonth,
    };
    // this.monthCalRef = React.createRef();
  }

  // componentWillUnmount = () => {
  //   this.listener = EventRegister.addEventListener("calendarPressed",(data) => {
  //     console.log(data);
  //   })
  // }
  // componentWillUnmount = () => {
  //   EventRegister.removeEventListener(this.listener);
  // }
  onPress = (item, monthNum, month) => {
    this.setState({ panelTop: "plan for " + month + " " + item });
    this._panel.show();
    this.setState({ selectedDate: item });
    this.setState({ selectedMonth: monthNum });
    this.setState({ isPlanBtnDisable: false });
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

    let startMinutes = moment(this.state.date).format("HH:mm:ss");
    let endMinutes = moment(this.state.date)
      .add(30, "minutes")
      .format("HH:mm:ss");
    let date = year + "-" + monthNum + "-" + dateNum + "T";
    let startTime = date + startMinutes;
    let endTime = date + endMinutes;

    let newEvent = {
      start: startTime,
      end: endTime,
      id: startTime + endTime,
      isPlanned: "planned",
      color: "green",
      title:"my plan"
    };
    // console.log(this.state.eventsThisMonth);
    let newEventList = this.state.eventsThisMonth;
    newEventList.push(newEvent);
    this.setState({ eventsThisMonth: newEventList });
    console.log("updateEvent in main view");
    this.monthCalRef.current.processEvents();
    this._panel.hide();
    //this.componentWillMount
    // this.monthCalRef.current.reSetEvents(this.state.eventsThisMonth);
  };

  render() {
    let calView;
    if (this.state.isMonthCalVis) {
      //console.log(this.state.isMonthCalVis);
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
      calView = (
        <View
          style={
            ({ backgroundColor: "red", justifyContent: "flex-start" },
            [{ transform: [{ scaleY: 1 }] }])
          }
        >
          <Calendar
            // events={[{ title: "test", start: new Date(), end: new Date() }]}
            contentContainerStyle={{ justifyContent: "flex-start" }}
            events={this.state.eventsThisMonth}
            eventCellStyle={(event) => { 
              if (event.color) {
                return({backgroundColor: event.color});
              } else {
                return({backgroundColor: "grey"})
              }
               }}
            height={750}
            scrollOffsetMinutes={480}
            showTime={false}
            mode="week"
            showTime={true}
            swipeEnabled={true}
            onPressCell={() => alert("cell pressed")}
            onPressDateHeader={() => {
              this._panel.show();
              console.log(
                "this.state.eventsThisMonth",
                this.state.eventsThisMonth
              );
            }}
            onPressEvent={() => alert("event pressed")}
          />
        </View>
      );
    }
    return (
      <View>
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
        <View>
          <SegmentedControl
            values={["Month", "Week"]}
            selectedIndex={"Month"}
            onChange={(event) => {
              // this.setState({
              //   selectedIndex: event.nativeEvent.selectedSegmentIndex,
              // });
              //console.log(event.nativeEvent.selectedSegmentIndex);
              if (event.nativeEvent.selectedSegmentIndex == 1) {
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
                onChangeItem={(item) =>
                  this.setState({
                    country: item.value,
                  })
                }
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
