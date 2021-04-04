import React, { useState } from "react";
import {
  TextInput,
  Text,
  View,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
  Modal,
  LayoutAnimation,
  Button,
  Animated,
  Dimensions,
  FlatList,
} from "react-native";

import EventCalendar from "react-native-events-calendar";
import { Calendar } from "react-native-big-calendar";
import { log } from "react-native-reanimated";

export class MonthCalendar extends React.Component {
  constructor(props) {
    console.log("change detected");
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
    this.weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    this.nDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    //this.thisMonthEvents = this.props.thisMonthEvents;
    // this.lastMonthEvents = this.props.lastMonthEvents;
    // this.nextMonthEvents = this.props.nextMonthEvents;

    this.dayEventsList;

    this.state = {
      activeDate: this.props.monthCalCurrDate,
      //thisMonthEvents: this.thisMonthEvents,
      dayEventsList: [],
    };
    this.processEvents();
  }

  onPress = async (item) => {
    console.log("item pressed");
    await this.props.onPress(
      item,
      this.props.monthCalCurrDate.getMonth(),
      this.months[this.props.monthCalCurrDate.getMonth()]
    );
    this.processEvents();
    // EventRegister.emit("calendarPressed","pressed"+item);
  };
  processEvents = () => {
    //console.log("ProcessEvents", this.state.thisMonthEvents);
    console.log("ProcessEvents");
    let eventListDates = [];
    for (let event of this.props.thisMonthEvents) {
      let dateNum = String(event.start).slice(8, 10);
      if (!eventListDates.includes(dateNum)) {
        eventListDates.push(dateNum);
      }
    }
    let dayEventsList = [];
    for (let dateNum of eventListDates) {
      let dayEventObj = {
        dateNum: parseInt(dateNum),
        events: [],
      };
      dayEventsList.push(dayEventObj);
    }
    for (let date of dayEventsList) {
      for (let event of this.props.thisMonthEvents) {
        let dateNum = parseInt(String(event.start).slice(8, 10));
        if (dateNum === date.dateNum) {
          let newEvent = Object.assign({}, event);
          newEvent.id = event.end + event.start;
          newEvent.identifier = "default";
          date.events.push(newEvent);
        }
      }
    }
    this.dayEventsList = dayEventsList;
    this.setState({ dayEventsList: dayEventsList });
  };

  generateMatrix = () => {
    var matrix = [];
    // Create header
    matrix[0] = this.weekDays;
    var year = this.props.monthCalCurrDate.getFullYear();
    var month = this.props.monthCalCurrDate.getMonth();
    var firstDay = new Date(year, month, 1).getDay();

    var maxDays = this.nDays[month];
    if (month == 1) {
      if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
        maxDays += 1;
      }
    }
    var counter = 1;
    for (var row = 1; row < 6; row++) {
      matrix[row] = [];
      for (var col = 0; col < 7; col++) {
        matrix[row][col] = -1;
        if (row == 1 && col >= firstDay) {
          // Fill in rows only after the first day of the month
          matrix[row][col] = counter++;
        } else if (row > 1 && counter <= maxDays) {
          // Fill in rows only if the counter's not greater than
          // the number of days in the month
          matrix[row][col] = counter++;
        }
      }
    }

    return matrix;
  };

  render() {
    var matrix = this.generateMatrix();
    var rows = [];
    //let { width } = Dimensions.get("window");
    rows = matrix.map((row, rowIndex) => {
      // let countKey = 0;
      // var additionalView = row.map(() => {
      //   return (
      //     <View
      //       style={[
      //         { flex: 0.5, backgroundColor: "blue" },
      //         { transform: [{ scale: 0.5 }] },
      //       ]}
      //     >
      //       <Text>1</Text>
      //       {/* <EventCalendar
      //         eventTapped={console.log("tap")}
      //         size = {1}
      //         width={width/10}
      //       /> */}
      //       {/* <Calendar
      //         events={[{title:"test",start:new Date(2021,3,21,5,0),end: new Date(2021,3,21,6,0)}]}
      //         height={100}
      //         mode="day"

      //       /> */}
      //     </View>
      //   );
      // });
      var rowItems = row.map((item, colIndex) => {
        //
        if (rowIndex === 0) {
          return (
            // <Calendar
            //     events={[{title:"test",start:new Date(2021,3,21,5,0),end: new Date(2021,3,21,6,0)}]}
            //     height={5}
            //     mode="day"

            //   />
            <View
              style={{
                flex: 1,
                textAlign: "center",
                height: 18,
                flexDirection: "column",
                alignContent: "space-between",
              }}
            >
              <Text
                style={{
                  flex: 1,
                  textAlign: "center",
                  height: 18,
                  // Highlight header
                  backgroundColor: rowIndex == 0 ? "#ddd" : "#fff",

                  // Highlight Sundays
                  color: colIndex == 0 ? "#a00" : "#000",
                  // Highlight current date
                  fontWeight:
                    item == this.props.monthCalCurrDate.getDate() ? "bold" : "300",
                }}
                // onPress={() => this._onPress(item)}
              >
                {item != -1 ? item : ""}
              </Text>
              {/* <View><Text>1</Text></View> */}
            </View>
          );
        } else {
          let flatEventList = [];
          let dayEventsList;
          if (this.state.dayEventsList.length === 0) {
            dayEventsList = this.dayEventsList;
          } else {
            dayEventsList = this.state.dayEventsList;
          }
          //console.log("else starting")
          for (let dayEvent of dayEventsList) {
            //console.log("dayEvent", dayEvent);
            //console.log("item",item);

            if (item == dayEvent.dateNum) {
              flatEventList = dayEvent.events;
              //console.log("flatEventList created");
            }
          }
          let iconNum = "";
          let findWeather = false;
          for (let dayWeather of this.props.weatherThisMonth) {
            console.log("dayWeather",dayWeather);
            
            if (item == dayWeather.date) {
              findWeather = true;
              iconNum = dayWeather.img;
            }
            if (!findWeather) {
              iconNum = "unknown"
            }
          }
          return (
            // <Calendar
            //     events={[{title:"test",start:new Date(2021,3,21,5,0),end: new Date(2021,3,21,6,0)}]}
            //     height={5}
            //     mode="day"

            //   />

            <View
              style={{
                flex: 1,
                textAlign: "center",
                height: "70%",
                //backgroundColor: "blue",
                flexDirection: "column",
                alignContent: "space-between",
                justifyContent: "space-between",
              }}
            >
            <View style={{flex:0.2,height: 18, flexDirection:"row", backgroundColor:"white"}}>
              <Text
                style={{
                  flex: 0.5,
                  textAlign: "center",
                  height: 18,
                  justifyContent: "flex-start",
                  alignContent: "flex-start",
                  // Highlight header

                  backgroundColor: rowIndex == 0 ? "#ddd" : "#fff",
                  // Highlight Sundays
                  color: colIndex == 0 ? "#a00" : "#000",
                  // Highlight current date
                  fontWeight:
                    item == this.props.monthCalCurrDate.getDate() ? "bold" : "300",
                }}
                onPress={() => this.onPress(item)}
              >
                {item != -1 ? item : ""}
              </Text>

              {/* <Text style={{ flex: 0.5, textAlign: "center", backgroundColor:"red" }}>{iconNum}</Text> */}
              <Image source={{uri: "http://openweathermap.org/img/w/" + iconNum + ".png"}} style={{width:20, height:20}}></Image>
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: "column",
                  // backgroundColor:"green",
                  height: "100%",
                  justifyContent: "flex-start",
                }}
              >
                <View
                  style={{
                    //backgroundColor: "blue",
                    flex: 1,
                    height: "100%",
                    width: "100%",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                  }}
                >
                  {/* <View
                    style={{
                      flex: 0.5,
                      width: "100%",
                      height:"100%",
                      marginHorizontal: 5,
                      backgroundColor: "green",
                    }}
                  > */}
                  <FlatList
                    style={{ marginTop: 1, height: "100%", width: "100%" }}
                    data={flatEventList}
                    renderItem={({ item }) => {
                      //console.log("render flat",item);

                      if (item.isPlanned) {
                        if (item.isReported) {
                          if (!item.isActivityCompleted) {
                            return (
                              <View
                                style={{
                                  width: "100%",
                                  backgroundColor: "red",
                                  borderRadius: 5,
                                  flex: 1,
                                }}
                              >
                                <Text
                                  style={{ textAlign: "center", fontSize: 5 }}
                                >
                                  {/* {item.start} */}
                                  event
                                </Text>
                              </View>
                            );
                          } else {
                            if (item.isThirtyMin) {
                              return (
                                <View
                                  style={{
                                    width: "100%",
                                    backgroundColor: "green",
                                    borderRadius: 5,
                                    flex: 1,
                                  }}
                                >
                                  <Text
                                    style={{ textAlign: "center", fontSize: 5 }}
                                  >
                                    {/* {item.start} */}
                                    event
                                  </Text>
                                </View>
                              );
                            } else {
                              return (
                                <View
                                  style={{
                                    width: "100%",
                                    backgroundColor: "yellow",
                                    borderRadius: 5,
                                    flex: 1,
                                  }}
                                >
                                  <Text
                                    style={{ textAlign: "center", fontSize: 5 }}
                                  >
                                    {/* {item.start} */}
                                    event
                                  </Text>
                                </View>
                              );
                            }
                          }
                        } else {
                          return (
                            <View
                              style={{
                                width: "100%",
                                backgroundColor: "white",
                                borderWidth: 1,
                                borderColor: "black",
                                borderRadius: 5,
                                flex: 1,
                              }}
                            >
                              <Text
                                style={{ textAlign: "center", fontSize: 5 }}
                              >
                                {/* {item.start} */}
                                event
                              </Text>
                            </View>
                          );
                        }
                      } else {
                        return (
                          <View
                            style={{
                              width: "100%",
                              backgroundColor: "grey",
                              borderRadius: 5,
                              flex: 1,
                            }}
                          >
                            <Text style={{ textAlign: "center", fontSize: 5 }}>
                              {/* {item.start} */}
                              event
                            </Text>
                          </View>
                        );
                      }
                    }}
                  />
                  {/* </View> */}
                </View>
                <View
                  style={{
                    //backgroundColor: "red",
                    flex: 1,
                    height: "100%",
                    alignItems: "flex-end",
                    justifyContent: "flex-end",
                  }}
                ></View>
              </View>
            </View>
          );
        }
      });
      if (rowIndex === 0) {
        return (
          <View
            style={{
              flex: 0.1,
              flexDirection: "column",
              //backgroundColor: "red",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row" }}>{rowItems}</View>
            {/* <View style={{ flexDirection: "row" }}>{additionalView}</View> */}
          </View>
        );
      } else {
        return (
          <View
            style={{
              flex: 1,
              flexDirection: "column",

              paddingTop: 0,
              marginTop: 0,
              //backgroundColor: "blue",

              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row" }}>{rowItems}</View>
            {/* <View style={{ flexDirection: "row" }}>{additionalView}</View> */}
          </View>
        );
      }
    });
    return (
      <View style={{ height: "95%" }}>
        <Text
          style={{
            //backgroundColor: "blue",
            fontWeight: "bold",
            fontSize: 18,
            textAlign: "center",
          }}
        >
          {this.months[this.props.monthCalCurrDate.getMonth()]}
          {this.props.monthCalCurrDate.getFullYear()}
        </Text>
        {rows}
      </View>
    );
  }
}
