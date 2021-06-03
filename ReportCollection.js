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

export class ReportCollection extends React.Component {
  constructor(props) {
    super(props);
    this.userKey = this.props.route.params.userKey;
    this.userPlans = this.props.route.params.userPlans;
    this.updateList = [];
    this.preList = [];
    let todayDate = new Date();
    let dailyReport = {};
    this.dataModel = getDataModel();
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
      nextBtnState: "submit",
      otherActivity: "",
      reportDate: "",
      btnName: "Submit",
      preList: this.preList,
      isBackBtnVis: true,
    };
  }

  render() {
    return (
      <View
        style={{
          alignContent: "center",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
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
                    How satisfied are you with what you've experienced as a result of {this.state.otherActivity} on {this.state.reportDate}?
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
        <Text
          style={{
            fontSize: 25,
            fontWeight: "bold",
            marginTop: 100,
            marginLeft: 40,
          }}
        >
          Unfinished Reports
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
    );
  }
}
