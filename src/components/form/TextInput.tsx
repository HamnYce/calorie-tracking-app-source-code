import { useState } from "react";
import { View } from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";

export function FormTextInput({
  value,
  setValue,
  label,
  icon,
  secureTextEntry = false,
  numeric,
  errors,
}: {
  value: string | undefined;
  setValue: (text: string) => void;
  label: string;
  icon: "account-outline" | "email-outline" | "lock-outline";
  secureTextEntry: boolean;
  numeric?: boolean;
  errors: string[];
}) {
  const theme = useTheme();
  const [hideText, setHideText] = useState(true);
  return (
    <>
      <TextInput
        keyboardType={numeric ? "number-pad" : undefined}
        label={label}
        value={value}
        secureTextEntry={hideText && secureTextEntry}
        onChangeText={(text) => setValue(text)}
        style={{ width: "100%", marginTop: 10 }}
        left={<TextInput.Icon icon={icon} />}
        right={
          secureTextEntry ? (
            <TextInput.Icon
              icon={hideText ? "eye-off-outline" : "eye-outline"}
              onPress={() => setHideText(!hideText)}
            />
          ) : null
        }
      />

      <View style={{ width: "100%" }}>
        {errors.map((error, index) => (
          <Text key={index} style={{ color: theme.colors.error }}>
            - {error}
          </Text>
        ))}
      </View>
    </>
  );
}
