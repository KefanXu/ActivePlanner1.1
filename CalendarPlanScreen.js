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

export class CalendarPlanScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMonthCalVis: true,
    };
    this.dataModel = getDataModel();
    this.userEmail = this.props.route.params.userEmail;
    this.eventsLastMonth = this.props.route.params.eventsLastMonth;
    this.eventsThisMonth = this.props.route.params.eventsThisMonth;
    this.eventsNextMonth = this.props.route.params.eventsNextMonth;
  }

  render() {
    let calView;
    if (this.state.isMonthCalVis) {
      console.log(this.state.isMonthCalVis);
      calView = <MonthCalendar thisMonthEvents={this.eventsThisMonth} lastMonthEvents={this.eventsLastMonth} nextMonthEvents={this.eventsNextMonth}/>;
    } else {
      calView = (
        
        <View style={{backgroundColor:"red",justifyContent:"flex-start"},[{ transform: [{ scaleY: 1 }] }]}> 

        <Calendar
          // events={[{ title: "test", start: new Date(), end: new Date() }]}
          contentContainerStyle={{justifyContent:"flex-start"}}
          events={this.eventsThisMonth}
          eventCellStyle={{backgroundColor:"grey"}}
          height={750}
          scrollOffsetMinutes={480}
          showTime={false}
          mode="week"
          showTime={true}
          swipeEnabled={true}
          onPressCell={() => alert("cell pressed")}
          onPressDateHeader={() => alert("header pressed")}
          onPressEvent={()=>alert("event pressed")}
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
        <View style={{ flexDirection: "column", backgroundColor: "",justifyContent:"flex-start" }}>
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
      </View>
    );
  }
}
