import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MyIcon } from "./MyIcon"; // Assuming you have this component

export const MyImageUploader = (props: {
  value?: string;
  onChangeValue?: (t: string) => void;
}) => {
  const { value, onChangeValue } = props;
  const [image, setImage] = useState<string | null>(value || null);

  const handleImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      //   onChangeValue?.(result.uri);
      //   setImage(result.uri);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.uploadButton} onPress={handleImagePicker}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
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
  text: {
    marginTop: 5,
    fontSize: 12,
    color: "#999",
  },
});
