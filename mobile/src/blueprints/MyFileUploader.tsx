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

export const MyFileUploader = (props: {
  value?: string;
  onChangeValue?: (t: string) => void;
}) => {
  const { value, onChangeValue } = props;

  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;

  const [image, setImage] = useState<string | null>(
    value && imageExtensions.test(value) ? value : null
  );
  const [nonImageFile, setNonImageFile] = useState<string | null>(
    value && !imageExtensions.test(value) ? value : null
  );

  const handleImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      //   setImage(result);
      setNonImageFile(null);
      //   onChangeValue?.(result.uri);
    }
  };

  const handleFilePicker = async () => {
    let result = await DocumentPicker.getDocumentAsync({ type: "*/*" });

    if (!result.canceled) {
      //   setNonImageFile(result.uri);
      setImage(null);
      //   onChangeValue?.(result.uri);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() =>
          image ? null : nonImageFile ? handleFilePicker() : handleImagePicker()
        }
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : nonImageFile ? (
          <View style={styles.filePlaceholder}>
            <MyIcon icon="FilePresent" />
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
            <MyIcon icon="CloudUpload" />
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
