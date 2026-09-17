import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

const MARK = require("../../assets/images/finora-mark.png");
const WORDMARK = require("../../assets/images/finora-wordmark.png");

/** The "F" mark alone, e.g. for a compact header. */
export function LogoMark({ size = 40 }: { size?: number }) {
  return <Image source={MARK} style={{ width: size, height: size }} contentFit="contain" />;
}

/** Mark + wordmark, used on auth screens. */
export function Logo({ height = 40 }: { height?: number }) {
  return (
    <View style={styles.row}>
      <Image source={MARK} style={{ width: height, height }} contentFit="contain" />
      <Image
        source={WORDMARK}
        style={{ height: height * 0.6, width: height * 0.6 * (2172 / 724) }}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
