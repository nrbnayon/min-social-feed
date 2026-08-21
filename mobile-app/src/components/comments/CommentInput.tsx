import { TextInput } from "react-native";
export function CommentInput({ value, onChangeText }: { value: string; onChangeText: (value: string) => void }) { return <TextInput value={value} onChangeText={onChangeText} placeholder="Write a comment..." className="rounded-xl border border-slate-300 p-3" />; }
