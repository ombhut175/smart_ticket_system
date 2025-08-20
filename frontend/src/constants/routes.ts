export const ROUTES = {
	ROOT: '/',
	LOGIN: '/login',
	SIGNUP: '/signup',
	FORGOT_PASSWORD: '/forgot-password',
	DASHBOARD: '/dashboard',
	PROFILE: '/profile',
	LOGOUT: '/logout',
	TICKETS: {
		ROOT: '/tickets',
		NEW: '/tickets/new',
		DETAIL: (id: string | number) => `/tickets/${id}`,
		EDIT: (id: string | number) => `/tickets/${id}/edit`,
	},
	ADMIN: {
		USERS: {
			ROOT: '/admin/users',
			NEW: '/admin/users/new',
			DETAIL: (id: string | number) => `/admin/users/${id}`,
			EDIT: (id: string | number) => `/admin/users/${id}/edit`,
		},
		TICKETS: {
			ROOT: '/admin/tickets',
			DETAIL: (id: string | number) => `/admin/tickets/${id}`,
			EDIT: (id: string | number) => `/admin/tickets/${id}/edit`,
		},
		MODERATORS: {
			NEW: '/admin/moderators/new',
		},
	},
	USERS: '/users',
} as const;


