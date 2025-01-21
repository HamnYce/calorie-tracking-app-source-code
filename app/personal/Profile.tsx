import {
  ActivityLevel,
  BodyInfoModel,
  Cuisine,
  Gender,
  Intolerance,
} from "@/src/models/body_info/bodyInfoModel";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import InputSpinner from "react-native-input-spinner";
import { Button, Chip, Text, useTheme } from "react-native-paper";
import { clamp } from "react-native-reanimated";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

function bmiHealthString(bmi: number) {
  if (bmi < 18.5) {
    return "underweight";
  } else if (bmi < 25) {
    return "healthy";
  } else if (bmi < 30) {
    return "overweight";
  } else {
    return "obese";
  }
}

export default function Profile() {
  const theme = useTheme();
  const [bodyInfoModel, setBodyInfoModel] = useState<BodyInfoModel>();
  const [bodyInfo, setBodyInfo] = useState<{
    height: number;
    weight: number;
    dateOfBirth: Date;
    gender: Gender;
    activityLevel: ActivityLevel;
    intolerances: Intolerance[];
    cuisines: Cuisine[];
  }>();
  const [maxDate, setMaxDate] = useState(new Date());

  useEffect(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 13);
    setMaxDate(date);
  }, []);

  useEffect(() => {
    BodyInfoModel.bodyInfoRef().onSnapshot(() => {
      BodyInfoModel.load().then((bodyInfoModel) => {
        setBodyInfoModel(bodyInfoModel!);
        setBodyInfo({ ...bodyInfoModel! });
      });
    });
  }, []);

  return (
    <ScrollView
      style={{
        flex: 1,
        padding: 10,
        backgroundColor: theme.colors.background,
        paddingTop: 5,
      }}
    >
      <View style={{ margin: 5 }} />
      <Text variant="titleLarge">Body Information</Text>
      <View style={{ margin: 5 }} />
      <LinearGradient
        locations={[0.33, 0.74, 1]}
        colors={["#f33", "#3f3", "#f33"]}
        start={[0, 0]}
        end={[0.6, 0]}
        style={{ height: 20, borderRadius: 20 }}
      >
        <View
          style={{
            height: "100%",
            backgroundColor: "black",
            width: 2,
            left: (clamp(bodyInfoModel?.getBmi() ?? 0, 0, 50) * 2 + "%") as "100%",
          }}
        />
      </LinearGradient>

      <View>
        <Text variant="titleMedium" style={{ alignSelf: "center" }}>
          You're BMI is: {bodyInfoModel?.getBmi().toFixed(2) ?? "-"} (
          {bmiHealthString(bodyInfoModel?.getBmi() ?? 20)})
        </Text>
      </View>

      <View style={{ margin: 10 }} />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          height: 50,
        }}
      >
        <Text style={{ alignSelf: "center" }}>Height (cm): </Text>
        <InputSpinner
          max={300}
          min={90}
          step={0.1}
          longStep={1}
          value={bodyInfo?.height ?? 30}
          type="real"
          skin="clean"
          width="50%"
          accelerationDelay={0}
          editable={false}
          onChange={(value: number) => {
            bodyInfo && setBodyInfo({ ...bodyInfo, height: value });
          }}
        />
      </View>

      <View style={{ margin: 10 }} />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          height: 50,
        }}
      >
        <Text style={{ alignSelf: "center" }}>Weight (kg): </Text>
        <InputSpinner
          max={200}
          min={30}
          step={0.1}
          longStep={1}
          value={bodyInfo?.weight ?? 60}
          type="real"
          skin="clean"
          accelerationDelay={0}
          editable={false}
          width="50%"
          onChange={(value: number) => {
            bodyInfo && setBodyInfo({ ...bodyInfo, weight: value });
          }}
        />
      </View>

      <View style={{ margin: 10 }} />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          height: 50,
        }}
      >
        <Text style={{ alignSelf: "center" }}>
          Age ({`${bodyInfoModel && bodyInfoModel.getAge()}`}):{" "}
        </Text>
        {Platform.OS === "ios" && (
          <DateTimePicker
            onChange={(_e, newDate) => {
              newDate && bodyInfo && setBodyInfo({ ...bodyInfo, dateOfBirth: newDate });
            }}
            mode="date"
            display="inline"
            maximumDate={maxDate}
            value={bodyInfo?.dateOfBirth ?? new Date()}
          />
        )}
        {Platform.OS === "android" && (
          <Button
            onPress={() => {
              DateTimePickerAndroid.open({
                onChange: (_e, newDate) => {
                  newDate && bodyInfo && setBodyInfo({ ...bodyInfo, dateOfBirth: newDate });
                },
                mode: "date",
                display: "default",
                maximumDate: maxDate,
                value: bodyInfo?.dateOfBirth ?? new Date(),
              });
            }}
          >
            Show Datetime
          </Button>
        )}
      </View>

      <View style={{ margin: 10 }} />

      <Text variant="titleMedium">Gender</Text>
      <View style={{ flex: 1, flexDirection: "row", justifyContent: "center" }}>
        <Chip
          onPress={() => bodyInfo && setBodyInfo({ ...bodyInfo, gender: "M" })}
          selected={bodyInfo?.gender == "M"}
          showSelectedCheck={false}
          style={{
            backgroundColor: bodyInfo?.gender == "M" ? theme.colors.secondaryContainer : "white",
            borderWidth: 1,
          }}
        >
          Male
        </Chip>
        <View style={{ margin: 10 }} />
        <Chip
          onPress={() => bodyInfo && setBodyInfo({ ...bodyInfo, gender: "F" })}
          selected={bodyInfo?.gender == "F"}
          showSelectedCheck={false}
          style={{
            backgroundColor: bodyInfo?.gender == "F" ? theme.colors.secondaryContainer : "white",
            borderWidth: 1,
          }}
        >
          Female
        </Chip>
      </View>
      <View style={{ margin: 5 }} />
      <Text variant="titleMedium">Activity Level</Text>
      <Picker
        selectedValue={bodyInfo?.activityLevel ?? ""}
        onValueChange={(activityLevel) => {
          if (bodyInfo) {
            setBodyInfo({
              ...bodyInfo,
              activityLevel: activityLevel as ActivityLevel,
            });
          }
        }}
      >
        {BodyInfoModel.activityLevels.map((activityLevel, index) => {
          return <Picker.Item key={index} label={activityLevel} value={activityLevel} />;
        })}
      </Picker>
      <View style={{ margin: 10 }} />
      <Text variant="titleLarge">Food Preferences</Text>
      <View style={{ margin: 10 }} />
      <Text variant="titleMedium">Intolerances</Text>
      <View style={{ margin: 5 }} />
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {BodyInfoModel.intolerances.map((intolerance, index) => {
          return (
            <Chip
              key={index}
              selected={bodyInfo?.intolerances.includes(intolerance)}
              showSelectedCheck={false}
              style={{
                backgroundColor: bodyInfo?.intolerances.includes(intolerance)
                  ? theme.colors.secondaryContainer
                  : "white",
                borderWidth: 1,
              }}
              onPress={() => {
                if (bodyInfo) {
                  var intolerances;
                  if (bodyInfo.intolerances.includes(intolerance))
                    intolerances = bodyInfo.intolerances.filter((i) => i !== intolerance);
                  else intolerances = bodyInfo.intolerances.concat([intolerance]);

                  setBodyInfo({
                    ...bodyInfo,
                    intolerances: intolerances,
                  });
                }
              }}
            >
              {intolerance}
            </Chip>
          );
        })}
      </View>
      <View style={{ margin: 10 }} />
      <Text variant="titleMedium">Cuisines</Text>
      <View style={{ margin: 5 }} />
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {BodyInfoModel.cuisines.map((cuisine, index) => {
          return (
            <Chip
              key={index}
              selected={bodyInfo?.cuisines.includes(cuisine)}
              showSelectedCheck={false}
              style={{
                backgroundColor: bodyInfo?.cuisines.includes(cuisine)
                  ? theme.colors.secondaryContainer
                  : "white",
                borderWidth: 1,
              }}
              onPress={() => {
                var cuisines;
                if (bodyInfo) {
                  if (bodyInfo.cuisines.includes(cuisine))
                    cuisines = bodyInfo.cuisines.filter((i) => i !== cuisine);
                  else cuisines = bodyInfo.cuisines.concat([cuisine]);

                  setBodyInfo({ ...bodyInfo, cuisines: cuisines });
                }
              }}
            >
              {cuisine}
            </Chip>
          );
        })}
      </View>
      <View style={{ margin: 10 }} />
      <Button
        mode="contained"
        style={{ alignSelf: "center" }}
        onPress={() => bodyInfo && bodyInfoModel && bodyInfoModel.update(bodyInfo)}
      >
        Set Information
      </Button>
      <View style={{ marginTop: 30 }} />
    </ScrollView>
  );
}
