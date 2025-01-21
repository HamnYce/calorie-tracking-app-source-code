import { useState } from "react";
import { View } from "react-native";
import { Text, Button, ActivityIndicator, Appbar } from "react-native-paper";
import { CameraView, useCameraPermissions } from "expo-camera/next";
import { ProductAPI } from "@/src/apis/spoonacular/productAPI";
import { router } from "expo-router";

export default function Classify() {
  const [permission, requestPermission] = useCameraPermissions();
  const [coolingDown, setCoolingDown] = useState(false);
  const [error, setError] = useState(false);

  if (!permission) {
    return (
      <View style={{ flex: 1 }}>
        <Text>Permissions are loading</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={{ flex: 1 }}>
        <Text style={{ textAlign: "center" }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission}>grant permission</Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, flexDirection: "column" }}>
      {(!coolingDown && (
        <>
          <CameraView style={{ flex: 1, height: "100%", width: "100%" }} facing="back">
            <Appbar.Header statusBarHeight={0} style={{ backgroundColor: "#0000" }}>
              <Appbar.BackAction onPress={() => router.back()} iconColor="white" />
            </Appbar.Header>

            <View
              style={{
                backgroundColor: "green",
                width: 100,
                height: 100,
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
          </CameraView>

          {error && (
            <Text>
              Invalid barcode, please try again. if it still doesn't work please contact support :)
            </Text>
          )}
        </>
      )) || <ActivityIndicator />}
    </View>
  );
}
