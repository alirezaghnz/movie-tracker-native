import { Linking, StyleSheet, Text, View } from "react-native";

const COLORS = {
  text: "#fff",
  text2: "#ccc",
  text3: "#888",
  red: "#e50914",
  border: "#333",
  surface: "#1a1a1a",
};

function inlineFormat(text, keyPrefix = "") {
  const parts = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|https?:\/\/[^\s<>"')]+)/g;
  let last = 0,
    m,
    k = 0;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(
        <Text key={`${keyPrefix}-${k++}`} style={styles.paragraph}>
          {text.slice(last, m.index)}
        </Text>,
      );
    }
    const raw = m[0];

    if (raw.startsWith("**")) {
      //Bold
      parts.push(
        <Text key={`${keyPrefix}-${k++}`} style={styles.bold}>
          {raw.slice(2, -2)}
        </Text>,
      );
    } else if (raw.startsWith("*")) {
      //Italic
      parts.push(
        <Text key={`${keyPrefix}-${k++}`} style={styles.italic}>
          {raw.slice(1, -1)}
        </Text>,
      );
    } else if (raw.startsWith("`")) {
      // Code
      parts.push(
        <Text key={`${keyPrefix}-${k++}`} style={styles.code}>
          {raw.slice(1, -1)}
        </Text>,
      );
    } else if (raw.startsWith("http")) {
      let label = raw;
      try {
        const u = new URL(raw);
        const prMatch = u.pathname.match(/\/(pull|issues?)\/(\d+)$/);
        if (prMatch) {
          label = `#${prMatch[2]}`;
        } else {
          label = u.hostname.replace(/^www\./, "") + u.pathname;
        }
      } catch {}
      parts.push(
        <Text
          key={`${keyPrefix}-${k++}`}
          style={styles.link}
          onPress={() => Linking.openURL(raw)}
        >
          {label}
        </Text>,
      );
    }
    last = m.index + raw.length;
  }

  if (last < text.length) {
    parts.push(
      <Text key={`${keyPrefix}-${k++}`} style={styles.paragraph}>
        {text.slice(last)}
      </Text>,
    );
  }
  return parts.length ? parts : <Text style={styles.paragraph}>{text}</Text>;
}

export default function ChangelogRender({ text }) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // ## heading
    if (line.startsWith("## ")) {
      elements.push(
        <Text key={key++} style={styles.h2}>
          {line.slice(3)}
        </Text>,
      );
      continue;
    }

    // ### heading
    if (line.startsWith("### ")) {
      elements.push(
        <Text key={key++} style={styles.h3}>
          {line.slice(4)}
        </Text>,
      );
      continue;
    }

    // bullet - or *
    if (/^[-*]/.test(line)) {
      elements.push(
        <View key={key++} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text styles={styles.bulletText}>
            {inlineFormat(line.slice(2), `b${key}`)}
          </Text>
        </View>,
      );
      continue;
    }

    // blank line
    if (line.trim() === "") {
      elements.push(<View key={key++} style={{ height: 6 }} />);
      continue;
    }

    // normal paragraph
    elements.push(
      <Text key={key++} style={styles.paragraph}>
        {inlineFormat(line, `p${key}`)}
      </Text>,
    );
  }

  return <View>{elements}</View>;
}
const styles = StyleSheet.create({
  h2: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 14,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 4,
  },
  h3: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  bulletDot: {
    color: COLORS.red,
  },
  bulletText: {
    color: COLORS.text2,
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  paragraph: {
    color: COLORS.text2,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  bold: {
    color: COLORS.text,
    fontWeight: "700",
  },
  italic: {
    color: COLORS.text2,
    fontStyle: "italic",
  },
  code: {
    fontSize: 11,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    fontFamily: "monospace",
    paddingHorizontal: 4,
  },
  link: {
    color: COLORS.red,
    textDecorationLine: "underline",
  },
});
