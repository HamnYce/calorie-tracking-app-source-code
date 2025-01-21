import { useState } from "react";
import { View } from "react-native";
import { Text, Button, ActivityIndicator, Appbar } from "react-native-paper";
import { CameraView, useCameraPermissions } from "expo-camera/next";
import { ProductAPI } from "@/src/apis/spoonacular/productAPI";
import { router } from "expo-router";

export default function Barcode() {
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
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <Appbar.Header statusBarHeight={0} style={{ backgroundColor: "#0000" }}>
        <Appbar.BackAction onPress={() => router.back()} iconColor="black" />
        <Appbar.Content title="Barcode Scan" />
      </Appbar.Header>
      {(coolingDown && <ActivityIndicator />) || (
        <CameraView
          style={{
            width: "90%",
            aspectRatio: 1,
            alignSelf: "center",
            borderRadius: 10,
            overflow: "hidden",
          }}
          facing="back"
          onBarcodeScanned={(barCode) => {
            if (!coolingDown && parseInt(barCode.type) == 32) {
              setCoolingDown(true);
              ProductAPI.searchByUPC({ upc: barCode.data })
                .then((productModel) => {
                  setError(false);
                  router.back();
                  router.push({
                    pathname: "/food/FoodDetail",
                    params: {
                      foodId: productModel.id,
                      foodType: productModel.type,
                      display: "search",
                    },
                  });
                })
                .catch((_e) => {
                  setError(true);
                });
            }
          }}
        />
      )}
      {error && (
          <Text
            variant="bodyLarge"
            style={{ marginHorizontal: 20, alignItems: "center" }}
            numberOfLines={2}
          >
            Invalid barcode, please try again. If it still doesn't work please contact support :)
          </Text>
        )}
    </View>
  );
}
