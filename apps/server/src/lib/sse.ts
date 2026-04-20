import { streamSSE } from "hono/streaming";

type SSEWriter = {
	writeSSE: (data: { event: string; data: string; id?: string }) => Promise<void>;
};

class ConnectionManager {
	private connections = new Map<string, Set<SSEWriter>>();

	addConnection(userId: string, writer: SSEWriter) {
		if (!this.connections.has(userId)) {
			this.connections.set(userId, new Set());
		}
		this.connections.get(userId)!.add(writer);
	}

	removeConnection(userId: string, writer: SSEWriter) {
		const set = this.connections.get(userId);
		if (set) {
			set.delete(writer);
			if (set.size === 0) this.connections.delete(userId);
		}
	}

	async sendToUser(userId: string, event: string, data: unknown) {
		const set = this.connections.get(userId);
		if (!set) return;
		const payload = JSON.stringify(data);
		for (const writer of set) {
			writer.writeSSE({ event, data: payload }).catch(() => {
				this.removeConnection(userId, writer);
			});
		}
	}

	async sendToUsers(userIds: string[], event: string, data: unknown) {
		await Promise.allSettled(
			userIds.map((id) => this.sendToUser(id, event, data)),
		);
	}
}

export const connectionManager = new ConnectionManager();
