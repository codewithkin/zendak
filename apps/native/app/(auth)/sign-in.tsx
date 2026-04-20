import { DeliveryTruck02Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/src/hooks/use-auth";

export default function SignIn() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const login = useLogin();
	const router = useRouter();
	const queryClient = useQueryClient();

	const handleLogin = () => {
		if (!email.trim() || !password.trim()) {
			Alert.alert("Error", "Please enter your email and password.");
			return;
		}

		login.mutate(
			{ email: email.trim(), password },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
					router.replace("/(drawer)");
				},
				onError: (error) => {
					const message =
						(error as { response?: { data?: { message?: string } } }).response?.data?.message ??
						"Invalid email or password.";
					Alert.alert("Login Failed", message);
				},
			},
		);
	};

	return (
		<Container className="px-6">
			<View className="flex-1 justify-center gap-8">
				<View className="items-center gap-3">
					<View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary">
						<Icon icon={DeliveryTruck02Icon} size={30} color="#fff" />
					</View>
					<Text className="text-xs font-medium uppercase tracking-[2px] text-primary">
						Zendak
					</Text>
					<Text className="text-2xl font-bold text-foreground">Sign in to continue</Text>
					<Text className="text-center text-sm text-muted">
						Enter your credentials to access the fleet workspace.
					</Text>
				</View>

				<View className="gap-4">
					<View className="gap-1.5">
						<Text className="text-xs font-medium text-foreground">Email</Text>
						<Input
							placeholder="driver@company.com"
							value={email}
							onChangeText={setEmail}
							autoCapitalize="none"
							keyboardType="email-address"
							autoComplete="email"
						/>
					</View>

					<View className="gap-1.5">
						<Text className="text-xs font-medium text-foreground">Password</Text>
						<Input
							placeholder="Enter your password"
							value={password}
							onChangeText={setPassword}
							secureTextEntry
							autoComplete="password"
						/>
					</View>

					<Button
						size="lg"
						fullWidth
						onPress={handleLogin}
						disabled={login.isPending}
					>
						{login.isPending ? "Signing in..." : "Sign in"}
					</Button>
				</View>
			</View>
		</Container>
	);
}
