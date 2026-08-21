import { TextInput } from "react-native";
export function UsernameFilter({ value, onChangeText }: { value: string; onChangeText: (value: string) => void }) { return <TextInput value={value} onChangeText={onChangeText} placeholder="Filter username" className="rounded-xl border border-slate-300 p-3" />; }
