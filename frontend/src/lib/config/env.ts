export const ENV = {
	apiBaseUrl: (process.env.NEXT_PUBLIC_API_URL || '').trim(),
	nodeEnv: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
} as const;

export function joinUrl(...parts: string[]): string {
	return parts
		.filter((p) => typeof p === 'string' && p.length > 0)
		.map((part, index) => {
			if (index === 0) return part.replace(/\/+$/g, '');
			return part.replace(/^\/+|\/+$/g, '');
		})
		.join('/');
}

export function getApiBaseURL(prefix: string): string {
	const normalizedPrefix = prefix.replace(/^\/+|\/+$/g, '');
	if (!ENV.apiBaseUrl) {
		return `/${normalizedPrefix}`;
	}
	return joinUrl(ENV.apiBaseUrl, normalizedPrefix);
}


