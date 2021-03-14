import React, { useState } from "react";
import { render } from "react-dom";
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
} from "react-native";
import { getDataModel } from "./DataModel";

import ApiCalendar from 'react-google-calendar-api';
import {google} from 'googleapis';


export class CalendarPlanScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: []
    };
  }

  

  render() {
    return(
      true
    );
  }
}
