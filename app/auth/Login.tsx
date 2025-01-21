import { RecipeAPI } from "@/src/apis/spoonacular/recipeAPI";
import { FormTextInput } from "@/src/components/form/TextInput";
import { validateEmail, validatePassword } from "@/src/components/form/validators";
import auth from "@react-native-firebase/auth";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";

export default function Login() {
  const theme = useTheme();
  const [email, setEmail] = useState("hamadboaa@gmail.com");
  const [password, setPassword] = useState("kkkkkk@1");
  const [isFormValid, setIsFormValid] = useState(false);
  const [errors, setErrors] = useState<{ email: string[]; password: string[] }>({
    email: [],
    password: [],
  });
  const [isAuthError, setIsAuthError] = useState(false);

  useEffect(() => {
    setIsFormValid(validateForm());
  }, [email, password]);

  function validateForm() {
    const emailErrors = validateEmail(email);
    const passwordErrors = validatePassword(password);

    setErrors({ ...errors, email: emailErrors, password: passwordErrors });

    return emailErrors.length == 0 && passwordErrors.length == 0;
  }

  function handleSignin() {
    auth()
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('signed in with credential: ', userCredential)
        setIsAuthError(false);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('error logging in', errorCode, errorMessage);
        setIsAuthError(true);
      });
  }

  return (
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
        </View>

        <Button
          mode="elevated"
          disabled={!isFormValid}
          style={{ width: "100%", marginTop: 50 }}
          onPress={() => {
            handleSignin();
            console.log(email);
          }}
        >
          Login
        </Button>
      </KeyboardAvoidingView>
      <Text>
        Don't Have an Account?
        <Link href="/auth/Signup">
          <Text style={{ color: "blue" }}> Signup</Text>
        </Link>
      </Text>
    </ScrollView>
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
