import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { MyIcon } from "./MyIcon"; // Assuming you have this component

const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;

const extensionToIcon: Record<string, string> = {
  doc: "file-word",
  docx: "file-word",
  xls: "file-excel",
  xlsx: "file-excel",
  csv: "file-csv",
  pdf: "file-pdf",
  mp4: "file-video",
  mov: "file-video",
  avi: "file-video",
  mp3: "file-audio",
  wav: "file-audio",
  js: "file-code",
  ts: "file-code",
  html: "file-code",
  css: "file-code",
  py: "file-code",
  java: "file-code",
  cpp: "file-code",
};

const getIcon = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) return "file";

  if (imageExtensions.test(filename)) return "file-image";
  return extensionToIcon[ext] || "file";
};

export const MyFileUploader = (props: {
  value?: string | ImagePicker.ImagePickerAsset;
  onChangeValue?: (t: string | ImagePicker.ImagePickerAsset) => void;
}) => {
  const { value, onChangeValue } = props;

  const [image, setImage] = useState<
    string | ImagePicker.ImagePickerAsset | null
  >(typeof value === "string" && imageExtensions.test(value) ? value : null);
  const [nonImageFile, setNonImageFile] = useState<string | null>(
    typeof value === "string" && !imageExtensions.test(value) ? value : null
  );

  const handleImagePicker = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      quality: 1,
    });

    if (!result.canceled && result.assets.length) {
      setImage(result.assets[0]);
      onChangeValue?.(result.assets[0]);
    }
  };

  const handleFilePicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync();

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setNonImageFile(file.uri); // or file.uri if you just need the URI
      }
    } catch (err) {
      console.error("Document pick failed:", err);
    }
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.uploadButton}>
        {image ? (
          <Image
            source={{ uri: typeof image === "string" ? image : image.uri }}
            style={styles.image}
          />
        ) : nonImageFile ? (
          <View style={styles.filePlaceholder}>
            <MyIcon
              icon={getIcon(nonImageFile)}
              onPress={() =>
                image
                  ? null
                  : nonImageFile
                  ? handleImagePicker()
                  : handleImagePicker()
              }
            />
            <Text style={styles.text}>
              <Text style={{ fontWeight: "bold" }}>Uploaded File</Text>
              {"\n"}
              <Text
                style={{ color: "#0645ad" }}
                onPress={() => Linking.openURL(nonImageFile)}
              >
                View File
              </Text>
            </Text>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <MyIcon icon={getIcon(image ?? "")} />
            <Text style={styles.text}>Click to upload</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: 10,
  },
  uploadButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 2,
    borderColor: "#64b5f6",
    backgroundColor: "#fafafa",
  },
  image: {
    width: 128,
    height: 128,
    borderRadius: 64,
    resizeMode: "cover",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 5,
    paddingBottom: 6,
  },
  filePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 5,
    paddingBottom: 6,
    paddingHorizontal: 10,
  },
  text: {
    marginTop: 5,
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});
