export const SWR_KEYS = {
	USERS: 'users',
	USERS_WITH_PARAMS: (p: unknown) => ['users', p],
	TICKETS: 'tickets',
	TICKETS_WITH_PARAMS: (p: unknown) => ['tickets', p],
} as const;


