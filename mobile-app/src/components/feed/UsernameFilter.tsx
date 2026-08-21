import React from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useAppTheme } from "@/context/ThemeContext";
import { Avatar } from "@/components/Shared/Avatar";
import { Search, X, Users } from "lucide-react-native";

export interface CreatorFilterItem {
  username: string;
  name: string;
  avatar?: string;
  count: number;
}

interface UsernameFilterProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  selectedUsername: string | null;
  onSelectUsername: (username: string | null) => void;
  creators: CreatorFilterItem[];
  totalPostsCount: number;
}

export function UsernameFilter({
  searchQuery,
  onSearchChange,
  selectedUsername,
  onSelectUsername,
  creators,
  totalPostsCount,
}: UsernameFilterProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderBottomColor: colors.border,
      }}
      className="px-4 pt-3 pb-2.5 border-b mb-2"
    >
      {/* 1. Search Bar */}
      <View
        style={{
          height: 42,
          backgroundColor: colors.surface2,
          borderColor: colors.border,
        }}
        className="flex-row items-center px-3 rounded-lg border mb-2.5"
      >
        <Search size={17} color={colors.text3} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Filter newsfeed by @username..."
          placeholderTextColor={colors.text3}
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            flex: 1,
            marginLeft: 8,
            fontSize: 14.5,
            color: colors.text,
            paddingTop: 0,
            paddingBottom: 0,
            paddingVertical: 0,
            margin: 0,
            height: Platform.OS === "ios" ? 38 : "100%",
            textAlignVertical: "center",
          }}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange("")}
            activeOpacity={0.7}
            className="p-1"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={16} color={colors.text3} />
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Horizontal Quick-Select User Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 8 }}
      >
        {/* All Posts Pill */}
        <TouchableOpacity
          onPress={() => onSelectUsername(null)}
          activeOpacity={0.75}
          style={{
            height: 32,
            backgroundColor:
              selectedUsername === null
                ? colors.brand
                : colors.surface2,
            borderColor:
              selectedUsername === null ? colors.brand : colors.border,
          }}
          className="flex-row items-center px-3 rounded-full border"
        >
          <Users
            size={13}
            color={selectedUsername === null ? "#FFFFFF" : colors.text2}
          />
          <Text
            style={{
              color: selectedUsername === null ? "#FFFFFF" : colors.text,
              fontSize: 12.5,
              fontWeight: selectedUsername === null ? "700" : "500",
              marginLeft: 5,
            }}
          >
            All Posts ({totalPostsCount})
          </Text>
        </TouchableOpacity>

        {/* Creator Pills */}
        {creators.map((creator) => {
          const isSelected = selectedUsername === creator.username;
          return (
            <TouchableOpacity
              key={creator.username}
              onPress={() =>
                onSelectUsername(isSelected ? null : creator.username)
              }
              activeOpacity={0.75}
              style={{
                height: 32,
                backgroundColor: isSelected ? colors.brand : colors.surface2,
                borderColor: isSelected ? colors.brand : colors.border,
              }}
              className="flex-row items-center px-2.5 rounded-full border"
            >
              <Avatar src={creator.avatar} size={18} name={creator.name} />
              <Text
                style={{
                  color: isSelected ? "#FFFFFF" : colors.text,
                  fontSize: 12.5,
                  fontWeight: isSelected ? "700" : "500",
                  marginLeft: 5,
                }}
              >
                @{creator.username}
              </Text>
              <View
                style={{
                  backgroundColor: isSelected
                    ? "rgba(255, 255, 255, 0.25)"
                    : colors.border,
                }}
                className="ml-1.5 px-1.5 py-0.5 rounded-full"
              >
                <Text
                  style={{
                    color: isSelected ? "#FFFFFF" : colors.text3,
                    fontSize: 10,
                    fontWeight: "600",
                  }}
                >
                  {creator.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default UsernameFilter;
