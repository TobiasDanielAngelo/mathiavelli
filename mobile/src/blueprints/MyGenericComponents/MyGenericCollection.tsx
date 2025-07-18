import { observer } from "mobx-react-lite";
import { sortAndFilterByIds } from "../../constants/helpers";
import { PaginatedDetails } from "../../constants/interfaces";
import { MyIcon } from "../MyIcon";
import { useVisible } from "../../constants/hooks";
import { useEffect } from "react";
import { winWidth } from "../../constants/constants";
import {
  ScrollView,
  View,
  StyleSheet,
  Platform,
  Text,
  FlatList,
} from "react-native";

export const MyGenericCollection = observer(
  <T extends { id: number | string /* & object */ }>(props: {
    PageBar?: React.FC;
    pageDetails?: PaginatedDetails | undefined; // set page details to undefined if you don't want any filters
    items: T[];
    CardComponent: React.ComponentType<{
      item: T;
    }>;
    title: string;
  }) => {
    const { PageBar, items, pageDetails, CardComponent, title } = props;
    const { isVisible1, setVisible1 } = useVisible();

    useEffect(() => {
      setVisible1(true);
    }, []);

    return (
      <View
        style={[
          styles.container,
          // isVisible1 && { minHeight: "85%", maxHeight: "85%" },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.headerText]}>{title.toUpperCase()}</Text>
          <MyIcon
            icon={isVisible1 ? "eye" : "eye-slash"}
            onPress={() => setVisible1((t) => !t)}
          />
        </View>

        {isVisible1 && (
          <>
            {PageBar ? <PageBar /> : <></>}
            <FlatList
              data={sortAndFilterByIds(
                items,
                pageDetails?.ids ?? items.map((s) => s.id),
                (s) => s.id
              )}
              renderItem={({ item: s }) => (
                <CardComponent item={s} key={s.id} />
              )}
              keyExtractor={(item) => `${item.id}`}
              style={styles.list}
            />
          </>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    borderRadius: 12,
  },

  content: {
    flexGrow: 1,
  },
  list: {
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "teal",
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#ccfbf1", // bg-teal-100
    top: 0,
    zIndex: 0,
    width: "100%",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 25,
    textAlign: "center",
    flex: 1,
    color: "#000",
  },
});
