import { ThemedText } from "@/components/themed-text";
import { Link } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function ProfileScreen() {
    return <SafeAreaView style={styles.container}>
        <ThemedText>Profile</ThemedText>
        <Link href="/(tabs)">
            <ThemedText type="subtitle">Home</ThemedText>
        </Link>
    </SafeAreaView>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});