import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
	try {
		// Get advisory counts by severity
		const advisories = await getCollection('advisories');
		const counts = {
			total: advisories.length,
			bySeverity: {
				critical: advisories.filter(a => a.data.severity === 'critical').length,
				high: advisories.filter(a => a.data.severity === 'high').length,
				moderate: advisories.filter(a => a.data.severity === 'moderate').length,
				low: advisories.filter(a => a.data.severity === 'low').length,
			},
			lastUpdated: new Date().toISOString()
		};

		return new Response(JSON.stringify({
			status: 'healthy',
			version: '1.0.0',
			advisories: counts
		}), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		return new Response(JSON.stringify({
			status: 'error',
			message: 'Failed to fetch advisory data'
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
}; 