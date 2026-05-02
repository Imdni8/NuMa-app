import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text, useThemeColor, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { setTester } from "@/lib/store";

export default function NamePromptScreen() {
    const colorScheme = useColorScheme() ?? "light";
    const textColor = Colors[colorScheme].text;
    const insets = useSafeAreaInsets();

    const inputBg = useThemeColor(
        { light: "#F5F2FA", dark: "#2A2535" },
        "background",
    );
    const inputBorder = useThemeColor(
        { light: "#D9D2E5", dark: "#3D3550" },
        "background",
    );
    const buttonBg = useThemeColor(
        { light: "#1A1A1A", dark: "#FFFFFF" },
        "background",
    );
    const buttonTextColor = useThemeColor(
        { light: "#FFFFFF", dark: "#1A1A1A" },
        "text",
    );

    const [name, setName] = useState("");
    const canContinue = name.trim().length > 0;

    const onContinue = () => {
        if (!canContinue) return;
        setTester(name);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={styles.content}>
                    <Text style={styles.title}>Welcome to NuMa</Text>
                    <Text style={styles.body}>
                        Please enter your name to continue.
                    </Text>

                    <Text style={styles.label}>Your name</Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g. Alice"
                        placeholderTextColor="#999"
                        style={[
                            styles.input,
                            {
                                color: textColor,
                                backgroundColor: inputBg,
                                borderColor: inputBorder,
                            },
                        ]}
                        autoFocus
                        returnKeyType="go"
                        onSubmitEditing={onContinue}
                        autoCapitalize="words"
                        autoCorrect={false}
                    />

                    <Pressable
                        onPress={onContinue}
                        disabled={!canContinue}
                        style={[
                            styles.button,
                            {
                                backgroundColor: buttonBg,
                                opacity: canContinue ? 1 : 0.4,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.buttonText,
                                { color: buttonTextColor },
                            ]}
                        >
                            Continue
                        </Text>
                    </Pressable>

                    <Text style={styles.fineprint}>
                        Your data will be saved on this device only. Please
                        continue using the same device during the this testing
                        period.
                    </Text>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 12,
    },
    body: {
        fontSize: 16,
        lineHeight: 22,
        opacity: 0.8,
        marginBottom: 32,
    },
    label: {
        fontSize: 13,
        fontWeight: "500",
        opacity: 0.8,
        marginBottom: 6,
    },
    input: {
        fontSize: 17,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 24,
    },
    button: {
        height: 50,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    fineprint: {
        fontSize: 12,
        opacity: 0.5,
        textAlign: "center",
        marginTop: 16,
        lineHeight: 17,
    },
});
