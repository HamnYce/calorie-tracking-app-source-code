import { FormTextInput } from "@/src/components/form/TextInput";
import { validatePassword, validateUsername } from "@/src/components/form/validators";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import auth from "@react-native-firebase/auth";

export default function Account() {

const theme = useTheme()
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    username: string[];
    password: string[];
    confirmPassword: string[];
  }>({ username: [], password: [], confirmPassword: [] });

  useEffect(() => {
    const usernameErrors = validateUsername(username);

    setErrors({ ...errors, username: usernameErrors });
  }, [username]);

  useEffect(() => {
    if (password.length < 1) {
      setErrors({ ...errors, password: [], confirmPassword: [] });
      return;
    }
    const passwordErrors = validatePassword(password);
    const confirmPasswordErrors = password == confirmPassword ? [] : ["Passwords do not match"];

    setErrors({
      ...errors,
      password: passwordErrors,
      confirmPassword: confirmPasswordErrors,
    });
  }, [password, confirmPassword]);
  return (
    <View style={{ flex: 1, padding: 10, backgroundColor:theme.colors.background  }}>
      <View>
        <Text style={{ fontWeight: "bold" }}>Change Username</Text>

        <FormTextInput
          label="username"
          value={username}
          setValue={setUsername}
          icon="account-outline"
          secureTextEntry={false}
          errors={errors.username}
        />
        <Button
          style={{ marginTop: 10, alignSelf: "flex-end" }}
          mode="contained"
          disabled={errors.username.length != 0 || username.length < 1}
          onPress={() => {
            auth().currentUser!.updateProfile({ displayName: username });
          }}
        >
          Update Username
        </Button>
      </View>

      <View
        style={{
          borderBottomColor: "#777",
          borderBottomWidth: 1,
          margin: 20,
        }}
      />
      <View>
        <Text style={{ fontWeight: "bold" }}>Change Password</Text>
        <FormTextInput
          label="password"
          value={password}
          setValue={setPassword}
          icon="lock-outline"
          secureTextEntry={true}
          errors={errors.password}
        />

        <FormTextInput
          label="confirmPassword"
          value={confirmPassword}
          setValue={setConfirmPassword}
          icon="lock-outline"
          secureTextEntry={true}
          errors={errors.confirmPassword}
        />

        <Button
          style={{ marginTop: 10, alignSelf: "flex-end" }}
          mode="contained"
          disabled={
            errors.password.length != 0 ||
            errors.confirmPassword.length != 0 ||
            password.length < 1 ||
            confirmPassword.length < 1
          }
          onPress={() => {
            auth().currentUser!.updatePassword(password);
          }}
        >
          Update Password
        </Button>
      </View>
    </View>
  );
}
