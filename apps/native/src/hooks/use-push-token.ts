import { useEffect, useRef } from "react";
import { registerForPushNotifications, registerPushTokenWithServer } from "../lib/notifications";

export function usePushToken(enabled: boolean) {
	const registered = useRef(false);

	useEffect(() => {
		if (!enabled || registered.current) return;

		registerForPushNotifications()
			.then((token) => {
				if (token) {
					registered.current = true;
					registerPushTokenWithServer(token).catch(() => {});
				}
			})
			.catch(() => {});
	}, [enabled]);
}
