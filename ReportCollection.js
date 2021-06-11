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
import { FlatList } from "react-native-gesture-handler";
import moment, { min } from "moment";
import { MaterialIcons } from "@expo/vector-icons";
import SwitchSelector from "react-native-switch-selector";
import { Ionicons } from "@expo/vector-icons";

export class ReportCollection extends React.Component {
  constructor(props) {
    super(props);
    this.needsUpdate = false;
    this.userKey = this.props.route.params.userKey;
    this.userPlans = this.props.route.params.userPlans;
    this.pastPlans = this.props.route.params.pastPlans;
    console.log(
      "this.props.route.params.planToday",
      this.props.route.params.planToday
    );
    this.todayPlan = this.props.route.params.planToday;
    this.updateList = [];
    this.preList = [];
    let todayDate = new Date();
    let dailyReport = {};
    this.dataModel = getDataModel();
    this.eventToday = {
      title: "default",
      start: "default",
    };
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
      this.preList.push(dailyReport);
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
        this.preList.push(report);
      }
    }
    console.log(this.preList);
    this.previousReportList = [];
    for (let event of this.userPlans) {
      if (event.start) {
        this.updateList.push(event);
      }
    }
    this.state = {
      isNoEventDayReportModalVis: false,
      feeling: "Neutral",
      isActivityCompleted: false,
      isOtherActivity: false,
      isFirstStepVis: "flex",
      isSecondYesStepVis: "none",
      isThirdYesStepVis: "none",
      isSecondNoStepVis: "none",
      isThirdNoStepVis: "none",
      nextBtnState: "next",
      otherActivity: "",
      reportDate: "",
      btnName: "Next",
      preList: this.preList,
      isBackBtnVis: true,
      pastPlans: this.pastPlans,
      todayPlan: this.todayPlan,

      isReportModalVis: false,
      reason: "",
    };
  }

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
    this.setState({ isNoEventDayReportModalVis: "none" });

    this.setState({ nextBtnState: "next" });
    this.setState({ btnName: "Next" });
    this.setState({ isBackBtnVis: true });
    this.setState({ reason: "" });
    this.setState({ otherActivity: "" });
  };

  render() {
    let planTodayView;
    if (this.state.todayPlan.length != 0) {
      planTodayView = (
        <FlatList
          data={this.state.todayPlan}
          contentContainerStyle={{
            justifyContent: "center",
            alignItems: "center",
          }}
          renderItem={({ item }) => {
            return (
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 30,
                  borderWidth: 2,
                  width: 300,
                  borderColor: "black",
                  margin: 5,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 0.8 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "bold",
                      marginLeft: 20,
                      marginTop: 5,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text style={{ marginLeft: 20, marginBottom: 5 }}>
                    {item.start.slice(5, 10)} at {item.start.slice(11, 16)}
                  </Text>
                </View>
                <View style={{ flex: 0.2, marginRight: 20 }}>
                  <TouchableOpacity
                    disabled={false}
                    onPress={() => {
                      this.eventToday = item;
                      this.setState({ isReportModalVis: true });
                      this.setState({ btnName: "Next" });
                      this.setState({ nextBtnState: "next" });
                      // let updateList = this.state.pastPlans;
                      // let index = updateList.indexOf(item);
                      // if (index > -1) {
                      //   updateList.splice(index, 1);
                      // }
                      // this.setState({ pastPlans: updateList });
                    }}
                    style={{
                      backgroundColor: "black",
                      color: "white",
                      width: 60,
                      height: 25,
                      borderRadius: 30,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: 15,
                      }}
                    >
                      Report
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      );
    } else {
      planTodayView = (
        <Text style={{ fontSize: 16, fontWeight: "bold", marginLeft: 40 }}>
          No activity planned for today
        </Text>
      );
    }
    return (
      <View
        style={{
          alignContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        {/* Plan Report */}

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
                    onPress={() => {
                      this.resetReport();
                    }}
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
                    marginTop: "10%",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginBottom: "10%",
                    }}
                  >
                    You planned {this.eventToday.title} on{" "}
                    {this.eventToday.start.slice(5, 10)} at{" "}
                    {this.eventToday.start.slice(11, 16)}, did you follow your
                    plan?
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
                    width: "100%",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginBottom: "10%",
                      marginTop: "20%",
                    }}
                  >
                    Did you engage yourself in any physical exercise?
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
                        console.log("SwitchSelector value", value);
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
                    width: "100%",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginBottom: "10%",
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
                    width: "100%",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginBottom: "10%",
                      marginTop: "20%",
                    }}
                  >
                    Tell us the reason why you didn't {this.eventToday.title} as
                    planned
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
                    width: "100%",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginBottom: "10%",
                      marginTop: "20%",
                    }}
                  >
                    Tell us what physical exercise you did?
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
                      maxLength={35}
                      onChangeText={(text) => {
                        this.setState({ otherActivity: text });
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
                    // console.log(
                    //   "back pressed: this.state.nextBtnState",
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
                      if (this.state.isActivityCompleted) {
                        this.setState({ isBackBtnVis: true });
                        this.setState({ isFirstStepVis: "flex" });
                        this.setState({ isThirdYesStepVis: "none" });
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
                          //this.setState({ isOtherActivity: })
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
                      //this.setState({ reason: "" });
                      this.setState({ isActivityCompleted: false });
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
                      this.resetReport();
                      this.needsUpdate = true;

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
                          eventToUpdate.otherActivity = "";
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
                      this.setState({ feeling: "Neutral" });
                      this.setState({ isActivityCompleted: false });
                      this.setState({ isOtherActivity: false });
                      this.userPlans = this.dataModel.getUserPlans();
                      //this.updateView();

                      let todayDate = new Date();
                      let eventDate = new Date(this.eventToday.start);
                      let updateList = [];
                      if (
                        todayDate.getDate() === eventDate.getDate() &&
                        todayDate.getMonth() === eventDate.getMonth()
                      ) {
                        updateList = this.state.todayPlan;
                        console.log("updateList", updateList);
                        let index = updateList.indexOf(this.eventToday);
                        if (index > -1) {
                          updateList.splice(index, 1);
                        }
                        this.setState({ todayPlan: updateList });
                      } else {
                        updateList = this.state.pastPlans;
                        let index = updateList.indexOf(this.eventToday);
                        if (index > -1) {
                          updateList.splice(index, 1);
                        }
                        this.setState({ pastPlans: updateList });
                      }
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
        {/* noEventDayReport */}
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
                      this.setState({ isOtherActivity: false });
                      this.setState({ isFirstStepVis: "flex" });
                      this.setState({ isSecondYesStepVis: "none" });
                      this.setState({ isThirdYesStepVis: "none" });
                      this.setState({ isSecondNoStepVis: "none" });
                      this.setState({ isThirdNoStepVis: "none" });
                      this.setState({ nextBtnState: "submit" });
                      this.setState({ otherActivity: "" });
                      this.setState({ isBackBtnVis: true });
                      this.setState({ btnName: "Submit" });

                      //this.resetReport();
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
                  Daily Report
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
                    {/* //No event day report */}
                    Did you do any physical exercise on {this.state.reportDate}?
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
                    Tell us what physical exercise you did?
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
                      maxLength={35}
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
                    {this.state.reportDate}?
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
                  {/* <Text
                    style={{
                      fontWeight: "bold",
                      marginBottom: "10%",
                    }}
                  >
                    Tell us the reason why you didn't {this.eventToday.title} as
                    planned
                  </Text> */}
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
                      this.setState({ isDailyReportBtnDisabled: true });
                      this.setState({ isNoEventDayReportModalVis: false });
                      this.setState({ nextBtnState: "submit" });
                      this.setState({ isBackBtnVis: true });
                      this.setState({ btnName: "Submit" });

                      this.setState({ feeling: "Neutral" });
                      this.setState({ isActivityCompleted: false });
                      this.setState({ isOtherActivity: false });
                      this.setState({ isFirstStepVis: "flex" });
                      this.setState({ isSecondYesStepVis: "none" });
                      this.setState({ isSecondNoStepVis: "none" });
                      this.setState({ isThirdNoStepVis: "none" });
                      this.setState({ isThirdYesStepVis: "none" });
                      //this.resetReport();
                      this.needsUpdate = true;
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

                      dailyReport.start = this.state.reportDate;
                      dailyReport.end = dailyReport.start;

                      let timeStamp = moment(new Date()).format();
                      dailyReport.timeStamp = timeStamp;
                      await this.dataModel.createNewPlan(
                        this.userKey,
                        dailyReport
                      );
                      let index;
                      let listToUpdate = this.state.preList;
                      for (let record of listToUpdate) {
                        if (record.start === this.state.reportDate) {
                          index = listToUpdate.indexOf(record);
                        }
                      }
                      if (index > -1) {
                        listToUpdate.splice(index, 1);
                      }
                      this.setState({ preList: listToUpdate });

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
                      //this.setState({ isOtherActivity: false });
                      this.setState({ isOtherActivity: false });
                      this.setState({ otherActivity: "" });
                      //this.updateView();
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            marginTop: 50,
          }}
        >
          <View style={{}}>
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.navigate("Home Screen", {
                  needsUpdate: this.needsUpdate,
                });
              }}
            >
              <Ionicons name="arrow-back-circle" size={40} color="black" />
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Text
              style={{
                fontSize: 25,
                fontWeight: "bold",
                // marginTop: 50,
                marginLeft: 20,
              }}
            >
              Uncompleted Reports
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 0.5,
            backgroundColor: "#D8D8D8",
            width: "95%",
            padding: 10,
            borderRadius: 20,
            marginTop: 20,
          }}
        >
          <Text style={{ fontSize: 20, marginLeft: 40, fontWeight: "bold" }}>
            Activity Today
          </Text>
          <View style={{ flex: 0.3 }}>{planTodayView}</View>
          <Text
            style={{
              fontSize: 20,
              marginLeft: 40,
              fontWeight: "bold",
              marginTop: 20,
            }}
          >
            Past Activities to Report
          </Text>

          <View
            style={{
              flex: 0.8,
              justifyContent: "flex-start",
              alignItems: "center",
              flexDirection: "column",
              width: "100%",
            }}
          >
            <FlatList
              data={this.state.pastPlans}
              style={{ flex: 0.8 }}
              contentContainerStyle={{
                justifyContent: "flex-start",
                alignItems: "center",
                // backgroundColor: "blue",
              }}
              renderItem={({ item }) => {
                return (
                  <View
                    style={{
                      backgroundColor: "white",
                      borderRadius: 30,
                      borderWidth: 2,
                      width: 300,
                      borderColor: "black",
                      margin: 5,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flex: 0.8 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "bold",
                          marginLeft: 20,
                          marginTop: 5,
                        }}
                      >
                        {item.title}
                      </Text>
                      <Text style={{ marginLeft: 20, marginBottom: 5 }}>
                        {item.start.slice(5, 10)} at {item.start.slice(11, 16)}
                      </Text>
                    </View>
                    <View style={{ flex: 0.2, marginRight: 20 }}>
                      <TouchableOpacity
                        disabled={false}
                        onPress={async () => {
                          this.eventToday = item;
                          this.setState({ isReportModalVis: true });
                          this.setState({ btnName: "Next" });
                          this.setState({ nextBtnState: "next" });

                          // let updateList = this.state.pastPlans;
                          // let index = updateList.indexOf(item);
                          // if (index > -1) {
                          //   updateList.splice(index, 1);
                          // }
                          // this.setState({ pastPlans: updateList });
                        }}
                        style={{
                          backgroundColor: "black",
                          color: "white",
                          width: 60,
                          height: 25,
                          borderRadius: 30,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontWeight: "bold",
                            fontSize: 15,
                          }}
                        >
                          Report
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        </View>
        <View
          style={{
            flex: 0.5,
            backgroundColor: "#D8D8D8",
            width: "95%",
            padding: 10,
            borderRadius: 20,
            marginTop: 20,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              marginLeft: 40,
              fontWeight: "bold",
              marginTop: 20,
            }}
          >
            Uncompleted Daily Reports
          </Text>

          <FlatList
            data={this.preList}
            contentContainerStyle={{
              justifyContent: "center",
              alignItems: "center",
            }}
            style={{ marginTop: "15%" }}
            renderItem={({ item }) => {
              return (
                <View
                  style={{
                    backgroundColor: "white",
                    borderRadius: 30,
                    borderWidth: 2,
                    width: 300,
                    borderColor: "black",
                    margin: 5,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 0.8 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "bold",
                        marginLeft: 20,
                        marginTop: 5,
                      }}
                    >
                      {item.title}
                    </Text>
                    <Text style={{ marginLeft: 20, marginBottom: 5 }}>
                      {item.start.slice(5, 10)}
                    </Text>
                  </View>
                  <View style={{ flex: 0.2, marginRight: 20 }}>
                    <TouchableOpacity
                      disabled={false}
                      onPress={() => {
                        this.setState({ reportDate: item.start });
                        this.setState({ isNoEventDayReportModalVis: true });
                        this.setState({ btnName: "Submit" });
                        this.setState({ nextBtnState: "submit" });
                      }}
                      style={{
                        backgroundColor: "black",
                        color: "white",
                        width: 60,
                        height: 25,
                        borderRadius: 30,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: 15,
                        }}
                      >
                        Report
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        </View>
      </View>
    );
  }
}
