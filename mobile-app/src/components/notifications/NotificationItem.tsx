import { Text } from "react-native";
import type { Notification } from "@/types/notification";
export function NotificationItem({ notification }: { notification: Notification }) { return <Text className="py-3">New {notification.type}</Text>; }
