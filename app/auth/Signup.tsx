import { FormTextInput } from "@/src/components/form/TextInput";
import { router } from "expo-router";

import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/src/components/form/validators";
import auth from "@react-native-firebase/auth";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView } from "react-native";
import { ScrollView } from "react-native";
import { View, StyleSheet } from "react-native";
import { Button, PaperProvider, Text, useTheme } from "react-native-paper";
import { BodyInfoModel } from "@/src/models/body_info/bodyInfoModel";
import { theme } from "@/src/constants/theme/theme";

export default function SignUp() {
  const [isFormValid, setIsFormValid] = useState(false);
  const [errors, setErrors] = useState<{
    email: string[];
    password: string[];
    confirmPassword: string[];
    username: string[];
  }>({ email: [], password: [], confirmPassword: [], username: [] });

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isAuthError, setIsAuthError] = useState(false);

  useEffect(() => {
    setIsFormValid(validateForm());
  }, [username, email, password, confirmPassword]);

  function validateForm() {
    const usernameErrors = validateUsername(username);
    const emailErrors = validateEmail(email);
    const passwordErrors = validatePassword(password);
    const confirmpasswordErrors: string[] = [];

    if (password != confirmPassword) {
      confirmpasswordErrors.push("Passwords do not match");
    }

    setErrors({
      username: usernameErrors,
      email: emailErrors,
      password: passwordErrors,
      confirmPassword: confirmpasswordErrors,
    });

    return (
      emailErrors.length == 0 &&
      passwordErrors.length == 0 &&
      confirmpasswordErrors.length == 0 &&
      usernameErrors.length == 0
    );
  }

  function handleSignup() {
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        BodyInfoModel.saveDefault();
        router.back();
        console.log(user);
      })
      .catch((error) => {
        setIsAuthError(true);
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  }

  return (
    <PaperProvider theme={theme}>
      <ScrollView
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.mainContainer,
          { backgroundColor: theme.colors.background, padding: 30 },
        ]}
      >
        <KeyboardAvoidingView style={styles.mainContainer} behavior="padding">
          <View style={{ marginBottom: 30, alignItems: "center" }}>
            <Text style={{ fontSize: 40 }}>Welcome Back</Text>
            <Text style={{ fontSize: 15 }}>Login to your account</Text>
          </View>
          {isAuthError ? (
            <Text style={{ color: theme.colors.error }}>Invalid Email or Password</Text>
          ) : null}

          <View style={{ width: "100%", alignItems: "center" }}>
            <FormTextInput
              label="username"
              value={username}
              setValue={setUsername}
              icon="account-outline"
              secureTextEntry={false}
              errors={errors.username}
            />

            <FormTextInput
              label="email"
              value={email}
              setValue={setEmail}
              icon="email-outline"
              secureTextEntry={false}
              errors={errors.email}
            />

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
          </View>

          <Button
            mode="elevated"
            disabled={!isFormValid}
            style={{ width: "100%", marginTop: 50 }}
            onPress={handleSignup}
          >
            Signup
          </Button>
        </KeyboardAvoidingView>
        <Text>
          Have an Account?
          <Link href="/auth/Login">
            <Text style={{ color: "blue" }}> Login</Text>
          </Link>
        </Text>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
});
