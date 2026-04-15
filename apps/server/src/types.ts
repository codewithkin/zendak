export type Role = "ADMIN" | "ACCOUNTANT" | "OPERATIONS" | "DRIVER";

export interface AuthUser {
	id: string;
	email: string;
	role: Role;
}

export type AuthEnv = {
	Variables: {
		user: AuthUser;
	};
};
